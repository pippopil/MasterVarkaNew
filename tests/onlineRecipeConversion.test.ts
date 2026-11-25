import { DOMParser as XmldomParser } from '@xmldom/xmldom';
if (typeof globalThis.DOMParser === 'undefined') {
  globalThis.DOMParser = XmldomParser as unknown as typeof DOMParser;
}
import { describe, it, expect } from 'vitest';
import { convertOnlineItemToRecipe } from '../src/data/onlineRecipeDatabase';
import { validateRecipeWithZod } from '../src/utils/beerXml';

describe('Online Recipe Item Conversion and Robustness', () => {
  it('converts minimal recipe with missing mashSchedule without throwing', () => {
    const itemWithoutMash: any = {
      id: 'online_test_1',
      name: 'Test IPA without Mash Schedule',
      style: 'American IPA',
      category: 'Эли',
      origin: 'Test Brewery',
      description: 'A test beer',
      batchSizeL: 20,
      boilTimeMin: 60,
      grains: [
        { name: 'Pale Ale Malt', weightKg: 5.0, potentialSg: 1.038, colorEbc: 5.5, type: 'base' }
      ],
      hops: [
        { name: 'Cascade', weightG: 30, alphaAcid: 6.0, boilTimeMin: 60, use: 'boil' }
      ],
      // mashSchedule intentionally undefined
      yeast: { name: 'SafAle US-05', attenuationPercent: 80 },
      tags: ['IPA']
    };

    expect(() => convertOnlineItemToRecipe(itemWithoutMash)).not.toThrow();
    const recipe = convertOnlineItemToRecipe(itemWithoutMash);
    expect(recipe).toBeDefined();
    expect(recipe.mashSchedule.length).toBeGreaterThan(0);
    expect(recipe.grains.length).toBe(1);
    expect(recipe.calculated.abv).toBeGreaterThan(0);
  });

  it('converts item with undefined grains, hops, yeast and tags safely', () => {
    const incompleteItem: any = {
      id: 'online_test_incomplete',
      name: 'Incomplete Raw Recipe',
      style: 'Blonde Ale'
    };

    expect(() => convertOnlineItemToRecipe(incompleteItem)).not.toThrow();
    const recipe = convertOnlineItemToRecipe(incompleteItem);
    expect(recipe.grains.length).toBeGreaterThan(0);
    expect(recipe.mashSchedule.length).toBeGreaterThan(0);
    expect(recipe.yeast).toBeDefined();
    expect(recipe.calculated.ogSg).toBeGreaterThan(1.0);
  });

  it('converted recipe satisfies Zod validation', () => {
    const item: any = {
      id: 'online_test_zod',
      name: 'Zod Verified Online Beer',
      style: 'Stout',
      category: 'Стауты',
      origin: 'Craft Lab',
      description: 'Delicious stout',
      batchSizeL: 25,
      boilTimeMin: 60,
      grains: [
        { name: 'Pilsner Malt', weightKg: 4.5, potentialSg: 1.037, colorEbc: 3.5, type: 'base' },
        { name: 'Roasted Barley', weightKg: 0.5, potentialSg: 1.025, colorEbc: 1100, type: 'roasted' }
      ],
      hops: [
        { name: 'Magnum', weightG: 20, alphaAcid: 14.0, boilTimeMin: 60, use: 'boil' }
      ]
    };

    const recipe = convertOnlineItemToRecipe(item);
    const validation = validateRecipeWithZod(recipe);
    expect(validation.success).toBe(true);
  });

  it('parses typical Бир.РФ recipe markup', async () => {
    const { parseBirRfRecipe } = await import('../src/utils/birRfParser');
    const sampleHtml = `
      <html>
        <head><title>RIS Imperial Stout | Рецепт напитка от BeerMaster</title></head>
        <body>
          Категория: <b>Стауты</b><br/>
          Стиль: <b>Russian Imperial Stout</b><br/>
          Размер: <b>25 л</b><br/>
          Время кипячения: <b>90 мин</b><br/>
          Эффективность варки: <b>72%</b><br/>
          <span><i>Зерновые:</i></span><br/>
          <li><b>6.0 кг</b> <a href="#">Pale Ale Malt</a> (цвет = 3.0 L°)</li>
          <li><b>0.8 кг</b> <a href="#">Roasted Barley</a> (цвет = 450.0 L°)</li>
          <span><i>Хмель:</i></span><br/>
          <li><b>40 гр</b> <a href="#">Magnum</a> (a-к.=14.0%) кипятить 60 мин</li>
          <li><b>30 гр</b> <a href="#">East Kent Goldings</a> (a-к.=5.0%) кипятить 15 мин</li>
          <span><i>Температурные паузы:</i></span><br/>
          <li>Осахаривание: 66 °С - 60 мин</li>
          <li>Мэшаут: 78 °С - 10 мин</li>
          <span><i>Дрожжи:</i></span><br/>
          <a href="#">Fermentis SafAle S-04</a>
        </body>
      </html>
    `;

    const parsed = parseBirRfRecipe(sampleHtml, 'https://xn--90aoy.xn--p1ai/beer_recipes/1');
    expect(parsed).not.toBeNull();
    if (parsed) {
      expect(parsed.name).toContain('RIS Imperial Stout');
      expect(parsed.grains.length).toBe(2);
      expect(parsed.hops.length).toBe(2);
      expect(parsed.hops[0].name).toContain('Magnum');
      expect(parsed.hops[1].name).toContain('East Kent Goldings');
      expect(parsed.mashSchedule.length).toBe(2);
      expect(parsed.calculated.abv).toBeGreaterThan(0);
    }
  });

  it('correctly extracts hops from real Бир.РФ structured brief and ignores head meta keywords', async () => {
    const { parseBirRfRecipe } = await import('../src/utils/birRfParser');
    const sampleWithBriefAndMeta = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="keywords" content="пиво, рецепты, хмель, солод, затирание" />
          <title>English IPA | Рецепт от MasterBrewer</title>
        </head>
        <body>
          <h1 id="item-title">English IPA</h1>
          <article id="item-text">
            <input type="hidden" id="brief" value='{"cats":{"style":"English IPA"},"pars":{"after-boiling":"30","boil":"90","kpd":"78"},"ferm":{"fm":{"0":{"name":"Maris Otter","weight":"5.5","ebc":"5.5"}},"hp":{"0":{"name":"Fuggle (Великобритания)","weight":"50","acid":"4.8","boil":"60"},"1":{"name":"East Kent Goldings","weight":"30","acid":"5.2","boil":"15"}}},"mode":{"pause":{"0":{"name":"Осахаривание","temp":"66","hold":"60"}}}}'>
          </article>
        </body>
      </html>
    `;

    const parsed = parseBirRfRecipe(sampleWithBriefAndMeta, 'https://xn--90aoy.xn--p1ai/beer_recipes/123');
    expect(parsed).not.toBeNull();
    expect(parsed?.name).toBe('English IPA');
    expect(parsed?.batchSizeL).toBe(30);
    expect(parsed?.hops.length).toBe(2);
    expect(parsed?.hops[0].name).toBe('Fuggle (Великобритания)');
    expect(parsed?.hops[0].weightG).toBe(50);
    expect(parsed?.hops[1].name).toBe('East Kent Goldings');
    expect(parsed?.hops[1].weightG).toBe(30);
    // Verified that it does NOT fall back to Saaz!
    expect(parsed?.hops.some(h => h.name.includes('Saaz'))).toBe(false);
  });

  it('resolves bundled sample recipes offline regardless of URL prefix or slashes', async () => {
    const { getBundledSampleContent, BUNDLED_SAMPLE_RECIPES } = await import('../src/data/bundledSampleRecipes');
    expect(Object.keys(BUNDLED_SAMPLE_RECIPES).length).toBe(4);

    expect(getBundledSampleContent('/sample-recipes/sierra-nevada-pale-ale.xml')).not.toBeNull();
    expect(getBundledSampleContent('sample-recipes/sierra-nevada-pale-ale.xml')).not.toBeNull();
    expect(getBundledSampleContent('sierra-nevada-pale-ale.xml')).not.toBeNull();
    expect(getBundledSampleContent('/sample-recipes/guinness-stout.json')).not.toBeNull();
    expect(getBundledSampleContent('guinness-stout.json')).not.toBeNull();
    expect(getBundledSampleContent('/sample-recipes/pliny-the-elder.xml')).not.toBeNull();
    expect(getBundledSampleContent('/sample-recipes/zhigulevskoe-gost.xml')).not.toBeNull();
  });

  it('successfully parses all bundled samples (BeerXML and JSON)', async () => {
    const { getBundledSampleContent } = await import('../src/data/bundledSampleRecipes');
    const { importFromBeerXml } = await import('../src/utils/beerXml');

    const sierraXml = getBundledSampleContent('sierra-nevada-pale-ale.xml')!;
    const sierraRecipe = importFromBeerXml(sierraXml);
    expect(sierraRecipe).not.toBeNull();
    expect(sierraRecipe?.name).toBe('Sierra Nevada Pale Ale Clone');
    expect(sierraRecipe?.grains.length).toBeGreaterThan(0);
    expect(sierraRecipe?.hops.length).toBeGreaterThan(0);

    const plinyXml = getBundledSampleContent('pliny-the-elder.xml')!;
    const plinyRecipe = importFromBeerXml(plinyXml);
    expect(plinyRecipe).not.toBeNull();
    expect(plinyRecipe?.name).toBe('Pliny the Elder Double IPA Clone');

    const zhiguliXml = getBundledSampleContent('zhigulevskoe-gost.xml')!;
    const zhiguliRecipe = importFromBeerXml(zhiguliXml);
    expect(zhiguliRecipe).not.toBeNull();
    expect(zhiguliRecipe?.name).toContain('Жигулевское');

    const guinnessJson = getBundledSampleContent('guinness-stout.json')!;
    const parsedJson = JSON.parse(guinnessJson);
    expect(parsedJson.recipe.name).toBe('Guinness Extra Stout Clone');
    expect(parsedJson.recipe.grains.length).toBe(3);
    expect(parsedJson.recipe.hops.length).toBe(2);
  });

  it('parses lowercase BeerXML from other brewing programs without failure', async () => {
    const { parseUniversalRecipe } = await import('../src/utils/universalRecipeParser');
    const lowercaseBeerXml = `
      <recipes>
        <recipe>
          <name>Czech Saaz Pilsner</name>
          <type>All Grain</type>
          <batch_size>20.0</batch_size>
          <boil_time>90</boil_time>
          <efficiency>75.0</efficiency>
          <fermentables>
            <fermentable>
              <name>Floor-Malted Bohemian Pilsner</name>
              <amount>4.8</amount>
              <color>3.5</color>
              <yield>80.0</yield>
            </fermentable>
          </fermentables>
          <hops>
            <hop>
              <name>Saaz</name>
              <amount>0.045</amount>
              <alpha>3.5</alpha>
              <use>Boil</use>
              <time>90</time>
            </hop>
          </hops>
          <yeast>
            <name>Saflager W-34/70</name>
          </yeast>
        </recipe>
      </recipes>
    `;

    const recipe = parseUniversalRecipe(lowercaseBeerXml);
    expect(recipe).not.toBeNull();
    expect(recipe?.name).toBe('Czech Saaz Pilsner');
    expect(recipe?.grains.length).toBe(1);
    expect(recipe?.hops.length).toBe(1);
    expect(recipe?.batchSizeL).toBe(20.0);
  });

  it('parses Brewfather JSON export format', async () => {
    const { parseUniversalRecipe } = await import('../src/utils/universalRecipeParser');
    const brewfatherJson = JSON.stringify({
      name: 'Brewfather Hazy NEIPA',
      batchSize: 21,
      boilTime: 60,
      efficiency: 74,
      style: { name: 'New England IPA', category: 'IPA' },
      fermentables: [
        { name: 'Pale Ale Malt', amount: 5.0, color: 5 },
        { name: 'Flaked Oats', amount: 1.2, color: 2.5 }
      ],
      hops: [
        { name: 'Citra', amount: 30, alpha: 12.5, time: 10, use: 'Boil' },
        { name: 'Mosaic', amount: 80, alpha: 13.0, time: 0, use: 'Dry Hop' }
      ],
      yeast: { name: 'Verdant IPA', laboratory: 'Lallemand', attenuation: 77 }
    });

    const recipe = parseUniversalRecipe(brewfatherJson);
    expect(recipe).not.toBeNull();
    expect(recipe?.name).toBe('Brewfather Hazy NEIPA');
    expect(recipe?.grains.length).toBe(2);
    expect(recipe?.hops.length).toBe(2);
    expect(recipe?.calculated.abv).toBeGreaterThan(5);
  });

  it('parses plain text recipes from Russian and English forums', async () => {
    const { parseUniversalRecipe } = await import('../src/utils/universalRecipeParser');

    const ruForumText = `
      Название: Таежный Стаут
      Стиль: Sweet Stout
      Объем: 20 л
      Кипячение: 60 мин

      Солод:
      Солод Пилснер 4.0 кг
      Солод Карамельный 0.5 кг
      Жженый ячмень 0.3 кг

      Хмель:
      Хмель Магнум 20 г (60 мин) 14%
      Хмель Каскад 25 г (15 мин) 6%

      Дрожжи:
      Fermentis S-04
    `;

    const ruRecipe = parseUniversalRecipe(ruForumText);
    expect(ruRecipe).not.toBeNull();
    expect(ruRecipe?.name).toBe('Таежный Стаут');
    expect(ruRecipe?.grains.length).toBe(3);
    expect(ruRecipe?.hops.length).toBe(2);
    expect(ruRecipe?.calculated.ogSg).toBeGreaterThan(1.040);

    const enForumText = `
      Recipe Name: West Coast DIPA
      Style: Double IPA
      Batch Size: 5 gallons
      Boil Time: 90 min

      Fermentables:
      12 lbs 2-Row Pale Malt
      1 lb Crystal 40L
      0.5 lb Carapils

      Hops:
      1.5 oz CTZ (90 min) 15%
      1 oz Simcoe (15 min) 13%
      2 oz Citra (dry hop) 12%

      Yeast: US-05
    `;

    const enRecipe = parseUniversalRecipe(enForumText);
    expect(enRecipe).not.toBeNull();
    expect(enRecipe?.name).toBe('West Coast DIPA');
    expect(enRecipe?.grains.length).toBe(3);
    expect(enRecipe?.hops.length).toBe(3);
    expect(enRecipe?.calculated.abv).toBeGreaterThan(6.0);
  });
});



