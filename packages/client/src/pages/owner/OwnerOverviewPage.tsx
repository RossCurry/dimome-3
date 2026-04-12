import { Suspense, useState } from "react";
import { use } from "react";
import { patchMenu } from "@/api/owner";
import { MenuCreationOptions } from "@/components/owner/MenuCreationOptions";
import { OwnerMenuCardsSection } from "@/components/owner/OwnerMenuCardsSection";
import { OwnerDashboardSkeleton } from "@/components/skeletons/OwnerDashboardSkeleton";
import type { OwnerMenuSummary } from "@/types";
import { clearReadCaches, readOwnerMenus } from "@/mocks/mockApi";

function OwnerOverviewBody({ onMenusChanged }: { onMenusChanged: () => void }) {
  const menus = use(readOwnerMenus());
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const activeMenus = menus.filter((m) => m.isActive);
  const archivedMenus = menus.filter((m) => !m.isActive);

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
    <>
      <OwnerMenuCardsSection
        title="Your active menus"
        subtitle="Different menus can represent another location, service period, or published version."
        menus={activeMenus}
        onToggleArchive={handleToggleArchive}
        togglingMenuId={togglingId}
      />

      {archivedMenus.length > 0 ? (
        <div className="mt-10">
          <OwnerMenuCardsSection
            title="Archived menus"
            subtitle="Inactive versions still appear here and on Menus — open to review or copy items."
            menus={archivedMenus}
            showStatus
            onToggleArchive={handleToggleArchive}
            togglingMenuId={togglingId}
          />
        </div>
      ) : null}

      <section className="mt-12">
        <h2 className="mb-6 font-headline text-xl text-primary">Quick actions</h2>
        <MenuCreationOptions
          layout="vertical"
          onAfterDraftCreated={onMenusChanged}
        />
      </section>
    </>
  );
}

export default function OwnerOverviewPage() {
  const [bodyKey, setBodyKey] = useState(0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-10">
        <h1 className="font-headline text-3xl tracking-tight text-primary md:text-4xl">
          Overview
        </h1>
        <p className="mt-2 text-on-surface-variant">
          Quick snapshot of menus you are running now.
        </p>
      </div>

      <Suspense key={bodyKey} fallback={<OwnerDashboardSkeleton />}>
        <OwnerOverviewBody onMenusChanged={() => setBodyKey((k) => k + 1)} />
      </Suspense>
    </div>
  );
}
