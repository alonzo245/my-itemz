import { useState } from 'react';
import { useStats } from '@/hooks/useStats';
import { Card } from '@/components/Card';
import { formatPrice } from '@/utils/currency';
import type { Currency } from '@/types';

const CURRENCIES: Currency[] = ['USD', 'ILS', 'EUR'];

export function Statistics() {
  const [wantToSellOnly, setWantToSellOnly] = useState(false);
  const [view, setView] = useState<'list' | 'bars'>('list');
  const { stats, loading, error } = useStats(wantToSellOnly);

  if (error) {
    return (
      <div className="px-4 py-8 text-center text-danger">
        <p>{error}</p>
      </div>
    );
  }

  const totalByCurrency = stats?.totalByCurrency ?? { USD: 0, ILS: 0, EUR: 0 };
  const perCategory = stats?.valuePerCategory ?? [];
  const maxCat = Math.max(...perCategory.map((c) => c.total), 1);

  return (
    <div className="mx-auto max-w-2xl px-4">
      <h1 className="mb-4 text-2xl font-bold text-text">Value summary</h1>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-400">
          <input
            type="checkbox"
            checked={wantToSellOnly}
            onChange={(e) => setWantToSellOnly(e.target.checked)}
            className="h-4 w-4 rounded border-gray-600 bg-bg-card text-primary"
          />
          Only items I want to sell
        </label>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => setView('list')}
            className={`rounded-lg px-3 py-1.5 text-sm touch-target ${
              view === 'list' ? 'bg-primary text-white' : 'bg-bg-card text-gray-400'
            }`}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setView('bars')}
            className={`rounded-lg px-3 py-1.5 text-sm touch-target ${
              view === 'bars' ? 'bg-primary text-white' : 'bg-bg-card text-gray-400'
            }`}
          >
            Bars
          </button>
        </div>
      </div>
      {loading ? (
        <p className="py-8 text-center text-gray-400">Loading...</p>
      ) : (
        <>
          <Card className="mb-6">
            <p className="mb-2 text-sm text-gray-400">
              {wantToSellOnly ? 'Total value (want to sell)' : 'Total value'} by currency
            </p>
            <div className="flex flex-wrap gap-4">
              {CURRENCIES.map((cur) =>
                totalByCurrency[cur] > 0 ? (
                  <span key={cur} className="text-xl font-bold text-text">
                    {formatPrice(totalByCurrency[cur], cur)}
                  </span>
                ) : null
              )}
              {CURRENCIES.every((c) => totalByCurrency[c] === 0) && (
                <span className="text-gray-400">—</span>
              )}
            </div>
          </Card>
          <h2 className="mb-3 text-lg font-semibold text-text">By category</h2>
          {perCategory.length === 0 ? (
            <p className="text-gray-400">No data in this view.</p>
          ) : view === 'list' ? (
            <ul className="space-y-2">
              {perCategory.map((row) => (
                <li key={row.categoryId}>
                  <Card className="flex flex-col gap-1">
                    <span className="font-medium text-text">{row.categoryName}</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-0 text-sm text-primary">
                      {CURRENCIES.map(
                        (cur) =>
                          row.byCurrency[cur] > 0 && (
                            <span key={cur}>
                              {formatPrice(row.byCurrency[cur], cur)}
                            </span>
                          )
                      )}
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-4">
              {perCategory.map((row) => (
                <li key={row.categoryId}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-text">{row.categoryName}</span>
                    <span className="text-gray-400">
                      {CURRENCIES.filter((c) => row.byCurrency[c] > 0)
                        .map((c) => formatPrice(row.byCurrency[c], c))
                        .join(' · ')}
                    </span>
                  </div>
                  <div className="h-6 overflow-hidden rounded-full bg-bg-card">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(row.total / maxCat) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
