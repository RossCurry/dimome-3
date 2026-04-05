import { Link, Outlet } from "react-router-dom";
import { Bell, HelpCircle, User } from "lucide-react";
import {
  CategoryCreateModalProvider,
  useCategoryCreateModal,
} from "@/context/CategoryCreateModalContext";
import { OwnerSidebar } from "@/layouts/OwnerSidebar";

/** Demo guest URL for a published menu (QR would encode the same path with a real host). */
const DEMO_GUEST_MENU = "/menu/menu-1";

export function OwnerLayout() {
  return (
    <CategoryCreateModalProvider>
      <OwnerLayoutInner />
    </CategoryCreateModalProvider>
  );
}

function OwnerLayoutInner() {
  const { openAddCategoryModal } = useCategoryCreateModal();

  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <header className="glass-header sticky top-0 z-50 text-on-primary">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-xl font-bold italic font-headline tracking-tight text-emerald-50"
            >
              DiMoMe
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-headline">
              <Link
                to="/"
                className="text-white border-b-2 border-emerald-400 pb-0.5"
              >
                Dashboard
              </Link>
              <span className="text-emerald-200/70 cursor-not-allowed">Analytics</span>
              <span className="text-emerald-200/70 cursor-not-allowed">Settings</span>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openAddCategoryModal}
              className="primary-gradient text-on-primary px-4 py-2 rounded-xl text-sm font-semibold hidden sm:inline"
            >
              Add Category
            </button>
            <button
              type="button"
              className="p-2 rounded-lg text-emerald-200/80 hover:bg-white/10"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 rounded-lg text-emerald-200/80 hover:bg-white/10"
              aria-label="Help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <div
              className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center"
              aria-hidden
            >
              <User className="w-4 h-4 text-on-primary" />
            </div>
          </div>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <OwnerSidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <main className="min-h-0 flex-1 overflow-auto">
            <Outlet />
          </main>
          <p className="shrink-0 py-4 text-center text-xs text-on-surface-variant">
            <Link to={DEMO_GUEST_MENU} className="underline hover:text-primary">
              Open demo guest menu (QR → /menu/menu-1)
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

