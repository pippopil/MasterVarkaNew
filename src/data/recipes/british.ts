import { Recipe } from '../../types/brewing';
import { createExtendedRecipe, YEAST_S04, YEAST_NOTTINGHAM } from './recipeHelper';

export const BRITISH_RECIPES: Recipe[] = [
  createExtendedRecipe(
    'rec_london_pride_best_bitter',
    'Гордость Лондона (Best Bitter London Pride)',
    'Best Bitter',
    'Британские и Ирландские',
    'Эталон английского янтарного биттера в стиле Fuller\'s London Pride. Солодовая основа Maris Otter, бисквитный солод, хмель Target на горечь и благородный Challenger & Goldings на финише.',
    'Британское Наследие',
    20, 60, 75,
    [
      { id: 'g1', name: 'Maris Otter', weightKg: 3.8, potentialSg: 1.038, colorEbc: 6.5, type: 'base' },
      { id: 'g2', name: 'Caramunich I', weightKg: 0.35, potentialSg: 1.034, colorEbc: 90.0, type: 'caramel' },
      { id: 'g3', name: 'Carapils', weightKg: 0.2, potentialSg: 1.033, colorEbc: 4.5, type: 'caramel' },
      { id: 'g4', name: 'Chocolate Malt', weightKg: 0.05, potentialSg: 1.028, colorEbc: 900.0, type: 'roasted' }
    ],
    [
      { id: 'h1', name: 'Target', weightG: 18, alphaAcid: 11.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Challenger', weightG: 20, alphaAcid: 7.5, boilTimeMin: 15, use: 'boil' },
      { id: 'h3', name: 'East Kent Goldings', weightG: 20, alphaAcid: 5.0, boilTimeMin: 5, use: 'aroma' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_S04,
    1.9, 19,
    ['Биттер', 'Англия', 'Лондон', 'Maris Otter', 'Классика']
  ),

  createExtendedRecipe(
    'rec_newcastle_brown_ale',
    'Ньюкаслский Коричневый (Newcastle Brown Ale)',
    'English Brown Ale',
    'Британские и Ирландские',
    'Знаменитый коричневый эль из северо-восточной Англии. Мягкий ореховый вкус, тона поджаренной хлебной корочки, карамели и нежный сладковатый баланс с легкой хмелевой горчинкой.',
    'Британское Наследие',
    20, 60, 75,
    [
      { id: 'g1', name: 'Maris Otter', weightKg: 3.5, potentialSg: 1.038, colorEbc: 6.5, type: 'base' },
      { id: 'g2', name: 'Caramunich II', weightKg: 0.45, potentialSg: 1.034, colorEbc: 120.0, type: 'caramel' },
      { id: 'g3', name: 'Amber Malt / Biscuit', weightKg: 0.3, potentialSg: 1.034, colorEbc: 50.0, type: 'caramel' },
      { id: 'g4', name: 'Chocolate Malt', weightKg: 0.1, potentialSg: 1.028, colorEbc: 900.0, type: 'roasted' }
    ],
    [
      { id: 'h1', name: 'Fuggles', weightG: 25, alphaAcid: 4.5, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'East Kent Goldings', weightG: 18, alphaAcid: 5.0, boilTimeMin: 15, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 67, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_S04,
    2.1, 19,
    ['Эль', 'Коричневый эль', 'Ньюкасл', 'Ореховое', 'Карамель']
  ),

  createExtendedRecipe(
    'rec_wee_heavy_90_shilling',
    'Крепкий Шотландский Ви Хэви (Wee Heavy 90/-)',
    'Wee Heavy',
    'Британские и Ирландские',
    'Могучий карамелизированный шотландский эль крепостью 8.2% ABV. Длительное кипячение сусла для реакции Майяра придает глубокие тона ириса, патоки, сливочной помадки и печеных яблок.',
    'Шотландские Традиции',
    20, 90, 72,
    [
      { id: 'g1', name: 'Maris Otter', weightKg: 6.2, potentialSg: 1.038, colorEbc: 6.5, type: 'base' },
      { id: 'g2', name: 'Munich I', weightKg: 1.0, potentialSg: 1.036, colorEbc: 15.0, type: 'base' },
      { id: 'g3', name: 'Caramunich II', weightKg: 0.5, potentialSg: 1.034, colorEbc: 120.0, type: 'caramel' },
      { id: 'g4', name: 'Roasted Barley', weightKg: 0.08, potentialSg: 1.025, colorEbc: 1100.0, type: 'roasted' }
    ],
    [
      { id: 'h1', name: 'East Kent Goldings', weightG: 30, alphaAcid: 5.0, boilTimeMin: 90, use: 'boil' },
      { id: 'h2', name: 'Fuggles', weightG: 15, alphaAcid: 4.5, boilTimeMin: 20, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Полнотелое затирание', tempC: 68, timeMin: 70, type: 'dextrin' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_NOTTINGHAM,
    1.8, 17,
    ['Шотландия', 'Ви Хэви', 'Карамель', 'Крепкое', 'Ирис']
  ),

  createExtendedRecipe(
    'rec_thomas_hardy_barleywine',
    'Английский Барливайн Томас Харди (English Barleywine)',
    'English Barleywine',
    'Британские и Ирландские',
    '«Ячменное вино» винтажной выдержки (10.5% ABV). Густой, согревающий эль с нотами хереса, портвейна, сушеного инжира, патоки и богатого английского солодового тела.',
    'Британское Наследие',
    20, 120, 70,
    [
      { id: 'g1', name: 'Maris Otter', weightKg: 8.5, potentialSg: 1.038, colorEbc: 6.5, type: 'base' },
      { id: 'g2', name: 'Caramunich III', weightKg: 0.6, potentialSg: 1.033, colorEbc: 150.0, type: 'caramel' },
      { id: 'g3', name: 'Special B', weightKg: 0.3, potentialSg: 1.032, colorEbc: 300.0, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Target', weightG: 45, alphaAcid: 11.0, boilTimeMin: 90, use: 'boil' },
      { id: 'h2', name: 'East Kent Goldings', weightG: 30, alphaAcid: 5.0, boilTimeMin: 30, use: 'boil' },
      { id: 'h3', name: 'East Kent Goldings', weightG: 30, alphaAcid: 5.0, boilTimeMin: 5, use: 'aroma' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 75, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_NOTTINGHAM,
    1.8, 17,
    ['Барливайн', 'Англия', 'Крепкое', 'Выдержка', 'Портвейн']
  ),

  createExtendedRecipe(
    'rec_irish_red_ale_smithwicks',
    'Ирландский Красный Бархат (Irish Red Ale)',
    'Irish Red Ale',
    'Британские и Ирландские',
    'Традиционный ирландский красный эль в стиле Kilkenny и Smithwick\'s. Характерный медный цвет за счет щепотки жженого ячменя, чистая карамельная сладость и сухой сдержанный финиш.',
    'Ирландские Традиции',
    20, 60, 75,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 4.0, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Carared', weightKg: 0.45, potentialSg: 1.034, colorEbc: 50.0, type: 'caramel' },
      { id: 'g3', name: 'Caramunich II', weightKg: 0.2, potentialSg: 1.034, colorEbc: 120.0, type: 'caramel' },
      { id: 'g4', name: 'Roasted Barley', weightKg: 0.04, potentialSg: 1.025, colorEbc: 1100.0, type: 'roasted' }
    ],
    [
      { id: 'h1', name: 'East Kent Goldings', weightG: 25, alphaAcid: 5.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Fuggles', weightG: 18, alphaAcid: 4.5, boilTimeMin: 15, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_S04,
    2.2, 19,
    ['Красный эль', 'Ирландия', 'Карамель', 'Бархат', 'Килкенни']
  ),

  createExtendedRecipe(
    'rec_english_summer_golden_ale',
    'Британский Золотистый (English Golden Ale)',
    'British Golden Ale',
    'Британские и Ирландские',
    'Легкий, искрящийся освежающий пабный эль цвета спелой соломы. Сварен для любителей светлых сортов: нежный бисквитный солод с нотами луговых трав и цветочного английского хмеля First Gold.',
    'Британское Наследие',
    20, 60, 75,
    [
      { id: 'g1', name: 'Maris Otter', weightKg: 4.0, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Wheat Malt', weightKg: 0.35, potentialSg: 1.038, colorEbc: 4.0, type: 'wheat' }
    ],
    [
      { id: 'h1', name: 'Challenger', weightG: 20, alphaAcid: 7.5, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'First Gold', weightG: 25, alphaAcid: 6.5, boilTimeMin: 10, use: 'boil' },
      { id: 'h3', name: 'First Gold', weightG: 20, alphaAcid: 6.5, boilTimeMin: 0, use: 'whirlpool' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 65, timeMin: 55, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_S04,
    2.2, 19,
    ['Золотистый эль', 'Англия', 'Паб', 'Летнее', 'Цветы']
  )
];
