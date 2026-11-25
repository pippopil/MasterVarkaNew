/**
 * @license
 * Copyright (c) 2026 MasterVarka. All rights reserved.
 * Proprietary and closed-source software.
 */

import React, { useState, useEffect, useCallback, useRef, startTransition, Suspense, lazy } from 'react';
import {
  ActiveTab,
  Navbar
} from './components/Navbar';
import { PrintableBrewSheet } from './components/PrintableBrewSheet';
import { PrintableBrewSheetModal } from './components/PrintableBrewSheetModal';
import { CompletedBrewPdfReportModal } from './components/CompletedBrewPdfReportModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { NewRecipeModal } from './components/NewRecipeModal';
import { BrewingHistoryModal } from './components/BrewingHistoryModal';
import { AppUpdateModal } from './components/AppUpdateModal';
import { BetaTestingEulaModal } from './components/BetaTestingEulaModal';
import { BetaFeedbackModal } from './components/BetaFeedbackModal';
import { OnboardingTour, ONBOARDING_STORAGE_KEY } from './components/OnboardingTour';
import { fetchLatestReleaseInfo, AppReleaseInfo } from './services/appUpdateService';
import { Sparkles, Download, X, Bell, BellRing, Smartphone, AlertTriangle } from 'lucide-react';
import {
  isFirstLaunchPermissionPromptNeeded,
  markFirstLaunchPermissionPrompted,
  checkNotificationPermissionStatus,
  requestDeviceNotificationPermissions,
  playBrewTimerChime
} from './utils/audioAndNotifications';

import {
  BrewLog,
  CommunityPost,
  FermentationBatch,
  InventoryItem,
  Lifehack,
  Recipe
} from './types/brewing';
import {
  INITIAL_INVENTORY,
  INITIAL_LIFEHACKS,
  INITIAL_POSTS,
  INITIAL_RECIPES
} from './data/defaultData';
import { calculateBrewMetrics, scaleRecipeIngredients } from './utils/brewingMath';
import {
  initDatabaseAndMigrate,
  saveRecipeToDb,
  deleteRecipeFromDb,
  syncAllRecipesToDb,
  syncAllLogsToDb,
  syncAllInventoryToDb,
  syncAllBatchesToDb,
  syncAllLifehacksToDb,
  syncAllPostsToDb,
  DEFAULT_INITIAL_LOG
} from './db/brewDb';

// Асинхронная загрузка тяжелых разделов (Code Splitting / Lazy Loading для снижения размера начального бандла)
const RecipeBuilder = lazy(() =>
  import('./components/RecipeBuilder').then(m => ({ default: m.RecipeBuilder }))
);
const IngredientMatcher = lazy(() =>
  import('./components/IngredientMatcher').then(m => ({ default: m.IngredientMatcher }))
);
const RecipeCatalogue = lazy(() =>
  import('./components/RecipeCatalogue').then(m => ({ default: m.RecipeCatalogue }))
);
const AiStudioLabelGenerator = lazy(() =>
  import('./components/AiStudioLabelGenerator').then(m => ({ default: m.AiStudioLabelGenerator }))
);
const BrewCalendar = lazy(() =>
  import('./components/BrewCalendar').then(m => ({ default: m.BrewCalendar }))
);
const BrewLogJournal = lazy(() =>
  import('./components/BrewLogJournal').then(m => ({ default: m.BrewLogJournal }))
);
const LifehacksGuide = lazy(() =>
  import('./components/LifehacksGuide').then(m => ({ default: m.LifehacksGuide }))
);
const CommunityFeed = lazy(() =>
  import('./components/CommunityFeed').then(m => ({ default: m.CommunityFeed }))
);
const UniholicBreweryController = lazy(() =>
  import('./components/UniholicBreweryController').then(m => ({ default: m.UniholicBreweryController }))
);

// Скелетон быстрой первичной загрузки вкладки
function TabSkeleton() {
  return (
    <div className="w-full space-y-4 animate-pulse p-4 sm:p-6 bg-white/40 dark:bg-stone-900/40 rounded-3xl border border-stone-200/40 dark:border-stone-800/40">
      <div className="h-9 bg-stone-200 dark:bg-stone-800 rounded-2xl w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="h-28 bg-stone-200/80 dark:bg-stone-800/80 rounded-2xl" />
        <div className="h-28 bg-stone-200/80 dark:bg-stone-800/80 rounded-2xl" />
        <div className="h-28 bg-stone-200/80 dark:bg-stone-800/80 rounded-2xl hidden lg:block" />
      </div>
      <div className="h-72 bg-stone-200/60 dark:bg-stone-800/60 rounded-3xl" />
    </div>
  );
}

interface TabKeepAliveProps {
  tabId: ActiveTab;
  activeTab: ActiveTab;
  isVisited: boolean;
  children: React.ReactNode;
}

const TabKeepAlive = React.memo<TabKeepAliveProps>(
  ({ tabId, activeTab, isVisited, children }) => {
    if (!isVisited && activeTab !== tabId) return null;
    const isActive = activeTab === tabId;
    return (
      <div
        className={isActive ? 'block' : 'hidden'}
        style={{ display: isActive ? 'block' : 'none' }}
        aria-hidden={!isActive}
      >
        <Suspense fallback={<TabSkeleton />}>
          {children}
        </Suspense>
      </div>
    );
  },
  (prev, next) => {
    const wasActive = prev.activeTab === prev.tabId;
    const isNowActive = next.activeTab === next.tabId;
    // Если вкладка была неактивна и осталась неактивной, полностью пропускаем ререндер
    if (!wasActive && !isNowActive && prev.isVisited === next.isVisited) {
      return true;
    }
    return (
      prev.activeTab === next.activeTab &&
      prev.isVisited === next.isVisited &&
      prev.children === next.children
    );
  }
);

export class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('MasterVarka Uncaught Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-white">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl font-bold">
              🍺
            </div>
            <h2 className="text-xl font-black">Сбой отображения раздела</h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              Приложение изолировало локальную ошибку. Ваши рецепты, запасы и журнал сохранены в автономной базе данных.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md cursor-pointer transition-transform active:scale-95"
            >
              Перезагрузить раздел
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

class UniholicErrorBoundary extends React.Component<
  { onReset: () => void; children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: any) {
    console.warn('Uniholic Controller error caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center space-y-4 shadow-xl max-w-lg mx-auto my-8">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl font-bold">
            ⚡
          </div>
          <h3 className="text-lg font-black text-stone-900 dark:text-white">
            Автоматика пивоварни
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Произошел сброс состояния контроллера. Нажмите кнопку ниже для повторной инициализации панели варки.
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false });
              this.props.onReset();
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Перезапустить панель
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  // Тема (светлая / тёмная)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('masterbrew_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('masterbrew_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('masterbrew_theme', 'light');
    }
  }, [isDarkMode]);

  // Офлайн статус
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Активная вкладка и Keep-Alive кэш посещенных разделов для мгновенного переключения (0 ms)
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');
  const [visitedTabs, setVisitedTabs] = useState<Set<ActiveTab>>(() => new Set(['calculator']));
  const [swipeHint, setSwipeHint] = useState<{ text: string; direction: 'left' | 'right' } | null>(null);

  // Всегда добавляем текущую активную вкладку в visitedTabs, чтобы исключить пустой/черный экран
  useEffect(() => {
    setVisitedTabs(prev => {
      if (prev.has(activeTab)) return prev;
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  // Полный порядок разделов для свайп-навигации по экрану (соответствует порядку нижней панели мобильного)
  const SWIPE_TAB_ORDER: { id: ActiveTab; label: string }[] = React.useMemo(() => [
    { id: 'calculator', label: 'Варка' },
    { id: 'catalogue', label: 'Рецепты' },
    { id: 'matcher', label: 'Склад' },
    { id: 'calendar', label: 'Брожение' },
    { id: 'uniholic', label: 'Пивоварня ⚡' },
    { id: 'logs', label: 'Журнал варок' },
    { id: 'ai_lab', label: 'ИИ-Этикетки' },
    { id: 'lifehacks', label: 'Лайфхаки' },
    { id: 'community', label: 'Клуб пивоваров' }
  ], []);

  // Префетч остальных разделов в моменты простоя браузера
  useEffect(() => {
    const prefetchOtherTabs = () => {
      import('./components/RecipeCatalogue');
      import('./components/IngredientMatcher');
      import('./components/BrewCalendar');
      import('./components/BrewLogJournal');
      import('./components/UniholicBreweryController');
      import('./components/AiStudioLabelGenerator');
      import('./components/LifehacksGuide');
      import('./components/CommunityFeed');
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(prefetchOtherTabs, { timeout: 2000 });
      } else {
        setTimeout(prefetchOtherTabs, 1200);
      }
    }
  }, []);

  // Переключение вкладки с мгновенным откликом интерфейса (React startTransition + Keep-Alive)
  const handleTabChange = useCallback((tab: ActiveTab) => {
    startTransition(() => {
      setActiveTab(tab);
    });
    setVisitedTabs(prev => {
      if (prev.has(tab)) return prev;
      const next = new Set(prev);
      next.add(tab);
      return next;
    });
    // Мгновенный скролл наверх без блокировки потока
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Быстрый и плавный свайп по всему экрану между разделами приложения
  const activeTabRef = useRef<ActiveTab>(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let isTracking = false;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        isTracking = false;
        return;
      }
      const target = e.target as HTMLElement | null;
      // Игнорируем слайдеры, карты, текстовые поля, модальные окна, таблицы и горизонтальные скроллеры
      if (
        target &&
        (target.closest('input[type="range"]') ||
         target.closest('.no-swipe') ||
         target.closest('[data-no-swipe]') ||
         target.closest('textarea') ||
         target.closest('input') ||
         target.closest('table') ||
         target.closest('.overflow-x-auto') ||
         target.closest('.swipe-scroll-x') ||
         target.closest('[role="dialog"]') ||
         target.closest('.modal-content'))
      ) {
        isTracking = false;
        return;
      }
      // Не свайпаем, если открыто модальное окно
      if (document.querySelector('[role="dialog"]')) {
        isTracking = false;
        return;
      }

      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
      isTracking = true;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!isTracking || e.changedTouches.length !== 1) {
        isTracking = false;
        return;
      }
      isTracking = false;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      const dt = Date.now() - startTime;

      // Свайп: четкий горизонтальный жест (до 500мс, от 65px, горизонталь превышает вертикаль в 1.8 раза)
      if (dt <= 500 && Math.abs(dx) >= 65 && Math.abs(dx) > Math.abs(dy) * 1.8) {
        const curTab = activeTabRef.current;
        const currentIndex = SWIPE_TAB_ORDER.findIndex(item => item.id === curTab);
        if (currentIndex === -1) return;

        if (dx < -65 && currentIndex < SWIPE_TAB_ORDER.length - 1) {
          // Свайп влево: переход к следующему разделу
          const next = SWIPE_TAB_ORDER[currentIndex + 1];
          handleTabChange(next.id);
          setSwipeHint({ text: next.label, direction: 'left' });
          setTimeout(() => setSwipeHint(null), 1000);
        } else if (dx > 65 && currentIndex > 0) {
          // Свайп вправо: переход к предыдущему разделу
          const prev = SWIPE_TAB_ORDER[currentIndex - 1];
          handleTabChange(prev.id);
          setSwipeHint({ text: prev.label, direction: 'right' });
          setTimeout(() => setSwipeHint(null), 1000);
        }
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleTabChange, SWIPE_TAB_ORDER]);


  // Рецепты (хранение в IndexedDB через Dexie.js для надежной работы офлайн)
  const [recipes, setRecipes] = useState<Recipe[]>(() => INITIAL_RECIPES);
  const [isDbReady, setIsDbReady] = useState(false);

  // Текущий редактируемый рецепт
  const [currentRecipe, setCurrentRecipe] = useState<Recipe>(() => {
    return INITIAL_RECIPES[0];
  });

  // Кладовая (Запасы)
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('masterbrew_inventory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_INVENTORY;
  });

  // Партии в календаре
  const [batches, setBatches] = useState<FermentationBatch[]>(() => {
    const saved = localStorage.getItem('masterbrew_batches');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Пример начальной активной партии
    const initRecipe = INITIAL_RECIPES[0];
    return [
      {
        id: 'batch_demo_1',
        recipeId: initRecipe.id,
        recipeName: initRecipe.name,
        batchNumber: 'Варка #1',
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        stages: [
          {
            id: 'st_1',
            name: 'День варки (Brew Day)',
            description: 'Затирание, охмеление, охлаждение',
            dayOffset: 0,
            durationDays: 1,
            targetTempC: 67,
            isCompleted: true,
            actionRequired: 'Внесены дрожжи US-05'
          },
          {
            id: 'st_2',
            name: 'Главное брожение',
            description: 'Интенсивное брожение при 19°C',
            dayOffset: 1,
            durationDays: 7,
            targetTempC: 19,
            isCompleted: true,
            actionRequired: 'Температура 19-20°C выдержана'
          },
          {
            id: 'st_3',
            name: 'Сухое охмеление (Dry Hopping)',
            description: 'Внесение 50г Mosaic без доступа воздуха',
            dayOffset: 8,
            durationDays: 3,
            targetTempC: 18,
            isCompleted: true,
            actionRequired: 'Хмель внесен в мешочке'
          },
          {
            id: 'st_4',
            name: 'Розлив и внесение декстрозы',
            description: 'Розлив по бутылкам + 140г декстрозы',
            dayOffset: 11,
            durationDays: 1,
            targetTempC: 20,
            isCompleted: false,
            actionRequired: 'Продезинфицировать 40 бутылок'
          },
          {
            id: 'st_5',
            name: 'Карбонизация в тепле',
            description: '14 дней в темноте при 21°C',
            dayOffset: 12,
            durationDays: 14,
            targetTempC: 21,
            isCompleted: false,
            actionRequired: 'Контроль надутости контрольной ПЭТ бутылки'
          },
          {
            id: 'st_6',
            name: 'Холодное созревание',
            description: 'Выдержка в холодильнике при 4°C',
            dayOffset: 26,
            durationDays: 14,
            targetTempC: 4,
            isCompleted: false,
            actionRequired: 'Охлаждение'
          },
          {
            id: 'st_7',
            name: 'Готово к дегустации!',
            description: 'Пиво созрело и осветлилось',
            dayOffset: 40,
            durationDays: 0,
            targetTempC: 8,
            isCompleted: false,
            actionRequired: 'Дегустация'
          }
        ],
        notes: 'Отличный аромат хмеля Citra на вирпуле!',
        isFinished: false
      }
    ];
  });

  // Журнал варок (хранение в IndexedDB через Dexie.js для надежного офлайн-режима)
  const [logs, setLogs] = useState<BrewLog[]>(() => [DEFAULT_INITIAL_LOG]);

  // Лайфхаки
  const [lifehacks, setLifehacks] = useState<Lifehack[]>(() => {
    const saved = localStorage.getItem('masterbrew_lifehacks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_LIFEHACKS;
  });

  // Посты сообщества
  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem('masterbrew_posts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_POSTS;
  });

  // Облачный код синхронизации (уникальный для каждого пользователя для предотвращения коллизий)
  const [syncCode, setSyncCode] = useState<string>(() => {
    const saved = localStorage.getItem('masterbrew_sync_code');
    if (saved && saved !== 'BREW-94X') return saved;
    const unique = 'BREW-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    localStorage.setItem('masterbrew_sync_code', unique);
    return unique;
  });
  useEffect(() => {
    localStorage.setItem('masterbrew_sync_code', syncCode);
  }, [syncCode]);

  const [globalBatchSizeL, setGlobalBatchSizeL] = useState<number>(() => {
    const saved = localStorage.getItem('masterbrew_batch_size');
    return saved ? parseFloat(saved) || 30 : 30;
  });
  useEffect(() => {
    localStorage.setItem('masterbrew_batch_size', String(globalBatchSizeL));
  }, [globalBatchSizeL]);

  // Изменение глобального объема с автоматическим масштабированием ингредиентов активного рецепта
  const handleSetGlobalBatchSizeL = (newSize: number) => {
    const validSize = Math.max(1, newSize);
    setGlobalBatchSizeL(validSize);
    if (currentRecipe && currentRecipe.batchSizeL !== validSize && validSize > 0) {
      const baseL = Math.max(1, currentRecipe.batchSizeL);
      const ratio = validSize / baseL;
      const { scaledGrains, scaledHops } = scaleRecipeIngredients(
        currentRecipe.grains,
        currentRecipe.hops,
        baseL,
        validSize
      );
      const scaledOther = (currentRecipe.otherIngredients || []).map(item => ({
        ...item,
        amount: Number((item.amount * ratio).toFixed(item.unit === 'kg' ? 2 : 1))
      }));
      const calculated = calculateBrewMetrics({
        batchSizeL: validSize,
        boilTimeMin: currentRecipe.boilTimeMin,
        efficiencyPercent: currentRecipe.efficiencyPercent,
        grainRatioLPerKg: currentRecipe.grainRatioLPerKg,
        grainTempC: currentRecipe.grainTempC,
        targetCarbonationVol: currentRecipe.targetCarbonationVol,
        beerTempAtBottlingC: currentRecipe.beerTempAtBottlingC,
        grains: scaledGrains,
        hops: scaledHops,
        yeast: currentRecipe.yeast,
        otherIngredients: scaledOther
      });
      setCurrentRecipe(prev => ({
        ...prev,
        batchSizeL: validSize,
        grains: scaledGrains,
        hops: scaledHops,
        otherIngredients: scaledOther,
        calculated,
        updatedAt: new Date().toISOString()
      }));
    }
  };

  // Флаг отключения механизма обновлений на время тестирования на других пользователях
  const ENABLE_IN_APP_UPDATES = false;

  const [cloudModalOpen, setCloudModalOpen] = useState(false);
  const [newRecipeModalOpen, setNewRecipeModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyInitialMomentId, setHistoryInitialMomentId] = useState<string | undefined>(undefined);
  const [appUpdateModalOpen, setAppUpdateModalOpen] = useState(false);
  const [latestReleaseInfo, setLatestReleaseInfo] = useState<AppReleaseInfo | null>(null);
  const [hasAvailableUpdate, setHasAvailableUpdate] = useState(false);
  const [updateBannerDismissed, setUpdateBannerDismissed] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [recipeToPrint, setRecipeToPrint] = useState<Recipe | null>(null);
  const [pdfReportModalOpen, setPdfReportModalOpen] = useState(false);
  const [pdfReportLog, setPdfReportLog] = useState<BrewLog | null>(null);
  const [pdfReportBatch, setPdfReportBatch] = useState<FermentationBatch | null>(null);

  // Бета-тестирование: EULA, форма обратной связи и стартовый онбординг
  const [betaFeedbackModalOpen, setBetaFeedbackModalOpen] = useState(false);
  const [betaEulaModalOpen, setBetaEulaModalOpen] = useState(() => {
    return !localStorage.getItem('mastervarka_beta_eula_accepted');
  });
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(() => {
    return !localStorage.getItem(ONBOARDING_STORAGE_KEY);
  });

  // Диалог первого запуска: запрос разрешений на системные уведомления и доступ к системному времени
  const [firstLaunchPermissionModalOpen, setFirstLaunchPermissionModalOpen] = useState(false);

  useEffect(() => {
    if (isFirstLaunchPermissionPromptNeeded()) {
      checkNotificationPermissionStatus().then(status => {
        if (!status.granted) {
          const timer = setTimeout(() => {
            setFirstLaunchPermissionModalOpen(true);
          }, 900);
          return () => clearTimeout(timer);
        } else {
          markFirstLaunchPermissionPrompted();
        }
      });
    }
  }, []);

  const handleOpenPdfReport = (log?: BrewLog | null, batch?: FermentationBatch | null) => {
    setPdfReportLog(log || null);
    setPdfReportBatch(batch || null);
    setPdfReportModalOpen(true);
  };

  // Автоматическая проверка свежих релизов (отключена на время тестирования)
  useEffect(() => {
    if (!ENABLE_IN_APP_UPDATES) return;
    let isMounted = true;
    const checkUpdates = async () => {
      try {
        const info = await fetchLatestReleaseInfo();
        if (isMounted && info) {
          setLatestReleaseInfo(info);
          if (info.hasUpdate) {
            setHasAvailableUpdate(true);
          }
        }
      } catch (err) {
        console.warn('Update check failed on mount:', err);
      }
    };
    checkUpdates();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenHistory = (momentId?: string) => {
    setHistoryInitialMomentId(momentId);
    setHistoryModalOpen(true);
  };

  // Инициализация базы данных IndexedDB (Dexie.js) и бесшовная миграция из LocalStorage
  // Защищает все данные пользователя (рецепты, склад, партии, журнал) от сброса при обновлении
  useEffect(() => {
    let isMounted = true;
    const initDb = async () => {
      try {
        const {
          recipes: loadedRecipes,
          logs: loadedLogs,
          inventory: loadedInv,
          batches: loadedBatches,
          lifehacks: loadedHacks,
          posts: loadedPosts
        } = await initDatabaseAndMigrate();

        if (isMounted) {
          if (loadedRecipes && loadedRecipes.length > 0) {
            setRecipes(loadedRecipes);
            setCurrentRecipe(prev => loadedRecipes.find(r => r.id === prev.id) || loadedRecipes[0]);
          }
          if (loadedLogs && loadedLogs.length > 0) {
            setLogs(loadedLogs);
          }
          if (loadedInv && loadedInv.length > 0) {
            setInventory(loadedInv);
          }
          if (loadedBatches && loadedBatches.length > 0) {
            setBatches(loadedBatches);
          }
          if (loadedHacks && loadedHacks.length > 0) {
            setLifehacks(loadedHacks);
          }
          if (loadedPosts && loadedPosts.length > 0) {
            setPosts(loadedPosts);
          }
          setIsDbReady(true);
        }
      } catch (err) {
        console.error('[Dexie] Не удалось инициализировать IndexedDB:', err);
        if (isMounted) setIsDbReady(true);
      }
    };
    initDb();
    return () => {
      isMounted = false;
    };
  }, []);

  // Персистентность рецептов и журнала варок в IndexedDB (Dexie.js) с дебаунсом для исключения лагов слайдеров
  useEffect(() => {
    if (!isDbReady) return;
    const timer = setTimeout(() => {
      syncAllRecipesToDb(recipes);
    }, 600);
    return () => clearTimeout(timer);
  }, [recipes, isDbReady]);

  useEffect(() => {
    if (!isDbReady) return;
    const timer = setTimeout(() => {
      syncAllLogsToDb(logs);
    }, 600);
    return () => clearTimeout(timer);
  }, [logs, isDbReady]);

  // Двойная персистентность вспомогательных сущностей (IndexedDB + localStorage)
  // Гарантирует сохранность при очистке кэша и обновлениях приложения на телефоне
  useEffect(() => {
    if (!isDbReady) return;
    const timer = setTimeout(() => {
      syncAllInventoryToDb(inventory);
    }, 600);
    return () => clearTimeout(timer);
  }, [inventory, isDbReady]);

  useEffect(() => {
    if (!isDbReady) return;
    const timer = setTimeout(() => {
      syncAllBatchesToDb(batches);
    }, 600);
    return () => clearTimeout(timer);
  }, [batches, isDbReady]);

  useEffect(() => {
    if (!isDbReady) return;
    const timer = setTimeout(() => {
      syncAllLifehacksToDb(lifehacks);
    }, 600);
    return () => clearTimeout(timer);
  }, [lifehacks, isDbReady]);

  useEffect(() => {
    if (!isDbReady) return;
    const timer = setTimeout(() => {
      syncAllPostsToDb(posts);
    }, 600);
    return () => clearTimeout(timer);
  }, [posts, isDbReady]);

  // Сохранение рецепта в базу авторских (IndexedDB)
  const handleSaveRecipe = (recipeToSave: Recipe) => {
    const customized: Recipe = {
      ...recipeToSave,
      isCustom: true,
      collection: 'my_recipes',
      author: recipeToSave.author && recipeToSave.author !== 'МастерВарка' ? recipeToSave.author : 'Вы',
      updatedAt: new Date().toISOString()
    };
    const exists = recipes.some(r => r.id === customized.id);
    const updatedList = exists
      ? recipes.map(r => (r.id === customized.id ? customized : r))
      : [customized, ...recipes];

    setRecipes(updatedList);
    setCurrentRecipe(customized);
    saveRecipeToDb(customized);
  };

  // Создание нового кастомного рецепта
  const handleCreateNewRecipe = () => {
    const blankRecipe: Recipe = {
      id: `recipe_custom_${Date.now()}`,
      name: 'Новый авторский рецепт',
      style: 'American Pale Ale',
      category: 'Эли / Хмелевые',
      description: 'Авторский крафтовый рецепт с чистой солодовой засыпью и сбалансированным охмелением.',
      author: 'Вы',
      batchSizeL: 30,
      boilTimeMin: 60,
      efficiencyPercent: 72,
      grainRatioLPerKg: 3.5,
      grainTempC: 20,
      targetCarbonationVol: 2.4,
      beerTempAtBottlingC: 19,
      grains: [
        { id: `g_${Date.now()}_1`, name: 'Курский Пэйл Эль (Pale Ale Malt)', weightKg: 6.2, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
        { id: `g_${Date.now()}_2`, name: 'Курский Десертный (Карамельный 20 EBC)', weightKg: 0.5, potentialSg: 1.033, colorEbc: 20.0, type: 'caramel' }
      ],
      hops: [
        { id: `h_${Date.now()}_1`, name: 'Magnum', weightG: 25, alphaAcid: 14.0, boilTimeMin: 60, use: 'boil' },
        { id: `h_${Date.now()}_2`, name: 'Cascade', weightG: 45, alphaAcid: 6.0, boilTimeMin: 15, use: 'boil' }
      ],
      mashSchedule: [
        { id: 'm1', name: 'Белковая пауза (Курский солод)', tempC: 53, timeMin: 15, type: 'protein' },
        { id: 'm2', name: 'Мальтозная пауза', tempC: 65, timeMin: 50, type: 'maltose' },
        { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
      ],
      yeast: {
        name: 'SafAle US-05',
        lab: 'Fermentis',
        form: 'dry',
        type: 'ale',
        cellsPerGramOrVial: 20,
        attenuationPercent: 81,
        tempRange: [18, 26]
      },
      calculated: {} as any,
      tags: ['Авторский', 'Крафт'],
      isCustom: true,
      collection: 'my_recipes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    blankRecipe.calculated = calculateBrewMetrics({
      batchSizeL: blankRecipe.batchSizeL,
      boilTimeMin: blankRecipe.boilTimeMin,
      efficiencyPercent: blankRecipe.efficiencyPercent,
      grainRatioLPerKg: blankRecipe.grainRatioLPerKg,
      grainTempC: blankRecipe.grainTempC,
      targetCarbonationVol: blankRecipe.targetCarbonationVol,
      beerTempAtBottlingC: blankRecipe.beerTempAtBottlingC,
      grains: blankRecipe.grains,
      hops: blankRecipe.hops,
      yeast: blankRecipe.yeast
    });

    setRecipes([blankRecipe, ...recipes]);
    setCurrentRecipe(blankRecipe);
    handleTabChange('calculator');
  };

  const handleSelectRecipe = useCallback((r: Recipe) => {
    setCurrentRecipe(r);
    handleTabChange('calculator');
  }, [handleTabChange]);

  const handleToggleFavorite = (recipeId: string) => {
    setRecipes(
      recipes.map(r => {
        if (r.id !== recipeId) return r;
        const isFav = r.collection === 'favorites';
        return { ...r, collection: isFav ? undefined : 'favorites' };
      })
    );
  };

  const handleSetCollection = (recipeId: string, col: Recipe['collection']) => {
    setRecipes(
      recipes.map(r => (r.id === recipeId ? { ...r, collection: col } : r))
    );
  };

  const handleDeleteRecipe = (recipeId: string) => {
    setRecipes(recipes.filter(r => r.id !== recipeId));
    deleteRecipeFromDb(recipeId);
    if (currentRecipe.id === recipeId && recipes.length > 1) {
      setCurrentRecipe(recipes.find(r => r.id !== recipeId) || INITIAL_RECIPES[0]);
    }
  };

  const handleStartBrewBatch = useCallback((r: Recipe) => {
    setCurrentRecipe(r);
    handleTabChange('calendar');
  }, [handleTabChange]);

  const handleSendToAiStudio = useCallback((r: Recipe) => {
    setCurrentRecipe(r);
    handleTabChange('ai_lab');
  }, [handleTabChange]);

  const handleSendToUniholic = useCallback((r: Recipe) => {
    setCurrentRecipe(r);
    handleTabChange('uniholic');
  }, [handleTabChange]);

  // Создание авторского рецепта на основе остатков из кладовой
  const handleCreateCustomFromPantry = () => {
    const pantryGrains = inventory.filter(i => i.category === 'grain' && i.amount > 0);
    const pantryHops = inventory.filter(i => i.category === 'hop' && i.amount > 0);
    const pantryYeast = inventory.find(i => i.category === 'yeast' && i.amount > 0);

    const grains = pantryGrains.slice(0, 3).map((g, idx) => ({
      id: `g_cust_${Date.now()}_${idx}`,
      name: g.name,
      weightKg: Math.min(g.amount, idx === 0 ? 4.5 : 0.5),
      potentialSg: g.potentialSgOrAlpha || 1.037,
      colorEbc: g.colorEbc || 5.0,
      type: (idx === 0 ? 'base' : 'caramel') as any
    }));

    const hops = pantryHops.slice(0, 2).map((h, idx) => ({
      id: `h_cust_${Date.now()}_${idx}`,
      name: h.name,
      weightG: Math.min(h.amount, idx === 0 ? 20 : 30),
      alphaAcid: h.potentialSgOrAlpha || 10.0,
      boilTimeMin: idx === 0 ? 60 : 15,
      use: 'boil' as const
    }));

    const newRecipe: Recipe = {
      id: `recipe_custom_pantry_${Date.now()}`,
      name: 'Авторский эль из запасов',
      style: 'American Pale Ale',
      category: 'Эли / Хмелевые',
      description: 'Сварен из ингредиентов, имеющихся в домашней кладовой пивовара.',
      author: 'Вы',
      batchSizeL: globalBatchSizeL,
      boilTimeMin: 60,
      efficiencyPercent: 72,
      grainRatioLPerKg: 3.5,
      grainTempC: 20,
      targetCarbonationVol: 2.4,
      beerTempAtBottlingC: 19,
      grains: grains.length > 0 ? grains : [
        { id: `g_1`, name: 'Pilsner Malt', weightKg: 4.5, potentialSg: 1.037, colorEbc: 3.5, type: 'base' }
      ],
      hops: hops.length > 0 ? hops : [
        { id: `h_1`, name: 'Magnum', weightG: 20, alphaAcid: 14.0, boilTimeMin: 60, use: 'boil' }
      ],
      mashSchedule: [
        { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 60, type: 'maltose' },
        { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
      ],
      yeast: pantryYeast ? {
        name: pantryYeast.name,
        lab: 'Fermentis',
        form: 'dry',
        type: 'ale',
        cellsPerGramOrVial: 20,
        attenuationPercent: 80,
        tempRange: [18, 24]
      } : INITIAL_RECIPES[1].yeast,
      calculated: {} as any,
      tags: ['Из кладовой', 'Авторский'],
      isCustom: true,
      collection: 'my_recipes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    newRecipe.calculated = calculateBrewMetrics({
      batchSizeL: newRecipe.batchSizeL,
      boilTimeMin: newRecipe.boilTimeMin,
      efficiencyPercent: newRecipe.efficiencyPercent,
      grainRatioLPerKg: newRecipe.grainRatioLPerKg,
      grainTempC: newRecipe.grainTempC,
      targetCarbonationVol: newRecipe.targetCarbonationVol,
      beerTempAtBottlingC: newRecipe.beerTempAtBottlingC,
      grains: newRecipe.grains,
      hops: newRecipe.hops,
      yeast: newRecipe.yeast
    });

    setRecipes([newRecipe, ...recipes]);
    setCurrentRecipe(newRecipe);
    handleTabChange('calculator');
  };

  // Печать и экспорт варочного листа в PDF / HTML
  const handlePrintSheet = (recipe?: Recipe) => {
    const target = recipe || currentRecipe;
    if (target && (!target.calculated || typeof target.calculated.ogSg !== 'number')) {
      const calculated = calculateBrewMetrics({
        batchSizeL: target.batchSizeL || 30,
        boilTimeMin: target.boilTimeMin || 60,
        efficiencyPercent: target.efficiencyPercent || 72,
        grainRatioLPerKg: target.grainRatioLPerKg || 3.5,
        grainTempC: target.grainTempC || 20,
        targetCarbonationVol: target.targetCarbonationVol || 2.4,
        beerTempAtBottlingC: target.beerTempAtBottlingC || 20,
        grains: target.grains || [],
        hops: target.hops || [],
        yeast: target.yeast || { name: 'US-05', type: 'ale', form: 'dry', lab: 'Fermentis', attenuationPercent: 78, tempRange: [18, 22] },
        otherIngredients: target.otherIngredients || []
      });
      target.calculated = calculated;
    }
    setRecipeToPrint(target);
    setPrintModalOpen(true);
  };

  // Полный снимок данных для облачной синхронизации
  const fullDataPayload = {
    recipes,
    inventory,
    batches,
    logs,
    lifehacks,
    version: '1.0'
  };

  const handleRestoreFullData = (data: any) => {
    if (data.recipes && Array.isArray(data.recipes)) setRecipes(data.recipes);
    if (data.inventory && Array.isArray(data.inventory)) setInventory(data.inventory);
    if (data.batches && Array.isArray(data.batches)) setBatches(data.batches);
    if (data.logs && Array.isArray(data.logs)) setLogs(data.logs);
    if (data.lifehacks && Array.isArray(data.lifehacks)) setLifehacks(data.lifehacks);
  };

  const handleAddRecipeToList = (recipe: Recipe, openInCalculator?: boolean) => {
    setRecipes(prev => {
      const idx = prev.findIndex(r => r.id === recipe.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = recipe;
        return copy;
      }
      return [recipe, ...prev];
    });
    if (openInCalculator) {
      setCurrentRecipe(recipe);
      handleTabChange('calculator');
    }
  };

  const activeBatchesCount = batches.filter(b => !b.isFinished).length;

  return (
    <GlobalErrorBoundary>
      <div className="min-h-screen bg-stone-100/60 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors overflow-x-hidden max-w-full">
        {/* Навигационная панель */}
        <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onOpenCloudSync={() => setCloudModalOpen(true)}
        onPrintSheet={handlePrintSheet}
        onOpenBeerXmlModal={() => setCloudModalOpen(true)}
        isOffline={isOffline}
        activeBatchesCount={activeBatchesCount}
        recipesCount={recipes.length}
        globalBatchSizeL={globalBatchSizeL}
        onSetGlobalBatchSizeL={handleSetGlobalBatchSizeL}
        onOpenHistory={() => handleOpenHistory()}
        onOpenAppUpdates={ENABLE_IN_APP_UPDATES ? () => setAppUpdateModalOpen(true) : undefined}
        hasAvailableUpdate={ENABLE_IN_APP_UPDATES ? hasAvailableUpdate : false}
        onOpenBetaFeedback={() => setBetaFeedbackModalOpen(true)}
        onOpenBetaEula={() => setBetaEulaModalOpen(true)}
        onOpenOnboarding={() => setOnboardingOpen(true)}
      />

      {/* Баннер доступного обновления при наличии более новой версии на GitHub (отключен на время тестирования) */}
      {ENABLE_IN_APP_UPDATES && hasAvailableUpdate && !updateBannerDismissed && latestReleaseInfo && (
        <div className="no-print bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 px-3 sm:px-6 py-2 shadow-md flex items-center justify-between gap-3 text-xs sm:text-sm font-bold border-b border-amber-400 max-w-full overflow-hidden">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1 rounded-lg bg-stone-950/20 text-stone-950 shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </span>
            <span className="truncate">
              Доступна новая версия <b>{latestReleaseInfo.name}</b>! Устанавливается прямо поверх старой без удаления.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setAppUpdateModalOpen(true)}
              className="px-3 py-1 rounded-lg bg-stone-950 hover:bg-stone-900 text-white text-xs font-black shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Обновить</span>
            </button>
            <button
              type="button"
              onClick={() => setUpdateBannerDismissed(true)}
              className="p-1 rounded-lg text-stone-950/70 hover:text-stone-950 hover:bg-black/10 transition-colors cursor-pointer"
              title="Скрыть"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Индикатор плавного свайпа по экрану */}
      {swipeHint && (
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 rounded-full bg-stone-900/90 text-white font-bold text-xs shadow-lg backdrop-blur-xs flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-100 pointer-events-none">
          <span>{swipeHint.direction === 'right' ? '←' : ''}</span>
          <span>{swipeHint.text}</span>
          <span>{swipeHint.direction === 'left' ? '→' : ''}</span>
        </div>
      )}

      {/* Основной контент с оптимизированным Keep-Alive кэшем (0 ms задержка при переключении) */}
      <main className="no-print w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-[max(0.75rem,env(safe-area-inset-top,0px))] sm:pt-6 pb-36 sm:pb-16 pl-[max(0.5rem,env(safe-area-inset-left,0px))] pr-[max(0.5rem,env(safe-area-inset-right,0px))] max-w-full overflow-x-hidden">
        <TabKeepAlive tabId="calculator" activeTab={activeTab} isVisited={visitedTabs.has('calculator')}>
          <RecipeBuilder
            recipe={currentRecipe}
            inventory={inventory}
            onUpdateRecipe={(updated) => {
              setCurrentRecipe(updated);
              setRecipes(recipes.map(r => (r.id === updated.id ? updated : r)));
            }}
            onSaveRecipe={handleSaveRecipe}
            onSendToAiStudio={handleSendToAiStudio}
            onStartBrewBatch={handleStartBrewBatch}
            onSendToUniholic={handleSendToUniholic}
            onPrintSheet={handlePrintSheet}
            onOpenNewRecipeModal={() => setNewRecipeModalOpen(true)}
            onOpenHistory={handleOpenHistory}
          />
        </TabKeepAlive>

        <TabKeepAlive tabId="matcher" activeTab={activeTab} isVisited={visitedTabs.has('matcher')}>
          <IngredientMatcher
            inventory={inventory}
            recipes={recipes}
            logs={logs}
            onUpdateInventory={setInventory}
            onSelectRecipe={handleSelectRecipe}
            globalBatchSizeL={globalBatchSizeL}
            onSetGlobalBatchSizeL={handleSetGlobalBatchSizeL}
            onCreateCustomRecipeFromPantry={handleCreateCustomFromPantry}
          />
        </TabKeepAlive>

        <TabKeepAlive tabId="catalogue" activeTab={activeTab} isVisited={visitedTabs.has('catalogue')}>
          <RecipeCatalogue
            recipes={recipes}
            onSelectRecipe={handleSelectRecipe}
            onCreateNewRecipe={() => setNewRecipeModalOpen(true)}
            onAddRecipeToList={handleAddRecipeToList}
            onToggleFavorite={handleToggleFavorite}
            onSetCollection={handleSetCollection}
            onDeleteRecipe={handleDeleteRecipe}
            onExportBeerXml={(r) => {
              setCurrentRecipe(r);
              setCloudModalOpen(true);
            }}
            onPrintRecipe={(r) => {
              handlePrintSheet(r);
            }}
            onStartBrewBatch={handleStartBrewBatch}
            onSendToUniholic={handleSendToUniholic}
            onOpenHistory={handleOpenHistory}
          />
        </TabKeepAlive>

        <TabKeepAlive tabId="uniholic" activeTab={activeTab} isVisited={visitedTabs.has('uniholic')}>
          <UniholicErrorBoundary onReset={() => handleTabChange('calculator')}>
            <UniholicBreweryController
              recipe={currentRecipe}
              allRecipes={recipes}
              onSelectRecipe={(r) => {
                setCurrentRecipe(r);
              }}
              onOpenRecipeBuilder={() => handleTabChange('calculator')}
            />
          </UniholicErrorBoundary>
        </TabKeepAlive>

        <TabKeepAlive tabId="ai_lab" activeTab={activeTab} isVisited={visitedTabs.has('ai_lab')}>
          <AiStudioLabelGenerator
            recipe={currentRecipe}
            onUpdateRecipe={(updated) => {
              setCurrentRecipe(updated);
              setRecipes(recipes.map(r => (r.id === updated.id ? updated : r)));
            }}
          />
        </TabKeepAlive>

        <TabKeepAlive tabId="calendar" activeTab={activeTab} isVisited={visitedTabs.has('calendar')}>
          <BrewCalendar
            batches={batches}
            recipes={recipes}
            onUpdateBatches={setBatches}
            onOpenRecipe={handleSelectRecipe}
            onOpenPdfReport={(batch) => handleOpenPdfReport(null, batch)}
          />
        </TabKeepAlive>

        <TabKeepAlive tabId="logs" activeTab={activeTab} isVisited={visitedTabs.has('logs')}>
          <BrewLogJournal
            logs={logs}
            recipes={recipes}
            onUpdateLogs={setLogs}
            onOpenPdfReport={(log) => handleOpenPdfReport(log, null)}
          />
        </TabKeepAlive>

        <TabKeepAlive tabId="lifehacks" activeTab={activeTab} isVisited={visitedTabs.has('lifehacks')}>
          <LifehacksGuide
            lifehacks={lifehacks}
            onUpdateLifehacks={setLifehacks}
            onOpenHistory={handleOpenHistory}
          />
        </TabKeepAlive>

        <TabKeepAlive tabId="community" activeTab={activeTab} isVisited={visitedTabs.has('community')}>
          <CommunityFeed
            posts={posts}
            recipes={recipes}
            onUpdatePosts={setPosts}
          />
        </TabKeepAlive>

        {/* Подвал приложения с авторскими правами, статусом закрытого бета-теста и ссылками */}
        <footer className="no-print mt-12 pt-6 pb-4 border-t border-stone-200/80 dark:border-stone-800/80 text-center text-xs text-stone-500 dark:text-stone-400 space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
            <span className="font-bold text-stone-700 dark:text-stone-300">© 2026 МастерВарка (MasterVarka). Все права защищены.</span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold border border-amber-300/40">
              Закрытый бета-тест v1.0.34
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <button
              type="button"
              onClick={() => setBetaEulaModalOpen(true)}
              className="hover:text-amber-600 dark:hover:text-amber-400 underline cursor-pointer"
            >
              Условия лицензии и EULA 🛡️
            </button>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <button
              type="button"
              onClick={() => setBetaFeedbackModalOpen(true)}
              className="hover:text-amber-600 dark:hover:text-amber-400 font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 cursor-pointer"
            >
              <span>🐞 Сообщить о баге / Отзыв</span>
            </button>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <a
              href="https://t.me/mastervarka"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sky-600 dark:hover:text-sky-400 font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1 cursor-pointer"
              title="Официальный Telegram-канал багрепортов и обновлений МастерВарки"
            >
              <span>📢 Канал багрепортов @mastervarka</span>
            </a>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <span>Данные сохраняются локально в IndexedDB</span>
          </div>
        </footer>
      </main>


      {/* Выделенный лист для печати варочного листа в PDF через браузер */}
      <PrintableBrewSheet recipe={currentRecipe} />

      {/* Модальное окно синхронизации, BeerXML и бэкапов */}
      <CloudSyncModal
        isOpen={cloudModalOpen}
        onClose={() => setCloudModalOpen(false)}
        currentRecipe={currentRecipe}
        onImportRecipe={(imported) => {
          setRecipes([imported, ...recipes]);
          setCurrentRecipe(imported);
          handleTabChange('calculator');
        }}
        fullDataPayload={fullDataPayload}
        onRestoreFullData={handleRestoreFullData}
        syncCode={syncCode}
        setSyncCode={setSyncCode}
      />

      {/* Модальное окно создания рецепта (чистый шаблон с нуля или стиль BJCP) */}
      <NewRecipeModal
        isOpen={newRecipeModalOpen}
        onClose={() => setNewRecipeModalOpen(false)}
        onCreateRecipe={(newRecipe) => {
          setRecipes([newRecipe, ...recipes]);
          setCurrentRecipe(newRecipe);
          handleTabChange('calculator');
        }}
        defaultBatchSizeL={globalBatchSizeL}
      />

      {/* Модальное окно истории пивоварения и первоисточников */}
      <BrewingHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        initialMomentId={historyInitialMomentId}
      />

      {/* Модальное окно обновления приложения (отключено на время тестирования) */}
      {ENABLE_IN_APP_UPDATES && (
        <AppUpdateModal
          isOpen={appUpdateModalOpen}
          onClose={() => setAppUpdateModalOpen(false)}
          initialReleaseInfo={latestReleaseInfo}
        />
      )}

      {/* Интерактивное окно предпросмотра и экспорта варочного листа в PDF / HTML */}
      <PrintableBrewSheetModal
        recipe={recipeToPrint || currentRecipe}
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
      />

      {/* Интерактивное окно формирования и скачивания PDF-отчета завершенной варки */}
      <CompletedBrewPdfReportModal
        isOpen={pdfReportModalOpen}
        onClose={() => setPdfReportModalOpen(false)}
        initialLog={pdfReportLog}
        initialBatch={pdfReportBatch}
        allLogs={logs}
        allBatches={batches}
        allRecipes={recipes}
      />

      {/* Модальное окно EULA / Защита авторских прав и условия тестирования */}
      <BetaTestingEulaModal
        isOpen={betaEulaModalOpen}
        onClose={() => setBetaEulaModalOpen(false)}
        isFirstLaunchPrompt={!localStorage.getItem('mastervarka_beta_eula_accepted')}
      />

      {/* Модальное окно отправки багрепорта и обратной связи бета-тестирования */}
      <BetaFeedbackModal
        isOpen={betaFeedbackModalOpen}
        onClose={() => setBetaFeedbackModalOpen(false)}
      />

      {/* Интерактивный стартовый тур (показывается после EULA и запроса системных разрешений) */}
      <OnboardingTour
        isOpen={onboardingOpen && !betaEulaModalOpen && !firstLaunchPermissionModalOpen}
        onClose={() => setOnboardingOpen(false)}
        onNavigateTab={handleTabChange}
        globalBatchSizeL={globalBatchSizeL}
        onSetGlobalBatchSizeL={handleSetGlobalBatchSizeL}
      />

      {/* Модальное окно первого запуска: запрос системных разрешений на уведомления и доступ к системному времени */}
      {firstLaunchPermissionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full p-6 text-stone-900 dark:text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 shrink-0">
                <BellRing className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-stone-900 dark:text-white leading-tight">
                  Разрешения для МастерВарки 🍺📲
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Напоминания об этапах брожения, таймеры пауз и громкие звуковые сигналы
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/60 text-xs space-y-2.5">
              <div className="flex items-start gap-2.5 text-stone-700 dark:text-stone-300">
                <span className="text-base">🔔</span>
                <span><b>Локальные пуш-уведомления (Capacitor API):</b> Оповестят о наступлении сухого охмеления, диацетиловой паузы и розлива партий.</span>
              </div>
              <div className="flex items-start gap-2.5 text-stone-700 dark:text-stone-300">
                <span className="text-base">⏰</span>
                <span><b>Точные будильники (Exact Alarm):</b> Сработают ровно в заданное время даже при заблокированном телефоне и в режиме сна.</span>
              </div>
              <div className="flex items-start gap-2.5 text-stone-700 dark:text-stone-300">
                <span className="text-base">🔊</span>
                <span><b>Громкий звуковой сигнал:</b> Мощный зуммер предупредит об окончании кипячения и засыпке хмеля при «грязных руках».</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={async () => {
                  markFirstLaunchPermissionPrompted();
                  setFirstLaunchPermissionModalOpen(false);
                  const res = await requestDeviceNotificationPermissions();
                  if (res.success) {
                    playBrewTimerChime('step');
                  }
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 active:scale-98 transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>Разрешить в телефоне ✅</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  markFirstLaunchPermissionPrompted();
                  setFirstLaunchPermissionModalOpen(false);
                }}
                className="py-3 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-400 font-bold text-xs cursor-pointer text-center transition-colors"
              >
                Настроить позже
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </GlobalErrorBoundary>
  );
}
