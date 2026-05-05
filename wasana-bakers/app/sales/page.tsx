"use client";

import { useEffect, useState } from 'react';
import { BadgeDollarSign, Calendar, User, ReceiptText, Plus, Minus, Trash2, Search } from 'lucide-react';

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
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Quick Add Customer States
    const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false);
    const [newFirstName, setNewFirstName] = useState('');
    const [newLastName, setNewLastName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [isAddingCustomer, setIsAddingCustomer] = useState(false);

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

    async function handleDeleteSale(saleId: number) {
        if (!confirm(`Are you sure you want to delete Sale #${saleId}?\nNote: Inventory stock will NOT be automatically returned.`)) return;
        try {
            const res = await fetch(`/api/sales?saleId=${saleId}`, { method: 'DELETE' });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to delete sale');
            }
            await fetchSales();
        } catch (err: any) {
            alert(err.message);
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

    async function handleQuickAddCustomer() {
        if (!newFirstName || !newLastName) return;
        setIsAddingCustomer(true);
        try {
            const res = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ FirstName: newFirstName, LastName: newLastName, PhoneNumber: newPhone })
            });
            if (!res.ok) throw new Error('Failed to add customer');
            
            const result = await res.json();
            const newCustomerId = result.CustomerID;
            
            const cRes = await fetch('/api/customers');
            const cData = await cRes.json();
            setCustomers(cData);
            
            if (newCustomerId) {
                setSelectedCustomer(newCustomerId);
                setCustomerSearchQuery(`${newFirstName} ${newLastName}`);
            }
            
            setShowQuickAddCustomer(false);
            setNewFirstName('');
            setNewLastName('');
            setNewPhone('');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsAddingCustomer(false);
        }
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
            setCustomerSearchQuery('');
            fetchSales(); // Refresh the sales table
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="flex flex-col min-h-screen bg-mesh-gradient">
            <header className="px-6 pl-20 md:px-10 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 glass-header z-10">
                <div>
                    <h2 className="text-3xl font-bold font-serif text-[#451a03]">Sales History</h2>
                    <p className="text-stone-500 mt-1">View past transactions and customer orders.</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
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
                    <div className="glass-card rounded-2xl overflow-auto border border-white/40 shadow-xl max-h-[70vh]">
                        <table className="w-full text-left border-collapse relative min-w-[800px]">
                            <thead className="sticky top-0 z-10 backdrop-blur-md">
                                <tr className="border-b border-amber-900/10 bg-amber-50/90 text-amber-900 shadow-sm">
                                    <th className="p-5 font-semibold text-sm uppercase tracking-wider flex items-center gap-2"><ReceiptText size={16}/> Receipt ID</th>
                                    <th className="p-5 font-semibold text-sm uppercase tracking-wider"><Calendar size={16} className="inline mr-2"/> Date & Time</th>
                                    <th className="p-5 font-semibold text-sm uppercase tracking-wider"><User size={16} className="inline mr-2"/> Customer</th>
                                    <th className="p-5 font-semibold text-sm uppercase tracking-wider text-right">Total Amount</th>
                                    <th className="p-5 font-semibold text-sm uppercase tracking-wider text-right">Actions</th>
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
                                            <td className="p-5 text-right">
                                                <button 
                                                    onClick={() => handleDeleteSale(sale.SaleID)} 
                                                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Sale"
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

            {/* POS MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-stone-900/40 p-4">
                    <div className="glass-card w-full max-w-5xl h-[90vh] md:h-[80vh] rounded-3xl shadow-2xl border border-white flex flex-col md:flex-row overflow-hidden">
                        
                        {/* LEFT: Product Selection */}
                        <div className="w-full md:w-2/3 p-4 md:p-6 flex flex-col bg-white/40 overflow-hidden">
                            <h3 className="text-xl md:text-2xl font-bold font-serif text-stone-800 mb-4 shrink-0">Select Products</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 overflow-y-auto pr-2 pb-4">
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
                        <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l border-white/50 bg-stone-50/80 p-4 md:p-6 flex flex-col h-1/2 md:h-full">
                            <h3 className="text-xl md:text-2xl font-bold font-serif text-stone-800 mb-4 hidden md:block">Current Sale</h3>
                            
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">Customer</label>
                                    {!showQuickAddCustomer && (
                                        <button 
                                            onClick={() => setShowQuickAddCustomer(true)}
                                            className="text-xs font-bold text-amber-600 hover:text-amber-700"
                                        >
                                            + Add New
                                        </button>
                                    )}
                                </div>
                                
                                {showQuickAddCustomer ? (
                                    <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-sm space-y-3">
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <input type="text" placeholder="First Name" className="w-full p-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium" value={newFirstName} onChange={e => setNewFirstName(e.target.value)} />
                                            <input type="text" placeholder="Last Name" className="w-full p-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium" value={newLastName} onChange={e => setNewLastName(e.target.value)} />
                                        </div>
                                        <div className="flex flex-col xl:flex-row gap-2 items-stretch xl:items-center">
                                            <input type="tel" placeholder="Phone (Optional)" className="w-full xl:flex-1 p-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => setShowQuickAddCustomer(false)} className="flex-1 xl:flex-none px-3 py-2 text-sm font-bold text-stone-500 hover:text-stone-700 bg-stone-100 rounded-lg transition-colors shrink-0">Cancel</button>
                                                <button onClick={handleQuickAddCustomer} disabled={isAddingCustomer || !newFirstName || !newLastName} className="flex-1 xl:flex-none px-3 py-2 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg disabled:opacity-50 transition-colors shrink-0">Add</button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div className="relative">
                                            <input 
                                                type="text"
                                                placeholder="Search Name or Mobile... (or blank for Walk-in)"
                                                className="w-full p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium text-stone-800 pr-10"
                                                value={customerSearchQuery}
                                                onChange={(e) => {
                                                    setCustomerSearchQuery(e.target.value);
                                                    setIsCustomerDropdownOpen(true);
                                                    if (selectedCustomer !== '') setSelectedCustomer('');
                                                }}
                                                onFocus={() => setIsCustomerDropdownOpen(true)}
                                            />
                                            <Search size={16} className="absolute right-3 top-3.5 text-stone-400 pointer-events-none" />
                                        </div>
                                        
                                        {isCustomerDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setIsCustomerDropdownOpen(false)} />
                                                <div className="absolute z-50 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedCustomer('');
                                                            setCustomerSearchQuery('');
                                                            setIsCustomerDropdownOpen(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 hover:bg-stone-50 text-stone-600 font-medium border-b border-stone-100 flex items-center justify-between"
                                                    >
                                                        <span>Walk-in (No Customer)</span>
                                                        {selectedCustomer === '' && <div className="w-2 h-2 rounded-full bg-amber-500"></div>}
                                                    </button>
                                                    {customers
                                                        .filter(c => {
                                                            const search = customerSearchQuery.toLowerCase();
                                                            const fullName = `${c.FirstName} ${c.LastName}`.toLowerCase();
                                                            return fullName.includes(search) || (c.PhoneNumber && c.PhoneNumber.includes(search));
                                                        })
                                                        .map(c => (
                                                            <button
                                                                key={c.CustomerID}
                                                                onClick={() => {
                                                                    setSelectedCustomer(c.CustomerID);
                                                                    setCustomerSearchQuery(`${c.FirstName} ${c.LastName}`);
                                                                    setIsCustomerDropdownOpen(false);
                                                                }}
                                                                className="w-full text-left px-4 py-3 hover:bg-amber-50 border-b border-stone-100 last:border-0 flex items-center justify-between group"
                                                            >
                                                                <div>
                                                                    <div className="font-bold text-stone-800 group-hover:text-amber-900">{c.FirstName} {c.LastName}</div>
                                                                    <div className="text-xs text-stone-500">{c.PhoneNumber || 'No Phone'}</div>
                                                                </div>
                                                                {selectedCustomer === c.CustomerID && <div className="w-2 h-2 rounded-full bg-amber-500"></div>}
                                                            </button>
                                                        ))
                                                    }
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
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
