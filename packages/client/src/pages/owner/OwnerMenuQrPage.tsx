import { useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, Mail } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { guestMenuQrUrl } from "@/lib/publicAppUrl";

function safeFilenameSegment(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "") || "menu";
}

export default function OwnerMenuQrPage() {
  const { menuId = "" } = useParams<{ menuId: string }>();
  const targetUrl = menuId ? guestMenuQrUrl(menuId) : "";
  const qrSvgRef = useRef<SVGSVGElement>(null);

  const downloadQrSvg = () => {
    const el = qrSvgRef.current;
    if (!el) return;
    const svg = el.cloneNode(true) as SVGSVGElement;
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    if (!svg.getAttribute("xmlns:xlink")) {
      svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    }
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeFilenameSegment(menuId)}-qr.svg`;
    a.rel = "noopener";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <Link
        to={`/menus/${encodeURIComponent(menuId)}`}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to menu
      </Link>

      <h1 className="font-headline text-3xl tracking-tight text-primary md:text-4xl">Menu QR</h1>
      <p className="mt-3 text-on-surface-variant">
        Scan with a phone camera to open the guest menu. The link below is what is encoded in the QR.
      </p>

      {targetUrl ? (
        <>
          <div className="mt-10 flex justify-center rounded-2xl border border-outline-variant/20 bg-surface-container-low p-8">
            <QRCodeSVG ref={qrSvgRef} value={targetUrl} size={240} level="M" marginSize={2} />
          </div>
          <p className="mt-6 break-all text-center font-mono text-xs text-on-surface-variant">{targetUrl}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={downloadQrSvg}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-2.5 text-sm font-semibold text-primary transition hover:border-primary/40 hover:bg-surface-container"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden />
              Download
            </button>
            <button
              type="button"
              disabled
              title="Coming soon"
              className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-low/60 px-4 py-2.5 text-sm font-semibold text-on-surface-variant opacity-60"
            >
              <Mail className="h-4 w-4 shrink-0" aria-hidden />
              Email
            </button>
          </div>
        </>
      ) : (
        <p className="mt-8 text-on-surface-variant">Missing menu id.</p>
      )}
    </div>
  );
}
