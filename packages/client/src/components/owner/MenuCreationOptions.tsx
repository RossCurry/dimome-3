import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, ClipboardList, Upload } from "lucide-react";
import { createMenu } from "@/api/owner";
import { useMocks } from "@/lib/env";
import { clearReadCaches } from "@/mocks/mockApi";

type Layout = "vertical" | "horizontal";

export type MenuCreationOptionsProps = {
  layout: Layout;
  /** Shown above the option cards (overview keeps “Create new menu”; hub page omits). */
  showInnerHeading?: boolean;
  /** After a successful API draft create (not mock navigate). */
  onAfterDraftCreated?: () => void;
};

function useCreateDraftMenu(onAfterDraftCreated?: () => void) {
  const mocks = useMocks();
  const navigate = useNavigate();
  const [creatingMenu, setCreatingMenu] = useState(false);

  const createDraft = useCallback(async () => {
    if (mocks) {
      navigate("/menus/menu-1/category/cat-1");
      return;
    }
    setCreatingMenu(true);
    try {
      const created = await createMenu({
        name: "Untitled menu",
        contextLabel: "Draft",
      });
      clearReadCaches();
      onAfterDraftCreated?.();
      navigate(`/menus/${created.id}`);
    } catch {
      /* snackbar from apiJson */
    } finally {
      setCreatingMenu(false);
    }
  }, [mocks, navigate, onAfterDraftCreated]);

  return { createDraft, creatingMenu };
}

function useStartCsvImport(onAfterDraftCreated?: () => void) {
  const mocks = useMocks();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const startCsv = useCallback(async () => {
    if (mocks) {
      navigate("/menus/menu-1/import/csv");
      return;
    }
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
  }, [mocks, navigate, onAfterDraftCreated]);

  return { startCsv, busy };
}

const optionRowClass =
  "flex items-center gap-4 rounded-xl p-4 text-left transition-colors hover:bg-primary/5";
const optionColClass =
  "flex h-full flex-col gap-3 rounded-xl border border-outline-variant/10 bg-surface-container-low/30 p-5 text-left transition-colors hover:bg-primary/5 md:min-h-[140px]";

export function MenuCreationOptions({
  layout,
  showInnerHeading = layout === "vertical",
  onAfterDraftCreated,
}: MenuCreationOptionsProps) {
  const mocks = useMocks();
  const { createDraft, creatingMenu } = useCreateDraftMenu(onAfterDraftCreated);
  const { startCsv, busy: csvBusy } = useStartCsvImport(onAfterDraftCreated);

  const buildDescription = mocks
    ? "Edit items manually (mock)"
    : "Create a draft menu and add categories";

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
            onClick={() => void createDraft()}
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
                {mocks ? "Bulk import (mock)" : "Creates a draft menu, then column mapping"}
              </p>
            </div>
          </button>
          <Link to="/import/scan" className={`${optionRowClass} w-full`}>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Scan image</p>
              <p className="text-xs text-on-surface-variant">AI menu OCR (mock)</p>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface-container-low p-2">
      <div className="grid grid-cols-1 gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm md:grid-cols-3">
        <button
          type="button"
          disabled={creatingMenu}
          onClick={() => void createDraft()}
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
            {mocks ? "Bulk import (mock)" : "Creates a draft menu, then column mapping"}
          </p>
        </button>
        <Link to="/import/scan" className={optionColClass}>
          <div className="flex shrink-0 items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Camera className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold">Scan image</p>
          </div>
          <p className="text-xs text-on-surface-variant">AI menu OCR (mock)</p>
        </Link>
      </div>
    </div>
  );
}
