import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Sparkles } from "lucide-react";

const STEPS = [
  "Image normalization",
  "Extracting item names…",
  "Detecting prices…",
  "Scanning for allergens…",
];

export default function ScanStep2Page() {
  const navigate = useNavigate();
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const t0 = window.setInterval(() => {
      setPct((p) => Math.min(100, p + 3));
    }, 120);
    const t1 = window.setTimeout(() => navigate("/owner/import/scan/review"), 2800);
    return () => {
      window.clearInterval(t0);
      window.clearTimeout(t1);
    };
  }, [navigate]);

  const doneIdx = Math.min(
    STEPS.length - 1,
    Math.max(-1, Math.floor((pct / 100) * STEPS.length) - 1),
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <Link
        to="/owner/import/scan"
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>
      <h1 className="text-4xl font-headline text-primary mb-4">Step 2: Extraction in progress</h1>
      <p className="text-on-surface-variant text-lg max-w-2xl mb-10">
        Mock pipeline — progress auto-advances to review.
      </p>

      <div className="grid lg:grid-cols-12 gap-8">
        <section className="lg:col-span-7 rounded-3xl bg-surface-container-lowest p-8 min-h-[280px] flex flex-col justify-center items-center shadow-sm">
          <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl bg-surface-dim overflow-hidden">
            <div className="absolute inset-0 bg-primary/5" />
            <div
              className="absolute left-0 right-0 h-1 bg-primary-fixed-dim shadow-[0_0_12px_#9ed1bd] animate-pulse"
              style={{ top: `${pct}%` }}
            />
            <p className="absolute bottom-4 left-4 text-xs font-bold text-primary bg-surface-container-lowest/90 px-2 py-1 rounded">
              Live scanning view (mock)
            </p>
          </div>
        </section>
        <section className="lg:col-span-5 flex flex-col gap-6">
          <div className="primary-gradient text-on-primary p-8 rounded-3xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-sm opacity-80 mb-1">Total completion</p>
              <div className="flex justify-between items-end mb-4">
                <span className="text-5xl font-headline font-bold">{pct}%</span>
                <Sparkles className="w-10 h-10 opacity-50" />
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-fixed-dim rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-3xl space-y-4">
            <h3 className="font-headline font-bold text-lg text-primary">Live extraction logs</h3>
            {STEPS.map((label, i) => {
              const complete = i <= doneIdx;
              const active = i === doneIdx + 1;
              return (
                <div key={label} className="flex gap-3 items-start">
                  <div
                    className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      complete ? "bg-primary text-on-primary" : "bg-surface-container-high"
                    }`}
                  >
                    {complete ? <Check className="w-4 h-4" /> : null}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-[10px] text-on-surface-variant">
                      {complete ? "Success" : active ? "Running…" : "Pending"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
