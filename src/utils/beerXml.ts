import { GrainItem, HopItem, MashRest, OtherIngredientItem, Recipe, Yeast } from '../types/brewing';
import { calculateBrewMetrics } from './brewingMath';
import {
  validateRecipeWithZod,
  RawBeerXmlNodeSchema
} from '../schemas/beerXmlSchema';

export { validateRecipeWithZod } from '../schemas/beerXmlSchema';

export interface BeerXmlValidationResult {
  success: boolean;
  recipe: Recipe | null;
  errors?: string[];
}

/**
 * Экспорт рецепта в стандартный формат BeerXML 1.0
 */
export function exportToBeerXml(recipe: Recipe): string {
  const grainNodes = recipe.grains.map(g => `
    <FERMENTABLE>
      <NAME>${escapeXml(g.name)}</NAME>
      <VERSION>1</VERSION>
      <TYPE>${g.type === 'wheat' ? 'Grain' : g.type === 'adjunct' ? 'Adjunct' : 'Grain'}</TYPE>
      <AMOUNT>${g.weightKg.toFixed(3)}</AMOUNT>
      <YIELD>${((g.potentialSg - 1.0) / 0.046 * 100).toFixed(1)}</YIELD>
      <COLOR>${(g.colorEbc / 1.97).toFixed(1)}</COLOR>
    </FERMENTABLE>`).join('');

  const hopNodes = recipe.hops.map(h => `
    <HOP>
      <NAME>${escapeXml(h.name)}</NAME>
      <VERSION>1</VERSION>
      <ALPHA>${h.alphaAcid.toFixed(1)}</ALPHA>
      <AMOUNT>${(h.weightG / 1000).toFixed(4)}</AMOUNT>
      <USE>${h.use === 'dry_hop' ? 'Dry Hop' : h.use === 'whirlpool' ? 'Aroma' : 'Boil'}</USE>
      <TIME>${h.boilTimeMin}</TIME>
    </HOP>`).join('');

  const mashSteps = recipe.mashSchedule.map((step, idx) => `
      <MASH_STEP>
        <NAME>${escapeXml(step.name)}</NAME>
        <VERSION>1</VERSION>
        <TYPE>Temperature</TYPE>
        <STEP_TEMP>${step.tempC}</STEP_TEMP>
        <STEP_TIME>${step.timeMin}</STEP_TIME>
        <RAMP_TIME>2</RAMP_TIME>
        <END_TEMP>${step.tempC}</END_TEMP>
      </MASH_STEP>`).join('');

  const miscNodes = (recipe.otherIngredients || []).map(m => `
      <MISC>
        <NAME>${escapeXml(m.name)}</NAME>
        <VERSION>1</VERSION>
        <TYPE>${m.type === 'fining' ? 'Fining' : m.type === 'spice' ? 'Spice' : m.type === 'water_agent' ? 'Water Agent' : m.type === 'herb' ? 'Herb' : m.type === 'flavor' ? 'Flavor' : 'Other'}</TYPE>
        <USE>${m.stage === 'mash' ? 'Mash' : m.stage === 'primary' ? 'Primary' : m.stage === 'secondary' ? 'Secondary' : m.stage === 'bottling' ? 'Bottling' : 'Boil'}</USE>
        <TIME>${m.timeMinOrDays || 10}</TIME>
        <AMOUNT>${m.unit === 'g' || m.unit === 'ml' ? (m.amount / 1000).toFixed(4) : m.amount.toFixed(4)}</AMOUNT>
        <AMOUNT_IS_WEIGHT>${m.unit === 'ml' ? 'FALSE' : 'TRUE'}</AMOUNT_IS_WEIGHT>
        <NOTES>${escapeXml(m.notes || '')}</NOTES>
      </MISC>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<RECIPES>
  <RECIPE>
    <NAME>${escapeXml(recipe.name)}</NAME>
    <VERSION>1</VERSION>
    <TYPE>All Grain</TYPE>
    <STYLE>
      <NAME>${escapeXml(recipe.style)}</NAME>
      <CATEGORY>${escapeXml(recipe.category)}</CATEGORY>
      <VERSION>1</VERSION>
      <CATEGORY_NUMBER>1</CATEGORY_NUMBER>
      <STYLE_LETTER>A</STYLE_LETTER>
      <STYLE_GUIDE>BJCP 2021</STYLE_GUIDE>
      <TYPE>Ale</TYPE>
    </STYLE>
    <BREWER>${escapeXml(recipe.author || 'Homebrewer')}</BREWER>
    <BATCH_SIZE>${recipe.batchSizeL.toFixed(1)}</BATCH_SIZE>
    <BOIL_SIZE>${(recipe.batchSizeL * 1.15).toFixed(1)}</BOIL_SIZE>
    <BOIL_TIME>${recipe.boilTimeMin}</BOIL_TIME>
    <EFFICIENCY>${recipe.efficiencyPercent}</EFFICIENCY>
    <EST_OG>${recipe.calculated.ogSg.toFixed(3)}</EST_OG>
    <EST_FG>${recipe.calculated.fgSg.toFixed(3)}</EST_FG>
    <EST_ABV>${recipe.calculated.abv.toFixed(1)}</EST_ABV>
    <IBU>${recipe.calculated.ibu}</IBU>
    <EST_COLOR>${(recipe.calculated.ebc / 1.97).toFixed(1)}</EST_COLOR>
    <FERMENTABLES>${grainNodes}
    </FERMENTABLES>
    <HOPS>${hopNodes}
    </HOPS>
    <MISCS>${miscNodes}
    </MISCS>
    <YEASTS>
      <YEAST>
        <NAME>${escapeXml(recipe.yeast.name)}</NAME>
        <VERSION>1</VERSION>
        <TYPE>${recipe.yeast.type === 'lager' ? 'Lager' : 'Ale'}</TYPE>
        <FORM>${recipe.yeast.form === 'liquid' ? 'Liquid' : 'Dry'}</FORM>
        <LABORATORY>${escapeXml(recipe.yeast.lab)}</LABORATORY>
        <ATTENUATION>${recipe.yeast.attenuationPercent}</ATTENUATION>
      </YEAST>
    </YEASTS>
    <MASH>
      <NAME>Standard Infusion</NAME>
      <VERSION>1</VERSION>
      <GRAIN_TEMP>${recipe.grainTempC}</GRAIN_TEMP>
      <MASH_STEPS>${mashSteps}
      </MASH_STEPS>
    </MASH>
    <NOTES>${escapeXml(recipe.description || '')}</NOTES>
  </RECIPE>
</RECIPES>`;
}

function findFirstEl(parent: any, tagName: string): any {
  if (!parent) return null;
  const upper = tagName.toUpperCase();
  const lower = tagName.toLowerCase();

  for (const name of [tagName, upper, lower]) {
    if (typeof parent.querySelector === 'function') {
      try {
        const found = parent.querySelector(name);
        if (found) return found;
      } catch (e) {}
    }
    if (typeof parent.getElementsByTagName === 'function') {
      const list = parent.getElementsByTagName(name);
      if (list && list.length > 0) return list[0];
    }
  }

  // Fallback: iterate over all descendants case-insensitively
  if (typeof parent.getElementsByTagName === 'function') {
    const all = parent.getElementsByTagName('*');
    for (let i = 0; i < all.length; i++) {
      const el = all[i];
      const nodeName = el.nodeName || el.localName || el.tagName || '';
      if (nodeName.toUpperCase() === upper) return el;
    }
  }

  // Fallback: iterate over direct child nodes
  if (parent.childNodes) {
    for (let i = 0; i < parent.childNodes.length; i++) {
      const child = parent.childNodes[i];
      const nodeName = child.nodeName || child.localName || child.tagName || '';
      if (nodeName.toUpperCase() === upper) return child;
    }
  }

  return null;
}

function findAllEls(parent: any, tagName: string): any[] {
  if (!parent) return [];
  const upper = tagName.toUpperCase();
  const lower = tagName.toLowerCase();
  const results: any[] = [];
  const seen = new Set<any>();

  for (const name of [tagName, upper, lower]) {
    if (typeof parent.querySelectorAll === 'function') {
      try {
        const list = parent.querySelectorAll(name);
        for (let i = 0; i < list.length; i++) {
          if (!seen.has(list[i])) {
            seen.add(list[i]);
            results.push(list[i]);
          }
        }
      } catch (e) {}
    }
    if (typeof parent.getElementsByTagName === 'function') {
      const list = parent.getElementsByTagName(name);
      for (let i = 0; i < list.length; i++) {
        if (!seen.has(list[i])) {
          seen.add(list[i]);
          results.push(list[i]);
        }
      }
    }
  }

  if (results.length > 0) return results;

  // Fallback: iterate over all descendants case-insensitively
  if (typeof parent.getElementsByTagName === 'function') {
    const all = parent.getElementsByTagName('*');
    for (let i = 0; i < all.length; i++) {
      const el = all[i];
      const nodeName = el.nodeName || el.localName || el.tagName || '';
      if (nodeName.toUpperCase() === upper && !seen.has(el)) {
        seen.add(el);
        results.push(el);
      }
    }
  }

  return results;
}

function getElText(parent: any, tagName: string): string | null {
  const el = findFirstEl(parent, tagName);
  return el ? el.textContent?.trim() || null : null;
}

function createDomParserInstance(): any {
  if (typeof DOMParser !== 'undefined') {
    return new DOMParser();
  }
  if (typeof (globalThis as any).DOMParser !== 'undefined') {
    return new (globalThis as any).DOMParser();
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { DOMParser: XmldomParser } = require('@xmldom/xmldom');
    return new XmldomParser();
  } catch {
    return null;
  }
}

/**
 * Расширенный импорт рецепта из BeerXML 1.0 со строгой Zod-валидацией
 */
export function importFromBeerXmlWithValidation(xmlString: string): BeerXmlValidationResult {
  try {
    if (!xmlString || typeof xmlString !== 'string') {
      return { success: false, recipe: null, errors: ['Пустая строка XML'] };
    }

    const trimmed = xmlString.trim();
    if (trimmed.toLowerCase().startsWith('<!doctype html') || trimmed.toLowerCase().startsWith('<html')) {
      return {
        success: false,
        recipe: null,
        errors: ['Содержимое является HTML-страницей, а не стандартом BeerXML']
      };
    }

    // Pre-sanitize XML to prevent DOMParser parsererror from HTML entities or naked ampersands
    const sanitizedXml = trimmed
      .replace(/&deg;/gi, '°')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&copy;/gi, '©')
      .replace(/&trade;/gi, '™')
      .replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');

    const parser = createDomParserInstance();
    let xmlDoc: any = null;
    let parserError: any = null;

    if (parser) {
      try {
        xmlDoc = parser.parseFromString(sanitizedXml, 'text/xml');
        parserError = findFirstEl(xmlDoc, 'parsererror');
      } catch (e) {
        xmlDoc = null;
      }
    }

    let recipeEl = xmlDoc && !parserError ? findFirstEl(xmlDoc, 'RECIPE') : null;

    // Если DOMParser не сработал или вернул ошибку синтаксиса, используем Regex-парсер BeerXML
    if (!recipeEl) {
      const regexResult = parseBeerXmlViaRegex(sanitizedXml);
      if (regexResult) {
        return { success: true, recipe: regexResult };
      }
      if (parserError) {
        return {
          success: false,
          recipe: null,
          errors: [`Синтаксическая ошибка XML: ${parserError.textContent?.slice(0, 150) || 'Неверная разметка'}`]
        };
      }
      return {
        success: false,
        recipe: null,
        errors: ['В XML документе не найден обязательный корневой узел <RECIPE>']
      };
    }

    const rawFermentables = findAllEls(recipeEl, 'FERMENTABLE');
    const rawHops = findAllEls(recipeEl, 'HOP');
    if (rawFermentables.length === 0 && rawHops.length === 0) {
      return {
        success: false,
        recipe: null,
        errors: ['Некорректный BeerXML: в рецепте отсутствуют сбраживаемые ингредиенты (<FERMENTABLES>) и хмель (<HOPS>)']
      };
    }

    const rawName = getElText(recipeEl, 'NAME') || '';
    const rawBatchSize = parseFloat(getElText(recipeEl, 'BATCH_SIZE') || '0');
    const rawBoilTime = parseInt(getElText(recipeEl, 'BOIL_TIME') || '60', 10);
    const rawEfficiency = parseFloat(getElText(recipeEl, 'EFFICIENCY') || '72.0');

    // Zod-проверка узловых данных
    const rawNodeValidation = RawBeerXmlNodeSchema.safeParse({
      name: rawName || 'Импортированный рецепт',
      batchSizeL: rawBatchSize > 0 ? rawBatchSize : 30,
      boilTimeMin: Number.isFinite(rawBoilTime) && rawBoilTime >= 0 ? rawBoilTime : 60,
      efficiencyPercent: Number.isFinite(rawEfficiency) && rawEfficiency > 0 ? rawEfficiency : 72,
      fermentablesCount: Math.max(rawFermentables.length, 1)
    });

    if (!rawNodeValidation.success) {
      return {
        success: false,
        recipe: null,
        errors: rawNodeValidation.error.issues.map(e => e.message)
      };
    }

    const name = rawName && rawName.length > 0 ? rawName.slice(0, 100) : 'Импортированный рецепт';
    const styleEl = findFirstEl(recipeEl, 'STYLE');
    const style = (styleEl ? getElText(styleEl, 'NAME') : null) || 'Пользовательский стиль';
    const category = (styleEl ? getElText(styleEl, 'CATEGORY') : null) || 'Крафт';
    const batchSizeL = rawBatchSize > 0 ? rawBatchSize : 30.0;
    const boilTimeMin = Number.isFinite(rawBoilTime) && rawBoilTime >= 5 ? rawBoilTime : 60;
    const efficiencyPercent = Number.isFinite(rawEfficiency) && rawEfficiency >= 10 ? rawEfficiency : 72.0;
    const description = getElText(recipeEl, 'NOTES') || '';

    // Парсинг солодов
    const grains: GrainItem[] = [];
    rawFermentables.forEach((f, idx) => {
      const gName = getElText(f, 'NAME') || `Солод ${idx + 1}`;
      const displayAmount = getElText(f, 'DISPLAY_AMOUNT') || '';
      let safeAmountKg = 1.0;

      if (displayAmount && /lb/i.test(displayAmount)) {
        const lbVal = parseFloat(displayAmount.replace(',', '.'));
        if (!isNaN(lbVal) && lbVal > 0) safeAmountKg = Number((lbVal * 0.45359237).toFixed(2));
      } else if (displayAmount && /kg/i.test(displayAmount)) {
        const kgVal = parseFloat(displayAmount.replace(',', '.'));
        if (!isNaN(kgVal) && kgVal > 0) safeAmountKg = Number(kgVal.toFixed(2));
      } else {
        const amountKg = parseFloat(getElText(f, 'AMOUNT') || '1.0');
        safeAmountKg = Number.isFinite(amountKg) && amountKg > 0 ? Number(amountKg.toFixed(2)) : 1.0;
      }

      const colorLovibond = parseFloat(getElText(f, 'COLOR') || '3.0');
      const safeColor = Number.isFinite(colorLovibond) && colorLovibond >= 0 ? colorLovibond : 3.0;
      const yieldPercent = parseFloat(getElText(f, 'YIELD') || '75.0');
      const safeYield = Number.isFinite(yieldPercent) && yieldPercent >= 10 ? yieldPercent : 75.0;
      const potentialSg = 1.0 + (safeYield / 100) * 0.046;

      let gType: GrainItem['type'] = 'base';
      const lower = gName.toLowerCase();
      if (lower.includes('cara') || lower.includes('карамель') || lower.includes('crystal') || lower.includes('honey')) gType = 'caramel';
      else if (lower.includes('choco') || lower.includes('roast') || lower.includes('жжен') || lower.includes('black')) gType = 'roasted';
      else if (lower.includes('wheat') || lower.includes('пшенич')) gType = 'wheat';
      else if (lower.includes('flake') || lower.includes('хлопь') || lower.includes('oat')) gType = 'adjunct';

      grains.push({
        id: `grain_imp_${idx}_${Date.now()}`,
        name: gName,
        weightKg: Number(safeAmountKg.toFixed(2)),
        potentialSg: Number(potentialSg.toFixed(3)),
        colorEbc: Number((safeColor * 1.97).toFixed(1)),
        type: gType
      });
    });

    if (grains.length === 0) {
      grains.push({
        id: `grain_def_${Date.now()}`,
        name: 'Пилснер (Базовый)',
        weightKg: 4.5,
        potentialSg: 1.037,
        colorEbc: 3.5,
        type: 'base'
      });
    }

    // Парсинг хмелей
    const hops: HopItem[] = [];
    rawHops.forEach((h, idx) => {
      const hName = getElText(h, 'NAME') || `Хмель ${idx + 1}`;
      const displayAmount = getElText(h, 'DISPLAY_AMOUNT') || '';
      let safeWeightG = 25.0;

      if (displayAmount && /oz/i.test(displayAmount)) {
        const ozVal = parseFloat(displayAmount.replace(',', '.'));
        if (!isNaN(ozVal) && ozVal > 0) safeWeightG = Number((ozVal * 28.349523).toFixed(1));
      } else if (displayAmount && /g\b/i.test(displayAmount)) {
        const gVal = parseFloat(displayAmount.replace(',', '.'));
        if (!isNaN(gVal) && gVal > 0) safeWeightG = Number(gVal.toFixed(1));
      } else {
        const amountVal = parseFloat(getElText(h, 'AMOUNT') || '0.02');
        if (Number.isFinite(amountVal) && amountVal > 0) {
          safeWeightG = amountVal <= 0.5 ? Number((amountVal * 1000).toFixed(1)) : Number(amountVal.toFixed(1));
        }
      }

      const alpha = parseFloat(getElText(h, 'ALPHA') || '8.0');
      const safeAlpha = Number.isFinite(alpha) && alpha >= 0 ? Number(alpha.toFixed(1)) : 8.0;
      const time = parseInt(getElText(h, 'TIME') || '60', 10);
      const safeTime = Number.isFinite(time) && time >= 0 ? time : 60;
      const useStr = (getElText(h, 'USE') || 'boil').toLowerCase();

      let use: HopItem['use'] = 'boil';
      if (useStr.includes('dry')) use = 'dry_hop';
      else if (useStr.includes('whirlpool') || useStr.includes('вирп') || useStr.includes('aroma') || safeTime === 0) use = 'whirlpool';

      hops.push({
        id: `hop_imp_${idx}_${Date.now()}`,
        name: hName,
        weightG: Number(safeWeightG.toFixed(1)),
        alphaAcid: safeAlpha,
        boilTimeMin: safeTime,
        use
      });
    });

    // Парсинг пауз
    const mashSchedule: MashRest[] = [];
    const mashStepEls = findAllEls(recipeEl, 'MASH_STEP');
    mashStepEls.forEach((step, idx) => {
      const sName = getElText(step, 'NAME') || `Пауза ${idx + 1}`;
      const tempC = parseFloat(getElText(step, 'STEP_TEMP') || '65.0');
      const timeMin = parseInt(getElText(step, 'STEP_TIME') || '45', 10);

      mashSchedule.push({
        id: `rest_imp_${idx}_${Date.now()}`,
        name: sName,
        tempC: Number.isFinite(tempC) && tempC >= 20 ? tempC : 65,
        timeMin: Number.isFinite(timeMin) && timeMin >= 0 ? timeMin : 45,
        type: 'custom'
      });
    });

    if (mashSchedule.length === 0) {
      mashSchedule.push(
        { id: 'm1', name: 'Осахаривание (Мальтозная)', tempC: 65, timeMin: 60, type: 'maltose' },
        { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
      );
    }

    // Дрожжи
    const yeastEl = findFirstEl(recipeEl, 'YEAST');
    const yeastName = (yeastEl ? getElText(yeastEl, 'NAME') : null) || 'Fermentis SafAle US-05';
    const yeastLab = (yeastEl ? getElText(yeastEl, 'LABORATORY') : null) || 'Fermentis';
    const yeastAttenuation = parseFloat((yeastEl ? getElText(yeastEl, 'ATTENUATION') : null) || '78.0');

    const yeast: Yeast = {
      name: yeastName,
      lab: yeastLab,
      form: 'dry',
      type: yeastName.toLowerCase().includes('lager') ? 'lager' : 'ale',
      cellsPerGramOrVial: 20,
      attenuationPercent: Number.isFinite(yeastAttenuation) && yeastAttenuation >= 30 ? yeastAttenuation : 75,
      tempRange: [18, 22]
    };

    // Парсинг дополнительных ингредиентов (MISC)
    const otherIngredients: OtherIngredientItem[] = [];
    const miscEls = findAllEls(recipeEl, 'MISC');
    miscEls.forEach((mEl, idx) => {
      const mName = getElText(mEl, 'NAME') || `Добавка ${idx + 1}`;
      const mAmountKg = parseFloat(getElText(mEl, 'AMOUNT') || '0.01');
      const safeAmount = Number.isFinite(mAmountKg) && mAmountKg > 0 ? mAmountKg : 0.01;
      const mUse = (getElText(mEl, 'USE') || 'boil').toLowerCase();
      const mTime = parseFloat(getElText(mEl, 'TIME') || '10');
      const mType = (getElText(mEl, 'TYPE') || 'other').toLowerCase();

      let stage: OtherIngredientItem['stage'] = 'boil';
      if (mUse.includes('mash')) stage = 'mash';
      else if (mUse.includes('primary')) stage = 'primary';
      else if (mUse.includes('secondary')) stage = 'secondary';
      else if (mUse.includes('bottling')) stage = 'bottling';

      let itype: OtherIngredientItem['type'] = 'other';
      if (mType.includes('fining')) itype = 'fining';
      else if (mType.includes('spice')) itype = 'spice';
      else if (mType.includes('herb')) itype = 'herb';
      else if (mType.includes('water')) itype = 'water_agent';
      else if (mType.includes('flavor')) itype = 'flavor';
      else if (mType.includes('sugar')) itype = 'sugar';

      otherIngredients.push({
        id: `imp_misc_${idx}_${Date.now()}`,
        name: mName,
        amount: safeAmount < 0.1 ? Math.max(1, Math.round(safeAmount * 1000)) : Number(safeAmount.toFixed(2)),
        unit: safeAmount < 0.1 ? 'g' : 'kg',
        stage,
        timeMinOrDays: Number.isFinite(mTime) ? mTime : 10,
        type: itype
      });
    });

    const calculated = calculateBrewMetrics({
      batchSizeL: batchSizeL > 0 ? batchSizeL : 30,
      boilTimeMin: boilTimeMin > 0 ? boilTimeMin : 60,
      efficiencyPercent: efficiencyPercent > 0 ? efficiencyPercent : 72,
      grainRatioLPerKg: 3.5,
      grainTempC: 20,
      targetCarbonationVol: 2.4,
      beerTempAtBottlingC: 20,
      grains,
      hops,
      yeast,
      otherIngredients
    });

    const candidateRecipe: Recipe = {
      id: `recipe_imported_${Date.now()}`,
      name,
      style,
      category,
      description,
      author: 'Импортировано',
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
      otherIngredients,
      calculated,
      tags: ['BeerXML', 'Импорт'],
      isCustom: true,
      collection: 'my_recipes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Строгая валидация построенного рецепта через Zod для защиты базы IndexedDB
    const validation = validateRecipeWithZod(candidateRecipe);
    if (!validation.success) {
      console.warn('[BeerXML Zod Validation Error]:', validation.errors);
      return {
        success: false,
        recipe: null,
        errors: validation.errors
      };
    }

    return {
      success: true,
      recipe: validation.data || candidateRecipe
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('Failed to parse BeerXML:', err);
    return {
      success: false,
      recipe: null,
      errors: [`Ошибка разбора BeerXML: ${errMsg}`]
    };
  }
}

/**
 * Импорт рецепта из файла BeerXML 1.0 (возвращает проверенный Recipe или null)
 */
export function importFromBeerXml(xmlString: string): Recipe | null {
  const result = importFromBeerXmlWithValidation(xmlString);
  return result.success ? result.recipe : null;
}

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Надежный регулярный разбор BeerXML для случаев, когда XML поврежден
 * или браузерный DOMParser выдает синтаксическую ошибку (parsererror).
 */
export function parseBeerXmlViaRegex(xmlString: string): Recipe | null {
  if (!xmlString || (!xmlString.includes('<FERMENTABLE') && !xmlString.includes('<fermentable') && !xmlString.includes('<HOP') && !xmlString.includes('<hop'))) {
    return null;
  }

  const getTagVal = (block: string, tag: string): string => {
    const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
    return m ? m[1].trim() : '';
  };

  const name = getTagVal(xmlString, 'NAME') || 'Импортированный рецепт (BeerXML)';
  const styleMatch = xmlString.match(/<STYLE>([\s\S]*?)<\/STYLE>/i);
  const style = styleMatch ? getTagVal(styleMatch[1], 'NAME') || 'Крафтовый стиль' : 'Крафтовый стиль';
  const category = styleMatch ? getTagVal(styleMatch[1], 'CATEGORY') || 'Крафт' : 'Крафт';
  const author = getTagVal(xmlString, 'BREWER') || 'BeerXML';
  const description = getTagVal(xmlString, 'NOTES') || '';

  const rawBatchSize = parseFloat(getTagVal(xmlString, 'BATCH_SIZE') || '25');
  const batchSizeL = Number.isFinite(rawBatchSize) && rawBatchSize > 0 ? rawBatchSize : 25;
  const rawBoilTime = parseInt(getTagVal(xmlString, 'BOIL_TIME') || '60', 10);
  const boilTimeMin = Number.isFinite(rawBoilTime) && rawBoilTime > 0 ? rawBoilTime : 60;
  const rawEff = parseFloat(getTagVal(xmlString, 'EFFICIENCY') || '75');
  const efficiencyPercent = Number.isFinite(rawEff) && rawEff > 0 ? rawEff : 75;

  // Парсинг солодов
  const grains: GrainItem[] = [];
  const fermentableBlocks = xmlString.match(/<FERMENTABLE>([\s\S]*?)<\/FERMENTABLE>/gi) || [];
  fermentableBlocks.forEach((block, idx) => {
    const gName = getTagVal(block, 'NAME') || `Солод ${idx + 1}`;
    const displayAmount = getTagVal(block, 'DISPLAY_AMOUNT');
    let safeAmountKg = 1.0;

    if (displayAmount && /lb/i.test(displayAmount)) {
      const lbVal = parseFloat(displayAmount.replace(',', '.'));
      if (!isNaN(lbVal) && lbVal > 0) safeAmountKg = Number((lbVal * 0.45359237).toFixed(2));
    } else if (displayAmount && /kg/i.test(displayAmount)) {
      const kgVal = parseFloat(displayAmount.replace(',', '.'));
      if (!isNaN(kgVal) && kgVal > 0) safeAmountKg = Number(kgVal.toFixed(2));
    } else {
      const amountKg = parseFloat(getTagVal(block, 'AMOUNT') || '1.0');
      safeAmountKg = Number.isFinite(amountKg) && amountKg > 0 ? Number(amountKg.toFixed(2)) : 1.0;
    }

    const colorL = parseFloat(getTagVal(block, 'COLOR') || '3.0') || 3.0;
    const yieldPct = parseFloat(getTagVal(block, 'YIELD') || '75.0') || 75.0;
    const potentialSg = 1.0 + (yieldPct / 100) * 0.046;

    let gType: GrainItem['type'] = 'base';
    const lower = gName.toLowerCase();
    if (lower.includes('cara') || lower.includes('карамель') || lower.includes('crystal') || lower.includes('honey')) gType = 'caramel';
    else if (lower.includes('choco') || lower.includes('roast') || lower.includes('жжен') || lower.includes('black')) gType = 'roasted';
    else if (lower.includes('wheat') || lower.includes('пшенич')) gType = 'wheat';
    else if (lower.includes('flake') || lower.includes('хлопь') || lower.includes('oat')) gType = 'adjunct';

    grains.push({
      id: `rx_g_${idx}_${Date.now()}`,
      name: gName,
      weightKg: safeAmountKg,
      potentialSg: Number(potentialSg.toFixed(3)),
      colorEbc: Number((colorL * 1.97).toFixed(1)),
      type: gType
    });
  });

  // Парсинг хмелей
  const hops: HopItem[] = [];
  const hopBlocks = xmlString.match(/<HOP>([\s\S]*?)<\/HOP>/gi) || [];
  hopBlocks.forEach((block, idx) => {
    const hName = getTagVal(block, 'NAME') || `Хмель ${idx + 1}`;
    const displayAmount = getTagVal(block, 'DISPLAY_AMOUNT');
    let safeWeightG = 25.0;

    if (displayAmount && /oz/i.test(displayAmount)) {
      const ozVal = parseFloat(displayAmount.replace(',', '.'));
      if (!isNaN(ozVal) && ozVal > 0) safeWeightG = Number((ozVal * 28.349523).toFixed(1));
    } else if (displayAmount && /g\b/i.test(displayAmount)) {
      const gVal = parseFloat(displayAmount.replace(',', '.'));
      if (!isNaN(gVal) && gVal > 0) safeWeightG = Number(gVal.toFixed(1));
    } else {
      const amountVal = parseFloat(getTagVal(block, 'AMOUNT') || '0.02');
      if (Number.isFinite(amountVal) && amountVal > 0) {
        safeWeightG = amountVal <= 0.5 ? Number((amountVal * 1000).toFixed(1)) : Number(amountVal.toFixed(1));
      }
    }

    const alpha = parseFloat(getTagVal(block, 'ALPHA') || '8.0') || 8.0;
    const time = parseInt(getTagVal(block, 'TIME') || '60', 10) || 60;
    const useStr = getTagVal(block, 'USE').toLowerCase();

    let use: HopItem['use'] = 'boil';
    if (useStr.includes('dry')) use = 'dry_hop';
    else if (useStr.includes('whirlpool') || useStr.includes('вирп') || useStr.includes('aroma') || time === 0) use = 'whirlpool';

    hops.push({
      id: `rx_h_${idx}_${Date.now()}`,
      name: hName,
      weightG: safeWeightG,
      alphaAcid: Number(alpha.toFixed(1)),
      boilTimeMin: time,
      use
    });
  });

  if (grains.length === 0 && hops.length === 0) return null;

  // Дрожжи
  const yeastBlock = xmlString.match(/<YEAST>([\s\S]*?)<\/YEAST>/i);
  const yeastName = yeastBlock ? getTagVal(yeastBlock[1], 'NAME') || 'Fermentis SafAle US-05' : 'Fermentis SafAle US-05';
  const yeastLab = yeastBlock ? getTagVal(yeastBlock[1], 'LABORATORY') || 'Fermentis' : 'Fermentis';
  const yeastAtt = parseFloat(yeastBlock ? getTagVal(yeastBlock[1], 'ATTENUATION') || '78' : '78') || 78;

  const yeast: Yeast = {
    name: yeastName,
    lab: yeastLab,
    form: 'dry',
    type: yeastName.toLowerCase().includes('lager') ? 'lager' : 'ale',
    cellsPerGramOrVial: 20,
    attenuationPercent: yeastAtt,
    tempRange: [18, 22]
  };

  const mashSchedule: MashRest[] = [
    { id: 'm1', name: 'Осахаривание (Мальтозная)', tempC: 66, timeMin: 60, type: 'maltose' },
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
    grains: grains.length > 0 ? grains : [{ id: 'g_def', name: 'Pale Ale Malt', weightKg: 4.5, potentialSg: 1.038, colorEbc: 6, type: 'base' }],
    hops: hops.length > 0 ? hops : [{ id: 'h_def', name: 'Cascade', weightG: 30, alphaAcid: 6, boilTimeMin: 60, use: 'boil' }],
    yeast
  });

  const candidate: Recipe = {
    id: `recipe_rx_imp_${Date.now()}`,
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
    grains,
    hops,
    mashSchedule,
    yeast,
    otherIngredients: [],
    calculated,
    tags: ['BeerXML', 'Импорт'],
    isCustom: true,
    collection: 'my_recipes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const validation = validateRecipeWithZod(candidate);
  return validation.success ? (validation.data || candidate) : candidate;
}
