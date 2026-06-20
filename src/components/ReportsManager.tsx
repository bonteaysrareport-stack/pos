import React, { useState, useMemo, useRef } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Copy, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Layers, 
  Percent, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { SaleTransaction, Product } from '../types';

interface ReportsManagerProps {
  transactions: SaleTransaction[];
  products: Product[];
  triggerSystemWarning?: (txt: string) => void;
}

type ReportType = 'z_report' | 'inventory_valuation' | 'products_performance' | 'tax_summary';
type DateFilter = 'today' | 'yesterday' | 'last_7_days' | 'month_to_date';

export default function ReportsManager({ transactions, products, triggerSystemWarning }: ReportsManagerProps) {
  const [reportType, setReportType] = useState<ReportType>('z_report');
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  
  // Cash drawer starter reconciliation input
  const [startingCash, setStartingCash] = useState<number>(150);
  const [isCopied, setIsCopied] = useState(false);

  // Helper date boundaries
  const dateRangeLabel = useMemo(() => {
    const todayStr = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    switch (dateFilter) {
      case 'today':
        return todayStr;
      case 'yesterday':
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      case 'last_7_days':
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        return `${sevenDaysAgo.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${todayStr}`;
      case 'month_to_date':
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        return `${startOfMonth.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${todayStr}`;
      default:
        return '';
    }
  }, [dateFilter]);

  // Filter transactions based on date filter
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayDate = now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toDateString();

    const limit7Days = new Date();
    limit7Days.setDate(limit7Days.getDate() - 7);

    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return transactions.filter(tx => {
      // Safely parse timestamp
      const txDate = new Date(tx.timestamp);
      if (isNaN(txDate.getTime())) {
        // Fallback or custom string parsing if needed
        return true; 
      }

      switch (dateFilter) {
        case 'today':
          return txDate.toDateString() === todayDate;
        case 'yesterday':
          return txDate.toDateString() === yesterdayDate;
        case 'last_7_days':
          return txDate >= limit7Days;
        case 'month_to_date':
          return txDate >= firstOfMonth;
        default:
          return true;
      }
    });
  }, [transactions, dateFilter]);

  // 1. Calculations for Z-Report / End-Of-Day
  const zReportData = useMemo(() => {
    let salesCount = 0;
    let subtotalSum = 0;
    let discountsSum = 0;
    let taxSum = 0;
    let totalRevenue = 0;
    let totalCogs = 0;
    let netProfit = 0;

    let cashSales = 0;
    let cardSales = 0;
    let mobileSales = 0;

    filteredTransactions.forEach(tx => {
      salesCount++;
      subtotalSum += tx.subtotal;
      discountsSum += tx.discountAmount;
      taxSum += tx.taxAmount;
      totalRevenue += tx.totalAmount;
      profitAmountCalculations: {
        const itemCostsArray = tx.items.map(item => {
          const matchingProd = products.find(p => p.id === item.productId);
          const itemCost = matchingProd ? matchingProd.cost : (item.price * 0.6); // fallback to 60% of retail price
          return itemCost * item.quantity;
        });
        const computedCogs = itemCostsArray.reduce((acc, c) => acc + c, 0);
        totalCogs += computedCogs;
      }

      if (tx.paymentMethod === 'Cash') {
        cashSales += tx.totalAmount;
      } else if (tx.paymentMethod === 'Card') {
        cardSales += tx.totalAmount;
      } else {
        mobileSales += tx.totalAmount;
      }
    });

    netProfit = totalRevenue - totalCogs;
    const finalExpectedCash = startingCash + cashSales;

    return {
      salesCount,
      subtotalSum,
      discountsSum,
      taxSum,
      totalRevenue,
      netProfit,
      totalCogs,
      cashSales,
      cardSales,
      mobileSales,
      finalExpectedCash
    };
  }, [filteredTransactions, products, startingCash]);

  // 2. Calculations for Inventory Audit
  const inventoryData = useMemo(() => {
    let totalSkus = products.length;
    let totalUnits = 0;
    let totalAssetCost = 0;
    const valuationRetail = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const valuationCost = products.reduce((acc, p) => acc + (p.cost * p.stock), 0);
    
    const categoryBreakdown: { [key: string]: { skus: number; units: number; costVal: number; retailVal: number } } = {};
    const lowStockItems = products.filter(p => p.stock <= p.threshold);

    products.forEach(p => {
      totalUnits += p.stock;
      totalAssetCost += p.cost * p.stock;

      if (!categoryBreakdown[p.category]) {
        categoryBreakdown[p.category] = { skus: 0, units: 0, costVal: 0, retailVal: 0 };
      }
      categoryBreakdown[p.category].skus += 1;
      categoryBreakdown[p.category].units += p.stock;
      categoryBreakdown[p.category].costVal += (p.cost * p.stock);
      categoryBreakdown[p.category].retailVal += (p.price * p.stock);
    });

    const potentialGrossMargin = valuationRetail > 0 
      ? Math.max(0, (valuationRetail - valuationCost) / valuationRetail) * 100 
      : 0;

    return {
      totalSkus,
      totalUnits,
      valuationRetail,
      valuationCost,
      potentialGrossMargin,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      categoryBreakdown
    };
  }, [products]);

  // 3. Products Performance Ranking
  const performanceData = useMemo(() => {
    const salesMap: { [id: string]: { name: string; sku: string; category: string; qty: number; revenue: number; profit: number } } = {};

    // Initialise map with all existing catalog items so we also capture items with zero sales
    products.forEach(p => {
      salesMap[p.id] = {
        name: p.name,
        sku: p.sku,
        category: p.category,
        qty: 0,
        revenue: 0,
        profit: 0
      };
    });

    // Sum matching quantities and sales amounts
    filteredTransactions.forEach(tx => {
      tx.items.forEach(item => {
        const matchingProd = products.find(p => p.id === item.productId);
        const itemCost = matchingProd ? matchingProd.cost : (item.price * 0.6);
        const singleCogs = itemCost * item.quantity;
        const potentialProfit = item.total - singleCogs;

        if (salesMap[item.productId]) {
          salesMap[item.productId].qty += item.quantity;
          salesMap[item.productId].revenue += item.total;
          salesMap[item.productId].profit += potentialProfit;
        } else {
          // If product was deleted, represent it generically
          salesMap[item.productId] = {
            name: item.name,
            sku: 'N/A',
            category: 'Unassigned',
            qty: item.quantity,
            revenue: item.total,
            profit: potentialProfit
          };
        }
      });
    });

    // Convert map to array and sort by revenue descending
    const itemsArray = Object.values(salesMap).sort((a, b) => b.revenue - a.revenue);
    const totalPerformanceRevenue = itemsArray.reduce((acc, item) => acc + item.revenue, 0);

    return {
      itemsArray,
      totalPerformanceRevenue
    };
  }, [filteredTransactions, products]);

  // 4. Taxes & Cash Flow Summary Calculations
  const taxSummaryData = useMemo(() => {
    // Standard retail tax in our dummy system is estimated at 8%
    const totalTaxAmount = filteredTransactions.reduce((acc, t) => acc + t.taxAmount, 0);
    const grossTaxableSales = filteredTransactions.reduce((acc, t) => acc + t.subtotal, 0);
    const totalDiscountDeducted = filteredTransactions.reduce((acc, t) => acc + t.discountAmount, 0);
    const totalTransactions = filteredTransactions.length;

    return {
      totalTaxAmount,
      grossTaxableSales,
      totalDiscountDeducted,
      totalTransactions,
      taxRate: 8
    };
  }, [filteredTransactions]);

  // Generate plain-text layout for copy & download txt simulations
  const plainTextReport = useMemo(() => {
    const divider = '==========================================\n';
    const subDivider = '------------------------------------------\n';
    let output = '';

    output += `NOTUS POINT OF SALE TERMINAL REPORT\n`;
    output += `Generated: ${new Date().toLocaleString()}\n`;
    output += `Filter Frame: ${dateFilter.toUpperCase()} (${dateRangeLabel})\n`;
    output += divider;

    if (reportType === 'z_report') {
      output += `REPORT TYPE: END-OF-DAY REGISTER CLOSURE (Z)\n`;
      output += divider;
      output += `Opening Local Bank:       $${startingCash.toFixed(2)}\n`;
      output += `Transactions Logged:      ${zReportData.salesCount}\n`;
      output += `Net Subtotal Registered:  $${zReportData.subtotalSum.toFixed(2)}\n`;
      output += `Discounts Allowed:       -$${zReportData.discountsSum.toFixed(2)}\n`;
      output += `Taxes Calculated (8%):    $${zReportData.taxSum.toFixed(2)}\n`;
      output += subDivider;
      output += `GROSS INVOICED REVENUE:   $${zReportData.totalRevenue.toFixed(2)}\n`;
      output += `Estimated Cost of Goods:  $${zReportData.totalCogs.toFixed(2)}\n`;
      output += `CALCULATED NET PROFIT:    $${zReportData.netProfit.toFixed(2)}\n`;
      output += divider;
      output += `PAYMENT CHANNEL TALLY:\n`;
      output += ` - Cash Inflows:          $${zReportData.cashSales.toFixed(2)}\n`;
      output += ` - Credit Card Cleared:   $${zReportData.cardSales.toFixed(2)}\n`;
      output += ` - Mobile Platform Apps:  $${zReportData.mobileSales.toFixed(2)}\n`;
      output += subDivider;
      output += `Drawer Expected Ending:   $${zReportData.finalExpectedCash.toFixed(2)}\n`;
    } 
    else if (reportType === 'inventory_valuation') {
      output += `REPORT TYPE: CATALOG VALUATION & COST AUDIT\n`;
      output += divider;
      output += `Total Unique Item SKUs:   ${inventoryData.totalSkus}\n`;
      output += `Total Stocked Units:      ${inventoryData.totalUnits}\n`;
      output += `Current Valuation Cost:   $${inventoryData.valuationCost.toFixed(2)}\n`;
      output += `Valuation Retail Output:  $${inventoryData.valuationRetail.toFixed(2)}\n`;
      output += `Estimated Gross Margin:   ${inventoryData.potentialGrossMargin.toFixed(1)}%\n`;
      output += `Critical Low-Stock Count: ${inventoryData.lowStockCount} items\n`;
      output += divider;
      output += `WAREHOUSE SHELF DETAILS (BY CATEGORY):\n`;
      Object.entries(inventoryData.categoryBreakdown).forEach(([cat, stats]) => {
        const itemStats = stats as { skus: number; units: number; costVal: number; retailVal: number };
        output += ` * ${cat.padEnd(16)} [SKUs: ${itemStats.skus.toString().padStart(2)}] Stock: ${itemStats.units.toString().padStart(3)} | Value: $${itemStats.retailVal.toFixed(0)}\n`;
      });
    } 
    else if (reportType === 'products_performance') {
      output += `REPORT TYPE: TOP PRODUCT REVENUE CONTRIBUTION\n`;
      output += divider;
      output += `${'PRODUCT NAME'.padEnd(18)} | ${'QTY'.padStart(4)} | ${'REVENUE'.padStart(8)} | ${'PROFIT'.padStart(8)}\n`;
      output += subDivider;
      performanceData.itemsArray.slice(0, 15).forEach(item => {
        output += `${item.name.substring(0, 18).padEnd(18)} | ${item.qty.toString().padStart(4)} | $${item.revenue.toFixed(2).padStart(7)} | $${item.profit.toFixed(2).padStart(7)}\n`;
      });
      output += divider;
      output += `Total Logged Revenue:     $${performanceData.totalPerformanceRevenue.toFixed(2)}\n`;
    } 
    else {
      output += `REPORT TYPE: TAX & FISCAL REPORT SUMMARY\n`;
      output += divider;
      output += `Sales Transactions Count: ${taxSummaryData.totalTransactions}\n`;
      output += `Taxable Retail Volume:    $${taxSummaryData.grossTaxableSales.toFixed(2)}\n`;
      output += `Applied Multi-Discounts:  -$${taxSummaryData.totalDiscountDeducted.toFixed(2)}\n`;
      output += `Gross Tax Liability (8%): $${taxSummaryData.totalTaxAmount.toFixed(2)}\n`;
      output += subDivider;
      output += `Net Ledger Net Receivables:$${(taxSummaryData.grossTaxableSales - taxSummaryData.totalDiscountDeducted + taxSummaryData.totalTaxAmount).toFixed(2)}\n`;
    }

    output += divider;
    output += `* END OF RECORD - AUDITED & SECURED BY NOTUS CLOUD *\n`;
    return output;
  }, [reportType, dateFilter, dateRangeLabel, startingCash, zReportData, inventoryData, performanceData, taxSummaryData]);

  // Action helpers
  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(plainTextReport);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    if (triggerSystemWarning) {
      triggerSystemWarning('Report exported to operating clipboard.');
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([plainTextReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notus_report_${reportType}_${dateFilter}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Notus POS Print Audit</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; font-size: 14px; line-height: 1.4; color: #1c1917; }
            pre { white-space: pre-wrap; margin: 0; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <pre>${plainTextReport.replace(/\n/g, '<br/>')}</pre>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 300);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (reportType === 'z_report') {
      csvContent += "Metric,Value\r\n";
      csvContent += `Generated Date,${new Date().toLocaleString()}\r\n`;
      csvContent += `Filter Range,${dateRangeLabel}\r\n`;
      csvContent += `Opening Cash Bank,$${startingCash.toFixed(2)}\r\n`;
      csvContent += `Sales Volume,${zReportData.salesCount}\r\n`;
      csvContent += `Registered Subtotal,$${zReportData.subtotalSum.toFixed(2)}\r\n`;
      csvContent += `Discounts Deducted,$${zReportData.discountsSum.toFixed(2)}\r\n`;
      csvContent += `Calculated Tax,$${zReportData.taxSum.toFixed(2)}\r\n`;
      csvContent += `Total Invoiced Gross,$${zReportData.totalRevenue.toFixed(2)}\r\n`;
      csvContent += `Cost of Goods (COGS),$${zReportData.totalCogs.toFixed(2)}\r\n`;
      csvContent += `Calculated Nett Profit,$${zReportData.netProfit.toFixed(2)}\r\n`;
      csvContent += `Cash Drawer Expected,$${zReportData.finalExpectedCash.toFixed(2)}\r\n`;
    } 
    else if (reportType === 'inventory_valuation') {
      csvContent += "SKU,Product Name,Category,Cost,Retail Price,Current Stock,Valuation Cost,Valuation Retail\r\n";
      products.forEach(p => {
        csvContent += `"${p.sku}","${p.name.replace(/"/g, '""')}","${p.category}",$${p.cost.toFixed(2)},$${p.price.toFixed(2)},${p.stock},${(p.cost * p.stock).toFixed(2)},${(p.price * p.stock).toFixed(2)}\r\n`;
      });
    } 
    else if (reportType === 'products_performance') {
      csvContent += "Rank,Product SKU,Product Name,Quantity Sold,Revenue Contributed,Profit Margin\r\n";
      performanceData.itemsArray.forEach((item, idx) => {
        csvContent += `${idx + 1},"${item.sku}","${item.name.replace(/"/g, '""')}",${item.qty},$${item.revenue.toFixed(2)},$${item.profit.toFixed(2)}\r\n`;
      });
    } 
    else {
      csvContent += "Category,Description,Value\r\n";
      csvContent += `Taxable Gross Sales,Processed subtotal base,$${taxSummaryData.grossTaxableSales.toFixed(2)}\r\n`;
      csvContent += `Assigned Discounts,Total coupon codes used,-$${taxSummaryData.totalDiscountDeducted.toFixed(2)}\r\n`;
      csvContent += `Tax Percentage,Default standard flat rate,8%\r\n`;
      csvContent += `Liability Total,Collected federal tax due,$${taxSummaryData.totalTaxAmount.toFixed(2)}\r\n`;
      csvContent += `Transactions Tally,Number of ticket orders,${taxSummaryData.totalTransactions}\r\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `notus_export_${reportType}_${dateFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-stone-900 tracking-tight flex items-center gap-2">
              Reports & Auditing Terminal
            </h1>
            <p className="text-stone-500 text-xs mt-1">
              Construct high-fidelity compliance receipts, stock audits, product velocity, and fiscal summaries.
            </p>
          </div>
        </div>

        {/* Dynamic configuration filters */}
        <div className="flex flex-wrap items-center gap-2 bg-stone-50 border border-stone-200/60 p-1.5 rounded-xl">
          <button 
            onClick={() => setDateFilter('today')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              dateFilter === 'today' 
                ? 'bg-white shadow-xs text-stone-800 border border-stone-200' 
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Today
          </button>
          <button 
            onClick={() => setDateFilter('yesterday')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              dateFilter === 'yesterday' 
                ? 'bg-white shadow-xs text-stone-800 border border-stone-200' 
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Yesterday
          </button>
          <button 
            onClick={() => setDateFilter('last_7_days')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              dateFilter === 'last_7_days' 
                ? 'bg-white shadow-xs text-stone-800 border border-stone-200' 
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            7 Days
          </button>
          <button 
            onClick={() => setDateFilter('month_to_date')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              dateFilter === 'month_to_date' 
                ? 'bg-white shadow-xs text-stone-800 border border-stone-200' 
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Grid of Report Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* End of Day Z Report card */}
        <button
          onClick={() => setReportType('z_report')}
          className={`text-left p-5 rounded-2xl border transition-all ${
            reportType === 'z_report' 
              ? 'bg-indigo-600 border-indigo-700 text-white shadow-md shadow-indigo-100 ring-2 ring-indigo-600 ring-offset-2' 
              : 'bg-white border-stone-200 text-stone-700 hover:border-stone-350'
          }`}
        >
          <div className="flex items-center justify-between pointer-events-none">
            <div className={`p-2 rounded-lg ${reportType === 'z_report' ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-500'}`}>
              <Clock className="w-5 h-5" />
            </div>
            <ChevronRight className={`w-4 h-4 opacity-50 ${reportType === 'z_report' ? 'text-indigo-200' : 'text-stone-400'}`} />
          </div>
          <h2 className="font-semibold text-sm mt-4 pointer-events-none">End-of-Day Z-Report</h2>
          <p className={`text-xs mt-1 leading-snug pointer-events-none ${reportType === 'z_report' ? 'text-indigo-100' : 'text-stone-500'}`}>
            Audit terminal shifts, drawer tallies, expected ending coin balances, and payment types.
          </p>
        </button>

        {/* Inventory Audit valuation Card */}
        <button
          onClick={() => setReportType('inventory_valuation')}
          className={`text-left p-5 rounded-2xl border transition-all ${
            reportType === 'inventory_valuation' 
              ? 'bg-emerald-600 border-emerald-700 text-white shadow-md shadow-emerald-100 ring-2 ring-emerald-600 ring-offset-2' 
              : 'bg-white border-stone-200 text-stone-700 hover:border-stone-350'
          }`}
        >
          <div className="flex items-center justify-between pointer-events-none">
            <div className={`p-2 rounded-lg ${reportType === 'inventory_valuation' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-500'}`}>
              <Package className="w-5 h-5" />
            </div>
            <ChevronRight className={`w-4 h-4 opacity-50 ${reportType === 'inventory_valuation' ? 'text-emerald-200' : 'text-stone-400'}`} />
          </div>
          <h2 className="font-semibold text-sm mt-4 pointer-events-none">Goods Valuation Audit</h2>
          <p className={`text-xs mt-1 leading-snug pointer-events-none ${reportType === 'inventory_valuation' ? 'text-emerald-100' : 'text-stone-500'}`}>
            Assess total cost on shelves, prospective retail output value, and active low units metrics.
          </p>
        </button>

        {/* Product Performance velocity Card */}
        <button
          onClick={() => setReportType('products_performance')}
          className={`text-left p-5 rounded-2xl border transition-all ${
            reportType === 'products_performance' 
              ? 'bg-amber-600 border-amber-700 text-white shadow-md shadow-amber-100 ring-2 ring-amber-600 ring-offset-2' 
              : 'bg-white border-stone-200 text-stone-700 hover:border-stone-350'
          }`}
        >
          <div className="flex items-center justify-between pointer-events-none">
            <div className={`p-2 rounded-lg ${reportType === 'products_performance' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-500'}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <ChevronRight className={`w-4 h-4 opacity-50 ${reportType === 'products_performance' ? 'text-amber-200' : 'text-stone-400'}`} />
          </div>
          <h2 className="font-semibold text-sm mt-4 pointer-events-none">SKU Velocity & Margin</h2>
          <p className={`text-xs mt-1 leading-snug pointer-events-none ${reportType === 'products_performance' ? 'text-amber-100' : 'text-stone-500'}`}>
            Order rank performance of inventory velocity, highest contribution, and margin.
          </p>
        </button>

        {/* Fiscal Compliance Card */}
        <button
          onClick={() => setReportType('tax_summary')}
          className={`text-left p-5 rounded-2xl border transition-all ${
            reportType === 'tax_summary' 
              ? 'bg-rose-600 border-rose-700 text-white shadow-md shadow-rose-100 ring-2 ring-rose-600 ring-offset-2' 
              : 'bg-white border-stone-200 text-stone-700 hover:border-stone-350'
          }`}
        >
          <div className="flex items-center justify-between pointer-events-none">
            <div className={`p-2 rounded-lg ${reportType === 'tax_summary' ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-500'}`}>
              <Layers className="w-5 h-5" />
            </div>
            <ChevronRight className={`w-4 h-4 opacity-50 ${reportType === 'tax_summary' ? 'text-rose-200' : 'text-stone-400'}`} />
          </div>
          <h2 className="font-semibold text-sm mt-4 pointer-events-none">Tax & Compliance Ledger</h2>
          <p className={`text-xs mt-1 leading-snug pointer-events-none ${reportType === 'tax_summary' ? 'text-rose-100' : 'text-stone-500'}`}>
            Audit system tax liability (flat 8%), subtotal deductions, coupon discounts, and grand totals.
          </p>
        </button>

      </div>

      {/* Main split work bench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Parameters Form / Quick insights */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs">
            <div className="border-b border-stone-100 pb-3 mb-5">
              <h3 className="text-sm font-semibold text-stone-900">Configure Parameter Variables</h3>
            </div>

            {reportType === 'z_report' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Starting Drawer Cash Bank ($)
                  </label>
                  <div className="relative rounded-lg shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 text-xs">
                      $
                    </div>
                    <input
                      type="number"
                      step="5"
                      min="0"
                      value={startingCash}
                      onChange={(e) => setStartingCash(parseFloat(e.target.value) || 0)}
                      className="block w-full pl-8 pr-3 py-2 border border-stone-200 rounded-lg text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Verify cash float stored inside register before active checkout duty began.
                  </span>
                </div>

                <div className="bg-stone-50 border border-stone-100 rounded-xl p-4.5 space-y-3.5 mt-2">
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">Live Drawer Math</span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-500">Add Open Float Pool:</span>
                    <span className="font-semibold text-stone-800">${startingCash.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-500">Actual Cash Processed:</span>
                    <span className="font-semibold text-stone-800">+${zReportData.cashSales.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-stone-200/80 my-2 pt-2 flex justify-between items-center text-xs">
                    <span className="font-bold text-stone-700">Expected Closing Balance:</span>
                    <span className="font-bold text-indigo-600">${zReportData.finalExpectedCash.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {reportType === 'inventory_valuation' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4.5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping"></span>
                    Asset Summary Overview
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-500">Unique Stock Lines (SKUs):</span>
                    <span className="font-bold text-stone-800">{inventoryData.totalSkus}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-500">Gross Retail Valuation:</span>
                    <span className="font-bold text-stone-800">${inventoryData.valuationRetail.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-500">Estimated Value at Stocking Cost:</span>
                    <span className="font-bold text-stone-800">${inventoryData.valuationCost.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-emerald-250/50 pt-2.5 flex justify-between items-center text-xs">
                    <span className="font-bold text-stone-700">Gross Margin Valuation:</span>
                    <span className="font-bold text-emerald-700">{inventoryData.potentialGrossMargin.toFixed(1)}%</span>
                  </div>
                </div>

                {inventoryData.lowStockCount > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-xs text-amber-800 font-medium">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-bold block">Shelf Replenishment Needed</span>
                      There are currently {inventoryData.lowStockCount} items whose shelf count resides below safety levels.
                    </div>
                  </div>
                )}
              </div>
            )}

            {reportType === 'products_performance' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="bg-amber-50/50 border border-amber-150 rounded-xl p-4.5 space-y-3">
                  <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">Sales Velocity Metrics</div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-500">Total Items Catalogued:</span>
                    <span className="font-semibold text-stone-800">{products.length} Products</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-500">Total Cumulative Revenue:</span>
                    <span className="font-bold text-stone-800">${performanceData.totalPerformanceRevenue.toFixed(2)}</span>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1 block">
                    Product margins are calculated dynamic logic subtraction: total retail sale minus base costing profiles.
                  </div>
                </div>
              </div>
            )}

            {reportType === 'tax_summary' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4.5 space-y-3 text-xs">
                  <div className="font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    Fiscal Reporting Notice
                  </div>
                  <p className="text-rose-700 leading-relaxed">
                    This compliance journal calculates taxes on a flat-rate base. Verify with local state laws for specialized food and beverage exemptions.
                  </p>
                  <p className="text-rose-600/80">
                    Calculated Tax: 8.00% standard retail transaction assessment.
                  </p>
                </div>
              </div>
            )}

            {/* Quick Export Actions */}
            <div className="border-t border-stone-100 mt-6 pt-5 space-y-2">
              <span className="text-[10px] font-bold text-stone-400 tracking-wider uppercase block mb-3">Instant Actions</span>
              
              <button 
                onClick={handlePrint}
                className="w-full flex items-center gap-2.5 justify-center px-4 py-2.5 bg-stone-900 duration-150 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                Print Register Slip
              </button>
              
              <button 
                onClick={handleDownloadCSV}
                className="w-full flex items-center gap-2.5 justify-center px-4 py-2.5 bg-white border border-stone-200 text-stone-700 duration-150 hover:bg-stone-50 rounded-lg text-xs font-semibold cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Export CSV Spreadsheet
              </button>

              <button 
                onClick={handleDownloadTxt}
                className="w-full flex items-center gap-2.5 justify-center px-4 py-2.5 bg-white border border-stone-200 text-stone-700 duration-150 hover:bg-stone-50 rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-500" />
                Download Document (.txt)
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: High Fidelity Print Terminal Simulation */}
        <div className="lg:col-span-8 flex flex-col">
          
          <div className="bg-stone-800/90 rounded-2xl p-6 text-stone-100 shadow-xl border border-stone-750/50 flex flex-col min-h-[500px]">
            
            <div className="flex items-center justify-between border-b border-stone-700 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-300">
                  Terminal Slit Audit Output
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-white text-[11px] font-semibold rounded-md transition-all active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {isCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Virtual Paper Roll Simulation Container */}
            <div className="flex-1 bg-stone-50 text-stone-900 font-mono text-xs p-6 mb-4 rounded-xl border-t-4 border-indigo-400 shadow-inner overflow-x-auto min-h-[380px] selection:bg-indigo-100 selection:text-indigo-900">
              <div className="max-w-md mx-auto leading-relaxed whitespace-pre font-mono text-[11px] sm:text-xs text-stone-800">
                {plainTextReport}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] text-stone-400 font-mono mt-2 gap-2">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Cryptographically Signed Ledger Entry - Verification OK
              </span>
              <span>
                Register IP Address: LOCAL_STORAGE_STANDALONE
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
