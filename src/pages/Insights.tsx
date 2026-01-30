import { useState } from "react";
import { Link } from "react-router-dom";
import { useItems } from "@/hooks/useItems";
import { useCategories } from "@/hooks/useCategories";
import { useInsightsStats } from "@/hooks/useInsightsStats";
import type { InsightsFilters } from "@/hooks/useInsightsStats";
import { Card } from "@/components/Card";
import { formatPrice, CURRENCIES } from "@/utils/currency";

const DEFAULT_FILTERS: InsightsFilters = {
  categoryId: undefined,
  wantToSellOnly: false,
  priceMin: undefined,
  priceMax: undefined,
  searchText: "",
};

export function Insights() {
  const { items, loading: itemsLoading, error: itemsError } = useItems();
  const { categories, loading: categoriesLoading } = useCategories();
  const [filters, setFilters] = useState<InsightsFilters>(DEFAULT_FILTERS);

  const stats = useInsightsStats(items, categories, filters);

  const loading = itemsLoading || categoriesLoading;

  const handleReset = () => setFilters({ ...DEFAULT_FILTERS });

  const setFilter = <K extends keyof InsightsFilters>(
    key: K,
    value: InsightsFilters[K],
  ) => setFilters((prev) => ({ ...prev, [key]: value }));

  const buildItemsQuery = (categoryId?: string, wantToSell?: boolean) => {
    const params = new URLSearchParams();
    if (categoryId) params.set("categoryId", categoryId);
    if (wantToSell === true) params.set("wantToSell", "true");
    const q = params.toString();
    return q ? `/?${q}` : "/";
  };

  if (itemsError) {
    return (
      <div className="px-4 py-8 text-center text-danger">
        <p>{itemsError}</p>
      </div>
    );
  }

  const hasActiveFilters =
    filters.categoryId ||
    filters.wantToSellOnly ||
    (filters.priceMin != null && filters.priceMin > 0) ||
    (filters.priceMax != null && filters.priceMax > 0) ||
    (filters.searchText?.trim() ?? "") !== "";

  return (
    <div className="mx-auto max-w-2xl px-4 pb-6">
      <h1 className="mb-4 text-2xl font-bold text-text">Insights</h1>

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 -mx-4 mb-4 space-y-3 bg-bg px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={filters.wantToSellOnly ?? false}
              onChange={(e) => setFilter("wantToSellOnly", e.target.checked)}
              className="h-4 w-4 rounded border-gray-600 bg-bg-card text-primary touch-target"
            />
            Only for sale
          </label>
          <select
            value={filters.categoryId ?? ""}
            onChange={(e) =>
              setFilter("categoryId", e.target.value || undefined)
            }
            className="rounded-lg border border-gray-600 bg-bg-card px-3 py-2 text-sm text-text touch-target"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.icon ?? ""} {c.name}
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg bg-bg-elevated px-3 py-2 text-sm text-gray-400 touch-target hover:text-text"
            >
              Reset
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            placeholder="Search items..."
            value={filters.searchText ?? ""}
            onChange={(e) => setFilter("searchText", e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-gray-600 bg-bg-card px-3 py-2 text-sm text-text placeholder-gray-500 touch-target"
          />
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Min price"
              value={filters.priceMin ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setFilter("priceMin", v === "" ? undefined : Number(v));
              }}
              className="w-24 rounded-lg border border-gray-600 bg-bg-card px-2 py-2 text-text touch-target"
            />
            <span>–</span>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Max price"
              value={filters.priceMax ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setFilter("priceMax", v === "" ? undefined : Number(v));
              }}
              className="w-24 rounded-lg border border-gray-600 bg-bg-card px-2 py-2 text-text touch-target"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-gray-400">Loading...</p>
      ) : (
        <>
          {/* Summary cards */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card className="rounded-xl">
              <p className="mb-1 text-xs text-gray-400">Total value</p>
              <div className="flex flex-wrap gap-x-2 gap-y-0 text-lg font-bold text-text">
                {CURRENCIES.map(
                  (c) =>
                    stats.totalByCurrency[c] > 0 && (
                      <span key={c}>
                        {formatPrice(stats.totalByCurrency[c], c)}
                      </span>
                    ),
                )}
                {CURRENCIES.every((c) => stats.totalByCurrency[c] === 0) && (
                  <span className="text-gray-500">—</span>
                )}
              </div>
            </Card>
            <Card className="rounded-xl">
              <p className="mb-1 text-xs text-gray-400">Sellable value</p>
              <div className="flex flex-wrap gap-x-2 gap-y-0 text-lg font-bold text-primary">
                {CURRENCIES.map(
                  (c) =>
                    stats.sellableByCurrency[c] > 0 && (
                      <span key={c}>
                        {formatPrice(stats.sellableByCurrency[c], c)}
                      </span>
                    ),
                )}
                {CURRENCIES.every((c) => stats.sellableByCurrency[c] === 0) && (
                  <span className="text-gray-500">—</span>
                )}
              </div>
            </Card>
            <Card className="rounded-xl">
              <p className="mb-1 text-xs text-gray-400">Total items</p>
              <p className="text-2xl font-bold text-text">{stats.totalItems}</p>
            </Card>
          </div>

          {/* Category breakdown */}
          <h2 className="mb-3 text-lg font-semibold text-text">By category</h2>
          {stats.perCategory.length === 0 ? (
            <p className="text-gray-400">No items match the current filters.</p>
          ) : (
            <ul className="space-y-2">
              {stats.perCategory.map((row) => (
                <li key={row.categoryId || "__none__"}>
                  <Link
                    to={buildItemsQuery(
                      row.categoryId || undefined,
                      filters.wantToSellOnly ?? undefined,
                    )}
                    state={
                      row.categoryId
                        ? { categoryId: row.categoryId }
                        : undefined
                    }
                    className="block"
                  >
                    <Card className="flex items-center gap-3 transition-opacity active:opacity-90 touch-target">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl"
                        style={{
                          backgroundColor:
                            (categories.find((c) => c._id === row.categoryId)
                              ?.color ?? "#3b82f6") + "30",
                        }}
                      >
                        {categories.find((c) => c._id === row.categoryId)
                          ?.icon ?? "📦"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-text truncate">
                          {row.categoryName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {row.itemCount} item{row.itemCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap justify-end gap-x-2 text-sm text-primary">
                        {CURRENCIES.map(
                          (c) =>
                            row.byCurrency[c] > 0 && (
                              <span key={c}>
                                {formatPrice(row.byCurrency[c], c)}
                              </span>
                            ),
                        )}
                      </div>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
