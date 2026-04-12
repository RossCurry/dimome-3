import { useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileSpreadsheet } from "lucide-react";
import { createCsvImportJob } from "@/api/csvImportJobs";

export default function CsvStep1Page() {
  const navigate = useNavigate();
  const { menuId = "" } = useParams<{ menuId: string }>();
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File | null) => {
    if (!file || !file.name.toLowerCase().endsWith(".csv")) return;
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
        automatically). Optional: description, allergens (comma-separated, e.g. eggs, milk). The server parses
        your file and opens mapping when ready.
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
