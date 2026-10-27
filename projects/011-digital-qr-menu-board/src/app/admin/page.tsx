'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  Utensils,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Lock,
  Check,
  Search,
  ArrowLeft,
  QrCode,
  Settings,
  Layers,
  Sparkles,
  Flame,
  Leaf,
  Wifi,
  Printer,
  Download,
  AlertCircle,
  ExternalLink,
  Clock,
  ShieldCheck,
  CreditCard
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
  foodType: string;
  isJainAvailable: boolean;
  spiceLevel: number;
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

export default function AdminPage() {
  // Auth state
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'menu' | 'categories' | 'qr' | 'settings'>('menu');

  // Data state
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Modals & Forms
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  // New Item Form
  const [newItemData, setNewItemData] = useState({
    categoryId: '',
    name: '',
    nameHindi: '',
    description: '',
    price: '',
    halfPrice: '',
    foodType: 'veg',
    isJainAvailable: false,
    spiceLevel: 1,
    cuisineType: 'north-indian',
    isChefSpecial: false,
    isBestseller: false,
    isTodaySpecial: false,
    isNewItem: false,
    calories: '',
    prepTimeMinutes: '',
    servesCount: 'Serves 2',
    badge: '',
  });

  // Category Form
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryHindi, setNewCategoryHindi] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  // Table QR Studio
  const [selectedTable, setSelectedTable] = useState('Table 1');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [customOrigin, setCustomOrigin] = useState<string>('');

  useEffect(() => {
    const savedPin = sessionStorage.getItem('admin_pin');
    if (savedPin) {
      verifyAndLogin(savedPin);
    }
    if (typeof window !== 'undefined') {
      setCustomOrigin(window.location.origin);
    }
  }, []);

  const verifyAndLogin = async (pinToTry: string) => {
    try {
      setAuthError(null);
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinToTry }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setPin(pinToTry);
        sessionStorage.setItem('admin_pin', pinToTry);
        loadDashboardData(pinToTry);
      } else {
        setAuthError('Incorrect security PIN. Please check and retry.');
      }
    } catch (err) {
      setAuthError('Connection failed while verifying PIN');
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    verifyAndLogin(pin);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPin('');
    sessionStorage.removeItem('admin_pin');
  };

  const loadDashboardData = async (adminPin: string) => {
    try {
      setLoading(true);
      const [menuRes, profileRes] = await Promise.all([
        fetch('/api/menu', { headers: { 'x-admin-pin': adminPin } }),
        fetch('/api/profile'),
      ]);

      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setCategories(menuData.categories || []);
        if (menuData.categories && menuData.categories.length > 0 && !newItemData.categoryId) {
          setNewItemData(prev => ({ ...prev, categoryId: menuData.categories[0].id }));
        }
      }

      if (profileRes.ok) {
        const prof = await profileRes.json();
        setProfile(prof);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate Table QR Code
  useEffect(() => {
    if (!customOrigin) return;
    const url = `${customOrigin}/?table=${encodeURIComponent(selectedTable)}`;
    QRCode.toDataURL(url, {
      width: 440,
      margin: 2,
      color: { dark: '#1C1C1C', light: '#FFFFFF' },
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR generation error:', err));
  }, [selectedTable, customOrigin]);

  // 1-Tap Toggle Availability (86 Matrix)
  const toggleItemAvailability = async (item: MenuItem) => {
    const nextState = !item.isAvailable;
    // Optimistic update
    setCategories(prev =>
      prev.map(cat => ({
        ...cat,
        items: cat.items.map(i => (i.id === item.id ? { ...i, isAvailable: nextState } : i)),
      }))
    );

    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
        },
        body: JSON.stringify({ isAvailable: nextState }),
      });

      if (!res.ok) throw new Error('Failed to update availability');
      showFlash(nextState ? `"${item.name}" marked in stock` : `"${item.name}" 86'd (Sold Out)`);
    } catch (err) {
      // Revert optimistic update
      setCategories(prev =>
        prev.map(cat => ({
          ...cat,
          items: cat.items.map(i => (i.id === item.id ? { ...i, isAvailable: !nextState } : i)),
        }))
      );
      alert('Error updating availability');
    }
  };

  // Inline Quick Price Edit
  const handleQuickPriceChange = async (item: MenuItem, newPriceStr: string, isHalf: boolean = false) => {
    const parsed = parseFloat(newPriceStr);
    if (isNaN(parsed) || parsed < 0) return;

    const payload = isHalf ? { halfPrice: parsed } : { price: parsed };

    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setCategories(prev =>
          prev.map(cat => ({
            ...cat,
            items: cat.items.map(i => (i.id === item.id ? { ...i, ...payload } : i)),
          }))
        );
        showFlash(`Updated ${isHalf ? 'half' : 'full'} price for "${item.name}" to ₹${parsed}`);
      }
    } catch (err) {
      alert('Failed to update price');
    }
  };

  // Delete Item
  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to remove "${itemName}" from the menu?`)) return;

    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': pin },
      });

      if (res.ok) {
        setCategories(prev =>
          prev.map(cat => ({
            ...cat,
            items: cat.items.filter(i => i.id !== itemId),
          }))
        );
        showFlash(`"${itemName}" removed from menu`);
      }
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  // Create Item
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemData.name || !newItemData.price || !newItemData.categoryId) {
      alert('Please fill in required fields (Name, Price, Category)');
      return;
    }

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
        },
        body: JSON.stringify(newItemData),
      });

      if (res.ok) {
        await loadDashboardData(pin);
        setIsAddItemOpen(false);
        setNewItemData({
          categoryId: categories[0]?.id || '',
          name: '',
          nameHindi: '',
          description: '',
          price: '',
          halfPrice: '',
          foodType: 'veg',
          isJainAvailable: false,
          spiceLevel: 1,
          cuisineType: 'north-indian',
          isChefSpecial: false,
          isBestseller: false,
          isTodaySpecial: false,
          isNewItem: false,
          calories: '',
          prepTimeMinutes: '',
          servesCount: 'Serves 2',
          badge: '',
        });
        showFlash('New dish added to the menu!');
      } else {
        alert('Failed to create menu item');
      }
    } catch (err) {
      alert('Error creating menu item');
    }
  };

  // Update Item
  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const res = await fetch(`/api/items/${editingItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
        },
        body: JSON.stringify(editingItem),
      });

      if (res.ok) {
        await loadDashboardData(pin);
        setEditingItem(null);
        showFlash(`Saved changes to "${editingItem.name}"`);
      }
    } catch (err) {
      alert('Error updating item');
    }
  };

  // Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
        },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          nameHindi: newCategoryHindi.trim() || undefined,
          description: newCategoryDesc.trim() || undefined,
        }),
      });

      if (res.ok) {
        await loadDashboardData(pin);
        setNewCategoryName('');
        setNewCategoryHindi('');
        setNewCategoryDesc('');
        setIsAddCategoryOpen(false);
        showFlash('New category created!');
      }
    } catch (err) {
      alert('Failed to create category');
    }
  };

  // Delete Category
  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!confirm(`Delete category "${catName}" and ALL of its menu items?`)) return;

    try {
      const res = await fetch(`/api/categories/${catId}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': pin },
      });

      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== catId));
        showFlash(`Category "${catName}" deleted`);
      }
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  // Save Settings
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
        },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        showFlash('Restaurant profile & GST settings saved!');
      } else {
        alert('Failed to save settings');
      }
    } catch (err) {
      alert('Error saving settings');
    }
  };

  const showFlash = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3200);
  };

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);
  const outOfStockItems = categories.reduce(
    (sum, c) => sum + c.items.filter(i => !i.isAvailable).length,
    0
  );

  // PIN Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white font-sans">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-7 shadow-elevated">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-zred-500/10 border border-zred-500/20 text-zred-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-subtle">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="font-display text-2xl font-black text-white tracking-tight">Captain & Kitchen Studio</h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Enter authorized PIN to manage dishes, 86 stock status, and QR codes.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={8}
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="Enter PIN"
                autoFocus
                className="w-full px-4 py-3.5 bg-slate-950 text-white rounded-xl text-center text-2xl font-bold tracking-widest border border-slate-800 focus:border-zred-500 focus:outline-none transition"
              />
            </div>

            {authError && (
              <div className="text-xs text-rose-300 text-center font-medium bg-rose-950/60 border border-rose-800/80 py-2.5 px-3 rounded-xl animate-fade-in">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-zred-600 hover:bg-zred-700 text-white font-black rounded-xl text-xs transition shadow-card touch-press uppercase tracking-wider"
            >
              Unlock Kitchen Studio
            </button>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Diner Menu
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans">
      {/* Toast Alert */}
      {statusMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-elevated border border-slate-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-subtle">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 text-slate-500 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition touch-press"
              title="Return to Public Menu"
              aria-label="Back to public menu"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="text-[10px] uppercase font-black tracking-wider text-zred-600">
                Live Kitchen Operations Hub
              </div>
              <h1 className="font-display text-base sm:text-lg font-black text-slate-900 leading-tight">
                {profile?.name || 'Spice Route Kitchen'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition touch-press"
            >
              <span>View Diner View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition text-xs font-bold flex items-center gap-1.5 touch-press"
              title="Lock & Exit Dashboard"
            >
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Lock</span>
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 overflow-x-auto no-scrollbar text-xs font-black border-t border-slate-100 pt-1">
          <button
            onClick={() => setActiveTab('menu')}
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap touch-press ${
              activeTab === 'menu'
                ? 'border-zred-600 text-zred-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Menu & 86 Matrix</span>
            {outOfStockItems > 0 && (
              <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] tabular-nums font-bold">
                {outOfStockItems} 86'd
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap touch-press ${
              activeTab === 'categories'
                ? 'border-zred-600 text-zred-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap touch-press ${
              activeTab === 'qr'
                ? 'border-zred-600 text-zred-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Table QR Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap touch-press ${
              activeTab === 'settings'
                ? 'border-zred-600 text-zred-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Store & GST Settings</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* TAB 1: MENU & 86 MATRIX */}
        {activeTab === 'menu' && (
          <div className="space-y-5">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Total Offerings
                </div>
                <div className="font-display text-2xl font-black text-slate-900 mt-1 tabular-nums">
                  {totalItems}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
                <div className="text-[10px] font-black uppercase tracking-wider text-rose-600">
                  86'd (Sold Out)
                </div>
                <div className="font-display text-2xl font-black text-rose-600 mt-1 tabular-nums">
                  {outOfStockItems}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
                <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  In Stock & Active
                </div>
                <div className="font-display text-2xl font-black text-emerald-700 mt-1 tabular-nums">
                  {totalItems - outOfStockItems}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Live Categories
                </div>
                <div className="font-display text-2xl font-black text-slate-900 mt-1 tabular-nums">
                  {categories.length}
                </div>
              </div>
            </div>

            {/* Filter and Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-card">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search dishes by name or ingredients..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:border-zred-500 transition"
                  />
                </div>

                <select
                  value={selectedCategoryFilter}
                  onChange={e => setSelectedCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-800 focus:outline-none font-bold"
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setIsAddItemOpen(true)}
                className="px-4 py-2 bg-zred-600 hover:bg-zred-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-card transition touch-press"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Dish</span>
              </button>
            </div>

            {/* Menu Items Matrix */}
            <div className="space-y-4">
              {categories
                .filter(cat => selectedCategoryFilter === 'all' || cat.id === selectedCategoryFilter)
                .map(cat => {
                  const itemsToShow = cat.items.filter(i =>
                    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (i.nameHindi && i.nameHindi.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    i.description.toLowerCase().includes(searchTerm.toLowerCase())
                  );

                  if (itemsToShow.length === 0) return null;

                  return (
                    <div
                      key={cat.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card"
                    >
                      <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                        <span className="font-display font-extrabold text-xs text-slate-900 tracking-tight">
                          {cat.name} {cat.nameHindi && `(${cat.nameHindi})`} • {itemsToShow.length} items
                        </span>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {itemsToShow.map(item => (
                          <div
                            key={item.id}
                            className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                              !item.isAvailable ? 'bg-rose-50/30' : 'hover:bg-slate-50/70'
                            }`}
                          >
                            {/* Dish Info */}
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span
                                  className={`food-indicator !w-3.5 !h-3.5 ${
                                    item.foodType === 'veg'
                                      ? 'food-veg'
                                      : item.foodType === 'egg'
                                      ? 'food-egg'
                                      : 'food-nonveg'
                                  }`}
                                />
                                <span className="font-display font-bold text-sm text-slate-900">
                                  {item.name}
                                </span>
                                {item.nameHindi && (
                                  <span className="text-xs text-slate-400 font-medium">
                                    ({item.nameHindi})
                                  </span>
                                )}
                                {item.badge && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-zred-100 text-zred-900 rounded">
                                    {item.badge}
                                  </span>
                                )}
                                {item.isJainAvailable && (
                                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                                    Jain
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">
                                {item.description}
                              </p>
                            </div>

                            {/* Quick Price & 86 Stock Controls */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                              {/* Full Price Inline Input */}
                              <div className="flex items-center gap-1 text-xs">
                                <span className="text-slate-400 font-bold">₹</span>
                                <input
                                  type="number"
                                  step="1"
                                  defaultValue={item.price}
                                  onBlur={e => handleQuickPriceChange(item, e.target.value, false)}
                                  className="w-16 px-2 py-1 text-xs font-black text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-right focus:outline-none focus:border-zred-500 tabular-nums"
                                  title="Change full price and click outside to save"
                                />
                              </div>

                              {/* Half Price Input (if applicable) */}
                              {item.halfPrice !== null && (
                                <div className="flex items-center gap-1 text-xs">
                                  <span className="text-slate-400 font-medium text-[10px]">Half: ₹</span>
                                  <input
                                    type="number"
                                    step="1"
                                    defaultValue={item.halfPrice}
                                    onBlur={e => handleQuickPriceChange(item, e.target.value, true)}
                                    className="w-14 px-2 py-1 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-right focus:outline-none focus:border-zred-500 tabular-nums"
                                    title="Change half price and click outside to save"
                                  />
                                </div>
                              )}

                              {/* 1-Tap 86 Stock Toggle */}
                              <button
                                onClick={() => toggleItemAvailability(item)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition touch-press ${
                                  item.isAvailable
                                    ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs'
                                }`}
                                title="Click to instantly toggle stock status"
                              >
                                {item.isAvailable ? (
                                  <>
                                    <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                                    <span>In Stock</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>86'd (Sold Out)</span>
                                  </>
                                )}
                              </button>

                              {/* Edit & Delete Action Buttons */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setEditingItem(item)}
                                  className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition touch-press"
                                  title="Edit full dish details"
                                  aria-label="Edit dish"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id, item.name)}
                                  className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition touch-press"
                                  title="Delete item"
                                  aria-label="Delete dish"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">Menu Courses & Categories</h2>
                <p className="text-xs text-slate-500">
                  Organize, reorder, or add distinct courses displayed on diner smartphones.
                </p>
              </div>
              <button
                onClick={() => setIsAddCategoryOpen(true)}
                className="px-3.5 py-2 bg-zred-600 hover:bg-zred-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-card touch-press"
              >
                <Plus className="w-4 h-4" />
                <span>New Category</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-card">
              {categories.map((cat, idx) => (
                <div
                  key={cat.id}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center tabular-nums">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-display text-sm font-bold text-slate-900">
                        {cat.name} {cat.nameHindi && <span className="text-xs text-slate-400 font-normal">({cat.nameHindi})</span>}
                      </div>
                      <div className="text-xs text-slate-500">
                        {cat.items.length} dishes • {cat.description || 'No description added'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-2 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition touch-press"
                      title="Delete category"
                      aria-label="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TABLE QR STUDIO */}
        {activeTab === 'qr' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-base sm:text-lg font-black text-slate-900">
                Table QR Studio & Standee Tent Cards
              </h2>
              <p className="text-xs text-slate-500">
                Generate high-resolution printable QR codes for tables, bar counters, and outdoor patio seating.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Controls */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-card">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1.5">
                    Select Dining Table:
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-3">
                    {Array.from({ length: profile?.tableCount || 20 }, (_, i) => `Table ${i + 1}`).map(tbl => (
                      <button
                        key={tbl}
                        onClick={() => setSelectedTable(tbl)}
                        className={`py-2 px-1 text-xs font-bold rounded-xl border transition touch-press ${
                          selectedTable === tbl
                            ? 'bg-zred-600 text-white border-zred-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {tbl}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {['Bar Counter', 'Takeaway', 'Patio Section'].map(special => (
                      <button
                        key={special}
                        onClick={() => setSelectedTable(special)}
                        className={`py-1.5 px-3 text-xs font-bold rounded-xl border transition touch-press ${
                          selectedTable === special
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {special}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1.5">
                    Menu Base URL / Custom Domain:
                  </label>
                  <input
                    type="text"
                    value={customOrigin}
                    onChange={e => setCustomOrigin(e.target.value)}
                    placeholder="https://menu.yourrestaurant.com"
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-zred-500 font-mono text-slate-900"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Destination: <span className="font-mono text-slate-700">{customOrigin}/?table={encodeURIComponent(selectedTable)}</span>
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-card transition touch-press"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>Print Table Tent Card</span>
                  </button>

                  {qrDataUrl && (
                    <a
                      href={qrDataUrl}
                      download={`QR-${selectedTable.replace(/\s+/g, '-')}.png`}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition touch-press"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PNG</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Printable Standee Preview */}
              <div className="flex flex-col items-center justify-center">
                <div
                  id="printable-card"
                  className="w-72 bg-white rounded-3xl p-6 shadow-elevated border-2 border-slate-900 text-center flex flex-col items-center relative overflow-hidden"
                >
                  <div className="w-full pb-3 border-b border-slate-200 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zred-600">
                      Digital QR Menu
                    </span>
                    <h3 className="font-display text-lg font-black text-slate-900 mt-0.5">
                      {profile?.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {profile?.tagline}
                    </p>
                  </div>

                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Table QR Code"
                      className="w-48 h-48 rounded-2xl border border-slate-100 shadow-subtle mb-3"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-slate-100 rounded-2xl flex items-center justify-center mb-3 text-slate-400 text-xs">
                      Rendering QR Code...
                    </div>
                  )}

                  <div className="w-full bg-zred-600 text-white py-1.5 px-3 rounded-xl mb-3 shadow-2xs">
                    <span className="text-xs font-black tracking-wider uppercase">
                      {selectedTable}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-800 mb-2">
                    Scan with any phone camera to view full menu & order
                  </p>

                  {profile?.wifiPassword && (
                    <div className="w-full pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-slate-500" />
                      <span>Wi-Fi: <strong className="text-slate-900 font-semibold">{profile.wifiPassword}</strong></span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Preview of printable 4x6 table tent standee
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STORE & GST SETTINGS */}
        {activeTab === 'settings' && profile && (
          <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-card">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">Restaurant & Compliance Profile</h2>
              <p className="text-xs text-slate-500">
                Configure establishment identity, Indian GST breakdown (CGST/SGST), FSSAI number, and UPI details.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Restaurant Name:
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-zred-500 font-display font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Tagline / Subtitle:
                </label>
                <input
                  type="text"
                  value={profile.tagline}
                  onChange={e => setProfile({ ...profile, tagline: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-zred-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Concept Description:
                </label>
                <textarea
                  rows={2}
                  value={profile.description}
                  onChange={e => setProfile({ ...profile, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-zred-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  CGST Rate (%):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.cgstPercentage}
                  onChange={e => setProfile({ ...profile, cgstPercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-zred-500 tabular-nums font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  SGST Rate (%):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.sgstPercentage}
                  onChange={e => setProfile({ ...profile, sgstPercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-zred-500 tabular-nums font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  GSTIN (GST Number):
                </label>
                <input
                  type="text"
                  value={profile.gstNumber}
                  onChange={e => setProfile({ ...profile, gstNumber: e.target.value })}
                  placeholder="07AAAAA1234A1Z5"
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-zred-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  FSSAI License Number:
                </label>
                <input
                  type="text"
                  value={profile.fssaiLicense}
                  onChange={e => setProfile({ ...profile, fssaiLicense: e.target.value })}
                  placeholder="10019011006543"
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-zred-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  UPI Payment ID (for instant guest pay):
                </label>
                <input
                  type="text"
                  value={profile.upiId}
                  onChange={e => setProfile({ ...profile, upiId: e.target.value })}
                  placeholder="yourstore@upi"
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-zred-500 font-mono font-bold text-zred-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Guest Wi-Fi SSID & Password:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={profile.wifiSsid}
                    onChange={e => setProfile({ ...profile, wifiSsid: e.target.value })}
                    placeholder="SSID"
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={profile.wifiPassword}
                    onChange={e => setProfile({ ...profile, wifiPassword: e.target.value })}
                    placeholder="Password"
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Opening Hours:
                </label>
                <input
                  type="text"
                  value={profile.openingHours}
                  onChange={e => setProfile({ ...profile, openingHours: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Number of Dining Tables:
                </label>
                <input
                  type="number"
                  value={profile.tableCount}
                  onChange={e => setProfile({ ...profile, tableCount: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none tabular-nums"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-zred-600 hover:bg-zred-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-card transition touch-press"
              >
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </button>
            </div>
          </form>
        )}
      </main>

      {/* MODAL: ADD DISH */}
      {isAddItemOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-elevated max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-display text-base font-black text-slate-900">Add New Dish</h3>
              <button
                onClick={() => setIsAddItemOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-full"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Category:</label>
                <select
                  value={newItemData.categoryId}
                  onChange={e => setNewItemData({ ...newItemData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  required
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Dish Name (English):</label>
                  <input
                    type="text"
                    placeholder="e.g. Paneer Butter Masala"
                    value={newItemData.name}
                    onChange={e => setNewItemData({ ...newItemData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Hindi Name (Optional):</label>
                  <input
                    type="text"
                    placeholder="e.g. पनीर बटर मसाला"
                    value={newItemData.nameHindi}
                    onChange={e => setNewItemData({ ...newItemData, nameHindi: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Description:</label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, preparation technique, serving notes..."
                  value={newItemData.description}
                  onChange={e => setNewItemData({ ...newItemData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Full Price (₹):</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="289"
                    value={newItemData.price}
                    onChange={e => setNewItemData({ ...newItemData, price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold tabular-nums"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Half Price (₹):</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="Optional"
                    value={newItemData.halfPrice}
                    onChange={e => setNewItemData({ ...newItemData, halfPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Food Classification:</label>
                  <select
                    value={newItemData.foodType}
                    onChange={e => setNewItemData({ ...newItemData, foodType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  >
                    <option value="veg">🟢 Veg</option>
                    <option value="nonveg">🔴 Non-Veg</option>
                    <option value="egg">🟡 Egg</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Spice Level (0-4):</label>
                  <select
                    value={newItemData.spiceLevel}
                    onChange={e => setNewItemData({ ...newItemData, spiceLevel: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value={0}>0 - Mild / Sweet</option>
                    <option value={1}>1 - Medium Mild 🌶️</option>
                    <option value={2}>2 - Medium 🌶️🌶️</option>
                    <option value={3}>3 - Spicy 🌶️🌶️🌶️</option>
                    <option value={4}>4 - Extra Hot 🌶️🌶️🌶️🌶️</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Prep Time (mins):</label>
                  <input
                    type="number"
                    placeholder="12"
                    value={newItemData.prepTimeMinutes}
                    onChange={e => setNewItemData({ ...newItemData, prepTimeMinutes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Serves Count:</label>
                  <input
                    type="text"
                    placeholder="Serves 2"
                    value={newItemData.servesCount}
                    onChange={e => setNewItemData({ ...newItemData, servesCount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Special Badges & Flags:</label>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newItemData.isBestseller}
                      onChange={e => setNewItemData({ ...newItemData, isBestseller: e.target.checked })}
                    />
                    <span>Bestseller</span>
                  </label>
                  <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newItemData.isChefSpecial}
                      onChange={e => setNewItemData({ ...newItemData, isChefSpecial: e.target.checked })}
                    />
                    <span>Chef Special</span>
                  </label>
                  <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newItemData.isTodaySpecial}
                      onChange={e => setNewItemData({ ...newItemData, isTodaySpecial: e.target.checked })}
                    />
                    <span>Today Special</span>
                  </label>
                  <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newItemData.isJainAvailable}
                      onChange={e => setNewItemData({ ...newItemData, isJainAvailable: e.target.checked })}
                    />
                    <span>Jain Option Available</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition touch-press"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-zred-600 hover:bg-zred-700 text-white rounded-xl font-black transition shadow-card touch-press"
                >
                  Add Dish to Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT DISH */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-elevated max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-display text-base font-black text-slate-900">Edit Dish Details</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-full"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Dish Name:</label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Hindi Name:</label>
                  <input
                    type="text"
                    value={editingItem.nameHindi || ''}
                    onChange={e => setEditingItem({ ...editingItem, nameHindi: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Description:</label>
                <textarea
                  rows={2}
                  value={editingItem.description}
                  onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Full Price (₹):</label>
                  <input
                    type="number"
                    step="1"
                    value={editingItem.price}
                    onChange={e => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold tabular-nums"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Half Price (₹):</label>
                  <input
                    type="number"
                    step="1"
                    value={editingItem.halfPrice || ''}
                    onChange={e => setEditingItem({ ...editingItem, halfPrice: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Food Classification:</label>
                  <select
                    value={editingItem.foodType}
                    onChange={e => setEditingItem({ ...editingItem, foodType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  >
                    <option value="veg">🟢 Veg</option>
                    <option value="nonveg">🔴 Non-Veg</option>
                    <option value="egg">🟡 Egg</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Spice Level:</label>
                  <select
                    value={editingItem.spiceLevel}
                    onChange={e => setEditingItem({ ...editingItem, spiceLevel: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value={0}>0 - Mild / Sweet</option>
                    <option value={1}>1 - Medium Mild 🌶️</option>
                    <option value={2}>2 - Medium 🌶️🌶️</option>
                    <option value={3}>3 - Spicy 🌶️🌶️🌶️</option>
                    <option value={4}>4 - Extra Hot 🌶️🌶️🌶️🌶️</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Serves Count:</label>
                  <input
                    type="text"
                    value={editingItem.servesCount || ''}
                    onChange={e => setEditingItem({ ...editingItem, servesCount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Badges & Flags:</label>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingItem.isBestseller}
                      onChange={e => setEditingItem({ ...editingItem, isBestseller: e.target.checked })}
                    />
                    <span>Bestseller</span>
                  </label>
                  <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingItem.isChefSpecial}
                      onChange={e => setEditingItem({ ...editingItem, isChefSpecial: e.target.checked })}
                    />
                    <span>Chef Special</span>
                  </label>
                  <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingItem.isTodaySpecial}
                      onChange={e => setEditingItem({ ...editingItem, isTodaySpecial: e.target.checked })}
                    />
                    <span>Today Special</span>
                  </label>
                  <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingItem.isJainAvailable}
                      onChange={e => setEditingItem({ ...editingItem, isJainAvailable: e.target.checked })}
                    />
                    <span>Jain Available</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition touch-press"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-zred-600 hover:bg-zred-700 text-white rounded-xl font-black transition shadow-card touch-press"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CATEGORY */}
      {isAddCategoryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-elevated">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-display text-base font-bold text-slate-900">Add Category</h3>
              <button
                onClick={() => setIsAddCategoryOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-full"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Category Name (English):</label>
                <input
                  type="text"
                  placeholder="e.g. Sizzling Kebabs"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Hindi Name (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. कबाब"
                  value={newCategoryHindi}
                  onChange={e => setNewCategoryHindi(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Description (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Freshly roasted in clay tandoor"
                  value={newCategoryDesc}
                  onChange={e => setNewCategoryDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition touch-press"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-zred-600 hover:bg-zred-700 text-white rounded-xl font-black transition shadow-card touch-press"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
