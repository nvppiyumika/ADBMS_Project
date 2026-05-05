"use client";

import { useEffect, useState } from 'react';
import { ChefHat, Plus, Edit, Trash2, Wheat, PlusCircle } from 'lucide-react';

interface IngredientLine {
    IngredientID: number;
    IngredientName: string;
    QuantityRequired: number;
    UnitOfMeasure: string;
}

interface Recipe {
    ProductID: number;
    ProductName: string;
    Ingredients: IngredientLine[];
}

interface Product {
    ProductID: number;
    ProductName: string;
}

interface Ingredient {
    IngredientID: number;
    IngredientName: string;
    Unit: string;
}

export default function RecipesPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<number | ''>('');
    const [recipeLines, setRecipeLines] = useState<{ IngredientID: number | '', QuantityRequired: number }[]>([
        { IngredientID: '', QuantityRequired: 1 }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setIsLoading(true);
        try {
            const [recRes, prodRes, ingRes] = await Promise.all([
                fetch('/api/recipes'),
                fetch('/api/inventory/products'),
                fetch('/api/inventory/ingredients')
            ]);
            
            if (!recRes.ok || !prodRes.ok || !ingRes.ok) throw new Error('Failed to fetch data');
            
            setRecipes(await recRes.json());
            setProducts(await prodRes.json());
            setAvailableIngredients(await ingRes.json());
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    function openNewRecipeModal() {
        setIsEditing(false);
        setSelectedProduct('');
        setRecipeLines([{ IngredientID: '', QuantityRequired: 1 }]);
        setShowModal(true);
    }

    function openEditRecipeModal(recipe: Recipe) {
        setIsEditing(true);
        setSelectedProduct(recipe.ProductID);
        setRecipeLines(recipe.Ingredients.map(ing => ({
            IngredientID: ing.IngredientID,
            QuantityRequired: ing.QuantityRequired
        })));
        setShowModal(true);
    }

    async function deleteRecipe(productId: number, productName: string) {
        if (!confirm(`Are you sure you want to delete the recipe for ${productName}?`)) return;
        
        try {
            const res = await fetch(`/api/recipes?productId=${productId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete recipe');
            fetchData();
        } catch (err: any) {
            alert(err.message);
        }
    }

    function addRecipeLine() {
        setRecipeLines([...recipeLines, { IngredientID: '', QuantityRequired: 1 }]);
    }

    function removeRecipeLine(index: number) {
        setRecipeLines(recipeLines.filter((_, i) => i !== index));
    }

    function updateRecipeLine(index: number, field: 'IngredientID' | 'QuantityRequired', value: any) {
        const newLines = [...recipeLines];
        newLines[index] = { ...newLines[index], [field]: value };
        setRecipeLines(newLines);
    }

    async function saveRecipe() {
        // Validation
        if (!selectedProduct) return alert('Please select a product.');
        const validLines = recipeLines.filter(line => line.IngredientID !== '' && line.QuantityRequired > 0);
        if (validLines.length === 0) return alert('Please add at least one valid ingredient.');

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/recipes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ProductID: selectedProduct,
                    Ingredients: validLines
                })
            });

            if (!res.ok) throw new Error('Failed to save recipe');
            
            setShowModal(false);
            fetchData();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="flex flex-col h-screen bg-mesh-gradient overflow-hidden">
            <header className="px-6 pl-20 md:px-10 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-header z-10 shrink-0">
                <div>
                    <h2 className="text-3xl font-bold font-serif text-[#451a03]">Recipes</h2>
                    <p className="text-stone-500 mt-1">Manage the ingredient formulas for your products.</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <button 
                        onClick={openNewRecipeModal}
                        className="bg-amber-500 hover:bg-amber-600 text-amber-950 px-6 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-2"
                    >
                        <ChefHat size={20} />
                        New Recipe
                    </button>
                </div>
            </header>

            <div className="flex-1 p-10 overflow-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64 text-stone-500 font-bold animate-pulse">
                        Loading recipes...
                    </div>
                ) : error ? (
                    <div className="glass-card rounded-2xl p-8 border-red-200 bg-red-50/50 text-center">
                        <p className="text-red-600 font-medium">{error}</p>
                        <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-colors">Try Again</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {recipes.map(recipe => (
                            <div key={recipe.ProductID} className="glass-card rounded-2xl overflow-hidden border border-white/40 shadow-xl flex flex-col hover:shadow-2xl transition-shadow">
                                <div className="bg-amber-900/5 p-5 border-b border-amber-900/10 flex justify-between items-center">
                                    <h3 className="text-xl font-bold font-serif text-amber-950 flex items-center gap-3">
                                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><ChefHat size={20}/></div>
                                        {recipe.ProductName}
                                    </h3>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEditRecipeModal(recipe)} className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => deleteRecipe(recipe.ProductID, recipe.ProductName)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-5 flex-1">
                                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Ingredients Required</h4>
                                    <div className="space-y-2">
                                        {recipe.Ingredients.map((ing, idx) => (
                                            <div key={idx} className="flex justify-between items-center py-2 px-3 bg-white/50 rounded-lg border border-stone-100">
                                                <div className="flex items-center gap-2 font-medium text-stone-700">
                                                    <Wheat size={14} className="text-stone-400" />
                                                    {ing.IngredientName}
                                                </div>
                                                <div className="font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded">
                                                    {ing.QuantityRequired} <span className="text-xs text-amber-600 uppercase">{ing.UnitOfMeasure}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {recipes.length === 0 && (
                            <div className="col-span-full py-20 text-center text-stone-500">
                                <ChefHat size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-lg">No recipes found. Create one to get started!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* RECIPE MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-stone-900/40 p-4">
                    <div className="glass-card w-full max-w-[95vw] md:max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl border border-white flex flex-col overflow-hidden">
                        
                        <div className="p-6 border-b border-amber-900/10 bg-amber-50/50 flex items-center gap-3">
                            <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
                                <ChefHat size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold font-serif text-stone-800">{isEditing ? 'Edit Recipe' : 'New Recipe'}</h3>
                                <p className="text-stone-500 text-sm font-medium">Define the exact ingredients required for a product.</p>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            
                            {/* Product Selection */}
                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wider">Product</label>
                                <select 
                                    className="w-full p-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold text-amber-900"
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(Number(e.target.value))}
                                    disabled={isEditing} // Cannot change product when editing, just delete and make a new one
                                >
                                    <option value="" disabled>-- Select Product --</option>
                                    {products.map(p => (
                                        <option key={p.ProductID} value={p.ProductID}>{p.ProductName}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Ingredients List */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <label className="block text-sm font-bold text-stone-700 uppercase tracking-wider">Ingredients</label>
                                    <button onClick={addRecipeLine} className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                                        <PlusCircle size={16} /> Add Ingredient
                                    </button>
                                </div>
                                
                                <div className="space-y-3">
                                    {recipeLines.map((line, index) => (
                                        <div key={index} className="flex gap-3 items-center bg-stone-50 p-3 rounded-xl border border-stone-200">
                                            <div className="flex-1">
                                                <select 
                                                    className="w-full p-2.5 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium text-stone-800"
                                                    value={line.IngredientID}
                                                    onChange={(e) => updateRecipeLine(index, 'IngredientID', Number(e.target.value))}
                                                >
                                                    <option value="" disabled>Select Ingredient</option>
                                                    {availableIngredients.map(i => (
                                                        <option key={i.IngredientID} value={i.IngredientID}>{i.IngredientName} ({i.Unit})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="w-32">
                                                <input 
                                                    type="number"
                                                    min="0.1"
                                                    step="0.1"
                                                    placeholder="Qty"
                                                    className="w-full p-2.5 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold text-stone-800 text-center"
                                                    value={line.QuantityRequired}
                                                    onChange={(e) => updateRecipeLine(index, 'QuantityRequired', parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                            <button 
                                                onClick={() => removeRecipeLine(index)}
                                                disabled={recipeLines.length === 1}
                                                className="p-2 text-stone-400 hover:text-red-500 transition-colors disabled:opacity-30 disabled:hover:text-stone-400"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        <div className="p-6 border-t border-amber-900/10 bg-stone-50/50 flex gap-3 justify-end">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="py-3 px-6 rounded-xl font-bold text-stone-600 bg-stone-200 hover:bg-stone-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={saveRecipe}
                                disabled={isSubmitting}
                                className="py-3 px-8 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Recipe'}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </main>
    );
}
