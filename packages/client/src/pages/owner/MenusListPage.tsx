import { use } from "react";
import { useMocks } from "@/lib/env";
import { readOwnerMenus } from "@/mocks/mockApi";
import { OwnerMenuCardsSection } from "@/components/owner/OwnerMenuCardsSection";

export default function MenusListPage() {
  const mocks = useMocks();
  const menus = use(readOwnerMenus());
  const orderedMenus = [...menus].sort((a, b) => {
    if (a.isActive === b.isActive) return 0;
    return a.isActive ? -1 : 1;
  });

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

      <OwnerMenuCardsSection
        title="Your menus"
        subtitle="Open a menu to browse categories and items, or use guest view to preview the QR experience."
        menus={orderedMenus}
        showStatus
      />
    </div>
  );
}
