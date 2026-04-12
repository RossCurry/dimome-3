import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, ClipboardList, Upload, X } from "lucide-react";
import { createMenu } from "@/api/owner";
import { clearReadCaches } from "@/mocks/mockApi";

type Layout = "vertical" | "horizontal";

export type MenuCreationOptionsProps = {
  layout: Layout;
  /** Shown above the option cards (overview keeps “Create new menu”; hub page omits). */
  showInnerHeading?: boolean;
  /** After a successful API draft create. */
  onAfterDraftCreated?: () => void;
};

function useStartCsvImport(onAfterDraftCreated?: () => void) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const startCsv = useCallback(async () => {
    setBusy(true);
    try {
      const created = await createMenu({
        name: "Untitled menu",
        contextLabel: "CSV import",
      });
      clearReadCaches();
      onAfterDraftCreated?.();
      navigate(`/menus/${created.id}/import/csv`);
    } catch {
      /* snackbar */
    } finally {
      setBusy(false);
    }
  }, [navigate, onAfterDraftCreated]);

  return { startCsv, busy };
}

const optionRowClass =
  "flex items-center gap-4 rounded-xl p-4 text-left transition-colors hover:bg-primary/5";
const optionColClass =
  "flex h-full flex-col gap-3 rounded-xl border border-outline-variant/10 bg-surface-container-low/30 p-5 text-left transition-colors hover:bg-primary/5 md:min-h-[140px]";

function trimmedName(name: string): boolean {
  return name.trim().length > 0;
}

function BuildFormMenuModal({
  titleId,
  newMenuName,
  setNewMenuName,
  inputRef,
  creatingMenu,
  canSubmit,
  onClose,
  onSubmit,
}: {
  titleId: string;
  newMenuName: string;
  setNewMenuName: (v: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  creatingMenu: boolean;
  canSubmit: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
        className="relative w-full max-w-md rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-[var(--shadow-ambient)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="mb-4 font-headline text-lg text-primary">
          Menu name
        </h2>
        <div className="relative mb-6">
          <input
            ref={inputRef}
            type="text"
            value={newMenuName}
            onChange={(e) => setNewMenuName(e.target.value)}
            placeholder="e.g. Lunch patio"
            className="w-full rounded-xl border-none bg-surface-container-low py-3 pl-4 pr-11 text-on-surface placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40"
          />
          {newMenuName.length > 0 ? (
            <button
              type="button"
              onClick={() => setNewMenuName("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              aria-label="Clear menu name"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            disabled={creatingMenu}
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="primary-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-on-primary disabled:pointer-events-none disabled:opacity-40"
          >
            {creatingMenu ? "Creating…" : "Create menu"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MenuCreationOptions({
  layout,
  showInnerHeading = layout === "vertical",
  onAfterDraftCreated,
}: MenuCreationOptionsProps) {
  const navigate = useNavigate();
  const { startCsv, busy: csvBusy } = useStartCsvImport(onAfterDraftCreated);

  const [buildFormModalOpen, setBuildFormModalOpen] = useState(false);
  const [newMenuName, setNewMenuName] = useState("");
  const [creatingMenu, setCreatingMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  const closeBuildFormModal = useCallback(() => {
    setBuildFormModalOpen(false);
    setNewMenuName("");
    setCreatingMenu(false);
  }, []);

  const openBuildFormModal = useCallback(() => {
    setNewMenuName("");
    setBuildFormModalOpen(true);
  }, []);

  useEffect(() => {
    if (!buildFormModalOpen) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [buildFormModalOpen]);

  useEffect(() => {
    if (!buildFormModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBuildFormModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [buildFormModalOpen, closeBuildFormModal]);

  const submitBuildFormMenu = useCallback(async () => {
    const trimmed = newMenuName.trim();
    if (!trimmed || creatingMenu) return;
    setCreatingMenu(true);
    try {
      const created = await createMenu({
        name: trimmed,
        contextLabel: "Draft",
      });
      clearReadCaches();
      onAfterDraftCreated?.();
      closeBuildFormModal();
      navigate(`/menus/${created.id}`);
    } catch {
      /* snackbar from apiJson */
    } finally {
      setCreatingMenu(false);
    }
  }, [newMenuName, creatingMenu, navigate, onAfterDraftCreated, closeBuildFormModal]);

  const canSubmitBuildForm = trimmedName(newMenuName) && !creatingMenu;

  const buildDescription = "Create a draft menu and add categories";

  if (layout === "vertical") {
    return (
      <div className="flex flex-col gap-2 rounded-2xl bg-surface-container-low p-2">
        <div className="space-y-2 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
          {showInnerHeading ? (
            <h3 className="mb-2 flex items-center gap-2 font-headline font-bold text-primary">
              Create new menu
            </h3>
          ) : null}
          <button
            type="button"
            disabled={creatingMenu}
            onClick={openBuildFormModal}
            className={`${optionRowClass} w-full disabled:opacity-50`}
          >
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Build via form</p>
              <p className="text-xs text-on-surface-variant">{buildDescription}</p>
            </div>
          </button>
          <button
            type="button"
            disabled={csvBusy}
            onClick={() => void startCsv()}
            className={`${optionRowClass} w-full disabled:opacity-50`}
          >
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Upload CSV</p>
              <p className="text-xs text-on-surface-variant">
                Creates a draft menu, then column mapping
              </p>
            </div>
          </button>
          <Link to="/import/scan" className={`${optionRowClass} w-full`}>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Scan image</p>
              <p className="text-xs text-on-surface-variant">AI menu OCR (demo — no API yet)</p>
            </div>
          </Link>
        </div>

        {buildFormModalOpen ? (
          <BuildFormMenuModal
            titleId={titleId}
            newMenuName={newMenuName}
            setNewMenuName={setNewMenuName}
            inputRef={inputRef}
            creatingMenu={creatingMenu}
            canSubmit={canSubmitBuildForm}
            onClose={closeBuildFormModal}
            onSubmit={() => void submitBuildFormMenu()}
          />
        ) : null}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl bg-surface-container-low p-2">
        <div className="grid grid-cols-1 gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm md:grid-cols-3">
          <button
            type="button"
            disabled={creatingMenu}
            onClick={openBuildFormModal}
            className={`${optionColClass} disabled:opacity-50`}
          >
            <div className="flex shrink-0 items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <ClipboardList className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold">Build via form</p>
            </div>
            <p className="text-xs text-on-surface-variant">{buildDescription}</p>
          </button>
          <button
            type="button"
            disabled={csvBusy}
            onClick={() => void startCsv()}
            className={`${optionColClass} disabled:opacity-50`}
          >
            <div className="flex shrink-0 items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold">Upload CSV</p>
            </div>
            <p className="text-xs text-on-surface-variant">
              Creates a draft menu, then column mapping
            </p>
          </button>
          <Link to="/import/scan" className={optionColClass}>
            <div className="flex shrink-0 items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Camera className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold">Scan image</p>
            </div>
            <p className="text-xs text-on-surface-variant">AI menu OCR (demo — no API yet)</p>
          </Link>
        </div>
      </div>

      {buildFormModalOpen ? (
        <BuildFormMenuModal
          titleId={titleId}
          newMenuName={newMenuName}
          setNewMenuName={setNewMenuName}
          inputRef={inputRef}
          creatingMenu={creatingMenu}
          canSubmit={canSubmitBuildForm}
          onClose={closeBuildFormModal}
          onSubmit={() => void submitBuildFormMenu()}
        />
      ) : null}
    </>
  );
}
