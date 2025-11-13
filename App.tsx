
import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { Layout } from './components/Layout';
import { Spinner } from './components/ui/Spinner';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SalesPage = lazy(() => import('./pages/SalesPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const FinancePage = lazy(() => import('./pages/FinancePage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const EmployeesPage = lazy(() => import('./pages/EmployeesPage'));

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Suspense fallback={<Spinner fullPage />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="sales" element={<SalesPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="finance" element={<FinancePage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
