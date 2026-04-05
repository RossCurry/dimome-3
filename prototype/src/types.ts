export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  allergens: string[];
  image?: string;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  items: string[]; // IDs of menu items
}

export interface MenuData {
  categories: Category[];
  items: Record<string, MenuItem>;
}

export type ViewMode = "guest" | "owner";
