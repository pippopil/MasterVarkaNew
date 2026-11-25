package com.mastervarka.app.plugins

import android.annotation.SuppressLint
import android.app.AlarmManager
import android.app.PendingIntent
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.BluetoothLeScanner
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.provider.Settings
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "MasterVarkaNative")
class MasterVarkaNativePlugin : Plugin() {

    private var bleScanner: BluetoothLeScanner? = null
    private var scanCallback: ScanCallback? = null
    private var isScanningBle = false

    @PluginMethod
    fun getHardwareStatus(call: PluginCall) {
        val context = context ?: return call.reject("No Android context")
        val powerManager = context.getSystemService(Context.POWER_SERVICE) as? PowerManager
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
        val btManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        val btAdapter = btManager?.adapter

        val hasBle = context.packageManager.hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)
        val isBleEnabled = btAdapter?.isEnabled == true

        val canExactAlarm = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            alarmManager?.canScheduleExactAlarms() ?: true
        } else {
            true
        }

        val isIgnoringBatteryOptimizations = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            powerManager?.isIgnoringBatteryOptimizations(context.packageName) ?: false
        } else {
            true
        }

        val res = JSObject()
        res.put("isNative", true)
        res.put("platform", "android")
        res.put("hasBle", hasBle)
        res.put("isBleEnabled", isBleEnabled)
        res.put("canExactAlarm", canExactAlarm)
        res.put("isIgnoringBatteryOptimizations", isIgnoringBatteryOptimizations)
        res.put("androidVersion", Build.VERSION.RELEASE)
        res.put("sdkInt", Build.VERSION.SDK_INT)
        call.resolve(res)
    }

    @PluginMethod
    fun scheduleExactAlarm(call: PluginCall) {
        val context = context ?: return call.reject("No Android context")
        val alarmId = call.getInt("alarmId") ?: return call.reject("Missing alarmId")
        val title = call.getString("title") ?: "⏰ Таймер варки"
        val body = call.getString("body") ?: "Этап варки завершен"
        val triggerTimestampMs = call.getDouble("triggerTimestampMs")?.toLong()
            ?: return call.reject("Missing triggerTimestampMs")

        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
            ?: return call.reject("AlarmManager unavailable")

        val intent = Intent(context, BrewAlarmReceiver::class.java).apply {
            action = "com.mastervarka.app.ACTION_BREW_ALARM"
            putExtra("alarmId", alarmId)
            putExtra("title", title)
            putExtra("body", body)
        }

        val flags = PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
        val pendingIntent = PendingIntent.getBroadcast(context, alarmId, intent, flags)

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerTimestampMs,
                    pendingIntent
                )
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    triggerTimestampMs,
                    pendingIntent
                )
            }

            val res = JSObject()
            res.put("success", true)
            res.put("alarmId", alarmId)
            res.put("scheduledAt", triggerTimestampMs)
            call.resolve(res)
        } catch (e: Exception) {
            call.reject("Could not schedule exact alarm: ${e.message}", e)
        }
    }

    @PluginMethod
    fun cancelAlarm(call: PluginCall) {
        val context = context ?: return call.reject("No Android context")
        val alarmId = call.getInt("alarmId") ?: return call.reject("Missing alarmId")

        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
            ?: return call.reject("AlarmManager unavailable")

        val intent = Intent(context, BrewAlarmReceiver::class.java).apply {
            action = "com.mastervarka.app.ACTION_BREW_ALARM"
        }
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
        val pendingIntent = PendingIntent.getBroadcast(context, alarmId, intent, flags)

        try {
            alarmManager.cancel(pendingIntent)
            pendingIntent.cancel()
            val res = JSObject()
            res.put("success", true)
            res.put("alarmId", alarmId)
            call.resolve(res)
        } catch (e: Exception) {
            call.reject("Could not cancel alarm: ${e.message}", e)
        }
    }

    @SuppressLint("MissingPermission")
    @PluginMethod
    fun startBleHydrometerScan(call: PluginCall) {
        val context = context ?: return call.reject("No Android context")
        val btManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        val btAdapter = btManager?.adapter

        if (btAdapter == null || !btAdapter.isEnabled) {
            return call.reject("Bluetooth отключен или недоступен")
        }

        bleScanner = btAdapter.bluetoothLeScanner
        if (bleScanner == null) {
            return call.reject("BLE сканер недоступен на данном устройстве")
        }

        if (isScanningBle) {
            val res = JSObject()
            res.put("scanning", true)
            res.put("message", "Сканирование ареометров уже активно")
            return call.resolve(res)
        }

        scanCallback = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult?) {
                if (result == null) return
                val parsed = TiltBleScanner.parseScanResult(result)
                if (parsed != null) {
                    notifyListeners("bleHydrometerData", parsed)
                }
            }

            override fun onScanFailed(errorCode: Int) {
                val err = JSObject()
                err.put("errorCode", errorCode)
                notifyListeners("bleScanError", err)
            }
        }

        val settings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            .setReportDelay(0)
            .build()

        try {
            bleScanner?.startScan(null, settings, scanCallback)
            isScanningBle = true

            val res = JSObject()
            res.put("success", true)
            res.put("scanning", true)
            res.put("message", "Поиск беспроводных ареометров (Tilt / iSpindel) запущен")
            call.resolve(res)
        } catch (e: Exception) {
            call.reject("Ошибка запуска BLE сканирования: ${e.message}", e)
        }
    }

    @SuppressLint("MissingPermission")
    @PluginMethod
    fun stopBleHydrometerScan(call: PluginCall) {
        try {
            if (isScanningBle && bleScanner != null && scanCallback != null) {
                bleScanner?.stopScan(scanCallback)
            }
        } catch (_: Exception) {}
        isScanningBle = false
        scanCallback = null

        val res = JSObject()
        res.put("success", true)
        res.put("scanning", false)
        call.resolve(res)
    }

    @PluginMethod
    fun requestIgnoreBatteryOptimizations(call: PluginCall) {
        val context = context ?: return call.reject("No Android context")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                    data = Uri.parse("package:${context.packageName}")
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(intent)
                val res = JSObject()
                res.put("success", true)
                res.put("prompted", true)
                call.resolve(res)
            } catch (e: Exception) {
                // Fallback к общему меню батареи
                try {
                    val fallbackIntent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    context.startActivity(fallbackIntent)
                    val res = JSObject()
                    res.put("success", true)
                    res.put("prompted", true)
                    call.resolve(res)
                } catch (ex: Exception) {
                    call.reject("Не удалось открыть настройки батареи: ${ex.message}")
                }
            }
        } else {
            val res = JSObject()
            res.put("success", true)
            res.put("prompted", false)
            call.resolve(res)
        }
    }

    @PluginMethod
    fun vibrateHaptic(call: PluginCall) {
        val context = context ?: return call.reject("No Android context")
        val durationMs = call.getInt("durationMs") ?: 100

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vibratorManager?.defaultVibrator?.vibrate(
                    VibrationEffect.createOneShot(durationMs.toLong(), VibrationEffect.DEFAULT_AMPLITUDE)
                )
            } else {
                @Suppress("DEPRECATION")
                val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator?.vibrate(
                        VibrationEffect.createOneShot(durationMs.toLong(), VibrationEffect.DEFAULT_AMPLITUDE)
                    )
                } else {
                    @Suppress("DEPRECATION")
                    vibrator?.vibrate(durationMs.toLong())
                }
            }
            val res = JSObject()
            res.put("success", true)
            call.resolve(res)
        } catch (_: Exception) {
            call.resolve(JSObject().put("success", false))
        }
    }

    override fun handleOnDestroy() {
        super.handleOnDestroy()
        try {
            if (isScanningBle && bleScanner != null && scanCallback != null) {
                bleScanner?.stopScan(scanCallback)
            }
        } catch (_: Exception) {}
        isScanningBle = false
        scanCallback = null
    }
}
