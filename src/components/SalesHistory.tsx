import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Eye, 
  Receipt, 
  CornerDownRight, 
  RefreshCcw, 
  Calculator, 
  HandCoins, 
  ShieldAlert,
  Info,
  Layers,
  ChevronRight,
  Sparkles,
  Percent,
  X,
  Printer,
  Download
} from 'lucide-react';
import { SaleTransaction, TransactionItem, Employee } from '../types';

interface SalesHistoryProps {
  transactions: SaleTransaction[];
  onRefundTransaction: (transactionId: string) => void;
  employees?: Employee[];
  setTransactions?: React.Dispatch<React.SetStateAction<SaleTransaction[]>>;
}

export default function SalesHistory({
  transactions,
  onRefundTransaction,
  employees = [],
  setTransactions
}: SalesHistoryProps) {
  const [searchInvoice, setSearchInvoice] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  
  // Modal for receipt display
  const [selectedReceipt, setSelectedReceipt] = useState<SaleTransaction | null>(null);

  // States for cashier retroactive assignment
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [newEmployeeIdForTx, setNewEmployeeIdForTx] = useState<string>('');
  const [customEmployeeIdForTx, setCustomEmployeeIdForTx] = useState<string>('');

  const handleUpdateTxEmployee = (txId: string) => {
    let resolvedId = '';
    let resolvedName = '';

    if (newEmployeeIdForTx && newEmployeeIdForTx !== 'custom') {
      resolvedId = newEmployeeIdForTx;
      const emp = employees.find(e => e.id === newEmployeeIdForTx);
      resolvedName = emp ? emp.name : `Cashier ${resolvedId}`;
    } else if (customEmployeeIdForTx.trim()) {
      resolvedId = customEmployeeIdForTx.trim().toUpperCase();
      const emp = employees.find(e => e.id === resolvedId);
      resolvedName = emp ? emp.name : `Cashier ${resolvedId}`;
    }

    if (!resolvedId) {
      alert('Please select or specify a valid Employee ID.');
      return;
    }

    if (setTransactions) {
      setTransactions(prev => prev.map(t => {
        if (t.id === txId) {
          return {
            ...t,
            employeeId: resolvedId,
            employeeName: resolvedName
          };
        }
        return t;
      }));
    }

    setEditingTxId(null);
    setNewEmployeeIdForTx('');
    setCustomEmployeeIdForTx('');
  };

  // Filter computations
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchInvoice = t.invoiceNo.toLowerCase().includes(searchInvoice.toLowerCase()) ||
                           t.items.some(item => item.name.toLowerCase().includes(searchInvoice.toLowerCase()));
      const matchPayment = paymentFilter === 'All' || t.paymentMethod === paymentFilter;
      return matchInvoice && matchPayment;
    });
  }, [transactions, searchInvoice, paymentFilter]);

  // Aggregate metrics across active filters
  const salesAggregate = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      acc.revenue += t.totalAmount;
      acc.netProfit += t.profitAmount;
      acc.discounts += t.discountAmount;
      acc.taxes += t.taxAmount;
      acc._orders += 1;
      return acc;
    }, { revenue: 0, netProfit: 0, discounts: 0, taxes: 0, _orders: 0 });
  }, [filteredTransactions]);

  // Print simulation trigger
  const handlePrintReceipt = (invoice: SaleTransaction) => {
    alert(`Rerouting Print Spooler to duplicate invoice: ${invoice.invoiceNo}\nPrint Spooler active.`);
  };

  return (
    <div className="p-4 md:p-6 bg-slate-50/50 min-h-[calc(100vh-5rem)] space-y-6">
      
      {/* Search and Filters Strip */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input Filter */}
        <div className="w-full md:max-w-xs relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="invoice-search-input"
            type="text"
            placeholder="Search invoice numbers or items..."
            value={searchInvoice}
            onChange={(e) => setSearchInvoice(e.target.value)}
            className="w-full text-xs bg-stone-50 text-stone-900 placeholder-stone-400 pl-9 pr-4 py-2.5 rounded-lg border border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
          />
        </div>

        {/* Payment Select Pill Buttons */}
        <div className="flex gap-1.5 overflow-x-auto self-start md:self-center">
          {['All', 'Cash', 'Card', 'Mobile Pay'].map((meth) => (
            <button
              key={meth}
              id={`history-filter-${meth.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setPaymentFilter(meth)}
              className={`text-[11px] font-bold px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                paymentFilter === meth
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {meth}
            </button>
          ))}
        </div>
      </div>

      {/* Aggregate metrics box */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="sales-history-metrics">
        
        {/* Revenue */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Selected Revenue</span>
          <h4 className="text-xl font-mono font-extrabold text-stone-900 mt-1.5" id="history-total-revenue">
            ${salesAggregate.revenue.toFixed(2)}
          </h4>
          <span className="text-[10px] text-indigo-600 font-medium mt-1 block">Filtered Receipts: {salesAggregate._orders}</span>
        </div>

        {/* Net Profit */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Net profit margins</span>
          <h4 className="text-xl font-mono font-extrabold text-emerald-600 mt-1.5" id="history-total-profit">
            ${salesAggregate.netProfit.toFixed(2)}
          </h4>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 block">
            Avg: {salesAggregate._orders > 0 ? `${(salesAggregate.netProfit / salesAggregate._orders).toFixed(2)}/tx` : '$0'}
          </span>
        </div>

        {/* Discounts pool */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Discounts code cost</span>
          <h4 className="text-xl font-mono font-extrabold text-amber-600 mt-1.5">
            -${salesAggregate.discounts.toFixed(2)}
          </h4>
          <span className="text-[10px] text-amber-600 font-medium mt-1 block">Promotional campaigns</span>
        </div>

        {/* Taxes pool */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Collected Sales Tax</span>
          <h4 className="text-xl font-mono font-extrabold text-indigo-600 mt-1.5">
            ${salesAggregate.taxes.toFixed(2)}
          </h4>
          <span className="text-[10px] text-indigo-500 font-medium mt-1 block">Allocated to 8% Treasury</span>
        </div>

      </div>

      {/* Main Transactions Audit list */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="sales-history-table">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold text-stone-400 tracking-wider uppercase">
                <th className="py-4 px-6">Invoice Identifier</th>
                <th className="py-4 px-4">Completion Date</th>
                <th className="py-4 px-4">Sold Items list</th>
                <th className="py-4 px-4">Responsible Server</th>
                <th className="py-4 px-4 text-center">Tender Type</th>
                <th className="py-4 px-4 text-right">Deducted Promo</th>
                <th className="py-4 px-4 text-right">Bill Total</th>
                <th className="py-4 px-6 text-center">Audit controls</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-stone-100 text-xs text-stone-600">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    No matching sales records located inside our active database.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const itemsCount = tx.items.reduce((s, i) => s + i.quantity, 0);
                  return (
                    <tr 
                      key={tx.id} 
                      id={`tx-row-${tx.id}`}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {/* Invoice Identifier */}
                      <td className="py-3 px-6 font-mono font-bold text-stone-800">
                        {tx.invoiceNo}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-stone-500">
                        {tx.timestamp}
                      </td>

                      {/* Sold items hover layout trigger or snippet */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex flex-col gap-0.5">
                          <p className="font-bold text-stone-700 truncate">
                            {tx.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                          </p>
                          <span className="text-[10px] text-stone-400">{itemsCount} units total</span>
                        </div>
                      </td>

                      {/* Cashier Assignment */}
                      <td className="py-3 px-4 relative">
                        {tx.employeeId ? (
                          <div className="flex items-center gap-1.5 justify-between">
                            <div>
                              <span className="font-bold text-stone-800">{tx.employeeName || 'Assigned'}</span>
                              <span className="text-[9px] text-stone-400 font-mono block">ID: {tx.employeeId}</span>
                            </div>
                            <button
                              id={`reassign-btn-${tx.id}`}
                              onClick={() => {
                                setEditingTxId(editingTxId === tx.id ? null : tx.id);
                                setNewEmployeeIdForTx('');
                                setCustomEmployeeIdForTx('');
                              }}
                              className="text-stone-400 hover:text-indigo-600 bg-stone-50 hover:bg-stone-100 p-1 rounded-md transition-colors text-[10px] border border-stone-200 cursor-pointer"
                              title="Re-assign cashier"
                            >
                              Edit
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 justify-between">
                            <span className="text-stone-400 italic">Unassigned</span>
                            <button
                              id={`assign-btn-${tx.id}`}
                              onClick={() => {
                                setEditingTxId(editingTxId === tx.id ? null : tx.id);
                                setNewEmployeeIdForTx('');
                                setCustomEmployeeIdForTx('');
                              }}
                              className="bg-indigo-50 hover:bg-slate-100 text-indigo-700 border border-indigo-200 text-[10px] px-1.5 py-1 rounded-md font-bold cursor-pointer"
                            >
                              + Assign
                            </button>
                          </div>
                        )}

                        {editingTxId === tx.id && (
                          <div className="absolute top-full left-0 bg-white border border-stone-200 shadow-xl rounded-xl p-3.5 z-40 mt-1 w-48 flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-1">
                            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Associate Server</span>
                            
                            {employees && employees.length > 0 ? (
                              <select
                                id={`assign-select-${tx.id}`}
                                value={newEmployeeIdForTx}
                                onChange={(e) => setNewEmployeeIdForTx(e.target.value)}
                                className="text-[11px] p-1.5 bg-stone-50 border border-stone-200 rounded font-medium focus:ring-1 focus:ring-indigo-500 text-stone-800"
                              >
                                <option value="">-- Choose Staff --</option>
                                {employees.map(e => (
                                  <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                                ))}
                                <option value="custom">-- Custom manually --</option>
                              </select>
                            ) : null}

                            {(!employees || employees.length === 0 || newEmployeeIdForTx === 'custom') && (
                              <input
                                id={`assign-input-${tx.id}`}
                                type="text"
                                placeholder="Enter Employee ID..."
                                value={customEmployeeIdForTx}
                                onChange={(e) => setCustomEmployeeIdForTx(e.target.value)}
                                className="text-[11px] p-1.5 border border-stone-200 rounded font-bold uppercase focus:ring-1 focus:ring-indigo-500 text-stone-900"
                              />
                            )}

                            <div className="flex gap-1.5 justify-end pt-1">
                              <button
                                id={`assign-cancel-${tx.id}`}
                                onClick={() => setEditingTxId(null)}
                                className="text-[9px] text-stone-500 hover:bg-stone-50 px-2 py-1 border border-stone-200 rounded-md font-semibold cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                id={`assign-save-${tx.id}`}
                                onClick={() => handleUpdateTxEmployee(tx.id)}
                                className="text-[9px] bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-md font-extrabold cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Tender selection */}
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.paymentMethod === 'Cash' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          tx.paymentMethod === 'Card' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-violet-50 text-violet-700 border border-violet-100'
                        }`}>
                          {tx.paymentMethod}
                        </span>
                      </td>

                      {/* Promo savings */}
                      <td className="py-3 px-4 text-right">
                        {tx.discountAmount > 0 ? (
                          <div className="text-emerald-600 font-bold">
                            -${tx.discountAmount.toFixed(2)}
                            <div className="text-[9px] text-stone-400 font-mono font-medium">{tx.discountCode}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400">-</span>
                        )}
                      </td>

                      {/* Total and profits */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-mono font-extrabold text-stone-900">${tx.totalAmount.toFixed(2)}</div>
                        <div className="text-[9px] text-emerald-600 font-bold mt-0.5">+${tx.profitAmount.toFixed(2)} net</div>
                      </td>

                      {/* Audit functions */}
                      <td className="py-3 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            id={`view-rec-btn-${tx.id}`}
                            onClick={() => setSelectedReceipt(tx)}
                            className="text-stone-500 hover:text-indigo-600 border border-stone-200 hover:border-indigo-500 bg-white p-1.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                            title="Load receipt print model"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Invoice</span>
                          </button>

                          <button
                            id={`refund-tx-btn-${tx.id}`}
                            onClick={() => {
                              if (confirm(`CRITICAL WARNING: Reversing invoice ${tx.invoiceNo} will VOID sales value and RESTORE all item quantities (${itemsCount} units) back into live inventory. Proceed?`)) {
                                onRefundTransaction(tx.id);
                              }
                            }}
                            className="text-stone-400 hover:text-rose-600 border border-stone-200 hover:border-rose-400 bg-white p-1.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                            title="Refund & Void sale"
                          >
                            <RefreshCcw className="w-3.5 h-3.5" />
                            <span>Void</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED RECEIPT DIALOG VIEW MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-55 overflow-y-auto">
          {/* Backdrop screen closer click handler */}
          <div className="fixed inset-0" onClick={() => setSelectedReceipt(null)} />
          
          <div 
            id="receipt-history-modal"
            className="relative bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-stone-200 z-60 animate-in zoom-in duration-150"
          >
            {/* Modal header */}
            <div className="bg-indigo-600 text-white p-4 text-center">
              <h3 className="font-extrabold text-sm uppercase tracking-wider">DUPLICATE AUDIT LAYOUT</h3>
              <p className="text-[10px] text-indigo-100 font-mono mt-0.5">Verified Invoice: {selectedReceipt.invoiceNo}</p>
            </div>

            {/* Receipt details */}
            <div className="p-6 bg-stone-50 border-b border-dashed border-stone-200">
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs text-stone-700 text-xs font-mono select-text leading-relaxed">
                <div className="text-center font-sans space-y-1 pb-3 border-b border-stone-100 italic">
                  <h4 className="font-extrabold text-sm text-stone-900 font-mono not-italic uppercase tracking-wider">
                    Notus Terminal Kit
                  </h4>
                  <p className="text-[10px] text-stone-500">123 Corporate Blvd, Ste 400</p>
                  <p className="text-[10px] text-stone-500">Tel: (555) 019-2834</p>
                  <p className="text-[10px] text-indigo-600 font-semibold uppercase font-sans not-italic text-xs mt-1">DUPLICATE RECEIPT COPY</p>
                </div>

                <div className="space-y-0.5 border-b border-stone-100 py-3 text-[10px] text-stone-500">
                  <div className="flex justify-between"><span>DATE / TIME:</span><span>{selectedReceipt.timestamp}</span></div>
                  <div className="flex justify-between"><span>INVOICE NO:</span><span className="font-bold text-stone-800">{selectedReceipt.invoiceNo}</span></div>
                  <div className="flex justify-between"><span>DUTY CLERK:</span><span>{selectedReceipt.employeeName ? `${selectedReceipt.employeeName} (${selectedReceipt.employeeId})` : 'SYSTEM OPERATOR'}</span></div>
                  <div className="flex justify-between"><span>PAY TYPE:</span><span>{selectedReceipt.paymentMethod}</span></div>
                </div>

                <div className="py-3 border-b border-stone-100 text-[11px] space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-stone-400">
                    <span>ITEM CATALOG DESCR.</span>
                    <span>TOTAL</span>
                  </div>
                  {selectedReceipt.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div className="break-words max-w-[180px]">
                        <span>{item.name}</span>
                        <div className="text-[10px] text-stone-400">
                          {item.quantity} x ${item.price.toFixed(2)}
                        </div>
                      </div>
                      <span className="font-bold">${item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 pt-3 text-[11px] text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${selectedReceipt.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedReceipt.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount ({selectedReceipt.discountCode}):</span>
                      <span>-${selectedReceipt.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Sales Tax (8%):</span>
                    <span>${selectedReceipt.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-stone-950 font-bold border-t border-stone-100 pt-2 font-sans">
                    <span>Grand Total Paid:</span>
                    <span>${selectedReceipt.totalAmount.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-dotted border-stone-200 pt-2 space-y-1 text-[10.5px]">
                    <div className="flex justify-between">
                      <span>Tender Amount Given:</span>
                      <span>${(selectedReceipt.cashReceived || selectedReceipt.totalAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Change Disbursed:</span>
                      <span>${(selectedReceipt.changeDue || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-stone-100 flex gap-2">
              <button
                id="receipt-print-btn-dup"
                onClick={() => handlePrintReceipt(selectedReceipt)}
                className="flex-1 bg-white hover:bg-stone-200 border border-stone-300 text-stone-700 text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Copy
              </button>
              
              <button
                id="receipt-close-btn-dup"
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold py-2.5 px-4.5 rounded-lg transition-colors cursor-pointer text-center"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
