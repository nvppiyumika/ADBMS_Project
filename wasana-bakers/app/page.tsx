"use client";

import { useEffect, useState } from 'react';
import { ProductAffinity } from '@/types/bakery';
import { 
    Croissant, 
    LayoutDashboard, 
    PackageSearch, 
    BadgeDollarSign, 
    Users, 
    Settings,
    TrendingUp,
    RefreshCw,
    AlertCircle
} from 'lucide-react';

export default function Dashboard() {
    const [affinities, setAffinities] = useState<ProductAffinity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAffinities = async () => {
            try {
                const res = await fetch('/api/bakery/affinity');
                if (!res.ok) throw new Error('Failed to fetch data');
                const data = await res.json();
                setAffinities(data);
            } catch (err: any) {
                setError(err.message || 'An error occurred while fetching data');
            } finally {
                setLoading(false);
            }
        };

        fetchAffinities();
    }, []);

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, active: true },
        { name: 'Inventory', icon: PackageSearch, active: false },
        { name: 'Sales', icon: BadgeDollarSign, active: false },
        { name: 'Customers', icon: Users, active: false },
        { name: 'Settings', icon: Settings, active: false },
    ];

    return (
        <main className="flex flex-col min-h-screen bg-mesh-gradient">
                {/* Top Header */}
                <header className="px-6 pl-20 md:px-10 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 glass-header z-10">
                    <div>
                        <h2 className="text-3xl font-bold text-stone-800 font-serif">Dashboard Overview</h2>
                        <p className="text-stone-500 mt-1.5 font-medium">Welcome back! Here's what's happening at the bakery today.</p>
                    </div>
                    <div className="flex items-center gap-5 w-full md:w-auto justify-end">
                        <button className="p-2.5 rounded-full bg-white text-stone-500 shadow-sm border border-stone-200 hover:shadow-md hover:text-amber-600 transition-all hover:bg-amber-50">
                            <RefreshCw size={20} />
                        </button>
                        <div className="h-11 w-11 rounded-full border-2 border-amber-500 overflow-hidden shadow-md ring-4 ring-amber-100 cursor-pointer shrink-0">
                            <img src="https://i.pravatar.cc/150?img=47" alt="Admin User" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-10 max-w-7xl mx-auto w-full">
                    
                    {/* Insights Header */}
                    <div className="mb-8 flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <TrendingUp className="text-amber-600" size={24} />
                        </div>
                        <h3 className="text-2xl font-bold text-stone-800 font-serif">Product Affinities</h3>
                        <span className="ml-auto text-sm font-bold px-3.5 py-1.5 bg-amber-100 text-amber-800 rounded-full shadow-sm border border-amber-200">
                            Frequently Bought Together
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 text-stone-500 glass-card rounded-3xl">
                            <RefreshCw className="animate-spin mb-4 text-amber-500" size={32} />
                            <p className="font-medium animate-pulse text-lg">Analyzing sales data...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50/50 border border-red-200 rounded-3xl p-8 flex items-start gap-4 text-red-800 shadow-sm">
                            <AlertCircle className="shrink-0 mt-0.5 text-red-500" size={24} />
                            <div>
                                <h4 className="font-bold text-xl mb-1 text-red-900">Failed to load affinity data</h4>
                                <p className="text-red-700/80 mb-3">{error}</p>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 rounded-lg text-sm font-bold text-red-700">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    Database Connection Issue
                                </div>
                            </div>
                        </div>
                    ) : affinities.length === 0 ? (
                        <div className="glass-card rounded-3xl p-16 text-center">
                            <PackageSearch className="mx-auto text-stone-400 mb-4" size={48} />
                            <h4 className="font-bold text-xl text-stone-800 mb-2">No Affinities Found</h4>
                            <p className="text-stone-500 text-lg">There isn't enough sales data yet to determine frequently bought together items.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {affinities.map((pair, index) => (
                                <div 
                                    key={index} 
                                    className="group relative glass-card glass-card-hover p-6 rounded-3xl flex flex-col"
                                >
                                    <div className="flex flex-col gap-3 mb-6 relative z-0">
                                        <div className="glass-inner rounded-2xl p-4 text-center group-hover:bg-amber-50/40 transition-colors duration-300 h-20 flex items-center justify-center">
                                            <p className="font-bold text-stone-800 line-clamp-2">{pair.ProductA}</p>
                                        </div>
                                        
                                        {/* Connection Line & Plus symbol */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-stone-100 shadow-sm z-10 text-amber-500 font-black group-hover:border-amber-200 group-hover:bg-amber-50 group-hover:scale-110 transition-all duration-300">
                                            +
                                        </div>

                                        <div className="glass-inner rounded-2xl p-4 text-center group-hover:bg-amber-50/40 transition-colors duration-300 h-20 flex items-center justify-center">
                                            <p className="font-bold text-stone-800 line-clamp-2">{pair.ProductB}</p>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-5 border-t border-stone-100 flex items-center justify-between group-hover:border-amber-100 transition-colors">
                                        <span className="text-sm font-semibold text-stone-400 group-hover:text-amber-700/70 transition-colors">Pairing Frequency</span>
                                        <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold shadow-sm border border-green-100 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                                            <TrendingUp size={14} />
                                            {pair.Frequency}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
    );
}
