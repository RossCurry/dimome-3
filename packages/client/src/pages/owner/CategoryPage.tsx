import { Suspense, use, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { deleteItem, patchItem, type OwnerCategoryPageData } from "@/api/owner";
import { OwnerConfirmDialog } from "@/components/owner/OwnerConfirmDialog";
import { OwnerRouteSkeleton } from "@/components/skeletons/OwnerRouteSkeleton";
import type { MenuItem } from "@/types";
import { clearReadCaches, readOwnerCategoryPage } from "@/mocks/mockApi";

function CategoryPageInner({
  menuId,
  categoryId,
  data,
  onRequestDeleteItem,
  deletingItemId,
}: {
  menuId: string;
  categoryId: string;
  data: OwnerCategoryPageData;
  onRequestDeleteItem: (item: MenuItem) => void;
  deletingItemId: string | null;
}) {
  const { categoryName, items } = data;
  const [visibleById, setVisibleById] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      items.map((i) => [i.id, i.visibleOnMenu ?? true] as const),
    ),
  );

  const toggleVisible = (id: string) => {
    const current = visibleById[id] ?? true;
    const next = !current;
    void (async () => {
      try {
        await patchItem(menuId, id, { visibleOnMenu: next });
        clearReadCaches();
        setVisibleById((prev) => ({ ...prev, [id]: next }));
      } catch {
        /* snackbar from apiJson */
      }
    })();
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        to={`/menus/${menuId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to menu
      </Link>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="mb-2 font-headline text-3xl text-primary">{categoryName}</h1>
          <p className="text-on-surface-variant">
            Menu <span className="font-mono text-xs">{menuId}</span>
            {" · "}
            Category <span className="font-mono text-xs">{categoryId}</span>
            {" — "}
            {items.length} {items.length === 1 ? "item" : "items"}.
          </p>
        </div>
        <Link
          to="/items/new"
          state={{
            categoryName,
            categoryId,
            menuId,
          }}
          className="primary-gradient inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-on-primary"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add item
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              <tr>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Visible</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {items.map((item) => {
                const visible = visibleById[item.id] ?? true;
                return (
                  <tr key={item.id} className="hover:bg-surface-container-low/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-container-low">
                          <img
                            src={item.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="font-medium text-on-surface">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">${item.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => toggleVisible(item.id)}
                        aria-pressed={visible}
                        aria-label={
                          visible
                            ? "Visible on guest menu, click to hide"
                            : "Hidden from guest menu, click to show"
                        }
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors hover:bg-surface-container-low ${
                          visible ? "text-emerald-700" : "text-on-surface-variant"
                        }`}
                      >
                        {visible ? (
                          <Eye className="h-4 w-4 shrink-0" aria-hidden />
                        ) : (
                          <EyeOff className="h-4 w-4 shrink-0" aria-hidden />
                        )}
                        {visible ? "Yes" : "No"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Link
                          to={`/menus/${menuId}/items/${item.id}/edit`}
                          className="inline-flex items-center gap-2 rounded-xl bg-primary-container px-4 py-2 text-sm font-medium text-on-primary"
                        >
                          <Edit className="h-4 w-4" aria-hidden />
                          Edit
                        </Link>
                        <button
                          type="button"
                          disabled={deletingItemId === item.id}
                          onClick={() => onRequestDeleteItem(item)}
                          className="rounded-lg p-2 text-error hover:bg-error-container/30 disabled:opacity-50"
                          aria-label={`Permanently delete ${item.name}`}
                          title="Permanently delete item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CategoryPageSuspended({
  menuId,
  categoryId,
  onRequestDeleteItem,
  deletingItemId,
}: {
  menuId: string;
  categoryId: string;
  onRequestDeleteItem: (item: MenuItem) => void;
  deletingItemId: string | null;
}) {
  const data = use(readOwnerCategoryPage(menuId, categoryId));
  if (!data) {
    return <Navigate to={menuId ? `/menus/${menuId}` : "/menus"} replace />;
  }
  return (
    <CategoryPageInner
      menuId={menuId}
      categoryId={categoryId}
      data={data}
      onRequestDeleteItem={onRequestDeleteItem}
      deletingItemId={deletingItemId}
    />
  );
}

export default function CategoryPage() {
  const { menuId: menuIdParam, categoryId: categoryIdParam } = useParams<{
    menuId: string;
    categoryId: string;
  }>();
  const menuId = menuIdParam ?? "";
  const categoryId = categoryIdParam ?? "";
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<MenuItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const confirmDeleteItem = async () => {
    if (!pendingDeleteItem || !menuId) return;
    setDeletingItemId(pendingDeleteItem.id);
    try {
      await deleteItem(menuId, pendingDeleteItem.id);
      clearReadCaches();
      setPendingDeleteItem(null);
      setReloadKey((k) => k + 1);
    } catch {
      /* snackbar from apiJson */
    } finally {
      setDeletingItemId(null);
    }
  };

  return (
    <>
      <Suspense key={reloadKey} fallback={<OwnerRouteSkeleton />}>
        <CategoryPageSuspended
          menuId={menuId}
          categoryId={categoryId}
          onRequestDeleteItem={setPendingDeleteItem}
          deletingItemId={deletingItemId}
        />
      </Suspense>

      <OwnerConfirmDialog
        open={pendingDeleteItem != null}
        title="Delete item permanently?"
        onClose={() => setPendingDeleteItem(null)}
        onConfirm={() => void confirmDeleteItem()}
        cancelLabel="Cancel"
        confirmLabel={deletingItemId ? "Deleting…" : "Delete item"}
      >
        <p>
          This removes <strong>{pendingDeleteItem?.name}</strong> from the menu. This cannot be undone.
        </p>
      </OwnerConfirmDialog>
    </>
  );
}
