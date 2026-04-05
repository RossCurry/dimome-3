import { use } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Eye, Plus } from "lucide-react";
import { readOwnerCategoryPage } from "@/mocks/mockApi";

export default function CategoryPage() {
  const { menuId: menuIdParam, categoryId: categoryIdParam } = useParams<{
    menuId: string;
    categoryId: string;
  }>();
  const menuId = menuIdParam ?? "";
  const categoryId = categoryIdParam ?? "";
  const data = use(readOwnerCategoryPage(menuId, categoryId));

  if (!data) {
    return (
      <Navigate to={menuId ? `/menus/${menuId}` : "/menus"} replace />
    );
  }

  const { categoryName, items } = data;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link
        to={`/menus/${menuId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to menu
      </Link>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-headline text-primary mb-2">{categoryName}</h1>
          <p className="text-on-surface-variant">
            Menu <span className="font-mono text-xs">{menuId}</span>
            {" · "}
            Category <span className="font-mono text-xs">{categoryId}</span>
            {" — "}
            {items.length} {items.length === 1 ? "item" : "items"} (mock).
          </p>
        </div>
        <Link
          to="/items/new"
          state={{
            categoryName,
            categoryId,
            menuId,
          }}
          className="inline-flex items-center justify-center gap-2 primary-gradient text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden />
          Add item
        </Link>
      </div>

      <div className="rounded-2xl bg-surface-container-lowest overflow-hidden shadow-[var(--shadow-ambient)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Item</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Visible</th>
                <th className="px-6 py-4 font-semibold" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-low/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container-low shrink-0">
                        <img
                          src={item.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-medium text-on-surface">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">${item.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-medium">
                      <Eye className="w-4 h-4" />
                      Yes
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/items/${item.id}/edit`}
                      className="text-primary font-semibold text-sm"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
