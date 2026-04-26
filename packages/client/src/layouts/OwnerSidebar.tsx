import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  CirclePlus,
  Droplet,
  FileText,
  HelpCircle,
  LayoutGrid,
  Layers,
  LogOut,
  X,
} from "lucide-react";
import { fetchOwnerCategories, fetchOwnerMenus } from "@/api/owner";

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

export type OwnerSidebarProps = {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  onLogout: () => void;
};

function OwnerSidebarInner({
  onNavigate,
  onLogout,
}: {
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  const { pathname } = useLocation();
  const [venueName, setVenueName] = useState("Venue");
  /** Optimistic true until a successful menus fetch proves otherwise (fail-open on errors). */
  const [hasMenus, setHasMenus] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchOwnerCategories(), fetchOwnerMenus()])
      .then(([catData, menus]) => {
        if (cancelled) return;
        if (catData.venueName.trim()) setVenueName(catData.venueName);
        setHasMenus(menus.length > 0);
      })
      .catch(() => {
        if (!cancelled) setHasMenus(true);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const overviewActive = pathname === "/";
  const createMenuHubActive = pathname === "/menus/create";
  const menusActive =
    pathname === "/menus" ||
    (pathname.startsWith("/menus/") && !createMenuHubActive);
  const categoriesActive = pathname === "/categories";

  const afterNav = () => {
    onNavigate?.();
  };

  return (
    <>
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
          onClick={afterNav}
          className={`${navClass} ${overviewActive ? navActiveClass : ""}`}
        >
          <LayoutGrid className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
          Overview
        </Link>
        <Link
          to="/menus"
          onClick={afterNav}
          className={`${navClass} ${menusActive ? navActiveClass : ""}`}
        >
          <FileText className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
          Menus
        </Link>
        {hasMenus ? (
          <Link
            to="/categories"
            onClick={afterNav}
            className={`${navClass} ${categoriesActive ? navActiveClass : ""}`}
          >
            <Layers className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
            Categories
          </Link>
        ) : (
          <span
            className={`${navClass} cursor-not-allowed opacity-50`}
            aria-disabled="true"
            title="Create a menu first to manage categories."
          >
            <Layers className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
            Categories
          </span>
        )}
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
        <Link
          to="/menus/create"
          onClick={afterNav}
          className={`${navClass} ${createMenuHubActive ? navActiveClass : ""}`}
        >
          <CirclePlus className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
          Create menu
        </Link>
      </nav>

      <div className="mt-auto space-y-1 border-t border-outline-variant/10 p-3">
        <button
          type="button"
          onClick={afterNav}
          className={`${navClass} w-full text-left text-on-surface-variant`}
          aria-label="Support (coming soon)"
        >
          <HelpCircle className="h-5 w-5 shrink-0" aria-hidden />
          Support
        </button>
        <button
          type="button"
          onClick={() => {
            afterNav();
            onLogout();
          }}
          className={`${navClass} w-full text-left text-on-surface-variant`}
          aria-label="Log out"
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden />
          Logout
        </button>
      </div>
    </>
  );
}

export function OwnerSidebar({ mobileOpen, onMobileOpenChange, onLogout }: OwnerSidebarProps) {
  const closeMobile = () => onMobileOpenChange(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onMobileOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onMobileOpenChange]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-outline-variant/15 bg-surface-container-low md:flex md:w-72">
        <OwnerSidebarInner onLogout={onLogout} />
      </aside>

      <div
        className={`fixed inset-0 z-[80] md:hidden ${
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden
          onClick={closeMobile}
        />
        <aside
          className={`absolute left-0 top-0 flex h-full w-72 max-w-[min(18rem,88vw)] flex-col border-r border-outline-variant/15 bg-surface-container-low pt-[env(safe-area-inset-top,0px)] shadow-[0_0_40px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out motion-reduce:transition-none ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          id="owner-mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Main navigation"
        >
          <div className="flex shrink-0 items-center justify-end border-b border-outline-variant/10 px-2 py-1">
            <button
              type="button"
              onClick={closeMobile}
              className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <OwnerSidebarInner onNavigate={closeMobile} onLogout={onLogout} />
        </aside>
      </div>
    </>
  );
}
