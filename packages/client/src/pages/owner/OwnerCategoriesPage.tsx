import { Suspense, useState } from "react";
import { use } from "react";
import { deleteCategory } from "@/api/owner";
import { OwnerConfirmDialog } from "@/components/owner/OwnerConfirmDialog";
import { useCategoryCreateModal } from "@/context/CategoryCreateModalContext";
import { OwnerCategoryRowList } from "@/components/owner/OwnerCategoryRowList";
import { OwnerDashboardSkeleton } from "@/components/skeletons/OwnerDashboardSkeleton";
import type { CategorySummary } from "@/types";
import { clearReadCaches, readOwnerCategories } from "@/mocks/mockApi";

function categoryRowKey(c: CategorySummary): string {
  return `${c.menuId}:${c.categoryId}`;
}

function OwnerCategoriesBody({
  onRequestDeleteCategory,
  deletingCategoryKey,
}: {
  onRequestDeleteCategory: (c: CategorySummary) => void;
  deletingCategoryKey: string | null;
}) {
  const data = use(readOwnerCategories());
  const { openAddCategoryModal } = useCategoryCreateModal();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-headline text-3xl tracking-tight text-primary md:text-4xl">
            Categories
          </h1>
          <p className="mt-2 text-on-surface-variant">
            {data.venueName} — manage categories across menus.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openAddCategoryModal()}
          className="primary-gradient rounded-xl px-5 py-2.5 text-center text-sm font-semibold text-on-primary"
        >
          Add Category
        </button>
      </div>

      <section className="mb-12">
        <h2 className="mb-6 font-headline text-xl text-primary">Your categories</h2>
        <OwnerCategoryRowList
          categories={data.categories}
          showParentMenuName
          onDeleteCategory={onRequestDeleteCategory}
          deletingCategoryKey={deletingCategoryKey}
        />
      </section>
    </div>
  );
}

export default function OwnerCategoriesPage() {
  const [listKey, setListKey] = useState(0);
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<CategorySummary | null>(null);
  const [deletingCategoryKey, setDeletingCategoryKey] = useState<string | null>(null);

  const confirmDeleteCategory = async () => {
    if (!pendingDeleteCategory) return;
    const key = categoryRowKey(pendingDeleteCategory);
    setDeletingCategoryKey(key);
    try {
      await deleteCategory(pendingDeleteCategory.menuId, pendingDeleteCategory.categoryId);
      clearReadCaches();
      setPendingDeleteCategory(null);
      setListKey((k) => k + 1);
    } catch {
      /* snackbar from apiJson */
    } finally {
      setDeletingCategoryKey(null);
    }
  };

  return (
    <>
      <Suspense key={listKey} fallback={<OwnerDashboardSkeleton />}>
        <OwnerCategoriesBody
          onRequestDeleteCategory={setPendingDeleteCategory}
          deletingCategoryKey={deletingCategoryKey}
        />
      </Suspense>

      <OwnerConfirmDialog
        open={pendingDeleteCategory != null}
        title="Delete category permanently?"
        onClose={() => setPendingDeleteCategory(null)}
        onConfirm={() => void confirmDeleteCategory()}
        cancelLabel="Cancel"
        confirmLabel={deletingCategoryKey ? "Deleting…" : "Delete category"}
      >
        <p>
          This removes <strong>{pendingDeleteCategory?.name}</strong> from{" "}
          <strong>{pendingDeleteCategory?.menuName}</strong> and every dish in that category. This
          cannot be undone.
        </p>
      </OwnerConfirmDialog>
    </>
  );
}
