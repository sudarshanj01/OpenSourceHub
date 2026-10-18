'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Utensils,
  Search,
  Wifi,
  Clock,
  MapPin,
  Phone,
  Flame,
  ChefHat,
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  X,
  Check,
  Share2,
  Copy,
  Info,
  ExternalLink,
  ShieldCheck,
  Wheat,
  Leaf,
  ChevronRight,
  Receipt,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  isChefSpecial: boolean;
  calories: number | null;
  prepTimeMinutes: number | null;
  badge: string | null;
  imageUrl: string | null;
  sortOrder: number;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  items: MenuItem[];
}

interface RestaurantProfile {
  id: string;
  name: string;
  tagline: string;
  description: string;
  currencySymbol: string;
  currencyCode: string;
  taxPercentage: number;
  serviceChargePercentage: number;
  address: string;
  phone: string;
  email: string;
  wifiSsid: string;
  wifiPassword: string;
  openingHours: string;
  tableCount: number;
  bannerUrl: string | null;
  logoUrl: string | null;
}

function MenuContent() {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get('table');

  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeDietFilter, setActiveDietFilter] = useState<'all' | 'veg' | 'vegan' | 'gf' | 'spicy' | 'special'>('all');

  // Interactive Modals
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [isWaiterMode, setIsWaiterMode] = useState(false);
  const [wifiCopied, setWifiCopied] = useState(false);
  const [activeTable, setActiveTable] = useState<string>(tableParam || 'Table 1');

  // Tray / Bill Estimator State
  // { [itemId: string]: number }
  const [tray, setTray] = useState<Record<string, number>>({});

  useEffect(() => {
    if (tableParam) {
      setActiveTable(tableParam.toLowerCase().startsWith('table') ? tableParam : `Table ${tableParam}`);
    }
  }, [tableParam]);

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/menu');
      if (!res.ok) throw new Error('Failed to load menu');
      const data = await res.json();
      setProfile(data.profile);
      setCategories(data.categories || []);
    } catch (err: any) {
      setError(err.message || 'Error loading menu');
    } finally {
      setLoading(false);
    }
  };

  const copyWifi = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.wifiPassword);
    setWifiCopied(true);
    setTimeout(() => setWifiCopied(false), 2500);
  };

  // Tray management
  const updateTrayQuantity = (itemId: string, delta: number) => {
    setTray(prev => {
      const current = prev[itemId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const clearTray = () => {
    setTray({});
    setIsTrayOpen(false);
    setIsWaiterMode(false);
  };

  // Find all items mapped by ID for fast lookup
  const allItemsMap = useMemo(() => {
    const map: Record<string, MenuItem> = {};
    for (const cat of categories) {
      for (const item of cat.items) {
        map[item.id] = item;
      }
    }
    return map;
  }, [categories]);

  // Tray totals
  const trayCalculations = useMemo(() => {
    let subtotal = 0;
    let itemCount = 0;
    for (const [id, qty] of Object.entries(tray)) {
      const item = allItemsMap[id];
      if (item) {
        subtotal += item.price * qty;
        itemCount += qty;
      }
    }
    const taxRate = (profile?.taxPercentage || 0) / 100;
    const serviceRate = (profile?.serviceChargePercentage || 0) / 100;
    const taxAmount = subtotal * taxRate;
    const serviceAmount = subtotal * serviceRate;
    const grandTotal = subtotal + taxAmount + serviceAmount;

    return {
      subtotal,
      itemCount,
      taxAmount,
      serviceAmount,
      grandTotal,
    };
  }, [tray, allItemsMap, profile]);

  // Filtered categories and items
  const filteredCategories = useMemo(() => {
    return categories
      .map(cat => {
        const filteredItems = cat.items.filter(item => {
          // Search query match
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchesText =
              item.name.toLowerCase().includes(q) ||
              item.description.toLowerCase().includes(q) ||
              (item.badge && item.badge.toLowerCase().includes(q));
            if (!matchesText) return false;
          }

          // Diet filter match
          if (activeDietFilter === 'veg' && !item.isVegetarian) return false;
          if (activeDietFilter === 'vegan' && !item.isVegan) return false;
          if (activeDietFilter === 'gf' && !item.isGlutenFree) return false;
          if (activeDietFilter === 'spicy' && !item.isSpicy) return false;
          if (activeDietFilter === 'special' && !item.isChefSpecial) return false;

          return true;
        });

        return {
          ...cat,
          items: filteredItems,
        };
      })
      .filter(cat => {
        if (selectedCategory !== 'all' && cat.id !== selectedCategory) {
          return false;
        }
        return cat.items.length > 0;
      });
  }, [categories, searchQuery, activeDietFilter, selectedCategory]);

  const currencySymbol = profile?.currencySymbol || '$';

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50 text-stone-600">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium animate-pulse">Loading live digital menu...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50 text-center">
        <div className="p-4 bg-red-50 text-red-600 rounded-full mb-3">
          <Utensils className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-1">Unable to Load Menu</h2>
        <p className="text-stone-600 text-sm max-w-sm mb-6">{error || 'Menu could not be loaded.'}</p>
        <button
          onClick={fetchMenuData}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 bg-stone-50">
      {/* Top Banner / Restaurant Header */}
      <header className="relative bg-stone-900 text-white overflow-hidden shadow-md">
        {/* Background glow or banner image */}
        {profile.bannerUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 blur-[1px]"
            style={{ backgroundImage: `url(${profile.bannerUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 opacity-90" />
        )}

        <div className="relative max-w-3xl mx-auto px-4 pt-6 pb-6">
          {/* Top Row: Table Tag & Admin Login Link */}
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full text-xs font-semibold text-amber-300 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
              <span>{activeTable}</span>
            </div>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full text-xs font-medium text-stone-200 backdrop-blur-sm transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Staff Login</span>
            </Link>
          </div>

          {/* Restaurant Title & Tagline */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
            {profile.name}
          </h1>
          <p className="text-amber-200/90 text-sm font-medium mb-3">
            {profile.tagline}
          </p>

          <p className="text-stone-300 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed">
            {profile.description}
          </p>

          {/* Practical Info Badges (Wi-Fi, Hours, Address) */}
          <div className="flex flex-wrap gap-2 text-xs">
            {/* Wi-Fi Pill with 1-tap copy */}
            {profile.wifiSsid && (
              <button
                onClick={copyWifi}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700/80 rounded-lg text-stone-200 transition active:scale-95"
                title="Tap to copy Wi-Fi password"
              >
                <Wifi className="w-3.5 h-3.5 text-amber-400" />
                <span>Wi-Fi: <strong className="text-white">{profile.wifiSsid}</strong></span>
                {wifiCopied ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-0.5 ml-1">
                    <Check className="w-3 h-3" /> Copied!
                  </span>
                ) : (
                  <Copy className="w-3 h-3 text-stone-400 ml-1" />
                )}
              </button>
            )}

            {/* Opening Hours */}
            {profile.openingHours && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800/80 border border-stone-700/80 rounded-lg text-stone-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{profile.openingHours}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sticky Search & Filter Container */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3">
          {/* Search Input */}
          <div className="relative mb-2.5">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes, drinks, ingredients..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-stone-100 hover:bg-stone-100/80 focus:bg-white text-stone-900 rounded-xl text-sm border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dietary Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            <button
              onClick={() => setActiveDietFilter('all')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition ${
                activeDietFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setActiveDietFilter(activeDietFilter === 'veg' ? 'all' : 'veg')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap flex items-center gap-1 transition ${
                activeDietFilter === 'veg'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Vegetarian
            </button>
            <button
              onClick={() => setActiveDietFilter(activeDietFilter === 'vegan' ? 'all' : 'vegan')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap flex items-center gap-1 transition ${
                activeDietFilter === 'vegan'
                  ? 'bg-green-700 text-white shadow-xs'
                  : 'bg-green-50 text-green-800 hover:bg-green-100 border border-green-200/60'
              }`}
            >
              <Leaf className="w-3 h-3 text-green-600" />
              Vegan
            </button>
            <button
              onClick={() => setActiveDietFilter(activeDietFilter === 'gf' ? 'all' : 'gf')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap flex items-center gap-1 transition ${
                activeDietFilter === 'gf'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              <Wheat className="w-3 h-3 text-amber-600" />
              Gluten-Free
            </button>
            <button
              onClick={() => setActiveDietFilter(activeDietFilter === 'spicy' ? 'all' : 'spicy')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap flex items-center gap-1 transition ${
                activeDietFilter === 'spicy'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60'
              }`}
            >
              <Flame className="w-3 h-3 text-rose-500" />
              Spicy
            </button>
            <button
              onClick={() => setActiveDietFilter(activeDietFilter === 'special' ? 'all' : 'special')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap flex items-center gap-1 transition ${
                activeDietFilter === 'special'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200/60'
              }`}
            >
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Chef's Picks
            </button>
          </div>

          {/* Category Tabs Scroll */}
          {categories.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-stone-100 mt-2 text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`py-1 px-2.5 rounded-lg font-semibold whitespace-nowrap transition ${
                  selectedCategory === 'all'
                    ? 'text-amber-600 bg-amber-50'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                All Sections ({categories.reduce((acc, c) => acc + c.items.length, 0)})
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`py-1 px-2.5 rounded-lg font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'text-amber-600 bg-amber-50'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {cat.name} ({cat.items.length})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Menu Sections */}
      <main className="max-w-3xl mx-auto px-4 py-5 space-y-8">
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center my-6">
            <Utensils className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-stone-800 mb-1">No items found</h3>
            <p className="text-xs text-stone-500 mb-4">
              Try adjusting your search terms or dietary filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveDietFilter('all');
                setSelectedCategory('all');
              }}
              className="text-xs font-semibold text-amber-600 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          filteredCategories.map(category => (
            <section key={category.id} className="scroll-mt-36">
              {/* Category Header */}
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-stone-900 tracking-tight">
                    {category.name}
                  </h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                    {category.items.length}
                  </span>
                </div>
                {category.description && (
                  <p className="text-xs text-stone-500 mt-0.5">{category.description}</p>
                )}
              </div>

              {/* Items List */}
              <div className="grid grid-cols-1 gap-3">
                {category.items.map(item => {
                  const qty = tray[item.id] || 0;
                  const isSoldOut = !item.isAvailable;

                  return (
                    <div
                      key={item.id}
                      className={`relative bg-white rounded-2xl border p-4 transition duration-150 ${
                        isSoldOut
                          ? 'border-stone-200 opacity-60 bg-stone-50/60'
                          : 'border-stone-200/80 hover:border-amber-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Left: Info */}
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => setSelectedItem(item)}
                        >
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            {/* Dietary Badges */}
                            {item.isVegetarian && (
                              <span className="w-3.5 h-3.5 border border-emerald-600 rounded-sm flex items-center justify-center p-0.5" title="Vegetarian">
                                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                              </span>
                            )}
                            {item.isVegan && (
                              <span className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.2 rounded" title="Vegan">
                                Vegan
                              </span>
                            )}
                            {item.isGlutenFree && (
                              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded" title="Gluten-Free">
                                GF
                              </span>
                            )}
                            {item.isSpicy && (
                              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded flex items-center gap-0.5" title="Spicy">
                                <Flame className="w-2.5 h-2.5" /> Spicy
                              </span>
                            )}
                            {item.badge && (
                              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-200 px-1.5 py-0.2 rounded">
                                {item.badge}
                              </span>
                            )}

                            {/* Dish Name */}
                            <h3 className="text-sm font-bold text-stone-900 hover:text-amber-700 transition">
                              {item.name}
                            </h3>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-2">
                            {item.description}
                          </p>

                          {/* Price & Specs */}
                          <div className="flex items-center gap-3 text-xs">
                            <span className="font-extrabold text-stone-900 text-sm">
                              {currencySymbol}{item.price.toFixed(2)}
                            </span>

                            {item.calories && (
                              <span className="text-stone-400">
                                {item.calories} kcal
                              </span>
                            )}

                            {item.prepTimeMinutes && (
                              <span className="text-stone-400 flex items-center gap-0.5">
                                <Clock className="w-3 h-3" /> {item.prepTimeMinutes}m
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right: Actions / Stepper */}
                        <div className="flex flex-col items-end justify-between min-h-[64px]">
                          {isSoldOut ? (
                            <span className="px-2.5 py-1 bg-stone-200 text-stone-600 text-[11px] font-bold rounded-lg uppercase tracking-wider">
                              Sold Out
                            </span>
                          ) : qty > 0 ? (
                            <div className="inline-flex items-center bg-amber-500 text-white rounded-xl shadow-xs font-bold text-xs p-1">
                              <button
                                onClick={() => updateTrayQuantity(item.id, -1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-amber-600 rounded-lg transition active:scale-90"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-6 text-center">{qty}</span>
                              <button
                                onClick={() => updateTrayQuantity(item.id, 1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-amber-600 rounded-lg transition active:scale-90"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => updateTrayQuantity(item.id, 1)}
                              className="px-3.5 py-1.5 bg-stone-100 hover:bg-amber-500 hover:text-white text-stone-800 rounded-xl font-bold text-xs flex items-center gap-1 transition active:scale-95 shadow-2xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedItem(item)}
                            className="text-[11px] font-medium text-stone-400 hover:text-stone-700 mt-2 flex items-center gap-0.5"
                          >
                            Details <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Floating Bottom Bar: Order Tray & Bill Estimator */}
      {trayCalculations.itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-gradient-to-t from-stone-900/40 via-stone-900/10 to-transparent pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <button
              onClick={() => setIsTrayOpen(true)}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between border border-stone-700/60 active:scale-[0.99] transition duration-150"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-bold text-stone-950 text-sm">
                  {trayCalculations.itemCount}
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-stone-300">
                    {activeTable} • Order Tray
                  </div>
                  <div className="text-sm font-extrabold text-white">
                    {currencySymbol}{trayCalculations.grandTotal.toFixed(2)}
                    <span className="text-[10px] font-normal text-stone-400 ml-1.5">
                      (incl. tax)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl text-amber-300">
                <span>View Summary</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  {selectedItem.isVegetarian && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Vegetarian
                    </span>
                  )}
                  {selectedItem.isVegan && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-800">
                      Vegan
                    </span>
                  )}
                  {selectedItem.isGlutenFree && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      Gluten-Free
                    </span>
                  )}
                  {selectedItem.isSpicy && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800 flex items-center gap-0.5">
                      <Flame className="w-3 h-3" /> Spicy
                    </span>
                  )}
                  {selectedItem.badge && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500 text-stone-950">
                      {selectedItem.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-extrabold text-stone-900">
                  {selectedItem.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-stone-600 text-sm leading-relaxed mb-6">
              {selectedItem.description}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
              <div>
                <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  Price
                </div>
                <div className="text-lg font-extrabold text-stone-900">
                  {currencySymbol}{selectedItem.price.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  Prep Time
                </div>
                <div className="text-sm font-bold text-stone-700 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  {selectedItem.prepTimeMinutes ? `${selectedItem.prepTimeMinutes} mins` : 'Made to order'}
                </div>
              </div>
              {selectedItem.calories && (
                <div>
                  <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    Nutrition
                  </div>
                  <div className="text-sm font-bold text-stone-700 mt-0.5">
                    {selectedItem.calories} kcal
                  </div>
                </div>
              )}
              <div>
                <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  Status
                </div>
                <div className={`text-sm font-bold mt-0.5 ${selectedItem.isAvailable ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedItem.isAvailable ? 'In Stock' : 'Out of Stock'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {selectedItem.isAvailable ? (
                <>
                  <div className="inline-flex items-center border border-stone-200 rounded-xl p-1 bg-stone-50">
                    <button
                      onClick={() => updateTrayQuantity(selectedItem.id, -1)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-stone-200 transition text-stone-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm">
                      {tray[selectedItem.id] || 0}
                    </span>
                    <button
                      onClick={() => updateTrayQuantity(selectedItem.id, 1)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-stone-200 transition text-stone-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (!tray[selectedItem.id]) {
                        updateTrayQuantity(selectedItem.id, 1);
                      }
                      setSelectedItem(null);
                    }}
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition shadow-sm"
                  >
                    {tray[selectedItem.id] ? 'Done' : `Add to Tray • ${currencySymbol}${selectedItem.price.toFixed(2)}`}
                  </button>
                </>
              ) : (
                <div className="w-full py-3 bg-stone-100 text-stone-400 font-semibold rounded-xl text-center text-sm">
                  Currently Sold Out
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tray / Bill Estimator Drawer */}
      {isTrayOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-extrabold text-stone-900">
                  Your Table Tray
                </h3>
              </div>
              <button
                onClick={() => setIsTrayOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Table Selector / Input */}
            <div className="flex items-center justify-between bg-stone-100 px-3.5 py-2.5 rounded-xl mb-4 text-xs font-semibold text-stone-700">
              <span>Ordering for:</span>
              <input
                type="text"
                value={activeTable}
                onChange={e => setActiveTable(e.target.value)}
                placeholder="e.g. Table 4 or Bar"
                className="bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-xs font-bold text-stone-900 text-right focus:border-amber-500 outline-none w-32"
              />
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
              {Object.entries(tray).map(([id, qty]) => {
                const item = allItemsMap[id];
                if (!item) return null;
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/80"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-bold text-stone-900">
                        {item.name}
                      </div>
                      <div className="text-xs text-stone-500">
                        {currencySymbol}{item.price.toFixed(2)} each
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="inline-flex items-center bg-white border border-stone-200 rounded-lg p-0.5 text-xs font-bold">
                        <button
                          onClick={() => updateTrayQuantity(id, -1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-stone-100 rounded text-stone-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center">{qty}</span>
                        <button
                          onClick={() => updateTrayQuantity(id, 1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-stone-100 rounded text-stone-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-sm font-extrabold text-stone-900 w-16 text-right">
                        {currencySymbol}{(item.price * qty).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1.5 py-3 border-t border-stone-200 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal ({trayCalculations.itemCount} items)</span>
                <span className="font-semibold text-stone-800">
                  {currencySymbol}{trayCalculations.subtotal.toFixed(2)}
                </span>
              </div>

              {profile.taxPercentage > 0 && (
                <div className="flex justify-between">
                  <span>Sales Tax ({profile.taxPercentage}%)</span>
                  <span>{currencySymbol}{trayCalculations.taxAmount.toFixed(2)}</span>
                </div>
              )}

              {profile.serviceChargePercentage > 0 && (
                <div className="flex justify-between">
                  <span>Service Fee ({profile.serviceChargePercentage}%)</span>
                  <span>{currencySymbol}{trayCalculations.serviceAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-extrabold text-stone-900 pt-2 border-t border-dashed border-stone-200">
                <span>Estimated Total</span>
                <span className="text-amber-700">
                  {currencySymbol}{trayCalculations.grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 space-y-2">
              <button
                onClick={() => {
                  setIsTrayOpen(false);
                  setIsWaiterMode(true);
                }}
                className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition"
              >
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>Show Waiter My Order Screen</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={clearTray}
                  className="flex-1 py-2 text-xs font-semibold text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  Clear Tray
                </button>
                <button
                  onClick={() => setIsTrayOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-lg transition"
                >
                  Keep Browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Waiter Order Flash Screen */}
      {isWaiterMode && (
        <div className="fixed inset-0 z-50 bg-stone-950 text-white p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-6">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
                  Diner Order Summary
                </span>
                <h2 className="text-3xl font-black text-white mt-0.5">
                  {activeTable}
                </h2>
              </div>
              <button
                onClick={() => setIsWaiterMode(false)}
                className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-stone-400 text-sm mb-6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Show this screen to your server or counter staff:
            </p>

            <div className="space-y-4 mb-8">
              {Object.entries(tray).map(([id, qty]) => {
                const item = allItemsMap[id];
                if (!item) return null;
                return (
                  <div
                    key={id}
                    className="p-4 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 font-black text-base flex items-center justify-center">
                        {qty}x
                      </span>
                      <div>
                        <div className="text-lg font-extrabold text-white">
                          {item.name}
                        </div>
                        <div className="text-xs text-stone-400">
                          {currencySymbol}{item.price.toFixed(2)} each
                        </div>
                      </div>
                    </div>

                    <div className="text-base font-bold text-amber-300">
                      {currencySymbol}{(item.price * qty).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-stone-800 space-y-4">
            <div className="flex items-center justify-between text-xl font-black">
              <span className="text-stone-400">Total Due (Est.)</span>
              <span className="text-2xl text-amber-400">
                {currencySymbol}{trayCalculations.grandTotal.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => setIsWaiterMode(false)}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-2xl text-base transition"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DinerMenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-6 text-stone-500">
          Loading menu...
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
