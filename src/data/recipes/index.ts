/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Модульный агрегатор всех расширенных рецептов пивоварения (170+ новых сортов).
 */

import { Recipe } from '../../types/brewing';
import { LAGER_RECIPES } from './lagers';
import { ALE_RECIPES } from './ales';
import { WHEAT_RECIPES } from './wheat';
import { STOUT_RECIPES } from './stouts';
import { BELGIAN_RECIPES } from './belgian';
import { SOUR_RECIPES } from './sours';
import { BRITISH_RECIPES } from './british';
import { HISTORIC_RUSSIAN_RECIPES } from './historicRussian';
import { HYBRID_RECIPES } from './hybrids';
import { MORE_CRAFT_ALES } from './moreCraftAles';
import { MASSIVE_RECIPE_DATASET } from './massiveRecipeDataset';

/**
 * Объединенная коллекция расширенных эталонных сортов пивоварения
 */
export const EXTENDED_RECIPES_DATABASE: Recipe[] = [
  ...LAGER_RECIPES,
  ...ALE_RECIPES,
  ...WHEAT_RECIPES,
  ...STOUT_RECIPES,
  ...BELGIAN_RECIPES,
  ...SOUR_RECIPES,
  ...BRITISH_RECIPES,
  ...HISTORIC_RUSSIAN_RECIPES,
  ...HYBRID_RECIPES,
  ...MORE_CRAFT_ALES,
  ...MASSIVE_RECIPE_DATASET
];
