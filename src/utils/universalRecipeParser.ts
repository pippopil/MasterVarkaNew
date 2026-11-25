import { Recipe, GrainItem, HopItem, MashRest, Yeast, HopUse, GrainType, OtherIngredientItem } from '../types/brewing';
import { calculateBrewMetrics } from './brewingMath';
import { importFromBeerXml } from './beerXml';
import { parseBirRfRecipe } from './birRfParser';

/**
 * Очистка HTML тегов и сущностей в чистый читаемый текст
 */
export function cleanHtmlText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&deg;/g, '°')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Определение типа солода по его названию
 */
function detectGrainType(name: string): GrainType {
  const n = name.toLowerCase();
  if (n.includes('cara') || n.includes('карамель') || n.includes('crystal') || n.includes('кристалл') || n.includes('honey') || n.includes('мед')) return 'caramel';
  if (n.includes('roast') || n.includes('жжен') || n.includes('choc') || n.includes('black') || n.includes('шоколад')) return 'roasted';
  if (n.includes('wheat') || n.includes('пшенич')) return 'wheat';
  if (n.includes('flake') || n.includes('хлопь') || n.includes('oat') || n.includes('овес') || n.includes('ячменные')) return 'adjunct';
  if (n.includes('acid') || n.includes('кисл')) return 'acid';
  return 'base';
}

/**
 * Определение назначения хмеля
 */
function detectHopUse(useOrName: string, timeMin: number): HopUse {
  const u = useOrName.toLowerCase();
  if (u.includes('dry') || u.includes('сух')) return 'dry_hop';
  if (u.includes('whirl') || u.includes('вирпул') || u.includes('вирп')) return 'whirlpool';
  if (u.includes('aroma') || u.includes('аромат') || timeMin <= 15) return 'aroma';
  return 'boil';
}

/**
 * Парсинг веса зерна с поддержкой кг, г, фунтов (lb), унций (oz)
 * Важно: не используем \b для кириллицы, так как в JS regex \b не поддерживает юникод!
 */
export function parseGrainWeightKg(text: string): number | null {
  // 5.5 кг / 5.5 kg
  const kgMatch = text.match(/([\d.,]+)\s*(?:кг|kgs?)(?![а-яa-z0-9])/i);
  if (kgMatch) {
    const val = parseFloat(kgMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) return val;
  }
  // 500 г / 500 гр / 500 g / 500 grams / 500 грамм
  const gMatch = text.match(/([\d.,]+)\s*(?:грамм(?:ов|а)?|grams?|гр|г|g)(?![а-яa-z0-9])/i);
  if (gMatch) {
    const val = parseFloat(gMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) return val / 1000;
  }
  // 10 lb / 10 lbs / 10 фунтов
  const lbMatch = text.match(/([\d.,]+)\s*(?:фунт(?:ов|а)?|lbs?)(?![а-яa-z0-9])/i);
  if (lbMatch) {
    const val = parseFloat(lbMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) return Number((val * 0.453592).toFixed(2));
  }
  // 8 oz / 8 унций
  const ozMatch = text.match(/([\d.,]+)\s*(?:унц(?:ий|ии|ия)?|oz)(?![а-яa-z0-9])/i);
  if (ozMatch) {
    const val = parseFloat(ozMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) return Number((val * 0.0283495).toFixed(2));
  }
  // Просто число в начале строки или колонке веса
  const numMatch = text.match(/^([\d.,]+)$/);
  if (numMatch) {
    const val = parseFloat(numMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      return val > 20 ? val / 1000 : val;
    }
  }
  return null;
}

/**
 * Парсинг веса хмеля с поддержкой граммов (г/g), унций (oz)
 */
export function parseHopWeightG(text: string): number | null {
  // 25 г / 25 гр / 25 g / 25 грамм
  const gMatch = text.match(/([\d.,]+)\s*(?:грамм(?:ов|а)?|grams?|гр|г|g)(?![а-яa-z0-9])/i);
  if (gMatch) {
    const val = parseFloat(gMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) return val;
  }
  // 1 oz / 1.5 oz / 2 унции
  const ozMatch = text.match(/([\d.,]+)\s*(?:унц(?:ий|ии|ия)?|oz)(?![а-яa-z0-9])/i);
  if (ozMatch) {
    const val = parseFloat(ozMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) return Number((val * 28.3495).toFixed(1));
  }
  // 0.05 кг / 0.05 kg
  const kgMatch = text.match(/([\d.,]+)\s*(?:кг|kgs?)(?![а-яa-z0-9])/i);
  if (kgMatch) {
    const val = parseFloat(kgMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) return val * 1000;
  }
  const numMatch = text.match(/^([\d.,]+)$/);
  if (numMatch) {
    const val = parseFloat(numMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) return val;
  }
  return null;
}

/**
 * Парсинг объема партии (в литрах)
 */
export function parseBatchVolumeL(text: string): number {
  const galMatch = text.match(/([\d.,]+)\s*(?:gallons?|gals?|галлон(?:ов|а)?)(?![а-яa-z0-9])/i);
  if (galMatch) {
    const val = parseFloat(galMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) return Number((val * 3.78541).toFixed(1));
  }
  const lMatch = text.match(/([\d.,]+)\s*(?:литр(?:ов|а)?|liters?|л|l)(?![а-яa-z0-9])/i);
  if (lMatch) {
    const val = parseFloat(lMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) return val;
  }
  return 25.0;
}

/**
 * Разбор Brewfather JSON / BeerJSON / стандартных JSON форматов
 */
export function parseBrewingJson(content: string, sourceUrl?: string): Recipe | null {
  let jsonData: any = null;
  try {
    jsonData = JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        jsonData = JSON.parse(match[0]);
      } catch {
        return null;
      }
    } else {
      return null;
    }
  }

  if (!jsonData || typeof jsonData !== 'object') return null;

  // Если это экспорт нескольких рецептов { recipes: [...] } или { beerjson: { recipes: [...] } }
  const recipeData =
    jsonData.recipe ||
    (Array.isArray(jsonData.recipes) ? jsonData.recipes[0] : null) ||
    jsonData.beerjson?.recipes?.[0] ||
    jsonData;

  if (!recipeData || (!recipeData.name && !recipeData.grains && !recipeData.fermentables && !recipeData.hops)) {
    return null;
  }

  const name = recipeData.name || recipeData.title || 'Импортированный рецепт (JSON)';
  const style =
    (typeof recipeData.style === 'string' ? recipeData.style : recipeData.style?.name) ||
    recipeData.substyle ||
    'Крафтовый стиль';
  const category = recipeData.category || (typeof recipeData.style === 'object' ? recipeData.style?.category : null) || 'Эли';
  const author = recipeData.author || recipeData.brewer || (sourceUrl ? `Источник: ${new URL(sourceUrl).hostname}` : 'JSON импорт');
  const description = recipeData.notes || recipeData.description || '';

  const batchSizeL =
    parseFloat(recipeData.batchSizeL || recipeData.batchSize || recipeData.batch_size || '25') || 25;
  const boilTimeMin =
    parseInt(recipeData.boilTimeMin || recipeData.boilTime || recipeData.boil_time || '60', 10) || 60;
  const efficiencyPercent =
    parseFloat(recipeData.efficiencyPercent || recipeData.efficiency || '75') || 75;

  // Парсинг солодов (grains или fermentables)
  const rawGrains = (recipeData.grains || recipeData.fermentables || []).map((g: any, idx: number) => {
    let weightKg = 1.0;
    if (typeof g.weightKg === 'number') weightKg = g.weightKg;
    else if (typeof g.amount === 'number') {
      weightKg = g.amount > 50 ? g.amount / 1000 : g.amount;
    } else if (typeof g.weight === 'string' || typeof g.amount === 'string') {
      weightKg = parseGrainWeightKg(g.weight || g.amount) || 1.0;
    }

    const potentialSg = parseFloat(g.potentialSg || g.potential || '1.037') || 1.037;
    const colorEbc = parseFloat(g.colorEbc || (g.color ? g.color * 1.97 : '4')) || 4;
    const gName = g.name || `Солод ${idx + 1}`;

    return {
      id: g.id || `g_${idx}_${Date.now()}`,
      name: gName,
      weightKg: Number(weightKg.toFixed(2)),
      potentialSg: Number(potentialSg.toFixed(3)),
      colorEbc: Number(colorEbc.toFixed(1)),
      type: g.type ? (g.type as GrainType) : detectGrainType(gName)
    };
  });

  // Парсинг хмелей
  const rawHops = (recipeData.hops || []).map((h: any, idx: number) => {
    let weightG = 20;
    if (typeof h.weightG === 'number') weightG = h.weightG;
    else if (typeof h.amount === 'number') {
      weightG = h.amount < 1 ? h.amount * 1000 : h.amount;
    } else if (typeof h.weight === 'string' || typeof h.amount === 'string') {
      weightG = parseHopWeightG(h.weight || h.amount) || 20;
    }

    const alphaAcid = parseFloat(h.alphaAcid || h.alpha || '7.0') || 7.0;
    const timeMin = parseInt(h.boilTimeMin || h.time || h.stepTime || '60', 10) || 60;
    const use = (h.use as HopUse) || detectHopUse(h.use || h.type || '', timeMin);

    return {
      id: h.id || `h_${idx}_${Date.now()}`,
      name: h.name || `Хмель ${idx + 1}`,
      weightG: Number(weightG.toFixed(1)),
      alphaAcid: Number(alphaAcid.toFixed(1)),
      boilTimeMin: timeMin,
      use
    };
  });

  // Дрожжи
  const rawYeast = recipeData.yeast || {};
  const yeast: Yeast = {
    name: rawYeast.name || 'SafAle US-05',
    lab: rawYeast.lab || rawYeast.laboratory || 'Fermentis',
    form: rawYeast.form || 'dry',
    type: rawYeast.type || 'ale',
    cellsPerGramOrVial: typeof rawYeast.cellsPerGramOrVial === 'number' ? rawYeast.cellsPerGramOrVial : 20,
    attenuationPercent: typeof rawYeast.attenuationPercent === 'number' ? rawYeast.attenuationPercent : (rawYeast.attenuation || 78),
    tempRange: Array.isArray(rawYeast.tempRange) && rawYeast.tempRange.length === 2 ? rawYeast.tempRange : [18, 22]
  };

  // Паузы затирания
  const rawMash = recipeData.mashSchedule || recipeData.mash?.steps || [];
  const mashSchedule: MashRest[] = Array.isArray(rawMash) && rawMash.length > 0
    ? rawMash.map((m: any, idx: number) => ({
        id: m.id || `m_${idx}_${Date.now()}`,
        name: m.name || m.stepName || 'Осахаривание',
        tempC: typeof m.tempC === 'number' ? m.tempC : (m.stepTemp || 66),
        timeMin: typeof m.timeMin === 'number' ? m.timeMin : (m.stepTime || 60),
        type: m.type || 'maltose'
      }))
    : [
        { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 60, type: 'maltose' },
        { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
      ];

  const calculated = calculateBrewMetrics({
    batchSizeL,
    boilTimeMin,
    efficiencyPercent,
    grainRatioLPerKg: 3.5,
    grainTempC: 20,
    targetCarbonationVol: 2.4,
    beerTempAtBottlingC: 20,
    grains: rawGrains.length > 0 ? rawGrains : [{ id: 'g1', name: 'Pale Ale Malt', weightKg: 4.5, potentialSg: 1.038, colorEbc: 6, type: 'base' }],
    hops: rawHops.length > 0 ? rawHops : [{ id: 'h1', name: 'Cascade', weightG: 30, alphaAcid: 6, boilTimeMin: 60, use: 'boil' }],
    yeast
  });

  return {
    id: `json_imp_${Date.now()}`,
    name,
    style,
    category,
    description,
    author,
    batchSizeL,
    boilTimeMin,
    efficiencyPercent,
    grainRatioLPerKg: 3.5,
    grainTempC: 20,
    targetCarbonationVol: 2.4,
    beerTempAtBottlingC: 20,
    grains: rawGrains.length > 0 ? rawGrains : [{ id: 'g1', name: 'Pale Ale Malt', weightKg: 4.5, potentialSg: 1.038, colorEbc: 6, type: 'base' }],
    hops: rawHops.length > 0 ? rawHops : [{ id: 'h1', name: 'Cascade', weightG: 30, alphaAcid: 6, boilTimeMin: 60, use: 'boil' }],
    mashSchedule,
    yeast,
    calculated,
    tags: ['Импорт', 'JSON', style].filter(Boolean),
    isCustom: true,
    collection: 'my_recipes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Разбор HTML рецепта (Brewer's Friend, форумы, веб-страницы)
 * Корректно извлекает таблицы Fermentables, Hops, Other Ingredients, Yeast, Mash Guidelines
 */
export function parseHtmlRecipe(content: string, sourceUrlOrFilename?: string): Recipe | null {
  if (!content || typeof content !== 'string') return null;
  const lower = content.toLowerCase();
  if (
    !lower.includes('<table') &&
    !lower.includes('<!doctype') &&
    !lower.includes('<html') &&
    !lower.includes('fermentables') &&
    !lower.includes('hops')
  ) {
    return null;
  }

  try {
    // 1. Название рецепта
    let name = '';
    const titleMatch = content.match(/<title>([^|<]+)/i) ||
      content.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i);
    if (titleMatch) {
      name = cleanHtmlText(titleMatch[1]).replace(/Brewer'?s Friend/i, '').replace(/\|/g, '').trim();
    }
    if (!name || name.length < 2) name = 'Импортированный рецепт (HTML)';

    // 2. Стиль
    let style = 'Крафтовый стиль';
    const styleMatch = content.match(/Style(?:\s*Name)?:?<\/td>\s*<td[^>]*><b>([\s\S]*?)<\/b>/i) ||
      content.match(/Style(?:\s*Name)?:\s*<b>([\s\S]*?)<\/b>/i) ||
      content.match(/Style(?:\s*Name)?:\s*([^\n<]+)/i);
    if (styleMatch) style = cleanHtmlText(styleMatch[1]);

    // 3. Автор
    let author = 'Brewer\'s Friend';
    const authorMatch = content.match(/By\s+([^<\n]+)/i);
    if (authorMatch) {
      author = cleanHtmlText(authorMatch[1]);
    } else if (sourceUrlOrFilename) {
      author = sourceUrlOrFilename;
    }

    // 4. Объем партии
    let batchSizeL = 25.0;
    const batchMatch = content.match(/Batch Size:?<\/td>\s*<td[^>]*><b>([\s\S]*?)<\/b>/i) ||
      content.match(/Batch Size:[^<]*<b>([\s\S]*?)<\/b>/i) ||
      content.match(/Batch Size:[^<\n]+/i);
    if (batchMatch) {
      const v = parseBatchVolumeL(cleanHtmlText(batchMatch[1] || batchMatch[0]));
      if (v > 0) batchSizeL = v;
    }

    // 5. Время кипячения
    let boilTimeMin = 60;
    const boilMatch = content.match(/Boil Time:?<\/td>\s*<td[^>]*><b>(\d+)\s*min<\/b>/i) ||
      content.match(/Boil Time:[^<]*<b>(\d+)/i) ||
      content.match(/Boil Time:\s*(\d+)/i);
    if (boilMatch) boilTimeMin = parseInt(boilMatch[1], 10);

    // 6. Эффективность
    let efficiencyPercent = 70.0;
    const effMatch = content.match(/Efficiency:?<\/td>\s*<td[^>]*><b>([\d.,]+)%<\/b>/i) ||
      content.match(/Efficiency:[^<]*<b>([\d.,]+)%/i);
    if (effMatch) efficiencyPercent = parseFloat(effMatch[1].replace(',', '.'));

    // 7. Солода (Fermentables)
    const grains: GrainItem[] = [];
    const grainSectionMatch = content.match(/Fermentables[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/i) ||
      content.match(/(?:солода?|зерновые)[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/i);

    if (grainSectionMatch) {
      const rows = grainSectionMatch[1].match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
      for (const row of rows) {
        const cells = Array.from(row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)).map(m => cleanHtmlText(m[1]));
        if (cells.length >= 2) {
          const c0 = cells[0].toLowerCase();
          const c1 = cells[1].toLowerCase();
          if (c0.includes('amount') || c1.includes('fermentable') || c1.includes('название') || c0.includes('вес')) {
            continue;
          }
          const weight = parseGrainWeightKg(cells[0]);
          if (weight && weight > 0) {
            const gName = cells[1];
            const ppg = parseFloat(cells[2]) || 37;
            const colorL = parseFloat(cells[3]) || 2;
            const gType = detectGrainType(gName);
            grains.push({
              id: `html_g_${grains.length}_${Date.now()}`,
              name: gName,
              weightKg: Number(weight.toFixed(2)),
              potentialSg: Number((1 + (ppg > 10 ? ppg / 1000 : 0.037)).toFixed(3)),
              colorEbc: Number((colorL * 1.97).toFixed(1)),
              type: gType
            });
          }
        }
      }
    }

    // 8. Хмель (Hops)
    const hops: HopItem[] = [];
    const hopSectionMatch = content.match(/Hops[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/i) ||
      content.match(/хмель[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/i);

    if (hopSectionMatch) {
      const rows = hopSectionMatch[1].match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
      for (const row of rows) {
        const cells = Array.from(row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)).map(m => cleanHtmlText(m[1]));
        if (cells.length >= 2) {
          const c0 = cells[0].toLowerCase();
          const c1 = cells[1].toLowerCase();
          if (c0.includes('amount') || c1.includes('variety') || c1.includes('хмель') || c0.includes('кол-во')) {
            continue;
          }
          const weight = parseHopWeightG(cells[0]);
          if (weight && weight > 0) {
            const hName = cells[1];
            let alpha = 6.0;
            if (cells[3]) {
              const aVal = parseFloat(cells[3].replace(',', '.'));
              if (!isNaN(aVal) && aVal > 0) alpha = aVal;
            }

            const useRaw = (cells[4] || '').toLowerCase();
            const timeRaw = (cells[5] || '').toLowerCase();

            let timeMin = 60;
            const tMatch = timeRaw.match(/(\d+)\s*min/i);
            if (tMatch) {
              timeMin = parseInt(tMatch[1], 10);
            } else if (timeRaw.includes('day')) {
              timeMin = 0;
            }

            let use: HopUse = 'boil';
            if (useRaw.includes('dry') || timeRaw.includes('day')) use = 'dry_hop';
            else if (useRaw.includes('whirlpool') || useRaw.includes('вирп')) use = 'whirlpool';
            else if (useRaw.includes('aroma') || timeMin <= 15) use = 'aroma';

            hops.push({
              id: `html_h_${hops.length}_${Date.now()}`,
              name: hName,
              weightG: Number(weight.toFixed(1)),
              alphaAcid: Number(alpha.toFixed(1)),
              boilTimeMin: timeMin,
              use
            });
          }
        }
      }
    }

    if (grains.length === 0 && hops.length === 0) {
      return null;
    }

    // 9. Дополнительные ингредиенты (Other Ingredients)
    const otherIngredients: OtherIngredientItem[] = [];
    const otherSectionMatch = content.match(/Other Ingredients[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/i) ||
      content.match(/(?:добавки|прочие\s*ингредиенты)[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/i);

    if (otherSectionMatch) {
      const rows = otherSectionMatch[1].match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
      for (const row of rows) {
        const cells = Array.from(row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)).map(m => cleanHtmlText(m[1]));
        if (cells.length >= 2 && !cells[0].toLowerCase().includes('amount') && !cells[1].toLowerCase().includes('name')) {
          const amtStr = cells[0];
          const nameStr = cells[1];
          const numMatch = amtStr.match(/([\d.,]+)/);
          const amount = numMatch ? parseFloat(numMatch[1].replace(',', '.')) : 1;
          let unit: OtherIngredientItem['unit'] = 'g';
          if (/tsp|ч\.л/i.test(amtStr)) unit = 'pcs';
          else if (/ml|мл/i.test(amtStr)) unit = 'ml';
          else if (/kg|кг/i.test(amtStr)) unit = 'kg';

          const stageRaw = (cells[3] || '').toLowerCase();
          let stage: OtherIngredientItem['stage'] = 'boil';
          if (stageRaw.includes('mash') || stageRaw.includes('затир')) stage = 'mash';
          else if (stageRaw.includes('prim')) stage = 'primary';
          else if (stageRaw.includes('sec')) stage = 'secondary';
          else if (stageRaw.includes('bottl')) stage = 'bottling';

          const typeRaw = (cells[2] || '').toLowerCase();
          let type: OtherIngredientItem['type'] = 'other';
          if (typeRaw.includes('fining') || typeRaw.includes('осветл')) type = 'fining';
          else if (typeRaw.includes('water') || typeRaw.includes('соли')) type = 'water_agent';
          else if (typeRaw.includes('spice') || typeRaw.includes('спец')) type = 'spice';

          const timeVal = parseInt((cells[4] || '').match(/(\d+)/)?.[1] || '15', 10);

          otherIngredients.push({
            id: `html_misc_${otherIngredients.length}_${Date.now()}`,
            name: nameStr,
            amount,
            unit,
            stage,
            type,
            timeMinOrDays: timeVal
          });
        }
      }
    }

    // 10. Дрожжи (Yeast)
    let yeast: Yeast = {
      name: 'SafAle US-05',
      lab: 'Fermentis',
      form: 'dry',
      type: 'ale',
      cellsPerGramOrVial: 20,
      attenuationPercent: 78,
      tempRange: [18, 22]
    };

    const yeastSectionMatch = content.match(/Yeast[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/i) ||
      content.match(/дрожжи[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/i);

    if (yeastSectionMatch) {
      const yNameMatch = yeastSectionMatch[1].match(/<td[^>]*style=['\"][^'\"]*font-size:\s*15px[^'\"]*['\"][^>]*>([\s\S]*?)<\/td>/i) ||
        yeastSectionMatch[1].match(/<td[^>]*>([^<]*(?:Wyeast|Fermentis|Lallemand|SafAle|White Labs|Mangrove|Omega|Imperial)[^<]*)<\/td>/i);
      const yName = yNameMatch ? cleanHtmlText(yNameMatch[1]) : '';
      if (yName && yName.length > 2) {
        let att = 78;
        const attMatch = yeastSectionMatch[1].match(/Attenuation[^:]*:\s*<\/td>\s*<td[^>]*>\s*(\d+)%/i);
        if (attMatch) att = parseInt(attMatch[1], 10);

        let tempRange: [number, number] = [18, 22];
        const fRangeMatch = yeastSectionMatch[1].match(/Optimum Temp[^:]*:\s*<\/td>\s*<td[^>]*>\s*(\d+)\s*-\s*(\d+)\s*(?:&deg;F|°F|F)/i);
        if (fRangeMatch) {
          const t1 = Math.round((parseInt(fRangeMatch[1], 10) - 32) * 5 / 9);
          const t2 = Math.round((parseInt(fRangeMatch[2], 10) - 32) * 5 / 9);
          tempRange = [t1, t2];
        }

        yeast = {
          name: yName,
          lab: yName.split(/[-–—]/)[0]?.trim() || 'Wyeast',
          form: /liquid/i.test(yeastSectionMatch[1]) ? 'liquid' : 'dry',
          type: /lager/i.test(yName) ? 'lager' : 'ale',
          cellsPerGramOrVial: /liquid/i.test(yeastSectionMatch[1]) ? 100 : 20,
          attenuationPercent: att,
          tempRange
        };
      }
    }

    // 11. Паузы затирания (Mash Guidelines)
    const mashSchedule: MashRest[] = [];
    const mashSectionMatch = content.match(/Mash Guidelines[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/i) ||
      content.match(/(?:затирание|паузы)[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/i);

    if (mashSectionMatch) {
      const rows = mashSectionMatch[1].match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
      for (const row of rows) {
        const cells = Array.from(row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)).map(m => cleanHtmlText(m[1]));
        if (cells.length >= 5) {
          const targetTempCell = cells.find(c => /\d+\s*(?:F|°F|C|°C)/i.test(c));
          const timeCell = cells.find(c => /\d+\s*min/i.test(c));
          if (targetTempCell) {
            let tempC = 66;
            const fMatch = targetTempCell.match(/(\d+)\s*(?:F|°F)/i);
            const cMatch = targetTempCell.match(/(\d+)\s*(?:C|°C)/i);
            if (fMatch) tempC = Math.round((parseInt(fMatch[1], 10) - 32) * 5 / 9);
            else if (cMatch) tempC = parseInt(cMatch[1], 10);

            let timeMin = 60;
            if (timeCell) {
              const tm = timeCell.match(/(\d+)/);
              if (tm) timeMin = parseInt(tm[1], 10);
            }

            const stepName = cells[2] || cells[1] || (tempC >= 75 ? 'Мэшаут' : 'Осахаривание');

            mashSchedule.push({
              id: `html_m_${mashSchedule.length}_${Date.now()}`,
              name: stepName,
              tempC,
              timeMin,
              type: tempC >= 75 ? 'mashout' : 'maltose'
            });
          }
        }
      }
    }

    if (mashSchedule.length === 0) {
      mashSchedule.push(
        { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 60, type: 'maltose' },
        { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
      );
    }

    const calculated = calculateBrewMetrics({
      batchSizeL,
      boilTimeMin,
      efficiencyPercent,
      grainRatioLPerKg: 3.5,
      grainTempC: 20,
      targetCarbonationVol: 2.4,
      beerTempAtBottlingC: 20,
      grains,
      hops,
      yeast
    });

    return {
      id: `html_imp_${Date.now()}`,
      name,
      style,
      category: 'Крафт',
      description: `Импортировано из HTML рецепта (Brewer's Friend). Автор: ${author}`,
      author,
      batchSizeL,
      boilTimeMin,
      efficiencyPercent,
      grainRatioLPerKg: 3.5,
      grainTempC: 20,
      targetCarbonationVol: 2.4,
      beerTempAtBottlingC: 20,
      grains,
      hops,
      otherIngredients,
      mashSchedule,
      yeast,
      calculated,
      tags: ['Brewer\'s Friend', 'HTML', style].filter(Boolean),
      isCustom: true,
      collection: 'my_recipes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch {
    return null;
  }
}

/**
 * Разбор BeerSmith XML (.bsmx) формата
 */
export function parseBsmxFormat(content: string): Recipe | null {
  if (!content.includes('<Recipe>') && !content.includes('<F_R_NAME>') && !content.includes('<Recipes>')) {
    return null;
  }

  try {
    const extractTag = (tag: string, text: string): string => {
      const match = text.match(new RegExp(`<${tag}>([^<]+)<\\/${tag}>`, 'i'));
      return match ? match[1].trim() : '';
    };

    const name = extractTag('F_R_NAME', content) || extractTag('NAME', content) || 'BeerSmith Recipe';
    const batchSizeOz = parseFloat(extractTag('F_R_BATCH_SIZE', content)) || 0;
    const batchSizeL = batchSizeOz > 100 ? Number((batchSizeOz * 0.0295735).toFixed(1)) : (batchSizeOz > 0 ? batchSizeOz : 25);
    const boilTimeMin = parseInt(extractTag('F_R_BOIL_TIME', content), 10) || 60;

    // Солода
    const grainMatches = content.match(/<Grain>[\s\S]*?<\/Grain>/gi) || [];
    const grains: GrainItem[] = grainMatches.map((gStr, idx) => {
      const gName = extractTag('F_G_NAME', gStr) || `Солод ${idx + 1}`;
      const amountOz = parseFloat(extractTag('F_G_AMOUNT', gStr)) || 0;
      const weightKg = amountOz > 20 ? Number((amountOz * 0.0283495).toFixed(2)) : (amountOz > 0 ? amountOz : 1.0);
      const colorSrm = parseFloat(extractTag('F_G_COLOR', gStr)) || 3.0;
      return {
        id: `bsmx_g_${idx}_${Date.now()}`,
        name: gName,
        weightKg,
        potentialSg: 1.037,
        colorEbc: Number((colorSrm * 1.97).toFixed(1)),
        type: detectGrainType(gName)
      };
    });

    // Хмель
    const hopMatches = content.match(/<Hops>[\s\S]*?<\/Hops>/gi) || [];
    const hops: HopItem[] = hopMatches.map((hStr, idx) => {
      const hName = extractTag('F_H_NAME', hStr) || `Хмель ${idx + 1}`;
      const amountOz = parseFloat(extractTag('F_H_AMOUNT', hStr)) || 0;
      const weightG = amountOz > 0 ? Number((amountOz * 28.3495).toFixed(1)) : 25;
      const alpha = parseFloat(extractTag('F_H_ALPHA', hStr)) || 7.0;
      const time = parseInt(extractTag('F_H_DRY_HOP_TIME', hStr) || extractTag('F_H_BOIL_TIME', hStr) || '60', 10) || 60;
      return {
        id: `bsmx_h_${idx}_${Date.now()}`,
        name: hName,
        weightG,
        alphaAcid: alpha,
        boilTimeMin: time,
        use: detectHopUse(hStr, time)
      };
    });

    if (grains.length === 0 && hops.length === 0) return null;

    const yeastName = extractTag('F_Y_NAME', content) || 'SafAle US-05';
    const yeast: Yeast = {
      name: yeastName,
      lab: extractTag('F_Y_LAB', content) || 'Fermentis',
      form: 'dry',
      type: 'ale',
      cellsPerGramOrVial: 20,
      attenuationPercent: 78,
      tempRange: [18, 22]
    };

    const mashSchedule: MashRest[] = [
      { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ];

    const calculated = calculateBrewMetrics({
      batchSizeL,
      boilTimeMin,
      efficiencyPercent: 75,
      grainRatioLPerKg: 3.5,
      grainTempC: 20,
      targetCarbonationVol: 2.4,
      beerTempAtBottlingC: 20,
      grains: grains.length > 0 ? grains : [{ id: 'g1', name: 'Pale Ale Malt', weightKg: 4.5, potentialSg: 1.038, colorEbc: 6, type: 'base' }],
      hops: hops.length > 0 ? hops : [{ id: 'h1', name: 'Cascade', weightG: 30, alphaAcid: 6, boilTimeMin: 60, use: 'boil' }],
      yeast
    });

    return {
      id: `bsmx_imp_${Date.now()}`,
      name,
      style: extractTag('F_S_NAME', content) || 'BeerSmith Style',
      category: 'Крафт',
      description: extractTag('F_R_NOTES', content) || 'Импортировано из BeerSmith (.bsmx)',
      author: extractTag('F_R_BREWER', content) || 'BeerSmith',
      batchSizeL,
      boilTimeMin,
      efficiencyPercent: 75,
      grainRatioLPerKg: 3.5,
      grainTempC: 20,
      targetCarbonationVol: 2.4,
      beerTempAtBottlingC: 20,
      grains,
      hops,
      mashSchedule,
      yeast,
      calculated,
      tags: ['BeerSmith', 'BSMX'],
      isCustom: true,
      collection: 'my_recipes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch {
    return null;
  }
}

/**
 * Универсальный парсер свободного текста рецепта (русский и английский)
 * Поддерживает рецепты с форумов (HomebrewTalk, Teddybeer, Baza-piva, Grainwine, Homedistiller),
 * блогов, заметок пивоваров и произвольных сайтов.
 */
export function parsePlainTextRecipe(rawText: string, sourceUrl?: string): Recipe | null {
  if (!rawText || rawText.trim().length < 20) return null;

  // Очистка HTML тегов если в переданном тексте содержится веб-разметка
  const cleanText = rawText
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/(p|div|tr|li|h1|h2|h3|h4)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&deg;/g, '°')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');

  const lines = cleanText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length < 2) return null;

  // Поиск названия рецепта
  let name = '';
  for (const line of lines.slice(0, 15)) {
    const nameMatch = line.match(/^(?:title|название|рецепт|recipe(?:\s*name)?|name)\s*[:=–—]\s*(.+)/i);
    if (nameMatch) {
      name = nameMatch[1].trim();
      break;
    }
  }
  if (!name) {
    for (const line of lines.slice(0, 5)) {
      if (
        line.length > 3 &&
        line.length < 60 &&
        !line.includes(':') &&
        !/(?:солод|хмель|grain|hop|fermentable|home\s*brew)/i.test(line)
      ) {
        name = line;
        break;
      }
    }
  }
  if (!name) name = 'Импортированный авторский рецепт';

  // Поиск автора
  let author = 'Интернет-рецепт';
  for (const line of lines.slice(0, 15)) {
    const authMatch = line.match(/^(?:author|автор|brewer|пивовар)\s*[:=–—]\s*(.+)/i);
    if (authMatch) {
      author = authMatch[1].trim();
      break;
    }
  }
  if (sourceUrl && author === 'Интернет-рецепт') {
    try {
      author = new URL(sourceUrl).hostname;
    } catch {}
  }

  // Поиск стиля
  let style = 'Крафтовый стиль';
  for (const line of lines.slice(0, 20)) {
    const styleMatch = line.match(/^(?:style(?:\s*name)?|стиль|category)\s*[:=–—]\s*(.+)/i);
    if (styleMatch) {
      style = styleMatch[1].trim();
      break;
    }
  }

  // Объем партии, время варки и эффективность
  let batchSizeL = 25.0;
  let boilTimeMin = 60;
  let efficiencyPercent = 75.0;

  for (const line of lines) {
    if (/^(?:batch\s*size|размер\s*партии|объем|объём|volume)\b/i.test(line)) {
      const v = parseBatchVolumeL(line);
      if (v > 0) batchSizeL = v;
    }
    if (/^(?:boil\s*time|время\s*кипячения|кипячени|варк)\b/i.test(line)) {
      const bMatch = line.match(/([\d]+)\s*(?:минут(?:ы)?|мин|minutes?|mins?)(?![а-яa-z0-9])/i);
      if (bMatch) boilTimeMin = parseInt(bMatch[1], 10);
    }
    if (/^(?:efficiency|эффективност)\b/i.test(line)) {
      const effMatch = line.match(/([\d.,]+)\s*%/);
      if (effMatch) efficiencyPercent = parseFloat(effMatch[1].replace(',', '.'));
    }
  }

  // Секции рецепта
  const grains: GrainItem[] = [];
  const hops: HopItem[] = [];
  const otherIngredients: OtherIngredientItem[] = [];
  const mashSchedule: MashRest[] = [];
  let yeastName = '';
  let yeastAttenuation = 78;
  let yeastTempRange: [number, number] = [18, 22];

  let currentSection: 'meta' | 'grains' | 'hops' | 'other' | 'yeast' | 'mash' | 'ignored' = 'meta';

  for (const line of lines) {
    const lower = line.toLowerCase();

    // 1. Проверка заголовков секций
    if (
      /^(?:fermentables?|солода?|зерновые|засыпь|malts?|grains?)[:=–—]?$/i.test(line) ||
      (lower.includes('fermentables') && lower.endsWith(':')) ||
      (lower.includes('солода') && lower.endsWith(':')) ||
      (lower.includes('засыпь') && lower.endsWith(':'))
    ) {
      currentSection = 'grains';
      continue;
    }

    if (
      /^(?:hops?|хмель)[:=–—]?$/i.test(line) ||
      (lower.includes('hops') && lower.endsWith(':')) ||
      (lower.includes('хмель') && lower.endsWith(':'))
    ) {
      currentSection = 'hops';
      continue;
    }

    if (
      /^(?:other\s*ingredients|misc|miscs|добавки|прочие\s*ингредиенты|специи)[:=–—]?$/i.test(line) ||
      lower.startsWith('other ingredients:') ||
      lower.startsWith('добавки:')
    ) {
      currentSection = 'other';
      continue;
    }

    if (
      /^(?:yeasts?|дрожжи)[:=–—]?$/i.test(line) ||
      lower.startsWith('yeast:') ||
      lower.startsWith('дрожжи:')
    ) {
      currentSection = 'yeast';
      const inlineYeast = line.replace(/^(?:дрожжи|yeasts?)\s*[:=–—]\s*/i, '').trim();
      if (inlineYeast && inlineYeast.length > 2 && !inlineYeast.includes(':')) {
        yeastName = inlineYeast;
      }
      continue;
    }

    if (
      /^(?:mash|mash\s*guidelines|паузы|затирание)[:=–—]?$/i.test(line) ||
      lower.startsWith('mash guidelines:') ||
      lower.startsWith('затирание:')
    ) {
      currentSection = 'mash';
      continue;
    }

    const isIgnoredHeader =
      /^(?:priming|вода|water|water\s*requirements|water\s*notes|water\s*profile|target\s*water(?:\s*profile)?|water\s*chemistry|water\s*prep|stats|statistics|vital\s*statistics|notes|recipe\s*notes|brewer(?:\s*s)?\s*notes|brewday\s*notes|fermentation|fermentation\s*steps|fermentation\s*and\s*aging|packaging|bottling|kegging|equipment|profile|overview)[:=–—]?$/i.test(line) ||
      lower.startsWith('stats:') ||
      lower.startsWith('priming:') ||
      lower.startsWith('target water profile:') ||
      lower.startsWith('water requirements:') ||
      lower.startsWith('water notes:') ||
      lower.startsWith('water chemistry:') ||
      lower.startsWith('water:') ||
      lower.startsWith('notes:') ||
      lower.startsWith('brew day notes:') ||
      lower.startsWith('recipe notes:') ||
      lower.startsWith('fermentation:') ||
      lower.startsWith('fermentation steps:') ||
      lower.startsWith('packaging:') ||
      lower.startsWith('equipment:');

    if (isIgnoredHeader) {
      currentSection = 'ignored';
      continue;
    }

    // 2. Обработка Солодов
    if (currentSection === 'grains') {
      // Игнорируем строки параметров воды, объемов и общей статистики
      if (
        lower.startsWith('mash volume') ||
        lower.startsWith('boil volume') ||
        lower.startsWith('sparge') ||
        lower.startsWith('total water') ||
        lower.startsWith('efficiency') ||
        lower.includes('water requirements')
      ) {
        continue;
      }

      const grainWeight = parseGrainWeightKg(line);
      if (grainWeight && grainWeight > 0) {
        // Формат Brewer's Friend: 10.75 lb - Pale 2-Row (77%)
        let gName = line;
        const dashMatch = line.match(/[\d.,]+\s*(?:lb|lbs|kg|g|кг|гр|г|унц|oz)\s*[-–—:]\s*([^(,]+)/i);
        if (dashMatch) {
          gName = dashMatch[1].trim();
        } else {
          gName = line
            .replace(/([\d.,]+)\s*(?:кг|kgs?|грамм(?:ов|а)?|grams?|гр|г|g|фунт(?:ов|а)?|lbs?|унц(?:ий|ии|ия)?|oz|%)(?![а-яa-z0-9])/gi, '')
            .replace(/[:=–—\-•*]/g, ' ')
            .replace(/\([\d.,%\s]*\)/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        }

        if (!gName || gName.length < 2) gName = `Солод ${grains.length + 1}`;

        const gType = detectGrainType(gName);
        let potentialSg = 1.037;
        let colorEbc = 5.0;
        if (gType === 'caramel') { potentialSg = 1.035; colorEbc = 50.0; }
        else if (gType === 'roasted') { potentialSg = 1.025; colorEbc = 900.0; }
        else if (gType === 'wheat') { potentialSg = 1.038; colorEbc = 4.0; }
        else if (gType === 'adjunct') { potentialSg = 1.033; colorEbc = 3.0; }

        const colMatch = line.match(/([\d]+)\s*(?:L|EBC|srm)\b/i);
        if (colMatch) {
          colorEbc = parseFloat(colMatch[1]);
          if (line.toLowerCase().includes('l')) colorEbc = Number((colorEbc * 1.97).toFixed(1));
        }

        grains.push({
          id: `txt_g_${grains.length}_${Date.now()}`,
          name: gName,
          weightKg: Number(grainWeight.toFixed(2)),
          potentialSg,
          colorEbc,
          type: gType
        });
        continue;
      }
    }

    // 3. Обработка Хмелей
    if (currentSection === 'hops') {
      // Игнорируем добавки для водоподготовки, если они указаны в списке
      if (
        lower.includes('cacl2') ||
        lower.includes('calcium chloride') ||
        lower.includes('хлорид кальция') ||
        lower.includes('gypsum') ||
        lower.includes('гипс') ||
        lower.includes('epsom') ||
        lower.includes('lactic acid') ||
        lower.includes('молочная кислота') ||
        lower.includes('irish moss') ||
        lower.includes('ирландский мох') ||
        lower.includes('whirlfloc') ||
        lower.includes('вирфлок')
      ) {
        continue;
      }

      const hopWeight = parseHopWeightG(line);
      if (hopWeight && hopWeight > 0) {
        // Формат Brewer's Friend: 1.5 oz - Citra, Type: Pellet, AA: 12.6, Use: Whirlpool for 15 min at 170 &deg;F, IBU: 9.23
        let hName = '';
        const dashMatch = line.match(/[\d.,]+\s*(?:oz|g|г|гр|унц|kg|кг)\s*[-–—:]\s*([^,]+)/i);
        if (dashMatch) {
          hName = dashMatch[1].trim();
        } else {
          hName = line
            .replace(/Type\s*[:=]\s*[^,]+/gi, '')
            .replace(/AA\s*[:=]\s*[\d.,]+%?/gi, '')
            .replace(/Use\s*[:=]\s*[^,]+/gi, '')
            .replace(/IBU\s*[:=]\s*[\d.,]+/gi, '')
            .replace(/Time\s*[:=]\s*[^,]+/gi, '')
            .replace(/([\d.,]+)\s*(?:кг|kgs?|грамм(?:ов|а)?|grams?|гр|г|g|фунт(?:ов|а)?|lbs?|унц(?:ий|ии|ия)?|oz)(?![а-яa-z0-9])/gi, '')
            .replace(/([\d.,]+)\s*%\s*(?:а-к|alpha|aa)?(?![а-яa-z0-9])/gi, '')
            .replace(/([\d]+)\s*(?:минут(?:ы)?|мин|minutes?|mins?)(?![а-яa-z0-9])/gi, '')
            .replace(/[:=–—\-•*@]/g, ' ')
            .replace(/\([^)]*\)/g, '')
            .replace(/\b(?:кипятить|за|до\s*конца|варить|boil|dry\s*hop|хмель|hop)\b/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }

        if (!hName || hName.length < 2) hName = `Хмель ${hops.length + 1}`;

        let alphaAcid = 6.0;
        const aaMatch = line.match(/AA\s*[:=]\s*([\d.,]+)/i) ||
          line.match(/([\d.,]+)\s*%\s*(?:а-к|alpha|aa)?(?![а-яa-z0-9])/i) ||
          line.match(/(?:а-к|alpha|aa)\s*[:=]?\s*([\d.,]+)/i);
        if (aaMatch) {
          const aVal = parseFloat(aaMatch[1].replace(',', '.'));
          if (!isNaN(aVal) && aVal > 0 && aVal < 30) alphaAcid = aVal;
        }

        let timeMin = 60;
        const timeMatch = line.match(/for\s*([\d]+)\s*(?:минут(?:ы)?|мин|minutes?|mins?)/i) ||
          line.match(/([\d]+)\s*(?:минут(?:ы)?|мин|minutes?|mins?)(?![а-яa-z0-9])/i);
        if (timeMatch) {
          timeMin = parseInt(timeMatch[1], 10);
        } else if (/сухо|dry/i.test(line) || /days?/i.test(line)) {
          timeMin = 0;
        }

        let use: HopUse = 'boil';
        if (/dry\s*hop/i.test(line) || /сухое/i.test(line)) use = 'dry_hop';
        else if (/whirlpool/i.test(line) || /вирп/i.test(line)) use = 'whirlpool';
        else if (/aroma/i.test(line) || /аромат/i.test(line) || timeMin <= 15) use = 'aroma';

        hops.push({
          id: `txt_h_${hops.length}_${Date.now()}`,
          name: hName,
          weightG: Number(hopWeight.toFixed(1)),
          alphaAcid: Number(alphaAcid.toFixed(1)),
          boilTimeMin: timeMin,
          use
        });
        continue;
      }
    }

    // 4. Дополнительные ингредиенты (Other Ingredients)
    if (currentSection === 'other') {
      const miscMatch = line.match(/([\d.,]+)\s*(?:tsp|tbsp|g|г|гр|ml|мл|oz)\s*[-–—:]\s*([^,]+)/i);
      if (miscMatch) {
        const amtStr = miscMatch[1];
        const mName = miscMatch[2].trim();
        const numMatch = amtStr.match(/([\d.,]+)/);
        const amount = numMatch ? parseFloat(numMatch[1].replace(',', '.')) : 1;
        let unit: OtherIngredientItem['unit'] = 'g';
        if (/tsp|ч\.л/i.test(line)) unit = 'pcs';
        else if (/ml|мл/i.test(line)) unit = 'ml';

        let stage: OtherIngredientItem['stage'] = 'boil';
        if (/mash|затир/i.test(line)) stage = 'mash';
        else if (/primary|первич/i.test(line)) stage = 'primary';
        else if (/secondary|вторич/i.test(line)) stage = 'secondary';
        else if (/bottl|розлив/i.test(line)) stage = 'bottling';

        let type: OtherIngredientItem['type'] = 'other';
        if (/fining|осветл|moss/i.test(line)) type = 'fining';
        else if (/water|соли|gypsum|calcium|chloride/i.test(line)) type = 'water_agent';
        else if (/spice|спец/i.test(line)) type = 'spice';

        const timeVal = parseInt(line.match(/Time\s*[:=]\s*(\d+)/i)?.[1] || '15', 10);

        otherIngredients.push({
          id: `txt_misc_${otherIngredients.length}_${Date.now()}`,
          name: mName,
          amount,
          unit,
          stage,
          type,
          timeMinOrDays: timeVal
        });
        continue;
      }
    }

    // 5. Дрожжи (Yeast)
    if (currentSection === 'yeast') {
      if (!yeastName && line.length > 2 && !line.includes(':')) {
        yeastName = line;
      }
      const attMatch = line.match(/Attenuation[^:]*:\s*(\d+)%/i);
      if (attMatch) {
        yeastAttenuation = parseInt(attMatch[1], 10);
      }
      const fRangeMatch = line.match(/Optimum Temp[^:]*:\s*(\d+)\s*-\s*(\d+)\s*(?:F|°F)/i);
      if (fRangeMatch) {
        const t1 = Math.round((parseInt(fRangeMatch[1], 10) - 32) * 5 / 9);
        const t2 = Math.round((parseInt(fRangeMatch[2], 10) - 32) * 5 / 9);
        yeastTempRange = [t1, t2];
      }
      continue;
    }

    // 6. Паузы затирания (Mash Guidelines)
    if (currentSection === 'mash') {
      let tempC = 66;
      const fMatch = line.match(/Target Temp\s*[:=]\s*(\d+)\s*F/i) || line.match(/(\d+)\s*(?:°?F|fahrenheit|&deg;F)\b/i);
      const cMatch = line.match(/Target Temp\s*[:=]\s*(\d+)\s*C/i) || line.match(/(\d+)\s*(?:°?С|°?C|celsius)\b/i);
      if (fMatch) tempC = Math.round((parseInt(fMatch[1], 10) - 32) * 5 / 9);
      else if (cMatch) tempC = parseInt(cMatch[1], 10);

      const pauseTimeMatch = line.match(/Time\s*[:=]\s*(\d+)\s*min/i) ||
        line.match(/([\d]+)\s*(?:минут(?:ы)?|мин|minutes?|mins?)(?![а-яa-z0-9])/i);

      if (pauseTimeMatch && (fMatch || cMatch)) {
        const timeMin = parseInt(pauseTimeMatch[1], 10);
        let pName = 'Осахаривание';
        if (line.includes('Infusion')) pName = 'Infusion';
        else if (tempC < 55) pName = 'Белковая пауза';
        else if (tempC >= 55 && tempC <= 63) pName = 'Мальтозная пауза';
        else if (tempC > 63 && tempC <= 69) pName = 'Осахаривание';
        else if (tempC > 69 && tempC < 75) pName = 'Декстриновая пауза';
        else if (tempC >= 75) pName = 'Мэшаут';

        mashSchedule.push({
          id: `txt_m_${mashSchedule.length}_${Date.now()}`,
          name: pName,
          tempC,
          timeMin,
          type: tempC >= 75 ? 'mashout' : 'maltose'
        });
        continue;
      }
    }
  }

  // Если не удалось найти ингредиенты
  if (grains.length === 0 && hops.length === 0) {
    return null;
  }

  if (grains.length === 0) {
    grains.push({ id: 'g_def', name: 'Pale Ale Malt', weightKg: 4.5, potentialSg: 1.038, colorEbc: 6, type: 'base' });
  }
  if (hops.length === 0) {
    hops.push({ id: 'h_def', name: 'Cascade', weightG: 30, alphaAcid: 6.0, boilTimeMin: 60, use: 'boil' });
  }
  if (mashSchedule.length === 0) {
    mashSchedule.push(
      { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    );
  }

  const yeast: Yeast = {
    name: yeastName || 'SafAle US-05',
    lab: yeastName.split(/[-–—]/)[0]?.trim() || 'Fermentis',
    form: /liquid/i.test(rawText) ? 'liquid' : 'dry',
    type: /lager/i.test(yeastName) ? 'lager' : 'ale',
    cellsPerGramOrVial: /liquid/i.test(rawText) ? 100 : 20,
    attenuationPercent: yeastAttenuation,
    tempRange: yeastTempRange
  };

  const calculated = calculateBrewMetrics({
    batchSizeL,
    boilTimeMin,
    efficiencyPercent,
    grainRatioLPerKg: 3.5,
    grainTempC: 20,
    targetCarbonationVol: 2.4,
    beerTempAtBottlingC: 20,
    grains,
    hops,
    yeast
  });

  return {
    id: `txt_imp_${Date.now()}`,
    name,
    style,
    category: 'Крафт',
    description: sourceUrl ? `Загружено по ссылке: ${sourceUrl}` : `Импортировано из текста рецепта. Автор: ${author}`,
    author,
    batchSizeL,
    boilTimeMin,
    efficiencyPercent,
    grainRatioLPerKg: 3.5,
    grainTempC: 20,
    targetCarbonationVol: 2.4,
    beerTempAtBottlingC: 20,
    grains,
    hops,
    otherIngredients,
    mashSchedule,
    yeast,
    calculated,
    tags: ['Текстовый импорт', style].filter(Boolean),
    isCustom: true,
    collection: 'my_recipes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Вспомогательная функция разбиения CSV-строки с учетом кавычек
 */
function splitCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^["']|["']$/g, ''));
  return result;
}

/**
 * Определение основного разделителя CSV (запятая, точка с запятой, табуляция)
 */
function detectCsvDelimiter(content: string): string {
  const lines = content.split('\n').filter(l => l.trim().length > 0).slice(0, 10);
  let commaCount = 0;
  let semiCount = 0;
  let tabCount = 0;

  for (const line of lines) {
    commaCount += (line.match(/,/g) || []).length;
    semiCount += (line.match(/;/g) || []).length;
    tabCount += (line.match(/\t/g) || []).length;
  }

  if (tabCount > commaCount && tabCount > semiCount) return '\t';
  if (semiCount > commaCount) return ';';
  return ',';
}

/**
 * Парсер рецепта или таблицы ингредиентов из CSV / TSV файлов
 * Поддерживает форматы экспорта BeerSmith CSV, Grainfather CSV, Brewfather CSV и произвольные таблицы
 */
export function parseCsvRecipe(content: string, sourceUrl?: string): Recipe | null {
  if (!content || typeof content !== 'string' || content.trim().length === 0) return null;

  const delimiter = detectCsvDelimiter(content);
  const rawLines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (rawLines.length < 2) return null;

  const grains: GrainItem[] = [];
  const hops: HopItem[] = [];
  const mashSchedule: MashRest[] = [];
  let yeast: Yeast | null = null;
  let recipeName = 'Рецепт из CSV';
  let styleName = 'Пользовательский стиль';
  let batchSizeL = 25.0;
  let boilTimeMin = 60;
  let efficiencyPercent = 75.0;

  let currentSection: 'auto' | 'grains' | 'hops' | 'yeast' | 'mash' = 'auto';
  let headers: string[] = [];

  for (let lineIndex = 0; lineIndex < rawLines.length; lineIndex++) {
    const line = rawLines[lineIndex];
    const lower = line.toLowerCase();

    // Секционные заголовки [Fermentables], [Hops], [Yeast], # Grains и т.п.
    if (/^\[?(?:fermentables?|grains?|солод|зерно|засыпь)\]?$/i.test(line) || lower.includes('[fermentables]')) {
      currentSection = 'grains';
      headers = [];
      continue;
    }
    if (/^\[?(?:hops?|хмель)\]?$/i.test(line) || lower.includes('[hops]')) {
      currentSection = 'hops';
      headers = [];
      continue;
    }
    if (/^\[?(?:yeasts?|дрожжи)\]?$/i.test(line) || lower.includes('[yeasts]') || lower.includes('[yeast]')) {
      currentSection = 'yeast';
      headers = [];
      continue;
    }
    if (/^\[?(?:mash|паузы|затирание)\]?$/i.test(line)) {
      currentSection = 'mash';
      headers = [];
      continue;
    }

    // Проверяем метаданные рецепта в первых строках
    if (lower.startsWith('recipe,') || lower.startsWith('name,') || lower.startsWith('название,') || lower.startsWith('рецепт,')) {
      const parts = splitCsvLine(line, delimiter);
      if (parts[1]) recipeName = parts[1];
      continue;
    }
    if (lower.startsWith('style,') || lower.startsWith('стиль,')) {
      const parts = splitCsvLine(line, delimiter);
      if (parts[1]) styleName = parts[1];
      continue;
    }
    if (lower.startsWith('batch size') || lower.startsWith('объем') || lower.startsWith('объём')) {
      const parts = splitCsvLine(line, delimiter);
      const v = parseGrainWeightKg(parts[1] || '') || parseFloat((parts[1] || '').replace(',', '.'));
      if (v && v > 0) batchSizeL = v;
      continue;
    }

    const cells = splitCsvLine(line, delimiter);
    if (cells.length < 2) continue;

    // Проверяем, является ли строка заголовком таблицы
    const isHeaderRow = cells.some(c => {
      const cl = c.toLowerCase();
      return (
        cl.includes('name') || cl.includes('наименование') || cl.includes('название') ||
        cl.includes('солод') || cl.includes('хмель') || cl.includes('amount') ||
        cl.includes('вес') || cl.includes('кол-во') || cl.includes('количество') ||
        cl.includes('alpha') || cl.includes('альфа') || cl.includes('ebc') || cl.includes('цвет')
      );
    });

    if (isHeaderRow) {
      headers = cells.map(c => c.toLowerCase().trim());
      // Если в заголовке четко написано солод или хмель, настраиваем секцию
      if (headers.some(h => h.includes('солод') || h.includes('grain') || h.includes('fermentable'))) {
        currentSection = 'grains';
      } else if (headers.some(h => h.includes('хмель') || h.includes('hop') || h.includes('alpha') || h.includes('альфа'))) {
        currentSection = 'hops';
      }
      continue;
    }

    // Поиск индексов по заголовкам, если они есть
    let nameIdx = -1;
    let amountIdx = -1;
    let unitIdx = -1;
    let typeIdx = -1;
    let colorIdx = -1;
    let alphaIdx = -1;
    let timeIdx = -1;
    let useIdx = -1;

    if (headers.length > 0) {
      nameIdx = headers.findIndex(h => h.includes('name') || h.includes('название') || h.includes('наименование') || h.includes('солод') || h.includes('хмель'));
      amountIdx = headers.findIndex(h => h.includes('amount') || h.includes('weight') || h.includes('вес') || h.includes('кол-во') || h.includes('количество'));
      unitIdx = headers.findIndex(h => h.includes('unit') || h.includes('ед'));
      typeIdx = headers.findIndex(h => h.includes('type') || h.includes('тип') || h.includes('category') || h.includes('категория'));
      colorIdx = headers.findIndex(h => h.includes('color') || h.includes('ebc') || h.includes('srm') || h.includes('цвет'));
      alphaIdx = headers.findIndex(h => h.includes('alpha') || h.includes('альфа') || h.includes('aa'));
      timeIdx = headers.findIndex(h => h.includes('time') || h.includes('время') || h.includes('boil time') || h.includes('мин'));
      useIdx = headers.findIndex(h => h.includes('use') || h.includes('внесение') || h.includes('назначение') || h.includes('стадия'));
    }

    // Если заголовков нет или не найдены, используем эвристический поиск
    if (nameIdx === -1) nameIdx = 0;
    if (amountIdx === -1 && cells.length > 1) {
      for (let i = 1; i < cells.length; i++) {
        if (/[\d.,]+/.test(cells[i])) {
          amountIdx = i;
          break;
        }
      }
    }

    const rowName = cells[nameIdx]?.trim() || '';
    if (!rowName || rowName.length < 2) continue;

    const rowTypeStr = (typeIdx !== -1 ? cells[typeIdx] : '').toLowerCase();
    const rowAmountStr = (amountIdx !== -1 ? cells[amountIdx] : '') + ' ' + (unitIdx !== -1 ? cells[unitIdx] : '');
    const rowColorStr = colorIdx !== -1 ? cells[colorIdx] : '';
    const rowAlphaStr = alphaIdx !== -1 ? cells[alphaIdx] : '';
    const rowTimeStr = timeIdx !== -1 ? cells[timeIdx] : '';
    const rowUseStr = useIdx !== -1 ? cells[useIdx] : '';

    // Определяем тип ингредиента
    const hasGrainKeyword = /(?:солод|malt|pils|pale|caramel|cara|crystal|кристалл|wheat|пшенич|munich|мюнхен|vienna|венск|ячмен|flaked|хлопь|roast|жжен|choc|шоколад|black|acid|кисл)/i.test(rowName);
    const hasHopKeyword = /(?:хмель|hop|saaz|cascade|citra|mosaic|magnum|жатец|perle|chinook|simcoe|amarillo|centennial|nugget|fuggles?|goldings?|warrior|columbus|tomahawk|zeus)/i.test(rowName);
    const hasYeastKeyword = /(?:yeast|дрожжи|safale|us-05|s-04|wb-06|w-34\/70|nottingham|fermentis|lallemand|mangrove|danstar)/i.test(rowName);

    const isTypeGrain = rowTypeStr.includes('grain') || rowTypeStr.includes('солод') || rowTypeStr.includes('fermentable');
    const isTypeHop = rowTypeStr.includes('hop') || rowTypeStr.includes('хмель');
    const isTypeYeast = rowTypeStr.includes('yeast') || rowTypeStr.includes('дрожжи');

    const hasHopParams = Boolean((rowAlphaStr && parseFloat(rowAlphaStr.replace(',', '.')) > 0) || (rowTimeStr && parseInt(rowTimeStr, 10) >= 0));

    const isExplicitGrain =
      isTypeGrain ||
      (!isTypeHop && !isTypeYeast && (currentSection === 'grains' || (hasGrainKeyword && !hasHopKeyword)));

    const isExplicitHop =
      isTypeHop ||
      (!isTypeGrain && !isTypeYeast && (currentSection === 'hops' || hasHopKeyword || (hasHopParams && !hasGrainKeyword)));

    const isExplicitYeast =
      isTypeYeast ||
      (!isTypeGrain && !isTypeHop && (currentSection === 'yeast' || hasYeastKeyword));


    if (isExplicitGrain && !isExplicitHop && !isExplicitYeast) {
      let weightKg = parseGrainWeightKg(rowAmountStr);
      if (!weightKg && amountIdx !== -1) {
        const val = parseFloat(cells[amountIdx].replace(',', '.'));
        if (!isNaN(val) && val > 0) {
          weightKg = val > 25 ? val / 1000 : val;
        }
      }
      if (!weightKg || weightKg <= 0) weightKg = 1.0;

      const gType = detectGrainType(rowName);
      let colorEbc = 5.0;
      if (rowColorStr) {
        const cVal = parseFloat(rowColorStr.replace(',', '.'));
        if (!isNaN(cVal) && cVal > 0) colorEbc = cVal;
      } else {
        if (gType === 'caramel') colorEbc = 50.0;
        else if (gType === 'roasted') colorEbc = 900.0;
      }

      grains.push({
        id: `csv_g_${grains.length}_${Date.now()}`,
        name: rowName,
        weightKg: Number(weightKg.toFixed(2)),
        potentialSg: gType === 'roasted' ? 1.025 : gType === 'caramel' ? 1.035 : 1.037,
        colorEbc: Number(colorEbc.toFixed(1)),
        type: gType
      });
      continue;
    }

    if (isExplicitHop && !isExplicitYeast) {
      let weightG = parseHopWeightG(rowAmountStr);
      if (!weightG && amountIdx !== -1) {
        const val = parseFloat(cells[amountIdx].replace(',', '.'));
        if (!isNaN(val) && val > 0) {
          weightG = val < 1.0 ? val * 1000 : val;
        }
      }
      if (!weightG || weightG <= 0) weightG = 25.0;

      let alphaAcid = 6.0;
      if (rowAlphaStr) {
        const aVal = parseFloat(rowAlphaStr.replace(',', '.'));
        if (!isNaN(aVal) && aVal > 0 && aVal < 30) alphaAcid = aVal;
      }

      let timeMin = 60;
      if (rowTimeStr) {
        const tVal = parseInt(rowTimeStr, 10);
        if (!isNaN(tVal) && tVal >= 0) timeMin = tVal;
      }

      hops.push({
        id: `csv_h_${hops.length}_${Date.now()}`,
        name: rowName,
        weightG: Number(weightG.toFixed(1)),
        alphaAcid: Number(alphaAcid.toFixed(1)),
        boilTimeMin: timeMin,
        use: detectHopUse(rowUseStr || rowName, timeMin)
      });
      continue;
    }

    if (isExplicitYeast) {
      yeast = {
        name: rowName,
        lab: cells[1] || 'Производитель',
        form: 'dry',
        type: rowName.toLowerCase().includes('lager') || rowName.toLowerCase().includes('34/70') ? 'lager' : 'ale',
        cellsPerGramOrVial: 20,
        attenuationPercent: 78,
        tempRange: [18, 24]
      };
      continue;
    }
  }

  // Если не найдено ни одного ингредиента, возвращаем null
  if (grains.length === 0 && hops.length === 0) {
    return null;
  }

  // Если солода нет, но есть хмели, добавим базовый солод по умолчанию для расчета
  if (grains.length === 0) {
    grains.push({
      id: `csv_g_def_${Date.now()}`,
      name: 'Базовый солод (Pilsner / Pale Ale)',
      weightKg: 5.0,
      potentialSg: 1.037,
      colorEbc: 5.0,
      type: 'base'
    });
  }

  if (!yeast) {
    yeast = {
      name: 'Универсальные дрожжи (SafAle US-05)',
      lab: 'Fermentis',
      form: 'dry',
      type: 'ale',
      cellsPerGramOrVial: 20,
      attenuationPercent: 80,
      tempRange: [18, 24]
    };
  }

  if (mashSchedule.length === 0) {
    mashSchedule.push(
      { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    );
  }

  const calculated = calculateBrewMetrics({
    batchSizeL,
    boilTimeMin,
    efficiencyPercent,
    grainRatioLPerKg: 3.5,
    grainTempC: 20,
    targetCarbonationVol: 2.4,
    beerTempAtBottlingC: 20,
    grains,
    hops,
    yeast
  });

  return {
    id: `csv_recipe_${Date.now()}`,
    name: recipeName,
    style: styleName,
    category: 'Импортированные рецепты',
    description: sourceUrl ? `Загружено по ссылке: ${sourceUrl}` : 'Импортировано из CSV файла ингредиентов',
    author: 'Импорт из CSV',
    batchSizeL,
    boilTimeMin,
    efficiencyPercent,
    grainRatioLPerKg: 3.5,
    grainTempC: 20,
    targetCarbonationVol: 2.4,
    beerTempAtBottlingC: 20,
    grains,
    hops,
    mashSchedule,
    yeast,
    calculated,
    tags: ['CSV Импорт', styleName].filter(Boolean),
    isCustom: true,
    collection: 'my_recipes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Результат комплексного распознавания файла любого типа
 */
export interface FileParseResult {
  success: boolean;
  formatDetected: 'BeerXML' | 'BeerSmith (.bsmx)' | 'Brewfather / BeerJSON' | 'CSV' | 'Текстовый рецепт' | 'Бир.РФ' | "HTML (Brewer's Friend)" | 'Неизвестно';
  recipe: Recipe | null;
  grains: GrainItem[];
  hops: HopItem[];
  yeast: Yeast | null;
  mashSchedule: MashRest[];
  error?: string;
  itemSummary: {
    grainCount: number;
    totalGrainKg: number;
    hopCount: number;
    totalHopG: number;
    hasYeast: boolean;
    mashStepCount: number;
  };
}

/**
 * Проверка формата и универсальное извлечение ингредиентов из файла (.xml, .beerxml, .csv, .txt, .bsmx, .json)
 * Возвращает структурированный результат с возможностью добавления в текущий рецепт или полной замены
 */
export function extractIngredientsFromFile(content: string, filename?: string): FileParseResult {
  const emptySummary = {
    grainCount: 0,
    totalGrainKg: 0,
    hopCount: 0,
    totalHopG: 0,
    hasYeast: false,
    mashStepCount: 0
  };

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return {
      success: false,
      formatDetected: 'Неизвестно',
      recipe: null,
      grains: [],
      hops: [],
      yeast: null,
      mashSchedule: [],
      error: 'Файл пуст или не содержит читаемого текста.',
      itemSummary: emptySummary
    };
  }

  const trimmed = content.trim();
  let recipe: Recipe | null = null;
  let formatDetected: FileParseResult['formatDetected'] = 'Неизвестно';

  const isHtml =
    trimmed.toLowerCase().startsWith('<!doctype html') ||
    trimmed.toLowerCase().startsWith('<html') ||
    (trimmed.includes('<body') && trimmed.includes('<table')) ||
    (trimmed.includes('<table') && (trimmed.includes('Fermentables') || trimmed.includes('Hops') || trimmed.includes('Yeast') || trimmed.includes('Солод')));

  // 1. HTML рецепт (Brewer's Friend, форумы, веб-страницы)
  if (isHtml) {
    try {
      recipe = parseHtmlRecipe(trimmed, filename);
      if (recipe) formatDetected = "HTML (Brewer's Friend)";
    } catch {}
  }

  // 2. BeerXML (только если это не HTML)
  if (
    !recipe &&
    !isHtml &&
    (trimmed.toLowerCase().includes('<recipe') ||
     trimmed.toLowerCase().includes('<recipes') ||
     (filename && (filename.toLowerCase().endsWith('.xml') || filename.toLowerCase().endsWith('.beerxml')) && !trimmed.toLowerCase().includes('<html')))
  ) {
    try {
      recipe = importFromBeerXml(trimmed);
      if (recipe) {
        formatDetected = 'BeerXML';
      } else {
        const match = trimmed.match(/<RECIPES[\s\S]*?<\/RECIPES>/i) || trimmed.match(/<RECIPE[\s\S]*?<\/RECIPE>/i);
        if (match) {
          const xmlPayload = match[0].toUpperCase().startsWith('<RECIPES')
            ? match[0]
            : `<?xml version="1.0" encoding="UTF-8"?><RECIPES>${match[0]}</RECIPES>`;
          recipe = importFromBeerXml(xmlPayload);
          if (recipe) formatDetected = 'BeerXML';
        }
      }
    } catch {}
  }

  // 3. BeerSmith BSMX
  if (!recipe && (trimmed.includes('<F_R_NAME>') || trimmed.includes('<F_R_BATCH_SIZE>') || (filename && filename.toLowerCase().endsWith('.bsmx')))) {
    try {
      recipe = parseBsmxFormat(trimmed);
      if (recipe) formatDetected = 'BeerSmith (.bsmx)';
    } catch {}
  }

  // 4. JSON (Brewfather, BeerJSON)
  if (!recipe && (trimmed.startsWith('{') || trimmed.startsWith('[') || (filename && filename.toLowerCase().endsWith('.json')))) {
    try {
      recipe = parseBrewingJson(trimmed);
      if (recipe) formatDetected = 'Brewfather / BeerJSON';
    } catch {}
  }

  // 5. Бир.РФ разбор
  if (!recipe && (trimmed.includes('xn--90aoy.xn--p1ai') || trimmed.includes('бир.рф'))) {
    try {
      recipe = parseBirRfRecipe(trimmed);
      if (recipe) formatDetected = 'Бир.РФ';
    } catch {}
  }

  // 6. Свободный текст (.txt, заметки, Brewer's Friend Text)
  // Проверяем ДО CSV, чтобы текст с запятыми не ломался в CSV-парсере
  if (!recipe && (!filename || !filename.toLowerCase().endsWith('.csv'))) {
    try {
      recipe = parsePlainTextRecipe(trimmed);
      if (recipe && (recipe.grains.length > 0 || recipe.hops.length > 0)) {
        formatDetected = 'Текстовый рецепт';
      }
    } catch {}
  }

  // 7. CSV / TSV (только если расширение явное, либо если в тексте разделители ; или табуляция)
  if (!recipe && (filename?.toLowerCase().endsWith('.csv') || filename?.toLowerCase().endsWith('.tsv') || trimmed.includes(';') || trimmed.includes('\t'))) {
    try {
      recipe = parseCsvRecipe(trimmed);
      if (recipe && (recipe.grains.length > 0 || recipe.hops.length > 0)) {
        formatDetected = 'CSV';
      }
    } catch {}
  }

  // Если и после этого рецепт не найден, пробуем parseCsvRecipe принудительно как последний шанс
  if (!recipe) {
    try {
      recipe = parseCsvRecipe(trimmed);
      if (recipe && (recipe.grains.length > 0 || recipe.hops.length > 0)) {
        formatDetected = 'CSV';
      }
    } catch {}
  }

  if (!recipe || (recipe.grains.length === 0 && recipe.hops.length === 0)) {
    const fnDisplay = filename ? `«${filename}»` : 'загруженный файл';
    return {
      success: false,
      formatDetected: 'Неизвестно',
      recipe: null,
      grains: [],
      hops: [],
      yeast: null,
      mashSchedule: [],
      error: `Не удалось распознать пивоваренный рецепт или ингредиенты в файле ${fnDisplay}.\n\nПоддерживаемые форматы:\n• BeerXML (.xml, .beerxml)\n• HTML / экспорт Brewer's Friend (.html, .xml)\n• Текстовые рецепты (.txt) с указанием солодов и хмелей\n• Таблицы ингредиентов CSV / TSV (.csv)\n• BeerSmith (.bsmx)\n• Brewfather / BeerJSON (.json)`,
      itemSummary: emptySummary
    };
  }

  const grains = recipe.grains || [];
  const hops = recipe.hops || [];
  const totalGrainKg = Number(grains.reduce((sum, g) => sum + (g.weightKg || 0), 0).toFixed(2));
  const totalHopG = Number(hops.reduce((sum, h) => sum + (h.weightG || 0), 0).toFixed(1));

  return {
    success: true,
    formatDetected,
    recipe,
    grains,
    hops,
    yeast: recipe.yeast || null,
    mashSchedule: recipe.mashSchedule || [],
    itemSummary: {
      grainCount: grains.length,
      totalGrainKg,
      hopCount: hops.length,
      totalHopG,
      hasYeast: Boolean(recipe.yeast && recipe.yeast.name),
      mashStepCount: recipe.mashSchedule?.length || 0
    }
  };
}

/**
 * Единый мастер-парсер любого содержимого рецепта из интернета или файлов:
 * 1. HTML рецепты (Brewer's Friend, веб-страницы)
 * 2. BeerXML (любой регистр тегов, фрагменты)
 * 3. BeerSmith XML (.bsmx)
 * 4. JSON (Brewfather, BeerJSON, Brewer's Friend, плоский JSON)
 * 5. Бир.РФ (специализированный разбор)
 * 6. Свободный текст рецепта (форумы, блоги, таблицы, русский и английский языки)
 * 7. CSV / TSV таблицы ингредиентов
 */
export function parseUniversalRecipe(content: string, sourceUrl?: string): Recipe | null {
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return null;
  }

  const trimmed = content.trim();

  // 1. Попытка парсинга как HTML рецепт
  const isHtml =
    trimmed.toLowerCase().startsWith('<!doctype html') ||
    trimmed.toLowerCase().startsWith('<html') ||
    (trimmed.includes('<body') && trimmed.includes('<table')) ||
    (trimmed.includes('<table') && (trimmed.includes('Fermentables') || trimmed.includes('Hops') || trimmed.includes('Yeast') || trimmed.includes('Солод')));

  if (isHtml) {
    const htmlRecipe = parseHtmlRecipe(trimmed, sourceUrl);
    if (htmlRecipe) return htmlRecipe;
  }

  // 2. Попытка парсинга как BeerXML
  if (
    !isHtml &&
    (trimmed.toLowerCase().includes('<recipe') ||
     trimmed.toLowerCase().includes('<recipes') ||
     trimmed.startsWith('<?xml'))
  ) {
    const directXml = importFromBeerXml(trimmed);
    if (directXml) return directXml;

    const match = trimmed.match(/<RECIPES[\s\S]*?<\/RECIPES>/i) || trimmed.match(/<RECIPE[\s\S]*?<\/RECIPE>/i);
    if (match) {
      const xmlPayload = match[0].toUpperCase().startsWith('<RECIPES')
        ? match[0]
        : `<?xml version="1.0" encoding="UTF-8"?><RECIPES>${match[0]}</RECIPES>`;
      const embeddedXml = importFromBeerXml(xmlPayload);
      if (embeddedXml) return embeddedXml;
    }
  }

  // 3. Попытка парсинга как BeerSmith XML (.bsmx)
  if (trimmed.includes('<F_R_NAME>') || trimmed.includes('<F_R_BATCH_SIZE>') || (trimmed.includes('<Grain>') && trimmed.includes('<F_G_NAME>'))) {
    const bsmx = parseBsmxFormat(trimmed);
    if (bsmx) return bsmx;
  }

  // 4. Попытка парсинга как JSON (Brewfather, BeerJSON, прямой экспорт)
  if (trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.includes('"recipe"') || trimmed.includes('"fermentables"')) {
    const jsonRecipe = parseBrewingJson(trimmed, sourceUrl);
    if (jsonRecipe) return jsonRecipe;
  }

  // 5. Попытка парсинга страницы Бир.РФ (xn--90aoy.xn--p1ai)
  try {
    const birRecipe = parseBirRfRecipe(trimmed, sourceUrl);
    if (birRecipe) return birRecipe;
  } catch {}

  // 6. Универсальный парсинг свободного текста рецепта
  try {
    const plainRecipe = parsePlainTextRecipe(trimmed, sourceUrl);
    if (plainRecipe && (plainRecipe.grains.length > 0 || plainRecipe.hops.length > 0)) {
      return plainRecipe;
    }
  } catch {}

  // 7. Попытка парсинга как CSV / TSV
  if (trimmed.includes(';') || trimmed.includes('\t')) {
    try {
      const csvRecipe = parseCsvRecipe(trimmed, sourceUrl);
      if (csvRecipe && (csvRecipe.grains.length > 0 || csvRecipe.hops.length > 0)) {
        return csvRecipe;
      }
    } catch {}
  }

  return null;
}

