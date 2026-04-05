import React, { useState, useEffect } from "react";
import { Search, Filter, ShoppingBag, ChevronRight, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MenuItem, MenuData } from "../types";

export default function GuestView() {
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [search, setSearch] = useState("");
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/menu")
      .then(res => res.json())
      .then(setMenu);
  }, []);

  const allergensList = ["Gluten", "Dairy", "Nuts", "Soy", "Shellfish", "Eggs"];

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens(prev => 
      prev.includes(allergen) ? prev.filter(a => a !== allergen) : [...prev, allergen]
    );
  };

  const filteredItems = menu ? (Object.values(menu.items) as MenuItem[]).filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                         item.description.toLowerCase().includes(search.toLowerCase());
    const hasAllergens = item.allergens.some(a => selectedAllergens.includes(a));
    return matchesSearch && !hasAllergens;
  }) : [];

  const addToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const cartTotal = menu ? Object.entries(cart).reduce((acc: number, entry) => {
    const [id, qty] = entry;
    const item = menu.items[id];
    return acc + (item ? item.price : 0) * (qty as number);
  }, 0) : 0;

  const cartItemCount = Object.values(cart).reduce((a: number, b: number) => a + b, 0) as number;

  if (!menu) return <div className="p-8 text-center font-display">Loading menu...</div>;

  return (
    <div className="min-h-screen bg-brand-cream pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-brand-cream/80 backdrop-blur-md px-6 py-4 border-b border-brand-forest/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl text-brand-forest">DiMoMe</h1>
            <p className="text-xs text-brand-sage font-medium uppercase tracking-widest">Digital Maître d'</p>
          </div>
          <button className="p-2 rounded-full bg-brand-forest text-white relative">
            <ShoppingBag size={20} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-terracotta text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-sage" size={18} />
            <input 
              type="text" 
              placeholder="Search dishes..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border-none focus:ring-2 focus:ring-brand-forest/20 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl border transition-colors ${showFilters ? 'bg-brand-forest text-white border-brand-forest' : 'bg-white text-brand-forest border-brand-forest/10'}`}
          >
            <Filter size={20} />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 pb-2">
                <p className="text-xs font-bold text-brand-forest mb-2 uppercase tracking-tight">Hide items containing:</p>
                <div className="flex flex-wrap gap-2">
                  {allergensList.map(allergen => (
                    <button
                      key={allergen}
                      onClick={() => toggleAllergen(allergen)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedAllergens.includes(allergen) 
                          ? 'bg-brand-terracotta text-white' 
                          : 'bg-white text-brand-sage border border-brand-forest/5'
                      }`}
                    >
                      {allergen}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Menu Content */}
      <main className="px-6 py-6 space-y-8">
        {menu.categories.map(category => {
          const categoryItems = filteredItems.filter(item => category.items.includes(item.id));
          if (categoryItems.length === 0) return null;

          return (
            <section key={category.id}>
              <h2 className="text-xl text-brand-forest mb-4 flex items-center gap-2">
                {category.name}
                <span className="h-px flex-1 bg-brand-forest/10"></span>
              </h2>
              <div className="grid gap-4">
                {categoryItems.map(item => (
                  <motion.div 
                    layout
                    key={item.id}
                    className="glass-card rounded-2xl p-4 flex gap-4 group active:scale-[0.98] transition-transform"
                    onClick={() => addToCart(item.id)}
                  >
                    <div className="w-20 h-20 rounded-xl bg-brand-forest/5 flex-shrink-0 overflow-hidden relative">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-sage/30">
                          <Info size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-base text-brand-forest truncate">{item.name}</h3>
                        <span className="text-sm font-bold text-brand-terracotta">${item.price}</span>
                      </div>
                      <p className="text-xs text-brand-sage line-clamp-2 mb-2 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="flex gap-1">
                        {item.allergens.map(a => (
                          <span key={a} className="text-[9px] px-1.5 py-0.5 rounded-md bg-brand-forest/5 text-brand-sage font-bold uppercase">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* Floating Cart Summary */}
      {cartTotal > 0 && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-6 left-6 right-6 z-30"
        >
          <button className="w-full bg-brand-forest text-white p-4 rounded-2xl shadow-xl flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <ShoppingBag size={20} />
              </div>
              <div className="text-left">
                <p className="text-xs text-white/60 font-medium uppercase tracking-widest">Your Order</p>
                <p className="text-sm font-bold">{cartItemCount} Items</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-display font-bold">${cartTotal.toFixed(2)}</span>
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </motion.div>
      )}
    </div>
  );
}
