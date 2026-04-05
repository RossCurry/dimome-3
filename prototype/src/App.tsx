/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import GuestView from "./views/GuestView";
import OwnerView from "./views/OwnerView";
import { ViewMode } from "./types";
import { User, ShoppingBag, Settings } from "lucide-react";

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("guest");

  return (
    <div className="relative">
      {/* View Switcher (Demo Only) */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button 
          onClick={() => setViewMode("guest")}
          className={`p-3 rounded-full shadow-lg transition-all ${viewMode === 'guest' ? 'bg-brand-forest text-white' : 'bg-white text-brand-forest hover:bg-brand-forest/5'}`}
          title="Guest View"
        >
          <ShoppingBag size={20} />
        </button>
        <button 
          onClick={() => setViewMode("owner")}
          className={`p-3 rounded-full shadow-lg transition-all ${viewMode === 'owner' ? 'bg-brand-forest text-white' : 'bg-white text-brand-forest hover:bg-brand-forest/5'}`}
          title="Owner Dashboard"
        >
          <Settings size={20} />
        </button>
      </div>

      {viewMode === "guest" ? <GuestView /> : <OwnerView />}
    </div>
  );
}
