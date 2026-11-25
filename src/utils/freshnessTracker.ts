/**
 * @license
 * Copyright (c) 2026 MasterVarka. All rights reserved.
 */

import { HopStorageType, InventoryItem, Recipe } from '../types/brewing';
import { findMatchingInventoryItem } from './costCalculator';

export type FreshnessStatus = 'fresh' | 'warning' | 'expired' | 'unknown';

export interface IngredientFreshnessReport {
  status: FreshnessStatus;
  label: string;
  detail: string;
  originalAlpha?: number;
  effectiveAlpha?: number;
  degradationPercent?: number;
  ageYears?: number;
  ageMonths?: number;
}

export interface DegradedRecipeHopWarning {
  hopName: string;
  harvestYear: number;
  originalAlpha: number;
  effectiveAlpha: number;
  degradationPercent: number;
  status: 'warning' | 'expired';
}

/**
 * Коэффициент ежегодной потери альфа-кислот (экспоненциальная модель деградации хмеля).
 * - freezer (-18°C, вакуум): ~5% в год
 * - fridge (+4°C, герметично): ~12% в год
 * - room (+20°C): ~20% в год
 */
const ANNUAL_ALPHA_DECAY_RATE: Record<HopStorageType, number> = {
  freezer: 0.05,
  fridge: 0.12,
  room: 0.20
};

/**
 * Расчет актуального процента альфа-кислоты хмеля с учетом года урожая и условий хранения.
 * Формула: AA_current = AA_initial * (1 - decayRate)^yearsElapsed
 */
export function calculateCurrentAlpha(
  hop: InventoryItem,
  referenceYear: number = new Date().getFullYear()
): number {
  const initialAlpha = hop.potentialSgOrAlpha ?? 0;
  if (initialAlpha <= 0) return 0;

  if (!hop.harvestYear || hop.harvestYear >= referenceYear) {
    return Math.round(initialAlpha * 10) / 10;
  }

  const yearsElapsed = Math.max(0, referenceYear - hop.harvestYear);
  const storage: HopStorageType = hop.storageType || 'room';
  const annualLoss = ANNUAL_ALPHA_DECAY_RATE[storage];
  const remainingFactor = Math.pow(1 - annualLoss, yearsElapsed);

  return Math.max(0.1, Math.round(initialAlpha * remainingFactor * 10) / 10);
}

/**
 * Оценка свежести позиции склада (хмеля по году урожая или дрожжей по дате производства)
 */
export function evaluateIngredientFreshness(
  item: InventoryItem,
  referenceDate: Date = new Date()
): IngredientFreshnessReport {
  const currentYear = referenceDate.getFullYear();

  if (item.category === 'hop') {
    if (!item.harvestYear) {
      return {
        status: 'unknown',
        label: 'Год урожая не указан',
        detail: 'Укажите год урожая для расчёта деградации альфа-кислот'
      };
    }

    const ageYears = Math.max(0, currentYear - item.harvestYear);
    const originalAlpha = item.potentialSgOrAlpha ?? 0;
    const effectiveAlpha = originalAlpha > 0 ? calculateCurrentAlpha(item, currentYear) : undefined;
    const degradationPercent =
      originalAlpha > 0 && effectiveAlpha !== undefined
        ? Math.max(0, Math.round(((originalAlpha - effectiveAlpha) / originalAlpha) * 100))
        : undefined;

    if (ageYears <= 1) {
      return {
        status: 'fresh',
        label: 'Свежий',
        detail: `Урожай ${item.harvestYear} г.`,
        originalAlpha: originalAlpha > 0 ? originalAlpha : undefined,
        effectiveAlpha,
        degradationPercent,
        ageYears
      };
    }

    if (ageYears === 2) {
      return {
        status: 'warning',
        label: 'Требует внимания',
        detail:
          effectiveAlpha !== undefined
            ? `Урожай ${item.harvestYear} г. • расчётная α ≈ ${effectiveAlpha}% (-${degradationPercent}%)`
            : `Урожай ${item.harvestYear} г. (2 года)`,
        originalAlpha: originalAlpha > 0 ? originalAlpha : undefined,
        effectiveAlpha,
        degradationPercent,
        ageYears
      };
    }

    return {
      status: 'expired',
      label: 'Критическая деградация',
      detail:
        effectiveAlpha !== undefined
          ? `Урожай ${item.harvestYear} г. • расчётная α ≈ ${effectiveAlpha}% (-${degradationPercent}%)`
          : `Урожай ${item.harvestYear} г. (${ageYears} г.)`,
      originalAlpha: originalAlpha > 0 ? originalAlpha : undefined,
      effectiveAlpha,
      degradationPercent,
      ageYears
    };
  }

  if (item.category === 'yeast') {
    if (!item.productionDate) {
      return {
        status: 'unknown',
        label: 'Дата не указана',
        detail: 'Укажите дату производства дрожжей'
      };
    }

    const prodTime = Date.parse(item.productionDate);
    if (Number.isNaN(prodTime)) {
      return {
        status: 'unknown',
        label: 'Некорректная дата',
        detail: 'Используйте формат ГГГГ-ММ-ДД'
      };
    }

    const ageMonths = Math.max(
      0,
      Math.floor((referenceDate.getTime() - prodTime) / (1000 * 60 * 60 * 24 * 30.44))
    );

    // Для сухих дрожжей срок годности ~24 месяца (предупреждение с 18 мес.)
    if (ageMonths < 18) {
      return {
        status: 'fresh',
        label: 'Свежий',
        detail: `Возраст: ${ageMonths} мес. (в сроке годности)`,
        ageMonths
      };
    }

    if (ageMonths <= 24) {
      return {
        status: 'warning',
        label: 'Требует внимания',
        detail: `Возраст: ${ageMonths} мес. (близко к сроку, сделайте стартер)`,
        ageMonths
      };
    }

    return {
      status: 'expired',
      label: 'Просрочен',
      detail: `Возраст: ${ageMonths} мес. (жизнеспособность критически снижена)`,
      ageMonths
    };
  }

  return {
    status: 'unknown',
    label: 'Без срока',
    detail: ''
  };
}

/**
 * Проверка хмелей текущего рецепта на наличие деградировавшего/просроченного хмеля на складе
 */
export function findDegradedRecipeHops(
  recipe: Recipe,
  inventory: InventoryItem[],
  referenceDate: Date = new Date()
): DegradedRecipeHopWarning[] {
  const warnings: DegradedRecipeHopWarning[] = [];
  const seen = new Set<string>();

  for (const hop of recipe.hops) {
    const key = hop.name.trim().toLowerCase();
    if (seen.has(key)) continue;

    const match = findMatchingInventoryItem(hop.name, 'hop', inventory);
    if (!match || !match.harvestYear) continue;

    const report = evaluateIngredientFreshness(match, referenceDate);
    if (report.status === 'warning' || report.status === 'expired') {
      seen.add(key);
      const originalAlpha = match.potentialSgOrAlpha || hop.alphaAcid;
      const effectiveAlpha = calculateCurrentAlpha(
        { ...match, potentialSgOrAlpha: originalAlpha },
        referenceDate.getFullYear()
      );
      const degradationPercent =
        originalAlpha > 0
          ? Math.max(0, Math.round(((originalAlpha - effectiveAlpha) / originalAlpha) * 100))
          : 0;

      warnings.push({
        hopName: hop.name,
        harvestYear: match.harvestYear,
        originalAlpha,
        effectiveAlpha,
        degradationPercent,
        status: report.status
      });
    }
  }

  return warnings;
}
