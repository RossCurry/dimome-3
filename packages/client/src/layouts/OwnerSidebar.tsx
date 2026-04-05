import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Droplet,
  FileText,
  HelpCircle,
  LayoutGrid,
  Layers,
  LogOut,
  Plus,
} from "lucide-react";
import { FIXTURE_OWNER_CATEGORIES } from "@/mocks/fixtures";

function venueInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

const navClass =
  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-high";
const navActiveClass =
  "bg-primary-fixed-dim/35 text-on-primary-fixed-variant ring-1 ring-primary/10";

export function OwnerSidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const venueName = FIXTURE_OWNER_CATEGORIES.venueName;

  const overviewActive = pathname === "/";
  const menusActive = pathname === "/menus" || pathname.startsWith("/menus/");
  const categoriesActive = pathname === "/categories";

  const firstCategory = FIXTURE_OWNER_CATEGORIES.categories[0]!;

  const goNewItem = () => {
    navigate("/items/new", {
      state: {
        menuId: firstCategory.menuId,
        categoryId: firstCategory.categoryId,
        categoryName: firstCategory.name,
      },
    });
  };

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-outline-variant/15 bg-surface-container-low md:flex md:w-72">
      <div className="border-b border-outline-variant/10 p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-bold text-on-primary font-headline"
            aria-hidden
          >
            {venueInitials(venueName)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-headline font-bold text-primary">{venueName}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Premium B2B account
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Owner">
        <Link
          to="/"
          className={`${navClass} ${overviewActive ? navActiveClass : ""}`}
        >
          <LayoutGrid className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
          Overview
        </Link>
        <Link
          to="/menus"
          className={`${navClass} ${menusActive ? navActiveClass : ""}`}
        >
          <FileText className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
          Menus
        </Link>
        <Link
          to="/categories"
          className={`${navClass} ${categoriesActive ? navActiveClass : ""}`}
        >
          <Layers className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
          Categories
        </Link>
        <span
          className={`${navClass} cursor-not-allowed opacity-50`}
          aria-disabled="true"
        >
          <Droplet className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
          Ingredients
        </span>
        <span
          className={`${navClass} cursor-not-allowed opacity-50`}
          aria-disabled="true"
        >
          <BarChart3 className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
          Performance
        </span>
      </nav>

      <div className="border-t border-outline-variant/10 p-3">
        <button
          type="button"
          onClick={goNewItem}
          className="primary-gradient flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-on-primary"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New item
        </button>
      </div>

      <div className="mt-auto space-y-1 border-t border-outline-variant/10 p-3">
        <button
          type="button"
          className={`${navClass} w-full text-left text-on-surface-variant`}
          aria-label="Support (coming soon)"
        >
          <HelpCircle className="h-5 w-5 shrink-0" aria-hidden />
          Support
        </button>
        <button
          type="button"
          className={`${navClass} w-full text-left text-on-surface-variant`}
          aria-label="Log out (mock)"
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden />
          Logout
        </button>
      </div>
    </aside>
  );
}
