import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import type { NewMenuItemLocationState } from "@/types/navigation";

type CategoryCreateModalContextValue = {
  openAddCategoryModal: () => void;
};

const CategoryCreateModalContext =
  createContext<CategoryCreateModalContextValue | null>(null);

export function CategoryCreateModalProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  const close = useCallback(() => {
    setOpen(false);
    setName("");
  }, []);

  const submit = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const categoryId = `cat-${Date.now()}`;
    const state: NewMenuItemLocationState = {
      categoryName: trimmed,
      categoryId,
    };
    close();
    navigate("/items/new", { state });
  }, [name, navigate, close]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const value = useMemo<CategoryCreateModalContextValue>(
    () => ({ openAddCategoryModal: () => setOpen(true) }),
    [],
  );

  return (
    <CategoryCreateModalContext.Provider value={value}>
      {children}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            aria-label="Close dialog"
            onClick={close}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-[var(--shadow-ambient)] border border-outline-variant/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id={titleId}
              className="text-lg font-headline text-primary mb-4"
            >
              Category name
            </h2>
            <div className="relative mb-6">
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Weekend brunch"
                className="w-full bg-surface-container-low border-none rounded-xl pl-4 pr-11 py-3 focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50"
              />
              {name.length > 0 && (
                <button
                  type="button"
                  onClick={() => setName("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  aria-label="Clear category name"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={close}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-low"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!name.trim()}
                className="primary-gradient text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:pointer-events-none"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </CategoryCreateModalContext.Provider>
  );
}

export function useCategoryCreateModal() {
  const ctx = useContext(CategoryCreateModalContext);
  if (!ctx) {
    throw new Error(
      "useCategoryCreateModal must be used within CategoryCreateModalProvider",
    );
  }
  return ctx;
}
