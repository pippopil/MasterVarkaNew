import React, { useState } from 'react';
import {
  Beer,
  Calculator,
  Search,
  BookOpen,
  Sparkles,
  Calendar,
  ClipboardList,
  Lightbulb,
  Users,
  Sun,
  Moon,
  Cloud,
  Printer,
  FileCode,
  Wifi,
  WifiOff,
  Menu,
  X,
  Minus,
  Plus,
  Download,
  Cpu,
  ChevronRight,
  Send,
  Bug
} from 'lucide-react';
import { SafeNumberInput } from './SafeNumberInput';
import { useBrewingHistory } from '../context/BrewingHistoryContext';

export type ActiveTab =
  | 'calculator'
  | 'catalogue'
  | 'uniholic'
  | 'matcher'
  | 'ai_lab'
  | 'calendar'
  | 'logs'
  | 'lifehacks'
  | 'community';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  onOpenCloudSync: () => void;
  onPrintSheet: () => void;
  onOpenBeerXmlModal: () => void;
  isOffline: boolean;
  activeBatchesCount: number;
  recipesCount?: number;
  globalBatchSizeL: number;
  onSetGlobalBatchSizeL: (sizeL: number) => void;
  onOpenHistory?: () => void;
  onOpenAppUpdates?: () => void;
  hasAvailableUpdate?: boolean;
  onOpenBetaFeedback?: () => void;
  onOpenBetaEula?: () => void;
  onOpenOnboarding?: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  onOpenCloudSync,
  onPrintSheet,
  onOpenBeerXmlModal,
  isOffline,
  activeBatchesCount,
  recipesCount,
  globalBatchSizeL,
  onSetGlobalBatchSizeL,
  onOpenHistory,
  onOpenAppUpdates,
  hasAvailableUpdate,
  onOpenBetaFeedback,
  onOpenBetaEula,
  onOpenOnboarding
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { moments } = useBrewingHistory();

  const navItems = [
    { id: 'calculator', label: 'Калькулятор', icon: Calculator },
    { id: 'catalogue', label: recipesCount !== undefined ? `Рецепты (${recipesCount})` : 'Рецепты', icon: BookOpen },
    { id: 'uniholic', label: 'Пивоварня ⚡', icon: Cpu },
    { id: 'matcher', label: 'Склад', icon: Search },
    {
      id: 'calendar',
      label: 'Календарь',
      icon: Calendar,
      badge: activeBatchesCount > 0 ? activeBatchesCount : undefined
    },
    { id: 'logs', label: 'Журнал варок', icon: ClipboardList },
    { id: 'ai_lab', label: 'ИИ Этикетки', icon: Sparkles },
    { id: 'lifehacks', label: 'Лайфхаки', icon: Lightbulb },
    { id: 'community', label: 'Клуб', icon: Users }
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  };

  const handleMobileTabSelect = (tab: ActiveTab) => {
    handleSelectTab(tab);
    setMobileDrawerOpen(false);
  };

  return (
    <>
      {/* Верхний хедер с плавной прокруткой без тяжелого blur на мобильных */}
      <header className="no-print sticky top-0 z-30 w-full max-w-full bg-white dark:bg-stone-900 sm:bg-white/95 sm:dark:bg-stone-900/95 sm:backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors pt-[env(safe-area-inset-top,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
            {/* Logo & Brand */}
            <button
              type="button"
              onClick={() => handleSelectTab('calculator')}
              className="flex items-center gap-2.5 cursor-pointer text-left focus:outline-none"
            >
              <img
                src="/icon.svg"
                alt="МастерВарка"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shadow-sm shadow-amber-500/20 shrink-0 object-contain"
              />
              <div className="min-w-0">
                <div className="font-extrabold text-base sm:text-lg tracking-tight text-stone-900 dark:text-white leading-tight">
                  Мастер<span className="text-amber-600 dark:text-amber-400">Варка</span>
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 hidden md:block leading-none mt-0.5">
                  Калькулятор и рецепты крафтового пива
                </div>
              </div>
            </button>

            {/* Быстрый регулятор объема партии (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs">
              <span className="text-stone-500 dark:text-stone-400 font-medium">Объем варки:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onSetGlobalBatchSizeL(Math.max(5, globalBatchSizeL - 5))}
                  className="w-5 h-5 rounded flex items-center justify-center bg-white dark:bg-stone-700 hover:bg-amber-100 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
                  title="Уменьшить на 5 л"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <SafeNumberInput
                  value={globalBatchSizeL}
                  onChange={(val) => onSetGlobalBatchSizeL(val)}
                  min={1}
                  max={500}
                  fallbackValue={20}
                  className="w-12 text-center font-mono font-bold text-amber-700 dark:text-amber-400 bg-transparent focus:outline-none"
                />
                <span className="font-bold text-stone-500 dark:text-stone-400">л</span>
                <button
                  type="button"
                  onClick={() => onSetGlobalBatchSizeL(Math.min(500, globalBatchSizeL + 5))}
                  className="w-5 h-5 rounded flex items-center justify-center bg-white dark:bg-stone-700 hover:bg-amber-100 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
                  title="Увеличить на 5 л"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Offline indicator */}
              <div
                title={isOffline ? 'Работает в автономном офлайн-режиме' : 'Связь с сервером активна'}
                className={`hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border ${
                  isOffline
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                }`}
              >
                {isOffline ? <WifiOff className="w-3 h-3 text-amber-600" /> : <Wifi className="w-3 h-3 text-emerald-600" />}
                <span>{isOffline ? 'Офлайн' : 'Онлайн'}</span>
              </div>

              {/* Cloud Sync */}
              <button
                type="button"
                onClick={onOpenCloudSync}
                title="Облачная синхронизация между телефоном и ПК"
                className="p-2 rounded-xl text-stone-700 hover:text-amber-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:text-amber-400 dark:hover:bg-stone-800 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <Cloud className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                <span className="hidden xl:inline">Синхронизация</span>
              </button>

              {/* BeerXML / Backup */}
              <button
                type="button"
                onClick={onOpenBeerXmlModal}
                title="Импорт и Экспорт BeerXML / JSON"
                className="hidden md:flex p-2 rounded-xl text-stone-700 hover:text-amber-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:text-amber-400 dark:hover:bg-stone-800 transition-colors items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                <span className="hidden xl:inline">BeerXML</span>
              </button>

              {/* Print PDF */}
              <button
                type="button"
                onClick={onPrintSheet}
                title="Распечатать варочный лист в PDF"
                className="hidden sm:flex p-2 rounded-xl text-stone-700 hover:text-amber-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:text-amber-400 dark:hover:bg-stone-800 transition-colors items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <Printer className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                <span className="hidden xl:inline">PDF</span>
              </button>

              {/* Хроника и первоисточники */}
              <button
                type="button"
                onClick={onOpenHistory}
                title="Хроника и первоисточники пивоварения (исторические ссылки и моменты, автообновление раз в 3 дня)"
                className="p-2 rounded-xl text-stone-700 hover:text-amber-700 hover:bg-amber-50/70 dark:text-stone-300 dark:hover:text-amber-400 dark:hover:bg-stone-800 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <span className="text-sm">📜</span>
                <span className="hidden xl:inline">Хроника ({moments.length})</span>
              </button>

              {onOpenOnboarding && (
                <button
                  type="button"
                  onClick={onOpenOnboarding}
                  title="Краткий тур по возможностям МастерВарки"
                  className="p-2 rounded-xl text-stone-700 hover:text-amber-700 hover:bg-amber-50/70 dark:text-stone-300 dark:hover:text-amber-400 dark:hover:bg-stone-800 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  <span className="text-sm">🎓</span>
                  <span className="hidden xl:inline">Обучение</span>
                </button>
              )}

              {/* Обновление приложения (APK / Релизы) - скрыто на время тестирования */}
              {onOpenAppUpdates && (
                <button
                  type="button"
                  onClick={onOpenAppUpdates}
                  title={hasAvailableUpdate ? 'Доступна новая версия «МастерВарка»!' : 'Проверка обновлений приложения'}
                  className={`relative p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                    hasAvailableUpdate
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/30'
                      : 'text-stone-700 hover:text-amber-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:text-amber-400 dark:hover:bg-stone-800'
                  }`}
                >
                  <Download className={`w-4 h-4 ${hasAvailableUpdate ? 'animate-bounce text-white' : 'text-stone-600 dark:text-stone-400'}`} />
                  <span className="hidden xl:inline">Обновление</span>
                  {hasAvailableUpdate && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-stone-900 animate-pulse" />
                  )}
                </button>
              )}

              {/* Переключатель световой темы */}
              <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                title={isDarkMode ? 'Включить светлую тему' : 'Включить тёмную тему'}
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
                aria-label="Переключить тему"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
              </button>

              {/* Кнопка обратной связи / багрепорта для бета-тестеров */}
              {onOpenBetaFeedback && (
                <button
                  type="button"
                  onClick={onOpenBetaFeedback}
                  title="Сообщить о баге или предложить идею (Бета-тест @mastervarka)"
                  className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300/60 dark:border-rose-700/60 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                >
                  <span className="text-xs">🐞</span>
                  <span className="inline text-xs font-bold">Багрепорт</span>
                </button>
              )}
            </div>
          </div>

          {/* Десктопная панель табов */}
          <nav className="hidden sm:flex items-center gap-1 overflow-x-auto py-2 border-t border-stone-200/70 dark:border-stone-800 no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id as ActiveTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-stone-500 dark:text-stone-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Мобильная нижняя навигационная панель с выделенной вкладкой Багрепорт */}
      <div className="no-print sm:hidden fixed bottom-0 inset-x-0 w-full max-w-full z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 pt-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom,10px))] shadow-2xl select-none">
        <div className={`w-full max-w-lg mx-auto grid ${onOpenBetaFeedback ? 'grid-cols-6' : 'grid-cols-5'} items-center px-0.5 text-center`}>
          <button
            type="button"
            onClick={() => handleSelectTab('calculator')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded-xl transition-all cursor-pointer min-w-0 active:scale-95 ${
              activeTab === 'calculator'
                ? 'text-amber-600 dark:text-amber-400 font-extrabold'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            <Calculator className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-tight truncate">Варка</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('catalogue')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded-xl transition-all cursor-pointer min-w-0 active:scale-95 ${
              activeTab === 'catalogue'
                ? 'text-amber-600 dark:text-amber-400 font-extrabold'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            <BookOpen className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-tight truncate">Рецепты</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('matcher')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded-xl transition-all cursor-pointer min-w-0 active:scale-95 ${
              activeTab === 'matcher'
                ? 'text-amber-600 dark:text-amber-400 font-extrabold'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            <Search className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-tight truncate">Склад</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('calendar')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded-xl transition-all cursor-pointer min-w-0 relative active:scale-95 ${
              activeTab === 'calendar'
                ? 'text-amber-600 dark:text-amber-400 font-extrabold'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            <Calendar className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-tight truncate">Брожение</span>
            {activeBatchesCount > 0 && (
              <span className="absolute -top-0.5 right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                {activeBatchesCount}
              </span>
            )}
          </button>

          {onOpenBetaFeedback && (
            <button
              type="button"
              onClick={onOpenBetaFeedback}
              title="Отправить багрепорт в @mastervarka"
              className="flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded-xl transition-all cursor-pointer min-w-0 relative active:scale-95 text-rose-600 dark:text-rose-400 font-bold hover:text-rose-700"
              aria-label="Вкладка Багрепорт"
            >
              <div className="relative">
                <Bug className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
                <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse ring-1 ring-white dark:ring-stone-900" />
              </div>
              <span className="text-[10px] leading-tight truncate font-bold text-rose-600 dark:text-rose-400">Багрепорт</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded-xl transition-all cursor-pointer min-w-0 active:scale-95 ${
              ['ai_lab', 'logs', 'lifehacks', 'community', 'uniholic'].includes(activeTab) || mobileDrawerOpen
                ? 'text-amber-600 dark:text-amber-400 font-extrabold'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            <Menu className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-tight truncate">Ещё</span>
          </button>
        </div>
      </div>

      {/* Мобильное всплывающее меню (Drawer) */}
      {mobileDrawerOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileDrawerOpen(false);
          }}
          className="no-print sm:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs overscroll-contain animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-stone-900 rounded-t-3xl p-5 border-t border-stone-200 dark:border-stone-800 space-y-4 max-h-[85dvh] overflow-y-auto shadow-2xl relative pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]"
          >
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                  <Beer className="w-4 h-4" />
                </div>
                <div className="font-extrabold text-base text-stone-900 dark:text-white">
                  Разделы и Инструменты
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Быстрый доступ к Багрепорту прямо вверху мобильного меню */}
            {onOpenBetaFeedback && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 flex items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Bug className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-rose-900 dark:text-rose-200 truncate">
                      Вкладка Багрепорт
                    </div>
                    <div className="text-[10px] text-rose-700 dark:text-rose-300 truncate">
                      Автоотправка в канал @mastervarka
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onOpenBetaFeedback();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs active:scale-95 shrink-0 transition-transform cursor-pointer"
                >
                  Багрепорт 🐞
                </button>
              </div>
            )}

            {/* Выбор объема партии на мобильном */}
            <div className="p-3 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
              <div className="text-xs">
                <span className="font-bold text-stone-900 dark:text-white block">Объем варки:</span>
                <span className="text-[11px] text-stone-500">Автопересчет ингредиентов</span>
              </div>
              <div className="flex items-center gap-1">
                {[10, 15, 20, 25, 30].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => onSetGlobalBatchSizeL(v)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                      globalBatchSizeL === v
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {v}л
                  </button>
                ))}
              </div>
            </div>

            {/* Блок автоматики пивоварни */}
            <button
              type="button"
              onClick={() => handleMobileTabSelect('uniholic')}
              className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'uniholic'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600 shadow-md shadow-amber-500/20'
                  : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${activeTab === 'uniholic' ? 'bg-white/20 text-white' : 'bg-amber-500/15 text-amber-500'}`}>
                  <Cpu className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-black flex items-center gap-1.5">
                    <span>Автоматика пивоварни ⚡</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      activeTab === 'uniholic' ? 'bg-white/25 text-white' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    }`}>Wi-Fi</span>
                  </div>
                  <div className={`text-[10px] mt-0.5 ${activeTab === 'uniholic' ? 'text-amber-100' : 'text-stone-500 dark:text-stone-400'}`}>
                    Uniholic, Бавария, EasyBrew, RAPT, CraftBeerPi
                  </div>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 ${activeTab === 'uniholic' ? 'text-white' : 'text-stone-400'}`} />
            </button>

            {/* Дополнительные разделы */}
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleMobileTabSelect('logs')}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-colors cursor-pointer ${
                  activeTab === 'logs'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200'
                }`}
              >
                <ClipboardList className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Журнал варок</span>
              </button>

              <button
                type="button"
                onClick={() => handleMobileTabSelect('ai_lab')}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-colors cursor-pointer ${
                  activeTab === 'ai_lab'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>ИИ Этикетки</span>
              </button>

              <button
                type="button"
                onClick={() => handleMobileTabSelect('lifehacks')}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-colors cursor-pointer ${
                  activeTab === 'lifehacks'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200'
                }`}
              >
                <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Лайфхаки</span>
              </button>

              <button
                type="button"
                onClick={() => handleMobileTabSelect('community')}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-colors cursor-pointer ${
                  activeTab === 'community'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200'
                }`}
              >
                <Users className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Сообщество</span>
              </button>
            </div>

            {/* Быстрые действия */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800">
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">Тема оформления:</span>
                <button
                  type="button"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-stone-700 text-xs font-bold text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-600 flex items-center gap-1.5 shadow-2xs"
                >
                  {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
                  <span>{isDarkMode ? 'Светлая' : 'Тёмная'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setMobileDrawerOpen(false); onOpenHistory?.(); }}
                  className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-xs font-semibold flex items-center justify-center gap-1.5 col-span-2 cursor-pointer"
                >
                  <span className="text-sm">📜</span>
                  <span>Хроника пивоварения и первоисточники ({moments.length})</span>
                </button>

                {onOpenAppUpdates && (
                  <button
                    type="button"
                    onClick={() => { setMobileDrawerOpen(false); onOpenAppUpdates?.(); }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 col-span-2 cursor-pointer transition-all ${
                      hasAvailableUpdate
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600 shadow-md shadow-amber-500/20'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <Download className={`w-4 h-4 ${hasAvailableUpdate ? 'animate-bounce text-white' : 'text-amber-500'}`} />
                    <span>{hasAvailableUpdate ? 'Доступно обновление APK (v1.0.X)!' : 'Обновление приложения (.apk)'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => { setMobileDrawerOpen(false); onOpenCloudSync(); }}
                  className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Cloud className="w-4 h-4 text-amber-500" />
                  <span>Синхронизация</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setMobileDrawerOpen(false); onOpenBeerXmlModal(); }}
                  className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileCode className="w-4 h-4 text-amber-500" />
                  <span>BeerXML</span>
                </button>

                {onOpenBetaFeedback && (
                  <button
                    type="button"
                    onClick={() => { setMobileDrawerOpen(false); onOpenBetaFeedback(); }}
                    className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-300/70 dark:border-amber-700/60 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🐞</span>
                    <span>Сообщить о баге</span>
                  </button>
                )}

                {onOpenBetaEula && (
                  <button
                    type="button"
                    onClick={() => { setMobileDrawerOpen(false); onOpenBetaEula(); }}
                    className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🛡️</span>
                    <span>Лицензия EULA</span>
                  </button>
                )}

                {onOpenOnboarding && (
                  <button
                    type="button"
                    onClick={() => { setMobileDrawerOpen(false); onOpenOnboarding(); }}
                    className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800/60 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer col-span-2"
                  >
                    <span>🎓</span>
                    <span>Быстрое обучение (тур)</span>
                  </button>
                )}

                <a
                  href="https://t.me/mastervarka"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 border border-sky-300/70 dark:border-sky-700/60 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer col-span-2"
                >
                  <Send className="w-4 h-4 text-sky-500" />
                  <span>Канал багрепортов @mastervarka ↗</span>
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              className="w-full py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-bold cursor-pointer"
            >
              Закрыть меню
            </button>
          </div>
        </div>
      )}
    </>
  );
};
