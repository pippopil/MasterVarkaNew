import React, { useState, useEffect } from 'react';
import {
  Bluetooth,
  Radio,
  Battery,
  Thermometer,
  Activity,
  Zap,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Power,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  BleHydrometerReading,
  HardwareStatus,
  getNativeHardwareStatus,
  startHydrometerScan,
  stopHydrometerScan,
  requestBatteryOptimizationExemption,
  triggerHapticFeedback
} from '../services/nativeBridge';

interface Props {
  onReadingReceived?: (reading: BleHydrometerReading) => void;
  compact?: boolean;
}

export const BleHydrometerWidget: React.FC<Props> = ({ onReadingReceived, compact = false }) => {
  const [hardwareStatus, setHardwareStatus] = useState<HardwareStatus | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [activeReading, setActiveReading] = useState<BleHydrometerReading | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Bluetooth LE готов к поиску');
  const [isRequestingBattery, setIsRequestingBattery] = useState(false);

  useEffect(() => {
    getNativeHardwareStatus().then(status => {
      setHardwareStatus(status);
    });

    return () => {
      stopHydrometerScan().catch(() => {});
    };
  }, []);

  const handleToggleScan = async () => {
    triggerHapticFeedback(50);
    if (isScanning) {
      await stopHydrometerScan();
      setIsScanning(false);
      setStatusMessage('Сканирование остановлено');
    } else {
      setIsScanning(true);
      setStatusMessage('Поиск Bluetooth LE ареометров (Tilt / iSpindel)...');
      const res = await startHydrometerScan(
        (reading) => {
          setActiveReading(reading);
          setStatusMessage(`Получены данные: ${reading.deviceName}`);
          if (onReadingReceived) {
            onReadingReceived(reading);
          }
        },
        (err) => {
          setStatusMessage(`Ошибка BLE: ${err?.message || 'Не удалось просканировать'}`);
          setIsScanning(false);
        }
      );
      if (!res.success) {
        setIsScanning(false);
        setStatusMessage(res.message);
      }
    }
  };

  const handleRequestBatteryWhitelist = async () => {
    setIsRequestingBattery(true);
    triggerHapticFeedback(50);
    try {
      await requestBatteryOptimizationExemption();
      setTimeout(async () => {
        const s = await getNativeHardwareStatus();
        setHardwareStatus(s);
        setIsRequestingBattery(false);
      }, 1500);
    } catch {
      setIsRequestingBattery(false);
    }
  };

  if (compact) {
    return (
      <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 text-xs w-full max-w-full overflow-hidden min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={`p-1.5 rounded-lg shrink-0 ${isScanning ? 'bg-amber-500 text-stone-900 animate-pulse' : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300'}`}>
            <Bluetooth className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 truncate">
              <span className="truncate">{activeReading ? activeReading.deviceName : 'BLE Ареометр'}</span>
              {activeReading && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono shrink-0">
                  {activeReading.specificGravity.toFixed(3)} SG
                </span>
              )}
            </div>
            <div className="text-stone-500 text-[10px] sm:text-[11px] truncate">{statusMessage}</div>
          </div>
        </div>

        <button
          onClick={handleToggleScan}
          className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 sm:gap-1.5 transition-all shrink-0 text-xs ${
            isScanning
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-sm'
          }`}
        >
          {isScanning ? (
            <>
              <Power className="w-3.5 h-3.5" />
              <span>Стоп</span>
            </>
          ) : (
            <>
              <Radio className="w-3.5 h-3.5" />
              <span>Поиск</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3 sm:space-y-4 w-full max-w-full overflow-hidden min-w-0">
      {/* Заголовок карточки */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-2 w-full min-w-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-2 truncate">
              <span className="truncate">Цифровой ареометр & BLE</span>
              {hardwareStatus?.isNative && (
                <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                  Android Native
                </span>
              )}
            </h3>
            <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 truncate">
              Bluetooth LE телеметрия плотности и температуры (Tilt, iSpindel)
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleScan}
          className={`w-full sm:w-auto px-3.5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0 ${
            isScanning
              ? 'bg-rose-500 text-white shadow-rose-500/20 animate-pulse'
              : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20'
          }`}
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Остановить поиск</span>
            </>
          ) : (
            <>
              <Bluetooth className="w-3.5 h-3.5" />
              <span>Сканировать ареометры</span>
            </>
          )}
        </button>
      </div>

      {/* Индикаторы текущего чтения */}
      {activeReading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 dark:bg-stone-800/40 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-700/60">
          <div className="space-y-1">
            <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-amber-500" />
              <span>Плотность (SG)</span>
            </div>
            <div className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100">
              {activeReading.specificGravity.toFixed(3)}
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold font-mono">
              {activeReading.plato.toFixed(1)} °P (Плато)
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-rose-500" />
              <span>Температура</span>
            </div>
            <div className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100">
              {activeReading.tempC.toFixed(1)} °C
            </div>
            <div className="text-[11px] text-stone-400 font-mono">
              {activeReading.tempF.toFixed(1)} °F
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-blue-500" />
              <span>Сигнал RSSI</span>
            </div>
            <div className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100">
              {activeReading.rssi ? `${activeReading.rssi} dBm` : '—'}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Стабильный
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-violet-500" />
              <span>Устройство</span>
            </div>
            <div className="text-sm font-semibold truncate text-stone-900 dark:text-stone-100">
              {activeReading.deviceName}
            </div>
            <div className="text-[11px] text-stone-400 truncate">
              {activeReading.color}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-stone-50 dark:bg-stone-800/30 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 text-center text-xs text-stone-500 space-y-1">
          <div className="flex justify-center text-stone-400 mb-1">
            <Bluetooth className="w-6 h-6 animate-pulse" />
          </div>
          <p className="font-medium text-stone-700 dark:text-stone-300">{statusMessage}</p>
          <p className="text-[11px]">
            Включите беспроводной ареометр Tilt или iSpindel и нажмите «Сканировать ареометры» для считывания плотности сусла на лету.
          </p>
        </div>
      )}

      {/* Системный статус фоновой работы и батареи */}
      {hardwareStatus && (
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {hardwareStatus.canExactAlarm ? (
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-amber-500" />
              )}
              <span className="text-stone-600 dark:text-stone-400">
                Точные будильники AlarmManager: {hardwareStatus.canExactAlarm ? 'Активны' : 'Ограничены ОС'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {hardwareStatus.isIgnoringBatteryOptimizations ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              )}
              <span className="text-stone-600 dark:text-stone-400">
                Фоновый режим Doze: {hardwareStatus.isIgnoringBatteryOptimizations ? 'Разрешен' : 'Оптимизируется'}
              </span>
            </div>
          </div>

          {!hardwareStatus.isIgnoringBatteryOptimizations && hardwareStatus.isNative && (
            <button
              onClick={handleRequestBatteryWhitelist}
              disabled={isRequestingBattery}
              className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              <span>Разрешить фоновую работу без задержек</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
