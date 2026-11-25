import { Recipe } from '../../types/brewing';
import { createExtendedRecipe, YEAST_W3470, YEAST_US05, YEAST_S04, YEAST_PHILLY_SOUR } from './recipeHelper';

export const HISTORIC_RUSSIAN_RECIPES: Recipe[] = [
  createExtendedRecipe(
    'rec_zhigulevskoe_gost_3473',
    'Жигулевское СССР (ГОСТ 3473-78)',
    'Historical Beer',
    'Исторические и Особые',
    'Подлинный советский рецепт Жигулевского по ГОСТ 3473-78 на ячменном солоде и 15% несоложеном ячмене. Мягкий хлебный вкус, светлый золотистый цвет и тонкий цветочный аромат чувашского хмеля.',
    'Советская Классика',
    20, 90, 76,
    [
      { id: 'g1', name: 'Курский Пилснер (Pilsner Malt)', weightKg: 3.5, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g2', name: 'Несоложеный ячмень', weightKg: 0.65, potentialSg: 1.032, colorEbc: 3.0, type: 'adjunct' },
      { id: 'g3', name: 'Курский Карамельный 50 (Caramel 50 EBC)', weightKg: 0.15, potentialSg: 1.034, colorEbc: 50.0, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Чувашский', weightG: 22, alphaAcid: 4.5, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Подвязный', weightG: 18, alphaAcid: 5.5, boilTimeMin: 20, use: 'boil' },
      { id: 'h3', name: 'Истринский', weightG: 15, alphaAcid: 4.2, boilTimeMin: 5, use: 'aroma' }
    ],
    [
      { id: 'm1', name: 'Белковая пауза', tempC: 52, timeMin: 20, type: 'protein' },
      { id: 'm2', name: 'Мальтозная пауза', tempC: 63, timeMin: 45, type: 'maltose' },
      { id: 'm3', name: 'Осахаривание', tempC: 72, timeMin: 25, type: 'dextrin' },
      { id: 'm4', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_W3470,
    2.6, 11,
    ['СССР', 'Жигулевское', 'ГОСТ', 'Несоложенка', 'Чувашия', 'Лагер']
  ),

  createExtendedRecipe(
    'rec_rizhskoe_ussr',
    'Рижское СССР (Rizhskoe Pale Pilsner)',
    'Czech Pale Lager',
    'Исторические и Особые',
    'Премиальный советский хмелевой сорт 12°P, наследник довоенного Русского Пильзенского. 100% отборный светлый солод, повышенная норма ароматного хмеля и характерная благородная горечь.',
    'Советская Классика',
    20, 75, 75,
    [
      { id: 'g1', name: 'Курский Премиум Пилснер (Premium Pilsner)', weightKg: 4.4, potentialSg: 1.038, colorEbc: 3.4, type: 'base' },
      { id: 'g2', name: 'Курский Десертный (Карамельный 20 EBC)', weightKg: 0.3, potentialSg: 1.033, colorEbc: 20.0, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Подвязный', weightG: 25, alphaAcid: 5.5, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Ранний Московский', weightG: 25, alphaAcid: 3.5, boilTimeMin: 20, use: 'boil' },
      { id: 'h3', name: 'Ранний Московский', weightG: 25, alphaAcid: 3.5, boilTimeMin: 5, use: 'aroma' }
    ],
    [
      { id: 'm1', name: 'Белковая пауза', tempC: 52, timeMin: 15, type: 'protein' },
      { id: 'm2', name: 'Мальтозная пауза', tempC: 64, timeMin: 45, type: 'maltose' },
      { id: 'm3', name: 'Осахаривание', tempC: 72, timeMin: 20, type: 'dextrin' },
      { id: 'm4', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_W3470,
    2.6, 12,
    ['СССР', 'Рижское', 'Пилснер', 'Хмель', 'Курский солод']
  ),

  createExtendedRecipe(
    'rec_dvoinoe_zolotoe_ussr',
    'Двойное Золотое СССР (Dvoynoe Zolotoe 15°)',
    'Historical Beer',
    'Исторические и Особые',
    'Элитный советский сорт высшей категории начальной плотностью 15° Plato. Богатейший золотистый цвет, густое солодовое тело с двойной задачей хмеля и мягким медово-хлебным послевкусием.',
    'Советская Классика',
    20, 90, 74,
    [
      { id: 'g1', name: 'Курский Пилснер (Pilsner Malt)', weightKg: 3.8, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g2', name: 'Курский Венский (Vienna Malt)', weightKg: 1.5, potentialSg: 1.036, colorEbc: 8.5, type: 'base' },
      { id: 'g3', name: 'Курский Карамельный 50 (Caramel 50 EBC)', weightKg: 0.35, potentialSg: 1.034, colorEbc: 50.0, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Чувашский', weightG: 28, alphaAcid: 4.5, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Подвязный', weightG: 25, alphaAcid: 5.5, boilTimeMin: 20, use: 'boil' },
      { id: 'h3', name: 'Истринский', weightG: 20, alphaAcid: 4.2, boilTimeMin: 5, use: 'aroma' }
    ],
    [
      { id: 'm1', name: 'Мальтозная пауза', tempC: 64, timeMin: 50, type: 'maltose' },
      { id: 'm2', name: 'Осахаривание', tempC: 72, timeMin: 25, type: 'dextrin' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_W3470,
    2.5, 11,
    ['СССР', 'Двойное Золотое', 'Плотное', 'Хмель', 'Золотистое']
  ),

  createExtendedRecipe(
    'rec_leningrad_porter_stepan_razin',
    'Ленинградский Портер (Leningrad Porter 20°)',
    'Baltic Porter',
    'Исторические и Особые',
    'Исторический рецепт старейшего завода России «Степан Разин» в Санкт-Петербурге. Плотность 20% Plato, низовое лагерное брожение при 10°C, карамельно-винный вкус с тонами патоки и чернослива.',
    'Петербургские Традиции',
    20, 90, 72,
    [
      { id: 'g1', name: 'Курский Пэйл Эль (Pale Ale Malt)', weightKg: 5.0, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Курский Мюнхенский темный (Munich Typ 2, 25 EBC)', weightKg: 2.0, potentialSg: 1.035, colorEbc: 25.0, type: 'base' },
      { id: 'g3', name: 'Курский Карамельный 150 (Caramel 150 EBC)', weightKg: 0.6, potentialSg: 1.033, colorEbc: 150.0, type: 'caramel' },
      { id: 'g4', name: 'Курский Шоколадный (Chocolate 900 EBC)', weightKg: 0.35, potentialSg: 1.028, colorEbc: 900.0, type: 'roasted' },
      { id: 'g5', name: 'Курский Жженый (Roasted Malt 1400 EBC)', weightKg: 0.15, potentialSg: 1.024, colorEbc: 1400.0, type: 'roasted' }
    ],
    [
      { id: 'h1', name: 'Смолистый', weightG: 30, alphaAcid: 8.5, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Чувашский', weightG: 25, alphaAcid: 4.5, boilTimeMin: 20, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Белковая пауза', tempC: 52, timeMin: 15, type: 'protein' },
      { id: 'm2', name: 'Мальтозная пауза', tempC: 64, timeMin: 55, type: 'maltose' },
      { id: 'm3', name: 'Осахаривание', tempC: 72, timeMin: 25, type: 'dextrin' },
      { id: 'm4', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_W3470,
    2.2, 10,
    ['Портер', 'Ленинградский', 'Степан Разин', 'СССР', 'Балтийский']
  ),

  createExtendedRecipe(
    'rec_taiga_pine_ale',
    'Таежный Хвойный Эль (Siberian Pine Ale)',
    'Herb and Spice Beer',
    'Исторические и Особые',
    'Аутентичный сибирский крафтовый эль со свежими весенними побегами кедровой сосны и пихты. Натуральные смолистые эфирные масла, хвойный лесной аромат и мягкая солодовая подложка.',
    'Сибирские Традиции',
    20, 60, 75,
    [
      { id: 'g1', name: 'Курский Пэйл Эль (Pale Ale Malt)', weightKg: 4.5, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Курский Карамельный 50 (Caramel 50 EBC)', weightKg: 0.4, potentialSg: 1.034, colorEbc: 50.0, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Алтайский', weightG: 25, alphaAcid: 5.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Chinook', weightG: 20, alphaAcid: 13.0, boilTimeMin: 10, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.4, 19,
    ['Сибирь', 'Хвоя', 'Пихта', 'Кедр', 'Лес', 'Крафт'],
    undefined,
    [
      { id: 'o1', name: 'Молодые весенние побеги сосны и пихты', amount: 80, unit: 'g', stage: 'boil', timeMinOrDays: 10, type: 'herb' }
    ]
  ),

  createExtendedRecipe(
    'rec_honey_braggot_slavic',
    'Старославянский Брэггот (Slavic Honey Braggot 9.0%)',
    'Historical Beer',
    'Исторические и Особые',
    'Древнейший напиток славян — гибрид зернового пивного сусла и натурального липового меда. Сбраживается досуха, согревающий медовый букет с цветочными тонами и пряным послевкусием.',
    'Историческое Наследие',
    20, 60, 75,
    [
      { id: 'g1', name: 'Курский Пэйл Эль (Pale Ale Malt)', weightKg: 4.5, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Курский Пшеничный светлый (Wheat Malt)', weightKg: 1.0, potentialSg: 1.038, colorEbc: 4.5, type: 'wheat' }
    ],
    [
      { id: 'h1', name: 'Подвязный', weightG: 25, alphaAcid: 5.5, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Истринский', weightG: 20, alphaAcid: 4.2, boilTimeMin: 15, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Сухое осахаривание', tempC: 64, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_S04,
    2.4, 19,
    ['Брэггот', 'Мед', 'Старославянское', 'Крепкое', 'Цветы'],
    undefined,
    [
      { id: 'o1', name: 'Натуральный цветочный липовый мед', amount: 1200, unit: 'g', stage: 'boil', timeMinOrDays: 5, type: 'sugar', extractPercent: 82, fermentablePercent: 100 }
    ]
  ),

  createExtendedRecipe(
    'rec_birch_sap_pale_ale',
    'Березовый Светлый Эль (Birch Sap Pale Ale)',
    'Experimental Beer',
    'Исторические и Особые',
    'Уникальный сезонный весенний эль, сваренный целиком на чистом березовом соке вместо обычной воды. Нежная древесная минеральность, естественные микроэлементы и тончайшая сладость.',
    'МастерВарка Крафт',
    20, 60, 75,
    [
      { id: 'g1', name: 'Курский Премиум Пилснер (Premium Pilsner)', weightKg: 4.0, potentialSg: 1.038, colorEbc: 3.4, type: 'base' },
      { id: 'g2', name: 'Курский Венский (Vienna Malt)', weightKg: 0.8, potentialSg: 1.036, colorEbc: 8.5, type: 'base' }
    ],
    [
      { id: 'h1', name: 'Московский', weightG: 20, alphaAcid: 3.8, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Серебрянка', weightG: 20, alphaAcid: 3.6, boilTimeMin: 15, use: 'boil' },
      { id: 'h3', name: 'Ранний Московский', weightG: 20, alphaAcid: 3.5, boilTimeMin: 0, use: 'whirlpool' }
    ],
    [
      { id: 'm1', name: 'Осахаривание на березовом соке', tempC: 65, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.4, 19,
    ['Березовый сок', 'Весна', 'Россия', 'Эль', 'Минеральное']
  ),

  createExtendedRecipe(
    'rec_siberian_cedar_stout',
    'Кедровый Сибирский Стаут (Cedar Pine Nut Stout)',
    'Specialty Stout',
    'Исторические и Особые',
    'Глубокий непроницаемый стаут с добавлением измельченного кедрового ореха и натурального кедрового жмыха. Ореховая глубина, смолистый шлейф и шоколадно-кофейная основа.',
    'Сибирские Традиции',
    20, 60, 72,
    [
      { id: 'g1', name: 'Курский Пэйл Эль (Pale Ale Malt)', weightKg: 4.6, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Курский Шоколадный (Chocolate 900 EBC)', weightKg: 0.45, potentialSg: 1.028, colorEbc: 900.0, type: 'roasted' },
      { id: 'g3', name: 'Курский Жженый ячмень (Roasted Barley 1100 EBC)', weightKg: 0.35, potentialSg: 1.025, colorEbc: 1100.0, type: 'roasted' },
      { id: 'g4', name: 'Курский Карамельный 150 (Caramel 150 EBC)', weightKg: 0.4, potentialSg: 1.033, colorEbc: 150.0, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Смолистый', weightG: 25, alphaAcid: 8.5, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Алтайский', weightG: 20, alphaAcid: 5.0, boilTimeMin: 15, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Полнотелое затирание', tempC: 68, timeMin: 65, type: 'dextrin' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_S04,
    2.1, 19,
    ['Стаут', 'Кедр', 'Орех', 'Сибирь', 'Шоколад'],
    undefined,
    [
      { id: 'o1', name: 'Обезжиренный жмых сибирского кедрового ореха', amount: 200, unit: 'g', stage: 'mash', type: 'other' }
    ]
  )
];
