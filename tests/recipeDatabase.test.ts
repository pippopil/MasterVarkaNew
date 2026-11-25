import { describe, it, expect } from 'vitest';
import { INITIAL_INVENTORY, INITIAL_RECIPES } from '../src/data/defaultData';
import { validateRecipeWithZod } from '../src/utils/beerXml';
import { InventoryItemSchema } from '../src/schemas/beerXmlSchema';

describe('Brewing Recipe Database 200+ Verification', () => {
  it('contains at least 200 recipes', () => {
    expect(INITIAL_RECIPES.length).toBeGreaterThanOrEqual(200);
  });

  it('contains no duplicate recipe IDs', () => {
    const ids = INITIAL_RECIPES.map(r => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(INITIAL_RECIPES.length);
  });

  it('every recipe satisfies strict Zod schema validation', () => {
    for (const recipe of INITIAL_RECIPES) {
      const validation = validateRecipeWithZod(recipe);
      if (!validation.success) {
        console.error(`Recipe validation failure for ${recipe.id} (${recipe.name}):`, validation.errors);
      }
      expect(validation.success).toBe(true);
      expect(recipe.name.trim().length).toBeGreaterThan(0);
      expect(recipe.grains.length).toBeGreaterThan(0);
      expect(recipe.calculated.ogSg).toBeGreaterThan(1.0);
      expect(recipe.calculated.fgSg).toBeGreaterThan(1.0);
      expect(recipe.calculated.abv).toBeGreaterThan(0);
    }
  });

  it('covers major BJCP and craft style categories', () => {
    const categories = new Set(INITIAL_RECIPES.map(r => r.category));
    expect(categories.size).toBeGreaterThanOrEqual(5);
    // Verify common categories exist in dataset
    const catList = Array.from(categories);
    expect(catList.some(c => c.includes('Лагер') || c.includes('лагер'))).toBe(true);
    expect(catList.some(c => c.includes('Эли') || c.includes('эль') || c.includes('IPA'))).toBe(true);
    expect(catList.some(c => c.includes('Пшенич'))).toBe(true);
    expect(catList.some(c => c.includes('Стаут') || c.includes('Портер'))).toBe(true);
  });

  it('validates inventory items with optional pricing and freshness metadata', () => {
    for (const item of INITIAL_INVENTORY) {
      const parsed = InventoryItemSchema.safeParse(item);
      expect(parsed.success).toBe(true);
    }

    const enrichedHop = InventoryItemSchema.safeParse({
      id: 'hop-test-1',
      name: 'Citra',
      category: 'hop',
      amount: 100,
      unit: 'g',
      potentialSgOrAlpha: 12.5,
      pricePerUnit: 12,
      currency: 'RUB',
      harvestYear: 2025,
      storageType: 'freezer'
    });
    expect(enrichedHop.success).toBe(true);
  });
});
