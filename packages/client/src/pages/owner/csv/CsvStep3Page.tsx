import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { commitCsvImportJob, fetchCsvImportJob } from "@/api/csvImportJobs";
import { deleteMenu, fetchOwnerMenus } from "@/api/owner";
import { clearReadCaches } from "@/mocks/mockApi";
import { TableRowsSkeleton } from "@/components/skeletons/TableRowsSkeleton";
import { OwnerSlidingActionFooter } from "@/components/owner/OwnerSlidingActionFooter";
import type { CsvPreviewRow } from "@/api/csvImportJobs";

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

  const [liveRows, setLiveRows] = useState<CsvPreviewRow[] | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveLoading, setLiveLoading] = useState(true);
  const [committing, setCommitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    setLiveRows(null);
    setLiveError(null);
    setLiveLoading(true);

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
  }, [jobId, menuId]);

  const mapHref = `/menus/${encodeURIComponent(menuId)}/import/csv/${encodeURIComponent(jobId)}/map`;
  const menuHref = `/menus/${encodeURIComponent(menuId)}`;

  const onComplete = () => {
    setCommitting(true);
    void (async () => {
      try {
        await commitCsvImportJob(menuId, jobId);
        clearReadCaches();
        navigate(menuHref);
      } catch {
        setCommitting(false);
      }
    })();
  };

  /** Draft menu created for CSV-only import (`MenuCreationOptions`): drop it and return to overview. */
  const onCancelImport = () => {
    if (cancelling || committing) return;
    setCancelling(true);
    void (async () => {
      try {
        const menus = await fetchOwnerMenus();
        const meta = menus.find((m) => m.id === menuId);
        const discardDraftMenu =
          meta != null && meta.contextLabel === "CSV import" && meta.categoryCount === 0;
        if (discardDraftMenu) {
          await deleteMenu(menuId);
          clearReadCaches();
          navigate("/");
          return;
        }
        navigate(meta ? menuHref : "/");
      } catch {
        navigate(menuHref);
      } finally {
        setCancelling(false);
      }
    })();
  };

  if (liveError) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <p className="text-on-surface-variant">{liveError}</p>
        <Link to={mapHref} className="text-primary font-medium mt-4 inline-block">
          Back to mapping
        </Link>
      </div>
    );
  }

  if (liveLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <p className="text-on-surface-variant mb-6">Building review from your mapping…</p>
        <TableRowsSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 pb-28">
      <Link to={mapHref} className="inline-flex items-center gap-2 text-sm text-primary font-medium mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to mapping
      </Link>
      <h1 className="text-4xl font-headline text-primary mb-2">CSV upload — step 3</h1>
      <p className="text-on-surface-variant text-lg max-w-2xl mb-6">
        Review parsed rows. Flagged rows are skipped on import. Unknown allergen tokens are reported but do not
        block import.
      </p>
      <div className="mb-6">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Job status</span>
        <div className="h-2 bg-surface-container-low rounded-full mt-2 overflow-hidden">
          <div className="h-full w-full bg-primary rounded-full" />
        </div>
      </div>

      {liveRows ? <LivePreviewTable rows={liveRows} /> : null}

      <OwnerSlidingActionFooter
        leading={<span>{committing ? "Importing rows…" : "Ready to import reviewed rows."}</span>}
        onCancel={onCancelImport}
        onSave={onComplete}
        cancelDisabled={committing || cancelling}
        saveDisabled={committing || cancelling}
        saveLabel={committing ? "Importing…" : "Complete import"}
      />
    </div>
  );
}
