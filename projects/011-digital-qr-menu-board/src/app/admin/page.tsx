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
  Unlock,
  Check,
  Search,
  ArrowLeft,
  QrCode,
  Settings,
  Layers,
  Sparkles,
  Flame,
  Wheat,
  Leaf,
  Wifi,
  Printer,
  Download,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';

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

export default function AdminPage() {
  // Auth state
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'menu' | 'categories' | 'qr' | 'settings'>('menu');

  // Data
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

  // New Item Form State
  const [newItemData, setNewItemData] = useState({
    categoryId: '',
    name: '',
    description: '',
    price: '',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    isChefSpecial: false,
    calories: '',
    prepTimeMinutes: '',
    badge: '',
  });

  // Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  // QR Studio State
  const [selectedTable, setSelectedTable] = useState('Table 1');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [customOrigin, setCustomOrigin] = useState<string>('');

  // Check saved PIN on mount
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
        setAuthError('Incorrect PIN. Please try again.');
      }
    } catch (err) {
      setAuthError('Failed to verify PIN');
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

  // Generate QR Code whenever selected table or origin changes
  useEffect(() => {
    if (!customOrigin) return;
    const url = `${customOrigin}/?table=${encodeURIComponent(selectedTable)}`;
    QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1c1917',
        light: '#ffffff',
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR generation error:', err));
  }, [selectedTable, customOrigin]);

  // 1-Tap Toggle Availability (Out of Stock / 86)
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

      if (!res.ok) {
        throw new Error('Failed to update availability');
      }
      showFlash(nextState ? `"${item.name}" marked in stock` : `"${item.name}" marked OUT OF STOCK (86'd)`);
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
  const handleQuickPriceChange = async (item: MenuItem, newPriceStr: string) => {
    const parsed = parseFloat(newPriceStr);
    if (isNaN(parsed) || parsed < 0) return;

    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
        },
        body: JSON.stringify({ price: parsed }),
      });

      if (res.ok) {
        setCategories(prev =>
          prev.map(cat => ({
            ...cat,
            items: cat.items.map(i => (i.id === item.id ? { ...i, price: parsed } : i)),
          }))
        );
        showFlash(`Price for "${item.name}" updated to ${profile?.currencySymbol || '$'}${parsed.toFixed(2)}`);
      }
    } catch (err) {
      alert('Failed to update price');
    }
  };

  // Delete Item
  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) return;

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
          description: '',
          price: '',
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          isSpicy: false,
          isChefSpecial: false,
          calories: '',
          prepTimeMinutes: '',
          badge: '',
        });
        showFlash('New dish added successfully!');
      } else {
        alert('Failed to create item');
      }
    } catch (err) {
      alert('Error creating item');
    }
  };

  // Update Item Modal submit
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
        showFlash(`Updated "${editingItem.name}"`);
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
          description: newCategoryDesc.trim() || undefined,
        }),
      });

      if (res.ok) {
        await loadDashboardData(pin);
        setNewCategoryName('');
        setNewCategoryDesc('');
        setIsAddCategoryOpen(false);
        showFlash('Category created!');
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

  // Profile Save
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
        showFlash('Restaurant profile & settings saved!');
      } else {
        alert('Failed to save settings');
      }
    } catch (err) {
      alert('Error saving settings');
    }
  };

  const showFlash = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Stats calculation
  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);
  const outOfStockItems = categories.reduce(
    (sum, c) => sum + c.items.filter(i => !i.isAvailable).length,
    0
  );

  // If not authenticated, render Clean Numeric PIN lockpad
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-stone-900 text-stone-100">
        <div className="w-full max-w-sm bg-stone-800 border border-stone-700 rounded-3xl p-6 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-black text-white">Manager Studio</h1>
            <p className="text-xs text-stone-400 mt-1">
              Enter Admin PIN to manage menu, prices & table QRs
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={8}
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="Enter 4-digit PIN (default: 1234)"
                autoFocus
                className="w-full px-4 py-3 bg-stone-900 text-white rounded-xl text-center text-xl font-bold tracking-widest border border-stone-700 focus:border-amber-500 focus:outline-none transition"
              />
            </div>

            {authError && (
              <div className="text-xs text-rose-400 text-center font-medium bg-rose-500/10 border border-rose-500/20 py-2 rounded-xl">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-sm transition shadow-sm active:scale-98"
            >
              Unlock Dashboard
            </button>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="text-xs text-stone-400 hover:text-white inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Public Menu
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 pb-20">
      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed top-4 right-4 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-stone-700 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-4">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition"
              title="View Public Diner Menu"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="text-xs uppercase font-extrabold tracking-wider text-amber-600">
                Staff Control Hub
              </div>
              <h1 className="text-base font-black text-stone-900 leading-tight">
                {profile?.name || 'Digital Menu Board'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition"
            >
              <span>Live Menu</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition text-xs font-semibold flex items-center gap-1"
              title="Lock & Exit"
            >
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Lock</span>
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 overflow-x-auto no-scrollbar text-xs font-bold border-t border-stone-100 pt-1">
          <button
            onClick={() => setActiveTab('menu')}
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'menu'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Menu & 86 Matrix</span>
            {outOfStockItems > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded-full text-[10px]">
                {outOfStockItems} 86'd
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'categories'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'qr'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Table QR Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Store Settings</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* TAB 1: MENU & 86 MATRIX */}
        {activeTab === 'menu' && (
          <div className="space-y-5">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Total Items
                </div>
                <div className="text-xl font-black text-stone-900 mt-0.5">
                  {totalItems}
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
                  Out of Stock (86'd)
                </div>
                <div className="text-xl font-black text-rose-600 mt-0.5">
                  {outOfStockItems}
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  In Stock & Active
                </div>
                <div className="text-xl font-black text-emerald-700 mt-0.5">
                  {totalItems - outOfStockItems}
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Categories
                </div>
                <div className="text-xl font-black text-stone-900 mt-0.5">
                  {categories.length}
                </div>
              </div>
            </div>

            {/* Filter & Action Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search dishes to update price or stock..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-100 rounded-xl border border-stone-200 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <select
                  value={selectedCategoryFilter}
                  onChange={e => setSelectedCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-stone-100 rounded-xl border border-stone-200 text-stone-700 focus:outline-none font-semibold"
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
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Dish</span>
              </button>
            </div>

            {/* Menu Items Matrix */}
            <div className="space-y-4">
              {categories
                .filter(cat => selectedCategoryFilter === 'all' || cat.id === selectedCategoryFilter)
                .map(cat => {
                  const itemsToShow = cat.items.filter(i =>
                    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    i.description.toLowerCase().includes(searchTerm.toLowerCase())
                  );

                  if (itemsToShow.length === 0) return null;

                  return (
                    <div
                      key={cat.id}
                      className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-2xs"
                    >
                      <div className="bg-stone-50/80 px-4 py-2.5 border-b border-stone-200/80 flex items-center justify-between">
                        <span className="font-extrabold text-xs text-stone-800 uppercase tracking-wider">
                          {cat.name} ({itemsToShow.length})
                        </span>
                      </div>

                      <div className="divide-y divide-stone-100">
                        {itemsToShow.map(item => (
                          <div
                            key={item.id}
                            className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                              !item.isAvailable ? 'bg-rose-50/30' : 'hover:bg-stone-50/50'
                            }`}
                          >
                            {/* Dish Info */}
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="font-bold text-sm text-stone-900">
                                  {item.name}
                                </span>
                                {item.badge && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                                    {item.badge}
                                  </span>
                                )}
                                {item.isVegetarian && (
                                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1 rounded">
                                    Veg
                                  </span>
                                )}
                                {item.isSpicy && (
                                  <span className="text-[10px] text-rose-700 font-semibold bg-rose-50 px-1 rounded">
                                    Spicy
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-stone-500 line-clamp-1 max-w-xl">
                                {item.description}
                              </p>
                            </div>

                            {/* Quick Price & Stock Toggle Control */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                              {/* Quick Price Input */}
                              <div className="flex items-center gap-1 text-xs">
                                <span className="text-stone-400 font-bold">
                                  {profile?.currencySymbol || '$'}
                                </span>
                                <input
                                  type="number"
                                  step="0.01"
                                  defaultValue={item.price}
                                  onBlur={e => handleQuickPriceChange(item, e.target.value)}
                                  className="w-16 px-2 py-1 text-xs font-black text-stone-900 bg-stone-100 focus:bg-white border border-stone-200 rounded-lg text-right focus:outline-none focus:border-amber-500"
                                  title="Change price & tap outside to save"
                                />
                              </div>

                              {/* 1-Tap 86 / Out of Stock Toggle */}
                              <button
                                onClick={() => toggleItemAvailability(item)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition ${
                                  item.isAvailable
                                    ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                                }`}
                                title="Click to instantly toggle stock status"
                              >
                                {item.isAvailable ? (
                                  <>
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
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
                                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
                                  title="Edit full dish details"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id, item.name)}
                                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                  title="Delete item"
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
                <h2 className="text-base font-black text-stone-900">Menu Categories</h2>
                <p className="text-xs text-stone-500">
                  Organize and reorder sections displayed on the mobile menu
                </p>
              </div>
              <button
                onClick={() => setIsAddCategoryOpen(true)}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>New Category</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden divide-y divide-stone-100">
              {categories.map((cat, idx) => (
                <div
                  key={cat.id}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-stone-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-stone-100 text-stone-600 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-stone-900">{cat.name}</div>
                      <div className="text-xs text-stone-500">
                        {cat.items.length} items • {cat.description || 'No description'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete category"
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
              <h2 className="text-base font-black text-stone-900">Table QR Generator & Tent Card Studio</h2>
              <p className="text-xs text-stone-500">
                Generate high-resolution QR codes for each table, room, or counter with printable tent cards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Controls */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Select Dining Table or Station:
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                    {Array.from({ length: profile?.tableCount || 16 }, (_, i) => `Table ${i + 1}`).map(tbl => (
                      <button
                        key={tbl}
                        onClick={() => setSelectedTable(tbl)}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border transition ${
                          selectedTable === tbl
                            ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {tbl}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {['Bar Counter', 'Takeaway', 'Patio Area'].map(special => (
                      <button
                        key={special}
                        onClick={() => setSelectedTable(special)}
                        className={`py-1.5 px-3 text-xs font-bold rounded-xl border transition ${
                          selectedTable === special
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {special}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Base URL / Host Domain:
                  </label>
                  <input
                    type="text"
                    value={customOrigin}
                    onChange={e => setCustomOrigin(e.target.value)}
                    placeholder="https://menu.yourrestaurant.com"
                    className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Points QR code to: <span className="font-mono text-stone-600">{customOrigin}/?table={encodeURIComponent(selectedTable)}</span>
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>Print Table Tent Card</span>
                  </button>

                  {qrDataUrl && (
                    <a
                      href={qrDataUrl}
                      download={`QR-${selectedTable.replace(/\s+/g, '-')}.png`}
                      className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PNG</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Printable Card Preview */}
              <div className="flex flex-col items-center justify-center">
                <div
                  id="printable-card"
                  className="w-72 bg-white rounded-3xl p-6 shadow-xl border-2 border-stone-800 text-center flex flex-col items-center relative overflow-hidden"
                >
                  <div className="w-full pb-3 border-b border-stone-200 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                      Digital QR Menu
                    </span>
                    <h3 className="text-lg font-black text-stone-900 mt-0.5">
                      {profile?.name}
                    </h3>
                    <p className="text-[11px] text-stone-500 line-clamp-1">
                      {profile?.tagline}
                    </p>
                  </div>

                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Table QR Code"
                      className="w-48 h-48 rounded-xl border border-stone-100 shadow-xs mb-3"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-stone-100 rounded-xl flex items-center justify-center mb-3 text-stone-400 text-xs">
                      Generating QR...
                    </div>
                  )}

                  <div className="w-full bg-stone-900 text-white py-1.5 px-3 rounded-xl mb-3">
                    <span className="text-xs font-black tracking-wider uppercase">
                      {selectedTable}
                    </span>
                  </div>

                  <p className="text-xs font-extrabold text-stone-800 mb-2">
                    Scan with camera to view live menu & specials
                  </p>

                  {profile?.wifiPassword && (
                    <div className="w-full pt-2 border-t border-stone-100 text-[11px] text-stone-600 flex items-center justify-center gap-1">
                      <Wifi className="w-3.5 h-3.5 text-amber-600" />
                      <span>Wi-Fi: <strong>{profile.wifiPassword}</strong></span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-stone-400 mt-2">
                  Preview of printable 4x6 table tent card
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STORE SETTINGS */}
        {activeTab === 'settings' && profile && (
          <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-2xl border border-stone-200 space-y-6">
            <div>
              <h2 className="text-base font-black text-stone-900">Restaurant & Brand Profile</h2>
              <p className="text-xs text-stone-500">
                Configure your cafe or restaurant information, currency, tax rates, and Wi-Fi credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Business / Cafe Name:
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Tagline / Subheading:
                </label>
                <input
                  type="text"
                  value={profile.tagline}
                  onChange={e => setProfile({ ...profile, tagline: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  About / Bio:
                </label>
                <textarea
                  rows={2}
                  value={profile.description}
                  onChange={e => setProfile({ ...profile, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Currency Symbol:
                </label>
                <input
                  type="text"
                  value={profile.currencySymbol}
                  onChange={e => setProfile({ ...profile, currencySymbol: e.target.value })}
                  placeholder="$"
                  className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Sales Tax Percentage (%):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={profile.taxPercentage}
                  onChange={e => setProfile({ ...profile, taxPercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Guest Wi-Fi Network Name (SSID):
                </label>
                <input
                  type="text"
                  value={profile.wifiSsid}
                  onChange={e => setProfile({ ...profile, wifiSsid: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Guest Wi-Fi Password:
                </label>
                <input
                  type="text"
                  value={profile.wifiPassword}
                  onChange={e => setProfile({ ...profile, wifiPassword: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Opening Hours:
                </label>
                <input
                  type="text"
                  value={profile.openingHours}
                  onChange={e => setProfile({ ...profile, openingHours: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Number of Dining Tables:
                </label>
                <input
                  type="number"
                  value={profile.tableCount}
                  onChange={e => setProfile({ ...profile, tableCount: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="text-base font-black text-stone-900">Add New Dish to Menu</h3>
              <button
                onClick={() => setIsAddItemOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Category:</label>
                <select
                  value={newItemData.categoryId}
                  onChange={e => setNewItemData({ ...newItemData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  required
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Dish Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Truffle Mushroom Flatbread"
                  value={newItemData.name}
                  onChange={e => setNewItemData({ ...newItemData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Description:</label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, preparation details, allergen notes..."
                  value={newItemData.description}
                  onChange={e => setNewItemData({ ...newItemData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Price ({profile?.currencySymbol || '$'}):</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="14.50"
                    value={newItemData.price}
                    onChange={e => setNewItemData({ ...newItemData, price: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Prep Time (min):</label>
                  <input
                    type="number"
                    placeholder="12"
                    value={newItemData.prepTimeMinutes}
                    onChange={e => setNewItemData({ ...newItemData, prepTimeMinutes: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Calories:</label>
                  <input
                    type="number"
                    placeholder="450"
                    value={newItemData.calories}
                    onChange={e => setNewItemData({ ...newItemData, calories: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Badge (optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Bestseller, New, Chef's Pick"
                  value={newItemData.badge}
                  onChange={e => setNewItemData({ ...newItemData, badge: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1.5">Dietary & Allergen Flags:</label>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newItemData.isVegetarian}
                      onChange={e => setNewItemData({ ...newItemData, isVegetarian: e.target.checked })}
                    />
                    <span>Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newItemData.isVegan}
                      onChange={e => setNewItemData({ ...newItemData, isVegan: e.target.checked })}
                    />
                    <span>Vegan</span>
                  </label>
                  <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newItemData.isGlutenFree}
                      onChange={e => setNewItemData({ ...newItemData, isGlutenFree: e.target.checked })}
                    />
                    <span>Gluten-Free</span>
                  </label>
                  <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newItemData.isSpicy}
                      onChange={e => setNewItemData({ ...newItemData, isSpicy: e.target.checked })}
                    />
                    <span>Spicy</span>
                  </label>
                  <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newItemData.isChefSpecial}
                      onChange={e => setNewItemData({ ...newItemData, isChefSpecial: e.target.checked })}
                    />
                    <span>Chef's Pick</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemOpen(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="text-base font-black text-stone-900">Edit Dish</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Dish Name:</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Description:</label>
                <textarea
                  rows={2}
                  value={editingItem.description}
                  onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Price ({profile?.currencySymbol || '$'}):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.price}
                    onChange={e => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Prep Time (min):</label>
                  <input
                    type="number"
                    value={editingItem.prepTimeMinutes || ''}
                    onChange={e => setEditingItem({ ...editingItem, prepTimeMinutes: parseInt(e.target.value, 10) || null })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Calories:</label>
                  <input
                    type="number"
                    value={editingItem.calories || ''}
                    onChange={e => setEditingItem({ ...editingItem, calories: parseInt(e.target.value, 10) || null })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Badge:</label>
                <input
                  type="text"
                  value={editingItem.badge || ''}
                  onChange={e => setEditingItem({ ...editingItem, badge: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1.5">Dietary & Allergen Flags:</label>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingItem.isVegetarian}
                      onChange={e => setEditingItem({ ...editingItem, isVegetarian: e.target.checked })}
                    />
                    <span>Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingItem.isVegan}
                      onChange={e => setEditingItem({ ...editingItem, isVegan: e.target.checked })}
                    />
                    <span>Vegan</span>
                  </label>
                  <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingItem.isGlutenFree}
                      onChange={e => setEditingItem({ ...editingItem, isGlutenFree: e.target.checked })}
                    />
                    <span>Gluten-Free</span>
                  </label>
                  <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingItem.isSpicy}
                      onChange={e => setEditingItem({ ...editingItem, isSpicy: e.target.checked })}
                    />
                    <span>Spicy</span>
                  </label>
                  <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingItem.isChefSpecial}
                      onChange={e => setEditingItem({ ...editingItem, isChefSpecial: e.target.checked })}
                    />
                    <span>Chef's Pick</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="text-base font-black text-stone-900">Add Menu Category</h3>
              <button
                onClick={() => setIsAddCategoryOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Category Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Craft Beers & Ciders"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Description (optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Local IPAs and cold pressed ciders on tap"
                  value={newCategoryDesc}
                  onChange={e => setNewCategoryDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition"
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
