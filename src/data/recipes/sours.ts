import { Recipe } from '../../types/brewing';
import { createExtendedRecipe, YEAST_PHILLY_SOUR, YEAST_US05, YEAST_WB06 } from './recipeHelper';

export const SOUR_RECIPES: Recipe[] = [
  createExtendedRecipe(
    'rec_tomato_gose_italian',
    'Сицилийское Томатное Гозе (Italian Tomato Gose)',
    'Specialty Gose',
    'Кислые эли',
    'Знаменитый крафтовый хит — томатное гозе с натуральным протертым соком томатов, морской солью, кориандром, сушеным базиликом и орегано. Невероятно освежающий гастрономический эль.',
    'МастерВарка Крафт',
    20, 60, 74,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 2.2, potentialSg: 1.037, colorEbc: 3.5, type: 'base' },
      { id: 'g2', name: 'Wheat Malt (Пшеничный светлый)', weightKg: 1.8, potentialSg: 1.038, colorEbc: 4.0, type: 'wheat' },
      { id: 'g3', name: 'Acidulated Malt (Кислый солод)', weightKg: 0.3, potentialSg: 1.027, colorEbc: 4.5, type: 'acid' }
    ],
    [
      { id: 'h1', name: 'Hallertau Mittelfrüh', weightG: 15, alphaAcid: 4.0, boilTimeMin: 60, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_PHILLY_SOUR,
    2.6, 20,
    ['Кислый эль', 'Гозе', 'Томатное', 'Базилик', 'Морская соль', 'Крафт'],
    undefined,
    [
      { id: 'o1', name: 'Морская соль пищевая', amount: 25, unit: 'g', stage: 'boil', timeMinOrDays: 10, type: 'spice' },
      { id: 'o2', name: 'Зерна кориандра дробленые', amount: 15, unit: 'g', stage: 'boil', timeMinOrDays: 10, type: 'spice' },
      { id: 'o3', name: 'Натуральная томатная паста / пюре', amount: 1500, unit: 'g', stage: 'secondary', timeMinOrDays: 4, type: 'fruit' },
      { id: 'o4', name: 'Сушеный базилик и орегано', amount: 10, unit: 'g', stage: 'secondary', timeMinOrDays: 4, type: 'herb' }
    ]
  ),

  createExtendedRecipe(
    'rec_spicy_bbq_tomato_gose',
    'Острое Томатное BBQ Гозе (Spicy BBQ Tomato Gose)',
    'Specialty Gose',
    'Кислые эли',
    'Пряная и копченая вариация томатного гозе. Буковый копченый солод, дробленый чили кайен, копченая паприка и морская соль. Настоящий шашлычный эль!',
    'МастерВарка Крафт',
    20, 60, 74,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 1.8, potentialSg: 1.037, colorEbc: 3.5, type: 'base' },
      { id: 'g2', name: 'Wheat Malt', weightKg: 1.6, potentialSg: 1.038, colorEbc: 4.0, type: 'wheat' },
      { id: 'g3', name: 'Smoked Malt (Копченый солод)', weightKg: 0.6, potentialSg: 1.036, colorEbc: 6.0, type: 'base' }
    ],
    [
      { id: 'h1', name: 'Perle', weightG: 12, alphaAcid: 7.0, boilTimeMin: 60, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_PHILLY_SOUR,
    2.5, 20,
    ['Кислый эль', 'Гозе', 'Томатное', 'Чили', 'Копченое', 'BBQ'],
    undefined,
    [
      { id: 'o1', name: 'Морская соль', amount: 25, unit: 'g', stage: 'boil', timeMinOrDays: 10, type: 'spice' },
      { id: 'o2', name: 'Копченая паприка и перец чили хлопья', amount: 12, unit: 'g', stage: 'secondary', timeMinOrDays: 3, type: 'spice' },
      { id: 'o3', name: 'Томатный сок с мякотью', amount: 1500, unit: 'g', stage: 'secondary', timeMinOrDays: 4, type: 'fruit' }
    ]
  ),

  createExtendedRecipe(
    'rec_raspberry_berliner_weisse',
    'Берлинская Малина (Raspberry Berliner Weisse)',
    'Berliner Weisse',
    'Кислые эли',
    'Освежающий исторический кислый пшеничный эль Берлина с добавлением ароматного пюре спелой лесной малины. Нежная искрящаяся кислотность молочнокислого брожения и яркий рубиновый цвет.',
    'Крафтовая Волна',
    20, 60, 75,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 1.8, potentialSg: 1.037, colorEbc: 3.5, type: 'base' },
      { id: 'g2', name: 'Wheat Malt', weightKg: 1.6, potentialSg: 1.038, colorEbc: 4.0, type: 'wheat' }
    ],
    [
      { id: 'h1', name: 'Hallertau Mittelfrüh', weightG: 10, alphaAcid: 4.0, boilTimeMin: 60, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 65, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_PHILLY_SOUR,
    3.0, 20,
    ['Кислый эль', 'Берлинер', 'Малина', 'Ягоды', 'Освежающее'],
    undefined,
    [
      { id: 'o1', name: 'Натуральное малиновое пюре без косточек', amount: 1200, unit: 'g', stage: 'secondary', timeMinOrDays: 5, type: 'fruit', colorEbc: 15 }
    ]
  ),

  createExtendedRecipe(
    'rec_passion_fruit_guava_gose',
    'Тропический Рай (Passion Fruit & Guava Gose)',
    'Specialty Gose',
    'Кислые эли',
    'Сочное современное гозе с маракуйей и розовой гуавой. Кисло-соленый профиль пшеничной основы безупречно оттеняет взрывную экзотическую сладость тропических фруктов.',
    'Крафтовая Волна',
    20, 60, 74,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 2.2, potentialSg: 1.037, colorEbc: 3.5, type: 'base' },
      { id: 'g2', name: 'Wheat Malt', weightKg: 1.8, potentialSg: 1.038, colorEbc: 4.0, type: 'wheat' }
    ],
    [
      { id: 'h1', name: 'Hallertau Blanc', weightG: 12, alphaAcid: 9.5, boilTimeMin: 60, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 65, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_PHILLY_SOUR,
    2.7, 20,
    ['Кислый эль', 'Гозе', 'Маракуйя', 'Гуава', 'Тропики'],
    undefined,
    [
      { id: 'o1', name: 'Морская соль', amount: 20, unit: 'g', stage: 'boil', timeMinOrDays: 10, type: 'spice' },
      { id: 'o2', name: 'Кориандр зерна', amount: 15, unit: 'g', stage: 'boil', timeMinOrDays: 10, type: 'spice' },
      { id: 'o3', name: 'Пюре маракуйи и гуавы', amount: 1200, unit: 'g', stage: 'secondary', timeMinOrDays: 5, type: 'fruit' }
    ]
  ),

  createExtendedRecipe(
    'rec_catharina_sour_mango',
    'Катарина Саур Манго (Catharina Sour Mango)',
    'Catharina Sour',
    'Кислые эли',
    'Традиционный бразильский стиль кислого фруктового эля Catharina Sour. Легкая плотность, освежающая молочнокислая кислинка и массивная закладка сочного манго и маракуйи.',
    'МастерВарка Крафт',
    20, 60, 75,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 2.2, potentialSg: 1.037, colorEbc: 3.5, type: 'base' },
      { id: 'g2', name: 'Wheat Malt', weightKg: 1.7, potentialSg: 1.038, colorEbc: 4.0, type: 'wheat' }
    ],
    [
      { id: 'h1', name: 'Saaz', weightG: 12, alphaAcid: 3.8, boilTimeMin: 60, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 65, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_PHILLY_SOUR,
    2.7, 20,
    ['Кислый эль', 'Катарина Саур', 'Бразилия', 'Манго', 'Тропики'],
    undefined,
    [
      { id: 'o1', name: 'Пюре спелого сочного манго', amount: 1500, unit: 'g', stage: 'secondary', timeMinOrDays: 5, type: 'fruit' }
    ]
  ),

  createExtendedRecipe(
    'rec_pickle_dill_gose',
    'Огуречный Рассол (Pickle Dill Gose)',
    'Specialty Gose',
    'Кислые эли',
    'Аутентичный гастрономический хит — гозе с укропом, чесноком и огуречным соком. Идеальное утреннее восстановление с благородной кислотностью и соленым минеральным финишем.',
    'МастерВарка Крафт',
    20, 60, 74,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 2.4, potentialSg: 1.037, colorEbc: 3.5, type: 'base' },
      { id: 'g2', name: 'Wheat Malt', weightKg: 1.6, potentialSg: 1.038, colorEbc: 4.0, type: 'wheat' }
    ],
    [
      { id: 'h1', name: 'Hallertau Tradition', weightG: 12, alphaAcid: 5.5, boilTimeMin: 60, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_PHILLY_SOUR,
    2.6, 20,
    ['Кислый эль', 'Гозе', 'Огурец', 'Укроп', 'Рассол', 'Соль'],
    undefined,
    [
      { id: 'o1', name: 'Морская пищевая соль', amount: 25, unit: 'g', stage: 'boil', timeMinOrDays: 10, type: 'spice' },
      { id: 'o2', name: 'Зонтики и семена укропа', amount: 15, unit: 'g', stage: 'secondary', timeMinOrDays: 3, type: 'herb' },
      { id: 'o3', name: 'Свежевыжатый сок грунтовых огурцов', amount: 1000, unit: 'ml', stage: 'secondary', timeMinOrDays: 3, type: 'fruit' }
    ]
  ),

  createExtendedRecipe(
    'rec_flanders_red_rodenbach',
    'Фламандский Рубин (Flanders Red Ale)',
    'Flanders Red Ale',
    'Кислые эли',
    '«Бургундское пиво Бельгии» в стиле легендарного Rodenbach Alexander. Глубокий рубиновый цвет, винный уксусно-яблочный букет выдержки в дубовых фудерах, ноты вишни и бальзамика.',
    'Фламандские Традиции',
    20, 90, 72,
    [
      { id: 'g1', name: 'Vienna Malt', weightKg: 2.5, potentialSg: 1.036, colorEbc: 8.5, type: 'base' },
      { id: 'g2', name: 'Munich I', weightKg: 1.5, potentialSg: 1.036, colorEbc: 15.0, type: 'base' },
      { id: 'g3', name: 'Special B', weightKg: 0.4, potentialSg: 1.032, colorEbc: 300.0, type: 'caramel' },
      { id: 'g4', name: 'Caramunich II', weightKg: 0.35, potentialSg: 1.034, colorEbc: 120.0, type: 'caramel' },
      { id: 'g5', name: 'Carafa Special I', weightKg: 0.05, potentialSg: 1.029, colorEbc: 900.0, type: 'roasted' }
    ],
    [
      { id: 'h1', name: 'East Kent Goldings', weightG: 20, alphaAcid: 5.0, boilTimeMin: 60, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Мальтозная пауза', tempC: 64, timeMin: 50, type: 'maltose' },
      { id: 'm2', name: 'Осахаривание', tempC: 72, timeMin: 25, type: 'dextrin' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_PHILLY_SOUR,
    2.4, 20,
    ['Кислый эль', 'Фландрия', 'Красный эль', 'Винное', 'Дуб'],
    undefined,
    [
      { id: 'o1', name: 'Французская дубовая щепа среднего обжига', amount: 50, unit: 'g', stage: 'secondary', timeMinOrDays: 30, type: 'wood' }
    ]
  ),

  createExtendedRecipe(
    'rec_oude_kriek_lambic',
    'Брюссельский Крик (Oude Kriek Lambic)',
    'Fruit Lambic',
    'Кислые эли',
    'Традиционный бельгийский спонтанный эль с выдержкой на цельных ягодах дикой вишни Морелло. Сухое, винное, с выраженным ароматом вишневой косточки и характерным диким профилем.',
    'Традиции Пайоттенланда',
    20, 90, 72,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 3.2, potentialSg: 1.037, colorEbc: 3.5, type: 'base' },
      { id: 'g2', name: 'Несоложеная пшеница (Raw Wheat)', weightKg: 1.6, potentialSg: 1.036, colorEbc: 3.5, type: 'adjunct' }
    ],
    [
      { id: 'h1', name: 'Aged Hops (Состаренный 3-летний хмель)', weightG: 30, alphaAcid: 1.5, boilTimeMin: 90, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Турбидное затирание (мутное)', tempC: 62, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Декстриновая', tempC: 72, timeMin: 30, type: 'dextrin' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_PHILLY_SOUR,
    2.8, 19,
    ['Кислый эль', 'Ламбик', 'Крик', 'Вишня', 'Бельгия'],
    undefined,
    [
      { id: 'o1', name: 'Свежая вишня с косточкой', amount: 2500, unit: 'g', stage: 'secondary', timeMinOrDays: 60, type: 'fruit' }
    ]
  ),

  createExtendedRecipe(
    'rec_sea_buckthorn_sour',
    'Облепиховый Северный Саур (Sea Buckthorn Sour)',
    'Wild Specialty Beer',
    'Кислые эли',
    'Яркий северный саур-эль с соком дикой облепихи. Солнечный оранжевый цвет, освежающая ягодная терпкость и натуральная маслянистая текстура спелой сибирской облепихи.',
    'МастерВарка Крафт',
    20, 60, 74,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 2.5, potentialSg: 1.037, colorEbc: 3.5, type: 'base' },
      { id: 'g2', name: 'Wheat Malt', weightKg: 1.5, potentialSg: 1.038, colorEbc: 4.0, type: 'wheat' }
    ],
    [
      { id: 'h1', name: 'Hallertau Blanc', weightG: 15, alphaAcid: 9.5, boilTimeMin: 60, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 65, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_PHILLY_SOUR,
    2.6, 20,
    ['Кислый эль', 'Облепиха', 'Северное', 'Ягоды', 'Сибирь'],
    undefined,
    [
      { id: 'o1', name: 'Свежевыжатый сок дикой облепихи', amount: 1000, unit: 'ml', stage: 'secondary', timeMinOrDays: 5, type: 'fruit', colorEbc: 12 }
    ]
  )
];
