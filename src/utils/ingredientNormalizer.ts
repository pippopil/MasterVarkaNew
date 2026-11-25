/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Утилита точной нормализации и интеллектуального сопоставления названий пивоваренных ингредиентов.
 * Предотвращает ложные срабатывания (например, когда разные солода путаются из-за слова «солод»
 * или любые дрожжи ошибочно считаются подходящими из-за слова «дрожжи» / «safale»).
 */

// Стоп-слова, которые НЕ ДОЛЖНЫ служить единственным основанием для сопоставления
export const STOP_WORDS = new Set([
  // Русские общие категории
  'солод', 'солодовый', 'солодовая', 'солодовое', 'солодовые', 'солода', 'солодов',
  'хмель', 'хмеля', 'хмелевой', 'хмелевые', 'хмелем',
  'дрожжи', 'дрожжей', 'дрожжами', 'штамм', 'штаммы',
  'пиво', 'пивной', 'пивная', 'пивные', 'пивоваренный', 'пивоваренные',
  'сухие', 'сухой', 'сухая', 'жидкие', 'жидкий', 'гранулированный', 'гранулы', 'пыльца', 'шишковой', 'шишки',
  'курский', 'курская', 'курское', 'курские', 'курск', 'россия', 'импортный', 'импорт',
  'зерно', 'зерновой',
  // Английские общие категории и бренды
  'malt', 'malts', 'malted', 'grain', 'grains',
  'hop', 'hops', 'pellets', 'pellet', 'cones',
  'yeast', 'yeasts', 'strain', 'strains', 'dry', 'liquid',
  'beer', 'brewing', 'brew',
  'kursk', 'kurskiy', 'weyermann', 'castle', 'malting', 'simpsons', 'crisp', 'brouwland',
  'fermentis', 'lallemand', 'mangrove', 'jacks', 'jack', 'safale', 'saflager', 'safbrew', 'white', 'labs', 'wyeast', 'omega'
]);

// Словарь канонических групп и синонимов для солода, хмеля и добавок
const SYNONYM_MAP: Record<string, string[]> = {
  // Солода базовые (maris_otter ДО pale_ale, чтобы английский пэйл не поглощался обычным пэйл элем)
  'maris_otter': ['maris otter', 'мэрис оттер', 'марис оттер', 'maris', 'otter'],
  'pilsner': ['pilsner', 'pils', 'пилснер', 'пилс', 'пльзеньский', 'пльзенский'],
  'pale_ale': ['pale ale', 'пэйл эль', 'пейл эль'],
  'vienna': ['vienna', 'венский', 'вена'],
  'munich': ['munich', 'мюнхенский', 'мюнхен', 'munich i', 'munich ii'],
  'wheat': ['wheat', 'пшеничный', 'пшеница', 'weizen', 'weiss'],

  // Карамельные и специальные солода
  'carapils': ['carapils', 'carafoam', 'карапилс', 'карафом', 'десертный'],
  'carahell': ['carahell', 'карахель', 'карахелль'],
  'carared': ['carared', 'караред'],
  'caramunich': ['caramunich', 'карамюнхен', 'caramunich i', 'caramunich ii', 'caramunich iii'],
  'caraaroma': ['caraaroma', 'караарома', 'caraamber', 'караамбер'],
  'caramel_50': ['карамельный 50', 'caramel 50'],
  'caramel_100': ['карамельный 100', 'caramel 100'],
  'caramel_150': ['карамельный 150', 'caramel 150', 'chateau crystal', 'crystal 150', 'кристалл'],
  'caramel_200': ['карамельный 200', 'caramel 200'],
  'caramel_250': ['карамельный 250', 'caramel 250'],
  'caramel_300': ['карамельный 300', 'caramel 300'],
  'special_b': ['special b', 'спешиал б', 'специал б', 'спешиал-б', 'special-b'],
  'melanoidin': ['melanoidin', 'меланоидиновый', 'меланоидин', 'мелано'],
  'biscuit': ['chateau biscuit', 'biscuit malt', 'бисквитный', 'бисквит'],
  'acidulated': ['acidulated', 'кислый солод', 'acid malt', 'sauermalz'],
  'smoked': ['smoked malt', 'копченый', 'rauchmalz', 'rauch'],

  // Жженые и темные солода
  'chocolate': ['chocolate', 'шоколадный', 'шоколад'],
  'roasted_barley': ['roasted barley', 'жженый ячмень', 'жженка', 'roast barley'],
  'roasted_malt': ['roasted malt', 'жженый солод'],
  'carafa': ['carafa special', 'carafa', 'карафа спешиал', 'карафа'],
  'black_malt': ['black malt', 'черный солод', 'блэк солод'],

  // Хлопья и несоложенка
  'flaked_oats': ['flaked oats', 'овсяные хлопья', 'овес', 'геркулес', 'хлопья овсяные', 'овсяный солод', 'oat malt'],
  'flaked_barley': ['flaked barley', 'ячменные хлопья', 'хлопья ячменные', 'несоложеный ячмень'],
  'flaked_wheat': ['flaked wheat', 'пшеничные хлопья', 'хлопья пшеничные', 'несоложеная пшеница'],
  'flaked_corn': ['flaked corn', 'кукурузные хлопья', 'кукуруза'],
  'flaked_rice': ['flaked rice', 'рисовые хлопья', 'рис'],
  'rye': ['rye malt', 'ржаной солод', 'ржаной', 'рожь'],

  // Хмели
  'citra': ['citra', 'цитра', 'ситра'],
  'mosaic': ['mosaic', 'мозаик', 'мозаика', 'мозайк'],
  'simcoe': ['simcoe', 'симко', 'симкое'],
  'cascade': ['cascade', 'каскад'],
  'centennial': ['centennial', 'центенниал', 'центениал'],
  'amarillo': ['amarillo', 'амарилло', 'амарило'],
  'chinook': ['chinook', 'чинук', 'чиноук'],
  'columbus': ['columbus', 'ctz', 'zeus', 'tomahawk', 'колумбус', 'зевс', 'томагавк'],
  'sabro': ['sabro', 'сабро'],
  'idaho_7': ['idaho 7', 'idaho', 'айдахо 7', 'айдахо'],
  'saaz': ['saaz', 'жатецкий', 'zatec', 'жатец'],
  'hallertau': ['hallertau', 'халпертау', 'халлертау', 'mittelfruh', 'миттельфрю', 'hallertauer'],
  'tettnanger': ['tettnanger', 'теттнангер', 'тетнангер', 'tettnang'],
  'magnum': ['magnum', 'магнум'],
  'perle': ['perle', 'перле', 'перл'],
  'spalt': ['spalt', 'шпальт', 'спальт'],
  'east_kent_goldings': ['east kent goldings', 'ekg', 'goldings', 'ист кент голдингс', 'голдингс', 'голдинг'],
  'fuggle': ['fuggle', 'фаггл', 'фуггл', 'фагглс', 'fuggles'],
  'northern_brewer': ['northern brewer', 'нортерн брюер', 'норзерн брюер'],
  'galaxy': ['galaxy', 'гэлакси', 'галакси', 'галактика'],
  'nelson_sauvin': ['nelson sauvin', 'нельсон совин', 'нельсон', 'nelson'],

  // Добавки
  'dextrose': ['dextrose', 'декстроза', 'глюкоза', 'glucose', 'сахар для карбонизации', 'праймер'],
  'lactose': ['lactose', 'лактоза', 'молочный сахар'],
  'coriander': ['coriander', 'кориандр', 'семена кориандра'],
  'orange_peel': ['orange peel', 'curacao', 'цедра апельсина', 'померанец', 'корка апельсина'],
  'irish_moss': ['irish moss', 'whirlfloc', 'ирландский мох', 'вирфлок']
};

/**
 * Очистка и токенизация строки для сравнения
 */
export function cleanToken(str: string): string {
  return str
    .toLowerCase()
    .replace(/[()[\]{}"'«»,./\\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Извлечение канонического кода штамма дрожжей.
 * Обеспечивает строгое сопоставление (US-05 не совпадет с S-04, W-34/70, BE-256 или другими).
 */
export function extractYeastStrainCode(name: string): string | null {
  const clean = name.toLowerCase().replace(/[^a-z0-9а-я]/g, ' ');

  const patterns: [RegExp, string][] = [
    [/\b(us\s*05|ус\s*05)\b/i, 'us_05'],
    [/\b(s\s*04|с\s*04)\b/i, 's_04'],
    [/\b(w\s*34\s*70|34\s*70|3470|вайенштефан|weihenstephan)\b/i, 'w_34_70'],
    [/\b(wb\s*06|вб\s*06)\b/i, 'wb_06'],
    [/\b(be\s*256|бе\s*256)\b/i, 'be_256'],
    [/\b(be\s*134|бе\s*134)\b/i, 'be_134'],
    [/\b(s\s*33|с\s*33)\b/i, 's_33'],
    [/\b(k\s*97|к\s*97)\b/i, 'k_97'],
    [/\b(t\s*58|т\s*58)\b/i, 't_58'],
    [/\b(m\s*44|m44)\b/i, 'm_44'],
    [/\b(m\s*20|m20)\b/i, 'm_20'],
    [/\b(m\s*29|m29)\b/i, 'm_29'],
    [/\b(m\s*36|m36)\b/i, 'm_36'],
    [/\b(m\s*42|m42)\b/i, 'm_42'],
    [/\b(m\s*47|m47)\b/i, 'm_47'],
    [/\b(m\s*12|m12)\b/i, 'm_12'],
    [/\b(m\s*54|m54)\b/i, 'm_54'],
    [/\b(nottingham|ноттингем)\b/i, 'nottingham'],
    [/\b(windsor|виндзор)\b/i, 'windsor'],
    [/\b(verdant|вердант)\b/i, 'verdant'],
    [/\b(voss|восс)\b/i, 'voss_kveik'],
    [/\b(wlp\s*001)\b/i, 'wlp_001'],
    [/\b(wlp\s*002)\b/i, 'wlp_002'],
    [/\b(wlp\s*830)\b/i, 'wlp_830'],
    [/\b(wlp\s*300)\b/i, 'wlp_300']
  ];

  for (const [regex, code] of patterns) {
    if (regex.test(clean)) {
      return code;
    }
  }
  return null;
}

/**
 * Определение канонического ключа группы ингредиента без ложных включений
 */
export function getCanonicalKey(name: string): string | null {
  const cleaned = cleanToken(name);
  const nameTokens = cleaned.split(' ').filter(t => !STOP_WORDS.has(t) && t.length > 1);
  if (nameTokens.length === 0) return null;

  for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
    for (const syn of synonyms) {
      const synClean = cleanToken(syn);
      const synTokens = synClean.split(' ').filter(t => !STOP_WORDS.has(t) && t.length > 1);
      if (synTokens.length === 0) continue;

      if (cleaned === synClean) {
        return key;
      }

      // Все значимые токены синонима должны присутствовать в названии
      const allSynInName = synTokens.every(st =>
        nameTokens.some(nt => nt === st || (nt.length > 3 && st.length > 3 && nt.startsWith(st)))
      );
      if (allSynInName) {
        return key;
      }
    }
  }
  return null;
}

/**
 * Умная и точная проверка соответствия ингредиента из инвентаря ингредиенту из рецепта.
 * Поддерживает опциональное указание категории для абсолютной строгости.
 */
export function isIngredientMatch(
  invName: string,
  recipeIngredientName: string,
  category?: 'grain' | 'hop' | 'yeast' | 'misc'
): boolean {
  if (!invName || !recipeIngredientName) return false;

  const invClean = cleanToken(invName);
  const recClean = cleanToken(recipeIngredientName);

  // 1. Полное точное совпадение очищенных строк
  if (invClean === recClean) {
    return true;
  }

  // 2. Дрожжи — строгая проверка по штаммам
  const isYeastCategory = category === 'yeast' ||
    invClean.includes('yeast') || invClean.includes('дрожж') ||
    recClean.includes('yeast') || recClean.includes('дрожж') ||
    extractYeastStrainCode(invName) !== null ||
    extractYeastStrainCode(recipeIngredientName) !== null;

  if (isYeastCategory) {
    const invCode = extractYeastStrainCode(invName);
    const recCode = extractYeastStrainCode(recipeIngredientName);

    if (invCode && recCode) {
      return invCode === recCode;
    }
    // Если один имеет четкий код (например US-05), а второй нет (например «Пивные дрожжи»),
    // мы НЕ засчитываем совпадение во избежание ложной доступности рецепта
    if (invCode || recCode) {
      return false;
    }
    // Если оба кастомные дрожжи без кода штамма — сравниваем значимые токены
    const invYT = invClean.split(' ').filter(w => !STOP_WORDS.has(w) && w.length > 2);
    const recYT = recClean.split(' ').filter(w => !STOP_WORDS.has(w) && w.length > 2);
    if (invYT.length === 0 || recYT.length === 0) return false;
    return invYT.join(' ') === recYT.join(' ');
  }

  // 3. Сравнение через канонический словарь синонимов
  const invKey = getCanonicalKey(invName);
  const recKey = getCanonicalKey(recipeIngredientName);
  if (invKey && recKey) {
    return invKey === recKey;
  }

  // 4. Пословное сравнение ключевых слов с обязательным исключением стоп-слов
  const invWords = invClean.split(' ').filter(w => !STOP_WORDS.has(w) && w.length > 2);
  const recWords = recClean.split(' ').filter(w => !STOP_WORDS.has(w) && w.length > 2);

  if (invWords.length === 0 || recWords.length === 0) {
    return false;
  }

  // Проверка полного совпадения значимой цепочки
  if (invWords.join(' ') === recWords.join(' ')) {
    return true;
  }

  // Для солодов: изоляция базовых типов
  if (category === 'grain') {
    const isInvPils = invClean.includes('pils') || invClean.includes('пилс');
    const isRecPils = recClean.includes('pils') || recClean.includes('пилс');
    if (isInvPils !== isRecPils) return false;

    const isInvPale = invClean.includes('pale') || invClean.includes('пэйл') || invClean.includes('пейл');
    const isRecPale = recClean.includes('pale') || recClean.includes('пэйл') || recClean.includes('пейл');
    if (isInvPale !== isRecPale) return false;

    const isInvVienna = invClean.includes('vienna') || invClean.includes('венск');
    const isRecVienna = recClean.includes('vienna') || recClean.includes('венск');
    if (isInvVienna !== isRecVienna) return false;

    const isInvMunich = invClean.includes('munich') || invClean.includes('мюнхен');
    const isRecMunich = recClean.includes('munich') || recClean.includes('мюнхен');
    if (isInvMunich !== isRecMunich) return false;

    const isInvWheat = invClean.includes('wheat') || invClean.includes('пшенич');
    const isRecWheat = recClean.includes('wheat') || recClean.includes('пшенич');
    if (isInvWheat !== isRecWheat) return false;
  }

  // Проверка полного покрытия: один набор токенов полностью содержится в другом
  const recInInv = recWords.every(rw =>
    invWords.some(iw => iw === rw || (iw.length > 4 && rw.length > 4 && (iw.startsWith(rw) || rw.startsWith(iw))))
  );
  const invInRec = invWords.every(iw =>
    recWords.some(rw => rw === iw || (iw.length > 4 && rw.length > 4 && (rw.startsWith(iw) || iw.startsWith(rw))))
  );

  return recInInv || invInRec;
}

/**
 * Типовой стартовый набор пивовара для быстрого заполнения
 */
export function getStandardBrewerStarterPack() {
  return [
    { id: 'pack_1', name: 'Pilsner Malt (Пилснер)', category: 'grain' as const, amount: 15.0, unit: 'kg' as const, potentialSgOrAlpha: 1.037, colorEbc: 3.5, notes: 'Базовый лагерный солод' },
    { id: 'pack_2', name: 'Pale Ale Malt (Пэйл Эль)', category: 'grain' as const, amount: 12.0, unit: 'kg' as const, potentialSgOrAlpha: 1.038, colorEbc: 6.0, notes: 'Базовый солод для элей и IPA' },
    { id: 'pack_3', name: 'Wheat Malt (Пшеничный светлый)', category: 'grain' as const, amount: 5.0, unit: 'kg' as const, potentialSgOrAlpha: 1.038, colorEbc: 4.0, notes: 'Для вайценов и бланшей' },
    { id: 'pack_4', name: 'Munich I (Мюнхенский солод)', category: 'grain' as const, amount: 3.0, unit: 'kg' as const, potentialSgOrAlpha: 1.036, colorEbc: 15.0, notes: 'Для солодового аромата' },
    { id: 'pack_5', name: 'Carapils / Carafoam', category: 'grain' as const, amount: 1.5, unit: 'kg' as const, potentialSgOrAlpha: 1.033, colorEbc: 4.5, notes: 'Для стойкой белоснежной пены' },
    { id: 'pack_6', name: 'Flaked Oats (Овсяные хлопья)', category: 'grain' as const, amount: 2.0, unit: 'kg' as const, potentialSgOrAlpha: 1.032, colorEbc: 2.0, notes: 'Для кремового тела NEIPA и стаутов' },
    { id: 'pack_7', name: 'Roasted Barley (Жженый ячмень)', category: 'grain' as const, amount: 1.0, unit: 'kg' as const, potentialSgOrAlpha: 1.025, colorEbc: 1100.0, notes: 'Для черных стаутов' },
    { id: 'pack_8', name: 'Citra', category: 'hop' as const, amount: 150, unit: 'g' as const, potentialSgOrAlpha: 12.5, notes: 'Тропики и цитрус' },
    { id: 'pack_9', name: 'Mosaic', category: 'hop' as const, amount: 100, unit: 'g' as const, potentialSgOrAlpha: 12.0, notes: 'Черника и маракуйя' },
    { id: 'pack_10', name: 'Saaz (Жатецкий)', category: 'hop' as const, amount: 100, unit: 'g' as const, potentialSgOrAlpha: 3.8, notes: 'Чешский благородный' },
    { id: 'pack_11', name: 'Magnum', category: 'hop' as const, amount: 100, unit: 'g' as const, potentialSgOrAlpha: 14.0, notes: 'Чистая базовая горечь' },
    { id: 'pack_12', name: 'SafAle US-05', category: 'yeast' as const, amount: 3, unit: 'pack' as const, potentialSgOrAlpha: 81, notes: 'Универсальные чистые элевые' },
    { id: 'pack_13', name: 'SafLager W-34/70', category: 'yeast' as const, amount: 2, unit: 'pack' as const, potentialSgOrAlpha: 83, notes: 'Эталонный немецкий лагер' },
    { id: 'pack_14', name: 'SafAle WB-06', category: 'yeast' as const, amount: 2, unit: 'pack' as const, potentialSgOrAlpha: 86, notes: 'Пшеничный баварский профиль' },
    { id: 'pack_15', name: 'Декстроза (глюкоза)', category: 'misc' as const, amount: 1000, unit: 'g' as const, notes: 'Для естественной карбонизации в бутылках' }
  ];
}
