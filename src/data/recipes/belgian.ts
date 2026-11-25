import { Recipe } from '../../types/brewing';
import { createExtendedRecipe, YEAST_BE256, YEAST_BE134, YEAST_S33 } from './recipeHelper';

export const BELGIAN_RECIPES: Recipe[] = [
  createExtendedRecipe(
    'rec_belgian_quadrupel_rochefort',
    'Траппистский Квадрюпель (Belgian Quadrupel 10.5%)',
    'Belgian Dark Strong Ale',
    'Бельгийские эли',
    'Король траппистского пивоварения в стиле Rochefort 10 и Westvleteren 12. Глубокий темно-рубиновый цвет, сложнейший букет инжира, фиников, рома и темного бельгийского леденцового сахара Candi Sugar.',
    'Траппистские Монастыри',
    20, 90, 72,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 6.5, potentialSg: 1.037, colorEbc: 3.5, type: 'base' },
      { id: 'g2', name: 'Munich I', weightKg: 1.5, potentialSg: 1.036, colorEbc: 15.0, type: 'base' },
      { id: 'g3', name: 'Special B', weightKg: 0.5, potentialSg: 1.032, colorEbc: 300.0, type: 'caramel' },
      { id: 'g4', name: 'Caramunich II', weightKg: 0.4, potentialSg: 1.034, colorEbc: 120.0, type: 'caramel' },
      { id: 'g5', name: 'Carafa Special I', weightKg: 0.08, potentialSg: 1.029, colorEbc: 900.0, type: 'roasted' }
    ],
    [
      { id: 'h1', name: 'Magnum', weightG: 25, alphaAcid: 14.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Styrian Goldings', weightG: 25, alphaAcid: 4.5, boilTimeMin: 20, use: 'boil' },
      { id: 'h3', name: 'Saaz', weightG: 20, alphaAcid: 3.8, boilTimeMin: 5, use: 'aroma' }
    ],
    [
      { id: 'm1', name: 'Белковая пауза', tempC: 52, timeMin: 15, type: 'protein' },
      { id: 'm2', name: 'Мальтозная пауза', tempC: 63, timeMin: 55, type: 'maltose' },
      { id: 'm3', name: 'Осахаривание', tempC: 72, timeMin: 25, type: 'dextrin' },
      { id: 'm4', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_BE256,
    2.8, 20,
    ['Бельгия', 'Квадрюпель', 'Трапписты', 'Крепкое', 'Инжир'],
    undefined,
    [
      { id: 'o1', name: 'Темный бельгийский сахар Candi Sugar D-180', amount: 800, unit: 'g', stage: 'boil', timeMinOrDays: 10, type: 'sugar', extractPercent: 95, fermentablePercent: 100 }
    ]
  ),

  createExtendedRecipe(
    'rec_biere_de_garde_ambree',
    'Французский Бир де Гард (Bière de Garde Ambrée)',
    'Bière de Garde',
    'Бельгийские эли',
    'Исторический фермерский янтарный эль французской Фландрии длительного созревания в подвалах. Плотное солодовое тело, тона поджаренной корочки бриоши, карамели и мягкие фруктовые эфиры.',
    'Французские Традиции',
    20, 75, 74,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 3.8, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g2', name: 'Vienna Malt', weightKg: 1.5, potentialSg: 1.036, colorEbc: 8.5, type: 'base' },
      { id: 'g3', name: 'Munich I', weightKg: 0.8, potentialSg: 1.036, colorEbc: 15.0, type: 'base' },
      { id: 'g4', name: 'Caramunich II', weightKg: 0.35, potentialSg: 1.034, colorEbc: 120.0, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Brewer\'s Gold', weightG: 25, alphaAcid: 8.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Strisselspalt', weightG: 25, alphaAcid: 3.5, boilTimeMin: 15, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Мальтозная пауза', tempC: 64, timeMin: 50, type: 'maltose' },
      { id: 'm2', name: 'Осахаривание', tempC: 72, timeMin: 20, type: 'dextrin' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_BE256,
    2.5, 18,
    ['Франция', 'Фландрия', 'Бир де Гард', 'Янтарный', 'Выдержка']
  ),

  createExtendedRecipe(
    'rec_belgian_single_patersbier',
    'Монастырское Столовое (Patersbier / Enkel)',
    'Belgian Single',
    'Бельгийские эли',
    'Легкое освежающее столовое пиво траппистских монахов (4.8% ABV), которое они варят исключительно для ежедневного употребления в монастыре. Золотистый цвет, сухое тело и тонкие пряные фенолы.',
    'Траппистские Монастыри',
    20, 60, 76,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 4.2, potentialSg: 1.037, colorEbc: 3.4, type: 'base' },
      { id: 'g2', name: 'Carafoam / Carapils', weightKg: 0.25, potentialSg: 1.033, colorEbc: 4.5, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Saaz', weightG: 30, alphaAcid: 3.8, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Styrian Goldings', weightG: 20, alphaAcid: 4.5, boilTimeMin: 15, use: 'boil' },
      { id: 'h3', name: 'Saaz', weightG: 20, alphaAcid: 3.8, boilTimeMin: 5, use: 'aroma' }
    ],
    [
      { id: 'm1', name: 'Сухое осахаривание', tempC: 63, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Осахаривание', tempC: 71, timeMin: 20, type: 'dextrin' },
      { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_BE256,
    2.8, 19,
    ['Бельгия', 'Патерсбир', 'Трапписты', 'Легкое', 'Пряности']
  ),

  createExtendedRecipe(
    'rec_grisette_hainaut',
    'Шахтерский Гризетт (Grisette)',
    'Grisette',
    'Бельгийские эли',
    'Исторический фермерский эль провинции Эно для шахтеров. Чрезвычайно освежающий, с легкой пшеничной кислинкой, сухим финишем и тонким цветочным ароматом хмеля.',
    'Франко-Бельгийские Традиции',
    20, 60, 75,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 2.8, potentialSg: 1.037, colorEbc: 3.4, type: 'base' },
      { id: 'g2', name: 'Wheat Malt', weightKg: 0.9, potentialSg: 1.038, colorEbc: 4.0, type: 'wheat' },
      { id: 'g3', name: 'Flaked Oats', weightKg: 0.3, potentialSg: 1.033, colorEbc: 2.5, type: 'adjunct' }
    ],
    [
      { id: 'h1', name: 'Saaz', weightG: 25, alphaAcid: 3.8, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Styrian Goldings', weightG: 20, alphaAcid: 4.5, boilTimeMin: 10, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Сухое осахаривание', tempC: 63, timeMin: 65, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_BE134,
    3.0, 22,
    ['Бельгия', 'Гризетт', 'Фермерский', 'Легкое', 'Пшеничное']
  ),

  createExtendedRecipe(
    'rec_belgian_golden_strong_duvel',
    'Золотистый Искуситель (Belgian Golden Strong Ale 8.5%)',
    'Belgian Golden Strong Ale',
    'Бельгийские эли',
    'Образцовый бельгийский крепкий золотистый эль в стиле культового Duvel. Обманчиво легкое, искристое тело скрывает согревающие 8.5% алкоголя, грушевые эфиры и перечные фенолы.',
    'Бельгийская Классика',
    20, 90, 74,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 5.2, potentialSg: 1.037, colorEbc: 3.2, type: 'base' }
    ],
    [
      { id: 'h1', name: 'Saaz', weightG: 30, alphaAcid: 3.8, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Styrian Goldings', weightG: 25, alphaAcid: 4.5, boilTimeMin: 20, use: 'boil' },
      { id: 'h3', name: 'Saaz', weightG: 25, alphaAcid: 3.8, boilTimeMin: 5, use: 'aroma' }
    ],
    [
      { id: 'm1', name: 'Сухое осахаривание', tempC: 63, timeMin: 75, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_BE256,
    3.4, 20,
    ['Бельгия', 'Дювель', 'Золотистый эль', 'Крепкое', 'Игристое'],
    undefined,
    [
      { id: 'o1', name: 'Светлый декстрозный сахар для сушки тела', amount: 800, unit: 'g', stage: 'boil', timeMinOrDays: 10, type: 'sugar', extractPercent: 100, fermentablePercent: 100 }
    ]
  ),

  createExtendedRecipe(
    'rec_belgian_pale_ale_antwerp',
    'Антверпенский Медный (Belgian Pale Ale)',
    'Belgian Pale Ale',
    'Бельгийские эли',
    'Традиционный бельгийский янтарный эль в стиле пивоварни De Koninck («Bolleke»). Умеренная крепость (5.0%), чистый бисквитный солод с легкими фруктовыми эфирами абрикоса и мягкой пряностью.',
    'Бельгийская Классика',
    20, 60, 75,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 3.6, potentialSg: 1.037, colorEbc: 3.8, type: 'base' },
      { id: 'g2', name: 'Vienna Malt', weightKg: 0.8, potentialSg: 1.036, colorEbc: 8.5, type: 'base' },
      { id: 'g3', name: 'Caramunich II', weightKg: 0.35, potentialSg: 1.034, colorEbc: 120.0, type: 'caramel' },
      { id: 'g4', name: 'Biscuit Malt', weightKg: 0.2, potentialSg: 1.034, colorEbc: 50.0, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Saaz', weightG: 25, alphaAcid: 3.8, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Fuggles', weightG: 18, alphaAcid: 4.5, boilTimeMin: 20, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_BE256,
    2.5, 19,
    ['Бельгия', 'Антверпен', 'Пэйл Эль', 'Бисквит', 'Карамель']
  )
];
