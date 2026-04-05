import { Suspense, use } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { readCsvPreview } from "@/mocks/mockApi";
import { TableRowsSkeleton } from "@/components/skeletons/TableRowsSkeleton";

function ReviewTable() {
  const data = use(readCsvPreview());
  return (
    <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-container-low text-primary font-headline">
          <tr>
            <th className="px-6 py-4">Dish</th>
            <th className="px-6 py-4">Price</th>
            <th className="px-6 py-4">Allergen tags</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {data.rows.map((row, i) => (
            <tr key={i} className={row.flagged ? "bg-tertiary-fixed/30" : ""}>
              <td className="px-6 py-4 font-medium">{row.name}</td>
              <td className="px-6 py-4">${row.price}</td>
              <td className="px-6 py-4">
                <span className="text-xs bg-secondary-fixed text-on-secondary-fixed-variant px-2 py-1 rounded-full">
                  {row.allergens}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-on-surface-variant">
                {row.flagged ? "Review suggested" : "OK"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CsvStep3Page() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <Link
        to="/owner/import/csv/map"
        className="inline-flex items-center gap-2 text-sm text-primary font-medium mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to mapping
      </Link>
      <h1 className="text-4xl font-headline text-primary mb-2">CSV upload — step 3</h1>
      <p className="text-on-surface-variant text-lg max-w-2xl mb-6">
        Review mock import data before finalizing.
      </p>
      <div className="mb-6">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
          Upload progress
        </span>
        <div className="h-2 bg-surface-container-low rounded-full mt-2 overflow-hidden">
          <div className="h-full w-4/5 bg-primary rounded-full" />
        </div>
      </div>

      <Suspense fallback={<TableRowsSkeleton rows={4} />}>
        <ReviewTable />
      </Suspense>

      <div className="mt-10 flex gap-4">
        <button
          type="button"
          onClick={() => navigate("/owner")}
          className="primary-gradient text-on-primary px-8 py-3 rounded-xl font-semibold"
        >
          Complete import
        </button>
        <Link
          to="/owner"
          className="px-8 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-medium"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
