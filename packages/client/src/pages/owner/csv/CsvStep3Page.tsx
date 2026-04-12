import { Suspense, useEffect, useState, use } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { commitCsvImportJob, fetchCsvImportJob } from "@/api/csvImportJobs";
import { clearReadCaches, readCsvPreview } from "@/mocks/mockApi";
import { TableRowsSkeleton } from "@/components/skeletons/TableRowsSkeleton";
import { useMocks } from "@/lib/env";
import type { CsvPreviewRow } from "@/api/csvImportJobs";
import type { CsvPreviewData } from "@/types";

const MOCK_CSV_JOB_ID = "local";

function MockReviewTable() {
  const data = use(readCsvPreview());
  return <PreviewTableFromFixture data={data} />;
}

function PreviewTableFromFixture({ data }: { data: CsvPreviewData }) {
  return (
    <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-container-low text-primary font-headline">
          <tr>
            <th className="px-6 py-4">Dish</th>
            <th className="px-6 py-4">Price</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Allergen tags</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {data.rows.map((row, i) => (
            <tr key={i} className={row.flagged ? "bg-tertiary-fixed/30" : ""}>
              <td className="px-6 py-4 font-medium">{row.name}</td>
              <td className="px-6 py-4">${row.price}</td>
              <td className="px-6 py-4 text-on-surface-variant">{row.category ?? "—"}</td>
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

function LivePreviewTable({ rows }: { rows: CsvPreviewRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-container-low text-primary font-headline">
          <tr>
            <th className="px-6 py-4">Dish</th>
            <th className="px-6 py-4">Price</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Allergens</th>
            <th className="px-6 py-4">Issues</th>
            <th className="px-6 py-4">Import</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {rows.map((row) => (
            <tr key={row.rowIndex} className={row.flagged ? "bg-tertiary-fixed/30" : ""}>
              <td className="px-6 py-4 font-medium">{row.name}</td>
              <td className="px-6 py-4">${row.price}</td>
              <td className="px-6 py-4 text-on-surface-variant">{row.category}</td>
              <td className="px-6 py-4 text-xs">{row.allergensDisplay}</td>
              <td className="px-6 py-4 text-xs text-on-surface-variant">
                {row.issues.length ? row.issues.join("; ") : "—"}
              </td>
              <td className="px-6 py-4 text-xs">{row.flagged ? "Skip" : "OK"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CsvStep3Page() {
  const navigate = useNavigate();
  const { menuId = "", jobId = "" } = useParams<{ menuId: string; jobId: string }>();
  const mocks = useMocks();
  const isMockJob = mocks && jobId === MOCK_CSV_JOB_ID;

  const [liveRows, setLiveRows] = useState<CsvPreviewRow[] | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveLoading, setLiveLoading] = useState(!isMockJob);
  const [committing, setCommitting] = useState(false);

  useEffect(() => {
    if (isMockJob) {
      setLiveLoading(false);
      return;
    }
    let cancelled = false;
    const poll = async () => {
      try {
        const job = await fetchCsvImportJob(menuId, jobId);
        if (cancelled) return;
        if (job.status === "failed") {
          setLiveError(job.errorMessage ?? "Import failed");
          setLiveLoading(false);
          return;
        }
        if (job.status === "ready_for_review" && job.previewRows) {
          setLiveRows(job.previewRows);
          setLiveLoading(false);
          return;
        }
        setTimeout(poll, 450);
      } catch {
        if (!cancelled) setLiveError("Could not load import job");
        setLiveLoading(false);
      }
    };
    void poll();
    return () => {
      cancelled = true;
    };
  }, [isMockJob, jobId, menuId]);

  const mapHref = `/menus/${encodeURIComponent(menuId)}/import/csv/${encodeURIComponent(jobId)}/map`;

  const onComplete = () => {
    if (isMockJob) {
      navigate(`/menus/${encodeURIComponent(menuId)}`);
      return;
    }
    setCommitting(true);
    void (async () => {
      try {
        await commitCsvImportJob(menuId, jobId);
        clearReadCaches();
        navigate(`/menus/${encodeURIComponent(menuId)}`);
      } catch {
        setCommitting(false);
      }
    })();
  };

  if (!isMockJob && liveError) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <p className="text-on-surface-variant">{liveError}</p>
        <Link to={mapHref} className="text-primary font-medium mt-4 inline-block">
          Back to mapping
        </Link>
      </div>
    );
  }

  if (!isMockJob && liveLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <p className="text-on-surface-variant mb-6">Building review from your mapping…</p>
        <TableRowsSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <Link to={mapHref} className="inline-flex items-center gap-2 text-sm text-primary font-medium mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to mapping
      </Link>
      <h1 className="text-4xl font-headline text-primary mb-2">CSV upload — step 3</h1>
      <p className="text-on-surface-variant text-lg max-w-2xl mb-6">
        {isMockJob
          ? "Review mock import data before finalizing."
          : "Review parsed rows. Flagged rows are skipped on import. Unknown allergen tokens are reported but do not block import."}
      </p>
      <div className="mb-6">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
          {isMockJob ? "Upload progress" : "Job status"}
        </span>
        <div className="h-2 bg-surface-container-low rounded-full mt-2 overflow-hidden">
          <div className="h-full w-full bg-primary rounded-full" />
        </div>
      </div>

      {isMockJob ? (
        <Suspense fallback={<TableRowsSkeleton rows={4} />}>
          <MockReviewTable />
        </Suspense>
      ) : liveRows ? (
        <LivePreviewTable rows={liveRows} />
      ) : null}

      <div className="mt-10 flex gap-4">
        <button
          type="button"
          disabled={committing}
          onClick={onComplete}
          className="primary-gradient text-on-primary px-8 py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {isMockJob ? "Done" : committing ? "Importing…" : "Complete import"}
        </button>
        <Link
          to={`/menus/${encodeURIComponent(menuId)}`}
          className="px-8 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-medium"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
