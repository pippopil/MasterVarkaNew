import { Recipe } from '../../types/brewing';
import { createExtendedRecipe, YEAST_W3470, YEAST_M54 } from './recipeHelper';

export const LAGER_RECIPES: Recipe[] = [
  createExtendedRecipe(
    'rec_dortmunder_export',
    'Дортмундер Экспорт (Dortmunder Export)',
    'Dortmunder Export',
    'Лагеры',
    'Классический крепкий немецкий светлый лагер из Рура. Баланс между солодовой сладостью и минеральной хмелевой горечью благородного Hallertauer.',
    'МастерВарка Классика',
    20, 75, 75,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 4.8, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g2', name: 'Munich I', weightKg: 0.6, potentialSg: 1.036, colorEbc: 15.0, type: 'base' },
      { id: 'g3', name: 'Carapils', weightKg: 0.2, potentialSg: 1.033, colorEbc: 4.5, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Hallertau Magnum', weightG: 18, alphaAcid: 14.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Hallertau Mittelfrüh', weightG: 25, alphaAcid: 4.0, boilTimeMin: 20, use: 'boil' },
      { id: 'h3', name: 'Hallertau Mittelfrüh', weightG: 20, alphaAcid: 4.0, boilTimeMin: 5, use: 'aroma' }
    ],
    [
      { id: 'm1', name: 'Мальтозная пауза', tempC: 64, timeMin: 45, type: 'maltose' },
      { id: 'm2', name: 'Декстриновая пауза', tempC: 72, timeMin: 25, type: 'dextrin' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_W3470,
    2.5, 12,
    ['Лагер', 'Германия', 'Дортмундер', 'Экспорт']
  ),

  createExtendedRecipe(
    'rec_german_festbier',
    'Баварский Фестбир (German Festbier)',
    'Festbier',
    'Лагеры',
    'Современное праздничное пиво мюнхенского Октоберфеста. Менее карамельное, чем традиционный Märzen, глубокого золотистого цвета с бархатным солодовым телом.',
    'Баварские Традиции',
    20, 75, 75,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 3.5, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g2', name: 'Vienna Malt', weightKg: 1.5, potentialSg: 1.036, colorEbc: 8.0, type: 'base' },
      { id: 'g3', name: 'Munich I', weightKg: 0.6, potentialSg: 1.036, colorEbc: 15.0, type: 'base' }
    ],
    [
      { id: 'h1', name: 'Perle', weightG: 25, alphaAcid: 7.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Tettnanger', weightG: 20, alphaAcid: 4.2, boilTimeMin: 15, use: 'boil' },
      { id: 'h3', name: 'Hallertau Mittelfrüh', weightG: 15, alphaAcid: 4.0, boilTimeMin: 0, use: 'whirlpool' }
    ],
    [
      { id: 'm1', name: 'Белковая пауза', tempC: 52, timeMin: 15, type: 'protein' },
      { id: 'm2', name: 'Осахаривание', tempC: 66, timeMin: 50, type: 'maltose' },
      { id: 'm3', name: 'Декстриновая', tempC: 72, timeMin: 20, type: 'dextrin' },
      { id: 'm4', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_W3470,
    2.6, 11,
    ['Лагер', 'Октоберфест', 'Фестбир', 'Мюнхен', 'Бавария']
  ),

  createExtendedRecipe(
    'rec_helles_bock',
    'Майбок / Хеллес Бок (Maibock)',
    'Helles Bock',
    'Лагеры',
    'Весенний крепкий баварский лагер. Согревающий чистый алкоголь, благородный солодовый профиль без излишней карамели и ощутимая хмелевая горчинка.',
    'МастерВарка Классика',
    20, 90, 74,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 4.5, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g2', name: 'Vienna Malt', weightKg: 1.8, potentialSg: 1.036, colorEbc: 8.5, type: 'base' },
      { id: 'g3', name: 'Munich I', weightKg: 0.5, potentialSg: 1.036, colorEbc: 15.0, type: 'base' },
      { id: 'g4', name: 'Carapils', weightKg: 0.3, potentialSg: 1.033, colorEbc: 4.5, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Hallertau Magnum', weightG: 25, alphaAcid: 14.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Tettnanger', weightG: 25, alphaAcid: 4.2, boilTimeMin: 20, use: 'boil' },
      { id: 'h3', name: 'Hallertau Mittelfrüh', weightG: 20, alphaAcid: 4.0, boilTimeMin: 5, use: 'aroma' }
    ],
    [
      { id: 'm1', name: 'Мальтозная пауза', tempC: 63, timeMin: 50, type: 'maltose' },
      { id: 'm2', name: 'Декстриновая пауза', tempC: 72, timeMin: 20, type: 'dextrin' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_W3470,
    2.5, 11,
    ['Лагер', 'Бок', 'Майбок', 'Крепкое', 'Германия']
  ),

  createExtendedRecipe(
    'rec_doppelbock_salvator',
    'Монастырский Доппельбок (Doppelbock)',
    'Doppelbock',
    'Лагеры',
    'Легендарный крепкий темный лагер монахов-пауланеров. Густая солодовая сладость, хлебная корочка, тона инжира, поджаренного тоста и темного шоколада.',
    'Баварские Традиции',
    20, 90, 74,
    [
      { id: 'g1', name: 'Munich II', weightKg: 4.0, potentialSg: 1.035, colorEbc: 25.0, type: 'base' },
      { id: 'g2', name: 'Pilsner Malt', weightKg: 2.5, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g3', name: 'Caramunich II', weightKg: 0.6, potentialSg: 1.034, colorEbc: 120.0, type: 'caramel' },
      { id: 'g4', name: 'Melanoidin Malt', weightKg: 0.4, potentialSg: 1.035, colorEbc: 70.0, type: 'caramel' },
      { id: 'g5', name: 'Carafa Special I', weightKg: 0.1, potentialSg: 1.029, colorEbc: 900.0, type: 'roasted' }
    ],
    [
      { id: 'h1', name: 'Hallertau Magnum', weightG: 22, alphaAcid: 14.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Perle', weightG: 20, alphaAcid: 7.0, boilTimeMin: 20, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Белковая пауза', tempC: 52, timeMin: 20, type: 'protein' },
      { id: 'm2', name: 'Мальтозная пауза', tempC: 64, timeMin: 50, type: 'maltose' },
      { id: 'm3', name: 'Осахаривание', tempC: 72, timeMin: 30, type: 'dextrin' },
      { id: 'm4', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_W3470,
    2.3, 10,
    ['Лагер', 'Доппельбок', 'Мюнхен', 'Крепкое', 'Карамель']
  ),

  createExtendedRecipe(
    'rec_eisbock_polar',
    'Полярный Айсбок (Eisbock)',
    'Eisbock',
    'Лагеры',
    'Колоссальный по плотности и крепости лагер, полученный концентрацией вымораживанием ледяных кристаллов. Ноты темных сухофруктов, сливового варенья и ликера.',
    'МастерВарка Крафт',
    20, 90, 72,
    [
      { id: 'g1', name: 'Munich II', weightKg: 5.5, potentialSg: 1.035, colorEbc: 25.0, type: 'base' },
      { id: 'g2', name: 'Pilsner Malt', weightKg: 3.0, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g3', name: 'Caramunich III', weightKg: 0.8, potentialSg: 1.033, colorEbc: 150.0, type: 'caramel' },
      { id: 'g4', name: 'Special B', weightKg: 0.3, potentialSg: 1.032, colorEbc: 300.0, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Hallertau Magnum', weightG: 35, alphaAcid: 14.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Hallertau Mittelfrüh', weightG: 30, alphaAcid: 4.0, boilTimeMin: 15, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Мальтозная', tempC: 63, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Осахаривание', tempC: 71, timeMin: 30, type: 'dextrin' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_W3470,
    2.1, 10,
    ['Лагер', 'Айсбок', 'Вымораживание', 'Экстремальное']
  ),

  createExtendedRecipe(
    'rec_schwarzbier_black_lager',
    'Черный Бархат Тюрингии (Schwarzbier)',
    'Schwarzbier',
    'Лагеры',
    'Традиционный черный лагер из Восточной Германии. Во вкусе мягкий жареный солод без едкой жженки и терпкости благодаря солоду Carafa Special, сухой освежающий финал.',
    'МастерВарка Классика',
    20, 60, 75,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 3.2, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g2', name: 'Munich I', weightKg: 1.2, potentialSg: 1.036, colorEbc: 15.0, type: 'base' },
      { id: 'g3', name: 'Caramunich II', weightKg: 0.35, potentialSg: 1.034, colorEbc: 120.0, type: 'caramel' },
      { id: 'g4', name: 'Carafa Special III', weightKg: 0.25, potentialSg: 1.028, colorEbc: 1400.0, type: 'roasted' }
    ],
    [
      { id: 'h1', name: 'Hallertau Tradition', weightG: 25, alphaAcid: 6.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Tettnanger', weightG: 20, alphaAcid: 4.2, boilTimeMin: 15, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Мальтозная пауза', tempC: 64, timeMin: 45, type: 'maltose' },
      { id: 'm2', name: 'Осахаривание', tempC: 72, timeMin: 20, type: 'dextrin' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_W3470,
    2.5, 12,
    ['Лагер', 'Шварцбир', 'Черный лагер', 'Германия']
  ),

  createExtendedRecipe(
    'rec_california_common_steam',
    'Калифорнийский Стим (California Common)',
    'California Common',
    'Лагеры',
    'Аутентичный гибридный сорт времен золотой лихорадки в Сан-Франциско. Сброжен лагерными дрожжами при теплой элевой температуре 18-20°C с хмелем Northern Brewer.',
    'Американская Классика',
    20, 60, 74,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 3.8, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Caramel 50 EBC', weightKg: 0.5, potentialSg: 1.034, colorEbc: 50.0, type: 'caramel' },
      { id: 'g3', name: 'Caramunich I', weightKg: 0.3, potentialSg: 1.034, colorEbc: 90.0, type: 'caramel' },
      { id: 'g4', name: 'Victory / Biscuit', weightKg: 0.2, potentialSg: 1.034, colorEbc: 50.0, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Northern Brewer', weightG: 30, alphaAcid: 9.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Northern Brewer', weightG: 20, alphaAcid: 9.0, boilTimeMin: 15, use: 'boil' },
      { id: 'h3', name: 'Northern Brewer', weightG: 25, alphaAcid: 9.0, boilTimeMin: 0, use: 'whirlpool' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 67, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_M54,
    2.6, 18,
    ['Лагер', 'Стим', 'Калифорния', 'Гибрид', 'Сан-Франциско']
  ),

  createExtendedRecipe(
    'rec_mexican_amber_lager',
    'Мексиканский Янтарный (Mexican Amber Lager)',
    'Vienna Lager',
    'Лагеры',
    'Освежающий лагер с австрийскими корнями в стиле легендарной Negra Modelo. Венский солод, кукурузные хлопья для легкости и щепотка жженого солода для глубокого медного цвета.',
    'МастерВарка Крафт',
    20, 60, 75,
    [
      { id: 'g1', name: 'Vienna Malt', weightKg: 2.8, potentialSg: 1.036, colorEbc: 8.5, type: 'base' },
      { id: 'g2', name: 'Pilsner Malt', weightKg: 1.2, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g3', name: 'Flaked Corn (Кукуруза)', weightKg: 0.6, potentialSg: 1.037, colorEbc: 1.5, type: 'adjunct' },
      { id: 'g4', name: 'Caramunich II', weightKg: 0.25, potentialSg: 1.034, colorEbc: 120.0, type: 'caramel' },
      { id: 'g5', name: 'Carafa Special I', weightKg: 0.05, potentialSg: 1.029, colorEbc: 900.0, type: 'roasted' }
    ],
    [
      { id: 'h1', name: 'Hallertau Mittelfrüh', weightG: 25, alphaAcid: 4.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Saaz', weightG: 15, alphaAcid: 3.8, boilTimeMin: 15, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Мальтозная пауза', tempC: 65, timeMin: 50, type: 'maltose' },
      { id: 'm2', name: 'Декстриновая', tempC: 72, timeMin: 20, type: 'dextrin' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_W3470,
    2.7, 12,
    ['Лагер', 'Мексика', 'Кукуруза', 'Янтарный', 'Освежающее']
  ),

  createExtendedRecipe(
    'rec_japanese_dry_rice_lager',
    'Токийский Супер-Драй (Japanese Rice Lager)',
    'International Pale Lager',
    'Лагеры',
    'Ультра-чистый хрустящий сухой рисовый лагер в стиле Asahi Super Dry. Добавление 25% рисовых хлопьев дает невесомое тело и чистейший финиш без намека на остаточную сладость.',
    'МастерВарка Крафт',
    20, 60, 76,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 3.6, potentialSg: 1.037, colorEbc: 3.4, type: 'base' },
      { id: 'g2', name: 'Flaked Rice (Рисовые хлопья)', weightKg: 1.2, potentialSg: 1.038, colorEbc: 1.2, type: 'adjunct' }
    ],
    [
      { id: 'h1', name: 'Sorachi Ace', weightG: 15, alphaAcid: 12.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Sorachi Ace', weightG: 15, alphaAcid: 12.0, boilTimeMin: 5, use: 'aroma' }
    ],
    [
      { id: 'm1', name: 'Сухое осахаривание', tempC: 63, timeMin: 65, type: 'maltose' },
      { id: 'm2', name: 'Окончательное осахаривание', tempC: 70, timeMin: 15, type: 'dextrin' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_W3470,
    2.8, 11,
    ['Лагер', 'Япония', 'Рис', 'Супер-Драй', 'Хруст']
  ),

  createExtendedRecipe(
    'rec_american_light_lager',
    'Канзас Лайт Лагер (American Light Lager)',
    'American Light Lager',
    'Лагеры',
    'Ультра-легкое пиво для утоления жажды в знойный день. Минимальная калорийность, мягкие кукурузные тона и едва заметная деликатная горечь.',
    'Американская Классика',
    20, 60, 76,
    [
      { id: 'g1', name: '2-Row Pale Malt', weightKg: 2.8, potentialSg: 1.037, colorEbc: 3.2, type: 'base' },
      { id: 'g2', name: 'Flaked Corn (Кукуруза)', weightKg: 0.9, potentialSg: 1.037, colorEbc: 1.5, type: 'adjunct' }
    ],
    [
      { id: 'h1', name: 'Hallertau Tradition', weightG: 14, alphaAcid: 5.5, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Cascade', weightG: 10, alphaAcid: 6.5, boilTimeMin: 5, use: 'aroma' }
    ],
    [
      { id: 'm1', name: 'Сухая пауза', tempC: 62, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Осахаривание', tempC: 70, timeMin: 20, type: 'dextrin' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_W3470,
    2.8, 12,
    ['Лагер', 'Америка', 'Лайт', 'Кукуруза', 'Низкокалорийное']
  ),

  createExtendedRecipe(
    'rec_pre_prohibition_lager',
    'Досухозаконный Лагер 1900 (Pre-Prohibition Lager)',
    'Pre-Prohibition Lager',
    'Лагеры',
    'Исторический американский лагер начала XX века. Более плотный и хмелевой, чем современные индустриальные бренды, с богатым солодовым характером шестирядного ячменя и кукурузы.',
    'Историческое Наследие',
    20, 60, 75,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 3.8, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g2', name: 'Flaked Corn (Кукуруза)', weightKg: 1.0, potentialSg: 1.037, colorEbc: 1.5, type: 'adjunct' },
      { id: 'g3', name: 'Carapils', weightKg: 0.25, potentialSg: 1.033, colorEbc: 4.5, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Cluster', weightG: 25, alphaAcid: 7.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Saaz', weightG: 20, alphaAcid: 3.8, boilTimeMin: 20, use: 'boil' },
      { id: 'h3', name: 'Saaz', weightG: 20, alphaAcid: 3.8, boilTimeMin: 5, use: 'aroma' }
    ],
    [
      { id: 'm1', name: 'Мальтозная пауза', tempC: 64, timeMin: 50, type: 'maltose' },
      { id: 'm2', name: 'Декстриновая', tempC: 72, timeMin: 20, type: 'dextrin' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_W3470,
    2.6, 12,
    ['Лагер', 'Историческое', 'Америка', 'Досухозаконный', 'Кукуруза']
  ),

  createExtendedRecipe(
    'rec_kellerbier_zwickel',
    'Франконский Келлербир (Kellerbier / Zwickel)',
    'Kellerbier',
    'Лагеры',
    'Нефильтрованный деревенский лагер прямо из погребов Франконии. Легкая естественная дрожжевая опалесценция, цветочный травянистый букет свежего хмеля и мягкая естественная газация.',
    'Баварские Традиции',
    20, 75, 75,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 3.4, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g2', name: 'Munich I', weightKg: 1.2, potentialSg: 1.036, colorEbc: 15.0, type: 'base' },
      { id: 'g3', name: 'Caramunich I', weightKg: 0.2, potentialSg: 1.034, colorEbc: 90.0, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Spalt Select', weightG: 25, alphaAcid: 5.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Hallertau Mittelfrüh', weightG: 20, alphaAcid: 4.0, boilTimeMin: 20, use: 'boil' },
      { id: 'h3', name: 'Spalt Select', weightG: 25, alphaAcid: 5.0, boilTimeMin: 0, use: 'whirlpool' }
    ],
    [
      { id: 'm1', name: 'Белковая пауза', tempC: 52, timeMin: 15, type: 'protein' },
      { id: 'm2', name: 'Мальтозная пауза', tempC: 64, timeMin: 45, type: 'maltose' },
      { id: 'm3', name: 'Осахаривание', tempC: 72, timeMin: 25, type: 'dextrin' },
      { id: 'm4', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_W3470,
    2.2, 12,
    ['Лагер', 'Келлербир', 'Цвикель', 'Нефильтрованное', 'Франкония']
  ),

  createExtendedRecipe(
    'rec_czech_polotmavy_lezak',
    'Богемский Гранат (Czech Polotmavý Ležák)',
    'Czech Amber Lager',
    'Лагеры',
    'Чешский янтарно-гранатовый полутемный лежак 12°P. Глубокий карамельно-ореховый профиль солода Caramunich и роскошная пряность жатецкого хмеля Saaz.',
    'Чешское Наследие',
    20, 90, 74,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 3.2, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g2', name: 'Munich I', weightKg: 1.2, potentialSg: 1.036, colorEbc: 15.0, type: 'base' },
      { id: 'g3', name: 'Caramunich II', weightKg: 0.45, potentialSg: 1.034, colorEbc: 120.0, type: 'caramel' },
      { id: 'g4', name: 'Carafa Special I', weightKg: 0.05, potentialSg: 1.029, colorEbc: 900.0, type: 'roasted' }
    ],
    [
      { id: 'h1', name: 'Saaz', weightG: 30, alphaAcid: 3.8, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Saaz', weightG: 25, alphaAcid: 3.8, boilTimeMin: 25, use: 'boil' },
      { id: 'h3', name: 'Saaz', weightG: 25, alphaAcid: 3.8, boilTimeMin: 5, use: 'aroma' }
    ],
    [
      { id: 'm1', name: 'Мальтозная пауза', tempC: 64, timeMin: 45, type: 'maltose' },
      { id: 'm2', name: 'Осахаривание', tempC: 72, timeMin: 25, type: 'dextrin' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_W3470,
    2.5, 12,
    ['Лагер', 'Чехия', 'Полутемное', 'Гранат', 'Жатецкий']
  ),

  createExtendedRecipe(
    'rec_czech_tmavy_lezak',
    'Пражский Темный Лежак (Czech Tmavý Ležák)',
    'Czech Dark Lager',
    'Лагеры',
    'Классический пражский темный лагер знаменитой пивоварни U Fleků. Ноты поджаренной ржаной корочки, какао, мягкой карамели и чистая смолистая горечь.',
    'Чешское Наследие',
    20, 90, 74,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 3.0, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g2', name: 'Munich II', weightKg: 1.4, potentialSg: 1.035, colorEbc: 25.0, type: 'base' },
      { id: 'g3', name: 'Caramunich III', weightKg: 0.4, potentialSg: 1.033, colorEbc: 150.0, type: 'caramel' },
      { id: 'g4', name: 'Carafa Special II', weightKg: 0.15, potentialSg: 1.028, colorEbc: 1100.0, type: 'roasted' }
    ],
    [
      { id: 'h1', name: 'Saaz', weightG: 35, alphaAcid: 3.8, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Premiant', weightG: 15, alphaAcid: 7.5, boilTimeMin: 25, use: 'boil' },
      { id: 'h3', name: 'Saaz', weightG: 20, alphaAcid: 3.8, boilTimeMin: 5, use: 'aroma' }
    ],
    [
      { id: 'm1', name: 'Мальтозная пауза', tempC: 65, timeMin: 45, type: 'maltose' },
      { id: 'm2', name: 'Осахаривание', tempC: 72, timeMin: 25, type: 'dextrin' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_W3470,
    2.4, 12,
    ['Лагер', 'Чехия', 'Темный лежак', 'У Флеку', 'Жатецкий']
  ),

  createExtendedRecipe(
    'rec_nz_pilsner_nelson',
    'Новозеландский Пилснер (NZ Pilsner)',
    'New Zealand Pilsner',
    'Лагеры',
    'Яркая южная интерпретация европейского пилснера. Чистейшая хрустящая база лагера с взрывным ароматом белого новозеландского вина Совиньон Блан и маракуйи от хмеля Nelson Sauvin.',
    'МастерВарка Крафт',
    20, 60, 75,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 4.6, potentialSg: 1.037, colorEbc: 3.5, type: 'base' },
      { id: 'g2', name: 'Carapils', weightKg: 0.3, potentialSg: 1.033, colorEbc: 4.5, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Motueka', weightG: 20, alphaAcid: 7.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Nelson Sauvin', weightG: 25, alphaAcid: 12.0, boilTimeMin: 10, use: 'boil' },
      { id: 'h3', name: 'Nelson Sauvin', weightG: 35, alphaAcid: 12.0, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h4', name: 'Motueka', weightG: 30, alphaAcid: 7.0, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Сухое осахаривание', tempC: 64, timeMin: 55, type: 'maltose' },
      { id: 'm2', name: 'Окончательное осахаривание', tempC: 72, timeMin: 15, type: 'dextrin' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_W3470,
    2.6, 12,
    ['Лагер', 'Пилснер', 'Новая Зеландия', 'Нельсон Совин', 'Крафт']
  ),

  createExtendedRecipe(
    'rec_italian_grape_pilsner',
    'Итальянский Охмеленный Пилс (Italian Pilsner)',
    'Italian Pilsner',
    'Лагеры',
    'Вдохновленный культовым Tipopils пивоварни Birrificio Italiano. Безупречный немецкий пилснер с деликатным сухим охмелением благородными сортами Spalt и Saphir.',
    'Крафтовая Европа',
    20, 75, 75,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 4.7, potentialSg: 1.037, colorEbc: 3.4, type: 'base' },
      { id: 'g2', name: 'Carapils', weightKg: 0.25, potentialSg: 1.033, colorEbc: 4.5, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Hallertau Magnum', weightG: 16, alphaAcid: 14.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Spalt Select', weightG: 25, alphaAcid: 5.0, boilTimeMin: 15, use: 'boil' },
      { id: 'h3', name: 'Tettnanger', weightG: 30, alphaAcid: 4.2, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h4', name: 'Saphir', weightG: 40, alphaAcid: 4.0, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Мальтозная пауза', tempC: 63, timeMin: 50, type: 'maltose' },
      { id: 'm2', name: 'Декстриновая', tempC: 71, timeMin: 20, type: 'dextrin' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_W3470,
    2.6, 11,
    ['Лагер', 'Италия', 'Пилснер', 'Сухое охмеление', 'Элегантное']
  ),

  createExtendedRecipe(
    'rec_smoked_helles_bamberg',
    'Бамбергский Светлый Копченый (Smoked Helles)',
    'Rauchbier',
    'Лагеры',
    'Светлый освежающий мюнхенский хеллес со сдержанным благородным ароматом букового костра. Сварен на 40% бамбергском копченом солоде Weyermann.',
    'Франконские Традиции',
    20, 60, 75,
    [
      { id: 'g1', name: 'Smoked Malt (Копченый солод)', weightKg: 2.0, potentialSg: 1.036, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Pilsner Malt', weightKg: 2.5, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g3', name: 'Munich I', weightKg: 0.4, potentialSg: 1.036, colorEbc: 15.0, type: 'base' }
    ],
    [
      { id: 'h1', name: 'Hallertau Tradition', weightG: 25, alphaAcid: 5.5, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Hallertau Mittelfrüh', weightG: 20, alphaAcid: 4.0, boilTimeMin: 10, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Мальтозная пауза', tempC: 64, timeMin: 45, type: 'maltose' },
      { id: 'm2', name: 'Осахаривание', tempC: 72, timeMin: 25, type: 'dextrin' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_W3470,
    2.5, 12,
    ['Лагер', 'Копченое', 'Хеллес', 'Бамберг', 'Дымок']
  ),

  createExtendedRecipe(
    'rec_czech_desitka_10',
    'Чешская Десятка (Czech Desítka 10°)',
    'Czech Pale Lager',
    'Лагеры',
    'Настоящая чешская «деситка» — легкое столовое разливное пиво плотностью 10° Plato. Невероятно питкое, с золотистым блеском и щедрой чешской горечью.',
    'Чешское Наследие',
    20, 75, 76,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 3.6, potentialSg: 1.037, colorEbc: 3.5, type: 'base' },
      { id: 'g2', name: 'Munich I', weightKg: 0.25, potentialSg: 1.036, colorEbc: 15.0, type: 'base' }
    ],
    [
      { id: 'h1', name: 'Saaz', weightG: 30, alphaAcid: 3.8, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Saaz', weightG: 25, alphaAcid: 3.8, boilTimeMin: 20, use: 'boil' },
      { id: 'h3', name: 'Saaz', weightG: 20, alphaAcid: 3.8, boilTimeMin: 5, use: 'aroma' }
    ],
    [
      { id: 'm1', name: 'Белковая пауза', tempC: 52, timeMin: 15, type: 'protein' },
      { id: 'm2', name: 'Мальтозная пауза', tempC: 64, timeMin: 45, type: 'maltose' },
      { id: 'm3', name: 'Осахаривание', tempC: 72, timeMin: 20, type: 'dextrin' },
      { id: 'm4', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_W3470,
    2.6, 12,
    ['Лагер', 'Чехия', 'Десятка', 'Легкое', 'Пилснер']
  )
];
