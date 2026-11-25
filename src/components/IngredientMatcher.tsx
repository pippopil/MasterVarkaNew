import React, { useState, useMemo } from 'react';
import { HopStorageType, InventoryItem, Recipe, RecipeMatchResult } from '../types/brewing';
import {
  COMMON_GRAINS,
  COMMON_HOPS,
  COMMON_YEASTS,
  COMMON_ADJUNCTS
} from '../data/defaultData';
import { ebcToHex, scaleRecipeIngredients } from '../utils/brewingMath';
import {
  isIngredientMatch,
  getStandardBrewerStarterPack
} from '../utils/ingredientNormalizer';
import {
  getKurskMaltSubstitute,
  getHopAlternatives,
  KURSK_MALT_PRODUCTS,
  isKurskMalt
} from '../utils/brewingSubstitutions';
import { evaluateIngredientFreshness } from '../utils/freshnessTracker';
import { formatCurrencySymbol } from '../utils/costCalculator';
import {
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShoppingCart,
  ArrowRight,
  Filter,
  Sparkles,
  Package,
  Layers,
  Flame,
  Beer,
  Scale,
  Check,
  ChevronDown,
  ChevronUp,
  Sliders,
  Copy,
  RotateCcw,
  Zap,
  X,
  Target
} from 'lucide-react';
import { SafeNumberInput } from './SafeNumberInput';
import { PantryStockChart } from './PantryStockChart';
import { RecentBrewsAnalytics } from './RecentBrewsAnalytics';
import { BrewLog } from '../types/brewing';
import {
  resolveInventoryCharacteristics,
  checkRecipeIngredientMatch,
  filterInventoryItems,
  EbcCategory,
  AlphaCategory,
  StockStatusFilter
} from '../utils/inventoryCharacteristics';

interface Props {
  inventory: InventoryItem[];
  recipes: Recipe[];
  logs?: BrewLog[];
  onUpdateInventory: (inv: InventoryItem[]) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  globalBatchSizeL: number;
  onSetGlobalBatchSizeL: (sizeL: number) => void;
  onCreateCustomRecipeFromPantry: (selectedGrains: string[], selectedHops: string[], selectedYeast?: string) => void;
}

export const IngredientMatcher: React.FC<Props> = ({
  inventory,
  recipes,
  logs = [],
  onUpdateInventory,
  onSelectRecipe,
  globalBatchSizeL,
  onSetGlobalBatchSizeL,
  onCreateCustomRecipeFromPantry
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hasManuallySelectedTab, setHasManuallySelectedTab] = useState(false);
  const [matchViewTab, setMatchViewTab] = useState<'all' | '100_percent' | 'missing_1' | 'missing_2'>('100_percent');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showCatalogDrawer, setShowCatalogDrawer] = useState(false);
  const [catalogTab, setCatalogTab] = useState<'grain' | 'hop' | 'yeast' | 'misc'>('grain');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const [copySuccessToast, setCopySuccessToast] = useState(false);

  // Фильтры каталога
  const [grainGroupFilter, setGrainGroupFilter] = useState<'all' | 'kursk' | 'base' | 'caramel' | 'roasted' | 'adjunct'>('all');
  const [catalogEbcFilter, setCatalogEbcFilter] = useState<EbcCategory>('all');
  const [catalogAlphaFilter, setCatalogAlphaFilter] = useState<AlphaCategory>('all');
  const [catalogRegionFilter, setCatalogRegionFilter] = useState<string>('all');
  const [yeastLabFilter, setYeastLabFilter] = useState<'all' | 'mangrove' | 'fermentis' | 'lallemand' | 'custom'>('all');
  const [customYeastName, setCustomYeastName] = useState('');
  const [customYeastLab, setCustomYeastLab] = useState('');
  const [customYeastAmount, setCustomYeastAmount] = useState<number>(1);
  const [catalogInputValues, setCatalogInputValues] = useState<Record<string, string>>({});

  // Поиск и фильтрация склада (Pantry) по характеристикам
  const [pantrySearch, setPantrySearch] = useState('');
  const [pantryCategory, setPantryCategory] = useState<'all' | 'grain' | 'hop' | 'yeast' | 'misc'>('all');
  const [pantryEbcFilter, setPantryEbcFilter] = useState<EbcCategory>('all');
  const [pantryAlphaFilter, setPantryAlphaFilter] = useState<AlphaCategory>('all');
  const [pantryStockStatus, setPantryStockStatus] = useState<StockStatusFilter>('all');
  const [pantryAnalogRecipeId, setPantryAnalogRecipeId] = useState<string>('none');
  const [showRecipeAnalogsOnly, setShowRecipeAnalogsOnly] = useState(false);

  // Форма ручного добавления кастомного ингредиента
  const [newInvName, setNewInvName] = useState('');
  const [newInvCategory, setNewInvCategory] = useState<'grain' | 'hop' | 'yeast' | 'misc'>('grain');
  const [newInvAmount, setNewInvAmount] = useState<number>(5.0);
  const [newInvUnit, setNewInvUnit] = useState<'kg' | 'g' | 'pack'>('kg');
  const [newInvEbc, setNewInvEbc] = useState<number | ''>('');
  const [newInvAlpha, setNewInvAlpha] = useState<number | ''>('');

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvName.trim()) return;

    let ebc: number | undefined;
    let alpha: number | undefined;
    if (newInvCategory === 'grain') {
      ebc = newInvEbc !== '' ? Number(newInvEbc) : undefined;
    } else if (newInvCategory === 'hop') {
      alpha = newInvAlpha !== '' ? Number(newInvAlpha) : undefined;
    }

    const newItem: InventoryItem = {
      id: `inv_${Date.now()}`,
      name: newInvName.trim(),
      category: newInvCategory,
      amount: newInvAmount,
      unit: newInvUnit,
      colorEbc: ebc,
      potentialSgOrAlpha: alpha
    };
    onUpdateInventory([...inventory, newItem]);
    setNewInvName('');
    setNewInvEbc('');
    setNewInvAlpha('');
  };

  const removeInventoryItem = (id: string) => {
    onUpdateInventory(inventory.filter(item => item.id !== id));
  };

  const updateInventoryAmount = (id: string, amount: number) => {
    onUpdateInventory(
      inventory.map(item => (item.id === id ? { ...item, amount: Math.max(0, amount) } : item))
    );
  };

  const adjustInventoryAmount = (id: string, delta: number) => {
    onUpdateInventory(
      inventory.map(item => {
        if (item.id !== id) return item;
        const newAmount = Math.max(0, Number((item.amount + delta).toFixed(2)));
        return { ...item, amount: newAmount };
      })
    );
  };

  const updateInventoryItemFields = (id: string, patch: Partial<InventoryItem>) => {
    onUpdateInventory(
      inventory.map(item => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  // Точный поиск предмета на складе (без размытого поиска, только конкретный ингредиент)
  const findExactPantryItem = (name: string, category: 'grain' | 'hop' | 'yeast' | 'misc') => {
    const clean = name.trim().toLowerCase();
    return inventory.find(
      inv => inv.category === category && inv.name.trim().toLowerCase() === clean
    );
  };

  // Получение текущего остатка конкретного ингредиента
  const getPantryAmount = (name: string, category: 'grain' | 'hop' | 'yeast' | 'misc') => {
    const existing = findExactPantryItem(name, category);
    return existing ? existing.amount : 0;
  };

  // Установка точного количества ингредиента пользователем
  const setCatalogItemAmount = (
    name: string,
    category: 'grain' | 'hop' | 'yeast' | 'misc',
    targetAmount: number,
    unit: 'kg' | 'g' | 'pack' | 'ml'
  ) => {
    const rounded = Number(Math.max(0, targetAmount).toFixed(2));
    const existing = findExactPantryItem(name, category);

    if (rounded === 0) {
      if (existing) {
        onUpdateInventory(inventory.filter(inv => inv.id !== existing.id));
      }
      return;
    }

    if (existing) {
      onUpdateInventory(
        inventory.map(inv =>
          inv.id === existing.id ? { ...inv, amount: rounded } : inv
        )
      );
    } else {
      let colorEbc: number | undefined;
      let potentialSgOrAlpha: number | undefined;
      if (category === 'grain') {
        const found = COMMON_GRAINS.find(g => isIngredientMatch(g.name, name, 'grain'));
        if (found) {
          colorEbc = found.colorEbc;
          potentialSgOrAlpha = found.potentialSg;
        }
      } else if (category === 'hop') {
        const found = COMMON_HOPS.find(h => isIngredientMatch(h.name, name, 'hop'));
        if (found) {
          potentialSgOrAlpha = found.alphaAcid;
        }
      } else if (category === 'yeast') {
        const found = COMMON_YEASTS.find(y => isIngredientMatch(y.name, name, 'yeast'));
        if (found) {
          potentialSgOrAlpha = found.attenuationPercent;
        }
      }

      const newItem: InventoryItem = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        category,
        amount: rounded,
        unit,
        colorEbc,
        potentialSgOrAlpha
      };
      onUpdateInventory([...inventory, newItem]);
    }
  };

  // Быстрое добавление ингредиента из каталога
  const addCatalogItem = (name: string, category: 'grain' | 'hop' | 'yeast' | 'misc', addAmount: number, unit: 'kg' | 'g' | 'pack' | 'ml') => {
    const existing = findExactPantryItem(name, category);

    if (existing) {
      onUpdateInventory(
        inventory.map(inv =>
          inv.id === existing.id
            ? { ...inv, amount: Number((inv.amount + addAmount).toFixed(2)) }
            : inv
        )
      );
    } else {
      let colorEbc: number | undefined;
      let potentialSgOrAlpha: number | undefined;
      if (category === 'grain') {
        const found = COMMON_GRAINS.find(g => isIngredientMatch(g.name, name, 'grain'));
        if (found) {
          colorEbc = found.colorEbc;
          potentialSgOrAlpha = found.potentialSg;
        }
      } else if (category === 'hop') {
        const found = COMMON_HOPS.find(h => isIngredientMatch(h.name, name, 'hop'));
        if (found) {
          potentialSgOrAlpha = found.alphaAcid;
        }
      } else if (category === 'yeast') {
        const found = COMMON_YEASTS.find(y => isIngredientMatch(y.name, name, 'yeast'));
        if (found) {
          potentialSgOrAlpha = found.attenuationPercent;
        }
      }

      const newItem: InventoryItem = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        category,
        amount: addAmount,
        unit,
        colorEbc,
        potentialSgOrAlpha
      };
      onUpdateInventory([...inventory, newItem]);
    }
  };

  // Заполнение типового набора пивовара
  const handleLoadStarterPack = () => {
    onUpdateInventory(getStandardBrewerStarterPack());
  };

  // Очистка кладовой
  const handleClearPantry = () => {
    onUpdateInventory([]);
  };

  // УМНЫЙ АЛГОРИТМ СОПОСТАВЛЕНИЯ РЕЦЕПТОВ С ЗАПАСАМИ ПОД ЖЕЛАЕМЫЙ ОБЪЕМ ПАРТИИ
  const matchResults: Array<RecipeMatchResult & { scaledRecipe: Recipe; missingCount: number }> = useMemo(() => {
    return recipes.map(recipe => {
      // Масштабируем рецепт под желаемый объем партии
      const scaleRatio = globalBatchSizeL / (recipe.batchSizeL || 30);
      const { scaledGrains, scaledHops } = scaleRecipeIngredients(
        recipe.grains,
        recipe.hops,
        recipe.batchSizeL,
        globalBatchSizeL
      );

      const scaledRecipe: Recipe = {
        ...recipe,
        batchSizeL: globalBatchSizeL,
        grains: scaledGrains,
        hops: scaledHops,
        calculated: {
          ...recipe.calculated,
          dryYeastGramsNeeded: Number((recipe.calculated.dryYeastGramsNeeded * scaleRatio).toFixed(1)),
          yeastPacksNeeded: Math.max(1, Math.ceil(recipe.calculated.yeastPacksNeeded * scaleRatio)),
          dextroseGrams: Math.round(recipe.calculated.dextroseGrams * scaleRatio),
          totalGrainWeightKg: Number((recipe.calculated.totalGrainWeightKg * scaleRatio).toFixed(2))
        }
      };

      let totalItems = 0;
      let matchedItems = 0;
      const availableIngredients: string[] = [];
      const missingIngredients: RecipeMatchResult['missingIngredients'] = [];

      // 1. Агрегация и проверка солодов с нормализацией и аналогами Курского солода
      const aggregatedGrains: {
        name: string;
        type?: any;
        colorEbc?: number;
        totalWeightKg: number;
      }[] = [];

      for (const grain of scaledRecipe.grains) {
        const existing = aggregatedGrains.find(g => isIngredientMatch(g.name, grain.name, 'grain'));
        if (existing) {
          existing.totalWeightKg = Number((existing.totalWeightKg + grain.weightKg).toFixed(2));
          if (!existing.colorEbc && grain.colorEbc) existing.colorEbc = grain.colorEbc;
          if (!existing.type && grain.type) existing.type = grain.type;
        } else {
          aggregatedGrains.push({
            name: grain.name,
            type: grain.type,
            colorEbc: grain.colorEbc,
            totalWeightKg: Number(grain.weightKg.toFixed(2))
          });
        }
      }

      aggregatedGrains.forEach(aggGrain => {
        totalItems += 1;
        // Только реальные запасы на складе (amount > 0)
        const matchingInvs = inventory.filter(
          inv => inv.category === 'grain' && inv.amount > 0 && isIngredientMatch(inv.name, aggGrain.name, 'grain')
        );
        const directInvAmount = matchingInvs.reduce((sum, item) => sum + item.amount, 0);

        if (directInvAmount >= aggGrain.totalWeightKg) {
          matchedItems += 1;
          const displayNames = matchingInvs.map(i => i.name).join(', ');
          const label = matchingInvs.length > 0 && !matchingInvs.some(i => i.name.toLowerCase() === aggGrain.name.toLowerCase())
            ? `${aggGrain.name} (${displayNames}) (${aggGrain.totalWeightKg} кг)`
            : `${aggGrain.name} (${aggGrain.totalWeightKg} кг)`;
          availableIngredients.push(label);
        } else {
          // Проверяем, есть ли в наличии на складе признанный эквивалентный солод
          const isGrainSpecialty = (name: string, type?: string, colorEbc?: number): boolean => {
            if (type && type !== 'base') return true;
            if (colorEbc && colorEbc > 25) return true;
            const n = name.toLowerCase();
            return (
              n.includes('cara') || n.includes('кара') ||
              n.includes('roast') || n.includes('жжен') ||
              n.includes('choc') || n.includes('шоколад') ||
              n.includes('black') || n.includes('черн') ||
              n.includes('flake') || n.includes('хлопь') ||
              n.includes('oat') || n.includes('овес') || n.includes('овсян') ||
              n.includes('wheat') || n.includes('пшенич') ||
              n.includes('rye') || n.includes('ржан') ||
              n.includes('honey') || n.includes('медов') ||
              n.includes('special') || n.includes('спешиал') ||
              n.includes('biscuit') || n.includes('бисквит') ||
              n.includes('melanoid') || n.includes('мелано') ||
              n.includes('acid') || n.includes('кисл') ||
              n.includes('smoked') || n.includes('копчен') ||
              n.includes('crystal') || n.includes('кристалл')
            );
          };

          const isGrainBase = (name: string): boolean => {
            const n = name.toLowerCase();
            if (
              n.includes('cara') || n.includes('кара') ||
              n.includes('roast') || n.includes('жжен') ||
              n.includes('choc') || n.includes('шоколад') ||
              n.includes('black') || n.includes('черн') ||
              n.includes('flake') || n.includes('хлопь') ||
              n.includes('oat') || n.includes('овес') ||
              n.includes('wheat') || n.includes('пшенич') ||
              n.includes('rye') || n.includes('ржан') ||
              n.includes('acid') || n.includes('кисл') ||
              n.includes('smoked') || n.includes('копчен') ||
              n.includes('special') || n.includes('biscuit')
            ) {
              return false;
            }
            return (
              n.includes('pale') || n.includes('пэйл') || n.includes('пейл') ||
              n.includes('pils') || n.includes('пилс') ||
              n.includes('vienna') || n.includes('венск') ||
              n.includes('lager') || n.includes('лагер') ||
              n.includes('2-row') || n.includes('two-row') ||
              n.includes('6-row') || n.includes('six-row') ||
              n.includes('maris otter') || n.includes('мэрис')
            );
          };

          const isAggSpecialty = isGrainSpecialty(aggGrain.name, aggGrain.type, aggGrain.colorEbc);
          const sub = getKurskMaltSubstitute(aggGrain.name, aggGrain.type, aggGrain.colorEbc);
          let matchedSubItem: InventoryItem | null = null;

          // Строгий запрет: специальный/карамельный/жженый/овсяный солод НИКОГДА не заменяется базовым!
          if (sub) {
            const isSubBase = sub.type === 'base';
            if (!isAggSpecialty || !isSubBase) {
              const subInvs = inventory.filter(
                inv => inv.category === 'grain' && inv.amount > 0 && isIngredientMatch(inv.name, sub.kurskName, 'grain')
              );
              const totalSub = subInvs.reduce((sum, item) => sum + item.amount, 0);
              if (totalSub >= aggGrain.totalWeightKg) {
                const candidate = subInvs[0];
                const isCandBase = isGrainBase(candidate.name);
                if (!isAggSpecialty || !isCandBase) {
                  matchedSubItem = candidate;
                }
              }
            }
          }

          if (matchedSubItem) {
            matchedItems += 1;
            availableIngredients.push(`${aggGrain.name} (Заменен на ${matchedSubItem.name}) (${aggGrain.totalWeightKg} кг)`);
          } else {
            const availableAmount = Number(directInvAmount.toFixed(2));
            const diff = Number(Math.max(0.1, aggGrain.totalWeightKg - availableAmount).toFixed(2));
            missingIngredients.push({
              name: aggGrain.name,
              category: 'grain',
              requiredAmount: aggGrain.totalWeightKg,
              unit: 'кг',
              inventoryAmount: availableAmount,
              differenceToBuy: diff,
              substituteSuggestion: sub ? `Аналог: ${sub.kurskName} (${sub.colorEbc} EBC)` : undefined,
              substituteName: sub ? sub.kurskName : undefined
            });
          }
        }
      });

      // 2. Агрегация и проверка хмелей с подбором альтернатив
      const aggregatedHops: {
        name: string;
        totalWeightG: number;
      }[] = [];

      for (const hop of scaledRecipe.hops) {
        const existing = aggregatedHops.find(h => isIngredientMatch(h.name, hop.name, 'hop'));
        if (existing) {
          existing.totalWeightG = Number((existing.totalWeightG + hop.weightG).toFixed(1));
        } else {
          aggregatedHops.push({
            name: hop.name,
            totalWeightG: Number(hop.weightG.toFixed(1))
          });
        }
      }

      aggregatedHops.forEach(aggHop => {
        totalItems += 1;
        const matchingInvs = inventory.filter(
          inv => inv.category === 'hop' && inv.amount > 0 && isIngredientMatch(inv.name, aggHop.name, 'hop')
        );
        const directInvAmount = matchingInvs.reduce((sum, item) => sum + item.amount, 0);

        if (directInvAmount >= aggHop.totalWeightG) {
          matchedItems += 1;
          availableIngredients.push(`${aggHop.name} (${aggHop.totalWeightG} г)`);
        } else {
          // Проверяем альтернативные сорта хмеля в наличии на складе
          const alts = getHopAlternatives(aggHop.name);
          let matchedAltItem: InventoryItem | null = null;

          for (const alt of alts) {
            const altInvs = inventory.filter(
              inv => inv.category === 'hop' && inv.amount > 0 && isIngredientMatch(inv.name, alt.name, 'hop')
            );
            const totalAlt = altInvs.reduce((sum, item) => sum + item.amount, 0);
            if (totalAlt >= aggHop.totalWeightG) {
              matchedAltItem = altInvs[0];
              break;
            }
          }

          if (matchedAltItem) {
            matchedItems += 1;
            availableIngredients.push(`${aggHop.name} (Заменен на ${matchedAltItem.name}) (${aggHop.totalWeightG} г)`);
          } else {
            const invAmount = Number(directInvAmount.toFixed(1));
            const diff = Number(Math.max(1, aggHop.totalWeightG - invAmount).toFixed(1));
            missingIngredients.push({
              name: aggHop.name,
              category: 'hop',
              requiredAmount: aggHop.totalWeightG,
              unit: 'г',
              inventoryAmount: invAmount,
              differenceToBuy: diff,
              substituteSuggestion: alts.length > 0 ? `Альтернативы: ${alts.slice(0, 3).map(a => a.name).join(', ')}` : undefined,
              substituteName: alts.length > 0 ? alts[0].name : undefined
            });
          }
        }
      });

      // 3. Строгая проверка дрожжей по штамму (только реальные запасы)
      totalItems += 1;
      const yeastRequiredPacks = scaledRecipe.calculated.yeastPacksNeeded || 1;
      const matchingYeastInvs = inventory.filter(
        inv => inv.category === 'yeast' && inv.amount > 0 && isIngredientMatch(inv.name, scaledRecipe.yeast.name, 'yeast')
      );
      const directYeastPacks = matchingYeastInvs.reduce((sum, item) => sum + item.amount, 0);

      if (directYeastPacks >= yeastRequiredPacks) {
        matchedItems += 1;
        availableIngredients.push(`${scaledRecipe.yeast.name} (${yeastRequiredPacks} пач.)`);
      } else {
        missingIngredients.push({
          name: scaledRecipe.yeast.name,
          category: 'yeast',
          requiredAmount: yeastRequiredPacks,
          unit: 'пач.',
          inventoryAmount: directYeastPacks,
          differenceToBuy: Math.max(1, yeastRequiredPacks - directYeastPacks)
        });
      }

      const matchPercentage = totalItems > 0 ? Math.round((matchedItems / totalItems) * 100) : 0;
      const isFullyMatch = missingIngredients.length === 0;

      return {
        recipe,
        scaledRecipe,
        matchPercentage,
        isFullyMatch,
        missingCount: missingIngredients.length,
        availableIngredients,
        missingIngredients
      };
    }).sort((a, b) => {
      if (a.isFullyMatch !== b.isFullyMatch) return a.isFullyMatch ? -1 : 1;
      if (a.missingCount !== b.missingCount) return a.missingCount - b.missingCount;
      return b.matchPercentage - a.matchPercentage;
    });
  }, [recipes, inventory, globalBatchSizeL]);

  // Статистика подбора
  const fullMatchCount = matchResults.filter(r => r.isFullyMatch).length;
  const missing1Count = matchResults.filter(r => r.missingCount === 1).length;
  const missing2Count = matchResults.filter(r => r.missingCount === 2).length;

  // Динамический выбор активного таба, чтобы при 0 полных совпадений пользователь не видел пустой экран
  const effectiveTab = useMemo(() => {
    if (hasManuallySelectedTab) return matchViewTab;
    if (fullMatchCount > 0) return '100_percent';
    if (missing1Count > 0) return 'missing_1';
    if (missing2Count > 0) return 'missing_2';
    return 'all';
  }, [hasManuallySelectedTab, matchViewTab, fullMatchCount, missing1Count, missing2Count]);

  // Фильтрация совпадений
  const filteredMatches = useMemo(() => {
    return matchResults.filter(({ recipe, isFullyMatch, missingCount }) => {
      const matchSearch =
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.style.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.grains.some(g => g.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        recipe.hops.some(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;

      if (effectiveTab === '100_percent' && !isFullyMatch) return false;
      if (effectiveTab === 'missing_1' && missingCount !== 1) return false;
      if (effectiveTab === 'missing_2' && missingCount !== 2) return false;

      if (categoryFilter !== 'all' && recipe.category !== categoryFilter) return false;

      return true;
    });
  }, [matchResults, searchTerm, effectiveTab, categoryFilter]);

  const categories = useMemo(() => Array.from(new Set(recipes.map(r => r.category))), [recipes]);

  // Сводный список покупок для всех рецептов с 1 недостающим ингредиентом
  const aggregatedShoppingList = useMemo(() => {
    const listMap = new Map<string, { name: string; category: string; amount: number; unit: string }>();

    matchResults
      .filter(r => r.missingCount <= 2 && r.missingCount > 0)
      .forEach(res => {
        res.missingIngredients.forEach(item => {
          const key = `${item.category}_${item.name.toLowerCase()}`;
          if (listMap.has(key)) {
            const current = listMap.get(key)!;
            current.amount = Math.max(current.amount, item.differenceToBuy);
          } else {
            listMap.set(key, {
              name: item.name,
              category: item.category,
              amount: item.differenceToBuy,
              unit: item.unit
            });
          }
        });
      });

    return Array.from(listMap.values());
  }, [matchResults]);

  // Копирование списка покупок в буфер обмена
  const handleCopyShoppingList = () => {
    if (aggregatedShoppingList.length === 0) return;

    const text = [
      `🛒 Список покупок для пивоварения (варка ${globalBatchSizeL} л):`,
      '----------------------------------------',
      ...aggregatedShoppingList.map(
        item => `• ${item.name}: ${item.amount} ${item.unit}`
      ),
      '----------------------------------------',
      'Создано в приложении «МастерВарка»'
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopySuccessToast(true);
      setTimeout(() => setCopySuccessToast(false), 2500);
    });
  };

  // Подсчет категорий на складе
  const pantryCategoryCounts = useMemo(() => {
    return {
      all: inventory.length,
      grain: inventory.filter(i => i.category === 'grain').length,
      hop: inventory.filter(i => i.category === 'hop').length,
      yeast: inventory.filter(i => i.category === 'yeast').length,
      misc: inventory.filter(i => i.category === 'misc').length
    };
  }, [inventory]);

  const selectedAnalogRecipe = useMemo(() => {
    if (!pantryAnalogRecipeId || pantryAnalogRecipeId === 'none') return null;
    return recipes.find(r => r.id === pantryAnalogRecipeId) || null;
  }, [recipes, pantryAnalogRecipeId]);

  const scaleRatioForRecipe = useMemo(() => {
    if (!selectedAnalogRecipe) return 1.0;
    return globalBatchSizeL / (selectedAnalogRecipe.batchSizeL || 30);
  }, [selectedAnalogRecipe, globalBatchSizeL]);

  const filteredPantry = useMemo(() => {
    return filterInventoryItems(inventory, {
      searchTerm: pantrySearch,
      categoryFilter: pantryCategory,
      ebcFilter: pantryEbcFilter,
      alphaFilter: pantryAlphaFilter,
      stockStatus: pantryStockStatus,
      selectedRecipe: selectedAnalogRecipe,
      recipeScaleRatio: scaleRatioForRecipe,
      showRecipeAnalogsOnly
    });
  }, [
    inventory,
    pantrySearch,
    pantryCategory,
    pantryEbcFilter,
    pantryAlphaFilter,
    pantryStockStatus,
    selectedAnalogRecipe,
    scaleRatioForRecipe,
    showRecipeAnalogsOnly
  ]);

  const hasActivePantryFilters =
    pantrySearch.trim() !== '' ||
    pantryCategory !== 'all' ||
    pantryEbcFilter !== 'all' ||
    pantryAlphaFilter !== 'all' ||
    pantryStockStatus !== 'all' ||
    pantryAnalogRecipeId !== 'none' ||
    showRecipeAnalogsOnly;

  const resetPantryFilters = () => {
    setPantrySearch('');
    setPantryCategory('all');
    setPantryEbcFilter('all');
    setPantryAlphaFilter('all');
    setPantryStockStatus('all');
    setPantryAnalogRecipeId('none');
    setShowRecipeAnalogsOnly(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Блок выбора желаемого объема партии */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-amber-500/10 dark:from-amber-950/40 dark:via-stone-900 dark:to-amber-950/30 rounded-2xl p-4 sm:p-5 border border-amber-300/80 dark:border-amber-700/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-sm shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
              Желаемый объём партии для варки:
            </div>
            <div className="text-xs text-stone-600 dark:text-stone-400">
              Все рецепты и списки «что докупить» автоматически рассчитываются под этот литраж
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Селектор объема с кнопками шага 5 л */}
          <div className="flex items-center bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => onSetGlobalBatchSizeL(Math.max(5, Math.round((globalBatchSizeL - 5) / 5) * 5))}
              className="px-2.5 py-1.5 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-black text-xs border-r border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
              title="Уменьшить на 5 литров"
            >
              -5л
            </button>
            <div className="px-2 py-1 flex items-center gap-1">
              <SafeNumberInput
                value={globalBatchSizeL}
                onChange={(val) => onSetGlobalBatchSizeL(Math.max(1, val))}
                min={5}
                max={500}
                step={5}
                fallbackValue={30}
                className="w-14 font-mono font-black text-center text-base text-amber-700 dark:text-amber-400 bg-transparent focus:outline-none"
              />
              <span className="font-bold text-[11px] text-stone-500">Л</span>
            </div>
            <button
              type="button"
              onClick={() => onSetGlobalBatchSizeL(Math.min(500, Math.round((globalBatchSizeL + 5) / 5) * 5))}
              className="px-2.5 py-1.5 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-black text-xs border-l border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
              title="Увеличить на 5 литров"
            >
              +5л
            </button>
          </div>

          {/* Быстрые кнопки литража с шагом 5 л включая 40 литров */}
          <div className="flex flex-wrap gap-1">
            {[10, 15, 20, 25, 30, 35, 40, 45, 50, 60].map(vol => (
              <button
                key={vol}
                onClick={() => onSetGlobalBatchSizeL(vol)}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                  globalBatchSizeL === vol
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
                }`}
              >
                {vol}л
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Аналитическая панель расхода ингредиентов (солод, хмель) в последних 5 варках с прогнозом истощения */}
      <RecentBrewsAnalytics
        recipes={recipes}
        logs={logs}
        inventory={inventory}
        onSelectIngredientToRestock={(name, category) => {
          setCatalogSearch(name);
          setShowCatalogDrawer(true);
          if (category === 'grain') setCatalogTab('grain');
          if (category === 'hop') setCatalogTab('hop');
        }}
      />

      {/* 3. Круговая визуализация текущих запасов ингредиентов кладовой через Recharts */}
      <PantryStockChart
        inventory={inventory}
        onSelectItem={(item) => {
          const el = document.getElementById(`inv-item-${item.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-2', 'ring-amber-500');
            setTimeout(() => el.classList.remove('ring-2', 'ring-amber-500'), 2500);
          }
        }}
      />

      {/* 3. Блок «Склад ингредиентов» с возможностью быстрого добавления любых ингредиентов */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200/80 dark:border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              <span>Склад ингредиентов (В наличии: {inventory.length} поз.)</span>
            </h2>
            <p className="text-xs text-stone-500">
              Добавьте имеющиеся у вас ингредиенты — алгоритм рассчитает, что можно сварить и что нужно докупить
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleLoadStarterPack}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300/80 dark:border-amber-700/80 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Заполнить популярным базовым набором солода, хмеля и дрожжей"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Типовой набор</span>
            </button>

            {inventory.length > 0 && (
              <button
                onClick={handleClearPantry}
                className="px-2.5 py-1.5 rounded-xl text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors flex items-center gap-1"
                title="Очистить все запасы"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Очистить</span>
              </button>
            )}

            <button
              onClick={() => setShowCatalogDrawer(!showCatalogDrawer)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Каталог ингредиентов</span>
              {showCatalogDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Раскрывающийся каталог для быстрого выбора ингредиентов в 1 клик */}
        {showCatalogDrawer && (
          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-stone-850 border border-amber-200/80 dark:border-stone-700 space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-amber-200/60 dark:border-stone-700 pb-3">
              <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
                {[
                  { id: 'grain', label: '🌾 Солода' },
                  { id: 'hop', label: '🌿 Хмели' },
                  { id: 'yeast', label: '🧪 Дрожжи' },
                  { id: 'misc', label: '✨ Добавки' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setCatalogTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      catalogTab === tab.id
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Поиск ингредиента..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Фильтры по группам и EBC для солодов */}
            {catalogTab === 'grain' && (
              <div className="space-y-1.5 pb-1 border-b border-amber-200/40 dark:border-stone-800">
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {[
                    { id: 'all', label: 'Все солода' },
                    { id: 'kursk', label: '🌾 Курский солод' },
                    { id: 'base', label: 'Базовые' },
                    { id: 'caramel', label: 'Карамельные' },
                    { id: 'roasted', label: 'Жженые' },
                    { id: 'adjunct', label: 'Хлопья / Спец.' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setGrainGroupFilter(f.id as any)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        grainGroupFilter === f.id
                          ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                          : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-1 text-[11px] pt-1 border-t border-amber-200/30 dark:border-stone-800/80">
                  <span className="text-[10px] text-stone-400 font-bold">Цветность EBC:</span>
                  {[
                    { id: 'all', label: 'Все' },
                    { id: 'light', label: '🌾 Светлые (<15)' },
                    { id: 'amber', label: '🍯 Янтарные (15–80)' },
                    { id: 'dark', label: '🌰 Тёмные (80–300)' },
                    { id: 'roasted', label: '☕ Жжёные (>300)' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setCatalogEbcFilter(f.id as any)}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                        catalogEbcFilter === f.id
                          ? 'bg-amber-600 text-white font-bold shadow-2xs'
                          : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Фильтры по альфа-кислотности и регионам для хмелей */}
            {catalogTab === 'hop' && (
              <div className="space-y-1.5 pb-1 border-b border-amber-200/40 dark:border-stone-800">
                <div className="flex flex-wrap items-center gap-1 text-[11px]">
                  <span className="text-[10px] text-stone-400 font-bold">Горечь α:</span>
                  {[
                    { id: 'all', label: 'Все % α' },
                    { id: 'aroma', label: '🌸 Тонкоаромат (<6%)' },
                    { id: 'balanced', label: '⚖️ Баланс (6–10%)' },
                    { id: 'bitter', label: '🔥 Горькие (>10%)' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setCatalogAlphaFilter(f.id as any)}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                        catalogAlphaFilter === f.id
                          ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                          : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-1 text-[11px] pt-1 border-t border-amber-200/30 dark:border-stone-800/80">
                  <span className="text-[10px] text-stone-400 font-bold">Регион:</span>
                  {[
                    { id: 'all', label: 'Все регионы' },
                    { id: 'Россия', label: '🇷🇺 Россия' },
                    { id: 'Чехия', label: '🇨🇿 Чехия' },
                    { id: 'Германия', label: '🇩🇪 Германия' },
                    { id: 'США', label: '🇺🇸 США' }
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setCatalogRegionFilter(r.id)}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                        catalogRegionFilter === r.id
                          ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                          : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Фильтры и раздел "Другое" для дрожжей */}
            {catalogTab === 'yeast' && (
              <div className="space-y-3 pb-1 border-b border-amber-200/40 dark:border-stone-800">
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {[
                    { id: 'all', label: 'Все дрожжи' },
                    { id: 'mangrove', label: "🇳🇿 Mangrove Jack's (все виды)" },
                    { id: 'fermentis', label: '🇫🇷 Fermentis' },
                    { id: 'lallemand', label: '🇨🇦 Lallemand' },
                    { id: 'custom', label: '✍️ Другое (Внести свое название)' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setYeastLabFilter(f.id as any)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        yeastLabFilter === f.id
                          ? 'bg-purple-600 text-white font-bold shadow-xs'
                          : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Блок ручного внесения своих дрожжей (Раздел «Другое») */}
                {(yeastLabFilter === 'custom' || yeastLabFilter === 'all') && (
                  <div className="p-3 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>Раздел «Другое» — внести свое название дрожжей:</span>
                      </div>
                      <span className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold">Любой штамм или домашняя культура</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Название дрожжей (напр., Danstar Windsor, Omega OYL-052)..."
                          value={customYeastName}
                          onChange={(e) => setCustomYeastName(e.target.value)}
                          className="w-full bg-white dark:bg-stone-900 border border-purple-300 dark:border-purple-700 rounded-xl px-3 py-1.5 font-bold text-xs"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Производитель / Лаб (опционально)"
                          value={customYeastLab}
                          onChange={(e) => setCustomYeastLab(e.target.value)}
                          className="w-full bg-white dark:bg-stone-900 border border-purple-300 dark:border-purple-700 rounded-xl px-3 py-1.5 text-xs"
                        />
                      </div>
                      <div className="flex gap-1">
                        <select
                          value={customYeastAmount}
                          onChange={(e) => setCustomYeastAmount(Number(e.target.value))}
                          className="w-16 bg-white dark:bg-stone-900 border border-purple-300 dark:border-purple-700 rounded-xl px-2 py-1.5 text-xs font-bold"
                        >
                          <option value={1}>1 шт</option>
                          <option value={2}>2 шт</option>
                          <option value={3}>3 шт</option>
                          <option value={5}>5 шт</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            if (!customYeastName.trim()) return;
                            const fullName = customYeastLab.trim() ? `${customYeastName.trim()} (${customYeastLab.trim()})` : customYeastName.trim();
                            addCatalogItem(fullName, 'yeast', customYeastAmount, 'pack');
                            setCustomYeastName('');
                            setCustomYeastLab('');
                          }}
                          disabled={!customYeastName.trim()}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs disabled:opacity-40 transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          + Добавить на склад
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Список ингредиентов для быстрого добавления в 1 клик */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">
              {catalogTab === 'grain' &&
                COMMON_GRAINS
                  .filter(g => {
                    const matchSearch = g.name.toLowerCase().includes(catalogSearch.toLowerCase());
                    if (!matchSearch) return false;
                    if (grainGroupFilter === 'kursk' && g.group !== 'Курский солод') return false;
                    if (grainGroupFilter === 'base' && (g.type !== 'base' || g.group === 'Курский солод')) return false;
                    if (grainGroupFilter === 'caramel' && g.type !== 'caramel') return false;
                    if (grainGroupFilter === 'roasted' && g.type !== 'roasted') return false;
                    if (grainGroupFilter === 'adjunct' && !(g.group === 'Хлопья' || g.type === 'adjunct' || g.type === 'wheat')) return false;

                    if (catalogEbcFilter === 'light' && g.colorEbc > 15) return false;
                    if (catalogEbcFilter === 'amber' && (g.colorEbc <= 15 || g.colorEbc > 80)) return false;
                    if (catalogEbcFilter === 'dark' && (g.colorEbc <= 80 || g.colorEbc > 300)) return false;
                    if (catalogEbcFilter === 'roasted' && g.colorEbc <= 300) return false;
                    return true;
                  })
                  .map(grain => {
                  const currentAmount = getPantryAmount(grain.name, 'grain');
                  const inPantry = currentAmount > 0;
                  const itemKey = `grain_${grain.name}`;
                  return (
                    <div
                      key={grain.name}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                        inPantry
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 shadow-xs'
                          : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-amber-400'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className={`text-[10px] font-bold ${grain.group === 'Курский солод' ? 'text-amber-800 dark:text-amber-300' : 'text-stone-500'}`}>{grain.group}</span>
                          {inPantry && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-mono font-bold">
                              {currentAmount} кг
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-xs text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug break-words mt-0.5 min-h-[2rem]" title={grain.name}>
                          {grain.name}
                        </div>
                        <div className="text-[10px] text-stone-500 font-mono flex items-center gap-1.5 mt-0.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-stone-300 dark:border-stone-600 inline-block shrink-0"
                            style={{ backgroundColor: ebcToHex(grain.colorEbc) }}
                          />
                          <span>{grain.colorEbc} EBC</span>
                        </div>
                      </div>

                      {/* Индивидуальный ввод количества пользователем для конкретного солода */}
                      <div className="mt-2 pt-1.5 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center gap-1">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder={inPantry ? String(currentAmount) : 'кг'}
                            value={catalogInputValues[itemKey] ?? (inPantry ? String(currentAmount) : '')}
                            onChange={(e) => {
                              const v = e.target.value;
                              setCatalogInputValues(prev => ({ ...prev, [itemKey]: v }));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const valStr = catalogInputValues[itemKey] ?? (inPantry ? String(currentAmount) : '0');
                                const val = parseFloat(valStr) || 0;
                                setCatalogItemAmount(grain.name, 'grain', val, 'kg');
                              }
                            }}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg px-1.5 py-1 text-xs font-mono font-bold text-stone-900 dark:text-stone-100 pr-5 focus:outline-none focus:ring-1 focus:ring-amber-500 text-center"
                          />
                          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-stone-400 font-mono pointer-events-none">
                            кг
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const valStr = catalogInputValues[itemKey] ?? (inPantry ? String(currentAmount) : '0');
                            const val = parseFloat(valStr) || 0;
                            setCatalogItemAmount(grain.name, 'grain', val, 'kg');
                          }}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all shadow-2xs shrink-0 cursor-pointer ${
                            inPantry
                              ? 'bg-amber-600 hover:bg-amber-700 text-white'
                              : 'bg-amber-500 hover:bg-amber-600 text-white'
                          }`}
                          title="Записать точный остаток именно этого солода"
                        >
                          {inPantry ? 'Задать' : '+ Склад'}
                        </button>
                      </div>
                    </div>
                  );
                })}

              {catalogTab === 'hop' &&
                COMMON_HOPS
                  .filter(h => {
                    const matchSearch =
                      h.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                      (h.profile && h.profile.toLowerCase().includes(catalogSearch.toLowerCase()));
                    if (!matchSearch) return false;

                    if (catalogAlphaFilter === 'aroma' && h.alphaAcid > 5.5) return false;
                    if (catalogAlphaFilter === 'balanced' && (h.alphaAcid <= 5.5 || h.alphaAcid > 9.5)) return false;
                    if (catalogAlphaFilter === 'bitter' && h.alphaAcid <= 9.5) return false;

                    if (catalogRegionFilter !== 'all' && h.region !== catalogRegionFilter) return false;
                    return true;
                  })
                  .map(hop => {
                  const currentAmount = getPantryAmount(hop.name, 'hop');
                  const inPantry = currentAmount > 0;
                  const itemKey = `hop_${hop.name}`;
                  return (
                    <div
                      key={hop.name}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                        inPantry
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 shadow-xs'
                          : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-amber-400'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{hop.region}</span>
                          {inPantry && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-mono font-bold">
                              {currentAmount} г
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-xs text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug break-words mt-0.5 min-h-[2rem]" title={hop.name}>
                          {hop.name}
                        </div>
                        <div className="text-[10px] text-stone-500 font-mono">
                          α {hop.alphaAcid}%
                        </div>
                      </div>

                      {/* Индивидуальный ввод граммов для конкретного хмеля */}
                      <div className="mt-2 pt-1.5 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center gap-1">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            placeholder={inPantry ? String(currentAmount) : 'г'}
                            value={catalogInputValues[itemKey] ?? (inPantry ? String(currentAmount) : '')}
                            onChange={(e) => {
                              const v = e.target.value;
                              setCatalogInputValues(prev => ({ ...prev, [itemKey]: v }));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const valStr = catalogInputValues[itemKey] ?? (inPantry ? String(currentAmount) : '0');
                                const val = parseFloat(valStr) || 0;
                                setCatalogItemAmount(hop.name, 'hop', val, 'g');
                              }
                            }}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg px-1.5 py-1 text-xs font-mono font-bold text-stone-900 dark:text-stone-100 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center"
                          />
                          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-stone-400 font-mono pointer-events-none">
                            г
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const valStr = catalogInputValues[itemKey] ?? (inPantry ? String(currentAmount) : '0');
                            const val = parseFloat(valStr) || 0;
                            setCatalogItemAmount(hop.name, 'hop', val, 'g');
                          }}
                          className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
                          title="Записать точный остаток именно этого хмеля"
                        >
                          {inPantry ? 'Задать' : '+ Склад'}
                        </button>
                      </div>
                    </div>
                  );
                })}

              {catalogTab === 'yeast' &&
                COMMON_YEASTS
                  .filter(y => {
                    const matchSearch = y.name.toLowerCase().includes(catalogSearch.toLowerCase()) || y.lab.toLowerCase().includes(catalogSearch.toLowerCase());
                    if (!matchSearch) return false;
                    if (yeastLabFilter === 'mangrove') return y.lab === "Mangrove Jack's";
                    if (yeastLabFilter === 'fermentis') return y.lab === 'Fermentis';
                    if (yeastLabFilter === 'lallemand') return y.lab === 'Lallemand';
                    return true;
                  })
                  .map(yeast => {
                  const currentAmount = getPantryAmount(yeast.name, 'yeast');
                  const inPantry = currentAmount > 0;
                  const itemKey = `yeast_${yeast.name}`;
                  return (
                    <div
                      key={yeast.name}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                        inPantry
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 shadow-xs'
                          : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-amber-400'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className={`text-[10px] font-bold ${yeast.lab === "Mangrove Jack's" ? 'text-indigo-600 dark:text-indigo-400' : 'text-purple-600 dark:text-purple-400'}`}>{yeast.lab}</span>
                          {inPantry && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-mono font-bold">
                              {currentAmount} шт
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-xs text-stone-900 dark:text-stone-100 line-clamp-1 mt-0.5">
                          {yeast.name}
                        </div>
                        <div className="text-[10px] text-stone-500 line-clamp-1">
                          {yeast.type === 'ale' ? 'Эль' : yeast.type === 'lager' ? 'Лагер' : yeast.type === 'wheat' ? 'Пшеничные' : 'Бельгия'} • {yeast.attenuationPercent}%
                        </div>
                      </div>

                      {/* Индивидуальный ввод пачек для конкретных дрожжей */}
                      <div className="mt-2 pt-1.5 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center gap-1">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            placeholder={inPantry ? String(currentAmount) : 'пач'}
                            value={catalogInputValues[itemKey] ?? (inPantry ? String(currentAmount) : '')}
                            onChange={(e) => {
                              const v = e.target.value;
                              setCatalogInputValues(prev => ({ ...prev, [itemKey]: v }));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const valStr = catalogInputValues[itemKey] ?? (inPantry ? String(currentAmount) : '0');
                                const val = parseFloat(valStr) || 0;
                                setCatalogItemAmount(yeast.name, 'yeast', val, 'pack');
                              }
                            }}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg px-1.5 py-1 text-xs font-mono font-bold text-stone-900 dark:text-stone-100 pr-6 focus:outline-none focus:ring-1 focus:ring-purple-500 text-center"
                          />
                          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-stone-400 font-mono pointer-events-none">
                            шт
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const valStr = catalogInputValues[itemKey] ?? (inPantry ? String(currentAmount) : '0');
                            const val = parseFloat(valStr) || 0;
                            setCatalogItemAmount(yeast.name, 'yeast', val, 'pack');
                          }}
                          className="px-2 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
                          title="Записать точный остаток именно этих дрожжей"
                        >
                          {inPantry ? 'Задать' : '+ Склад'}
                        </button>
                      </div>
                    </div>
                  );
                })}

              {catalogTab === 'misc' &&
                [
                  { name: 'Декстроза (глюкоза)', defaultAmount: 1000, unit: 'g' as const, desc: 'Для карбонизации' },
                  { name: 'Лактоза (молочный сахар)', defaultAmount: 500, unit: 'g' as const, desc: 'Для молочных стаутов' },
                  { name: 'Ирландский мох (Whirlfloc)', defaultAmount: 50, unit: 'g' as const, desc: 'Для осветления сусла' },
                  { name: 'Кориандр (семена)', defaultAmount: 50, unit: 'g' as const, desc: 'Для витбиров и бланша' }
                ].map(item => {
                  const currentAmount = getPantryAmount(item.name, 'misc');
                  const inPantry = currentAmount > 0;
                  const itemKey = `misc_${item.name}`;
                  return (
                    <div
                      key={item.name}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                        inPantry
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 shadow-xs'
                          : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-amber-400'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-stone-500 font-semibold">{item.desc}</span>
                          {inPantry && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-mono font-bold">
                              {currentAmount} {item.unit}
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-xs text-stone-900 dark:text-stone-100 line-clamp-1 mt-0.5">
                          {item.name}
                        </div>
                      </div>

                      {/* Индивидуальный ввод для добавки */}
                      <div className="mt-2 pt-1.5 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center gap-1">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            placeholder={inPantry ? String(currentAmount) : item.unit}
                            value={catalogInputValues[itemKey] ?? (inPantry ? String(currentAmount) : '')}
                            onChange={(e) => {
                              const v = e.target.value;
                              setCatalogInputValues(prev => ({ ...prev, [itemKey]: v }));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const valStr = catalogInputValues[itemKey] ?? (inPantry ? String(currentAmount) : '0');
                                const val = parseFloat(valStr) || 0;
                                setCatalogItemAmount(item.name, 'misc', val, item.unit);
                              }
                            }}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg px-1.5 py-1 text-xs font-mono font-bold text-stone-900 dark:text-stone-100 pr-5 focus:outline-none focus:ring-1 focus:ring-amber-500 text-center"
                          />
                          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-stone-400 font-mono pointer-events-none">
                            {item.unit}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const valStr = catalogInputValues[itemKey] ?? (inPantry ? String(currentAmount) : '0');
                            const val = parseFloat(valStr) || 0;
                            setCatalogItemAmount(item.name, 'misc', val, item.unit);
                          }}
                          className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
                        >
                          {inPantry ? 'Задать' : '+ Склад'}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Панель поиска, фильтрации и подбора аналогов под рецепт на складе */}
        {inventory.length > 0 && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 dark:bg-stone-850/80 border border-stone-200 dark:border-stone-800 space-y-3">
            {/* Строка 1: Поиск и селектор аналогов под рецепт */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Поиск на складе по названию, EBC, α-кислотности, типу или заметке..."
                  value={pantrySearch}
                  onChange={(e) => setPantrySearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
                />
                {pantrySearch && (
                  <button
                    type="button"
                    onClick={() => setPantrySearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Выбор рецепта для сопоставления и аналогов */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-1.5 shadow-2xs">
                  <Target className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300 shrink-0">Аналоги под рецепт:</span>
                  <select
                    value={pantryAnalogRecipeId}
                    onChange={(e) => {
                      setPantryAnalogRecipeId(e.target.value);
                      if (e.target.value === 'none') setShowRecipeAnalogsOnly(false);
                    }}
                    className="bg-transparent text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none max-w-[180px] sm:max-w-[220px] truncate cursor-pointer"
                  >
                    <option value="none">-- Выберите рецепт --</option>
                    {recipes.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.style})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedAnalogRecipe && (
                  <button
                    type="button"
                    onClick={() => setShowRecipeAnalogsOnly(!showRecipeAnalogsOnly)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      showRecipeAnalogsOnly
                        ? 'bg-amber-500 text-white'
                        : 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 hover:bg-amber-50'
                    }`}
                    title="Оставить на складе только точные ингредиенты и подходящие аналоги выбранного рецепта"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{showRecipeAnalogsOnly ? 'Только для рецепта (вкл)' : 'Только для рецепта'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Строка 2: Категории и статус запасов */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-200/50 dark:border-stone-800">
              {/* Табы категорий склада */}
              <div className="flex flex-wrap gap-1 text-xs font-semibold">
                {[
                  { id: 'all', label: `Все (${pantryCategoryCounts.all})` },
                  { id: 'grain', label: `🌾 Солод (${pantryCategoryCounts.grain})` },
                  { id: 'hop', label: `🌿 Хмель (${pantryCategoryCounts.hop})` },
                  { id: 'yeast', label: `🧪 Дрожжи (${pantryCategoryCounts.yeast})` },
                  { id: 'misc', label: `✨ Разное (${pantryCategoryCounts.misc})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPantryCategory(tab.id as any)}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      pantryCategory === tab.id
                        ? 'bg-amber-500 text-white shadow-2xs font-bold'
                        : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:bg-stone-100 border border-stone-200/70 dark:border-stone-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Фильтр наличия на складе */}
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-stone-400 font-medium hidden sm:inline">Остаток:</span>
                {[
                  { id: 'all', label: 'Все' },
                  { id: 'in_stock', label: 'В наличии (>0)' },
                  { id: 'low_stock', label: '⚠️ Заканчивается' },
                  { id: 'zero_stock', label: 'Пусто (0)' }
                ].map(st => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setPantryStockStatus(st.id as any)}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                      pantryStockStatus === st.id
                        ? 'bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 shadow-2xs font-bold'
                        : 'bg-white/80 dark:bg-stone-900 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Строка 3: Фильтры по характеристикам (EBC солода и Альфа-кислотность хмеля) */}
            {(pantryCategory === 'all' || pantryCategory === 'grain' || pantryCategory === 'hop') && (
              <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-stone-200/40 dark:border-stone-800 text-[11px]">
                {/* EBC для солода */}
                {(pantryCategory === 'all' || pantryCategory === 'grain') && (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="font-bold text-amber-700 dark:text-amber-400">Цветность EBC:</span>
                    {[
                      { id: 'all', label: 'Все EBC' },
                      { id: 'light', label: '🌾 Светлые (<15)' },
                      { id: 'amber', label: '🍯 Янтарные (15–80)' },
                      { id: 'dark', label: '🌰 Тёмные (80–300)' },
                      { id: 'roasted', label: '☕ Жжёные (>300)' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setPantryEbcFilter(f.id as any)}
                        className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                          pantryEbcFilter === f.id
                            ? 'bg-amber-600 text-white font-bold shadow-2xs'
                            : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:bg-stone-100 border border-stone-200/60 dark:border-stone-700'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Альфа-кислотность для хмеля */}
                {(pantryCategory === 'all' || pantryCategory === 'hop') && (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Горечь α:</span>
                    {[
                      { id: 'all', label: 'Все % α' },
                      { id: 'aroma', label: '🌸 Тонкоаромат (<6%)' },
                      { id: 'balanced', label: '⚖️ Баланс (6–10%)' },
                      { id: 'bitter', label: '🔥 Горькие (>10%)' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setPantryAlphaFilter(f.id as any)}
                        className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                          pantryAlphaFilter === f.id
                            ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                            : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:bg-stone-100 border border-stone-200/60 dark:border-stone-700'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Строка активных фильтров и сброса */}
            {hasActivePantryFilters && (
              <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                <div>
                  Отобрано позиций: <span className="font-black text-amber-600 dark:text-amber-400">{filteredPantry.length}</span> из {inventory.length}
                  {selectedAnalogRecipe && (
                    <span className="ml-2 text-stone-600 dark:text-stone-300 font-semibold">
                      (для рецепта: {selectedAnalogRecipe.name})
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={resetPantryFilters}
                  className="text-amber-600 hover:text-amber-700 dark:text-amber-400 font-bold underline cursor-pointer text-[11px]"
                >
                  Сбросить фильтры
                </button>
              </div>
            )}
          </div>
        )}

        {/* Сетка текущих запасов пользователя */}
        {inventory.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 space-y-3">
            <Package className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
            <div className="text-sm font-bold text-stone-700 dark:text-stone-300">
              Ваш склад пока пуст
            </div>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Нажмите кнопку <b>«Типовой набор»</b> для быстрой загрузки стандартного набора пивовара или откройте <b>«Каталог ингредиентов»</b>, чтобы добавить имеющиеся солод, хмель и дрожжи.
            </p>
            <button
              onClick={handleLoadStarterPack}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Загрузить типовой набор пивовара</span>
            </button>
          </div>
        ) : filteredPantry.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 space-y-2">
            <Filter className="w-8 h-8 text-stone-400 mx-auto" />
            <div className="text-sm font-bold text-stone-700 dark:text-stone-300">
              По заданным критериям ничего не найдено
            </div>
            <p className="text-xs text-stone-500">
              Попробуйте изменить поисковый запрос, сбросить фильтры EBC / α-кислотности или выбрать другой рецепт для подбора аналогов.
            </p>
            <button
              type="button"
              onClick={resetPantryFilters}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Сбросить все фильтры
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-w-full overflow-hidden">
            {filteredPantry.map(item => {
              const details = resolveInventoryCharacteristics(item);
              const freshness =
                item.category === 'hop' || item.category === 'yeast'
                  ? evaluateIngredientFreshness(item)
                  : null;
              const matchInfo = selectedAnalogRecipe
                ? checkRecipeIngredientMatch(item, selectedAnalogRecipe, scaleRatioForRecipe)
                : null;

              return (
                <div
                  key={item.id}
                  id={`inv-item-${item.id}`}
                  className={`p-3 rounded-xl border flex flex-col justify-between group transition-all shadow-2xs min-w-0 max-w-full overflow-hidden ${
                    matchInfo?.isDirectMatch
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-600 ring-1 ring-emerald-500/50'
                      : matchInfo?.isAnalogMatch
                      ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600 ring-1 ring-amber-500/50'
                      : 'bg-stone-50 dark:bg-stone-800/80 border-stone-200/80 dark:border-stone-700/80 hover:border-amber-400'
                  }`}
                >
                  <div className="min-w-0">
                    {/* Заголовок карточки: категория, признак нехватки, кнопка удаления */}
                    <div className="flex justify-between items-start gap-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className={`text-[10px] font-bold uppercase tracking-wider truncate ${
                          item.category === 'grain' ? 'text-amber-600 dark:text-amber-400' :
                          item.category === 'hop' ? 'text-emerald-600 dark:text-emerald-400' :
                          item.category === 'yeast' ? 'text-purple-600 dark:text-purple-400' : 'text-stone-500'
                        }`}>
                          {item.category === 'grain' ? '🌾 Солод' : item.category === 'hop' ? '🌿 Хмель' : item.category === 'yeast' ? '🧪 Дрожжи' : '✨ Добавка'}
                        </span>
                        {details.isLowStock && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 font-bold shrink-0">
                            ⚠️ Мало
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeInventoryItem(item.id)}
                        className="text-stone-300 hover:text-red-500 transition-colors shrink-0 p-0.5 cursor-pointer"
                        title="Удалить со склада"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Название ингредиента */}
                    <div className="font-bold text-xs text-stone-900 dark:text-stone-100 line-clamp-2 mt-1 break-words" title={item.name}>
                      {item.name}
                    </div>

                    {/* Блок характеристик ингредиента */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[10px]">
                      {item.category === 'grain' && details.colorEbc !== undefined && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-700 font-mono font-bold text-stone-700 dark:text-stone-300">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-stone-400/40 inline-block shrink-0"
                            style={{ backgroundColor: ebcToHex(details.colorEbc) }}
                          />
                          <span>{details.colorEbc} EBC</span>
                        </span>
                      )}

                      {item.category === 'grain' && details.type && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold text-[10px]">
                          {details.type === 'base' ? 'Базовый' : details.type === 'caramel' ? 'Карамельный' : details.type === 'roasted' ? 'Жженый' : 'Спец.'}
                        </span>
                      )}

                      {item.category === 'hop' && details.alphaAcid !== undefined && (
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-mono font-bold ${
                          details.alphaCategory === 'aroma'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : details.alphaCategory === 'balanced'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}>
                          α {details.alphaAcid}%
                        </span>
                      )}

                      {item.category === 'hop' && details.region && (
                        <span className="text-[10px] text-stone-500 font-medium">
                          {details.region}
                        </span>
                      )}

                      {item.category === 'yeast' && (
                        <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                          {details.lab || 'Дрожжи'} {details.attenuation ? `• ${details.attenuation}% сбраж.` : ''}
                        </span>
                      )}

                      {freshness && freshness.status !== 'unknown' && (
                        <span
                          title={freshness.detail}
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold text-[10px] ${
                            freshness.status === 'fresh'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : freshness.status === 'warning'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                          }`}
                        >
                          <span>
                            {freshness.status === 'fresh'
                              ? '🟢'
                              : freshness.status === 'warning'
                              ? '🟡'
                              : '🔴'}
                          </span>
                          <span>
                            {freshness.effectiveAlpha !== undefined && freshness.status !== 'fresh'
                              ? `α≈${freshness.effectiveAlpha}%`
                              : freshness.label}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Информация по аналогу или вхождению в выбранный рецепт */}
                    {selectedAnalogRecipe && matchInfo ? (
                      <div className="mt-2 pt-1.5 border-t border-stone-200/50 dark:border-stone-700/50">
                        {matchInfo.isDirectMatch ? (
                          <div className="px-2 py-1 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-[10px] text-emerald-900 dark:text-emerald-200 font-bold">
                            ✓ В рецепте: {matchInfo.requiredAmount} {matchInfo.unit}
                            <span className="block text-[9px] font-medium mt-0.5">
                              {matchInfo.isStockSufficient ? 'Хватает на складе' : `Не хватает ${(matchInfo.requiredAmount! - item.amount).toFixed(1)} ${matchInfo.unit}`}
                            </span>
                          </div>
                        ) : matchInfo.isAnalogMatch ? (
                          <div className="px-2 py-1 rounded-lg bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-[10px] text-amber-900 dark:text-amber-200 font-bold">
                            ⭐ Аналог для {matchInfo.matchedRecipeItemName}
                            <span className="block text-[9px] font-normal text-amber-800 dark:text-amber-300 mt-0.5">
                              {matchInfo.analogReason}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      details.analogs.length > 0 && (
                        <div className="mt-1.5 pt-1 border-t border-stone-200/40 dark:border-stone-700/40 text-[10px] text-stone-500 line-clamp-1" title={details.analogs.join(', ')}>
                          <span className="font-bold text-stone-600 dark:text-stone-400">Аналоги: </span>
                          {details.analogs.slice(0, 2).join(', ')}
                        </div>
                      )
                    )}
                  </div>

                  {/* Блок управления остатком */}
                  <div className="mt-2.5 pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-stone-500 shrink-0">Остаток:</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <input
                          type="number"
                          step={item.unit === 'kg' ? '0.1' : '1'}
                          min="0"
                          value={item.amount}
                          onChange={(e) => updateInventoryAmount(item.id, parseFloat(e.target.value) || 0)}
                          className="w-16 sm:w-20 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg px-1.5 py-1 text-xs font-mono font-bold text-stone-900 dark:text-stone-100 text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                          title="Введите точное значение остатка для этого ингредиента"
                        />
                        <span className="text-xs text-stone-600 dark:text-stone-300 font-mono font-bold">{item.unit}</span>
                      </div>
                    </div>

                    {/* Быстрые кнопки корректировки (+/-) */}
                    <div className="flex items-center justify-end gap-1 mt-1.5">
                      {item.category === 'grain' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => adjustInventoryAmount(item.id, -1)}
                            className="px-1.5 py-0.5 rounded bg-stone-200/70 dark:bg-stone-700 hover:bg-stone-300 text-[10px] font-mono font-bold text-stone-700 dark:text-stone-300 cursor-pointer"
                            title="Уменьшить на 1 кг"
                          >
                            -1кг
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustInventoryAmount(item.id, 1)}
                            className="px-1.5 py-0.5 rounded bg-stone-200/70 dark:bg-stone-700 hover:bg-stone-300 text-[10px] font-mono font-bold text-stone-700 dark:text-stone-300 cursor-pointer"
                            title="Добавить 1 кг"
                          >
                            +1кг
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustInventoryAmount(item.id, 5)}
                            className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 hover:bg-amber-500/30 text-[10px] font-mono font-bold cursor-pointer"
                            title="Добавить мешок 5 кг"
                          >
                            +5кг
                          </button>
                        </>
                      ) : item.category === 'hop' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => adjustInventoryAmount(item.id, -25)}
                            className="px-1.5 py-0.5 rounded bg-stone-200/70 dark:bg-stone-700 hover:bg-stone-300 text-[10px] font-mono font-bold text-stone-700 dark:text-stone-300 cursor-pointer"
                            title="Уменьшить на 25 г"
                          >
                            -25г
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustInventoryAmount(item.id, 25)}
                            className="px-1.5 py-0.5 rounded bg-stone-200/70 dark:bg-stone-700 hover:bg-stone-300 text-[10px] font-mono font-bold text-stone-700 dark:text-stone-300 cursor-pointer"
                            title="Добавить 25 г"
                          >
                            +25г
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustInventoryAmount(item.id, 50)}
                            className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-mono font-bold cursor-pointer"
                            title="Добавить пачку 50 г"
                          >
                            +50г
                          </button>
                        </>
                      ) : item.category === 'yeast' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => adjustInventoryAmount(item.id, -1)}
                            className="px-1.5 py-0.5 rounded bg-stone-200/70 dark:bg-stone-700 hover:bg-stone-300 text-[10px] font-mono font-bold text-stone-700 dark:text-stone-300 cursor-pointer"
                            title="Уменьшить на 1 пачку"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustInventoryAmount(item.id, 1)}
                            className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-800 dark:text-purple-300 hover:bg-purple-500/30 text-[10px] font-mono font-bold cursor-pointer"
                            title="Добавить 1 пачку"
                          >
                            +1 шт
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => adjustInventoryAmount(item.id, -50)}
                            className="px-1.5 py-0.5 rounded bg-stone-200/70 dark:bg-stone-700 hover:bg-stone-300 text-[10px] font-mono font-bold text-stone-700 dark:text-stone-300 cursor-pointer"
                          >
                            -50
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustInventoryAmount(item.id, 50)}
                            className="px-1.5 py-0.5 rounded bg-stone-200/70 dark:bg-stone-700 hover:bg-stone-300 text-[10px] font-mono font-bold text-stone-700 dark:text-stone-300 cursor-pointer"
                          >
                            +50
                          </button>
                        </>
                      )}
                    </div>

                    {/* Цена за единицу и контроль свежести */}
                    <div className="mt-2 pt-2 border-t border-stone-200/50 dark:border-stone-700/50 space-y-1.5">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 shrink-0">
                          Цена:
                        </span>
                        <div className="flex items-center gap-1 min-w-0">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                            value={item.pricePerUnit && item.pricePerUnit > 0 ? item.pricePerUnit : ''}
                            onChange={(e) => {
                              const parsed = parseFloat(e.target.value);
                              updateInventoryItemFields(item.id, {
                                pricePerUnit: Number.isFinite(parsed) && parsed >= 0 ? parsed : 0,
                                currency: item.currency || 'RUB'
                              });
                            }}
                            className="w-16 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md px-1.5 py-0.5 text-[11px] font-mono font-bold text-stone-900 dark:text-stone-100 text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
                            title={`Цена за 1 ${item.unit}`}
                          />
                          <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400 shrink-0">
                            {formatCurrencySymbol(item.currency || 'RUB')}/{item.unit}
                          </span>
                        </div>
                      </div>

                      {item.category === 'hop' && (
                        <div className="flex items-center justify-between gap-1">
                          <input
                            type="number"
                            min="2018"
                            max={new Date().getFullYear() + 1}
                            placeholder="Урожай"
                            value={item.harvestYear ?? ''}
                            onChange={(e) => {
                              const year = parseInt(e.target.value, 10);
                              updateInventoryItemFields(item.id, {
                                harvestYear: Number.isFinite(year) ? year : undefined
                              });
                            }}
                            className="w-16 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md px-1.5 py-0.5 text-[10px] font-mono text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            title="Год урожая хмеля для расчёта деградации α-кислот"
                          />
                          <select
                            value={item.storageType || 'fridge'}
                            onChange={(e) =>
                              updateInventoryItemFields(item.id, {
                                storageType: e.target.value as HopStorageType
                              })
                            }
                            className="flex-1 min-w-0 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md px-1 py-0.5 text-[10px] text-stone-700 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            title="Условия хранения хмеля"
                          >
                            <option value="freezer">Мороз. -18°C</option>
                            <option value="fridge">Холод. +4°C</option>
                            <option value="room">Комн. +20°C</option>
                          </select>
                        </div>
                      )}

                      {item.category === 'yeast' && (
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 shrink-0">
                            Выпуск:
                          </span>
                          <input
                            type="date"
                            value={item.productionDate ?? ''}
                            onChange={(e) =>
                              updateInventoryItemFields(item.id, {
                                productionDate: e.target.value || undefined
                              })
                            }
                            className="flex-1 min-w-0 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md px-1 py-0.5 text-[10px] font-mono text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            title="Дата производства дрожжей"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Быстрое добавление кастомного ингредиента с характеристиками */}
        <form onSubmit={handleAddManual} className="pt-3 border-t border-stone-200/80 dark:border-stone-800 space-y-2">
          <div className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
            ➕ Добавить свой ингредиент на склад с характеристиками:
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              placeholder="Название своего солода, хмеля или дрожжей..."
              value={newInvName}
              onChange={(e) => setNewInvName(e.target.value)}
              className="flex-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
            />
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={newInvCategory}
                onChange={(e) => {
                  const cat = e.target.value as any;
                  setNewInvCategory(cat);
                  if (cat === 'grain') setNewInvUnit('kg');
                  else if (cat === 'hop') setNewInvUnit('g');
                  else if (cat === 'yeast') setNewInvUnit('pack');
                }}
                className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
              >
                <option value="grain">🌾 Солод (кг)</option>
                <option value="hop">🌿 Хмель (г)</option>
                <option value="yeast">🧪 Дрожжи (пач)</option>
                <option value="misc">🍯 Разное</option>
              </select>

              {/* Поле EBC для солода */}
              {newInvCategory === 'grain' && (
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    placeholder="EBC"
                    value={newInvEbc}
                    onChange={(e) => setNewInvEbc(e.target.value ? parseFloat(e.target.value) : '')}
                    className="w-20 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-2 py-2 text-xs font-mono font-bold text-center text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    title="Цветность EBC солода (например: 4, 150, 900)"
                  />
                  <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-stone-400 font-mono pointer-events-none">
                    EBC
                  </span>
                </div>
              )}

              {/* Поле альфа-кислотности для хмеля */}
              {newInvCategory === 'hop' && (
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="30"
                    placeholder="α %"
                    value={newInvAlpha}
                    onChange={(e) => setNewInvAlpha(e.target.value ? parseFloat(e.target.value) : '')}
                    className="w-20 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-2 py-2 text-xs font-mono font-bold text-center text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    title="Альфа-кислотность хмеля % (например: 4.5, 12.0)"
                  />
                  <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-stone-400 font-mono pointer-events-none">
                    %
                  </span>
                </div>
              )}

              <input
                type="number"
                step={newInvUnit === 'kg' ? '0.1' : '1'}
                min="0.1"
                value={newInvAmount}
                onChange={(e) => setNewInvAmount(parseFloat(e.target.value) || 1)}
                className="w-20 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-2 py-2 text-xs font-mono font-bold text-center text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                title="Количество"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                Добавить
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 3. Результаты подбора рецептов под остатки */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200/80 dark:border-stone-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Что можно сварить на {globalBatchSizeL} л ({filteredMatches.length} из {recipes.length} рецептов)</span>
            </h2>
            <p className="text-xs text-stone-500">
              Сгруппировано по наличию: рецепты, которые можно варить прямо сейчас, и те, куда нужно добавить 1-2 ингредиента
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {aggregatedShoppingList.length > 0 && (
              <button
                onClick={() => setShowShoppingModal(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Список покупок ({aggregatedShoppingList.length})</span>
              </button>
            )}

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Поиск по названию или хмелю..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
            >
              <option value="all">Все категории BJCP</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Табы групп доступности */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => {
              setHasManuallySelectedTab(true);
              setMatchViewTab('100_percent');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              effectiveTab === '100_percent'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Можно сварить прямо сейчас ({fullMatchCount})</span>
          </button>

          <button
            onClick={() => {
              setHasManuallySelectedTab(true);
              setMatchViewTab('missing_1');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              effectiveTab === 'missing_1'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Не хватает 1 ингредиента ({missing1Count})</span>
          </button>

          <button
            onClick={() => {
              setHasManuallySelectedTab(true);
              setMatchViewTab('missing_2');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              effectiveTab === 'missing_2'
                ? 'bg-stone-700 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            <span>Не хватает 2 ингредиентов ({missing2Count})</span>
          </button>

          <button
            onClick={() => {
              setHasManuallySelectedTab(true);
              setMatchViewTab('all');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              effectiveTab === 'all'
                ? 'bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950 shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            Все рецепты ({matchResults.length})
          </button>
        </div>

        {/* Сетка подобранных рецептов */}
        {filteredMatches.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 space-y-3">
            <Beer className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
            <div className="text-sm font-bold text-stone-700 dark:text-stone-300">
              {effectiveTab === '100_percent'
                ? `На объем ${globalBatchSizeL} л пока нет рецептов со 100% наличием всех ингредиентов`
                : 'По выбранным фильтрам рецептов не найдено'}
            </div>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              {effectiveTab === '100_percent' ? (
                <>
                  Переключитесь на вкладку <b>«Не хватает 1 ингредиента»</b> ({missing1Count} рецептов) — там вы увидите, что можно сварить, докупив всего один солод или хмель! Либо посмотрите все рецепты.
                </>
              ) : (
                'Попробуйте изменить поисковый запрос или категорию'
              )}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {missing1Count > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setHasManuallySelectedTab(true);
                    setMatchViewTab('missing_1');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Показать рецепты с 1 недостающим ({missing1Count})</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setHasManuallySelectedTab(true);
                  setMatchViewTab('all');
                }}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Показать все рецепты с расчетом нехватки</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 max-w-full overflow-hidden">
            {filteredMatches.map(({ recipe, scaledRecipe, matchPercentage, isFullyMatch, missingIngredients, availableIngredients, missingCount }) => {
              const hex = ebcToHex(recipe.calculated.ebc);
              return (
                <div
                  key={recipe.id}
                  className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between min-w-0 overflow-hidden ${
                    isFullyMatch
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/25 border-emerald-400 dark:border-emerald-700 shadow-sm'
                      : missingCount === 1
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 shadow-xs'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2.5 min-w-0">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl shadow-xs border border-white/40 flex items-center justify-center shrink-0"
                          style={{ backgroundColor: hex }}
                        >
                          <Beer className="w-5 h-5 text-white/90 drop-shadow" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-white leading-tight break-words" title={recipe.name}>
                            {recipe.name}
                          </h3>
                          <div className="text-xs text-stone-500 font-medium mt-0.5 truncate">
                            {recipe.style} • {recipe.category}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-black shrink-0 ${
                          isFullyMatch
                            ? 'bg-emerald-500 text-white'
                            : missingCount === 1
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300'
                            : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                        }`}>
                          {isFullyMatch ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                          <span>{isFullyMatch ? '100% В наличии' : `Не хватает ${missingCount}`}</span>
                        </span>
                      </div>
                    </div>

                    {/* Параметры партии на заданный литраж */}
                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2 my-3 p-2 sm:p-2.5 rounded-xl bg-stone-100/70 dark:bg-stone-800/60 text-center font-mono text-xs">
                      <div className="min-w-0">
                        <span className="text-[10px] text-stone-400 font-sans block truncate">НП</span>
                        <b className="truncate block">{scaledRecipe.calculated.ogSg.toFixed(3)}</b>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-stone-400 font-sans block truncate">ABV</span>
                        <b className="text-amber-600 dark:text-amber-400 truncate block">{scaledRecipe.calculated.abv}%</b>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-stone-400 font-sans block truncate">IBU</span>
                        <b className="truncate block">{scaledRecipe.calculated.ibu}</b>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-stone-400 font-sans block truncate">Объем</span>
                        <b className="text-stone-900 dark:text-white truncate block">{globalBatchSizeL} л</b>
                      </div>
                    </div>

                    {/* В наличии */}
                    {availableIngredients.length > 0 && (
                      <div className="mb-2 min-w-0">
                        <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mb-1">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>Есть в запасе ({availableIngredients.length}):</span>
                        </div>
                        <div className="text-xs text-stone-600 dark:text-stone-300 flex flex-wrap gap-1">
                          {availableIngredients.map((item, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 text-[11px] break-words">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Что докупить / добавить под желаемый объем партии */}
                    {missingIngredients.length > 0 && (
                      <div className="mt-2 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-1.5 min-w-0">
                        <div className="text-[11px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                          <ShoppingCart className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="break-words">Что необходимо добавить/докупить на {globalBatchSizeL} л ({missingIngredients.length} поз.):</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
                          {missingIngredients.map((item, idx) => (
                            <li key={idx} className="text-[11px] pb-1 border-b border-amber-200/50 dark:border-amber-900/40 last:border-0 min-w-0">
                              <div className="flex justify-between items-center gap-2 flex-wrap">
                                <span className="font-medium text-stone-800 dark:text-stone-200 break-words flex-1 min-w-[140px]">
                                  {item.name} <span className="text-stone-500 font-normal">(нужно: {item.requiredAmount} {item.unit})</span>:
                                </span>
                                <b className="text-amber-700 dark:text-amber-400 font-mono shrink-0">
                                  +{item.differenceToBuy} {item.unit}
                                </b>
                              </div>
                              {item.substituteSuggestion && (
                                <div className="mt-0.5 text-[10px] text-amber-900 dark:text-amber-300 font-medium flex items-center gap-1 bg-amber-100/70 dark:bg-amber-900/40 px-2 py-0.5 rounded break-words">
                                  <span>💡 {item.substituteSuggestion}</span>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Кнопка отправки рецепта в калькулятор с автоматическим масштабированием */}
                  <div className="pt-3 sm:pt-4 border-t border-stone-100 dark:border-stone-800 mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-stone-500 font-medium break-words">
                      <span>Засыпь: <strong className="text-stone-700 dark:text-stone-300 font-mono">{scaledRecipe.calculated.totalGrainWeightKg} кг</strong></span>
                      <span>•</span>
                      <span>
                        Дрожжи:{' '}
                        {missingIngredients.some(m => m.category === 'yeast') ? (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">
                            нужно {scaledRecipe.calculated.yeastPacksNeeded} пач. (нет на складе)
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            {scaledRecipe.calculated.yeastPacksNeeded} пач. (в наличии)
                          </span>
                        )}
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectRecipe(scaledRecipe)}
                      className={`w-full sm:w-auto px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors shrink-0 ${
                        isFullyMatch ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-500 hover:bg-amber-600'
                      }`}
                    >
                      <span>Сварить на {globalBatchSizeL} л</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Модальное окно списка покупок */}
      {showShoppingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-stone-900 p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-600" />
                <span>Список покупок ингредиентов (варка {globalBatchSizeL} л)</span>
              </h3>
              <button
                onClick={() => setShowShoppingModal(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400">
              Сводный список недостающих ингредиентов для приготовления выбранных рецептов:
            </p>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {aggregatedShoppingList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="font-semibold text-stone-900 dark:text-stone-100">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                    {item.amount} {item.unit}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={handleCopyShoppingList}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                {copySuccessToast ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copySuccessToast ? 'Скопировано!' : 'Скопировать список'}</span>
              </button>
              <button
                onClick={() => setShowShoppingModal(false)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
