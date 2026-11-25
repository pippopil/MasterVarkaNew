import { describe, it, expect } from 'vitest';
import {
  compileCompletedBrewReport,
  generateMashProfileCurve,
  generateFermentationCurve,
  getBjcpRank
} from '../src/utils/brewReportGenerator';
import { BrewLog, FermentationBatch, Recipe } from '../src/types/brewing';

describe('Completed Brew Report & Temperature Curve Generator', () => {
  const mockRecipe: Recipe = {
    id: 'rec_test_1',
    name: 'Mosaic Double IPA',
    style: 'Double IPA',
    category: 'IPA',
    description: 'Ароматный мощный IPA с сухим охмелением',
    author: 'Крафтовый Мастер',
    batchSizeL: 25,
    boilTimeMin: 60,
    efficiencyPercent: 75,
    grainRatioLPerKg: 3.5,
    grainTempC: 20,
    targetCarbonationVol: 2.5,
    beerTempAtBottlingC: 18,
    grains: [
      { id: 'g1', name: 'Пилснер Курский', weightKg: 6.0, potentialSg: 1.037, colorEbc: 3.5, type: 'base' },
      { id: 'g2', name: 'Карамельный 50', weightKg: 0.5, potentialSg: 1.034, colorEbc: 50, type: 'caramel' }
    ],
    hops: [
      { id: 'h1', name: 'Magnum', weightG: 30, alphaAcid: 14.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Mosaic', weightG: 70, alphaAcid: 12.5, boilTimeMin: 0, use: 'dry_hop' }
    ],
    mashSchedule: [
      { id: 'm1', name: 'Мальтозная пауза', tempC: 65, timeMin: 50, type: 'maltose' },
      { id: 'm2', name: 'Осахаривание', tempC: 72, timeMin: 15, type: 'dextrin' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    yeast: {
      name: 'SafAle US-05',
      lab: 'Fermentis',
      form: 'dry',
      type: 'ale',
      cellsPerGramOrVial: 20,
      attenuationPercent: 81,
      tempRange: [18, 22]
    },
    calculated: {
      ogSg: 1.065,
      ogPlato: 15.9,
      fgSg: 1.012,
      fgPlato: 3.1,
      abv: 7.0,
      ibu: 65,
      srm: 6.5,
      ebc: 13,
      buGuRatio: 1.0,
      totalGrainWeightKg: 6.5,
      strikeWaterL: 22.75,
      spargeWaterL: 14.25,
      totalWaterL: 37.0,
      strikeTempC: 72,
      dryYeastGramsNeeded: 15,
      yeastPacksNeeded: 2,
      dextroseGrams: 150,
      sucroseGrams: 135,
      dmeGrams: 195,
      speiseMl: 1800,
      caloriesPer500ml: 260
    },
    tags: ['IPA', 'Mosaic'],
    createdAt: '2026-03-01',
    updatedAt: '2026-03-01'
  };

  const mockLog: BrewLog = {
    id: 'log_test_1',
    recipeId: 'rec_test_1',
    recipeName: 'Mosaic Double IPA',
    batchNumber: 'Варка #42',
    brewDate: '2026-03-10',
    targetOg: 1.065,
    targetFg: 1.012,
    targetAbv: 7.0,
    actualOg: 1.067,
    actualFg: 1.011,
    actualAbv: 7.3,
    actualEfficiency: 76,
    mashPh: 5.32,
    fermentTempC: 19.0,
    bottlingDate: '2026-03-24',
    bjcpScore: 46,
    tastingNotes: {
      aroma: 'Яркие тропики, спелое манго и цитрусы',
      appearance: 'Золотистый насыщенный цвет, стойкая пена',
      flavor: 'Уверенная чистая горечь, сухое чистое послевкусие',
      mouthfeel: 'Округлое плотное тело, приятная газация',
      overall: 'Превосходный Double IPA мирового уровня'
    },
    notes: 'Затирание прошло идеально, промывка 78°C',
    status: 'ready'
  };

  const mockBatch: FermentationBatch = {
    id: 'batch_test_1',
    recipeId: 'rec_test_1',
    recipeName: 'Mosaic Double IPA',
    batchNumber: 'Варка #42',
    startDate: '2026-03-10',
    stages: [
      {
        id: 'st_1',
        name: 'День варки (Brew Day)',
        description: 'Затирание и кипячение',
        dayOffset: 0,
        durationDays: 1,
        targetTempC: 65,
        isCompleted: true,
        actionRequired: 'Внести дрожжи при 19°C'
      },
      {
        id: 'st_2',
        name: 'Главное брожение',
        description: 'Активное брожение',
        dayOffset: 1,
        durationDays: 7,
        targetTempC: 19,
        isCompleted: true,
        actionRequired: 'Контроль температуры 19°C'
      },
      {
        id: 'st_3',
        name: 'Сухое охмеление (Dry Hop)',
        description: 'Внесение 70г хмеля Mosaic',
        dayOffset: 8,
        durationDays: 3,
        targetTempC: 21,
        isCompleted: true,
        actionRequired: 'Внести хмель без аэрации'
      },
      {
        id: 'st_4',
        name: 'Розлив и карбонизация',
        description: 'Внесение декстрозы и укупорка',
        dayOffset: 11,
        durationDays: 14,
        targetTempC: 21,
        isCompleted: true,
        actionRequired: 'Держать бутылки при 20-22°C'
      },
      {
        id: 'st_5',
        name: 'Холодное созревание',
        description: 'Осветление пива в холоде',
        dayOffset: 25,
        durationDays: 14,
        targetTempC: 4,
        isCompleted: true,
        actionRequired: 'Охладить до 4°C'
      }
    ],
    notes: 'Все стадии успешно завершены',
    isFinished: true
  };

  it('correctly evaluates BJCP rank thresholds', () => {
    expect(getBjcpRank(48).rankTitle).toContain('Outstanding');
    expect(getBjcpRank(40).rankTitle).toContain('Excellent');
    expect(getBjcpRank(32).rankTitle).toContain('Very Good');
    expect(getBjcpRank(25).rankTitle).toContain('Good');
    expect(getBjcpRank(15).rankTitle).toContain('Problematic');
  });

  it('compiles comprehensive brew report combining journal and calendar data', () => {
    const report = compileCompletedBrewReport(mockLog, mockBatch, mockRecipe);

    expect(report.recipeName).toBe('Mosaic Double IPA');
    expect(report.batchNumber).toBe('Варка #42');
    expect(report.style).toBe('Double IPA');
    expect(report.isCompleted).toBe(true);

    // Метрология план vs факт
    expect(report.og.actual).toBe(1.067);
    expect(report.og.target).toBe(1.065);
    expect(report.og.delta).toBe(0.002);
    expect(report.fg.actual).toBe(1.011);
    expect(report.abv.actual).toBe(7.3);
    expect(report.efficiency.actual).toBe(76);
    expect(report.mashPh).toBe(5.32);

    // Аттенюация
    expect(report.attenuationPercent.actual).toBeGreaterThan(80);

    // BJCP
    expect(report.bjcp.totalScore).toBe(46);
    expect(report.bjcp.rankTitle).toContain('Outstanding');
    expect(report.bjcp.breakdown.aroma).toBeGreaterThan(0);
    expect(report.bjcp.breakdown.flavor).toBeGreaterThan(0);

    // Дегустация
    expect(report.tastingNotes.aroma).toContain('тропики');
    expect(report.tastingNotes.overall).toContain('мирового уровня');

    // Календарь
    expect(report.batchStages.length).toBe(5);
    expect(report.batchStages[0].name).toContain('Brew Day');
    expect(report.batchStages[2].name).toContain('Dry Hop');

    // Ингредиенты
    expect(report.ingredientsSummary.grains.length).toBe(2);
    expect(report.ingredientsSummary.hops.length).toBe(2);
    expect(report.ingredientsSummary.water.totalL).toBe(37);
  });

  it('generates mash temperature profile curve points', () => {
    const mashCurve = generateMashProfileCurve(mockRecipe);

    expect(mashCurve.length).toBeGreaterThanOrEqual(4);
    // Strike water temperature
    expect(mashCurve[0].x).toBe(0);
    expect(mashCurve[0].tempC).toBe(72);

    // Rests exist
    const maltosePoint = mashCurve.find(p => p.tempC === 65);
    expect(maltosePoint).toBeDefined();

    const mashoutPoint = mashCurve.find(p => p.tempC === 78);
    expect(mashoutPoint).toBeDefined();
  });

  it('generates fermentation & aging temperature curve points with stages', () => {
    const fermentCurve = generateFermentationCurve(mockBatch, mockRecipe, mockLog);

    expect(fermentCurve.length).toBeGreaterThan(5);

    // Day 0 exists
    expect(fermentCurve[0].x).toBe(0);

    // Primary fermentation at ~19°C
    const primaryPoints = fermentCurve.filter(p => p.tempC >= 18 && p.tempC <= 20);
    expect(primaryPoints.length).toBeGreaterThan(0);

    // Cold maturation at 4°C
    const coldPoint = fermentCurve.find(p => p.tempC <= 5);
    expect(coldPoint).toBeDefined();
    expect(coldPoint?.x).toBeGreaterThan(20);
  });

  it('handles fallback gracefully when recipe or batch is missing', () => {
    const minimalLog: BrewLog = {
      id: 'log_min',
      recipeId: 'unknown',
      recipeName: 'Минимальная варка',
      batchNumber: 'Партия 1',
      brewDate: '2026-04-01',
      targetOg: 1.050,
      targetFg: 1.010,
      targetAbv: 5.2,
      actualOg: 1.050,
      actualFg: 1.010,
      actualAbv: 5.2,
      actualEfficiency: 70,
      fermentTempC: 20,
      tastingNotes: {
        aroma: 'Приятный',
        appearance: 'Светлое',
        flavor: 'Сбалансированный',
        mouthfeel: 'Освежающее',
        overall: 'Хорошо'
      },
      notes: '',
      status: 'ready'
    };

    const report = compileCompletedBrewReport(minimalLog, null, null);
    expect(report.recipeName).toBe('Минимальная варка');
    expect(report.og.actual).toBe(1.050);
    expect(report.mashCurve.length).toBeGreaterThan(0);
    expect(report.fermentCurve.length).toBeGreaterThan(0);
  });
});
