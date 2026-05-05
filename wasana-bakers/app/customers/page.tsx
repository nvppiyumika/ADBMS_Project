"use client";

import { useEffect, useState } from 'react';
import { Users, Mail, Phone, Calendar, Award, Plus, Edit, Trash2 } from 'lucide-react';
import { Customer } from '@/types/bakery';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    async function fetchCustomers() {
        setIsLoading(true);
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

    function openAddModal() {
        setEditingCustomerId(null);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setShowModal(true);
    }

    function openEditModal(customer: Customer) {
        setEditingCustomerId(customer.CustomerID);
        setFirstName(customer.FirstName);
        setLastName(customer.LastName);
        setEmail(customer.Email || '');
        setPhone(customer.PhoneNumber || '');
        setShowModal(true);
    }

    async function handleDeleteCustomer(id: number, name: string) {
        if (!confirm(`Are you sure you want to delete ${name}?\nTheir past sales will remain but be marked as walk-in.`)) return;
        try {
            const res = await fetch(`/api/customers?customerId=${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to delete customer');
            }
            await fetchCustomers();
        } catch (err: any) {
            alert(err.message);
        }
    }

    async function handleSaveCustomer() {
        if (!firstName || !lastName) return alert('First and Last name are required.');
        setIsSubmitting(true);
        try {
            const method = editingCustomerId ? 'PUT' : 'POST';
            const payload = {
                CustomerID: editingCustomerId,
                FirstName: firstName,
                LastName: lastName,
                Email: email || null,
                PhoneNumber: phone || null
            };

            const res = await fetch('/api/customers', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || `Failed to ${editingCustomerId ? 'update' : 'add'} customer`);
            }

            setShowModal(false);
            await fetchCustomers();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="flex flex-col h-screen overflow-hidden bg-mesh-gradient">
            <header className="px-6 pl-20 md:px-10 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-header z-10 shrink-0">
                <div>
                    <h2 className="text-3xl font-bold  text-[#451a03]">Customers</h2>
                    <p className="text-stone-500 mt-1">Manage customer profiles and loyalty points.</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <button 
                        onClick={openAddModal}
                        className="bg-amber-500 hover:bg-amber-600 text-amber-950 px-6 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add Customer
                    </button>
                </div>
            </header>

            <div className="flex-1 p-10 overflow-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64 text-stone-500 font-bold animate-pulse">
                        Loading customers...
                    </div>
                ) : error ? (
                    <div className="glass-card rounded-2xl p-8 border-red-200 bg-red-50/50 text-center">
                        <p className="text-red-600 font-medium">{error}</p>
                        <button onClick={fetchCustomers} className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-colors">Try Again</button>
                    </div>
                ) : (
                    <div className="glass-card rounded-2xl overflow-auto border border-white/40 shadow-xl max-h-[70vh]">
                        <table className="w-full text-left border-collapse relative min-w-[800px]">
                            <thead className="sticky top-0 z-10 backdrop-blur-md">
                                <tr className="border-b border-amber-900/10 bg-amber-50/90 text-amber-900 shadow-sm">
                                    <th className="p-5 font-bold text-sm uppercase tracking-wider flex items-center gap-2"><Users size={16}/> Customer</th>
                                    <th className="p-5 font-bold text-sm uppercase tracking-wider"><Mail size={16} className="inline mr-2"/> Contact</th>
                                    <th className="p-5 font-bold text-sm uppercase tracking-wider"><Calendar size={16} className="inline mr-2"/> Joined</th>
                                    <th className="p-5 font-bold text-sm uppercase tracking-wider text-right"><Award size={16} className="inline mr-2"/> Loyalty Points</th>
                                    <th className="p-5 font-bold text-sm uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-900/5">
                                {customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-stone-500 font-medium">
                                            No customers found. Click 'Add Customer' to start building your database!
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
                                                    {customer.Email && <span className="text-sm font-medium flex items-center gap-1"><Mail size={12}/> {customer.Email}</span>}
                                                    {customer.PhoneNumber && <span className="text-sm font-medium flex items-center gap-1"><Phone size={12}/> {customer.PhoneNumber}</span>}
                                                    {!customer.Email && !customer.PhoneNumber && <span className="text-stone-400 italic text-sm">No contact info</span>}
                                                </div>
                                            </td>
                                            <td className="p-5 font-medium text-stone-600">
                                                {customer.JoinedDate ? new Date(customer.JoinedDate).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="p-5 text-right font-black text-amber-600 text-lg">
                                                {customer.LoyaltyPoints}
                                            </td>
                                            <td className="p-5 text-right space-x-2">
                                                <button 
                                                    onClick={() => openEditModal(customer)} 
                                                    className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                    title="Edit Customer"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteCustomer(customer.CustomerID, `${customer.FirstName} ${customer.LastName}`)} 
                                                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Customer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Customer Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-stone-900/40 p-4">
                    <div className="glass-card w-full max-w-[95vw] md:max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border border-white">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold  text-stone-800">{editingCustomerId ? 'Edit Customer' : 'Add Customer'}</h3>
                                <p className="text-stone-500 text-sm font-medium">{editingCustomerId ? 'Update profile information' : 'Register a new loyalty member'}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-stone-700 mb-1">First Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-2.5 rounded-xl border border-stone-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold text-stone-800"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-stone-700 mb-1">Last Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-2.5 rounded-xl border border-stone-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold text-stone-800"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-1">Email</label>
                                <input 
                                    type="email" 
                                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium text-stone-800"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-1">Phone Number</label>
                                <input 
                                    type="tel" 
                                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium text-stone-800"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 px-4 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveCustomer}
                                    disabled={isSubmitting || !firstName || !lastName}
                                    className="flex-1 py-3 px-4 rounded-xl font-bold text-amber-950 bg-amber-500 hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isSubmitting ? 'Saving...' : (editingCustomerId ? 'Save Changes' : 'Add Customer')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
