import { describe, it, expect } from 'vitest';
import {
  generateBeerConcepts,
  ARCHETYPES_META,
  MOODS_META
} from '../src/utils/craftBeerNameGenerator';
import { Recipe } from '../src/types/brewing';

const mockIpaRecipe: Recipe = {
  id: 'test_ipa',
  name: 'Безымянный Эль',
  style: 'American IPA',
  category: 'IPA',
  description: '',
  author: 'Пивовар',
  batchSizeL: 20,
  boilTimeMin: 60,
  efficiencyPercent: 75,
  grainRatioLPerKg: 3.5,
  grainTempC: 20,
  targetCarbonationVol: 2.4,
  beerTempAtBottlingC: 18,
  grains: [
    { id: 'g1', name: 'Курский Пилснер', weightKg: 5.0, type: 'base', colorEbc: 3.5, potentialSg: 1.037 }
  ],
  hops: [
    { id: 'h1', name: 'Citra', weightG: 50, boilTimeMin: 15, alphaAcid: 12.5, use: 'boil' },
    { id: 'h2', name: 'Mosaic', weightG: 50, boilTimeMin: 3, alphaAcid: 12.0, use: 'dry_hop' }
  ],
  mashSchedule: [{ id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 60, type: 'maltose' }],
  yeast: {
    name: 'US-05',
    lab: 'Fermentis',
    form: 'dry',
    type: 'ale',
    cellsPerGramOrVial: 20,
    attenuationPercent: 78,
    tempRange: [18, 22]
  },
  calculated: {
    ogSg: 1.060,
    fgSg: 1.012,
    ogPlato: 14.7,
    fgPlato: 3.1,
    abv: 6.3,
    ibu: 55,
    srm: 6.1,
    ebc: 12,
    buGuRatio: 0.91,
    totalGrainWeightKg: 5.0,
    strikeWaterL: 17.5,
    spargeWaterL: 10.0,
    totalWaterL: 27.5,
    strikeTempC: 71,
    dryYeastGramsNeeded: 11,
    yeastPacksNeeded: 1,
    dextroseGrams: 120,
    sucroseGrams: 130,
    dmeGrams: 150,
    speiseMl: 1200,
    caloriesPer500ml: 220
  },
  tags: ['ipa'],
  createdAt: '2026-10-19T00:00:00Z',
  updatedAt: '2026-10-19T00:00:00Z'
};

describe('Craft Beer Name & Concept Generator', () => {
  it('has 8 archetypes (including mix) and 5 moods defined', () => {
    expect(ARCHETYPES_META.length).toBe(8);
    expect(MOODS_META.length).toBe(5);
  });

  it('generates 6 diverse concepts when archetype is "all"', () => {
    const concepts = generateBeerConcepts(mockIpaRecipe, { archetype: 'all', count: 6 });
    expect(concepts.length).toBe(6);

    concepts.forEach(c => {
      expect(c.name).toBeTruthy();
      expect(c.slogan).toBeTruthy();
      expect(c.legend).toBeTruthy();
      expect(c.backLabelDescription).toContain('American IPA');
      expect(c.backLabelDescription).toContain('6.3%');
      expect(c.palette).toHaveProperty('background');
      expect(c.palette).toHaveProperty('text');
      expect(c.palette).toHaveProperty('accent');
      expect(c.palette).toHaveProperty('border');
      expect(c.themeStyle).toBeTruthy();
      expect(c.suggestedArtwork).toBeTruthy();
    });
  });

  it('generates wordplay pun concepts when archetype is "craft_puns"', () => {
    const concepts = generateBeerConcepts(mockIpaRecipe, { archetype: 'craft_puns', count: 4 });
    expect(concepts.length).toBe(4);
    concepts.forEach(c => {
      expect(c.archetype).toBe('craft_puns');
      expect(c.themeStyle).toBe('craft_rebel');
    });
  });

  it('generates slavic myth concepts when archetype is "slavic_myth"', () => {
    const concepts = generateBeerConcepts(mockIpaRecipe, { archetype: 'slavic_myth', count: 4 });
    expect(concepts.length).toBe(4);
    concepts.forEach(c => {
      expect(c.archetype).toBe('slavic_myth');
      expect(c.themeStyle).toBe('slavic_craft');
    });
  });

  it('generates sci-fi cyberpunk concepts when archetype is "cyber_scifi"', () => {
    const concepts = generateBeerConcepts(mockIpaRecipe, { archetype: 'cyber_scifi', count: 4 });
    expect(concepts.length).toBe(4);
    concepts.forEach(c => {
      expect(c.archetype).toBe('cyber_scifi');
      expect(c.themeStyle).toBe('cyber_hops');
    });
  });

  it('generates nordic saga concepts when archetype is "nordic_saga"', () => {
    const concepts = generateBeerConcepts(mockIpaRecipe, { archetype: 'nordic_saga', count: 4 });
    expect(concepts.length).toBe(4);
    concepts.forEach(c => {
      expect(c.archetype).toBe('nordic_saga');
      expect(c.themeStyle).toBe('minimal_nordic');
    });
  });
});
