import { Suspense, useState } from "react";
import { use } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, ClipboardList, Upload } from "lucide-react";
import { createMenu, patchMenu } from "@/api/owner";
import { OwnerMenuCardsSection } from "@/components/owner/OwnerMenuCardsSection";
import { OwnerDashboardSkeleton } from "@/components/skeletons/OwnerDashboardSkeleton";
import { useMocks } from "@/lib/env";
import type { OwnerMenuSummary } from "@/types";
import { clearReadCaches, readOwnerMenus } from "@/mocks/mockApi";

function OwnerOverviewBody({ onMenusChanged }: { onMenusChanged: () => void }) {
  const mocks = useMocks();
  const navigate = useNavigate();
  const menus = use(readOwnerMenus());
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [creatingMenu, setCreatingMenu] = useState(false);

  const activeMenus = menus.filter((m) => m.isActive);
  const archivedMenus = menus.filter((m) => !m.isActive);

  const handleToggleArchive = async (m: OwnerMenuSummary) => {
    if (mocks) return;
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

  const handleCreateMenu = async () => {
    if (mocks) {
      navigate("/menus/menu-1/category/cat-1");
      return;
    }
    setCreatingMenu(true);
    try {
      const created = await createMenu({
        name: "Untitled menu",
        contextLabel: "Draft",
      });
      clearReadCaches();
      onMenusChanged();
      navigate(`/menus/${created.id}`);
    } catch {
      /* snackbar */
    } finally {
      setCreatingMenu(false);
    }
  };

  return (
    <>
      <OwnerMenuCardsSection
        title="Your active menus"
        subtitle="Different menus can represent another location, service period, or published version."
        menus={activeMenus}
        onToggleArchive={mocks ? undefined : handleToggleArchive}
        togglingMenuId={togglingId}
      />

      {archivedMenus.length > 0 ? (
        <div className="mt-10">
          <OwnerMenuCardsSection
            title="Archived menus"
            subtitle="Inactive versions still appear here and on Menus — open to review or copy items."
            menus={archivedMenus}
            showStatus
            onToggleArchive={mocks ? undefined : handleToggleArchive}
            togglingMenuId={togglingId}
          />
        </div>
      ) : null}

      <section className="mt-12">
        <h2 className="mb-6 font-headline text-xl text-primary">Quick actions</h2>
        <div className="flex flex-col gap-2 rounded-2xl bg-surface-container-low p-2">
          <div className="space-y-2 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
            <h3 className="mb-2 flex items-center gap-2 font-headline font-bold text-primary">
              Create new menu
            </h3>
            <button
              type="button"
              disabled={creatingMenu}
              onClick={() => void handleCreateMenu()}
              className="flex w-full items-center gap-4 rounded-xl p-4 text-left transition-colors hover:bg-primary/5 disabled:opacity-50"
            >
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Build via form</p>
                <p className="text-xs text-on-surface-variant">
                  {mocks ? "Edit items manually (mock)" : "Create a draft menu and add categories"}
                </p>
              </div>
            </button>
            <Link
              to="/import/csv"
              className="flex w-full items-center gap-4 rounded-xl p-4 text-left transition-colors hover:bg-primary/5"
            >
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Upload CSV</p>
                <p className="text-xs text-on-surface-variant">Bulk import (mock)</p>
              </div>
            </Link>
            <Link
              to="/import/scan"
              className="flex w-full items-center gap-4 rounded-xl p-4 text-left transition-colors hover:bg-primary/5"
            >
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Scan image</p>
                <p className="text-xs text-on-surface-variant">AI menu OCR (mock)</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default function OwnerOverviewPage() {
  const mocks = useMocks();
  const [bodyKey, setBodyKey] = useState(0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-10">
        <h1 className="font-headline text-3xl tracking-tight text-primary md:text-4xl">
          Overview
        </h1>
        <p className="mt-2 text-on-surface-variant">
          Quick snapshot of menus you are running now
          {mocks ? " — data is mocked." : "."}
        </p>
      </div>

      <Suspense key={bodyKey} fallback={<OwnerDashboardSkeleton />}>
        <OwnerOverviewBody onMenusChanged={() => setBodyKey((k) => k + 1)} />
      </Suspense>
    </div>
  );
}
