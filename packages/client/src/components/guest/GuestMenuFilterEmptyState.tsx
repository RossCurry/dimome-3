import { Link } from "react-router-dom";
import { Filter } from "lucide-react";

/**
 * Shown on the guest menu when the current search/category has dishes, but every match is hidden by allergen filters.
 */
export function GuestMenuFilterEmptyState() {
  return (
    <div
      className="rounded-2xl border border-outline-variant/15 bg-surface-container-low px-6 py-12 text-center shadow-[var(--shadow-ambient)]"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-tertiary-fixed/30 text-on-tertiary-fixed-variant">
        <Filter className="h-7 w-7" aria-hidden />
      </div>
      <h2 className="font-headline text-lg text-primary">
        No dishes match your filters
      </h2>
      <p className="mt-2 text-sm text-on-surface-variant leading-relaxed max-w-xs mx-auto">
        Everything that fits your search is hidden by your allergen choices. Adjust
        or clear filters to see options again.
      </p>
      <Link
        to="filters"
        className="mt-6 inline-flex items-center justify-center rounded-xl primary-gradient px-5 py-2.5 text-sm font-semibold text-on-primary"
      >
        Review filters
      </Link>
    </div>
  );
}
