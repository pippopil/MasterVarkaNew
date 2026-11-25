import { describe, it, expect } from 'vitest';
import { generateShoppingList, formatShoppingListText } from '../src/utils/shoppingList';
import { InventoryItem, Recipe } from '../src/types/brewing';
import { INITIAL_RECIPES } from '../src/data/defaultData';

const testRecipe: Recipe = {
  ...INITIAL_RECIPES[0],
  name: 'American IPA',
  batchSizeL: 20,
  grains: [
    {
      id: 'g1',
      name: 'Pale Ale Malt',
      weightKg: 5,
      colorEbc: 6,
      potentialSg: 1.037,
      type: 'base'
    }
  ],
  hops: [
    {
      id: 'h1',
      name: 'Citra',
      weightG: 50,
      alphaAcid: 12,
      boilTimeMin: 60,
      use: 'boil'
    },
    {
      id: 'h2',
      name: 'Citra',
      weightG: 50,
      alphaAcid: 12,
      boilTimeMin: 0,
      use: 'dry_hop'
    }
  ],
  yeast: {
    ...INITIAL_RECIPES[0].yeast,
    name: 'US-05',
    lab: 'Fermentis',
    attenuationPercent: 81
  },
  calculated: {
    ...INITIAL_RECIPES[0].calculated,
    yeastPacksNeeded: 2
  }
};

describe('Shopping List Generator (shoppingList)', () => {
  it('subtracts existing stock from recipe requirements accurately', () => {
    const inventory: InventoryItem[] = [
      {
        id: '1',
        name: 'Pale Ale Malt',
        category: 'grain',
        amount: 3.5,
        unit: 'kg',
        pricePerUnit: 130,
        currency: 'RUB'
      },
      {
        id: '2',
        name: 'Citra',
        category: 'hop',
        amount: 60,
        unit: 'g',
        pricePerUnit: 10,
        currency: 'RUB'
      },
      {
        id: '3',
        name: 'US-05',
        category: 'yeast',
        amount: 2,
        unit: 'pack'
      }
    ];

    const list = generateShoppingList(testRecipe, inventory);

    // Pale Ale Malt: need 5, stock 3.5 -> missing 1.5 kg
    // Citra: need 100g, stock 60g -> missing 40g
    // US-05: need 2, stock 2 -> missing 0 (not in list)
    expect(list).toHaveLength(2);
    expect(list[0]).toMatchObject({
      name: 'Pale Ale Malt',
      category: 'grain',
      missingAmount: 1.5,
      unit: 'kg',
      estimatedCost: 195
    });
    expect(list[1]).toMatchObject({
      name: 'Citra',
      category: 'hop',
      missingAmount: 40,
      unit: 'g',
      estimatedCost: 400
    });
  });

  it('returns an empty list and success message when all ingredients are in stock', () => {
    const fullInventory: InventoryItem[] = [
      { id: '1', name: 'Pale Ale Malt', category: 'grain', amount: 10, unit: 'kg' },
      { id: '2', name: 'Citra', category: 'hop', amount: 200, unit: 'g' },
      { id: '3', name: 'US-05', category: 'yeast', amount: 5, unit: 'pack' }
    ];

    const list = generateShoppingList(testRecipe, fullInventory);
    expect(list).toHaveLength(0);

    const text = formatShoppingListText(testRecipe.name, testRecipe.batchSizeL, list);
    expect(text).toContain('Все ингредиенты');
  });

  it('formats a readable shopping list text with missing items and estimated sum', () => {
    const list = generateShoppingList(testRecipe, [
      { id: '1', name: 'Pale Ale Malt', category: 'grain', amount: 2, unit: 'kg', pricePerUnit: 100, currency: 'RUB' }
    ]);
    const text = formatShoppingListText(testRecipe.name, testRecipe.batchSizeL, list);

    expect(text).toContain('American IPA');
    expect(text).toContain('Pale Ale Malt');
    expect(text).toContain('3 кг');
    expect(text).toContain('Citra');
    expect(text).toContain('100 г');
    expect(text).toContain('US-05');
    expect(text).toContain('300 ₽');
  });
});
