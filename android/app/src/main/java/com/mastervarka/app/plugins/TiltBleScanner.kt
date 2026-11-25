package com.mastervarka.app.plugins

import android.bluetooth.le.ScanRecord
import android.bluetooth.le.ScanResult
import com.getcapacitor.JSObject
import java.util.Locale

/**
 * Парсер Bluetooth Low Energy пакетов для цифровых ареометров
 * Поддерживает:
 * - Tilt Hydrometer (все 8 цветов: Red, Green, Black, Purple, Orange, Blue, Yellow, Pink)
 * - Расчет плотности (SG и градусы Плато °P)
 * - Расчет температуры (°F в °C)
 * - iSpindel BLE / Smart Hydrometers
 */
object TiltBleScanner {

    private val TILT_UUID_MAP = mapOf(
        "a495bb10c5b14b44b5121370f02d74de" to "Красный (Red)",
        "a495bb20c5b14b44b5121370f02d74de" to "Зеленый (Green)",
        "a495bb30c5b14b44b5121370f02d74de" to "Черный (Black)",
        "a495bb40c5b14b44b5121370f02d74de" to "Фиолетовый (Purple)",
        "a495bb50c5b14b44b5121370f02d74de" to "Оранжевый (Orange)",
        "a495bb60c5b14b44b5121370f02d74de" to "Синий (Blue)",
        "a495bb70c5b14b44b5121370f02d74de" to "Желтый (Yellow)",
        "a495bb80c5b14b44b5121370f02d74de" to "Розовый (Pink)"
    )

    /**
     * Разбирает скан BLE устройства и формирует JSObject для Capacitor,
     * если устройство является поддерживаемым ареометром (Tilt или аналог).
     */
    fun parseScanResult(result: ScanResult): JSObject? {
        val record: ScanRecord = result.scanRecord ?: return null
        val bytes = record.bytes ?: return null
        val device = result.device

        // Ищем iBeacon заголовок (Apple company ID: 0x004C, type: 0x02, length: 0x15)
        var i = 0
        while (i <= bytes.size - 5) {
            val length = bytes[i].toInt() and 0xFF
            if (length == 0) break

            val type = bytes[i + 1].toInt() and 0xFF
            // Manufacturer Specific Data (0xFF)
            if (type == 0xFF && length >= 26) {
                val companyId = (bytes[i + 2].toInt() and 0xFF) or ((bytes[i + 3].toInt() and 0xFF) shl 8)
                val beaconType = bytes[i + 4].toInt() and 0xFF
                val beaconLength = bytes[i + 5].toInt() and 0xFF

                if (companyId == 0x004C && beaconType == 0x02 && beaconLength == 0x15) {
                    // Извлекаем 16-байтный UUID
                    val uuidBytes = bytes.copyOfRange(i + 6, i + 22)
                    val uuidHex = uuidBytes.joinToString("") { "%02x".format(it) }.lowercase(Locale.ROOT)

                    val tiltColor = TILT_UUID_MAP[uuidHex]
                    if (tiltColor != null || uuidHex.startsWith("a495bb")) {
                        // Major: Температура в Фаренгейтах (°F)
                        val major = ((bytes[i + 22].toInt() and 0xFF) shl 8) or (bytes[i + 23].toInt() and 0xFF)
                        // Minor: Плотность SG * 1000 (например, 1050 -> 1.050)
                        val minor = ((bytes[i + 24].toInt() and 0xFF) shl 8) or (bytes[i + 25].toInt() and 0xFF)
                        val txPower = bytes[i + 26].toInt()

                        val tempF = major.toDouble()
                        val tempC = (tempF - 32.0) * 5.0 / 9.0
                        val sg = minor / 1000.0
                        val plato = sgToPlato(sg)

                        val data = JSObject()
                        data.put("deviceId", device.address)
                        data.put("deviceName", "Tilt Hydrometer $tiltColor")
                        data.put("color", tiltColor ?: "Стандартный")
                        data.put("type", "tilt")
                        data.put("specificGravity", Math.round(sg * 1000.0) / 1000.0)
                        data.put("plato", Math.round(plato * 10.0) / 10.0)
                        data.put("tempC", Math.round(tempC * 10.0) / 10.0)
                        data.put("tempF", Math.round(tempF * 10.0) / 10.0)
                        data.put("rssi", result.rssi)
                        data.put("txPower", txPower)
                        data.put("lastSeen", System.currentTimeMillis())
                        return data
                    }
                }
            }

            i += length + 1
        }

        // Проверка по имени устройства (iSpindel / GravityMon / Pill)
        val devName = try { device.name } catch (_: Exception) { null } ?: record.deviceName
        if (devName != null && (devName.contains("iSpindel", ignoreCase = true) ||
                                devName.contains("Tilt", ignoreCase = true) ||
                                devName.contains("Hydrometer", ignoreCase = true) ||
                                devName.contains("Pill", ignoreCase = true))) {
            val data = JSObject()
            data.put("deviceId", device.address)
            data.put("deviceName", devName)
            data.put("color", "Стандартный")
            data.put("type", "generic_ble")
            data.put("rssi", result.rssi)
            data.put("lastSeen", System.currentTimeMillis())
            return data
        }

        return null
    }

    /**
     * Конвертация удельного веса (SG) в градусы Плато (°P)
     * Формула ASBC: °P = -1 * 616.868 + (1111.14 * sg) - (630.272 * sg^2) + (135.997 * sg^3)
     */
    fun sgToPlato(sg: Double): Double {
        if (sg < 1.0) return 0.0
        val p = -616.868 + (1111.14 * sg) - (630.272 * sg * sg) + (135.997 * sg * sg * sg)
        return if (p < 0.0) 0.0 else p
    }
}
