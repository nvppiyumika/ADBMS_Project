"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
    Croissant, 
    LayoutDashboard, 
    PackageSearch, 
    BadgeDollarSign, 
    Users, 
    Settings,
    ChefHat,
    Menu,
    X
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Inventory', href: '/inventory', icon: PackageSearch },
        { name: 'Recipes', href: '/recipes', icon: ChefHat },
        { name: 'Sales', href: '/sales', icon: BadgeDollarSign },
        { name: 'Customers', href: '/customers', icon: Users },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button 
                onClick={() => setIsOpen(true)}
                className="md:hidden fixed top-6 left-6 z-30 bg-[#451a03] text-amber-50 p-2.5 rounded-xl shadow-xl border border-amber-800/50"
            >
                <Menu size={24} />
            </button>

            {/* Mobile Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`w-64 bg-[#451a03] text-stone-100 flex flex-col shadow-2xl shrink-0 h-screen fixed md:sticky top-0 left-0 z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-6 flex justify-between items-center border-b border-amber-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 flex items-center justify-center shrink-0">
                            <img src="/Logo.png" alt="Wasana Bakers Logo" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-wider text-amber-50">Wasana Bakers</h1>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="md:hidden text-amber-200 hover:text-white p-1">
                        <X size={24} />
                    </button>
                </div>
            
            <nav className="flex-1 py-8 px-4 flex flex-col gap-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link 
                            key={item.name} 
                            href={item.href} 
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ease-in-out ${
                                isActive 
                                    ? 'bg-[#78350f]/80 text-amber-400 shadow-inner border border-amber-900/50' 
                                    : 'hover:bg-[#78350f]/40 hover:text-amber-200 text-stone-300'
                            }`}
                        >
                            <item.icon size={20} className={isActive ? "text-amber-400" : "opacity-70"} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 text-sm text-amber-200/50 border-t border-amber-800/50 font-medium">
                © 2026 Wasana Bakers
            </div>
        </aside>
        </>
    );
}
