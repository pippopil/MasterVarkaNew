/**
 * @license
 * Copyright (c) 2026 MasterVarka. All rights reserved.
 */

import { CurrencyCode, InventoryItem, Recipe } from '../types/brewing';
import { findMatchingInventoryItem, formatCurrencySymbol } from './costCalculator';

export interface ShoppingListItem {
  name: string;
  category: 'grain' | 'hop' | 'yeast';
  requiredAmount: number;
  inStockAmount: number;
  missingAmount: number;
  unit: 'kg' | 'g' | 'pack';
  estimatedCost?: number;
  currency?: CurrencyCode;
}

function normalizeKey(name: string): string {
  return name.toLowerCase().replace(/\s+/g, ' ').trim();
}

function convertStockToUnit(
  amount: number,
  fromUnit: InventoryItem['unit'],
  toUnit: 'kg' | 'g' | 'pack'
): number {
  if (fromUnit === toUnit) return amount;
  if (fromUnit === 'kg' && toUnit === 'g') return amount * 1000;
  if (fromUnit === 'g' && toUnit === 'kg') return amount / 1000;
  return amount;
}

/**
 * Формирование списка покупок путём сравнения требуемых ингредиентов рецепта с остатками склада
 */
export function generateShoppingList(
  recipe: Recipe,
  inventory: InventoryItem[]
): ShoppingListItem[] {
  const result: ShoppingListItem[] = [];

  // 1. Солода (суммируем одинаковые позиции)
  const grainTotals = new Map<string, { name: string; weightKg: number }>();
  for (const grain of recipe.grains) {
    const key = normalizeKey(grain.name);
    const existing = grainTotals.get(key);
    if (existing) {
      existing.weightKg += grain.weightKg;
    } else {
      grainTotals.set(key, { name: grain.name, weightKg: grain.weightKg });
    }
  }

  for (const { name, weightKg } of grainTotals.values()) {
    const match = findMatchingInventoryItem(name, 'grain', inventory);
    const inStock = match ? convertStockToUnit(match.amount, match.unit, 'kg') : 0;
    const missing = Math.max(0, Math.round((weightKg - inStock) * 100) / 100);

    if (missing > 0.009) {
      const unitPrice = match?.pricePerUnit && match.pricePerUnit > 0
        ? match.unit === 'g' ? match.pricePerUnit * 1000 : match.pricePerUnit
        : 0;
      result.push({
        name,
        category: 'grain',
        requiredAmount: Math.round(weightKg * 100) / 100,
        inStockAmount: Math.round(inStock * 100) / 100,
        missingAmount: missing,
        unit: 'kg',
        estimatedCost: unitPrice > 0 ? Math.round(missing * unitPrice * 100) / 100 : undefined,
        currency: match?.currency || 'RUB'
      });
    }
  }

  // 2. Хмели (суммируем одинаковые сорта)
  const hopTotals = new Map<string, { name: string; weightG: number }>();
  for (const hop of recipe.hops) {
    const key = normalizeKey(hop.name);
    const existing = hopTotals.get(key);
    if (existing) {
      existing.weightG += hop.weightG;
    } else {
      hopTotals.set(key, { name: hop.name, weightG: hop.weightG });
    }
  }

  for (const { name, weightG } of hopTotals.values()) {
    const match = findMatchingInventoryItem(name, 'hop', inventory);
    const inStock = match ? convertStockToUnit(match.amount, match.unit, 'g') : 0;
    const missing = Math.max(0, Math.round((weightG - inStock) * 10) / 10);

    if (missing > 0.09) {
      const unitPrice = match?.pricePerUnit && match.pricePerUnit > 0
        ? match.unit === 'kg' ? match.pricePerUnit / 1000 : match.pricePerUnit
        : 0;
      result.push({
        name,
        category: 'hop',
        requiredAmount: Math.round(weightG * 10) / 10,
        inStockAmount: Math.round(inStock * 10) / 10,
        missingAmount: missing,
        unit: 'g',
        estimatedCost: unitPrice > 0 ? Math.round(missing * unitPrice * 100) / 100 : undefined,
        currency: match?.currency || 'RUB'
      });
    }
  }

  // 3. Дрожжи (пачки)
  if (recipe.yeast?.name) {
    const requiredPacks = Math.max(1, Math.ceil(recipe.calculated?.yeastPacksNeeded || 1));
    const match = findMatchingInventoryItem(recipe.yeast.name, 'yeast', inventory);
    const inStock = match ? Math.floor(match.amount) : 0;
    const missing = Math.max(0, requiredPacks - inStock);

    if (missing > 0) {
      const unitPrice = match?.pricePerUnit && match.pricePerUnit > 0 ? match.pricePerUnit : 0;
      result.push({
        name: recipe.yeast.name,
        category: 'yeast',
        requiredAmount: requiredPacks,
        inStockAmount: inStock,
        missingAmount: missing,
        unit: 'pack',
        estimatedCost: unitPrice > 0 ? Math.round(missing * unitPrice * 100) / 100 : undefined,
        currency: match?.currency || 'RUB'
      });
    }
  }

  return result;
}

/**
 * Форматирование списка покупок в читаемый текст для копирования в буфер или мессенджер
 */
export function formatShoppingListText(
  recipeName: string,
  batchSizeL: number,
  items: ShoppingListItem[]
): string {
  if (items.length === 0) {
    return `✅ Все ингредиенты для «${recipeName}» (${batchSizeL} л) уже есть на складе!`;
  }

  const categoryPrefix: Record<ShoppingListItem['category'], string> = {
    grain: 'Солод',
    hop: 'Хмель',
    yeast: 'Дрожжи'
  };

  const unitLabel: Record<ShoppingListItem['unit'], string> = {
    kg: 'кг',
    g: 'г',
    pack: 'уп.'
  };

  const lines = items.map((item) => {
    const costPart =
      item.estimatedCost && item.estimatedCost > 0
        ? ` (~${item.estimatedCost} ${formatCurrencySymbol(item.currency)})`
        : '';
    return `- ${categoryPrefix[item.category]} ${item.name}: не хватает ${item.missingAmount} ${unitLabel[item.unit]}${costPart}`;
  });

  const totalEstimated = items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
  const currency = items.find((i) => i.estimatedCost)?.currency || 'RUB';

  const footer =
    totalEstimated > 0
      ? `\n💰 Ориентировочная сумма докупки: ~${Math.round(totalEstimated * 100) / 100} ${formatCurrencySymbol(currency)}`
      : '';

  return `🛒 Список покупок для «${recipeName}» (${batchSizeL} л):\n\n${lines.join('\n')}${footer}`;
}
