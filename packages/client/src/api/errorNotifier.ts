type Notifier = (message: string) => void;

let notifier: Notifier | null = null;

/**
 * Registered by `SnackbarProvider` so `apiJson` can surface errors without React imports here.
 */
export function setApiErrorNotifier(fn: Notifier | null): void {
  notifier = fn;
}

/**
 * Show a user-visible API/network error if a notifier is registered (e.g. snackbar).
 */
export function notifyApiError(message: string): void {
  notifier?.(message);
}
