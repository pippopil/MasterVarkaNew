import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { FermentationBatch } from '../types/brewing';
import { scheduleExactBrewAlarm, cancelExactBrewAlarm } from '../services/nativeBridge';

/**
 * Сервис звуковых сигналов и системных напоминаний варки (Brew Day Audio & Notifications)
 * Поддерживает:
 * - Нативные локальные пуш-уведомления через Capacitor Local Notifications на Android (с разрешениями POST_NOTIFICATIONS, SCHEDULE_EXACT_ALARM)
 * - Системные уведомления браузера (Web Notifications API)
 * - Синтез звуковых сигналов через Web Audio API (громкие зуммеры и мелодичные оповещения)
 * - Мобильную вибрацию (Navigator.vibrate)
 * - Блокировку засыпания экрана во время варки (Screen Wake Lock API)
 * - Долгосрочные напоминания об этапах брожения (сухое охмеление, розлив, созревание)
 */

let sharedAudioCtx: AudioContext | null = null;
let wakeLockSentinel: any = null;

const STORAGE_KEY_REMINDERS = 'mastervarka_scheduled_ferment_reminders';
const STORAGE_KEY_FIRST_LAUNCH = 'mastervarka_permissions_first_prompted';

export interface ScheduledReminderInfo {
  id: number;
  title: string;
  body: string;
  triggerDate: string; // ISO string
  batchId?: string;
  batchNumber?: string;
  recipeName?: string;
  stageId?: string;
  stageName?: string;
  createdAt: string;
}

/**
 * Получение сохраненных напоминаний из локального хранилища
 */
export function getStoredScheduledReminders(): ScheduledReminderInfo[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REMINDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredScheduledReminders(list: ScheduledReminderInfo[]) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(list));
  } catch {}
}

/**
 * Проверка: требуется ли показать диалог первого запуска для разрешений
 */
export function isFirstLaunchPermissionPromptNeeded(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return !localStorage.getItem(STORAGE_KEY_FIRST_LAUNCH);
}

/**
 * Отметка, что диалог первого запуска был показан
 */
export function markFirstLaunchPermissionPrompted(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_FIRST_LAUNCH, 'true');
}

/**
 * Получение или разблокировка синглтона Web Audio Context по пользовательскому жесту
 */
export function getUnlockedAudioContext(): AudioContext | null {
  try {
    if (!sharedAudioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        sharedAudioCtx = new AudioContextClass();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch (e) {
    console.warn('Web Audio Context initialization error:', e);
    return null;
  }
}

export type BrewChimeType = 'start' | 'pause' | 'alarm' | 'step' | 'countdown' | 'test';

/**
 * Воспроизведение звукового сигнала варочного таймера
 */
export function playBrewTimerChime(type: BrewChimeType = 'alarm') {
  try {
    const ctx = getUnlockedAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'start') {
      // Короткий чистый сигнал запуска таймера (660 -> 880 Гц)
      playTone(ctx, 660, now, 0.1, 0.25);
      playTone(ctx, 880, now + 0.1, 0.15, 0.3);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100]);
      }
    } else if (type === 'pause') {
      // Нисходящий сигнал паузы (660 -> 440 Гц)
      playTone(ctx, 660, now, 0.1, 0.2);
      playTone(ctx, 440, now + 0.1, 0.2, 0.25);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([80]);
      }
    } else if (type === 'step') {
      // Оповещение о промежуточном этапе / внесении хмеля (мажорное трезвучие C-E-G)
      playTone(ctx, 523.25, now, 0.12, 0.3);
      playTone(ctx, 659.25, now + 0.12, 0.12, 0.35);
      playTone(ctx, 783.99, now + 0.24, 0.25, 0.4);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([150, 80, 200]);
      }
    } else if (type === 'countdown') {
      // Тихий щелчок последних секунд (1000 Гц, 40мс)
      playTone(ctx, 1000, now, 0.04, 0.15);
    } else if (type === 'test') {
      // Тестовое воспроизведение громкого сигнала
      playAlarmSequence(ctx, now);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([300, 100, 300, 100, 500]);
      }
    } else {
      // 'alarm' - Мощный громкий звонок завершения этапа варки
      playAlarmSequence(ctx, now);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([400, 150, 400, 150, 700]);
      }
    }
  } catch (err) {
    console.warn('Audio chime playback failed:', err);
  }
}

/**
 * Синтез отдельного тона с огибающей громкости
 */
function playTone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  peakGain = 0.3,
  type: OscillatorType = 'sine'
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.001, peakGain), startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

/**
 * Серия настойчивых импульсов для тревожного сигнала варки (зуммер)
 */
function playAlarmSequence(ctx: AudioContext, startTime: number) {
  const pulses = [
    { freq: 880, delay: 0.0, dur: 0.15 },
    { freq: 1174, delay: 0.18, dur: 0.22 },
    { freq: 880, delay: 0.5, dur: 0.15 },
    { freq: 1174, delay: 0.68, dur: 0.22 },
    { freq: 1046, delay: 1.0, dur: 0.18 },
    { freq: 1318, delay: 1.2, dur: 0.35 }
  ];

  pulses.forEach(p => {
    playTone(ctx, p.freq, startTime + p.delay, p.dur, 0.45, 'triangle');
  });
}

/**
 * Проверка текущего статуса разрешений на уведомления
 */
export async function checkNotificationPermissionStatus(): Promise<{
  granted: boolean;
  canRequest: boolean;
  platform: 'native' | 'web';
}> {
  // 1. Android / Capacitor нативный режим
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.checkPermissions();
      const granted = status.display === 'granted';
      return {
        granted,
        canRequest: status.display === 'prompt' || status.display === 'prompt-with-rationale',
        platform: 'native'
      };
    } catch {
      // fallback to web
    }
  }

  // 2. Web браузер / PWA
  if (typeof window !== 'undefined' && 'Notification' in window) {
    const granted = Notification.permission === 'granted';
    const canRequest = Notification.permission === 'default';
    return {
      granted,
      canRequest,
      platform: 'web'
    };
  }

  return {
    granted: false,
    canRequest: false,
    platform: 'web'
  };
}

/**
 * Запрос необходимых разрешений для приложения в телефоне (уведомления + разблокировка звука + точные будильники)
 */
export async function requestDeviceNotificationPermissions(): Promise<{
  success: boolean;
  message: string;
  isNative?: boolean;
  isInAppOnly?: boolean;
}> {
  // Активируем аудиоконтекст жестом нажатия пользователя
  getUnlockedAudioContext();

  // 1. Нативный Android через Capacitor LocalNotifications
  if (Capacitor.isNativePlatform()) {
    try {
      const res = await LocalNotifications.requestPermissions();
      if (res.display === 'granted') {
        // Создаем нативный канал уведомлений с повышенным приоритетом и звуком
        try {
          await LocalNotifications.createChannel({
            id: 'brew_timer_channel',
            name: 'Таймер варки пива',
            description: 'Оповещения об окончании температурных пауз и кипячения хмеля',
            importance: 5, // IMPORTANCE_HIGH
            visibility: 1, // VISIBILITY_PUBLIC
            sound: 'res_bell',
            vibration: true,
            lights: true,
            lightColor: '#F59E0B'
          });

          await LocalNotifications.createChannel({
            id: 'fermentation_reminders_channel',
            name: 'Этапы ферментации пива',
            description: 'Напоминания о сухом охмелении, розливе и созревании партий',
            importance: 4, // IMPORTANCE_HIGH
            visibility: 1,
            sound: 'res_bell',
            vibration: true,
            lights: true,
            lightColor: '#10B981'
          });
        } catch {
          // канал может быть уже создан
        }
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('mastervarka_notifications_enabled', 'true');
        }
        return {
          success: true,
          isNative: true,
          message: 'Разрешение на системные уведомления успешно получено на телефоне! 🔔'
        };
      }
      return {
        success: false,
        message: 'Разрешение на уведомления отклонено. Вы можете включить их в меню телефона: «Настройки → Приложения → МастерВарка → Уведомления».'
      };
    } catch (e: any) {
      console.warn('Capacitor LocalNotifications request failed:', e);
    }
  }

  // 2. Web Notifications API (Chrome, Safari, PWA на Android/iOS)
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('mastervarka_notifications_enabled', 'true');
        }
        return {
          success: true,
          message: 'Системные напоминания успешно активированы в браузере! 🔔'
        };
      } else if (perm === 'denied') {
        return {
          success: false,
          message: 'Уведомления заблокированы сайтом. Нажмите на значок настроек в строке браузера и разрешите «Уведомления».'
        };
      }
      // Пользователь закрыл системный диалог, но мы активируем звуки и вибрацию в приложении
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('mastervarka_notifications_enabled', 'true');
      }
      return {
        success: true,
        isInAppOnly: true,
        message: 'Звуковые оповещения и вибрация для варки включены в приложении! 🔔'
      };
    } catch (e: any) {
      console.warn('Notification.requestPermission error:', e);
    }
  }

  // 3. Fallback: Браузер или WebView не поддерживает внешний Web Push API (например, старые WebView или Safari без PWA)
  // Включаем встроенные звуковые сигналы Web Audio + мобильную вибрацию + индикаторы!
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('mastervarka_notifications_enabled', 'true');
  }
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([150, 50, 150]);
  }

  return {
    success: true,
    isInAppOnly: true,
    message: 'Звуковые сигналы, вибро-отклик и таймеры варки успешно включены в приложении! 🔔 (Фоновые системные пуши доступны в установленном APK на телефоне).'
  };
}

/**
 * Мгновенная отправка системного напоминания
 */
export async function sendBrewNotification(options: {
  title: string;
  body: string;
  tag?: string;
  stageName?: string;
}) {
  const { title, body, tag = 'brew_timer_alert' } = options;

  // 1. Нативный Android Capacitor
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Date.now() % 100000),
            title,
            body,
            channelId: 'brew_timer_channel',
            schedule: { at: new Date(Date.now() + 100) },
            sound: 'res_bell',
            extra: { tag }
          }
        ]
      });
      return;
    } catch (err) {
      console.warn('Native LocalNotification dispatch failed:', err);
    }
  }

  // 2. Web Notifications
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag,
        badge: '/favicon.ico',
        requireInteraction: true
      });
    } catch (e) {
      console.warn('Web Notification display error:', e);
    }
  }
}

/**
 * Запланировать нативное локальное напоминание таймера в будущем
 * Использует двухуровневую защиту:
 * 1. Нативный AlarmManager.setExactAndAllowWhileIdle (пробуждение процессора из Doze Mode)
 * 2. Capacitor LocalNotifications (системная плашка и звук)
 */
export async function scheduleNativeTimerAlert(notificationId: number, title: string, body: string, triggerDate: Date) {
  // 1. Аппаратный AlarmManager
  scheduleExactBrewAlarm(notificationId, title, body, triggerDate).catch(() => {});

  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationId,
          title,
          body,
          channelId: 'brew_timer_channel',
          schedule: { at: triggerDate, allowWhileIdle: true },
          sound: 'res_bell'
        }
      ]
    });
  } catch (err) {
    console.warn('Failed to schedule background native alarm:', err);
  }
}

/**
 * Отмена запланированного локального напоминания
 */
export async function cancelNativeTimerAlert(notificationId: number) {
  cancelExactBrewAlarm(notificationId).catch(() => {});
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.cancel({
      notifications: [{ id: notificationId }]
    });
  } catch {
    // ignore
  }
}

/**
 * Запланировать звуковое напоминание о завершении этапа ферментации
 */
export async function scheduleFermentationStageReminder(params: {
  id?: number;
  title: string;
  body: string;
  triggerDate: Date;
  batchId?: string;
  batchNumber?: string;
  recipeName?: string;
  stageId?: string;
  stageName?: string;
}): Promise<number> {
  const id = params.id || Math.floor(Date.now() % 1000000) + Math.floor(Math.random() * 1000);

  // 1. Аппаратный AlarmManager
  scheduleExactBrewAlarm(id, params.title, params.body, params.triggerDate).catch(() => {});

  // 2. Capacitor Native Local Notifications
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title: params.title,
            body: params.body,
            channelId: 'fermentation_reminders_channel',
            schedule: {
              at: params.triggerDate,
              allowWhileIdle: true
            },
            sound: 'res_bell',
            extra: {
              batchId: params.batchId,
              stageId: params.stageId
            }
          }
        ]
      });
    } catch (err) {
      console.warn('Failed to schedule native fermentation reminder:', err);
    }
  } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    // В вебе: если таймер сработает в пределах текущей сессии
    const diffMs = params.triggerDate.getTime() - Date.now();
    if (diffMs > 0 && diffMs < 24 * 3600 * 1000) {
      setTimeout(() => {
        try {
          new Notification(params.title, {
            body: params.body,
            icon: '/favicon.ico'
          });
          playBrewTimerChime('step');
        } catch {}
      }, diffMs);
    }
  }

  // 2. Сохраняем метаданные напоминания в локальный реестр
  const existing = getStoredScheduledReminders().filter(r => r.id !== id);
  existing.push({
    id,
    title: params.title,
    body: params.body,
    triggerDate: params.triggerDate.toISOString(),
    batchId: params.batchId,
    batchNumber: params.batchNumber,
    recipeName: params.recipeName,
    stageId: params.stageId,
    stageName: params.stageName,
    createdAt: new Date().toISOString()
  });
  saveStoredScheduledReminders(existing);

  return id;
}

/**
 * Запланировать напоминания для всех предстоящих этапов партии в календаре
 */
export async function scheduleBatchAllStages(batch: FermentationBatch): Promise<number> {
  let count = 0;
  const now = Date.now();

  for (const stage of batch.stages) {
    // Пропускаем завершенные шаги
    if (stage.isCompleted) continue;

    // Вычисляем целевую дату: дата старта + dayOffset дней, в 09:00 утра
    const stageDate = new Date(batch.startDate);
    stageDate.setDate(stageDate.getDate() + stage.dayOffset);
    stageDate.setHours(9, 0, 0, 0);

    // Если дата в будущем
    if (stageDate.getTime() > now) {
      const reminderId = Math.floor(Math.abs(hashString(`${batch.id}_${stage.id}`)) % 1000000);
      await scheduleFermentationStageReminder({
        id: reminderId,
        title: `МастерВарка: ${batch.batchNumber} — ${stage.name} 🍺`,
        body: `${stage.description}. Задача: ${stage.actionRequired}`,
        triggerDate: stageDate,
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        recipeName: batch.recipeName,
        stageId: stage.id,
        stageName: stage.name
      });
      count++;
    }
  }

  return count;
}

/**
 * Отмена всех напоминаний конкретной партии
 */
export async function cancelBatchReminders(batchId: string): Promise<void> {
  const stored = getStoredScheduledReminders();
  const toCancel = stored.filter(r => r.batchId === batchId);

  if (Capacitor.isNativePlatform() && toCancel.length > 0) {
    try {
      await LocalNotifications.cancel({
        notifications: toCancel.map(r => ({ id: r.id }))
      });
    } catch {}
  }

  const remaining = stored.filter(r => r.batchId !== batchId);
  saveStoredScheduledReminders(remaining);
}

/**
 * Отмена одного конкретного напоминания
 */
export async function cancelScheduledReminder(id: number): Promise<void> {
  cancelExactBrewAlarm(id).catch(() => {});
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.cancel({
        notifications: [{ id }]
      });
    } catch {}
  }

  const stored = getStoredScheduledReminders().filter(r => r.id !== id);
  saveStoredScheduledReminders(stored);
}

/**
 * Вспомогательное хеширование строки для получения стабильного числового ID
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/**
 * Включение Screen Wake Lock (предотвращает засыпание экрана смартфона во время варки)
 */
export async function requestScreenWakeLock(): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
      return true;
    }
  } catch {
    // Wake Lock may be refused if battery is low or not active window
  }
  return false;
}

/**
 * Отключение блокировки засыпания экрана
 */
export function releaseScreenWakeLock() {
  try {
    if (wakeLockSentinel) {
      wakeLockSentinel.release();
      wakeLockSentinel = null;
    }
  } catch {}
}
