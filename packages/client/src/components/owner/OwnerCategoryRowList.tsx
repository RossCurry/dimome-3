import { Link } from "react-router-dom";
import { Edit, ExternalLink, Trash2 } from "lucide-react";
import type { CategorySummary } from "@/types";

type Props = {
  categories: CategorySummary[];
  /** When true, show parent menu name in each row (global categories page). */
  showParentMenuName?: boolean;
};

export function OwnerCategoryRowList({
  categories,
  showParentMenuName = false,
}: Props) {
  if (categories.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant">No categories for this menu yet.</p>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <div
          key={`${category.menuId}-${category.categoryId}`}
          className="flex flex-col gap-4 rounded-2xl bg-surface-container-lowest p-6 shadow-[var(--shadow-ambient)] sm:flex-row sm:items-center"
        >
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-container-low">
            <img
              src={category.thumbnail}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-headline text-lg text-primary">{category.name}</h3>
            <p className="text-sm text-on-surface-variant">
              {showParentMenuName ? (
                <>
                  {category.menuName} · Last updated: {category.lastUpdatedLabel} ·{" "}
                  {category.itemCount} items
                </>
              ) : (
                <>
                  Last updated: {category.lastUpdatedLabel} · {category.itemCount} items
                </>
              )}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link
              to={`/qr/${category.menuId}`}
              className="rounded-lg p-2 text-secondary hover:bg-surface-container-low"
              title="Guest menu (QR URL)"
            >
              <ExternalLink className="h-5 w-5" />
            </Link>
            <Link
              to={`/menus/${category.menuId}/category/${category.categoryId}`}
              className="flex items-center gap-2 rounded-xl bg-primary-container px-4 py-2 text-sm font-medium text-on-primary"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
            <button
              type="button"
              className="rounded-lg p-2 text-error hover:bg-error-container/30"
              aria-label="Delete category"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
