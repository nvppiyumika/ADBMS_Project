"use client";

import { useEffect, useState } from 'react';
import { PackageSearch, Plus, Tag, AlertTriangle, Wheat, ChefHat } from 'lucide-react';

interface ProductRecord {
    ProductID: number;
    ProductName: string;
    CategoryName: string | null;
    UnitPrice: number;
    ReorderLevel: number | null;
    StockQuantity: number;
}

interface IngredientRecord {
    IngredientID: number;
    IngredientName: string;
    Unit: string;
    StockQuantity: number;
    ReorderLevel: number | null;
}

export default function InventoryPage() {
    const [activeTab, setActiveTab] = useState<'products' | 'ingredients'>('products');
    
    // Data States
    const [products, setProducts] = useState<ProductRecord[]>([]);
    const [ingredients, setIngredients] = useState<IngredientRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Bake Modal States
    const [showBakeModal, setShowBakeModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<number | ''>('');
    const [bakeQuantity, setBakeQuantity] = useState<number>(1);
    const [isBaking, setIsBaking] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setIsLoading(true);
        try {
            const [prodRes, ingRes] = await Promise.all([
                fetch('/api/inventory/products'),
                fetch('/api/inventory/ingredients')
            ]);
            
            if (!prodRes.ok || !ingRes.ok) throw new Error('Failed to fetch inventory data');
            
            setProducts(await prodRes.json());
            setIngredients(await ingRes.json());
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleBakeProduct() {
        if (!selectedProduct || bakeQuantity <= 0) return;
        setIsBaking(true);
        try {
            const res = await fetch('/api/inventory/bake', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ProductID: selectedProduct, QuantityBaked: bakeQuantity })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to bake product');
            }

            // Close modal and refresh data to see the trigger in action!
            setShowBakeModal(false);
            setSelectedProduct('');
            setBakeQuantity(1);
            await fetchData();
            alert('Successfully baked! Check how the Product stock increased and Ingredients decreased!');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsBaking(false);
        }
    }

    return (
        <main className="flex flex-col min-h-screen bg-mesh-gradient relative">
            <header className="px-10 py-8 flex justify-between items-center sticky top-0 glass-header z-10">
                <div>
                    <h2 className="text-3xl font-bold font-serif text-[#451a03]">Inventory Management</h2>
                    <p className="text-stone-500 mt-1">Manage finished products and raw ingredients.</p>
                </div>
                
                {/* Slide Tabs */}
                <div className="flex bg-amber-900/10 p-1 rounded-2xl shadow-inner relative overflow-hidden">
                    <div 
                        className="absolute inset-y-1 w-1/2 bg-white rounded-xl shadow-sm transition-transform duration-300 ease-in-out border border-amber-900/10"
                        style={{ transform: activeTab === 'products' ? 'translateX(4px)' : 'translateX(calc(100% - 4px))' }}
                    />
                    <button 
                        onClick={() => setActiveTab('products')}
                        className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-colors ${activeTab === 'products' ? 'text-amber-900' : 'text-stone-500 hover:text-amber-800'}`}
                    >
                        <PackageSearch size={18} />
                        Products
                    </button>
                    <button 
                        onClick={() => setActiveTab('ingredients')}
                        className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-colors ${activeTab === 'ingredients' ? 'text-amber-900' : 'text-stone-500 hover:text-amber-800'}`}
                    >
                        <Wheat size={18} />
                        Ingredients
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    {activeTab === 'products' ? (
                        <button 
                            onClick={() => setShowBakeModal(true)}
                            className="bg-amber-500 hover:bg-amber-600 text-amber-950 px-6 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-2"
                        >
                            <ChefHat size={20} />
                            Bake Product
                        </button>
                    ) : (
                        <button className="bg-stone-800 hover:bg-stone-900 text-stone-100 px-6 py-2.5 rounded-xl font-bold transition-colors shadow-lg flex items-center gap-2">
                            <Plus size={20} />
                            Add Ingredient Stock
                        </button>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-hidden relative p-10 flex flex-col">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64 text-stone-500 font-bold animate-pulse">
                        Loading inventory data...
                    </div>
                ) : error ? (
                    <div className="glass-card rounded-2xl p-8 border-red-200 bg-red-50/50 text-center">
                        <p className="text-red-600 font-medium">{error}</p>
                        <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-colors">Try Again</button>
                    </div>
                ) : (
                    <div className="flex-1 relative w-full">
                        <div 
                            className="absolute top-0 bottom-0 left-0 flex transition-transform duration-500 ease-in-out w-[200%]"
                            style={{ transform: activeTab === 'products' ? 'translateX(0)' : 'translateX(-50%)' }}
                        >
                            {/* PRODUCTS TABLE */}
                            <div className="w-1/2 pr-5 h-full flex flex-col">
                                <div className="glass-card rounded-2xl overflow-y-auto border border-white/40 shadow-xl flex-1 max-h-[70vh]">
                                    <table className="w-full text-left border-collapse relative">
                                        <thead className="sticky top-0 z-10 backdrop-blur-md">
                                            <tr className="border-b border-amber-900/10 bg-amber-50/90 text-amber-900 shadow-sm">
                                                <th className="p-5 font-bold text-sm uppercase tracking-wider flex items-center gap-2"><PackageSearch size={16}/> Product ID</th>
                                                <th className="p-5 font-bold text-sm uppercase tracking-wider">Product Name</th>
                                                <th className="p-5 font-bold text-sm uppercase tracking-wider"><Tag size={16} className="inline mr-2"/> Category</th>
                                                <th className="p-5 font-bold text-sm uppercase tracking-wider text-right">Unit Price</th>
                                                <th className="p-5 font-bold text-sm uppercase tracking-wider text-right">In Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-amber-900/5">
                                            {products.map((product) => (
                                                <tr key={product.ProductID} className="hover:bg-amber-50/30 transition-colors">
                                                    <td className="p-5 font-medium text-stone-700">PRD-{product.ProductID.toString().padStart(4, '0')}</td>
                                                    <td className="p-5 font-bold text-amber-900">{product.ProductName}</td>
                                                    <td className="p-5 text-stone-600">
                                                        {product.CategoryName ? (
                                                            <span className="bg-amber-100 px-3 py-1 rounded-full text-xs font-bold text-amber-800 border border-amber-200">
                                                                {product.CategoryName}
                                                            </span>
                                                        ) : <span className="text-stone-400 italic">Uncategorized</span>}
                                                    </td>
                                                    <td className="p-5 text-right font-bold text-stone-800">
                                                        ${product.UnitPrice.toFixed(2)}
                                                    </td>
                                                    <td className="p-5 text-right">
                                                        <span className={`px-3 py-1.5 rounded-lg border font-bold ${product.StockQuantity > (product.ReorderLevel || 10) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                            {product.StockQuantity} units
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* INGREDIENTS TABLE */}
                            <div className="w-1/2 pl-5 h-full flex flex-col">
                                <div className="glass-card rounded-2xl overflow-y-auto border border-white/40 shadow-xl flex-1 max-h-[70vh]">
                                    <table className="w-full text-left border-collapse relative">
                                        <thead className="sticky top-0 z-10 backdrop-blur-md">
                                            <tr className="border-b border-amber-900/10 bg-amber-50/90 text-amber-900 shadow-sm">
                                                <th className="p-5 font-bold text-sm uppercase tracking-wider flex items-center gap-2"><Wheat size={16}/> Ingredient ID</th>
                                                <th className="p-5 font-bold text-sm uppercase tracking-wider">Ingredient Name</th>
                                                <th className="p-5 font-bold text-sm uppercase tracking-wider text-right">In Stock</th>
                                                <th className="p-5 font-bold text-sm uppercase tracking-wider text-right">Unit of Measure</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-amber-900/5">
                                            {ingredients.map((ing) => (
                                                <tr key={ing.IngredientID} className="hover:bg-amber-50/30 transition-colors">
                                                    <td className="p-5 font-medium text-stone-700">ING-{ing.IngredientID.toString().padStart(4, '0')}</td>
                                                    <td className="p-5 font-bold text-amber-900">{ing.IngredientName}</td>
                                                    <td className="p-5 text-right">
                                                        <span className={`px-3 py-1.5 rounded-lg border font-bold ${ing.StockQuantity > (ing.ReorderLevel || 50) ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                            {ing.StockQuantity}
                                                        </span>
                                                    </td>
                                                    <td className="p-5 text-right font-medium text-stone-600 uppercase text-sm">
                                                        {ing.Unit}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bake Modal */}
            {showBakeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-stone-900/30 p-4">
                    <div className="glass-card w-full max-w-md rounded-3xl p-8 shadow-2xl border border-white">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
                                <ChefHat size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold font-serif text-stone-800">Bake Products</h3>
                                <p className="text-stone-500 text-sm font-medium">Adds to Product Stock & uses Ingredients</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-2">Select Product to Bake</label>
                                <select 
                                    className="w-full p-3 rounded-xl border border-stone-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium text-stone-800"
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(Number(e.target.value))}
                                >
                                    <option value="" disabled>-- Choose a product --</option>
                                    {products.map(p => (
                                        <option key={p.ProductID} value={p.ProductID}>{p.ProductName}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-2">Quantity to Bake</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    className="w-full p-3 rounded-xl border border-stone-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold text-stone-800"
                                    value={bakeQuantity}
                                    onChange={(e) => setBakeQuantity(parseInt(e.target.value) || 1)}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    onClick={() => setShowBakeModal(false)}
                                    className="flex-1 py-3 px-4 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleBakeProduct}
                                    disabled={isBaking || !selectedProduct}
                                    className="flex-1 py-3 px-4 rounded-xl font-bold text-amber-950 bg-amber-500 hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isBaking ? 'Baking...' : 'Confirm Bake'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
