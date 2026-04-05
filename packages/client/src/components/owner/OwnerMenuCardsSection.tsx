import { Link } from "react-router-dom";
import { ChevronRight, ExternalLink } from "lucide-react";
import type { OwnerMenuSummary } from "@/types";

type Props = {
  title: string;
  subtitle?: string;
  menus: OwnerMenuSummary[];
  /** When true, show active/archived pill (full menus list). */
  showStatus?: boolean;
};

export function OwnerMenuCardsSection({
  title,
  subtitle,
  menus,
  showStatus = false,
}: Props) {
  return (
    <section className="rounded-2xl bg-surface-container-lowest p-6 shadow-[var(--shadow-ambient)] md:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-headline text-primary">{title}</h2>
        {subtitle ? (
          <p className="mt-2 text-sm text-on-surface-variant">{subtitle}</p>
        ) : null}
      </div>
      {menus.length === 0 ? (
        <p className="text-sm text-on-surface-variant">No menus to show.</p>
      ) : (
        <ul className="space-y-4">
          {menus.map((m) => (
            <li key={m.id}>
              <div className="flex flex-col gap-4 rounded-2xl border border-outline-variant/10 bg-surface-container-low/40 p-5 sm:flex-row sm:items-center">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-container-low">
                  <img src={m.thumbnail} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-headline text-lg text-primary">{m.name}</h3>
                    {showStatus ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          m.isActive
                            ? "bg-primary-fixed-dim/50 text-on-primary-fixed-variant"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        {m.isActive ? "Active" : "Archived"}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-on-surface-variant">{m.contextLabel}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    Updated {m.lastUpdatedLabel} · {m.categoryCount} categories ·{" "}
                    {m.itemCount} items
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-stretch md:flex-row">
                  <Link
                    to={`/menu/${m.id}`}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-outline-variant/20 px-4 py-2 text-sm font-medium text-secondary hover:bg-surface-container-low"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    Guest view
                  </Link>
                  <Link
                    to={`/menus/${m.id}`}
                    className="primary-gradient inline-flex items-center justify-center gap-1 rounded-xl px-4 py-2 text-sm font-semibold text-on-primary"
                  >
                    Open in owner
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
