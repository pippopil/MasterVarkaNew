/**
 * Шаблоны промптов и офлайн-генераторы для ИИ-лаборатории пивовара
 */

import { GenerateLabelRequest, AuditRecipeRequest } from '../types/api.js';

export const OFFLINE_THEMES = [
  {
    names: ['Хмельной Горизонт', 'Янтарная Легенда', 'Крафтовый Прорыв'],
    slogan: 'Сварено с душой, проверено временем.',
    story: 'Истинный образец крафтового мастерства. Насыщенная засыпь солода и благородная хмелевая горчинка создают идеальный баланс вкуса.',
    themeStyle: 'craft_modern',
    palette: { background: '#1c1917', text: '#fef08a', accent: '#eab308', border: '#ca8a04' },
    artworkType: 'hop',
    brewerTip: 'Используйте чиллер для быстрого охлаждения сусла и контролируйте температуру брожения!'
  },
  {
    names: ['Северная Звезда', 'Баварский Бархат', 'Алхимия Солода'],
    slogan: 'Чистый вкус натурального зерна и свежего хмеля.',
    story: 'Авторская рецептура на стыке классических пивоваренных традиций и современного крафтового духа.',
    themeStyle: 'vintage_monastery',
    palette: { background: '#09090b', text: '#f4f4f5', accent: '#d97706', border: '#78350f' },
    artworkType: 'barrel',
    brewerTip: 'Обеспечьте чистоту ферментера и задавайте достаточное количество активных дрожжей.'
  },
  {
    names: ['Хмельная Волна', 'Солодовый Вектор', 'Пивной Компас'],
    slogan: 'Честное домашнее пиво без компромиссов.',
    story: 'Создано по выверенной крафтовой рецептуре с ярким профилем и чистым вкусом.',
    themeStyle: 'minimal_nordic',
    palette: { background: '#0f172a', text: '#38bdf8', accent: '#0ea5e9', border: '#0369a1' },
    artworkType: 'crown',
    brewerTip: 'Дайте пиву созреть в прохладном месте не менее 2-3 недель после розлива.'
  }
];

export function buildLabelPrompt(data: GenerateLabelRequest, compressPrompt = true): string {
  const hopList = Array.isArray(data.hops)
    ? data.hops.map(h => h.name).filter(Boolean).slice(0, 4).join(', ')
    : 'Крафтовые';
  const grainList = Array.isArray(data.grains)
    ? data.grains.map(g => g.name).filter(Boolean).slice(0, 4).join(', ')
    : 'Ячменные';

  if (compressPrompt) {
    return `Пиво: ${data.style}, OG:${data.og}, ABV:${data.abv}%, IBU:${data.ibu}, EBC:${data.colorEbc}. Хмель:${hopList}. Солод:${grainList}.${data.currentName ? ` Название:"${data.currentName}".` : ''}
Ответь ТОЛЬКО валидным JSON:
{"names":["Краткое 1","Краткое 2","Краткое 3"],"slogan":"Слоган до 6 слов","story":"Описание вкуса 1-2 предложения","themeStyle":"craft_modern"|"vintage_monastery"|"minimal_nordic"|"retro_arcade"|"botanical","palette":{"background":"#hex","text":"#hex","accent":"#hex","border":"#hex"},"artworkType":"hop"|"grain"|"barrel"|"crown"|"mountain","brewerTip":"Один краткий совет пивовара"}`;
  }

  return `Ты — креативный шеф-пивовар и дизайнер этикеток крафтовой пивоварни.
Параметры пива:
- Стиль: ${data.style}
- Начальная плотность: ${data.og}, Крепость: ${data.abv}%, Горечь: ${data.ibu} IBU, Цвет: ${data.colorEbc} EBC
- Хмели: ${hopList}
- Солода: ${grainList}
${data.currentName ? `- Текущее рабочее название: "${data.currentName}"` : ''}

Сгенерируй JSON со следующими полями:
{
  "names": ["Название 1", "Название 2", "Название 3"],
  "slogan": "Короткий звучный слоган (до 8 слов)",
  "story": "Легенда или описание вкуса (2 предложения на русском)",
  "themeStyle": "craft_modern" | "vintage_monastery" | "minimal_nordic" | "retro_arcade" | "botanical",
  "palette": { "background": "#hex", "text": "#hex", "accent": "#hex", "border": "#hex" },
  "artworkType": "hop" | "grain" | "barrel" | "crown" | "mountain",
  "brewerTip": "Ценный совет пивовара для этого стиля"
}`;
}

export function buildAuditPrompt(data: AuditRecipeRequest, compressPrompt = true): string {
  const { recipe } = data;
  const grainSummary = recipe.grains?.map(g => `${g.name} ${g.weightKg}кг`).slice(0, 4).join(', ') || 'Солод';
  const hopSummary = recipe.hops?.map(h => `${h.name} ${h.weightG}г ${h.boilTimeMin}м`).slice(0, 4).join(', ') || 'Хмель';

  if (compressPrompt) {
    return `Аудит пива: ${recipe.name}, Стиль:${recipe.style}, OG:${recipe.calculated?.ogSg}, ABV:${recipe.calculated?.abv}%, IBU:${recipe.calculated?.ibu}, EBC:${recipe.calculated?.ebc}. Засыпь:${grainSummary}. Хмель:${hopSummary}. Дрожжи:${recipe.yeast?.name || 'Элевые'}.
JSON:
{"summary":"2 предложения оценки","strengths":["Плюс 1","Плюс 2"],"suggestions":["Совет по улучшению"],"foodPairings":["Блюдо 1","Блюдо 2"],"servingTemp":"8-10°C","glassType":"Бокал"}`;
  }

  return `Ты — международный судья BJCP и главный технолог пивоварения.
Проанализируй рецепт:
Название: ${recipe.name}, Стиль: ${recipe.style}
Партия: ${recipe.batchSizeL} л, Кипячение: ${recipe.boilTimeMin} мин
OG: ${recipe.calculated?.ogSg}, ABV: ${recipe.calculated?.abv}%, IBU: ${recipe.calculated?.ibu}, EBC: ${recipe.calculated?.ebc}
Засыпь: ${grainSummary}
Хмели: ${hopSummary}
Дрожжи: ${recipe.yeast?.name} (${recipe.yeast?.attenuationPercent || 75}% аттенюация)

Сформируй экспертное заключение в JSON:
{
  "summary": "Краткая оценка рецепта (2 предложения)",
  "strengths": ["Плюс 1", "Плюс 2"],
  "suggestions": ["Рекомендация по улучшению засыпи или охмеления"],
  "foodPairings": ["Гастрономическая пара 1", "Пара 2", "Пара 3"],
  "servingTemp": "Рекомендуемая температура подачи (напр. 7-9°C)",
  "glassType": "Рекомендуемый бокал (напр. Тюльпан, Пинта Nonic, Снифтер)"
} `;
}

export function buildStyleDescriptionPrompt(recipe: any, compressPrompt = true): string {
  const grains = (recipe.grains || []).map((g: any) => `${g.name} (${g.weightKg} кг, ${g.colorEbc || 4} EBC)`).join(', ') || 'Базовый ячменный солод';
  const hops = (recipe.hops || []).map((h: any) => `${h.name} (${h.weightG} г, альфа ${h.alphaAcid || 5}%, ${h.use || 'boil'} ${h.boilTimeMin || 0}м)`).join(', ') || 'Хмель для горечи и аромата';
  const yeast = recipe.yeast?.name ? `${recipe.yeast.name} (${recipe.yeast.lab || ''}, аттенюация ${recipe.yeast.attenuationPercent || 75}%)` : 'Элевые чистые дрожжи';
  const others = (recipe.otherIngredients || []).map((o: any) => `${o.name} (${o.amount} ${o.unit || 'г'}, стадия: ${o.stage})`).join(', ');

  const og = recipe.calculated?.ogSg || 1.050;
  const fg = recipe.calculated?.fgSg || 1.010;
  const abv = recipe.calculated?.abv || 5.2;
  const ibu = recipe.calculated?.ibu || 30;
  const ebc = recipe.calculated?.ebc || 12;

  if (compressPrompt) {
    return `Ты эксперт BJCP. Состав пива: Стиль: ${recipe.style}, OG:${og}, FG:${fg}, ABV:${abv}%, IBU:${ibu}, EBC:${ebc}.
Засыпь: ${grains}.
Хмель: ${hops}.
Дрожжи: ${yeast}.
${others ? `Доп. ингредиенты: ${others}.` : ''}
Сформируй подробное сомелье-описание стиля пива С УЧЕТОМ ИМЕННО ЭТИХ ИНГРЕДИЕНТОВ И ИХ ВЛИЯНИЯ НА ВКУС.
Ответь ТОЛЬКО валидным JSON без markdown:
{
  "styleName": "${recipe.style}",
  "bjcpCategory": "Категория BJCP",
  "description": "Развернутое профессиональное описание стиля (3-4 абзаца на русском), объясняющее как зерно, хмель и брожение раскрываются в бокале",
  "sensoryProfile": {
    "aroma": "Аромат (раскрыть хмели и солодовые ноты)",
    "appearance": "Цвет ${ebc} EBC, пена и прозрачность",
    "flavor": "Вкусовой баланс (горечь ${ibu} IBU, солодовость, финиш)",
    "mouthfeel": "Тело, текстура, карбонизация и алкоголь"
  },
  "highlights": ["Особенность состава 1", "Особенность состава 2", "Особенность состава 3"],
  "commercialExamples": ["Эталонный пример 1", "Пример 2"]
}`;
  }

  return `Ты — ведущий технолог крафтового пивоварения и международный судья BJCP.
Состав и ТТХ варки:
- Название: ${recipe.name || 'Крафтовый сорт'}
- Заявленный стиль: ${recipe.style} (${recipe.category || 'Крафт'})
- Расчетные параметры: OG: ${og}, FG: ${fg}, Крепость: ${abv}%, Горечь: ${ibu} IBU, Цвет: ${ebc} EBC
- Солодовая засыпь: ${grains}
- Схема охмеления: ${hops}
- Дрожжевой штамм: ${yeast}
${others ? `- Дополнительные ингредиенты: ${others}` : ''}

На основе этого КОНКРЕТНОГО состава ингредиентов создай профессиональное сомелье-описание стиля пива, отражающее то, как именно эти солода, хмели, дрожжи и добавки сформируют органолептический профиль в бокале.

Ответь строго в формате JSON:
{
  "styleName": "${recipe.style}",
  "bjcpCategory": "Категория по руководству BJCP",
  "description": "Глубокое, красивое описание стиля пива на русском языке (3 абзаца), рассказывающее историю стиля, вкусовые акценты и впечатление от дегустации",
  "sensoryProfile": {
    "aroma": "Детальный ароматический букет (ноты хмелей и солодовой базы)",
    "appearance": "Внешний вид с учетом цвета ${ebc} EBC и структуры пены",
    "flavor": "Вкусовой профиль с учетом баланса горечи ${ibu} IBU и солодового тела",
    "mouthfeel": "Ощущение во рту (полнота тела, шелковистость, карбонизация, согревающий эффект)"
  },
  "highlights": [
    "Ключевая изюминка рецепта 1",
    "Ключевая изюминка рецепта 2",
    "Ключевая изюминка рецепта 3"
  ],
  "commercialExamples": [
    "Знаменитый коммерческий представитель стиля 1",
    "Коммерческий представитель 2",
    "Коммерческий представитель 3"
  ]
}`;
}

export function generateOfflineStyleDescription(recipe: any) {
  const style = recipe.style || 'Крафтовое пиво';
  const abv = recipe.calculated?.abv || 5.0;
  const ibu = recipe.calculated?.ibu || 30;
  const ebc = recipe.calculated?.ebc || 12;

  const hopNames = (recipe.hops || []).map((h: any) => h.name).filter(Boolean).slice(0, 3).join(', ') || 'традиционных хмелей';
  const grainNames = (recipe.grains || []).map((g: any) => g.name).filter(Boolean).slice(0, 3).join(', ') || 'отборного ячменного солода';
  const yeastName = recipe.yeast?.name || 'чистых элевых дрожжей';

  return {
    styleName: style,
    bjcpCategory: `${style} (BJCP Style Guidelines)`,
    description: `Сорт в стиле «${style}» представляет собой гармоничное сочетание богатой солодовой основы на базе ${grainNames} и выразительного охмеления с использованием ${hopNames}. 

При крепости ${abv}% об. и расчётной горечи ${ibu} IBU пиво демонстрирует выверенный баланс между питкостью и полнотой тела. Сброженное штаммом ${yeastName}, оно раскрывается чистым профилем с мягким, округлым послевкусием.

Цветность ${ebc} EBC формирует приятный визуальный тон с устойчивой пенной шапкой. Напиток отлично подойдет как для вдумчивой дегустации, так и для гастрономического сопровождения сытных блюд.`,
    sensoryProfile: {
      aroma: `Свежий хмелевой букет от сортов ${hopNames} с тонкими зерновыми и карамельными обертонами.`,
      appearance: `Привлекательный оттенок (${ebc} EBC) с плотной мелкозернистой шапкой кремовой пены.`,
      flavor: `Уверенная солодовая основа, сбалансированная хмелевой горечью ${ibu} IBU без резкой терпкости.`,
      mouthfeel: `Округлое среднее тело с деликатной карбонизацией и чистым сухим финишем.`
    },
    highlights: [
      `Сбалансированная плотность и алкоголь (${abv}% ABV)`,
      `Особый хмелевой рисунок (${hopNames})`,
      `Качественная солодовая структура (${grainNames})`
    ],
    commercialExamples: [
      `Классические ремесленные образцы стиля ${style}`,
      `Победители европейских крафтовых кубков`
    ]
  };
}

/**
 * Промпт для глубокого анализа соответствия рецепта / распознанного файла стандартам BJCP (2021)
 */
export function buildBjcpAnalysisPrompt(
  recipe: any,
  rawFileContent?: string,
  targetStyle?: string,
  compressPrompt = false
): string {
  const grains = Array.isArray(recipe.grains)
    ? recipe.grains.map((g: any) => `${g.name}: ${g.weightKg} кг (${g.colorEbc || 5} EBC, тип: ${g.type || 'base'})`).join('; ')
    : 'Не указаны';

  const hops = Array.isArray(recipe.hops)
    ? recipe.hops.map((h: any) => `${h.name}: ${h.weightG} г, ${h.alphaAcid || 6}% альфа, ${h.boilTimeMin || 60} мин (${h.use || 'boil'})`).join('; ')
    : 'Не указаны';

  const yeast = recipe.yeast?.name
    ? `${recipe.yeast.name} (${recipe.yeast.lab || ''}, аттенюация: ${recipe.yeast.attenuationPercent || 78}%)`
    : 'Стандартные элевые дрожжи';

  const og = recipe.calculated?.ogSg || 1.050;
  const fg = recipe.calculated?.fgSg || 1.010;
  const abv = recipe.calculated?.abv || 5.0;
  const ibu = recipe.calculated?.ibu || 30;
  const ebc = recipe.calculated?.ebc || 12;
  const style = targetStyle || recipe.style || 'American Pale Ale';
  const rawSnippet = rawFileContent ? `\n[Исходное содержимое файла (фрагмент)]: ${rawFileContent.slice(0, 1000)}` : '';

  if (compressPrompt) {
    return `Ты — главный судья BJCP. Оцени рецепт на соответствие стилю "${style}".
OG:${og}, FG:${fg}, ABV:${abv}%, IBU:${ibu}, EBC:${ebc}.
Солода:${grains}. Хмели:${hops}. Дрожжи:${yeast}.${rawSnippet}
Ответь ТОЛЬКО валидным JSON:
{"styleName":"${style}","category":"Категория BJCP","overallScore":85,"verdict":"Краткий вердикт соответствия","vitalStats":{"og":{"actual":${og},"target":"1.045 - 1.060","inRange":true},"fg":{"actual":${fg},"target":"1.010 - 1.015","inRange":true},"abv":{"actual":${abv},"target":"4.5 - 6.2%","inRange":true},"ibu":{"actual":${ibu},"target":"30 - 50","inRange":true},"colorEbc":{"actual":${ebc},"target":"10 - 28","inRange":true},"buGuRatio":{"actual":${Number((ibu / ((og - 1) * 1000)).toFixed(2))},"target":"0.6 - 0.8","comment":"Баланс горечи к плотности"}},"grainBillAnalysis":{"summary":"Анализ засыпи","strengths":["Плюс 1"],"recommendations":["Совет по засыпи 1"],"suggestedAdjustments":["Конкретная замена солода или веса"]},"hopScheduleAnalysis":{"summary":"Анализ охмеления","bitternessComment":"Оценка горечи","aromaComment":"Оценка аромата","recommendations":["Совет по охмелению 1"],"suggestedVarieties":["Сорт хмеля"]},"mashAndYeastAdvice":{"mashRecommendations":["Пауза затирания"],"yeastRecommendations":["Дрожжи"],"fermentationTemp":"18-20°C"},"actionableSummary":"Главный вывод"}`;
  }

  return `Ты — сертифицированный судья BJCP (Beer Judge Certification Program) ранга Grand Master и шеф-пивовар крафтовой пивоварни.
Проанализируй рецепт пива на соответствие стилю BJCP "${style}" и дай профессиональные рекомендации по улучшению засыпи (Grain Bill) и подбору охмеления (Hop Schedule).

Параметры рецепта:
- Название: ${recipe.name || 'Крафтовый рецепт'}
- Целевой стиль BJCP: ${style}
- Объем партии: ${recipe.batchSizeL || 25} л, Варка: ${recipe.boilTimeMin || 60} мин
- Расчетные показатели: OG ${og}, FG ${fg}, ABV ${abv}%, IBU ${ibu}, Цвет ${ebc} EBC
- Солодовая засыпь: ${grains}
- Схема охмеления: ${hops}
- Дрожжи: ${yeast}
${rawSnippet}

Сформируй глубокий, практичный анализ в формате СТРОГО валидного JSON без markdown обертки:
{
  "styleName": "${style}",
  "category": "Категория BJCP (например, 21. IPA / 18. Pale American Ale)",
  "overallScore": 85,
  "verdict": "Итоговая оценка соответствия стилю (1-2 предложения)",
  "vitalStats": {
    "og": { "actual": ${og}, "target": "диапазон BJCP", "inRange": true },
    "fg": { "actual": ${fg}, "target": "диапазон BJCP", "inRange": true },
    "abv": { "actual": ${abv}, "target": "диапазон BJCP %", "inRange": true },
    "ibu": { "actual": ${ibu}, "target": "диапазон BJCP", "inRange": true },
    "colorEbc": { "actual": ${ebc}, "target": "диапазон BJCP", "inRange": true },
    "buGuRatio": { "actual": ${Number((ibu / Math.max(1, (og - 1) * 1000)).toFixed(2))}, "target": "целевое соотношение", "comment": "пояснение баланса горечи и тела" }
  },
  "grainBillAnalysis": {
    "summary": "Развернутый анализ солодовой засыпи: баланс базового и спец. солодов, полнота тела, сбраживаемость и цветность",
    "strengths": ["Что сделано отлично в засыпи"],
    "recommendations": ["Конкретные советы по улучшению солодовой засыпи"],
    "suggestedAdjustments": ["Точные рекомендации по изменению пропорций или добавлению/замене солодов"]
  },
  "hopScheduleAnalysis": {
    "summary": "Развернутый анализ охмеления: горечь, позднее внесение, вирпул, сухое охмеление",
    "bitternessComment": "Оценка базовой горечи и гладкости",
    "aromaComment": "Оценка ароматического профиля хмелей и их совместимости",
    "recommendations": ["Конкретные советы по схеме охмеления"],
    "suggestedVarieties": ["Рекомендуемые сочетания хмелей для этого стиля"]
  },
  "mashAndYeastAdvice": {
    "mashRecommendations": ["Рекомендации по паузам затирания (белковая, мальтозная, осахаривание, мэшаут)"],
    "yeastRecommendations": ["Подходящие штаммы дрожжей (сухие и жидкие)"],
    "fermentationTemp": "Оптимальный температурный диапазон брожения"
  },
  "actionableSummary": "Краткое главное руководство к действию для пивовара перед варкой"
}`;
}

/**
 * Надежный офлайн-анализ рецепта на соответствие стилю BJCP (работает 100% без интернета и без API-ключей)
 */
export function generateOfflineBjcpAnalysis(recipe: any, targetStyle?: string) {
  const style = targetStyle || recipe.style || 'American Pale Ale';
  const og = recipe.calculated?.ogSg || 1.050;
  const fg = recipe.calculated?.fgSg || 1.010;
  const abv = recipe.calculated?.abv || 5.0;
  const ibu = recipe.calculated?.ibu || 32;
  const ebc = recipe.calculated?.ebc || 14;

  const buGu = Number((ibu / Math.max(1, (og - 1) * 1000)).toFixed(2));
  const grains = Array.isArray(recipe.grains) ? recipe.grains : [];
  const hops = Array.isArray(recipe.hops) ? recipe.hops : [];

  const totalGrainKg = grains.reduce((acc: number, g: any) => acc + (g.weightKg || 0), 0);
  const caramelGrains = grains.filter((g: any) => g.type === 'caramel' || /(?:cara|карамел|crystal)/i.test(g.name || ''));
  const caramelPct = totalGrainKg > 0 ? (caramelGrains.reduce((acc: number, g: any) => acc + (g.weightKg || 0), 0) / totalGrainKg) * 100 : 0;

  const roastedGrains = grains.filter((g: any) => g.type === 'roasted' || /(?:roast|жжен|black|choc)/i.test(g.name || ''));
  const roastedPct = totalGrainKg > 0 ? (roastedGrains.reduce((acc: number, g: any) => acc + (g.weightKg || 0), 0) / totalGrainKg) * 100 : 0;

  const lateHops = hops.filter((h: any) => (h.boilTimeMin || 0) <= 15 || h.use === 'dry_hop' || h.use === 'whirlpool');
  const bitterHops = hops.filter((h: any) => (h.boilTimeMin || 0) >= 45 && h.use !== 'dry_hop');

  const grainStrengths: string[] = [];
  const grainRecs: string[] = [];
  const grainAdjusts: string[] = [];

  if (caramelPct <= 12) {
    grainStrengths.push('Умеренная доля карамельных солодов (без риска приторности)');
  } else {
    grainRecs.push(`Высокая доля карамельного солода (${caramelPct.toFixed(1)}%). Рекомендуется ограничить до 5-10% для чистоты профиля.`);
    grainAdjusts.push('Уменьшить долю карамельных солодов на 20-30% в пользу базового Pale Ale или Pilsner');
  }

  if (totalGrainKg > 0) {
    grainStrengths.push(`Общая масса засыпи ${totalGrainKg.toFixed(1)} кг обеспечивает достаточный экстракт для плотности ${og}`);
  }

  if (roastedPct > 0 && ebc < 40) {
    grainRecs.push('Жженый солод придает резкость в светлом/янтарном пиве. Вносите его на мэшауте (Cold Steeping) для мягкого цвета.');
  }

  const hopStrengths: string[] = [];
  const hopRecs: string[] = [];

  if (bitterHops.length > 0) {
    hopStrengths.push('Присутствует базовое охмеление первого порядка для формирования чистой основы горечи');
  } else {
    hopRecs.push('Добавьте порцию хмеля за 60 минут до конца варки (например, Magnum или Warrior) для надежного фундамента горечи.');
  }

  if (lateHops.length > 0) {
    hopStrengths.push('Позднее охмеление и вирпул обеспечивают свежий эфирный аромат хмелевых масел');
  } else {
    hopRecs.push('Добавьте порцию ароматического хмеля на вирпул (80°C, 15-20 мин) или сухое охмеление для сочного букета.');
  }

  let buGuTarget = '0.50 - 0.75';
  let buGuComment = 'Сбалансированное соотношение';
  if (buGu > 0.85) {
    buGuComment = 'Выраженная хмелевая доминанта (акцент на горечь)';
  } else if (buGu < 0.45) {
    buGuComment = 'Солодовый акцент с деликатной фоновой горечью';
  }

  return {
    styleName: style,
    category: `BJCP Guidelines (${style})`,
    overallScore: Math.min(94, Math.max(76, Math.round(85 + (buGu > 0.45 && buGu < 0.95 ? 5 : -5)))),
    verdict: `Рецепт имеет хорошую технологическую основу для стиля ${style}. Корректировка пропорций засыпи и времени внесения хмеля позволит идеально попасть в сортовые критерии.`,
    vitalStats: {
      og: { actual: og, target: '1.045 - 1.065', inRange: og >= 1.040 && og <= 1.075 },
      fg: { actual: fg, target: '1.008 - 1.016', inRange: fg >= 1.006 && fg <= 1.018 },
      abv: { actual: abv, target: '4.5 - 6.5%', inRange: abv >= 4.0 && abv <= 7.5 },
      ibu: { actual: ibu, target: '25 - 55', inRange: ibu >= 20 && ibu <= 65 },
      colorEbc: { actual: ebc, target: '8 - 30', inRange: ebc >= 6 && ebc <= 45 },
      buGuRatio: { actual: buGu, target: buGuTarget, comment: buGuComment }
    },
    grainBillAnalysis: {
      summary: `Засыпь состоит из ${grains.length} компонентов общей массой ${totalGrainKg.toFixed(1)} кг. Базовый солод формирует ядро сусла, доля спецсолодов составляет ${(caramelPct + roastedPct).toFixed(1)}%.`,
      strengths: grainStrengths.length > 0 ? grainStrengths : ['Хорошая ферментативная активность засыпи'],
      recommendations: grainRecs.length > 0 ? grainRecs : ['Для большей солодовой глубины можно заменить 10-15% базы на Vienna или Munich'],
      suggestedAdjustments: grainAdjusts.length > 0 ? grainAdjusts : ['Сохранить текущие пропорции, добавив белковую паузу 52°C при использовании немодифицированного солода']
    },
    hopScheduleAnalysis: {
      summary: `Схема включает ${hops.length} внесений хмеля с общей горечью ${ibu} IBU при расчетном показателе BU:GU = ${buGu}.`,
      bitternessComment: `Горечь ${ibu} IBU ${buGu > 0.7 ? 'активно выражена и подчеркивает хмелевой профиль' : 'мягко округляет солодовую сладость'}.`,
      aromaComment: lateHops.length > 0 ? 'Хорошая представленность ароматических фракций.' : 'Рекомендуется усилить позднюю ароматику на 0-5 минутах кипячения.',
      recommendations: hopRecs.length > 0 ? hopRecs : ['Разделите ароматные хмели между вирпулом (80°C) и сухим охмелением на 3-й день активного брожения.'],
      suggestedVarieties: ['Citra, Mosaic, Simcoe (для ярких тропиков)', 'Cascade, Centennial, Chinook (для классической хвои и цитрусов)', 'Saaz, Hallertau Mittelfrüh (для благородного травянистого тона)']
    },
    mashAndYeastAdvice: {
      mashRecommendations: [
        'Мальтозная пауза 65°C (45-50 мин) для высокой сбраживаемости и сухого финиша',
        'Пауза осахаривания 72°C (15-20 мин) для декстринов и стойкости пены',
        'Мэшаут 78°C (10 мин) для фиксации сахаров и снижения вязкости сусла'
      ],
      yeastRecommendations: [
        'SafAle US-05 / Nottingham (чистый профиль для акцента на хмель)',
        'Lallemand Verdant IPA (сочные абрикосовые эфиры)',
        'Fermentis W-34/70 (если варится лагерная версия)'
      ],
      fermentationTemp: '18 - 20°C (гладкое брожение без избыточных высших спиртов)'
    },
    actionableSummary: `Пиво получится сбалансированным. Для максимального попадания в стиль соблюдайте температуру задачи дрожжей (18°C) и не допускайте аэрации сусла после завершения варки.`
  };
}


