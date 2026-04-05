import { X } from "lucide-react";

export type GuestFilterSnackbarProps = {
  message: string;
  onDismiss: () => void;
};

/**
 * Bottom snackbar above the guest tab bar; matches {@link OwnerSlidingActionFooter} surface (blur, border, shadow, slide-up).
 */
export function GuestFilterSnackbar({ message, onDismiss }: GuestFilterSnackbarProps) {
  return (
    <div
      className="pointer-events-none fixed bottom-20 left-0 right-0 z-[35] flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div
        className="owner-action-footer pointer-events-auto flex w-full max-w-lg items-center gap-3 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest/95 py-3 pl-4 pr-2 shadow-[0_-10px_40px_rgba(25,28,28,0.08)] backdrop-blur-md"
      >
        <span className="min-w-0 flex-1 text-sm text-on-surface">{message}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 shrink-0" />
        </button>
      </div>
    </div>
  );
}
