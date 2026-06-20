import React, { useState } from 'react';
import { 
  Building, 
  MapPin, 
  Phone, 
  Percent, 
  Coins, 
  RefreshCw, 
  Database, 
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Cpu
} from 'lucide-react';

interface SettingsPanelProps {
  onFactoryReset: () => void;
  triggerSystemWarning: (text: string) => void;
}

export default function SettingsPanel({
  onFactoryReset,
  triggerSystemWarning
}: SettingsPanelProps) {
  
  // Configuration UI state elements
  const [storeName, setStoreName] = useState('Notus Terminal Kit');
  const [storeAddress, setStoreAddress] = useState('123 Corporate Blvd, Ste 400');
  const [storePhone, setStorePhone] = useState('(555) 019-2834');
  const [taxRate, setTaxRate] = useState('8');
  const [currency, setCurrency] = useState('USD ($)');
  const [activeSaveAlert, setActiveSaveAlert] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSaveAlert(true);
    setTimeout(() => {
      setActiveSaveAlert(false);
    }, 2500);
  };

  const handleResetAction = () => {
    if (confirm('CRITICAL ACTION: Are you sure you want to perform a hard Factory Reset? This action will clear all live orders, void transaction history logs, recreate the default catalog inventory list, and clear read notification alerts permanently.')) {
      onFactoryReset();
      triggerSystemWarning('All local storage databases cleared. Re-initialized starter kit.');
    }
  };

  return (
    <div className="p-4 md:p-6 bg-slate-50/50 min-h-[calc(100vh-5rem)] space-y-6 max-w-4xl mx-auto">
      
      {/* Settings Panel Grid split */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Form Settings (Col Span 8) */}
        <div className="md:col-span-8 bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
          
          <div className="border-b border-stone-100 pb-4 mb-6">
            <h3 className="font-extrabold text-sm text-stone-800 uppercase tracking-wider">
              Terminal Preferences Configuration
            </h3>
            <p className="text-[11px] text-stone-400">Tweak checkout tax codes and business profile headers</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            
            {/* Store profile */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-stone-400 tracking-wider uppercase block">
                Merchant Receipt Branding Header
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Store Name */}
                <div className="space-y-1">
                  <label htmlFor="store-name" className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-indigo-500" /> Organization name
                  </label>
                  <input
                    id="store-name"
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full text-xs bg-stone-50 text-stone-900 border border-stone-200 p-2.5 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Telephone */}
                <div className="space-y-1">
                  <label htmlFor="store-phone" className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-indigo-500" /> Telephone Contact
                  </label>
                  <input
                    id="store-phone"
                    type="text"
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    className="w-full text-xs bg-stone-50 text-stone-900 border border-stone-200 p-2.5 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Store address */}
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="store-address" className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Street Address Line
                  </label>
                  <input
                    id="store-address"
                    type="text"
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    className="w-full text-xs bg-stone-50 text-stone-900 border border-stone-200 p-2.5 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

              </div>
            </div>

            {/* Calculations metrics defaults */}
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <span className="text-[10px] font-bold text-stone-400 tracking-wider uppercase block">
                Tender Tax & Currency parameters
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Tax level */}
                <div className="space-y-1">
                  <label htmlFor="tax-rate" className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-indigo-500" /> Sales Tax Rate (%)
                  </label>
                  <input
                    id="tax-rate"
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full text-xs bg-stone-50 text-stone-900 border border-stone-200 p-2.5 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                {/* Currency preference */}
                <div className="space-y-1">
                  <label htmlFor="currency" className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-indigo-500" /> Currency Symbol
                  </label>
                  <select
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full text-xs bg-stone-50 text-stone-900 border border-stone-200 p-2.5 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="USD ($)">USD ($) - United States Dollar</option>
                    <option value="EUR (€)">EUR (€) - Euro Zone</option>
                    <option value="GBP (£)">GBP (£) - British Pound</option>
                    <option value="JPY (¥)">JPY (¥) - Japanese Yen</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Form Save alerts / action */}
            <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
              {activeSaveAlert ? (
                <div role="alert" className="text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2 flex items-center gap-2 text-xs font-semibold">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Branding configurations successfully logged! (UI simulation)
                </div>
              ) : <div />}

              <button
                type="submit"
                id="save-settings-btn"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 px-5 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
              >
                Save configurations
              </button>
            </div>

          </form>

        </div>

        {/* Right Column: Destructive Factory reset controls (Col Span 4) */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Hardware Diagnostics stat card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Hardware Integration</span>
            
            <div className="space-y-3.5 mt-4">
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500 font-medium">Thermal Receipt Printer:</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ONLINE
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500 font-medium">Barcode Scanner Port:</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> HID-PORT_3
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500 font-medium">Cash Drawer Relay:</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ARMED
                </span>
              </div>

            </div>

            <div className="mt-5 border-t border-stone-100 pt-4 text-center">
              <span className="text-[10px] font-mono text-stone-400 flex items-center justify-center gap-1 uppercase font-bold">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" /> local core revision: 1.0.8v
              </span>
            </div>
          </div>

          {/* Hard Reset Card */}
          <div className="bg-white border border-rose-100 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex gap-2.5 items-start">
              <div className="p-2 bg-rose-50 rounded-xl text-rose-600 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-rose-800 uppercase tracking-wide">Danger Administration</h4>
                <p className="text-[10.5px] text-stone-400 mt-1 leading-normal">
                  Perform a master hard-reset loop to restore template inventories.
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100/50 text-[10px] text-rose-800 leading-normal">
              WARNING: This loop immediately flushes all browser cache state variables. History transaction sheets and newly registered custom products will be deleted forever.
            </div>

            <button
              id="factory-reset-btn"
              onClick={handleResetAction}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer uppercase tracking-wider"
              title="Factory Reset POS"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Perform hard factory reset
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
