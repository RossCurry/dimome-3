import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FileSpreadsheet } from "lucide-react";
import { useCsvImport } from "@/pages/owner/csv/CsvImportContext";

function parseCsvHeaderLine(text: string): string[] {
  const line = text.split(/\r?\n/)[0] ?? "";
  return line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
}

export default function CsvStep1Page() {
  const navigate = useNavigate();
  const { setState } = useCsvImport();
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File | null) => {
    if (!file || !file.name.toLowerCase().endsWith(".csv")) return;
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
      navigate("/owner/import/csv/map");
    };
    reader.readAsText(file.slice(0, 64 * 1024));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link
        to="/owner"
        className="inline-flex items-center gap-2 text-sm text-primary font-medium mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>
      <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
        <FileSpreadsheet className="w-4 h-4" />
        Import new menu
      </div>
      <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight mb-4">
        CSV upload — step 1
      </h1>
      <p className="text-on-surface-variant text-lg max-w-2xl mb-10">
        Select a .csv file. Column mapping is mocked; preview uses fixture rows in step 3.
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
          className="w-full py-16 rounded-xl border-2 border-dashed border-outline-variant/40 hover:border-primary/40 bg-surface-container-lowest transition-colors"
        >
          <span className="block text-primary font-headline text-lg mb-2">
            Drop file or click to browse
          </span>
          <span className="text-xs uppercase tracking-wider text-on-surface-variant">
            .csv only
          </span>
        </button>
        <p className="text-sm text-on-surface-variant mt-6">
          Or use{" "}
          <button type="button" className="text-primary font-semibold underline">
            download template
          </button>{" "}
          (stub).
        </p>
      </div>
    </div>
  );
}
