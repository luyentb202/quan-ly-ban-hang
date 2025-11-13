import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { formatCurrency, formatDate } from '../utils/helpers';
import { SaleStatus, Sale } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { DollarSign, TrendingUp, ClipboardList } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <Card className="flex items-center p-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </Card>
);

const ReportsPage: React.FC = () => {
    const { sales, updateSaleStatus, loading } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);

    const filteredSales = useMemo(() => {
        return sales.filter(sale => {
            const saleDate = new Date(sale.createdAt);
            const startDate = dateRange.start ? new Date(dateRange.start) : null;
            const endDate = dateRange.end ? new Date(dateRange.end) : null;

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

            const searchLower = searchTerm.toLowerCase();
            return (
                sale.id.toLowerCase().includes(searchLower) ||
                sale.customerName.toLowerCase().includes(searchLower) ||
                sale.employeeName.toLowerCase().includes(searchLower) ||
                sale.items.some(item => item.productName.toLowerCase().includes(searchLower))
            );
        });
    }, [sales, searchTerm, dateRange]);
    
    const handleStatusChange = (saleId: string, newStatus: SaleStatus) => {
        updateSaleStatus(saleId, newStatus);
    }

    const handleRowClick = (sale: Sale) => {
        setSelectedSale(sale);
        setDetailModalOpen(true);
    };
    
    const stats = useMemo(() => {
        const completedSales = filteredSales.filter(s => s.status === SaleStatus.Completed);
        const totalRevenue = completedSales.reduce((sum, s) => sum + s.finalAmount, 0);
        const totalCost = completedSales.reduce((sum, s) => sum + s.items.reduce((itemSum, i) => itemSum + i.purchasePrice * i.quantity, 0), 0);
        const grossProfit = totalRevenue - totalCost;
        return { totalRevenue, grossProfit, totalSales: filteredSales.length };
    }, [filteredSales]);

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4">Báo cáo Bán hàng</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                 <StatCard title="TỔNG DOANH THU" value={formatCurrency(stats.totalRevenue)} icon={<DollarSign className="text-white" />} color="bg-blue-500" />
                 <StatCard title="LỢI NHUẬN GỘP" value={formatCurrency(stats.grossProfit)} icon={<TrendingUp className="text-white" />} color="bg-green-500" />
                 <StatCard title="TỔNG SỐ HÓA ĐƠN" value={stats.totalSales.toString()} icon={<ClipboardList className="text-white" />} color="bg-purple-500" />
            </div>

            <div className="flex flex-wrap gap-4 mb-4 items-end">
                <Input
                    type="date"
                    label="Từ ngày"
                    value={dateRange.start}
                    onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                />
                <Input
                    type="date"
                    label="Đến ngày"
                    value={dateRange.end}
                    onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                />
                <div className="flex-grow">
                    <Input
                        label="Tìm kiếm"
                        placeholder="Mã HĐ, khách hàng, sản phẩm..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-4">Ngày tạo</th>
                            <th className="p-4">Khách hàng</th>
                            <th className="p-4">Nhân viên</th>
                            <th className="p-4">Thành tiền</th>
                            <th className="p-4">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSales.map(sale => (
                            <tr 
                                key={sale.id} 
                                className="border-b dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50"
                                onClick={() => handleRowClick(sale)}
                            >
                                <td className="p-4">{formatDate(sale.createdAt)}</td>
                                <td className="p-4">{sale.customerName}</td>
                                <td className="p-4">{sale.employeeName}</td>
                                <td className="p-4 font-semibold">{formatCurrency(sale.finalAmount)}</td>
                                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                    <Select 
                                        value={sale.status}
                                        onChange={(e) => handleStatusChange(sale.id, e.target.value as SaleStatus)}
                                        className="w-full"
                                        disabled={loading}
                                    >
                                        {Object.values(SaleStatus).map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </Select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isDetailModalOpen} onClose={() => setDetailModalOpen(false)} title={`Chi tiết Hóa đơn #${selectedSale?.id.slice(-6).toUpperCase()}`} size="lg">
                {selectedSale && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                            <div>
                                <p><span className="font-semibold text-gray-900 dark:text-white">Khách hàng:</span> {selectedSale.customerName}</p>
                                <p><span className="font-semibold text-gray-900 dark:text-white">Nhân viên:</span> {selectedSale.employeeName}</p>
                            </div>
                            <div className="text-right">
                                <p><span className="font-semibold text-gray-900 dark:text-white">Ngày tạo:</span> {formatDate(selectedSale.createdAt)}</p>
                                <p><span className="font-semibold text-gray-900 dark:text-white">Trạng thái:</span> {selectedSale.status}</p>
                            </div>
                        </div>

                        <div className="border-t border-b dark:border-gray-700 py-4">
                            <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Sản phẩm đã mua</h4>
                            <div className="max-h-60 overflow-y-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="p-2">Sản phẩm</th>
                                            <th className="p-2 text-center">Số lượng</th>
                                            <th className="p-2 text-right">Đơn giá</th>
                                            <th className="p-2 text-right">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-700">
                                        {selectedSale.items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="p-2">{item.productName}</td>
                                                <td className="p-2 text-center">{item.quantity}</td>
                                                <td className="p-2 text-right">{formatCurrency(item.price)}</td>
                                                <td className="p-2 text-right font-medium">{formatCurrency(item.price * item.quantity)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Tổng tiền hàng:</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(selectedSale.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Giảm giá:</span>
                                <span className="font-semibold text-red-500">-{formatCurrency(selectedSale.discount)}</span>
                            </div>
                            <hr className="dark:border-gray-600" />
                            <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                                <span>Thành tiền:</span>
                                <span>{formatCurrency(selectedSale.finalAmount)}</span>
                            </div>
                        </div>
                        
                        <div className="flex justify-end pt-4">
                            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>Đóng</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </Card>
    );
};

export default ReportsPage;
