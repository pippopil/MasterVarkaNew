import { Recipe, Yeast } from '../../types/brewing';
import { calculateBrewMetrics, scaleRecipeIngredients } from '../../utils/brewingMath';

export const YEAST_US05: Yeast = {
  name: 'SafAle US-05',
  lab: 'Fermentis',
  form: 'dry',
  type: 'ale',
  cellsPerGramOrVial: 20,
  attenuationPercent: 81,
  tempRange: [18, 24],
  styleDescription: 'Нейтральный чистый профиль, идеален для американских элей и IPA.'
};

export const YEAST_S04: Yeast = {
  name: 'SafAle S-04',
  lab: 'Fermentis',
  form: 'dry',
  type: 'ale',
  cellsPerGramOrVial: 20,
  attenuationPercent: 75,
  tempRange: [15, 20],
  styleDescription: 'Английский элевый штамм с быстрой флокуляцией и мягкими эфирами.'
};

export const YEAST_W3470: Yeast = {
  name: 'SafLager W-34/70',
  lab: 'Fermentis',
  form: 'dry',
  type: 'lager',
  cellsPerGramOrVial: 20,
  attenuationPercent: 83,
  tempRange: [9, 15],
  styleDescription: 'Классический штамм Вайенштефан для немецких и чешских лагеров.'
};

export const YEAST_WB06: Yeast = {
  name: 'SafAle WB-06',
  lab: 'Fermentis',
  form: 'dry',
  type: 'wheat',
  cellsPerGramOrVial: 20,
  attenuationPercent: 86,
  tempRange: [18, 24],
  styleDescription: 'Баварский пшеничный штамм с выраженными эфирами банана и гвоздики.'
};

export const YEAST_BE256: Yeast = {
  name: 'SafAle BE-256 (Abbaye)',
  lab: 'Fermentis',
  form: 'dry',
  type: 'belgian',
  cellsPerGramOrVial: 20,
  attenuationPercent: 84,
  tempRange: [18, 25],
  styleDescription: 'Траппистский монастырский штамм для крепких бельгийских элей.'
};

export const YEAST_BE134: Yeast = {
  name: 'SafAle BE-134 (Saison)',
  lab: 'Fermentis',
  form: 'dry',
  type: 'belgian',
  cellsPerGramOrVial: 20,
  attenuationPercent: 90,
  tempRange: [18, 28],
  styleDescription: 'Фермерский сэзон высокой сбраживаемости с перечным букетом.'
};

export const YEAST_NOTTINGHAM: Yeast = {
  name: 'LalBrew Nottingham',
  lab: 'Lallemand',
  form: 'dry',
  type: 'ale',
  cellsPerGramOrVial: 20,
  attenuationPercent: 80,
  tempRange: [14, 21],
  styleDescription: 'Универсальный английский штамм с высокой сбраживаемостью.'
};

export const YEAST_VOSS: Yeast = {
  name: 'LalBrew Voss Kveik',
  lab: 'Lallemand',
  form: 'dry',
  type: 'kveik',
  cellsPerGramOrVial: 20,
  attenuationPercent: 78,
  tempRange: [25, 40],
  styleDescription: 'Норвежский квейк: быстрое сбраживание при температуре до 40°C.'
};

export const YEAST_PHILLY_SOUR: Yeast = {
  name: 'LalBrew Philly Sour',
  lab: 'Lallemand',
  form: 'dry',
  type: 'sour',
  cellsPerGramOrVial: 20,
  attenuationPercent: 75,
  tempRange: [20, 25],
  styleDescription: 'Штамм Lachancea: вырабатывает молочную кислоту и сбраживает одновременно.'
};

export const YEAST_S33: Yeast = {
  name: 'SafAle S-33',
  lab: 'Fermentis',
  form: 'dry',
  type: 'ale',
  cellsPerGramOrVial: 20,
  attenuationPercent: 70,
  tempRange: [15, 20],
  styleDescription: 'Плотный штамм для десертных стаутов и бельгийских блондов.'
};

export const YEAST_M54: Yeast = {
  name: "Mangrove Jack's M54 Californian Lager",
  lab: "Mangrove Jack's",
  form: 'dry',
  type: 'lager',
  cellsPerGramOrVial: 20,
  attenuationPercent: 80,
  tempRange: [18, 20],
  styleDescription: 'Лагерный штамм для теплого сбраживания без холодильника.'
};

export const YEAST_M21: Yeast = {
  name: "Mangrove Jack's M21 Belgian Wit",
  lab: "Mangrove Jack's",
  form: 'dry',
  type: 'wheat',
  cellsPerGramOrVial: 20,
  attenuationPercent: 74,
  tempRange: [18, 25],
  styleDescription: 'Штамм для бельгийского бланша с легкой пряностью и фенолами.'
};

export function createExtendedRecipe(
  id: string,
  name: string,
  style: string,
  category: string,
  description: string,
  author: string,
  batchSizeL: number,
  boilTimeMin: number,
  efficiencyPercent: number,
  grains: Recipe['grains'],
  hops: Recipe['hops'],
  mashSchedule: Recipe['mashSchedule'],
  yeast: Recipe['yeast'],
  targetCarbonationVol: number,
  beerTempAtBottlingC: number,
  tags: string[],
  collection: Recipe['collection'] = undefined,
  otherIngredients: Recipe['otherIngredients'] = []
): Recipe {
  let finalBatchSizeL = batchSizeL;
  let finalGrains = grains;
  let finalHops = hops;

  if (batchSizeL === 20) {
    const { scaledGrains, scaledHops } = scaleRecipeIngredients(grains, hops, 20, 30);
    finalBatchSizeL = 30;
    finalGrains = scaledGrains;
    finalHops = scaledHops;
  }

  const calculated = calculateBrewMetrics({
    batchSizeL: finalBatchSizeL,
    boilTimeMin,
    efficiencyPercent,
    grainRatioLPerKg: 3.5,
    grainTempC: 20,
    targetCarbonationVol,
    beerTempAtBottlingC,
    grains: finalGrains,
    hops: finalHops,
    yeast,
    otherIngredients
  });

  return {
    id,
    name,
    style,
    category,
    description,
    author,
    batchSizeL: finalBatchSizeL,
    boilTimeMin,
    efficiencyPercent,
    grainRatioLPerKg: 3.5,
    grainTempC: 20,
    targetCarbonationVol,
    beerTempAtBottlingC,
    grains: finalGrains,
    hops: finalHops,
    yeast,
    mashSchedule,
    otherIngredients,
    calculated,
    tags,
    collection,
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
