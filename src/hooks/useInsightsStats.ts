import { useMemo } from "react";
import type { Category, Currency, Item } from "@/types";

export interface InsightsFilters {
  categoryId?: string;
  wantToSellOnly?: boolean;
  priceMin?: number;
  priceMax?: number;
  searchText?: string;
}

export interface CategoryStat {
  categoryId: string;
  categoryName: string;
  totalValue: number;
  itemCount: number;
  byCurrency: Record<Currency, number>;
}

export interface InsightsStats {
  totalValue: number;
  sellableValue: number;
  totalItems: number;
  totalByCurrency: Record<Currency, number>;
  sellableByCurrency: Record<Currency, number>;
  perCategory: CategoryStat[];
}

function emptyByCurrency(): Record<Currency, number> {
  return { USD: 0, ILS: 0, EUR: 0 };
}

function applyFilters(items: Item[], filters: InsightsFilters): Item[] {
  let result = items;
  if (filters.categoryId) {
    result = result.filter((i) => i.categoryId === filters.categoryId);
  }
  if (filters.wantToSellOnly === true) {
    result = result.filter((i) => i.wantToSell);
  }
  if (filters.priceMin != null && filters.priceMin > 0) {
    result = result.filter((i) => i.price >= filters.priceMin!);
  }
  if (filters.priceMax != null && filters.priceMax > 0) {
    result = result.filter((i) => i.price <= filters.priceMax!);
  }
  if (filters.searchText?.trim()) {
    const q = filters.searchText.trim().toLowerCase();
    result = result.filter((i) => i.name.toLowerCase().includes(q));
  }
  return result;
}

export function useInsightsStats(
  items: Item[],
  categories: Category[],
  filters: InsightsFilters,
): InsightsStats {
  return useMemo(() => {
    const filtered = applyFilters(items, filters);
    const totalItems = filtered.length;

    const totalByCurrency = emptyByCurrency();
    const sellableByCurrency = emptyByCurrency();
    let totalValue = 0;
    let sellableValue = 0;

    for (const item of filtered) {
      const cur = (item.currency ?? "ILS") as Currency;
      totalByCurrency[cur] = (totalByCurrency[cur] ?? 0) + item.price;
      totalValue += item.price;
      if (item.wantToSell) {
        sellableByCurrency[cur] = (sellableByCurrency[cur] ?? 0) + item.price;
        sellableValue += item.price;
      }
    }

    const byCategoryMap = new Map<
      string,
      { total: number; count: number; byCurrency: Record<Currency, number> }
    >();
    for (const item of filtered) {
      const cid = item.categoryId || "__none__";
      if (!byCategoryMap.has(cid)) {
        byCategoryMap.set(cid, {
          total: 0,
          count: 0,
          byCurrency: emptyByCurrency(),
        });
      }
      const row = byCategoryMap.get(cid)!;
      const cur = (item.currency ?? "ILS") as Currency;
      row.total += item.price;
      row.count += 1;
      row.byCurrency[cur] = (row.byCurrency[cur] ?? 0) + item.price;
    }

    const categoryMap = Object.fromEntries(categories.map((c) => [c._id, c]));
    const perCategory: CategoryStat[] = Array.from(byCategoryMap.entries()).map(
      ([categoryId, row]) => ({
        categoryId: categoryId === "__none__" ? "" : categoryId,
        categoryName:
          categoryId === "__none__"
            ? "Uncategorized"
            : (categoryMap[categoryId]?.name ?? "Uncategorized"),
        totalValue: row.total,
        itemCount: row.count,
        byCurrency: row.byCurrency,
      }),
    );
    perCategory.sort((a, b) => b.totalValue - a.totalValue);

    return {
      totalValue,
      sellableValue,
      totalItems,
      totalByCurrency,
      sellableByCurrency,
      perCategory,
    };
  }, [
    items,
    categories,
    filters.categoryId,
    filters.wantToSellOnly,
    filters.priceMin,
    filters.priceMax,
    filters.searchText,
  ]);
}
