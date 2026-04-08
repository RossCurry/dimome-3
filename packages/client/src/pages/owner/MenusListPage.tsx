import { Suspense, useState } from "react";
import { use } from "react";
import { patchMenu } from "@/api/owner";
import { OwnerMenuCardsSection } from "@/components/owner/OwnerMenuCardsSection";
import { OwnerDashboardSkeleton } from "@/components/skeletons/OwnerDashboardSkeleton";
import { useMocks } from "@/lib/env";
import type { OwnerMenuSummary } from "@/types";
import { clearReadCaches, readOwnerMenus } from "@/mocks/mockApi";

function MenusListBody({ onMenusChanged }: { onMenusChanged: () => void }) {
  const mocks = useMocks();
  const menus = use(readOwnerMenus());
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const orderedMenus = [...menus].sort((a, b) => {
    if (a.isActive === b.isActive) return 0;
    return a.isActive ? -1 : 1;
  });

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

  return (
    <OwnerMenuCardsSection
      title="Your menus"
      subtitle="Open a menu to browse categories and items, or use guest view to preview the QR experience."
      menus={orderedMenus}
      showStatus
      onToggleArchive={mocks ? undefined : handleToggleArchive}
      togglingMenuId={togglingId}
    />
  );
}

export default function MenusListPage() {
  const mocks = useMocks();
  const [bodyKey, setBodyKey] = useState(0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-10">
        <h1 className="font-headline text-3xl tracking-tight text-primary md:text-4xl">
          Menus
        </h1>
        <p className="mt-2 text-on-surface-variant">
          Every menu you own — including drafts and archived versions
          {mocks ? " (mock)." : "."}
        </p>
      </div>

      <Suspense key={bodyKey} fallback={<OwnerDashboardSkeleton />}>
        <MenusListBody onMenusChanged={() => setBodyKey((k) => k + 1)} />
      </Suspense>
    </div>
  );
}
