import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const SHORTLIST_MAP: Record<string, string[]> = {
  gluten: ["Cereals containing gluten"],
  dairy: ["Milk (including lactose)"],
  nuts: ["Nuts", "Peanuts"],
  shellfish: ["Crustaceans", "Molluscs"],
};

type CartState = Record<string, number>;

type GuestPreferencesContextValue = {
  /** Active public menu id from `/menu/:menuId`. */
  menuId: string;
  excludedAllergens: Set<string>;
  toggleEuAllergen: (label: string) => void;
  toggleShortlist: (id: string) => void;
  clearFilters: () => void;
  cart: CartState;
  addToCart: (itemId: string) => void;
  setQty: (itemId: string, qty: number) => void;
  cartCount: number;
};

const GuestPreferencesContext = createContext<GuestPreferencesContextValue | null>(
  null,
);

export function GuestPreferencesProvider({
  children,
  menuId,
}: {
  children: ReactNode;
  menuId: string;
}) {
  const [excludedAllergens, setExcludedAllergens] = useState<Set<string>>(
    () => new Set(),
  );
  const [cart, setCart] = useState<CartState>({});

  const toggleEuAllergen = useCallback((label: string) => {
    setExcludedAllergens((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

  const toggleShortlist = useCallback((id: string) => {
    const labels = SHORTLIST_MAP[id];
    if (!labels) return;
    setExcludedAllergens((prev) => {
      const next = new Set(prev);
      const anyOn = labels.some((l) => next.has(l));
      if (anyOn) labels.forEach((l) => next.delete(l));
      else labels.forEach((l) => next.add(l));
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setExcludedAllergens(new Set());
  }, []);

  const addToCart = useCallback((itemId: string) => {
    setCart((c) => ({ ...c, [itemId]: (c[itemId] ?? 0) + 1 }));
  }, []);

  const setQty = useCallback((itemId: string, qty: number) => {
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[itemId];
      else next[itemId] = qty;
      return next;
    });
  }, []);

  const cartCount = useMemo(
    () => Object.values(cart).reduce((a, b) => a + b, 0),
    [cart],
  );

  const value = useMemo(
    () => ({
      menuId,
      excludedAllergens,
      toggleEuAllergen,
      toggleShortlist,
      clearFilters,
      cart,
      addToCart,
      setQty,
      cartCount,
    }),
    [
      menuId,
      excludedAllergens,
      toggleEuAllergen,
      toggleShortlist,
      clearFilters,
      cart,
      addToCart,
      setQty,
      cartCount,
    ],
  );

  return (
    <GuestPreferencesContext.Provider value={value}>
      {children}
    </GuestPreferencesContext.Provider>
  );
}

export function useGuestPreferences() {
  const ctx = useContext(GuestPreferencesContext);
  if (!ctx) {
    throw new Error("useGuestPreferences must be used within GuestPreferencesProvider");
  }
  return ctx;
}

export function itemPassesAllergenFilters(
  itemAllergens: string[],
  excluded: Set<string>,
): boolean {
  if (excluded.size === 0) return true;
  return !itemAllergens.some((a) => excluded.has(a));
}
