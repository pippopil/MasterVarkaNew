import React, { useState, useEffect, useRef } from 'react';
import { LabelDesign, LabelShape, LabelThemeStyle, LabelBackgroundTexture, Recipe } from '../types/brewing';
import {
  TokenSavingSettings,
  TokenUsageStats,
  DEFAULT_TOKEN_SAVING_SETTINGS
} from '../types/aiSettings';
import {
  loadTokenSettings,
  saveTokenSettings,
  loadTokenStats,
  recordTokenUsage,
  getAiCache,
  setAiCache
} from '../utils/aiTokenManager';
import {
  generateRecipeBeerIdentity,
  generateBeerStyleDescriptionWithGemini,
  BeerStyleDescriptionResult
} from '../services/beerAiService';
import {
  NameArchetype,
  NameMood,
  GeneratedBeerConcept,
  ARCHETYPES_META,
  MOODS_META,
  generateBeerConcepts
} from '../utils/craftBeerNameGenerator';
import { ebcToHex } from '../utils/brewingMath';
import { AiTokenSettingsModal } from './AiTokenSettingsModal';
import {
  Sparkles,
  Download,
  Check,
  RefreshCw,
  Palette,
  Award,
  Utensils,
  Thermometer,
  GlassWater,
  Sliders,
  Zap,
  TrendingDown,
  Database,
  Image as ImageIcon,
  Copy,
  Printer,
  CheckCircle2,
  AlertCircle,
  Upload,
  Cpu,
  BookOpen,
  BookmarkCheck,
  Shapes,
  FileText,
  Tag,
  Barcode,
  Layers,
  Wand2,
  Heart
} from 'lucide-react';

interface Props {
  recipe: Recipe;
  onUpdateRecipe: (updated: Recipe) => void;
}

export const AiStudioLabelGenerator: React.FC<Props> = ({ recipe, onUpdateRecipe }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [promptCopied, setPromptCopied] = useState(false);
  const [appliedConceptId, setAppliedConceptId] = useState<string | null>(null);

  // Режим просмотра: Лицевая этикетка vs Контрэтикетка
  const [viewMode, setViewMode] = useState<'front' | 'back'>('front');

  // Параметры генератора названий
  const [selectedArchetype, setSelectedArchetype] = useState<NameArchetype>('all');
  const [selectedMood, setSelectedMood] = useState<NameMood>('bold');
  const [generatedConcepts, setGeneratedConcepts] = useState<GeneratedBeerConcept[]>(() => {
    return generateBeerConcepts(recipe, { archetype: 'all', mood: 'bold', count: 6 });
  });

  // Состояние генерации описания стиля пива через Gemini
  const [isGeneratingStyleDesc, setIsGeneratingStyleDesc] = useState(false);
  const [styleDescResult, setStyleDescResult] = useState<BeerStyleDescriptionResult | null>(null);
  const [styleDescCopied, setStyleDescCopied] = useState(false);
  const [styleDescApplied, setStyleDescApplied] = useState(false);
  const [styleDescError, setStyleDescError] = useState<string | null>(null);

  // Настройки расхода токенов и статистика
  const [tokenSettings, setTokenSettings] = useState<TokenSavingSettings>(loadTokenSettings);
  const [tokenStats, setTokenStats] = useState<TokenUsageStats>(loadTokenStats);
  const [isTokenSettingsOpen, setIsTokenSettingsOpen] = useState(false);
  const [customImageElement, setCustomImageElement] = useState<HTMLImageElement | null>(null);
  const [sheetPreviewOpen, setSheetPreviewOpen] = useState(false);
  const [sheetDataUrl, setSheetDataUrl] = useState<string>('');

  const updateTokenSettings = (newSettings: TokenSavingSettings) => {
    setTokenSettings(newSettings);
    saveTokenSettings(newSettings);
  };

  // Локальное состояние дизайна этикетки
  const [labelState, setLabelState] = useState<LabelDesign>(() => {
    return (
      recipe.labelDesign || {
        title: recipe.name || 'Крафтовый Эль',
        subtitle: recipe.style || 'Авторское пивоварение',
        style: recipe.style || 'Craft Beer',
        breweryName: 'Домашняя Пивоварня',
        abv: Number(recipe.calculated?.abv || 5.0),
        ibu: Math.round(Number(recipe.calculated?.ibu || 30)),
        volumeText: `${recipe.batchSizeL > 0 ? (recipe.batchSizeL <= 25 ? '0.5 L' : '1.0 L') : '0.5 L'}`,
        bottledDate: `${new Date().getFullYear()}`,
        labelShape: 'vintage_notched',
        themeStyle: 'craft_modern',
        palette: {
          background: '#18181b',
          text: '#fef08a',
          accent: '#eab308',
          border: '#ca8a04'
        },
        artworkType: 'hop',
        storyDescription: recipe.description,
        showBackLabel: false,
        showQrBarcode: true,
        showEbcIndicator: true,
        batchNumberText: 'BATCH #01',
        brewerMotto: 'Сварено с душой • Нефильтрованное'
      }
    );
  });

  // Загрузка кастомного изображения при наличии
  useEffect(() => {
    if (labelState.customImageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setCustomImageElement(img);
      img.src = labelState.customImageUrl;
    }
  }, [labelState.customImageUrl]);

  // Быстрая генерация новых концептов
  const handleRegenerateConcepts = () => {
    const concepts = generateBeerConcepts(recipe, {
      archetype: selectedArchetype,
      mood: selectedMood,
      count: 6
    });
    setGeneratedConcepts(concepts);
  };

  // Применение выбранного концепта к этикетке
  const handleApplyConceptToLabel = (concept: GeneratedBeerConcept) => {
    setLabelState(prev => ({
      ...prev,
      title: concept.name,
      subtitle: concept.slogan,
      themeStyle: concept.themeStyle || prev.themeStyle || 'craft_modern',
      palette: concept.palette,
      artworkType: concept.suggestedArtwork,
      backgroundTexture: concept.backgroundTexture || prev.backgroundTexture || 'sunburst_rays',
      emblemBacking: concept.suggestedBacking || prev.emblemBacking || 'gold_disc',
      emblemSize: 'large',
      storyDescription: concept.legend,
      ingredientsText: concept.backLabelDescription
    }));
    setAppliedConceptId(concept.id);
    setTimeout(() => setAppliedConceptId(null), 2500);
  };

  // Применение имени концепта в сам рецепт
  const handleApplyConceptToRecipe = (concept: GeneratedBeerConcept) => {
    onUpdateRecipe({
      ...recipe,
      name: concept.name,
      description: concept.legend
    });
    setAppliedConceptId(concept.id);
    setTimeout(() => setAppliedConceptId(null), 2500);
  };

  // Описание стиля пива через Gemini
  const handleGenerateStyleDescription = async () => {
    setIsGeneratingStyleDesc(true);
    setStyleDescError(null);
    setStyleDescApplied(false);
    try {
      const res = await generateBeerStyleDescriptionWithGemini(recipe, tokenSettings);
      if (res.success && res.description) {
        setStyleDescResult(res);
        if (res.usage) {
          const updatedStats = recordTokenUsage(res.usage, tokenSettings.mode, false);
          setTokenStats(updatedStats);
        }
      } else {
        setStyleDescError(res.warning || 'Не удалось сгенерировать описание стиля.');
      }
    } catch (err: any) {
      setStyleDescError(err.message || 'Ошибка связи с ИИ.');
    } finally {
      setIsGeneratingStyleDesc(false);
    }
  };

  const handleApplyStyleDescriptionToRecipe = () => {
    if (!styleDescResult?.description) return;
    onUpdateRecipe({
      ...recipe,
      description: styleDescResult.description
    });
    setStyleDescApplied(true);
    setTimeout(() => setStyleDescApplied(false), 3000);
  };

  const handleCopyStyleDescription = () => {
    if (!styleDescResult?.description) return;
    const fullText = `${styleDescResult.styleName} (${styleDescResult.bjcpCategory})\n\n${styleDescResult.description}\n\nСенсорный профиль:\n- Аромат: ${styleDescResult.sensoryProfile.aroma}\n- Внешний вид: ${styleDescResult.sensoryProfile.appearance}\n- Вкус: ${styleDescResult.sensoryProfile.flavor}\n- Тело: ${styleDescResult.sensoryProfile.mouthfeel}`;
    navigator.clipboard?.writeText(fullText);
    setStyleDescCopied(true);
    setTimeout(() => setStyleDescCopied(false), 2500);
  };

  // ======================== CANVAS DRAWING ENGINE (800x500) ========================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 800;
    const height = 500;
    canvas.width = width;
    canvas.height = height;

    const {
      palette,
      title,
      subtitle,
      style,
      breweryName,
      abv,
      ibu,
      volumeText,
      bottledDate,
      artworkType,
      themeStyle,
      labelShape = 'vintage_notched',
      showQrBarcode = true,
      showEbcIndicator = true,
      batchNumberText = 'BATCH #01',
      brewerMotto = 'Сварено с душой • Нефильтрованное',
      backgroundTexture = 'sunburst_rays',
      emblemSize = 'large',
      emblemBacking = 'gold_disc'
    } = labelState;

    const beerColorHex = ebcToHex(recipe.calculated?.ebc || 12);

    // -------------------------------------------------------------
    // РЕЖИМ 1: КОНТРЭТИКЕТКА (BACK LABEL)
    // -------------------------------------------------------------
    if (viewMode === 'back') {
      // 1. Фон контрэтикетки
      ctx.fillStyle = palette.background;
      ctx.fillRect(0, 0, width, height);

      // Рамка
      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, width - 40, height - 40);
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 1;
      ctx.strokeRect(26, 26, width - 52, height - 52);

      // Шапка
      ctx.fillStyle = palette.accent;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '3px';
      ctx.fillText(breweryName.toUpperCase(), width / 2, 55);

      ctx.fillStyle = palette.text;
      ctx.font = 'bold 24px "Playfair Display", Georgia, serif';
      ctx.letterSpacing = '1px';
      ctx.fillText(title, width / 2, 85);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`${(style || 'КРАФТ').toUpperCase()} • ${batchNumberText}`, width / 2, 110);

      // Горизонтальный разделитель
      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50, 125);
      ctx.lineTo(width - 50, 125);
      ctx.stroke();

      // Левая колонка: Состав и легенда
      ctx.textAlign = 'left';
      ctx.fillStyle = palette.accent;
      ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('СОСТАВ И РЕЦЕПТУРА:', 50, 155);

      ctx.fillStyle = palette.text;
      ctx.font = '12px "Plus Jakarta Sans", sans-serif';
      const grainList = recipe.grains.map(g => `${g.name} (${g.weightKg} кг)`).join(', ') || 'Отборный светлый солод';
      const hopList = recipe.hops.map(h => `${h.name} (${h.weightG} г)`).join(', ') || 'Ароматные хмели';
      const yeastStr = `${recipe.yeast.name} (${recipe.yeast.type || 'Верховое брожение'})`;

      ctx.fillText(`• Вода: Чистая подготовленная артезианская`, 50, 180);
      ctx.fillText(`• Солод: ${grainList.slice(0, 52)}${grainList.length > 52 ? '…' : ''}`, 50, 202);
      ctx.fillText(`• Хмель: ${hopList.slice(0, 52)}${hopList.length > 52 ? '…' : ''}`, 50, 224);
      ctx.fillText(`• Дрожжи: ${yeastStr}`, 50, 246);

      // Описание вкуса
      ctx.fillStyle = palette.accent;
      ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('ОПИСАНИЕ ВКУСА И ХАРАКТЕРА:', 50, 280);

      ctx.fillStyle = '#d4d4d8';
      ctx.font = 'italic 12px "Plus Jakarta Sans", sans-serif';
      const descLines = (labelState.storyDescription || recipe.description || 'Насыщенное авторское пиво с гармоничным хмелевым профилем.')
        .slice(0, 160);
      ctx.fillText(descLines.slice(0, 75), 50, 305);
      if (descLines.length > 75) ctx.fillText(descLines.slice(75, 150) + '…', 50, 325);

      // Правая колонка: Пищевая ценность и ТТХ
      ctx.fillStyle = palette.accent;
      ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('ТТХ И ХРАНЕНИЕ:', 500, 155);

      ctx.fillStyle = palette.text;
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillText(`Плотность (OG): ${recipe.calculated?.ogPlato || 12.5}°P`, 500, 180);
      ctx.fillText(`Алкоголь (ABV): ${abv}% об.`, 500, 202);
      ctx.fillText(`Горечь (IBU): ${ibu}`, 500, 224);
      ctx.fillText(`Цветность: ${recipe.calculated?.ebc || 12} EBC`, 500, 246);

      ctx.font = '11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText(`Хранить при t° от +2°C до +12°C`, 500, 275);
      ctx.fillText(`Срок годности: 90 суток`, 500, 295);
      ctx.fillText(`Объем: ${volumeText}`, 500, 315);

      // Разделитель перед подвалом
      ctx.strokeStyle = palette.border;
      ctx.beginPath();
      ctx.moveTo(50, 350);
      ctx.lineTo(width - 50, 350);
      ctx.stroke();

      // Подвал: Штрихкод и эко-значки
      // Рисуем декоративный штрихкод
      const barX = 60;
      const barY = 375;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(barX, barY, 180, 55);
      ctx.fillStyle = '#000000';
      for (let i = 0; i < 160; i += 4) {
        if ((i * 7) % 5 !== 0) {
          ctx.fillRect(barX + 10 + i, barY + 5, 2, 38);
        }
      }
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`4 607123 98${bottledDate}4`, barX + 90, barY + 50);

      // Значки предупреждений и экологии
      ctx.fillStyle = palette.accent;
      ctx.font = '22px sans-serif';
      ctx.fillText('♺  🔞  🚫🤰  🚫🚗', 380, 405);

      // Слоган пивовара
      ctx.fillStyle = palette.text;
      ctx.font = 'italic 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(brewerMotto, width - 60, 390);
      ctx.fillStyle = '#71717a';
      ctx.fillText(`Дата варки/розлива: ${bottledDate} г.`, width - 60, 412);
      ctx.fillText(`ГОСТ 31711-2012 • Нефильтрованное`, width - 60, 430);

      return;
    }

    // -------------------------------------------------------------
    // РЕЖИМ 2: ЛИЦЕВАЯ ЭТИКЕТКА (FRONT LABEL)
    // -------------------------------------------------------------

    // 1. Клиппинг формы этикетки (Label Shape)
    ctx.save();

    if (labelShape === 'vintage_notched') {
      // Прямоугольник со срезанными углами
      const notch = 28;
      ctx.beginPath();
      ctx.moveTo(20 + notch, 20);
      ctx.lineTo(width - 20 - notch, 20);
      ctx.lineTo(width - 20, 20 + notch);
      ctx.lineTo(width - 20, height - 20 - notch);
      ctx.lineTo(width - 20 - notch, height - 20);
      ctx.lineTo(20 + notch, height - 20);
      ctx.lineTo(20, height - 20 - notch);
      ctx.lineTo(20, 20 + notch);
      ctx.closePath();
      ctx.clip();
    } else if (labelShape === 'oval_medallion') {
      // Овальный медальон
      ctx.beginPath();
      ctx.ellipse(width / 2, height / 2, width / 2 - 25, height / 2 - 25, 0, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
    } else if (labelShape === 'cyber_hex') {
      // Гексагональный кибер-срез (скошенные углы 45°)
      const cut = 42;
      ctx.beginPath();
      ctx.moveTo(20 + cut, 20);
      ctx.lineTo(width - 20 - cut, 20);
      ctx.lineTo(width - 20, 20 + cut);
      ctx.lineTo(width - 20, height - 20 - cut);
      ctx.lineTo(width - 20 - cut, height - 20);
      ctx.lineTo(20 + cut, height - 20);
      ctx.lineTo(20, height - 20 - cut);
      ctx.lineTo(20, 20 + cut);
      ctx.closePath();
      ctx.clip();
    } else {
      // Стандартный прямоугольник
      ctx.beginPath();
      ctx.rect(20, 20, width - 40, height - 40);
      ctx.closePath();
      ctx.clip();
    }

    // 2. Фон этикетки: Базовый глубокий градиент
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, palette.background);
    bgGrad.addColorStop(1, '#090808');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2.1. Художественная модификация фона (не просто цвет, а аутентичные текстуры и паттерны)
    const artY = 144;
    const emblemRadius = emblemSize === 'xlarge' ? 76 : emblemSize === 'medium' ? 52 : 65;

    if (backgroundTexture === 'sunburst_rays') {
      // Лучи крафтового солнца (Санбёрст), расходящиеся из центра эмблемы
      ctx.save();
      const numRays = 32;
      const step = (Math.PI * 2) / numRays;
      for (let r = 0; r < numRays; r += 2) {
        ctx.beginPath();
        ctx.moveTo(width / 2, artY);
        ctx.arc(width / 2, artY, width * 0.9, r * step, (r + 1) * step);
        ctx.closePath();
        ctx.fillStyle = palette.accent;
        ctx.globalAlpha = 0.12;
        ctx.fill();
      }
      // Центробежное виньетирование
      const rayVignette = ctx.createRadialGradient(width / 2, artY, 60, width / 2, artY, width * 0.7);
      rayVignette.addColorStop(0, 'rgba(0,0,0,0)');
      rayVignette.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = rayVignette;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    } else if (backgroundTexture === 'parchment') {
      // Состаренный крафтовый пергамент с волокнами и обожженными краями
      ctx.save();
      const pGrad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width * 0.65);
      pGrad.addColorStop(0, 'rgba(254, 243, 199, 0.18)');
      pGrad.addColorStop(0.65, 'rgba(180, 83, 9, 0.12)');
      pGrad.addColorStop(1, 'rgba(69, 26, 3, 0.55)');
      ctx.fillStyle = pGrad;
      ctx.fillRect(0, 0, width, height);

      // Волокна старинной бумаги
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 65; i++) {
        const fx = (i * 137) % width;
        const fy = (i * 97) % height;
        const len = 14 + (i % 20);
        ctx.globalAlpha = 0.08 + (i % 4) * 0.03;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.bezierCurveTo(fx + len * 0.3, fy + (i % 5) - 2, fx + len * 0.7, fy - (i % 5) + 2, fx + len, fy + (i % 3));
        ctx.stroke();
      }
      ctx.restore();
    } else if (backgroundTexture === 'wood_barrel') {
      // Дубовая бочка: горизонтальные клепки, стыки и заклепки
      ctx.save();
      const staveH = 68;
      for (let y = 0; y < height; y += staveH) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(0, y, width, 3);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.fillRect(0, y + 3, width, 1.5);

        // Кованые заклепки по краям
        ctx.fillStyle = palette.accent;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(38, y + staveH / 2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(width - 38, y + staveH / 2, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      // Волокна древесины
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 1;
      for (let w = 15; w < height; w += 20) {
        ctx.globalAlpha = 0.06;
        ctx.beginPath();
        ctx.moveTo(0, w);
        ctx.bezierCurveTo(width * 0.3, w + Math.sin(w) * 10, width * 0.7, w - Math.cos(w) * 10, width, w);
        ctx.stroke();
      }
      ctx.restore();
    } else if (backgroundTexture === 'slate_gold') {
      // Темный сланец с фактурой скола камня и золотой пылью
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1.2;
      for (let s = 12; s < height; s += 18) {
        ctx.beginPath();
        ctx.moveTo(0, s);
        for (let x = 0; x < width; x += 45) {
          ctx.lineTo(x + 22, s + ((x * s) % 7) - 3);
        }
        ctx.stroke();
      }
      // Золотые крупицы в камне
      ctx.fillStyle = palette.accent;
      for (let g = 0; g < 95; g++) {
        const gx = (g * 193) % width;
        const gy = (g * 109) % height;
        ctx.globalAlpha = 0.15 + (g % 5) * 0.12;
        ctx.beginPath();
        ctx.arc(gx, gy, g % 3 === 0 ? 2 : 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (backgroundTexture === 'trappist_damask') {
      // Монастырский геральдический дамаск и ромбовидная решетка
      ctx.save();
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.15;
      const step = 55;
      for (let gx = 25; gx < width; gx += step) {
        for (let gy = 25; gy < height; gy += step) {
          ctx.beginPath();
          ctx.moveTo(gx, gy - 18);
          ctx.lineTo(gx + 18, gy);
          ctx.lineTo(gx, gy + 18);
          ctx.lineTo(gx - 18, gy);
          ctx.closePath();
          ctx.stroke();
          // Центральная розетка
          ctx.beginPath();
          ctx.arc(gx, gy, 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();
    } else if (backgroundTexture === 'cyber_grid') {
      // Неоновый кибер-грид и дорожки плат
      ctx.save();
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 0.8;
      ctx.globalAlpha = 0.16;
      for (let x = 0; x < width; x += 35) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 35) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      // Неоновые узлы плат
      ctx.fillStyle = palette.accent;
      ctx.globalAlpha = 0.35;
      for (let n = 0; n < 28; n++) {
        const nx = ((n * 70) % (width - 80)) + 40;
        const ny = ((n * 105) % (height - 80)) + 40;
        ctx.beginPath();
        ctx.arc(nx, ny, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (backgroundTexture === 'hop_engraving' || backgroundTexture === 'hops_botanical') {
      // Гравюрный хмель: виньетки лозы хмеля и колосьев по периметру
      ctx.save();
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.22;
      for (const cx of [60, width - 60]) {
        for (const cy of [70, height - 70]) {
          ctx.beginPath();
          ctx.arc(cx, cy, 26, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx, cy, 32, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx - 20, cy);
          ctx.bezierCurveTo(cx, cy - 30, cx, cy + 30, cx + 20, cy);
          ctx.stroke();
        }
      }
      ctx.restore();
    } else if (backgroundTexture === 'nordic_frost') {
      // Нордический горный хребет и ледяные кристаллы
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, height - 120);
      ctx.lineTo(width * 0.22, height - 190);
      ctx.lineTo(width * 0.5, height - 130);
      ctx.lineTo(width * 0.78, height - 210);
      ctx.lineTo(width, height - 140);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = palette.accent;
      for (let f = 0; f < 60; f++) {
        const fx = (f * 157) % width;
        const fy = (f * 79) % (height - 110);
        ctx.globalAlpha = 0.18 + (f % 5) * 0.12;
        ctx.beginPath();
        ctx.arc(fx, fy, f % 4 === 0 ? 2.5 : 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (backgroundTexture === 'craft_grunge') {
      // Крафтовый гранж, брызги хмелевого сусла и потертости
      ctx.save();
      ctx.fillStyle = palette.accent;
      for (let i = 0; i < 90; i++) {
        const rx = (i * 97) % width;
        const ry = (i * 61) % height;
        ctx.globalAlpha = 0.05 + (i % 6) * 0.03;
        ctx.beginPath();
        ctx.arc(rx, ry, (i % 7) + 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else {
      // Глубокий радиальный градиент с виньеткой
      ctx.save();
      const rad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width * 0.65);
      rad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      rad.addColorStop(0.5, 'transparent');
      rad.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // Рамки по периметру этикетки
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 6;
    ctx.strokeRect(22, 22, width - 44, height - 44);

    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // Угловые росетки / элементы
    const drawCornerOrnament = (cx: number, cy: number) => {
      ctx.fillStyle = palette.accent;
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.stroke();
    };
    drawCornerOrnament(32, 32);
    drawCornerOrnament(width - 32, 32);
    drawCornerOrnament(32, height - 32);
    drawCornerOrnament(width - 32, height - 32);

    // 3. Название пивоварни и лента
    ctx.fillStyle = palette.accent;
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '5px';
    ctx.fillText(breweryName.toUpperCase(), width / 2, 68);

    // Декоративная полоса под пивоварней
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 140, 80);
    ctx.lineTo(width / 2 + 140, 80);
    ctx.stroke();

    // 4. ЦЕНТРАЛЬНАЯ ЭМБЛЕМА: МОЩНЫЙ, ЧЕТКИЙ, КОНТРАСТНЫЙ МЕДАЛЬОН
    // (Решение проблемы "центральная эмблема еле видна")
    if (customImageElement && artworkType === 'custom') {
      // Кастомный загруженный арт с двойным золотым кантом и тенью
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 4;

      ctx.beginPath();
      ctx.arc(width / 2, artY, emblemRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#0f1115';
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, artY, emblemRadius - 3, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(
        customImageElement,
        width / 2 - emblemRadius + 3,
        artY - emblemRadius + 3,
        (emblemRadius - 3) * 2,
        (emblemRadius - 3) * 2
      );
      ctx.restore();

      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(width / 2, artY, emblemRadius, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Векторный контрастный медальон высокого разрешения
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 26;
      ctx.shadowOffsetY = 5;

      // Форма подложки: Щит или Круглый медальон
      ctx.beginPath();
      if (emblemBacking === 'shield') {
        const sw = emblemRadius * 1.12;
        const sh = emblemRadius * 1.32;
        ctx.moveTo(width / 2 - sw, artY - sh * 0.7);
        ctx.lineTo(width / 2 + sw, artY - sh * 0.7);
        ctx.lineTo(width / 2 + sw, artY + sh * 0.1);
        ctx.quadraticCurveTo(width / 2 + sw, artY + sh * 0.8, width / 2, artY + sh);
        ctx.quadraticCurveTo(width / 2 - sw, artY + sh * 0.8, width / 2 - sw, artY + sh * 0.1);
        ctx.closePath();
      } else {
        ctx.arc(width / 2, artY, emblemRadius, 0, Math.PI * 2);
      }

      // Глубокая бархатная контрастная подложка (эмблема никогда не теряется на фоне!)
      const discGrad = ctx.createRadialGradient(width / 2, artY, 5, width / 2, artY, emblemRadius);
      discGrad.addColorStop(0, '#1c1f26');
      discGrad.addColorStop(0.75, '#0d0f14');
      discGrad.addColorStop(1, '#050608');
      ctx.fillStyle = discGrad;
      ctx.fill();
      ctx.restore();

      // Внешний массивный золотой кант
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 4;
      ctx.beginPath();
      if (emblemBacking === 'shield') {
        const sw = emblemRadius * 1.12;
        const sh = emblemRadius * 1.32;
        ctx.moveTo(width / 2 - sw, artY - sh * 0.7);
        ctx.lineTo(width / 2 + sw, artY - sh * 0.7);
        ctx.lineTo(width / 2 + sw, artY + sh * 0.1);
        ctx.quadraticCurveTo(width / 2 + sw, artY + sh * 0.8, width / 2, artY + sh);
        ctx.quadraticCurveTo(width / 2 - sw, artY + sh * 0.8, width / 2 - sw, artY + sh * 0.1);
        ctx.closePath();
      } else {
        ctx.arc(width / 2, artY, emblemRadius, 0, Math.PI * 2);
      }
      ctx.stroke();

      // Внутренний тонкий кант
      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(width / 2, artY, emblemRadius - 6, 0, Math.PI * 2);
      ctx.stroke();

      // Декоративные лучи или лавровый венок вокруг медальона
      if (emblemBacking === 'sunburst') {
        ctx.save();
        ctx.strokeStyle = palette.accent;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = 0.65;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
          ctx.beginPath();
          ctx.moveTo(width / 2 + Math.cos(a) * (emblemRadius + 3), artY + Math.sin(a) * (emblemRadius + 3));
          ctx.lineTo(width / 2 + Math.cos(a) * (emblemRadius + 13), artY + Math.sin(a) * (emblemRadius + 13));
          ctx.stroke();
        }
        ctx.restore();
      } else if (emblemBacking === 'laurel') {
        ctx.save();
        ctx.fillStyle = palette.accent;
        ctx.globalAlpha = 0.85;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 10) {
          const lx = width / 2 + Math.cos(a) * (emblemRadius + 7);
          const ly = artY + Math.sin(a) * (emblemRadius + 7);
          ctx.beginPath();
          ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Крупный, яркий, кристально четкий символ / эмблема (58-68px)
      ctx.save();
      const iconSize = Math.round(emblemRadius * 0.95);
      ctx.font = `${iconSize}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Золотая аура / ореол за символом для максимальной выразительности
      ctx.shadowColor = palette.accent;
      ctx.shadowBlur = 14;

      let iconChar = '🍺';
      if (artworkType === 'hop') iconChar = '🌿';
      else if (artworkType === 'grain') iconChar = '🌾';
      else if (artworkType === 'barrel') iconChar = '🪵';
      else if (artworkType === 'crown') iconChar = '👑';
      else if (artworkType === 'mountain') iconChar = '🏔️';
      else if (artworkType === 'shield') iconChar = '🛡️';
      else if (artworkType === 'bear') iconChar = '🐻';
      else if (artworkType === 'wolf') iconChar = '🐺';
      else if (artworkType === 'kettle') iconChar = '⚗️';
      else if (artworkType === 'mug') iconChar = '🍺';
      else if (artworkType === 'fire') iconChar = '🔥';
      else if (artworkType === 'lion') iconChar = '🦁';
      else if (artworkType === 'skull') iconChar = '💀';
      else if (artworkType === 'tree') iconChar = '🌲';
      else if (artworkType === 'guitar') iconChar = '🎸';
      else if (artworkType === 'raven') iconChar = '🦅';

      ctx.fillText(iconChar, width / 2, artY + 3);
      ctx.restore();
    }

    // Индикатор реального цвета пива (EBC Flask) слева от арта
    if (showEbcIndicator) {
      const ebcX = 130;
      const ebcY = 142;
      ctx.fillStyle = beerColorHex;
      ctx.beginPath();
      ctx.arc(ebcX, ebcY, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = palette.text;
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${recipe.calculated?.ebc || 12} EBC`, ebcX, ebcY + 28);
      ctx.fillStyle = '#71717a';
      ctx.font = '8px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('ЦВЕТ', ebcX, ebcY + 38);
    }

    // Индикатор партии справа от арта
    if (showQrBarcode) {
      const bx = width - 130;
      const by = 142;
      ctx.fillStyle = palette.accent;
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(batchNumberText, bx, by);
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '8px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`CROP ${bottledDate}`, bx, by + 14);
      ctx.fillText(`HANDCRAFTED`, bx, by + 26);
    }

    // 5. Главное название пива
    ctx.fillStyle = palette.text;
    ctx.font = 'bold 42px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '1px';
    // Обрезаем, если слишком длинное, чтобы не вылезало за рамку
    const displayTitle = title.length > 28 ? title.slice(0, 27) + '…' : title;
    ctx.fillText(displayTitle, width / 2, 235);

    // 6. Слоган или подзаголовок
    ctx.fillStyle = palette.accent;
    ctx.font = 'italic 17px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '0px';
    const displaySubtitle = subtitle.length > 50 ? subtitle.slice(0, 49) + '…' : subtitle;
    ctx.fillText(displaySubtitle, width / 2, 272);

    // 7. Стиль пива
    ctx.fillStyle = '#d4d4d8';
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText((style || 'CRAFT BEER').toUpperCase(), width / 2, 308);

    // Разделитель перед подвалом
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 340);
    ctx.lineTo(width - 60, 340);
    ctx.stroke();

    // 8. Подвал: ABV / IBU / OG / Объем
    ctx.fillStyle = palette.text;
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${abv}% ABV`, 70, 390);

    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${ibu} IBU`, width / 2 - 50, 390);

    ctx.textAlign = 'center';
    ctx.fillText(`${recipe.calculated?.ogPlato || 12.5}°P`, width / 2 + 60, 390);

    ctx.textAlign = 'right';
    ctx.fillText(volumeText, width - 70, 390);

    // Подписи подвала
    ctx.font = '10px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#71717a';
    ctx.textAlign = 'left';
    ctx.fillText('АЛКОГОЛЬ', 70, 410);

    ctx.textAlign = 'center';
    ctx.fillText('ГОРЕЧЬ', width / 2 - 50, 410);

    ctx.textAlign = 'center';
    ctx.fillText('ПЛОТНОСТЬ', width / 2 + 60, 410);

    ctx.textAlign = 'right';
    ctx.fillText(`РОЗЛИВ ${bottledDate}`, width - 70, 410);

    // Мелкий текст внизу
    ctx.font = '9px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#52525b';
    ctx.textAlign = 'center';
    ctx.fillText('ЖИВОЙ НЕФИЛЬТРОВАННЫЙ КРАФТ • СВАРЕНО С ДУШОЙ', width / 2, 455);

    ctx.restore();
  }, [labelState, customImageElement, viewMode, recipe]);

  // Скачивание этикетки в формате PNG (Ultra-HD)
  const handleDownloadLabel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    const suffix = viewMode === 'back' ? '_Контрэтикетка' : '_Лицевая';
    link.download = `Этикетка_${labelState.title.replace(/\s+/g, '_')}${suffix}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Печать листа этикеток на А4 с кнопкой возврата в приложение
  const handlePrintSheet = (count = 6) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');

    const printWin = window.open('', '_blank');
    if (!printWin) {
      // Если браузер заблокировал всплывающее окно — открываем встроенный просмотр
      setSheetDataUrl(dataUrl);
      setSheetPreviewOpen(true);
      return;
    }

    const gridCols = count === 4 ? '1fr 1fr' : '1fr 1fr';
    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="ru">
        <head>
          <meta charset="UTF-8">
          <title>Печать этикеток - ${labelState.title}</title>
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; background: #f4f4f5; }
            .no-print { padding: 12px 16px; background: #18181b; color: white; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #d97706; position: sticky; top: 0; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
            .btn-back { background: #3f3f46; color: white; border: none; padding: 8px 14px; border-radius: 8px; font-weight: bold; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
            .btn-back:hover { background: #52525b; }
            .btn-print { background: #f59e0b; color: #09090b; border: none; padding: 8px 18px; border-radius: 8px; font-weight: 900; font-size: 13px; cursor: pointer; }
            .btn-print:hover { background: #d97706; }
            .grid { display: grid; grid-template-columns: ${gridCols}; gap: 6mm; padding: 8mm; max-width: 210mm; margin: 0 auto; background: white; min-height: 297mm; box-shadow: 0 0 10px rgba(0,0,0,0.08); }
            .label-item { border: 1px dashed #ccc; padding: 2mm; text-align: center; page-break-inside: avoid; background: white; }
            img { width: 100%; height: auto; display: block; border-radius: 3px; }
            .info { font-size: 8px; color: #888; margin-top: 3px; }
            @media print {
              body { background: white; }
              .no-print { display: none !important; }
              .grid { padding: 0; margin: 0; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print">
            <button class="btn-back" onclick="if (window.opener) { window.close(); } else { history.back(); }">
              ← Назад в приложение
            </button>
            <span style="font-weight: 800; font-size: 13px;">МастерВарка: Лист печати (${count} этикеток)</span>
            <button class="btn-print" onclick="window.print()">
              🖨️ Распечатать / Сохранить в PDF
            </button>
          </div>
          <div class="grid">
            ${Array(count).fill(0).map(() => `
              <div class="label-item">
                <img src="${dataUrl}" />
                <div class="info">Линия обреза • МастерВарка (${labelState.title})</div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  // Загрузка кастомного изображения
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setCustomImageElement(img);
        setLabelState(prev => ({
          ...prev,
          artworkType: 'custom',
          customImageUrl: url
        }));
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  // Копирование промпта для Шедеврум / Kandinsky
  const handleCopyPrompt = () => {
    const prompt = `Высокодетализированная этикетка крафтового пива "${labelState.title}" стиль ${labelState.style}, винтажная гравюра, шишки хмеля, золото и темная медь, эмблема пивоварни 4k`;
    navigator.clipboard.writeText(prompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2500);
  };

  // Сохранение дизайна в рецепт
  const handleApplyToRecipe = () => {
    onUpdateRecipe({
      ...recipe,
      name: labelState.title || recipe.name,
      labelDesign: labelState
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ======================== 1. ВЕРХНИЙ БАННЕР ======================== */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 rounded-3xl p-5 sm:p-7 text-white border border-stone-800 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Работает без VPN: 100% автономно</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>7 авторских архетипов названий</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>ИИ Лаборатория: Генератор Концептов & Дизайн Этикеток</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-300">
              Создавайте звучные, оригинальные названия пива (с игрой слов, былинами, викингами или киберпанком), слоганы и макеты этикеток для печати на бутылки 0.33, 0.5 и 1.0 л.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsTokenSettingsOpen(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 text-stone-200 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Настройки ИИ</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================== 2. МНОГОГРАННЫЙ ГЕНЕРАТОР НАЗВАНИЙ И КОНЦЕПТОВ ======================== */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200/80 dark:border-stone-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-amber-500" />
              <span>Генератор оригинальных крафтовых названий и легенд</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Выберите творческое направление и настроение — генератор создаст полноценный концепт с названием, слоганом и описанием
            </p>
          </div>

          <button
            type="button"
            onClick={handleRegenerateConcepts}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Сгенерировать другие 6 концептов</span>
          </button>
        </div>

        {/* Выбор Архетипа (Табы с иконками) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
            Выберите творческий архетип:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ARCHETYPES_META.map(arch => (
              <button
                key={arch.id}
                type="button"
                onClick={() => {
                  setSelectedArchetype(arch.id);
                  const concepts = generateBeerConcepts(recipe, {
                    archetype: arch.id,
                    mood: selectedMood,
                    count: 6
                  });
                  setGeneratedConcepts(concepts);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedArchetype === arch.id
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 shadow-2xs font-bold ring-1 ring-amber-500/50'
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <div className="text-base mb-1">{arch.icon}</div>
                <div className="text-xs font-bold leading-tight">{arch.label.split(' ').slice(1).join(' ')}</div>
                <div className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5 line-clamp-1">{arch.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Сетка сгенерированных концептов (6 карточек) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {generatedConcepts.map((concept) => {
            const isApplied = appliedConceptId === concept.id;
            return (
              <div
                key={concept.id}
                className="p-4 rounded-2xl bg-stone-50/80 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80 flex flex-col justify-between hover:border-amber-500/60 dark:hover:border-amber-500/60 transition-all space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      {concept.archetypeName}
                    </span>
                    <span className="text-sm">
                      {ARCHETYPES_META.find(a => a.id === concept.archetype)?.icon}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-stone-900 dark:text-white">
                    «{concept.name}»
                  </h4>

                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400 italic">
                    «{concept.slogan}»
                  </p>

                  <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3">
                    {concept.legend}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyConceptToLabel(concept)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-2xs cursor-pointer"
                  >
                    {isApplied ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{isApplied ? 'Применено!' : 'На этикетку'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyConceptToRecipe(concept)}
                    className="py-1.5 px-2.5 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 font-semibold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                    title="Применить название и легенду в текущий рецепт"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-stone-500" />
                    <span>В рецепт</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================== 3. ИИ СОМЕЛЬЕ ОПИСАНИЕ СТИЛЯ (GEMINI) ======================== */}
      <div className="bg-gradient-to-br from-amber-500/10 via-stone-900/40 to-stone-900 rounded-3xl p-5 shadow-sm border border-amber-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </span>
              <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                <span>ИИ Сомелье: Описание стиля по рецептуре</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-stone-950 shadow-xs">
                  Gemini Flash
                </span>
              </h3>
            </div>
            <p className="text-xs text-stone-400">
              Формирует профессиональное описание аромата, вкуса, внешнего вида и гастрономических сочетаний на основе засыпи ({recipe.grains?.length || 0} солодов) и хмелей ({recipe.hops?.length || 0} сортов).
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateStyleDescription}
            disabled={isGeneratingStyleDesc}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 active:scale-98 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingStyleDesc ? 'animate-spin' : ''}`} />
            <span>{isGeneratingStyleDesc ? 'Анализирую рецепт...' : styleDescResult ? 'Обновить описание' : 'Описать стиль через Gemini'}</span>
          </button>
        </div>

        {styleDescError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{styleDescError}</span>
          </div>
        )}

        {styleDescResult ? (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl bg-stone-850/60 border border-stone-800 text-xs text-stone-200 leading-relaxed whitespace-pre-wrap font-sans">
              {styleDescResult.description}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-stone-850/70 border border-stone-800 text-xs space-y-1">
                <span className="font-bold text-amber-400 block">👃 Аромат:</span>
                <p className="text-stone-300 text-[11px]">{styleDescResult.sensoryProfile.aroma}</p>
              </div>
              <div className="p-3 rounded-xl bg-stone-850/70 border border-stone-800 text-xs space-y-1">
                <span className="font-bold text-amber-400 block">👀 Внешний вид:</span>
                <p className="text-stone-300 text-[11px]">{styleDescResult.sensoryProfile.appearance}</p>
              </div>
              <div className="p-3 rounded-xl bg-stone-850/70 border border-stone-800 text-xs space-y-1">
                <span className="font-bold text-amber-400 block">👅 Вкус:</span>
                <p className="text-stone-300 text-[11px]">{styleDescResult.sensoryProfile.flavor}</p>
              </div>
              <div className="p-3 rounded-xl bg-stone-850/70 border border-stone-800 text-xs space-y-1">
                <span className="font-bold text-amber-400 block">🍺 Ощущение во рту:</span>
                <p className="text-stone-300 text-[11px]">{styleDescResult.sensoryProfile.mouthfeel}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800/80">
              <button
                type="button"
                onClick={handleApplyStyleDescriptionToRecipe}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                {styleDescApplied ? <Check className="w-3.5 h-3.5" /> : <BookmarkCheck className="w-3.5 h-3.5" />}
                <span>{styleDescApplied ? 'Сохранено в описание!' : 'Применить в описание рецепта'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyStyleDescription}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {styleDescCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{styleDescCopied ? 'Скопировано' : 'Скопировать текст'}</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* ======================== 4. ДИЗАЙН-СТУДИЯ ЭТИКЕТОК CANVAS ======================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Левая колонка: Настройки этикетки */}
        <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-sm border border-stone-200/80 dark:border-stone-800 space-y-4">
          <div className="border-b border-stone-100 dark:border-stone-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm sm:text-base text-stone-900 dark:text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-500" />
                <span>Конструктор этикетки</span>
              </h3>
              <p className="text-xs text-stone-500">Форма, надписи, логотипы и цветовая палитра</p>
            </div>

            {/* Переключатель: Лицевая vs Контрэтикетка */}
            <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('front')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'front'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                Лицевая
              </button>
              <button
                type="button"
                onClick={() => setViewMode('back')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'back'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                Контрэтикетка
              </button>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* 1. Форма этикетки (Label Shape) */}
            <div>
              <label className="text-stone-700 dark:text-stone-300 font-bold block mb-1.5 flex items-center gap-1.5">
                <Shapes className="w-3.5 h-3.5 text-amber-500" />
                <span>Форма высечки / этикетки:</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'vintage_notched', label: '🏷️ Винтаж', desc: 'Срезанные углы' },
                  { id: 'oval_medallion', label: '🔘 Медальон', desc: 'Королевский овал' },
                  { id: 'can_wrap', label: '📦 Банка', desc: 'Can Wrap' },
                  { id: 'modern_clean', label: '🔲 Прямоугольная', desc: 'Золотой кант' },
                  { id: 'cyber_hex', label: '⚡ Гексагон', desc: 'Кибер-срез' },
                  { id: 'parchment_scroll', label: '📜 Свиток', desc: 'Пергамент' },
                ].map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setLabelState(prev => ({ ...prev, labelShape: s.id as any }))}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      labelState.labelShape === s.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold shadow-2xs'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                    }`}
                  >
                    <div className="font-bold text-xs leading-tight">{s.label}</div>
                    <div className="text-[9px] opacity-75">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Текстовые поля */}
            <div>
              <label className="text-stone-500 dark:text-stone-400 block mb-1">Название пива</label>
              <input
                type="text"
                value={labelState.title}
                onChange={(e) => setLabelState(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-stone-500 dark:text-stone-400 block mb-1">Слоган / Подзаголовок</label>
              <input
                type="text"
                value={labelState.subtitle}
                onChange={(e) => setLabelState(prev => ({ ...prev, subtitle: e.target.value }))}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-medium text-stone-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-stone-500 dark:text-stone-400 block mb-1">Пивоварня</label>
                <input
                  type="text"
                  value={labelState.breweryName}
                  onChange={(e) => setLabelState(prev => ({ ...prev, breweryName: e.target.value }))}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-stone-500 dark:text-stone-400 block mb-1">Номер партии</label>
                <input
                  type="text"
                  value={labelState.batchNumberText || 'BATCH #01'}
                  onChange={(e) => setLabelState(prev => ({ ...prev, batchNumberText: e.target.value }))}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs font-mono text-stone-900 dark:text-white"
                />
              </div>
            </div>

            {/* 3. Стиль оформления */}
            <div>
              <label className="text-stone-500 dark:text-stone-400 block mb-1">Стиль дизайна и палитры</label>
              <select
                value={labelState.themeStyle}
                onChange={(e) => {
                  const style = e.target.value as LabelThemeStyle;
                  let pal = labelState.palette;
                  if (style === 'vintage_monastery') {
                    pal = { background: '#1c1917', text: '#fde047', accent: '#ca8a04', border: '#78350f' };
                  } else if (style === 'minimal_nordic') {
                    pal = { background: '#090d16', text: '#e2e8f0', accent: '#38bdf8', border: '#1e3a5f' };
                  } else if (style === 'botanical') {
                    pal = { background: '#102216', text: '#ecfdf5', accent: '#34d399', border: '#065f46' };
                  } else if (style === 'retro_arcade') {
                    pal = { background: '#1e1b4b', text: '#38bdf8', accent: '#f43f5e', border: '#818cf8' };
                  } else if (style === 'slavic_craft') {
                    pal = { background: '#27150c', text: '#fde68a', accent: '#d97706', border: '#92400e' };
                  } else if (style === 'craft_rebel') {
                    pal = { background: '#121212', text: '#f3f4f6', accent: '#ef4444', border: '#7f1d1d' };
                  } else if (style === 'cyber_hops') {
                    pal = { background: '#09090b', text: '#67e8f9', accent: '#ec4899', border: '#3b82f6' };
                  } else if (style === 'royal_heraldic') {
                    pal = { background: '#1e1b2e', text: '#fef08a', accent: '#f59e0b', border: '#6366f1' };
                  } else {
                    pal = { background: '#18181b', text: '#fef08a', accent: '#eab308', border: '#ca8a04' };
                  }
                  setLabelState(prev => ({ ...prev, themeStyle: style, palette: pal }));
                }}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 dark:text-white"
              >
                <option value="craft_modern">Craft Modern (Современный крафт)</option>
                <option value="craft_rebel">Craft Rebel (Гранж & Рок бунт)</option>
                <option value="vintage_monastery">Vintage Monastery (Траппистский / Аббатский)</option>
                <option value="slavic_craft">Slavic Heritage (Славянский былинный)</option>
                <option value="minimal_nordic">Minimal Nordic (Скандинавский минимализм)</option>
                <option value="cyber_hops">Cyberpunk / Neo-Hops (Киберпанк неон)</option>
                <option value="botanical">Botanical (Хмелевой & Ботанический)</option>
                <option value="royal_heraldic">Royal Heraldic (Королевская геральдика)</option>
                <option value="retro_arcade">Retro Arcade (Винтаж 80-х)</option>
              </select>
            </div>

            {/* 3.1. Текстура и художественный фон этикетки (не просто цвет) */}
            <div>
              <label className="text-stone-700 dark:text-stone-300 font-bold block mb-1.5 flex items-center justify-between">
                <span>🎨 Художественный фон и фактура:</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">Фактурные паттерны</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {[
                  { id: 'sunburst_rays', label: '☀️ Санбёрст', desc: 'Крафтовые лучи' },
                  { id: 'parchment', label: '📜 Пергамент', desc: 'Старинная бумага' },
                  { id: 'wood_barrel', label: '🪵 Дубовая бочка', desc: 'Клёпки и кольца' },
                  { id: 'slate_gold', label: '🗿 Сланец & Золото', desc: 'Скол камня' },
                  { id: 'trappist_damask', label: '🏰 Аббатский дамаск', desc: 'Монастырский' },
                  { id: 'cyber_grid', label: '⚡ Кибер-грид', desc: 'Неон и дорожки' },
                  { id: 'hops_botanical', label: '🌿 Хмель & Колос', desc: 'Ботаническая лоза' },
                  { id: 'nordic_frost', label: '❄️ Мороз & Скалы', desc: 'Северный туман' },
                  { id: 'craft_grunge', label: '🎨 Крафт-гранж', desc: 'Потертости и спрей' },
                  { id: 'clean_gradient', label: '🌟 Глубокий градиент', desc: 'Мягкая виньетка' },
                ].map(tex => {
                  const isSelected =
                    (labelState.backgroundTexture || 'sunburst_rays') === tex.id ||
                    (tex.id === 'hops_botanical' && labelState.backgroundTexture === 'hop_engraving') ||
                    (tex.id === 'hop_engraving' && labelState.backgroundTexture === 'hops_botanical');
                  return (
                    <button
                      key={tex.id}
                      type="button"
                      onClick={() => setLabelState(prev => ({ ...prev, backgroundTexture: tex.id as LabelBackgroundTexture }))}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold shadow-2xs ring-1 ring-amber-500/50'
                          : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                      }`}
                    >
                      <div className="font-bold text-xs leading-tight">{tex.label}</div>
                      <div className="text-[9px] opacity-75">{tex.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3.2. Настройки видимости и формы медальона центральной эмблемы */}
            <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Четкость центральной эмблемы & Медальон:</span>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ Высокий контраст
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-stone-500 dark:text-stone-400 block mb-1">Размер эмблемы</label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'medium', label: 'Обычный' },
                      { id: 'large', label: 'Крупный' },
                      { id: 'xlarge', label: 'Максимум' },
                    ].map(sz => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => setLabelState(prev => ({ ...prev, emblemSize: sz.id as any }))}
                        className={`py-1 px-1.5 rounded-lg border text-[10px] font-bold text-center transition-all cursor-pointer ${
                          (labelState.emblemSize || 'large') === sz.id
                            ? 'border-amber-500 bg-amber-500 text-stone-950 shadow-2xs'
                            : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-stone-500 dark:text-stone-400 block mb-1">Подложка медальона</label>
                  <select
                    value={labelState.emblemBacking || 'gold_disc'}
                    onChange={(e) => setLabelState(prev => ({ ...prev, emblemBacking: e.target.value as any }))}
                    className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1 text-[11px] font-bold text-stone-900 dark:text-white"
                  >
                    <option value="gold_disc">🟡 Золотой медальон</option>
                    <option value="sunburst">☀️ Лучистый кант</option>
                    <option value="shield">🛡️ Геральдический щит</option>
                    <option value="laurel">🌿 Лавровый венок</option>
                    <option value="minimal">⚪ Лаконичный круг</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4. Выбор значка эмблемы */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-stone-500 dark:text-stone-400">Центральная эмблема / иллюстрация:</label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Загрузить арт</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
                {[
                  { id: 'hop', icon: '🌿', name: 'Хмель' },
                  { id: 'grain', icon: '🌾', name: 'Колос' },
                  { id: 'barrel', icon: '🪵', name: 'Бочка' },
                  { id: 'crown', icon: '👑', name: 'Корона' },
                  { id: 'mountain', icon: '🏔️', name: 'Горы' },
                  { id: 'shield', icon: '🛡️', name: 'Щит' },
                  { id: 'bear', icon: '🐻', name: 'Медведь' },
                  { id: 'wolf', icon: '🐺', name: 'Волк' },
                  { id: 'kettle', icon: '⚗️', name: 'Котёл' },
                  { id: 'mug', icon: '🍺', name: 'Кружка' },
                  { id: 'fire', icon: '🔥', name: 'Огонь' },
                  { id: 'lion', icon: '🦁', name: 'Лев' },
                  { id: 'skull', icon: '💀', name: 'Череп' },
                  { id: 'tree', icon: '🌲', name: 'Кедр' },
                  { id: 'guitar', icon: '🎸', name: 'Гитара' },
                  { id: 'raven', icon: '🦅', name: 'Ворон' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLabelState(prev => ({ ...prev, artworkType: item.id as any }))}
                    className={`h-9 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer ${
                      labelState.artworkType === item.id
                        ? 'bg-amber-500/20 border-2 border-amber-500 shadow-2xs scale-105'
                        : 'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                    }`}
                    title={item.name}
                  >
                    <span>{item.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Дополнительные переключатели (Штрихкод, EBC цвет) */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100 dark:border-stone-800">
              <label className="flex items-center gap-2 cursor-pointer text-[11px] text-stone-700 dark:text-stone-300">
                <input
                  type="checkbox"
                  checked={labelState.showEbcIndicator ?? true}
                  onChange={(e) => setLabelState(prev => ({ ...prev, showEbcIndicator: e.target.checked }))}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <span>Цвет пива (EBC колба)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[11px] text-stone-700 dark:text-stone-300">
                <input
                  type="checkbox"
                  checked={labelState.showQrBarcode ?? true}
                  onChange={(e) => setLabelState(prev => ({ ...prev, showQrBarcode: e.target.checked }))}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <span>Штамп крафт-партии</span>
              </label>
            </div>

            {/* Палитра цветов */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <div>
                <label className="text-[10px] text-stone-400 block mb-1">Фон</label>
                <input
                  type="color"
                  value={labelState.palette.background}
                  onChange={(e) => setLabelState(prev => ({
                    ...prev,
                    palette: { ...prev.palette, background: e.target.value }
                  }))}
                  className="w-full h-8 rounded-lg cursor-pointer border border-stone-300 dark:border-stone-700 bg-transparent"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-400 block mb-1">Текст</label>
                <input
                  type="color"
                  value={labelState.palette.text}
                  onChange={(e) => setLabelState(prev => ({
                    ...prev,
                    palette: { ...prev.palette, text: e.target.value }
                  }))}
                  className="w-full h-8 rounded-lg cursor-pointer border border-stone-300 dark:border-stone-700 bg-transparent"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-400 block mb-1">Акцент</label>
                <input
                  type="color"
                  value={labelState.palette.accent}
                  onChange={(e) => setLabelState(prev => ({
                    ...prev,
                    palette: { ...prev.palette, accent: e.target.value }
                  }))}
                  className="w-full h-8 rounded-lg cursor-pointer border border-stone-300 dark:border-stone-700 bg-transparent"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-400 block mb-1">Рамка</label>
                <input
                  type="color"
                  value={labelState.palette.border}
                  onChange={(e) => setLabelState(prev => ({
                    ...prev,
                    palette: { ...prev.palette, border: e.target.value }
                  }))}
                  className="w-full h-8 rounded-lg cursor-pointer border border-stone-300 dark:border-stone-700 bg-transparent"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyToRecipe}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-98"
            >
              <Check className="w-4 h-4" />
              <span>Сохранить дизайн в рецепт</span>
            </button>
          </div>
        </div>

        {/* Правая колонка: Живой просмотр Canvas & Печать */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-sm border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
            <div>
              <h3 className="font-black text-sm sm:text-base text-stone-900 dark:text-white flex items-center gap-2">
                <span>{viewMode === 'front' ? 'Лицевая этикетка' : 'Контрэтикетка (Оборотная)'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 font-mono text-stone-600 dark:text-stone-300">
                  800 × 500 px
                </span>
              </h3>
              <p className="text-xs text-stone-500">
                {viewMode === 'front' ? 'Парадная сторона для бутылки или банки' : 'Оборотная сторона: состав, пищевая ценность и ГОСТ'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const canvas = canvasRef.current;
                  if (canvas) {
                    setSheetDataUrl(canvas.toDataURL('image/png'));
                    setSheetPreviewOpen(true);
                  }
                }}
                className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Предпросмотр и печать 6 этикеток на лист А4"
              >
                <Printer className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
                <span>Лист А4 (6 шт)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadLabel}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Скачать PNG</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center p-3 sm:p-5 bg-stone-100 dark:bg-stone-950 rounded-2xl overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              className="w-full max-w-xl h-auto rounded-xl shadow-xl border border-stone-300 dark:border-stone-800"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-400 pt-1">
            <span>Стандарт для бутылок 0.5 л и 0.33 л (10 × 6.2 см при печати)</span>
            <span className="text-emerald-500 font-bold">Ultra-HD 300 DPI готов к печати</span>
          </div>
        </div>
      </div>

      {/* Модальное окно выбора ИИ и настроек */}
      <AiTokenSettingsModal
        isOpen={isTokenSettingsOpen}
        onClose={() => setIsTokenSettingsOpen(false)}
        settings={tokenSettings}
        onUpdateSettings={updateTokenSettings}
        stats={tokenStats}
        onRefreshStats={() => setTokenStats(loadTokenStats())}
      />

      {/* Встроенный режим просмотра и печати листа А4 с явным возвратом в приложение */}
      {sheetPreviewOpen && sheetDataUrl && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex flex-col p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-4xl mx-auto bg-stone-900 rounded-3xl border border-stone-800 shadow-2xl overflow-hidden flex flex-col my-auto">
            {/* Панель управления с кнопкой возврата */}
            <div className="p-3 sm:p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setSheetPreviewOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>←</span>
                <span>Назад в приложение</span>
              </button>

              <div className="text-center">
                <h4 className="text-sm font-black text-white">
                  Лист печати А4 (6 этикеток)
                </h4>
                <p className="text-[11px] text-stone-400">«{labelState.title}» • Стандарт 10 × 6.2 см</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSheet(6)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Печать / Сохранить в PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSheetPreviewOpen(false)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                  title="Закрыть"
                >
                  <span className="text-lg font-bold">✕</span>
                </button>
              </div>
            </div>

            {/* Предпросмотр листа формата А4 */}
            <div className="p-4 sm:p-8 bg-stone-800/50 flex justify-center overflow-auto max-h-[75vh]">
              <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-4 sm:p-6 text-stone-900 grid grid-cols-2 gap-4">
                {Array(6).fill(0).map((_, idx) => (
                  <div key={idx} className="border border-dashed border-stone-300 p-1.5 rounded-sm text-center">
                    <img src={sheetDataUrl} alt="Этикетка" className="w-full h-auto block rounded-xs shadow-2xs" />
                    <div className="text-[8px] text-stone-400 mt-1">Линия обреза • МастерВарка ({labelState.title})</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
