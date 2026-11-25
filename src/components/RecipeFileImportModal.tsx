import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileCode,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Wheat,
  Beer,
  Sparkles,
  ArrowRight,
  Plus,
  RefreshCw,
  Layers,
  Flame,
  Thermometer,
  Info
} from 'lucide-react';
import { Recipe, GrainItem, HopItem, Yeast, MashRest } from '../types/brewing';
import { extractIngredientsFromFile, FileParseResult } from '../utils/universalRecipeParser';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentRecipe: Recipe;
  onAppendIngredients: (payload: {
    grains: GrainItem[];
    hops: HopItem[];
    yeast: Yeast | null;
    mashSchedule: MashRest[];
    detectedFormat: string;
  }) => void;
  onReplaceRecipe: (recipe: Recipe) => void;
  onOpenAiAnalysis: (parsedRecipe: Recipe, rawContent?: string) => void;
}

export const RecipeFileImportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentRecipe,
  onAppendIngredients,
  onReplaceRecipe,
  onOpenAiAnalysis
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [pastedFileName, setPastedFileName] = useState('pasted_recipe.txt');
  const [isDragging, setIsDragging] = useState(false);
  const [parseResult, setParseResult] = useState<FileParseResult | null>(null);
  const [rawContent, setRawContent] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessContent = (content: string, filename: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setRawContent(content);

    try {
      const result = extractIngredientsFromFile(content, filename);
      if (!result.success || !result.recipe) {
        setParseResult(null);
        setErrorMessage(
          result.error ||
          `Не удалось распознать пивоваренный рецепт в файле «${filename}». Проверьте соответствие формата BeerXML, CSV или текстового списка с указанием веса ингредиентов.`
        );
      } else {
        setParseResult(result);
        setErrorMessage(null);
      }
    } catch (err: any) {
      setParseResult(null);
      setErrorMessage(`Ошибка обработки файла: ${err.message || 'Неверный формат данных'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleProcessContent(content, file.name);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Не удалось прочитать выбранный файл с диска.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          handleProcessContent(content, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePasteProcess = () => {
    const trimmed = pastedText.trim();
    if (!trimmed) {
      setErrorMessage('Вставьте текст рецепта или CSV-таблицу в поле ниже.');
      return;
    }
    let effectiveFileName = pastedFileName;
    if (pastedFileName === 'pasted_recipe.txt' || pastedFileName === 'recipe.txt') {
      const lower = trimmed.toLowerCase();
      if (lower.startsWith('<!doctype html') || lower.startsWith('<html') || (lower.includes('<body') && lower.includes('<table'))) {
        effectiveFileName = 'recipe.html';
      } else if (
        lower.includes('<recipes') ||
        lower.includes('<recipe') ||
        lower.startsWith('<?xml') ||
        (lower.includes('<fermentable') && lower.includes('<hop'))
      ) {
        effectiveFileName = 'recipe.xml';
      } else if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        effectiveFileName = 'recipe.json';
      }
    }
    handleProcessContent(trimmed, effectiveFileName);
  };

  const handleReset = () => {
    setParseResult(null);
    setErrorMessage(null);
    setRawContent('');
    setPastedText('');
  };

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
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-white leading-tight">
                Импорт рецепта из файла
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Поддержка BeerXML, CSV, BeerSmith (.bsmx), Brewfather (.json) и текстовых файлов (.txt)
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

        {/* Content body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Tabs */}
          {!parseResult && (
            <div className="flex rounded-xl bg-stone-100 dark:bg-stone-800 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setActiveTab('upload'); setErrorMessage(null); }}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs'
                    : 'text-stone-500 dark:text-stone-400'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Загрузить файл (.xml, .csv, .txt, .json)</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('paste'); setErrorMessage(null); }}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'paste'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs'
                    : 'text-stone-500 dark:text-stone-400'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Вставить текст / CSV</span>
              </button>
            </div>
          )}

          {/* Upload View */}
          {!parseResult && activeTab === 'upload' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-stone-300 dark:border-stone-700 hover:border-amber-500/60 bg-stone-50/50 dark:bg-stone-800/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xml,.beerxml,.html,.htm,.csv,.tsv,.txt,.bsmx,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                <Upload className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-stone-800 dark:text-stone-200 block">
                  Перетащите файл сюда или нажмите для выбора
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 mt-1 block">
                  Поддерживаются форматы: .xml, .beerxml, .csv, .txt, .bsmx, .json
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">BeerXML</span>
                <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">CSV Таблицы</span>
                <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">BeerSmith</span>
                <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">Brewfather</span>
                <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">Текст (.txt)</span>
              </div>
            </div>
          )}

          {/* Paste View */}
          {!parseResult && activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-600 dark:text-stone-400">
                <span>Вставьте скопированный рецепт или CSV:</span>
                <select
                  value={pastedFileName}
                  onChange={(e) => setPastedFileName(e.target.value)}
                  className="bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1 text-xs"
                >
                  <option value="recipe.txt">Авто / Свободный текст (.txt)</option>
                  <option value="recipe.html">HTML / Brewer's Friend (.html, .xml)</option>
                  <option value="recipe.xml">BeerXML (.xml)</option>
                  <option value="recipe.csv">Таблица CSV (.csv)</option>
                  <option value="recipe.json">JSON / Brewfather (.json)</option>
                </select>
              </div>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Вставьте сюда текст рецепта (Brewer's Friend, форумы), HTML/BeerXML или строки CSV таблицы..."
                rows={8}
                className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none dark:text-stone-100"
              />
              <button
                type="button"
                onClick={handlePasteProcess}
                disabled={!pastedText.trim() || isProcessing}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Распознать ингредиенты и рецепт</span>
              </button>
            </div>
          )}

          {/* Error notice */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <span className="font-bold block">Ошибка распознавания формата:</span>
                <p className="whitespace-pre-line leading-relaxed text-[11px] text-rose-700 dark:text-rose-300">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Successful Parse Preview */}
          {parseResult && parseResult.recipe && (
            <div className="space-y-4 animate-in fade-in">
              {/* Header result */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">
                      Рецепт успешно распознан!
                    </span>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Формат: <strong>{parseResult.formatDetected}</strong>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-stone-800 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  Другой файл
                </button>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-medium">Солод / Зерно</span>
                  <span className="font-extrabold text-sm text-stone-900 dark:text-white">
                    {parseResult.itemSummary.grainCount} шт. ({parseResult.itemSummary.totalGrainKg} кг)
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-medium">Хмель</span>
                  <span className="font-extrabold text-sm text-stone-900 dark:text-white">
                    {parseResult.itemSummary.hopCount} шт. ({parseResult.itemSummary.totalHopG} г)
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900">
                  <span className="text-[10px] text-purple-700 dark:text-purple-400 block font-medium">Дрожжи</span>
                  <span className="font-extrabold text-xs text-stone-900 dark:text-white truncate block">
                    {parseResult.recipe.yeast?.name || 'Не указаны'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900">
                  <span className="text-[10px] text-sky-700 dark:text-sky-400 block font-medium">Расчетные параметры</span>
                  <span className="font-extrabold text-xs text-stone-900 dark:text-white">
                    OG {parseResult.recipe.calculated?.ogSg || 1.050} • {parseResult.recipe.calculated?.ibu || 30} IBU
                  </span>
                </div>
              </div>

              {/* Found Grains */}
              {parseResult.grains.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Wheat className="w-3.5 h-3.5 text-amber-500" />
                    <span>Распознанные солода ({parseResult.grains.length}):</span>
                  </span>
                  <div className="divide-y divide-stone-100 dark:divide-stone-800 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden text-xs max-h-36 overflow-y-auto">
                    {parseResult.grains.map((g, idx) => (
                      <div key={g.id || idx} className="p-2 bg-white dark:bg-stone-800/60 flex items-center justify-between">
                        <span className="font-medium text-stone-800 dark:text-stone-200">{g.name}</span>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{g.weightKg} кг</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Found Hops */}
              {parseResult.hops.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Beer className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Распознанные хмели ({parseResult.hops.length}):</span>
                  </span>
                  <div className="divide-y divide-stone-100 dark:divide-stone-800 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden text-xs max-h-36 overflow-y-auto">
                    {parseResult.hops.map((h, idx) => (
                      <div key={h.id || idx} className="p-2 bg-white dark:bg-stone-800/60 flex items-center justify-between">
                        <span className="font-medium text-stone-800 dark:text-stone-200">
                          {h.name} ({h.alphaAcid}% AA)
                        </span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {h.weightG} г • {h.boilTimeMin} мин ({h.use === 'dry_hop' ? 'Сухое' : h.use === 'whirlpool' ? 'Вирпул' : 'Варка'})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 shrink-0 space-y-2">
          {parseResult && parseResult.recipe ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  if (parseResult.recipe) {
                    onReplaceRecipe(parseResult.recipe);
                    onClose();
                  }
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-amber-500 to-amber-600 hover:from-emerald-700 hover:to-amber-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Загрузить в калькулятор (Заменить текущий)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onAppendIngredients({
                    grains: parseResult.grains,
                    hops: parseResult.hops,
                    yeast: parseResult.yeast,
                    mashSchedule: parseResult.mashSchedule,
                    detectedFormat: parseResult.formatDetected
                  });
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Добавить распознанные ингредиенты в конец текущего рецепта"
              >
                <Plus className="w-3.5 h-3.5 text-amber-500" />
                <span>Объединить</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (parseResult.recipe) {
                    onOpenAiAnalysis(parseResult.recipe, rawContent);
                    onClose();
                  }
                }}
                className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                title="Отправить распознанный файл в ИИ-студию для анализа на соответствие стилю BJCP"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Анализ BJCP</span>
              </button>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
