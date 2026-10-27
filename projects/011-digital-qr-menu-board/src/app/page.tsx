'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  Utensils,
  Search,
  Wifi,
  Clock,
  Sparkles,
  Flame,
  Plus,
  Minus,
  X,
  Check,
  ChevronRight,
  Receipt,
  UserCheck,
  ShieldCheck,
  Bell,
  QrCode,
  Info,
  Layers,
  Heart,
  Share2,
  ChevronDown
} from 'lucide-react';

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  nameHindi: string | null;
  description: string;
  price: number;
  halfPrice: number | null;
  isAvailable: boolean;
  foodType: string; // 'veg' | 'nonveg' | 'egg'
  isJainAvailable: boolean;
  spiceLevel: number; // 0 to 4
  cuisineType: string;
  isChefSpecial: boolean;
  isBestseller: boolean;
  isTodaySpecial: boolean;
  isNewItem: boolean;
  calories: number | null;
  prepTimeMinutes: number | null;
  servesCount: string | null;
  badge: string | null;
  imageUrl: string | null;
  sortOrder: number;
}

interface Category {
  id: string;
  name: string;
  nameHindi: string | null;
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
  cgstPercentage: number;
  sgstPercentage: number;
  serviceChargePercentage: number;
  fssaiLicense: string;
  gstNumber: string;
  address: string;
  phone: string;
  email: string;
  wifiSsid: string;
  wifiPassword: string;
  openingHours: string;
  tableCount: number;
  upiId: string;
  bannerUrl: string | null;
  logoUrl: string | null;
}

// Tray stores: { [itemId]: { full: number, half: number } }
type TrayItem = { full: number; half: number };

function FoodSymbol({ type }: { type: string }) {
  if (type === 'veg') {
    return (
      <span className="food-indicator food-veg" title="Vegetarian">
        <span className="food-indicator-dot" />
      </span>
    );
  }
  if (type === 'egg') {
    return (
      <span className="food-indicator food-egg" title="Egg preparation">
        <span className="food-indicator-dot" />
      </span>
    );
  }
  return (
    <span className="food-indicator food-nonveg" title="Non-Vegetarian">
      <span className="food-indicator-dot" />
    </span>
  );
}

function SpiceIcons({ level }: { level: number }) {
  if (level <= 0) return null;
  return (
    <span className="inline-flex items-center text-xs text-rose-600 font-semibold gap-0.5" title={`Spice level: ${level}/4`}>
      {Array.from({ length: Math.min(level, 4) }).map((_, i) => (
        <span key={i}>🌶️</span>
      ))}
    </span>
  );
}

function MenuContent() {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get('table');

  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all');
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>('all'); // 'bestseller' | 'special' | 'today' | 'jain'

  // Tray & Modals
  const [tray, setTray] = useState<Record<string, TrayItem>>({});
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [isWaiterMode, setIsWaiterMode] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [upiQrUrl, setUpiQrUrl] = useState<string>('');
  const [wifiCopied, setWifiCopied] = useState(false);
  const [activeTable, setActiveTable] = useState<string>(tableParam || 'Table 1');
  const [waiterCalledNotice, setWaiterCalledNotice] = useState(false);

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
      if (!res.ok) throw new Error('Unable to retrieve menu details');
      const data = await res.json();
      setProfile(data.profile);
      setCategories(data.categories || []);
    } catch (err: any) {
      setError(err.message || 'Error loading live menu');
    } finally {
      setLoading(false);
    }
  };

  const copyWifiPassword = () => {
    if (!profile?.wifiPassword) return;
    navigator.clipboard.writeText(profile.wifiPassword);
    setWifiCopied(true);
    setTimeout(() => setWifiCopied(false), 2200);
  };

  const callWaiter = () => {
    setWaiterCalledNotice(true);
    setTimeout(() => setWaiterCalledNotice(false), 3500);
  };

  // Tray management (Supports Full and Half plate)
  const updateTray = (itemId: string, portion: 'full' | 'half', delta: number) => {
    setTray(prev => {
      const current = prev[itemId] || { full: 0, half: 0 };
      const newQty = Math.max(0, current[portion] + delta);
      const updated = { ...current, [portion]: newQty };

      if (updated.full === 0 && updated.half === 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: updated };
    });
  };

  const clearTray = () => {
    setTray({});
    setIsTrayOpen(false);
    setIsWaiterMode(false);
  };

  // Item lookup map
  const itemsMap = useMemo(() => {
    const map: Record<string, MenuItem> = {};
    for (const cat of categories) {
      for (const item of cat.items) {
        map[item.id] = item;
      }
    }
    return map;
  }, [categories]);

  // Tray totals and GST breakdown
  const trayCalculations = useMemo(() => {
    let subtotal = 0;
    let itemCount = 0;

    for (const [id, portions] of Object.entries(tray)) {
      const item = itemsMap[id];
      if (item) {
        if (portions.full > 0) {
          subtotal += item.price * portions.full;
          itemCount += portions.full;
        }
        if (portions.half > 0 && item.halfPrice) {
          subtotal += item.halfPrice * portions.half;
          itemCount += portions.half;
        }
      }
    }

    const cgstRate = (profile?.cgstPercentage || 2.5) / 100;
    const sgstRate = (profile?.sgstPercentage || 2.5) / 100;
    const serviceRate = (profile?.serviceChargePercentage || 0) / 100;

    const cgstAmount = subtotal * cgstRate;
    const sgstAmount = subtotal * sgstRate;
    const totalGst = cgstAmount + sgstAmount;
    const serviceAmount = subtotal * serviceRate;
    const grandTotal = Math.round(subtotal + totalGst + serviceAmount);

    return {
      subtotal,
      itemCount,
      cgstAmount,
      sgstAmount,
      totalGst,
      serviceAmount,
      grandTotal,
    };
  }, [tray, itemsMap, profile]);

  // Generate UPI QR Code on demand
  const handleOpenUpiPay = async () => {
    if (!profile?.upiId) {
      alert('UPI payment ID not configured by restaurant manager.');
      return;
    }
    const upiUri = `upi://pay?pa=${encodeURIComponent(profile.upiId)}&pn=${encodeURIComponent(profile.name)}&am=${trayCalculations.grandTotal}&cu=INR&tn=${encodeURIComponent(`Bill for ${activeTable}`)}`;

    try {
      const dataUrl = await QRCode.toDataURL(upiUri, {
        width: 380,
        margin: 2,
        color: { dark: '#1C1C1C', light: '#FFFFFF' },
      });
      setUpiQrUrl(dataUrl);
      setIsUpiModalOpen(true);
    } catch (err) {
      console.error('Failed to generate UPI QR', err);
    }
  };

  // Filtered categories & items
  const filteredCategories = useMemo(() => {
    return categories
      .map(cat => {
        const matchingItems = cat.items.filter(item => {
          // Veg-only toggle
          if (vegOnly && item.foodType !== 'veg') return false;

          // Text Search
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const textMatch =
              item.name.toLowerCase().includes(q) ||
              (item.nameHindi && item.nameHindi.toLowerCase().includes(q)) ||
              item.description.toLowerCase().includes(q) ||
              (item.badge && item.badge.toLowerCase().includes(q)) ||
              item.cuisineType.toLowerCase().includes(q);
            if (!textMatch) return false;
          }

          // Quick Filter Chips
          if (activeQuickFilter === 'bestseller' && !item.isBestseller) return false;
          if (activeQuickFilter === 'special' && !item.isChefSpecial) return false;
          if (activeQuickFilter === 'today' && !item.isTodaySpecial) return false;
          if (activeQuickFilter === 'jain' && !item.isJainAvailable) return false;
          if (activeQuickFilter === 'new' && !item.isNewItem) return false;

          return true;
        });

        return {
          ...cat,
          items: matchingItems,
        };
      })
      .filter(cat => {
        if (activeCategoryTab !== 'all' && cat.id !== activeCategoryTab) {
          return false;
        }
        return cat.items.length > 0;
      });
  }, [categories, searchQuery, vegOnly, activeQuickFilter, activeCategoryTab]);

  const currencySymbol = profile?.currencySymbol || '₹';

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-800">
        <div className="w-12 h-12 rounded-full border-4 border-zred-500 border-t-transparent animate-spin mb-4" />
        <h2 className="font-display text-xl font-bold tracking-tight text-slate-900">Lighting the Tandoor</h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">Fetching today's live menu & chef specials...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-center">
        <div className="w-16 h-16 bg-rose-50 text-zred-600 rounded-2xl flex items-center justify-center mb-4">
          <Utensils className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">Menu Currently Updating</h2>
        <p className="text-slate-600 text-xs sm:text-sm max-w-sm mb-6 leading-relaxed">
          {error || 'Unable to connect to live kitchen menu. Please reload or check table connectivity.'}
        </p>
        <button
          onClick={fetchMenuData}
          className="px-6 py-3 bg-zred-600 hover:bg-zred-700 text-white rounded-xl text-xs font-bold transition shadow-card touch-press"
        >
          Refresh Live Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-40 bg-slate-50 text-slate-900 selection:bg-zred-100 selection:text-zred-900 font-sans">
      {/* Waiter Summoned Toast Notification */}
      {waiterCalledNotice && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-full shadow-elevated flex items-center gap-3 animate-fade-in border border-slate-700">
          <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
          <span className="text-xs font-semibold">Service buzzer rung for {activeTable}! Captain notified.</span>
        </div>
      )}

      {/* Top Zomato Style App Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-subtle">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zred-500 text-white flex items-center justify-center font-display font-black text-lg shadow-sm">
              Z
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight">
                  {profile.name}
                </h1>
                <span className="px-2 py-0.5 bg-zred-50 text-zred-700 border border-zred-200 text-[10px] font-black rounded-md uppercase">
                  Dine-In
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">{profile.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Table Number Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-bold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activeTable}</span>
            </div>

            {/* Manager Login */}
            <Link
              href="/admin"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition touch-press"
              title="Staff & Kitchen Management"
              aria-label="Staff login"
            >
              <ShieldCheck className="w-4 h-4 text-slate-600" />
            </Link>
          </div>
        </div>

        {/* Guest Services Bar (Wi-Fi, Hours, Call Waiter) */}
        <div className="bg-slate-100/70 border-t border-slate-200/80 px-4 py-2">
          <div className="max-w-2xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5">
              {profile.wifiSsid && (
                <button
                  onClick={copyWifiPassword}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-700 hover:text-slate-950 font-medium whitespace-nowrap bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs"
                >
                  <Wifi className="w-3 h-3 text-slate-500" />
                  <span>Wi-Fi: <strong>{profile.wifiSsid}</strong></span>
                  {wifiCopied ? (
                    <span className="text-emerald-600 font-bold ml-1">Copied!</span>
                  ) : (
                    <span className="text-slate-400 text-[10px] underline ml-1">Key</span>
                  )}
                </button>
              )}

              {profile.openingHours && (
                <div className="inline-flex items-center gap-1 text-[11px] text-slate-600 whitespace-nowrap hidden sm:inline-flex">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{profile.openingHours}</span>
                </div>
              )}
            </div>

            {/* Service Bell Button */}
            <button
              onClick={callWaiter}
              className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-[11px] font-black uppercase tracking-wider transition shadow-2xs touch-press flex-shrink-0"
              title="Summon service staff to your table"
            >
              <Bell className="w-3.5 h-3.5 fill-current" />
              <span>Call Waiter</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sticky Zomato Filter & Search Bar */}
      <nav className="sticky top-[58px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-subtle">
        <div className="max-w-2xl mx-auto px-4 py-3 space-y-2.5">
          {/* Search Box + Veg Only Switch */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search butter chicken, dal makhani, naan..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-100/90 text-slate-900 placeholder:text-slate-400 rounded-xl text-xs sm:text-sm border border-slate-200 focus:bg-white focus:border-zred-500 focus:ring-2 focus:ring-zred-500/10 outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Zomato-Signature VEG ONLY Toggle Switch */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition touch-press flex-shrink-0 ${
                vegOnly
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 veg-toggle-active'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Toggle Vegetarian Only mode"
            >
              <span className="food-indicator food-veg !w-3.5 !h-3.5 !border">
                <span className="food-indicator-dot !w-1.5 !h-1.5" />
              </span>
              <span className="text-[11px] font-black">VEG ONLY</span>
              <div
                className={`w-7 h-4 rounded-full transition-colors p-0.5 flex items-center ${
                  vegOnly ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-white shadow-2xs" />
              </div>
            </button>
          </div>

          {/* Quick Filter Chips (Bestseller, Chef Special, Today Special, Jain) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            <button
              onClick={() => setActiveQuickFilter('all')}
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition touch-press ${
                activeQuickFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Dishes
            </button>

            <button
              onClick={() => setActiveQuickFilter(activeQuickFilter === 'bestseller' ? 'all' : 'bestseller')}
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap flex items-center gap-1 transition touch-press ${
                activeQuickFilter === 'bestseller'
                  ? 'bg-zred-600 text-white shadow-2xs'
                  : 'bg-white text-zred-700 border border-zred-200 hover:bg-zred-50'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400 fill-current" />
              <span>Bestsellers</span>
            </button>

            <button
              onClick={() => setActiveQuickFilter(activeQuickFilter === 'special' ? 'all' : 'special')}
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap flex items-center gap-1 transition touch-press ${
                activeQuickFilter === 'special'
                  ? 'bg-purple-800 text-white shadow-2xs'
                  : 'bg-white text-purple-800 border border-purple-200 hover:bg-purple-50'
              }`}
            >
              <span>👑 Chef's Special</span>
            </button>

            <button
              onClick={() => setActiveQuickFilter(activeQuickFilter === 'today' ? 'all' : 'today')}
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap flex items-center gap-1 transition touch-press ${
                activeQuickFilter === 'today'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              <span>🔥 Today's Special</span>
            </button>

            <button
              onClick={() => setActiveQuickFilter(activeQuickFilter === 'jain' ? 'all' : 'jain')}
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap flex items-center gap-1 transition touch-press ${
                activeQuickFilter === 'jain'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <span>🌱 Jain Available</span>
            </button>
          </div>

          {/* Category Horizontal Ribbon */}
          {categories.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-xs border-t border-slate-100">
              <button
                onClick={() => setActiveCategoryTab('all')}
                className={`py-1.5 px-3 rounded-lg font-bold tracking-tight whitespace-nowrap transition touch-press ${
                  activeCategoryTab === 'all'
                    ? 'bg-zred-500 text-white font-extrabold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Full Menu ({categories.reduce((acc, c) => acc + c.items.length, 0)})
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryTab(cat.id)}
                  className={`py-1.5 px-3 rounded-lg font-bold tracking-tight whitespace-nowrap transition touch-press ${
                    activeCategoryTab === cat.id
                      ? 'bg-zred-500 text-white font-extrabold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {cat.name} ({cat.items.length})
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Main Dining Menu Feed */}
      <main className="max-w-2xl mx-auto px-4 py-5 space-y-8">
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center my-8 shadow-card">
            <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-slate-900 mb-1">No items found</h3>
            <p className="text-xs text-slate-500 mb-5 max-w-xs mx-auto">
              We couldn't find dishes matching your filter. Try disabling "Veg Only" or clearing search query.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setVegOnly(false);
                setActiveQuickFilter('all');
                setActiveCategoryTab('all');
              }}
              className="px-5 py-2.5 bg-zred-600 hover:bg-zred-700 text-white rounded-xl text-xs font-bold transition shadow-card touch-press"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          filteredCategories.map(category => (
            <section key={category.id} className="scroll-mt-36">
              {/* Category Header */}
              <div className="flex items-baseline justify-between mb-3 pb-2 border-b-2 border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                      {category.name}
                    </h2>
                    {category.nameHindi && (
                      <span className="text-xs text-slate-400 font-medium">
                        ({category.nameHindi})
                      </span>
                    )}
                  </div>
                  {category.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{category.description}</p>
                  )}
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 tabular-nums">
                  {category.items.length}
                </span>
              </div>

              {/* Items List (Zomato Card Pattern) */}
              <div className="space-y-3">
                {category.items.map(item => {
                  const trayEntry = tray[item.id] || { full: 0, half: 0 };
                  const totalInTray = trayEntry.full + trayEntry.half;
                  const isSoldOut = !item.isAvailable;

                  return (
                    <article
                      key={item.id}
                      className={`relative bg-white rounded-2xl border p-4 transition shadow-card ${
                        isSoldOut
                          ? 'border-slate-200 bg-slate-50/70 opacity-70'
                          : 'border-slate-200 hover:border-zred-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Left Side: Dish Details */}
                        <div
                          className="flex-1 cursor-pointer select-none"
                          onClick={() => setSelectedItem(item)}
                          role="button"
                          tabIndex={0}
                          aria-label={`View details for ${item.name}`}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setSelectedItem(item);
                            }
                          }}
                        >
                          {/* Top Tag Row: Veg/Non-Veg icon + Badges + Spice */}
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <FoodSymbol type={item.foodType} />

                            {item.isBestseller && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5 fill-current" /> Bestseller
                              </span>
                            )}

                            {item.isChefSpecial && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                                Chef Special
                              </span>
                            )}

                            {item.isTodaySpecial && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-200">
                                Today Special
                              </span>
                            )}

                            {item.badge && !item.isBestseller && !item.isChefSpecial && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-zred-100 text-zred-900 border border-zred-200">
                                {item.badge}
                              </span>
                            )}

                            <SpiceIcons level={item.spiceLevel} />

                            {item.isJainAvailable && (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200" title="Can be made Jain (no onion/garlic)">
                                Jain
                              </span>
                            )}
                          </div>

                          {/* Dish Name + Hindi Name */}
                          <div className="flex items-baseline gap-2 mb-1">
                            <h3 className="font-display text-base font-bold text-slate-900 hover:text-zred-600 transition leading-snug">
                              {item.name}
                            </h3>
                            {item.nameHindi && (
                              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                                • {item.nameHindi}
                              </span>
                            )}
                          </div>

                          {/* Pricing Display */}
                          <div className="flex items-baseline gap-2.5 mb-1.5">
                            <span className="font-black text-slate-950 text-base tabular-nums">
                              {currencySymbol}{item.price.toFixed(0)}
                            </span>
                            {item.halfPrice && (
                              <span className="text-xs text-slate-500 font-semibold tabular-nums">
                                Half: {currencySymbol}{item.halfPrice.toFixed(0)}
                              </span>
                            )}
                            {item.servesCount && (
                              <span className="text-[11px] text-slate-400 font-medium">
                                ({item.servesCount})
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2">
                            {item.description}
                          </p>

                          {/* Meta line: Prep time & calories */}
                          <div className="flex items-center gap-3 text-[11px] text-slate-400">
                            {item.prepTimeMinutes && (
                              <span className="flex items-center gap-1 font-medium">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {item.prepTimeMinutes} mins
                              </span>
                            )}
                            {item.calories && (
                              <span className="font-medium">
                                {item.calories} kcal
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right Side: Zomato Style ADD Button / Stepper */}
                        <div className="flex flex-col items-end justify-between min-h-[76px] flex-shrink-0">
                          {isSoldOut ? (
                            <span className="px-3 py-1.5 bg-slate-200 text-slate-600 text-[11px] font-black rounded-xl uppercase tracking-wider">
                              Sold Out
                            </span>
                          ) : item.halfPrice ? (
                            /* Has Portion Options: Button prompts sheet or quick add */
                            totalInTray > 0 ? (
                              <div className="flex flex-col items-end gap-1">
                                <div className="inline-flex items-center bg-zred-600 text-white rounded-xl shadow-subtle font-black text-xs p-1">
                                  <button
                                    onClick={() => updateTray(item.id, 'full', -1)}
                                    className="w-7 h-7 flex items-center justify-center hover:bg-zred-700 rounded-lg transition touch-press"
                                    aria-label="Decrease full portion"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="w-7 text-center tabular-nums">{totalInTray}</span>
                                  <button
                                    onClick={() => updateTray(item.id, 'full', 1)}
                                    className="w-7 h-7 flex items-center justify-center hover:bg-zred-700 rounded-lg transition touch-press"
                                    aria-label="Increase full portion"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => setSelectedItem(item)}
                                  className="text-[10px] text-zred-600 font-bold underline"
                                >
                                  Customize Portions
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="px-4 py-2 bg-white text-zred-600 border-2 border-zred-500 hover:bg-zred-50 rounded-xl font-black text-xs flex items-center gap-1 transition shadow-2xs touch-press"
                                aria-label={`Add ${item.name} to tray`}
                              >
                                <span>ADD</span>
                                <Plus className="w-3.5 h-3.5 text-zred-600" />
                              </button>
                            )
                          ) : totalInTray > 0 ? (
                            /* Single Price Item Stepper */
                            <div className="inline-flex items-center bg-zred-600 text-white rounded-xl shadow-subtle font-black text-xs p-1">
                              <button
                                onClick={() => updateTray(item.id, 'full', -1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-zred-700 rounded-lg transition touch-press"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-7 text-center tabular-nums">{totalInTray}</span>
                              <button
                                onClick={() => updateTray(item.id, 'full', 1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-zred-700 rounded-lg transition touch-press"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            /* Normal ADD Button */
                            <button
                              onClick={() => updateTray(item.id, 'full', 1)}
                              className="px-4 py-2 bg-white text-zred-600 border-2 border-zred-500 hover:bg-zred-50 rounded-xl font-black text-xs flex items-center gap-1 transition shadow-2xs touch-press"
                              aria-label={`Add ${item.name} to tray`}
                            >
                              <span>ADD</span>
                              <Plus className="w-3.5 h-3.5 text-zred-600" />
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedItem(item)}
                            className="text-[11px] font-semibold text-slate-400 hover:text-slate-800 mt-2 flex items-center gap-0.5 transition"
                          >
                            Details <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Floating Zomato Style Bottom Bar: Order Tray & Bill Estimator */}
      {trayCalculations.itemCount > 0 && (
        <aside
          aria-label="Table order summary"
          className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-transparent pointer-events-none"
        >
          <div className="max-w-md mx-auto pointer-events-auto">
            <button
              onClick={() => setIsTrayOpen(true)}
              className="w-full bg-zred-600 hover:bg-zred-700 text-white p-3.5 rounded-2xl shadow-elevated flex items-center justify-between border border-zred-500 touch-press transition animate-slide-up"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-zred-600 flex items-center justify-center font-black text-sm shadow-subtle tabular-nums">
                  {trayCalculations.itemCount}
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-zred-100">
                    {activeTable} • Tray Total
                  </div>
                  <div className="text-base font-black text-white tabular-nums">
                    {currencySymbol}{trayCalculations.grandTotal}
                    <span className="text-[10px] font-normal text-zred-200 ml-1.5">
                      (incl. 5% GST)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-black bg-white/20 px-3.5 py-2 rounded-xl text-white">
                <span>View Order</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </aside>
      )}

      {/* MODAL 1: Dish Details & Portion Selector Bottom Sheet */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-drawer sm:shadow-elevated max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <FoodSymbol type={selectedItem.foodType} />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {selectedItem.foodType.toUpperCase()}
                  </span>
                  <SpiceIcons level={selectedItem.spiceLevel} />
                </div>
                <h3 className="font-display text-xl font-extrabold text-slate-900 leading-tight">
                  {selectedItem.name}
                </h3>
                {selectedItem.nameHindi && (
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {selectedItem.nameHindi}
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition"
                aria-label="Close dish modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5">
              {selectedItem.description}
            </p>

            {/* Dish Attributes (Prep time, calories, cuisine, jain) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Cuisine</span>
                <span className="font-bold text-slate-800 capitalize">{selectedItem.cuisineType}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Prep Time</span>
                <span className="font-bold text-slate-800">{selectedItem.prepTimeMinutes ? `${selectedItem.prepTimeMinutes} mins` : 'Fresh'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Energy</span>
                <span className="font-bold text-slate-800">{selectedItem.calories ? `${selectedItem.calories} kcal` : 'Fresh'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Jain Option</span>
                <span className={`font-bold ${selectedItem.isJainAvailable ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {selectedItem.isJainAvailable ? 'Yes, Available' : 'No'}
                </span>
              </div>
            </div>

            {/* Portion Selection Controls */}
            {selectedItem.isAvailable ? (
              <div className="space-y-3 mb-5">
                <div className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Select Portions:
                </div>

                {/* Full Plate Row */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <div className="font-bold text-xs text-slate-900">
                      Full Plate
                      {selectedItem.servesCount && <span className="text-slate-400 font-normal ml-1">({selectedItem.servesCount})</span>}
                    </div>
                    <div className="text-sm font-black text-slate-950 tabular-nums">
                      {currencySymbol}{selectedItem.price.toFixed(0)}
                    </div>
                  </div>

                  <div className="inline-flex items-center bg-white border border-slate-300 rounded-xl p-1 shadow-2xs">
                    <button
                      onClick={() => updateTray(selectedItem.id, 'full', -1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-700 touch-press"
                      aria-label="Decrease full portion"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center font-black text-xs tabular-nums">
                      {tray[selectedItem.id]?.full || 0}
                    </span>
                    <button
                      onClick={() => updateTray(selectedItem.id, 'full', 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-700 touch-press"
                      aria-label="Increase full portion"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Half Plate Row (if offered) */}
                {selectedItem.halfPrice && (
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <div className="font-bold text-xs text-slate-900">
                        Half Plate <span className="text-slate-400 font-normal">(Serves 1)</span>
                      </div>
                      <div className="text-sm font-black text-slate-950 tabular-nums">
                        {currencySymbol}{selectedItem.halfPrice.toFixed(0)}
                      </div>
                    </div>

                    <div className="inline-flex items-center bg-white border border-slate-300 rounded-xl p-1 shadow-2xs">
                      <button
                        onClick={() => updateTray(selectedItem.id, 'half', -1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-700 touch-press"
                        aria-label="Decrease half portion"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center font-black text-xs tabular-nums">
                        {tray[selectedItem.id]?.half || 0}
                      </span>
                      <button
                        onClick={() => updateTray(selectedItem.id, 'half', 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-700 touch-press"
                        aria-label="Increase half portion"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl text-center text-xs mb-5">
                Sold Out for Today
              </div>
            )}

            <button
              onClick={() => setSelectedItem(null)}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs transition shadow-card touch-press"
            >
              Done & Return to Menu
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Full Tray & Indian GST Bill Breakdown Drawer */}
      {isTrayOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-drawer sm:shadow-elevated max-h-[92vh] flex flex-col animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-zred-600" />
                <h3 className="font-display text-lg font-black text-slate-900">
                  Table Order Tray
                </h3>
              </div>
              <button
                onClick={() => setIsTrayOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition"
                aria-label="Close tray"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Table Badge Bar */}
            <div className="flex items-center justify-between bg-slate-50 px-3.5 py-2.5 rounded-xl mb-3 text-xs font-bold text-slate-700 border border-slate-200">
              <span>Ordering for:</span>
              <input
                type="text"
                value={activeTable}
                onChange={e => setActiveTable(e.target.value)}
                placeholder="e.g. Table 4"
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-black text-slate-900 text-right focus:border-zred-500 outline-none w-32"
              />
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
              {Object.entries(tray).map(([id, portions]) => {
                const item = itemsMap[id];
                if (!item) return null;

                return (
                  <div key={id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <FoodSymbol type={item.foodType} />
                      <span className="font-display text-sm font-bold text-slate-900 flex-1">
                        {item.name}
                      </span>
                    </div>

                    {/* Full portion row */}
                    {portions.full > 0 && (
                      <div className="flex items-center justify-between text-xs pl-6">
                        <span className="text-slate-600">Full Plate</span>
                        <div className="flex items-center gap-3">
                          <div className="inline-flex items-center bg-white border border-slate-300 rounded-lg p-0.5 text-xs font-bold">
                            <button
                              onClick={() => updateTray(id, 'full', -1)}
                              className="w-5 h-5 flex items-center justify-center hover:bg-slate-100 rounded text-slate-700"
                              aria-label="Decrease full portion"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center tabular-nums">{portions.full}</span>
                            <button
                              onClick={() => updateTray(id, 'full', 1)}
                              className="w-5 h-5 flex items-center justify-center hover:bg-slate-100 rounded text-slate-700"
                              aria-label="Increase full portion"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-bold text-slate-900 w-16 text-right tabular-nums">
                            {currencySymbol}{(item.price * portions.full).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Half portion row */}
                    {portions.half > 0 && item.halfPrice && (
                      <div className="flex items-center justify-between text-xs pl-6">
                        <span className="text-slate-600">Half Plate</span>
                        <div className="flex items-center gap-3">
                          <div className="inline-flex items-center bg-white border border-slate-300 rounded-lg p-0.5 text-xs font-bold">
                            <button
                              onClick={() => updateTray(id, 'half', -1)}
                              className="w-5 h-5 flex items-center justify-center hover:bg-slate-100 rounded text-slate-700"
                              aria-label="Decrease half portion"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center tabular-nums">{portions.half}</span>
                            <button
                              onClick={() => updateTray(id, 'half', 1)}
                              className="w-5 h-5 flex items-center justify-center hover:bg-slate-100 rounded text-slate-700"
                              aria-label="Increase half portion"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-bold text-slate-900 w-16 text-right tabular-nums">
                            {currencySymbol}{(item.halfPrice * portions.half).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Indian GST Compliant Bill Breakdown */}
            <div className="space-y-1.5 py-3 border-t border-slate-200 text-xs text-slate-600 bg-slate-50/50 p-3 rounded-xl mb-3">
              <div className="flex justify-between">
                <span>Item Subtotal ({trayCalculations.itemCount} items)</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {currencySymbol}{trayCalculations.subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>CGST ({profile.cgstPercentage}%)</span>
                <span className="tabular-nums">{currencySymbol}{trayCalculations.cgstAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>SGST ({profile.sgstPercentage}%)</span>
                <span className="tabular-nums">{currencySymbol}{trayCalculations.sgstAmount.toFixed(2)}</span>
              </div>

              {profile.serviceChargePercentage > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Service Charge ({profile.serviceChargePercentage}%)</span>
                  <span className="tabular-nums">{currencySymbol}{trayCalculations.serviceAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-dashed border-slate-300">
                <span>Grand Total</span>
                <span className="text-zred-600 font-display tabular-nums">
                  {currencySymbol}{trayCalculations.grandTotal}
                </span>
              </div>
            </div>

            {/* Actions: Flash to Waiter or Pay via UPI */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsTrayOpen(false);
                  setIsWaiterMode(true);
                }}
                className="w-full py-3.5 bg-zred-600 hover:bg-zred-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-card transition touch-press"
              >
                <UserCheck className="w-4 h-4" />
                <span>Show Server My Order Flash</span>
              </button>

              {profile.upiId && (
                <button
                  onClick={handleOpenUpiPay}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-card touch-press"
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>Pay Bill via UPI ({currencySymbol}{trayCalculations.grandTotal})</span>
                </button>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={clearTray}
                  className="flex-1 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  Clear Tray
                </button>
                <button
                  onClick={() => setIsTrayOpen(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: UPI QR Payment Dialog */}
      {isUpiModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-elevated text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                UPI Instant Payment
              </span>
              <button
                onClick={() => setIsUpiModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-full"
                aria-label="Close UPI dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-3">
              <span className="text-xs text-slate-500 font-medium">Scan with Google Pay, PhonePe, Paytm</span>
              <div className="font-display text-2xl font-black text-slate-950 mt-1 tabular-nums">
                {currencySymbol}{trayCalculations.grandTotal}
              </div>
            </div>

            {upiQrUrl ? (
              <img
                src={upiQrUrl}
                alt="UPI Payment QR Code"
                className="w-52 h-52 mx-auto rounded-2xl border-2 border-slate-200 shadow-card mb-4"
              />
            ) : (
              <div className="w-52 h-52 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-xs text-slate-400">
                Generating QR...
              </div>
            )}

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono mb-4">
              UPI ID: <strong>{profile.upiId}</strong>
            </div>

            <button
              onClick={() => setIsUpiModalOpen(false)}
              className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black transition touch-press"
            >
              Done / Return to Menu
            </button>
          </div>
        </div>
      )}

      {/* FULLSCREEN SERVER ORDER FLASH SCREEN */}
      {isWaiterMode && (
        <div
          className="fixed inset-0 z-50 bg-slate-950 text-white p-6 flex flex-col justify-between overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <span className="text-xs uppercase font-black tracking-widest text-zred-400">
                  Customer Order Flash
                </span>
                <h2 className="font-display text-4xl font-black text-white mt-0.5">
                  {activeTable}
                </h2>
              </div>
              <button
                onClick={() => setIsWaiterMode(false)}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl"
                aria-label="Close server order flash"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-slate-400 text-sm mb-6 flex items-center gap-2 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              Show this screen to your table captain or order punch station:
            </p>

            <div className="space-y-3 mb-8">
              {Object.entries(tray).map(([id, portions]) => {
                const item = itemsMap[id];
                if (!item) return null;

                return (
                  <div key={id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-display text-lg font-bold text-white flex items-center gap-2">
                        <FoodSymbol type={item.foodType} />
                        <span>{item.name}</span>
                      </div>
                    </div>

                    {portions.full > 0 && (
                      <div className="flex items-center justify-between text-sm pl-4">
                        <span className="text-slate-300 font-semibold">Full Plate (x{portions.full})</span>
                        <span className="font-mono text-amber-400 tabular-nums">
                          {currencySymbol}{(item.price * portions.full).toFixed(0)}
                        </span>
                      </div>
                    )}

                    {portions.half > 0 && item.halfPrice && (
                      <div className="flex items-center justify-between text-sm pl-4">
                        <span className="text-slate-300 font-semibold">Half Plate (x{portions.half})</span>
                        <span className="font-mono text-amber-400 tabular-nums">
                          {currencySymbol}{(item.halfPrice * portions.half).toFixed(0)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xl font-bold">
              <span className="text-slate-400">Total with 5% GST</span>
              <span className="font-display text-3xl font-black text-amber-400 tabular-nums">
                {currencySymbol}{trayCalculations.grandTotal}
              </span>
            </div>

            <button
              onClick={() => setIsWaiterMode(false)}
              className="w-full py-4 bg-zred-500 hover:bg-zred-600 text-white font-black rounded-2xl text-base transition touch-press"
            >
              Order Confirmed / Return
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
        <div className="min-h-screen flex items-center justify-center p-6 text-slate-600 bg-slate-50 font-sans">
          Loading live menu...
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
