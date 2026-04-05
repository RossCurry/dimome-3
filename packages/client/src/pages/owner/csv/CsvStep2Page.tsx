import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCsvImport } from "@/pages/owner/csv/CsvImportContext";
import type { CsvFieldKey } from "@/types";

const FIELDS: { key: CsvFieldKey; label: string; required?: boolean }[] = [
  { key: "name", label: "Item name", required: true },
  { key: "price", label: "Price", required: true },
  { key: "description", label: "Description" },
  { key: "allergens", label: "Allergens" },
];

export default function CsvStep2Page() {
  const navigate = useNavigate();
  const { state } = useCsvImport();
  const headers = state?.headers ?? [];

  const [mapping, setMapping] = useState<Record<CsvFieldKey, string>>(() => ({
    name: headers[0] ?? "",
    price: headers[1] ?? "",
    description: headers[2] ?? "",
    allergens: headers[3] ?? "",
  }));

  const canContinue = useMemo(
    () => Boolean(mapping.name && mapping.price),
    [mapping],
  );

  if (!state) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-on-surface-variant">No file selected.</p>
        <Link to="/import/csv" className="text-primary font-medium mt-4 inline-block">
          Go to step 1
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <Link
        to="/import/csv"
        className="inline-flex items-center gap-2 text-sm text-primary font-medium mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to upload
      </Link>
      <h1 className="text-4xl font-headline text-on-surface mb-2">CSV upload — step 2</h1>
      <p className="text-on-surface-variant text-lg max-w-2xl mb-10">
        Map columns from <span className="font-mono text-sm">{state.fileName}</span> to menu
        fields.
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
                  {headers.map((h) => (
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
                    {headers.slice(0, 4).map((h) => (
                      <th key={h} className="px-3 py-2 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {state.rawSampleLines.slice(1, 4).map((line, i) => (
                    <tr key={i} className="border-t border-surface-container-low">
                      {line.split(",").slice(0, 4).map((cell, j) => (
                        <td key={j} className="px-3 py-2">
                          {cell.trim()}
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
            onClick={() => navigate("/import/csv/review")}
            className="mt-8 w-full primary-gradient text-on-primary py-3 rounded-xl font-semibold disabled:opacity-40"
          >
            Complete mapping
          </button>
        </section>
      </div>
    </div>
  );
}
