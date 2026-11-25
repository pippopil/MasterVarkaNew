/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Dexie, { type Table } from 'dexie';
import { Recipe, BrewLog, InventoryItem, FermentationBatch, Lifehack, CommunityPost } from '../types/brewing';
import { INITIAL_RECIPES, INITIAL_INVENTORY, INITIAL_LIFEHACKS, INITIAL_POSTS } from '../data/defaultData';
import { calculateBrewMetrics, scaleRecipeIngredients } from '../utils/brewingMath';
import { validateRecipeWithZod } from '../schemas/beerXmlSchema';

/**
 * Начальная эталонная запись в журнале варок
 */
export const DEFAULT_INITIAL_LOG: BrewLog = {
  id: 'log_init_1',
  recipeId: INITIAL_RECIPES[0]?.id || 'rec_1',
  recipeName: INITIAL_RECIPES[0]?.name || 'Citra IPA',
  batchNumber: 'Варка #1 (Citra IPA)',
  brewDate: '2026-03-01',
  targetOg: INITIAL_RECIPES[0]?.calculated?.ogSg || 1.056,
  targetFg: INITIAL_RECIPES[0]?.calculated?.fgSg || 1.012,
  targetAbv: INITIAL_RECIPES[0]?.calculated?.abv || 5.8,
  actualOg: 1.054,
  actualFg: 1.011,
  actualAbv: 5.6,
  actualEfficiency: 73,
  mashPh: 5.35,
  fermentTempC: 19.5,
  bjcpScore: 47,
  tastingNotes: {
    aroma: 'Взрывной тропический аромат манго, грейпфрута и свежей сосны.',
    appearance: 'Красивый глубокий золотистый цвет (14 EBC), стойкая пенная шапка.',
    flavor: 'Чистая солодовая подложка с мягкой сочной хмелевой горчинкой.',
    mouthfeel: 'Освежающее среднее тело, правильная карбонизация.',
    overall: 'Превосходный крафтовый IPA уровня победителя конкурса.'
  },
  notes: 'Промывочную воду держал строго 76°C, вирпул сделал при 82°C. Никаких танинов.',
  status: 'ready'
};

/**
 * Dexie.js база данных MasterVarkaDB для персистентного хранения всех данных пользователя в памяти устройства
 */
export class MasterVarkaDatabase extends Dexie {
  recipes!: Table<Recipe, string>;
  brewLogs!: Table<BrewLog, string>;
  inventory!: Table<InventoryItem, string>;
  batches!: Table<FermentationBatch, string>;
  lifehacks!: Table<Lifehack, string>;
  posts!: Table<CommunityPost, string>;
  appSettings!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('MasterVarkaDB');
    this.version(1).stores({
      recipes: '&id, name, style, category, collection, isCustom, updatedAt, createdAt',
      brewLogs: '&id, recipeId, batchNumber, brewDate, status'
    });
    this.version(2).stores({
      recipes: '&id, name, style, category, collection, isCustom, updatedAt, createdAt',
      brewLogs: '&id, recipeId, batchNumber, brewDate, status',
      inventory: '&id, name, category, amount',
      batches: '&id, recipeId, batchNumber, startDate, isFinished',
      lifehacks: '&id, category, title',
      posts: '&id, recipeName, author',
      appSettings: '&key'
    });
  }
}

export const db = new MasterVarkaDatabase();

/**
 * Запрос постоянного хранилища (Persistent Storage) у ОС Android / браузера.
 * Предотвращает удаление базы данных при очистке временного кэша и обновлении программы.
 */
export async function requestStoragePersistence(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      console.log(`[Storage] Persistent storage granted: ${isPersisted}`);
      return isPersisted;
    } catch (e) {
      console.warn('[Storage] Could not request persistence:', e);
      return false;
    }
  }
  return false;
}

/**
 * Получить все рецепты из IndexedDB
 */
export async function getAllRecipesFromDb(): Promise<Recipe[]> {
  try {
    return await db.recipes.toArray();
  } catch (err) {
    console.error('[Dexie] Ошибка чтения рецептов из IndexedDB:', err);
    return [];
  }
}

/**
 * Сохранить или обновить рецепт в IndexedDB (со строгой Zod-валидацией для защиты БД)
 */
export async function saveRecipeToDb(recipe: Recipe): Promise<boolean> {
  const validation = validateRecipeWithZod(recipe);
  if (!validation.success) {
    console.error('[Dexie] Рецепт не прошел Zod-валидацию, запись в IndexedDB отклонена:', validation.errors);
    return false;
  }

  try {
    await db.recipes.put(validation.data || recipe);
    return true;
  } catch (err) {
    console.error('[Dexie] Ошибка сохранения рецепта в IndexedDB:', err);
    return false;
  }
}

/**
 * Удалить рецепт из IndexedDB
 */
export async function deleteRecipeFromDb(id: string): Promise<void> {
  try {
    await db.recipes.delete(id);
  } catch (err) {
    console.error('[Dexie] Ошибка удаления рецепта из IndexedDB:', err);
  }
}

/**
 * Полная синхронизация списка рецептов в IndexedDB с фильтрацией через Zod
 */
export async function syncAllRecipesToDb(recipes: Recipe[]): Promise<void> {
  try {
    // Пропускаем каждый рецепт через Zod-схему, предотвращая порчу IndexedDB
    const validRecipes: Recipe[] = [];
    for (const r of recipes) {
      const check = validateRecipeWithZod(r);
      if (check.success && check.data) {
        validRecipes.push(check.data);
      } else {
        console.warn(`[Dexie] Пропуск некорректного рецепта «${r.name || r.id}»:`, check.errors);
      }
    }

    if (validRecipes.length === 0 && recipes.length > 0) {
      console.error('[Dexie] Ни один рецепт не прошел Zod-валидацию, синхронизация отменена во избежание потери данных');
      return;
    }

    await db.transaction('rw', db.recipes, async () => {
      await db.recipes.clear();
      await db.recipes.bulkPut(validRecipes);
    });
  } catch (err) {
    console.error('[Dexie] Ошибка пакетного обновления рецептов в IndexedDB:', err);
  }
}

/**
 * Получить все записи журнала варок из IndexedDB
 */
export async function getAllLogsFromDb(): Promise<BrewLog[]> {
  try {
    return await db.brewLogs.toArray();
  } catch (err) {
    console.error('[Dexie] Ошибка чтения журнала варок из IndexedDB:', err);
    return [];
  }
}

/**
 * Сохранить запись журнала варок в IndexedDB
 */
export async function saveLogToDb(log: BrewLog): Promise<void> {
  try {
    await db.brewLogs.put(log);
  } catch (err) {
    console.error('[Dexie] Ошибка сохранения записи журнала варок в IndexedDB:', err);
  }
}

/**
 * Удалить запись журнала варок из IndexedDB
 */
export async function deleteLogFromDb(id: string): Promise<void> {
  try {
    await db.brewLogs.delete(id);
  } catch (err) {
    console.error('[Dexie] Ошибка удаления записи журнала варок из IndexedDB:', err);
  }
}

/**
 * Полная синхронизация журнала варок в IndexedDB
 */
export async function syncAllLogsToDb(logs: BrewLog[]): Promise<void> {
  try {
    await db.transaction('rw', db.brewLogs, async () => {
      await db.brewLogs.clear();
      await db.brewLogs.bulkPut(logs);
    });
  } catch (err) {
    console.error('[Dexie] Ошибка пакетного обновления журнала варок в IndexedDB:', err);
  }
}

/**
 * Инициализация базы данных Dexie с бесшовной миграцией из LocalStorage
 */
export async function initDatabaseAndMigrate(): Promise<{
  recipes: Recipe[];
  logs: BrewLog[];
  inventory: InventoryItem[];
  batches: FermentationBatch[];
  lifehacks: Lifehack[];
  posts: CommunityPost[];
  migratedFromLocalStorage: boolean;
}> {
  let migrated = false;

  // 1. Инициализация и миграция рецептов
  let dbRecipes = await db.recipes.toArray();
  if (dbRecipes.length === 0) {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('masterbrew_recipes') : null;
    let initialRecipesToSave: Recipe[] = [];

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const migratedRecipes = parsed.map((r: Recipe) => {
            if (r.batchSizeL === 20) {
              const { scaledGrains, scaledHops } = scaleRecipeIngredients(r.grains, r.hops, 20, 30);
              return {
                ...r,
                batchSizeL: 30,
                grains: scaledGrains,
                hops: scaledHops,
                calculated: calculateBrewMetrics({
                  ...r,
                  batchSizeL: 30,
                  grains: scaledGrains,
                  hops: scaledHops
                })
              };
            }
            return r;
          });
          const existingIds = new Set(migratedRecipes.map((r: any) => r.id));
          const missingNew = INITIAL_RECIPES.filter(r => !existingIds.has(r.id));
          initialRecipesToSave = [...migratedRecipes, ...missingNew];
          migrated = true;
        }
      } catch (e) {
        console.error('[Dexie] Не удалось разобрать старые рецепты из localStorage:', e);
      }
    }

    if (initialRecipesToSave.length === 0) {
      initialRecipesToSave = INITIAL_RECIPES;
    }

    await db.recipes.bulkPut(initialRecipesToSave);
    dbRecipes = initialRecipesToSave;
  } else {
    // Если в базе уже есть рецепты, проверяем отсутствие эталонных системных рецептов
    const existingIds = new Set(dbRecipes.map(r => r.id));
    const missingNew = INITIAL_RECIPES.filter(r => !existingIds.has(r.id));
    if (missingNew.length > 0) {
      await db.recipes.bulkPut(missingNew);
      dbRecipes = [...dbRecipes, ...missingNew];
    }
  }

  // 2. Инициализация и миграция журнала варок
  let dbLogs = await db.brewLogs.toArray();
  if (dbLogs.length === 0) {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('masterbrew_logs') : null;
    let initialLogsToSave: BrewLog[] = [];

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialLogsToSave = parsed;
          migrated = true;
        }
      } catch (e) {
        console.error('[Dexie] Не удалось разобрать старый журнал варок из localStorage:', e);
      }
    }

    if (initialLogsToSave.length === 0) {
      initialLogsToSave = [DEFAULT_INITIAL_LOG];
    }

    await db.brewLogs.bulkPut(initialLogsToSave);
    dbLogs = initialLogsToSave;
  }

  // 3. Инициализация и персистентность остатков на складе (Inventory)
  let dbInventory = await db.inventory.toArray();
  if (dbInventory.length === 0) {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('masterbrew_inventory') : null;
    let initialInvToSave: InventoryItem[] = [];

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialInvToSave = parsed;
          migrated = true;
        }
      } catch (e) {
        console.error('[Dexie] Не удалось разобрать склад из localStorage:', e);
      }
    }

    if (initialInvToSave.length === 0) {
      initialInvToSave = INITIAL_INVENTORY;
    }

    initialInvToSave = initialInvToSave.map((item) => ({
      ...item,
      pricePerUnit: typeof item.pricePerUnit === 'number' ? item.pricePerUnit : 0,
      currency: item.currency || 'RUB'
    }));

    await db.inventory.bulkPut(initialInvToSave);
    dbInventory = initialInvToSave;
  } else {
    // Бесшовная миграция новых опциональных полей (pricePerUnit, currency) для существующих записей склада
    let needsInvMigration = false;
    const normalizedInv = dbInventory.map((item) => {
      if (typeof item.pricePerUnit !== 'number' || !item.currency) {
        needsInvMigration = true;
        return {
          ...item,
          pricePerUnit: typeof item.pricePerUnit === 'number' ? item.pricePerUnit : 0,
          currency: item.currency || 'RUB'
        };
      }
      return item;
    });
    if (needsInvMigration) {
      await db.inventory.bulkPut(normalizedInv);
      dbInventory = normalizedInv;
    }
  }

  // 4. Инициализация и персистентность партий брожения (Batches)
  let dbBatches = await db.batches.toArray();
  if (dbBatches.length === 0) {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('masterbrew_batches') : null;
    let initialBatchesToSave: FermentationBatch[] = [];

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialBatchesToSave = parsed;
          migrated = true;
        }
      } catch (e) {
        console.error('[Dexie] Не удалось разобрать партии из localStorage:', e);
      }
    }

    if (initialBatchesToSave.length > 0) {
      await db.batches.bulkPut(initialBatchesToSave);
      dbBatches = initialBatchesToSave;
    }
  }

  // 5. Инициализация и персистентность лайфхаков (Lifehacks)
  let dbLifehacks = await db.lifehacks.toArray();
  if (dbLifehacks.length === 0) {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('masterbrew_lifehacks') : null;
    let initialHacksToSave: Lifehack[] = [];

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialHacksToSave = parsed;
          migrated = true;
        }
      } catch (e) {}
    }

    if (initialHacksToSave.length === 0) {
      initialHacksToSave = INITIAL_LIFEHACKS;
    }

    await db.lifehacks.bulkPut(initialHacksToSave);
    dbLifehacks = initialHacksToSave;
  }

  // 6. Инициализация постов сообщества (Posts)
  let dbPosts = await db.posts.toArray();
  if (dbPosts.length === 0) {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('masterbrew_posts') : null;
    let initialPostsToSave: CommunityPost[] = [];

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialPostsToSave = parsed;
          migrated = true;
        }
      } catch (e) {}
    }

    if (initialPostsToSave.length === 0) {
      initialPostsToSave = INITIAL_POSTS;
    }

    await db.posts.bulkPut(initialPostsToSave);
    dbPosts = initialPostsToSave;
  }

  // Запрашиваем у ОС Android постоянное хранилище
  await requestStoragePersistence();

  // Отметка о завершении первичной миграции
  if (typeof window !== 'undefined') {
    localStorage.setItem('masterbrew_dexie_migrated', 'true');
  }

  return {
    recipes: dbRecipes,
    logs: dbLogs,
    inventory: dbInventory,
    batches: dbBatches,
    lifehacks: dbLifehacks,
    posts: dbPosts,
    migratedFromLocalStorage: migrated
  };
}

/**
 * Синхронизация остатков склада в IndexedDB
 */
export async function syncAllInventoryToDb(inventory: InventoryItem[]): Promise<void> {
  try {
    await db.transaction('rw', db.inventory, async () => {
      await db.inventory.clear();
      if (inventory.length > 0) {
        await db.inventory.bulkPut(inventory);
      }
    });
    // Дублируем в localStorage для надежности
    if (typeof window !== 'undefined') {
      localStorage.setItem('masterbrew_inventory', JSON.stringify(inventory));
    }
  } catch (err) {
    console.error('[Dexie] Ошибка синхронизации склада в IndexedDB:', err);
  }
}

/**
 * Синхронизация партий брожения в IndexedDB
 */
export async function syncAllBatchesToDb(batches: FermentationBatch[]): Promise<void> {
  try {
    await db.transaction('rw', db.batches, async () => {
      await db.batches.clear();
      if (batches.length > 0) {
        await db.batches.bulkPut(batches);
      }
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('masterbrew_batches', JSON.stringify(batches));
    }
  } catch (err) {
    console.error('[Dexie] Ошибка синхронизации партий в IndexedDB:', err);
  }
}

/**
 * Синхронизация лайфхаков в IndexedDB
 */
export async function syncAllLifehacksToDb(lifehacks: Lifehack[]): Promise<void> {
  try {
    await db.transaction('rw', db.lifehacks, async () => {
      await db.lifehacks.clear();
      if (lifehacks.length > 0) {
        await db.lifehacks.bulkPut(lifehacks);
      }
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('masterbrew_lifehacks', JSON.stringify(lifehacks));
    }
  } catch (err) {
    console.error('[Dexie] Ошибка синхронизации лайфхаков в IndexedDB:', err);
  }
}

/**
 * Синхронизация постов сообщества в IndexedDB
 */
export async function syncAllPostsToDb(posts: CommunityPost[]): Promise<void> {
  try {
    await db.transaction('rw', db.posts, async () => {
      await db.posts.clear();
      if (posts.length > 0) {
        await db.posts.bulkPut(posts);
      }
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('masterbrew_posts', JSON.stringify(posts));
    }
  } catch (err) {
    console.error('[Dexie] Ошибка синхронизации постов в IndexedDB:', err);
  }
}
