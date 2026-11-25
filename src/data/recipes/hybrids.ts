import { Recipe } from '../../types/brewing';
import { createExtendedRecipe, YEAST_US05, YEAST_S04, YEAST_W3470, YEAST_WB06 } from './recipeHelper';

export const HYBRID_RECIPES: Recipe[] = [
  createExtendedRecipe(
    'rec_american_cream_ale',
    'Американский Крем-Эль (American Cream Ale)',
    'Cream Ale',
    'Крафтовые гибриды',
    'Классический американский гибридный стиль. Сброжен элевыми дрожжами при прохладной температуре, с добавлением кукурузных хлопьев для мягкого шелковистого тела и высокой питкости.',
    'Американская Классика',
    20, 60, 76,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 3.5, potentialSg: 1.037, colorEbc: 3.4, type: 'base' },
      { id: 'g2', name: 'Flaked Corn (Кукурузные хлопья)', weightKg: 0.8, potentialSg: 1.037, colorEbc: 1.5, type: 'adjunct' },
      { id: 'g3', name: 'Carapils', weightKg: 0.2, potentialSg: 1.033, colorEbc: 4.5, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Cluster', weightG: 18, alphaAcid: 7.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Liberty', weightG: 15, alphaAcid: 4.0, boilTimeMin: 10, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 65, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.6, 17,
    ['Крем-Эль', 'Кукуруза', 'Америка', 'Освежающее', 'Гибрид']
  ),

  createExtendedRecipe(
    'rec_kentucky_common_dark',
    'Кентукки Коммон (Kentucky Common)',
    'Historical Beer',
    'Крафтовые гибриды',
    'Уникальный исторический американский эль рабочих Луисвилла до сухого закона. Сварен на кукурузе с добавлением карамельного и черного солода, быстрый цикл брожения и мягкий освежающий вкус.',
    'Историческое Наследие',
    20, 60, 75,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 3.2, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Flaked Corn', weightKg: 1.0, potentialSg: 1.037, colorEbc: 1.5, type: 'adjunct' },
      { id: 'g3', name: 'Caramunich II', weightKg: 0.35, potentialSg: 1.034, colorEbc: 120.0, type: 'caramel' },
      { id: 'g4', name: 'Black Malt', weightKg: 0.08, potentialSg: 1.025, colorEbc: 1300.0, type: 'roasted' }
    ],
    [
      { id: 'h1', name: 'Cluster', weightG: 22, alphaAcid: 7.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Cluster', weightG: 15, alphaAcid: 7.0, boilTimeMin: 15, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.5, 19,
    ['Кентукки', 'Темный эль', 'Кукуруза', 'Историческое', 'Америка']
  ),

  createExtendedRecipe(
    'rec_dusseldorf_altbier_schumacher',
    'Дюссельдорфский Альтбир (Düsseldorf Altbier)',
    'Altbier',
    'Крафтовые гибриды',
    'Традиционный «старый» медный эль Дюссельдорфа в стиле Schumacher Alt. Верховое брожение со спец-солодами Spalt и последующее длительное холодное лагерирование дает идеальную чистоту и баланс.',
    'Немецкие Традиции',
    20, 75, 75,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 2.8, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g2', name: 'Munich II', weightKg: 1.5, potentialSg: 1.035, colorEbc: 25.0, type: 'base' },
      { id: 'g3', name: 'Caramunich II', weightKg: 0.35, potentialSg: 1.034, colorEbc: 120.0, type: 'caramel' },
      { id: 'g4', name: 'Carafa Special II', weightKg: 0.04, potentialSg: 1.028, colorEbc: 1100.0, type: 'roasted' }
    ],
    [
      { id: 'h1', name: 'Spalt Select', weightG: 30, alphaAcid: 5.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Spalt Select', weightG: 25, alphaAcid: 5.0, boilTimeMin: 20, use: 'boil' },
      { id: 'h3', name: 'Tettnanger', weightG: 15, alphaAcid: 4.2, boilTimeMin: 5, use: 'aroma' }
    ],
    [
      { id: 'm1', name: 'Мальтозная пауза', tempC: 64, timeMin: 50, type: 'maltose' },
      { id: 'm2', name: 'Осахаривание', tempC: 72, timeMin: 20, type: 'dextrin' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.5, 16,
    ['Альтбир', 'Дюссельдорф', 'Медный эль', 'Spalt', 'Германия']
  ),

  createExtendedRecipe(
    'rec_coffee_blonde_ale_coldbrew',
    'Светлый Кофейный Эль (Coffee Blonde Ale)',
    'Experimental Beer',
    'Крафтовые гибриды',
    'Визуальный парадокс для дегустатора! Кристально-прозрачный золотистый легкий эль с насыщенным ароматом свежеобжаренного кофе светлой эфиопской обжарки без намека на темный цвет.',
    'МастерВарка Крафт',
    20, 60, 75,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 4.2, potentialSg: 1.037, colorEbc: 3.5, type: 'base' },
      { id: 'g2', name: 'Carapils', weightKg: 0.35, potentialSg: 1.033, colorEbc: 4.5, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Cascade', weightG: 20, alphaAcid: 6.5, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Willamette', weightG: 20, alphaAcid: 5.0, boilTimeMin: 10, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.4, 19,
    ['Кофе', 'Блонд', 'Светлое', 'Эфиопия', 'Крафт'],
    undefined,
    [
      { id: 'o1', name: 'Цельные зерна кофе Эфиопия Иргачеффе светлой обжарки', amount: 100, unit: 'g', stage: 'secondary', timeMinOrDays: 2, type: 'flavor' }
    ]
  ),

  createExtendedRecipe(
    'rec_pumpkin_spiced_holiday_ale',
    'Пряный Тыквенный Эль (Pumpkin Spiced Ale)',
    'Autumn Seasonal Beer',
    'Крафтовые гибриды',
    'Главный хит золотой осени. Запеченная в духовке мускатная тыква добавляется прямо в заторный чан, а при варке вносятся корица, мускатный орех, душистый перец и имбирь.',
    'Крафтовая Волна',
    20, 60, 73,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 4.5, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Caramunich II', weightKg: 0.45, potentialSg: 1.034, colorEbc: 120.0, type: 'caramel' },
      { id: 'g3', name: 'Biscuit Malt', weightKg: 0.25, potentialSg: 1.034, colorEbc: 50.0, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Northern Brewer', weightG: 20, alphaAcid: 9.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'East Kent Goldings', weightG: 15, alphaAcid: 5.0, boilTimeMin: 10, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Осахаривание вместе с запеченной тыквой', tempC: 67, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_S04,
    2.3, 19,
    ['Тыква', 'Осень', 'Корица', 'Пряности', 'Праздничное'],
    undefined,
    [
      { id: 'o1', name: 'Запеченная тыква с карамелью', amount: 1500, unit: 'g', stage: 'mash', type: 'other' },
      { id: 'o2', name: 'Смесь специй: корица, имбирь, мускат, гвоздика', amount: 12, unit: 'g', stage: 'boil', timeMinOrDays: 5, type: 'spice' }
    ]
  ),

  createExtendedRecipe(
    'rec_dampfbier_bavarian_steam',
    'Баварское Паровое Пиво (Dampfbier)',
    'Historical Beer',
    'Крафтовые гибриды',
    'Исторический сорт Баварского Леса (Zwiesel). Сварен из 100% ячменного солода, но сброжен дрожжами для пшеничного пива WB-06 при высокой температуре, образуя пышную «паровую» пену.',
    'Баварские Традиции',
    20, 60, 75,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 3.2, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g2', name: 'Munich I', weightKg: 1.2, potentialSg: 1.036, colorEbc: 15.0, type: 'base' },
      { id: 'g3', name: 'Caramunich I', weightKg: 0.35, potentialSg: 1.034, colorEbc: 90.0, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Hallertau Mittelfrüh', weightG: 22, alphaAcid: 4.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Tettnanger', weightG: 18, alphaAcid: 4.2, boilTimeMin: 15, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Мальтозная пауза', tempC: 64, timeMin: 45, type: 'maltose' },
      { id: 'm2', name: 'Осахаривание', tempC: 72, timeMin: 25, type: 'dextrin' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_WB06,
    2.5, 20,
    ['Дампфбир', 'Паровое', 'Бавария', 'Историческое', 'Ячмень']
  ),

  createExtendedRecipe(
    'rec_zoigl_oberpfalz',
    'Цойгль Верхнего Пфальца (Zoigl)',
    'Kellerbier',
    'Крафтовые гибриды',
    'Аутентичный коммунальный сорт Верхнего Пфальца, включенный в список нематериального культурного наследия ЮНЕСКО. Открытое брожение, нефильтрованное солодовое тело и мягкая лагерная свежесть.',
    'Франконские Традиции',
    20, 75, 75,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 3.2, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g2', name: 'Munich I', weightKg: 1.4, potentialSg: 1.036, colorEbc: 15.0, type: 'base' },
      { id: 'g3', name: 'Caramunich II', weightKg: 0.25, potentialSg: 1.034, colorEbc: 120.0, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Hallertau Tradition', weightG: 25, alphaAcid: 5.5, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Hersbrucker', weightG: 20, alphaAcid: 3.5, boilTimeMin: 15, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Мальтозная пауза', tempC: 65, timeMin: 50, type: 'maltose' },
      { id: 'm2', name: 'Осахаривание', tempC: 72, timeMin: 25, type: 'dextrin' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_W3470,
    2.2, 12,
    ['Цойгль', 'ЮНЕСКО', 'Бавария', 'Нефильтрованное', 'Деревенское']
  ),

  createExtendedRecipe(
    'rec_american_barleywine_bigfoot',
    'Американский Барливайн Снежный Человек (Bigfoot Style)',
    'American Barleywine',
    'Крафтовые гибриды',
    'Хмелевой монстр в стиле Sierra Nevada Bigfoot. В отличие от английского барливайна, здесь мощное карамельное тело взрывается 90 IBU смолистой хвои и грейпфрута от Chinook, Centennial и Cascade.',
    'Американская Классика',
    20, 90, 71,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 8.0, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Caramel 100 EBC', weightKg: 0.8, potentialSg: 1.034, colorEbc: 100.0, type: 'caramel' },
      { id: 'g3', name: 'Carapils', weightKg: 0.3, potentialSg: 1.033, colorEbc: 4.5, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Chinook', weightG: 45, alphaAcid: 13.0, boilTimeMin: 90, use: 'boil' },
      { id: 'h2', name: 'Centennial', weightG: 35, alphaAcid: 10.0, boilTimeMin: 30, use: 'boil' },
      { id: 'h3', name: 'Cascade', weightG: 40, alphaAcid: 6.5, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h4', name: 'Centennial', weightG: 40, alphaAcid: 10.0, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 75, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.2, 19,
    ['Барливайн', 'Америка', 'Бигфут', 'Хмель', 'Крепкое', 'Горечь']
  )
];
