/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'fake-indexeddb/auto';
import { DOMParser as XmldomParser } from '@xmldom/xmldom';
if (typeof globalThis.DOMParser === 'undefined') {
  globalThis.DOMParser = XmldomParser as unknown as typeof DOMParser;
}
import { describe, it, expect, beforeEach } from 'vitest';
import {
  importFromBeerXml,
  importFromBeerXmlWithValidation,
  exportToBeerXml
} from '../src/utils/beerXml';
import {
  validateRecipeWithZod,
  StrictRecipeSchema
} from '../src/schemas/beerXmlSchema';
import { INITIAL_RECIPES } from '../src/data/defaultData';
import { saveRecipeToDb, getAllRecipesFromDb, db } from '../src/db/brewDb';
import { Recipe } from '../src/types/brewing';

describe('BeerXML Zod Schema & IndexedDB Protection', () => {
  beforeEach(async () => {
    await db.recipes.clear();
  });

  it('validates a well-formed default recipe against StrictRecipeSchema', () => {
    const validRecipe = INITIAL_RECIPES[0];
    const result = validateRecipeWithZod(validRecipe);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.name).toBe(validRecipe.name);
  });

  it('successfully exports and re-imports valid BeerXML with full Zod validation', () => {
    const original = INITIAL_RECIPES[0];
    const xml = exportToBeerXml(original);

    const validationRes = importFromBeerXmlWithValidation(xml);
    expect(validationRes.success).toBe(true);
    expect(validationRes.recipe).toBeDefined();
    expect(validationRes.recipe?.name).toBe(original.name);
    expect(validationRes.recipe?.grains.length).toBeGreaterThanOrEqual(1);
    expect(validationRes.recipe?.calculated.ogSg).toBeGreaterThan(1.0);
  });

  it('rejects invalid BeerXML with no fermentables or hops to protect DB integrity', () => {
    const corruptXml = `<?xml version="1.0" encoding="UTF-8"?>
<RECIPES>
  <RECIPE>
    <NAME>Пустой рецепт</NAME>
    <VERSION>1</VERSION>
    <TYPE>All Grain</TYPE>
    <BATCH_SIZE>25.0</BATCH_SIZE>
  </RECIPE>
</RECIPES>`;

    const result = importFromBeerXmlWithValidation(corruptXml);
    expect(result.success).toBe(false);
    expect(result.recipe).toBeNull();
    expect(result.errors).toBeDefined();
    expect(result.errors?.length).toBeGreaterThan(0);

    const simpleResult = importFromBeerXml(corruptXml);
    expect(simpleResult).toBeNull();
  });

  it('rejects malformed XML syntax (parsererror)', () => {
    const malformed = `<?xml version="1.0"?><RECIPES><RECIPE><NAME>Broken<UNCLOSED>`;
    const result = importFromBeerXmlWithValidation(malformed);
    expect(result.success).toBe(false);
    expect(result.recipe).toBeNull();
  });

  it('detects corrupted recipe fields (NaN, negative batch size, missing required values)', () => {
    const invalidCandidate = {
      ...INITIAL_RECIPES[0],
      batchSizeL: -10, // Недопустимое значение
      boilTimeMin: 0,
      grains: [] // Нет солода
    };

    const validation = validateRecipeWithZod(invalidCandidate);
    expect(validation.success).toBe(false);
    expect(validation.errors).toBeDefined();
    expect(validation.errors?.some(e => e.includes('batchSizeL') || e.includes('grains'))).toBe(true);
  });

  it('prevents saving corrupted recipe to IndexedDB via saveRecipeToDb', async () => {
    const corruptRecipe = {
      id: 'bad_recipe_1',
      name: '', // Пустое имя нарушает схему
      batchSizeL: -5,
      grains: []
    } as unknown as Recipe;

    const saved = await saveRecipeToDb(corruptRecipe);
    expect(saved).toBe(false);

    // Убеждаемся, что база данных чиста и ничего не повреждено
    const inDb = await getAllRecipesFromDb();
    expect(inDb.find(r => r.id === 'bad_recipe_1')).toBeUndefined();
  });

  it('allows saving valid recipe to IndexedDB', async () => {
    const valid = INITIAL_RECIPES[0];
    const saved = await saveRecipeToDb(valid);
    expect(saved).toBe(true);

    const inDb = await getAllRecipesFromDb();
    expect(inDb.length).toBe(1);
    expect(inDb[0].id).toBe(valid.id);
  });
});
