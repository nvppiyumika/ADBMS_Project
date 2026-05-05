"use client";

import { useEffect, useState } from 'react';
import { Users, Mail, Phone, Calendar, Award } from 'lucide-react';
import { Customer } from '@/types/bakery';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    async function fetchCustomers() {
        try {
            const res = await fetch('/api/customers');
            if (!res.ok) throw new Error('Failed to fetch customers data');
            const data = await res.json();
            setCustomers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="flex flex-col min-h-screen bg-mesh-gradient">
            <header className="px-10 py-8 flex justify-between items-center sticky top-0 glass-header z-10">
                <div>
                    <h2 className="text-3xl font-bold font-serif text-[#451a03]">Customers</h2>
                    <p className="text-stone-500 mt-1">Manage customer profiles and loyalty points.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="bg-amber-500 hover:bg-amber-600 text-amber-950 px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-2">
                        <Users size={20} />
                        Add Customer
                    </button>
                </div>
            </header>

            <div className="flex-1 p-10 overflow-auto">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="glass-card rounded-2xl p-6 h-48 animate-pulse flex flex-col justify-between">
                                <div className="h-6 bg-amber-900/10 rounded w-1/3"></div>
                                <div className="h-10 bg-amber-900/5 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="glass-card rounded-2xl p-8 border-red-200 bg-red-50/50 text-center">
                        <p className="text-red-600 font-medium">{error}</p>
                        <button 
                            onClick={fetchCustomers}
                            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="glass-card rounded-2xl overflow-y-auto border border-white/40 shadow-xl max-h-[70vh]">
                        <table className="w-full text-left border-collapse relative">
                            <thead className="sticky top-0 z-10 backdrop-blur-md">
                                <tr className="border-b border-amber-900/10 bg-amber-50/90 text-amber-900 shadow-sm">
                                    <th className="p-5 font-semibold text-sm uppercase tracking-wider flex items-center gap-2"><Users size={16}/> Customer</th>
                                    <th className="p-5 font-semibold text-sm uppercase tracking-wider"><Mail size={16} className="inline mr-2"/> Contact</th>
                                    <th className="p-5 font-semibold text-sm uppercase tracking-wider"><Calendar size={16} className="inline mr-2"/> Joined</th>
                                    <th className="p-5 font-semibold text-sm uppercase tracking-wider text-right"><Award size={16} className="inline mr-2"/> Loyalty Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-900/5">
                                {customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-stone-500">
                                            No customers found.
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((customer) => (
                                        <tr key={customer.CustomerID} className="hover:bg-amber-50/30 transition-colors">
                                            <td className="p-5">
                                                <div className="font-bold text-amber-900">{customer.FirstName} {customer.LastName}</div>
                                                <div className="text-xs text-stone-400 mt-0.5">ID: {customer.CustomerID}</div>
                                            </td>
                                            <td className="p-5 text-stone-600">
                                                <div className="flex flex-col gap-1">
                                                    {customer.Email && <span className="text-sm flex items-center gap-1"><Mail size={12}/> {customer.Email}</span>}
                                                    {customer.PhoneNumber && <span className="text-sm flex items-center gap-1"><Phone size={12}/> {customer.PhoneNumber}</span>}
                                                    {!customer.Email && !customer.PhoneNumber && <span className="text-stone-400 italic">No contact info</span>}
                                                </div>
                                            </td>
                                            <td className="p-5 text-stone-600">
                                                {customer.JoinedDate ? new Date(customer.JoinedDate).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="p-5 text-right font-bold text-amber-600 text-lg">
                                                {customer.LoyaltyPoints}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}
