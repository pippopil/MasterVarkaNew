import { Recipe } from '../types/brewing';
import { BJCP_STYLES, calculateBrewMetrics } from '../utils/brewingMath';
import { TokenSavingSettings } from '../types/aiSettings';

export interface BjcpVitalStat {
  actual: number;
  target: string;
  inRange: boolean;
}

export interface BjcpAnalysisResult {
  styleName: string;
  category: string;
  overallScore: number;
  verdict: string;
  vitalStats: {
    og: BjcpVitalStat;
    fg: BjcpVitalStat;
    abv: BjcpVitalStat;
    ibu: BjcpVitalStat;
    colorEbc: BjcpVitalStat;
    buGuRatio: { actual: number; target: string; comment: string };
  };
  grainBillAnalysis: {
    summary: string;
    strengths: string[];
    recommendations: string[];
    suggestedAdjustments: string[];
  };
  hopScheduleAnalysis: {
    summary: string;
    bitternessComment: string;
    aromaComment: string;
    recommendations: string[];
    suggestedVarieties: string[];
  };
  mashAndYeastAdvice: {
    mashRecommendations: string[];
    yeastRecommendations: string[];
    fermentationTemp: string;
  };
  actionableSummary: string;
  isOfflineMode?: boolean;
  providerUsed?: string;
}

/**
 * Локальный расчет анализа BJCP на клиенте (100% надежный офлайн)
 */
export function analyzeRecipeBjcpLocally(recipe: Recipe, targetStyleName?: string): BjcpAnalysisResult {
  const currentStyleName = targetStyleName || recipe.style || 'American Pale Ale';
  const query = currentStyleName.toLowerCase().trim();

  // Ищем стиль в базе BJCP_STYLES по русскому или английскому наименованию
  const bjcpStyle = BJCP_STYLES.find(
    s => s.name.toLowerCase() === query ||
         (s.nameEn && s.nameEn.toLowerCase() === query) ||
         s.name.toLowerCase().includes(query) ||
         (s.nameEn && s.nameEn.toLowerCase().includes(query)) ||
         query.includes(s.name.toLowerCase()) ||
         (s.nameEn && query.includes(s.nameEn.toLowerCase()))
  ) || BJCP_STYLES[0];


  const calculated = recipe.calculated || calculateBrewMetrics({
    batchSizeL: recipe.batchSizeL,
    boilTimeMin: recipe.boilTimeMin,
    efficiencyPercent: recipe.efficiencyPercent,
    grainRatioLPerKg: recipe.grainRatioLPerKg,
    grainTempC: recipe.grainTempC,
    targetCarbonationVol: recipe.targetCarbonationVol,
    beerTempAtBottlingC: recipe.beerTempAtBottlingC,
    grains: recipe.grains,
    hops: recipe.hops,
    yeast: recipe.yeast
  });

  const og = calculated.ogSg || 1.050;
  const fg = calculated.fgSg || 1.010;
  const abv = calculated.abv || 5.0;
  const ibu = calculated.ibu || 30;
  const ebc = calculated.ebc || 12;

  const ogMin = bjcpStyle.ogRange ? bjcpStyle.ogRange[0] : 1.045;
  const ogMax = bjcpStyle.ogRange ? bjcpStyle.ogRange[1] : 1.060;
  const fgMin = bjcpStyle.fgRange ? bjcpStyle.fgRange[0] : 1.008;
  const fgMax = bjcpStyle.fgRange ? bjcpStyle.fgRange[1] : 1.015;
  const abvMin = bjcpStyle.abvRange ? bjcpStyle.abvRange[0] : 4.5;
  const abvMax = bjcpStyle.abvRange ? bjcpStyle.abvRange[1] : 6.0;
  const ibuMin = bjcpStyle.ibuRange ? bjcpStyle.ibuRange[0] : 25;
  const ibuMax = bjcpStyle.ibuRange ? bjcpStyle.ibuRange[1] : 45;
  const ebcMin = bjcpStyle.ebcRange ? bjcpStyle.ebcRange[0] : 8;
  const ebcMax = bjcpStyle.ebcRange ? bjcpStyle.ebcRange[1] : 25;

  const buGu = Number((ibu / Math.max(1, (og - 1) * 1000)).toFixed(2));

  const ogInRange = og >= ogMin && og <= ogMax;
  const fgInRange = fg >= fgMin && fg <= fgMax;
  const abvInRange = abv >= abvMin && abv <= abvMax;
  const ibuInRange = ibu >= ibuMin && ibu <= ibuMax;
  const ebcInRange = ebc >= ebcMin && ebc <= ebcMax;

  // Подсчет баллов
  let score = 70;
  if (ogInRange) score += 6;
  if (fgInRange) score += 6;
  if (abvInRange) score += 6;
  if (ibuInRange) score += 6;
  if (ebcInRange) score += 6;

  // Анализ засыпи
  const grains = recipe.grains || [];
  const totalWeightKg = grains.reduce((s, g) => s + (g.weightKg || 0), 0);
  const caramelGrains = grains.filter(g => g.type === 'caramel' || /(?:cara|карамел|crystal)/i.test(g.name));
  const roastedGrains = grains.filter(g => g.type === 'roasted' || /(?:roast|жжен|black|choc)/i.test(g.name));
  const caramelPct = totalWeightKg > 0 ? (caramelGrains.reduce((s, g) => s + (g.weightKg || 0), 0) / totalWeightKg) * 100 : 0;
  const roastedPct = totalWeightKg > 0 ? (roastedGrains.reduce((s, g) => s + (g.weightKg || 0), 0) / totalWeightKg) * 100 : 0;

  const grainStrengths: string[] = [];
  const grainRecs: string[] = [];
  const grainAdjusts: string[] = [];

  if (caramelPct > 15) {
    grainRecs.push(`Карамельные солода составляют ${caramelPct.toFixed(1)}% засыпи. Для стиля «${bjcpStyle.name}» оптимально до 5-8%, чтобы избежать избыточной сладости.`);
    grainAdjusts.push(`Снизить вес ${caramelGrains.map(g => g.name).join(', ')} на ${(caramelPct - 7).toFixed(0)}%`);
  } else {
    grainStrengths.push('Сбалансированная доля карамельных солодов (чистый вкус без липкой сладости)');
  }

  if (roastedPct > 0 && ebcMax < 35) {
    grainRecs.push(`Жженые солода в светлом стиле «${bjcpStyle.name}» могут дать терпкость и затемнить цвет. Используйте солод Carafa Special (без оболочки) на мэшауте.`);
  }

  if (totalWeightKg > 0) {
    grainStrengths.push(`Суммарная масса зерна ${totalWeightKg.toFixed(1)} кг обеспечивает экстракт для плотности ${og.toFixed(3)} SG`);
  }

  // Анализ охмеления
  const hops = recipe.hops || [];
  const bitterHops = hops.filter(h => (h.boilTimeMin || 0) >= 45 && h.use !== 'dry_hop');
  const lateHops = hops.filter(h => (h.boilTimeMin || 0) <= 15 || h.use === 'dry_hop' || h.use === 'whirlpool');

  const hopStrengths: string[] = [];
  const hopRecs: string[] = [];

  if (bitterHops.length === 0) {
    hopRecs.push('Рекомендуется добавить базовый хмель первого внесения за 60 мин (напр. Magnum, Northern Brewer) для гладкой фоновой горечи.');
  } else {
    hopStrengths.push('Базовая горечь заложена правильно за счет хмелей раннего внесения');
  }

  if (lateHops.length === 0 && (bjcpStyle.name.includes('IPA') || bjcpStyle.name.includes('Pale Ale') || bjcpStyle.name.includes('Pils'))) {
    hopRecs.push('Для этого стиля обязательно позднее охмеление (15-0 мин, вирпул или сухое охмеление) для яркой хмелевой ароматики.');
  } else if (lateHops.length > 0) {
    hopStrengths.push('Поздние порции хмеля и вирпул формируют выразительный эфирно-масляный букет');
  }

  let buGuTarget = '0.50 - 0.75';
  let buGuComment = 'Сбалансированное соотношение';
  if (buGu > 0.85) {
    buGuComment = 'Выраженная хмелевая доминанта (акцент на горечь)';
  } else if (buGu < 0.45) {
    buGuComment = 'Мягкая солодовая направленность с деликатной фоновой горечью';
  }

  let verdict = `Рецепт отлично попадает в профиль ${bjcpStyle.name} (оценка ${score}/100).`;
  if (score < 80) {
    verdict = `Рецепт близок к стилю ${bjcpStyle.name}, но требует точечной балансировки показателей горечи (${ibu} IBU) и плотности (${og} SG).`;
  }

  return {
    styleName: bjcpStyle.name,
    category: `${bjcpStyle.category} (BJCP Guidelines)`,
    overallScore: Math.min(96, Math.max(70, score)),
    verdict,
    vitalStats: {
      og: { actual: og, target: `${ogMin.toFixed(3)} - ${ogMax.toFixed(3)}`, inRange: ogInRange },
      fg: { actual: fg, target: `${fgMin.toFixed(3)} - ${fgMax.toFixed(3)}`, inRange: fgInRange },
      abv: { actual: abv, target: `${abvMin} - ${abvMax}%`, inRange: abvInRange },
      ibu: { actual: ibu, target: `${ibuMin} - ${ibuMax}`, inRange: ibuInRange },
      colorEbc: { actual: ebc, target: `${ebcMin} - ${ebcMax}`, inRange: ebcInRange },
      buGuRatio: { actual: buGu, target: buGuTarget, comment: buGuComment }
    },

    grainBillAnalysis: {
      summary: `Засыпь включает ${grains.length} компонентов общей массой ${totalWeightKg.toFixed(1)} кг. Базовый солод составляет ${(100 - caramelPct - roastedPct).toFixed(0)}% массы.`,
      strengths: grainStrengths,
      recommendations: grainRecs.length > 0 ? grainRecs : ['Соотношение солодов подобрано гармонично. Для большей глубины солодового вкуса можно добавить 10% солод Munich или Vienna.'],
      suggestedAdjustments: grainAdjusts.length > 0 ? grainAdjusts : ['Текущие пропорции засыпи оптимальны для этого стиля.']
    },
    hopScheduleAnalysis: {
      summary: `Схема насчитывает ${hops.length} внесений хмеля с суммарной расчетной горечью ${ibu} IBU. Соотношение BU:GU = ${buGu}.`,
      bitternessComment: `Горечь ${ibu} IBU ${ibuInRange ? 'идеально укладывается в сортовой коридор' : ibu < ibuMin ? 'ниже целевого коридора стиля' : 'выше верхней границы стиля'}.`,
      aromaComment: lateHops.length > 0 ? 'Ароматический профиль сформирован поздними внесениями.' : 'Рекомендуется добавить ароматный хмель на вирпул или сухое охмеление.',
      recommendations: hopRecs.length > 0 ? hopRecs : ['Для сухого охмеления задавайте хмель при температуре 16-18°C на 3-4 дня для максимальной экстракции масел.'],
      suggestedVarieties: ['Citra, Mosaic, Simcoe (фруктово-хвойный акцент)', 'Cascade, Centennial, Amarillo (классический цитрусовый профиль)', 'Saaz, Spalt, Mittelfrüh (для европейских лагеров)']
    },
    mashAndYeastAdvice: {
      mashRecommendations: [
        'Мальтозная пауза 65°C (45 мин) для образования сбраживаемых сахаров',
        'Пауза осахаривания 72°C (20 мин) для декстринов и тела',
        'Мэшаут 78°C (10 мин) для остановки работы ферментов'
      ],
      yeastRecommendations: [
        recipe.yeast?.name ? `Текущий штамм: ${recipe.yeast.name}` : 'SafAle US-05 / Nottingham (чистый профиль)',
        'Lallemand Verdant IPA (сочные фруктовые эфиры)'
      ],
      fermentationTemp: '18-20°C (стабильная температура без резких перепадов)'
    },
    actionableSummary: `Соблюдайте температурный режим сбраживания и контролируйте контакт с кислородом после варки.`,
    isOfflineMode: true,
    providerUsed: 'МастерВарка BJCP Эксперт (Офлайн)'
  };
}

export const analyzeRecipeLocally = analyzeRecipeBjcpLocally;

/**
 * Запрос глубокого анализа рецепта через ИИ-студию (Gemini 3.8 Flash)
 * с прозрачным переключением на локальный анализ при отсутствии сети
 */
export async function analyzeRecipeWithAiStudio(
  recipe: Recipe,
  rawFileContent?: string,
  targetStyle?: string,
  settings?: TokenSavingSettings
): Promise<BjcpAnalysisResult> {
  const isOffline = settings?.mode === 'offline' || !navigator.onLine;
  if (isOffline) {
    return analyzeRecipeBjcpLocally(recipe, targetStyle);
  }

  try {
    const res = await fetch('/api/ai/bjcp-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipe,
        rawFileContent,
        targetStyle: targetStyle || recipe.style,
        tokenSettings: settings
      })
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const payload = await res.json();
    if (payload.success && payload.data) {
      return {
        ...payload.data,
        isOfflineMode: Boolean(payload.isOfflineMode || payload.isFallback),
        providerUsed: payload.modelUsed || 'Google Gemini 3.8 Flash'
      };
    }
    throw new Error(payload.error || 'Неверный ответ ИИ-сервера');
  } catch (err) {
    console.warn('[BJCP Analysis] Ошибка обращения к ИИ-серверу, переключаемся на локальный расчет:', err);
    return analyzeRecipeBjcpLocally(recipe, targetStyle);
  }
}

