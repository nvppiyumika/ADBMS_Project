"use client";

import { useEffect, useState } from 'react';
import { BadgeDollarSign, Calendar, User, ReceiptText, Plus, Minus, Trash2 } from 'lucide-react';

interface SaleRecord {
    SaleID: number;
    SaleDate: string;
    TotalAmount: number;
    CustomerName: string | null;
}

interface Product {
    ProductID: number;
    ProductName: string;
    UnitPrice: number;
    StockQuantity: number;
}

interface Customer {
    CustomerID: number;
    FirstName: string;
    LastName: string;
}

interface CartItem {
    product: Product;
    quantity: number;
}

export default function SalesPage() {
    const [sales, setSales] = useState<SaleRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal & POS States
    const [showModal, setShowModal] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<number | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchSales();
    }, []);

    async function fetchSales() {
        try {
            const res = await fetch('/api/sales');
            if (!res.ok) throw new Error('Failed to fetch sales data');
            const data = await res.json();
            setSales(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    async function openNewSaleModal() {
        setShowModal(true);
        // Fetch products and customers for the POS
        try {
            const [pRes, cRes] = await Promise.all([
                fetch('/api/inventory/products'),
                fetch('/api/customers')
            ]);
            setProducts(await pRes.json());
            setCustomers(await cRes.json());
        } catch (err: any) {
            alert('Failed to load POS data: ' + err.message);
        }
    }

    function addToCart(product: Product) {
        setCart(prev => {
            const existing = prev.find(item => item.product.ProductID === product.ProductID);
            if (existing) {
                return prev.map(item => item.product.ProductID === product.ProductID 
                    ? { ...item, quantity: item.quantity + 1 } 
                    : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    }

    function updateQuantity(productID: number, delta: number) {
        setCart(prev => prev.map(item => {
            if (item.product.ProductID === productID) {
                const newQ = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQ };
            }
            return item;
        }));
    }

    function removeFromCart(productID: number) {
        setCart(prev => prev.filter(item => item.product.ProductID !== productID));
    }

    const totalAmount = cart.reduce((sum, item) => sum + (item.product.UnitPrice * item.quantity), 0);

    async function submitSale() {
        if (cart.length === 0) return;
        setIsSubmitting(true);

        const payload = {
            CustomerID: selectedCustomer === '' ? null : selectedCustomer,
            TotalAmount: totalAmount,
            Items: cart.map(item => ({
                ProductID: item.product.ProductID,
                Quantity: item.quantity,
                UnitPrice: item.product.UnitPrice,
                SubTotal: item.product.UnitPrice * item.quantity
            }))
        };

        try {
            const res = await fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to submit sale');
            }

            // Success
            alert('Sale successful! Products stock automatically deducted.');
            setShowModal(false);
            setCart([]);
            setSelectedCustomer('');
            fetchSales(); // Refresh the sales table
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="flex flex-col min-h-screen bg-mesh-gradient">
            <header className="px-10 py-8 flex justify-between items-center sticky top-0 glass-header z-10">
                <div>
                    <h2 className="text-3xl font-bold font-serif text-[#451a03]">Sales History</h2>
                    <p className="text-stone-500 mt-1">View past transactions and customer orders.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={openNewSaleModal}
                        className="bg-amber-500 hover:bg-amber-600 text-amber-950 px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-2"
                    >
                        <BadgeDollarSign size={20} />
                        New Sale
                    </button>
                </div>
            </header>

            <div className="flex-1 p-10 overflow-auto">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
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
                            onClick={fetchSales}
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
                                    <th className="p-5 font-semibold text-sm uppercase tracking-wider flex items-center gap-2"><ReceiptText size={16}/> Receipt ID</th>
                                    <th className="p-5 font-semibold text-sm uppercase tracking-wider"><Calendar size={16} className="inline mr-2"/> Date & Time</th>
                                    <th className="p-5 font-semibold text-sm uppercase tracking-wider"><User size={16} className="inline mr-2"/> Customer</th>
                                    <th className="p-5 font-semibold text-sm uppercase tracking-wider text-right">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-900/5">
                                {sales.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-stone-500">
                                            No sales found.
                                        </td>
                                    </tr>
                                ) : (
                                    sales.map((sale) => (
                                        <tr key={sale.SaleID} className="hover:bg-amber-50/30 transition-colors">
                                            <td className="p-5 font-medium text-stone-700">#{sale.SaleID}</td>
                                            <td className="p-5 text-stone-600">
                                                {new Date(sale.SaleDate).toLocaleString()}
                                            </td>
                                            <td className="p-5 text-stone-600">
                                                {sale.CustomerName ? (
                                                    <span className="bg-stone-100 px-3 py-1 rounded-full text-sm border border-stone-200">
                                                        {sale.CustomerName}
                                                    </span>
                                                ) : (
                                                    <span className="text-stone-400 italic">Walk-in</span>
                                                )}
                                            </td>
                                            <td className="p-5 text-right font-bold text-emerald-600 text-lg">
                                                ${sale.TotalAmount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* POS MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-stone-900/40 p-4">
                    <div className="glass-card w-full max-w-5xl h-[80vh] rounded-3xl shadow-2xl border border-white flex overflow-hidden">
                        
                        {/* LEFT: Product Selection */}
                        <div className="w-2/3 p-6 flex flex-col bg-white/40">
                            <h3 className="text-2xl font-bold font-serif text-stone-800 mb-4">Select Products</h3>
                            <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-2 pb-4">
                                {products.map(p => (
                                    <button 
                                        key={p.ProductID}
                                        onClick={() => addToCart(p)}
                                        disabled={p.StockQuantity <= 0}
                                        className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 text-left hover:border-amber-400 hover:shadow-md transition-all group disabled:opacity-50 disabled:cursor-not-allowed flex flex-col justify-between h-32"
                                    >
                                        <div>
                                            <div className="font-bold text-stone-800 line-clamp-2">{p.ProductName}</div>
                                            <div className="text-xs text-stone-500 mt-1">Stock: {p.StockQuantity}</div>
                                        </div>
                                        <div className="font-bold text-amber-600 text-lg group-hover:scale-105 transition-transform origin-left">
                                            ${p.UnitPrice.toFixed(2)}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: Cart & Checkout */}
                        <div className="w-1/3 border-l border-white/50 bg-stone-50/80 p-6 flex flex-col">
                            <h3 className="text-2xl font-bold font-serif text-stone-800 mb-4">Current Sale</h3>
                            
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Customer</label>
                                <select 
                                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium text-stone-800"
                                    value={selectedCustomer}
                                    onChange={(e) => setSelectedCustomer(e.target.value === '' ? '' : Number(e.target.value))}
                                >
                                    <option value="">Walk-in (No Customer)</option>
                                    {customers.map(c => (
                                        <option key={c.CustomerID} value={c.CustomerID}>{c.FirstName} {c.LastName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex-1 overflow-y-auto mb-4 border-t border-b border-stone-200 py-2">
                                {cart.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-stone-400 italic text-sm">
                                        Cart is empty
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {cart.map(item => (
                                            <div key={item.product.ProductID} className="bg-white p-3 rounded-xl shadow-sm flex items-center justify-between border border-stone-100">
                                                <div className="flex-1 pr-2">
                                                    <div className="font-bold text-stone-800 text-sm truncate">{item.product.ProductName}</div>
                                                    <div className="text-xs text-stone-500">${item.product.UnitPrice.toFixed(2)}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center bg-stone-100 rounded-lg">
                                                        <button onClick={() => updateQuantity(item.product.ProductID, -1)} className="p-1 hover:text-amber-600"><Minus size={14}/></button>
                                                        <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.product.ProductID, 1)} className="p-1 hover:text-amber-600"><Plus size={14}/></button>
                                                    </div>
                                                    <button onClick={() => removeFromCart(item.product.ProductID)} className="text-red-400 hover:text-red-600 p-1">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto">
                                <div className="flex justify-between items-center mb-4 px-2">
                                    <span className="font-bold text-stone-500 uppercase tracking-wider text-sm">Total</span>
                                    <span className="font-black text-2xl text-emerald-600">${totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setShowModal(false)}
                                        className="py-3 px-4 rounded-xl font-bold text-stone-600 bg-stone-200 hover:bg-stone-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={submitSale}
                                        disabled={isSubmitting || cart.length === 0}
                                        className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30"
                                    >
                                        {isSubmitting ? 'Processing...' : 'Complete Sale'}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </main>
    );
}
