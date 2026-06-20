import React from 'react';
import { 
  ShoppingCart, 
  History, 
  Package, 
  BarChart3, 
  Settings, 
  X, 
  Store,
  AlertCircle,
  FileText
} from 'lucide-react';
import { ActiveSection, Product } from '../types';

interface SidebarProps {
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  lowStockCount: number;
}

export default function Sidebar({ 
  activeSection, 
  setActiveSection, 
  isOpen, 
  setIsOpen,
  lowStockCount
}: SidebarProps) {
  
  const navItems = [
    { 
      id: 'pos' as ActiveSection, 
      label: 'POS Terminal', 
      icon: ShoppingCart, 
      color: 'text-indigo-600',
      desc: 'Checkout register',
      shortcut: 'P'
    },
    { 
      id: 'inventory' as ActiveSection, 
      label: 'Inventory Manager', 
      icon: Package, 
      color: 'text-emerald-600',
      extra: lowStockCount > 0 ? (
        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {lowStockCount}
        </span>
      ) : null,
      desc: 'Products & stock control',
      shortcut: 'I'
    },
    { 
      id: 'sales' as ActiveSection, 
      label: 'Sales History', 
      icon: History, 
      color: 'text-amber-600',
      desc: 'Receipts & audits',
      shortcut: 'S'
    },
    { 
      id: 'analytics' as ActiveSection, 
      label: 'Analytics Dashboard', 
      icon: BarChart3, 
      color: 'text-rose-600',
      desc: 'Revenue & charts',
      shortcut: 'A'
    },
    { 
      id: 'reports' as ActiveSection, 
      label: 'Reports Audit', 
      icon: FileText, 
      color: 'text-indigo-600',
      desc: 'Compliance & sheets',
      shortcut: 'R'
    },
    { 
      id: 'settings' as ActiveSection, 
      label: 'System Settings', 
      icon: Settings, 
      color: 'text-blue-600',
      desc: 'Preferences & reset',
      shortcut: 'O'
    }
  ];

  const handleNavClick = (sectionId: ActiveSection) => {
    setActiveSection(sectionId);
    setIsOpen(false); // Close mobile sidebar if open
  };

  return (
    <>
      {/* Mobile background overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside 
        id="side-nav-container"
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-stone-200 shadow-xl lg:shadow-none flex flex-col z-55 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-stone-900 text-sm leading-tight tracking-tight uppercase">
                Notus POS
              </h1>
              <span className="text-[10px] text-stone-500 font-medium tracking-wider uppercase">
                VUE.JS UI EDITION
              </span>
            </div>
          </div>
          
          <button 
            id="close-sidebar-btn"
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 lg:hidden transition-colors"
            title="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User stats badge in sidebar - Distinctive styling */}
        <div className="mx-4 mt-6 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-50/40 border border-indigo-100/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-indigo-700 border border-indigo-100 shadow-xs">
              N
            </div>
            <div>
              <h4 className="text-xs font-semibold text-stone-800">Administrator</h4>
              <p className="text-[10px] text-indigo-600 font-medium">Terminal Live</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-indigo-200/40 flex items-center justify-between text-[11px] text-stone-500">
            <span>Shift Started:</span>
            <span className="font-bold text-stone-700">09:00 AM</span>
          </div>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-bold text-stone-400 tracking-widest uppercase">
            Management
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-lg text-left transition-all duration-150 group ${
                  isActive 
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-100' 
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <div className={`p-1 rounded-md transition-colors ${
                  isActive ? 'bg-indigo-700 text-white' : 'bg-stone-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 text-stone-500'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{item.label}</div>
                  <span className={`text-[9px] block font-light leading-none mt-0.5 ${
                    isActive ? 'text-indigo-200' : 'text-stone-400 group-hover:text-stone-500'
                  }`}>
                    {item.desc}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                  {item.extra}
                  <kbd className={`font-mono text-[9px] px-1 py-0.5 rounded border transition-all ${
                    isActive 
                      ? 'bg-indigo-700/80 border-indigo-400/30 text-indigo-100 shadow-xs' 
                      : 'bg-stone-50 border-stone-200 text-stone-400 group-hover:bg-white group-hover:text-stone-500 group-hover:border-stone-300'
                  }`}>
                    Ctrl+{item.shortcut}
                  </kbd>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer / Meta Data in Sidebar */}
        <div className="p-4 border-t border-stone-100 text-center bg-stone-50/50">
          <div className="text-[10px] font-medium text-stone-400">
            Current Session Active
          </div>
          <div className="text-[11px] font-mono text-stone-600 mt-1 flex items-center justify-center gap-1">
            <span className="inline-block w-2 bg-emerald-500 h-2 rounded-full animate-pulse"></span>
            SYS: STABLE
          </div>
        </div>
      </aside>
    </>
  );
}
