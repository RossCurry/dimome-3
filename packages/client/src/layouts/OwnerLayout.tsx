import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Bell, HelpCircle, LogOut, Menu, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CategoryCreateModalProvider } from "@/context/CategoryCreateModalContext";
import { OwnerSidebar } from "@/layouts/OwnerSidebar";

/** Short guest path for QR (`/qr/...`); `/menu/...` is an equivalent readable alias. */
const DEMO_GUEST_MENU = "/qr/menu-1";

export function OwnerLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <CategoryCreateModalProvider>
      <div className="flex min-h-screen flex-col bg-surface text-on-surface">
        <header className="glass-header sticky top-0 z-50 text-on-primary">
          <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-6 py-3">
            <div className="flex items-center gap-3 md:gap-8">
              <button
                type="button"
                className="rounded-lg p-2 text-emerald-200/90 hover:bg-white/10 md:hidden"
                aria-label="Open menu"
                aria-expanded={mobileNavOpen}
                aria-controls="owner-mobile-nav"
                onClick={() => setMobileNavOpen(true)}
              >
                <Menu className="h-6 w-6" aria-hidden />
              </button>
              <Link
                to="/"
                className="text-xl font-bold italic font-headline tracking-tight text-emerald-50"
              >
                DiMoMe
              </Link>
              <nav className="hidden items-center gap-6 text-sm font-headline md:flex">
                <Link
                  to="/"
                  className="border-b-2 border-emerald-400 pb-0.5 text-white"
                >
                  Dashboard
                </Link>
                <span className="cursor-not-allowed text-emerald-200/70">Analytics</span>
                <span className="cursor-not-allowed text-emerald-200/70">Settings</span>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg p-2 text-emerald-200/80 hover:bg-white/10"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="rounded-lg p-2 text-emerald-200/80 hover:bg-white/10"
                aria-label="Help"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-lg p-2 text-emerald-200/80 hover:bg-white/10"
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container"
                aria-hidden
              >
                <User className="h-4 w-4 text-on-primary" />
              </div>
            </div>
          </div>
        </header>
        <div className="flex min-h-0 flex-1">
          <OwnerSidebar
            mobileOpen={mobileNavOpen}
            onMobileOpenChange={setMobileNavOpen}
            onLogout={onLogout}
          />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <main className="min-h-0 flex-1 overflow-auto">
              <Outlet />
            </main>
            <p className="shrink-0 py-4 text-center text-xs text-on-surface-variant">
              <Link to={DEMO_GUEST_MENU} className="underline hover:text-primary">
                Open demo guest menu (QR → /qr/menu-1)
              </Link>
            </p>
          </div>
        </div>
      </div>
    </CategoryCreateModalProvider>
  );
}
