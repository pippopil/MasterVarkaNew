/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Автоматически верифицированный набор эталонных рецептов BJCP.
 */

import { Recipe } from '../../types/brewing';

export const MASSIVE_RECIPE_DATASET: Recipe[] = [
  {
    "id": "rec_belgian_dubbel_westmalle",
    "name": "Траппистский Дуббель (Belgian Dubbel 7.0%)",
    "style": "Belgian Dubbel",
    "category": "Бельгийские эли",
    "description": "Классический темный траппистский эль в стиле Westmalle Dubbel. Плотная солодовая сладость, тона изюма, фиников, карамели и бельгийского леденцового сахара.",
    "author": "Траппистские Монастыри",
    "batchSizeL": 30,
    "boilTimeMin": 75,
    "efficiencyPercent": 74,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.7,
    "beerTempAtBottlingC": 21,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 6,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.2,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.5,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      },
      {
        "id": "g_4",
        "name": "Special B",
        "weightKg": 0.3,
        "potentialSg": 1.032,
        "colorEbc": 300,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Styrian Goldings",
        "weightG": 35,
        "alphaAcid": 4.5,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Saaz",
        "weightG": 25,
        "alphaAcid": 3.8,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Мальтозная пауза",
        "tempC": 64,
        "timeMin": 50,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Осахаривание",
        "tempC": 72,
        "timeMin": 20,
        "type": "dextrin"
      },
      {
        "id": "m_3",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle BE-256 (Abbaye)",
      "lab": "Fermentis",
      "form": "dry",
      "type": "belgian",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 84,
      "tempRange": [
        18,
        25
      ]
    },
    "otherIngredients": [
      {
        "id": "o_1",
        "name": "Темный леденцовый сахар Candi Sugar",
        "amount": 600,
        "unit": "g",
        "stage": "boil",
        "type": "sugar",
        "fermentablePercent": 100,
        "extractPercent": 95
      }
    ],
    "calculated": {
      "ogSg": 1.067,
      "ogPlato": 16.4,
      "fgSg": 1.011,
      "fgPlato": 2.8,
      "abv": 7.4,
      "ibu": 14,
      "srm": 14.2,
      "ebc": 28,
      "buGuRatio": 0.21,
      "totalGrainWeightKg": 8,
      "strikeWaterL": 28,
      "spargeWaterL": 14.2,
      "totalWaterL": 42.2,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 24.6,
      "yeastPacksNeeded": 3,
      "dextroseGrams": 224,
      "sucroseGrams": 204,
      "dmeGrams": 291,
      "speiseMl": 996,
      "caloriesPer500ml": 222
    },
    "tags": [
      "Дуббель",
      "Бельгия",
      "Трапписты",
      "Изюм",
      "Карамель"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_american_amber_ale_cascade",
    "name": "Американский Янтарный Эль (American Amber Ale)",
    "style": "American Amber Ale",
    "category": "Эли / Хмелевые",
    "description": "Карамельно-солодовый эль теплого медного оттенка. Сбалансированная хмелевая горечь Cascade и Centennial, ноты поджаренного хлеба и цитрусов.",
    "author": "Американская Классика",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.4,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pale Ale Malt",
        "weightKg": 5.4,
        "potentialSg": 1.038,
        "colorEbc": 6,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Caramel 50 EBC",
        "weightKg": 0.8,
        "potentialSg": 1.034,
        "colorEbc": 50,
        "type": "caramel"
      },
      {
        "id": "g_3",
        "name": "Caramunich I",
        "weightKg": 0.35,
        "potentialSg": 1.034,
        "colorEbc": 90,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Cascade",
        "weightG": 30,
        "alphaAcid": 6.5,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Centennial",
        "weightG": 25,
        "alphaAcid": 10,
        "boilTimeMin": 15,
        "use": "boil"
      },
      {
        "id": "h_3",
        "name": "Cascade",
        "weightG": 30,
        "alphaAcid": 6.5,
        "boilTimeMin": 0,
        "use": "whirlpool"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.051,
      "ogPlato": 12.6,
      "fgSg": 1.01,
      "fgPlato": 2.6,
      "abv": 5.4,
      "ibu": 30,
      "srm": 9.4,
      "ebc": 18.5,
      "buGuRatio": 0.59,
      "totalGrainWeightKg": 6.55,
      "strikeWaterL": 22.9,
      "spargeWaterL": 17,
      "totalWaterL": 39.9,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 14.2,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 182,
      "sucroseGrams": 166,
      "dmeGrams": 237,
      "speiseMl": 1068,
      "caloriesPer500ml": 167
    },
    "tags": [
      "Янтарный эль",
      "Америка",
      "Карамель",
      "Cascade",
      "Цитрус"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_scottish_heavy_70_shilling",
    "name": "Шотландский Хэви (Scottish Heavy 70/-)",
    "style": "Scottish Heavy",
    "category": "Британские и Ирландские",
    "description": "Традиционный шотландский эль умеренной крепости (4.0% ABV). Карамелизация солодового сусла в котле дает неповторимый бисквитно-ирисовый характер.",
    "author": "Шотландские Традиции",
    "batchSizeL": 30,
    "boilTimeMin": 90,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 1.9,
    "beerTempAtBottlingC": 18,
    "grains": [
      {
        "id": "g_1",
        "name": "Maris Otter",
        "weightKg": 4.8,
        "potentialSg": 1.038,
        "colorEbc": 6.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Caramunich II",
        "weightKg": 0.45,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      },
      {
        "id": "g_3",
        "name": "Roasted Barley",
        "weightKg": 0.06,
        "potentialSg": 1.025,
        "colorEbc": 1100,
        "type": "roasted"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "East Kent Goldings",
        "weightG": 25,
        "alphaAcid": 5,
        "boilTimeMin": 60,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Полнотелое затирание",
        "tempC": 68,
        "timeMin": 60,
        "type": "dextrin"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle S-04",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 75,
      "tempRange": [
        15,
        20
      ]
    },
    "calculated": {
      "ogSg": 1.042,
      "ogPlato": 10.5,
      "fgSg": 1.01,
      "fgPlato": 2.6,
      "abv": 4.2,
      "ibu": 10,
      "srm": 12.2,
      "ebc": 24,
      "buGuRatio": 0.24,
      "totalGrainWeightKg": 5.31,
      "strikeWaterL": 18.6,
      "spargeWaterL": 21.9,
      "totalWaterL": 40.5,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 11.8,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 118,
      "sucroseGrams": 107,
      "dmeGrams": 153,
      "speiseMl": 853,
      "caloriesPer500ml": 135
    },
    "tags": [
      "Шотландия",
      "Хэви",
      "Карамель",
      "Эль",
      "Бисквит"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_scottish_export_80_shilling",
    "name": "Шотландский Экспорт (Scottish Export 80/-)",
    "style": "Scottish Export",
    "category": "Британские и Ирландские",
    "description": "Классический эль Шотландии крепостью 5.0% ABV. Глубокий медный цвет, чистая солодовая плотность с нотами сушеных яблок, карамели и поджаренного тоста.",
    "author": "Шотландские Традиции",
    "batchSizeL": 30,
    "boilTimeMin": 90,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2,
    "beerTempAtBottlingC": 18,
    "grains": [
      {
        "id": "g_1",
        "name": "Maris Otter",
        "weightKg": 5.8,
        "potentialSg": 1.038,
        "colorEbc": 6.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Caramunich II",
        "weightKg": 0.6,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      },
      {
        "id": "g_3",
        "name": "Special B",
        "weightKg": 0.15,
        "potentialSg": 1.032,
        "colorEbc": 300,
        "type": "caramel"
      },
      {
        "id": "g_4",
        "name": "Roasted Barley",
        "weightKg": 0.08,
        "potentialSg": 1.025,
        "colorEbc": 1100,
        "type": "roasted"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "East Kent Goldings",
        "weightG": 30,
        "alphaAcid": 5,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Fuggles",
        "weightG": 18,
        "alphaAcid": 4.5,
        "boilTimeMin": 20,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 67,
        "timeMin": 65,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle S-04",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 75,
      "tempRange": [
        15,
        20
      ]
    },
    "calculated": {
      "ogSg": 1.052,
      "ogPlato": 12.9,
      "fgSg": 1.013,
      "fgPlato": 3.3,
      "abv": 5.1,
      "ibu": 15,
      "srm": 16.9,
      "ebc": 33.3,
      "buGuRatio": 0.29,
      "totalGrainWeightKg": 6.63,
      "strikeWaterL": 23.2,
      "spargeWaterL": 18.6,
      "totalWaterL": 41.8,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 14.5,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 130,
      "sucroseGrams": 118,
      "dmeGrams": 169,
      "speiseMl": 756,
      "caloriesPer500ml": 165
    },
    "tags": [
      "Шотландия",
      "Экспорт",
      "Карамель",
      "Эль",
      "Медное"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_burton_strong_ale",
    "name": "Бёртонский Крепкий Эль (Burton Strong Ale 7.5%)",
    "style": "Strong Bitter",
    "category": "Британские и Ирландские",
    "description": "Исторический крепкий эль мировой пивной столицы XIX века Бертон-он-Трент. Высокая минерализация сульфатной воды, мощный английский хмель и богатое тело.",
    "author": "Британское Наследие",
    "batchSizeL": 30,
    "boilTimeMin": 75,
    "efficiencyPercent": 74,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.1,
    "beerTempAtBottlingC": 18,
    "grains": [
      {
        "id": "g_1",
        "name": "Maris Otter",
        "weightKg": 7.2,
        "potentialSg": 1.038,
        "colorEbc": 6.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Caramunich II",
        "weightKg": 0.6,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      },
      {
        "id": "g_3",
        "name": "Carapils",
        "weightKg": 0.35,
        "potentialSg": 1.033,
        "colorEbc": 4.5,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Target",
        "weightG": 40,
        "alphaAcid": 11,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "East Kent Goldings",
        "weightG": 35,
        "alphaAcid": 5,
        "boilTimeMin": 20,
        "use": "boil"
      },
      {
        "id": "h_3",
        "name": "East Kent Goldings",
        "weightG": 30,
        "alphaAcid": 5,
        "boilTimeMin": 5,
        "use": "aroma"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 65,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "LalBrew Nottingham",
      "lab": "Lallemand",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 80,
      "tempRange": [
        14,
        21
      ]
    },
    "calculated": {
      "ogSg": 1.063,
      "ogPlato": 15.4,
      "fgSg": 1.013,
      "fgPlato": 3.3,
      "abv": 6.6,
      "ibu": 39,
      "srm": 10.4,
      "ebc": 20.5,
      "buGuRatio": 0.62,
      "totalGrainWeightKg": 8.15,
      "strikeWaterL": 28.5,
      "spargeWaterL": 13.8,
      "totalWaterL": 42.3,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 17.3,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 142,
      "sucroseGrams": 129,
      "dmeGrams": 185,
      "speiseMl": 678,
      "caloriesPer500ml": 204
    },
    "tags": [
      "Бертон",
      "Крепкое",
      "Англия",
      "Хмель",
      "Минералы"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_irish_oyster_stout",
    "name": "Ирландский Устричный Стаут (Oyster Stout)",
    "style": "Irish Stout",
    "category": "Темные эли / Портеры",
    "description": "Исторический стаут с добавлением настоящих устричных раковин на кипе. Карбонат кальция придает суслу неповторимую шелковистость и тончайшую минеральную морскую свежесть.",
    "author": "Ирландские Традиции",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 74,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.1,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pale Ale Malt",
        "weightKg": 5.2,
        "potentialSg": 1.038,
        "colorEbc": 6,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Flaked Barley",
        "weightKg": 1,
        "potentialSg": 1.032,
        "colorEbc": 3.5,
        "type": "adjunct"
      },
      {
        "id": "g_3",
        "name": "Roasted Barley",
        "weightKg": 0.5,
        "potentialSg": 1.025,
        "colorEbc": 1100,
        "type": "roasted"
      },
      {
        "id": "g_4",
        "name": "Chocolate Malt",
        "weightKg": 0.3,
        "potentialSg": 1.028,
        "colorEbc": 900,
        "type": "roasted"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Northern Brewer",
        "weightG": 35,
        "alphaAcid": 9,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "East Kent Goldings",
        "weightG": 25,
        "alphaAcid": 5,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle S-04",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 75,
      "tempRange": [
        15,
        20
      ]
    },
    "otherIngredients": [
      {
        "id": "o_1",
        "name": "Промытые раковины морских устриц",
        "amount": 300,
        "unit": "g",
        "stage": "boil",
        "type": "other"
      }
    ],
    "calculated": {
      "ogSg": 1.052,
      "ogPlato": 12.9,
      "fgSg": 1.013,
      "fgPlato": 3.3,
      "abv": 5.1,
      "ibu": 28,
      "srm": 40,
      "ebc": 78.8,
      "buGuRatio": 0.54,
      "totalGrainWeightKg": 7,
      "strikeWaterL": 24.5,
      "spargeWaterL": 15.8,
      "totalWaterL": 40.3,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 14.5,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 146,
      "sucroseGrams": 133,
      "dmeGrams": 190,
      "speiseMl": 847,
      "caloriesPer500ml": 165
    },
    "tags": [
      "Стаут",
      "Устричный",
      "Ирландия",
      "Минеральное",
      "Шоколад"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_hazy_ipa_strata_galaxy",
    "name": "Космическая Страта (Hazy IPA Strata & Galaxy)",
    "style": "New England IPA",
    "category": "Эли / Хмелевые",
    "description": "Тропическая бомба на австралийском Galaxy и орегонском Strata. Клубника со сливками, спелая маракуйя и сочный персик в ультра-мутном шелковистом теле.",
    "author": "Крафтовая Волна",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 72,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.4,
    "beerTempAtBottlingC": 20,
    "grains": [
      {
        "id": "g_1",
        "name": "Pale Ale Malt",
        "weightKg": 5.6,
        "potentialSg": 1.038,
        "colorEbc": 5.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Flaked Oats",
        "weightKg": 1.2,
        "potentialSg": 1.033,
        "colorEbc": 2.5,
        "type": "adjunct"
      },
      {
        "id": "g_3",
        "name": "Wheat Malt",
        "weightKg": 0.8,
        "potentialSg": 1.038,
        "colorEbc": 4,
        "type": "wheat"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Strata",
        "weightG": 35,
        "alphaAcid": 13,
        "boilTimeMin": 0,
        "use": "whirlpool"
      },
      {
        "id": "h_2",
        "name": "Galaxy",
        "weightG": 35,
        "alphaAcid": 14.5,
        "boilTimeMin": 0,
        "use": "whirlpool"
      },
      {
        "id": "h_3",
        "name": "Strata",
        "weightG": 50,
        "alphaAcid": 13,
        "boilTimeMin": 0,
        "use": "dry_hop"
      },
      {
        "id": "h_4",
        "name": "Galaxy",
        "weightG": 50,
        "alphaAcid": 14.5,
        "boilTimeMin": 0,
        "use": "dry_hop"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Полнотелое затирание",
        "tempC": 67,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.057,
      "ogPlato": 14,
      "fgSg": 1.011,
      "fgPlato": 2.8,
      "abv": 6,
      "ibu": 25,
      "srm": 4.6,
      "ebc": 9.1,
      "buGuRatio": 0.44,
      "totalGrainWeightKg": 7.6,
      "strikeWaterL": 26.6,
      "spargeWaterL": 14.3,
      "totalWaterL": 40.9,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 15.8,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 185,
      "sucroseGrams": 168,
      "dmeGrams": 241,
      "speiseMl": 978,
      "caloriesPer500ml": 186
    },
    "tags": [
      "NEIPA",
      "Strata",
      "Galaxy",
      "Клубника",
      "Мутное",
      "Тропики"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_single_hop_citra_dipa",
    "name": "Цитровая Бездна (Single Hop Citra DIPA 8.2%)",
    "style": "Double IPA",
    "category": "Эли / Хмелевые",
    "description": "Монументальный сингл-хоп двойной IPA на 100% хмеле Citra. От начальной горечи до вирпула и двойного сухого охмеления — 220 грамм манго, грейпфрута и лайма.",
    "author": "Крафтовая Волна",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 72,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pale Ale Malt",
        "weightKg": 7.5,
        "potentialSg": 1.038,
        "colorEbc": 5.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Carapils",
        "weightKg": 0.45,
        "potentialSg": 1.033,
        "colorEbc": 4.5,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Citra",
        "weightG": 35,
        "alphaAcid": 12.5,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Citra",
        "weightG": 45,
        "alphaAcid": 12.5,
        "boilTimeMin": 15,
        "use": "boil"
      },
      {
        "id": "h_3",
        "name": "Citra",
        "weightG": 60,
        "alphaAcid": 12.5,
        "boilTimeMin": 0,
        "use": "whirlpool"
      },
      {
        "id": "h_4",
        "name": "Citra",
        "weightG": 80,
        "alphaAcid": 12.5,
        "boilTimeMin": 0,
        "use": "dry_hop"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Сухое затирание",
        "tempC": 64,
        "timeMin": 65,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.06,
      "ogPlato": 14.7,
      "fgSg": 1.011,
      "fgPlato": 2.8,
      "abv": 6.4,
      "ibu": 69,
      "srm": 5.2,
      "ebc": 10.2,
      "buGuRatio": 1.15,
      "totalGrainWeightKg": 7.95,
      "strikeWaterL": 27.8,
      "spargeWaterL": 13.4,
      "totalWaterL": 41.2,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 16.5,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 967,
      "caloriesPer500ml": 196
    },
    "tags": [
      "DIPA",
      "Citra",
      "Сингл-Хоп",
      "Цитрус",
      "Крепкое"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_single_hop_mosaic_ipa",
    "name": "Мозаичный Калейдоскоп (Single Hop Mosaic IPA)",
    "style": "American IPA",
    "category": "Эли / Хмелевые",
    "description": "Чистейшее воплощение хмеля Mosaic. Черника, спелая папайя, легкая смола и сосновая свежесть в идеально сбалансированном классическом американском IPA.",
    "author": "МастерВарка Крафт",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 74,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pale Ale Malt",
        "weightKg": 6.2,
        "potentialSg": 1.038,
        "colorEbc": 5.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Carapils",
        "weightKg": 0.4,
        "potentialSg": 1.033,
        "colorEbc": 4.5,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Mosaic",
        "weightG": 25,
        "alphaAcid": 12,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Mosaic",
        "weightG": 35,
        "alphaAcid": 12,
        "boilTimeMin": 15,
        "use": "boil"
      },
      {
        "id": "h_3",
        "name": "Mosaic",
        "weightG": 45,
        "alphaAcid": 12,
        "boilTimeMin": 0,
        "use": "whirlpool"
      },
      {
        "id": "h_4",
        "name": "Mosaic",
        "weightG": 60,
        "alphaAcid": 12,
        "boilTimeMin": 0,
        "use": "dry_hop"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 65,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.051,
      "ogPlato": 12.6,
      "fgSg": 1.01,
      "fgPlato": 2.6,
      "abv": 5.4,
      "ibu": 54,
      "srm": 4.5,
      "ebc": 8.9,
      "buGuRatio": 1.05,
      "totalGrainWeightKg": 6.6,
      "strikeWaterL": 23.1,
      "spargeWaterL": 16.8,
      "totalWaterL": 39.9,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 14.2,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1133,
      "caloriesPer500ml": 167
    },
    "tags": [
      "IPA",
      "Mosaic",
      "Сингл-Хоп",
      "Черника",
      "Тропики"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_single_hop_galaxy_apa",
    "name": "Сияние Галактики (Single Hop Galaxy APA)",
    "style": "American Pale Ale",
    "category": "Эли / Хмелевые",
    "description": "Светлый питкий эль на австралийском хмеле Galaxy. Умеренная плотность, золотистый цвет и невероятный тропический букет маракуйи и цитрусов.",
    "author": "Крафтовая Волна",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.4,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pale Ale Malt",
        "weightKg": 5.2,
        "potentialSg": 1.038,
        "colorEbc": 5.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Carapils",
        "weightKg": 0.35,
        "potentialSg": 1.033,
        "colorEbc": 4.5,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Galaxy",
        "weightG": 20,
        "alphaAcid": 14.5,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Galaxy",
        "weightG": 25,
        "alphaAcid": 14.5,
        "boilTimeMin": 10,
        "use": "boil"
      },
      {
        "id": "h_3",
        "name": "Galaxy",
        "weightG": 35,
        "alphaAcid": 14.5,
        "boilTimeMin": 0,
        "use": "whirlpool"
      },
      {
        "id": "h_4",
        "name": "Galaxy",
        "weightG": 45,
        "alphaAcid": 14.5,
        "boilTimeMin": 0,
        "use": "dry_hop"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.044,
      "ogPlato": 11,
      "fgSg": 1.008,
      "fgPlato": 2.1,
      "abv": 4.7,
      "ibu": 49,
      "srm": 4,
      "ebc": 7.9,
      "buGuRatio": 1.12,
      "totalGrainWeightKg": 5.55,
      "strikeWaterL": 19.4,
      "spargeWaterL": 19.5,
      "totalWaterL": 38.9,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 12.4,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 182,
      "sucroseGrams": 166,
      "dmeGrams": 237,
      "speiseMl": 1248,
      "caloriesPer500ml": 146
    },
    "tags": [
      "APA",
      "Galaxy",
      "Сингл-Хоп",
      "Маракуйя",
      "Австралия"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_dunkelweizen_bavaria",
    "name": "Баварский Темный Вайцен (Dunkelweizen Tradition)",
    "style": "Dunkelweizen",
    "category": "Пшеничное",
    "description": "Темное пшеничное пиво с тонами банана, гвоздики и жареной хлебной корочки.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 4.1,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle WB-06",
      "lab": "Fermentis",
      "form": "dry",
      "type": "wheat",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 86,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.042,
      "ogPlato": 10.5,
      "fgSg": 1.006,
      "fgPlato": 1.5,
      "abv": 4.7,
      "ibu": 15,
      "srm": 7,
      "ebc": 13.8,
      "buGuRatio": 0.36,
      "totalGrainWeightKg": 5.5,
      "strikeWaterL": 19.2,
      "spargeWaterL": 19.7,
      "totalWaterL": 38.9,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 11.8,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1381,
      "caloriesPer500ml": 142
    },
    "tags": [
      "Пшеничное",
      "Dunkelweizen",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_witbier_grand_cru",
    "name": "Витбир Гран Крю (Belgian Witbier Grand Cru 6.5%)",
    "style": "Witbier",
    "category": "Бельгийские эли",
    "description": "Крепкая версия бланша с двойной нормой цедры апельсина и кориандра.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 4.7,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.2,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.047,
      "ogPlato": 11.7,
      "fgSg": 1.009,
      "fgPlato": 2.3,
      "abv": 5,
      "ibu": 14,
      "srm": 7.2,
      "ebc": 14.2,
      "buGuRatio": 0.3,
      "totalGrainWeightKg": 6.2,
      "strikeWaterL": 21.7,
      "spargeWaterL": 17.9,
      "totalWaterL": 39.6,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 13.2,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1224,
      "caloriesPer500ml": 155
    },
    "tags": [
      "Бельгийские эли",
      "Witbier",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_saison_farmhouse_peppery",
    "name": "Валлонский Перечный Сэзон (Wallonian Farmhouse Saison)",
    "style": "Saison",
    "category": "Бельгийские эли",
    "description": "Сухой шипучий фермерский эль с перечными фенолами и цитрусовым финишем.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.9,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle BE-134 (Saison)",
      "lab": "Fermentis",
      "form": "dry",
      "type": "belgian",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 90,
      "tempRange": [
        18,
        28
      ]
    },
    "calculated": {
      "ogSg": 1.04,
      "ogPlato": 10,
      "fgSg": 1.004,
      "fgPlato": 1,
      "abv": 4.7,
      "ibu": 15,
      "srm": 6.8,
      "ebc": 13.4,
      "buGuRatio": 0.38,
      "totalGrainWeightKg": 5.2,
      "strikeWaterL": 18.2,
      "spargeWaterL": 20.4,
      "totalWaterL": 38.6,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 11.3,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1461,
      "caloriesPer500ml": 138
    },
    "tags": [
      "Бельгийские эли",
      "Saison",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_flanders_oud_bruin",
    "name": "Фламандский Коричневый Эль (Oud Bruin)",
    "style": "Oud Bruin",
    "category": "Кислые эли",
    "description": "Выдержанный кислый эль с тонами изюма, сушеных яблок и карамели.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 4.3,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.2,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "LalBrew Philly Sour",
      "lab": "Lallemand",
      "form": "dry",
      "type": "sour",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 75,
      "tempRange": [
        20,
        25
      ]
    },
    "calculated": {
      "ogSg": 1.044,
      "ogPlato": 11,
      "fgSg": 1.011,
      "fgPlato": 2.8,
      "abv": 4.3,
      "ibu": 15,
      "srm": 7.1,
      "ebc": 14,
      "buGuRatio": 0.34,
      "totalGrainWeightKg": 5.8,
      "strikeWaterL": 20.3,
      "spargeWaterL": 18.9,
      "totalWaterL": 39.2,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 12.4,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1309,
      "caloriesPer500ml": 140
    },
    "tags": [
      "Кислые эли",
      "Oud Bruin",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_traditional_lambic_belgium",
    "name": "Брюссельский Чистый Ламбик (Traditional Lambic)",
    "style": "Lambic",
    "category": "Кислые эли",
    "description": "Спонтанное брожение в дубовых бочках, сухой терпкий сидровый профиль.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.6,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.2,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "LalBrew Philly Sour",
      "lab": "Lallemand",
      "form": "dry",
      "type": "sour",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 75,
      "tempRange": [
        20,
        25
      ]
    },
    "calculated": {
      "ogSg": 1.037,
      "ogPlato": 9.3,
      "fgSg": 1.009,
      "fgPlato": 2.3,
      "abv": 3.7,
      "ibu": 16,
      "srm": 5.8,
      "ebc": 11.4,
      "buGuRatio": 0.44,
      "totalGrainWeightKg": 4.8,
      "strikeWaterL": 16.8,
      "spargeWaterL": 21.4,
      "totalWaterL": 38.2,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 10.5,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1581,
      "caloriesPer500ml": 120
    },
    "tags": [
      "Кислые эли",
      "Lambic",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_oude_gueuze_blend",
    "name": "Аутентичный Гёз (Oude Gueuze Vintage)",
    "style": "Gueuze",
    "category": "Кислые эли",
    "description": "Купаж одно-, двух- и трехлетнего ламбика. Игристое шампанское пивного мира.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.9,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "LalBrew Philly Sour",
      "lab": "Lallemand",
      "form": "dry",
      "type": "sour",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 75,
      "tempRange": [
        20,
        25
      ]
    },
    "calculated": {
      "ogSg": 1.04,
      "ogPlato": 10,
      "fgSg": 1.01,
      "fgPlato": 2.6,
      "abv": 3.9,
      "ibu": 15,
      "srm": 6.8,
      "ebc": 13.4,
      "buGuRatio": 0.38,
      "totalGrainWeightKg": 5.2,
      "strikeWaterL": 18.2,
      "spargeWaterL": 20.4,
      "totalWaterL": 38.6,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 11.3,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1461,
      "caloriesPer500ml": 127
    },
    "tags": [
      "Кислые эли",
      "Gueuze",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_alaskan_amber_ale",
    "name": "Аляскинский Янтарный Альт (Alaskan Amber Alt)",
    "style": "Altbier",
    "category": "Крафтовые гибриды",
    "description": "Медный эль в стиле альтбира с мягким бисквитным солодом и чистой горечью.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.9,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.04,
      "ogPlato": 10,
      "fgSg": 1.008,
      "fgPlato": 2.1,
      "abv": 4.2,
      "ibu": 15,
      "srm": 6.8,
      "ebc": 13.4,
      "buGuRatio": 0.38,
      "totalGrainWeightKg": 5.2,
      "strikeWaterL": 18.2,
      "spargeWaterL": 20.4,
      "totalWaterL": 38.6,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 11.3,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1461,
      "caloriesPer500ml": 131
    },
    "tags": [
      "Крафтовые гибриды",
      "Altbier",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_kentucky_bourbon_barrel_ale",
    "name": "Кентуккийский Бочковой Эль (Bourbon Barrel Ale 8.5%)",
    "style": "Wood-Aged Beer",
    "category": "Крафтовые гибриды",
    "description": "Янтарный крепкий эль, выдержанный на дубе из-под кентуккийского бурбона.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 5.8,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.6,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.4,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.06,
      "ogPlato": 14.7,
      "fgSg": 1.011,
      "fgPlato": 2.8,
      "abv": 6.4,
      "ibu": 13,
      "srm": 8.7,
      "ebc": 17.1,
      "buGuRatio": 0.22,
      "totalGrainWeightKg": 7.8,
      "strikeWaterL": 27.3,
      "spargeWaterL": 13.8,
      "totalWaterL": 41.1,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 16.5,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 974,
      "caloriesPer500ml": 196
    },
    "tags": [
      "Крафтовые гибриды",
      "Wood-Aged Beer",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_cherry_chocolate_imperial_stout",
    "name": "Вишня в Шоколаде (Cherry Chocolate Imperial Stout)",
    "style": "Russian Imperial Stout",
    "category": "Темные эли / Портеры",
    "description": "Имперский стаут с добавлением спелой вишни морелло и какао-бобов.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 7.1,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.9,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.5,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.073,
      "ogPlato": 17.7,
      "fgSg": 1.014,
      "fgPlato": 3.6,
      "abv": 7.7,
      "ibu": 11,
      "srm": 10,
      "ebc": 19.7,
      "buGuRatio": 0.15,
      "totalGrainWeightKg": 9.5,
      "strikeWaterL": 33.3,
      "spargeWaterL": 9.4,
      "totalWaterL": 42.7,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 26.6,
      "yeastPacksNeeded": 3,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 799,
      "caloriesPer500ml": 236
    },
    "tags": [
      "Темные эли / Портеры",
      "Russian Imperial Stout",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_salted_caramel_porter",
    "name": "Соленая Карамель (Salted Caramel Robust Porter)",
    "style": "Robust Porter",
    "category": "Темные эли / Портеры",
    "description": "Десертный портер с морской солью и карамельными солодами.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 4.7,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.2,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle S-04",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 75,
      "tempRange": [
        15,
        20
      ]
    },
    "calculated": {
      "ogSg": 1.047,
      "ogPlato": 11.7,
      "fgSg": 1.012,
      "fgPlato": 3.1,
      "abv": 4.6,
      "ibu": 14,
      "srm": 7.2,
      "ebc": 14.2,
      "buGuRatio": 0.3,
      "totalGrainWeightKg": 6.2,
      "strikeWaterL": 21.7,
      "spargeWaterL": 17.9,
      "totalWaterL": 39.6,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 13.2,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1224,
      "caloriesPer500ml": 150
    },
    "tags": [
      "Темные эли / Портеры",
      "Robust Porter",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_espresso_imperial_porter",
    "name": "Двойной Эспрессо (Double Espresso Imperial Porter)",
    "style": "Baltic Porter",
    "category": "Темные эли / Портеры",
    "description": "Крепкий портер с двойной дозой бразильского эспрессо холодного настоя.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 6.4,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.7,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.4,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafLager W-34/70",
      "lab": "Fermentis",
      "form": "dry",
      "type": "lager",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 83,
      "tempRange": [
        9,
        15
      ]
    },
    "calculated": {
      "ogSg": 1.065,
      "ogPlato": 15.9,
      "fgSg": 1.011,
      "fgPlato": 2.8,
      "abv": 7.1,
      "ibu": 12,
      "srm": 8.9,
      "ebc": 17.5,
      "buGuRatio": 0.18,
      "totalGrainWeightKg": 8.5,
      "strikeWaterL": 29.8,
      "spargeWaterL": 12,
      "totalWaterL": 41.8,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 35.8,
      "yeastPacksNeeded": 4,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 893,
      "caloriesPer500ml": 215
    },
    "tags": [
      "Темные эли / Портеры",
      "Baltic Porter",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_mango_habanero_sour",
    "name": "Манго и Огненный Хабанеро (Mango Habanero Sour)",
    "style": "Specialty Fruit Beer",
    "category": "Кислые эли",
    "description": "Контраст ледяной тропической сладости манго и согревающего перца хабанеро.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.6,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.2,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "LalBrew Philly Sour",
      "lab": "Lallemand",
      "form": "dry",
      "type": "sour",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 75,
      "tempRange": [
        20,
        25
      ]
    },
    "calculated": {
      "ogSg": 1.037,
      "ogPlato": 9.3,
      "fgSg": 1.009,
      "fgPlato": 2.3,
      "abv": 3.7,
      "ibu": 16,
      "srm": 5.8,
      "ebc": 11.4,
      "buGuRatio": 0.44,
      "totalGrainWeightKg": 4.8,
      "strikeWaterL": 16.8,
      "spargeWaterL": 21.4,
      "totalWaterL": 38.2,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 10.5,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1581,
      "caloriesPer500ml": 120
    },
    "tags": [
      "Кислые эли",
      "Specialty Fruit Beer",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_blackberry_imperial_sour",
    "name": "Имперская Ежевика (Imperial Blackberry Sour 7.5%)",
    "style": "Wild Specialty Beer",
    "category": "Кислые эли",
    "description": "Плотный крепкий кислый эль цвета спелой ежевики с яркой ягодной кислотностью.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 5.1,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.4,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "LalBrew Philly Sour",
      "lab": "Lallemand",
      "form": "dry",
      "type": "sour",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 75,
      "tempRange": [
        20,
        25
      ]
    },
    "calculated": {
      "ogSg": 1.052,
      "ogPlato": 12.9,
      "fgSg": 1.013,
      "fgPlato": 3.3,
      "abv": 5.1,
      "ibu": 14,
      "srm": 7.5,
      "ebc": 14.8,
      "buGuRatio": 0.27,
      "totalGrainWeightKg": 6.8,
      "strikeWaterL": 23.8,
      "spargeWaterL": 16.3,
      "totalWaterL": 40.1,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 14.5,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1116,
      "caloriesPer500ml": 165
    },
    "tags": [
      "Кислые эли",
      "Wild Specialty Beer",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_karelian_cloudberry_sour",
    "name": "Карельская Морошка (Karelian Cloudberry Sour)",
    "style": "Wild Specialty Beer",
    "category": "Исторические и Особые",
    "description": "Северный деликатес: саур-эль с редкой дикой карельской морошкой.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.6,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.2,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "LalBrew Philly Sour",
      "lab": "Lallemand",
      "form": "dry",
      "type": "sour",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 75,
      "tempRange": [
        20,
        25
      ]
    },
    "calculated": {
      "ogSg": 1.037,
      "ogPlato": 9.3,
      "fgSg": 1.009,
      "fgPlato": 2.3,
      "abv": 3.7,
      "ibu": 16,
      "srm": 5.8,
      "ebc": 11.4,
      "buGuRatio": 0.44,
      "totalGrainWeightKg": 4.8,
      "strikeWaterL": 16.8,
      "spargeWaterL": 21.4,
      "totalWaterL": 38.2,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 10.5,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1581,
      "caloriesPer500ml": 120
    },
    "tags": [
      "Исторические и Особые",
      "Wild Specialty Beer",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_altai_hop_lager",
    "name": "Алтайский Горный Лагер (Altai Mountain Lager)",
    "style": "German Pils",
    "category": "Исторические и Особые",
    "description": "Лагер на отечественном алтайском хмеле и чистейшей воде предгорий Белухи.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.9,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafLager W-34/70",
      "lab": "Fermentis",
      "form": "dry",
      "type": "lager",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 83,
      "tempRange": [
        9,
        15
      ]
    },
    "calculated": {
      "ogSg": 1.04,
      "ogPlato": 10,
      "fgSg": 1.007,
      "fgPlato": 1.8,
      "abv": 4.3,
      "ibu": 15,
      "srm": 6.8,
      "ebc": 13.4,
      "buGuRatio": 0.38,
      "totalGrainWeightKg": 5.2,
      "strikeWaterL": 18.2,
      "spargeWaterL": 20.4,
      "totalWaterL": 38.6,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 22.5,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1461,
      "caloriesPer500ml": 133
    },
    "tags": [
      "Исторические и Особые",
      "German Pils",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_bashkir_wild_honey_ale",
    "name": "Башкирский Бортевой Эль (Bashkir Wild Honey Ale 8.0%)",
    "style": "Historical Beer",
    "category": "Исторические и Особые",
    "description": "Крепкий медовый эль с диким башкирским бортевым медом темного сбора.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 4.5,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.2,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle S-04",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 75,
      "tempRange": [
        15,
        20
      ]
    },
    "calculated": {
      "ogSg": 1.046,
      "ogPlato": 11.4,
      "fgSg": 1.011,
      "fgPlato": 2.8,
      "abv": 4.6,
      "ibu": 15,
      "srm": 7.2,
      "ebc": 14.2,
      "buGuRatio": 0.33,
      "totalGrainWeightKg": 6,
      "strikeWaterL": 21,
      "spargeWaterL": 18.4,
      "totalWaterL": 39.4,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 12.8,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1265,
      "caloriesPer500ml": 147
    },
    "tags": [
      "Исторические и Особые",
      "Historical Beer",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_vologda_butter_lager",
    "name": "Вологодское Сливочное (Vologda Creamy Lager)",
    "style": "Kellerbier",
    "category": "Исторические и Особые",
    "description": "Мягкий золотистый лагер с нотами свежих вологодских сливок и карамели.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.8,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafLager W-34/70",
      "lab": "Fermentis",
      "form": "dry",
      "type": "lager",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 83,
      "tempRange": [
        9,
        15
      ]
    },
    "calculated": {
      "ogSg": 1.039,
      "ogPlato": 9.8,
      "fgSg": 1.007,
      "fgPlato": 1.8,
      "abv": 4.2,
      "ibu": 16,
      "srm": 6.8,
      "ebc": 13.4,
      "buGuRatio": 0.41,
      "totalGrainWeightKg": 5.1,
      "strikeWaterL": 17.8,
      "spargeWaterL": 20.7,
      "totalWaterL": 38.5,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 22.1,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1490,
      "caloriesPer500ml": 130
    },
    "tags": [
      "Исторические и Особые",
      "Kellerbier",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_soviet_festive_lager",
    "name": "Советское Праздничное (Soviet Festive Lager 17°)",
    "style": "Historical Beer",
    "category": "Исторические и Особые",
    "description": "Элитный праздничный советский лагер 17% плотности к юбилеям и торжествам.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 5.4,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.4,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.4,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafLager W-34/70",
      "lab": "Fermentis",
      "form": "dry",
      "type": "lager",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 83,
      "tempRange": [
        9,
        15
      ]
    },
    "calculated": {
      "ogSg": 1.055,
      "ogPlato": 13.6,
      "fgSg": 1.009,
      "fgPlato": 2.3,
      "abv": 6,
      "ibu": 13,
      "srm": 8.4,
      "ebc": 16.5,
      "buGuRatio": 0.24,
      "totalGrainWeightKg": 7.2,
      "strikeWaterL": 25.2,
      "spargeWaterL": 15.3,
      "totalWaterL": 40.5,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 30.6,
      "yeastPacksNeeded": 3,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1055,
      "caloriesPer500ml": 183
    },
    "tags": [
      "Исторические и Особые",
      "Historical Beer",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_zhigulevskoe_export_gold",
    "name": "Жигулевское Экспортное (Zhigulevskoe Export 1975)",
    "style": "Historical Beer",
    "category": "Исторические и Особые",
    "description": "Экспортная версия советского Жигулевского с повышенной нормой хмеля.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 4.1,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafLager W-34/70",
      "lab": "Fermentis",
      "form": "dry",
      "type": "lager",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 83,
      "tempRange": [
        9,
        15
      ]
    },
    "calculated": {
      "ogSg": 1.042,
      "ogPlato": 10.5,
      "fgSg": 1.007,
      "fgPlato": 1.8,
      "abv": 4.6,
      "ibu": 15,
      "srm": 7,
      "ebc": 13.8,
      "buGuRatio": 0.36,
      "totalGrainWeightKg": 5.5,
      "strikeWaterL": 19.2,
      "spargeWaterL": 19.7,
      "totalWaterL": 38.9,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 23.6,
      "yeastPacksNeeded": 3,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1381,
      "caloriesPer500ml": 141
    },
    "tags": [
      "Исторические и Особые",
      "Historical Beer",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_micro_ipa_low_abv",
    "name": "Нано-IPA (Micro IPA 2.6%)",
    "style": "Session IPA",
    "category": "Эли / Хмелевые",
    "description": "Максимум хмелевого вкуса при минимуме алкоголя: Citra, Mosaic, овес.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 2.1,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 0.6,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.1,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.021,
      "ogPlato": 5.3,
      "fgSg": 1.004,
      "fgPlato": 1,
      "abv": 2.2,
      "ibu": 18,
      "srm": 3.9,
      "ebc": 7.7,
      "buGuRatio": 0.84,
      "totalGrainWeightKg": 2.8,
      "strikeWaterL": 9.8,
      "spargeWaterL": 26.5,
      "totalWaterL": 36.3,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 6,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 2709,
      "caloriesPer500ml": 69
    },
    "tags": [
      "Эли / Хмелевые",
      "Session IPA",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_quadruple_ipa_hop_monolith",
    "name": "Монолит (Quadruple IPA 11.8%)",
    "style": "Triple IPA",
    "category": "Эли / Хмелевые",
    "description": "Экстремальный крафтовый эксперимент с 400 граммами хмеля на варку.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 7.9,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 2.1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.5,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.08,
      "ogPlato": 19.3,
      "fgSg": 1.015,
      "fgPlato": 3.8,
      "abv": 8.5,
      "ibu": 11,
      "srm": 10.3,
      "ebc": 20.3,
      "buGuRatio": 0.14,
      "totalGrainWeightKg": 10.5,
      "strikeWaterL": 36.8,
      "spargeWaterL": 6.9,
      "totalWaterL": 43.7,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 28.9,
      "yeastPacksNeeded": 3,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 723,
      "caloriesPer500ml": 259
    },
    "tags": [
      "Эли / Хмелевые",
      "Triple IPA",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_belgian_ipa_houblon_chouffe",
    "name": "Хмелевой Бельгиец (Belgian IPA Houblon)",
    "style": "Specialty IPA",
    "category": "Бельгийские эли",
    "description": "Сочетание бельгийских пряных эфиров дрожжей Abbaye и американского хмеля Amarillo.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 5.3,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.4,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.4,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle BE-256 (Abbaye)",
      "lab": "Fermentis",
      "form": "dry",
      "type": "belgian",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 84,
      "tempRange": [
        18,
        25
      ]
    },
    "calculated": {
      "ogSg": 1.054,
      "ogPlato": 13.3,
      "fgSg": 1.009,
      "fgPlato": 2.3,
      "abv": 5.9,
      "ibu": 14,
      "srm": 8.4,
      "ebc": 16.5,
      "buGuRatio": 0.26,
      "totalGrainWeightKg": 7.1,
      "strikeWaterL": 24.8,
      "spargeWaterL": 15.6,
      "totalWaterL": 40.4,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 15,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1070,
      "caloriesPer500ml": 179
    },
    "tags": [
      "Бельгийские эли",
      "Specialty IPA",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_brett_farmhouse_funk",
    "name": "Бретт Фанк (Brett Farmhouse Ale)",
    "style": "Brett Beer",
    "category": "Кислые эли",
    "description": "Фермерский эль с дикими бреттаномицетами: ананасовая кожица, сено, кожа.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.9,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle BE-134 (Saison)",
      "lab": "Fermentis",
      "form": "dry",
      "type": "belgian",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 90,
      "tempRange": [
        18,
        28
      ]
    },
    "calculated": {
      "ogSg": 1.04,
      "ogPlato": 10,
      "fgSg": 1.004,
      "fgPlato": 1,
      "abv": 4.7,
      "ibu": 15,
      "srm": 6.8,
      "ebc": 13.4,
      "buGuRatio": 0.38,
      "totalGrainWeightKg": 5.2,
      "strikeWaterL": 18.2,
      "spargeWaterL": 20.4,
      "totalWaterL": 38.6,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 11.3,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1461,
      "caloriesPer500ml": 138
    },
    "tags": [
      "Кислые эли",
      "Brett Beer",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_cryo_hop_bomb_dipa",
    "name": "Крио-Бомба (Cryo Hop Bomb DIPA)",
    "style": "Double IPA",
    "category": "Эли / Хмелевые",
    "description": "Двойной IPA на криогенных лупулиновых гранулах Cryo Citra и Cryo Simcoe.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 5.8,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.6,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.4,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.06,
      "ogPlato": 14.7,
      "fgSg": 1.011,
      "fgPlato": 2.8,
      "abv": 6.4,
      "ibu": 13,
      "srm": 8.7,
      "ebc": 17.1,
      "buGuRatio": 0.22,
      "totalGrainWeightKg": 7.8,
      "strikeWaterL": 27.3,
      "spargeWaterL": 13.8,
      "totalWaterL": 41.1,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 16.5,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 974,
      "caloriesPer500ml": 196
    },
    "tags": [
      "Эли / Хмелевые",
      "Double IPA",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_mountain_ipa_green_mountains",
    "name": "Зеленые Горы (Green Mountains IPA)",
    "style": "American IPA",
    "category": "Эли / Хмелевые",
    "description": "Вермонтский мягкий эль с цитрусовым и сосновым балансом.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 4.5,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.2,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.046,
      "ogPlato": 11.4,
      "fgSg": 1.009,
      "fgPlato": 2.3,
      "abv": 4.9,
      "ibu": 15,
      "srm": 7.2,
      "ebc": 14.2,
      "buGuRatio": 0.33,
      "totalGrainWeightKg": 6,
      "strikeWaterL": 21,
      "spargeWaterL": 18.4,
      "totalWaterL": 39.4,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 12.8,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1265,
      "caloriesPer500ml": 151
    },
    "tags": [
      "Эли / Хмелевые",
      "American IPA",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_kveik_dipa_hornindal",
    "name": "Хорниндал Квейк (Hornindal Kveik DIPA 8.5%)",
    "style": "Double IPA",
    "category": "Эли / Хмелевые",
    "description": "Норвежский фермерский эль, сброженный за 3 дня при 38°C с манговым шлейфом.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 5.8,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.6,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.4,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "LalBrew Voss Kveik",
      "lab": "Lallemand",
      "form": "dry",
      "type": "kveik",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 78,
      "tempRange": [
        25,
        40
      ]
    },
    "calculated": {
      "ogSg": 1.06,
      "ogPlato": 14.7,
      "fgSg": 1.013,
      "fgPlato": 3.3,
      "abv": 6.2,
      "ibu": 13,
      "srm": 8.7,
      "ebc": 17.1,
      "buGuRatio": 0.22,
      "totalGrainWeightKg": 7.8,
      "strikeWaterL": 27.3,
      "spargeWaterL": 13.8,
      "totalWaterL": 41.1,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 16.5,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 974,
      "caloriesPer500ml": 193
    },
    "tags": [
      "Эли / Хмелевые",
      "Double IPA",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_dortmunder_gold_export",
    "name": "Дортмундское Золото (Dortmunder Gold Export)",
    "style": "Dortmunder Export",
    "category": "Лагеры",
    "description": "Золотистый немецкий лагер высокой плотности с минеральным характером.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 4.7,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.2,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafLager W-34/70",
      "lab": "Fermentis",
      "form": "dry",
      "type": "lager",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 83,
      "tempRange": [
        9,
        15
      ]
    },
    "calculated": {
      "ogSg": 1.047,
      "ogPlato": 11.7,
      "fgSg": 1.008,
      "fgPlato": 2.1,
      "abv": 5.1,
      "ibu": 14,
      "srm": 7.2,
      "ebc": 14.2,
      "buGuRatio": 0.3,
      "totalGrainWeightKg": 6.2,
      "strikeWaterL": 21.7,
      "spargeWaterL": 17.9,
      "totalWaterL": 39.6,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 26.3,
      "yeastPacksNeeded": 3,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1224,
      "caloriesPer500ml": 156
    },
    "tags": [
      "Лагеры",
      "Dortmunder Export",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_zoigl_hell_tradition",
    "name": "Цойгль Светлый (Zoigl Hell Oberpfalz)",
    "style": "Kellerbier",
    "category": "Лагеры",
    "description": "Общинное традиционное баварское светлое пиво открытого брожения.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.9,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafLager W-34/70",
      "lab": "Fermentis",
      "form": "dry",
      "type": "lager",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 83,
      "tempRange": [
        9,
        15
      ]
    },
    "calculated": {
      "ogSg": 1.04,
      "ogPlato": 10,
      "fgSg": 1.007,
      "fgPlato": 1.8,
      "abv": 4.3,
      "ibu": 15,
      "srm": 6.8,
      "ebc": 13.4,
      "buGuRatio": 0.38,
      "totalGrainWeightKg": 5.2,
      "strikeWaterL": 18.2,
      "spargeWaterL": 20.4,
      "totalWaterL": 38.6,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 22.5,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1461,
      "caloriesPer500ml": 133
    },
    "tags": [
      "Лагеры",
      "Kellerbier",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_pre_prohibition_dark_lager",
    "name": "Досухозаконный Темный (Pre-Prohibition Dark Lager)",
    "style": "Pre-Prohibition Lager",
    "category": "Лагеры",
    "description": "Американский исторический темный лагер на кукурузе и обжаренном солоде.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 4.1,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafLager W-34/70",
      "lab": "Fermentis",
      "form": "dry",
      "type": "lager",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 83,
      "tempRange": [
        9,
        15
      ]
    },
    "calculated": {
      "ogSg": 1.042,
      "ogPlato": 10.5,
      "fgSg": 1.007,
      "fgPlato": 1.8,
      "abv": 4.6,
      "ibu": 15,
      "srm": 7,
      "ebc": 13.8,
      "buGuRatio": 0.36,
      "totalGrainWeightKg": 5.5,
      "strikeWaterL": 19.2,
      "spargeWaterL": 19.7,
      "totalWaterL": 38.9,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 23.6,
      "yeastPacksNeeded": 3,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1381,
      "caloriesPer500ml": 141
    },
    "tags": [
      "Лагеры",
      "Pre-Prohibition Lager",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_international_amber_lager",
    "name": "Интернациональный Янтарный (International Amber)",
    "style": "Vienna Lager",
    "category": "Лагеры",
    "description": "Популярный во всем мире чистый янтарный лагер с мягкой карамельной ноткой.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.9,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafLager W-34/70",
      "lab": "Fermentis",
      "form": "dry",
      "type": "lager",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 83,
      "tempRange": [
        9,
        15
      ]
    },
    "calculated": {
      "ogSg": 1.04,
      "ogPlato": 10,
      "fgSg": 1.007,
      "fgPlato": 1.8,
      "abv": 4.3,
      "ibu": 15,
      "srm": 6.8,
      "ebc": 13.4,
      "buGuRatio": 0.38,
      "totalGrainWeightKg": 5.2,
      "strikeWaterL": 18.2,
      "spargeWaterL": 20.4,
      "totalWaterL": 38.6,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 22.5,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1461,
      "caloriesPer500ml": 133
    },
    "tags": [
      "Лагеры",
      "Vienna Lager",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_dusseldorf_sticke_alt",
    "name": "Штике Альтбир (Sticke Altbier Secret Brew 6.5%)",
    "style": "Altbier",
    "category": "Крафтовые гибриды",
    "description": "Секретная крепкая сезонная варка дюссельдорфского альтбира.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 4.9,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.3,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.05,
      "ogPlato": 12.4,
      "fgSg": 1.009,
      "fgPlato": 2.3,
      "abv": 5.4,
      "ibu": 14,
      "srm": 7.4,
      "ebc": 14.6,
      "buGuRatio": 0.28,
      "totalGrainWeightKg": 6.5,
      "strikeWaterL": 22.8,
      "spargeWaterL": 17,
      "totalWaterL": 39.8,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 13.9,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1168,
      "caloriesPer500ml": 166
    },
    "tags": [
      "Крафтовые гибриды",
      "Altbier",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_earl_grey_bergamot_ale",
    "name": "Эрл Грей Бергамот (Earl Grey Bergamot Ale)",
    "style": "Herb and Spice Beer",
    "category": "Крафтовые гибриды",
    "description": "Элегантный светлый эль с добавлением благородного чая Эрл Грей и цедры бергамота.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.9,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle S-04",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 75,
      "tempRange": [
        15,
        20
      ]
    },
    "calculated": {
      "ogSg": 1.04,
      "ogPlato": 10,
      "fgSg": 1.01,
      "fgPlato": 2.6,
      "abv": 3.9,
      "ibu": 15,
      "srm": 6.8,
      "ebc": 13.4,
      "buGuRatio": 0.38,
      "totalGrainWeightKg": 5.2,
      "strikeWaterL": 18.2,
      "spargeWaterL": 20.4,
      "totalWaterL": 38.6,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 11.3,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1461,
      "caloriesPer500ml": 127
    },
    "tags": [
      "Крафтовые гибриды",
      "Herb and Spice Beer",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_smoked_maple_doppelbock",
    "name": "Кленовый Копченый Доппельбок (Smoked Maple Doppelbock)",
    "style": "Doppelbock",
    "category": "Крафтовые гибриды",
    "description": "Доппельбок на буковом копченом солоде и натуральном кленовом сиропе.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 6.6,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.8,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.4,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafLager W-34/70",
      "lab": "Fermentis",
      "form": "dry",
      "type": "lager",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 83,
      "tempRange": [
        9,
        15
      ]
    },
    "calculated": {
      "ogSg": 1.067,
      "ogPlato": 16.4,
      "fgSg": 1.011,
      "fgPlato": 2.8,
      "abv": 7.4,
      "ibu": 12,
      "srm": 9.1,
      "ebc": 17.9,
      "buGuRatio": 0.18,
      "totalGrainWeightKg": 8.8,
      "strikeWaterL": 30.8,
      "spargeWaterL": 11.2,
      "totalWaterL": 42,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 36.9,
      "yeastPacksNeeded": 4,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 863,
      "caloriesPer500ml": 222
    },
    "tags": [
      "Крафтовые гибриды",
      "Doppelbock",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_ginger_bread_holiday_ale",
    "name": "Имбирный Пряник (Gingerbread Holiday Ale)",
    "style": "Winter Seasonal Beer",
    "category": "Крафтовые гибриды",
    "description": "Праздничный зимний эль со свежим имбирем, медом, корицей и гвоздикой.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 5.1,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.4,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle S-04",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 75,
      "tempRange": [
        15,
        20
      ]
    },
    "calculated": {
      "ogSg": 1.052,
      "ogPlato": 12.9,
      "fgSg": 1.013,
      "fgPlato": 3.3,
      "abv": 5.1,
      "ibu": 14,
      "srm": 7.5,
      "ebc": 14.8,
      "buGuRatio": 0.27,
      "totalGrainWeightKg": 6.8,
      "strikeWaterL": 23.8,
      "spargeWaterL": 16.3,
      "totalWaterL": 40.1,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 14.5,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1116,
      "caloriesPer500ml": 165
    },
    "tags": [
      "Крафтовые гибриды",
      "Winter Seasonal Beer",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_ice_bock_extreme_craft",
    "name": "Ледяной Крафт Бок (Ice Bock Craft Doppelbock 12%)",
    "style": "Eisbock",
    "category": "Лагеры",
    "description": "Экстремальный вымороженный лагер с ликерной плотностью и винными тонами.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 8.6,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 2.3,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.6,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafLager W-34/70",
      "lab": "Fermentis",
      "form": "dry",
      "type": "lager",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 83,
      "tempRange": [
        9,
        15
      ]
    },
    "calculated": {
      "ogSg": 1.088,
      "ogPlato": 21.1,
      "fgSg": 1.015,
      "fgPlato": 3.8,
      "abv": 9.6,
      "ibu": 10,
      "srm": 11.4,
      "ebc": 22.5,
      "buGuRatio": 0.11,
      "totalGrainWeightKg": 11.5,
      "strikeWaterL": 40.2,
      "spargeWaterL": 4.4,
      "totalWaterL": 44.6,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 47.5,
      "yeastPacksNeeded": 5,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 660,
      "caloriesPer500ml": 287
    },
    "tags": [
      "Лагеры",
      "Eisbock",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_black_kolsch_roast_clean",
    "name": "Черный Кёльш (Black Kölsch)",
    "style": "Kölsch",
    "category": "Крафтовые гибриды",
    "description": "Темная версия кёльша на обесгорченном солоде Carafa: легкость лагера и цвет ночи.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.9,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.04,
      "ogPlato": 10,
      "fgSg": 1.008,
      "fgPlato": 2.1,
      "abv": 4.2,
      "ibu": 15,
      "srm": 6.8,
      "ebc": 13.4,
      "buGuRatio": 0.38,
      "totalGrainWeightKg": 5.2,
      "strikeWaterL": 18.2,
      "spargeWaterL": 20.4,
      "totalWaterL": 38.6,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 11.3,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1461,
      "caloriesPer500ml": 131
    },
    "tags": [
      "Крафтовые гибриды",
      "Kölsch",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_nz_golden_ale_wai_iti",
    "name": "Новозеландский Золотой (NZ Golden Ale Wai-iti)",
    "style": "British Golden Ale",
    "category": "Эли / Хмелевые",
    "description": "Легкий золотистый эль на новозеландском хмеле Wai-iti с нотами спелого персика.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.6,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.2,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.037,
      "ogPlato": 9.3,
      "fgSg": 1.007,
      "fgPlato": 1.8,
      "abv": 3.9,
      "ibu": 16,
      "srm": 5.8,
      "ebc": 11.4,
      "buGuRatio": 0.44,
      "totalGrainWeightKg": 4.8,
      "strikeWaterL": 16.8,
      "spargeWaterL": 21.4,
      "totalWaterL": 38.2,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 10.5,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1581,
      "caloriesPer500ml": 122
    },
    "tags": [
      "Эли / Хмелевые",
      "British Golden Ale",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_mexican_hot_chocolate_stout",
    "name": "Мексиканский Горячий Шоколад (Mexican Chili Stout)",
    "style": "Specialty Stout",
    "category": "Темные эли / Портеры",
    "description": "Стаут с добавлением какао, корицы, ванили и щепотки жгучего перца кайен.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 5.1,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.4,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.052,
      "ogPlato": 12.9,
      "fgSg": 1.01,
      "fgPlato": 2.6,
      "abv": 5.5,
      "ibu": 14,
      "srm": 7.5,
      "ebc": 14.8,
      "buGuRatio": 0.27,
      "totalGrainWeightKg": 6.8,
      "strikeWaterL": 23.8,
      "spargeWaterL": 16.3,
      "totalWaterL": 40.1,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 14.5,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1116,
      "caloriesPer500ml": 171
    },
    "tags": [
      "Темные эли / Портеры",
      "Specialty Stout",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_blood_orange_session_sour",
    "name": "Красный Сицилийский Апельсин (Blood Orange Sour 3.8%)",
    "style": "Catharina Sour",
    "category": "Кислые эли",
    "description": "Сессионный кислый эль с соком красных сицилийских апельсинов.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 2.8,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 0.8,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.2,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "LalBrew Philly Sour",
      "lab": "Lallemand",
      "form": "dry",
      "type": "sour",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 75,
      "tempRange": [
        20,
        25
      ]
    },
    "calculated": {
      "ogSg": 1.029,
      "ogPlato": 7.3,
      "fgSg": 1.007,
      "fgPlato": 1.8,
      "abv": 2.9,
      "ibu": 17,
      "srm": 5.4,
      "ebc": 10.6,
      "buGuRatio": 0.59,
      "totalGrainWeightKg": 3.8,
      "strikeWaterL": 13.3,
      "spargeWaterL": 23.9,
      "totalWaterL": 37.2,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 8.2,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1999,
      "caloriesPer500ml": 94
    },
    "tags": [
      "Кислые эли",
      "Catharina Sour",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_ddh_pale_ale_citra_nelson",
    "name": "Двойное Сухое (DDH Pale Ale Citra & Nelson)",
    "style": "American Pale Ale",
    "category": "Эли / Хмелевые",
    "description": "Американский светлый эль с двойным сухим охмелением Citra и Nelson Sauvin.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.9,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.04,
      "ogPlato": 10,
      "fgSg": 1.008,
      "fgPlato": 2.1,
      "abv": 4.2,
      "ibu": 15,
      "srm": 6.8,
      "ebc": 13.4,
      "buGuRatio": 0.38,
      "totalGrainWeightKg": 5.2,
      "strikeWaterL": 18.2,
      "spargeWaterL": 20.4,
      "totalWaterL": 38.6,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 11.3,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1461,
      "caloriesPer500ml": 131
    },
    "tags": [
      "Эли / Хмелевые",
      "American Pale Ale",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_bru1_pineapple_express_ipa",
    "name": "Ананасовый Экспресс (Bru-1 Pineapple IPA)",
    "style": "American IPA",
    "category": "Эли / Хмелевые",
    "description": "Яркий IPA на новейшем хмеле Bru-1 с природным ароматом спелого ананаса.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 4.5,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.2,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.046,
      "ogPlato": 11.4,
      "fgSg": 1.009,
      "fgPlato": 2.3,
      "abv": 4.9,
      "ibu": 15,
      "srm": 7.2,
      "ebc": 14.2,
      "buGuRatio": 0.33,
      "totalGrainWeightKg": 6,
      "strikeWaterL": 21,
      "spargeWaterL": 18.4,
      "totalWaterL": 39.4,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 12.8,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1265,
      "caloriesPer500ml": 151
    },
    "tags": [
      "Эли / Хмелевые",
      "American IPA",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_talus_grapefruit_apa",
    "name": "Розовый Грейпфрут (Talus Floral APA)",
    "style": "American Pale Ale",
    "category": "Эли / Хмелевые",
    "description": "Светлый эль на хмеле Talus: розовый грейпфрут, хвоя, шалфей и лепестки роз.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.9,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.04,
      "ogPlato": 10,
      "fgSg": 1.008,
      "fgPlato": 2.1,
      "abv": 4.2,
      "ibu": 15,
      "srm": 6.8,
      "ebc": 13.4,
      "buGuRatio": 0.38,
      "totalGrainWeightKg": 5.2,
      "strikeWaterL": 18.2,
      "spargeWaterL": 20.4,
      "totalWaterL": 38.6,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 11.3,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1461,
      "caloriesPer500ml": 131
    },
    "tags": [
      "Эли / Хмелевые",
      "American Pale Ale",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_strata_galaxy_cosmic_dipa",
    "name": "Космический Двойной (Strata & Galaxy Cosmic DIPA)",
    "style": "Double IPA",
    "category": "Эли / Хмелевые",
    "description": "Двойной IPA крепостью 8.6% с максимальной закладкой хмелей Strata и Galaxy.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 5.8,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.6,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.4,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.06,
      "ogPlato": 14.7,
      "fgSg": 1.011,
      "fgPlato": 2.8,
      "abv": 6.4,
      "ibu": 13,
      "srm": 8.7,
      "ebc": 17.1,
      "buGuRatio": 0.22,
      "totalGrainWeightKg": 7.8,
      "strikeWaterL": 27.3,
      "spargeWaterL": 13.8,
      "totalWaterL": 41.1,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 16.5,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 974,
      "caloriesPer500ml": 196
    },
    "tags": [
      "Эли / Хмелевые",
      "Double IPA",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_yorkshire_creamy_bitter",
    "name": "Йоркширский Сливочный (Yorkshire Creamy Bitter)",
    "style": "Best Bitter",
    "category": "Британские и Ирландские",
    "description": "Традиционный биттер Йоркшира со стойкой кремовой пенной шапкой.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.6,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.2,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle S-04",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 75,
      "tempRange": [
        15,
        20
      ]
    },
    "calculated": {
      "ogSg": 1.037,
      "ogPlato": 9.3,
      "fgSg": 1.009,
      "fgPlato": 2.3,
      "abv": 3.7,
      "ibu": 16,
      "srm": 5.8,
      "ebc": 11.4,
      "buGuRatio": 0.44,
      "totalGrainWeightKg": 4.8,
      "strikeWaterL": 16.8,
      "spargeWaterL": 21.4,
      "totalWaterL": 38.2,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 10.5,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1581,
      "caloriesPer500ml": 120
    },
    "tags": [
      "Британские и Ирландские",
      "Best Bitter",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_devon_cream_ale_golden",
    "name": "Девонский Золотой (Devon Cream Ale)",
    "style": "British Golden Ale",
    "category": "Британские и Ирландские",
    "description": "Мягкий пабный золотистый эль южной Англии с медовыми солодовыми нотами.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.6,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.2,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle S-04",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 75,
      "tempRange": [
        15,
        20
      ]
    },
    "calculated": {
      "ogSg": 1.037,
      "ogPlato": 9.3,
      "fgSg": 1.009,
      "fgPlato": 2.3,
      "abv": 3.7,
      "ibu": 16,
      "srm": 5.8,
      "ebc": 11.4,
      "buGuRatio": 0.44,
      "totalGrainWeightKg": 4.8,
      "strikeWaterL": 16.8,
      "spargeWaterL": 21.4,
      "totalWaterL": 38.2,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 10.5,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1581,
      "caloriesPer500ml": 120
    },
    "tags": [
      "Британские и Ирландские",
      "British Golden Ale",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_czech_tmavy_spezial_14",
    "name": "Чешский Темный Специал 14° (Czech Tmavý Speciál)",
    "style": "Czech Dark Lager",
    "category": "Лагеры",
    "description": "Плотный чешский темный лагер 14° Plato с насыщенным карамельным телом.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 4.7,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.2,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafLager W-34/70",
      "lab": "Fermentis",
      "form": "dry",
      "type": "lager",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 83,
      "tempRange": [
        9,
        15
      ]
    },
    "calculated": {
      "ogSg": 1.047,
      "ogPlato": 11.7,
      "fgSg": 1.008,
      "fgPlato": 2.1,
      "abv": 5.1,
      "ibu": 14,
      "srm": 7.2,
      "ebc": 14.2,
      "buGuRatio": 0.3,
      "totalGrainWeightKg": 6.2,
      "strikeWaterL": 21.7,
      "spargeWaterL": 17.9,
      "totalWaterL": 39.6,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 26.3,
      "yeastPacksNeeded": 3,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1224,
      "caloriesPer500ml": 156
    },
    "tags": [
      "Лагеры",
      "Czech Dark Lager",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_czech_polotmavy_11",
    "name": "Чешский Полутемный 11° (Czech Polotmavý 11°)",
    "style": "Czech Amber Lager",
    "category": "Лагеры",
    "description": "Легкий янтарный чешский лежак на жатецком хмеле Saaz.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.6,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.2,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafLager W-34/70",
      "lab": "Fermentis",
      "form": "dry",
      "type": "lager",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 83,
      "tempRange": [
        9,
        15
      ]
    },
    "calculated": {
      "ogSg": 1.037,
      "ogPlato": 9.3,
      "fgSg": 1.006,
      "fgPlato": 1.5,
      "abv": 4.1,
      "ibu": 16,
      "srm": 5.8,
      "ebc": 11.4,
      "buGuRatio": 0.44,
      "totalGrainWeightKg": 4.8,
      "strikeWaterL": 16.8,
      "spargeWaterL": 21.4,
      "totalWaterL": 38.2,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 20.9,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1581,
      "caloriesPer500ml": 125
    },
    "tags": [
      "Лагеры",
      "Czech Amber Lager",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_german_pils_mittelfruh",
    "name": "Ганноверский Пилснер (Hannover German Pils)",
    "style": "German Pils",
    "category": "Лагеры",
    "description": "Сухой благородный пилснер северной Германии с хрустящей горечью 38 IBU.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.9,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafLager W-34/70",
      "lab": "Fermentis",
      "form": "dry",
      "type": "lager",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 83,
      "tempRange": [
        9,
        15
      ]
    },
    "calculated": {
      "ogSg": 1.04,
      "ogPlato": 10,
      "fgSg": 1.007,
      "fgPlato": 1.8,
      "abv": 4.3,
      "ibu": 15,
      "srm": 6.8,
      "ebc": 13.4,
      "buGuRatio": 0.38,
      "totalGrainWeightKg": 5.2,
      "strikeWaterL": 18.2,
      "spargeWaterL": 20.4,
      "totalWaterL": 38.6,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 22.5,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1461,
      "caloriesPer500ml": 133
    },
    "tags": [
      "Лагеры",
      "German Pils",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_dunkelweizenbock_bavaria",
    "name": "Баварский Темный Вайценбок (Dunkelweizenbock 7.8%)",
    "style": "Weizenbock",
    "category": "Пшеничное",
    "description": "Темный пшеничный крепкий бок: шоколадный бисквит, банан и гвоздика.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 5.8,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.6,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.4,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle WB-06",
      "lab": "Fermentis",
      "form": "dry",
      "type": "wheat",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 86,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.06,
      "ogPlato": 14.7,
      "fgSg": 1.008,
      "fgPlato": 2.1,
      "abv": 6.8,
      "ibu": 13,
      "srm": 8.7,
      "ebc": 17.1,
      "buGuRatio": 0.22,
      "totalGrainWeightKg": 7.8,
      "strikeWaterL": 27.3,
      "spargeWaterL": 13.8,
      "totalWaterL": 41.1,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 16.5,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 974,
      "caloriesPer500ml": 202
    },
    "tags": [
      "Пшеничное",
      "Weizenbock",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_vienna_smoked_lager",
    "name": "Венский Копченый Лагер (Smoked Vienna Lager)",
    "style": "Vienna Lager",
    "category": "Лагеры",
    "description": "Венский янтарный солод в гармоничном сочетании с буковым копченым солодом.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 4.1,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafLager W-34/70",
      "lab": "Fermentis",
      "form": "dry",
      "type": "lager",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 83,
      "tempRange": [
        9,
        15
      ]
    },
    "calculated": {
      "ogSg": 1.042,
      "ogPlato": 10.5,
      "fgSg": 1.007,
      "fgPlato": 1.8,
      "abv": 4.6,
      "ibu": 15,
      "srm": 7,
      "ebc": 13.8,
      "buGuRatio": 0.36,
      "totalGrainWeightKg": 5.5,
      "strikeWaterL": 19.2,
      "spargeWaterL": 19.7,
      "totalWaterL": 38.9,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 23.6,
      "yeastPacksNeeded": 3,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1381,
      "caloriesPer500ml": 141
    },
    "tags": [
      "Лагеры",
      "Vienna Lager",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_pastry_sour_blackcurrant",
    "name": "Смородиновый Пирог (Blackcurrant Pastry Sour)",
    "style": "Wild Specialty Beer",
    "category": "Кислые эли",
    "description": "Десертный кислый эль с черной смородиной, ванилью и печеньем.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 4.1,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "LalBrew Philly Sour",
      "lab": "Lallemand",
      "form": "dry",
      "type": "sour",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 75,
      "tempRange": [
        20,
        25
      ]
    },
    "calculated": {
      "ogSg": 1.042,
      "ogPlato": 10.5,
      "fgSg": 1.011,
      "fgPlato": 2.8,
      "abv": 4.1,
      "ibu": 15,
      "srm": 7,
      "ebc": 13.8,
      "buGuRatio": 0.36,
      "totalGrainWeightKg": 5.5,
      "strikeWaterL": 19.2,
      "spargeWaterL": 19.7,
      "totalWaterL": 38.9,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 11.8,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1381,
      "caloriesPer500ml": 134
    },
    "tags": [
      "Кислые эли",
      "Wild Specialty Beer",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_raspberry_lemonade_sour",
    "name": "Малиновый Лимонад (Raspberry Lemonade Sour)",
    "style": "Berliner Weisse",
    "category": "Кислые эли",
    "description": "Освежающий эль с натуральным малиновым пюре и лимонным соком.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.2,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 0.8,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.2,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "LalBrew Philly Sour",
      "lab": "Lallemand",
      "form": "dry",
      "type": "sour",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 75,
      "tempRange": [
        20,
        25
      ]
    },
    "calculated": {
      "ogSg": 1.032,
      "ogPlato": 8,
      "fgSg": 1.008,
      "fgPlato": 2.1,
      "abv": 3.2,
      "ibu": 17,
      "srm": 5.5,
      "ebc": 10.8,
      "buGuRatio": 0.53,
      "totalGrainWeightKg": 4.2,
      "strikeWaterL": 14.7,
      "spargeWaterL": 22.9,
      "totalWaterL": 37.6,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 9,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1807,
      "caloriesPer500ml": 103
    },
    "tags": [
      "Кислые эли",
      "Berliner Weisse",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_sea_salt_coriander_gose",
    "name": "Лейпцигская Классика (Traditional Leipzig Gose)",
    "style": "Historical Beer",
    "category": "Кислые эли",
    "description": "Исторический рецепт 18 века с гималайской солью и свежемолотым кориандром.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.4,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 0.9,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.2,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "LalBrew Philly Sour",
      "lab": "Lallemand",
      "form": "dry",
      "type": "sour",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 75,
      "tempRange": [
        20,
        25
      ]
    },
    "calculated": {
      "ogSg": 1.034,
      "ogPlato": 8.5,
      "fgSg": 1.009,
      "fgPlato": 2.3,
      "abv": 3.3,
      "ibu": 16,
      "srm": 5.7,
      "ebc": 11.2,
      "buGuRatio": 0.46,
      "totalGrainWeightKg": 4.5,
      "strikeWaterL": 15.8,
      "spargeWaterL": 22.1,
      "totalWaterL": 37.9,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 9.6,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1686,
      "caloriesPer500ml": 108
    },
    "tags": [
      "Кислые эли",
      "Historical Beer",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_grapefruit_session_ipa",
    "name": "Грейпфрутовый Сессионный (Grapefruit Session IPA)",
    "style": "Session IPA",
    "category": "Эли / Хмелевые",
    "description": "Легкий эль 4.2% с добавлением цедры и сока розового грейпфрута.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.2,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 0.8,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.2,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.032,
      "ogPlato": 8,
      "fgSg": 1.006,
      "fgPlato": 1.5,
      "abv": 3.4,
      "ibu": 17,
      "srm": 5.5,
      "ebc": 10.8,
      "buGuRatio": 0.53,
      "totalGrainWeightKg": 4.2,
      "strikeWaterL": 14.7,
      "spargeWaterL": 22.9,
      "totalWaterL": 37.6,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 9,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1807,
      "caloriesPer500ml": 106
    },
    "tags": [
      "Эли / Хмелевые",
      "Session IPA",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_mango_hazy_pale_ale",
    "name": "Манго Хейзи (Mango Hazy Pale Ale)",
    "style": "American Pale Ale",
    "category": "Эли / Хмелевые",
    "description": "Сочный золотистый мутный эль с соком спелого манго и хмелем Citra.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.6,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.2,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.037,
      "ogPlato": 9.3,
      "fgSg": 1.007,
      "fgPlato": 1.8,
      "abv": 3.9,
      "ibu": 16,
      "srm": 5.8,
      "ebc": 11.4,
      "buGuRatio": 0.44,
      "totalGrainWeightKg": 4.8,
      "strikeWaterL": 16.8,
      "spargeWaterL": 21.4,
      "totalWaterL": 38.2,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 10.5,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1581,
      "caloriesPer500ml": 122
    },
    "tags": [
      "Эли / Хмелевые",
      "American Pale Ale",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_pre_prohibition_porter",
    "name": "Досухозаконный Портер (Pre-Prohibition Porter)",
    "style": "Pre-Prohibition Porter",
    "category": "Темные эли / Портеры",
    "description": "Исторический американский портер 1910 года на кукурузе и патоке.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 4.3,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.2,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle US-05",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 81,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.044,
      "ogPlato": 11,
      "fgSg": 1.008,
      "fgPlato": 2.1,
      "abv": 4.7,
      "ibu": 15,
      "srm": 7.1,
      "ebc": 14,
      "buGuRatio": 0.34,
      "totalGrainWeightKg": 5.8,
      "strikeWaterL": 20.3,
      "spargeWaterL": 18.9,
      "totalWaterL": 39.2,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 12.4,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1309,
      "caloriesPer500ml": 146
    },
    "tags": [
      "Темные эли / Портеры",
      "Pre-Prohibition Porter",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_london_export_ipa_1860",
    "name": "Лондонский Экспортный IPA 1860 (London Export IPA)",
    "style": "English IPA",
    "category": "Британские и Ирландские",
    "description": "Архивный рецепт колониального английского эля для отправки в Индию.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 5.1,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.4,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "LalBrew Nottingham",
      "lab": "Lallemand",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 80,
      "tempRange": [
        14,
        21
      ]
    },
    "calculated": {
      "ogSg": 1.052,
      "ogPlato": 12.9,
      "fgSg": 1.01,
      "fgPlato": 2.6,
      "abv": 5.5,
      "ibu": 14,
      "srm": 7.5,
      "ebc": 14.8,
      "buGuRatio": 0.27,
      "totalGrainWeightKg": 6.8,
      "strikeWaterL": 23.8,
      "spargeWaterL": 16.3,
      "totalWaterL": 40.1,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 14.5,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1116,
      "caloriesPer500ml": 171
    },
    "tags": [
      "Британские и Ирландские",
      "English IPA",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_strawberry_wheat_ale",
    "name": "Клубничный Пшеничный Эль (Strawberry Wheat Ale)",
    "style": "Fruit Beer",
    "category": "Пшеничное",
    "description": "Летний пшеничный эль с натуральным пюре садовой земляники.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.6,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.2,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle WB-06",
      "lab": "Fermentis",
      "form": "dry",
      "type": "wheat",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 86,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.037,
      "ogPlato": 9.3,
      "fgSg": 1.005,
      "fgPlato": 1.3,
      "abv": 4.2,
      "ibu": 16,
      "srm": 5.8,
      "ebc": 11.4,
      "buGuRatio": 0.44,
      "totalGrainWeightKg": 4.8,
      "strikeWaterL": 16.8,
      "spargeWaterL": 21.4,
      "totalWaterL": 38.2,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 10.5,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1581,
      "caloriesPer500ml": 126
    },
    "tags": [
      "Пшеничное",
      "Fruit Beer",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_buckwheat_slavic_ale",
    "name": "Гречишный Славянский Эль (Buckwheat Ale)",
    "style": "Specialty Beer",
    "category": "Исторические и Особые",
    "description": "Аутентичный эль на Курском гречишном солоде с выраженным ароматом гречишного меда.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.9,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle S-04",
      "lab": "Fermentis",
      "form": "dry",
      "type": "ale",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 75,
      "tempRange": [
        15,
        20
      ]
    },
    "calculated": {
      "ogSg": 1.04,
      "ogPlato": 10,
      "fgSg": 1.01,
      "fgPlato": 2.6,
      "abv": 3.9,
      "ibu": 15,
      "srm": 6.8,
      "ebc": 13.4,
      "buGuRatio": 0.38,
      "totalGrainWeightKg": 5.2,
      "strikeWaterL": 18.2,
      "spargeWaterL": 20.4,
      "totalWaterL": 38.6,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 11.3,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1461,
      "caloriesPer500ml": 127
    },
    "tags": [
      "Исторические и Особые",
      "Specialty Beer",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_tart_cherry_wheat",
    "name": "Вишневый Пшеничный Эль (Tart Cherry Wheat)",
    "style": "Fruit Beer",
    "category": "Пшеничное",
    "description": "Освежающий пшеничный эль с кисло-сладким соком спелой вишни.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.6,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.2,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle WB-06",
      "lab": "Fermentis",
      "form": "dry",
      "type": "wheat",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 86,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.037,
      "ogPlato": 9.3,
      "fgSg": 1.005,
      "fgPlato": 1.3,
      "abv": 4.2,
      "ibu": 16,
      "srm": 5.8,
      "ebc": 11.4,
      "buGuRatio": 0.44,
      "totalGrainWeightKg": 4.8,
      "strikeWaterL": 16.8,
      "spargeWaterL": 21.4,
      "totalWaterL": 38.2,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 10.5,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1581,
      "caloriesPer500ml": 126
    },
    "tags": [
      "Пшеничное",
      "Fruit Beer",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_honey_wheat_lipa",
    "name": "Липовый Пшеничный (Honey Wheat Ale)",
    "style": "Specialty Beer",
    "category": "Пшеничное",
    "description": "Бархатистый пшеничный эль с натуральным липовым медом.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.8,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle WB-06",
      "lab": "Fermentis",
      "form": "dry",
      "type": "wheat",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 86,
      "tempRange": [
        18,
        24
      ]
    },
    "calculated": {
      "ogSg": 1.039,
      "ogPlato": 9.8,
      "fgSg": 1.005,
      "fgPlato": 1.3,
      "abv": 4.5,
      "ibu": 16,
      "srm": 6.8,
      "ebc": 13.4,
      "buGuRatio": 0.41,
      "totalGrainWeightKg": 5.1,
      "strikeWaterL": 17.8,
      "spargeWaterL": 20.7,
      "totalWaterL": 38.5,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 11,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1490,
      "caloriesPer500ml": 134
    },
    "tags": [
      "Пшеничное",
      "Specialty Beer",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_spelt_belgian_saison",
    "name": "Сэзон на Полбе (Spelt Farmhouse Saison)",
    "style": "Saison",
    "category": "Бельгийские эли",
    "description": "Фермерский эль на спельте с сухим перечным финишем.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.9,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle BE-134 (Saison)",
      "lab": "Fermentis",
      "form": "dry",
      "type": "belgian",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 90,
      "tempRange": [
        18,
        28
      ]
    },
    "calculated": {
      "ogSg": 1.04,
      "ogPlato": 10,
      "fgSg": 1.004,
      "fgPlato": 1,
      "abv": 4.7,
      "ibu": 15,
      "srm": 6.8,
      "ebc": 13.4,
      "buGuRatio": 0.38,
      "totalGrainWeightKg": 5.2,
      "strikeWaterL": 18.2,
      "spargeWaterL": 20.4,
      "totalWaterL": 38.6,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 11.3,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1461,
      "caloriesPer500ml": 138
    },
    "tags": [
      "Бельгийские эли",
      "Saison",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_dark_farmhouse_ale",
    "name": "Темный Фермерский Эль (Dark Farmhouse Ale)",
    "style": "Saison",
    "category": "Бельгийские эли",
    "description": "Темный сэзон на карамельном солоде с пряным букетом гвоздики и перца.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 4.3,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.2,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle BE-134 (Saison)",
      "lab": "Fermentis",
      "form": "dry",
      "type": "belgian",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 90,
      "tempRange": [
        18,
        28
      ]
    },
    "calculated": {
      "ogSg": 1.044,
      "ogPlato": 11,
      "fgSg": 1.004,
      "fgPlato": 1,
      "abv": 5.3,
      "ibu": 15,
      "srm": 7.1,
      "ebc": 14,
      "buGuRatio": 0.34,
      "totalGrainWeightKg": 5.8,
      "strikeWaterL": 20.3,
      "spargeWaterL": 18.9,
      "totalWaterL": 39.2,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 12.4,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1309,
      "caloriesPer500ml": 154
    },
    "tags": [
      "Бельгийские эли",
      "Saison",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_belgian_special_ale",
    "name": "Бельгийский Специальный Янтарный (Belgian Special Ale)",
    "style": "Belgian Pale Ale",
    "category": "Бельгийские эли",
    "description": "Медный бельгийский эль с сухофруктами и легкой карамелью.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 4.1,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle BE-256 (Abbaye)",
      "lab": "Fermentis",
      "form": "dry",
      "type": "belgian",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 84,
      "tempRange": [
        18,
        25
      ]
    },
    "calculated": {
      "ogSg": 1.042,
      "ogPlato": 10.5,
      "fgSg": 1.007,
      "fgPlato": 1.8,
      "abv": 4.6,
      "ibu": 15,
      "srm": 7,
      "ebc": 13.8,
      "buGuRatio": 0.36,
      "totalGrainWeightKg": 5.5,
      "strikeWaterL": 19.2,
      "spargeWaterL": 19.7,
      "totalWaterL": 38.9,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 11.8,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1381,
      "caloriesPer500ml": 141
    },
    "tags": [
      "Бельгийские эли",
      "Belgian Pale Ale",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_abbey_extra_strong",
    "name": "Аббатский Экстра (Abbey Extra Strong 9.0%)",
    "style": "Belgian Dark Strong Ale",
    "category": "Бельгийские эли",
    "description": "Крепкий монастырский эль с темным сахаром кассанад.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 6.1,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.6,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.4,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle BE-256 (Abbaye)",
      "lab": "Fermentis",
      "form": "dry",
      "type": "belgian",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 84,
      "tempRange": [
        18,
        25
      ]
    },
    "calculated": {
      "ogSg": 1.062,
      "ogPlato": 15.2,
      "fgSg": 1.01,
      "fgPlato": 2.6,
      "abv": 6.8,
      "ibu": 13,
      "srm": 8.8,
      "ebc": 17.3,
      "buGuRatio": 0.21,
      "totalGrainWeightKg": 8.1,
      "strikeWaterL": 28.3,
      "spargeWaterL": 13.1,
      "totalWaterL": 41.4,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 17.1,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 937,
      "caloriesPer500ml": 205
    },
    "tags": [
      "Бельгийские эли",
      "Belgian Dark Strong Ale",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_flemish_amber_ale",
    "name": "Фламандский Янтарный Эль (Flemish Amber Ale)",
    "style": "Bière de Garde",
    "category": "Бельгийские эли",
    "description": "Традиционный эль французской Фландрии с бисквитным характером.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 4.2,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "SafAle BE-256 (Abbaye)",
      "lab": "Fermentis",
      "form": "dry",
      "type": "belgian",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 84,
      "tempRange": [
        18,
        25
      ]
    },
    "calculated": {
      "ogSg": 1.043,
      "ogPlato": 10.7,
      "fgSg": 1.007,
      "fgPlato": 1.8,
      "abv": 4.7,
      "ibu": 15,
      "srm": 7,
      "ebc": 13.8,
      "buGuRatio": 0.35,
      "totalGrainWeightKg": 5.6,
      "strikeWaterL": 19.6,
      "spargeWaterL": 19.4,
      "totalWaterL": 39,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 12,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1356,
      "caloriesPer500ml": 143
    },
    "tags": [
      "Бельгийские эли",
      "Bière de Garde",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_apricot_wild_farmhouse",
    "name": "Абрикосовый Дикий Эль (Apricot Wild Ale)",
    "style": "Wild Specialty Beer",
    "category": "Кислые эли",
    "description": "Бочковой кислый эль на спелых абрикосах с легкой древесной танинностью.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 3.8,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "LalBrew Philly Sour",
      "lab": "Lallemand",
      "form": "dry",
      "type": "sour",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 75,
      "tempRange": [
        20,
        25
      ]
    },
    "calculated": {
      "ogSg": 1.039,
      "ogPlato": 9.8,
      "fgSg": 1.01,
      "fgPlato": 2.6,
      "abv": 3.8,
      "ibu": 16,
      "srm": 6.8,
      "ebc": 13.4,
      "buGuRatio": 0.41,
      "totalGrainWeightKg": 5.1,
      "strikeWaterL": 17.8,
      "spargeWaterL": 20.7,
      "totalWaterL": 38.5,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 11,
      "yeastPacksNeeded": 1,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1490,
      "caloriesPer500ml": 125
    },
    "tags": [
      "Кислые эли",
      "Wild Specialty Beer",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  },
  {
    "id": "rec_plum_flanders_ale",
    "name": "Сливовый Фламандский (Plum Flanders Ale)",
    "style": "Flanders Red Ale",
    "category": "Кислые эли",
    "description": "Кислый винный эль с добавлением сочной венгерской сливы и корицы.",
    "author": "МастерВарка Коллекция",
    "batchSizeL": 30,
    "boilTimeMin": 60,
    "efficiencyPercent": 75,
    "grainRatioLPerKg": 3.5,
    "grainTempC": 20,
    "targetCarbonationVol": 2.5,
    "beerTempAtBottlingC": 19,
    "grains": [
      {
        "id": "g_1",
        "name": "Pilsner Malt",
        "weightKg": 4.2,
        "potentialSg": 1.037,
        "colorEbc": 3.5,
        "type": "base"
      },
      {
        "id": "g_2",
        "name": "Munich I",
        "weightKg": 1.1,
        "potentialSg": 1.036,
        "colorEbc": 15,
        "type": "base"
      },
      {
        "id": "g_3",
        "name": "Caramunich II",
        "weightKg": 0.3,
        "potentialSg": 1.034,
        "colorEbc": 120,
        "type": "caramel"
      }
    ],
    "hops": [
      {
        "id": "h_1",
        "name": "Saaz",
        "weightG": 35,
        "alphaAcid": 3.8,
        "boilTimeMin": 60,
        "use": "boil"
      },
      {
        "id": "h_2",
        "name": "Hallertau Mittelfrüh",
        "weightG": 25,
        "alphaAcid": 4,
        "boilTimeMin": 15,
        "use": "boil"
      }
    ],
    "mashSchedule": [
      {
        "id": "m_1",
        "name": "Осахаривание",
        "tempC": 66,
        "timeMin": 60,
        "type": "maltose"
      },
      {
        "id": "m_2",
        "name": "Мэшаут",
        "tempC": 78,
        "timeMin": 10,
        "type": "mashout"
      }
    ],
    "yeast": {
      "name": "LalBrew Philly Sour",
      "lab": "Lallemand",
      "form": "dry",
      "type": "sour",
      "cellsPerGramOrVial": 20,
      "attenuationPercent": 75,
      "tempRange": [
        20,
        25
      ]
    },
    "calculated": {
      "ogSg": 1.043,
      "ogPlato": 10.7,
      "fgSg": 1.011,
      "fgPlato": 2.8,
      "abv": 4.2,
      "ibu": 15,
      "srm": 7,
      "ebc": 13.8,
      "buGuRatio": 0.35,
      "totalGrainWeightKg": 5.6,
      "strikeWaterL": 19.6,
      "spargeWaterL": 19.4,
      "totalWaterL": 39,
      "strikeTempC": 72.4,
      "dryYeastGramsNeeded": 12,
      "yeastPacksNeeded": 2,
      "dextroseGrams": 194,
      "sucroseGrams": 177,
      "dmeGrams": 252,
      "speiseMl": 1356,
      "caloriesPer500ml": 137
    },
    "tags": [
      "Кислые эли",
      "Flanders Red Ale",
      "Коллекция"
    ],
    "isCustom": false,
    "createdAt": "2026-03-15T12:00:00.000Z",
    "updatedAt": "2026-03-15T12:00:00.000Z"
  }
];
