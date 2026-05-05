"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
    Croissant, 
    LayoutDashboard, 
    PackageSearch, 
    BadgeDollarSign, 
    Users, 
    Settings
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Inventory', href: '/inventory', icon: PackageSearch },
        { name: 'Sales', href: '/sales', icon: BadgeDollarSign },
        { name: 'Customers', href: '/customers', icon: Users },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <aside className="w-64 bg-[#451a03] text-stone-100 flex flex-col shadow-2xl z-20 shrink-0 h-screen sticky top-0">
            <div className="p-6 flex items-center gap-3 border-b border-amber-800/50">
                <div className="bg-amber-500 text-[#451a03] p-2.5 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                    <Croissant size={28} />
                </div>
                <h1 className="text-2xl font-bold tracking-wider font-serif text-amber-50">Wasana Bakers</h1>
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
    );
}
