import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { getPublicMenuForMenuId } from "@/mocks/fixtures";
import { useGuestPreferences } from "@/context/GuestPreferencesContext";

export default function OrderPage() {
  const { cart, setQty, menuId } = useGuestPreferences();
  const items = getPublicMenuForMenuId(menuId).itemsById;
  const lines = Object.entries(cart).filter(([, q]) => q > 0);

  const total = lines.reduce((sum, [id, q]) => {
    const item = items[id];
    return sum + (item ? item.price * q : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-surface pb-40">
      <header className="sticky top-0 z-20 bg-surface-container-lowest/85 backdrop-blur-xl px-6 py-4 flex items-center gap-4">
        <Link to=".." relative="path" className="p-2 -ml-2 rounded-lg hover:bg-surface-container-low">
          <ChevronLeft className="w-6 h-6 text-primary" />
        </Link>
        <div>
          <span className="text-[11px] uppercase tracking-widest text-tertiary font-medium">
            Table 12
          </span>
          <h1 className="font-headline text-2xl font-bold text-on-surface">My order</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            Review selections before placing (mock).
          </p>
        </div>
      </header>

      <div className="px-6 max-w-md mx-auto pt-6 space-y-6">
        {lines.length === 0 && (
          <p className="text-on-surface-variant text-center py-12">
            Nothing here yet.{" "}
            <Link to=".." relative="path" className="text-primary font-medium underline">
              Browse menu
            </Link>
          </p>
        )}
        {lines.map(([id, qty]) => {
          const item = items[id];
          if (!item) return null;
          return (
            <div key={id} className="flex gap-4 items-start">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container-low shrink-0">
                <img src={item.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-headline font-semibold text-on-surface">{item.name}</h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  ${item.price.toFixed(2)} each
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => setQty(id, qty - 1)}
                    className="w-9 h-9 rounded-lg bg-surface-container-low text-lg font-medium"
                  >
                    −
                  </button>
                  <span className="font-semibold w-6 text-center">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(id, qty + 1)}
                    className="w-9 h-9 rounded-lg bg-surface-container-low text-lg font-medium"
                  >
                    +
                  </button>
                </div>
              </div>
              <span className="font-semibold text-primary">
                ${(item.price * qty).toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 inset-x-0 z-30 bg-surface-container-lowest/90 backdrop-blur-xl border-t border-outline-variant/20 max-w-lg mx-auto rounded-t-2xl px-6 pt-3 pb-4">
        {lines.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-3">
              <span className="text-on-surface-variant text-sm">Subtotal</span>
              <span className="text-lg font-headline font-bold text-primary">
                ${total.toFixed(2)}
              </span>
            </div>
            <button
              type="button"
              className="w-full py-3.5 rounded-xl bg-tertiary text-on-primary font-headline font-semibold mb-2"
            >
              Place order
            </button>
            <p className="text-center text-[10px] text-on-surface-variant mb-3">
              No payment — UI stub only.
            </p>
          </>
        )}
        <nav className="flex justify-around py-3 border-t border-outline-variant/10">
          <Link to=".." relative="path" className="text-on-surface-variant text-xs font-medium">
            Menu
          </Link>
          <Link to="../filters" relative="path" className="text-on-surface-variant text-xs font-medium">
            Filters
          </Link>
          <Link to="." className="text-primary text-xs font-semibold">
            Order
          </Link>
        </nav>
      </div>
    </div>
  );
}
