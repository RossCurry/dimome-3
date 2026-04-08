type Notifier = (message: string) => void;

let notifier: Notifier | null = null;

/** Registered by `SnackbarProvider` so `apiJson` can surface errors without React imports here. */
export function setApiErrorNotifier(fn: Notifier | null): void {
  notifier = fn;
}

export function notifyApiError(message: string): void {
  notifier?.(message);
}
