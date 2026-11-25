import { BrewLog, FermentationBatch, Recipe } from '../types/brewing';
import { ebcToHex, sgToPlato } from './brewingMath';

export interface TemperatureCurvePoint {
  x: number;          // Минута (для затирания) или день (для брожения)
  tempC: number;      // Температура в градусах Цельсия
  label: string;      // Название точки / этапа
  phase?: string;     // Фаза / ферментативная пауза
  stageName?: string; // Название стадии брожения
  isMilestone?: boolean; // Ключевая контрольная точка
}

export interface CompiledBrewReportData {
  id: string;
  batchNumber: string;
  recipeName: string;
  style: string;
  category: string;
  author: string;
  brewDate: string;
  completionDate: string;
  status: string;
  statusLabel: string;
  isCompleted: boolean;
  og: {
    target: number;
    actual: number;
    delta: number;
    targetPlato: number;
    actualPlato: number;
  };
  fg: {
    target: number;
    actual: number;
    delta: number;
    targetPlato: number;
    actualPlato: number;
  };
  abv: {
    target: number;
    actual: number;
    delta: number;
  };
  attenuationPercent: {
    actual: number;
    target: number;
  };
  efficiency: {
    target: number;
    actual: number;
  };
  ibu: number;
  ebc: number;
  ebcHex: string;
  mashPh: number;
  fermentTempC: number;
  bjcp: {
    totalScore: number;
    rankTitle: string;
    rankDescription: string;
    badgeColor: string;
    breakdown: {
      aroma: number;
      maxAroma: number;
      appearance: number;
      maxAppearance: number;
      flavor: number;
      maxFlavor: number;
      mouthfeel: number;
      maxMouthfeel: number;
      overall: number;
      maxOverall: number;
    };
  };
  tastingNotes: {
    aroma: string;
    appearance: string;
    flavor: string;
    mouthfeel: string;
    overall: string;
  };
  notes: string;
  batchStages: Array<{
    id: string;
    name: string;
    dayOffset: number;
    dateStr: string;
    durationDays: number;
    targetTempC: number;
    isCompleted: boolean;
    description: string;
    actionRequired: string;
  }>;
  mashCurve: TemperatureCurvePoint[];
  fermentCurve: TemperatureCurvePoint[];
  ingredientsSummary: {
    grains: Array<{ name: string; weightKg: number; percent: number; colorEbc: number }>;
    hops: Array<{ name: string; weightG: number; use: string; boilTimeMin: number; alphaAcid: number }>;
    yeast: { name: string; lab: string; tempRange: [number, number]; attenuationPercent: number };
    others?: Array<{ name: string; amount: number; unit: string; stage: string }>;
    water: { strikeL: number; spargeL: number; totalL: number; strikeTempC: number };
  };
}

/**
 * Определение официального судейского ранга BJCP по баллам
 */
export function getBjcpRank(score: number): {
  rankTitle: string;
  rankDescription: string;
  badgeColor: string;
} {
  if (score >= 45) {
    return {
      rankTitle: 'Выдающееся (Outstanding)',
      rankDescription: 'Мировой эталон стиля. Безупречный баланс, чистота брожения и богатство букета.',
      badgeColor: 'bg-emerald-500 text-white'
    };
  }
  if (score >= 38) {
    return {
      rankTitle: 'Отличное (Excellent)',
      rankDescription: 'Образец для подражания. Прекрасный баланс солода и хмеля с незначительными нюансами.',
      badgeColor: 'bg-blue-600 text-white'
    };
  }
  if (score >= 30) {
    return {
      rankTitle: 'Хорошее (Very Good)',
      rankDescription: 'Точное попадание в стиль. Приятное, питкое пиво с легкими отступлениями от эталона.',
      badgeColor: 'bg-amber-500 text-white'
    };
  }
  if (score >= 21) {
    return {
      rankTitle: 'Удовлетворительное (Good)',
      rankDescription: 'Требует доработки. Присутствуют мелкие дефекты брожения или смещение баланса.',
      badgeColor: 'bg-orange-500 text-white'
    };
  }
  return {
    rankTitle: 'Проблемное (Fair/Problematic)',
    rankDescription: 'Существенные отклонения, посторонние привкусы или дефекты санитарии.',
    badgeColor: 'bg-red-500 text-white'
  };
}

/**
 * Построение температурной кривой затирания сусла (Mash Profile)
 */
export function generateMashProfileCurve(recipe?: Recipe | null): TemperatureCurvePoint[] {
  const points: TemperatureCurvePoint[] = [];

  // Начальная температура воды под засыпь (Strike water)
  const strikeTemp = recipe?.calculated?.strikeTempC || 72;
  points.push({
    x: 0,
    tempC: strikeTemp,
    label: 'Вода под засыпь',
    phase: 'strike',
    isMilestone: true
  });

  const mashSchedule = recipe?.mashSchedule || [
    { id: '1', name: 'Мальтозная пауза', tempC: 64, timeMin: 45, type: 'maltose' },
    { id: '2', name: 'Осахаривание (Декстрин)', tempC: 72, timeMin: 20, type: 'dextrin' },
    { id: '3', name: 'Мэшаут (Mash Out)', tempC: 78, timeMin: 10, type: 'mashout' }
  ];

  let currentMinute = 5; // Время засыпи и стабилизации

  mashSchedule.forEach((rest, idx) => {
    // Начало паузы
    points.push({
      x: currentMinute,
      tempC: rest.tempC,
      label: rest.name,
      phase: rest.type,
      isMilestone: true
    });

    currentMinute += rest.timeMin;

    // Окончание паузы
    points.push({
      x: currentMinute,
      tempC: rest.tempC,
      label: `${rest.name} (Конец)`,
      phase: rest.type,
      isMilestone: false
    });

    // Нагрев до следующей паузы (если есть)
    if (idx < mashSchedule.length - 1) {
      currentMinute += 5; // 5 минут на нагрев
    }
  });

  // Промывка дробины
  currentMinute += 10;
  points.push({
    x: currentMinute,
    tempC: 78,
    label: 'Промывка дробины (78°C)',
    phase: 'sparge',
    isMilestone: true
  });

  return points;
}

/**
 * Построение температурной кривой брожения, карбонизации и созревания
 */
export function generateFermentationCurve(
  batch?: FermentationBatch | null,
  recipe?: Recipe | null,
  log?: BrewLog | null
): TemperatureCurvePoint[] {
  const isLager = recipe?.yeast?.type === 'lager' || recipe?.style?.toLowerCase().includes('лагер') || false;
  const isWheat = recipe?.yeast?.type === 'wheat' || recipe?.style?.toLowerCase().includes('пшенич') || false;
  const baseFermentTemp = log?.fermentTempC || (isLager ? 12 : 19);

  // Если у партии уже есть стадии из календаря, используем их точные параметры
  if (batch && batch.stages && batch.stages.length > 0) {
    const points: TemperatureCurvePoint[] = [];

    // День 0: Охлаждение сусла и внесение дрожжей
    points.push({
      x: 0,
      tempC: baseFermentTemp,
      label: 'День 0: Внесение дрожжей',
      stageName: 'Засев дрожжей',
      isMilestone: true
    });

    batch.stages.forEach((stage) => {
      const startDay = stage.dayOffset;
      const endDay = stage.durationDays > 0 ? startDay + stage.durationDays : startDay + 1;

      // Начало этапа
      points.push({
        x: startDay,
        tempC: stage.targetTempC,
        label: `${stage.name} (Старт)`,
        stageName: stage.name,
        isMilestone: true
      });

      // Пик активности в первичном брожении (экзотермический подъем +0.8°C)
      if (stage.id.includes('st_2') || stage.name.toLowerCase().includes('брожение')) {
        const peakDay = startDay + Math.max(1, Math.floor(stage.durationDays / 3));
        points.push({
          x: peakDay,
          tempC: Number((stage.targetTempC + 0.8).toFixed(1)),
          label: 'Пик брожения (Краузен)',
          stageName: stage.name,
          isMilestone: false
        });
      }

      // Завершение этапа
      if (stage.durationDays > 0) {
        points.push({
          x: endDay,
          tempC: stage.targetTempC,
          label: `${stage.name} (Финиш)`,
          stageName: stage.name,
          isMilestone: false
        });
      }
    });

    // Сортировка по возрастанию дня
    points.sort((a, b) => a.x - b.x);
    return points;
  }

  // Дефолтная 40-дневная крафтовая кривая (включая карбонизацию и созревание)
  const defaultStages = [
    { day: 0, temp: baseFermentTemp, label: 'Внесение дрожжей (Засев)', milestone: true },
    { day: 2, temp: baseFermentTemp + 0.8, label: 'Пик краузена (Активное брожение)', milestone: false },
    { day: isLager ? 12 : 7, temp: baseFermentTemp, label: 'Окончание первичного брожения', milestone: false },
    { day: isLager ? 13 : 8, temp: isLager ? baseFermentTemp + 3 : baseFermentTemp + 2, label: 'Диацетиловая пауза / Dry Hop', milestone: true },
    { day: isLager ? 16 : 11, temp: recipe?.beerTempAtBottlingC || 20, label: 'Розлив и праймер', milestone: true },
    { day: isLager ? 17 : 12, temp: 21, label: 'Карбонизация в бутылках', milestone: true },
    { day: isLager ? 30 : 25, temp: 21, label: 'Завершение карбонизации', milestone: false },
    { day: isLager ? 31 : 26, temp: isLager ? 2 : 4, label: 'Холодное созревание / Лагеризация', milestone: true },
    { day: isLager ? 59 : 40, temp: isLager ? 2 : 4, label: 'Пик зрелости крафта', milestone: false },
    { day: isLager ? 60 : 41, temp: 8, label: 'Готово к дегустации (Подача 8°C)', milestone: true }
  ];

  return defaultStages.map(s => ({
    x: s.day,
    tempC: Number(s.temp.toFixed(1)),
    label: s.label,
    stageName: s.label,
    isMilestone: s.milestone
  }));
}

/**
 * Объединение данных из журнала варок (BrewLog), календаря (FermentationBatch) и рецепта (Recipe)
 * в единую готовую модель данных для отчета
 */
export function compileCompletedBrewReport(
  log: BrewLog,
  batch?: FermentationBatch | null,
  recipe?: Recipe | null
): CompiledBrewReportData {
  const targetOg = log.targetOg || recipe?.calculated?.ogSg || 1.050;
  const actualOg = log.actualOg || 1.052;
  const targetFg = log.targetFg || recipe?.calculated?.fgSg || 1.010;
  const actualFg = log.actualFg || 1.011;

  const actualAbv = log.actualAbv || Number(((actualOg - actualFg) * 131.25).toFixed(1));
  const targetAbv = log.targetAbv || recipe?.calculated?.abv || 5.0;

  // Видимая степень сбраживания (Apparent Attenuation)
  const actualAttenuation = targetOg > 1 ? Number((((actualOg - actualFg) / (actualOg - 1)) * 100).toFixed(1)) : 75;
  const targetAttenuation = targetOg > 1 ? Number((((targetOg - targetFg) / (targetOg - 1)) * 100).toFixed(1)) : 75;

  const bjcpScore = log.bjcpScore !== undefined ? log.bjcpScore : 45;
  const bjcpRank = getBjcpRank(bjcpScore);

  // Разбор дегустационной оценки
  const breakdown = {
    aroma: Math.min(12, Math.round(bjcpScore * 0.24)),
    maxAroma: 12,
    appearance: Math.min(3, Math.round(bjcpScore * 0.06)),
    maxAppearance: 3,
    flavor: Math.min(20, Math.round(bjcpScore * 0.40)),
    maxFlavor: 20,
    mouthfeel: Math.min(5, Math.round(bjcpScore * 0.10)),
    maxMouthfeel: 5,
    overall: Math.min(10, Math.round(bjcpScore * 0.20)),
    maxOverall: 10
  };

  // Вычисление даты завершения / розлива
  let completionDate = log.bottlingDate || '';
  if (!completionDate && batch?.startDate) {
    const startMs = new Date(batch.startDate).getTime();
    const totalDays = batch.stages.reduce((acc, s) => Math.max(acc, s.dayOffset + s.durationDays), 40);
    completionDate = new Date(startMs + totalDays * 86400000).toISOString().split('T')[0];
  }
  if (!completionDate && log.brewDate) {
    completionDate = new Date(new Date(log.brewDate).getTime() + 40 * 86400000).toISOString().split('T')[0];
  }

  // Расчет дат этапов календаря
  const batchStart = batch?.startDate || log.brewDate || new Date().toISOString().split('T')[0];
  const startMs = new Date(batchStart).getTime();

  const batchStages = (batch?.stages || []).map(stage => {
    const stageDate = new Date(startMs + stage.dayOffset * 86400000).toLocaleDateString('ru-RU');
    return {
      id: stage.id,
      name: stage.name,
      dayOffset: stage.dayOffset,
      dateStr: stageDate,
      durationDays: stage.durationDays,
      targetTempC: stage.targetTempC,
      isCompleted: stage.isCompleted,
      description: stage.description,
      actionRequired: stage.actionRequired
    };
  });

  const totalGrainWeightKg = recipe?.calculated?.totalGrainWeightKg || 5.0;

  const grainsSummary = (recipe?.grains || []).map(g => ({
    name: g.name,
    weightKg: g.weightKg,
    percent: totalGrainWeightKg > 0 ? Number(((g.weightKg / totalGrainWeightKg) * 100).toFixed(1)) : 0,
    colorEbc: g.colorEbc
  }));

  const hopsSummary = (recipe?.hops || []).map(h => ({
    name: h.name,
    weightG: h.weightG,
    use: h.use,
    boilTimeMin: h.boilTimeMin,
    alphaAcid: h.alphaAcid
  }));

  const yeastSummary = recipe?.yeast || {
    name: 'SafAle US-05',
    lab: 'Fermentis',
    tempRange: [18, 22] as [number, number],
    attenuationPercent: 78
  };

  const ebc = recipe?.calculated?.ebc || 14;

  const mashCurve = generateMashProfileCurve(recipe);
  const fermentCurve = generateFermentationCurve(batch, recipe, log);

  const isCompleted = log.status === 'ready' || log.status === 'archived' || !!batch?.isFinished;
  const statusLabel = isCompleted ? 'Варка завершена & Продегустировано' : 'Брожение и выдержка';

  return {
    id: log.id,
    batchNumber: log.batchNumber || 'Партия #1',
    recipeName: log.recipeName || recipe?.name || 'Крафтовое пиво',
    style: recipe?.style || 'American IPA',
    category: recipe?.category || 'Ale',
    author: recipe?.author || 'Главный пивовар',
    brewDate: log.brewDate || new Date().toISOString().split('T')[0],
    completionDate,
    status: log.status,
    statusLabel,
    isCompleted,
    og: {
      target: targetOg,
      actual: actualOg,
      delta: Number((actualOg - targetOg).toFixed(3)),
      targetPlato: sgToPlato(targetOg),
      actualPlato: sgToPlato(actualOg)
    },
    fg: {
      target: targetFg,
      actual: actualFg,
      delta: Number((actualFg - targetFg).toFixed(3)),
      targetPlato: sgToPlato(targetFg),
      actualPlato: sgToPlato(actualFg)
    },
    abv: {
      target: targetAbv,
      actual: actualAbv,
      delta: Number((actualAbv - targetAbv).toFixed(1))
    },
    attenuationPercent: {
      actual: actualAttenuation,
      target: targetAttenuation
    },
    efficiency: {
      target: recipe?.efficiencyPercent || 72,
      actual: log.actualEfficiency || 72
    },
    ibu: recipe?.calculated?.ibu || 45,
    ebc,
    ebcHex: ebcToHex(ebc),
    mashPh: log.mashPh || 5.35,
    fermentTempC: log.fermentTempC || 19.5,
    bjcp: {
      totalScore: bjcpScore,
      rankTitle: bjcpRank.rankTitle,
      rankDescription: bjcpRank.rankDescription,
      badgeColor: bjcpRank.badgeColor,
      breakdown
    },
    tastingNotes: {
      aroma: log.tastingNotes?.aroma || 'Чистый хмелевой профиль с тропическими нотами.',
      appearance: log.tastingNotes?.appearance || 'Яркий золотистый цвет со стойкой мелкозернистой пеной.',
      flavor: log.tastingNotes?.flavor || 'Сбалансированная хмелевая горечь с мягкой солодовой сладостью.',
      mouthfeel: log.tastingNotes?.mouthfeel || 'Округлое среднее тело, мягкая карбонизация.',
      overall: log.tastingNotes?.overall || 'Превосходное крафтовое пиво высокого качества.'
    },
    notes: log.notes || 'Варка и брожение прошли в строгом соответствии с технологической картой.',
    batchStages,
    mashCurve,
    fermentCurve,
    ingredientsSummary: {
      grains: grainsSummary,
      hops: hopsSummary,
      yeast: yeastSummary,
      others: recipe?.otherIngredients?.map(o => ({
        name: o.name,
        amount: o.amount,
        unit: o.unit,
        stage: o.stage
      })),
      water: {
        strikeL: recipe?.calculated?.strikeWaterL || 18,
        spargeL: recipe?.calculated?.spargeWaterL || 15,
        totalL: recipe?.calculated?.totalWaterL || 33,
        strikeTempC: recipe?.calculated?.strikeTempC || 72
      }
    }
  };
}
