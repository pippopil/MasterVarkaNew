/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { Recipe } from '../types/brewing';

/**
 * Zod-схема для солода и несоложенки
 */
export const GrainItemSchema = z.object({
  id: z.string().min(1, 'ID солода не может быть пустым'),
  name: z.string().min(1, 'Название солода обязательно').max(100),
  weightKg: z.number().gt(0, 'Вес солода должен быть больше 0').max(500, 'Вес солода не может превышать 500 кг'),
  potentialSg: z.number().min(1.000, 'Экстрактивность не может быть меньше 1.000 SG').max(1.200, 'Экстрактивность не может превышать 1.200 SG'),
  colorEbc: z.number().min(0, 'Цветность EBC не может быть отрицательной').max(2500, 'Цветность EBC слишком велика'),
  type: z.enum(['base', 'caramel', 'roasted', 'wheat', 'adjunct', 'acid']),
  notes: z.string().optional()
});

/**
 * Zod-схема для хмеля
 */
export const HopItemSchema = z.object({
  id: z.string().min(1, 'ID хмеля не может быть пустым'),
  name: z.string().min(1, 'Название хмеля обязательно').max(100),
  weightG: z.number().gt(0, 'Вес хмеля должен быть больше 0').max(10000, 'Вес хмеля не может превышать 10 кг'),
  alphaAcid: z.number().min(0, 'Альфа-кислота не может быть отрицательной').max(50, 'Альфа-кислота не может превышать 50%'),
  boilTimeMin: z.number().min(0, 'Время варки не может быть отрицательным').max(360, 'Время варки не может превышать 360 мин'),
  use: z.enum(['boil', 'aroma', 'whirlpool', 'dry_hop']),
  notes: z.string().optional()
});

/**
 * Zod-схема для температурных пауз затирания
 */
export const MashRestSchema = z.object({
  id: z.string().min(1, 'ID температурной паузы не может быть пустым'),
  name: z.string().min(1, 'Название паузы обязательно').max(100),
  tempC: z.number().min(20, 'Температура паузы должна быть не менее 20°C').max(105, 'Температура паузы не может превышать 105°C'),
  timeMin: z.number().min(0, 'Длительность паузы не может быть отрицательной').max(360, 'Длительность паузы не может превышать 360 мин'),
  type: z.enum(['strike', 'acid', 'protein', 'maltose', 'dextrin', 'mashout', 'custom']),
  description: z.string().optional()
});

/**
 * Zod-схема для дрожжей
 */
export const YeastSchema = z.object({
  name: z.string().min(1, 'Название дрожжей обязательно').max(100),
  lab: z.string().default('Fermentis'),
  form: z.enum(['dry', 'liquid']),
  type: z.enum(['ale', 'lager', 'wheat', 'belgian', 'kveik', 'sour']),
  cellsPerGramOrVial: z.number().positive('Количество клеток должно быть положительным'),
  attenuationPercent: z.number().min(20, 'Аттенюация не может быть ниже 20%').max(100, 'Аттенюация не может превышать 100%'),
  tempRange: z.tuple([z.number().min(0), z.number().max(50)]),
  styleDescription: z.string().optional()
});

/**
 * Zod-схема для дополнительных ингредиентов
 */
export const OtherIngredientItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Название ингредиента обязательно').max(100),
  amount: z.number().positive('Количество ингредиента должно быть положительным'),
  unit: z.enum(['g', 'kg', 'ml', 'pcs', 'drop']),
  stage: z.enum(['mash', 'boil', 'primary', 'secondary', 'bottling']),
  timeMinOrDays: z.number().optional(),
  type: z.enum(['sugar', 'spice', 'fruit', 'fining', 'water_agent', 'flavor', 'wood', 'herb', 'other']),
  colorEbc: z.number().optional(),
  extractPercent: z.number().optional(),
  fermentablePercent: z.number().optional(),
  notes: z.string().optional()
});

/**
 * Zod-схема для расчетных характеристик варки
 */
export const CalculatedBrewParamsSchema = z.object({
  ogSg: z.number().finite().min(1.000).max(1.300),
  ogPlato: z.number().finite().min(0).max(50),
  fgSg: z.number().finite().min(0.980).max(1.200),
  fgPlato: z.number().finite().min(0).max(35),
  abv: z.number().finite().min(0).max(30),
  ibu: z.number().finite().min(0).max(400),
  srm: z.number().finite().min(0).max(200),
  ebc: z.number().finite().min(0).max(400),
  buGuRatio: z.number().finite().min(0),
  totalGrainWeightKg: z.number().finite().positive(),
  strikeWaterL: z.number().finite().positive(),
  spargeWaterL: z.number().finite().min(0),
  totalWaterL: z.number().finite().positive(),
  strikeTempC: z.number().finite().min(20).max(100),
  dryYeastGramsNeeded: z.number().finite().min(0),
  yeastPacksNeeded: z.number().finite().min(0),
  dextroseGrams: z.number().finite().min(0),
  sucroseGrams: z.number().finite().min(0),
  dmeGrams: z.number().finite().min(0),
  speiseMl: z.number().finite().min(0),
  caloriesPer500ml: z.number().finite().min(0)
});

/**
 * Строгая схема полного рецепта для надежного хранения в IndexedDB
 */
export const StrictRecipeSchema = z.object({
  id: z.string().min(1, 'ID рецепта обязателен'),
  name: z.string().min(1, 'Название рецепта не может быть пустым').max(150),
  style: z.string().min(1, 'Стиль рецепта обязателен').max(100),
  category: z.string().min(1, 'Категория рецепта обязательна').max(100),
  description: z.string().max(5000).default(''),
  author: z.string().max(100).default('Импортировано'),
  batchSizeL: z.number().gt(0, 'Объем партии должен быть больше 0').max(1000, 'Объем партии не может превышать 1000 л'),
  boilTimeMin: z.number().min(5, 'Время кипячения должно быть не менее 5 минут').max(360, 'Время кипячения не может превышать 360 минут'),
  efficiencyPercent: z.number().min(10, 'Эффективность варочника не может быть меньше 10%').max(100, 'Эффективность не может превышать 100%'),
  grainRatioLPerKg: z.number().min(1).max(10).default(3.5),
  grainTempC: z.number().min(0).max(50).default(20),
  targetCarbonationVol: z.number().min(1).max(6).default(2.4),
  beerTempAtBottlingC: z.number().min(0).max(40).default(20),
  grains: z.array(GrainItemSchema).min(1, 'Рецепт должен содержать хотя бы один солод или сбраживаемый ингредиент'),
  hops: z.array(HopItemSchema).default([]),
  mashSchedule: z.array(MashRestSchema).min(1, 'Рецепт должен содержать хотя бы одну паузу затирания'),
  yeast: YeastSchema,
  otherIngredients: z.array(OtherIngredientItemSchema).optional().default([]),
  calculated: CalculatedBrewParamsSchema,
  tags: z.array(z.string()).default([]),
  isCustom: z.boolean().optional(),
  collection: z.enum(['favorites', 'planned', 'brewed', 'my_recipes']).optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type ValidatedRecipe = z.infer<typeof StrictRecipeSchema>;

/**
 * Валидация объекта рецепта с помощью Zod
 */
export function validateRecipeWithZod(recipe: unknown): {
  success: boolean;
  data?: Recipe;
  errors?: string[];
} {
  const result = StrictRecipeSchema.safeParse(recipe);
  if (result.success) {
    return {
      success: true,
      data: result.data as Recipe
    };
  }

  const issues = (result as any).error?.issues || (result as any).error?.errors || [];
  const errors = issues.map((err: any) => {
    const path = Array.isArray(err.path) ? err.path.join('.') : '';
    return path ? `[${path}]: ${err.message}` : err.message;
  });

  return {
    success: false,
    errors
  };
}

/**
 * Zod-валидация промежуточных разобранных данных BeerXML перед созданием сущности
 */
export const RawBeerXmlNodeSchema = z.object({
  name: z.string().min(1, 'Отсутствует название рецепта в теге <NAME>'),
  batchSizeL: z.number().gt(0, 'Объем варки <BATCH_SIZE> должен быть положительным числом'),
  boilTimeMin: z.number().min(0, 'Время кипячения <BOIL_TIME> не может быть отрицательным'),
  efficiencyPercent: z.number().min(10, 'Эффективность <EFFICIENCY> не может быть ниже 10%').max(100),
  fermentablesCount: z.number().min(1, 'В BeerXML файле отсутствует блок <FERMENTABLES> с засыпью солода')
});

/**
 * Zod-схема элемента склада с поддержкой экономики (pricePerUnit) и свежести (harvestYear, productionDate)
 */
export const InventoryItemSchema = z.object({
  id: z.string().min(1, 'ID позиции склада обязателен'),
  name: z.string().min(1, 'Название ингредиента обязательно').max(150),
  category: z.enum(['grain', 'hop', 'yeast', 'misc']),
  amount: z.number().min(0, 'Остаток не может быть отрицательным'),
  unit: z.enum(['kg', 'g', 'pack', 'ml']),
  potentialSgOrAlpha: z.number().min(0).optional(),
  colorEbc: z.number().min(0).optional(),
  notes: z.string().optional(),
  pricePerUnit: z.number().min(0, 'Цена не может быть отрицательной').optional().default(0),
  currency: z.enum(['RUB', 'USD', 'EUR']).optional().default('RUB'),
  harvestYear: z.number().int().min(2000).max(2100).optional(),
  productionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате YYYY-MM-DD').optional(),
  storageType: z.enum(['freezer', 'fridge', 'room']).optional()
});

export type ValidatedInventoryItem = z.infer<typeof InventoryItemSchema>;

