import type { Category, Currency, Item, Stats } from '@/types';

const CURRENCIES: Currency[] = ['USD', 'ILS', 'EUR'];

const ITEMS_KEY = 'inventory_items';
const CATEGORIES_KEY = 'inventory_categories';

function getLocalItems(): Item[] {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalItems(items: Item[]): void {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

function getLocalCategories(): Category[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalCategories(categories: Category[]): void {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

function generateId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function emptyByCurrency(): Record<Currency, number> {
  return { USD: 0, ILS: 0, EUR: 0 };
}

function computeStats(items: Item[], categories: Category[], wantToSellOnly?: boolean): Stats {
  const filtered = wantToSellOnly ? items.filter((i) => i.wantToSell) : items;
  const totalValue = filtered.reduce((sum, i) => sum + i.price, 0);
  const totalByCurrency = emptyByCurrency();
  const byCategory: Record<string, Record<Currency, number>> = {};
  for (const i of filtered) {
    const cur = (i.currency ?? 'ILS') as Currency;
    totalByCurrency[cur] = (totalByCurrency[cur] ?? 0) + i.price;
    if (!byCategory[i.categoryId]) byCategory[i.categoryId] = { ...emptyByCurrency() };
    byCategory[i.categoryId][cur] = (byCategory[i.categoryId][cur] ?? 0) + i.price;
  }
  const categoryMap = Object.fromEntries(categories.map((c) => [c._id, c]));
  const valuePerCategory = Object.entries(byCategory).map(([categoryId, byCurrency]) => {
    const total = (CURRENCIES as Currency[]).reduce((sum, c) => sum + byCurrency[c], 0);
    return {
      categoryId,
      categoryName: categoryMap[categoryId]?.name ?? 'Uncategorized',
      total,
      byCurrency,
    };
  });
  return { totalValue, totalByCurrency, valuePerCategory };
}

// --- Items ---

export async function getItems(filters?: { categoryId?: string; wantToSell?: boolean }): Promise<Item[]> {
  const items = getLocalItems();
  let result = items;
  if (filters?.categoryId) result = result.filter((i) => i.categoryId === filters.categoryId);
  if (filters?.wantToSell !== undefined) result = result.filter((i) => i.wantToSell === filters.wantToSell);
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getItem(id: string): Promise<Item> {
  const item = getLocalItems().find((i) => i._id === id);
  if (!item) throw new Error('Item not found');
  return item;
}

export async function createItem(body: Omit<Item, '_id' | 'createdAt'>): Promise<Item> {
  const items = getLocalItems();
  const now = new Date().toISOString();
  const item: Item = {
    ...body,
    currency: body.currency ?? 'ILS',
    _id: generateId(),
    createdAt: now,
  };
  items.push(item);
  setLocalItems(items);
  return item;
}

export async function updateItem(id: string, body: Partial<Item>): Promise<Item> {
  const items = getLocalItems();
  const idx = items.findIndex((i) => i._id === id);
  if (idx === -1) throw new Error('Item not found');
  items[idx] = { ...items[idx], ...body, _id: id };
  setLocalItems(items);
  return items[idx];
}

export async function deleteItem(id: string): Promise<void> {
  const items = getLocalItems().filter((i) => i._id !== id);
  setLocalItems(items);
}

// --- Categories ---

export async function getCategories(): Promise<Category[]> {
  const categories = getLocalCategories();
  return categories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getCategory(id: string): Promise<Category> {
  const cat = getLocalCategories().find((c) => c._id === id);
  if (!cat) throw new Error('Category not found');
  return cat;
}

export async function createCategory(body: Omit<Category, '_id' | 'createdAt'>): Promise<Category> {
  const categories = getLocalCategories();
  const now = new Date().toISOString();
  const category: Category = {
    ...body,
    _id: generateId(),
    createdAt: now,
  };
  categories.push(category);
  setLocalCategories(categories);
  return category;
}

export async function updateCategory(id: string, body: Partial<Category>): Promise<Category> {
  const categories = getLocalCategories();
  const idx = categories.findIndex((c) => c._id === id);
  if (idx === -1) throw new Error('Category not found');
  categories[idx] = { ...categories[idx], ...body, _id: id };
  setLocalCategories(categories);
  return categories[idx];
}

export async function deleteCategory(id: string): Promise<void> {
  const categories = getLocalCategories().filter((c) => c._id !== id);
  setLocalCategories(categories);
  const items = getLocalItems().map((i) =>
    i.categoryId === id ? { ...i, categoryId: '' } : i
  );
  setLocalItems(items);
}

// --- Stats ---

export async function getStats(wantToSellOnly?: boolean): Promise<Stats> {
  const items = getLocalItems();
  const categories = getLocalCategories();
  return computeStats(items, categories, wantToSellOnly);
}
