
export interface Product {
  id: string;
  name: string;
  purchasePrice: number;
  sellingPrice: number;
  barcode: string;
  quantityInStock: number;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  purchasePrice: number;
}

export enum SaleStatus {
  Completed = 'Hoàn thành',
  Pending = 'Đang giao',
  Returned = 'Trả hàng',
}

export interface Sale {
  id: string;
  items: SaleItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  createdAt: string;
  status: SaleStatus;
  customerId?: string;
  customerName: string;
  employeeId: string;
  employeeName: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  email?: string;
  position: string;
  startDate: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  createdAt: string;
  categoryId: string;
  categoryName: string;
}

export interface Income {
  id: string;
  description: string;
  amount: number;
  createdAt: string;
  categoryId: string;
  categoryName: string;
}

export enum InventoryLogType {
  Initial = 'KHỞI TẠO',
  StockIn = 'NHẬP HÀNG',
  Sale = 'BÁN HÀNG',
  StockTake = 'KIỂM KHO',
  Return = 'TRẢ HÀNG',
  Adjustment = 'SỬA ĐƠN HÀNG',
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  quantityChange: number;
  newQuantity: number;
  type: InventoryLogType;
  createdAt: string;
  saleId?: string;
}
