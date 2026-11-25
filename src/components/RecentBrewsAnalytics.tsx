import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell
} from 'recharts';
import { Recipe, BrewLog, InventoryItem } from '../types/brewing';
import {
  BarChart3,
  Wheat,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Package,
  Layers,
  Calendar,
  ChevronDown,
  ChevronUp,
  Scale,
  Clock,
  ArrowRight
} from 'lucide-react';

interface Props {
  recipes: Recipe[];
  logs?: BrewLog[];
  inventory: InventoryItem[];
  className?: string;
  onSelectIngredientToRestock?: (ingredientName: string, category: 'grain' | 'hop') => void;
}

// Палитра для солодов (теплые янтарные, медовые, карамельные)
const GRAIN_COLORS = [
  '#f59e0b', // amber-500
  '#d97706', // amber-600
  '#b45309', // amber-700
  '#fbbf24', // amber-400
  '#ea580c', // orange-600
  '#ca8a04', // yellow-600
  '#78350f', // amber-900
  '#9a3412', // orange-800
  '#eab308'  // yellow-500
];

// Палитра для хмелей (хвойно-изумрудные, травяные)
const HOP_COLORS = [
  '#10b981', // emerald-500
  '#059669', // emerald-600
  '#047857', // emerald-700
  '#22c55e', // green-500
  '#16a34a', // green-600
  '#14b8a6', // teal-500
  '#84cc16', // lime-500
  '#0d9488', // teal-600
  '#65a30d'  // lime-600
];

interface BrewBatchData {
  id: string;
  name: string;
  recipeName: string;
  date: string;
  batchSizeL: number;
  grains: { name: string; amountKg: number }[];
  hops: { name: string; amountG: number }[];
  totalGrainKg: number;
  totalHopG: number;
}

export const RecentBrewsAnalytics: React.FC<Props> = ({
  recipes,
  logs = [],
  inventory,
  className = '',
  onSelectIngredientToRestock
}) => {
  const [activeTab, setActiveTab] = useState<'grain' | 'hop' | 'forecast'>('grain');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // 1. Извлечение последних 5 варок на основе журнала варок (logs) или каталога рецептов
  const recentBrews = useMemo<BrewBatchData[]>(() => {
    const batches: BrewBatchData[] = [];
    const recipeMap = new Map<string, Recipe>();
    recipes.forEach(r => {
      recipeMap.set(r.id, r);
      recipeMap.set(r.name.toLowerCase().trim(), r);
    });

    // Если есть реальные варки в журнале, берем их
    const sortedLogs = [...logs].sort((a, b) => {
      const dateA = new Date(a.brewDate).getTime() || 0;
      const dateB = new Date(b.brewDate).getTime() || 0;
      return dateB - dateA;
    });

    for (const log of sortedLogs) {
      if (batches.length >= 5) break;
      const matchedRecipe = recipeMap.get(log.recipeId) || recipeMap.get(log.recipeName.toLowerCase().trim());
      if (matchedRecipe) {
        const totalGrainKg = matchedRecipe.grains.reduce((acc, g) => acc + (g.weightKg || 0), 0);
        const totalHopG = matchedRecipe.hops.reduce((acc, h) => acc + (h.weightG || 0), 0);

        batches.push({
          id: log.id,
          name: log.batchNumber || `Варка #${batches.length + 1}`,
          recipeName: matchedRecipe.name,
          date: log.brewDate || 'Недавно',
          batchSizeL: matchedRecipe.batchSizeL || 20,
          grains: matchedRecipe.grains.map(g => ({ name: g.name, amountKg: Number(g.weightKg || 0) })),
          hops: matchedRecipe.hops.map(h => ({ name: h.name, amountG: Number(h.weightG || 0) })),
          totalGrainKg: Math.round(totalGrainKg * 10) / 10,
          totalHopG: Math.round(totalHopG)
        });
      }
    }

    // Если в журнале меньше 5 варок, дополняем последними рецептами из каталога для полноценного анализа
    if (batches.length < 5 && recipes.length > 0) {
      const usedRecipeIds = new Set(batches.map(b => b.recipeName));
      for (const r of recipes) {
        if (batches.length >= 5) break;
        if (!usedRecipeIds.has(r.name)) {
          const totalGrainKg = r.grains.reduce((acc, g) => acc + (g.weightKg || 0), 0);
          const totalHopG = r.hops.reduce((acc, h) => acc + (h.weightG || 0), 0);

          batches.push({
            id: `rec_brew_${r.id}`,
            name: `Варка #${batches.length + 1} (${r.style})`,
            recipeName: r.name,
            date: r.updatedAt ? new Date(r.updatedAt).toLocaleDateString('ru-RU') : 'Недавно',
            batchSizeL: r.batchSizeL || 20,
            grains: r.grains.map(g => ({ name: g.name, amountKg: Number(g.weightKg || 0) })),
            hops: r.hops.map(h => ({ name: h.name, amountG: Number(h.weightG || 0) })),
            totalGrainKg: Math.round(totalGrainKg * 10) / 10,
            totalHopG: Math.round(totalHopG)
          });
        }
      }
    }

    // Разворачиваем в хронологическом порядке (от более ранней к последней), чтобы динамика слева направо
    return batches.reverse();
  }, [recipes, logs]);

  // 2. Агрегация данных по солоду для графиков
  const grainAnalytics = useMemo(() => {
    // Уникальные солода по всем 5 варкам
    const grainTotals: Record<string, number> = {};
    recentBrews.forEach(brew => {
      brew.grains.forEach(g => {
        grainTotals[g.name] = (grainTotals[g.name] || 0) + g.amountKg;
      });
    });

    const topGrains = Object.entries(grainTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([name, totalKg], idx) => ({
        name,
        totalKg: Math.round(totalKg * 10) / 10,
        avgPerBrewKg: Math.round((totalKg / (recentBrews.length || 1)) * 10) / 10,
        color: GRAIN_COLORS[idx % GRAIN_COLORS.length]
      }));

    // Данные для BarChart по каждой варке
    const chartData = recentBrews.map(brew => {
      const item: Record<string, any> = {
        name: brew.name.length > 18 ? brew.name.slice(0, 16) + '…' : brew.name,
        fullBatchName: brew.name,
        recipeName: brew.recipeName,
        date: brew.date,
        totalKg: brew.totalGrainKg
      };

      brew.grains.forEach(g => {
        item[g.name] = Math.round(g.amountKg * 10) / 10;
      });

      return item;
    });

    const totalAllGrainsKg = Object.values(grainTotals).reduce((a, b) => a + b, 0);

    return {
      topGrains,
      chartData,
      totalAllGrainsKg: Math.round(totalAllGrainsKg * 10) / 10,
      avgGrainPerBrewKg: Math.round((totalAllGrainsKg / (recentBrews.length || 1)) * 10) / 10
    };
  }, [recentBrews]);

  // 3. Агрегация данных по хмелю для графиков
  const hopAnalytics = useMemo(() => {
    const hopTotals: Record<string, number> = {};
    recentBrews.forEach(brew => {
      brew.hops.forEach(h => {
        hopTotals[h.name] = (hopTotals[h.name] || 0) + h.amountG;
      });
    });

    const topHops = Object.entries(hopTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([name, totalG], idx) => ({
        name,
        totalG: Math.round(totalG),
        avgPerBrewG: Math.round(totalG / (recentBrews.length || 1)),
        color: HOP_COLORS[idx % HOP_COLORS.length]
      }));

    // Данные для BarChart по каждой варке
    const chartData = recentBrews.map(brew => {
      const item: Record<string, any> = {
        name: brew.name.length > 18 ? brew.name.slice(0, 16) + '…' : brew.name,
        fullBatchName: brew.name,
        recipeName: brew.recipeName,
        date: brew.date,
        totalG: brew.totalHopG
      };

      brew.hops.forEach(h => {
        item[h.name] = Math.round(h.amountG);
      });

      return item;
    });

    const totalAllHopsG = Object.values(hopTotals).reduce((a, b) => a + b, 0);

    return {
      topHops,
      chartData,
      totalAllHopsG: Math.round(totalAllHopsG),
      avgHopPerBrewG: Math.round(totalAllHopsG / (recentBrews.length || 1))
    };
  }, [recentBrews]);

  // 4. Складской прогноз: сопоставление расхода за 5 варок с текущими остатками на складе
  const pantryForecast = useMemo(() => {
    const invMap = new Map<string, InventoryItem>();
    inventory.forEach(item => {
      invMap.set(item.name.toLowerCase().trim(), item);
    });

    const findInventory = (name: string, category: 'grain' | 'hop') => {
      const clean = name.toLowerCase().trim();
      if (invMap.has(clean)) return invMap.get(clean);
      for (const [key, item] of invMap.entries()) {
        if (item.category === category && (key.includes(clean) || clean.includes(key))) {
          return item;
        }
      }
      return undefined;
    };

    // Прогноз по солодам
    const grainForecast = grainAnalytics.topGrains.map(grain => {
      const invItem = findInventory(grain.name, 'grain');
      const stockKg = invItem?.amount || 0;
      const brewsLeft = grain.avgPerBrewKg > 0 ? stockKg / grain.avgPerBrewKg : 0;
      const status: 'ok' | 'warning' | 'critical' =
        brewsLeft >= 3 ? 'ok' : brewsLeft >= 1 ? 'warning' : 'critical';

      return {
        name: grain.name,
        category: 'grain' as const,
        stockAmount: stockKg,
        unit: 'кг',
        avgPerBrew: grain.avgPerBrewKg,
        brewsLeft: Math.round(brewsLeft * 10) / 10,
        status,
        color: grain.color
      };
    });

    // Прогноз по хмелям
    const hopForecast = hopAnalytics.topHops.map(hop => {
      const invItem = findInventory(hop.name, 'hop');
      const stockG = invItem?.amount || 0;
      const brewsLeft = hop.avgPerBrewG > 0 ? stockG / hop.avgPerBrewG : 0;
      const status: 'ok' | 'warning' | 'critical' =
        brewsLeft >= 3 ? 'ok' : brewsLeft >= 1 ? 'warning' : 'critical';

      return {
        name: hop.name,
        category: 'hop' as const,
        stockAmount: stockG,
        unit: 'г',
        avgPerBrew: hop.avgPerBrewG,
        brewsLeft: Math.round(brewsLeft * 10) / 10,
        status,
        color: hop.color
      };
    });

    const allItems = [...grainForecast, ...hopForecast];
    const criticalCount = allItems.filter(i => i.status === 'critical').length;
    const warningCount = allItems.filter(i => i.status === 'warning').length;

    return {
      grainForecast,
      hopForecast,
      criticalCount,
      warningCount
    };
  }, [grainAnalytics, hopAnalytics, inventory]);

  if (recentBrews.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white dark:bg-stone-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-stone-200/80 dark:border-stone-800 space-y-4 ${className}`}>
      {/* Шапка аналитической панели */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white flex items-center gap-2 flex-wrap">
              <span>Аналитика расхода: последние 5 варок</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0">
                Запасы & Тренд
              </span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 break-words">
              Динамика расхода солода и хмеля за последние варки с прогнозом истощения склада
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 max-w-full overflow-hidden">
          {/* Переключатель табов: Солод vs Хмель vs Складской прогноз */}
          <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs font-bold overflow-x-auto max-w-full swipe-scroll-x">
            <button
              type="button"
              onClick={() => setActiveTab('grain')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'grain'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Wheat className="w-3.5 h-3.5" />
              <span>Солод (кг)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('hop')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'hop'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Хмель (г)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('forecast')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'forecast'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Прогноз склада</span>
              {pantryForecast.criticalCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
          </div>

          {/* Кнопка скрыть / показать */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 transition-colors cursor-pointer shrink-0"
            title={isExpanded ? 'Свернуть панель аналитики' : 'Развернуть панель аналитики'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-1">
          {/* Сводные KPI карточки */}
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 max-w-full overflow-hidden">
            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50 min-w-0 max-w-full overflow-hidden">
              <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Wheat className="w-3 h-3" />
                <span>Расход солода (5 варок)</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-amber-950 dark:text-amber-200 mt-0.5">
                {grainAnalytics.totalAllGrainsKg} <span className="text-xs font-semibold">кг</span>
              </div>
              <div className="text-[10px] text-stone-500 mt-0.5 truncate">
                В среднем ~{grainAnalytics.avgGrainPerBrewKg} кг на варку
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/50 min-w-0 max-w-full overflow-hidden">
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Расход хмеля (5 варок)</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-emerald-950 dark:text-emerald-200 mt-0.5">
                {hopAnalytics.totalAllHopsG} <span className="text-xs font-semibold">г</span>
              </div>
              <div className="text-[10px] text-stone-500 mt-0.5 truncate">
                В среднем ~{hopAnalytics.avgHopPerBrewG} г на варку
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 min-w-0 max-w-full overflow-hidden">
              <div className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-sky-500" />
                <span>Охвачено партий</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-stone-900 dark:text-white mt-0.5">
                {recentBrews.length} <span className="text-xs font-semibold">варок</span>
              </div>
              <div className="text-[10px] text-stone-500 mt-0.5 truncate">
                {recentBrews[recentBrews.length - 1]?.recipeName || 'Крафт'}
              </div>
            </div>

            <div className={`p-3 rounded-xl border min-w-0 max-w-full overflow-hidden ${
              pantryForecast.criticalCount > 0
                ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                : 'bg-sky-50/70 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800'
            }`}>
              <div className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                {pantryForecast.criticalCount > 0 ? (
                  <>
                    <AlertTriangle className="w-3 h-3 text-rose-500" />
                    <span className="text-rose-700 dark:text-rose-300">Дефицит на складе</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-sky-500" />
                    <span className="text-sky-700 dark:text-sky-300">Статус запасов</span>
                  </>
                )}
              </div>
              <div className="text-lg sm:text-xl font-black mt-0.5 text-stone-900 dark:text-white">
                {pantryForecast.criticalCount > 0 ? (
                  <span className="text-rose-600 dark:text-rose-400">{pantryForecast.criticalCount} поз. мало!</span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400">В норме</span>
                )}
              </div>
              <div className="text-[10px] text-stone-500 mt-0.5 truncate">
                {pantryForecast.warningCount > 0 ? `${pantryForecast.warningCount} поз. на исходе` : 'Хватит на следующие варки'}
              </div>
            </div>
          </div>

          {/* ВКЛАДКА 1: ДИАГРАММА ИСПОЛЬЗОВАНИЯ СОЛОДА */}
          {activeTab === 'grain' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-w-0 max-w-full overflow-hidden">
              <div className="lg:col-span-8 p-4 rounded-xl bg-stone-50/80 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 min-w-0 max-w-full overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Wheat className="w-4 h-4 text-amber-500" />
                    <span>Расход сортов солода по варкам (кг)</span>
                  </div>
                  <span className="text-[10px] text-stone-500">Стековая диаграмма засыпи</span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={grainAnalytics.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        stroke="#888888"
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis tick={{ fontSize: 11 }} stroke="#888888" unit="кг" />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="p-3 bg-white dark:bg-stone-900 text-stone-900 dark:text-white rounded-xl shadow-xl text-xs space-y-1.5 border border-stone-200 dark:border-stone-700 max-w-xs">
                                <div className="font-black text-amber-600 dark:text-amber-400 border-b border-stone-200 dark:border-stone-800 pb-1">
                                  {data.fullBatchName} ({data.recipeName})
                                </div>
                                <div className="text-[10px] text-stone-500 dark:text-stone-400">Дата: {data.date}</div>
                                <div className="font-bold text-stone-800 dark:text-stone-200">
                                  Общая засыпь: <span className="text-amber-600 dark:text-amber-300">{data.totalKg} кг</span>
                                </div>
                                <div className="space-y-0.5 pt-1 text-[11px]">
                                  {payload.map((entry, idx) => (
                                    <div key={idx} className="flex justify-between gap-3 text-stone-700 dark:text-stone-300">
                                      <span style={{ color: entry.color }} className="font-medium">{entry.name}:</span>
                                      <span className="font-mono font-bold">{entry.value} кг</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      {grainAnalytics.topGrains.slice(0, 6).map((grain) => (
                        <Bar
                          key={grain.name}
                          dataKey={grain.name}
                          stackId="a"
                          fill={grain.color}
                          radius={[0, 0, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Правая колонка: Топ расходуемых солодов */}
              <div className="lg:col-span-4 p-4 rounded-xl bg-stone-50/80 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 space-y-3 min-w-0 max-w-full overflow-hidden">
                <div className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                  <span>Топ солодов за 5 варок:</span>
                  <span className="text-[10px] text-stone-500 font-mono">Всего {grainAnalytics.totalAllGrainsKg} кг</span>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {grainAnalytics.topGrains.map((grain, idx) => {
                    const percent = grainAnalytics.totalAllGrainsKg > 0
                      ? Math.round((grain.totalKg / grainAnalytics.totalAllGrainsKg) * 100)
                      : 0;
                    return (
                      <div key={idx} className="space-y-1 min-w-0">
                        <div className="flex items-center justify-between text-xs gap-2 min-w-0">
                          <span className="font-semibold text-stone-800 dark:text-stone-200 truncate flex-1 min-w-0">
                            {grain.name}
                          </span>
                          <span className="font-mono text-stone-600 dark:text-stone-400 shrink-0">
                            <b>{grain.totalKg}</b> кг <span className="text-[10px] text-stone-400">({percent}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${percent}%`, backgroundColor: grain.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ВКЛАДКА 2: ДИАГРАММА ИСПОЛЬЗОВАНИЯ ХМЕЛЯ */}
          {activeTab === 'hop' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-w-0 max-w-full overflow-hidden">
              <div className="lg:col-span-8 p-4 rounded-xl bg-stone-50/80 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 min-w-0 max-w-full overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>Расход сортов хмеля по варкам (граммы)</span>
                  </div>
                  <span className="text-[10px] text-stone-500">Стековая диаграмма охмеления</span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hopAnalytics.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        stroke="#888888"
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis tick={{ fontSize: 11 }} stroke="#888888" unit="г" />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="p-3 bg-white dark:bg-stone-900 text-stone-900 dark:text-white rounded-xl shadow-xl text-xs space-y-1.5 border border-stone-200 dark:border-stone-700 max-w-xs">
                                <div className="font-black text-emerald-600 dark:text-emerald-400 border-b border-stone-200 dark:border-stone-800 pb-1">
                                  {data.fullBatchName} ({data.recipeName})
                                </div>
                                <div className="text-[10px] text-stone-500 dark:text-stone-400">Дата: {data.date}</div>
                                <div className="font-bold text-stone-800 dark:text-stone-200">
                                  Всего хмеля: <span className="text-emerald-600 dark:text-emerald-400">{data.totalG} г</span>
                                </div>
                                <div className="space-y-0.5 pt-1 text-[11px]">
                                  {payload.map((entry, idx) => (
                                    <div key={idx} className="flex justify-between gap-3 text-stone-700 dark:text-stone-300">
                                      <span style={{ color: entry.color }} className="font-medium">{entry.name}:</span>
                                      <span className="font-mono font-bold">{entry.value} г</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      {hopAnalytics.topHops.slice(0, 6).map((hop) => (
                        <Bar
                          key={hop.name}
                          dataKey={hop.name}
                          stackId="b"
                          fill={hop.color}
                          radius={[0, 0, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Правая колонка: Топ расходуемых хмелей */}
              <div className="lg:col-span-4 p-4 rounded-xl bg-stone-50/80 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 space-y-3 min-w-0 max-w-full overflow-hidden">
                <div className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                  <span>Топ хмелей за 5 варок:</span>
                  <span className="text-[10px] text-stone-500 font-mono">Всего {hopAnalytics.totalAllHopsG} г</span>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {hopAnalytics.topHops.map((hop, idx) => {
                    const percent = hopAnalytics.totalAllHopsG > 0
                      ? Math.round((hop.totalG / hopAnalytics.totalAllHopsG) * 100)
                      : 0;
                    return (
                      <div key={idx} className="space-y-1 min-w-0">
                        <div className="flex items-center justify-between text-xs gap-2 min-w-0">
                          <span className="font-semibold text-stone-800 dark:text-stone-200 truncate flex-1 min-w-0">
                            {hop.name}
                          </span>
                          <span className="font-mono text-stone-600 dark:text-stone-400 shrink-0">
                            <b>{hop.totalG}</b> г <span className="text-[10px] text-stone-400">({percent}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${percent}%`, backgroundColor: hop.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ВКЛАДКА 3: СКЛАДСКОЙ ПРОГНОЗ & ДЕФИЦИТ (СРАВНЕНИЕ СО СКЛАДОМ) */}
          {activeTab === 'forecast' && (
            <div className="space-y-3 min-w-0 max-w-full overflow-hidden">
              <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0 max-w-full overflow-hidden">
                <span className="break-words">
                  💡 Прогноз рассчитывается на основе среднего расхода ингредиента за последние 5 варок и остатка на складе.
                </span>
                <span className="text-[11px] font-bold shrink-0">
                  Критично: {pantryForecast.criticalCount} поз.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0 max-w-full overflow-hidden">
                {/* Солода */}
                <div className="space-y-2 p-3.5 rounded-xl bg-stone-50/80 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 min-w-0 max-w-full overflow-hidden">
                  <div className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 border-b border-stone-200 dark:border-stone-750 pb-2">
                    <Wheat className="w-4 h-4 text-amber-500" />
                    <span>Прогноз запасов солода</span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {pantryForecast.grainForecast.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs transition-colors min-w-0 max-w-full overflow-hidden ${
                          item.status === 'critical'
                            ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
                            : item.status === 'warning'
                            ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                            : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="font-bold flex items-center gap-1.5 flex-wrap">
                            <span className="truncate">{item.name}</span>
                            {item.status === 'critical' && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500 text-white font-bold shrink-0">
                                Мало!
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-stone-500 break-words">
                            Склад: <b>{item.stockAmount} {item.unit}</b> • Средний расход: ~{item.avgPerBrew} {item.unit}/варка
                          </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <div className={`font-mono font-bold ${
                            item.status === 'critical' ? 'text-rose-600 dark:text-rose-400' : 'text-stone-700 dark:text-stone-300'
                          }`}>
                            {item.brewsLeft > 0 ? `Хватит на ~${item.brewsLeft} варок` : '0 варок (нет на складе)'}
                          </div>
                          {onSelectIngredientToRestock && item.status !== 'ok' && (
                            <button
                              type="button"
                              onClick={() => onSelectIngredientToRestock(item.name, 'grain')}
                              className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer inline-flex items-center gap-0.5"
                            >
                              <span>Пополнить</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Хмели */}
                <div className="space-y-2 p-3.5 rounded-xl bg-stone-50/80 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 min-w-0 max-w-full overflow-hidden">
                  <div className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 border-b border-stone-200 dark:border-stone-750 pb-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>Прогноз запасов хмеля</span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {pantryForecast.hopForecast.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs transition-colors min-w-0 max-w-full overflow-hidden ${
                          item.status === 'critical'
                            ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
                            : item.status === 'warning'
                            ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                            : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="font-bold flex items-center gap-1.5 flex-wrap">
                            <span className="truncate">{item.name}</span>
                            {item.status === 'critical' && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500 text-white font-bold shrink-0">
                                Мало!
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-stone-500 break-words">
                            Склад: <b>{item.stockAmount} {item.unit}</b> • Средний расход: ~{item.avgPerBrew} {item.unit}/варка
                          </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <div className={`font-mono font-bold ${
                            item.status === 'critical' ? 'text-rose-600 dark:text-rose-400' : 'text-stone-700 dark:text-stone-300'
                          }`}>
                            {item.brewsLeft > 0 ? `Хватит на ~${item.brewsLeft} варок` : '0 варок (нет на складе)'}
                          </div>
                          {onSelectIngredientToRestock && item.status !== 'ok' && (
                            <button
                              type="button"
                              onClick={() => onSelectIngredientToRestock(item.name, 'hop')}
                              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer inline-flex items-center gap-0.5"
                            >
                              <span>Пополнить</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
