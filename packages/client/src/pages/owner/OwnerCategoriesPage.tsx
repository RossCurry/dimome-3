import { use } from "react";
import { useCategoryCreateModal } from "@/context/CategoryCreateModalContext";
import { readOwnerCategories } from "@/mocks/mockApi";
import { OwnerCategoryRowList } from "@/components/owner/OwnerCategoryRowList";

export default function OwnerCategoriesPage() {
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
        <OwnerCategoryRowList categories={data.categories} showParentMenuName />
      </section>
    </div>
  );
}
