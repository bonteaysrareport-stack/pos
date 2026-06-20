import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Users, 
  UserCheck, 
  UserX, 
  Plus, 
  Search, 
  TrendingUp, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  CheckCircle2, 
  Award,
  BookOpen
} from 'lucide-react';
import { Employee, EmployeeShift, SaleTransaction } from '../types';

interface EmployeeShiftsProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  shifts: EmployeeShift[];
  setShifts: React.Dispatch<React.SetStateAction<EmployeeShift[]>>;
  transactions: SaleTransaction[];
  dispatchNotification: (text: string, type: 'info' | 'warning' | 'success') => void;
}

export default function EmployeeShifts({
  employees,
  setEmployees,
  shifts,
  setShifts,
  transactions,
  dispatchNotification
}: EmployeeShiftsProps) {
  // Navigation / Tabs within Employee module
  const [shiftsTab, setShiftsTab] = useState<'duty' | 'history' | 'employees'>('duty');
  
  // Search state
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');

  // Add Employee Form States
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [newEmpId, setNewEmpId] = useState('');
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('Cashier');

  // Manual Check in states
  const [selectedEmpId, setSelectedEmpId] = useState('');

  // Shift Statistics calculations
  const stats = useMemo(() => {
    const activeShifts = shifts.filter(s => !s.checkOutTime);
    const completedShifts = shifts.filter(s => !!s.checkOutTime);
    
    // total volume processed
    const totalVolume = shifts.reduce((sum, s) => sum + s.salesVolume, 0);
    const totalSalesCount = shifts.reduce((sum, s) => sum + s.salesCount, 0);

    return {
      activeCount: activeShifts.length,
      completedCount: completedShifts.length,
      totalVolume,
      totalSalesCount
    };
  }, [shifts]);

  // Handle Add Employee
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpId.trim() || !newEmpName.trim()) {
      dispatchNotification('Please enter a valid Employee ID and Name.', 'warning');
      return;
    }

    const cleanId = newEmpId.trim().toUpperCase();
    if (employees.some(emp => emp.id === cleanId)) {
      dispatchNotification(`Employee with ID ${cleanId} already exists!`, 'warning');
      return;
    }

    const newEmp: Employee = {
      id: cleanId,
      name: newEmpName.trim(),
      role: newEmpRole,
      status: 'Active'
    };

    setEmployees(prev => [...prev, newEmp]);
    setNewEmpId('');
    setNewEmpName('');
    setIsAddEmployeeOpen(false);
    dispatchNotification(`Registered new employee: ${newEmp.name} (${cleanId})`, 'success');
  };

  // Delete Employee (if not busy on shift)
  const handleDeleteEmployee = (empId: string) => {
    const isActiveOnShift = shifts.some(s => s.employeeId === empId && !s.checkOutTime);
    if (isActiveOnShift) {
      dispatchNotification('Cannot remove employee with an active shift session!', 'warning');
      return;
    }

    const emp = employees.find(e => e.id === empId);
    setEmployees(prev => prev.filter(e => e.id !== empId));
    if (emp) {
      dispatchNotification(`Removed employee: ${emp.name}`, 'info');
    }
  };

  // Clock In Employee
  const handleClockIn = (empId: string) => {
    if (!empId) {
      dispatchNotification('Please specify an Employee ID.', 'warning');
      return;
    }

    const employee = employees.find(e => e.id === empId);
    if (!employee) {
      dispatchNotification(`Employee ID "${empId}" not registered in database.`, 'warning');
      return;
    }

    if (employee.status === 'Inactive') {
      dispatchNotification(`Employee ${employee.name} is currently inactive.`, 'warning');
      return;
    }

    // Check if already clocked in
    const isClockedIn = shifts.some(s => s.employeeId === empId && !s.checkOutTime);
    if (isClockedIn) {
      dispatchNotification(`Employee ${employee.name} is already clocked in!`, 'warning');
      return;
    }

    const newShift: EmployeeShift = {
      id: `shift-${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      checkInTime: new Date().toISOString(),
      salesCount: 0,
      salesVolume: 0
    };

    setShifts(prev => [newShift, ...prev]);
    setSelectedEmpId('');
    dispatchNotification(`Duty Clock-In: ${employee.name} (${employee.id}) checked in successfully!`, 'success');
  };

  // Clock Out Employee
  const handleClockOut = (shiftId: string) => {
    const shiftIndex = shifts.findIndex(s => s.id === shiftId);
    if (shiftIndex === -1) return;

    const targetShift = shifts[shiftIndex];
    
    // Calculate final stats on shift checkout
    // Find all transactions made by this employee ID between checkInTime and now
    const associatedTx = transactions.filter(tx => {
      if (tx.employeeId !== targetShift.employeeId) return false;
      const txTime = new Date(tx.timestamp).getTime();
      const checkInTime = new Date(targetShift.checkInTime).getTime();
      return txTime >= checkInTime;
    });

    const salesCount = associatedTx.length;
    const salesVolume = associatedTx.reduce((sum, t) => sum + t.totalAmount, 0);

    setShifts(prev => prev.map(s => {
      if (s.id === shiftId) {
        return {
          ...s,
          checkOutTime: new Date().toISOString(),
          salesCount,
          salesVolume
        };
      }
      return s;
    }));

    dispatchNotification(`Duty Clock-Out: ${targetShift.employeeName} completed session. Total sales: $${salesVolume.toFixed(2)} (${salesCount} orders)`, 'info');
  };

  // Format Elapsed Hours of closed or open shifts
  const getElapsedHours = (checkIn: string, checkOut?: string) => {
    const start = new Date(checkIn).getTime();
    const end = checkOut ? new Date(checkOut).getTime() : Date.now();
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 0.1) {
      const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      return `${minutes}m`;
    }
    return `${diffHours.toFixed(1)}h`;
  };

  // Filter lists
  const filteredEmployeesList = useMemo(() => {
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) || 
      emp.id.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.role.toLowerCase().includes(employeeSearch.toLowerCase())
    );
  }, [employees, employeeSearch]);

  const filteredHistoryList = useMemo(() => {
    return shifts.filter(sh => 
      sh.employeeName.toLowerCase().includes(historySearch.toLowerCase()) ||
      sh.employeeId.toLowerCase().includes(historySearch.toLowerCase())
    );
  }, [shifts, historySearch]);

  const clockInCandidates = useMemo(() => {
    return employees.filter(emp => 
      emp.status === 'Active' && 
      !shifts.some(s => s.employeeId === emp.id && !s.checkOutTime)
    );
  }, [employees, shifts]);

  const liveOnDutyShifts = useMemo(() => {
    return shifts.filter(s => !s.checkOutTime).map(s => {
      // Calculate real-time sales made by this employee ID during this active shift
      const activeSales = transactions.filter(tx => {
        if (tx.employeeId !== s.employeeId) return false;
        const txTime = new Date(tx.timestamp).getTime();
        const checkInTime = new Date(s.checkInTime).getTime();
        return txTime >= checkInTime;
      });
      return {
        ...s,
        salesCount: activeSales.length,
        salesVolume: activeSales.reduce((sum, tx) => sum + tx.totalAmount, 0)
      };
    });
  }, [shifts, transactions]);

  return (
    <div className="space-y-6 p-4 md:p-6" id="employee-shifts-panel">
      {/* Modally header & stats */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight font-sans uppercase">
            Employee Shifts & Duty Logs
          </h2>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Clock in/out shifts, register staff profiles, and audit individual transaction bookkeeping records.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="bg-stone-200/60 border border-stone-200 rounded-xl p-1 flex items-center gap-1 sm:self-center">
          <button
            onClick={() => setShiftsTab('duty')}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              shiftsTab === 'duty' 
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Duty Desk
          </button>
          <button
            onClick={() => setShiftsTab('history')}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              shiftsTab === 'history' 
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Shift Audit History
          </button>
          <button
            onClick={() => setShiftsTab('employees')}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              shiftsTab === 'employees' 
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Staff Registry
          </button>
        </div>
      </div>

      {/* Stats Cards Dashboard Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-3xs flex items-center gap-4">
          <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Currently On Duty</span>
            <span className="text-xl font-black text-stone-900 font-mono">{stats.activeCount}</span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-3xs flex items-center gap-4">
          <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Total Shifts Completed</span>
            <span className="text-xl font-black text-stone-900 font-mono">{stats.completedCount}</span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-3xs flex items-center gap-4">
          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Shift Audit Orders</span>
            <span className="text-xl font-black text-stone-900 font-mono">{stats.totalSalesCount}</span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-3xs flex items-center gap-4">
          <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600 border border-rose-100">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Shift Revenue Flow</span>
            <span className="text-xl font-black text-stone-900 font-mono">${stats.totalVolume.toLocaleString([], {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
        </div>
      </div>

      {/* Main Content Sections based on tabs */}
      {shiftsTab === 'duty' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Quick Check-In Station Box */}
          <div className="lg:col-span-4 bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col space-y-4">
            <div>
              <h3 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Clock-In Station
              </h3>
              <p className="text-[10px] text-stone-400 mt-1">
                Select an active employee profile from the staff register database to initiate their live duty shift.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="clockin-selection" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">
                  Select Registered Staff
                </label>
                {clockInCandidates.length === 0 ? (
                  <div className="text-center py-4 bg-stone-50 border border-dashed border-stone-200 rounded-xl">
                    <p className="text-[11px] text-stone-500 font-medium">All active staff are currently clocked in</p>
                  </div>
                ) : (
                  <select
                    id="clockin-selection"
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    className="w-full text-xs bg-stone-50 text-stone-900 border border-stone-200 p-2.5 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-semibold cursor-pointer"
                  >
                    <option value="">-- Choose Employee Profile --</option>
                    {clockInCandidates.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.id}) — {emp.role}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <button
                onClick={() => handleClockIn(selectedEmpId)}
                disabled={!selectedEmpId}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
              >
                <UserCheck className="w-4 h-4" />
                Initiate Live Shift
              </button>
            </div>

            {/* Quick Helper Pin Badge / info */}
            <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 flex gap-2.5">
              <BookOpen className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                Once checked-in here, the employee's ID will become available at the POS Terminal as a "Responsible Cashier" for new checkout bookings.
              </p>
            </div>
          </div>

          {/* Clocked In Active Personnel Register */}
          <div className="lg:col-span-8 bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col space-y-4">
            <div>
              <h3 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Duty Session Monitors
              </h3>
              <p className="text-[10px] text-stone-400 mt-1">
                Real-time snapshot showing who is on shift, elapsed duty timers, and associated transaction performance tags.
              </p>
            </div>

            {liveOnDutyShifts.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                <UserX className="w-8 h-8 text-stone-300 mx-auto mb-2.5" />
                <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">No Active Sessions</p>
                <p className="text-[10px] text-stone-400 max-w-xs mx-auto mt-1">
                  Start an employee shift using the Clock-In desk on the left to activate transaction accountability tracking.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveOnDutyShifts.map(s => {
                  const emp = employees.find(e => e.id === s.employeeId);
                  return (
                    <div 
                      key={s.id} 
                      className="border border-stone-200/80 hover:border-indigo-200/80 rounded-2xl p-4 bg-stone-50/20 shadow-3xs flex flex-col justify-between space-y-3.5 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs shadow-3xs">
                            {s.employeeName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-stone-900 tracking-tight leading-none">
                              {s.employeeName}
                            </h4>
                            <span className="text-[9px] text-stone-500 font-mono mt-0.5 block font-semibold correlation">
                              ID: {s.employeeId} • {emp?.role || 'Staff'}
                            </span>
                          </div>
                        </div>

                        {/* Duty Timer badge */}
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-100/50 text-[10px] px-2.5 py-1 rounded-lg font-bold font-mono flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3 text-indigo-500 animate-spin-slow" />
                          {getElapsedHours(s.checkInTime)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-stone-100/50 p-2.5 rounded-xl border border-stone-105">
                        <div className="text-center">
                          <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wide block">Orders Ringed</span>
                          <span className="text-xs font-black text-stone-800 font-mono">{s.salesCount}</span>
                        </div>
                        <div className="text-center border-l border-stone-200">
                          <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wide block">Shift Revenue</span>
                          <span className="text-xs font-black text-stone-800 font-mono">${s.salesVolume.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-stone-500">
                        <span className="text-[10px]">Since {new Date(s.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <button
                          onClick={() => handleClockOut(s.id)}
                          className="bg-stone-800 hover:bg-stone-900 text-white font-extrabold text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors uppercase tracking-wider cursor-pointer"
                        >
                          <UserCheck className="w-3 h-3" />
                          Clock-Out End
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {shiftsTab === 'history' && (
        <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden flex flex-col p-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
              <h3 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Shift Audit Log Archive
              </h3>
              <p className="text-[10px] text-stone-400 mt-1">
                Auditor database of all completed sessions, logs of clock-in/out stamps, productivity KPIs and revenue volume accountability.
              </p>
            </div>

            {/* Shift Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search shift by Employee ID or Name..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2.5 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-medium"
              />
            </div>
          </div>

          {filteredHistoryList.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
              <Clock className="w-8 h-8 text-stone-300 mx-auto mb-2.5" />
              <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">No Archive Logs Found</p>
              <p className="text-[10px] text-stone-400 max-w-sm mx-auto mt-1">
                Once employees Clock Out of their shifts, their audited duration and checkout summaries will post directly into this compliance directory.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Clocked In Stamp</th>
                    <th className="py-3 px-4">Clocked Out Stamp</th>
                    <th className="py-3 px-4">Duty Duration</th>
                    <th className="py-3 px-4 text-right">Transactions</th>
                    <th className="py-3 px-4 text-right">Total Revenue Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {filteredHistoryList.map(sh => (
                    <tr 
                      key={sh.id} 
                      className={`hover:bg-stone-50/50 ${!sh.checkOutTime ? 'bg-indigo-50/20 font-semibold' : ''}`}
                    >
                      <td className="py-3.5 px-4 font-bold text-stone-800">
                        <div>
                          <span>{sh.employeeName}</span>
                          <span className="text-[9px] text-stone-400 font-mono block">ID: {sh.employeeId}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 font-mono">
                        {new Date(sh.checkInTime).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 font-mono">
                        {sh.checkOutTime ? new Date(sh.checkOutTime).toLocaleString() : (
                          <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                            ACTIVE NOW
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-700">
                        {getElapsedHours(sh.checkInTime, sh.checkOutTime)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-850">
                        {sh.salesCount} orders
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-indigo-700">
                        ${sh.salesVolume.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {shiftsTab === 'employees' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Quick Registry Form Drawer */}
          <div className="lg:col-span-4 bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col space-y-4">
            <div>
              <h3 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                Register New Clerk Profile
              </h3>
              <p className="text-[10px] text-stone-400 mt-1">
                Provision a unique Employee ID credential to enforce sales bookkeeping audits.
              </p>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-3">
              <div>
                <label htmlFor="reg-emp-id" className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  Employee ID Code *
                </label>
                <input
                  type="text"
                  id="reg-emp-id"
                  required
                  placeholder="e.g. EMP005"
                  value={newEmpId}
                  onChange={(e) => setNewEmpId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label htmlFor="reg-emp-name" className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="reg-emp-name"
                  required
                  placeholder="e.g. Alice Vance"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-semibold"
                />
              </div>

              <div>
                <label htmlFor="reg-emp-role" className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  Job Role Position
                </label>
                <select
                  id="reg-emp-role"
                  value={newEmpRole}
                  onChange={(e) => setNewEmpRole(e.target.value)}
                  className="w-full text-xs bg-stone-50 text-stone-900 border border-stone-200 p-2.5 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-semibold cursor-pointer"
                >
                  <option value="Cashier">Cashier Registry</option>
                  <option value="Barista / Clerk">Barista / Clerk</option>
                  <option value="Store Manager">Store Manager</option>
                  <option value="Accounts Auditor">Accounts Auditor</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                Register to Database
              </button>
            </form>
          </div>

          {/* Core Staff Directory Card */}
          <div className="lg:col-span-8 bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div>
                <h3 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Staff Database Registry
                </h3>
                <p className="text-[10px] text-stone-400 mt-1">
                  Manage active credentials on file in the terminal authorization subsystem.
                </p>
              </div>

              <div className="relative w-full md:w-60">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Filter personnel..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-medium"
                />
              </div>
            </div>

            {filteredEmployeesList.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                <Users className="w-8 h-8 text-stone-300 mx-auto mb-2.5" />
                <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">No matching staff found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEmployeesList.map(emp => {
                  const shiftStatus = shifts.find(s => s.employeeId === emp.id && !s.checkOutTime);
                  return (
                    <div 
                      key={emp.id} 
                      className="border border-stone-200 hover:border-stone-300 rounded-2xl p-4 bg-stone-50/10 shadow-3xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-600 text-xs">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-stone-900 tracking-tight leading-none flex items-center gap-1.5">
                            {emp.name}
                            {shiftStatus && (
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="On Shift Duty"></span>
                            )}
                          </h4>
                          <span className="text-[9px] text-stone-500 font-mono mt-0.5 block font-semibold">
                            ID: {emp.id} • {emp.role}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {shiftStatus ? (
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold uppercase px-2 py-1 rounded-md border border-emerald-100">
                            ON DUTY
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDeleteEmployee(emp.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-neutral-50 transition-colors cursor-pointer"
                            title="Remove profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
