import React, { useRef, useState, useMemo } from 'react';
import { BrewLog, FermentationBatch, Recipe } from '../types/brewing';
import {
  compileCompletedBrewReport,
  CompiledBrewReportData
} from '../utils/brewReportGenerator';
import { BrewTemperatureCurveChart } from './BrewTemperatureCurveChart';
import {
  X,
  Download,
  Printer,
  FileText,
  Award,
  Calendar,
  CheckCircle2,
  Thermometer,
  Droplets,
  Flame,
  Wheat,
  Beer,
  Sparkles,
  ChevronDown,
  Clock,
  Layers,
  Activity,
  Share2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialLog?: BrewLog | null;
  initialBatch?: FermentationBatch | null;
  allLogs: BrewLog[];
  allBatches: FermentationBatch[];
  allRecipes: Recipe[];
}

export const CompletedBrewPdfReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialLog,
  initialBatch,
  allLogs,
  allBatches,
  allRecipes
}) => {
  const printableAreaRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [chartView, setChartView] = useState<'both' | 'ferment' | 'mash'>('both');

  // Выбранный лог (по умолчанию initialLog или первый доступный лог)
  const [selectedLogId, setSelectedLogId] = useState<string>(() => {
    if (initialLog?.id) return initialLog.id;
    if (allLogs.length > 0) return allLogs[0].id;
    return '';
  });

  // Синхронизация при открытии
  React.useEffect(() => {
    if (initialLog?.id) {
      setSelectedLogId(initialLog.id);
    } else if (initialBatch) {
      // Поиск лога, соответствующего партии
      const matched = allLogs.find(
        l => l.recipeId === initialBatch.recipeId || l.batchNumber === initialBatch.batchNumber
      );
      if (matched) {
        setSelectedLogId(matched.id);
      } else if (allLogs.length > 0) {
        setSelectedLogId(allLogs[0].id);
      }
    }
  }, [initialLog, initialBatch, allLogs]);

  // Текущий выбранный лог
  const currentLog = useMemo(() => {
    return allLogs.find(l => l.id === selectedLogId) || initialLog || allLogs[0] || null;
  }, [allLogs, selectedLogId, initialLog]);

  // Связанная партия из календаря
  const currentBatch = useMemo(() => {
    if (initialBatch && (!currentLog || initialBatch.recipeId === currentLog.recipeId)) {
      return initialBatch;
    }
    if (!currentLog) return allBatches[0] || null;
    return (
      allBatches.find(
        b => b.recipeId === currentLog.recipeId || b.batchNumber === currentLog.batchNumber
      ) ||
      allBatches[0] ||
      null
    );
  }, [allBatches, currentLog, initialBatch]);

  // Связанный рецепт
  const currentRecipe = useMemo(() => {
    if (!currentLog) return allRecipes[0] || null;
    return allRecipes.find(r => r.id === currentLog.recipeId) || allRecipes[0] || null;
  }, [allRecipes, currentLog]);

  // Скомпилированные данные итогового отчета
  const reportData: CompiledBrewReportData | null = useMemo(() => {
    if (!currentLog) return null;
    return compileCompletedBrewReport(currentLog, currentBatch, currentRecipe);
  }, [currentLog, currentBatch, currentRecipe]);

  if (!isOpen || !reportData) return null;

  // Экспорт в настоящий файл .PDF через jsPDF + html2canvas
  const handleDownloadPdf = async () => {
    const element = printableAreaRef.current;
    if (!element) return;

    try {
      setIsExportingPdf(true);

      // Высококачественный рендер элемента в Canvas с масштабом 2x (Retina)
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Первая страница
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Дополнительные страницы (если отчет длинный)
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const safeBatchName = reportData.batchNumber.replace(/[^a-zA-Z0-9а-яА-Я_-]/g, '_');
      pdf.save(`mastervarka-report-${safeBatchName}-${reportData.brewDate}.pdf`);
    } catch (err) {
      console.error('PDF export error, falling back to print:', err);
      // Запасной вариант: системная печать браузера
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Экспорт автономного HTML-файла с поддержкой печати
  const handleDownloadHtml = () => {
    const element = printableAreaRef.current;
    if (!element) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Итоговый отчет варки - ${reportData.recipeName} (${reportData.batchNumber})</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1c1917; line-height: 1.4; margin: 0; padding: 20px; background: #fafaf9; }
    .report-wrap { max-width: 900px; margin: 0 auto; background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
    .no-print-bar { background: #fef3c7; border: 1px solid #f59e0b; padding: 12px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
    .btn { background: #d97706; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer; }
    @media print {
      body { background: white; padding: 0; }
      .no-print-bar { display: none; }
      .report-wrap { box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <button class="btn" onclick="window.print()">🖨️ Распечатать / Сохранить в PDF</button>
  </div>
  <div class="report-wrap">
    ${element.innerHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mastervarka-report-${reportData.batchNumber.replace(/[^a-zA-Z0-9а-яА-Я_-]/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-stone-100 dark:bg-stone-900 rounded-2xl w-full max-w-4xl max-h-[96vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        {/* Панель управления и действий (не печатается) */}
        <div className="bg-white dark:bg-stone-850 px-4 sm:px-6 py-3.5 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-stone-900 dark:text-white leading-tight">
                Итоговый отчет о результатах завершенной варки
              </h2>
              <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                <span>Журнал варок + Календарь ферментации + Температурные кривые</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Селектор варки */}
            {allLogs.length > 1 && (
              <div className="relative">
                <select
                  value={selectedLogId}
                  onChange={(e) => setSelectedLogId(e.target.value)}
                  className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-800 dark:text-stone-200 cursor-pointer pr-7 appearance-none"
                >
                  {allLogs.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.batchNumber} ({l.recipeName})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {/* Кнопка скачивания PDF */}
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
              title="Сгенерировать и скачать файл .PDF"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPdf ? 'Создание PDF...' : 'Скачать PDF'}</span>
            </button>

            {/* Кнопка печати браузера */}
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center gap-1.5 border border-stone-200 dark:border-stone-700 transition-all cursor-pointer"
              title="Распечатать или сохранить в PDF через системный принтер"
            >
              <Printer className="w-4 h-4 text-stone-500" />
              <span className="hidden sm:inline">Печать</span>
            </button>

            {/* Кнопка скачивания HTML */}
            <button
              onClick={handleDownloadHtml}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-all cursor-pointer"
              title="Скачать автономный HTML-файл"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Закрыть */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer"
              title="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Область отчета для просмотра и конвертации в PDF */}
        <div className="overflow-y-auto p-3 sm:p-6 flex justify-center bg-stone-200/60 dark:bg-stone-950">
          <div
            ref={printableAreaRef}
            id="printable-brew-report"
            className="w-full max-w-3xl bg-white text-stone-900 rounded-xl p-6 sm:p-8 shadow-md border border-stone-200 space-y-6 print:shadow-none print:border-none print:p-0 print:max-w-none"
            style={{ minHeight: '1000px' }}
          >
            {/* ШАПКА ОТЧЕТА */}
            <div className="border-b-2 border-amber-600 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wide bg-amber-100 text-amber-900 font-mono">
                    {reportData.batchNumber}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{reportData.statusLabel}</span>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-amber-950 tracking-tight">
                  {reportData.recipeName}
                </h1>
                <div className="text-xs sm:text-sm text-stone-600 font-medium mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>Стиль: <b>{reportData.style}</b> ({reportData.category})</span>
                  <span>•</span>
                  <span>Пивовар: <b>{reportData.author}</b></span>
                </div>
              </div>

              <div className="sm:text-right text-xs text-stone-500 font-mono space-y-1 shrink-0">
                <div className="font-bold text-stone-800 text-sm flex items-center sm:justify-end gap-1.5 font-sans">
                  <Beer className="w-4 h-4 text-amber-500" />
                  <span>МастерВарка • Pass/Fail Report</span>
                </div>
                <div>Дата варки: <b>{new Date(reportData.brewDate).toLocaleDateString('ru-RU')}</b></div>
                <div>Дата созревания: <b>{new Date(reportData.completionDate).toLocaleDateString('ru-RU')}</b></div>
                <div>Цветность сусла: <b style={{ color: reportData.ebcHex }}>■ {reportData.ebc} EBC</b></div>
              </div>
            </div>

            {/* РАЗДЕЛ 1: СВОДКА ПЛАН VS ФАКТ (СВЕДЕНИЯ ИЗ ЖУРНАЛА И РЕЦЕПТА) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-600" />
                  <span>1. Метрология варки: План vs Фактические замеры</span>
                </h3>
                <span className="text-[11px] text-stone-500 font-mono">
                  Аттенюация: <b>{reportData.attenuationPercent.actual}%</b> (план: {reportData.attenuationPercent.target}%)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                {/* Начальная плотность (OG) */}
                <div className="p-3 rounded-lg border border-stone-200 bg-stone-50 text-center">
                  <div className="text-[10px] text-stone-500 font-sans uppercase font-bold">
                    Начальная плотность (OG)
                  </div>
                  <div className="text-lg font-black text-stone-900 mt-0.5">
                    {reportData.og.actual.toFixed(3)}
                  </div>
                  <div className="text-[10px] text-stone-500 font-sans">
                    план: {reportData.og.target.toFixed(3)} ({reportData.og.actualPlato.toFixed(1)}°P)
                  </div>
                  <div className={`text-[10px] font-bold mt-1 ${reportData.og.delta >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    Δ {reportData.og.delta >= 0 ? `+${reportData.og.delta}` : reportData.og.delta}
                  </div>
                </div>

                {/* Конечная плотность (FG) */}
                <div className="p-3 rounded-lg border border-stone-200 bg-stone-50 text-center">
                  <div className="text-[10px] text-stone-500 font-sans uppercase font-bold">
                    Конечная плотность (FG)
                  </div>
                  <div className="text-lg font-black text-stone-900 mt-0.5">
                    {reportData.fg.actual.toFixed(3)}
                  </div>
                  <div className="text-[10px] text-stone-500 font-sans">
                    план: {reportData.fg.target.toFixed(3)} ({reportData.fg.actualPlato.toFixed(1)}°P)
                  </div>
                  <div className={`text-[10px] font-bold mt-1 ${Math.abs(reportData.fg.delta) <= 0.002 ? 'text-emerald-700' : 'text-blue-700'}`}>
                    Δ {reportData.fg.delta >= 0 ? `+${reportData.fg.delta}` : reportData.fg.delta}
                  </div>
                </div>

                {/* Крепость (ABV) */}
                <div className="p-3 rounded-lg border border-stone-200 bg-stone-50 text-center">
                  <div className="text-[10px] text-stone-500 font-sans uppercase font-bold">
                    Алкоголь (ABV)
                  </div>
                  <div className="text-lg font-black text-amber-700 mt-0.5">
                    {reportData.abv.actual}%
                  </div>
                  <div className="text-[10px] text-stone-500 font-sans">
                    план: {reportData.abv.target}% об.
                  </div>
                  <div className="text-[10px] font-bold text-emerald-700 mt-1">
                    Горечь: {reportData.ibu} IBU
                  </div>
                </div>

                {/* Эффективность & pH */}
                <div className="p-3 rounded-lg border border-stone-200 bg-stone-50 text-center">
                  <div className="text-[10px] text-stone-500 font-sans uppercase font-bold">
                    Эффективность & pH
                  </div>
                  <div className="text-lg font-black text-stone-900 mt-0.5">
                    {reportData.efficiency.actual}%
                  </div>
                  <div className="text-[10px] text-stone-500 font-sans">
                    pH затора: <b>{reportData.mashPh}</b>
                  </div>
                  <div className="text-[10px] font-bold text-stone-600 mt-1">
                    Брожение: {reportData.fermentTempC}°C
                  </div>
                </div>
              </div>
            </div>

            {/* РАЗДЕЛ 2: ГРАФИКИ ТЕМПЕРАТУРНОЙ КРИВОЙ */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-amber-600" />
                  <span>2. Температурные кривые технологического процесса</span>
                </h3>
                <span className="text-[11px] text-stone-500">
                  Затирание (паузы в мин) & Брожение/созревание (40 дней)
                </span>
              </div>

              {/* Рендер векторного SVG графика температур */}
              <BrewTemperatureCurveChart
                mashCurve={reportData.mashCurve}
                fermentCurve={reportData.fermentCurve}
                defaultView="both"
                isPrintMode={true}
              />
            </div>

            {/* РАЗДЕЛ 3: ЭТАПЫ ИЗ КАЛЕНДАРЯ ФЕРМЕНТАЦИИ */}
            {reportData.batchStages.length > 0 && (
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5 mb-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>3. Технологический регламент и стадии из календаря варок</span>
                </h3>

                <div className="border border-stone-200 rounded-lg overflow-hidden text-xs">
                  <table className="w-full border-collapse">
                    <thead className="bg-stone-100 border-b border-stone-200 font-bold text-stone-700 text-[11px]">
                      <tr>
                        <th className="p-2 text-left">Этап процесса</th>
                        <th className="p-2 text-center">День / Дата</th>
                        <th className="p-2 text-center">Температура</th>
                        <th className="p-2 text-center">Дней</th>
                        <th className="p-2 text-left">Технологическое действие</th>
                        <th className="p-2 text-center">Статус</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                      {reportData.batchStages.map((stage, idx) => (
                        <tr key={stage.id || idx} className="hover:bg-stone-50/80">
                          <td className="p-2 font-sans font-bold text-stone-800">
                            {stage.name}
                          </td>
                          <td className="p-2 text-center text-stone-600">
                            {stage.dateStr} (д.{stage.dayOffset})
                          </td>
                          <td className="p-2 text-center font-bold text-amber-800">
                            {stage.targetTempC}°C
                          </td>
                          <td className="p-2 text-center text-stone-600">
                            {stage.durationDays > 0 ? `${stage.durationDays} дн.` : '—'}
                          </td>
                          <td className="p-2 font-sans text-stone-600 text-[10px]">
                            {stage.actionRequired || stage.description}
                          </td>
                          <td className="p-2 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              ✓ Выполнен
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* РАЗДЕЛ 4: ДЕГУСТАЦИОННАЯ КАРТОЧКА BJCP И ОРГАНОЛЕПТИКА */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>4. Судейская дегустационная оценка (BJCP Score Sheet)</span>
                  </h3>
                  <div className="text-[11px] text-stone-600 mt-0.5">
                    Ранг: <b>{reportData.bjcp.rankTitle}</b> — {reportData.bjcp.rankDescription}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-3xl font-black text-amber-700 font-mono">
                    {reportData.bjcp.totalScore}
                    <span className="text-xs text-stone-400 font-normal"> / 50</span>
                  </div>
                  <div className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${reportData.bjcp.badgeColor}`}>
                    {reportData.bjcp.totalScore >= 38 ? 'Gold Class' : 'Approved'}
                  </div>
                </div>
              </div>

              {/* Шкала компонентов BJCP */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
                <div className="p-2 rounded bg-white border border-amber-200">
                  <div className="text-[10px] text-stone-500 font-sans">Аромат (12)</div>
                  <b className="text-amber-800 text-sm">{reportData.bjcp.breakdown.aroma}</b>
                </div>
                <div className="p-2 rounded bg-white border border-amber-200">
                  <div className="text-[10px] text-stone-500 font-sans">Вид и пена (3)</div>
                  <b className="text-amber-800 text-sm">{reportData.bjcp.breakdown.appearance}</b>
                </div>
                <div className="p-2 rounded bg-white border border-amber-200">
                  <div className="text-[10px] text-stone-500 font-sans">Вкус (20)</div>
                  <b className="text-amber-800 text-sm">{reportData.bjcp.breakdown.flavor}</b>
                </div>
                <div className="p-2 rounded bg-white border border-amber-200">
                  <div className="text-[10px] text-stone-500 font-sans">Тело/хруст (5)</div>
                  <b className="text-amber-800 text-sm">{reportData.bjcp.breakdown.mouthfeel}</b>
                </div>
                <div className="p-2 rounded bg-white border border-amber-200">
                  <div className="text-[10px] text-stone-500 font-sans">Впечатление (10)</div>
                  <b className="text-amber-800 text-sm">{reportData.bjcp.breakdown.overall}</b>
                </div>
              </div>

              {/* Дегустационные заметки */}
              <div className="space-y-1.5 text-xs text-stone-700 bg-white p-3 rounded-lg border border-amber-200/60">
                <div>
                  <b className="text-amber-900">Аромат:</b> {reportData.tastingNotes.aroma}
                </div>
                <div>
                  <b className="text-amber-900">Внешний вид:</b> {reportData.tastingNotes.appearance}
                </div>
                <div>
                  <b className="text-amber-900">Вкус и горечь:</b> {reportData.tastingNotes.flavor}
                </div>
                <div>
                  <b className="text-amber-900">Тело и карбонизация:</b> {reportData.tastingNotes.mouthfeel}
                </div>
                <div className="pt-1 border-t border-stone-100">
                  <b className="text-amber-950">Итоговое резюме пивовара:</b> {reportData.tastingNotes.overall}
                </div>
              </div>

              {/* Заметки о ходе варки */}
              {reportData.notes && (
                <div className="text-[11px] text-stone-600 italic bg-amber-100/50 p-2.5 rounded border border-amber-200/50">
                  «{reportData.notes}»
                </div>
              )}
            </div>

            {/* РАЗДЕЛ 5: СПРАВКА ПО РЕЦЕПТУ И ИНГРЕДИЕНТАМ */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5 mb-2">
                <Wheat className="w-4 h-4 text-amber-600" />
                <span>5. Рецептурная карта и расход сырья</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Солода */}
                <div className="border border-stone-200 rounded-lg p-2.5 bg-stone-50/50">
                  <div className="font-bold text-stone-800 mb-1 flex justify-between">
                    <span>Зерновая засыпь:</span>
                    <span className="text-stone-500 font-mono">
                      {reportData.ingredientsSummary.grains.reduce((a, b) => a + b.weightKg, 0).toFixed(2)} кг
                    </span>
                  </div>
                  <ul className="space-y-1 font-mono text-[11px] text-stone-600">
                    {reportData.ingredientsSummary.grains.map((g, i) => (
                      <li key={i} className="flex justify-between">
                        <span className="font-sans">{g.name}</span>
                        <span>{g.weightKg} кг ({g.percent}%)</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Хмели и дрожжи */}
                <div className="border border-stone-200 rounded-lg p-2.5 bg-stone-50/50">
                  <div className="font-bold text-stone-800 mb-1 flex justify-between">
                    <span>Хмели & Дрожжи:</span>
                    <span className="text-stone-500 font-mono">
                      {reportData.ingredientsSummary.yeast.name}
                    </span>
                  </div>
                  <ul className="space-y-1 font-mono text-[11px] text-stone-600">
                    {reportData.ingredientsSummary.hops.map((h, i) => (
                      <li key={i} className="flex justify-between">
                        <span className="font-sans">{h.name} ({h.use === 'dry_hop' ? 'Сухое охмеление' : `${h.boilTimeMin} мин`})</span>
                        <span>{h.weightG} г</span>
                      </li>
                    ))}
                    <li className="pt-1 border-t border-stone-200 flex justify-between text-stone-700">
                      <span className="font-sans">💧 Заторная / Промывочная вода:</span>
                      <span>{reportData.ingredientsSummary.water.strikeL} л / {reportData.ingredientsSummary.water.spargeL} л</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ПОДВАЛ И МЕТКА ВАЛИДАЦИИ */}
            <div className="pt-4 border-t border-dashed border-stone-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-700">МастерВарка v1.0.34</span>
                <span>• Автоматически сгенерированный сертифицированный отчет варки</span>
              </div>
              <div className="font-mono text-[11px]">
                Создан: {new Date().toLocaleDateString('ru-RU')} {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
