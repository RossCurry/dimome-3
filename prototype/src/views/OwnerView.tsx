import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Menu as MenuIcon, 
  Plus, 
  Edit2, 
  Trash2, 
  Camera, 
  Upload, 
  Sparkles, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MenuItem, MenuData, Category } from "../types";
import { GoogleGenAI, Type } from "@google/genai";

export default function OwnerView() {
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "menu" | "scan">("dashboard");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(1);
  const [scanResult, setScanResult] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    fetch("/api/menu")
      .then(res => res.json())
      .then(setMenu);
  }, []);

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanStep(1);

    // Simulate OCR / AI Processing
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = (reader.result as string).split(",")[1];
      
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            { text: "Extract menu items from this image. Return JSON with categories and items (name, price, description, allergens)." },
            { inlineData: { data: base64Data, mimeType: file.type } }
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                categories: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      items: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            price: { type: Type.NUMBER },
                            description: { type: Type.STRING },
                            allergens: { type: Type.ARRAY, items: { type: Type.STRING } }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        });

        const result = JSON.parse(response.text || "{}");
        setScanResult(result);
        setScanStep(2);
      } catch (err) {
        console.error("AI Scan failed", err);
        setScanStep(3); // Error state
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const saveScan = () => {
    // Merge scanResult into menu
    if (!scanResult || !menu) return;
    
    const newItems = { ...menu.items };
    const newCategories = [...menu.categories];

    scanResult.categories.forEach((cat: any) => {
      const catId = Math.random().toString(36).substr(2, 9);
      const itemIds: string[] = [];

      cat.items.forEach((item: any) => {
        const itemId = Math.random().toString(36).substr(2, 9);
        newItems[itemId] = { ...item, id: itemId, category: catId };
        itemIds.push(itemId);
      });

      newCategories.push({ id: catId, name: cat.name, items: itemIds });
    });

    setMenu({ categories: newCategories, items: newItems });
    setScanResult(null);
    setActiveTab("menu");
  };

  if (!menu) return <div className="p-8 text-center font-display">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col md:flex-row">
      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <nav className="md:w-64 bg-brand-forest text-white p-6 flex md:flex-col justify-between md:justify-start gap-8 z-20 sticky bottom-0 md:relative md:h-screen">
        <div className="hidden md:block mb-12">
          <h1 className="text-2xl font-display font-bold">DiMoMe</h1>
          <p className="text-xs text-brand-sage font-medium uppercase tracking-widest">Business Suite</p>
        </div>

        <div className="flex md:flex-col gap-4 flex-1 justify-around md:justify-start">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span className="hidden md:inline font-medium">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab("menu")}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'menu' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
          >
            <MenuIcon size={20} />
            <span className="hidden md:inline font-medium">Menu Editor</span>
          </button>
          <button 
            onClick={() => setActiveTab("scan")}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'scan' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
          >
            <Sparkles size={20} />
            <span className="hidden md:inline font-medium">AI Scan</span>
          </button>
        </div>

        <div className="hidden md:block mt-auto pt-8 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-terracotta flex items-center justify-center font-bold">JD</div>
            <div>
              <p className="text-sm font-bold">John Doe</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">The Bistro</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto pb-24 md:pb-12">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <header>
                <h2 className="text-3xl text-brand-forest mb-2">Welcome back, John</h2>
                <p className="text-brand-sage">Your menu is performing well today.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl">
                  <p className="text-xs text-brand-sage font-bold uppercase tracking-widest mb-2">Total Views</p>
                  <p className="text-4xl font-display text-brand-forest">1,284</p>
                  <p className="text-xs text-green-600 mt-2 font-bold">+12% from yesterday</p>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                  <p className="text-xs text-brand-sage font-bold uppercase tracking-widest mb-2">Avg. Order Value</p>
                  <p className="text-4xl font-display text-brand-forest">$42.50</p>
                  <p className="text-xs text-brand-terracotta mt-2 font-bold">Top item: Truffle Arancini</p>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                  <p className="text-xs text-brand-sage font-bold uppercase tracking-widest mb-2">Active Filters</p>
                  <div className="flex gap-2 mt-4">
                    <span className="px-2 py-1 bg-brand-forest/5 rounded text-[10px] font-bold text-brand-forest">Gluten-Free (42%)</span>
                    <span className="px-2 py-1 bg-brand-forest/5 rounded text-[10px] font-bold text-brand-forest">Vegan (28%)</span>
                  </div>
                </div>
              </div>

              <section className="glass-card rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-brand-forest/5 flex justify-between items-center">
                  <h3 className="text-lg text-brand-forest">Recent Activity</h3>
                  <button className="text-xs text-brand-terracotta font-bold uppercase tracking-widest">View All</button>
                </div>
                <div className="divide-y divide-brand-forest/5">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-brand-forest/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-sage/10 flex items-center justify-center text-brand-sage">
                          <Edit2 size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-brand-forest">Menu item updated</p>
                          <p className="text-xs text-brand-sage">Wild Mushroom Risotto price changed to $22</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-brand-sage font-medium uppercase">2h ago</span>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === "menu" && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl text-brand-forest mb-2">Menu Editor</h2>
                  <p className="text-brand-sage">Manage your categories and dishes.</p>
                </div>
                <button className="bg-brand-forest text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold text-sm shadow-lg hover:bg-brand-forest/90 transition-all">
                  <Plus size={18} />
                  Add Category
                </button>
              </header>

              <div className="space-y-12">
                {menu.categories.map(category => (
                  <section key={category.id} className="space-y-4">
                    <div className="flex items-center justify-between group">
                      <h3 className="text-xl text-brand-forest flex items-center gap-3">
                        {category.name}
                        <span className="text-xs font-medium text-brand-sage bg-brand-forest/5 px-2 py-0.5 rounded-full">
                          {category.items.length} Items
                        </span>
                      </h3>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-brand-sage hover:text-brand-forest transition-colors"><Edit2 size={16} /></button>
                        <button className="p-2 text-brand-sage hover:text-brand-terracotta transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {category.items.map(itemId => {
                        const item = menu.items[itemId];
                        if (!item) return null;
                        return (
                          <div key={itemId} className="glass-card p-4 rounded-2xl flex gap-4 items-center group">
                            <div className="w-16 h-16 rounded-xl bg-brand-forest/5 flex-shrink-0 overflow-hidden">
                              {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-brand-forest truncate">{item.name}</h4>
                              <p className="text-xs text-brand-sage truncate">{item.description}</p>
                              <p className="text-xs font-bold text-brand-terracotta mt-1">${item.price}</p>
                            </div>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => setEditingItem(item)}
                                className="p-2 text-brand-sage hover:text-brand-forest transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button className="p-2 text-brand-sage hover:text-brand-terracotta transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      <button className="border-2 border-dashed border-brand-forest/10 rounded-2xl p-4 flex items-center justify-center gap-2 text-brand-sage hover:border-brand-forest/20 hover:bg-brand-forest/5 transition-all group">
                        <Plus size={18} className="group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-widest">Add Item</span>
                      </button>
                    </div>
                  </section>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "scan" && (
            <motion.div 
              key="scan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <header className="text-center">
                <div className="w-16 h-16 bg-brand-forest/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-forest">
                  <Sparkles size={32} />
                </div>
                <h2 className="text-3xl text-brand-forest mb-2">AI Menu Parser</h2>
                <p className="text-brand-sage">Upload a photo of your physical menu, and we'll digitize it instantly.</p>
              </header>

              <div className="glass-card rounded-3xl p-12 border-2 border-dashed border-brand-forest/10 text-center relative overflow-hidden">
                {isScanning ? (
                  <div className="space-y-6">
                    <div className="w-12 h-12 border-4 border-brand-forest/10 border-t-brand-forest rounded-full animate-spin mx-auto"></div>
                    <p className="text-brand-forest font-bold animate-pulse">Analyzing menu structure...</p>
                    <p className="text-xs text-brand-sage">Our AI is extracting items, prices, and allergens.</p>
                  </div>
                ) : scanStep === 1 ? (
                  <div className="space-y-6">
                    <div className="flex justify-center gap-4">
                      <label className="cursor-pointer bg-brand-forest text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-bold shadow-xl hover:bg-brand-forest/90 transition-all">
                        <Camera size={24} />
                        Take Photo
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleScan} />
                      </label>
                      <label className="cursor-pointer bg-white text-brand-forest border border-brand-forest/10 px-8 py-4 rounded-2xl flex items-center gap-3 font-bold hover:bg-brand-forest/5 transition-all">
                        <Upload size={24} />
                        Upload File
                        <input type="file" accept="image/*" className="hidden" onChange={handleScan} />
                      </label>
                    </div>
                    <p className="text-xs text-brand-sage font-medium uppercase tracking-widest">Supports JPG, PNG, PDF</p>
                  </div>
                ) : scanStep === 2 ? (
                  <div className="space-y-6 text-left">
                    <div className="flex items-center gap-3 text-green-600 mb-4">
                      <CheckCircle2 size={24} />
                      <h3 className="text-xl font-display font-bold">Scan Complete!</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                      {scanResult?.categories.map((cat: any, i: number) => (
                        <div key={i} className="bg-brand-forest/5 p-4 rounded-xl">
                          <p className="text-xs font-bold text-brand-forest uppercase mb-2">{cat.name}</p>
                          <div className="space-y-1">
                            {cat.items.map((item: any, j: number) => (
                              <div key={j} className="flex justify-between text-sm">
                                <span className="text-brand-forest">{item.name}</span>
                                <span className="font-bold text-brand-terracotta">${item.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={saveScan}
                        className="flex-1 bg-brand-forest text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-brand-forest/90 transition-all"
                      >
                        Add to Menu
                      </button>
                      <button 
                        onClick={() => setScanStep(1)}
                        className="px-6 py-4 rounded-2xl border border-brand-forest/10 font-bold text-brand-sage hover:bg-brand-forest/5 transition-all"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle size={24} />
                    </div>
                    <p className="text-brand-forest font-bold">Something went wrong</p>
                    <button 
                      onClick={() => setScanStep(1)}
                      className="text-brand-terracotta font-bold uppercase tracking-widest text-xs"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Item Editor Modal */}
      <AnimatePresence>
        {editingItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-brand-forest/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-brand-cream w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-brand-forest/5 flex justify-between items-center bg-white">
                <h3 className="text-xl text-brand-forest">Edit Dish</h3>
                <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-brand-forest/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-xs font-bold text-brand-sage uppercase tracking-widest">Dish Name</span>
                      <input 
                        type="text" 
                        defaultValue={editingItem.name}
                        className="mt-1 w-full p-3 rounded-xl bg-white border border-brand-forest/10 focus:ring-2 focus:ring-brand-forest/20 outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-brand-sage uppercase tracking-widest">Price ($)</span>
                      <input 
                        type="number" 
                        defaultValue={editingItem.price}
                        className="mt-1 w-full p-3 rounded-xl bg-white border border-brand-forest/10 focus:ring-2 focus:ring-brand-forest/20 outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-brand-sage uppercase tracking-widest">Description</span>
                      <textarea 
                        rows={3}
                        defaultValue={editingItem.description}
                        className="mt-1 w-full p-3 rounded-xl bg-white border border-brand-forest/10 focus:ring-2 focus:ring-brand-forest/20 outline-none resize-none"
                      />
                    </label>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-bold text-brand-sage uppercase tracking-widest block mb-3">Photography</span>
                      <div className="aspect-square rounded-2xl bg-brand-forest/5 border-2 border-dashed border-brand-forest/10 flex flex-col items-center justify-center text-brand-sage group cursor-pointer hover:bg-brand-forest/10 transition-all">
                        {editingItem.image ? (
                          <img src={editingItem.image} alt={editingItem.name} className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
                        ) : (
                          <>
                            <Camera size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Upload Photo</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-brand-sage uppercase tracking-widest block mb-3">Allergens</span>
                      <div className="flex flex-wrap gap-2">
                        {["Gluten", "Dairy", "Nuts", "Soy", "Shellfish", "Eggs"].map(a => (
                          <button 
                            key={a}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${
                              editingItem.allergens.includes(a) 
                                ? 'bg-brand-terracotta text-white' 
                                : 'bg-white text-brand-sage border border-brand-forest/10'
                            }`}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border-t border-brand-forest/5 flex gap-4">
                <button 
                  onClick={() => setEditingItem(null)}
                  className="flex-1 bg-brand-forest text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-brand-forest/90 transition-all"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => setEditingItem(null)}
                  className="px-8 py-4 rounded-2xl border border-brand-forest/10 font-bold text-brand-sage hover:bg-brand-forest/5 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
