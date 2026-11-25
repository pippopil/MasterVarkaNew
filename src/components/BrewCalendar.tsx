import React, { useState, useEffect } from 'react';
import { FermentationBatch, Recipe } from '../types/brewing';
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  Beer,
  Trash2,
  ChevronRight,
  Sparkles,
  Bell,
  BellRing,
  BellOff,
  Info,
  FileText,
  Volume2
} from 'lucide-react';
import {
  checkNotificationPermissionStatus,
  requestDeviceNotificationPermissions,
  scheduleBatchAllStages,
  cancelBatchReminders,
  getStoredScheduledReminders,
  cancelScheduledReminder,
  scheduleFermentationStageReminder,
  playBrewTimerChime,
  ScheduledReminderInfo
} from '../utils/audioAndNotifications';

interface Props {
  batches: FermentationBatch[];
  recipes: Recipe[];
  onUpdateBatches: (batches: FermentationBatch[]) => void;
  onOpenRecipe: (recipe: Recipe) => void;
  onOpenPdfReport?: (batch: FermentationBatch) => void;
}

export const BrewCalendar: React.FC<Props> = ({
  batches,
  recipes,
  onUpdateBatches,
  onOpenRecipe,
  onOpenPdfReport
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?.id || '');
  const [batchNumber, setBatchNumber] = useState(`Batch #${batches.length + 1}`);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [showTimelineGuide, setShowTimelineGuide] = useState(false);
  const [enableStageReminders, setEnableStageReminders] = useState(true);
  const [scheduledReminders, setScheduledReminders] = useState<ScheduledReminderInfo[]>(() =>
    getStoredScheduledReminders()
  );

  // Настройка уведомлений об этапах варки
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('mastervarka_notifications_enabled') === 'true') {
      return true;
    }
    return false;
  });
  const [notificationFeedback, setNotificationFeedback] = useState<{
    text: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);

  useEffect(() => {
    checkNotificationPermissionStatus().then(status => {
      if (status.granted) {
        setNotificationsEnabled(true);
      }
    });
    setScheduledReminders(getStoredScheduledReminders());
  }, []);

  const requestNotifications = async () => {
    try {
      const res = await requestDeviceNotificationPermissions();
      setNotificationsEnabled(res.success);
      if (res.success) {
        playBrewTimerChime('step');
        setNotificationFeedback({
          text: res.message,
          type: res.isInAppOnly ? 'info' : 'success'
        });
      } else {
        setNotificationFeedback({
          text: res.message,
          type: 'warning'
        });
      }
      setTimeout(() => {
        setNotificationFeedback(null);
      }, 7000);
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
    }
  };

  // Создание новой партии с автоматическим расчетом таймлайна выдержки
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const recipe = recipes.find(r => r.id === selectedRecipeId);
    if (!recipe) return;

    const isLager = recipe.yeast.type === 'lager';
    const isWheat = recipe.yeast.type === 'wheat';

    // Формирование этапов
    const stages = [
      {
        id: 'st_1',
        name: 'День варки (Brew Day)',
        description: 'Затирание солода, фильтрация, кипячение с хмелем, охлаждение и аэрация',
        dayOffset: 0,
        durationDays: 1,
        targetTempC: recipe.calculated.strikeTempC,
        isCompleted: true,
        actionRequired: 'Внести регидрированные дрожжи и установить гидрозатвор'
      },
      {
        id: 'st_2',
        name: 'Активное первичное брожение',
        description: 'Интенсивное выделение CO2, образование деки и сбраживание сахаров',
        dayOffset: 1,
        durationDays: isLager ? 12 : 7,
        targetTempC: recipe.yeast.tempRange[0],
        isCompleted: false,
        actionRequired: 'Контролировать стабильную температуру в помещении'
      },
      {
        id: 'st_3',
        name: recipe.hops.some(h => h.use === 'dry_hop') ? 'Сухое охмеление (Dry Hop)' : 'Диацетиловая пауза',
        description: recipe.hops.some(h => h.use === 'dry_hop')
          ? 'Внесение ароматического хмеля без доступа кислорода'
          : 'Повышение температуры на 2°C для расщепления дрожжами диацетила',
        dayOffset: isLager ? 13 : 8,
        durationDays: 3,
        targetTempC: recipe.yeast.tempRange[1],
        isCompleted: false,
        actionRequired: 'Проверить плотность ареометром/рефрактометром'
      },
      {
        id: 'st_4',
        name: 'Розлив и внесение праймера',
        description: `Слив с осадка, добавление ${recipe.calculated.dextroseGrams}г декстрозы, укупорка бутылок`,
        dayOffset: isLager ? 16 : 11,
        durationDays: 1,
        targetTempC: recipe.beerTempAtBottlingC,
        isCompleted: false,
        actionRequired: 'Тщательная дезинфекция бутылок и кроненпробок'
      },
      {
        id: 'st_5',
        name: 'Карбонизация в бутылках',
        description: 'Насыщение углекислотой при комнатной температуре',
        dayOffset: isLager ? 17 : 12,
        durationDays: 14,
        targetTempC: 21,
        isCompleted: false,
        actionRequired: 'Держать бутылки в темноте при 20-22°C'
      },
      {
        id: 'st_6',
        name: isLager ? 'Лагеризация в холоде' : 'Созревание (Conditioning)',
        description: 'Осаждение дрожжей, скругление вкуса и формирование пены',
        dayOffset: isLager ? 31 : 26,
        durationDays: isLager ? 28 : (isWheat ? 7 : 14),
        targetTempC: isLager ? 2 : 5,
        isCompleted: false,
        actionRequired: 'Перенести в погреб или холодильник (2-5°C)'
      },
      {
        id: 'st_7',
        name: 'Пик вкуса / Готово к дегустации!',
        description: 'Пиво полностью раскрыло букет, прозрачность и пенную шапку',
        dayOffset: isLager ? 59 : 40,
        durationDays: 0,
        targetTempC: 8,
        isCompleted: false,
        actionRequired: 'Охладить бокал и наслаждаться авторским крафтом!'
      }
    ];

    const newBatch: FermentationBatch = {
      id: `batch_${Date.now()}`,
      recipeId: recipe.id,
      recipeName: recipe.name,
      batchNumber,
      startDate,
      stages,
      notes: `Сварено по рецепту «${recipe.name}» (${recipe.style}). Расчетный ABV: ${recipe.calculated.abv}%.`,
      isFinished: false
    };

    onUpdateBatches([newBatch, ...batches]);
    setModalOpen(false);

    // Если включены звуковые напоминания об этапах
    if (enableStageReminders) {
      const perm = await checkNotificationPermissionStatus();
      if (!perm.granted) {
        await requestDeviceNotificationPermissions();
      }
      await scheduleBatchAllStages(newBatch);
      setScheduledReminders(getStoredScheduledReminders());
      playBrewTimerChime('step');
    }
  };

  const toggleStage = (batchId: string, stageId: string) => {
    onUpdateBatches(
      batches.map(b => {
        if (b.id !== batchId) return b;
        const updatedStages = b.stages.map(s =>
          s.id === stageId ? { ...s, isCompleted: !s.isCompleted } : s
        );
        const allCompleted = updatedStages.every(s => s.isCompleted);
        return { ...b, stages: updatedStages, isFinished: allCompleted };
      })
    );
  };

  const deleteBatch = async (batchId: string) => {
    await cancelBatchReminders(batchId);
    setScheduledReminders(getStoredScheduledReminders());
    onUpdateBatches(batches.filter(b => b.id !== batchId));
  };

  // Расчет текущего дня варки от даты старта
  const getDaysSinceStart = (startDateStr: string) => {
    const start = new Date(startDateStr).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  // Поиск этапов, наступивших сегодня или требующих действия
  const dueStagesToday: { batch: FermentationBatch; stage: FermentationBatch['stages'][0]; day: number }[] = [];
  batches.forEach(b => {
    if (b.isFinished) return;
    const days = getDaysSinceStart(b.startDate);
    b.stages.forEach(s => {
      const stageEnd = s.dayOffset + (s.durationDays > 0 ? s.durationDays : 1);
      if (days >= s.dayOffset && days <= stageEnd && !s.isCompleted) {
        dueStagesToday.push({ batch: b, stage: s, day: days });
      }
    });
  });

  // Автоматическая отправка Web Notification при наступлении этапа
  useEffect(() => {
    if (!notificationsEnabled || dueStagesToday.length === 0) return;
    const sessionKey = `masterbrew_notified_${new Date().toISOString().split('T')[0]}`;
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(sessionKey)) return;

    try {
      const first = dueStagesToday[0];
      new Notification(`МастерВарка: этап «${first.stage.name}»! 🍺`, {
        body: `Партия ${first.batch.batchNumber} (${first.batch.recipeName}): ${first.stage.actionRequired}`,
        icon: '/icon-192.png'
      });
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(sessionKey, 'true');
      }
    } catch (e) {
      console.warn('Notification trigger error:', e);
    }
  }, [notificationsEnabled, dueStagesToday.length]);

  return (
    <div className="space-y-6 pb-12">
      {/* Шапка календаря */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200/80 dark:border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-amber-500" />
              <span>Календарь брожения & Сроки выдержки партий</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Автоматический трекер этапов: главное брожение, сухое охмеление, розлив с декстрозой, созревание и лагеризация
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {batches.length > 0 && onOpenPdfReport && (
              <button
                type="button"
                onClick={() => onOpenPdfReport(batches[0])}
                className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all border border-amber-200 dark:border-amber-800/60 cursor-pointer"
                title="Сформировать и скачать PDF-отчет варки"
              >
                <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>PDF-отчет варки</span>
              </button>
            )}

            <button
              type="button"
              onClick={requestNotifications}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                notificationsEnabled
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
              }`}
              title={notificationsEnabled ? 'Уведомления включены' : 'Включить уведомления об этапах'}
            >
              {notificationsEnabled ? (
                <>
                  <BellRing className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  <span>Уведомления ВКЛ</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 text-stone-500" />
                  <span>Включить уведомления</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowTimelineGuide(!showTimelineGuide)}
              className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-amber-500" />
              <span>Почему 40 дней?</span>
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Начать партию</span>
            </button>
          </div>
        </div>

        {/* Уведомление о статусе напоминаний и звуковых сигналов */}
        {notificationFeedback && (
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold animate-in fade-in duration-150 ${
              notificationFeedback.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border-emerald-500/30'
                : notificationFeedback.type === 'warning'
                ? 'bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/40'
                : 'bg-blue-500/10 text-blue-800 dark:text-blue-200 border-blue-500/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🔔</span>
              <span>{notificationFeedback.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotificationFeedback(null)}
              className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Справка: почему этапы варки разбиты на 40 дней */}
        {showTimelineGuide && (
          <div className="p-4 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 text-xs text-stone-700 dark:text-stone-300 space-y-2 animate-in fade-in">
            <div className="font-black text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Почему этапы домашнего крафтового пива рассчитаны на 40 дней?</span>
            </div>
            <p className="leading-relaxed">
              Настоящее непастеризованное крафтовое пиво без искусственной газации формирует свой букет и прозрачность в строгой биохимической последовательности:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 font-sans">
              <div className="p-2.5 rounded-lg bg-white/70 dark:bg-stone-900/70 border border-amber-500/20">
                <div className="font-bold text-amber-600 dark:text-amber-400">1. Дни 0–7 (Брожение)</div>
                <div className="text-[11px] text-stone-500 mt-0.5">Дрожжи съедают простые сахара, производят спирт и CO2. Формируется пена и эфиры.</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white/70 dark:bg-stone-900/70 border border-amber-500/20">
                <div className="font-bold text-amber-600 dark:text-amber-400">2. Дни 8–10 (Пауза/Охмеление)</div>
                <div className="text-[11px] text-stone-500 mt-0.5">Диацетиловая пауза убирает маслянистый привкус. Сухое охмеление отдает свежие эфирные масла.</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white/70 dark:bg-stone-900/70 border border-amber-500/20">
                <div className="font-bold text-amber-600 dark:text-amber-400">3. Дни 11–25 (Карбонизация 14 дней)</div>
                <div className="text-[11px] text-stone-500 mt-0.5">В бутылках при 20–22°C дрожжи перерабатывают декстрозу, создавая стойкий природный газ и мелкопористую пену.</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white/70 dark:bg-stone-900/70 border border-amber-500/20">
                <div className="font-bold text-amber-600 dark:text-amber-400">4. Дни 26–40 (Созревание 14 дней)</div>
                <div className="text-[11px] text-stone-500 mt-0.5">Холодная выдержка (2–6°C) осветляет пиво: дрожжи оседают плотным слоем, горечь становится бархатной.</div>
              </div>
            </div>
          </div>
        )}

        {/* Наступившие сегодня этапы (Уведомление в интерфейсе) */}
        {dueStagesToday.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-500/15 dark:bg-amber-950/40 border-2 border-amber-500/50 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-950 dark:text-amber-200">
              <span className="flex items-center gap-1.5">
                <BellRing className="w-4 h-4 text-amber-600 animate-bounce" />
                <span>Наступившие этапы, требующие внимания ({dueStagesToday.length}):</span>
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400">Сегодня</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dueStagesToday.map(({ batch, stage, day }) => (
                <div
                  key={`${batch.id}_${stage.id}`}
                  className="p-2.5 rounded-lg bg-white dark:bg-stone-850 border border-amber-500/30 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-black text-stone-900 dark:text-white truncate">
                      {batch.batchNumber} • {stage.name}
                    </div>
                    <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium truncate">
                      {stage.actionRequired}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleStage(batch.id, stage.id)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 text-[11px] font-black shrink-0 cursor-pointer shadow-2xs"
                  >
                    Выполнено ✓
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Список отслеживаемых партий */}
      {batches.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-12 text-center border border-dashed border-stone-300 dark:border-stone-800 space-y-3">
          <Beer className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="font-bold text-base text-stone-800 dark:text-stone-200">
            Нет активных варок в календаре
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Выберите рецепт из базы и запустите новую партию. Календарь автоматически рассчитает дни сухого охмеления, розлива и готовности к дегустации!
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Запустить партию</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {batches.map(batch => {
            const daysSinceStart = getDaysSinceStart(batch.startDate);
            const recipe = recipes.find(r => r.id === batch.recipeId);

            return (
              <div
                key={batch.id}
                className="bg-white dark:bg-stone-900 rounded-2xl p-5 sm:p-6 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-5 min-w-0 max-w-full overflow-hidden"
              >
                {/* Шапка партии */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4 min-w-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-black text-sm shrink-0">
                      {batch.batchNumber}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-black text-lg text-stone-900 dark:text-white flex items-center gap-2 flex-wrap break-words">
                        <span className="break-words">{batch.recipeName}</span>
                        {batch.isFinished && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold shrink-0">
                            Готово к дегустации!
                          </span>
                        )}
                      </h3>
                      <div className="text-xs text-stone-500 flex items-center gap-3 mt-0.5">
                        <span>Дата варки: <b>{new Date(batch.startDate).toLocaleDateString('ru-RU')}</b></span>
                        <span>•</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          Идет <b>{daysSinceStart}-й день</b>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {onOpenPdfReport && (
                      <button
                        onClick={() => onOpenPdfReport(batch)}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Сформировать и скачать PDF-отчет варки"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>PDF-отчет</span>
                      </button>
                    )}
                    {recipe && (
                      <button
                        onClick={() => onOpenRecipe(recipe)}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold cursor-pointer"
                      >
                        Рецепт
                      </button>
                    )}
                    <button
                      onClick={() => deleteBatch(batch.id)}
                      className="p-1.5 rounded-xl text-stone-400 hover:text-red-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                      title="Удалить партию"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Интерактивный таймлайн этапов */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    График созревания и контрольные точки:
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {batch.stages.map((stage, idx) => {
                      const isCurrent =
                        daysSinceStart >= stage.dayOffset &&
                        (idx === batch.stages.length - 1 || daysSinceStart < batch.stages[idx + 1].dayOffset);
                      const hasReminder = scheduledReminders.some(
                        r => r.batchId === batch.id && r.stageId === stage.id
                      );

                      return (
                        <div
                          key={stage.id}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                            stage.isCompleted
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80'
                              : isCurrent
                              ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-400 dark:border-amber-700 shadow-xs'
                              : 'bg-stone-50 dark:bg-stone-800/50 border-stone-200/80 dark:border-stone-700/60'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                  isCurrent
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                                }`}>
                                  День {stage.dayOffset}
                                </span>
                                {hasReminder && !stage.isCompleted && (
                                  <span
                                    className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-800/70"
                                    title="Звуковое напоминание (Local Notification) запланировано"
                                  >
                                    <Bell className="w-2.5 h-2.5" />
                                    <span>Будильник 09:00</span>
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() => toggleStage(batch.id, stage.id)}
                                className={`text-xs p-1 rounded-md transition-colors ${
                                  stage.isCompleted
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-stone-300 hover:text-emerald-500'
                                }`}
                                title={stage.isCompleted ? 'Отметить как не завершено' : 'Отметить этап выполненным'}
                              >
                                <CheckCircle2 className={`w-5 h-5 ${stage.isCompleted ? 'fill-emerald-100 dark:fill-emerald-950' : ''}`} />
                              </button>
                            </div>

                            <div className="font-bold text-xs text-stone-900 dark:text-white mt-2 leading-tight">
                              {stage.name}
                            </div>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                              {stage.description}
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-stone-200/60 dark:border-stone-700/50 flex justify-between items-center text-[10px]">
                            <span className="font-mono text-stone-600 dark:text-stone-300 flex items-center gap-1">
                              <Thermometer className="w-3 h-3 text-red-500" />
                              {stage.targetTempC}°C
                            </span>
                            <span className="text-amber-700 dark:text-amber-400 font-semibold line-clamp-1">
                              {stage.actionRequired}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Модальное окно создания партии */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateBatch}
            className="bg-white dark:bg-stone-900 rounded-2xl p-6 max-w-md w-full shadow-xl border border-stone-200 dark:border-stone-800 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <span>Запуск новой партии в календарь</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-500 block mb-1 font-semibold">Выберите рецепт из базы:</label>
                <select
                  value={selectedRecipeId}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 font-bold"
                >
                  {recipes.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.style}) — {r.calculated.abv}% ABV
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-stone-500 block mb-1 font-semibold">Номер или название партии:</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 font-bold"
                  placeholder="напр. Партия #12 (Citra IPA)"
                />
              </div>

              <div>
                <label className="text-stone-500 block mb-1 font-semibold">Дата варки (Brew Day):</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 font-mono font-bold"
                />
              </div>

              {/* Опция установки звуковых напоминаний на телефон */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableStageReminders}
                    onChange={(e) => setEnableStageReminders(e.target.checked)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <BellRing className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      Включить звуковые напоминания этапов (Local Notifications)
                    </span>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
                      Запланирует точные будильники и напоминания на 09:00 утра для каждого этапа: сухое охмеление, диацетиловая пауза, розлив с декстрозой и готовность пива.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm"
              >
                Создать график выдержки
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
