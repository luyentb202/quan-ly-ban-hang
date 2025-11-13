
import {
  Product,
  Sale,
  Customer,
  Employee,
  Category,
  Expense,
  Income,
  InventoryLog,
  InventoryLogType,
  SaleStatus,
} from '../types';

const SIMULATED_DELAY = 500;

const seedData = () => {
  const now = new Date();
  
  const initialProducts: Product[] = [
    { id: 'prod1', name: 'Laptop Pro 15"', purchasePrice: 20000000, sellingPrice: 25000000, barcode: 'LP15PRO', quantityInStock: 10, createdAt: now.toISOString() },
    { id: 'prod2', name: 'Wireless Mouse', purchasePrice: 300000, sellingPrice: 500000, barcode: 'WMOUSE', quantityInStock: 50, createdAt: now.toISOString() },
    { id: 'prod3', name: 'Mechanical Keyboard', purchasePrice: 1200000, sellingPrice: 1800000, barcode: 'MKEYB', quantityInStock: 25, createdAt: now.toISOString() },
    { id: 'prod4', name: '4K Monitor 27"', purchasePrice: 5000000, sellingPrice: 7500000, barcode: '4KMON27', quantityInStock: 15, createdAt: now.toISOString() },
    { id: 'prod5', name: 'USB-C Hub', purchasePrice: 600000, sellingPrice: 900000, barcode: 'USBCHUB', quantityInStock: 40, createdAt: now.toISOString() },
  ];

  const initialCustomers: Customer[] = [
    { id: 'cust1', name: 'Nguyễn Văn A', phone: '0901234567', email: 'a@example.com', address: '123 Đường ABC, Quận 1, TP.HCM', createdAt: now.toISOString() },
    { id: 'cust2', name: 'Trần Thị B', phone: '0987654321', email: 'b@example.com', address: '456 Đường XYZ, Quận 3, TP.HCM', createdAt: now.toISOString() },
  ];

  const initialEmployees: Employee[] = [
    { id: 'emp1', name: 'Lê Minh C', phone: '0912345678', email: 'c@store.com', position: 'Quản lý', startDate: new Date('2022-01-01').toISOString(), createdAt: now.toISOString() },
    { id: 'emp2', name: 'Phạm Thị D', phone: '0923456789', email: 'd@store.com', position: 'Nhân viên bán hàng', startDate: new Date('2023-03-15').toISOString(), createdAt: now.toISOString() },
  ];

  const initialExpenseCategories: Category[] = [
    { id: 'expcat1', name: 'Tiền thuê mặt bằng', createdAt: now.toISOString() },
    { id: 'expcat2', name: 'Tiền điện nước', createdAt: now.toISOString() },
    { id: 'expcat3', name: 'Lương nhân viên', createdAt: now.toISOString() },
  ];

  const initialIncomeCategories: Category[] = [
    { id: 'inccat1', name: 'Doanh thu bán hàng', createdAt: now.toISOString() },
    { id: 'inccat2', name: 'Thu nhập khác', createdAt: now.toISOString() },
  ];

  const initialInventoryLogs: InventoryLog[] = initialProducts.map(p => ({
    id: `log_init_${p.id}`,
    productId: p.id,
    productName: p.name,
    quantityChange: p.quantityInStock,
    newQuantity: p.quantityInStock,
    type: InventoryLogType.Initial,
    createdAt: now.toISOString()
  }));

  const salesData: Sale[] = [
    {
      id: 'sale1',
      items: [
        { productId: 'prod1', productName: 'Laptop Pro 15"', quantity: 1, price: 25000000, purchasePrice: 20000000 },
        { productId: 'prod2', productName: 'Wireless Mouse', quantity: 1, price: 500000, purchasePrice: 300000 },
      ],
      totalAmount: 25500000,
      discount: 500000,
      finalAmount: 25000000,
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      status: SaleStatus.Completed,
      customerId: 'cust1',
      customerName: 'Nguyễn Văn A',
      employeeId: 'emp2',
      employeeName: 'Phạm Thị D',
      notes: 'Giao nhanh',
    },
  ];
  
  if (!localStorage.getItem('products')) localStorage.setItem('products', JSON.stringify(initialProducts));
  if (!localStorage.getItem('customers')) localStorage.setItem('customers', JSON.stringify(initialCustomers));
  if (!localStorage.getItem('employees')) localStorage.setItem('employees', JSON.stringify(initialEmployees));
  if (!localStorage.getItem('expenseCategories')) localStorage.setItem('expenseCategories', JSON.stringify(initialExpenseCategories));
  if (!localStorage.getItem('incomeCategories')) localStorage.setItem('incomeCategories', JSON.stringify(initialIncomeCategories));
  if (!localStorage.getItem('inventoryLogs')) localStorage.setItem('inventoryLogs', JSON.stringify(initialInventoryLogs));
  if (!localStorage.getItem('sales')) localStorage.setItem('sales', JSON.stringify(salesData));
  if (!localStorage.getItem('expenses')) localStorage.setItem('expenses', JSON.stringify([]));
  if (!localStorage.getItem('incomes')) localStorage.setItem('incomes', JSON.stringify([]));
  if (!localStorage.getItem('pos_theme')) localStorage.setItem('pos_theme', 'light');

  localStorage.setItem('seeded', 'true');
};

const init = () => {
  if (!localStorage.getItem('seeded')) {
    seedData();
  }
};

init();

const createApi = <T extends { id: string }>(key: string) => {
  return {
    getAll: (): Promise<T[]> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const data = JSON.parse(localStorage.getItem(key) || '[]') as T[];
          resolve(data);
        }, SIMULATED_DELAY);
      });
    },
    getById: (id: string): Promise<T | null> => {
       return new Promise((resolve) => {
        setTimeout(() => {
          const data = JSON.parse(localStorage.getItem(key) || '[]') as T[];
          resolve(data.find(item => item.id === id) || null);
        }, SIMULATED_DELAY);
      });
    },
    create: (item: Omit<T, 'id' | 'createdAt'>): Promise<T> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const data = JSON.parse(localStorage.getItem(key) || '[]') as T[];
          const newItem = {
            ...item,
            id: `id_${new Date().getTime()}_${Math.random()}`,
            createdAt: new Date().toISOString()
// Fix: Cast to unknown first to satisfy TypeScript's generic constraints.
          } as unknown as T;
          data.push(newItem);
          localStorage.setItem(key, JSON.stringify(data));
          resolve(newItem);
        }, SIMULATED_DELAY);
      });
    },
    update: (id: string, updatedItem: Partial<T>): Promise<T> => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const data = JSON.parse(localStorage.getItem(key) || '[]') as T[];
          const index = data.findIndex(item => item.id === id);
          if (index === -1) {
            reject(new Error("Item not found"));
            return;
          }
          data[index] = { ...data[index], ...updatedItem };
          localStorage.setItem(key, JSON.stringify(data));
          resolve(data[index]);
        }, SIMULATED_DELAY);
      });
    },
    delete: (id: string): Promise<void> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const data = JSON.parse(localStorage.getItem(key) || '[]') as T[];
          const filteredData = data.filter(item => item.id !== id);
          localStorage.setItem(key, JSON.stringify(filteredData));
          resolve();
        }, SIMULATED_DELAY);
      });
    }
  };
};

export const productApi = createApi<Product>('products');
export const saleApi = createApi<Sale>('sales');
export const customerApi = createApi<Customer>('customers');
export const employeeApi = createApi<Employee>('employees');
export const expenseCategoryApi = createApi<Category>('expenseCategories');
export const incomeCategoryApi = createApi<Category>('incomeCategories');
export const expenseApi = createApi<Expense>('expenses');
export const incomeApi = createApi<Income>('incomes');
export const inventoryLogApi = createApi<InventoryLog>('inventoryLogs');

// Complex operations
export const complexApi = {
  createSale: async (saleData: Omit<Sale, 'id' | 'createdAt'>): Promise<Sale> => {
    // 1. Create sale
    const newSale = await saleApi.create(saleData);

    // 2. Update product stock and create inventory logs
    const products = await productApi.getAll();
    const logs: Omit<InventoryLog, 'id' | 'createdAt'>[] = [];

    for (const item of newSale.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const newQuantity = product.quantityInStock - item.quantity;
        await productApi.update(item.productId, { quantityInStock: newQuantity });
        logs.push({
          productId: item.productId,
          productName: item.productName,
          quantityChange: -item.quantity,
          newQuantity: newQuantity,
          type: InventoryLogType.Sale,
          saleId: newSale.id,
        });
      }
    }
    
    // 3. Batch create inventory logs
    for (const log of logs) {
        await inventoryLogApi.create(log);
    }

    return newSale;
  },

  updateSaleStatus: async (saleId: string, newStatus: SaleStatus): Promise<Sale> => {
    const sale = await saleApi.getById(saleId);
    if (!sale) throw new Error("Sale not found");
    if (sale.status === newStatus) return sale;

    // Logic for returned items
    if (newStatus === SaleStatus.Returned && sale.status !== SaleStatus.Returned) {
      const products = await productApi.getAll();
      for (const item of sale.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const newQuantity = product.quantityInStock + item.quantity;
          await productApi.update(item.productId, { quantityInStock: newQuantity });
          await inventoryLogApi.create({
            productId: item.productId,
            productName: item.productName,
            quantityChange: item.quantity,
            newQuantity: newQuantity,
            type: InventoryLogType.Return,
            saleId: sale.id,
          });
        }
      }
    }
    
    // Logic if a returned sale is changed back to another status
    if (sale.status === SaleStatus.Returned && newStatus !== SaleStatus.Returned) {
      const products = await productApi.getAll();
      for (const item of sale.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const newQuantity = product.quantityInStock - item.quantity;
          await productApi.update(item.productId, { quantityInStock: newQuantity });
          await inventoryLogApi.create({
            productId: item.productId,
            productName: item.productName,
            quantityChange: -item.quantity,
            newQuantity: newQuantity,
            type: InventoryLogType.Adjustment,
            saleId: sale.id,
          });
        }
      }
    }

    return saleApi.update(saleId, { status: newStatus });
  },

  adjustInventory: async (
    productId: string,
    productName: string,
    adjustment: { type: 'StockIn' | 'StockTake'; quantity: number }
  ): Promise<Product> => {
    const product = await productApi.getById(productId);
    if (!product) throw new Error('Product not found');

    let newQuantity: number;
    let quantityChange: number;
    let logType: InventoryLogType;

    if (adjustment.type === 'StockIn') {
      newQuantity = product.quantityInStock + adjustment.quantity;
      quantityChange = adjustment.quantity;
      logType = InventoryLogType.StockIn;
    } else { // StockTake
      newQuantity = adjustment.quantity;
      quantityChange = newQuantity - product.quantityInStock;
      logType = InventoryLogType.StockTake;
    }

    await inventoryLogApi.create({
      productId,
      productName,
      quantityChange,
      newQuantity,
      type: logType
    });
    
    return productApi.update(productId, { quantityInStock: newQuantity });
  }
};