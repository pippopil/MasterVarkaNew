import React, { useRef, useMemo } from 'react';
import { Recipe } from '../types/brewing';
import { X, Printer, Download, CheckSquare, Sparkles, Droplets, Flame, Wheat, Layers, Clock } from 'lucide-react';
import { ebcToHex, calculateBrewMetrics } from '../utils/brewingMath';

interface Props {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintableBrewSheetModal: React.FC<Props> = ({
  recipe,
  isOpen,
  onClose
}) => {
  const printableAreaRef = useRef<HTMLDivElement>(null);

  // Безопасный расчет метрик рецепта, если recipe.calculated не был предварительно вычислен
  const calc = useMemo(() => {
    if (!recipe) return null;
    if (recipe.calculated && typeof recipe.calculated.ogSg === 'number' && !isNaN(recipe.calculated.ogSg)) {
      return recipe.calculated;
    }
    try {
      return calculateBrewMetrics({
        batchSizeL: recipe.batchSizeL || 30,
        boilTimeMin: recipe.boilTimeMin || 60,
        efficiencyPercent: recipe.efficiencyPercent || 72,
        grainRatioLPerKg: recipe.grainRatioLPerKg || 3.5,
        grainTempC: recipe.grainTempC || 20,
        targetCarbonationVol: recipe.targetCarbonationVol || 2.4,
        beerTempAtBottlingC: recipe.beerTempAtBottlingC || 20,
        grains: recipe.grains || [],
        hops: recipe.hops || [],
        yeast: recipe.yeast || { name: 'US-05', type: 'ale', form: 'dry', lab: 'Fermentis', attenuationPercent: 78, tempRange: [18, 22] },
        otherIngredients: recipe.otherIngredients || []
      });
    } catch (e) {
      console.warn('Failed to calculate metrics for brew sheet:', e);
      return null;
    }
  }, [recipe]);

  if (!isOpen || !recipe) return null;

  const ogSg = Number(calc?.ogSg ?? 1.050);
  const ogPlato = Number(calc?.ogPlato ?? 12.4);
  const fgSg = Number(calc?.fgSg ?? 1.010);
  const fgPlato = Number(calc?.fgPlato ?? 2.6);
  const abv = Number(calc?.abv ?? 5.2);
  const ibu = Math.round(Number(calc?.ibu ?? 35));
  const ebc = Math.round(Number(calc?.ebc ?? 12));
  const strikeWaterL = Number(calc?.strikeWaterL ?? 18);
  const spargeWaterL = Number(calc?.spargeWaterL ?? 16);
  const totalWaterL = Number(calc?.totalWaterL ?? 34);
  const strikeTempC = Number(calc?.strikeTempC ?? 72);
  const totalGrainWeightKg = Number(calc?.totalGrainWeightKg ?? 5);
  const dextroseGrams = Math.round(Number(calc?.dextroseGrams ?? 140));

  const safeGrains = recipe.grains || [];
  const safeHops = recipe.hops || [];
  const safeMash = recipe.mashSchedule || [];
  const safeYeast = recipe.yeast || { name: 'US-05', type: 'ale', form: 'dry', lab: 'Fermentis', attenuationPercent: 78, tempRange: [18, 22] };

  // Скачивание автономного HTML-файла с встроенными стилями печати в PDF
  const handleDownloadHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Варочный лист - ${recipe.name}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #111; line-height: 1.35; margin: 0; padding: 0; background: white; font-size: 11pt; }
    .header { border-bottom: 2px solid #b45309; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end; }
    .title { font-size: 20pt; font-weight: 900; color: #92400e; margin: 0; }
    .subtitle { font-size: 11pt; color: #555; font-weight: bold; margin-top: 3px; }
    .badge { font-size: 9pt; background: #fef3c7; border: 1px solid #f59e0b; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 14px; }
    .metric-card { border: 1px solid #ddd; padding: 6px 10px; border-radius: 6px; text-align: center; }
    .metric-label { font-size: 8pt; text-transform: uppercase; color: #666; font-weight: bold; }
    .metric-val { font-size: 13pt; font-weight: 800; color: #111; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 10pt; }
    th { background: #f3f4f6; border-bottom: 2px solid #ccc; text-align: left; padding: 5px 8px; font-size: 9pt; text-transform: uppercase; color: #333; }
    td { border-bottom: 1px solid #eee; padding: 5px 8px; }
    .section-title { font-size: 12pt; font-weight: 800; border-bottom: 1px solid #ddd; padding-bottom: 3px; margin: 12px 0 6px 0; color: #78350f; display: flex; align-items: center; justify-content: space-between; }
    .water-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 8px 12px; margin-bottom: 14px; font-size: 10pt; }
    .checkbox-item { display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 10pt; }
    .box { width: 13px; height: 13px; border: 1.5px solid #444; border-radius: 2px; display: inline-block; }
    .footer { margin-top: 20px; padding-top: 8px; border-top: 1px dashed #ccc; font-size: 8pt; color: #777; display: flex; justify-content: space-between; }
    .no-print-bar { background: #fef3c7; border-bottom: 1px solid #f59e0b; padding: 10px; text-align: center; }
    .btn { background: #d97706; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 12pt; cursor: pointer; }
    @media print { .no-print-bar { display: none; } }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <button class="btn" onclick="window.print()">🖨️ Распечатать / Сохранить в PDF</button>
  </div>
  <div style="padding: 15px;">
    <div class="header">
      <div>
        <h1 class="title">${recipe.name}</h1>
        <div class="subtitle">Стиль: ${recipe.style} (${recipe.category})</div>
      </div>
      <div style="text-align: right;">
        <span class="badge">МастерВарка • Варочный лист</span>
        <div style="font-size: 9pt; color: #777; margin-top: 4px;">Объем партии: <b>${recipe.batchSizeL} л</b> | Дата: ${new Date().toLocaleDateString('ru-RU')}</div>
      </div>
    </div>

    <div class="grid">
      <div class="metric-card">
        <div class="metric-label">Плотность (OG)</div>
        <div class="metric-val">${ogSg.toFixed(3)} (${ogPlato.toFixed(1)}°P)</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Алкоголь (ABV)</div>
        <div class="metric-val">${abv.toFixed(1)}%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Горечь (IBU)</div>
        <div class="metric-val">${ibu} IBU</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Цветность (EBC)</div>
        <div class="metric-val">${ebc} EBC</div>
      </div>
    </div>

    <div class="water-box">
      <b>💧 Водный расчет:</b> Заторная вода: <b>${strikeWaterL} л</b> (нагрев под засыпь: <b>${strikeTempC}°C</b>) | Промывочная вода: <b>${spargeWaterL} л</b> (температура: <b>76-78°C</b>) | Общий объем воды: <b>${totalWaterL} л</b>
    </div>

    <div class="section-title">
      <span>1. Зерновая засыпь (Всего: ${totalGrainWeightKg} кг)</span>
      <span style="font-size: 9pt; font-weight: normal; color: #555;">Эффективность: ${recipe.efficiencyPercent}%</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>Солод / Зерно</th>
          <th>Тип</th>
          <th>Цвет</th>
          <th>Вес</th>
          <th>Доля</th>
        </tr>
      </thead>
      <tbody>
        ${safeGrains.map(g => `
          <tr>
            <td><b>${g.name}</b></td>
            <td>${g.type}</td>
            <td>${g.colorEbc} EBC</td>
            <td><b>${g.weightKg} кг</b></td>
            <td>${((g.weightKg / Math.max(0.1, totalGrainWeightKg)) * 100).toFixed(1)}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="section-title">2. Температурные паузы затирания (Гидромодуль: 1:${recipe.grainRatioLPerKg || 3.5})</div>
    <table>
      <thead>
        <tr>
          <th>Пауза</th>
          <th>Температура</th>
          <th>Время</th>
          <th>Назначение</th>
        </tr>
      </thead>
      <tbody>
        ${safeMash.map(m => `
          <tr>
            <td><b>${m.name}</b></td>
            <td>${m.tempC}°C</td>
            <td>${m.timeMin} мин</td>
            <td>${m.description || '—'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="section-title">3. Профиль охмеления (Кипячение: ${recipe.boilTimeMin || 60} мин)</div>
    <table>
      <thead>
        <tr>
          <th>Хмель</th>
          <th>Назначение</th>
          <th>Время</th>
          <th>Альфа (α)</th>
          <th>Навеска</th>
        </tr>
      </thead>
      <tbody>
        ${safeHops.map(h => `
          <tr>
            <td><b>${h.name}</b></td>
            <td>${h.use === 'boil' ? 'В котел' : h.use === 'dry_hop' ? 'Сухое охмеление' : h.use === 'whirlpool' ? 'Вирпул (80°C)' : 'Аромат'}</td>
            <td>${h.boilTimeMin} мин</td>
            <td>${h.alphaAcid}%</td>
            <td><b>${h.weightG} г</b></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="section-title">4. Дрожжи и ферментация</div>
    <div style="font-size: 10pt; margin-bottom: 10px;">
      Штамм: <b>${safeYeast.name}</b> (${safeYeast.lab || ''}) | Сбраживаемость: <b>${safeYeast.attenuationPercent}%</b> | Диапазон брожения: <b>${safeYeast.tempRange?.[0] ?? 18}–${safeYeast.tempRange?.[1] ?? 22}°C</b> | Карбонизация: <b>${dextroseGrams} г декстрозы</b> (${recipe.targetCarbonationVol || 2.4} CO2)
    </div>

    <div class="section-title">5. Чек-лист пивовара в день варки</div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
      <div class="checkbox-item"><span class="box"></span> Вода нагрета до ${strikeTempC}°C</div>
      <div class="checkbox-item"><span class="box"></span> Засыпь внесена, комки разбиты</div>
      <div class="checkbox-item"><span class="box"></span> Йодная проба чистая (без синевы)</div>
      <div class="checkbox-item"><span class="box"></span> Мэшаут 78°C выполнен</div>
      <div class="checkbox-item"><span class="box"></span> Сусло прозрачное после рециркуляции</div>
      <div class="checkbox-item"><span class="box"></span> Кипячение ${recipe.boilTimeMin || 60} мин выдержано</div>
      <div class="checkbox-item"><span class="box"></span> Охлаждено чиллером до ${safeYeast.tempRange?.[0] ?? 18}°C</div>
      <div class="checkbox-item"><span class="box"></span> Дрожжи внесены, гидрозатвор бурлит</div>
    </div>

    <div class="footer">
      <span>Сгенерировано в приложении «МастерВарка»</span>
      <span>Фактическая OG: _________ | Фактическая FG: _________ | Дата розлива: _________</span>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Варочный_лист_${recipe.name.replace(/[^a-zA-Zа-яА-Я0-9_]/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    // В Android WebView window.print может быть недоступен, поэтому предлагаем сразу сохранить HTML если не сработает
    try {
      window.print();
    } catch {
      handleDownloadHtml();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Шапка модального окна */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3 bg-gradient-to-r from-amber-50 to-stone-50 dark:from-stone-900 dark:to-stone-950 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-lg shrink-0">
              📄
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-stone-900 dark:text-white truncate">
                Варочный лист и экспорт в PDF
              </h2>
              <p className="text-[11px] text-stone-500 truncate">
                «{recipe.name}» • {recipe.batchSizeL} л
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Скачать файл для сохранения в PDF или открытия на телефоне"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Сохранить в PDF / HTML</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Печать через браузер"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Печать</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Прокручиваемый предпросмотр печатного паспорта */}
        <div ref={printableAreaRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/50 dark:bg-stone-950/50">
          <div className="bg-white dark:bg-stone-900 p-5 sm:p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-5 text-stone-900 dark:text-stone-100">
            {/* Заголовок листа */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b-2 border-amber-500 pb-3">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">
                  Паспорт варки • МастерВарка
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white mt-0.5 break-words">
                  {recipe.name}
                </h1>
                <div className="text-xs font-semibold text-stone-500 break-words">
                  Стиль: {recipe.style} ({recipe.category})
                </div>
              </div>
              <div className="text-left sm:text-right text-xs text-stone-500">
                <div>Объем варки: <b className="text-stone-900 dark:text-stone-100">{recipe.batchSizeL} л</b></div>
                <div>Дата формирования: {new Date().toLocaleDateString('ru-RU')}</div>
              </div>
            </div>

            {/* Метрики */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-300/40 text-center">
                <div className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300">Плотность (OG)</div>
                <div className="text-base font-black font-mono mt-0.5">{ogSg.toFixed(3)} ({ogPlato.toFixed(1)}°P)</div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-300/40 text-center">
                <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">Алкоголь (ABV)</div>
                <div className="text-base font-black font-mono mt-0.5">{abv.toFixed(1)}%</div>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-300/40 text-center">
                <div className="text-[10px] uppercase font-bold text-sky-800 dark:text-sky-300">Горечь (IBU)</div>
                <div className="text-base font-black font-mono mt-0.5">{ibu} IBU</div>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center">
                <div className="text-[10px] uppercase font-bold text-stone-600 dark:text-stone-400">Цвет (EBC)</div>
                <div className="text-base font-black font-mono mt-0.5 flex items-center justify-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border border-stone-400" style={{ backgroundColor: ebcToHex(ebc) }} />
                  <span>{ebc} EBC</span>
                </div>
              </div>
            </div>

            {/* Водный расчет */}
            <div className="p-3 rounded-xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 text-xs text-sky-950 dark:text-sky-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-600 shrink-0" />
                <span>
                  Заторная вода: <b>{strikeWaterL} л</b> (нагрев до <b>{strikeTempC}°C</b>) • Промывочная вода: <b>{spargeWaterL} л</b> (76-78°C)
                </span>
              </div>
              <div className="font-bold">
                Всего воды: {totalWaterL} л
              </div>
            </div>

            {/* Зерновая засыпь */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-1">
                <h3 className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Wheat className="w-3.5 h-3.5" />
                  <span>1. Зерновая засыпь (Всего {totalGrainWeightKg} кг)</span>
                </h3>
                <span className="text-[11px] text-stone-500">Эффективность: {recipe.efficiencyPercent || 72}%</span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-stone-500 border-b border-stone-200 dark:border-stone-800 text-[10px] uppercase">
                    <th className="py-1 text-left">Солод / Зерно</th>
                    <th className="py-1 text-left">Тип</th>
                    <th className="py-1 text-center">Цвет</th>
                    <th className="py-1 text-right">Вес</th>
                    <th className="py-1 text-right">Доля</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {safeGrains.map(g => (
                    <tr key={g.id}>
                      <td className="py-1.5 font-bold">{g.name}</td>
                      <td className="py-1.5 text-stone-500">{g.type}</td>
                      <td className="py-1.5 text-center font-mono">{g.colorEbc} EBC</td>
                      <td className="py-1.5 text-right font-black font-mono">{g.weightKg} кг</td>
                      <td className="py-1.5 text-right font-mono text-stone-500">
                        {((g.weightKg / Math.max(0.1, totalGrainWeightKg)) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Затирание */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5 border-b border-stone-200 dark:border-stone-800 pb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>2. Паузы затирания (Гидромодуль: 1:{recipe.grainRatioLPerKg || 3.5})</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {safeMash.map(m => (
                  <div key={m.id} className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                    <div className="font-bold text-[11px] truncate">{m.name}</div>
                    <div className="text-amber-700 dark:text-amber-400 font-mono font-black mt-0.5">
                      {m.tempC}°C • {m.timeMin} мин
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Хмель */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 border-b border-stone-200 dark:border-stone-800 pb-1">
                <Flame className="w-3.5 h-3.5" />
                <span>3. Охмеление (Кипячение {recipe.boilTimeMin || 60} мин)</span>
              </h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-stone-500 border-b border-stone-200 dark:border-stone-800 text-[10px] uppercase">
                    <th className="py-1 text-left">Хмель</th>
                    <th className="py-1 text-left">Внесение</th>
                    <th className="py-1 text-center">Время</th>
                    <th className="py-1 text-center">Альфа</th>
                    <th className="py-1 text-right">Навеска</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {safeHops.map(h => (
                    <tr key={h.id}>
                      <td className="py-1.5 font-bold">{h.name}</td>
                      <td className="py-1.5 text-stone-500">{h.use}</td>
                      <td className="py-1.5 text-center font-mono">{h.boilTimeMin} мин</td>
                      <td className="py-1.5 text-center font-mono">{h.alphaAcid}%</td>
                      <td className="py-1.5 text-right font-black font-mono text-emerald-700 dark:text-emerald-400">{h.weightG} г</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Дрожжи */}
            <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-850 text-xs">
              <span className="font-bold text-purple-900 dark:text-purple-300">🧪 Дрожжи: </span>
              <span>{safeYeast.name} ({safeYeast.lab || ''}) • Брожение: <b>{safeYeast.tempRange?.[0] ?? 18}–{safeYeast.tempRange?.[1] ?? 22}°C</b> • Сбраживаемость: <b>{safeYeast.attenuationPercent ?? 75}%</b> • Пакет праймера: <b>{dextroseGrams} г декстрозы</b></span>
            </div>

            {/* Чек-лист */}
            <div className="space-y-1.5 pt-1">
              <h3 className="font-bold text-xs uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Чек-лист варки</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-stone-600 dark:text-stone-400">
                <div className="flex items-center gap-1.5"><input type="checkbox" className="rounded" /> Вода подогрета</div>
                <div className="flex items-center gap-1.5"><input type="checkbox" className="rounded" /> Затор внесен</div>
                <div className="flex items-center gap-1.5"><input type="checkbox" className="rounded" /> Йодная проба чистая</div>
                <div className="flex items-center gap-1.5"><input type="checkbox" className="rounded" /> Промывка завершена</div>
                <div className="flex items-center gap-1.5"><input type="checkbox" className="rounded" /> Кипячение выдержано</div>
                <div className="flex items-center gap-1.5"><input type="checkbox" className="rounded" /> Быстро охлаждено</div>
                <div className="flex items-center gap-1.5"><input type="checkbox" className="rounded" /> Дрожжи заданы</div>
                <div className="flex items-center gap-1.5"><input type="checkbox" className="rounded" /> Гидрозатвор активен</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
