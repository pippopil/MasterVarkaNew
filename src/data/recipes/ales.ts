import { Recipe } from '../../types/brewing';
import { createExtendedRecipe, YEAST_US05, YEAST_VOSS, YEAST_W3470, YEAST_S04 } from './recipeHelper';

export const ALE_RECIPES: Recipe[] = [
  createExtendedRecipe(
    'rec_neipa_galaxy_citra',
    'Галактический Туман (Galaxy & Citra NEIPA)',
    'New England IPA',
    'Эли / Хмелевые',
    'Сочный, ультра-мутный New England IPA. Массивная засыпь овсяных и пшеничных хлопьев, нулевая горечь на кипе и взрывной заряд Citra и Galaxy на вирпуле и сухом охмелении.',
    'Крафтовая Волна',
    20, 60, 72,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 4.2, potentialSg: 1.038, colorEbc: 5.5, type: 'base' },
      { id: 'g2', name: 'Flaked Oats (Овсяные хлопья)', weightKg: 1.0, potentialSg: 1.033, colorEbc: 2.5, type: 'adjunct' },
      { id: 'g3', name: 'Wheat Malt (Пшеничный светлый)', weightKg: 0.8, potentialSg: 1.038, colorEbc: 4.0, type: 'wheat' }
    ],
    [
      { id: 'h1', name: 'Citra', weightG: 30, alphaAcid: 12.5, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h2', name: 'Galaxy', weightG: 40, alphaAcid: 14.5, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h3', name: 'Citra', weightG: 50, alphaAcid: 12.5, boilTimeMin: 0, use: 'dry_hop' },
      { id: 'h4', name: 'Galaxy', weightG: 50, alphaAcid: 14.5, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Полнотелое осахаривание', tempC: 67, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.4, 20,
    ['IPA', 'NEIPA', 'Galaxy', 'Citra', 'Мутное', 'Тропики']
  ),

  createExtendedRecipe(
    'rec_triple_neipa_hopocalypse',
    'Хопокалипсис (Triple Hazy IPA 9.5%)',
    'Triple IPA',
    'Эли / Хмелевые',
    'Монументальный мутный тройной IPA. Солодовая база усилена декстрозой для сухого финиша, шелковистое тело и умопомрачительные 250 грамм хмелей Citra, Mosaic, Strata.',
    'МастерВарка Крафт',
    20, 60, 70,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 6.8, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Flaked Oats', weightKg: 1.2, potentialSg: 1.033, colorEbc: 2.5, type: 'adjunct' },
      { id: 'g3', name: 'Wheat Malt', weightKg: 1.0, potentialSg: 1.038, colorEbc: 4.0, type: 'wheat' }
    ],
    [
      { id: 'h1', name: 'Magnum', weightG: 20, alphaAcid: 14.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Citra', weightG: 50, alphaAcid: 12.5, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h3', name: 'Mosaic', weightG: 50, alphaAcid: 12.0, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h4', name: 'Strata', weightG: 60, alphaAcid: 13.0, boilTimeMin: 0, use: 'dry_hop' },
      { id: 'h5', name: 'Citra', weightG: 60, alphaAcid: 12.5, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 65, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.3, 19,
    ['IPA', 'Triple IPA', 'TIPA', 'Мутное', 'Крепкое'],
    undefined,
    [
      { id: 'o1', name: 'Декстроза для сухости тела', amount: 400, unit: 'g', stage: 'boil', timeMinOrDays: 10, type: 'sugar', fermentablePercent: 100 }
    ]
  ),

  createExtendedRecipe(
    'rec_west_coast_simcoe_mosaic',
    'Тихоокеанский Закат (West Coast IPA)',
    'American IPA',
    'Эли / Хмелевые',
    'Классический сухой калифорнийский IPA старой школы. Кристальная прозрачность, смолистая хвоя, маракуйя и чистая бескомпромиссная грейпфрутовая горечь хмелей Simcoe и Mosaic.',
    'Американская Классика',
    20, 60, 75,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 5.2, potentialSg: 1.038, colorEbc: 5.5, type: 'base' },
      { id: 'g2', name: 'Caramel 50 EBC', weightKg: 0.35, potentialSg: 1.034, colorEbc: 50.0, type: 'caramel' },
      { id: 'g3', name: 'Carapils', weightKg: 0.25, potentialSg: 1.033, colorEbc: 4.5, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Columbus / CTZ', weightG: 25, alphaAcid: 15.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Simcoe', weightG: 30, alphaAcid: 13.0, boilTimeMin: 15, use: 'boil' },
      { id: 'h3', name: 'Mosaic', weightG: 35, alphaAcid: 12.0, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h4', name: 'Simcoe', weightG: 45, alphaAcid: 13.0, boilTimeMin: 0, use: 'dry_hop' },
      { id: 'h5', name: 'Mosaic', weightG: 45, alphaAcid: 12.0, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Сухое осахаривание', tempC: 64, timeMin: 65, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.5, 19,
    ['IPA', 'West Coast', 'Simcoe', 'Mosaic', 'Хвоя', 'Горечь']
  ),

  createExtendedRecipe(
    'rec_cold_ipa_polar_hop',
    'Полярный Холод (Cold IPA)',
    'Specialty IPA',
    'Эли / Хмелевые',
    'Модный тренд крафтового мира — Cold IPA. Засыпь с добавлением рисовых хлопьев, сброжен лагерными дрожжами W-34/70 при 16°C и массивно охмелен на вирпуле и сухом.',
    'Крафтовая Волна',
    20, 60, 75,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 4.5, potentialSg: 1.037, colorEbc: 3.5, type: 'base' },
      { id: 'g2', name: 'Flaked Rice (Рисовые хлопья)', weightKg: 1.0, potentialSg: 1.038, colorEbc: 1.2, type: 'adjunct' }
    ],
    [
      { id: 'h1', name: 'Magnum', weightG: 20, alphaAcid: 14.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Centennial', weightG: 30, alphaAcid: 10.0, boilTimeMin: 10, use: 'boil' },
      { id: 'h3', name: 'Citra', weightG: 40, alphaAcid: 12.5, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h4', name: 'Mosaic', weightG: 50, alphaAcid: 12.0, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Сухое осахаривание', tempC: 63, timeMin: 65, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_W3470,
    2.6, 16,
    ['IPA', 'Cold IPA', 'Лагерные дрожжи', 'Хруст', 'Крафт']
  ),

  createExtendedRecipe(
    'rec_sabro_coconut_ipa',
    'Кокосовый Рай (Sabro Tropical IPA)',
    'American IPA',
    'Эли / Хмелевые',
    'Экзотический IPA с природным доминирующим ароматом свежего кокосового молока, кедра и спелого ананаса, который дает уникальный хмель Sabro.',
    'МастерВарка Крафт',
    20, 60, 73,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 4.8, potentialSg: 1.038, colorEbc: 5.5, type: 'base' },
      { id: 'g2', name: 'Flaked Oats', weightKg: 0.6, potentialSg: 1.033, colorEbc: 2.5, type: 'adjunct' },
      { id: 'g3', name: 'Carapils', weightKg: 0.3, potentialSg: 1.033, colorEbc: 4.5, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Warrior', weightG: 18, alphaAcid: 15.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Sabro', weightG: 35, alphaAcid: 13.5, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h3', name: 'Sabro', weightG: 50, alphaAcid: 13.5, boilTimeMin: 0, use: 'dry_hop' },
      { id: 'h4', name: 'Citra', weightG: 30, alphaAcid: 12.5, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.4, 19,
    ['IPA', 'Sabro', 'Кокос', 'Ананас', 'Тропики']
  ),

  createExtendedRecipe(
    'rec_milkshake_ipa_mango',
    'Манговый Милкшейк (Mango Milkshake IPA)',
    'Specialty IPA',
    'Эли / Хмелевые',
    'Нежный десертный IPA кремовой текстуры. Добавление лактозы (молочного сахара) и натурального пюре манго создает эффект настоящего тропического шейка.',
    'МастерВарка Крафт',
    20, 60, 72,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 4.2, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Flaked Oats', weightKg: 0.8, potentialSg: 1.033, colorEbc: 2.5, type: 'adjunct' },
      { id: 'g3', name: 'Wheat Malt', weightKg: 0.5, potentialSg: 1.038, colorEbc: 4.0, type: 'wheat' }
    ],
    [
      { id: 'h1', name: 'Magnum', weightG: 15, alphaAcid: 14.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Citra', weightG: 30, alphaAcid: 12.5, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h3', name: 'Mosaic', weightG: 30, alphaAcid: 12.0, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h4', name: 'Citra', weightG: 40, alphaAcid: 12.5, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Полнотелое осахаривание', tempC: 68, timeMin: 60, type: 'dextrin' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.3, 19,
    ['IPA', 'Милкшейк', 'Манго', 'Лактоза', 'Десертное'],
    undefined,
    [
      { id: 'o1', name: 'Лактоза пищевая (молочный сахар)', amount: 600, unit: 'g', stage: 'boil', timeMinOrDays: 10, type: 'sugar', fermentablePercent: 10 }
    ]
  ),

  createExtendedRecipe(
    'rec_brut_ipa_champagne',
    'Шампанский Брют IPA (Brut IPA)',
    'Specialty IPA',
    'Эли / Хмелевые',
    'Сверхсухой, игристый как просекко, эль без единого грамма остаточного сахара (конечная плотность 1.000). Высокая карбонизация и благородный букет винного хмеля Hallertau Blanc.',
    'Крафтовая Волна',
    20, 60, 75,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 4.5, potentialSg: 1.037, colorEbc: 3.5, type: 'base' },
      { id: 'g2', name: 'Flaked Corn', weightKg: 0.5, potentialSg: 1.037, colorEbc: 1.5, type: 'adjunct' }
    ],
    [
      { id: 'h1', name: 'Hallertau Blanc', weightG: 25, alphaAcid: 9.5, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Hallertau Blanc', weightG: 35, alphaAcid: 9.5, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h3', name: 'Nelson Sauvin', weightG: 40, alphaAcid: 12.0, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Сухое осахаривание', tempC: 62, timeMin: 70, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    3.0, 18,
    ['IPA', 'Brut IPA', 'Шампанское', 'Сухое', 'Игристое']
  ),

  createExtendedRecipe(
    'rec_red_ipa_ruby',
    'Рубиновый Закат (Red IPA)',
    'Red IPA',
    'Эли / Хмелевые',
    'Насыщенный медно-красный карамельный IPA. Сочетание выраженной сладости солодов Carared и Caramunich со смолисто-цитрусовой агрессивной горечью хмелей Simcoe и Centennial.',
    'Американская Классика',
    20, 60, 74,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 4.5, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Carared (Караред 50 EBC)', weightKg: 0.6, potentialSg: 1.034, colorEbc: 50.0, type: 'caramel' },
      { id: 'g3', name: 'Caramunich II', weightKg: 0.35, potentialSg: 1.034, colorEbc: 120.0, type: 'caramel' },
      { id: 'g4', name: 'Carafa Special I', weightKg: 0.05, potentialSg: 1.029, colorEbc: 900.0, type: 'roasted' }
    ],
    [
      { id: 'h1', name: 'Columbus', weightG: 22, alphaAcid: 15.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Centennial', weightG: 25, alphaAcid: 10.0, boilTimeMin: 15, use: 'boil' },
      { id: 'h3', name: 'Simcoe', weightG: 30, alphaAcid: 13.0, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h4', name: 'Simcoe', weightG: 40, alphaAcid: 13.0, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.4, 19,
    ['IPA', 'Red IPA', 'Красный эль', 'Карамель', 'Горечь']
  ),

  createExtendedRecipe(
    'rec_rye_ipa_spicy',
    'Ржаной Бунт (Rye IPA)',
    'Specialty IPA',
    'Эли / Хмелевые',
    'Пряный и дерзкий хмелевой эль на 20% курском ржаном солоде. Характерная ржаная сухость и перчинка превосходно дополняются сосновым хмелем Chinook и цитрусовым Cascade.',
    'МастерВарка Крафт',
    20, 60, 73,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 4.2, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Курский Ржаной светлый', weightKg: 1.0, potentialSg: 1.036, colorEbc: 8.0, type: 'adjunct' },
      { id: 'g3', name: 'Caramunich I', weightKg: 0.3, potentialSg: 1.034, colorEbc: 90.0, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Chinook', weightG: 25, alphaAcid: 13.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Cascade', weightG: 30, alphaAcid: 6.5, boilTimeMin: 15, use: 'boil' },
      { id: 'h3', name: 'Chinook', weightG: 30, alphaAcid: 13.0, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h4', name: 'Cascade', weightG: 40, alphaAcid: 6.5, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Ржаная пауза (глюканазная)', tempC: 45, timeMin: 15, type: 'protein' },
      { id: 'm2', name: 'Осахаривание', tempC: 65, timeMin: 55, type: 'maltose' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.4, 19,
    ['IPA', 'Ржаное', 'Курский солод', 'Пряности', 'Хмель']
  ),

  createExtendedRecipe(
    'rec_apa_sierra_cascade',
    'Калифорнийский Пионер (Classic Cascade APA)',
    'American Pale Ale',
    'Эли / Хмелевые',
    'Реконструкция культового Sierra Nevada Pale Ale 1980 года, перевернувшего представление о пиве. Умеренная плотность, карамельный солод и 100% хмель Cascade с нотами грейпфрута и сосны.',
    'Американская Классика',
    20, 60, 75,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 4.5, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Caramel 100 EBC', weightKg: 0.4, potentialSg: 1.034, colorEbc: 100.0, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Magnum', weightG: 15, alphaAcid: 14.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Cascade', weightG: 25, alphaAcid: 6.5, boilTimeMin: 30, use: 'boil' },
      { id: 'h3', name: 'Cascade', weightG: 30, alphaAcid: 6.5, boilTimeMin: 10, use: 'boil' },
      { id: 'h4', name: 'Cascade', weightG: 40, alphaAcid: 6.5, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h5', name: 'Cascade', weightG: 40, alphaAcid: 6.5, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.4, 19,
    ['APA', 'Cascade', 'Америка', 'Сьерра-Невада', 'Классика']
  ),

  createExtendedRecipe(
    'rec_kveik_pale_ale',
    'Фермерский Норвежец (Voss Kveik Pale Ale)',
    'American Pale Ale',
    'Эли / Хмелевые',
    'Молниеносный эль на дрожжах Voss Kveik. Готов к употреблению уже через 5 дней! Сбраживание при 35°C дает натуральные яркие ноты апельсиновой цедры без малейшей спиртуозности.',
    'Крафтовая Волна',
    20, 60, 75,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 4.6, potentialSg: 1.038, colorEbc: 5.5, type: 'base' },
      { id: 'g2', name: 'Munich I', weightKg: 0.4, potentialSg: 1.036, colorEbc: 15.0, type: 'base' }
    ],
    [
      { id: 'h1', name: 'Citra', weightG: 20, alphaAcid: 12.5, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Amarillo', weightG: 25, alphaAcid: 8.5, boilTimeMin: 10, use: 'boil' },
      { id: 'h3', name: 'Citra', weightG: 30, alphaAcid: 12.5, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h4', name: 'Amarillo', weightG: 35, alphaAcid: 8.5, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 55, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_VOSS,
    2.4, 32,
    ['APA', 'Квейк', 'Норвегия', 'Апельсин', 'Быстрое брожение']
  ),

  createExtendedRecipe(
    'rec_single_hop_strata_ipa',
    'Сингл-Хоп Страта (Single Hop Strata IPA)',
    'American IPA',
    'Эли / Хмелевые',
    '100% демонстрация уникального орегонского хмеля Strata. Во вкусе переплетаются ноты спелой садовой клубники, маракуйи и характерный травянисто-пряный крафтовый фон.',
    'МастерВарка Крафт',
    20, 60, 74,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 5.0, potentialSg: 1.038, colorEbc: 5.5, type: 'base' },
      { id: 'g2', name: 'Carapils', weightKg: 0.3, potentialSg: 1.033, colorEbc: 4.5, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Strata', weightG: 20, alphaAcid: 13.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Strata', weightG: 30, alphaAcid: 13.0, boilTimeMin: 15, use: 'boil' },
      { id: 'h3', name: 'Strata', weightG: 40, alphaAcid: 13.0, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h4', name: 'Strata', weightG: 50, alphaAcid: 13.0, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 65, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.5, 19,
    ['IPA', 'Сингл-Хоп', 'Strata', 'Клубника', 'Орегон']
  )
];
