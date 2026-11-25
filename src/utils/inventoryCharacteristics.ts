/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InventoryItem, Recipe, GrainType } from '../types/brewing';
import { COMMON_GRAINS, COMMON_HOPS, COMMON_YEASTS } from '../data/defaultData';
import { isIngredientMatch } from './ingredientNormalizer';
import { getKurskMaltSubstitute, getHopAlternatives, KURSK_MALT_MAP } from './brewingSubstitutions';

export type EbcCategory = 'all' | 'light' | 'amber' | 'dark' | 'roasted';
export type AlphaCategory = 'all' | 'aroma' | 'balanced' | 'bitter';
export type StockStatusFilter = 'all' | 'in_stock' | 'low_stock' | 'zero_stock';

export interface ResolvedItemDetails {
  colorEbc?: number;
  alphaAcid?: number;
  potentialSg?: number;
  type?: string;
  group?: string;
  profile?: string;
  region?: string;
  attenuation?: number;
  lab?: string;
  yeastType?: string;
  analogs: string[];
  substituteDescription?: string;
  ebcCategory: 'light' | 'amber' | 'dark' | 'roasted' | 'unknown';
  alphaCategory: 'aroma' | 'balanced' | 'bitter' | 'unknown';
  isLowStock: boolean;
}

export interface RecipeAnalogMatchInfo {
  isDirectMatch: boolean;
  isAnalogMatch: boolean;
  matchedRecipeItemName?: string;
  analogReason?: string;
  requiredAmount?: number;
  unit?: string;
  isStockSufficient?: boolean;
}

/**
 * Определение категории цветности EBC
 * - light: <= 15 EBC (Пилснер, Пэйл Эль, Вена, светлые пшеничные)
 * - amber: 15.1 - 80 EBC (Мюнхен, Мелано, Караред, светлые карамельные)
 * - dark: 80.1 - 300 EBC (Карамюнхен II/III, Special B, Караарома)
 * - roasted: > 300 EBC (Шоколадный, жженый ячмень, черный, Карафа)
 */
export function getEbcCategory(ebc: number | undefined): 'light' | 'amber' | 'dark' | 'roasted' | 'unknown' {
  if (ebc === undefined || isNaN(ebc)) return 'unknown';
  if (ebc <= 15) return 'light';
  if (ebc <= 80) return 'amber';
  if (ebc <= 300) return 'dark';
  return 'roasted';
}

/**
 * Определение категории α-кислотности хмеля
 * - aroma: <= 5.5% α (Жатецкий, Теттнангер, Ранний Московский, Saaz)
 * - balanced: 5.6% - 9.5% α (Каскад, Перле, Амарилло, Сладек)
 * - bitter: > 9.5% α (Магнум, Колумбус, Чинук, Цитра, Мозаик)
 */
export function getAlphaCategory(alpha: number | undefined): 'aroma' | 'balanced' | 'bitter' | 'unknown' {
  if (alpha === undefined || isNaN(alpha)) return 'unknown';
  if (alpha <= 5.5) return 'aroma';
  if (alpha <= 9.5) return 'balanced';
  return 'bitter';
}

/**
 * Определение признака заканчивающегося запаса (low stock)
 */
export function isLowStock(item: InventoryItem): boolean {
  if (item.amount <= 0) return false;
  if (item.category === 'grain' && item.amount < 1.0) return true;
  if (item.category === 'hop' && item.amount < 30) return true;
  if (item.category === 'yeast' && item.amount < 1) return true;
  if (item.category === 'misc' && item.amount < 50) return true;
  return false;
}

/**
 * Извлечение числового значения EBC из строки названия или заметки
 */
export function parseEbcFromName(text: string): number | undefined {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:ebc|ебк|srm)/i);
  if (match) return parseFloat(match[1]);

  const numMatch = text.match(/\b(?:карамельный|caramel|munich|мюнхен)\s*(\d{2,3})\b/i);
  if (numMatch) return parseFloat(numMatch[1]);

  const lower = text.toLowerCase();
  if (lower.includes('pils') || lower.includes('пилс')) return 3.8;
  if (lower.includes('pale ale') || lower.includes('пэйл')) return 6.0;
  if (lower.includes('vienna') || lower.includes('венск')) return 8.5;
  if (lower.includes('munich') || lower.includes('мюнхен')) return 15.0;
  if (lower.includes('wheat') || lower.includes('пшенич')) return 4.5;
  if (lower.includes('carapils') || lower.includes('карапилс') || lower.includes('десертный')) return 20.0;
  if (lower.includes('chocolate') || lower.includes('шоколад')) return 900.0;
  if (lower.includes('roasted barley') || lower.includes('жженый ячмень')) return 1100.0;
  if (lower.includes('black') || lower.includes('черный солод')) return 1200.0;

  return undefined;
}

/**
 * Извлечение альфа-кислотности хмеля из строки названия или заметки
 */
export function parseAlphaFromName(text: string): number | undefined {
  const match = text.match(/(?:α|alpha|альфа)?\s*(\d+(?:\.\d+)?)\s*%/i);
  if (match) return parseFloat(match[1]);
  return undefined;
}

/**
 * Полное обогащение характеристиками ингредиента на складе
 */
export function resolveInventoryCharacteristics(item: InventoryItem): ResolvedItemDetails {
  let colorEbc = item.colorEbc;
  let alphaAcid: number | undefined;
  let potentialSg: number | undefined;
  let type: string | undefined;
  let group: string | undefined;
  let profile: string | undefined;
  let region: string | undefined;
  let attenuation: number | undefined;
  let lab: string | undefined;
  let yeastType: string | undefined;
  const analogs: string[] = [];
  let substituteDescription: string | undefined;

  if (item.category === 'grain') {
    if (colorEbc === undefined && item.potentialSgOrAlpha && item.potentialSgOrAlpha < 1.0) {
      // Иногда в potentialSgOrAlpha случайно сохранялся EBC
      colorEbc = item.potentialSgOrAlpha;
    }

    const grainCatalog = COMMON_GRAINS.find(g => isIngredientMatch(g.name, item.name, 'grain'));
    if (grainCatalog) {
      if (colorEbc === undefined) colorEbc = grainCatalog.colorEbc;
      potentialSg = grainCatalog.potentialSg;
      type = grainCatalog.type;
      group = grainCatalog.group;
    } else {
      if (colorEbc === undefined) colorEbc = parseEbcFromName(`${item.name} ${item.notes || ''}`);
    }

    // Подбор аналогов для солода
    const sub = getKurskMaltSubstitute(item.name, type as GrainType, colorEbc);
    if (sub) {
      analogs.push(sub.kurskName);
      substituteDescription = sub.description;
    }

    // Если это Курский солод, смотрим, какие импортные сорта он замещает
    const lowerName = item.name.toLowerCase();
    for (const [key, info] of Object.entries(KURSK_MALT_MAP)) {
      if (isIngredientMatch(info.kurskName, item.name, 'grain')) {
        const readable = key.replace(/_/g, ' ');
        if (!analogs.includes(readable)) {
          analogs.push(readable.toUpperCase());
        }
      }
    }
  } else if (item.category === 'hop') {
    if (item.potentialSgOrAlpha && item.potentialSgOrAlpha > 1.5 && item.potentialSgOrAlpha < 30) {
      alphaAcid = item.potentialSgOrAlpha;
    }

    const hopCatalog = COMMON_HOPS.find(h => isIngredientMatch(h.name, item.name, 'hop'));
    if (hopCatalog) {
      if (alphaAcid === undefined) alphaAcid = hopCatalog.alphaAcid;
      profile = hopCatalog.profile;
      region = hopCatalog.region;
    } else {
      if (alphaAcid === undefined) alphaAcid = parseAlphaFromName(`${item.name} ${item.notes || ''}`);
    }

    // Подбор аналогов хмеля
    const alts = getHopAlternatives(item.name);
    alts.forEach(a => {
      if (!analogs.includes(a.name)) {
        analogs.push(`${a.name} (${a.alphaRange})`);
      }
    });
    if (alts.length > 0 && !substituteDescription) {
      substituteDescription = alts[0].conversionNote;
    }
  } else if (item.category === 'yeast') {
    const yeastCatalog = COMMON_YEASTS.find(y => isIngredientMatch(y.name, item.name, 'yeast'));
    if (yeastCatalog) {
      lab = yeastCatalog.lab;
      yeastType = yeastCatalog.type;
      attenuation = yeastCatalog.attenuationPercent;
      profile = `${yeastCatalog.type === 'ale' ? 'Эль' : yeastCatalog.type === 'lager' ? 'Лагер' : yeastCatalog.type} (${yeastCatalog.tempRange[0]}-${yeastCatalog.tempRange[1]}°C)`;
    }
  }

  const ebcCat = getEbcCategory(colorEbc);
  const alphaCat = getAlphaCategory(alphaAcid);
  const isLow = isLowStock(item);

  return {
    colorEbc,
    alphaAcid,
    potentialSg,
    type,
    group,
    profile,
    region,
    attenuation,
    lab,
    yeastType,
    analogs,
    substituteDescription,
    ebcCategory: ebcCat,
    alphaCategory: alphaCat,
    isLowStock: isLow
  };
}

/**
 * Проверка, является ли позиция склада прямым ингредиентом или аналогом для рецепта
 */
export function checkRecipeIngredientMatch(
  item: InventoryItem,
  recipe: Recipe,
  scaleRatio: number = 1.0
): RecipeAnalogMatchInfo {
  const details = resolveInventoryCharacteristics(item);

  // 1. Проверка солода
  if (item.category === 'grain') {
    // Прямое попадание
    for (const grain of recipe.grains) {
      if (isIngredientMatch(item.name, grain.name, 'grain')) {
        const requiredAmount = Number((grain.weightKg * scaleRatio).toFixed(2));
        return {
          isDirectMatch: true,
          isAnalogMatch: false,
          matchedRecipeItemName: grain.name,
          requiredAmount,
          unit: 'кг',
          isStockSufficient: item.amount >= requiredAmount
        };
      }
    }

    // Попадание как аналог по базе замен или близкой цветности EBC
    for (const grain of recipe.grains) {
      const sub = getKurskMaltSubstitute(grain.name, grain.type, grain.colorEbc);
      const isSub = sub && isIngredientMatch(item.name, sub.kurskName, 'grain');
      const isCloseEbc = details.colorEbc !== undefined && grain.colorEbc !== undefined &&
        Math.abs(details.colorEbc - grain.colorEbc) <= (grain.colorEbc < 50 ? 5 : grain.colorEbc < 150 ? 25 : 80);

      if (isSub || (isCloseEbc && grain.type === details.type)) {
        const requiredAmount = Number((grain.weightKg * scaleRatio).toFixed(2));
        const reason = isSub
          ? `Официальный аналог ${grain.name} от завода`
          : `Близкий аналог по цветности (склад: ${details.colorEbc} EBC vs рецепт: ${grain.colorEbc} EBC)`;
        return {
          isDirectMatch: false,
          isAnalogMatch: true,
          matchedRecipeItemName: grain.name,
          analogReason: reason,
          requiredAmount,
          unit: 'кг',
          isStockSufficient: item.amount >= requiredAmount
        };
      }
    }
  }

  // 2. Проверка хмеля
  if (item.category === 'hop') {
    // Прямое попадание
    for (const hop of recipe.hops) {
      if (isIngredientMatch(item.name, hop.name, 'hop')) {
        const requiredAmount = Number((hop.weightG * scaleRatio).toFixed(1));
        return {
          isDirectMatch: true,
          isAnalogMatch: false,
          matchedRecipeItemName: hop.name,
          requiredAmount,
          unit: 'г',
          isStockSufficient: item.amount >= requiredAmount
        };
      }
    }

    // Проверка аналога через getHopAlternatives или близкую α-кислотность
    for (const hop of recipe.hops) {
      const alts = getHopAlternatives(hop.name);
      const altMatch = alts.find(a => isIngredientMatch(item.name, a.name, 'hop'));
      const isCloseAlpha = details.alphaAcid !== undefined && hop.alphaAcid !== undefined &&
        Math.abs(details.alphaAcid - hop.alphaAcid) <= 1.8;

      if (altMatch || isCloseAlpha) {
        const requiredAmount = Number((hop.weightG * scaleRatio).toFixed(1));
        const reason = altMatch
          ? `Проверенная замена для ${hop.name} (${altMatch.flavorProfile})`
          : `Близкая горечь к ${hop.name} (склад: α ${details.alphaAcid}% vs рецепт: α ${hop.alphaAcid}%)`;
        return {
          isDirectMatch: false,
          isAnalogMatch: true,
          matchedRecipeItemName: hop.name,
          analogReason: reason,
          requiredAmount,
          unit: 'г',
          isStockSufficient: item.amount >= requiredAmount
        };
      }
    }
  }

  // 3. Проверка дрожжей
  if (item.category === 'yeast') {
    if (isIngredientMatch(item.name, recipe.yeast.name, 'yeast')) {
      const requiredAmount = recipe.calculated.yeastPacksNeeded || 1;
      return {
        isDirectMatch: true,
        isAnalogMatch: false,
        matchedRecipeItemName: recipe.yeast.name,
        requiredAmount,
        unit: 'пач',
        isStockSufficient: item.amount >= requiredAmount
      };
    }
  }

  return {
    isDirectMatch: false,
    isAnalogMatch: false
  };
}

/**
 * Фильтрация элементов склада
 */
export function filterInventoryItems(
  items: InventoryItem[],
  options: {
    searchTerm?: string;
    categoryFilter?: string;
    ebcFilter?: EbcCategory;
    alphaFilter?: AlphaCategory;
    stockStatus?: StockStatusFilter;
    selectedRecipe?: Recipe | null;
    recipeScaleRatio?: number;
    showRecipeAnalogsOnly?: boolean;
  }
): InventoryItem[] {
  const {
    searchTerm = '',
    categoryFilter = 'all',
    ebcFilter = 'all',
    alphaFilter = 'all',
    stockStatus = 'all',
    selectedRecipe = null,
    recipeScaleRatio = 1.0,
    showRecipeAnalogsOnly = false
  } = options;

  const search = searchTerm.trim().toLowerCase();

  return items.filter(item => {
    const details = resolveInventoryCharacteristics(item);

    // 1. Фильтр по категории
    if (categoryFilter !== 'all' && item.category !== categoryFilter) {
      return false;
    }

    // 2. Фильтр по статусу остатка
    if (stockStatus === 'in_stock' && item.amount <= 0) return false;
    if (stockStatus === 'zero_stock' && item.amount > 0) return false;
    if (stockStatus === 'low_stock' && !details.isLowStock) return false;

    // 3. Фильтр по EBC (для солода или общего поиска)
    if (ebcFilter !== 'all') {
      if (item.category !== 'grain') return false;
      if (details.ebcCategory !== ebcFilter) return false;
    }

    // 4. Фильтр по альфа-кислотности (для хмеля)
    if (alphaFilter !== 'all') {
      if (item.category !== 'hop') return false;
      if (details.alphaCategory !== alphaFilter) return false;
    }

    // 5. Фильтр по рецепту / аналогам рецепта
    if (selectedRecipe) {
      const match = checkRecipeIngredientMatch(item, selectedRecipe, recipeScaleRatio);
      if (showRecipeAnalogsOnly) {
        if (!match.isDirectMatch && !match.isAnalogMatch) {
          return false;
        }
      }
    }

    // 6. Поисковый запрос
    if (search) {
      const inName = item.name.toLowerCase().includes(search);
      const inNotes = item.notes ? item.notes.toLowerCase().includes(search) : false;
      const inEbc = details.colorEbc !== undefined && `${details.colorEbc} ebc`.includes(search);
      const inAlpha = details.alphaAcid !== undefined && `${details.alphaAcid}%`.includes(search);
      const inProfile = details.profile ? details.profile.toLowerCase().includes(search) : false;
      const inRegion = details.region ? details.region.toLowerCase().includes(search) : false;
      const inAnalogs = details.analogs.some(a => a.toLowerCase().includes(search));

      if (!inName && !inNotes && !inEbc && !inAlpha && !inProfile && !inRegion && !inAnalogs) {
        return false;
      }
    }

    return true;
  });
}
