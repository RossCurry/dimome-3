import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ApiError } from "@/api/client";
import { deleteCategory, fetchOwnerMenuCategoriesData } from "@/api/owner";
import { OwnerConfirmDialog } from "@/components/owner/OwnerConfirmDialog";
import { useCategoryCreateModal } from "@/context/CategoryCreateModalContext";
import { OwnerDashboardSkeleton } from "@/components/skeletons/OwnerDashboardSkeleton";
import { OwnerCategoryRowList } from "@/components/owner/OwnerCategoryRowList";
import type { CategorySummary, OwnerMenuCategoriesData } from "@/types";
import { clearReadCaches } from "@/mocks/mockApi";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; data: OwnerMenuCategoriesData }
  | { status: "missing" }
  | { status: "unauthorized" };

function categoryRowKey(c: CategorySummary): string {
  return `${c.menuId}:${c.categoryId}`;
}

export default function OwnerMenuPage() {
  const { menuId: menuIdParam } = useParams<{ menuId: string }>();
  const menuId = menuIdParam ?? "";
  const { openAddCategoryModal } = useCategoryCreateModal();
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [reloadNonce, setReloadNonce] = useState(0);
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<CategorySummary | null>(null);
  const [deletingCategoryKey, setDeletingCategoryKey] = useState<string | null>(null);

  useEffect(() => {
    if (!menuId) {
      setLoadState({ status: "missing" });
      return;
    }
    let cancelled = false;
    setLoadState({ status: "loading" });
    void fetchOwnerMenuCategoriesData(menuId)
      .then((d) => {
        if (cancelled) return;
        if (!d) setLoadState({ status: "missing" });
        else setLoadState({ status: "ready", data: d });
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 401) {
          setLoadState({ status: "unauthorized" });
          return;
        }
        setLoadState({ status: "missing" });
      });
    return () => {
      cancelled = true;
    };
  }, [menuId, reloadNonce]);

  const confirmDeleteCategory = async () => {
    if (!pendingDeleteCategory) return;
    const key = categoryRowKey(pendingDeleteCategory);
    setDeletingCategoryKey(key);
    try {
      await deleteCategory(pendingDeleteCategory.menuId, pendingDeleteCategory.categoryId);
      clearReadCaches();
      setPendingDeleteCategory(null);
      setReloadNonce((n) => n + 1);
    } catch {
      /* snackbar from apiJson */
    } finally {
      setDeletingCategoryKey(null);
    }
  };

  if (loadState.status === "loading") {
    return <OwnerDashboardSkeleton />;
  }

  if (loadState.status === "unauthorized") {
    return <Navigate to="/login" replace />;
  }

  if (loadState.status === "missing") {
    return <Navigate to="/menus" replace />;
  }

  const { data } = loadState;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        to="/menus"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to menus
      </Link>

      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-headline text-3xl tracking-tight text-primary md:text-4xl">
            {data.menuName}
          </h1>
          <p className="mt-2 text-on-surface-variant">
            {data.venueName} · Menu <span className="font-mono text-xs">{data.menuId}</span>
            {" — categories in this menu."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => openAddCategoryModal(menuId)}
          className="primary-gradient rounded-xl px-5 py-2.5 text-center text-sm font-semibold text-on-primary"
        >
          Add Category
        </button>
      </div>

      <section className="mb-12">
        <h2 className="mb-6 font-headline text-xl text-primary">Your categories</h2>
        <OwnerCategoryRowList
          categories={data.categories}
          onDeleteCategory={setPendingDeleteCategory}
          deletingCategoryKey={deletingCategoryKey}
        />
      </section>

      <OwnerConfirmDialog
        open={pendingDeleteCategory != null}
        title="Delete category permanently?"
        onClose={() => setPendingDeleteCategory(null)}
        onConfirm={() => void confirmDeleteCategory()}
        cancelLabel="Cancel"
        confirmLabel={deletingCategoryKey ? "Deleting…" : "Delete category"}
      >
        <p>
          This removes <strong>{pendingDeleteCategory?.name}</strong> and every dish in that category.
          This cannot be undone.
        </p>
      </OwnerConfirmDialog>
    </div>
  );
}
