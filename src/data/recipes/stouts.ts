import { Recipe } from '../../types/brewing';
import { createExtendedRecipe, YEAST_S04, YEAST_US05, YEAST_W3470, YEAST_S33 } from './recipeHelper';

export const STOUT_RECIPES: Recipe[] = [
  createExtendedRecipe(
    'rec_foreign_extra_stout',
    'Тропический Экспортный (Foreign Extra Stout)',
    'Foreign Extra Stout',
    'Темные эли / Портеры',
    'Мощный, согревающий экспортный стаут в стиле Guinness Foreign Extra. Высокая плотность (18°P), насыщенные тона темного горького шоколада, чернослива и смолистая английская горечь.',
    'Британское Наследие',
    20, 60, 72,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 5.5, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Roasted Barley (Жженый ячмень)', weightKg: 0.5, potentialSg: 1.025, colorEbc: 1100.0, type: 'roasted' },
      { id: 'g3', name: 'Chocolate Malt', weightKg: 0.35, potentialSg: 1.028, colorEbc: 900.0, type: 'roasted' },
      { id: 'g4', name: 'Caramunich III', weightKg: 0.3, potentialSg: 1.033, colorEbc: 150.0, type: 'caramel' },
      { id: 'g5', name: 'Flaked Barley', weightKg: 0.4, potentialSg: 1.032, colorEbc: 3.5, type: 'adjunct' }
    ],
    [
      { id: 'h1', name: 'Target', weightG: 35, alphaAcid: 11.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'East Kent Goldings', weightG: 25, alphaAcid: 5.0, boilTimeMin: 15, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 65, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_S04,
    2.2, 19,
    ['Стаут', 'Экспортный', 'Шоколад', 'Крепкое', 'Ирландия']
  ),

  createExtendedRecipe(
    'rec_coffee_stout_arabica',
    'Колумбийский Эспрессо (Coffee Arabica Stout)',
    'American Stout',
    'Темные эли / Портеры',
    'Потрясающий кофейный стаут с добавлением свежемолотой арабики холодной экстракции (cold brew). Шелковистая солодовая база с ярким ароматом свежесваренного утреннего эспрессо.',
    'МастерВарка Крафт',
    20, 60, 72,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 4.8, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Flaked Oats', weightKg: 0.6, potentialSg: 1.033, colorEbc: 2.5, type: 'adjunct' },
      { id: 'g3', name: 'Chocolate Malt', weightKg: 0.4, potentialSg: 1.028, colorEbc: 900.0, type: 'roasted' },
      { id: 'g4', name: 'Roasted Barley', weightKg: 0.3, potentialSg: 1.025, colorEbc: 1100.0, type: 'roasted' },
      { id: 'g5', name: 'Caramunich II', weightKg: 0.3, potentialSg: 1.034, colorEbc: 120.0, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Northern Brewer', weightG: 30, alphaAcid: 9.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Willamette', weightG: 20, alphaAcid: 5.0, boilTimeMin: 10, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Полнотелое осахаривание', tempC: 67, timeMin: 60, type: 'dextrin' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.2, 19,
    ['Стаут', 'Кофе', 'Эспрессо', 'Арабика', 'Шоколад'],
    undefined,
    [
      { id: 'o1', name: 'Свежемолотый кофе Колумбия Колд-Брю', amount: 150, unit: 'g', stage: 'secondary', timeMinOrDays: 3, type: 'flavor' }
    ]
  ),

  createExtendedRecipe(
    'rec_chocolate_fudge_stout',
    'Шоколадный Фадж (Chocolate Fudge Stout)',
    'Sweet Stout',
    'Темные эли / Портеры',
    'Невероятно густой десертный стаут с какао-бобами и лактозой. Во вкусе сливочный шоколадный крем, ваниль и легкий карамельный шлейф без излишней горечи.',
    'МастерВарка Крафт',
    20, 60, 72,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 4.4, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Munich I', weightKg: 0.8, potentialSg: 1.036, colorEbc: 15.0, type: 'base' },
      { id: 'g3', name: 'Chocolate Malt', weightKg: 0.5, potentialSg: 1.028, colorEbc: 900.0, type: 'roasted' },
      { id: 'g4', name: 'Caramunich II', weightKg: 0.4, potentialSg: 1.034, colorEbc: 120.0, type: 'caramel' },
      { id: 'g5', name: 'Carafa Special I', weightKg: 0.2, potentialSg: 1.029, colorEbc: 900.0, type: 'roasted' }
    ],
    [
      { id: 'h1', name: 'Fuggles', weightG: 30, alphaAcid: 4.5, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'East Kent Goldings', weightG: 20, alphaAcid: 5.0, boilTimeMin: 15, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Полнотелое осахаривание', tempC: 68, timeMin: 60, type: 'dextrin' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_S04,
    2.1, 19,
    ['Стаут', 'Шоколад', 'Лактоза', 'Десертное', 'Какао'],
    undefined,
    [
      { id: 'o1', name: 'Лактоза (молочный сахар)', amount: 500, unit: 'g', stage: 'boil', timeMinOrDays: 10, type: 'sugar', fermentablePercent: 10 },
      { id: 'o2', name: 'Натуральная какао-крупка обжаренная', amount: 120, unit: 'g', stage: 'secondary', timeMinOrDays: 5, type: 'flavor' }
    ]
  ),

  createExtendedRecipe(
    'rec_bourbon_vanilla_stout',
    'Бурбон и Мадагаскарская Ваниль (Bourbon Oak Stout)',
    'Wood-Aged Beer',
    'Темные эли / Портеры',
    'Роскошный стаут, выдержанный на дубовых чипсах американского дуба, вымоченных в бурбоне с натуральными стручками мадагаскарской ванили. Бархатный, согревающий и благородный.',
    'Крафтовая Волна',
    20, 75, 71,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 5.4, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Flaked Oats', weightKg: 0.8, potentialSg: 1.033, colorEbc: 2.5, type: 'adjunct' },
      { id: 'g3', name: 'Special B', weightKg: 0.4, potentialSg: 1.032, colorEbc: 300.0, type: 'caramel' },
      { id: 'g4', name: 'Chocolate Malt', weightKg: 0.4, potentialSg: 1.028, colorEbc: 900.0, type: 'roasted' },
      { id: 'g5', name: 'Roasted Barley', weightKg: 0.35, potentialSg: 1.025, colorEbc: 1100.0, type: 'roasted' }
    ],
    [
      { id: 'h1', name: 'Magnum', weightG: 25, alphaAcid: 14.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'East Kent Goldings', weightG: 25, alphaAcid: 5.0, boilTimeMin: 15, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 67, timeMin: 65, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.1, 19,
    ['Стаут', 'Бурбон', 'Дуб', 'Ваниль', 'Бочка'],
    undefined,
    [
      { id: 'o1', name: 'Дубовая щепа сильного обжига (вымоченная в бурбоне)', amount: 60, unit: 'g', stage: 'secondary', timeMinOrDays: 14, type: 'wood' },
      { id: 'o2', name: 'Стручок бурбонской ванили', amount: 2, unit: 'pcs', stage: 'secondary', timeMinOrDays: 7, type: 'spice' }
    ]
  ),

  createExtendedRecipe(
    'rec_pastry_tonka_maple_stout',
    'Кленовый Пастри-Стаут (Maple & Tonka Pastry Stout)',
    'Pastry Stout',
    'Темные эли / Портеры',
    'Ультра-плотный пастри-стаут начальной плотностью 24° Plato. Экстракт бобов тонка с нотами миндаля, марципана и вишневой косточки в сочетании с натуральным кленовым сиропом.',
    'МастерВарка Крафт',
    20, 90, 68,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 6.5, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Munich II', weightKg: 1.5, potentialSg: 1.035, colorEbc: 25.0, type: 'base' },
      { id: 'g3', name: 'Flaked Oats', weightKg: 1.0, potentialSg: 1.033, colorEbc: 2.5, type: 'adjunct' },
      { id: 'g4', name: 'Chocolate Malt', weightKg: 0.6, potentialSg: 1.028, colorEbc: 900.0, type: 'roasted' },
      { id: 'g5', name: 'Special B', weightKg: 0.5, potentialSg: 1.032, colorEbc: 300.0, type: 'caramel' },
      { id: 'g6', name: 'Roasted Barley', weightKg: 0.4, potentialSg: 1.025, colorEbc: 1100.0, type: 'roasted' }
    ],
    [
      { id: 'h1', name: 'Columbus', weightG: 30, alphaAcid: 15.0, boilTimeMin: 60, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Полнотелое затирание', tempC: 69, timeMin: 70, type: 'dextrin' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    1.9, 19,
    ['Пастри-стаут', 'Клен', 'Бобы тонка', 'Десерт', 'Плотное'],
    undefined,
    [
      { id: 'o1', name: 'Лактоза (молочный сахар)', amount: 700, unit: 'g', stage: 'boil', timeMinOrDays: 10, type: 'sugar', fermentablePercent: 10 },
      { id: 'o2', name: 'Натуральный кленовый сироп', amount: 300, unit: 'ml', stage: 'secondary', timeMinOrDays: 7, type: 'sugar', fermentablePercent: 90 }
    ]
  ),

  createExtendedRecipe(
    'rec_coconut_porter_toasted',
    'Поджаренный Кокос (Toasted Coconut Porter)',
    'Robust Porter',
    'Темные эли / Портеры',
    'Ароматный десертный портер с добавлением бережно обжаренной до золотистого цвета кокосовой стружки. Сочетается с карамельно-шоколадной базой английских солодов.',
    'Крафтовая Волна',
    20, 60, 74,
    [
      { id: 'g1', name: 'Maris Otter', weightKg: 4.2, potentialSg: 1.038, colorEbc: 6.5, type: 'base' },
      { id: 'g2', name: 'Munich I', weightKg: 0.8, potentialSg: 1.036, colorEbc: 15.0, type: 'base' },
      { id: 'g3', name: 'Caramunich II', weightKg: 0.4, potentialSg: 1.034, colorEbc: 120.0, type: 'caramel' },
      { id: 'g4', name: 'Chocolate Malt', weightKg: 0.35, potentialSg: 1.028, colorEbc: 900.0, type: 'roasted' },
      { id: 'g5', name: 'Black Malt', weightKg: 0.1, potentialSg: 1.025, colorEbc: 1300.0, type: 'roasted' }
    ],
    [
      { id: 'h1', name: 'Fuggles', weightG: 30, alphaAcid: 4.5, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'East Kent Goldings', weightG: 20, alphaAcid: 5.0, boilTimeMin: 15, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 67, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_S04,
    2.3, 19,
    ['Портер', 'Кокос', 'Шоколад', 'Десертное', 'Англия'],
    undefined,
    [
      { id: 'o1', name: 'Кокосовая стружка подсушенная в духовке', amount: 200, unit: 'g', stage: 'secondary', timeMinOrDays: 5, type: 'flavor' }
    ]
  ),

  createExtendedRecipe(
    'rec_smoked_porter_alaska',
    'Аляскинский Копченый (Alaskan Smoked Porter)',
    'Smoked Beer',
    'Темные эли / Портеры',
    'Культовый темный эль в стиле пивоварни Alaskan Brewing. Сварен на 30% буковом копченом солоде Weyermann. Гармония сухофруктов, горького шоколада и теплого походного дыма.',
    'Крафтовая Волна',
    20, 60, 74,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 3.5, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Smoked Malt (Копченый солод)', weightKg: 1.5, potentialSg: 1.036, colorEbc: 6.0, type: 'base' },
      { id: 'g3', name: 'Caramunich II', weightKg: 0.4, potentialSg: 1.034, colorEbc: 120.0, type: 'caramel' },
      { id: 'g4', name: 'Chocolate Malt', weightKg: 0.35, potentialSg: 1.028, colorEbc: 900.0, type: 'roasted' }
    ],
    [
      { id: 'h1', name: 'Willamette', weightG: 30, alphaAcid: 5.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Willamette', weightG: 20, alphaAcid: 5.0, boilTimeMin: 15, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 67, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.3, 19,
    ['Портер', 'Копченое', 'Аляска', 'Дым', 'Шоколад']
  ),

  createExtendedRecipe(
    'rec_english_dark_mild_trad',
    'Традиционный Темный Майлд (English Dark Mild)',
    'Dark Mild',
    'Темные эли / Портеры',
    'Исторический пабный сорт бирмингемских рабочих. Легкая крепость (3.5% ABV) сочетается с поразительной глубиной солодового вкуса: карамель, поджаренные тосты и изюм.',
    'Британское Наследие',
    20, 60, 75,
    [
      { id: 'g1', name: 'Maris Otter', weightKg: 2.8, potentialSg: 1.038, colorEbc: 6.5, type: 'base' },
      { id: 'g2', name: 'Caramunich II', weightKg: 0.35, potentialSg: 1.034, colorEbc: 120.0, type: 'caramel' },
      { id: 'g3', name: 'Chocolate Malt', weightKg: 0.18, potentialSg: 1.028, colorEbc: 900.0, type: 'roasted' },
      { id: 'g4', name: 'Carapils', weightKg: 0.15, potentialSg: 1.033, colorEbc: 4.5, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Fuggles', weightG: 20, alphaAcid: 4.5, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'East Kent Goldings', weightG: 12, alphaAcid: 5.0, boilTimeMin: 15, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Полнотелое осахаривание', tempC: 68, timeMin: 60, type: 'dextrin' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_S04,
    1.8, 19,
    ['Майлд', 'Англия', 'Легкое', 'Паб', 'Карамель']
  )
];
