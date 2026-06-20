import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Menu, 
  Clock, 
  User, 
  Check, 
  Trash2, 
  AlertCircle,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { SystemNotification, ActiveSection } from '../types';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  notifications: SystemNotification[];
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
  searchFilter: string;
  setSearchFilter: (search: string) => void;
  activeSection: ActiveSection;
}

export default function Header({
  sidebarOpen,
  setSidebarOpen,
  notifications,
  onMarkNotificationRead,
  onClearNotifications,
  searchFilter,
  setSearchFilter,
  activeSection
}: HeaderProps) {
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [systemTime, setSystemTime] = useState(new Date());

  // Run a continuous clock sync
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'pos': return 'Point of Sale Terminal';
      case 'inventory': return 'Inventory & Stock Admin';
      case 'sales': return 'Receipt Audit Trails';
      case 'analytics': return 'Sales Analytics Dashboard';
      case 'reports': return 'Reports & Auditing Terminal';
      case 'settings': return 'System Settings & Config';
      default: return 'Notus POS System';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header 
      id="main-app-header"
      className="sticky top-0 z-40 h-16 bg-white border-b border-stone-200 px-4 md:px-6 flex items-center justify-between"
    >
      {/* Left section: Breadcrumbs + Mobile Hamburger */}
      <div className="flex items-center gap-3">
        <button
          id="toggle-sidebar-mobile"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-50 lg:hidden transition-colors"
          title="Open Side Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-1.5 text-xs text-stone-400 font-medium tracking-wide">
            <span>ADMINISTRATOR</span>
            <span>/</span>
            <span className="uppercase text-stone-500">{activeSection}</span>
          </div>
          <h2 className="title font-bold text-stone-800 text-sm md:text-base leading-tight mt-0.5">
            {getSectionTitle()}
          </h2>
        </div>
      </div>

      {/* Center Section: Search Bar - only shown in POS or Inventory views */}
      {(activeSection === 'pos' || activeSection === 'inventory') && (
        <div className="flex-1 max-w-xs md:max-w-md mx-4 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            placeholder={
              activeSection === 'pos' 
                ? "Search item catalog or barcode..." 
                : "Search inventory item by name/sku..."
            }
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full text-xs bg-stone-50 text-stone-900 placeholder-stone-400 pl-9 pr-4 py-2 rounded-lg border border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
          />
          {searchFilter && (
            <button 
              id="clear-search-btn"
              onClick={() => setSearchFilter('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-semibold px-1 rounded-sm hover:bg-stone-200/50"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Right Section: Time, Notifications, User profile */}
      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        {/* Clock Ticker */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-stone-500 bg-stone-50 border border-stone-200/50 px-2.5 py-1.5 rounded-lg font-mono">
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span>{systemTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>

        {/* Notifications alert dropdown */}
        <div className="relative">
          <button
            id="notification-bell-btn"
            onClick={() => setShowBellDropdown(!showBellDropdown)}
            className={`p-2 rounded-lg border text-stone-600 hover:text-stone-900 transition-colors relative ${
              showBellDropdown ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-stone-200 hover:bg-stone-50'
            }`}
            title="View system alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Alert Center Panel */}
          {showBellDropdown && (
            <>
              {/* Backing screen block click handler */}
              <div 
                className="fixed inset-0 z-50 cursor-default" 
                onClick={() => setShowBellDropdown(false)} 
              />
              
              <div 
                id="alert-center-dropdown"
                className="absolute right-0 mt-2.5 w-80 bg-white border border-stone-200/80 rounded-xl shadow-2xl z-55 overflow-hidden flex flex-col"
              >
                {/* Bell header panel */}
                <div className="p-3.5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-stone-800">Alert Notification Center</span>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      id="clear-all-notifications-btn"
                      onClick={() => {
                        onClearNotifications();
                        setShowBellDropdown(false);
                      }}
                      className="text-[10px] text-rose-500 hover:text-rose-700 font-bold flex items-center gap-0.5 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear All
                    </button>
                  )}
                </div>

                {/* Notifications list */}
                <div className="max-h-72 overflow-y-auto divide-y divide-stone-100 flex-1">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-stone-400">
                      <p className="text-xs">No active alerts</p>
                      <span className="text-[10px] text-stone-400">Everything looks stable!</span>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        className={`p-3 relative transition-colors ${notif.read ? 'bg-white' : 'bg-indigo-50/50 hover:bg-indigo-50'}`}
                      >
                        <div className="flex gap-2.5 items-start">
                          <span className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                            notif.type === 'warning' ? 'bg-amber-500' :
                            notif.type === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'
                          }`} />
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-stone-700 leading-normal pr-4">
                              {notif.text}
                            </p>
                            <span className="text-[9px] text-stone-400 font-mono mt-0.5 block">
                              {notif.timestamp}
                            </span>
                          </div>

                          {!notif.read && (
                            <button
                              id={`mark-read-btn-${notif.id}`}
                              onClick={() => onMarkNotificationRead(notif.id)}
                              className="absolute top-3 right-3 text-indigo-600 hover:text-indigo-800 p-0.5 rounded-sm hover:bg-indigo-100/30"
                              title="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-stone-100 bg-stone-50/50 text-center">
                  <span className="text-[10px] text-stone-400">Shift diagnostics: Running Normally</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User context widget */}
        <div className="flex items-center gap-2 border-l border-stone-200 pl-2.5 md:pl-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold leading-none shadow-sm">
            <User className="w-4 h-4 text-indigo-100" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-[11px] font-bold text-stone-800 leading-none">John Doe</div>
            <span className="text-[9px] text-stone-400 font-medium">Duty Cashier</span>
          </div>
        </div>
      </div>
    </header>
  );
}
