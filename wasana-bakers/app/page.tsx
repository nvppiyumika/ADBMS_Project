"use client";

import { useEffect, useState, useRef } from 'react';
import { ProductAffinity, InventoryStatus, SalesSummary } from '@/types/bakery';
import {
    Croissant,
    LayoutDashboard,
    PackageSearch,
    BadgeDollarSign,
    Users,
    Settings,
    TrendingUp,
    RefreshCw,
    AlertCircle,
    ShoppingCart,
    Wallet,
    Calendar
} from 'lucide-react';

export default function Dashboard() {
    const startInputRef = useRef<HTMLInputElement>(null);
    const endInputRef = useRef<HTMLInputElement>(null);

    const [affinities, setAffinities] = useState<ProductAffinity[]>([]);
    const [inventoryStatus, setInventoryStatus] = useState<InventoryStatus[]>([]);
    const [salesSummary, setSalesSummary] = useState<SalesSummary>({ TotalRevenue: 0, OrderCount: 0 });
    const getLocalDate = (daysAgo = 0) => {
        const d = new Date();
        if (daysAgo) d.setDate(d.getDate() - daysAgo);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [startDate, setStartDate] = useState(() => getLocalDate(7));
    const [endDate, setEndDate] = useState(() => getLocalDate(0));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleDateClick = (ref: React.RefObject<HTMLInputElement | null>) => {
        if (ref.current && 'showPicker' in ref.current) {
            try {
                ref.current.showPicker();
            } catch (e) {
                ref.current.click();
            }
        } else {
            ref.current?.click();
        }
    };

    const formatDisplayDate = (dateStr: string) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [affRes, invRes, salesRes] = await Promise.all([
                fetch('/api/bakery/affinity'),
                fetch('/api/bakery/inventory-status'),
                fetch(`/api/bakery/sales-summary?startDate=${startDate}&endDate=${endDate}`)
            ]);

            if (!affRes.ok || !invRes.ok || !salesRes.ok) throw new Error('Failed to fetch dashboard data');

            const [affData, invData, salesData] = await Promise.all([
                affRes.json(),
                invRes.json(),
                salesRes.json()
            ]);

            setAffinities(affData);
            setInventoryStatus(invData);
            setSalesSummary(salesData);
        } catch (err: any) {
            setError(err.message || 'An error occurred while fetching data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, active: true },
        { name: 'Inventory', icon: PackageSearch, active: false },
        { name: 'Sales', icon: BadgeDollarSign, active: false },
        { name: 'Customers', icon: Users, active: false },
        { name: 'Settings', icon: Settings, active: false },
    ];

    return (
        <div className="flex flex-col min-h-full bg-mesh-gradient overflow-x-hidden pb-20">
            {/* Top Header */}
            <header className="px-6 pl-20 md:px-10 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 glass-header z-10">
                <div>
                    <h2 className="text-3xl font-bold text-stone-800 font-serif">Dashboard Overview</h2>
                    <p className="text-stone-500 mt-1.5 font-medium">Welcome back! Here's what's happening at the bakery today.</p>
                </div>
                <div className="flex items-center gap-5 w-full md:w-auto justify-end">
                    <button
                        onClick={fetchData}
                        className="p-2.5 rounded-full bg-white text-stone-500 shadow-sm border border-stone-200 hover:shadow-md hover:text-amber-600 transition-all hover:bg-amber-50"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="h-11 w-11 rounded-full border-2 border-amber-500 overflow-hidden shadow-md ring-4 ring-amber-100 cursor-pointer shrink-0">
                        <img src="https://i.pravatar.cc/150?img=47" alt="Admin User" className="w-full h-full object-cover" />
                    </div>
                </div>
            </header>

            {/* Dashboard Content */}
            <div className="p-6 md:p-10 max-w-7xl mx-auto w-full flex-1">

                {/* Date Range Filter */}
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="text-2xl font-bold text-stone-800 font-serif">Quick Stats</h3>
                        <p className="text-stone-500 text-sm font-medium mt-1">Viewing from <span className="text-amber-700 font-bold">{formatDisplayDate(startDate)}</span> to <span className="text-amber-700 font-bold">{formatDisplayDate(endDate)}</span></p>
                    </div>
                    <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl shadow-sm border border-stone-200">
                        <div
                            onClick={() => handleDateClick(startInputRef)}
                            className="flex flex-col relative group cursor-pointer hover:bg-stone-50 p-1.5 rounded-xl transition-colors"
                        >
                            <label className="text-[10px] font-black uppercase text-stone-400 tracking-tighter mb-0.5">Start Date</label>
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-amber-500" />
                                <div className="text-sm font-bold text-stone-700">
                                    {formatDisplayDate(startDate)}
                                </div>
                            </div>
                            <input
                                ref={startInputRef}
                                type="date"
                                className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="w-px h-8 bg-stone-100"></div>
                        <div
                            onClick={() => handleDateClick(endInputRef)}
                            className="flex flex-col relative group cursor-pointer hover:bg-stone-50 p-1.5 rounded-xl transition-colors"
                        >
                            <label className="text-[10px] font-black uppercase text-stone-400 tracking-tighter mb-0.5">End Date</label>
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-amber-500" />
                                <div className="text-sm font-bold text-stone-700">
                                    {formatDisplayDate(endDate)}
                                </div>
                            </div>
                            <input
                                ref={endInputRef}
                                type="date"
                                className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="glass-card p-6 rounded-3xl border border-white flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-stone-400 uppercase tracking-wider">Today's Revenue</p>
                            <h4 className="text-2xl font-black text-stone-800">${salesSummary.TotalRevenue.toFixed(2)}</h4>
                        </div>
                    </div>
                    <div className="glass-card p-6 rounded-3xl border border-white flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                            <ShoppingCart size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-stone-400 uppercase tracking-wider">Today's Orders</p>
                            <h4 className="text-2xl font-black text-stone-800">{salesSummary.OrderCount}</h4>
                        </div>
                    </div>
                    <div className="glass-card p-6 rounded-3xl border border-white flex items-center gap-4">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                            <PackageSearch size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-stone-400 uppercase tracking-wider">Low Stock Items</p>
                            <h4 className="text-2xl font-black text-stone-800">{inventoryStatus.length}</h4>
                        </div>
                    </div>
                    <div className="glass-card p-6 rounded-3xl border border-white flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-stone-400 uppercase tracking-wider">Top Affinity</p>
                            <h4 className="text-2xl font-black text-stone-800">{affinities[0]?.Frequency || 0} pairings</h4>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Insights (Affinity) */}
                    <div className="lg:col-span-2">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                <TrendingUp size={20} />
                            </div>
                            <h3 className="text-2xl font-bold text-stone-800 font-serif">Product Affinities</h3>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 glass-card rounded-3xl">
                                <RefreshCw className="animate-spin mb-4 text-amber-500" size={32} />
                                <p className="font-medium animate-pulse">Analyzing...</p>
                            </div>
                        ) : affinities.length === 0 ? (
                            <div className="glass-card rounded-3xl p-16 text-center">
                                <p className="text-stone-500">No affinity data available.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {affinities.map((pair, index) => (
                                    <div key={index} className="glass-card p-5 rounded-3xl border border-white group">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex-1 bg-stone-50 p-3 rounded-xl text-center font-bold text-stone-700 text-sm truncate">
                                                {pair.ProductA}
                                            </div>
                                            <div className="px-3 text-amber-500 font-black">+</div>
                                            <div className="flex-1 bg-stone-50 p-3 rounded-xl text-center font-bold text-stone-700 text-sm truncate">
                                                {pair.ProductB}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                                            <span className="text-xs font-bold text-stone-400 uppercase tracking-tighter">Frequency</span>
                                            <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-black">
                                                {pair.Frequency} sales
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Low Stock Alerts */}
                    <div>
                        <div className="mb-6 flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                <AlertCircle size={20} />
                            </div>
                            <h3 className="text-2xl font-bold text-stone-800 font-serif">Inventory Alerts</h3>
                        </div>

                        <div className="glass-card rounded-3xl border border-white overflow-hidden">
                            {inventoryStatus.length === 0 ? (
                                <div className="p-8 text-center text-stone-500">
                                    All stock levels are healthy!
                                </div>
                            ) : (
                                <div className="divide-y divide-stone-100">
                                    {inventoryStatus.map((item, index) => (
                                        <div key={index} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                                            <div className="flex-1 pr-4">
                                                <p className="font-bold text-stone-800 text-sm">{item.ProductName}</p>
                                                <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">Low Stock</p>
                                            </div>
                                            <div className="px-3 py-1 bg-red-100 text-red-700 rounded-xl font-black text-sm">
                                                {item.StockQuantity}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
