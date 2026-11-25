import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { InventoryItem } from '../types/brewing';
import { Wheat, Sparkles, PieChart as PieChartIcon, Layers, ChevronDown, ChevronUp, Scale } from 'lucide-react';

interface Props {
  inventory: InventoryItem[];
  onSelectItem?: (item: InventoryItem) => void;
  className?: string;
}

type ChartCategory = 'grain' | 'hop' | 'all';

// Тематические цветовые палитры для солодов (золотисто-карамельно-янтарные)
const MALT_COLORS = [
  '#f59e0b', // amber-500
  '#d97706', // amber-600
  '#b45309', // amber-700
  '#78350f', // amber-900
  '#fbbf24', // amber-400
  '#eab308', // yellow-500
  '#ca8a04', // yellow-600
  '#ea580c', // orange-600
  '#c2410c', // orange-700
  '#9a3412', // orange-800
  '#a16207', // yellow-700
  '#713f12', // yellow-900
  '#f97316', // orange-500
  '#fdba74'  // orange-300
];

// Тематические цветовые палитры для хмелей (свежие зеленые и травяные)
const HOP_COLORS = [
  '#10b981', // emerald-500
  '#059669', // emerald-600
  '#047857', // emerald-700
  '#065f46', // emerald-800
  '#22c55e', // green-500
  '#16a34a', // green-600
  '#15803d', // green-700
  '#84cc16', // lime-500
  '#65a30d', // lime-600
  '#14b8a6', // teal-500
  '#0d9488', // teal-600
  '#4ade80', // green-400
  '#34d399', // emerald-400
  '#a3e635'  // lime-400
];

// Палитра по общим категориям
const CATEGORY_COLORS: Record<string, string> = {
  grain: '#f59e0b', // Солод
  hop: '#10b981',   // Хмель
  yeast: '#a855f7', // Дрожжи
  misc: '#06b6d4'   // Добавки
};

const CATEGORY_LABELS: Record<string, string> = {
  grain: 'Солод и зерно',
  hop: 'Хмель',
  yeast: 'Дрожжи',
  misc: 'Добавки / Сахара'
};

export const PantryStockChart: React.FC<Props> = ({
  inventory,
  onSelectItem,
  className = ''
}) => {
  const [activeCategory, setActiveCategory] = useState<ChartCategory>('grain');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Статистика запасов
  const stats = useMemo(() => {
    let totalGrainKg = 0;
    let totalHopG = 0;
    let totalYeastPacks = 0;
    let grainTypes = 0;
    let hopTypes = 0;

    inventory.forEach(item => {
      if (item.category === 'grain') {
        totalGrainKg += item.amount;
        grainTypes += 1;
      } else if (item.category === 'hop') {
        totalHopG += item.amount;
        hopTypes += 1;
      } else if (item.category === 'yeast') {
        totalYeastPacks += item.amount;
      }
    });

    return {
      totalGrainKg: Number(totalGrainKg.toFixed(2)),
      totalHopG: Number(totalHopG.toFixed(1)),
      totalYeastPacks: Math.round(totalYeastPacks),
      grainTypes,
      hopTypes
    };
  }, [inventory]);

  // Данные для круговой диаграммы солода
  const grainChartData = useMemo(() => {
    const grains = inventory
      .filter(item => item.category === 'grain' && item.amount > 0)
      .map(item => ({
        id: item.id,
        name: item.name,
        amount: item.amount,
        unit: 'кг',
        colorEbc: item.colorEbc,
        rawItem: item
      }))
      .sort((a, b) => b.amount - a.amount);

    const total = grains.reduce((sum, g) => sum + g.amount, 0);

    return grains.map((g, idx) => ({
      ...g,
      value: g.amount,
      percentage: total > 0 ? Number(((g.amount / total) * 100).toFixed(1)) : 0,
      color: MALT_COLORS[idx % MALT_COLORS.length]
    }));
  }, [inventory]);

  // Данные для круговой диаграммы хмеля
  const hopChartData = useMemo(() => {
    const hops = inventory
      .filter(item => item.category === 'hop' && item.amount > 0)
      .map(item => ({
        id: item.id,
        name: item.name,
        amount: item.amount,
        unit: 'г',
        alphaAcid: item.potentialSgOrAlpha,
        rawItem: item
      }))
      .sort((a, b) => b.amount - a.amount);

    const total = hops.reduce((sum, h) => sum + h.amount, 0);

    return hops.map((h, idx) => ({
      ...h,
      value: h.amount,
      percentage: total > 0 ? Number(((h.amount / total) * 100).toFixed(1)) : 0,
      color: HOP_COLORS[idx % HOP_COLORS.length]
    }));
  }, [inventory]);

  // Данные для диаграммы общего баланса категорий
  const allCategoryData = useMemo(() => {
    const counts: Record<string, { count: number; totalText: string }> = {
      grain: { count: stats.grainTypes, totalText: `${stats.totalGrainKg} кг` },
      hop: { count: stats.hopTypes, totalText: `${stats.totalHopG} г` },
      yeast: { count: inventory.filter(i => i.category === 'yeast').length, totalText: `${stats.totalYeastPacks} пач.` },
      misc: { count: inventory.filter(i => i.category === 'misc').length, totalText: `${inventory.filter(i => i.category === 'misc').length} поз.` }
    };

    const totalItems = inventory.length;

    return Object.entries(counts)
      .filter(([_, data]) => data.count > 0)
      .map(([cat, data]) => ({
        name: CATEGORY_LABELS[cat] || cat,
        category: cat,
        value: data.count,
        totalText: data.totalText,
        percentage: totalItems > 0 ? Number(((data.count / totalItems) * 100).toFixed(1)) : 0,
        color: CATEGORY_COLORS[cat] || '#8884d8'
      }));
  }, [inventory, stats]);

  // Текущие данные для отображения в диаграмме
  const currentChartData = useMemo(() => {
    if (activeCategory === 'grain') return grainChartData;
    if (activeCategory === 'hop') return hopChartData;
    return allCategoryData;
  }, [activeCategory, grainChartData, hopChartData, allCategoryData]);

  // Кастомный всплывающий тултип диаграммы Recharts (светлая и тёмная тема)
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-white p-3 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 text-xs backdrop-blur-md max-w-xs z-50">
          <div className="flex items-center gap-2 mb-1.5 font-bold text-sm">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: data.color }}
            />
            <span className="truncate">{data.name}</span>
          </div>
          <div className="space-y-1 text-stone-600 dark:text-stone-300 text-[11px]">
            <div className="flex justify-between gap-4">
              <span className="text-stone-500 dark:text-stone-400">В наличии:</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-300">
                {data.amount !== undefined ? `${data.amount} ${data.unit}` : data.totalText}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-stone-500 dark:text-stone-400">Доля в категории:</span>
              <span className="font-mono font-bold text-stone-900 dark:text-white">
                {data.percentage}%
              </span>
            </div>
            {data.colorEbc !== undefined && data.colorEbc > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-stone-500 dark:text-stone-400">Цветность:</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {data.colorEbc} EBC
                </span>
              </div>
            )}
            {data.alphaAcid !== undefined && data.alphaAcid > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-stone-500 dark:text-stone-400">Альфа-кислота:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {data.alphaAcid}% α
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-gradient-to-br from-amber-500/5 via-stone-50 to-stone-100 dark:from-stone-900/90 dark:via-stone-900 dark:to-stone-950 rounded-2xl p-4 sm:p-5 border border-amber-300/60 dark:border-amber-900/40 shadow-sm max-w-full overflow-hidden ${className}`}>
      {/* Шапка диаграммы */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/80 dark:border-stone-800">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <PieChartIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-1.5">
                <span>Визуализация запасов кладовой</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  Recharts
                </span>
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Круговая диаграмма распределения солода, хмеля и пропорций на складе
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="sm:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
            title={isExpanded ? 'Свернуть диаграмму' : 'Развернуть диаграмму'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Переключатель вкладок диаграммы: Солод / Хмель / Общий баланс */}
        <div className="flex items-center gap-1 bg-white/80 dark:bg-stone-800/80 p-1 rounded-xl border border-stone-200/70 dark:border-stone-700/70 shadow-2xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => { setActiveCategory('grain'); setActiveIndex(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'grain'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700/60'
            }`}
          >
            <Wheat className="w-3.5 h-3.5" />
            <span>Солод ({stats.totalGrainKg} кг)</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveCategory('hop'); setActiveIndex(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'hop'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Хмель ({stats.totalHopG} г)</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveCategory('all'); setActiveIndex(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Баланс склада</span>
          </button>
        </div>
      </div>

      {/* Раскрывающаяся секция графиков и карточек */}
      {isExpanded && (
        <div className="pt-3 space-y-4">
          {/* Мини-сводка ключевых показателей */}
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-2.5 max-w-full overflow-hidden">
            <div className="bg-white/70 dark:bg-stone-800/70 p-2.5 rounded-xl border border-amber-200/50 dark:border-amber-900/30 flex items-center gap-2.5 min-w-0 max-w-full overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-xs shrink-0">
                🌾
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-stone-500 uppercase font-semibold truncate">Всего солода</div>
                <div className="font-mono font-black text-xs sm:text-sm text-stone-900 dark:text-white truncate">
                  {stats.totalGrainKg} <span className="text-[11px] font-normal text-stone-500">кг ({stats.grainTypes} сорт.)</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-stone-800/70 p-2.5 rounded-xl border border-emerald-200/50 dark:border-emerald-900/30 flex items-center gap-2.5 min-w-0 max-w-full overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs shrink-0">
                🌿
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-stone-500 uppercase font-semibold truncate">Всего хмеля</div>
                <div className="font-mono font-black text-xs sm:text-sm text-stone-900 dark:text-white truncate">
                  {stats.totalHopG} <span className="text-[11px] font-normal text-stone-500">г ({stats.hopTypes} сорт.)</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-stone-800/70 p-2.5 rounded-xl border border-purple-200/50 dark:border-purple-900/30 flex items-center gap-2.5 min-w-0 max-w-full overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-xs shrink-0">
                🧪
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-stone-500 uppercase font-semibold truncate">Штаммы дрожжей</div>
                <div className="font-mono font-black text-xs sm:text-sm text-stone-900 dark:text-white truncate">
                  {stats.totalYeastPacks} <span className="text-[11px] font-normal text-stone-500">пач.</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-stone-800/70 p-2.5 rounded-xl border border-stone-200/70 dark:border-stone-700/50 flex items-center gap-2.5 min-w-0 max-w-full overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-stone-500/10 text-stone-600 dark:text-stone-300 flex items-center justify-center font-black text-xs shrink-0">
                📦
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-stone-500 uppercase font-semibold truncate">Всего позиций</div>
                <div className="font-mono font-black text-xs sm:text-sm text-stone-900 dark:text-white truncate">
                  {inventory.length} <span className="text-[11px] font-normal text-stone-500">наименований</span>
                </div>
              </div>
            </div>
          </div>

          {/* График и интерактивная легенда */}
          {currentChartData.length === 0 ? (
            <div className="p-8 text-center text-stone-500 bg-white/40 dark:bg-stone-900/40 rounded-xl border border-dashed border-stone-300 dark:border-stone-700">
              <Scale className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div className="font-bold text-sm">В данной категории пока нет ингредиентов на складе</div>
              <div className="text-xs text-stone-400 mt-1">
                Добавьте солод или хмель из каталога ниже, чтобы увидеть круговую диаграмму распределения
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center bg-white/50 dark:bg-stone-900/50 p-4 rounded-xl border border-stone-200/60 dark:border-stone-800 min-w-0 max-w-full overflow-hidden">
              {/* Круговая диаграмма Recharts */}
              <div className="lg:col-span-6 h-64 sm:h-72 w-full flex items-center justify-center relative min-w-0 max-w-full overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      data={currentChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                      onMouseEnter={(_: any, index: number) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                      onClick={(entry: any) => {
                        if (entry && entry.rawItem && onSelectItem) {
                          onSelectItem(entry.rawItem);
                        }
                      }}
                      className="cursor-pointer transition-transform duration-200"
                    >
                      {currentChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke={activeIndex === index ? '#ffffff' : 'transparent'}
                          strokeWidth={activeIndex === index ? 3 : 1}
                          opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Центр пончиковой диаграммы со сводкой */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-stone-400">
                    {activeCategory === 'grain' ? 'Солод' : activeCategory === 'hop' ? 'Хмель' : 'Склад'}
                  </div>
                  <div className="font-mono font-black text-lg text-stone-900 dark:text-white">
                    {activeCategory === 'grain'
                      ? `${stats.totalGrainKg} кг`
                      : activeCategory === 'hop'
                      ? `${stats.totalHopG} г`
                      : `${inventory.length} поз.`}
                  </div>
                  <div className="text-[10px] text-stone-500">
                    {activeCategory === 'grain'
                      ? `${stats.grainTypes} сортов`
                      : activeCategory === 'hop'
                      ? `${stats.hopTypes} сортов`
                      : 'баланс'}
                  </div>
                </div>
              </div>

              {/* Интерактивная легенда с процентами и граммовками */}
              <div className="lg:col-span-6 max-h-64 sm:h-72 overflow-y-auto pr-1 space-y-1.5 swipe-scroll-x min-w-0 max-w-full overflow-hidden">
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Распределение запасов:</span>
                  <span className="font-normal text-[10px] text-stone-400">Наведите на долю для подсветки</span>
                </div>

                {currentChartData.map((item: any, idx: number) => {
                  const isHovered = activeIndex === idx;
                  return (
                    <div
                      key={item.id || item.name}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onMouseLeave={() => setActiveIndex(null)}
                      onClick={() => {
                        if (item.rawItem && onSelectItem) {
                          onSelectItem(item.rawItem);
                        }
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                        isHovered
                          ? 'bg-amber-100/70 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 scale-[1.01]'
                          : 'bg-white dark:bg-stone-800/80 border-stone-200/70 dark:border-stone-700/60 hover:bg-stone-50 dark:hover:bg-stone-750'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                        <span className="font-bold text-stone-900 dark:text-white">
                          {item.amount !== undefined ? `${item.amount} ${item.unit}` : item.totalText}
                        </span>
                        <span className="w-12 text-right font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
