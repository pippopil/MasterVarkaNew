/**
 * @license
 * Copyright (c) 2026 MasterVarka. All rights reserved.
 */

import React, { useState } from 'react';
import {
  Calculator,
  Search,
  Calendar,
  Cpu,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Beer
} from 'lucide-react';
import { ActiveTab } from './Navbar';

export const ONBOARDING_STORAGE_KEY = 'mastervarka_onboarding_completed';

interface OnboardingStep {
  id: string;
  tab: ActiveTab;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  icon: React.ComponentType<{ className?: string }>;
  accentClass: string;
}

const STEPS: OnboardingStep[] = [
  {
    id: 'calculator',
    tab: 'calculator',
    title: 'Калькулятор и Экономика варки',
    subtitle: 'Шаг 1 из 4 • Рецепты и точные расчёты',
    description:
      'Рассчитывайте НП, КП, ABV, горечь (IBU Tinseth), цветность EBC, воду для затирания, себестоимость партии и формируйте список покупок в один клик.',
    highlights: [
      'Автопересчёт ингредиентов при смене объёма варки',
      'Расчёт себестоимости варки и цены за 1 литр',
      'Экспорт «Списка покупок» и варочного листа в PDF'
    ],
    icon: Calculator,
    accentClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
  },
  {
    id: 'matcher',
    tab: 'matcher',
    title: 'Умный Склад и Свежесть',
    subtitle: 'Шаг 2 из 4 • Учёт запасов и аналоги',
    description:
      'Ведите учёт солода, хмеля и дрожжей. Указывайте цены, год урожая хмеля и дату производства дрожжей — приложение предупредит о деградации альфа-кислот.',
    highlights: [
      'Подбор рецептов из того, что есть дома на складе',
      'Фильтрация аналогов по цветности (EBC) и альфа-кислоте',
      'Бейджи свежести хмеля и дрожжей + учёт цен'
    ],
    icon: Search,
    accentClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'calendar',
    tab: 'calendar',
    title: 'Календарь брожения и Журнал',
    subtitle: 'Шаг 3 из 4 • Таймлайн и напоминания',
    description:
      'Отслеживайте этапы брожения, сухого охмеления, диацетиловой паузы и созревания. Все данные хранятся офлайн в памяти устройства (IndexedDB).',
    highlights: [
      'Автоматический график этапов брожения после старта варки',
      'Таймеры варки и системные напоминания на телефоне',
      'Полная работа без интернета (Offline-First)'
    ],
    icon: Calendar,
    accentClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30'
  },
  {
    id: 'uniholic',
    tab: 'uniholic',
    title: 'Пивоварня с Wi-Fi и Автоматика',
    subtitle: 'Шаг 4 из 4 • Интеграция с оборудованием',
    description:
      'Загружайте паузы затирания и варки напрямую на блоки управления Uniholic / EasyBrew / Bavariya или тренируйтесь в интерактивном симуляторе.',
    highlights: [
      'Отправка рецепта в контроллер в одно нажатие',
      'Встроенный симулятор для проверки пауз до варки',
      'Всегда можно пройти обучение заново из меню «Ещё»'
    ],
    icon: Cpu,
    accentClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
  globalBatchSizeL: number;
  onSetGlobalBatchSizeL: (sizeL: number) => void;
}

export const OnboardingTour: React.FC<Props> = ({
  isOpen,
  onClose,
  onNavigateTab,
  globalBatchSizeL,
  onSetGlobalBatchSizeL
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  if (!isOpen) return null;

  const step = STEPS[stepIndex];
  const Icon = step.icon;
  const isLastStep = stepIndex === STEPS.length - 1;

  const handleFinish = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch {}
    setStepIndex(0);
    onClose();
  };

  const handleGoToStep = (nextIndex: number) => {
    const bounded = Math.max(0, Math.min(STEPS.length - 1, nextIndex));
    setStepIndex(bounded);
    onNavigateTab(STEPS[bounded].tab);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-tour-title"
    >
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90dvh]">
        {/* Верхний прогресс-бар */}
        <div className="flex gap-1.5 px-5 pt-4">
          {STEPS.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleGoToStep(idx)}
              aria-label={`Перейти к шагу ${idx + 1}: ${s.title}`}
              className={`h-1.5 flex-1 rounded-full transition-all cursor-pointer ${
                idx <= stepIndex
                  ? 'bg-amber-500'
                  : 'bg-stone-200 dark:bg-stone-700'
              }`}
            />
          ))}
        </div>

        {/* Заголовок */}
        <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${step.accentClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
                {step.subtitle}
              </div>
              <h2
                id="onboarding-tour-title"
                className="text-base sm:text-lg font-black text-stone-900 dark:text-white leading-tight break-words"
              >
                {step.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
            title="Пропустить обучение"
            aria-label="Закрыть обучение"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Контент шага */}
        <div className="px-5 py-3 space-y-4 overflow-y-auto">
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            {step.description}
          </p>

          <ul className="space-y-2">
            {step.highlights.map((text, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800/70 p-2.5 rounded-xl border border-stone-200/70 dark:border-stone-700/60"
              >
                <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <span className="leading-snug font-medium">{text}</span>
              </li>
            ))}
          </ul>

          {/* На первом шаге предлагаем сразу выбрать привычный объём варки */}
          {stepIndex === 0 && (
            <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 dark:text-amber-200">
                <Beer className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Ваш обычный объём варки:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[10, 20, 25, 30, 50].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onSetGlobalBatchSizeL(size)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      globalBatchSizeL === size
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-amber-400'
                    }`}
                  >
                    {size} л
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Нижняя панель кнопок */}
        <div className="px-5 py-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2 bg-stone-50/60 dark:bg-stone-900/80">
          {stepIndex > 0 ? (
            <button
              type="button"
              onClick={() => handleGoToStep(stepIndex - 1)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold flex items-center gap-1 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Назад</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-3 py-2 rounded-xl text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-semibold cursor-pointer"
            >
              Пропустить
            </button>
          )}

          {!isLastStep ? (
            <button
              type="button"
              onClick={() => handleGoToStep(stepIndex + 1)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1 shadow-sm shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <span>Далее</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Начать варить!</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
