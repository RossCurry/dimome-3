import { Suspense, use, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { readScanDraft } from "@/mocks/mockApi";
import type { ScanDraftRow } from "@/types";
import { TableRowsSkeleton } from "@/components/skeletons/TableRowsSkeleton";

function ScanReviewBody() {
  const data = use(readScanDraft());
  const [rows, setRows] = useState<ScanDraftRow[]>(() => data.rows.map((r) => ({ ...r })));
  const navigate = useNavigate();

  const update = (id: string, patch: Partial<ScanDraftRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  return (
    <>
      <div className="overflow-x-auto rounded-2xl bg-surface-container-lowest shadow-sm">
        <table className="w-full text-left text-sm min-w-[640px]">
          <thead className="bg-surface-container-low text-primary font-headline">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Allergens</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-2 align-top">
                  <input
                    className="w-full bg-surface-container-low border-none rounded-lg px-2 py-1.5 text-sm"
                    value={row.name}
                    onChange={(e) => update(row.id, { name: e.target.value })}
                  />
                </td>
                <td className="px-4 py-2 align-top w-24">
                  <input
                    type="number"
                    step="0.01"
                    className="w-full bg-surface-container-low border-none rounded-lg px-2 py-1.5 text-sm"
                    value={row.price}
                    onChange={(e) =>
                      update(row.id, { price: parseFloat(e.target.value) || 0 })
                    }
                  />
                </td>
                <td className="px-4 py-2 align-top">
                  <input
                    className="w-full bg-surface-container-low border-none rounded-lg px-2 py-1.5 text-sm"
                    value={row.description}
                    onChange={(e) => update(row.id, { description: e.target.value })}
                  />
                </td>
                <td className="px-4 py-2 align-top">
                  <input
                    className="w-full bg-surface-container-low border-none rounded-lg px-2 py-1.5 text-sm"
                    value={row.allergens}
                    onChange={(e) => update(row.id, { allergens: e.target.value })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-on-surface-variant italic mt-4">
        Showing {rows.length} mock extracted items. Confirm to finish.
      </p>
      <div className="mt-8 flex gap-4">
        <button
          type="button"
          onClick={() => navigate("/owner")}
          className="primary-gradient text-on-primary px-8 py-3 rounded-xl font-semibold"
        >
          Confirm import
        </button>
        <Link
          to="/owner"
          className="px-8 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-medium"
        >
          Cancel
        </Link>
      </div>
    </>
  );
}

export default function ScanStep3Page() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <Link
        to="/owner/import/scan/progress"
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-on-surface-variant mb-2">
        <span>Step 1: Upload</span>
        <span>/</span>
        <span>Step 2: Extraction</span>
        <span>/</span>
        <span className="text-primary font-bold">Step 3: Review</span>
      </div>
      <h1 className="text-3xl font-headline text-primary mb-2">Review & verify</h1>
      <p className="text-on-surface-variant mb-8">
        Edit extracted rows before saving (mock — no persistence).
      </p>

      <Suspense fallback={<TableRowsSkeleton rows={5} />}>
        <ScanReviewBody />
      </Suspense>
    </div>
  );
}
