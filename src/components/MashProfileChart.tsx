import React from 'react';
import { MashRest } from '../types/brewing';
import { Thermometer, Clock } from 'lucide-react';

interface Props {
  schedule: MashRest[];
  strikeTempC?: number;
}

export const MashProfileChart: React.FC<Props> = ({ schedule, strikeTempC }) => {
  if (!schedule || schedule.length === 0) {
    return null;
  }

  // Сортировка или последовательность пауз
  // Рассчитываем таймлайн: время от начала (мин) и температуру (°C)
  let accumulatedTime = 0;
  const points: { time: number; temp: number; name: string }[] = [];

  // Начальная точка засыпи (Strike)
  const initialTemp = strikeTempC && strikeTempC > 0 ? strikeTempC : schedule[0].tempC;
  points.push({ time: 0, temp: initialTemp, name: 'Засыпь (Strike)' });

  schedule.forEach((rest) => {
    // Подъем к температуре паузы (условно 3-5 минут рамп)
    const rampTime = 3;
    accumulatedTime += rampTime;
    points.push({ time: accumulatedTime, temp: rest.tempC, name: `${rest.name} (старт)` });

    // Длительность самой паузы
    accumulatedTime += rest.timeMin;
    points.push({ time: accumulatedTime, temp: rest.tempC, name: `${rest.name} (${rest.tempC}°C, ${rest.timeMin}м)` });
  });

  const totalTime = Math.max(accumulatedTime, 30);
  const minTemp = 40;
  const maxTemp = 85;

  // SVG координаты
  const width = 600;
  const height = 180;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 20;
  const padBottom = 30;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const scaleX = (t: number) => padLeft + (t / totalTime) * chartW;
  const scaleY = (temp: number) => padTop + chartH - ((temp - minTemp) / (maxTemp - minTemp)) * chartH;

  // Построение полилинии
  const pathData = points
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(pt.time).toFixed(1)} ${scaleY(pt.temp).toFixed(1)}`)
    .join(' ');

  // Градиентная область под графиком
  const areaData = `${pathData} L ${scaleX(totalTime)} ${scaleY(minTemp)} L ${scaleX(0)} ${scaleY(minTemp)} Z`;

  // Сетки и ориентиры температур (52°C белковая, 63°C мальтозная, 72°C декстриновая, 78°C мэшаут)
  const guideTemps = [
    { temp: 52, label: '52°C Белок' },
    { temp: 63, label: '63°C β-амилаза' },
    { temp: 72, label: '72°C α-амилаза' },
    { temp: 78, label: '78°C Мэшаут' }
  ];

  return (
    <div className="p-3 sm:p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
        <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
          <Thermometer className="w-3.5 h-3.5" />
          График температурного профиля затирания
        </span>
        <span className="flex items-center gap-1 text-stone-500 font-normal">
          <Clock className="w-3 h-3" />
          Общая длительность: {accumulatedTime} мин
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[480px] h-auto select-none overflow-visible"
        >
          <defs>
            <linearGradient id="mashGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Горизонтальные направляющие температур */}
          {guideTemps.map((gt) => {
            const y = scaleY(gt.temp);
            return (
              <g key={gt.temp}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="3 3"
                  className="text-stone-300 dark:text-stone-700"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-stone-400 dark:fill-stone-500 text-[9px] font-mono"
                >
                  {gt.temp}°C
                </text>
              </g>
            );
          })}

          {/* Заливка под графиком */}
          <path d={areaData} fill="url(#mashGrad)" />

          {/* Линия профиля */}
          <path
            d={pathData}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Точки пауз с подсказками */}
          {schedule.map((rest, idx) => {
            // Находим точку плато паузы
            let t = 0;
            for (let i = 0; i <= idx; i++) {
              t += 3; // ramp
              if (i < idx) t += schedule[i].timeMin;
            }
            const midT = t + rest.timeMin / 2;
            const cx = scaleX(midT);
            const cy = scaleY(rest.tempC);

            return (
              <g key={rest.id || idx}>
                <circle cx={cx} cy={cy} r="4" fill="#d97706" stroke="#ffffff" strokeWidth="1.5" />
                <text
                  x={cx}
                  y={cy - 8}
                  textAnchor="middle"
                  className="fill-stone-800 dark:fill-stone-200 text-[10px] font-bold"
                >
                  {rest.tempC}°C ({rest.timeMin}м)
                </text>
              </g>
            );
          })}

          {/* Ось X (время) */}
          <line
            x1={padLeft}
            y1={scaleY(minTemp)}
            x2={width - padRight}
            y2={scaleY(minTemp)}
            stroke="currentColor"
            className="text-stone-300 dark:text-stone-700"
            strokeWidth="1"
          />
          <text
            x={width - padRight}
            y={scaleY(minTemp) + 18}
            textAnchor="end"
            className="fill-stone-400 text-[9px] font-mono"
          >
            Время: {totalTime} мин →
          </text>
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-stone-500 dark:text-stone-400">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          Паузы: {schedule.map(s => `${s.name} (${s.tempC}°C / ${s.timeMin}м)`).join(' → ')}
        </span>
      </div>
    </div>
  );
};
