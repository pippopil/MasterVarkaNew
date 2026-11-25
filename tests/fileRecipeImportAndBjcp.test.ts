import { DOMParser as XmldomParser } from '@xmldom/xmldom';
if (typeof globalThis.DOMParser === 'undefined') {
  globalThis.DOMParser = XmldomParser as unknown as typeof DOMParser;
}
import { describe, it, expect } from 'vitest';
import {
  parseCsvRecipe,
  extractIngredientsFromFile,
  parseUniversalRecipe
} from '../src/utils/universalRecipeParser';
import { analyzeRecipeBjcpLocally } from '../src/services/bjcpAiService';
import { calculateBrewMetrics } from '../src/utils/brewingMath';
import { Recipe } from '../src/types/brewing';

describe('Recipe File Import & Format Validation', () => {


  it('parses CSV table with comma delimiter and headers', () => {
    const csvData = `
Name,Amount,Unit,Type,Color
Pilsner Malt,5.2,kg,Grain,3.5
Caramel 60,0.5,kg,Grain,60
Magnum,25,g,Hop,0
Saaz,40,g,Hop,0
`.trim();

    const recipe = parseCsvRecipe(csvData);
    expect(recipe).not.toBeNull();
    expect(recipe!.grains.length).toBe(2);
    expect(recipe!.grains[0].name).toContain('Pilsner');
    expect(recipe!.grains[0].weightKg).toBe(5.2);
    expect(recipe!.hops.length).toBe(2);
    expect(recipe!.hops[0].name).toContain('Magnum');
    expect(recipe!.hops[0].weightG).toBe(25);
  });

  it('parses Russian CSV with semicolon delimiter', () => {
    const russianCsv = `
[Fermentables]
Солод;Вес;Единица
Курский Пэйл Эль;6.0;кг
Курский Карамельный 50;0.6;кг
[Hops]
Хмель;Количество;Альфа;Время;Назначение
Каскад;50;6.5;15;Варка
Магнум;25;14.0;60;Варка
`.trim();

    const recipe = parseCsvRecipe(russianCsv);
    expect(recipe).not.toBeNull();
    expect(recipe!.grains.length).toBe(2);
    expect(recipe!.grains[0].weightKg).toBe(6.0);
    expect(recipe!.hops.length).toBe(2);
    expect(recipe!.hops[0].name).toContain('Каскад');
  });

  it('extractIngredientsFromFile returns structured result for BeerXML', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<RECIPES>
  <RECIPE>
    <NAME>American IPA Test</NAME>
    <VERSION>1</VERSION>
    <TYPE>All Grain</TYPE>
    <BATCH_SIZE>25.0</BATCH_SIZE>
    <BOIL_TIME>60.0</BOIL_TIME>
    <EFFICIENCY>75.0</EFFICIENCY>
    <FERMENTABLES>
      <FERMENTABLE>
        <NAME>Pale Ale Malt</NAME>
        <VERSION>1</VERSION>
        <AMOUNT>5.5</AMOUNT>
        <TYPE>Grain</TYPE>
        <COLOR>6.0</COLOR>
      </FERMENTABLE>
    </FERMENTABLES>
    <HOPS>
      <HOP>
        <NAME>Citra</NAME>
        <VERSION>1</VERSION>
        <AMOUNT>0.050</AMOUNT>
        <ALPHA>12.5</ALPHA>
        <USE>Boil</USE>
        <TIME>15.0</TIME>
      </HOP>
    </HOPS>
    <YEASTS>
      <YEAST>
        <NAME>SafAle US-05</NAME>
        <VERSION>1</VERSION>
        <TYPE>Ale</TYPE>
        <FORM>Dry</FORM>
      </YEAST>
    </YEASTS>
  </RECIPE>
</RECIPES>`;

    const res = extractIngredientsFromFile(xml, 'my_recipe.xml');
    expect(res.success).toBe(true);
    expect(res.formatDetected).toBe('BeerXML');
    expect(res.grains.length).toBe(1);
    expect(res.grains[0].name).toContain('Pale Ale');
    expect(res.hops.length).toBe(1);
    expect(res.hops[0].name).toBe('Citra');
    expect(res.hops[0].weightG).toBe(50);
    expect(res.itemSummary.grainCount).toBe(1);
    expect(res.itemSummary.hopCount).toBe(1);
  });

  it('extractIngredientsFromFile returns detailed Russian error for invalid/empty content', () => {
    const invalidData = 'Hello world, this is just some text with no brewing recipe';
    const res = extractIngredientsFromFile(invalidData, 'notes.txt');

    expect(res.success).toBe(false);
    expect(res.error).toContain('Не удалось распознать пивоваренный рецепт или ингредиенты');
    expect(res.error).toContain('notes.txt');
    expect(res.formatDetected).toBe('Неизвестно');
  });

  it('extractIngredientsFromFile extracts ingredients from plain text', () => {
    const textData = `
Рецепт: Овсяный Стаут
Объем: 20 л
Солод:
- Пэйл Эль 4.5 кг
- Карамельный 0.5 кг
- Жженый ячмень 0.4 кг
- Овсяные хлопья 0.6 кг
Хмель:
- Фагглс 35 г за 60 мин
- Голдинг 25 г за 10 мин
Дрожжи: Nottingham
`.trim();

    const res = extractIngredientsFromFile(textData, 'stout.txt');
    expect(res.success).toBe(true);
    expect(res.grains.length).toBeGreaterThanOrEqual(3);
    expect(res.hops.length).toBeGreaterThanOrEqual(2);
    expect(res.itemSummary.totalGrainKg).toBeGreaterThan(5);
  });

  it('correctly parses Brewer\'s Friend plain text export with imperial units and clean hop names', () => {
    const bfText = `HOME BREW RECIPE:
Title: Avg. Perfect Northeast IPA (NEIPA)
Author: Kevin Quinn - (Beer Advocate Crowd-Sourced Recipe)
Brew Method: All Grain
Style Name: Specialty IPA: New England IPA
Boil Time: 60 min
Batch Size: 5.75 gallons (fermentor volume)
Efficiency: 70% (brew house)

FERMENTABLES:
10.75 lb - Pale 2-Row (77%)
1.4 lb - Wheat (10%)
1.4 lb - Flaked Oats (10%)
0.42 lb - Honey Malt (3%)

HOPS:
1 oz - Citra, Type: Pellet, AA: 12.6, Use: Boil for 10 min, IBU: 13.55
1 oz - Galaxy, Type: Pellet, AA: 15.6, Use: Boil for 10 min, IBU: 16.77
1.5 oz - Citra, Type: Pellet, AA: 12.6, Use: Whirlpool for 15 min at 170 &deg;F, IBU: 9.23
1.5 oz - Galaxy, Type: Pellet, AA: 15.6, Use: Whirlpool for 15 min at 170 &deg;F, IBU: 11.43
1.5 oz - Mosaic, Type: Pellet, AA: 11.3, Use: Whirlpool for 15 min at 170 &deg;F, IBU: 8.28
1 oz - Citra, Type: Pellet, AA: 12.6, Use: Dry Hop for 7 days
1.5 oz - Galaxy, Type: Pellet, AA: 15.6, Use: Dry Hop for 7 days
1 oz - Mosaic, Type: Pellet, AA: 11.3, Use: Dry Hop for 7 days

OTHER INGREDIENTS:
0.5 tsp - Irish Moss, Time: 15 min, Type: Fining, Use: Boil
4 g - Calcium Chloride (dihydrate), Time: 60 min, Type: Water Agt, Use: Mash
5 g - Gypsum, Time: 60 min, Type: Water Agt, Use: Mash

YEAST:
Wyeast - London Ale III 1318
Attenuation (custom): 78%
Optimum Temp: 64 - 74 F

MASH GUIDELINES:
1) Infusion, Start Temp: -- F, Target Temp: 152 F, Time: 60 min`;

    const res = extractIngredientsFromFile(bfText, 'recipe.txt');
    expect(res.success).toBe(true);
    expect(res.formatDetected).toBe('Текстовый рецепт');
    expect(res.recipe?.name).toBe('Avg. Perfect Northeast IPA (NEIPA)');
    expect(res.recipe?.style).toBe('Specialty IPA: New England IPA');
    expect(res.grains.length).toBe(4);
    expect(res.grains[0].name).toBe('Pale 2-Row');
    expect(res.grains[0].weightKg).toBe(4.88);
    expect(res.grains[3].name).toBe('Honey Malt');
    expect(res.grains[3].type).toBe('caramel');
    expect(res.hops.length).toBe(8);
    // Verified: hop names are clean, not polluted with "Type: Pellet, AA: 12.6, Use: Boil..."
    expect(res.hops[0].name).toBe('Citra');
    expect(res.hops[0].alphaAcid).toBe(12.6);
    expect(res.hops[1].name).toBe('Galaxy');
    expect(res.hops[2].use).toBe('whirlpool');
    expect(res.hops[5].use).toBe('dry_hop');
    // Verified: Calcium chloride and Irish moss are NOT parsed as hops
    expect(res.hops.some(h => h.name.includes('Calcium') || h.name.includes('Moss'))).toBe(false);
    expect(res.yeast?.name).toBe('Wyeast - London Ale III 1318');
    expect(res.yeast?.attenuationPercent).toBe(78);
    expect(res.mashSchedule.length).toBeGreaterThanOrEqual(1);
    expect(res.mashSchedule[0].tempC).toBe(67); // 152 F -> 67 C
  });

  it('correctly parses Brewer\'s Friend HTML export even when saved with .xml extension', () => {
    const bfHtml = `<!DOCTYPE html>
<html>
<head><title>Avg. Perfect Northeast IPA (NEIPA) | Brewer's Friend</title></head>
<body>
<h3>Avg. Perfect Northeast IPA (NEIPA)</h3>
<div>By Kevin Quinn</div>
<table>
<tr><td>Method:</td><td><b>All Grain</b></td><td>Style:</td><td><b>Specialty IPA: New England IPA</b></td></tr>
<tr><td>Boil Time:</td><td><b>60 min</b></td><td>Batch Size:</td><td><b>5.75 gallons</b></td></tr>
<tr><td>Efficiency:</td><td><b>70%</b></td></tr>
</table>
<div>Fermentables</div>
<table>
<tr><td>Amount</td><td>Fermentable</td><td>PPG</td><td>°L</td><td>Bill %</td></tr>
<tr><td>10.75 lb</td><td>Pale 2-Row</td><td>37</td><td>1.8</td><td>77%</td></tr>
<tr><td>1.4 lb</td><td>Wheat</td><td>38</td><td>1.8</td><td>10%</td></tr>
<tr><td>1.4 lb</td><td>Flaked Oats</td><td>33</td><td>2.2</td><td>10%</td></tr>
<tr><td>0.42 lb</td><td>Honey Malt</td><td>37</td><td>25</td><td>3%</td></tr>
</table>
<div>Hops</div>
<table>
<tr><td>Amount</td><td>Variety</td><td>Type</td><td>AA</td><td>Use</td><td>Time</td><td>IBU</td></tr>
<tr><td>1 oz</td><td>Citra</td><td>Pellet</td><td>12.6</td><td>Boil</td><td>10 min</td><td>13.55</td></tr>
<tr><td>1 oz</td><td>Galaxy</td><td>Pellet</td><td>15.6</td><td>Boil</td><td>10 min</td><td>16.77</td></tr>
<tr><td>1.5 oz</td><td>Citra</td><td>Pellet</td><td>12.6</td><td>Whirlpool at 170 &deg;F</td><td>15 min</td><td>9.23</td></tr>
<tr><td>1 oz</td><td>Citra</td><td>Pellet</td><td>12.6</td><td>Dry Hop</td><td>7 days</td><td></td></tr>
</table>
<div>Other Ingredients</div>
<table>
<tr><td>0.5 tsp</td><td>Irish Moss</td><td>Fining</td><td>Boil</td><td>15 min</td></tr>
<tr><td>4 g</td><td>Calcium Chloride (dihydrate)</td><td>Water Agt</td><td>Mash</td><td>60 min</td></tr>
</table>
<div>Yeast</div>
<table>
<tr><td style="font-size: 15px;">Wyeast - London Ale III 1318</td></tr>
<tr><td><table><tr><td>Attenuation (custom):</td><td>78%</td></tr><tr><td>Optimum Temp:</td><td>64 - 74 &deg;F</td></tr></table></td></tr>
</table>
<div>Mash Guidelines</div>
<table>
<tr><td>Amount</td><td>Description</td><td>Type</td><td>Start Temp</td><td>Target Temp</td><td>Time</td></tr>
<tr><td>--</td><td></td><td>Infusion</td><td>--</td><td>152 F</td><td>60 min</td></tr>
</table>
</body></html>`;

    // Note the filename ends with .xml!
    const res = extractIngredientsFromFile(bfHtml, 'my_recipe.xml');
    expect(res.success).toBe(true);
    expect(res.formatDetected).toContain('HTML');
    expect(res.recipe?.name).toBe('Avg. Perfect Northeast IPA (NEIPA)');
    expect(res.recipe?.style).toBe('Specialty IPA: New England IPA');
    expect(res.grains.length).toBe(4);
    expect(res.grains[0].name).toBe('Pale 2-Row');
    expect(res.hops.length).toBe(4);
    expect(res.hops[0].name).toBe('Citra');
    expect(res.hops[0].alphaAcid).toBe(12.6);
    expect(res.hops[2].use).toBe('whirlpool');
    expect(res.hops[3].use).toBe('dry_hop');
    expect(res.yeast?.name).toBe('Wyeast - London Ale III 1318');
    expect(res.yeast?.attenuationPercent).toBe(78);
    expect(res.mashSchedule[0].tempC).toBe(67);
  });
});

describe('BJCP Style Analysis Engine', () => {
  const sampleRecipe: Recipe = {
    id: 'rec_bjcp_test',
    name: 'West Coast IPA',
    style: 'American IPA',
    category: '21. IPA',
    description: 'Тестовый рецепт IPA для анализа',
    author: 'Тестер',
    batchSizeL: 25,
    boilTimeMin: 60,
    efficiencyPercent: 75,
    grainRatioLPerKg: 3.5,
    grainTempC: 20,
    targetCarbonationVol: 2.4,
    beerTempAtBottlingC: 19,
    grains: [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 6.0, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Caramel 40', weightKg: 0.4, potentialSg: 1.034, colorEbc: 40.0, type: 'caramel' }
    ],
    hops: [
      { id: 'h1', name: 'Magnum', weightG: 30, alphaAcid: 14.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Citra', weightG: 50, alphaAcid: 12.5, boilTimeMin: 15, use: 'boil' },
      { id: 'h3', name: 'Mosaic', weightG: 50, alphaAcid: 12.0, boilTimeMin: 0, use: 'dry_hop' }
    ],
    mashSchedule: [
      { id: 'm1', name: 'Осахаривание', tempC: 65, timeMin: 60, type: 'maltose' }
    ],
    yeast: {
      name: 'SafAle US-05',
      lab: 'Fermentis',
      form: 'dry',
      type: 'ale',
      cellsPerGramOrVial: 20,
      attenuationPercent: 81,
      tempRange: [18, 24]
    },
    calculated: calculateBrewMetrics({
      batchSizeL: 25,
      boilTimeMin: 60,
      efficiencyPercent: 75,
      grainRatioLPerKg: 3.5,
      grainTempC: 20,
      targetCarbonationVol: 2.4,
      beerTempAtBottlingC: 19,
      grains: [
        { id: 'g1', name: 'Pale Ale Malt', weightKg: 6.0, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
        { id: 'g2', name: 'Caramel 40', weightKg: 0.4, potentialSg: 1.034, colorEbc: 40.0, type: 'caramel' }
      ],
      hops: [
        { id: 'h1', name: 'Magnum', weightG: 30, alphaAcid: 14.0, boilTimeMin: 60, use: 'boil' },
        { id: 'h2', name: 'Citra', weightG: 50, alphaAcid: 12.5, boilTimeMin: 15, use: 'boil' },
        { id: 'h3', name: 'Mosaic', weightG: 50, alphaAcid: 12.0, boilTimeMin: 0, use: 'dry_hop' }
      ],
      yeast: {
        name: 'SafAle US-05',
        lab: 'Fermentis',
        form: 'dry',
        type: 'ale',
        cellsPerGramOrVial: 20,
        attenuationPercent: 81,
        tempRange: [18, 24]
      }
    }),

    tags: ['IPA', 'Крафт'],
    isCustom: true,
    collection: 'my_recipes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  it('performs comprehensive local BJCP analysis with vital stats, grain bill and hop advice', () => {
    const analysis = analyzeRecipeBjcpLocally(sampleRecipe, 'American IPA');
    expect(analysis).toBeDefined();
    expect(analysis.styleName).toContain('IPA');
    expect(analysis.overallScore).toBeGreaterThanOrEqual(75);
    expect(analysis.vitalStats.og).toBeDefined();
    expect(analysis.vitalStats.ibu.actual).toBe(sampleRecipe.calculated.ibu);
    expect(analysis.vitalStats.buGuRatio.actual).toBeGreaterThan(0.8);


    // Grain bill advice
    expect(analysis.grainBillAnalysis.summary).toBeDefined();
    expect(analysis.grainBillAnalysis.strengths.length).toBeGreaterThan(0);

    // Hop advice
    expect(analysis.hopScheduleAnalysis.summary).toBeDefined();
    expect(analysis.hopScheduleAnalysis.suggestedVarieties.length).toBeGreaterThan(0);

    // Mash & Yeast advice
    expect(analysis.mashAndYeastAdvice.mashRecommendations.length).toBeGreaterThan(0);
  });

  it('correctly maps foreign malts (US - Pale 2-Row, Honey Malt, American - Wheat, Flaked Oats) to Kursk analogues', async () => {
    const { getKurskMaltSubstitute } = await import('../src/utils/brewingSubstitutions');

    const pale2RowSub = getKurskMaltSubstitute('US - Pale 2-Row');
    expect(pale2RowSub).not.toBeNull();
    expect(pale2RowSub!.kurskName).toContain('Пэйл Эль');

    const briessSub = getKurskMaltSubstitute('Briess 2-Row Brewers Malt');
    expect(briessSub).not.toBeNull();
    expect(briessSub!.kurskName).toContain('Пэйл Эль');

    const honeyMaltSub = getKurskMaltSubstitute('Honey Malt');
    expect(honeyMaltSub).not.toBeNull();
    expect(honeyMaltSub!.kurskName).toContain('Меланоидиновый');

    const wheatSub = getKurskMaltSubstitute('American - Wheat');
    expect(wheatSub).not.toBeNull();
    expect(wheatSub!.kurskName).toContain('Пшеничный');

    const oatSub = getKurskMaltSubstitute('Flaked Oats');
    expect(oatSub).not.toBeNull();
    expect(oatSub!.kurskName).toContain('Овсян');

    const sixRowSub = getKurskMaltSubstitute('US 6-Row');
    expect(sixRowSub).not.toBeNull();
    expect(sixRowSub!.kurskName).toContain('Пилснер');
  });

  it('accurately parses Brewers Friend text recipe with exact metric weights (no extra malts or hops)', () => {
    const brewersFriendText = `
Recipe: Hazy NEIPA
Brewer: CraftBrewer
Style: NEIPA

FERMENTABLES:
10.75 lb - US - Pale 2-Row (77%)
1.4 lb - American - Wheat (10%)
1.4 lb - Flaked Oats (10%)
0.42 lb - Honey Malt (3%)

HOPS:
1 oz - Citra, Type: Pellet, AA: 12.6, Use: Boil for 10 min, IBU: 9.23
1 oz - Galaxy, Type: Pellet, AA: 14.5, Use: Boil for 10 min, IBU: 10.62
1.5 oz - Citra, Type: Pellet, AA: 12.6, Use: Whirlpool for 15 min at 170 °F, IBU: 9.23
1.5 oz - Galaxy, Type: Pellet, AA: 14.5, Use: Whirlpool for 15 min at 170 °F, IBU: 10.62
1.5 oz - Mosaic, Type: Pellet, AA: 12.2, Use: Whirlpool for 15 min at 170 °F, IBU: 8.94
1 oz - Citra, Type: Pellet, AA: 12.6, Use: Dry Hop for 7 days
1.5 oz - Galaxy, Type: Pellet, AA: 14.5, Use: Dry Hop for 7 days
1 oz - Mosaic, Type: Pellet, AA: 12.2, Use: Dry Hop for 7 days
1.25 oz - Citra, Type: Pellet, AA: 12.6, Use: Dry Hop for 3 days
1.5 oz - Galaxy, Type: Pellet, AA: 14.5, Use: Dry Hop for 3 days
1 oz - Mosaic, Type: Pellet, AA: 12.2, Use: Dry Hop for 3 days

MASH GUIDELINES:
Target Temp: 152 F, Time: 60 min

WATER REQUIREMENTS:
Mash volume with grains: 5.5 gal
Water Notes:
CaCl2 - 3 grams
Gypsum - 2 grams
`.trim();

    const result = extractIngredientsFromFile(brewersFriendText, 'neipa_recipe.txt');
    expect(result.success).toBe(true);
    // Exactly 4 fermentables
    expect(result.grains.length).toBe(4);
    expect(result.grains[0].name).toContain('Pale 2-Row');
    expect(result.grains[0].weightKg).toBe(4.88); // 10.75 lb = 4.88 kg
    expect(result.grains[1].weightKg).toBe(0.64); // 1.40 lb = 0.64 kg
    expect(result.grains[2].weightKg).toBe(0.64); // 1.40 lb = 0.64 kg
    expect(result.grains[3].weightKg).toBe(0.19); // 0.42 lb = 0.19 kg
    expect(result.itemSummary.totalGrainKg).toBe(6.35); // 4.88 + 0.64 + 0.64 + 0.19

    // Exactly 11 hops
    expect(result.hops.length).toBe(11);
    expect(result.hops[0].weightG).toBe(28.3); // 1 oz
    expect(result.hops[2].weightG).toBe(42.5); // 1.5 oz
    expect(result.hops[8].weightG).toBe(35.4); // 1.25 oz
    // Total hop weight sum: 5 * 28.3 + 5 * 42.5 + 1 * 35.4 = 389.4 g
    expect(result.itemSummary.totalHopG).toBe(389.4);
  });

  it('parses BeerXML with DISPLAY_AMOUNT correctly using regex and DOMParser', () => {
    const xmlWithDisplayAmount = `<?xml version="1.0" encoding="UTF-8"?>
<RECIPES>
  <RECIPE>
    <NAME>NEIPA Special &amp; Craft</NAME>
    <VERSION>1</VERSION>
    <TYPE>All Grain</TYPE>
    <BATCH_SIZE>20.82</BATCH_SIZE>
    <BOIL_TIME>60.0</BOIL_TIME>
    <EFFICIENCY>70.0</EFFICIENCY>
    <FERMENTABLES>
      <FERMENTABLE>
        <NAME>US - Pale 2-Row</NAME>
        <VERSION>1</VERSION>
        <AMOUNT>4.876</AMOUNT>
        <DISPLAY_AMOUNT>10.75 lb</DISPLAY_AMOUNT>
        <TYPE>Grain</TYPE>
        <COLOR>1.8</COLOR>
      </FERMENTABLE>
      <FERMENTABLE>
        <NAME>American - Wheat</NAME>
        <VERSION>1</VERSION>
        <AMOUNT>0.635</AMOUNT>
        <DISPLAY_AMOUNT>1.40 lb</DISPLAY_AMOUNT>
        <TYPE>Grain</TYPE>
        <COLOR>2.0</COLOR>
      </FERMENTABLE>
    </FERMENTABLES>
    <HOPS>
      <HOP>
        <NAME>Citra</NAME>
        <VERSION>1</VERSION>
        <AMOUNT>0.0425</AMOUNT>
        <DISPLAY_AMOUNT>1.50 oz</DISPLAY_AMOUNT>
        <ALPHA>12.6</ALPHA>
        <USE>Whirlpool</USE>
        <TIME>15.0</TIME>
      </HOP>
    </HOPS>
  </RECIPE>
</RECIPES>`;

    const result = extractIngredientsFromFile(xmlWithDisplayAmount, 'recipe.xml');
    expect(result.success).toBe(true);
    expect(result.grains.length).toBe(2);
    expect(result.grains[0].weightKg).toBe(4.88);
    expect(result.hops.length).toBe(1);
    expect(result.hops[0].weightG).toBe(42.5);
    expect(result.hops[0].use).toBe('whirlpool');
  });
});
