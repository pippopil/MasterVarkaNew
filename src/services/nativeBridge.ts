import { Capacitor, registerPlugin, PluginListenerHandle } from '@capacitor/core';
import { playBrewTimerChime } from '../utils/audioAndNotifications';

export interface HardwareStatus {
  isNative: boolean;
  platform: 'android' | 'ios' | 'web';
  hasBle: boolean;
  isBleEnabled: boolean;
  canExactAlarm: boolean;
  isIgnoringBatteryOptimizations: boolean;
  androidVersion?: string;
  sdkInt?: number;
}

export interface BleHydrometerReading {
  deviceId: string;
  deviceName: string;
  color: string;
  type: 'tilt' | 'generic_ble' | 'simulation';
  specificGravity: number;
  plato: number;
  tempC: number;
  tempF: number;
  rssi?: number;
  txPower?: number;
  lastSeen: number;
}

interface MasterVarkaNativePluginInterface {
  getHardwareStatus(): Promise<HardwareStatus>;
  scheduleExactAlarm(options: {
    alarmId: number;
    title: string;
    body: string;
    triggerTimestampMs: number;
  }): Promise<{ success: boolean; alarmId: number; scheduledAt: number }>;
  cancelAlarm(options: {
    alarmId: number;
  }): Promise<{ success: boolean; alarmId: number }>;
  startBleHydrometerScan(): Promise<{
    success: boolean;
    scanning: boolean;
    message: string;
  }>;
  stopBleHydrometerScan(): Promise<{
    success: boolean;
    scanning: boolean;
  }>;
  requestIgnoreBatteryOptimizations(): Promise<{
    success: boolean;
    prompted: boolean;
  }>;
  vibrateHaptic(options?: {
    durationMs?: number;
  }): Promise<{ success: boolean }>;
  addListener(
    eventName: 'bleHydrometerData',
    listenerFunc: (data: BleHydrometerReading) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'bleScanError',
    listenerFunc: (error: { message?: string }) => void
  ): Promise<PluginListenerHandle>;
}

const MasterVarkaNative = registerPlugin<MasterVarkaNativePluginInterface>('MasterVarkaNative');

/**
 * Проверка нативного Android-окружения (где зарегистрирован Kotlin-плагин MasterVarkaNative).
 * На iOS и в браузере возвращается false, чтобы избежать вызовов Android-only методов
 * при сборке через `npx cap add ios`.
 */
export function isAndroidNative(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

export function isIosNative(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
}

let activeBleListenerHandle: PluginListenerHandle | null = null;
let simulatedScanInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Конвертация удельного веса (SG) в градусы Плато (°P)
 * Формула ASBC: °P = -1 * 616.868 + (1111.14 * sg) - (630.272 * sg^2) + (135.997 * sg^3)
 */
export function sgToPlato(sg: number): number {
  if (sg < 1.0) return 0;
  const p = -616.868 + 1111.14 * sg - 630.272 * Math.pow(sg, 2) + 135.997 * Math.pow(sg, 3);
  return Math.max(0, Math.round(p * 10) / 10);
}

/**
 * Конвертация градусов Плато (°P) в удельный вес (SG)
 * Формула Линкольна: SG = 1 + (plato / (258.6 - (plato / 258.2) * 227.1))
 */
export function platoToSg(plato: number): number {
  if (plato <= 0) return 1.0;
  const sg = 1 + plato / (258.6 - (plato / 258.2) * 227.1);
  return Math.round(sg * 1000) / 1000;
}

/**
 * Получение аппаратного статуса смартфона (BLE, точные будильники, оптимизация батареи)
 */
export async function getNativeHardwareStatus(): Promise<HardwareStatus> {
  if (isAndroidNative()) {
    try {
      return await MasterVarkaNative.getHardwareStatus();
    } catch (e) {
      console.warn('[NativeBridge] getHardwareStatus failed, falling back:', e);
    }
  }

  // Безопасный fallback для iOS (Capacitor) и Web/PWA
  const platform: 'ios' | 'web' = isIosNative() ? 'ios' : 'web';
  const hasWebBt = typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  return {
    isNative: platform === 'ios',
    platform,
    hasBle: hasWebBt,
    isBleEnabled: hasWebBt,
    canExactAlarm: false,
    isIgnoringBatteryOptimizations: true
  };
}

/**
 * Планирование аппаратного точного будильника через Android AlarmManager.
 * Срабатывает даже когда экран выключен, телефон спит в кармане (Doze Mode).
 * На iOS и Web используется безопасный fallback.
 */
export async function scheduleExactBrewAlarm(
  id: number,
  title: string,
  body: string,
  triggerDate: Date
): Promise<boolean> {
  const triggerMs = triggerDate.getTime();
  if (isNaN(triggerMs) || triggerMs <= Date.now()) {
    return false;
  }

  if (isAndroidNative()) {
    try {
      const res = await MasterVarkaNative.scheduleExactAlarm({
        alarmId: id,
        title,
        body,
        triggerTimestampMs: triggerMs
      });
      return res?.success ?? false;
    } catch (e) {
      console.warn('[NativeBridge] Native scheduleExactAlarm failed:', e);
    }
  }

  // Fallback для браузера и iOS WebView: таймер в оперативной памяти (сработает если вкладка открыта)
  const delay = triggerMs - Date.now();
  if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
    setTimeout(() => {
      playBrewTimerChime('alarm');
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification(title, { body, icon: '/favicon.ico', requireInteraction: true });
        } catch {}
      }
    }, delay);
  }

  return true;
}

/**
 * Отмена точного аппаратного будильника
 */
export async function cancelExactBrewAlarm(id: number): Promise<boolean> {
  if (isAndroidNative()) {
    try {
      const res = await MasterVarkaNative.cancelAlarm({ alarmId: id });
      return res?.success ?? false;
    } catch (e) {
      console.warn('[NativeBridge] cancelAlarm failed:', e);
    }
  }
  return true;
}

/**
 * Запрос отключения режима оптимизации батареи (Android Doze Mode whitelist).
 * На iOS и Web является безопасной заглушкой.
 */
export async function requestBatteryOptimizationExemption(): Promise<{ status: 'android_prompted' | 'web_fallback' }> {
  if (isAndroidNative()) {
    try {
      await MasterVarkaNative.requestIgnoreBatteryOptimizations();
      return { status: 'android_prompted' };
    } catch (e) {
      console.warn('[NativeBridge] requestIgnoreBatteryOptimizations failed:', e);
    }
  }
  return { status: 'web_fallback' };
}

/**
 * Запуск непрерывного сканирования беспроводных ареометров (Tilt / iSpindel BLE)
 */
export async function startHydrometerScan(
  onData: (data: BleHydrometerReading) => void,
  onError?: (err: { message?: string }) => void
): Promise<{ success: boolean; message: string }> {
  // 1. Нативный Android режим (прямой BluetoothLeScanner)
  if (isAndroidNative()) {
    try {
      if (activeBleListenerHandle) {
        await activeBleListenerHandle.remove();
        activeBleListenerHandle = null;
      }

      activeBleListenerHandle = await MasterVarkaNative.addListener(
        'bleHydrometerData',
        (reading: BleHydrometerReading) => {
          onData(reading);
        }
      );

      if (onError) {
        await MasterVarkaNative.addListener('bleScanError', onError);
      }

      const res = await MasterVarkaNative.startBleHydrometerScan();
      return { success: true, message: res.message || 'Сканирование ареометров запущено' };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Не удалось запустить нативный BLE сканер';
      return {
        success: false,
        message: msg
      };
    }
  }

  // 2. Web / iOS режим: демонстрационная эмуляция или Web Bluetooth
  if (simulatedScanInterval) {
    clearInterval(simulatedScanInterval);
  }

  let mockSg = 1.054;
  let mockTemp = 20.2;
  const mockColors = ['Красный (Red)', 'Зеленый (Green)', 'Синий (Blue)'];
  const mockColor = mockColors[Math.floor(Math.random() * mockColors.length)];

  onData({
    deviceId: 'DEMO:AA:BB:CC:DD:EE',
    deviceName: `Tilt Hydrometer ${mockColor}`,
    color: mockColor,
    type: 'simulation',
    specificGravity: mockSg,
    plato: sgToPlato(mockSg),
    tempC: mockTemp,
    tempF: Math.round(((mockTemp * 9) / 5 + 32) * 10) / 10,
    rssi: -62,
    lastSeen: Date.now()
  });

  simulatedScanInterval = setInterval(() => {
    mockSg = Math.round((mockSg - 0.0001) * 10000) / 10000;
    mockTemp = Math.round((mockTemp + (Math.random() * 0.1 - 0.05)) * 10) / 10;
    onData({
      deviceId: 'DEMO:AA:BB:CC:DD:EE',
      deviceName: `Tilt Hydrometer ${mockColor}`,
      color: mockColor,
      type: 'simulation',
      specificGravity: Math.round(mockSg * 1000) / 1000,
      plato: sgToPlato(mockSg),
      tempC: mockTemp,
      tempF: Math.round(((mockTemp * 9) / 5 + 32) * 10) / 10,
      rssi: -60 - Math.floor(Math.random() * 10),
      lastSeen: Date.now()
    });
  }, 4000);

  return {
    success: true,
    message: isIosNative()
      ? 'На iOS активен демонстрационный режим ареометра (нативный BLE-плагин iOS подключается отдельно)'
      : 'В браузере активен демонстрационный режим беспроводного ареометра (в APK работает реальный Bluetooth LE)'
  };
}

/**
 * Остановка сканирования ареометров
 */
export async function stopHydrometerScan(): Promise<void> {
  if (simulatedScanInterval) {
    clearInterval(simulatedScanInterval);
    simulatedScanInterval = null;
  }

  if (activeBleListenerHandle) {
    try {
      await activeBleListenerHandle.remove();
    } catch {}
    activeBleListenerHandle = null;
  }

  if (isAndroidNative()) {
    try {
      await MasterVarkaNative.stopBleHydrometerScan();
    } catch (e) {
      console.warn('[NativeBridge] stopBleHydrometerScan error:', e);
    }
  }
}

/**
 * Тактильная отдача (вибрация смартфона)
 */
export async function triggerHapticFeedback(durationMs = 80): Promise<void> {
  if (isAndroidNative()) {
    try {
      await MasterVarkaNative.vibrateHaptic({ durationMs });
      return;
    } catch {}
  }

  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(durationMs);
    } catch {}
  }
}
