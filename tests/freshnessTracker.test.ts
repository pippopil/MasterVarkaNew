import { describe, it, expect } from 'vitest';
import {
  calculateCurrentAlpha,
  evaluateIngredientFreshness,
  findDegradedRecipeHops
} from '../src/utils/freshnessTracker';
import { InventoryItem, Recipe } from '../src/types/brewing';
import { INITIAL_RECIPES } from '../src/data/defaultData';

describe('Ingredient Freshness & Hop Alpha Degradation (freshnessTracker)', () => {
  it('reduces hop alpha acid for hops older than 2 years based on storage type', () => {
    const freezerHop: InventoryItem = {
      id: 'h-freezer',
      name: 'Mosaic',
      category: 'hop',
      amount: 100,
      unit: 'g',
      potentialSgOrAlpha: 12,
      harvestYear: 2023,
      storageType: 'freezer'
    };

    const roomHop: InventoryItem = {
      ...freezerHop,
      id: 'h-room',
      storageType: 'room'
    };

    const alphaFreezer = calculateCurrentAlpha(freezerHop, 2026);
    const alphaRoom = calculateCurrentAlpha(roomHop, 2026);

    // 3 years elapsed:
    // freezer: 12 * 0.95^3 = 10.2885 -> 10.3
    // room:    12 * 0.80^3 = 6.144   -> 6.1
    expect(alphaFreezer).toBeCloseTo(10.3, 1);
    expect(alphaRoom).toBeCloseTo(6.1, 1);
    expect(alphaRoom).toBeLessThan(alphaFreezer);
    expect(alphaFreezer).toBeLessThan(12);
  });

  it('classifies hop freshness into fresh, warning, and expired tiers', () => {
    const refDate = new Date('2026-06-15');
    const freshHop: InventoryItem = {
      id: '1',
      name: 'Saaz',
      category: 'hop',
      amount: 50,
      unit: 'g',
      potentialSgOrAlpha: 4,
      harvestYear: 2025,
      storageType: 'fridge'
    };
    const warningHop: InventoryItem = { ...freshHop, harvestYear: 2024 };
    const expiredHop: InventoryItem = { ...freshHop, harvestYear: 2022 };

    expect(evaluateIngredientFreshness(freshHop, refDate).status).toBe('fresh');
    expect(evaluateIngredientFreshness(warningHop, refDate).status).toBe('warning');
    expect(evaluateIngredientFreshness(expiredHop, refDate).status).toBe('expired');
  });

  it('classifies yeast freshness by productionDate', () => {
    const refDate = new Date('2026-06-15');
    const freshYeast: InventoryItem = {
      id: 'y1',
      name: 'US-05',
      category: 'yeast',
      amount: 2,
      unit: 'pack',
      productionDate: '2026-01-10'
    };
    const oldYeast: InventoryItem = {
      ...freshYeast,
      id: 'y2',
      productionDate: '2024-10-01' // ~20 months
    };
    const expiredYeast: InventoryItem = {
      ...freshYeast,
      id: 'y3',
      productionDate: '2023-01-01' // >24 months
    };

    expect(evaluateIngredientFreshness(freshYeast, refDate).status).toBe('fresh');
    expect(evaluateIngredientFreshness(oldYeast, refDate).status).toBe('warning');
    expect(evaluateIngredientFreshness(expiredYeast, refDate).status).toBe('expired');
  });

  it('detects degraded hops used in the active recipe', () => {
    const recipe: Recipe = {
      ...INITIAL_RECIPES[0],
      hops: [
        {
          id: 'rh1',
          name: 'Cascade',
          weightG: 50,
          alphaAcid: 7.0,
          boilTimeMin: 60,
          use: 'boil'
        }
      ]
    };
    const inventory: InventoryItem[] = [
      {
        id: 'inv-cascade',
        name: 'Cascade',
        category: 'hop',
        amount: 100,
        unit: 'g',
        potentialSgOrAlpha: 7.0,
        harvestYear: 2023,
        storageType: 'room'
      }
    ];

    const warnings = findDegradedRecipeHops(recipe, inventory, new Date('2026-06-15'));
    expect(warnings).toHaveLength(1);
    expect(warnings[0].hopName).toBe('Cascade');
    expect(warnings[0].effectiveAlpha).toBeLessThan(7.0);
    expect(warnings[0].status).toBe('expired');
  });
});
