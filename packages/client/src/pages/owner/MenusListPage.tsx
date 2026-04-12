import { Suspense, useState } from "react";
import { use } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { deleteMenu, patchMenu } from "@/api/owner";
import { OwnerConfirmDialog } from "@/components/owner/OwnerConfirmDialog";
import { OwnerMenuCardsSection } from "@/components/owner/OwnerMenuCardsSection";
import { OwnerDashboardSkeleton } from "@/components/skeletons/OwnerDashboardSkeleton";
import type { OwnerMenuSummary } from "@/types";
import { clearReadCaches, readOwnerMenus } from "@/mocks/mockApi";

function MenusListBody({
  onMenusChanged,
  onRequestDeleteMenu,
  deletingMenuId,
}: {
  onMenusChanged: () => void;
  onRequestDeleteMenu: (m: OwnerMenuSummary) => void;
  deletingMenuId: string | null;
}) {
  const menus = use(readOwnerMenus());
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const orderedMenus = [...menus].sort((a, b) => {
    if (a.isActive === b.isActive) return 0;
    return a.isActive ? -1 : 1;
  });

  const handleToggleArchive = async (m: OwnerMenuSummary) => {
    setTogglingId(m.id);
    try {
      await patchMenu(m.id, { isActive: !m.isActive });
      clearReadCaches();
      onMenusChanged();
    } catch {
      /* snackbar from apiJson */
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <OwnerMenuCardsSection
      title="Your menus"
      subtitle="Open a menu to browse categories and items, or use guest view to preview the QR experience."
      menus={orderedMenus}
      showStatus
      onToggleArchive={handleToggleArchive}
      togglingMenuId={togglingId}
      onDeleteMenu={onRequestDeleteMenu}
      deletingMenuId={deletingMenuId}
    />
  );
}

export default function MenusListPage() {
  const [bodyKey, setBodyKey] = useState(0);
  const [pendingDeleteMenu, setPendingDeleteMenu] = useState<OwnerMenuSummary | null>(null);
  const [deletingMenuId, setDeletingMenuId] = useState<string | null>(null);

  const confirmDeleteMenu = async () => {
    if (!pendingDeleteMenu) return;
    setDeletingMenuId(pendingDeleteMenu.id);
    try {
      await deleteMenu(pendingDeleteMenu.id);
      clearReadCaches();
      setPendingDeleteMenu(null);
      setBodyKey((k) => k + 1);
    } catch {
      /* snackbar from apiJson */
    } finally {
      setDeletingMenuId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl tracking-tight text-primary md:text-4xl">
            Menus
          </h1>
          <p className="mt-2 text-on-surface-variant">
            Every menu you own — including drafts and archived versions.
          </p>
        </div>
        <Link
          to="/menus/create"
          className="primary-gradient inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl px-5 py-2.5 text-sm font-semibold text-on-primary sm:self-auto"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Create menu
        </Link>
      </div>

      <Suspense key={bodyKey} fallback={<OwnerDashboardSkeleton />}>
        <MenusListBody
          onMenusChanged={() => setBodyKey((k) => k + 1)}
          onRequestDeleteMenu={setPendingDeleteMenu}
          deletingMenuId={deletingMenuId}
        />
      </Suspense>

      <OwnerConfirmDialog
        open={pendingDeleteMenu != null}
        title="Delete menu permanently?"
        onClose={() => setPendingDeleteMenu(null)}
        onConfirm={() => void confirmDeleteMenu()}
        cancelLabel="Cancel"
        confirmLabel={deletingMenuId ? "Deleting…" : "Delete menu"}
      >
        <p>
          This removes <strong>{pendingDeleteMenu?.name}</strong>, all of its categories, dishes, and
          any CSV import jobs for that menu. This cannot be undone.
        </p>
      </OwnerConfirmDialog>
    </div>
  );
}
