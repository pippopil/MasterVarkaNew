import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { HopItem } from '../types/brewing';
import {
  BJCP_STYLES,
  calculateSingleHopIbu,
  calculateTinsethUtilization
} from '../utils/brewingMath';
import {
  Flame,
  Info,
  TrendingUp,
  Layers,
  Award,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

interface Props {
  hops: HopItem[];
  boilTimeMin: number;
  batchSizeL: number;
  ogSg: number;
  styleName?: string;
  totalIbu: number;
  buGuRatio?: number;
  onSelectHop?: (hopId: string) => void;
}

interface ProcessedHopPoint {
  id: string;
  name: string;
  timeMin: number;
  effectiveTime: number;
  weightG: number;
  alphaAcid: number;
  use: HopItem['use'];
  notes?: string;
  ibu: number;
  ibuSharePct: number;
  utilizationPct: number;
  color: string;
  useLabel: string;
}

const HOP_USE_CONFIG: Record<
  string,
  { label: string; color: string; bgClass: string; textClass: string }
> = {
  boil_bitter: {
    label: 'Базовая горечь (60-90м)',
    color: '#d97706', // amber-600
    bgClass: 'bg-amber-100 dark:bg-amber-950/60',
    textClass: 'text-amber-800 dark:text-amber-300'
  },
  boil_flavor: {
    label: 'Вкус и баланс (15-30м)',
    color: '#10b981', // emerald-500
    bgClass: 'bg-emerald-100 dark:bg-emerald-950/60',
    textClass: 'text-emerald-800 dark:text-emerald-300'
  },
  boil_aroma: {
    label: 'Поздний аромат (5-10м)',
    color: '#06b6d4', // cyan-500
    bgClass: 'bg-cyan-100 dark:bg-cyan-950/60',
    textClass: 'text-cyan-800 dark:text-cyan-300'
  },
  whirlpool: {
    label: 'Вирпул / Хопстенд (0м)',
    color: '#8b5cf6', // purple-500
    bgClass: 'bg-purple-100 dark:bg-purple-950/60',
    textClass: 'text-purple-800 dark:text-purple-300'
  },
  dry_hop: {
    label: 'Сухое охмеление (Dry Hop)',
    color: '#ec4899', // pink-500
    bgClass: 'bg-pink-100 dark:bg-pink-950/60',
    textClass: 'text-pink-800 dark:text-pink-300'
  },
  first_wort: {
    label: 'Первое сусло (FWH)',
    color: '#f59e0b', // amber-500
    bgClass: 'bg-amber-100 dark:bg-amber-950/60',
    textClass: 'text-amber-800 dark:text-amber-300'
  }
};

function getHopCategory(hop: HopItem): string {
  if (hop.use === 'dry_hop') return 'dry_hop';
  if (hop.use === 'whirlpool' || hop.boilTimeMin === 0) return 'whirlpool';
  if ((hop.use as string) === 'first_wort' || hop.notes?.toLowerCase().includes('first wort')) return 'first_wort';
  if (hop.boilTimeMin >= 45) return 'boil_bitter';
  if (hop.boilTimeMin >= 15) return 'boil_flavor';
  return 'boil_aroma';
}

export const HopBitternessChart: React.FC<Props> = ({
  hops,
  boilTimeMin,
  batchSizeL,
  ogSg,
  styleName = '',
  totalIbu,
  buGuRatio,
  onSelectHop
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Переключатели слоёв графика
  const [showTinsethCurve, setShowTinsethCurve] = useState(true);
  const [showCumulativeIbu, setShowCumulativeIbu] = useState(true);
  const [showStyleRange, setShowStyleRange] = useState(true);
  const [hoveredHop, setHoveredHop] = useState<ProcessedHopPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Находим эталон стиля BJCP для сопоставления диапазона IBU
  const matchedStyle = useMemo(() => {
    if (!styleName) return null;
    const clean = styleName.toLowerCase().trim();
    return (
      BJCP_STYLES.find(
        s => s.name.toLowerCase() === clean || clean.includes(s.name.toLowerCase())
      ) || null
    );
  }, [styleName]);

  const styleIbuMin = matchedStyle?.ibuRange[0] ?? 0;
  const styleIbuMax = matchedStyle?.ibuRange[1] ?? 0;

  // Обработка данных задач хмеля
  const processedHops: ProcessedHopPoint[] = useMemo(() => {
    return hops.map(h => {
      const cat = getHopCategory(h);
      const conf = HOP_USE_CONFIG[cat] || HOP_USE_CONFIG.boil_bitter;
      const hopIbu = calculateSingleHopIbu(h, ogSg, batchSizeL);
      const share = totalIbu > 0 ? Number(((hopIbu / totalIbu) * 100).toFixed(1)) : 0;
      const effectiveTime = h.use === 'whirlpool' ? 10 : h.use === 'dry_hop' ? 0 : h.boilTimeMin;
      const util = calculateTinsethUtilization(effectiveTime, ogSg) * 100;

      return {
        id: h.id,
        name: h.name || 'Хмель',
        timeMin: h.boilTimeMin,
        effectiveTime,
        weightG: h.weightG,
        alphaAcid: h.alphaAcid,
        use: h.use,
        notes: h.notes,
        ibu: hopIbu,
        ibuSharePct: share,
        utilizationPct: Number(util.toFixed(1)),
        color: conf.color,
        useLabel: conf.label
      };
    });
  }, [hops, ogSg, batchSizeL, totalIbu]);

  // Расчет сводных метрик
  const bitteringIbu = useMemo(() => {
    return processedHops
      .filter(h => h.timeMin >= 30 && h.use !== 'dry_hop' && h.use !== 'whirlpool')
      .reduce((sum, h) => sum + h.ibu, 0);
  }, [processedHops]);

  const aromaIbu = useMemo(() => {
    return processedHops
      .filter(h => h.timeMin < 30 || h.use === 'whirlpool')
      .reduce((sum, h) => sum + h.ibu, 0);
  }, [processedHops]);

  const totalHopGrams = useMemo(() => {
    return hops.reduce((sum, h) => sum + (h.weightG || 0), 0);
  }, [hops]);

  const hoppingRateGPerL = useMemo(() => {
    return batchSizeL > 0 ? Number((totalHopGrams / batchSizeL).toFixed(2)) : 0;
  }, [totalHopGrams, batchSizeL]);

  // Рендеринг интерактивного D3 графика
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const maxTime = Math.max(boilTimeMin || 60, ...hops.map(h => h.boilTimeMin || 0), 60);
    const maxHopIbu = d3.max(processedHops, d => d.ibu) || 0;
    const maxIbuValue = Math.max(totalIbu, styleIbuMax, maxHopIbu * 1.3, 30);
    const yMax = Math.ceil(maxIbuValue * 1.15);

    // Размеры и отступы
    const width = 800;
    const height = 340;
    const margin = { top: 30, right: 65, bottom: 45, left: 55 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Шкалы (Scales)
    // Ось X: Время варки от 0 мин (окончание варки / вирпул) до maxTime (начало кипячения)
    // В пивоварении принято отображать: слева = начало кипячения (60-90м), справа = 0м (конец варки)
    const xScale = d3
      .scaleLinear()
      .domain([maxTime, 0])
      .range([0, innerWidth]);

    // Ось Y: Горечь в IBU
    const yScale = d3
      .scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0])
      .nice();

    // Вторичная шкала Y: Процент утилизации Tinseth (%)
    const yUtilScale = d3
      .scaleLinear()
      .domain([0, 35])
      .range([innerHeight, 0]);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 1. Сетка фона (Grid lines)
    const yAxisGrid = d3
      .axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickFormat(() => '')
      .ticks(6);

    g.append('g')
      .attr('class', 'grid y-grid')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.08)
      .attr('stroke-dasharray', '2,2');

    g.select('.y-grid .domain').remove();

    // 2. Диапазон стиля BJCP (Затененная полоса допустимого IBU стиля)
    if (showStyleRange && styleIbuMax > 0) {
      const styleY1 = yScale(styleIbuMax);
      const styleY2 = yScale(styleIbuMin);
      const styleHeight = Math.max(2, styleY2 - styleY1);

      // Фон диапазона
      g.append('rect')
        .attr('x', 0)
        .attr('y', styleY1)
        .attr('width', innerWidth)
        .attr('height', styleHeight)
        .attr('fill', '#10b981')
        .attr('fill-opacity', 0.08)
        .attr('rx', 4);

      // Границы диапазона
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', styleY1)
        .attr('y2', styleY1)
        .attr('stroke', '#10b981')
        .attr('stroke-opacity', 0.35)
        .attr('stroke-dasharray', '4,3')
        .attr('stroke-width', 1);

      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', styleY2)
        .attr('y2', styleY2)
        .attr('stroke', '#10b981')
        .attr('stroke-opacity', 0.35)
        .attr('stroke-dasharray', '4,3')
        .attr('stroke-width', 1);

      // Текстовая метка диапазона BJCP
      g.append('text')
        .attr('x', 8)
        .attr('y', styleY1 + 14)
        .attr('fill', '#10b981')
        .attr('fill-opacity', 0.8)
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .text(`Диапазон стиля BJCP (${styleIbuMin}–${styleIbuMax} IBU)`);
    }

    // 3. Теоретическая кривая утилизации Tinseth во времени
    if (showTinsethCurve) {
      const utilPoints: Array<{ time: number; util: number }> = [];
      const step = 2;
      for (let t = 0; t <= maxTime; t += step) {
        utilPoints.push({
          time: t,
          util: calculateTinsethUtilization(t, ogSg) * 100
        });
      }

      const utilLine = d3
        .line<{ time: number; util: number }>()
        .x(d => xScale(d.time))
        .y(d => yUtilScale(d.util))
        .curve(d3.curveMonotoneX);

      // Линия утилизации
      g.append('path')
        .datum(utilPoints)
        .attr('fill', 'none')
        .attr('stroke', '#38bdf8') // sky-400
        .attr('stroke-width', 1.8)
        .attr('stroke-dasharray', '5,4')
        .attr('stroke-opacity', 0.75)
        .attr('d', utilLine);

      // Подпись к кривой утилизации
      const endPt = utilPoints[utilPoints.length - 1];
      if (endPt) {
        g.append('text')
          .attr('x', xScale(endPt.time) + 6)
          .attr('y', yUtilScale(endPt.util) - 6)
          .attr('fill', '#38bdf8')
          .attr('font-size', '9.5px')
          .attr('font-weight', '600')
          .text(`Утилизация альфа-к-ты (~${endPt.util.toFixed(0)}%)`);
      }
    }

    // 4. Кумулятивная кривая нарастания горечи IBU (Cumulative Curve)
    if (showCumulativeIbu && totalIbu > 0) {
      // Сортируем задачи хмеля от окончания варки к началу
      const sortedHops = [...processedHops].sort((a, b) => a.effectiveTime - b.effectiveTime);

      const cumulativePoints: Array<{ time: number; cumIbu: number }> = [
        { time: 0, cumIbu: 0 }
      ];

      let runningIbu = 0;
      for (const h of sortedHops) {
        runningIbu += h.ibu;
        cumulativePoints.push({
          time: h.effectiveTime,
          cumIbu: runningIbu
        });
      }
      cumulativePoints.push({
        time: maxTime,
        cumIbu: runningIbu
      });

      const cumArea = d3
        .area<{ time: number; cumIbu: number }>()
        .x(d => xScale(d.time))
        .y0(innerHeight)
        .y1(d => yScale(d.cumIbu))
        .curve(d3.curveStepAfter);

      const cumLine = d3
        .line<{ time: number; cumIbu: number }>()
        .x(d => xScale(d.time))
        .y(d => yScale(d.cumIbu))
        .curve(d3.curveStepAfter);

      // Заливка под кумулятивной кривой
      const gradientId = 'ibu-cumulative-grad';
      const defs = svg.append('defs');
      const grad = defs
        .append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      grad
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#f59e0b')
        .attr('stop-opacity', 0.25);
      grad
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#f59e0b')
        .attr('stop-opacity', 0.02);

      g.append('path')
        .datum(cumulativePoints)
        .attr('fill', `url(#${gradientId})`)
        .attr('d', cumArea);

      g.append('path')
        .datum(cumulativePoints)
        .attr('fill', 'none')
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.85)
        .attr('d', cumLine);
    }

    // 5. Линия текущего рассчитанного суммарного IBU рецепта
    if (totalIbu > 0) {
      const currentY = yScale(totalIbu);
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', currentY)
        .attr('y2', currentY)
        .attr('stroke', '#d97706')
        .attr('stroke-width', 1.8)
        .attr('stroke-opacity', 0.9);

      // Бейдж на правом краю
      const badgeG = g
        .append('g')
        .attr('transform', `translate(${innerWidth},${currentY})`);

      badgeG
        .append('rect')
        .attr('x', 4)
        .attr('y', -10)
        .attr('width', 52)
        .attr('height', 20)
        .attr('rx', 5)
        .attr('fill', '#d97706');

      badgeG
        .append('text')
        .attr('x', 30)
        .attr('y', 4)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-size', '10.5px')
        .attr('font-weight', '800')
        .text(`${totalIbu} IBU`);
    }

    // 6. Столбцы и точки индивидуальных задач хмеля (Hop Additions)
    const barWidth = 22;

    processedHops.forEach(hop => {
      const cx = xScale(hop.effectiveTime);
      const cy = yScale(hop.ibu);
      const isZeroIbu = hop.ibu <= 0;

      const hopG = g
        .append('g')
        .attr('class', 'hop-group cursor-pointer')
        .on('mouseenter', (event: MouseEvent) => {
          setHoveredHop(hop);
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltipPos({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top
            });
          }
        })
        .on('mousemove', (event: MouseEvent) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltipPos({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top
            });
          }
        })
        .on('mouseleave', () => {
          setHoveredHop(null);
          setTooltipPos(null);
        })
        .on('click', () => {
          onSelectHop?.(hop.id);
        });

      if (!isZeroIbu) {
        // Вертикальный столбец вклада в IBU
        hopG
          .append('rect')
          .attr('x', cx - barWidth / 2)
          .attr('y', cy)
          .attr('width', barWidth)
          .attr('height', innerHeight - cy)
          .attr('rx', 4)
          .attr('fill', hop.color)
          .attr('fill-opacity', 0.65)
          .attr('stroke', hop.color)
          .attr('stroke-width', 1.5)
          .attr('class', 'transition-all duration-150 hover:fill-opacity-90');
      } else {
        // Пунктирный маркер для сухого охмеления (Dry hop)
        hopG
          .append('line')
          .attr('x1', cx)
          .attr('x2', cx)
          .attr('y1', innerHeight)
          .attr('y2', innerHeight - 45)
          .attr('stroke', hop.color)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '3,3');
      }

      // Маркерная точка на вершине
      const circleY = isZeroIbu ? innerHeight - 45 : cy;
      hopG
        .append('circle')
        .attr('cx', cx)
        .attr('cy', circleY)
        .attr('r', 6)
        .attr('fill', '#ffffff')
        .attr('stroke', hop.color)
        .attr('stroke-width', 3)
        .attr('class', 'transition-transform duration-150 hover:scale-125');

      // Текстовая метка IBU / Названия сорта
      hopG
        .append('text')
        .attr('x', cx)
        .attr('y', circleY - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', 'currentColor')
        .attr('font-size', '10px')
        .attr('font-weight', '700')
        .text(isZeroIbu ? '0 IBU' : `${hop.ibu} IBU`);

      // Название сорта хмеля под осью
      hopG
        .append('text')
        .attr('x', cx)
        .attr('y', innerHeight + 32)
        .attr('text-anchor', 'middle')
        .attr('fill', 'currentColor')
        .attr('opacity', 0.8)
        .attr('font-size', '9.5px')
        .attr('font-weight', '600')
        .text(hop.name.length > 9 ? hop.name.slice(0, 8) + '…' : hop.name);
    });

    // 7. Оси координат (Axes)
    // Нижняя ось X
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.min(maxTime / 10, 8))
      .tickFormat(d => `${d}м`);

    g.append('g')
      .attr('class', 'x-axis text-stone-600 dark:text-stone-400')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('font-size', '10.5px')
      .attr('font-weight', '600');

    // Подпись оси X
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 42)
      .attr('text-anchor', 'middle')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.6)
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text('← Время кипячения / внесения (мин) [Начало варки слева, розлив/вирпул справа]');

    // Левая ось Y (IBU)
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(6)
      .tickFormat(d => `${d}`);

    g.append('g')
      .attr('class', 'y-axis text-stone-600 dark:text-stone-400')
      .call(yAxis)
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('font-weight', '600');

    // Подпись оси Y
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -38)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.7)
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .text('Горечь (IBU)');

    // Правая ось Y (Утилизация Tinseth %)
    if (showTinsethCurve) {
      const yAxisRight = d3
        .axisRight(yUtilScale)
        .ticks(5)
        .tickFormat(d => `${d}%`);

      g.append('g')
        .attr('class', 'y-axis-right text-sky-600 dark:text-sky-400')
        .attr('transform', `translate(${innerWidth},0)`)
        .call(yAxisRight)
        .selectAll('text')
        .attr('font-size', '9.5px')
        .attr('font-weight', '600');

      g.append('text')
        .attr('transform', 'rotate(90)')
        .attr('y', -innerWidth - 50)
        .attr('x', innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#0284c7')
        .attr('opacity', 0.8)
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .text('Утилизация (%)');
    }
  }, [
    hops,
    processedHops,
    boilTimeMin,
    batchSizeL,
    ogSg,
    totalIbu,
    styleIbuMin,
    styleIbuMax,
    showTinsethCurve,
    showCumulativeIbu,
    showStyleRange
  ]);

  // Статус попадания в стиль BJCP
  const bjcpStatus = useMemo(() => {
    if (!matchedStyle || styleIbuMax === 0) return null;
    if (totalIbu < styleIbuMin) {
      return {
        label: `Ниже стиля (${totalIbu} < ${styleIbuMin} IBU)`,
        color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30',
        icon: AlertTriangle
      };
    }
    if (totalIbu > styleIbuMax) {
      return {
        label: `Выше стиля (${totalIbu} > ${styleIbuMax} IBU)`,
        color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30',
        icon: AlertTriangle
      };
    }
    return {
      label: `Точно в стиле BJCP (${styleIbuMin}–${styleIbuMax} IBU)`,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      icon: CheckCircle2
    };
  }, [matchedStyle, totalIbu, styleIbuMin, styleIbuMax]);

  return (
    <div
      ref={containerRef}
      className="relative bg-white dark:bg-stone-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-stone-200/80 dark:border-stone-800 space-y-4 select-none"
    >
      {/* Шапка графика */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-base font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
              <span>Интерактивный профиль горечи (IBU)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                D3 Visualization
              </span>
            </h3>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Распределение горечи по времени варки по формуле Glenn Tinseth для сусла плотностью {ogSg.toFixed(3)} SG
          </p>
        </div>

        {/* Сводные индикаторы IBU и BJCP */}
        <div className="flex flex-wrap items-center gap-2">
          {bjcpStatus && (
            <div
              className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${bjcpStatus.color}`}
            >
              <bjcpStatus.icon className="w-3.5 h-3.5 shrink-0" />
              <span>{bjcpStatus.label}</span>
            </div>
          )}

          <div className="px-3 py-1 rounded-xl bg-amber-500 text-white text-xs font-black shadow-xs flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            <span>Итого: {totalIbu} IBU</span>
          </div>
        </div>
      </div>

      {/* Панель тумблеров слоёв D3 графика */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowCumulativeIbu(!showCumulativeIbu)}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
              showCumulativeIbu
                ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-500 border-stone-200 dark:border-stone-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${showCumulativeIbu ? 'bg-amber-500' : 'bg-stone-400'}`}
            />
            <span>Кумулятивный IBU</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTinsethCurve(!showTinsethCurve)}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
              showTinsethCurve
                ? 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/40'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-500 border-stone-200 dark:border-stone-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${showTinsethCurve ? 'bg-sky-500' : 'bg-stone-400'}`}
            />
            <span>Кривая Tinseth (%)</span>
          </button>

          {styleIbuMax > 0 && (
            <button
              type="button"
              onClick={() => setShowStyleRange(!showStyleRange)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                showStyleRange
                  ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500 border-stone-200 dark:border-stone-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${showStyleRange ? 'bg-emerald-500' : 'bg-stone-400'}`}
              />
              <span>Коридор BJCP ({styleIbuMin}–{styleIbuMax})</span>
            </button>
          )}
        </div>

        {/* Пропорция: Базовая горечь vs Ароматика */}
        <div className="flex items-center gap-3 text-[11px] text-stone-500 dark:text-stone-400 font-medium">
          <span>
            Горечь (≥30м): <b className="text-amber-600 dark:text-amber-400">{bitteringIbu.toFixed(0)} IBU</b> ({totalIbu > 0 ? Math.round((bitteringIbu / totalIbu) * 100) : 0}%)
          </span>
          <span>•</span>
          <span>
            Аромат/Вирпул (&lt;30м): <b className="text-emerald-600 dark:text-emerald-400">{aromaIbu.toFixed(0)} IBU</b> ({totalIbu > 0 ? Math.round((aromaIbu / totalIbu) * 100) : 0}%)
          </span>
          <span>•</span>
          <span>
            Навеска: <b>{hoppingRateGPerL} г/л</b>
          </span>
        </div>
      </div>

      {/* Контейнер SVG графика D3 */}
      <div className="w-full overflow-x-auto relative no-scrollbar">
        <svg
          ref={svgRef}
          viewBox="0 0 800 340"
          className="w-full h-auto min-w-[650px] overflow-visible text-stone-700 dark:text-stone-300"
        />

        {/* Интерактивный тултип при наведении на задачу хмеля */}
        {hoveredHop && tooltipPos && (
          <div
            style={{
              left: `${Math.min(Math.max(tooltipPos.x, 100), (containerRef.current?.clientWidth || 700) - 160)}px`,
              top: `${Math.max(tooltipPos.y - 120, 10)}px`
            }}
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-white p-3 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-700 text-xs space-y-1.5 w-60 animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-1">
              <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm">{hoveredHop.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                {hoveredHop.timeMin} мин
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
              <div>
                <span className="text-stone-500 dark:text-stone-400 block">Навеска:</span>
                <span className="font-bold">{hoveredHop.weightG} г</span>
              </div>
              <div>
                <span className="text-stone-500 dark:text-stone-400 block">Альфа-кислота:</span>
                <span className="font-bold text-amber-600 dark:text-amber-300">{hoveredHop.alphaAcid}%</span>
              </div>
              <div>
                <span className="text-stone-500 dark:text-stone-400 block">Вклад в IBU:</span>
                <span className="font-black text-amber-600 dark:text-amber-400 text-xs">
                  {hoveredHop.ibu} IBU ({hoveredHop.ibuSharePct}%)
                </span>
              </div>
              <div>
                <span className="text-stone-500 dark:text-stone-400 block">Утилизация:</span>
                <span className="font-bold text-sky-600 dark:text-sky-300">{hoveredHop.utilizationPct}%</span>
              </div>
            </div>

            <div className="pt-1 border-t border-stone-200 dark:border-stone-800/80 text-[10px] text-stone-600 dark:text-stone-300 flex items-center justify-between">
              <span>{hoveredHop.useLabel}</span>
              {hoveredHop.notes && <span className="italic truncate max-w-[100px]">{hoveredHop.notes}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Список задач хмеля с цветными бейджами */}
      {processedHops.length > 0 && (
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1 mr-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Внесения:</span>
          </span>

          {processedHops.map(h => (
            <button
              key={h.id}
              type="button"
              onClick={() => onSelectHop?.(h.id)}
              className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200 dark:border-stone-700"
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: h.color }} />
              <span className="font-bold">{h.name}</span>
              <span className="text-stone-500 font-mono text-[11px]">{h.timeMin}м</span>
              <span className="font-bold text-amber-700 dark:text-amber-400 font-mono text-[11px]">
                {h.ibu > 0 ? `${h.ibu} IBU` : 'Dry Hop'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
