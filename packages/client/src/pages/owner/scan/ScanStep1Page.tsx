import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";

export default function ScanStep1Page() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-on-surface-variant mb-2">
        AI tools
        <span className="text-primary">/</span>
        <span className="text-primary">Image extraction</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight mb-4">
        Step 1: Upload
      </h1>
      <p className="text-on-surface-variant text-lg max-w-2xl mb-10">
        Upload a photo of a physical menu. The next steps simulate AI extraction with mock data.
      </p>

      <div className="rounded-3xl bg-surface-container-lowest p-8 md:p-12 shadow-[var(--shadow-ambient)]">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={() => navigate("/import/scan/progress")}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full min-h-[240px] rounded-2xl border-2 border-dashed border-outline-variant/40 hover:border-primary/40 bg-surface-container-low flex flex-col items-center justify-center gap-4 transition-colors"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera className="w-8 h-8 text-primary" />
          </div>
          <span className="font-headline text-lg text-primary">Choose menu photo</span>
          <span className="text-xs text-on-surface-variant">Or skip and run mock extraction</span>
        </button>
        <button
          type="button"
          onClick={() => navigate("/import/scan/progress")}
          className="mt-6 w-full py-3 rounded-xl border border-primary/30 text-primary font-semibold"
        >
          Skip upload — mock scan
        </button>
        <p className="text-xs text-on-surface-variant mt-6 text-center">
          Secure upload (mock) — no file leaves your browser in this demo.
        </p>
      </div>
    </div>
  );
}
