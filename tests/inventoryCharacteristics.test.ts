/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { InventoryItem, Recipe } from '../src/types/brewing';
import {
  getEbcCategory,
  getAlphaCategory,
  isLowStock,
  resolveInventoryCharacteristics,
  checkRecipeIngredientMatch,
  filterInventoryItems
} from '../src/utils/inventoryCharacteristics';

describe('Inventory Characteristics & Filtering (Склад)', () => {
  const sampleInventory: InventoryItem[] = [
    { id: '1', name: 'Курский Пилснер (Pilsner Malt)', category: 'grain', amount: 25.0, unit: 'kg', colorEbc: 3.8 },
    { id: '2', name: 'Курский Карамельный 150 (Caramel 150 EBC)', category: 'grain', amount: 2.5, unit: 'kg', colorEbc: 150.0 },
    { id: '3', name: 'Курский Мюнхенский светлый (Munich Typ 1)', category: 'grain', amount: 0.5, unit: 'kg', colorEbc: 15.0 }, // low stock
    { id: '4', name: 'Курский Жженый (Roasted Malt 1400 EBC)', category: 'grain', amount: 1.0, unit: 'kg', colorEbc: 1400.0 },
    { id: '5', name: 'Saaz (Жатецкий)', category: 'hop', amount: 100, unit: 'g', potentialSgOrAlpha: 3.8 }, // aroma
    { id: '6', name: 'Cascade', category: 'hop', amount: 15, unit: 'g', potentialSgOrAlpha: 6.8 }, // balanced, low stock
    { id: '7', name: 'Magnum', category: 'hop', amount: 200, unit: 'g', potentialSgOrAlpha: 14.0 }, // bitter
    { id: '8', name: 'SafAle US-05', category: 'yeast', amount: 2, unit: 'pack' },
    { id: '9', name: 'Декстроза', category: 'misc', amount: 1000, unit: 'g' }
  ];

  it('correctly categorizes EBC into light, amber, dark, and roasted ranges', () => {
    expect(getEbcCategory(3.8)).toBe('light');
    expect(getEbcCategory(15)).toBe('light');
    expect(getEbcCategory(25)).toBe('amber');
    expect(getEbcCategory(75)).toBe('amber');
    expect(getEbcCategory(150)).toBe('dark');
    expect(getEbcCategory(300)).toBe('dark');
    expect(getEbcCategory(301)).toBe('roasted');
    expect(getEbcCategory(1400)).toBe('roasted');
    expect(getEbcCategory(undefined)).toBe('unknown');
  });

  it('correctly categorizes hop alpha-acid into aroma, balanced, and bitter ranges', () => {
    expect(getAlphaCategory(3.5)).toBe('aroma');
    expect(getAlphaCategory(5.5)).toBe('aroma');
    expect(getAlphaCategory(6.8)).toBe('balanced');
    expect(getAlphaCategory(9.5)).toBe('balanced');
    expect(getAlphaCategory(12.0)).toBe('bitter');
    expect(getAlphaCategory(14.5)).toBe('bitter');
    expect(getAlphaCategory(undefined)).toBe('unknown');
  });

  it('correctly identifies low stock conditions', () => {
    expect(isLowStock(sampleInventory[0])).toBe(false); // 25kg grain
    expect(isLowStock(sampleInventory[2])).toBe(true);  // 0.5kg grain (<1kg)
    expect(isLowStock(sampleInventory[4])).toBe(false); // 100g hop
    expect(isLowStock(sampleInventory[5])).toBe(true);  // 15g hop (<30g)
  });

  it('resolves characteristics and analogs for grains and hops even without explicit fields', () => {
    const rawGrain: InventoryItem = { id: 'test_g', name: 'Weyermann Caramunich II', category: 'grain', amount: 3, unit: 'kg' };
    const grainDetails = resolveInventoryCharacteristics(rawGrain);
    expect(grainDetails.colorEbc).toBeDefined();
    expect(grainDetails.analogs.length).toBeGreaterThan(0);
    expect(grainDetails.analogs.some(a => a.includes('Курский Карамельный'))).toBe(true);

    const rawHop: InventoryItem = { id: 'test_h', name: 'Citra', category: 'hop', amount: 50, unit: 'g' };
    const hopDetails = resolveInventoryCharacteristics(rawHop);
    expect(hopDetails.alphaAcid).toBeGreaterThan(10);
    expect(hopDetails.alphaCategory).toBe('bitter');
    expect(hopDetails.analogs.length).toBeGreaterThan(0);
  });

  it('filters pantry items by EBC category', () => {
    const lightGrains = filterInventoryItems(sampleInventory, { categoryFilter: 'grain', ebcFilter: 'light' });
    expect(lightGrains.every(i => i.name.includes('Пилснер') || i.name.includes('Мюнхенский'))).toBe(true);

    const darkGrains = filterInventoryItems(sampleInventory, { categoryFilter: 'grain', ebcFilter: 'dark' });
    expect(darkGrains.some(i => i.name.includes('Карамельный 150'))).toBe(true);

    const roastedGrains = filterInventoryItems(sampleInventory, { categoryFilter: 'grain', ebcFilter: 'roasted' });
    expect(roastedGrains.some(i => i.name.includes('Жженый'))).toBe(true);
  });

  it('filters pantry items by Alpha-acid category', () => {
    const aromaHops = filterInventoryItems(sampleInventory, { categoryFilter: 'hop', alphaFilter: 'aroma' });
    expect(aromaHops.some(h => h.name.includes('Saaz'))).toBe(true);

    const balancedHops = filterInventoryItems(sampleInventory, { categoryFilter: 'hop', alphaFilter: 'balanced' });
    expect(balancedHops.some(h => h.name.includes('Cascade'))).toBe(true);

    const bitterHops = filterInventoryItems(sampleInventory, { categoryFilter: 'hop', alphaFilter: 'bitter' });
    expect(bitterHops.some(h => h.name.includes('Magnum'))).toBe(true);
  });

  it('filters pantry items by low stock status', () => {
    const lowStockItems = filterInventoryItems(sampleInventory, { stockStatus: 'low_stock' });
    expect(lowStockItems.length).toBe(2);
    expect(lowStockItems.some(i => i.name.includes('Мюнхенский'))).toBe(true);
    expect(lowStockItems.some(i => i.name.includes('Cascade'))).toBe(true);
  });

  it('detects direct matches and analogs for a given recipe', () => {
    const mockRecipe: Recipe = {
      id: 'mock_recipe_1',
      name: 'American Amber Ale',
      style: 'Amber Ale',
      category: 'Эли',
      description: '',
      author: 'Brewmaster',
      batchSizeL: 30,
      boilTimeMin: 60,
      efficiencyPercent: 75,
      grainRatioLPerKg: 3.5,
      grainTempC: 20,
      targetCarbonationVol: 2.4,
      beerTempAtBottlingC: 20,
      grains: [
        { id: 'g1', name: 'Pale Ale Malt', weightKg: 5.0, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
        { id: 'g2', name: 'Caramunich II', weightKg: 0.5, potentialSg: 1.034, colorEbc: 120.0, type: 'caramel' }
      ],
      hops: [
        { id: 'h1', name: 'Centennial', weightG: 30, alphaAcid: 9.5, boilTimeMin: 60, use: 'boil' }
      ],
      mashSchedule: [],
      yeast: {
        name: 'SafAle US-05',
        lab: 'Fermentis',
        form: 'dry',
        type: 'ale',
        cellsPerGramOrVial: 20,
        attenuationPercent: 81,
        tempRange: [18, 24]
      },
      calculated: {
        ogSg: 1.050, ogPlato: 12.4, fgSg: 1.010, fgPlato: 2.6, abv: 5.2, ibu: 35, srm: 12, ebc: 24,
        buGuRatio: 0.7, totalGrainWeightKg: 5.5, strikeWaterL: 19.25, spargeWaterL: 15.5, totalWaterL: 34.75,
        strikeTempC: 72, dryYeastGramsNeeded: 11.5, yeastPacksNeeded: 1, dextroseGrams: 180, sucroseGrams: 160,
        dmeGrams: 220, speiseMl: 1500, caloriesPer500ml: 215
      },
      tags: ['amber', 'ale'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. Direct yeast match
    const yeastMatch = checkRecipeIngredientMatch(sampleInventory[7], mockRecipe);
    expect(yeastMatch.isDirectMatch).toBe(true);

    // 2. Analog malt match: Caramunich II in recipe -> Kursk Caramel 150 in inventory
    const caramelMatch = checkRecipeIngredientMatch(sampleInventory[1], mockRecipe);
    expect(caramelMatch.isAnalogMatch).toBe(true);
    expect(caramelMatch.matchedRecipeItemName).toBe('Caramunich II');

    // 3. Analog hop match: Centennial in recipe -> Cascade in inventory (close alpha & alternative)
    const hopMatch = checkRecipeIngredientMatch(sampleInventory[5], mockRecipe);
    expect(hopMatch.isAnalogMatch).toBe(true);
    expect(hopMatch.matchedRecipeItemName).toBe('Centennial');
  });
});
