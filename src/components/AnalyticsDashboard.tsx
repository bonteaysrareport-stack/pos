import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Coins, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart, 
  Wallet,
  Sparkles,
  Award,
  AlertTriangle,
  Flame,
  Inbox,
  Info
} from 'lucide-react';
import { SaleTransaction, Product } from '../types';

interface AnalyticsDashboardProps {
  transactions: SaleTransaction[];
  products: Product[];
}

export default function AnalyticsDashboard({
  transactions,
  products
}: AnalyticsDashboardProps) {

  const [activeTab, setActiveTab] = useState<'7days' | 'monthly'>('7days');
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);

  // Financial aggregates calculation
  const stats = useMemo(() => {
    let revenue = 0;
    let profit = 0;
    let discounts = 0;
    let itemsSoldCount = 0;

    transactions.forEach(t => {
      revenue += t.totalAmount;
      profit += t.profitAmount;
      discounts += t.discountAmount;
      t.items.forEach(item => {
        itemsSoldCount += item.quantity;
      });
    });

    const lowStockCount = products.filter(p => p.stock <= p.threshold).length;

    return {
      revenue,
      profit,
      discounts,
      itemsSoldCount,
      lowStockCount,
      ordersCount: transactions.length
    };
  }, [transactions, products]);

  // Payment Breakdown split statistics
  const paymentBreakdown = useMemo(() => {
    let cashSum = 0;
    let cardSum = 0;
    let mobileSum = 0;

    transactions.forEach(t => {
      if (t.paymentMethod === 'Cash') cashSum += t.totalAmount;
      else if (t.paymentMethod === 'Card') cardSum += t.totalAmount;
      else if (t.paymentMethod === 'Mobile Pay') mobileSum += t.totalAmount;
    });

    const total = cashSum + cardSum + mobileSum || 1;

    return {
      cash: { val: cashSum, pct: (cashSum / total) * 100 },
      card: { val: cardSum, pct: (cardSum / total) * 100 },
      mobile: { val: mobileSum, pct: (mobileSum / total) * 100 }
    };
  }, [transactions]);

  // Derived Trend Chart Points (Mock weekly and monthly charts representing actual live transactions + baseline business values)
  const trendPoints = useMemo(() => {
    // Basic daily points for a week
    const last7DaysBaseline = [
      { day: 'Mon', revenue: 240, orders: 15 },
      { day: 'Tue', revenue: 380, orders: 20 },
      { day: 'Wed', revenue: 310, orders: 18 },
      { day: 'Thu', revenue: 520, orders: 32 },
      { day: 'Fri', revenue: 780, orders: 48 },
      { day: 'Sat', revenue: 950, orders: 55 },
      { day: 'Sun', revenue: stats.revenue > 0 ? 600 + stats.revenue : 620, orders: 36 + stats.ordersCount }
    ];

    // Basic monthly points
    const monthlyBaseline = [
      { day: 'Jan', revenue: 12000, orders: 600 },
      { day: 'Feb', revenue: 15300, orders: 750 },
      { day: 'Mar', revenue: 14200, orders: 690 },
      { day: 'Apr', revenue: 19800, orders: 980 },
      { day: 'May', revenue: stats.revenue > 0 ? 22000 + stats.revenue : 21000, orders: 1100 + stats.ordersCount }
    ];

    return activeTab === '7days' ? last7DaysBaseline : monthlyBaseline;
  }, [activeTab, stats]);

  // SVG dimensions for trend chart
  const padding = 40;
  const chartWidth = 650;
  const chartHeight = 220;

  // Compute SVG mapping coordinates based on selected active tab values
  const svgCoordinates = useMemo(() => {
    const values = trendPoints.map(p => p.revenue);
    const maxVal = Math.max(...values, 1000) * 1.15; // padding top
    const minVal = 0;

    const scaleX = (chartWidth - padding * 2) / (trendPoints.length - 1);
    const scaleY = (chartHeight - padding * 2) / (maxVal - minVal);

    return trendPoints.map((pt, idx) => {
      const x = padding + idx * scaleX;
      // SVG Y coordinates start from top-left, so invert Y
      const y = chartHeight - padding - (pt.revenue - minVal) * scaleY;
      return { x, y, pt };
    });
  }, [trendPoints, chartWidth, chartHeight, padding]);

  // Standard line string generator
  const linePathString = useMemo(() => {
    if (svgCoordinates.length === 0) return '';
    return svgCoordinates.reduce((acc, coord, idx) => {
      const prefix = idx === 0 ? 'M' : 'L';
      return `${acc} ${prefix} ${coord.x.toFixed(1)} ${coord.y.toFixed(1)}`;
    }, '');
  }, [svgCoordinates]);

  // Smoother shaded area string generator
  const filledAreaPathString = useMemo(() => {
    if (svgCoordinates.length === 0) return '';
    const lineStr = linePathString;
    const lastX = svgCoordinates[svgCoordinates.length - 1].x;
    const firstX = svgCoordinates[0].x;
    const baseY = chartHeight - padding;
    return `${lineStr} L ${lastX.toFixed(1)} ${baseY.toFixed(1)} L ${firstX.toFixed(1)} ${baseY.toFixed(1)} Z`;
  }, [svgCoordinates, linePathString, chartHeight, padding]);

  // Calculate Top selling products based on live transaction registers
  const topSellers = useMemo(() => {
    const volumesMap: Record<string, { qty: number; revenue: number; category: string }> = {};

    transactions.forEach(t => {
      t.items.forEach(item => {
        if (!volumesMap[item.name]) {
          // Find actual category if possible
          const pRef = products.find(prod => prod.id === item.productId || prod.name === item.name);
          volumesMap[item.name] = { 
            qty: 0, 
            revenue: 0, 
            category: pRef ? pRef.category : 'General' 
          };
        }
        volumesMap[item.name].qty += item.quantity;
        volumesMap[item.name].revenue += item.total;
      });
    });

    return Object.entries(volumesMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [transactions, products]);

  return (
    <div className="p-4 md:p-6 bg-slate-50/50 min-h-[calc(100vh-5rem)] space-y-6">
      
      {/* 4 NOTUS-STYLE STATISTICS HIGHLIGHT BLOCKS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="stats-widget-grid">
        
        {/* Total revenue */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none">
                Duty Session Revenue
              </p>
              <h3 className="text-2xl font-mono font-extrabold text-stone-800 tracking-tight mt-1.5" id="metric-revenue">
                ${stats.revenue.toFixed(2)}
              </h3>
            </div>
            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3.5 text-xs text-stone-500">
            <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-emerald-100 shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.2%
            </span>
            <span className="truncate">vs shift baseline</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600" />
        </div>

        {/* Total Profit */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none">
                Net Margin Profit
              </p>
              <h3 className="text-2xl font-mono font-extrabold text-emerald-600 tracking-tight mt-1.5">
                ${stats.profit.toFixed(2)}
              </h3>
            </div>
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3.5 text-xs text-stone-500">
            <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-emerald-100 shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5" /> +8.3%
            </span>
            <span className="truncate">high gross yields</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />
        </div>

        {/* Total Orders checked out */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none">
                Register Transactions
              </p>
              <h3 className="text-2xl font-mono font-extrabold text-stone-800 tracking-tight mt-1.5" id="metric-orders-count">
                {stats.ordersCount} sales
              </h3>
            </div>
            <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3.5 text-xs text-stone-500">
            <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-emerald-100 shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5" /> +11.5%
            </span>
            <span>{stats.itemsSoldCount} units sold</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
        </div>

        {/* Low inventory alert cards */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none">
                Low stock Alert flags
              </p>
              <h3 className={`text-2xl font-mono font-extrabold mt-1.5 tracking-tight ${
                stats.lowStockCount > 0 ? 'text-amber-600 animate-pulse' : 'text-stone-800'
              }`}>
                {stats.lowStockCount} items
              </h3>
            </div>
            <div className={`w-10 h-10 border rounded-xl flex items-center justify-center shadow-sm ${
              stats.lowStockCount > 0 
                ? 'bg-amber-50 border-amber-100 text-amber-600' 
                : 'bg-stone-50 border-stone-100 text-stone-500'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3.5 text-xs text-stone-500">
            {stats.lowStockCount > 0 ? (
              <span className="text-amber-800 font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500 animate-bounce" /> Replenish immediately
              </span>
            ) : (
              <span className="text-emerald-700 font-bold">✓ All stock counts healthy</span>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600" />
        </div>

      </div>

      {/* TREND CHART AND PAYMENT DEPOSIT GAUGE BOX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SVG Sales trend curves (Col span 8) */}
        <div className="lg:col-span-8 bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center pb-4 border-b border-stone-100 mb-4">
            <div>
              <h3 className="font-extrabold text-sm text-stone-800 uppercase tracking-wider">
                Sales trend revenue curve
              </h3>
              <p className="text-[11px] text-stone-400 font-medium">Duty session metrics visualization</p>
            </div>
            
            {/* Chart toggle period buttons */}
            <div className="flex border border-stone-200 rounded-lg p-0.5 bg-stone-50">
              <button
                id="trend-chart-week"
                onClick={() => { setActiveTab('7days'); setHoveredPointIdx(null); }}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === '7days' ? 'bg-white text-indigo-700 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                7 Days Curve
              </button>
              <button
                id="trend-chart-month"
                onClick={() => { setActiveTab('monthly'); setHoveredPointIdx(null); }}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === 'monthly' ? 'bg-white text-indigo-700 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Yearly History
              </button>
            </div>
          </div>

          {/* Interactive SVG Area Canvas block */}
          <div className="h-60 relative w-full flex items-center justify-center">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              width="100%" 
              height="100%" 
              className="overflow-visible select-none"
            >
              {/* Gradients */}
              <defs>
                <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#f3f4f6" strokeWidth={1} strokeDasharray="3 3" />
              <line x1={padding} y1={(chartHeight) / 2} x2={chartWidth - padding} y2={(chartHeight) / 2} stroke="#f3f4f6" strokeWidth={1} strokeDasharray="3 3" />
              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#f3f4f6" strokeWidth={1} />

              {/* Shaded Area Under Curve */}
              <path d={filledAreaPathString} fill="url(#gradient-area)" />

              {/* Primary Curve Line path */}
              <path 
                d={linePathString} 
                fill="none" 
                stroke="#4f46e5" 
                strokeWidth={2.5} 
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Plot interactive nodes */}
              {svgCoordinates.map((coord, idx) => {
                const isHovered = hoveredPointIdx === idx;
                return (
                  <g key={idx} className="cursor-pointer">
                    {/* Interactive catch boundary */}
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={14}
                      fill="transparent"
                      onMouseEnter={() => setHoveredPointIdx(idx)}
                      onMouseLeave={() => setHoveredPointIdx(null)}
                    />

                    {/* Outer hover ring */}
                    {isHovered && (
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r={7.5}
                        fill="#4f46e5"
                        fillOpacity="0.15"
                        stroke="#4f46e5"
                        strokeWidth={1}
                        className="animate-ping"
                      />
                    )}

                    {/* Solid node point dots */}
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={isHovered ? 5.5 : 3.5}
                      fill={isHovered ? '#6366f1' : '#ffffff'}
                      stroke="#4f46e5"
                      strokeWidth={2}
                      className="transition-all duration-150"
                    />

                    {/* Label strings coordinates below */}
                    <text
                      x={coord.x}
                      y={chartHeight - padding + 18}
                      fontSize={9.5}
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill="#9ca3af"
                      textAnchor="middle"
                    >
                      {coord.pt.day}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover floating HTML Tooltip block */}
            {hoveredPointIdx !== null && (
              <div 
                className="absolute bg-stone-900 text-white rounded-xl p-3 shadow-xl border border-stone-800 text-[10.5px] pointer-events-none z-20 font-mono"
                style={{
                  left: `${(svgCoordinates[hoveredPointIdx].x / chartWidth) * 100}%`,
                  top: `${(svgCoordinates[hoveredPointIdx].y / chartHeight) * 100 - 24}%`,
                  transform: 'translateX(-50%) translateY(-100%)'
                }}
              >
                <div className="font-bold border-b border-stone-800 pb-1 mb-1 text-slate-400 uppercase tracking-widest text-[9px]">
                  {trendPoints[hoveredPointIdx].day} statistics
                </div>
                <div>Revenue: <strong className="text-white text-xs">${trendPoints[hoveredPointIdx].revenue.toFixed(2)}</strong></div>
                <div className="mt-0.5">Checkout orders: <span className="text-indigo-400 font-bold">{trendPoints[hoveredPointIdx].orders} tx</span></div>
              </div>
            )}
          </div>
        </div>

        {/* Deposit details percentages split (Col span 4) */}
        <div className="lg:col-span-4 bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-stone-800 uppercase tracking-wider">
              Tender Deposits Split
            </h3>
            <p className="text-[11px] text-stone-400 font-medium">Distribution by total payment method value</p>
          </div>

          <div className="space-y-6 py-6" id="payment-deposits-split">
            
            {/* Cash progression */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs text-stone-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" /> Cash Box
                </span>
                <span className="font-mono font-bold">{paymentBreakdown.cash.pct.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${paymentBreakdown.cash.pct}%` }} />
              </div>
              <span className="font-mono text-[9px] text-stone-400 font-bold block text-right">
                ${paymentBreakdown.cash.val.toFixed(2)} total deposits
              </span>
            </div>

            {/* Card progression */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs text-stone-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm" /> Credit/Debit Card
                </span>
                <span className="font-mono font-bold">{paymentBreakdown.card.pct.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${paymentBreakdown.card.pct}%` }} />
              </div>
              <span className="font-mono text-[9px] text-stone-400 font-bold block text-right">
                ${paymentBreakdown.card.val.toFixed(2)} total deposits
              </span>
            </div>

            {/* Mobile Pay progression */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs text-stone-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-violet-500 rounded-sm" /> Mobile Tap pay
                </span>
                <span className="font-mono font-bold">{paymentBreakdown.mobile.pct.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${paymentBreakdown.mobile.pct}%` }} />
              </div>
              <span className="font-mono text-[9px] text-stone-400 font-bold block text-right">
                ${paymentBreakdown.mobile.val.toFixed(2)} total deposits
              </span>
            </div>

          </div>

          <div className="bg-slate-50 border border-stone-200/50 p-2.5 rounded-xl flex gap-2.5 items-start text-[11px] text-stone-500">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="leading-snug">
              Deposit proportions help audit merchant processor fee structures on credit card/mobile settlement loops.
            </p>
          </div>
        </div>

      </div>

      {/* TOP PERFORMING SKU INDEX BOX */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        <div className="p-4 bg-stone-50/50 border-b border-stone-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className="font-extrabold text-sm text-stone-800 uppercase tracking-wider">Top Performing SKU volumes</h3>
          </div>
          <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 uppercase font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-600 shrink-0" /> Host sellers
          </span>
        </div>

        <div className="overflow-x-auto">
          {topSellers.length === 0 ? (
            <div className="p-12 text-center text-stone-400 text-xs">
              <Inbox className="w-8 h-8 text-stone-200 mx-auto mb-2" />
              Checkout orders on the POS terminal to populate hot sellers statistics in real-time.
            </div>
          ) : (
            <table className="w-full text-left border-collapse" id="top-sellers-ranking-table">
              <thead>
                <tr className="bg-stone-50/50 text-[10px] font-bold text-stone-400 tracking-wider uppercase border-b border-stone-100">
                  <th className="py-3 px-6">Rank</th>
                  <th className="py-3 px-4">Item specification</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Volume qty sold</th>
                  <th className="py-3 px-6 text-right">Sum Revenue generated</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-stone-100 text-xs text-stone-600">
                {topSellers.map((item, idx) => (
                  <tr key={idx} className="hover:bg-indigo-50/10">
                    <td className="py-3.5 px-6 font-bold">
                      <div className="flex items-center gap-2">
                        {idx === 0 ? (
                          <span className="bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px]">1</span>
                        ) : idx === 1 ? (
                          <span className="bg-stone-200 text-stone-800 border border-stone-300 rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px]">2</span>
                        ) : idx === 2 ? (
                          <span className="bg-orange-100 text-orange-800 border border-orange-200 rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px]">3</span>
                        ) : (
                          <span className="bg-stone-50 border border-stone-200 text-stone-600 rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px]">{idx + 1}</span>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-3.5 px-4 font-bold text-stone-800">
                      {item.name}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-500 font-bold rounded-sm uppercase text-[9px]">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-extrabold text-stone-700">
                      {item.qty} units
                    </td>

                    <td className="py-3.5 px-6 text-right font-mono font-extrabold text-indigo-600">
                      ${item.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
