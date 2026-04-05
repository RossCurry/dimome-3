import { useEffect, useId, type ReactNode } from "react";

export type OwnerConfirmDialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  children?: ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
};

/**
 * Generic owner-app dialog: title, body (`children`), Cancel + primary action (right-aligned).
 *
 * **Not wired on any route yet** — reserved for upcoming flows (e.g. save summary / diff overview,
 * destructive confirms, multi-step publish). Use `z-[90]` so it sits above {@link OwnerSlidingActionFooter}
 * and below global modals such as category create (`z-[100]`).
 */
export function OwnerConfirmDialog({
  open,
  title,
  onClose,
  onConfirm,
  children,
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
}: OwnerConfirmDialogProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-lg rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-[var(--shadow-ambient)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="font-headline text-lg text-primary">
          {title}
        </h2>
        {children ? <div className="mt-4 text-sm text-on-surface">{children}</div> : null}
        <div className="mt-6 flex justify-end gap-3 border-t border-outline-variant/10 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="primary-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-on-primary"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
