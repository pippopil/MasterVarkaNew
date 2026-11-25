import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Award,
  Wheat,
  Beer,
  Thermometer,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Sliders,
  ChevronDown,
  Info,
  Check
} from 'lucide-react';
import { Recipe } from '../types/brewing';
import { BJCP_STYLES, balanceRecipeForStyle } from '../utils/brewingMath';
import {
  BjcpAnalysisResult,
  analyzeRecipeWithAiStudio,
  analyzeRecipeLocally
} from '../services/bjcpAiService';
import { loadTokenSettings } from '../utils/aiTokenManager';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
  rawFileContent?: string;
  onApplyRecipeUpdates: (updatedRecipe: Recipe) => void;
}

export const BjcpStyleAnalysisModal: React.FC<Props> = ({
  isOpen,
  onClose,
  recipe,
  rawFileContent,
  onApplyRecipeUpdates
}) => {
  const [targetStyle, setTargetStyle] = useState<string>(recipe.style || 'American Pale Ale');
  const [analysis, setAnalysis] = useState<BjcpAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedNotice, setAppliedNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTargetStyle(recipe.style || 'American Pale Ale');
      runAnalysis(recipe.style || 'American Pale Ale');
    } else {
      setAppliedNotice(false);
    }
  }, [isOpen, recipe.id]);

  const runAnalysis = async (styleToTest: string) => {
    setIsLoading(true);
    setAppliedNotice(false);
    try {
      const settings = loadTokenSettings();
      const result = await analyzeRecipeWithAiStudio(recipe, rawFileContent, styleToTest, settings);
      setAnalysis(result);
    } catch (err) {
      const fallback = analyzeRecipeLocally(recipe, styleToTest);
      setAnalysis(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyAiSuggestions = () => {
    const recipeWithTargetStyle: Recipe = {
      ...recipe,
      style: targetStyle,
      updatedAt: new Date().toISOString()
    };
    const { balancedRecipe } = balanceRecipeForStyle(recipeWithTargetStyle);
    onApplyRecipeUpdates(balancedRecipe);
    setAppliedNotice(true);
    setTimeout(() => setAppliedNotice(false), 3000);
  };


  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92dvh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0 bg-stone-50 dark:bg-stone-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-white leading-tight flex items-center gap-2">
                <span>ИИ-Анализ стиля BJCP</span>
                {analysis?.providerUsed && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                    {analysis.providerUsed}
                  </span>
                )}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Экспертная оценка соответствия BJCP 2021, советы по засыпи и охмелению
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Style selector toolbar */}
        <div className="px-4 py-2.5 bg-stone-100 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-600 dark:text-stone-300">Целевой стиль BJCP:</span>
            <select
              value={targetStyle}
              onChange={(e) => {
                setTargetStyle(e.target.value);
                runAnalysis(e.target.value);
              }}
              className="bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg px-2.5 py-1 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              {BJCP_STYLES.map((st) => (
                <option key={st.id} value={st.name}>
                  {st.name} ({st.category})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => runAnalysis(targetStyle)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 font-bold hover:bg-stone-50 flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-purple-600' : ''}`} />
            <span>Пересчитать</span>
          </button>
        </div>

        {/* Modal body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center animate-bounce">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-stone-800 dark:text-stone-200 block">
                  ИИ-эксперт анализирует рецепт...
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 mt-1 block">
                  Сверка засыпи, баланса горечи BU:GU и профиля брожения по канонам BJCP
                </span>
              </div>
            </div>
          )}

          {!isLoading && analysis && (
            <div className="space-y-4 animate-in fade-in">
              {/* Score & Verdict Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-amber-50 dark:from-purple-950/40 dark:to-amber-950/20 border border-purple-200 dark:border-purple-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-bold text-purple-950 dark:text-purple-300">
                      Соответствие стилю: <strong>{analysis.styleName}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 dark:text-stone-300 font-medium leading-relaxed">
                    {analysis.verdict}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white font-black text-sm shadow-xs">
                    <span>{analysis.overallScore}</span>
                    <span className="text-[10px] opacity-80">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Vital Stats Table */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-500" />
                  <span>Попадание параметров в критерии BJCP:</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {/* OG */}
                  <div className={`p-2.5 rounded-xl border ${
                    analysis.vitalStats.og.inRange
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                      : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900'
                  }`}>
                    <div className="flex justify-between items-center text-[10px] text-stone-500 font-medium">
                      <span>Начальная плотность (OG)</span>
                      {analysis.vitalStats.og.inRange ? (
                        <Check className="w-3 h-3 text-emerald-600 font-bold" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-600 font-bold" />
                      )}
                    </div>
                    <div className="font-extrabold text-sm text-stone-900 dark:text-white mt-0.5">
                      {analysis.vitalStats.og.actual} SG
                    </div>
                    <div className="text-[10px] text-stone-500 dark:text-stone-400">
                      Норма: {analysis.vitalStats.og.target}
                    </div>
                  </div>

                  {/* IBU */}
                  <div className={`p-2.5 rounded-xl border ${
                    analysis.vitalStats.ibu.inRange
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                      : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900'
                  }`}>
                    <div className="flex justify-between items-center text-[10px] text-stone-500 font-medium">
                      <span>Горечь (IBU)</span>
                      {analysis.vitalStats.ibu.inRange ? (
                        <Check className="w-3 h-3 text-emerald-600 font-bold" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-600 font-bold" />
                      )}
                    </div>
                    <div className="font-extrabold text-sm text-stone-900 dark:text-white mt-0.5">
                      {analysis.vitalStats.ibu.actual} IBU
                    </div>
                    <div className="text-[10px] text-stone-500 dark:text-stone-400">
                      Норма: {analysis.vitalStats.ibu.target}
                    </div>
                  </div>

                  {/* ABV */}
                  <div className={`p-2.5 rounded-xl border ${
                    analysis.vitalStats.abv.inRange
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                      : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900'
                  }`}>
                    <div className="flex justify-between items-center text-[10px] text-stone-500 font-medium">
                      <span>Крепость (ABV)</span>
                      {analysis.vitalStats.abv.inRange ? (
                        <Check className="w-3 h-3 text-emerald-600 font-bold" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-600 font-bold" />
                      )}
                    </div>
                    <div className="font-extrabold text-sm text-stone-900 dark:text-white mt-0.5">
                      {analysis.vitalStats.abv.actual}%
                    </div>
                    <div className="text-[10px] text-stone-500 dark:text-stone-400">
                      Норма: {analysis.vitalStats.abv.target}
                    </div>
                  </div>

                  {/* Color EBC */}
                  <div className={`p-2.5 rounded-xl border ${
                    analysis.vitalStats.colorEbc.inRange
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                      : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900'
                  }`}>
                    <div className="flex justify-between items-center text-[10px] text-stone-500 font-medium">
                      <span>Цвет (EBC)</span>
                      {analysis.vitalStats.colorEbc.inRange ? (
                        <Check className="w-3 h-3 text-emerald-600 font-bold" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-600 font-bold" />
                      )}
                    </div>
                    <div className="font-extrabold text-sm text-stone-900 dark:text-white mt-0.5">
                      {analysis.vitalStats.colorEbc.actual} EBC
                    </div>
                    <div className="text-[10px] text-stone-500 dark:text-stone-400">
                      Норма: {analysis.vitalStats.colorEbc.target}
                    </div>
                  </div>

                  {/* BU:GU Ratio */}
                  <div className="p-2.5 rounded-xl border bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 col-span-2">
                    <div className="flex justify-between items-center text-[10px] text-stone-500 font-medium">
                      <span>Баланс горечи к телу (BU:GU)</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        Цель: {analysis.vitalStats.buGuRatio.target}
                      </span>
                    </div>
                    <div className="font-extrabold text-sm text-stone-900 dark:text-white mt-0.5 flex items-baseline gap-2">
                      <span>{analysis.vitalStats.buGuRatio.actual}</span>
                      <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400">
                        ({analysis.vitalStats.buGuRatio.comment})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. Grain Bill Recommendations */}
              <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Wheat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-bold text-amber-950 dark:text-amber-300">
                    Советы по улучшению засыпи (Grain Bill)
                  </span>
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                  {analysis.grainBillAnalysis.summary}
                </p>
                {analysis.grainBillAnalysis.recommendations.length > 0 && (
                  <ul className="space-y-1 text-xs">
                    {analysis.grainBillAnalysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-stone-800 dark:text-stone-200">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {analysis.grainBillAnalysis.suggestedAdjustments?.length > 0 && (
                  <div className="p-2 rounded-xl bg-amber-100/60 dark:bg-amber-900/30 text-[11px] text-amber-900 dark:text-amber-200">
                    <span className="font-bold block mb-0.5">Точечная оптимизация:</span>
                    {analysis.grainBillAnalysis.suggestedAdjustments.join(' • ')}
                  </div>
                )}
              </div>

              {/* 2. Hop Schedule Recommendations */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Beer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-950 dark:text-emerald-300">
                    Подбор и баланс охмеления (Hop Schedule)
                  </span>
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                  {analysis.hopScheduleAnalysis.summary}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-emerald-200 dark:border-emerald-900">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-bold">Базовая горечь:</span>
                    <span className="text-stone-700 dark:text-stone-300 text-[11px]">
                      {analysis.hopScheduleAnalysis.bitternessComment}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-emerald-200 dark:border-emerald-900">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-bold">Ароматика и эфиры:</span>
                    <span className="text-stone-700 dark:text-stone-300 text-[11px]">
                      {analysis.hopScheduleAnalysis.aromaComment}
                    </span>
                  </div>
                </div>
                {analysis.hopScheduleAnalysis.recommendations.length > 0 && (
                  <ul className="space-y-1 text-xs">
                    {analysis.hopScheduleAnalysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-stone-800 dark:text-stone-200">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {analysis.hopScheduleAnalysis.suggestedVarieties?.length > 0 && (
                  <div className="p-2 rounded-xl bg-emerald-100/60 dark:bg-emerald-900/30 text-[11px] text-emerald-900 dark:text-emerald-200">
                    <span className="font-bold block mb-0.5">Рекомендуемые сочетания хмелей:</span>
                    {analysis.hopScheduleAnalysis.suggestedVarieties.join('; ')}
                  </div>
                )}
              </div>

              {/* 3. Mash and Yeast Advice */}
              <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60 space-y-2">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold text-purple-950 dark:text-purple-300">
                    Затирание и брожение
                  </span>
                </div>
                <div className="space-y-1 text-xs text-stone-700 dark:text-stone-300">
                  {analysis.mashAndYeastAdvice.mashRecommendations.map((m, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-purple-500 font-bold">•</span>
                      <span>{m}</span>
                    </div>
                  ))}
                  <div className="text-[11px] pt-1 text-stone-600 dark:text-stone-400">
                    <strong>Температура брожения:</strong> {analysis.mashAndYeastAdvice.fermentationTemp}
                  </div>
                </div>
              </div>

              {/* Actionable summary */}
              <div className="p-3 rounded-2xl bg-stone-100 dark:bg-stone-800 text-xs text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700">
                <span className="font-bold block mb-0.5">Резюме шеф-пивовара:</span>
                <p className="leading-relaxed text-[11px]">{analysis.actionableSummary}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-500 dark:text-stone-400">
            {appliedNotice ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Рекомендации применены к рецепту!
              </span>
            ) : (
              <span>Автобалансировка подставит выверенные пропорции под стиль</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleApplyAiSuggestions}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
            >
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>Применить рекомендации ИИ</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-300 transition-colors cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
