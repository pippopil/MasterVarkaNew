import React, { useState } from 'react';
import { TemperatureCurvePoint } from '../utils/brewReportGenerator';
import { Thermometer, Clock, Calendar, Flame, Snowflake, Activity } from 'lucide-react';

interface Props {
  mashCurve: TemperatureCurvePoint[];
  fermentCurve: TemperatureCurvePoint[];
  defaultView?: 'ferment' | 'mash' | 'both';
  isPrintMode?: boolean;
}

export const BrewTemperatureCurveChart: React.FC<Props> = ({
  mashCurve,
  fermentCurve,
  defaultView = 'ferment',
  isPrintMode = false
}) => {
  const [activeTab, setActiveTab] = useState<'ferment' | 'mash'>(
    defaultView === 'mash' ? 'mash' : 'ferment'
  );

  // SVG-размеры
  const width = 800;
  const height = 260;
  const padding = { top: 30, right: 40, bottom: 45, left: 55 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Отрисовка графика затирания
  const renderMashSvg = () => {
    if (!mashCurve || mashCurve.length === 0) return null;

    const minX = 0;
    const maxX = Math.max(90, mashCurve[mashCurve.length - 1]?.x || 90);
    const minY = 30;
    const maxY = 85;

    const scaleX = (x: number) => padding.left + ((x - minX) / (maxX - minX)) * chartW;
    const scaleY = (y: number) => padding.top + chartH - ((y - minY) / (maxY - minY)) * chartH;

    // Генерация точек для SVG Path
    let pathD = '';
    mashCurve.forEach((pt, i) => {
      const cx = scaleX(pt.x);
      const cy = scaleY(pt.tempC);
      if (i === 0) {
        pathD += `M ${cx} ${cy}`;
      } else {
        pathD += ` L ${cx} ${cy}`;
      }
    });

    const areaD = `${pathD} L ${scaleX(maxX)} ${scaleY(minY)} L ${scaleX(minX)} ${scaleY(minY)} Z`;

    // Сетки по температуре: 40, 50, 60, 70, 80°C
    const yTicks = [40, 50, 62, 68, 72, 78];

    return (
      <div className="relative w-full overflow-hidden bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-2 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-stone-800 dark:text-stone-200">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Температурный профиль затирания (Mash Rests)</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-stone-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Температура сусла (°C)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-100 dark:bg-amber-950/60 border border-amber-300 inline-block" />
              Зона осахаривания (62–72°C)
            </span>
          </div>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
          <defs>
            <linearGradient id="mashGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Зона действия ферментов: 62-72°C */}
          <rect
            x={padding.left}
            y={scaleY(72)}
            width={chartW}
            height={scaleY(62) - scaleY(72)}
            fill="#fef3c7"
            fillOpacity="0.45"
          />
          <text
            x={padding.left + 8}
            y={scaleY(72) + 14}
            fill="#b45309"
            fontSize="10"
            fontWeight="bold"
          >
            Ферментативная пауза: β-амилаза (62–65°C) & α-амилаза (68–72°C)
          </text>

          {/* Горизонтальные линии сетки */}
          {yTicks.map(t => (
            <g key={t}>
              <line
                x1={padding.left}
                y1={scaleY(t)}
                x2={padding.left + chartW}
                y2={scaleY(t)}
                stroke="#e5e7eb"
                strokeDasharray={t === 78 ? '4 2' : undefined}
                strokeWidth={t === 78 ? '1.5' : '1'}
              />
              <text
                x={padding.left - 8}
                y={scaleY(t) + 3}
                textAnchor="end"
                fontSize="10"
                fill="#6b7280"
                fontFamily="monospace"
                fontWeight={t === 78 || t === 68 ? 'bold' : 'normal'}
              >
                {t}°C
              </text>
            </g>
          ))}

          {/* Вертикальные отметки времени: каждые 15 мин */}
          {[0, 15, 30, 45, 60, 75, 90].map(m => {
            if (m > maxX) return null;
            return (
              <g key={m}>
                <line
                  x1={scaleX(m)}
                  y1={padding.top}
                  x2={scaleX(m)}
                  y2={padding.top + chartH}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
                <text
                  x={scaleX(m)}
                  y={padding.top + chartH + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6b7280"
                  fontFamily="monospace"
                >
                  {m} мин
                </text>
              </g>
            );
          })}

          {/* Заливка под кривой */}
          <path d={areaD} fill="url(#mashGrad)" />

          {/* Линия температурной кривой */}
          <path
            d={pathD}
            fill="none"
            stroke="#d97706"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Контрольные точки */}
          {mashCurve.map((pt, idx) => {
            const cx = scaleX(pt.x);
            const cy = scaleY(pt.tempC);
            if (!pt.isMilestone && idx % 2 !== 0) return null;

            return (
              <g key={idx}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={pt.isMilestone ? 5 : 3.5}
                  fill="#fff"
                  stroke="#b45309"
                  strokeWidth="2.5"
                />
                {pt.isMilestone && (
                  <text
                    x={cx}
                    y={cy - 9}
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="bold"
                    fill="#78350f"
                  >
                    {pt.tempC}°C ({pt.label.split(' ')[0]})
                  </text>
                )}
              </g>
            );
          })}

          {/* Названия осей */}
          <text
            x={width / 2}
            y={height - 5}
            textAnchor="middle"
            fontSize="10"
            fill="#9ca3af"
            fontWeight="bold"
          >
            Время затирания от начала нагрева (минуты)
          </text>
        </svg>
      </div>
    );
  };

  // Отрисовка графика брожения, карбонизации и выдержки (40 дней)
  const renderFermentSvg = () => {
    if (!fermentCurve || fermentCurve.length === 0) return null;

    const minX = 0;
    const maxX = Math.max(40, fermentCurve[fermentCurve.length - 1]?.x || 40);
    const minY = 0;
    const maxY = 26;

    const scaleX = (x: number) => padding.left + ((x - minX) / (maxX - minX)) * chartW;
    const scaleY = (y: number) => padding.top + chartH - ((y - minY) / (maxY - minY)) * chartH;

    let pathD = '';
    fermentCurve.forEach((pt, i) => {
      const cx = scaleX(pt.x);
      const cy = scaleY(pt.tempC);
      if (i === 0) {
        pathD += `M ${cx} ${cy}`;
      } else {
        pathD += ` L ${cx} ${cy}`;
      }
    });

    const areaD = `${pathD} L ${scaleX(maxX)} ${scaleY(minY)} L ${scaleX(minX)} ${scaleY(minY)} Z`;

    const yTicks = [0, 4, 8, 12, 16, 20, 24];

    return (
      <div className="relative w-full overflow-hidden bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-2 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-stone-800 dark:text-stone-200">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>Температурная кривая брожения, карбонизации и созревания</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-stone-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Главное брожение (~19–21°C)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
              Холодная выдержка (2–4°C)
            </span>
          </div>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
          <defs>
            <linearGradient id="fermentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.30" />
              <stop offset="65%" stopColor="#06b6d4" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Зона главного брожения (18-22°C) */}
          <rect
            x={padding.left}
            y={scaleY(22)}
            width={chartW}
            height={scaleY(18) - scaleY(22)}
            fill="#d1fae5"
            fillOpacity="0.4"
          />
          <text
            x={padding.left + 8}
            y={scaleY(22) + 12}
            fill="#065f46"
            fontSize="9.5"
            fontWeight="bold"
          >
            Диапазон активного брожения и карбонизации (18–22°C)
          </text>

          {/* Зона холодной выдержки / лагеризации (2-5°C) */}
          <rect
            x={padding.left}
            y={scaleY(5)}
            width={chartW}
            height={scaleY(1) - scaleY(5)}
            fill="#e0f2fe"
            fillOpacity="0.45"
          />
          <text
            x={padding.left + chartW - 8}
            y={scaleY(5) + 12}
            textAnchor="end"
            fill="#0369a1"
            fontSize="9.5"
            fontWeight="bold"
          >
            Холодное созревание / Лагеризация (2–5°C)
          </text>

          {/* Горизонтальные линии Y */}
          {yTicks.map(t => (
            <g key={t}>
              <line
                x1={padding.left}
                y1={scaleY(t)}
                x2={padding.left + chartW}
                y2={scaleY(t)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={scaleY(t) + 3}
                textAnchor="end"
                fontSize="10"
                fill="#6b7280"
                fontFamily="monospace"
              >
                {t}°C
              </text>
            </g>
          ))}

          {/* Вертикальные линии X по дням: 0, 5, 10, 15, 20, 25, 30, 35, 40 */}
          {[0, 7, 14, 21, 28, 35, 40].map(d => {
            if (d > maxX) return null;
            return (
              <g key={d}>
                <line
                  x1={scaleX(d)}
                  y1={padding.top}
                  x2={scaleX(d)}
                  y2={padding.top + chartH}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
                <text
                  x={scaleX(d)}
                  y={padding.top + chartH + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6b7280"
                  fontFamily="monospace"
                >
                  День {d}
                </text>
              </g>
            );
          })}

          {/* Заливка под кривой */}
          <path d={areaD} fill="url(#fermentGrad)" />

          {/* Сама линия кривой */}
          <path
            d={pathD}
            fill="none"
            stroke="#059669"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Точки этапов и маркеры */}
          {fermentCurve.map((pt, idx) => {
            const cx = scaleX(pt.x);
            const cy = scaleY(pt.tempC);
            const isCold = pt.tempC < 10;

            return (
              <g key={idx}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={pt.isMilestone ? 5 : 3.5}
                  fill="#fff"
                  stroke={isCold ? '#0284c7' : '#059669'}
                  strokeWidth="2.5"
                />
                {pt.isMilestone && (
                  <text
                    x={cx}
                    y={cy - 8}
                    textAnchor={cx > width - 100 ? 'end' : cx < 100 ? 'start' : 'middle'}
                    fontSize="9.5"
                    fontWeight="bold"
                    fill={isCold ? '#0369a1' : '#065f46'}
                  >
                    {pt.tempC}°C ({pt.label.split(' ')[0]})
                  </text>
                )}
              </g>
            );
          })}

          {/* Подпись оси X */}
          <text
            x={width / 2}
            y={height - 5}
            textAnchor="middle"
            fontSize="10"
            fill="#9ca3af"
            fontWeight="bold"
          >
            Дни технологического цикла от внесения дрожжей (Brew Day → Карбонизация → Созревание)
          </text>
        </svg>
      </div>
    );
  };

  if (isPrintMode || defaultView === 'both') {
    return (
      <div className="space-y-4">
        {renderFermentSvg()}
        {renderMashSvg()}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Переключатель вкладок графика */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('ferment')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'ferment'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Кривая брожения & созревания (40 дней)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mash')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'mash'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Паузы затирания (Mash Rests)</span>
        </button>
      </div>

      {activeTab === 'ferment' ? renderFermentSvg() : renderMashSvg()}
    </div>
  );
};
