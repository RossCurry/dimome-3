import { use } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";
import { readMenuBrowse } from "@/mocks/mockApi";

export default function MenuBrowsePage() {
  const { menuId } = useParams<{ menuId: string }>();
  const id = menuId ?? "menu-1";
  const items = use(readMenuBrowse(id));

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-primary font-medium mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>
      <h1 className="text-3xl font-headline text-primary mb-2">Menu items</h1>
      <p className="text-on-surface-variant mb-8">
        Menu <span className="font-mono text-xs">{id}</span> — mock data.
      </p>

      <div className="rounded-2xl bg-surface-container-lowest overflow-hidden shadow-[var(--shadow-ambient)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Item</th>
                <th className="px-6 py-4 font-semibold">Category</th>
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
                  <td className="px-6 py-4 text-on-surface-variant">{item.category}</td>
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
