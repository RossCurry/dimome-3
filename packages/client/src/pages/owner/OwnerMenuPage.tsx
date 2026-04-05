import { use } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCategoryCreateModal } from "@/context/CategoryCreateModalContext";
import { readOwnerMenuCategories } from "@/mocks/mockApi";
import { OwnerCategoryRowList } from "@/components/owner/OwnerCategoryRowList";

export default function OwnerMenuPage() {
  const { menuId: menuIdParam } = useParams<{ menuId: string }>();
  const menuId = menuIdParam ?? "";
  const data = use(readOwnerMenuCategories(menuId));
  const { openAddCategoryModal } = useCategoryCreateModal();

  if (!data) {
    return <Navigate to="/menus" replace />;
  }

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
            {data.venueName} · Menu <span className="font-mono text-xs">{data.menuId}</span>{" "}
            — categories in this menu only (mock).
          </p>
        </div>
        <button
          type="button"
          onClick={openAddCategoryModal}
          className="primary-gradient rounded-xl px-5 py-2.5 text-center text-sm font-semibold text-on-primary"
        >
          Add Category
        </button>
      </div>

      <section className="mb-12">
        <h2 className="mb-6 font-headline text-xl text-primary">Your categories</h2>
        <OwnerCategoryRowList categories={data.categories} />
      </section>
    </div>
  );
}
