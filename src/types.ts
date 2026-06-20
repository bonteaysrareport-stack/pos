export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number; // For net profit calculations
  stock: number;
  category: string;
  categories: string[]; // List of categories for multi-category sorting & filtering
  icon: string; // Lucide icon identifier or emoji representation
  color: string; // Tailwind color class modifier (e.g., 'blue', 'orange')
  threshold: number; // Minimum stock before trigger low-stock warning
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface TransactionItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface SaleTransaction {
  id: string;
  invoiceNo: string;
  timestamp: string;
  items: TransactionItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  discountCode: string;
  taxAmount: number;
  totalAmount: number;
  profitAmount: number; // revenue - cost of goods sold
  paymentMethod: 'Cash' | 'Card' | 'Mobile Pay';
  cashReceived?: number;
  changeDue?: number;
  employeeId?: string; // associated employee ID for audit
  employeeName?: string; // associated employee name for audit
  customerId?: string; // customer reference
  customerName?: string; // customer name reference
  earnedPoints?: number; // points earned this transaction
  redeemedPoints?: number; // points redeemed or used this transaction
}

export interface Customer {
  id: string; // e.g. "CUST001"
  name: string;
  phone: string;
  email: string;
  loyaltyPoints: number;
  totalSpent: number;
  visits: number;
}

export interface Employee {
  id: string; // e.g. "EMP001"
  name: string;
  role: string;
  status: 'Active' | 'Inactive';
}

export interface EmployeeShift {
  id: string;
  employeeId: string;
  employeeName: string;
  checkInTime: string; // ISO string
  checkOutTime?: string; // ISO string if closed
  salesCount: number;
  salesVolume: number;
}

export interface SystemNotification {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'success';
  timestamp: string;
  read: boolean;
}

export interface TaxConfig {
  globalRate: number;
  categoryRates: Record<string, number>;
}

export type ActiveSection = 'pos' | 'inventory' | 'sales' | 'analytics' | 'reports' | 'shifts' | 'settings';
