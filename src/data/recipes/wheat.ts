import { Recipe } from '../../types/brewing';
import { createExtendedRecipe, YEAST_WB06, YEAST_M21, YEAST_US05 } from './recipeHelper';

export const WHEAT_RECIPES: Recipe[] = [
  createExtendedRecipe(
    'rec_weizenbock_vitus',
    'Вайценбок Святого Вита (Weizenbock)',
    'Weizenbock',
    'Пшеничное',
    'Могучий баварский пшеничный бок в стиле Weihenstephaner Vitus. Богатейший букет сушеных бананов, пряной гвоздики, ванили и меда с мягкой кремовой пеной и согревающей крепостью 7.7%.',
    'Баварские Традиции',
    20, 75, 73,
    [
      { id: 'g1', name: 'Wheat Malt (Пшеничный светлый)', weightKg: 3.8, potentialSg: 1.038, colorEbc: 4.0, type: 'wheat' },
      { id: 'g2', name: 'Pilsner Malt', weightKg: 2.2, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g3', name: 'Munich I', weightKg: 1.2, potentialSg: 1.036, colorEbc: 15.0, type: 'base' },
      { id: 'g4', name: 'Caramunich I', weightKg: 0.3, potentialSg: 1.034, colorEbc: 90.0, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Hallertau Magnum', weightG: 18, alphaAcid: 14.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Hallertau Mittelfrüh', weightG: 20, alphaAcid: 4.0, boilTimeMin: 15, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Феруловая пауза (гвоздика)', tempC: 44, timeMin: 15, type: 'acid' },
      { id: 'm2', name: 'Белковая пауза', tempC: 52, timeMin: 15, type: 'protein' },
      { id: 'm3', name: 'Мальтозная пауза', tempC: 64, timeMin: 45, type: 'maltose' },
      { id: 'm4', name: 'Осахаривание', tempC: 72, timeMin: 25, type: 'dextrin' },
      { id: 'm5', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_WB06,
    2.8, 18,
    ['Пшеничное', 'Вайценбок', 'Бавария', 'Крепкое', 'Банан']
  ),

  createExtendedRecipe(
    'rec_roggenbier_bavarian_rye',
    'Баварское Ржаное (Roggenbier)',
    'Roggenbier',
    'Пшеничное',
    'Традиционный средневековый немецкий ржаной эль. Добавление 45% ржаного солода придает бархатистую хлебную густоту, переплетающуюся с бананово-гвоздичными эфирами вайценовских дрожжей.',
    'Франконские Традиции',
    20, 60, 72,
    [
      { id: 'g1', name: 'Курский Ржаной светлый', weightKg: 2.4, potentialSg: 1.036, colorEbc: 8.0, type: 'adjunct' },
      { id: 'g2', name: 'Munich I', weightKg: 1.5, potentialSg: 1.036, colorEbc: 15.0, type: 'base' },
      { id: 'g3', name: 'Pilsner Malt', weightKg: 1.0, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g4', name: 'Caramunich II', weightKg: 0.35, potentialSg: 1.034, colorEbc: 120.0, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Perle', weightG: 22, alphaAcid: 7.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Tettnanger', weightG: 18, alphaAcid: 4.2, boilTimeMin: 15, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Глюканазная пауза для фильтрации ржи', tempC: 45, timeMin: 25, type: 'protein' },
      { id: 'm2', name: 'Мальтозная пауза', tempC: 64, timeMin: 45, type: 'maltose' },
      { id: 'm3', name: 'Декстриновая', tempC: 72, timeMin: 20, type: 'dextrin' },
      { id: 'm4', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_WB06,
    2.7, 19,
    ['Пшеничное', 'Ржаное', 'Германия', 'Роггенбир', 'Хлеб']
  ),

  createExtendedRecipe(
    'rec_hopfenweisse_tap5',
    'Охмеленный Вайцен (Hopfenweisse Tap 5)',
    'Hopfenweisse',
    'Пшеничное',
    'Культовый гибрид баварского пшеничного пива и американского IPA (стиль Schneider & Brooklyner Hopfenweisse). Банановые эфиры переплетаются с мощным цитрусовым зарядом хмеля Amarillo.',
    'Крафтовая Волна',
    20, 75, 73,
    [
      { id: 'g1', name: 'Wheat Malt', weightKg: 3.6, potentialSg: 1.038, colorEbc: 4.0, type: 'wheat' },
      { id: 'g2', name: 'Pilsner Malt', weightKg: 2.4, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g3', name: 'Munich I', weightKg: 0.8, potentialSg: 1.036, colorEbc: 15.0, type: 'base' }
    ],
    [
      { id: 'h1', name: 'Magnum', weightG: 20, alphaAcid: 14.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Amarillo', weightG: 30, alphaAcid: 8.5, boilTimeMin: 15, use: 'boil' },
      { id: 'h3', name: 'Amarillo', weightG: 40, alphaAcid: 8.5, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h4', name: 'Cascade', weightG: 40, alphaAcid: 6.5, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Феруловая пауза', tempC: 44, timeMin: 15, type: 'acid' },
      { id: 'm2', name: 'Осахаривание', tempC: 65, timeMin: 55, type: 'maltose' },
      { id: 'm3', name: 'Декстриновая', tempC: 72, timeMin: 20, type: 'dextrin' },
      { id: 'm4', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_WB06,
    2.8, 19,
    ['Пшеничное', 'Hopfenweisse', 'Хмель', 'Amarillo', 'Бавария']
  ),

  createExtendedRecipe(
    'rec_kristallweizen_clean',
    'Кристаллвайцен (Kristallweizen)',
    'Kristallweizen',
    'Пшеничное',
    'Кристально-прозрачный, игристый фильтрованный баварский вайцен. При полном отсутствии дрожжевого осадка раскрывает невероятно тонкий букет спелого банана, яблока и свежей выпечки.',
    'Баварские Традиции',
    20, 60, 75,
    [
      { id: 'g1', name: 'Wheat Malt', weightKg: 2.8, potentialSg: 1.038, colorEbc: 4.0, type: 'wheat' },
      { id: 'g2', name: 'Pilsner Malt', weightKg: 2.2, potentialSg: 1.037, colorEbc: 3.5, type: 'base' }
    ],
    [
      { id: 'h1', name: 'Hallertau Mittelfrüh', weightG: 25, alphaAcid: 4.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Hersbrucker', weightG: 15, alphaAcid: 3.5, boilTimeMin: 15, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Белковая пауза', tempC: 52, timeMin: 15, type: 'protein' },
      { id: 'm2', name: 'Мальтозная пауза', tempC: 63, timeMin: 45, type: 'maltose' },
      { id: 'm3', name: 'Осахаривание', tempC: 72, timeMin: 25, type: 'dextrin' },
      { id: 'm4', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_WB06,
    3.2, 18,
    ['Пшеничное', 'Кристалл', 'Прозрачное', 'Бавария', 'Игристое']
  ),

  createExtendedRecipe(
    'rec_grodziskie_polish_champagne',
    'Гродзисское (Grodziskie / Grätzer)',
    'Grodziskie',
    'Пшеничное',
    '«Польское шампанское» — историческое легкое пиво из 100% пшеничного солода, копченого на древесине векового дуба. Невысокая плотность (8°P), чистейшая прозрачность и шипучая игра пузырьков.',
    'Историческое Наследие',
    20, 60, 75,
    [
      { id: 'g1', name: 'Oak Smoked Wheat Malt (Пшеничный копченый солод)', weightKg: 2.8, potentialSg: 1.036, colorEbc: 5.0, type: 'wheat' }
    ],
    [
      { id: 'h1', name: 'Lubelski (Польский Жатецкий)', weightG: 30, alphaAcid: 3.8, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Lubelski', weightG: 20, alphaAcid: 3.8, boilTimeMin: 20, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Белковая пауза', tempC: 52, timeMin: 25, type: 'protein' },
      { id: 'm2', name: 'Мальтозная', tempC: 64, timeMin: 40, type: 'maltose' },
      { id: 'm3', name: 'Осахаривание', tempC: 72, timeMin: 25, type: 'dextrin' },
      { id: 'm4', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    3.2, 18,
    ['Пшеничное', 'Гродзисское', 'Польша', 'Копченое', 'Дуб', 'Легкое']
  ),

  createExtendedRecipe(
    'rec_finnish_sahti_juniper',
    'Финское Сахти (Finnish Sahti)',
    'Sahti',
    'Пшеничное',
    'Архаичное финское крестьянское пиво с ветками лесного можжевельника. Густая засыпь ячменного и ржаного солода, сбраживание пекарскими или элевыми дрожжами и смолистая свежесть хвои.',
    'Скандинавские Традиции',
    20, 15, 72, // Короткое кипячение с хмелем / пастеризация сусла
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 4.5, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g2', name: 'Курский Ржаной светлый', weightKg: 1.8, potentialSg: 1.036, colorEbc: 8.0, type: 'adjunct' },
      { id: 'g3', name: 'Munich I', weightKg: 1.0, potentialSg: 1.036, colorEbc: 15.0, type: 'base' }
    ],
    [
      { id: 'h1', name: 'Northern Brewer', weightG: 15, alphaAcid: 9.0, boilTimeMin: 30, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Осахаривание через можжевеловые ветки', tempC: 65, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Вторая пауза', tempC: 72, timeMin: 30, type: 'dextrin' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 15, type: 'mashout' }
    ],
    YEAST_WB06,
    1.6, 20,
    ['Пшеничное', 'Сахти', 'Финляндия', 'Можжевельник', 'Ржаное', 'Историческое'],
    undefined,
    [
      { id: 'o1', name: 'Ветки и ягоды свежего лесного можжевельника', amount: 200, unit: 'g', stage: 'mash', type: 'herb' }
    ]
  ),

  createExtendedRecipe(
    'rec_spelt_ale_dinkel',
    'Эль на Полбе (Spelt Ale / Dinkelbier)',
    'Historical Beer',
    'Пшеничное',
    'Аутентичный деревенский эль на спельте (полбе). Полба придает пиву ни с чем не сравнимый ореховый оттенок, плотную кремовую шапку пены и мягкую естественную бархатистость.',
    'Франконские Традиции',
    20, 60, 74,
    [
      { id: 'g1', name: 'Spelt Malt (Солод из полбы)', weightKg: 2.5, potentialSg: 1.036, colorEbc: 5.0, type: 'wheat' },
      { id: 'g2', name: 'Pilsner Malt', weightKg: 2.2, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g3', name: 'Munich I', weightKg: 0.4, potentialSg: 1.036, colorEbc: 15.0, type: 'base' }
    ],
    [
      { id: 'h1', name: 'Tettnanger', weightG: 25, alphaAcid: 4.2, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Hallertau Mittelfrüh', weightG: 18, alphaAcid: 4.0, boilTimeMin: 15, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Белковая пауза', tempC: 52, timeMin: 15, type: 'protein' },
      { id: 'm2', name: 'Мальтозная пауза', tempC: 65, timeMin: 50, type: 'maltose' },
      { id: 'm3', name: 'Осахаривание', tempC: 72, timeMin: 20, type: 'dextrin' },
      { id: 'm4', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_WB06,
    2.6, 18,
    ['Пшеничное', 'Полба', 'Спельта', 'Ореховое', 'Германия']
  ),

  createExtendedRecipe(
    'rec_american_wheat_ale',
    'Американский Пшеничный (American Wheat Ale)',
    'American Wheat Beer',
    'Пшеничное',
    'Светлый, чрезвычайно освежающий эль в американском стиле. В отличие от немецкого вайцена сбраживается нейтральными элевыми дрожжами US-05 без банановых эфиров, раскрывая цитрусовый хмель Centennial.',
    'Американская Классика',
    20, 60, 75,
    [
      { id: 'g1', name: 'Wheat Malt', weightKg: 2.5, potentialSg: 1.038, colorEbc: 4.0, type: 'wheat' },
      { id: 'g2', name: 'Pale Ale Malt', weightKg: 2.2, potentialSg: 1.038, colorEbc: 5.5, type: 'base' },
      { id: 'g3', name: 'Carapils', weightKg: 0.2, potentialSg: 1.033, colorEbc: 4.5, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Centennial', weightG: 20, alphaAcid: 10.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Centennial', weightG: 25, alphaAcid: 10.0, boilTimeMin: 10, use: 'boil' },
      { id: 'h3', name: 'Cascade', weightG: 30, alphaAcid: 6.5, boilTimeMin: 0, use: 'whirlpool' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.5, 19,
    ['Пшеничное', 'Америка', 'Освежающее', 'Цитрус', 'Чистый вкус']
  )
];
