import { use } from "react";
import { Link } from "react-router-dom";
import { Camera, ClipboardList, Upload } from "lucide-react";
import { useMocks } from "@/lib/env";
import { readOwnerMenus } from "@/mocks/mockApi";
import { OwnerMenuCardsSection } from "@/components/owner/OwnerMenuCardsSection";

export default function OwnerOverviewPage() {
  const mocks = useMocks();
  const menus = use(readOwnerMenus());
  const activeMenus = menus.filter((m) => m.isActive);
  const archivedMenus = menus.filter((m) => !m.isActive);

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

      <OwnerMenuCardsSection
        title="Your active menus"
        subtitle="Different menus can represent another location, service period, or published version."
        menus={activeMenus}
      />

      {archivedMenus.length > 0 ? (
        <div className="mt-10">
          <OwnerMenuCardsSection
            title="Archived menus"
            subtitle="Inactive versions still appear here and on Menus — open to review or copy items."
            menus={archivedMenus}
            showStatus
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
            <Link
              to="/menus/menu-1/category/cat-1"
              className="flex w-full items-center gap-4 rounded-xl p-4 text-left transition-colors hover:bg-primary/5"
            >
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Build via form</p>
                <p className="text-xs text-on-surface-variant">Edit items manually</p>
              </div>
            </Link>
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
    </div>
  );
}
