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
import { createCategory } from "@/api/owner";
import type { NewMenuItemLocationState } from "@/types/navigation";
import type { OwnerMenuSummary } from "@/types";
import { clearReadCaches, readOwnerMenus } from "@/mocks/mockApi";

type CategoryCreateModalContextValue = {
  openAddCategoryModal: (menuId?: string) => void;
};

const CategoryCreateModalContext =
  createContext<CategoryCreateModalContextValue | null>(null);

export function CategoryCreateModalProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [menuPickerId, setMenuPickerId] = useState("");
  const [menuOptions, setMenuOptions] = useState<OwnerMenuSummary[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  const close = useCallback(() => {
    setOpen(false);
    setName("");
    setContextMenuId(null);
    setMenuPickerId("");
    setMenuOptions([]);
    setSubmitting(false);
  }, []);

  const openModal = useCallback((menuId?: string) => {
    setContextMenuId(menuId?.trim() ? menuId : null);
    setMenuPickerId("");
    setMenuOptions([]);
    setName("");
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open || contextMenuId != null) return;
    let cancelled = false;
    void readOwnerMenus().then((list) => {
      if (!cancelled) setMenuOptions(list);
    });
    return () => {
      cancelled = true;
    };
  }, [open, contextMenuId]);

  const submit = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed || submitting) return;

    const effectiveMenuId = contextMenuId ?? menuPickerId.trim();
    if (!effectiveMenuId) return;

    setSubmitting(true);
    try {
      const created = await createCategory(effectiveMenuId, { name: trimmed });
      clearReadCaches();
      const state: NewMenuItemLocationState = {
        categoryName: created.name,
        categoryId: created.categoryId,
        menuId: created.menuId,
      };
      close();
      navigate("/items/new", { state });
    } finally {
      setSubmitting(false);
    }
  }, [name, submitting, contextMenuId, menuPickerId, navigate, close]);

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
    () => ({ openAddCategoryModal: openModal }),
    [openModal],
  );

  const needsMenuPicker = contextMenuId == null;
  const canSubmit =
    trimmedName(name) &&
    (!needsMenuPicker || menuPickerId.trim() !== "") &&
    !submitting;

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
            {needsMenuPicker ? (
              <div className="mb-4 space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                  Menu
                </label>
                <select
                  value={menuPickerId}
                  onChange={(e) => setMenuPickerId(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-on-surface"
                >
                  <option value="">Select a menu…</option>
                  {menuOptions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
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
                disabled={submitting}
                onClick={close}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submit()}
                disabled={!canSubmit}
                className="primary-gradient text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:pointer-events-none"
              >
                {submitting ? "Saving…" : "Add Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </CategoryCreateModalContext.Provider>
  );
}

function trimmedName(name: string): boolean {
  return name.trim().length > 0;
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
