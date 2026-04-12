import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { fetchCsvImportJob, patchCsvImportMapping } from "@/api/csvImportJobs";
import type { CsvFieldKey } from "@/types";

const FIELDS: { key: CsvFieldKey; label: string; required?: boolean }[] = [
  { key: "name", label: "Item name", required: true },
  { key: "price", label: "Price", required: true },
  { key: "category", label: "Category", required: false },
  { key: "description", label: "Description" },
  { key: "allergens", label: "Allergens" },
];

function defaultMapping(headers: string[]): Record<CsvFieldKey, string> {
  return {
    name: headers[0] ?? "",
    price: headers[1] ?? "",
    category: headers[2] ?? "",
    description: headers[3] ?? "",
    allergens: headers[4] ?? "",
  };
}

export default function CsvStep2Page() {
  const navigate = useNavigate();
  const { menuId = "", jobId = "" } = useParams<{ menuId: string; jobId: string }>();

  const [liveHeaders, setLiveHeaders] = useState<string[]>([]);
  const [liveFileName, setLiveFileName] = useState("");
  const [liveSampleRows, setLiveSampleRows] = useState<Record<string, string>[]>([]);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveLoading, setLiveLoading] = useState(true);
  const [mapping, setMapping] = useState<Record<CsvFieldKey, string>>(() => defaultMapping([]));
  const mappingSeeded = useRef(false);

  useEffect(() => {
    mappingSeeded.current = false;
    setLiveLoading(true);
    setLiveHeaders([]);
    setLiveFileName("");
    setLiveSampleRows([]);
    setLiveError(null);
    setMapping(defaultMapping([]));

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
        if (job.status === "awaiting_mapping" && job.headers.length > 0) {
          setLiveHeaders(job.headers);
          setLiveFileName(job.fileName);
          setLiveSampleRows(job.sampleRows ?? []);
          setLiveLoading(false);
          if (!mappingSeeded.current) {
            mappingSeeded.current = true;
            setMapping(defaultMapping(job.headers));
          }
          return;
        }
        setTimeout(poll, 400);
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

  const canContinue = useMemo(
    () => Boolean(mapping.name && mapping.price),
    [mapping],
  );

  const step1Href = `/menus/${encodeURIComponent(menuId)}/import/csv`;

  if (liveError) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-on-surface-variant">{liveError}</p>
        <Link to={step1Href} className="text-primary font-medium mt-4 inline-block">
          Back to step 1
        </Link>
      </div>
    );
  }

  if (liveLoading || liveHeaders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-on-surface-variant">Preparing column mapping…</p>
      </div>
    );
  }

  const goReview = () => {
    navigate(`/menus/${encodeURIComponent(menuId)}/import/csv/${encodeURIComponent(jobId)}/review`);
  };

  const onCompleteMapping = () => {
    void (async () => {
      try {
        await patchCsvImportMapping(menuId, jobId, {
          name: mapping.name,
          price: mapping.price,
          category: mapping.category,
          description: mapping.description,
          allergens: mapping.allergens,
        });
        goReview();
      } catch {
        /* snackbar */
      }
    })();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <Link
        to={step1Href}
        className="inline-flex items-center gap-2 text-sm text-primary font-medium mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to upload
      </Link>
      <h1 className="text-4xl font-headline text-on-surface mb-2">CSV upload — step 2</h1>
      <p className="text-on-surface-variant text-lg max-w-2xl mb-4">
        Map columns from <span className="font-mono text-sm">{liveFileName}</span> to menu fields.
      </p>
      <p className="text-sm text-on-surface-variant mb-10 rounded-lg bg-surface-container-low px-4 py-3">
        <span className="font-semibold text-primary">Suggested CSV headers:</span> name, price,
        category, description, allergens — category may be left blank in the sheet for
        &quot;Uncategorised&quot;.
      </p>

      <div className="grid lg:grid-cols-12 gap-10">
        <section className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-headline text-primary mb-8">Column mapping</h2>
          <div className="space-y-4">
            {FIELDS.map((f) => (
              <div
                key={f.key}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-surface-container-low"
              >
                <div>
                  <p className="font-semibold text-on-surface">{f.label}</p>
                  <p className="text-xs text-on-surface-variant italic">
                    {f.required ? "Required" : "Recommended"}
                  </p>
                </div>
                <select
                  className="md:max-w-xs w-full bg-surface-container-lowest border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40"
                  value={mapping[f.key]}
                  onChange={(e) =>
                    setMapping((m) => ({ ...m, [f.key]: e.target.value }))
                  }
                >
                  <option value="">Select column…</option>
                  {liveHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>
        <section className="lg:col-span-5">
          <div className="rounded-xl p-6 bg-surface-container-high border-l-4 border-tertiary">
            <h3 className="text-lg font-headline text-tertiary mb-4">Data preview</h3>
            <div className="overflow-x-auto rounded-lg bg-surface-container-lowest text-xs">
              <table className="w-full text-left">
                <thead className="bg-surface-container text-on-surface-variant uppercase text-[10px]">
                  <tr>
                    {liveHeaders.slice(0, 6).map((h) => (
                      <th key={h} className="px-3 py-2 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {liveSampleRows.slice(0, 3).map((row, i) => (
                    <tr key={i} className="border-t border-surface-container-low">
                      {liveHeaders.slice(0, 6).map((h) => (
                        <td key={h} className="px-3 py-2">
                          {String(row[h] ?? "").trim()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <button
            type="button"
            disabled={!canContinue}
            onClick={onCompleteMapping}
            className="mt-8 w-full primary-gradient text-on-primary py-3 rounded-xl font-semibold disabled:opacity-40"
          >
            Complete mapping
          </button>
        </section>
      </div>
    </div>
  );
}
