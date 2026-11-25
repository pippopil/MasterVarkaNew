/**
 * @license
 * Copyright (c) 2026 MasterVarka. All rights reserved.
 */

import { CurrencyCode, InventoryItem, Recipe } from '../types/brewing';

export interface IngredientCostLine {
  name: string;
  category: 'grain' | 'hop' | 'yeast';
  requiredAmount: number;
  unit: 'kg' | 'g' | 'pack';
  pricePerUnit: number;
  lineCost: number;
  hasPrice: boolean;
}

export interface BatchCostSummary {
  totalCost: number;
  costPerLiter: number;
  costPerHalfLiter: number;
  currency: CurrencyCode;
  pricedItemsCount: number;
  totalItemsCount: number;
  items: IngredientCostLine[];
}

function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[()[\],.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Поиск позиции на складе по точному совпадению имени или частичному вхождению
 */
export function findMatchingInventoryItem(
  name: string,
  category: 'grain' | 'hop' | 'yeast',
  inventory: InventoryItem[]
): InventoryItem | undefined {
  const target = normalizeIngredientName(name);
  if (!target) return undefined;

  const sameCategory = inventory.filter((item) => item.category === category);

  // 1. Точное совпадение
  const exact = sameCategory.find((item) => normalizeIngredientName(item.name) === target);
  if (exact) return exact;

  // 2. Вхождение основного названия (до скобок)
  const coreTarget = normalizeIngredientName(name.split('(')[0] || name);
  if (coreTarget.length >= 3) {
    const partial = sameCategory.find((item) => {
      const invNorm = normalizeIngredientName(item.name);
      const invCore = normalizeIngredientName(item.name.split('(')[0] || item.name);
      return (
        invNorm.includes(coreTarget) ||
        coreTarget.includes(invCore)
      );
    });
    if (partial) return partial;
  }

  return undefined;
}

/**
 * Конвертация цены единицы склада в цену за требуемую единицу рецепта
 */
function convertUnitPrice(
  pricePerUnit: number,
  inventoryUnit: InventoryItem['unit'],
  requiredUnit: 'kg' | 'g' | 'pack'
): number {
  if (pricePerUnit <= 0) return 0;
  if (inventoryUnit === requiredUnit) return pricePerUnit;
  if (inventoryUnit === 'kg' && requiredUnit === 'g') return pricePerUnit / 1000;
  if (inventoryUnit === 'g' && requiredUnit === 'kg') return pricePerUnit * 1000;
  return pricePerUnit;
}

/**
 * Расчет себестоимости варки (общей, за 1 л и за 0.5 л) на основе цен из склада
 */
export function calculateBatchCost(
  recipe: Recipe,
  inventory: InventoryItem[]
): BatchCostSummary {
  const items: IngredientCostLine[] = [];
  let detectedCurrency: CurrencyCode = 'RUB';
  let currencyFound = false;

  // 1. Солод (кг)
  for (const grain of recipe.grains) {
    const match = findMatchingInventoryItem(grain.name, 'grain', inventory);
    const rawPrice = match?.pricePerUnit && match.pricePerUnit > 0 ? match.pricePerUnit : 0;
    const effectiveUnitPrice = match ? convertUnitPrice(rawPrice, match.unit, 'kg') : 0;
    const lineCost = Math.round(grain.weightKg * effectiveUnitPrice * 100) / 100;

    if (!currencyFound && match?.currency && rawPrice > 0) {
      detectedCurrency = match.currency;
      currencyFound = true;
    }

    items.push({
      name: grain.name,
      category: 'grain',
      requiredAmount: grain.weightKg,
      unit: 'kg',
      pricePerUnit: effectiveUnitPrice,
      lineCost,
      hasPrice: effectiveUnitPrice > 0
    });
  }

  // 2. Хмель (г) — суммируем одинаковые сорта по весу
  const hopTotals = new Map<string, { name: string; weightG: number }>();
  for (const hop of recipe.hops) {
    const key = normalizeIngredientName(hop.name);
    const prev = hopTotals.get(key);
    if (prev) {
      prev.weightG += hop.weightG;
    } else {
      hopTotals.set(key, { name: hop.name, weightG: hop.weightG });
    }
  }

  for (const { name, weightG } of hopTotals.values()) {
    const match = findMatchingInventoryItem(name, 'hop', inventory);
    const rawPrice = match?.pricePerUnit && match.pricePerUnit > 0 ? match.pricePerUnit : 0;
    const effectiveUnitPrice = match ? convertUnitPrice(rawPrice, match.unit, 'g') : 0;
    const lineCost = Math.round(weightG * effectiveUnitPrice * 100) / 100;

    if (!currencyFound && match?.currency && rawPrice > 0) {
      detectedCurrency = match.currency;
      currencyFound = true;
    }

    items.push({
      name,
      category: 'hop',
      requiredAmount: Math.round(weightG * 10) / 10,
      unit: 'g',
      pricePerUnit: effectiveUnitPrice,
      lineCost,
      hasPrice: effectiveUnitPrice > 0
    });
  }

  // 3. Дрожжи (пачки)
  if (recipe.yeast?.name) {
    const packsNeeded = Math.max(1, Math.ceil(recipe.calculated?.yeastPacksNeeded || 1));
    const match = findMatchingInventoryItem(recipe.yeast.name, 'yeast', inventory);
    const rawPrice = match?.pricePerUnit && match.pricePerUnit > 0 ? match.pricePerUnit : 0;
    const effectiveUnitPrice = match ? convertUnitPrice(rawPrice, match.unit, 'pack') : 0;
    const lineCost = Math.round(packsNeeded * effectiveUnitPrice * 100) / 100;

    if (!currencyFound && match?.currency && rawPrice > 0) {
      detectedCurrency = match.currency;
      currencyFound = true;
    }

    items.push({
      name: recipe.yeast.name,
      category: 'yeast',
      requiredAmount: packsNeeded,
      unit: 'pack',
      pricePerUnit: effectiveUnitPrice,
      lineCost,
      hasPrice: effectiveUnitPrice > 0
    });
  }

  const totalCost = Math.round(items.reduce((sum, item) => sum + item.lineCost, 0) * 100) / 100;
  const safeBatchL = recipe.batchSizeL > 0 ? recipe.batchSizeL : 1;
  const costPerLiter = Math.round((totalCost / safeBatchL) * 100) / 100;
  const costPerHalfLiter = Math.round((costPerLiter * 0.5) * 100) / 100;
  const pricedItemsCount = items.filter((item) => item.hasPrice).length;

  return {
    totalCost,
    costPerLiter,
    costPerHalfLiter,
    currency: detectedCurrency,
    pricedItemsCount,
    totalItemsCount: items.length,
    items
  };
}

export function formatCurrencySymbol(currency: CurrencyCode = 'RUB'): string {
  switch (currency) {
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'RUB':
    default:
      return '₽';
  }
}
