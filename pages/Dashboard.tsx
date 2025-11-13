import React, { useMemo, useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../hooks/useAppContext';
import { Card } from '../components/ui/Card';
import { formatCurrency, formatDate } from '../utils/helpers';
import { DollarSign, TrendingUp, TrendingDown, ClipboardList, Download, Upload, CheckCircle, XCircle } from 'lucide-react';
import { Sale, Expense, Income, SaleStatus } from '../types';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ConfirmModal } from '../components/ui/ConfirmModal';

// InfoModal component for better user feedback
interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant: 'success' | 'error';
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, message, variant }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center">
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${variant === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
            {variant === 'success' ? <CheckCircle className="h-6 w-6 text-green-600" /> : <XCircle className="h-6 w-6 text-red-600" />}
        </div>
        <p className="mt-4 text-gray-700 dark:text-gray-300">{message}</p>
      </div>
      <div className="mt-6 flex justify-end">
        <Button variant={variant === 'success' ? 'primary' : 'danger'} onClick={onClose}>OK</Button>
      </div>
    </Modal>
  );
};


const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <Card className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </Card>
);

const LOCAL_STORAGE_KEYS = [
  'products',
  'customers',
  'employees',
  'expenseCategories',
  'incomeCategories',
  'inventoryLogs',
  'sales',
  'expenses',
  'incomes',
  'pos_theme',
  'seeded',
  'sidebar_compact'
];

const Dashboard: React.FC = () => {
    const { sales, expenses, incomes, fetchData } = useAppContext();
    
    const [calcType, setCalcType] = useState<'actual_revenue' | 'estimated_revenue' | 'gross_profit' | 'selected_incomes'>('actual_revenue');
    const [revenueDateRange, setRevenueDateRange] = useState({ start: '', end: '' });
    
    const [selectedExpenseIds, setSelectedExpenseIds] = useState<Set<string>>(new Set());
    const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
    const [expenseDateFilter, setExpenseDateFilter] = useState({ start: '', end: '' });

    const [selectedIncomeIds, setSelectedIncomeIds] = useState<Set<string>>(new Set());
    const [isIncomeModalOpen, setIncomeModalOpen] = useState(false);
    const [incomeDateFilter, setIncomeDateFilter] = useState({ start: '', end: '' });
    
    const [isImportConfirmOpen, setImportConfirmOpen] = useState(false);
    const [importedData, setImportedData] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isInfoModalOpen, setInfoModalOpen] = useState(false);
    const [infoModalContent, setInfoModalContent] = useState({ title: '', message: '', variant: 'success' as 'success' | 'error' });

    const [seriesVisibility, setSeriesVisibility] = useState({
        'Doanh thu': true,
        'Lợi nhuận gộp': true,
    });


    const stats = useMemo(() => {
        const completedSales = sales.filter(s => s.status === SaleStatus.Completed);
        const nonReturnedSales = sales.filter(s => s.status !== SaleStatus.Returned);

        const totalEstimatedRevenue = nonReturnedSales.reduce((acc, sale) => acc + sale.totalAmount, 0);
        const totalActualRevenue = completedSales.reduce((acc, sale) => acc + sale.finalAmount, 0);
        const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);
        
        const costOfGoodsSold = completedSales.reduce((acc, sale) => {
            return acc + sale.items.reduce((itemAcc, item) => itemAcc + (item.purchasePrice * item.quantity), 0);
        }, 0);
        
        const netProfit = totalActualRevenue - totalExpenses - costOfGoodsSold;

        return { totalEstimatedRevenue, totalActualRevenue, totalExpenses, netProfit, costOfGoodsSold };
    }, [sales, expenses]);

    const chartData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        return last7Days.map(date => {
            const d = new Date(date);
            const dailySales = sales.filter(s => new Date(s.createdAt).toISOString().split('T')[0] === date && s.status === SaleStatus.Completed);
            const revenue = dailySales.reduce((sum, s) => sum + s.finalAmount, 0);
            const cost = dailySales.reduce((sum, s) => sum + s.items.reduce((itemSum, i) => itemSum + i.purchasePrice * i.quantity, 0), 0);
            const profit = revenue - cost;

            return {
                name: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
                'Doanh thu': revenue,
                'Lợi nhuận gộp': profit,
            };
        });
    }, [sales]);
    
    const profitCalculatorData = useMemo(() => {
        const filteredSales = sales.filter(sale => {
            const saleDate = new Date(sale.createdAt);
            const startDate = revenueDateRange.start ? new Date(revenueDateRange.start) : null;
            const endDate = revenueDateRange.end ? new Date(revenueDateRange.end) : null;
    
            if (startDate) {
                const inclusiveStartDate = new Date(startDate);
                inclusiveStartDate.setHours(0, 0, 0, 0);
                if (saleDate < inclusiveStartDate) return false;
            }
    
            if (endDate) {
                const inclusiveEndDate = new Date(endDate);
                inclusiveEndDate.setHours(23, 59, 59, 999);
                if (saleDate > inclusiveEndDate) return false;
            }
    
            return true;
        });

        let displayRevenue = 0;
        let revenueLabel = 'Tổng thu:';

        if (calcType === 'estimated_revenue') {
            displayRevenue = filteredSales.reduce((acc, sale) => acc + sale.totalAmount, 0);
            revenueLabel = 'Doanh thu ước tính:';
        } else if (calcType === 'actual_revenue') {
            displayRevenue = filteredSales.filter(s => s.status === SaleStatus.Completed).reduce((acc, sale) => acc + sale.finalAmount, 0);
            revenueLabel = 'Doanh thu thực:';
        } else if (calcType === 'gross_profit') {
            const completedFilteredSales = filteredSales.filter(s => s.status === SaleStatus.Completed);
            const totalActualRevenueForProfit = completedFilteredSales.reduce((acc, sale) => acc + sale.finalAmount, 0);
            const costOfGoodsSoldForProfit = completedFilteredSales.reduce((acc, sale) => {
                return acc + sale.items.reduce((itemAcc, item) => itemAcc + (item.purchasePrice * item.quantity), 0);
            }, 0);
            displayRevenue = totalActualRevenueForProfit - costOfGoodsSoldForProfit;
            revenueLabel = 'Lợi nhuận gộp:';
        } else if (calcType === 'selected_incomes') {
            displayRevenue = incomes
                .filter(i => selectedIncomeIds.has(i.id))
                .reduce((acc, i) => acc + i.amount, 0);
            revenueLabel = 'Tổng thu đã chọn:';
        }

        const displayExpenses = expenses
            .filter(e => selectedExpenseIds.has(e.id))
            .reduce((acc, e) => acc + e.amount, 0);
        
        const finalProfit = displayRevenue - displayExpenses;

        return { displayRevenue, displayExpenses, finalProfit, revenueLabel };
    }, [calcType, revenueDateRange, sales, expenses, selectedExpenseIds, incomes, selectedIncomeIds]);


    const filteredExpensesForModal = useMemo(() => {
        return expenses.filter(expense => {
            const expenseDate = new Date(expense.createdAt);
            const startDate = expenseDateFilter.start ? new Date(expenseDateFilter.start) : null;
            const endDate = expenseDateFilter.end ? new Date(expenseDateFilter.end) : null;

            if (startDate) {
                const inclusiveStartDate = new Date(startDate);
                inclusiveStartDate.setHours(0, 0, 0, 0);
                if (expenseDate < inclusiveStartDate) return false;
            }
            
            if (endDate) {
                const inclusiveEndDate = new Date(endDate);
                inclusiveEndDate.setHours(23, 59, 59, 999);
                 if (expenseDate > inclusiveEndDate) return false;
            }
            return true;
        });
    }, [expenses, expenseDateFilter]);

    const filteredIncomesForModal = useMemo(() => {
        return incomes.filter(income => {
            const incomeDate = new Date(income.createdAt);
            const startDate = incomeDateFilter.start ? new Date(incomeDateFilter.start) : null;
            const endDate = incomeDateFilter.end ? new Date(incomeDateFilter.end) : null;

            if (startDate) {
                const inclusiveStartDate = new Date(startDate);
                inclusiveStartDate.setHours(0, 0, 0, 0);
                if (incomeDate < inclusiveStartDate) return false;
            }
            
            if (endDate) {
                const inclusiveEndDate = new Date(endDate);
                inclusiveEndDate.setHours(23, 59, 59, 999);
                 if (incomeDate > inclusiveEndDate) return false;
            }
            return true;
        });
    }, [incomes, incomeDateFilter]);

    const handleExpenseSelection = (expenseId: string) => {
        setSelectedExpenseIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(expenseId)) {
                newSet.delete(expenseId);
            } else {
                newSet.add(expenseId);
            }
            return newSet;
        });
    };

    const handleIncomeSelection = (incomeId: string) => {
        setSelectedIncomeIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(incomeId)) {
                newSet.delete(incomeId);
            } else {
                newSet.add(incomeId);
            }
            return newSet;
        });
    };
    
    const handleLegendClick = (dataKey: string) => {
        setSeriesVisibility(prev => ({
            ...prev,
            [dataKey as keyof typeof seriesVisibility]: !prev[dataKey as keyof typeof seriesVisibility]
        }));
    };

    const handleExport = () => {
        const dataToExport: { [key: string]: string } = {};
        LOCAL_STORAGE_KEYS.forEach(key => {
            const value = localStorage.getItem(key);
            if (value !== null) {
                dataToExport[key] = value;
            }
        });
        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().slice(0, 10);
        a.download = `pos_data_export_${date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const triggerImport = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setImportedData(text);
                setImportConfirmOpen(true);
            };
            reader.readAsText(file);
        }
        // Reset file input to allow selecting the same file again
        event.target.value = '';
    };

    const handleConfirmImport = async () => {
        if (!importedData) return;
        try {
            const data = JSON.parse(importedData);
            if (typeof data !== 'object' || data === null) throw new Error("Invalid JSON format.");

            Object.keys(data).forEach(key => {
                if (LOCAL_STORAGE_KEYS.includes(key)) {
                    localStorage.setItem(key, data[key]);
                }
            });
            
            if (data.pos_theme) {
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(data.pos_theme);
            }

            await fetchData();
            setInfoModalContent({
                title: 'Thành công',
                message: 'Dữ liệu đã được nhập thành công!',
                variant: 'success'
            });
            setInfoModalOpen(true);
        } catch (error) {
            console.error("Failed to import data:", error);
            setInfoModalContent({
                title: 'Lỗi',
                message: 'Nhập dữ liệu thất bại. Vui lòng kiểm tra tệp tin.',
                variant: 'error'
            });
            setInfoModalOpen(true);
        } finally {
            setImportedData(null);
            setImportConfirmOpen(false);
        }
    };

    const CustomLegend = (props: any) => {
        const { payload } = props;
        return (
            <div className="flex justify-center items-center gap-6 pt-5">
                {payload.map((entry: any) => {
                    const dataKey = entry.value;
                    const color = entry.color;
                    const isActive = seriesVisibility[dataKey as keyof typeof seriesVisibility];

                    return (
                        <div
                            key={`item-${dataKey}`}
                            className="flex items-center cursor-pointer"
                            onClick={() => handleLegendClick(dataKey)}
                        >
                            <span
                                className="w-3 h-3 mr-2 inline-block border-2 rounded-sm"
                                style={{
                                    backgroundColor: isActive ? color : 'transparent',
                                    borderColor: color,
                                }}
                            ></span>
                            <span className={`text-sm ${isActive 
                                ? 'text-gray-700 dark:text-gray-300' 
                                : 'text-gray-400 dark:text-gray-500'}`
                            }>
                                {dataKey}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const recentSales = sales.slice(0, 5);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Doanh thu Ước tính" value={formatCurrency(stats.totalEstimatedRevenue)} icon={<TrendingUp className="text-white" />} color="bg-blue-500" />
                <StatCard title="Doanh thu Thực" value={formatCurrency(stats.totalActualRevenue)} icon={<DollarSign className="text-white" />} color="bg-green-500" />
                <StatCard title="Tổng Chi phí" value={formatCurrency(stats.totalExpenses)} icon={<TrendingDown className="text-white" />} color="bg-red-500" />
                <StatCard title="Lợi nhuận Ròng" value={formatCurrency(stats.netProfit)} icon={<ClipboardList className="text-white" />} color="bg-yellow-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Doanh thu 7 ngày qua</h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart 
                            data={chartData}
                            margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} dy={5} />
                            <YAxis hide />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend content={<CustomLegend />} />
                            <Bar dataKey="Doanh thu" fill="#3b82f6" barSize={25} hide={!seriesVisibility['Doanh thu']} />
                            <Bar dataKey="Lợi nhuận gộp" fill="#10b981" barSize={25} hide={!seriesVisibility['Lợi nhuận gộp']} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <div className="space-y-6">
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">Lợi nhuận tùy chỉnh</h3>
                        <div className="space-y-3">
                            <Select
                                label="Nguồn thu"
                                value={calcType}
                                onChange={(e) => setCalcType(e.target.value as 'actual_revenue' | 'estimated_revenue' | 'gross_profit' | 'selected_incomes')}
                            >
                                <option value="actual_revenue">Doanh thu thực</option>
                                <option value="estimated_revenue">Doanh thu ước tính</option>
                                <option value="gross_profit">Lợi nhuận gộp</option>
                                <option value="selected_incomes">Chọn khoản thu</option>
                            </Select>

                            {['actual_revenue', 'estimated_revenue', 'gross_profit'].includes(calcType) && (
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        type="date"
                                        label="Từ ngày"
                                        value={revenueDateRange.start}
                                        onChange={e => setRevenueDateRange({ ...revenueDateRange, start: e.target.value })}
                                    />
                                    <Input
                                        type="date"
                                        label="Đến ngày"
                                        value={revenueDateRange.end}
                                        onChange={e => setRevenueDateRange({ ...revenueDateRange, end: e.target.value })}
                                    />
                                </div>
                            )}

                             <div className="flex justify-between items-center pt-2">
                                <span className="text-gray-600 dark:text-gray-400">
                                    {profitCalculatorData.revenueLabel}
                                </span>
                                <span className="font-bold text-green-500">{formatCurrency(profitCalculatorData.displayRevenue)}</span>
                            </div>

                            {calcType === 'selected_incomes' && (
                                <Button variant="outline" className="w-full justify-start" onClick={() => setIncomeModalOpen(true)}>
                                    Thêm/Bớt khoản thu ({selectedIncomeIds.size})
                                </Button>
                            )}

                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">
                                   Tổng chi đã chọn:
                                </span>
                                <span className="font-bold text-red-500">{formatCurrency(profitCalculatorData.displayExpenses)}</span>
                            </div>
                            
                            <Button variant="outline" className="w-full justify-start" onClick={() => setExpenseModalOpen(true)}>
                                Thêm/Bớt khoản chi ({selectedExpenseIds.size})
                            </Button>

                            <hr className="dark:border-gray-600"/>

                            <div className="flex justify-between items-center text-lg">
                                <span className="font-semibold">Lợi nhuận cuối cùng:</span>
                                <span className="font-bold text-primary-500">{formatCurrency(profitCalculatorData.finalProfit)}</span>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">Giao dịch gần đây</h3>
                        <div className="space-y-4">
                            {recentSales.map(sale => (
                                <div key={sale.id} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{sale.customerName}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(sale.createdAt)}</p>
                                    </div>
                                    <p className="font-bold text-green-500">{formatCurrency(sale.finalAmount)}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">Quản lý Dữ liệu</h3>
                        <div className="space-y-2">
                            <Button onClick={handleExport} variant="outline" className="w-full">
                                <Download size={16} className="mr-2" /> Xuất Dữ Liệu
                            </Button>
                            <Button onClick={triggerImport} variant="outline" className="w-full">
                                <Upload size={16} className="mr-2" /> Nhập Dữ Liệu
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="application/json"
                            />
                            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                                Nhập dữ liệu sẽ ghi đè lên tất cả dữ liệu hiện tại. Hãy sao lưu trước khi thực hiện.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

            <Modal isOpen={isIncomeModalOpen} onClose={() => setIncomeModalOpen(false)} title="Chọn Khoản Thu" size="lg">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="date"
                            label="Từ ngày"
                            value={incomeDateFilter.start}
                            onChange={e => setIncomeDateFilter({ ...incomeDateFilter, start: e.target.value })}
                        />
                        <Input
                            type="date"
                            label="Đến ngày"
                            value={incomeDateFilter.end}
                            onChange={e => setIncomeDateFilter({ ...incomeDateFilter, end: e.target.value })}
                        />
                    </div>
                    <div className="max-h-80 overflow-y-auto space-y-2 p-2 border rounded dark:border-gray-600">
                        {filteredIncomesForModal.length > 0 ? filteredIncomesForModal.map(income => (
                             <label key={income.id} className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    checked={selectedIncomeIds.has(income.id)}
                                    onChange={() => handleIncomeSelection(income.id)}
                                />
                                <div className="ml-3 flex justify-between w-full">
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{income.description}</p>
                                        <p className="text-gray-500 dark:text-gray-400">{formatDate(income.createdAt)}</p>
                                    </div>
                                    <p className="font-semibold text-green-500">{formatCurrency(income.amount)}</p>
                                </div>
                            </label>
                        )) : <p className="text-center text-gray-500 p-4">Không có khoản thu nào phù hợp.</p>}
                    </div>
                     <div className="flex justify-end">
                        <Button onClick={() => setIncomeModalOpen(false)}>Đóng</Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isExpenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="Chọn Khoản Chi" size="lg">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="date"
                            label="Từ ngày"
                            value={expenseDateFilter.start}
                            onChange={e => setExpenseDateFilter({ ...expenseDateFilter, start: e.target.value })}
                        />
                        <Input
                            type="date"
                            label="Đến ngày"
                            value={expenseDateFilter.end}
                            onChange={e => setExpenseDateFilter({ ...expenseDateFilter, end: e.target.value })}
                        />
                    </div>
                    <div className="max-h-80 overflow-y-auto space-y-2 p-2 border rounded dark:border-gray-600">
                        {filteredExpensesForModal.length > 0 ? filteredExpensesForModal.map(expense => (
                             <label key={expense.id} className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    checked={selectedExpenseIds.has(expense.id)}
                                    onChange={() => handleExpenseSelection(expense.id)}
                                />
                                <div className="ml-3 flex justify-between w-full">
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{expense.description}</p>
                                        <p className="text-gray-500 dark:text-gray-400">{formatDate(expense.createdAt)}</p>
                                    </div>
                                    <p className="font-semibold text-red-500">{formatCurrency(expense.amount)}</p>
                                </div>
                            </label>
                        )) : <p className="text-center text-gray-500 p-4">Không có khoản chi nào phù hợp.</p>}
                    </div>
                     <div className="flex justify-end">
                        <Button onClick={() => setExpenseModalOpen(false)}>Đóng</Button>
                    </div>
                </div>
            </Modal>
            
            <ConfirmModal
                isOpen={isImportConfirmOpen}
                onClose={() => setImportConfirmOpen(false)}
                onConfirm={handleConfirmImport}
                title="Xác nhận Nhập Dữ liệu"
                message="Bạn có chắc chắn muốn nhập dữ liệu này không? Tất cả dữ liệu hiện tại sẽ bị ghi đè. Hành động này không thể hoàn tác."
            />

            <InfoModal
                isOpen={isInfoModalOpen}
                onClose={() => setInfoModalOpen(false)}
                title={infoModalContent.title}
                message={infoModalContent.message}
                variant={infoModalContent.variant}
            />
        </div>
    );
};

export default Dashboard;
