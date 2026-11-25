import { describe, it, expect } from 'vitest';
import { calculateBatchCost, formatCurrencySymbol } from '../src/utils/costCalculator';
import { InventoryItem, Recipe } from '../src/types/brewing';
import { INITIAL_RECIPES } from '../src/data/defaultData';

const baseRecipe: Recipe = {
  ...INITIAL_RECIPES[0],
  id: 'cost-test-recipe',
  name: 'Test Pale Ale',
  batchSizeL: 20,
  grains: [
    {
      id: 'g1',
      name: 'Курский Пилснер (Pilsner)',
      weightKg: 4,
      colorEbc: 4,
      potentialSg: 1.037,
      type: 'base'
    },
    {
      id: 'g2',
      name: 'Карамельный 50',
      weightKg: 0.5,
      colorEbc: 50,
      potentialSg: 1.034,
      type: 'caramel'
    }
  ],
  hops: [
    {
      id: 'h1',
      name: 'Citra',
      weightG: 30,
      alphaAcid: 12,
      boilTimeMin: 60,
      use: 'boil'
    },
    {
      id: 'h2',
      name: 'Citra',
      weightG: 20,
      alphaAcid: 12,
      boilTimeMin: 5,
      use: 'boil'
    }
  ],
  yeast: {
    ...INITIAL_RECIPES[0].yeast,
    name: 'Fermentis US-05',
    lab: 'Fermentis',
    attenuationPercent: 81
  },
  calculated: {
    ...INITIAL_RECIPES[0].calculated,
    yeastPacksNeeded: 1
  }
};

describe('Smart Batch Economics (costCalculator)', () => {
  it('calculates total cost, cost per liter, and cost per 0.5L accurately', () => {
    const inventory: InventoryItem[] = [
      {
        id: 'inv-1',
        name: 'Курский Пилснер (Pilsner)',
        category: 'grain',
        amount: 25,
        unit: 'kg',
        pricePerUnit: 120,
        currency: 'RUB'
      },
      {
        id: 'inv-2',
        name: 'Карамельный 50',
        category: 'grain',
        amount: 5,
        unit: 'kg',
        pricePerUnit: 200,
        currency: 'RUB'
      },
      {
        id: 'inv-3',
        name: 'Citra',
        category: 'hop',
        amount: 100,
        unit: 'g',
        pricePerUnit: 12,
        currency: 'RUB'
      },
      {
        id: 'inv-4',
        name: 'Fermentis US-05',
        category: 'yeast',
        amount: 3,
        unit: 'pack',
        pricePerUnit: 420,
        currency: 'RUB'
      }
    ];

    const summary = calculateBatchCost(baseRecipe, inventory);

    // 4 * 120 = 480; 0.5 * 200 = 100; (30+20) * 12 = 600; 1 * 420 = 420 -> total 1600
    expect(summary.totalCost).toBe(1600);
    expect(summary.costPerLiter).toBe(80);
    expect(summary.costPerHalfLiter).toBe(40);
    expect(summary.currency).toBe('RUB');
    expect(summary.pricedItemsCount).toBe(4);
    expect(summary.totalItemsCount).toBe(4);
  });

  it('converts inventory unit prices between kg and g correctly', () => {
    const inventory: InventoryItem[] = [
      {
        id: 'inv-hop-kg',
        name: 'Citra',
        category: 'hop',
        amount: 1,
        unit: 'kg',
        pricePerUnit: 10000, // 10 RUB per gram
        currency: 'RUB'
      }
    ];

    const summary = calculateBatchCost(baseRecipe, inventory);
    // 50g Citra * 10 = 500
    expect(summary.totalCost).toBe(500);
    expect(summary.costPerLiter).toBe(25);
    expect(summary.pricedItemsCount).toBe(1);
  });

  it('handles missing or zero prices safely without NaN', () => {
    const summary = calculateBatchCost(baseRecipe, []);
    expect(summary.totalCost).toBe(0);
    expect(summary.costPerLiter).toBe(0);
    expect(summary.costPerHalfLiter).toBe(0);
    expect(summary.pricedItemsCount).toBe(0);
  });

  it('formats currency symbols properly', () => {
    expect(formatCurrencySymbol('RUB')).toBe('₽');
    expect(formatCurrencySymbol('USD')).toBe('$');
    expect(formatCurrencySymbol('EUR')).toBe('€');
  });
});
