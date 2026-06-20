import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  PlusCircle, 
  AlertTriangle, 
  X, 
  Save, 
  RefreshCw,
  Search,
  Hash,
  DollarSign,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES } from '../data/mockProducts';

interface InventoryAdminProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onQuickReplenish: (id: string, qty: number) => void;
  searchFilter: string;
}

export default function InventoryAdmin({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onQuickReplenish,
  searchFilter
}: InventoryAdminProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals / Editor States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State variables
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formCategory, setFormCategory] = useState('Beverages');
  const [formIcon, setFormIcon] = useState('☕');
  const [formColor, setFormColor] = useState('amber');
  const [formThreshold, setFormThreshold] = useState('10');

  // Filter lists based on Category and searchFilter
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchSearch = product.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchFilter.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchFilter]);

  // Form Initializers (Add vs. Edit)
  const openAddModal = () => {
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    setFormName('');
    setFormSku(`SKU-NEW-${randomSuffix}`);
    setFormPrice('5.00');
    setFormCost('1.50');
    setFormStock('20');
    setFormCategory('Beverages');
    setFormIcon('☕');
    setFormColor('amber');
    setFormThreshold('5');
    setIsAddModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormSku(product.sku);
    setFormPrice(product.price.toString());
    setFormCost(product.cost.toString());
    setFormStock(product.stock.toString());
    setFormCategory(product.category);
    setFormIcon(product.icon);
    setFormColor(product.color);
    setFormThreshold(product.threshold.toString());
    setIsEditModalOpen(true);
  };

  // Submission handlers
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSku.trim()) return;

    const newProduct: Product = {
      id: `p-${Date.now()}`,
      name: formName.trim(),
      sku: formSku.trim().toUpperCase(),
      price: Math.max(0, parseFloat(formPrice) || 0),
      cost: Math.max(0, parseFloat(formCost) || 0),
      stock: Math.max(0, parseInt(formStock) || 0),
      category: formCategory,
      icon: formIcon,
      color: formColor,
      threshold: Math.max(0, parseInt(formThreshold) || 1)
    };

    onAddProduct(newProduct);
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !formName.trim() || !formSku.trim()) return;

    const updated: Product = {
      ...editingProduct,
      name: formName.trim(),
      sku: formSku.trim().toUpperCase(),
      price: Math.max(0, parseFloat(formPrice) || 0),
      cost: Math.max(0, parseFloat(formCost) || 0),
      stock: Math.max(0, parseInt(formStock) || 0),
      category: formCategory,
      icon: formIcon,
      color: formColor,
      threshold: Math.max(0, parseInt(formThreshold) || 1)
    };

    onUpdateProduct(updated);
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  const emojiOptions = ['☕', '🍵', '🥭', '🥤', '🍺', '🥛', '🍔', '🍟', '🍗', '🍕', '🥐', '🍩', '🍰', '🍪', '🍨', '🖱️', '⌨️', '🎧', '🧥', '🧢', '👕', '👜', '👟', '📦', '🎁', '🛍️', '🔥', '✨'];
  const colorOptions = ['amber', 'emerald', 'orange', 'blue', 'rose', 'yellow', 'pink', 'violet', 'teal', 'indigo', 'sky', 'purple'];

  return (
    <div className="p-4 md:p-6 bg-slate-50/50 min-h-[calc(100vh-5rem)] flex flex-col space-y-6">
      
      {/* Top action cards & Overview */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Category breakdown bar in inventory */}
        <div className="bg-white border border-stone-200 rounded-xl p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto max-w-full">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              id={`inv-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Master Addition trigger */}
        <button
          id="add-product-modal-toggle"
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center gap-2 shadow-xs transition-colors cursor-pointer uppercase tracking-wider shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Item catalog
        </button>
      </div>

      {/* Main product stock control list */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse" id="inventory-registry-table">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold text-stone-400 tracking-wider uppercase">
                <th className="py-4 px-6">Product Catalog Details</th>
                <th className="py-4 px-4">SKU / Code</th>
                <th className="py-4 px-4 text-right">Cost Price</th>
                <th className="py-4 px-4 text-right">Retail Sell</th>
                <th className="py-4 px-4 text-center">Stock Level Status</th>
                <th className="py-4 px-4 text-center">Low Limit</th>
                <th className="py-4 px-6 text-center">Quick replenishment / Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-stone-100 text-xs text-stone-600">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    No registry products currently matching active filter scopes.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isOutOfStock = product.stock <= 0;
                  const isLowStock = !isOutOfStock && product.stock <= product.threshold;
                  const profitMargin = ((product.price - product.cost) / product.price) * 100;

                  return (
                    <tr 
                      key={product.id} 
                      id={`inv-row-${product.id}`}
                      className="hover:bg-indigo-50/20 transition-colors"
                    >
                      {/* Product identity */}
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg select-none bg-${product.color}-50 border border-${product.color}-100 shrink-0`}>
                            {product.icon}
                          </div>
                          <div>
                            <span className="text-[10px] bg-stone-100 text-stone-500 font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                              {product.category}
                            </span>
                            <h4 className="font-bold text-stone-800 text-xs mt-0.5" id={`inv-name-${product.id}`}>
                              {product.name}
                            </h4>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-4 font-mono text-[10px] text-stone-500">
                        {product.sku}
                      </td>

                      {/* Cost value */}
                      <td className="py-3 px-4 text-right font-mono text-stone-700">
                        ${product.cost.toFixed(2)}
                      </td>

                      {/* Selling price + Margin projection */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-mono font-bold text-stone-800">${product.price.toFixed(2)}</div>
                        <div className="text-[9px] text-emerald-600 font-bold mt-0.5">{profitMargin.toFixed(0)}% Margin</div>
                      </td>

                      {/* Current Stock status */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col items-center">
                          {isOutOfStock ? (
                            <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.1 text-amber-600 shrink-0" /> Low stock
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                              Normal
                            </span>
                          )}
                          
                          <span className="font-mono font-extrabold text-stone-800 text-xs mt-1.5">
                            {product.stock} units
                          </span>
                        </div>
                      </td>

                      {/* Alert Threshold */}
                      <td className="py-3 px-4 text-center font-mono text-stone-500">
                        {product.threshold}
                      </td>

                      {/* Replenish shortcuts and adjustments */}
                      <td className="py-3 px-6">
                        <div className="flex items-center justify-center gap-3">
                          {/* Quick replenish triggers */}
                          <div className="flex items-center gap-1 border border-stone-200 rounded-lg p-0.5 bg-stone-50 shrink-0">
                            <span className="text-[9px] text-stone-400 font-bold px-1 uppercase tracking-wider">Restock:</span>
                            <button
                              id={`quick-add-10-${product.id}`}
                              onClick={() => onQuickReplenish(product.id, 10)}
                              className="text-[9px] font-bold bg-white text-stone-700 hover:bg-emerald-50 hover:text-emerald-700 border border-stone-100 px-1.5 py-1 rounded-md transition-colors"
                              title="Add +10 units to stock"
                            >
                              +10
                            </button>
                            <button
                              id={`quick-add-50-${product.id}`}
                              onClick={() => onQuickReplenish(product.id, 50)}
                              className="text-[9px] font-bold bg-white text-stone-700 hover:bg-emerald-50 hover:text-emerald-700 border border-stone-100 px-1.5 py-1 rounded-md transition-colors"
                              title="Add +50 units to stock"
                            >
                              +50
                            </button>
                          </div>

                          <span className="text-stone-200 font-light">|</span>

                          {/* Primary editor controls */}
                          <div className="flex items-center gap-1">
                            <button
                              id={`edit-item-btn-${product.id}`}
                              onClick={() => openEditModal(product)}
                              className="p-1.5 rounded-md border border-stone-200 hover:border-indigo-500 text-stone-400 hover:text-indigo-600 bg-white hover:bg-indigo-50/30 transition-all transition-colors cursor-pointer"
                              title="Edit item specs"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            
                            <button
                              id={`delete-item-btn-${product.id}`}
                              onClick={() => {
                                if (confirm(`Caution! Are you absolutely sure you want to delete ${product.name} from the catalog inventory? This is irreversible.`)) {
                                  onDeleteProduct(product.id);
                                }
                              }}
                              className="p-1.5 rounded-md border border-stone-200 hover:border-rose-300 text-stone-400 hover:text-rose-600 bg-white hover:bg-rose-50/50 transition-all transition-colors cursor-pointer"
                              title="Delete catalog item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info counts summaries */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-between items-center text-xs text-stone-500 font-medium">
          <span>Active Count: <strong>{filteredProducts.length} items</strong> filtered</span>
          <span className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> High Stock
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Threshold trigger Alert
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block animate-pulse" /> Out of stock
            </span>
          </span>
        </div>
      </div>

      {/* ADD NEW PRODUCT DIALOG MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-55 overflow-y-auto">
          {/* backdrop action close */}
          <div className="fixed inset-0" onClick={() => setIsAddModalOpen(false)} />
          
          <div 
            id="add-product-form-card"
            className="relative bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-stone-200 z-60 animate-in zoom-in duration-150"
          >
            {/* Form banner header */}
            <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-200" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider">REGISTER NEW CATALOG PRODUCT</h3>
              </div>
              <button 
                id="close-add-modal-btn"
                onClick={() => setIsAddModalOpen(false)} 
                className="text-indigo-100 hover:text-white hover:bg-indigo-700/50 p-1 rounded-md transition-colors"
                title="Cancel addition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Product Name */}
                <div className="space-y-1">
                  <label htmlFor="add-name-input" className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                    Product Title *
                  </label>
                  <input
                    id="add-name-input"
                    type="text"
                    required
                    placeholder="e.g. Organic Blueberry Cold Brew"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full text-xs bg-stone-50 text-stone-900 border border-stone-200 p-2.5 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                {/* SKU Code */}
                <div className="space-y-1">
                  <label htmlFor="add-sku-input" className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                    Stock Keeping Unit (SKU) *
                  </label>
                  <input
                    id="add-sku-input"
                    type="text"
                    required
                    placeholder="e.g. BEV-BREW-05"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full text-xs bg-stone-50 text-stone-900 border border-stone-200 p-2.5 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-mono uppercase"
                  />
                </div>

                {/* Categories */}
                <div className="space-y-1">
                  <label htmlFor="add-category-input" className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                    Catalog Category
                  </label>
                  <select
                    id="add-category-input"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full text-xs bg-stone-50 text-stone-900 border border-stone-200 p-2.5 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Stock Level */}
                <div className="space-y-1">
                  <label htmlFor="add-stock-input" className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                    Initial Stock Quanity
                  </label>
                  <input
                    id="add-stock-input"
                    type="number"
                    min="0"
                    required
                    placeholder="25"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full text-xs bg-stone-50 text-stone-900 border border-stone-200 p-2.5 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-mono"
                  />
                </div>

                {/* Cost price */}
                <div className="space-y-1">
                  <label htmlFor="add-cost-input" className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                    Purchase Cost ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                    <input
                      id="add-cost-input"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="1.20"
                      value={formCost}
                      onChange={(e) => setFormCost(e.target.value)}
                      className="w-full text-xs bg-stone-50 text-stone-900 border border-stone-200 pl-7 pr-3 py-2.5 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* Selling Price */}
                <div className="space-y-1">
                  <label htmlFor="add-price-input" className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                    Retail Selling Price ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                    <input
                      id="add-price-input"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="4.00"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full text-xs bg-stone-50 text-stone-900 border border-stone-200 pl-7 pr-3 py-2.5 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* Low Threshold warning limit */}
                <div className="space-y-1">
                  <label htmlFor="add-threshold-input" className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                    Reorder Stock warning threshold limit
                  </label>
                  <input
                    id="add-threshold-input"
                    type="number"
                    min="1"
                    required
                    placeholder="8"
                    value={formThreshold}
                    onChange={(e) => setFormThreshold(e.target.value)}
                    className="w-full text-xs bg-stone-50 text-stone-900 border border-stone-200 p-2.5 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-mono"
                  />
                </div>

                {/* Frame Color styling picker */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide block">
                    Skins Color Accents
                  </span>
                  <div className="flex gap-1.5 flex-wrap pt-0.5 justify-start">
                    {colorOptions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        id={`add-color-${c}`}
                        onClick={() => setFormColor(c)}
                        className={`w-5 h-5 rounded-full bg-${c}-500 border-2 transition-transform shrink-0 ${
                          formColor === c ? 'border-indigo-600 scale-120' : 'border-white hover:scale-110'
                        }`}
                        title={c}
                      />
                    ))}
                  </div>
                </div>

              </div>

              {/* Emoji illustration icons selection row */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide block">
                  Select Visual Avatar Symbol Icon
                </span>
                <div className="flex gap-2 flex-wrap max-h-24 overflow-y-auto p-2 bg-stone-50 rounded-lg border border-stone-200">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      id={`add-emoji-${emoji}`}
                      type="button"
                      onClick={() => setFormIcon(emoji)}
                      className={`text-lg p-1 rounded-md transition-colors hover:bg-stone-200 shrink-0 ${
                        formIcon === emoji ? 'bg-indigo-100 ring-2 ring-indigo-500 ring-offset-1' : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action triggers */}
              <div className="pt-4 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  id="add-product-cancel-btn"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="add-product-submit-btn"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold py-2 px-5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT SPECIFIC MODAL DIALOG */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-55 overflow-y-auto">
          {/* Backdrop exit screen click handler */}
          <div className="fixed inset-0" onClick={() => setIsEditModalOpen(false)} />
          
          <div 
            id="edit-product-form-card"
            className="relative bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-stone-200 z-60 animate-in zoom-in duration-150"
          >
            {/* Header branding */}
            <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Edit className="w-5 h-5 text-indigo-200" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider">EDIT PRODUCT specifications</h3>
              </div>
              <button 
                id="close-edit-modal-btn"
                onClick={() => setIsEditModalOpen(false)} 
                className="text-indigo-100 hover:text-white p-1 rounded-md hover:bg-indigo-700/50"
                title="Cancel changes"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Product Name */}
                <div className="space-y-1">
                  <label htmlFor="edit-name-input" className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                    Product Title *
                  </label>
                  <input
                    id="edit-name-input"
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full text-xs bg-stone-50 text-stone-900 border border-stone-200 p-2.5 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                {/* SKU Code */}
                <div className="space-y-1">
                  <label htmlFor="edit-sku-input" className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                    Stock Keeping Unit (SKU)
                  </label>
                  <input
                    id="edit-sku-input"
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full text-xs bg-stone-50 text-stone-900 border border-stone-200 p-2.5 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-mono uppercase"
                  />
                </div>

                {/* Categories */}
                <div className="space-y-1">
                  <label htmlFor="edit-category-input" className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                    Catalog Category
                  </label>
                  <select
                    id="edit-category-input"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full text-xs bg-stone-50 text-stone-900 border border-stone-200 p-2.5 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Stock Edit */}
                <div className="space-y-1">
                  <label htmlFor="edit-stock-input" className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                    Available Stock Quantity
                  </label>
                  <input
                    id="edit-stock-input"
                    type="number"
                    min="0"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full text-xs bg-stone-50 text-stone-900 border border-stone-200 p-2.5 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-mono"
                  />
                </div>

                {/* Purchase cost */}
                <div className="space-y-1">
                  <label htmlFor="edit-cost-input" className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                    Purchase Cost ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                    <input
                      id="edit-cost-input"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formCost}
                      onChange={(e) => setFormCost(e.target.value)}
                      className="w-full text-xs bg-stone-50 text-stone-900 border border-stone-200 pl-7 pr-3 py-2.5 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* Selling Price */}
                <div className="space-y-1">
                  <label htmlFor="edit-price-input" className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                    Retail Selling Price ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                    <input
                      id="edit-price-input"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full text-xs bg-stone-50 text-stone-900 border border-stone-200 pl-7 pr-3 py-2.5 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* Min Stock warning */}
                <div className="space-y-1">
                  <label htmlFor="edit-threshold-input" className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                    Reorder Stock warning threshold limit
                  </label>
                  <input
                    id="edit-threshold-input"
                    type="number"
                    min="1"
                    required
                    value={formThreshold}
                    onChange={(e) => setFormThreshold(e.target.value)}
                    className="w-full text-xs bg-stone-50 text-stone-900 border border-stone-200 p-2.5 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-mono"
                  />
                </div>

                {/* Skins color accented styling picker */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide block">
                    Skin Color Accent
                  </span>
                  <div className="flex gap-1.5 flex-wrap pt-0.5 justify-start">
                    {colorOptions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        id={`edit-color-${c}`}
                        onClick={() => setFormColor(c)}
                        className={`w-5 h-5 rounded-full bg-${c}-500 border-2 transition-transform shrink-0 ${
                          formColor === c ? 'border-indigo-600 scale-120' : 'border-white hover:scale-110'
                        }`}
                        title={c}
                      />
                    ))}
                  </div>
                </div>

              </div>

              {/* Emoji avatar selectors row */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide block">
                  Select Visual Avatar Symbol Icon
                </span>
                <div className="flex gap-2 flex-wrap max-h-24 overflow-y-auto p-2 bg-stone-50 rounded-lg border border-stone-200">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      id={`edit-emoji-${emoji}`}
                      onClick={() => setFormIcon(emoji)}
                      className={`text-lg p-1 rounded-md transition-colors hover:bg-stone-200 shrink-0 ${
                        formIcon === emoji ? 'bg-indigo-100 ring-2 ring-indigo-500 ring-offset-1' : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  id="edit-product-cancel-btn"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="edit-product-submit-btn"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold py-2 px-5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Modification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
