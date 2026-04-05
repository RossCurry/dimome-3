import { use } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  ClipboardList,
  Edit,
  ExternalLink,
  Trash2,
  Upload,
} from "lucide-react";
import { readOwnerDashboard } from "@/mocks/mockApi";

export default function OwnerDashboardPage() {
  const data = use(readOwnerDashboard());

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-headline text-primary tracking-tight">
            {data.venueName}
          </h1>
          <p className="text-on-surface-variant mt-2">
            Manage menus and imports — data is mocked.
          </p>
        </div>
        <Link
          to="/import/csv"
          className="primary-gradient text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold text-center"
        >
          Add Menu
        </Link>
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-headline text-primary mb-6">Your menus</h2>
        <div className="space-y-4">
          {data.menus.map((menu) => (
            <div
              key={menu.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container-low shrink-0">
                <img
                  src={menu.thumbnail}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-headline text-primary">{menu.name}</h3>
                <p className="text-sm text-on-surface-variant">
                  Last updated: {menu.lastUpdatedLabel} · {menu.itemCount} items
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/menu/${menu.id}`}
                  className="p-2 rounded-lg text-secondary hover:bg-surface-container-low"
                  title="Guest menu (QR URL)"
                >
                  <ExternalLink className="w-5 h-5" />
                </Link>
                <Link
                  to={`/menus/${menu.id}`}
                  className="flex items-center gap-2 bg-primary-container text-on-primary px-4 py-2 rounded-xl text-sm font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  type="button"
                  className="p-2 rounded-lg text-error hover:bg-error-container/30"
                  aria-label="Delete menu"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-headline text-primary mb-6">Quick actions</h2>
        <div className="bg-surface-container-low p-2 rounded-2xl flex flex-col gap-2">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm space-y-2">
            <h3 className="font-headline font-bold text-primary mb-2 flex items-center gap-2">
              Create new menu
            </h3>
            <Link
              to="/menus/menu-1"
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/5 transition-colors w-full text-left"
            >
              <div className="bg-primary/10 text-primary p-2 rounded-lg">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Build via form</p>
                <p className="text-xs text-on-surface-variant">Edit items manually</p>
              </div>
            </Link>
            <Link
              to="/import/csv"
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/5 transition-colors w-full text-left"
            >
              <div className="bg-primary/10 text-primary p-2 rounded-lg">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Upload CSV</p>
                <p className="text-xs text-on-surface-variant">Bulk import (mock)</p>
              </div>
            </Link>
            <Link
              to="/import/scan"
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/5 transition-colors w-full text-left"
            >
              <div className="bg-primary/10 text-primary p-2 rounded-lg">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Scan image</p>
                <p className="text-xs text-on-surface-variant">AI menu OCR (mock)</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
