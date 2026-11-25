/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';

// Node.js test environment mock for localStorage and window
const storageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => storageStore[key] || null,
  setItem: (key: string, value: string) => { storageStore[key] = String(value); },
  removeItem: (key: string) => { delete storageStore[key]; },
  clear: () => { Object.keys(storageStore).forEach(k => delete storageStore[k]); }
};

// @ts-ignore
globalThis.localStorage = localStorageMock;
// @ts-ignore
globalThis.window = globalThis;

import {
  db,
  getAllRecipesFromDb,
  saveRecipeToDb,
  deleteRecipeFromDb,
  syncAllRecipesToDb,
  getAllLogsFromDb,
  saveLogToDb,
  deleteLogFromDb,
  syncAllLogsToDb,
  initDatabaseAndMigrate,
  DEFAULT_INITIAL_LOG
} from '../src/db/brewDb';
import { INITIAL_RECIPES } from '../src/data/defaultData';
import { Recipe, BrewLog } from '../src/types/brewing';

describe('Dexie.js MasterVarkaDB Database and Migration', () => {
  beforeEach(async () => {
    // Очищаем таблицы перед каждым тестом
    await db.recipes.clear();
    await db.brewLogs.clear();
    localStorageMock.clear();
  });

  it('correctly initializes tables and schema in MasterVarkaDB', async () => {
    expect(db.name).toBe('MasterVarkaDB');
    expect(db.recipes).toBeDefined();
    expect(db.brewLogs).toBeDefined();
  });

  it('seeds default initial recipes and log when DB and LocalStorage are empty', async () => {
    const result = await initDatabaseAndMigrate();
    expect(result.migratedFromLocalStorage).toBe(false);
    expect(result.recipes.length).toBeGreaterThanOrEqual(INITIAL_RECIPES.length);
    expect(result.logs.length).toBe(1);
    expect(result.logs[0].id).toBe(DEFAULT_INITIAL_LOG.id);

    const recipesInDb = await getAllRecipesFromDb();
    expect(recipesInDb.length).toBe(result.recipes.length);

    const logsInDb = await getAllLogsFromDb();
    expect(logsInDb.length).toBe(1);
  });

  it('migrates legacy recipes and logs from LocalStorage if present', async () => {
    const customRecipe: Recipe = {
      ...INITIAL_RECIPES[0],
      id: 'custom_migrated_rec_1',
      name: 'Мой старый крафтовый эль',
      isCustom: true,
      batchSizeL: 30
    };

    const customLog: BrewLog = {
      ...DEFAULT_INITIAL_LOG,
      id: 'custom_migrated_log_1',
      batchNumber: 'Старая варка #99',
      brewDate: '2025-12-01'
    };

    localStorageMock.setItem('masterbrew_recipes', JSON.stringify([customRecipe]));
    localStorageMock.setItem('masterbrew_logs', JSON.stringify([customLog]));

    const result = await initDatabaseAndMigrate();
    expect(result.migratedFromLocalStorage).toBe(true);

    const recipesInDb = await getAllRecipesFromDb();
    const foundCustom = recipesInDb.find(r => r.id === 'custom_migrated_rec_1');
    expect(foundCustom).toBeDefined();
    expect(foundCustom?.name).toBe('Мой старый крафтовый эль');

    const logsInDb = await getAllLogsFromDb();
    expect(logsInDb.some(l => l.id === 'custom_migrated_log_1')).toBe(true);
    expect(localStorageMock.getItem('masterbrew_dexie_migrated')).toBe('true');
  });

  it('migrates and scales legacy 20L recipes to 30L standard', async () => {
    const legacy20LRecipe: Recipe = {
      ...INITIAL_RECIPES[0],
      id: 'legacy_20l_recipe',
      name: 'Старый рецепт на 20л',
      batchSizeL: 20
    };

    localStorageMock.setItem('masterbrew_recipes', JSON.stringify([legacy20LRecipe]));

    await initDatabaseAndMigrate();
    const recipes = await getAllRecipesFromDb();
    const migrated = recipes.find(r => r.id === 'legacy_20l_recipe');
    expect(migrated).toBeDefined();
    expect(migrated?.batchSizeL).toBe(30);
  });

  it('supports recipe CRUD operations: save, get, delete, bulk sync', async () => {
    const newRecipe: Recipe = {
      ...INITIAL_RECIPES[0],
      id: 'test_save_rec',
      name: 'Тестовый имперский стаут',
      isCustom: true
    };

    await saveRecipeToDb(newRecipe);
    let recipes = await getAllRecipesFromDb();
    expect(recipes.some(r => r.id === 'test_save_rec')).toBe(true);

    await deleteRecipeFromDb('test_save_rec');
    recipes = await getAllRecipesFromDb();
    expect(recipes.some(r => r.id === 'test_save_rec')).toBe(false);

    // Sync full list
    await syncAllRecipesToDb([newRecipe, INITIAL_RECIPES[0]]);
    recipes = await getAllRecipesFromDb();
    expect(recipes.length).toBe(2);
    expect(recipes.some(r => r.id === 'test_save_rec')).toBe(true);
  });

  it('supports brew log CRUD operations: save, get, delete, bulk sync', async () => {
    const newLog: BrewLog = {
      ...DEFAULT_INITIAL_LOG,
      id: 'test_log_crud',
      batchNumber: 'Варка #777'
    };

    await saveLogToDb(newLog);
    let logs = await getAllLogsFromDb();
    expect(logs.some(l => l.id === 'test_log_crud')).toBe(true);

    await deleteLogFromDb('test_log_crud');
    logs = await getAllLogsFromDb();
    expect(logs.some(l => l.id === 'test_log_crud')).toBe(false);

    // Sync full list
    await syncAllLogsToDb([newLog]);
    logs = await getAllLogsFromDb();
    expect(logs.length).toBe(1);
    expect(logs[0].id).toBe('test_log_crud');
  });
});
