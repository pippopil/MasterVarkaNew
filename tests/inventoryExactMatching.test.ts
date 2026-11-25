/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { InventoryItem } from '../src/types/brewing';

// Логика строгого точного сопоставления ингредиентов склада
function findExactPantryItem(
  inventory: InventoryItem[],
  name: string,
  category: 'grain' | 'hop' | 'yeast' | 'misc'
): InventoryItem | undefined {
  const clean = name.trim().toLowerCase();
  return inventory.find(
    inv => inv.category === category && inv.name.trim().toLowerCase() === clean
  );
}

function setCatalogItemAmount(
  inventory: InventoryItem[],
  name: string,
  category: 'grain' | 'hop' | 'yeast' | 'misc',
  targetAmount: number,
  unit: 'kg' | 'g' | 'pack' | 'ml'
): InventoryItem[] {
  const rounded = Number(Math.max(0, targetAmount).toFixed(2));
  const existing = findExactPantryItem(inventory, name, category);

  if (rounded === 0) {
    return existing ? inventory.filter(inv => inv.id !== existing.id) : inventory;
  }

  if (existing) {
    return inventory.map(inv =>
      inv.id === existing.id ? { ...inv, amount: rounded } : inv
    );
  } else {
    const newItem: InventoryItem = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      category,
      amount: rounded,
      unit
    };
    return [...inventory, newItem];
  }
}

describe('Warehouse (Склад) Exact Ingredient Isolation Tests', () => {
  it('does NOT add to other Kursk malts when modifying a specific Kursk malt', () => {
    // Начальный инвентарь с несколькими солодами производителя «Курский солод»
    const initialInventory: InventoryItem[] = [
      { id: 'inv_1', name: 'Курский Пилснер', category: 'grain', amount: 10.0, unit: 'kg' },
      { id: 'inv_2', name: 'Курский Карамельный 50', category: 'grain', amount: 2.0, unit: 'kg' },
      { id: 'inv_3', name: 'Курский Пшеничный', category: 'grain', amount: 3.5, unit: 'kg' }
    ];

    // Пользователь вводит собственное значение (например, 7.5 кг) именно для «Курский Пшеничный»
    const updated1 = setCatalogItemAmount(
      initialInventory,
      'Курский Пшеничный',
      'grain',
      7.5,
      'kg'
    );

    const pilsner = updated1.find(i => i.name === 'Курский Пилснер');
    const caramel = updated1.find(i => i.name === 'Курский Карамельный 50');
    const wheat = updated1.find(i => i.name === 'Курский Пшеничный');

    // Пшеничный солод должен измениться на 7.5 кг
    expect(wheat?.amount).toBe(7.5);

    // Пилснер и Карамельный 50 НЕ ДОЛЖНЫ измениться ни на грамм!
    expect(pilsner?.amount).toBe(10.0);
    expect(caramel?.amount).toBe(2.0);
  });

  it('allows user to enter custom arbitrary amount for a new malt and records strictly that malt', () => {
    const initialInventory: InventoryItem[] = [
      { id: 'inv_1', name: 'Курский Пилснер', category: 'grain', amount: 15.0, unit: 'kg' }
    ];

    // Добавляем «Курский Мюнхенский» с пользовательским значением 4.25 кг
    const updated = setCatalogItemAmount(
      initialInventory,
      'Курский Мюнхенский',
      'grain',
      4.25,
      'kg'
    );

    expect(updated.length).toBe(2);
    const munich = updated.find(i => i.name === 'Курский Мюнхенский');
    const pilsner = updated.find(i => i.name === 'Курский Пилснер');

    expect(munich?.amount).toBe(4.25);
    expect(pilsner?.amount).toBe(15.0);
  });

  it('removes item from pantry when user sets amount to 0', () => {
    const initialInventory: InventoryItem[] = [
      { id: 'inv_1', name: 'Курский Пилснер', category: 'grain', amount: 10.0, unit: 'kg' },
      { id: 'inv_2', name: 'Курский Карамельный 50', category: 'grain', amount: 2.0, unit: 'kg' }
    ];

    const updated = setCatalogItemAmount(
      initialInventory,
      'Курский Карамельный 50',
      'grain',
      0,
      'kg'
    );

    expect(updated.length).toBe(1);
    expect(updated.find(i => i.name === 'Курский Карамельный 50')).toBeUndefined();
    expect(updated.find(i => i.name === 'Курский Пилснер')?.amount).toBe(10.0);
  });

  it('correctly handles hop ingredients with custom gram amounts without affecting other hops', () => {
    const initialInventory: InventoryItem[] = [
      { id: 'hop_1', name: 'Citra', category: 'hop', amount: 100, unit: 'g' },
      { id: 'hop_2', name: 'Mosaic', category: 'hop', amount: 50, unit: 'g' }
    ];

    const updated = setCatalogItemAmount(
      initialInventory,
      'Citra',
      'hop',
      175,
      'g'
    );

    expect(updated.find(i => i.name === 'Citra')?.amount).toBe(175);
    expect(updated.find(i => i.name === 'Mosaic')?.amount).toBe(50);
  });

  it('prevents Kursk Pale Ale from substituting all other malts (Pilsner, Munich, Caraaroma)', async () => {
    const { isIngredientMatch } = await import('../src/utils/ingredientNormalizer');
    const { getKurskMaltSubstitute } = await import('../src/utils/brewingSubstitutions');

    // Курский Пэйл Эль не должен совпадать с Pilsner Malt
    expect(isIngredientMatch('Курский Пэйл Эль (Pale Ale Malt)', 'Pilsner Malt', 'grain')).toBe(false);
    expect(isIngredientMatch('Курский Пэйл Эль', 'Солод Венский', 'grain')).toBe(false);
    expect(isIngredientMatch('Курский Пэйл Эль', 'Caraaroma', 'grain')).toBe(false);

    // Курский Пилснер ДОЛЖЕН совпадать с Pilsner Malt
    expect(isIngredientMatch('Курский Пилснер (Pilsner Malt)', 'Pilsner Malt', 'grain')).toBe(true);

    // Аналог для Pilsner - Курский Пилснер, а не Пэйл Эль!
    const subPils = getKurskMaltSubstitute('Pilsner Malt');
    expect(subPils?.kurskName).toContain('Пилснер');
    expect(isIngredientMatch('Курский Пэйл Эль (Pale Ale Malt)', subPils!.kurskName, 'grain')).toBe(false);
  });

  it('strictly isolates yeast strains (US-05 does NOT match W-34/70 or S-04)', async () => {
    const { isIngredientMatch } = await import('../src/utils/ingredientNormalizer');

    // Разные штаммы Fermentis НЕ должны совпадать
    expect(isIngredientMatch('SafAle US-05', 'SafLager W-34/70', 'yeast')).toBe(false);
    expect(isIngredientMatch('SafAle US-05', 'SafAle S-04', 'yeast')).toBe(false);
    expect(isIngredientMatch('SafAle US-05', 'SafAle WB-06', 'yeast')).toBe(false);
    expect(isIngredientMatch('SafAle US-05', 'Mangrove Jacks M44', 'yeast')).toBe(false);

    // Одинаковые штаммы дрожжей ДОЛЖНЫ совпадать независимо от производителя и регистра
    expect(isIngredientMatch('SafAle US-05', 'US-05', 'yeast')).toBe(true);
    expect(isIngredientMatch('SafAle US-05', 'Fermentis SafAle US-05 Dry Yeast', 'yeast')).toBe(true);
    expect(isIngredientMatch('SafLager W-34/70', 'W-34/70', 'yeast')).toBe(true);
  });

  it('isolates Belgian and Kveik yeast strains without cross-matching (M47 vs BE-256, M12 vs Voss)', async () => {
    const { isIngredientMatch, extractYeastStrainCode } = await import('../src/utils/ingredientNormalizer');

    // M47 Belgian Abbey vs Fermentis BE-256
    expect(extractYeastStrainCode("Mangrove Jack's M47 Belgian Abbey")).toBe('m_47');
    expect(extractYeastStrainCode('Fermentis SafAle BE-256')).toBe('be_256');
    expect(isIngredientMatch("Mangrove Jack's M47", 'SafAle BE-256', 'yeast')).toBe(false);

    // M12 Kveik vs Voss Kveik
    expect(extractYeastStrainCode("Mangrove Jack's M12 Kveik")).toBe('m_12');
    expect(extractYeastStrainCode('Lallemand Voss Kveik')).toBe('voss_kveik');
    expect(isIngredientMatch("Mangrove Jack's M12", 'Lallemand Voss Kveik', 'yeast')).toBe(false);
  });

  it('accumulates multiple hop additions so inventory is not falsely matched by individual small additions', async () => {
    const { isIngredientMatch } = await import('../src/utils/ingredientNormalizer');

    // Имитация рецепта с 4 внесениями одного и того же хмеля Saaz: 35g, 30g, 25g, 30g = 120g
    const recipeHops = [
      { name: 'Saaz (Жатецкий)', weightG: 35 },
      { name: 'Saaz (Жатецкий)', weightG: 30 },
      { name: 'Saaz (Жатецкий)', weightG: 25 },
      { name: 'Saaz (Жатецкий)', weightG: 30 }
    ];

    // На складе всего 100г хмеля Saaz
    const inventoryHop = { name: 'Хмель Жатецкий (Saaz)', category: 'hop' as const, amount: 100 };

    // Агрегируем общую потребность
    const totalSaazNeeded = recipeHops
      .filter(h => isIngredientMatch(inventoryHop.name, h.name, 'hop'))
      .reduce((sum, h) => sum + h.weightG, 0);

    expect(totalSaazNeeded).toBe(120);
    // При наличии 100г на складе рецепт НЕ должен считаться полностью обеспеченным
    expect(inventoryHop.amount >= totalSaazNeeded).toBe(false);
    expect(totalSaazNeeded - inventoryHop.amount).toBe(20); // Не хватает 20 г
  });

  it('does NOT default missing or unmatched grains to Kursk Pilsner', async () => {
    const { getKurskMaltSubstitute } = await import('../src/utils/brewingSubstitutions');

    // Specialty malts WITH a direct Kursk equivalent correctly map to that specific counterpart (not Pilsner!)
    const melano = getKurskMaltSubstitute('Melanoidin Malt', 'caramel', 70);
    expect(melano?.kurskName).toBe('Курский Меланоидиновый (Melanoidin 75 EBC)');

    const roasted = getKurskMaltSubstitute('Roasted Barley', 'roasted', 1000);
    expect(roasted?.kurskName).toBe('Курский Жженый солод / Жженый ячмень (1100 EBC)');

    const smoked = getKurskMaltSubstitute('Rauchmalz Smoked Malt', 'base', 6);
    expect(smoked?.kurskName).toBe('Курский Копченый (Smoked Malt)');

    const acid = getKurskMaltSubstitute('Weyermann Acidulated Malt', 'acid', 4);
    expect(acid?.kurskName).toBe('Курский Кислый солод (Acid Malt)');

    // Malts WITHOUT a direct Kursk equivalent must return null rather than defaulting to Kursk Pilsner
    expect(getKurskMaltSubstitute('Flaked Rice', 'adjunct', 2)).toBeNull();
    expect(getKurskMaltSubstitute('Unmalted Buckwheat', 'adjunct', 10)).toBeNull();
    expect(getKurskMaltSubstitute('Unknown Grain XYZ', undefined, 12)).toBeNull();

    // Base malts with known base profiles correctly map to corresponding base malts
    const pils = getKurskMaltSubstitute('Weyermann Bohemian Pilsner', 'base', 3.5);
    expect(pils?.kurskName).toBe('Курский Пилснер (Pilsner Malt)');

    const vienna = getKurskMaltSubstitute('Castle Malting Chateau Vienna', 'base', 7);
    expect(vienna?.kurskName).toBe('Курский Венский (Vienna Malt)');

    const munich = getKurskMaltSubstitute('BestMalz Munich', 'base', 16);
    expect(munich?.kurskName).toBe('Курский Мюнхенский (Munich 15-25 EBC)');
  });

  it('guarantees that specialty, roasted, caramel and oat grains can NEVER be substituted by base Pale Ale or Pilsner', async () => {
    const { isIngredientMatch } = await import('../src/utils/ingredientNormalizer');
    const { getKurskMaltSubstitute } = await import('../src/utils/brewingSubstitutions');

    // Pantry only has base Pale Ale Malt
    const pantryBaseGrains = [
      'Pale Ale Malt',
      'Курский Пэйл Эль (Pale Ale Malt)',
      'Pilsner Malt (Пилснер)',
      'Курский Пилснер'
    ];

    const specialtyGrains = [
      'Roasted Barley (Жженый ячмень)',
      'Carared (Караред 50 EBC)',
      'Flaked Oats (Овсяные хлопья)',
      'Caramunich II',
      'Chocolate Malt'
    ];

    for (const spec of specialtyGrains) {
      for (const base of pantryBaseGrains) {
        // Direct match must be false
        expect(isIngredientMatch(base, spec, 'grain')).toBe(false);

        // Substitute match must also never match base malt
        const sub = getKurskMaltSubstitute(spec);
        if (sub) {
          expect(isIngredientMatch(base, sub.kurskName, 'grain')).toBe(false);
        }
      }
    }
  });
});

