import { useState, useEffect, useCallback } from 'react';
import { getItems } from '@/services/dataService';
import type { Item } from '@/types';

export function useItems(filters?: { categoryId?: string; wantToSell?: boolean }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getItems(filters);
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load items');
    } finally {
      setLoading(false);
    }
  }, [filters?.categoryId, filters?.wantToSell]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { items, loading, error, refetch };
}
