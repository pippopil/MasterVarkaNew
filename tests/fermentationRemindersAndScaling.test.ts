import { describe, it, expect, beforeEach, vi } from 'vitest';

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

import { scaleRecipeIngredients, calculateBrewMetrics } from '../src/utils/brewingMath';
import {
  scheduleFermentationStageReminder,
  scheduleBatchAllStages,
  cancelBatchReminders,
  cancelScheduledReminder,
  getStoredScheduledReminders,
  isFirstLaunchPermissionPromptNeeded,
  markFirstLaunchPermissionPrompted
} from '../src/utils/audioAndNotifications';
import { parseBirRfRecipe } from '../src/utils/birRfParser';
import { FermentationBatch, GrainItem, Yeast } from '../src/types/brewing';

describe('Fermentation Reminders & Batch Scaling', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Ingredient Scaling upon Batch Size Change', () => {
    it('scales malt, hops and other ingredients proportionally when batch size increases', () => {
      const initialGrains: GrainItem[] = [
        { id: 'g1', name: 'Pilsner', weightKg: 5, colorEbc: 3.5, potentialSg: 1.037, type: 'base' },
        { id: 'g2', name: 'Munich', weightKg: 1, colorEbc: 15, potentialSg: 1.035, type: 'base' }
      ];
      const initialHops = [
        { id: 'h1', name: 'Magnum', weightG: 20, alphaAcid: 12, boilTimeMin: 60, use: 'boil' as const },
        { id: 'h2', name: 'Citra', weightG: 50, alphaAcid: 12.5, boilTimeMin: 0, use: 'dry_hop' as const }
      ];

      // Scale from 20L to 40L (double)
      const { scaledGrains, scaledHops } = scaleRecipeIngredients(initialGrains, initialHops, 20, 40);

      expect(scaledGrains[0].weightKg).toBe(10);
      expect(scaledGrains[1].weightKg).toBe(2);
      expect(scaledHops[0].weightG).toBe(40);
      expect(scaledHops[1].weightG).toBe(100);
    });

    it('scales malt, hops and other ingredients down when batch size decreases', () => {
      const initialGrains: GrainItem[] = [
        { id: 'g1', name: 'Pale Ale', weightKg: 6, colorEbc: 5, potentialSg: 1.037, type: 'base' }
      ];
      const initialHops = [
        { id: 'h1', name: 'Cascade', weightG: 30, alphaAcid: 6.5, boilTimeMin: 60, use: 'boil' as const }
      ];

      // Scale from 30L to 15L (half)
      const { scaledGrains, scaledHops } = scaleRecipeIngredients(initialGrains, initialHops, 30, 15);

      expect(scaledGrains[0].weightKg).toBe(3);
      expect(scaledHops[0].weightG).toBe(15);
    });

    it('preserves OG and ABV metrics when scaled proportionally', () => {
      const grains20L: GrainItem[] = [
        { id: 'g1', name: 'Pilsner', weightKg: 5, colorEbc: 3.5, potentialSg: 1.037, type: 'base' }
      ];
      const hops20L = [
        { id: 'h1', name: 'Saaz', weightG: 40, alphaAcid: 3.5, boilTimeMin: 60, use: 'boil' as const }
      ];
      const yeast: Yeast = {
        name: 'Saflager W-34/70',
        lab: 'Fermentis',
        form: 'dry',
        type: 'lager',
        cellsPerGramOrVial: 20,
        attenuationPercent: 82,
        tempRange: [10, 14]
      };

      const metrics20L = calculateBrewMetrics({
        batchSizeL: 20,
        boilTimeMin: 60,
        efficiencyPercent: 75,
        grainRatioLPerKg: 3.5,
        grainTempC: 20,
        targetCarbonationVol: 2.5,
        beerTempAtBottlingC: 12,
        grains: grains20L,
        hops: hops20L,
        yeast
      });

      const { scaledGrains: grains50L, scaledHops: hops50L } = scaleRecipeIngredients(grains20L, hops20L, 20, 50);

      const metrics50L = calculateBrewMetrics({
        batchSizeL: 50,
        boilTimeMin: 60,
        efficiencyPercent: 75,
        grainRatioLPerKg: 3.5,
        grainTempC: 20,
        targetCarbonationVol: 2.5,
        beerTempAtBottlingC: 12,
        grains: grains50L,
        hops: hops50L,
        yeast
      });

      // Gravity and ABV should stay identical because ratio grain/water is identical
      expect(metrics50L.ogSg).toBe(metrics20L.ogSg);
      expect(metrics50L.abv).toBe(metrics20L.abv);
    });
  });

  describe('Bir.rf Hop Parser Verification', () => {
    it('correctly parses hop variety names without default fallback to Saaz from brief.ferm.hp', () => {
      const briefData = {
        name: 'American IPA Citra Mosaic',
        cats: { style: 'American IPA' },
        ferm: {
          hp: {
            '1': { name: 'Citra', weight: '25', acid: '13.5', boil: '60' },
            '2': { name: 'Mosaic', weight: '40', acid: '12.0', boil: '15' },
            '3': { name: 'Simcoe', weight: '50', acid: '13.0', boil: '0', dtype: 'сухое' }
          },
          fm: {
            '1': { name: 'Pilsner Malt', weight: '5.5', color: '3.5' }
          }
        }
      };

      const sampleHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Рецепт напитка от пивовара</title>
          <meta name="keywords" content="Сааз, пивоварение, хмель">
        </head>
        <body>
          <input type="hidden" id="brief" value='${JSON.stringify(briefData)}' />
        </body>
        </html>
      `;

      const recipe = parseBirRfRecipe(sampleHtml, 'https://xn--90aoy.xn--p1ai/beer_recipes/123');

      expect(recipe).not.toBeNull();
      expect(recipe!.hops.length).toBe(3);
      expect(recipe!.hops[0].name).toBe('Citra');
      expect(recipe!.hops[1].name).toBe('Mosaic');
      expect(recipe!.hops[2].name).toBe('Simcoe');
      // Must not falsely be Saaz
      expect(recipe!.hops.some(h => h.name === 'Сааз')).toBe(false);
    });

    it('correctly parses hop variety names from raw HTML block without brief', () => {
      const sampleHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Рецепт напитка от пивовара</title>
          <meta name="keywords" content="Сааз, пивоварение, хмель">
        </head>
        <body>
          <article>
            <h1 id="item-title">West Coast IPA Simcoe Centennial</h1>
            <i>Зерновые:</i></span><br />5.0 кг Pale Ale Malt<br />
            <i>Хмель:</i></span><br />
            30 г Centennial a-к.=9.5 кипятить 60 мин<br />
            40 г Simcoe a-к.=13.0 кипятить 15 мин<br />
            50 г Amarillo a-к.=8.5 сухое брожение<br />
            <span>Всего: 120 г</span>
          </article>
        </body>
        </html>
      `;

      const recipe = parseBirRfRecipe(sampleHtml, 'https://xn--90aoy.xn--p1ai/beer_recipes/456');

      expect(recipe).not.toBeNull();
      expect(recipe!.hops.length).toBe(3);
      expect(recipe!.hops[0].name).toBe('Centennial');
      expect(recipe!.hops[1].name).toBe('Simcoe');
      expect(recipe!.hops[2].name).toBe('Amarillo');
      expect(recipe!.hops.some(h => h.name === 'Сааз')).toBe(false);
    });
  });

  describe('Fermentation Local Notifications & Reminders Storage', () => {
    it('manages first launch permission flag correctly', () => {
      expect(isFirstLaunchPermissionPromptNeeded()).toBe(true);
      markFirstLaunchPermissionPrompted();
      expect(isFirstLaunchPermissionPromptNeeded()).toBe(false);
    });

    it('schedules and retrieves fermentation stage reminder in local registry', async () => {
      const future = new Date(Date.now() + 86400000 * 5); // +5 days
      const id = await scheduleFermentationStageReminder({
        title: 'Сухое охмеление IPA',
        body: 'Внести 50г хмеля Citra',
        triggerDate: future,
        batchId: 'batch_test_1',
        batchNumber: 'Партия #1',
        recipeName: 'Citra IPA',
        stageName: 'Сухое охмеление'
      });

      const stored = getStoredScheduledReminders();
      expect(stored.length).toBe(1);
      expect(stored[0].id).toBe(id);
      expect(stored[0].stageName).toBe('Сухое охмеление');
      expect(stored[0].batchNumber).toBe('Партия #1');

      await cancelScheduledReminder(id);
      expect(getStoredScheduledReminders().length).toBe(0);
    });

    it('schedules all future stages for a fermentation batch in calendar', async () => {
      const today = new Date().toISOString().split('T')[0];
      const testBatch: FermentationBatch = {
        id: 'batch_calendar_99',
        recipeId: 'rec_1',
        recipeName: 'NEIPA',
        batchNumber: 'Партия #99',
        startDate: today,
        stages: [
          {
            id: 's1',
            name: 'День варки',
            description: 'Варка',
            dayOffset: 0,
            durationDays: 1,
            targetTempC: 66,
            isCompleted: true,
            actionRequired: 'Завершено'
          },
          {
            id: 's2',
            name: 'Сухое охмеление',
            description: 'Dry hop',
            dayOffset: 5,
            durationDays: 3,
            targetTempC: 20,
            isCompleted: false,
            actionRequired: 'Внести Citra'
          },
          {
            id: 's3',
            name: 'Розлив',
            description: 'Бутылки',
            dayOffset: 14,
            durationDays: 1,
            targetTempC: 18,
            isCompleted: false,
            actionRequired: 'Укупорить'
          }
        ],
        notes: '',
        isFinished: false
      };

      const count = await scheduleBatchAllStages(testBatch);
      expect(count).toBe(2); // stages s2 and s3 are in the future

      const stored = getStoredScheduledReminders();
      expect(stored.filter(r => r.batchId === 'batch_calendar_99').length).toBe(2);

      await cancelBatchReminders('batch_calendar_99');
      expect(getStoredScheduledReminders().filter(r => r.batchId === 'batch_calendar_99').length).toBe(0);
    });
  });
});
