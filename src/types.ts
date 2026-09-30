export type UserRole = 'admin' | 'operator' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  lastLogin: string;
  createdDate: string;
  avatar?: string;
}

export interface StockRecord {
  id: string;
  date: string;
  particulars: string;
  category: string;
  folioNo: string;
  unit: string;
  supplier?: string;
  invoiceNo?: string;
  remarks?: string;
  receivedQty: number;
  receivedRate: number;
  receivedAmount: number;
  issuedQty: number;
  issuedRate: number;
  issuedAmount: number;
  balanceQty: number;
  balanceAmount: number;
  createdBy: string;
  createdDate: string;
  updatedBy?: string;
  updatedDate?: string;
  minStockLevel: number;
}

export type StockMovementType = 'received' | 'issued' | 'adjustment';

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  date: string;
  type: StockMovementType;
  quantity: number;
  rate: number;
  amount: number;
  updatedBy: string;
  remarks?: string;
}

export interface AuditLog {
  id: string;
  user: string;
  role: UserRole;
  action: string;
  record: string;
  date: string;
  time: string;
  details?: string;
}

export type Page =
  | 'dashboard'
  | 'stock-register'
  | 'stock-movement'
  | 'reports'
  | 'user-management'
  | 'audit-logs'
  | 'settings'
  | 'stock-detail'
  | 'profile';

export interface AppState {
  currentUser: User | null;
  currentPage: Page;
  selectedStockId?: string;
}
