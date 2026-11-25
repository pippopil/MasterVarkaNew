import { Recipe } from '../../types/brewing';
import { createExtendedRecipe, YEAST_US05, YEAST_VOSS, YEAST_W3470, YEAST_S04, YEAST_PHILLY_SOUR, YEAST_BE134 } from './recipeHelper';

export const MORE_CRAFT_ALES: Recipe[] = [
  createExtendedRecipe(
    'rec_nedipa_citra_mosaic',
    'Цитрусовая Туманность (Citra & Mosaic NEDIPA)',
    'New England IPA',
    'Эли / Хмелевые',
    'Двойной сочный новоанглийский IPA крепостью 8.2%. Двойное сухое охмеление (DDH) крио-хмелями Citra Cryo и Mosaic Cryo на сочной овсяно-пшеничной базе.',
    'Крафтовая Волна',
    20, 60, 72,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 5.5, potentialSg: 1.038, colorEbc: 5.5, type: 'base' },
      { id: 'g2', name: 'Flaked Oats', weightKg: 1.0, potentialSg: 1.033, colorEbc: 2.5, type: 'adjunct' },
      { id: 'g3', name: 'Wheat Malt', weightKg: 0.8, potentialSg: 1.038, colorEbc: 4.0, type: 'wheat' }
    ],
    [
      { id: 'h1', name: 'Citra', weightG: 30, alphaAcid: 12.5, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h2', name: 'Mosaic', weightG: 30, alphaAcid: 12.0, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h3', name: 'Citra', weightG: 50, alphaAcid: 12.5, boilTimeMin: 0, use: 'dry_hop' },
      { id: 'h4', name: 'Mosaic', weightG: 50, alphaAcid: 12.0, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Полнотелое затирание', tempC: 67, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.4, 19,
    ['NEIPA', 'NEDIPA', 'Citra', 'Mosaic', 'Мутное', 'Тропики']
  ),

  createExtendedRecipe(
    'rec_session_hazy_ipa_sabro',
    'Солнечный Бриз (Session Hazy IPA Sabro & Citra)',
    'Session IPA',
    'Эли / Хмелевые',
    'Легкий сессионный мутный эль (4.2% ABV). Вся прелесть тропического хмеля Sabro и Citra в питком формате для долгих летних вечеров.',
    'МастерВарка Крафт',
    20, 60, 75,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 3.2, potentialSg: 1.038, colorEbc: 5.5, type: 'base' },
      { id: 'g2', name: 'Flaked Oats', weightKg: 0.6, potentialSg: 1.033, colorEbc: 2.5, type: 'adjunct' },
      { id: 'g3', name: 'Wheat Malt', weightKg: 0.4, potentialSg: 1.038, colorEbc: 4.0, type: 'wheat' }
    ],
    [
      { id: 'h1', name: 'Sabro', weightG: 20, alphaAcid: 13.5, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h2', name: 'Citra', weightG: 20, alphaAcid: 12.5, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h3', name: 'Sabro', weightG: 35, alphaAcid: 13.5, boilTimeMin: 0, use: 'dry_hop' },
      { id: 'h4', name: 'Citra', weightG: 35, alphaAcid: 12.5, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 67, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.5, 19,
    ['Session IPA', 'Sabro', 'Citra', 'Легкое', 'Мутное']
  ),

  createExtendedRecipe(
    'rec_white_ipa_belgian_spice',
    'Белый Хмелевой Шторм (White IPA)',
    'Specialty IPA',
    'Эли / Хмелевые',
    'Гибрид бельгийского бланша и американского IPA. 45% пшеницы, пряные зерна кориандра, цедра горького апельсина кюрасао и мощный хмель Centennial и Amarillo.',
    'Крафтовая Волна',
    20, 60, 74,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 3.2, potentialSg: 1.037, colorEbc: 3.5, type: 'base' },
      { id: 'g2', name: 'Wheat Malt', weightKg: 2.2, potentialSg: 1.038, colorEbc: 4.0, type: 'wheat' }
    ],
    [
      { id: 'h1', name: 'Magnum', weightG: 18, alphaAcid: 14.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Amarillo', weightG: 25, alphaAcid: 8.5, boilTimeMin: 15, use: 'boil' },
      { id: 'h3', name: 'Centennial', weightG: 30, alphaAcid: 10.0, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h4', name: 'Amarillo', weightG: 40, alphaAcid: 8.5, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 65, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.6, 19,
    ['White IPA', 'Пшеничное', 'Цедра', 'Кориандр', 'Хмель'],
    undefined,
    [
      { id: 'o1', name: 'Зерна кориандра дробленые', amount: 15, unit: 'g', stage: 'boil', timeMinOrDays: 5, type: 'spice' },
      { id: 'o2', name: 'Цедра горького апельсина Кюрасао', amount: 20, unit: 'g', stage: 'boil', timeMinOrDays: 5, type: 'spice' }
    ]
  ),

  createExtendedRecipe(
    'rec_milkshake_strawberry_vanilla',
    'Клубничный Пломбир (Strawberry Vanilla Milkshake IPA)',
    'Specialty IPA',
    'Эли / Хмелевые',
    'Нежнейший сливочно-клубничный милкшейк-IPA с добавлением лактозы, спелой садовой клубники и натуральной мадагаскарской ванили. Хмель Belma и Mosaic.',
    'МастерВарка Крафт',
    20, 60, 72,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 4.2, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Flaked Oats', weightKg: 0.8, potentialSg: 1.033, colorEbc: 2.5, type: 'adjunct' },
      { id: 'g3', name: 'Wheat Malt', weightKg: 0.5, potentialSg: 1.038, colorEbc: 4.0, type: 'wheat' }
    ],
    [
      { id: 'h1', name: 'Magnum', weightG: 15, alphaAcid: 14.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Mosaic', weightG: 25, alphaAcid: 12.0, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h3', name: 'Citra', weightG: 35, alphaAcid: 12.5, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Полнотелое затирание', tempC: 68, timeMin: 60, type: 'dextrin' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.3, 19,
    ['Милкшейк', 'Клубника', 'Ваниль', 'Лактоза', 'Десерт'],
    undefined,
    [
      { id: 'o1', name: 'Лактоза пищевая', amount: 500, unit: 'g', stage: 'boil', timeMinOrDays: 10, type: 'sugar', fermentablePercent: 10 },
      { id: 'o2', name: 'Натуральное клубничное пюре', amount: 1500, unit: 'g', stage: 'secondary', timeMinOrDays: 5, type: 'fruit' },
      { id: 'o3', name: 'Стручок бурбонской ванили', amount: 1, unit: 'pcs', stage: 'secondary', timeMinOrDays: 5, type: 'spice' }
    ]
  ),

  createExtendedRecipe(
    'rec_aus_pale_ale_vic_secret',
    'Австралийский Сикрет (Australian Pale Ale Vic Secret)',
    'Australian Sparkling Ale',
    'Эли / Хмелевые',
    'Освежающий австралийский золотистый эль на хмеле Vic Secret. Хрустящее тело, чистый солодовый профиль и яркие ноты сочного ананаса, сосны и белого винограда.',
    'Крафтовая Волна',
    20, 60, 75,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 4.2, potentialSg: 1.038, colorEbc: 5.5, type: 'base' },
      { id: 'g2', name: 'Carapils', weightKg: 0.3, potentialSg: 1.033, colorEbc: 4.5, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Vic Secret', weightG: 18, alphaAcid: 15.5, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Vic Secret', weightG: 25, alphaAcid: 15.5, boilTimeMin: 10, use: 'boil' },
      { id: 'h3', name: 'Vic Secret', weightG: 35, alphaAcid: 15.5, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h4', name: 'Vic Secret', weightG: 40, alphaAcid: 15.5, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 65, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.5, 19,
    ['Австралия', 'Vic Secret', 'Ананас', 'Хмель', 'Освежающее']
  ),

  createExtendedRecipe(
    'rec_single_hop_idaho7_ipa',
    'Сингл-Хоп Айдахо 7 (Single Hop Idaho 7 IPA)',
    'American IPA',
    'Эли / Хмелевые',
    '100% сортовой профиль Idaho 7. Ноты спелого абрикоса, мандарина, черного чая и сосновой смолы в гармоничном округлом теле американского классического IPA.',
    'МастерВарка Крафт',
    20, 60, 74,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 5.0, potentialSg: 1.038, colorEbc: 5.5, type: 'base' },
      { id: 'g2', name: 'Caramunich I', weightKg: 0.25, potentialSg: 1.034, colorEbc: 90.0, type: 'caramel' },
      { id: 'g3', name: 'Carapils', weightKg: 0.25, potentialSg: 1.033, colorEbc: 4.5, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Idaho 7', weightG: 22, alphaAcid: 13.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Idaho 7', weightG: 30, alphaAcid: 13.0, boilTimeMin: 15, use: 'boil' },
      { id: 'h3', name: 'Idaho 7', weightG: 40, alphaAcid: 13.0, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h4', name: 'Idaho 7', weightG: 50, alphaAcid: 13.0, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 65, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.5, 19,
    ['IPA', 'Сингл-Хоп', 'Idaho 7', 'Абрикос', 'Мандарин']
  ),

  createExtendedRecipe(
    'rec_mountain_style_vermont_ipa',
    'Вермонтский Горный (Mountain Style Hazy IPA)',
    'American IPA',
    'Эли / Хмелевые',
    'Идеальный баланс между восточным побережьем (East Coast Hazy) и западным (West Coast). Умеренная шелковистая мутность, мягкая сочная горечь и смолистые тропики хмелей Simcoe & Citra.',
    'Крафтовая Волна',
    20, 60, 73,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 4.6, potentialSg: 1.038, colorEbc: 6.0, type: 'base' },
      { id: 'g2', name: 'Flaked Oats', weightKg: 0.6, potentialSg: 1.033, colorEbc: 2.5, type: 'adjunct' },
      { id: 'g3', name: 'Wheat Malt', weightKg: 0.5, potentialSg: 1.038, colorEbc: 4.0, type: 'wheat' }
    ],
    [
      { id: 'h1', name: 'Simcoe', weightG: 20, alphaAcid: 13.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Citra', weightG: 30, alphaAcid: 12.5, boilTimeMin: 10, use: 'boil' },
      { id: 'h3', name: 'Simcoe', weightG: 35, alphaAcid: 13.0, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h4', name: 'Citra', weightG: 45, alphaAcid: 12.5, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.4, 19,
    ['IPA', 'Mountain IPA', 'Вермонт', 'Simcoe', 'Citra']
  ),

  createExtendedRecipe(
    'rec_smoothie_sour_blueberry_marshmallow',
    'Черничный Зефир (Blueberry Marshmallow Smoothie Sour)',
    'Wild Specialty Beer',
    'Кислые эли',
    'Ультра-густой смузи-саур цвета черничного йогурта. Массивное добавление черничного пюре, пюре банана для плотности и натурального маршмеллоу.',
    'МастерВарка Крафт',
    20, 60, 72,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 2.2, potentialSg: 1.037, colorEbc: 3.5, type: 'base' },
      { id: 'g2', name: 'Flaked Oats', weightKg: 1.0, potentialSg: 1.033, colorEbc: 2.5, type: 'adjunct' },
      { id: 'g3', name: 'Wheat Malt', weightKg: 0.8, potentialSg: 1.038, colorEbc: 4.0, type: 'wheat' }
    ],
    [
      { id: 'h1', name: 'Hallertau Blanc', weightG: 10, alphaAcid: 9.5, boilTimeMin: 60, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Полнотелое затирание', tempC: 68, timeMin: 60, type: 'dextrin' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_PHILLY_SOUR,
    2.4, 20,
    ['Смузи-саур', 'Черника', 'Маршмеллоу', 'Кислый эль', 'Десерт'],
    undefined,
    [
      { id: 'o1', name: 'Натуральное черничное пюре', amount: 2000, unit: 'g', stage: 'secondary', timeMinOrDays: 5, type: 'fruit' },
      { id: 'o2', name: 'Банановое пюре для шелковистой текстуры', amount: 800, unit: 'g', stage: 'secondary', timeMinOrDays: 5, type: 'fruit' }
    ]
  ),

  createExtendedRecipe(
    'rec_guava_pink_salt_gose',
    'Розовое Гозе (Pink Guava & Sea Salt Gose)',
    'Specialty Gose',
    'Кислые эли',
    'Освежающий пшеничный саур с пюре розовой гуавы и гималайской розовой солью. Нежный коралловый цвет, шелковистая кислинка и деликатный минеральный баланс.',
    'Крафтовая Волна',
    20, 60, 74,
    [
      { id: 'g1', name: 'Pilsner Malt', weightKg: 2.3, potentialSg: 1.037, colorEbc: 3.5, type: 'base' },
      { id: 'g2', name: 'Wheat Malt', weightKg: 1.7, potentialSg: 1.038, colorEbc: 4.0, type: 'wheat' }
    ],
    [
      { id: 'h1', name: 'Hallertau Mittelfrüh', weightG: 12, alphaAcid: 4.0, boilTimeMin: 60, use: 'boil' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 65, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_PHILLY_SOUR,
    2.7, 20,
    ['Гозе', 'Гуава', 'Розовая соль', 'Кислый эль', 'Тропики'],
    undefined,
    [
      { id: 'o1', name: 'Гималайская розовая соль', amount: 25, unit: 'g', stage: 'boil', timeMinOrDays: 10, type: 'spice' },
      { id: 'o2', name: 'Пюре спелой розовой гуавы', amount: 1500, unit: 'g', stage: 'secondary', timeMinOrDays: 5, type: 'fruit' }
    ]
  ),

  createExtendedRecipe(
    'rec_cashmere_el_dorado_ipa',
    'Шелковый Эльдорадо (Cashmere & El Dorado IPA)',
    'American IPA',
    'Эли / Хмелевые',
    'Невероятно мягкий хмелевой профиль. Хмель Cashmere дает ощущение гладкого кашемира с нотами лимонной цедры и дыни, а El Dorado наполняет бокал ароматом спелой груши и ананаса.',
    'МастерВарка Крафт',
    20, 60, 74,
    [
      { id: 'g1', name: 'Pale Ale Malt', weightKg: 4.8, potentialSg: 1.038, colorEbc: 5.5, type: 'base' },
      { id: 'g2', name: 'Flaked Oats', weightKg: 0.6, potentialSg: 1.033, colorEbc: 2.5, type: 'adjunct' },
      { id: 'g3', name: 'Carapils', weightKg: 0.3, potentialSg: 1.033, colorEbc: 4.5, type: 'caramel' }
    ],
    [
      { id: 'h1', name: 'Warrior', weightG: 18, alphaAcid: 15.0, boilTimeMin: 60, use: 'boil' },
      { id: 'h2', name: 'Cashmere', weightG: 30, alphaAcid: 8.5, boilTimeMin: 10, use: 'boil' },
      { id: 'h3', name: 'El Dorado', weightG: 35, alphaAcid: 14.0, boilTimeMin: 0, use: 'whirlpool' },
      { id: 'h4', name: 'Cashmere', weightG: 40, alphaAcid: 8.5, boilTimeMin: 0, use: 'dry_hop' },
      { id: 'h5', name: 'El Dorado', weightG: 40, alphaAcid: 14.0, boilTimeMin: 0, use: 'dry_hop' }
    ],
    [
      { id: 'm1', name: 'Осахаривание', tempC: 66, timeMin: 60, type: 'maltose' },
      { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
    ],
    YEAST_US05,
    2.5, 19,
    ['IPA', 'Cashmere', 'El Dorado', 'Груша', 'Дыня', 'Шелк']
  )
];
