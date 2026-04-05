import type { ReactNode } from "react";

export type OwnerSlidingActionFooterProps = {
  /** Hide while a higher overlay is open (e.g. {@link OwnerConfirmDialog}). */
  hidden?: boolean;
  /** Optional content on the left (title, unsaved hint, etc.). */
  leading?: ReactNode;
  onCancel: () => void;
  onSave: () => void;
  cancelLabel?: string;
  saveLabel?: string;
};

/**
 * Fixed bottom bar that slides up over the owner main column (clears the md sidebar).
 * Reusable for item / category / menu flows. Optionally pair with {@link OwnerConfirmDialog} for an extra confirm step.
 */
export function OwnerSlidingActionFooter({
  hidden = false,
  leading,
  onCancel,
  onSave,
  cancelLabel = "Cancel",
  saveLabel = "Save",
}: OwnerSlidingActionFooterProps) {
  if (hidden) return null;

  return (
    <footer
      className="owner-action-footer fixed bottom-0 left-0 right-0 z-40 border-t border-outline-variant/15 bg-surface-container-lowest/95 py-4 shadow-[0_-10px_40px_rgba(25,28,28,0.08)] backdrop-blur-md md:left-72"
      role="region"
      aria-label="Form actions"
    >
      <div
        className={`mx-auto flex max-w-6xl gap-3 px-6 ${
          leading
            ? "flex-col sm:flex-row sm:items-center sm:justify-between"
            : "justify-end"
        }`}
      >
        {leading ? (
          <div className="min-w-0 text-sm text-on-surface-variant">{leading}</div>
        ) : null}
        <div className="flex shrink-0 justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onSave}
            className="primary-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-on-primary"
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </footer>
  );
}
