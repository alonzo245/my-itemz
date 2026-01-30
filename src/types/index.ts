export type Currency = 'USD' | 'ILS' | 'EUR';

export interface Category {
  _id: string;
  name: string;
  color?: string;
  icon?: string;
  createdAt: string;
}

export interface Item {
  _id: string;
  name: string;
  price: number;
  currency?: Currency;
  wantToSell: boolean;
  categoryId: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Stats {
  totalValue: number;
  totalByCurrency: Record<Currency, number>;
  valuePerCategory: {
    categoryId: string;
    categoryName: string;
    total: number;
    byCurrency: Record<Currency, number>;
  }[];
}
