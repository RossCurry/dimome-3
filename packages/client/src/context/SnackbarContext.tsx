import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { setApiErrorNotifier } from "@/api/errorNotifier";
import { GuestFilterSnackbar } from "@/components/guest/GuestFilterSnackbar";

const AUTO_DISMISS_MS = 4500;

/**
 * Renders {@link GuestFilterSnackbar} for API errors fired via {@link notifyApiError} from `apiJson`.
 */
export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [snack, setSnack] = useState<{ text: string; key: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setSnack(null);
  }, []);

  useEffect(() => {
    const handler = (message: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setSnack({ text: message, key: Date.now() });
      timerRef.current = setTimeout(() => {
        setSnack(null);
        timerRef.current = null;
      }, AUTO_DISMISS_MS);
    };
    setApiErrorNotifier(handler);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setApiErrorNotifier(null);
    };
  }, []);

  return (
    <>
      {children}
      {snack ? (
        <GuestFilterSnackbar
          key={snack.key}
          message={snack.text}
          onDismiss={dismiss}
          bottomClass="bottom-20"
          zClass="z-[100]"
        />
      ) : null}
    </>
  );
}
