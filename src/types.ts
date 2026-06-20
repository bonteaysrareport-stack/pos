export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number; // For net profit calculations
  stock: number;
  category: string;
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
}

export interface SystemNotification {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'success';
  timestamp: string;
  read: boolean;
}

export type ActiveSection = 'pos' | 'inventory' | 'sales' | 'analytics' | 'reports' | 'settings';
