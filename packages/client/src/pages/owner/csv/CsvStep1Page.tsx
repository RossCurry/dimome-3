import { useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileSpreadsheet } from "lucide-react";
import { createCsvImportJob } from "@/api/csvImportJobs";
import { useCsvImport } from "@/pages/owner/csv/CsvImportContext";
import { useMocks } from "@/lib/env";

const MOCK_CSV_JOB_ID = "local";

function parseCsvHeaderLine(text: string): string[] {
  const line = text.split(/\r?\n/)[0] ?? "";
  return line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
}

export default function CsvStep1Page() {
  const navigate = useNavigate();
  const { menuId = "" } = useParams<{ menuId: string }>();
  const mocks = useMocks();
  const { setState } = useCsvImport();
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File | null) => {
    if (!file || !file.name.toLowerCase().endsWith(".csv")) return;
    if (mocks) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === "string" ? reader.result : "";
        const headers = parseCsvHeaderLine(text);
        const lines = text.split(/\r?\n/).slice(0, 6);
        setState({
          fileName: file.name,
          headers: headers.length ? headers : ["Column A", "Column B"],
          rawSampleLines: lines,
        });
        navigate(`${MOCK_CSV_JOB_ID}/map`);
      };
      reader.readAsText(file.slice(0, 64 * 1024));
      return;
    }
    void (async () => {
      try {
        const { id } = await createCsvImportJob(menuId, file);
        navigate(`${id}/map`);
      } catch {
        /* snackbar */
      }
    })();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link
        to={`/menus/${encodeURIComponent(menuId)}`}
        className="inline-flex items-center gap-2 text-sm text-primary font-medium mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to menu
      </Link>
      <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
        <FileSpreadsheet className="w-4 h-4" />
        Import CSV
      </div>
      <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight mb-4">
        CSV upload — step 1
      </h1>
      <p className="text-on-surface-variant text-lg max-w-2xl mb-10">
        Select a .csv file. Required columns include <strong>name</strong>, <strong>price</strong>, and{" "}
        <strong>category</strong> (use &quot;Uncategorised&quot; in the file or leave category blank to assign
        automatically). Optional: description, allergens (comma-separated, e.g. eggs, milk).
        {mocks ? " Mock mode uses local preview only." : " The server parses your file and opens mapping when ready."}
      </p>

      <div className="rounded-2xl bg-surface-container-low p-10 border border-outline-variant/10">
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full py-4 rounded-xl primary-gradient text-on-primary font-semibold"
        >
          Choose CSV file
        </button>
      </div>
    </div>
  );
}
