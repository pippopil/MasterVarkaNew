import React, { useState, useEffect, useRef } from 'react';
import { BrewLog, Recipe } from '../types/brewing';
import {
  ClipboardList,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  FileText,
  Timer,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Bell,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  ChevronDown
} from 'lucide-react';
import {
  playBrewTimerChime,
  requestDeviceNotificationPermissions,
  sendBrewNotification,
  scheduleNativeTimerAlert,
  cancelNativeTimerAlert,
  requestScreenWakeLock,
  releaseScreenWakeLock,
  checkNotificationPermissionStatus,
  scheduleFermentationStageReminder,
  cancelScheduledReminder,
  getStoredScheduledReminders,
  ScheduledReminderInfo
} from '../utils/audioAndNotifications';
import { BleHydrometerWidget } from './BleHydrometerWidget';

interface Props {
  logs: BrewLog[];
  recipes: Recipe[];
  onUpdateLogs: (logs: BrewLog[]) => void;
  onOpenPdfReport?: (log: BrewLog) => void;
}

export const BrewLogJournal: React.FC<Props> = ({ logs, recipes, onUpdateLogs, onOpenPdfReport }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  // Форма записи
  const [recipeId, setRecipeId] = useState(recipes[0]?.id || '');
  const [batchNumber, setBatchNumber] = useState(`Варка #${logs.length + 1}`);
  const [brewDate, setBrewDate] = useState(new Date().toISOString().split('T')[0]);
  const [actualOg, setActualOg] = useState<number>(1.052);
  const [actualFg, setActualFg] = useState<number>(1.011);
  const [mashPh, setMashPh] = useState<number>(5.3);
  const [fermentTempC, setFermentTempC] = useState<number>(20);
  const [aromaScore, setAromaScore] = useState<number>(10);
  const [appearanceScore, setAppearanceScore] = useState<number>(3);
  const [flavorScore, setFlavorScore] = useState<number>(17);
  const [mouthfeelScore, setMouthfeelScore] = useState<number>(4);
  const [overallScore, setOverallScore] = useState<number>(8);
  const [notes, setNotes] = useState('');
  const [aromaNotes, setAromaNotes] = useState('');
  const [flavorNotes, setFlavorNotes] = useState('');

  // Режим «Грязные руки» (Hands-Free Brew Day Timer)
  const [handsFreeOpen, setHandsFreeOpen] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60 * 60); // 60 мин по умолчанию
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerStageName, setTimerStageName] = useState('Кипячение сусла');
  const [selectedRecipeForTimer, setSelectedRecipeForTimer] = useState<string>(recipes[0]?.id || '');

  // Статус разрешений на уведомления и звук в телефоне
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionMessage, setPermissionMessage] = useState<string | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const activeNativeNotificationIdRef = useRef<number | null>(null);
  const timerEndTimestampRef = useRef<number | null>(null);

  // Проверка статуса разрешений при монтировании и загрузка сохраненных напоминаний
  const [storedReminders, setStoredReminders] = useState<ScheduledReminderInfo[]>(() =>
    getStoredScheduledReminders()
  );

  // Модальное окно установки напоминания об этапе ферментации
  const [remindersModalOpen, setRemindersModalOpen] = useState(false);
  const [selectedLogForReminder, setSelectedLogForReminder] = useState<BrewLog | null>(null);
  const [reminderStageType, setReminderStageType] = useState<string>('dry_hop');
  const [reminderStageName, setReminderStageName] = useState<string>('Сухое охмеление (Dry Hop)');
  const [reminderDate, setReminderDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [reminderTime, setReminderTime] = useState<string>('09:00');
  const [reminderNotes, setReminderNotes] = useState<string>('Внести ароматический хмель без доступа кислорода');

  useEffect(() => {
    checkNotificationPermissionStatus().then(status => {
      setPermissionGranted(status.granted);
    });
    setStoredReminders(getStoredScheduledReminders());
  }, []);

  const openReminderModalForLog = (log?: BrewLog | null) => {
    const target = log || logs[0] || null;
    setSelectedLogForReminder(target);
    const baseDate = target ? new Date(target.brewDate) : new Date();
    // По умолчанию: сухое охмеление через 5 дней в 09:00
    baseDate.setDate(baseDate.getDate() + 5);
    setReminderDate(baseDate.toISOString().split('T')[0]);
    setReminderTime('09:00');
    setReminderStageType('dry_hop');
    setReminderStageName('Сухое охмеление (Dry Hop)');
    setReminderNotes('Внести ароматический хмель без доступа кислорода');
    setStoredReminders(getStoredScheduledReminders());
    setRemindersModalOpen(true);
  };

  const handleStagePresetChange = (type: string) => {
    setReminderStageType(type);
    const base = selectedLogForReminder ? new Date(selectedLogForReminder.brewDate) : new Date();

    if (type === 'dry_hop') {
      base.setDate(base.getDate() + 5);
      setReminderStageName('Сухое охмеление (Dry Hop)');
      setReminderNotes('Внести ароматический хмель без доступа кислорода (Dry Hopping)');
    } else if (type === 'diacetyl') {
      base.setDate(base.getDate() + 8);
      setReminderStageName('Диацетиловая пауза');
      setReminderNotes('Поднять температуру на 2°C на 2-3 дня для расщепления диацетила');
    } else if (type === 'bottling') {
      base.setDate(base.getDate() + 14);
      setReminderStageName('Розлив и внесение праймера');
      setReminderNotes('Снять пиво с дрожжевого осадка, добавить декстрозу и укупорить бутылки');
    } else if (type === 'conditioning') {
      base.setDate(base.getDate() + 28);
      setReminderStageName('Окончание карбонизации');
      setReminderNotes('Проверить плотность бутылок, убрать партию в холод (2-5°C) на созревание');
    } else if (type === 'ready') {
      base.setDate(base.getDate() + 40);
      setReminderStageName('Пик вкуса / Готово к дегустации!');
      setReminderNotes('Охладить бокал и насладиться готовым крафтовым пивом');
    } else {
      setReminderStageName('Пользовательский этап');
      setReminderNotes('');
    }
    setReminderDate(base.toISOString().split('T')[0]);
  };

  const handleScheduleStageReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderDate) return;

    // Запрос разрешений если еще не выданы
    if (!permissionGranted) {
      const res = await requestDeviceNotificationPermissions();
      setPermissionGranted(res.success);
    }

    const [hours, minutes] = reminderTime.split(':').map(Number);
    const trigger = new Date(reminderDate);
    trigger.setHours(hours || 9, minutes || 0, 0, 0);

    const logTitle = selectedLogForReminder
      ? `${selectedLogForReminder.batchNumber} (${selectedLogForReminder.recipeName})`
      : 'Варка пива';

    await scheduleFermentationStageReminder({
      title: `МастерВарка: ${reminderStageName} 🔔`,
      body: `${logTitle}. Задача: ${reminderNotes || 'Проверьте состояние ферментера'}`,
      triggerDate: trigger,
      batchId: selectedLogForReminder?.id,
      batchNumber: selectedLogForReminder?.batchNumber,
      recipeName: selectedLogForReminder?.recipeName,
      stageName: reminderStageName
    });

    playBrewTimerChime('step');
    setStoredReminders(getStoredScheduledReminders());
    setRemindersModalOpen(false);
  };

  const handleCancelReminder = async (id: number) => {
    await cancelScheduledReminder(id);
    setStoredReminders(getStoredScheduledReminders());
  };

  // Запрос разрешений для приложения в телефоне
  const handleRequestPermissions = async () => {
    setIsRequestingPermission(true);
    setPermissionMessage(null);
    try {
      const res = await requestDeviceNotificationPermissions();
      setPermissionGranted(res.success);
      setPermissionMessage(res.message);
      if (res.success) {
        // Короткий звуковой тест при успешном включении
        playBrewTimerChime('start');
      }
    } finally {
      setIsRequestingPermission(false);
    }
  };

  // Таймер обратного отсчета по абсолютной временной метке (защита от троттлинга Android и дрейфа)
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      if (!timerEndTimestampRef.current) {
        timerEndTimestampRef.current = Date.now() + timerSeconds * 1000;
      }

      const tick = () => {
        if (!timerEndTimestampRef.current) return;
        const remaining = Math.max(0, Math.round((timerEndTimestampRef.current - Date.now()) / 1000));
        setTimerSeconds(remaining);
        if (remaining <= 0) {
          timerEndTimestampRef.current = null;
          setIsTimerRunning(false);
          playBrewTimerChime('alarm');
          sendBrewNotification({
            title: 'МастерВарка: Этап варки завершен! 🔔',
            body: `Время этапа «${timerStageName}» истекло! Пора переходить к следующему шагу варки.`,
            stageName: timerStageName
          });
          releaseScreenWakeLock();
        }
      };

      tick();
      interval = setInterval(tick, 500);

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          tick();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      timerEndTimestampRef.current = null;
    }
  }, [isTimerRunning, timerStageName]);

  // Обработка запуска/паузы таймера с авто-запросом разрешений и Wake Lock
  const handleToggleTimer = async () => {
    if (!isTimerRunning) {
      // Если разрешения еще не запрошены — запрашиваем прямо сейчас
      if (!permissionGranted) {
        requestDeviceNotificationPermissions().then(res => {
          setPermissionGranted(res.success);
        });
      }

      // Включаем Wake Lock, чтобы экран телефона не гас
      requestScreenWakeLock();

      // Звуковой сигнал старта
      playBrewTimerChime('start');

      // Планируем абсолютное время завершения
      const endAt = Date.now() + timerSeconds * 1000;
      timerEndTimestampRef.current = endAt;

      // Планируем локальное напоминание на случай, если экран телефона погаснет
      const notifId = Math.floor(Date.now() % 100000);
      activeNativeNotificationIdRef.current = notifId;
      const triggerDate = new Date(endAt);
      scheduleNativeTimerAlert(
        notifId,
        'МастерВарка: Время вышло! 🔔',
        `Этап «${timerStageName}» завершен.`,
        triggerDate
      );

      setIsTimerRunning(true);
    } else {
      // Пауза: отменяем запланированное фоновое напоминание и отпускаем Wake Lock
      playBrewTimerChime('pause');
      timerEndTimestampRef.current = null;
      if (activeNativeNotificationIdRef.current) {
        cancelNativeTimerAlert(activeNativeNotificationIdRef.current);
        activeNativeNotificationIdRef.current = null;
      }
      releaseScreenWakeLock();
      setIsTimerRunning(false);
    }
  };

  // Сброс таймера
  const handleResetTimer = (seconds = 60 * 60) => {
    playBrewTimerChime('pause');
    timerEndTimestampRef.current = null;
    if (activeNativeNotificationIdRef.current) {
      cancelNativeTimerAlert(activeNativeNotificationIdRef.current);
      activeNativeNotificationIdRef.current = null;
    }
    releaseScreenWakeLock();
    setIsTimerRunning(false);
    setTimerSeconds(seconds);
  };

  // Корректировка времени (+1, +5, -1, -5 минут)
  const adjustTimerTime = (deltaSeconds: number) => {
    setTimerSeconds(prev => {
      const next = Math.max(10, prev + deltaSeconds);
      if (timerEndTimestampRef.current) {
        timerEndTimestampRef.current += deltaSeconds * 1000;
      }
      return next;
    });
  };

  // Тестовое уведомление на телефон
  const handleTestNotification = async () => {
    playBrewTimerChime('test');
    await sendBrewNotification({
      title: 'МастерВарка: Тест напоминаний 🔔',
      body: 'Уведомления и громкий звуковой сигнал успешно настроены на вашем телефоне!'
    });
  };

  const totalBjcpScore = aromaScore + appearanceScore + flavorScore + mouthfeelScore + overallScore;
  const actualAbv = Number(((actualOg - actualFg) * 131.25).toFixed(1));

  const handleOpenNew = () => {
    setEditingLogId(null);
    const r = recipes[0];
    if (r) {
      setRecipeId(r.id);
      setActualOg(r.calculated.ogSg);
      setActualFg(r.calculated.fgSg);
    }
    setBatchNumber(`Варка #${logs.length + 1}`);
    setBrewDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setAromaNotes('');
    setFlavorNotes('');
    setModalOpen(true);
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const recipe = recipes.find(r => r.id === recipeId);
    const rName = recipe ? recipe.name : 'Кастомная варка';

    const newLog: BrewLog = {
      id: editingLogId || `log_${Date.now()}`,
      recipeId,
      recipeName: rName,
      batchNumber,
      brewDate,
      targetOg: recipe?.calculated.ogSg || 1.050,
      targetFg: recipe?.calculated.fgSg || 1.010,
      targetAbv: recipe?.calculated.abv || 5.0,
      actualOg,
      actualFg,
      actualAbv,
      actualEfficiency: recipe?.efficiencyPercent || 72,
      mashPh,
      fermentTempC,
      bjcpScore: totalBjcpScore,
      tastingNotes: {
        aroma: aromaNotes || 'Цитрусовый, чистый',
        appearance: 'Стойкая белая пена, золотистый цвет',
        flavor: flavorNotes || 'Приятная мягкая горечь, свежий солод',
        mouthfeel: 'Среднее тело, умеренная карбонизация',
        overall: 'Отличный питкий результат'
      },
      notes,
      status: 'ready'
    };

    if (editingLogId) {
      onUpdateLogs(logs.map(l => (l.id === editingLogId ? newLog : l)));
    } else {
      onUpdateLogs([newLog, ...logs]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    onUpdateLogs(logs.filter(l => l.id !== id));
  };

  const currentTimerRecipe = recipes.find(r => r.id === selectedRecipeForTimer) || recipes[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Шапка журнала варок */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200/80 dark:border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-amber-500" />
              <span>Журнал варок & Личные заметки ({logs.length})</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Ведите историю своих варок, фиксируйте фактическую плотность и дегустационные оценки по шкале BJCP
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {logs.length > 0 && onOpenPdfReport && (
              <button
                onClick={() => onOpenPdfReport(logs[0])}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-amber-200 dark:border-amber-800/60 cursor-pointer"
                title="Сформировать и скачать PDF-отчет по завершенной варке"
              >
                <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>PDF-отчет варки</span>
              </button>
            )}

            <button
              onClick={() => openReminderModalForLog(logs[0] || null)}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-amber-300 dark:border-amber-700/60 cursor-pointer"
              title="Управление звуковыми напоминаниями об этапах ферментации (Local Notifications)"
            >
              <BellRing className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Напоминания брожения 🔔</span>
            </button>

            <button
              onClick={() => setHandsFreeOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-amber-500/20 cursor-pointer"
              title="Режим «Грязные руки»: таймер варочного дня с напоминаниями и громким звуковым сигналом"
            >
              <Timer className="w-4 h-4" />
              <span>Таймер варки & Зуммер 🔔</span>
            </button>

            <button
              onClick={handleOpenNew}
              className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить запись</span>
            </button>
          </div>
        </div>

        {/* Индикатор напоминаний и разрешений на телефоне */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 text-xs">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="font-semibold text-stone-700 dark:text-stone-300">
              Напоминания и звуковой сигнал на телефоне:
            </span>
            {permissionGranted ? (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Разрешено (Звук + Пуш)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
                <AlertTriangle className="w-3.5 h-3.5" />
                Требуется разрешение
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!permissionGranted && (
              <button
                onClick={handleRequestPermissions}
                disabled={isRequestingPermission}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>{isRequestingPermission ? 'Запрос...' : 'Разрешить уведомления 📲'}</span>
              </button>
            )}

            <button
              onClick={handleTestNotification}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-650 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Проверить воспроизведение звука зуммера и системное пуш-напоминание"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Тест звука и пуша 🔔</span>
            </button>
          </div>
        </div>

        {permissionMessage && (
          <div className="text-xs text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
            {permissionMessage}
          </div>
        )}
      </div>

      {/* Список записей */}
      {logs.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-12 text-center border border-dashed border-stone-300 dark:border-stone-800 space-y-3">
          <FileText className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="font-bold text-base text-stone-800 dark:text-stone-200">
            Журнал варок пока пуст
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Записывайте параметры каждой варки: фактическую плотность, температуру брожения и дегустационные впечатления, чтобы совершенствовать свои рецепты!
          </p>
          <button
            onClick={handleOpenNew}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Сделать первую запись</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {logs.map(log => {
            return (
              <div
                key={log.id}
                className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-4 hover:border-amber-400 transition-colors flex flex-col justify-between min-w-0 max-w-full overflow-hidden"
              >
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-3 min-w-0">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 uppercase">
                        {log.batchNumber}
                      </span>
                      <h3 className="text-lg font-black text-stone-900 dark:text-white mt-1 leading-tight break-words" title={log.recipeName}>
                        {log.recipeName}
                      </h3>
                      <div className="text-xs text-stone-400 flex items-center gap-2 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{new Date(log.brewDate).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>

                    {/* Оценка BJCP */}
                    {log.bjcpScore !== undefined && (
                      <div className="text-right">
                        <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                          {log.bjcpScore}
                          <span className="text-xs text-stone-400 font-normal">/50</span>
                        </div>
                        <div className="text-[10px] text-stone-400 uppercase font-semibold">Оценка BJCP</div>
                      </div>
                    )}
                  </div>

                  {/* Сравнение План vs Факт */}
                  <div className="grid grid-cols-3 gap-2 my-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-stone-400 font-sans block">НП (OG) факт</span>
                      <b className="text-stone-900 dark:text-white">{log.actualOg.toFixed(3)}</b>
                      <span className="text-[10px] text-stone-500 font-sans block">план: {log.targetOg.toFixed(3)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 font-sans block">КП (FG) факт</span>
                      <b className="text-stone-900 dark:text-white">{log.actualFg.toFixed(3)}</b>
                      <span className="text-[10px] text-stone-500 font-sans block">план: {log.targetFg.toFixed(3)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 font-sans block">Алкоголь ABV</span>
                      <b className="text-amber-600 dark:text-amber-400">{log.actualAbv}%</b>
                      <span className="text-[10px] text-stone-500 font-sans block">pH: {log.mashPh || '5.3'}</span>
                    </div>
                  </div>

                  {/* Дегустационные заметки */}
                  {log.tastingNotes && (
                    <div className="space-y-1 text-xs">
                      {log.tastingNotes.aroma && (
                        <div className="text-stone-600 dark:text-stone-300">
                          <b>Аромат:</b> {log.tastingNotes.aroma}
                        </div>
                      )}
                      {log.tastingNotes.flavor && (
                        <div className="text-stone-600 dark:text-stone-300">
                          <b>Вкус:</b> {log.tastingNotes.flavor}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Заметки пивовара */}
                  {log.notes && (
                    <p className="mt-2 p-2.5 rounded-lg bg-amber-50/50 dark:bg-stone-800/40 text-stone-600 dark:text-stone-400 text-xs italic">
                      «{log.notes}»
                    </p>
                  )}

                  {/* Активные напоминания о ферментации для этой варки */}
                  {storedReminders.filter(r => r.batchId === log.id || r.batchNumber === log.batchNumber).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                      {storedReminders
                        .filter(r => r.batchId === log.id || r.batchNumber === log.batchNumber)
                        .map(r => (
                          <span
                            key={r.id}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 dark:text-amber-200 bg-amber-100/90 dark:bg-amber-950/70 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800"
                            title={r.body}
                          >
                            <BellRing className="w-3 h-3 text-amber-500" />
                            <span>{r.stageName || r.title}: {new Date(r.triggerDate).toLocaleDateString('ru-RU')}</span>
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {onOpenPdfReport && (
                      <button
                        onClick={() => onOpenPdfReport(log)}
                        className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                    )}

                    <button
                      onClick={() => openReminderModalForLog(log)}
                      className="text-xs text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 flex items-center gap-1 font-bold cursor-pointer bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded-lg border border-amber-200/80 dark:border-amber-800/60 transition-colors"
                      title="Установить звуковое напоминание о завершении этапа брожения"
                    >
                      <BellRing className="w-3.5 h-3.5 text-amber-500" />
                      <span>Напоминание 🔔</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingLogId(log.id);
                        setRecipeId(log.recipeId);
                        setBatchNumber(log.batchNumber);
                        setBrewDate(log.brewDate);
                        setActualOg(log.actualOg);
                        setActualFg(log.actualFg);
                        setMashPh(log.mashPh || 5.3);
                        setFermentTempC(log.fermentTempC || 20);
                        setNotes(log.notes || '');
                        setAromaNotes(log.tastingNotes?.aroma || '');
                        setFlavorNotes(log.tastingNotes?.flavor || '');
                        setModalOpen(true);
                      }}
                      className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded cursor-pointer"
                      title="Редактировать"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Модальное окно добавления/редактирования записи */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveLog}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-xl w-full p-6 text-stone-900 dark:text-white space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="text-lg font-black text-amber-500">
                {editingLogId ? 'Редактировать запись варки' : 'Новая запись варки'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-stone-500 mb-1">Рецепт</label>
                <select
                  value={recipeId}
                  onChange={e => {
                    setRecipeId(e.target.value);
                    const r = recipes.find(rec => rec.id === e.target.value);
                    if (r) {
                      setActualOg(r.calculated.ogSg);
                      setActualFg(r.calculated.fgSg);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-bold"
                >
                  {recipes.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-500 mb-1">Номер / Название партии</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={e => setBatchNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-stone-500 mb-1">Дата варки</label>
                <input
                  type="date"
                  value={brewDate}
                  onChange={e => setBrewDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-bold"
                />
              </div>
              <div>
                <label className="block text-stone-500 mb-1">pH затора</label>
                <input
                  type="number"
                  step="0.1"
                  value={mashPh}
                  onChange={e => setMashPh(parseFloat(e.target.value) || 5.2)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-bold font-mono"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 space-y-3">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block">
                Фактическая плотность и алкоголь
              </span>
              <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <label className="block text-stone-500 mb-1 font-sans">Факт OG (НП)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={actualOg}
                    onChange={e => setActualOg(parseFloat(e.target.value) || 1.050)}
                    className="w-full p-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-stone-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1 font-sans">Факт FG (КП)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={actualFg}
                    onChange={e => setActualFg(parseFloat(e.target.value) || 1.010)}
                    className="w-full p-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-stone-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1 font-sans">Расчет ABV</label>
                  <div className="p-2 rounded-lg bg-amber-500 text-stone-950 font-black text-center text-sm">
                    {actualAbv}%
                  </div>
                </div>
              </div>
            </div>

            {/* Оценка BJCP */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-700 dark:text-stone-300">Дегустационный балл (BJCP):</span>
                <span className="font-mono font-black text-amber-500 text-sm">{totalBjcpScore} / 50</span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800">
                  <div className="text-stone-500">Аромат</div>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    value={aromaScore}
                    onChange={e => setAromaScore(parseInt(e.target.value) || 0)}
                    className="w-full text-center font-bold bg-transparent font-mono"
                  />
                  <div className="text-[8px] text-stone-400">/12</div>
                </div>
                <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800">
                  <div className="text-stone-500">Внешний</div>
                  <input
                    type="number"
                    min="0"
                    max="3"
                    value={appearanceScore}
                    onChange={e => setAppearanceScore(parseInt(e.target.value) || 0)}
                    className="w-full text-center font-bold bg-transparent font-mono"
                  />
                  <div className="text-[8px] text-stone-400">/3</div>
                </div>
                <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800">
                  <div className="text-stone-500">Вкус</div>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={flavorScore}
                    onChange={e => setFlavorScore(parseInt(e.target.value) || 0)}
                    className="w-full text-center font-bold bg-transparent font-mono"
                  />
                  <div className="text-[8px] text-stone-400">/20</div>
                </div>
                <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800">
                  <div className="text-stone-500">Тело</div>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={mouthfeelScore}
                    onChange={e => setMouthfeelScore(parseInt(e.target.value) || 0)}
                    className="w-full text-center font-bold bg-transparent font-mono"
                  />
                  <div className="text-[8px] text-stone-400">/5</div>
                </div>
                <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800">
                  <div className="text-stone-500">Общее</div>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={overallScore}
                    onChange={e => setOverallScore(parseInt(e.target.value) || 0)}
                    className="w-full text-center font-bold bg-transparent font-mono"
                  />
                  <div className="text-[8px] text-stone-400">/10</div>
                </div>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-stone-500">Заметки и особенности процесса</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Температура брожения, время кипячения, особенности фильтрации..."
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-stone-500 hover:text-stone-700 text-xs font-bold cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Сохранить запись
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Модальное окно режима «Грязные руки» (Hands-Free Brew Day Timer) */}
      {handsFreeOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-stone-900 border-2 border-amber-500 rounded-3xl max-w-xl w-full p-5 sm:p-6 text-white space-y-5 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-400">
                  <Timer className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-amber-400">Таймер варки & Зуммер 🧤</h3>
                  <p className="text-[11px] sm:text-xs text-stone-400">
                    Громкий звуковой сигнал, пуш-напоминания на телефон и защита от засыпания экрана
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHandsFreeOpen(false)}
                className="p-2 text-stone-400 hover:text-white text-2xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Статус разрешений для телефона */}
            <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Bell className={`w-4 h-4 shrink-0 ${permissionGranted ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`} />
                <div className="truncate">
                  {permissionGranted ? (
                    <span className="text-emerald-400 font-bold">Напоминания активны на телефоне ✅</span>
                  ) : (
                    <span className="text-amber-300 font-medium">Разрешите уведомления, чтобы слышать зуммер 📲</span>
                  )}
                </div>
              </div>

              {!permissionGranted ? (
                <button
                  type="button"
                  onClick={handleRequestPermissions}
                  disabled={isRequestingPermission}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs shrink-0 cursor-pointer shadow-sm transition-transform active:scale-95"
                >
                  {isRequestingPermission ? 'Запрос...' : 'Разрешить'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleTestNotification}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-bold shrink-0 cursor-pointer border border-stone-700"
                >
                  Тест звука 🔔
                </button>
              )}
            </div>

            {/* Компактный виджет цифрового ареометра (Bluetooth LE) */}
            <BleHydrometerWidget compact={true} />

            {/* Выбор этапа из рецепта или стандартных шагов варки */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400 font-semibold">Выберите этап варочного дня:</span>
                {recipes.length > 0 && (
                  <select
                    value={selectedRecipeForTimer}
                    onChange={e => setSelectedRecipeForTimer(e.target.value)}
                    className="bg-stone-800 text-amber-400 text-[11px] font-bold rounded-lg px-2 py-1 border border-stone-700"
                  >
                    {recipes.map(r => (
                      <option key={r.id} value={r.id}>
                        Рецепт: {r.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Быстрые пресеты */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Затирание (60м)', sec: 60 * 60 },
                  { name: 'Кипячение (60м)', sec: 60 * 60 },
                  { name: 'Хмель (15м)', sec: 15 * 60 },
                  { name: 'Вирпул (10м)', sec: 10 * 60 },
                  { name: 'Мэшаут (10м)', sec: 10 * 60 },
                  { name: 'Охлаждение (15м)', sec: 15 * 60 }
                ].map(stage => (
                  <button
                    key={stage.name}
                    type="button"
                    onClick={() => {
                      setTimerStageName(stage.name);
                      handleResetTimer(stage.sec);
                    }}
                    className={`p-2.5 rounded-2xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      timerStageName === stage.name
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-black'
                        : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-750'
                    }`}
                  >
                    {stage.name}
                  </button>
                ))}
              </div>

              {/* Паузы затирания из выбранного рецепта */}
              {currentTimerRecipe?.mashSchedule && currentTimerRecipe.mashSchedule.length > 0 && (
                <div className="pt-1">
                  <div className="text-[11px] text-stone-400 mb-1">Паузы из рецепта «{currentTimerRecipe.name}»:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentTimerRecipe.mashSchedule.map((p, pIdx) => (
                      <button
                        key={`${p.name}_${pIdx}`}
                        type="button"
                        onClick={() => {
                          setTimerStageName(`${p.name} (${p.tempC}°C)`);
                          handleResetTimer(p.timeMin * 60);
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                          timerStageName.includes(p.name)
                            ? 'bg-amber-500 text-stone-950 border-amber-400'
                            : 'bg-stone-800/80 border-stone-700 text-amber-300 hover:bg-stone-700'
                        }`}
                      >
                        {p.name} {p.tempC}°C ({p.timeMin}м)
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Гигантский дисплей таймера */}
            <div className="text-center py-5 sm:py-6 bg-stone-950 rounded-3xl border border-stone-800 space-y-2 relative overflow-hidden">
              <div className="text-xs font-semibold text-amber-500 uppercase tracking-widest px-2">
                {timerStageName}
              </div>
              <div className="text-6xl sm:text-8xl font-black font-mono tracking-tighter text-white select-none">
                {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:
                {String(timerSeconds % 60).padStart(2, '0')}
              </div>

              {/* Быстрая корректировка времени */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => adjustTimerTime(-5 * 60)}
                  className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-bold cursor-pointer"
                >
                  -5м
                </button>
                <button
                  type="button"
                  onClick={() => adjustTimerTime(-1 * 60)}
                  className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-bold cursor-pointer"
                >
                  -1м
                </button>
                <button
                  type="button"
                  onClick={() => adjustTimerTime(1 * 60)}
                  className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-bold cursor-pointer"
                >
                  +1м
                </button>
                <button
                  type="button"
                  onClick={() => adjustTimerTime(5 * 60)}
                  className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-bold cursor-pointer"
                >
                  +5м
                </button>
              </div>

              <div className="text-[11px] text-stone-400 flex items-center justify-center gap-2 pt-1">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Громкий звуковой сигнал и вибрация при завершении</span>
              </div>
            </div>

            {/* Гигантские кнопки управления для нажатия мокрыми руками/перчаткой */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleToggleTimer}
                className={`py-5 sm:py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 cursor-pointer shadow-lg transition-transform active:scale-95 ${
                  isTimerRunning
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-stone-950'
                }`}
              >
                {isTimerRunning ? <Pause className="w-7 h-7 sm:w-8 sm:h-8" /> : <Play className="w-7 h-7 sm:w-8 sm:h-8" />}
                <span>{isTimerRunning ? 'ПАУЗА' : 'СТАРТ'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleResetTimer(60 * 60)}
                className="py-5 sm:py-6 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white font-black text-xl flex items-center justify-center gap-3 cursor-pointer shadow-lg active:scale-95"
              >
                <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7 text-stone-400" />
                <span>СБРОС</span>
              </button>
            </div>

            {/* Подсказка о Wake Lock и тестировании */}
            <div className="flex flex-wrap items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-800 gap-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Авто-удержание экрана (Wake Lock) включено
              </span>
              <button
                type="button"
                onClick={handleTestNotification}
                className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
              >
                Проверить сигнал 🔊
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно установки звуковых напоминаний об этапах ферментации (Local Notifications) */}
      {remindersModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-2xl w-full p-6 text-stone-900 dark:text-white space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Заголовок */}
            <div className="flex items-start justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
                  <BellRing className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-900 dark:text-white leading-tight">
                    Напоминания этапов брожения 🔔
                  </h3>
                  <p className="text-xs text-stone-500">
                    Звуковые оповещения и пуш-напоминания на телефоне (Local Notifications API)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRemindersModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Статус разрешений */}
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-stone-700 dark:text-stone-300">
                  Статус разрешений в телефоне:
                </span>
                {permissionGranted ? (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                    Разрешено ✅
                  </span>
                ) : (
                  <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
                    Не активировано ⚠️
                  </span>
                )}
              </div>
              {!permissionGranted && (
                <button
                  type="button"
                  onClick={handleRequestPermissions}
                  disabled={isRequestingPermission}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>{isRequestingPermission ? 'Запрос...' : 'Разрешить в телефоне 📲'}</span>
                </button>
              )}
            </div>

            {/* Форма добавления нового напоминания */}
            <form onSubmit={handleScheduleStageReminder} className="space-y-4">
              <div className="space-y-3">
                {/* Выбор варки */}
                <div>
                  <label className="block text-stone-500 dark:text-stone-400 text-xs font-semibold mb-1">
                    Партия / Варка из журнала:
                  </label>
                  <select
                    value={selectedLogForReminder?.id || ''}
                    onChange={(e) => {
                      const found = logs.find(l => l.id === e.target.value) || null;
                      setSelectedLogForReminder(found);
                      if (found) {
                        handleStagePresetChange(reminderStageType);
                      }
                    }}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    {logs.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.batchNumber} — «{l.recipeName}» (варка от {new Date(l.brewDate).toLocaleDateString('ru-RU')})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Быстрые шаблоны этапов */}
                <div>
                  <label className="block text-stone-500 dark:text-stone-400 text-xs font-semibold mb-1.5">
                    Шаблоны этапов ферментации:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'dry_hop', label: 'Сухое охмеление (+5 дн)' },
                      { id: 'diacetyl', label: 'Диацетил (+8 дн)' },
                      { id: 'bottling', label: 'Розлив и праймер (+14 дн)' },
                      { id: 'conditioning', label: 'Карбонизация (+28 дн)' },
                      { id: 'ready', label: 'Готово к пробе (+40 дн)' },
                      { id: 'custom', label: 'Свой этап' }
                    ].map(st => (
                      <button
                        type="button"
                        key={st.id}
                        onClick={() => handleStagePresetChange(st.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          reminderStageType === st.id
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Название этапа */}
                <div>
                  <label className="block text-stone-500 dark:text-stone-400 text-xs font-semibold mb-1">
                    Название этапа:
                  </label>
                  <input
                    type="text"
                    value={reminderStageName}
                    onChange={(e) => setReminderStageName(e.target.value)}
                    required
                    placeholder="напр. Сухое охмеление Citra + Mosaic"
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>

                {/* Дата и время */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-500 dark:text-stone-400 text-xs font-semibold mb-1">
                      Дата напоминания:
                    </label>
                    <input
                      type="date"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      required
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-500 dark:text-stone-400 text-xs font-semibold mb-1">
                      Время будильника:
                    </label>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      required
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-bold font-mono"
                    />
                  </div>
                </div>

                {/* Заметка / инструкция */}
                <div>
                  <label className="block text-stone-500 dark:text-stone-400 text-xs font-semibold mb-1">
                    Инструкция пивовару:
                  </label>
                  <input
                    type="text"
                    value={reminderNotes}
                    onChange={(e) => setReminderNotes(e.target.value)}
                    placeholder="напр. Засыпать 50г хмеля Citra в мешочке без доступа кислорода"
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRemindersModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold cursor-pointer"
                >
                  Закрыть
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-amber-500/20 cursor-pointer"
                >
                  <BellRing className="w-4 h-4" />
                  <span>Установить звуковое напоминание ⏰</span>
                </button>
              </div>
            </form>

            {/* Список всех запланированных напоминаний */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-stone-500 dark:text-stone-400 tracking-wider">
                  Запланированные будильники брожения ({storedReminders.length})
                </h4>
                <button
                  type="button"
                  onClick={() => playBrewTimerChime('alarm')}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  title="Воспроизвести образец сигнала зуммера"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Проверить звук зуммера 🔊</span>
                </button>
              </div>

              {storedReminders.length === 0 ? (
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 text-center text-xs text-stone-400 border border-dashed border-stone-200 dark:border-stone-700">
                  Пока нет запланированных напоминаний. Выберите этап выше и нажмите «Установить».
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {storedReminders.map(rem => {
                    const trig = new Date(rem.triggerDate);
                    return (
                      <div
                        key={rem.id}
                        className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/60 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-stone-900 dark:text-white">
                              {rem.stageName || rem.title}
                            </span>
                            {rem.batchNumber && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                {rem.batchNumber}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-500 dark:text-stone-400">
                            {rem.body}
                          </div>
                          <div className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 pt-0.5">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {trig.toLocaleDateString('ru-RU')} в {trig.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => playBrewTimerChime('alarm')}
                            className="p-1.5 text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg cursor-pointer"
                            title="Тест звукового оповещения"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelReminder(rem.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg cursor-pointer"
                            title="Отменить напоминание"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
