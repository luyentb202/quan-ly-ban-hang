
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  productApi,
  saleApi,
  customerApi,
  employeeApi,
  expenseCategoryApi,
  incomeCategoryApi,
  expenseApi,
  incomeApi,
  inventoryLogApi,
  complexApi
} from '../lib/api';
import {
  Product,
  Sale,
  Customer,
  Employee,
  Category,
  Expense,
  Income,
  InventoryLog,
  SaleStatus
} from '../types';

type Theme = 'light' | 'dark';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  loading: boolean;
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  employees: Employee[];
  expenseCategories: Category[];
  incomeCategories: Category[];
  expenses: Expense[];
  incomes: Income[];
  inventoryLogs: InventoryLog[];
  fetchData: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'|'createdAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id'|'createdAt'>) => Promise<void>;
  updateSaleStatus: (saleId: string, status: SaleStatus) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id'|'createdAt'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id'|'createdAt'>) => Promise<void>;
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'|'createdAt'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addIncome: (income: Omit<Income, 'id'|'createdAt'>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  addExpenseCategory: (category: Omit<Category, 'id'|'createdAt'>) => Promise<void>;
  deleteExpenseCategory: (id: string) => Promise<void>;
  addIncomeCategory: (category: Omit<Category, 'id'|'createdAt'>) => Promise<void>;
  deleteIncomeCategory: (id: string) => Promise<void>;
  adjustInventory: (productId: string, productName: string, adjustment: {type: 'StockIn' | 'StockTake', quantity: number}) => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [loading, setLoading] = useState(true);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);

  useEffect(() => {
    const storedTheme = localStorage.getItem('pos_theme') as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    }
    fetchData();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('pos_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        productsData,
        salesData,
        customersData,
        employeesData,
        expenseCategoriesData,
        incomeCategoriesData,
        expensesData,
        incomesData,
        inventoryLogsData
      ] = await Promise.all([
        productApi.getAll(),
        saleApi.getAll(),
        customerApi.getAll(),
        employeeApi.getAll(),
        expenseCategoryApi.getAll(),
        incomeCategoryApi.getAll(),
        expenseApi.getAll(),
        incomeApi.getAll(),
        inventoryLogApi.getAll()
      ]);
      setProducts(productsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setSales(salesData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setCustomers(customersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setEmployees(employeesData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setExpenseCategories(expenseCategoriesData);
      setIncomeCategories(incomeCategoriesData);
      setExpenses(expensesData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setIncomes(incomesData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setInventoryLogs(inventoryLogsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleApiCall = useCallback(async (apiCall: Promise<any>) => {
    setLoading(true);
    try {
      await apiCall;
      await fetchData();
    } catch (error) {
      console.error("API call failed:", error);
      setLoading(false);
      // Here you could add a toast notification for the error
    }
  }, [fetchData]);

  const value: AppContextType = {
    theme,
    toggleTheme,
    loading,
    products,
    sales,
    customers,
    employees,
    expenseCategories,
    incomeCategories,
    expenses,
    incomes,
    inventoryLogs,
    fetchData,
    addProduct: (product) => handleApiCall(productApi.create(product)),
    updateProduct: (id, product) => handleApiCall(productApi.update(id, product)),
    deleteProduct: (id) => handleApiCall(productApi.delete(id)),
    addSale: (sale) => handleApiCall(complexApi.createSale(sale)),
    updateSaleStatus: (saleId, status) => handleApiCall(complexApi.updateSaleStatus(saleId, status)),
    addCustomer: (customer) => handleApiCall(customerApi.create(customer)),
    updateCustomer: (id, customer) => handleApiCall(customerApi.update(id, customer)),
    deleteCustomer: (id) => handleApiCall(customerApi.delete(id)),
    addEmployee: (employee) => handleApiCall(employeeApi.create(employee)),
    updateEmployee: (id, employee) => handleApiCall(employeeApi.update(id, employee)),
    deleteEmployee: (id) => handleApiCall(employeeApi.delete(id)),
    addExpense: (expense) => handleApiCall(expenseApi.create(expense)),
    deleteExpense: (id) => handleApiCall(expenseApi.delete(id)),
    addIncome: (income) => handleApiCall(incomeApi.create(income)),
    deleteIncome: (id) => handleApiCall(incomeApi.delete(id)),
    addExpenseCategory: (category) => handleApiCall(expenseCategoryApi.create(category)),
    deleteExpenseCategory: (id) => handleApiCall(expenseCategoryApi.delete(id)),
    addIncomeCategory: (category) => handleApiCall(incomeCategoryApi.create(category)),
    deleteIncomeCategory: (id) => handleApiCall(incomeCategoryApi.delete(id)),
    adjustInventory: (productId, productName, adjustment) => handleApiCall(complexApi.adjustInventory(productId, productName, adjustment)),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
