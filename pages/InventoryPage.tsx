
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { formatDate } from '../utils/helpers';
import { Product, InventoryLogType } from '../types';

const InventoryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'stock' | 'history'>('stock');

    return (
        <Card>
            <div className="flex border-b dark:border-gray-700 mb-4">
                <button
                    className={`py-2 px-4 ${activeTab === 'stock' ? 'border-b-2 border-primary-500 font-semibold' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('stock')}
                >
                    Tồn Kho
                </button>
                <button
                    className={`py-2 px-4 ${activeTab === 'history' ? 'border-b-2 border-primary-500 font-semibold' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('history')}
                >
                    Lịch Sử Xuất/Nhập
                </button>
            </div>
            {activeTab === 'stock' ? <InventoryStock /> : <InventoryHistory />}
        </Card>
    );
};

const InventoryStock: React.FC = () => {
    const { products, adjustInventory, loading } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [adjustmentType, setAdjustmentType] = useState<'StockIn' | 'StockTake'>('StockIn');
    const [quantity, setQuantity] = useState(0);

    const openModal = (product: Product) => {
        setSelectedProduct(product);
        setModalOpen(true);
        setQuantity(0);
        setAdjustmentType('StockIn');
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedProduct(null);
    };

    const handleAdjust = async () => {
        if (selectedProduct && quantity > 0) {
            await adjustInventory(selectedProduct.id, selectedProduct.name, { type: adjustmentType, quantity });
            closeModal();
        }
    };

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-4">Sản phẩm</th>
                            <th className="p-4">Tồn kho hiện tại</th>
                            <th className="p-4">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} className="border-b dark:border-gray-600">
                                <td className="p-4 font-medium">{product.name}</td>
                                <td className="p-4">{product.quantityInStock}</td>
                                <td className="p-4">
                                    <Button size="sm" onClick={() => openModal(product)}>Nhập/Xuất/Kiểm</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={`Điều chỉnh tồn kho: ${selectedProduct?.name}`}>
                <div className="space-y-4">
                    <p>Tồn kho hiện tại: {selectedProduct?.quantityInStock}</p>
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input type="radio" name="adjustmentType" checked={adjustmentType === 'StockIn'} onChange={() => setAdjustmentType('StockIn')} className="mr-2" />
                            Nhập hàng
                        </label>
                        <label className="flex items-center">
                            <input type="radio" name="adjustmentType" checked={adjustmentType === 'StockTake'} onChange={() => setAdjustmentType('StockTake')} className="mr-2" />
                            Kiểm kho
                        </label>
                    </div>
                    <Input
                        type="number"
                        label={adjustmentType === 'StockIn' ? "Số lượng nhập" : "Số lượng thực tế"}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        min="0"
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={closeModal}>Hủy</Button>
                        <Button onClick={handleAdjust} disabled={loading}>Xác nhận</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

const InventoryHistory: React.FC = () => {
    const { inventoryLogs } = useAppContext();
    
    const getLogTypeColor = (type: InventoryLogType) => {
        switch(type) {
            case InventoryLogType.Initial: return 'bg-gray-200 text-gray-800';
            case InventoryLogType.StockIn: return 'bg-green-200 text-green-800';
            case InventoryLogType.Sale: return 'bg-red-200 text-red-800';
            case InventoryLogType.StockTake: return 'bg-blue-200 text-blue-800';
            case InventoryLogType.Return: return 'bg-yellow-200 text-yellow-800';
            case InventoryLogType.Adjustment: return 'bg-purple-200 text-purple-800';
            default: return 'bg-gray-200 text-gray-800';
        }
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="p-4">Thời gian</th>
                        <th className="p-4">Sản phẩm</th>
                        <th className="p-4">Loại thay đổi</th>
                        <th className="p-4">Số lượng thay đổi</th>
                        <th className="p-4">Tồn kho cuối</th>
                    </tr>
                </thead>
                <tbody>
                    {inventoryLogs.map(log => (
                        <tr key={log.id} className="border-b dark:border-gray-600">
                            <td className="p-4">{formatDate(log.createdAt)}</td>
                            <td className="p-4 font-medium">{log.productName}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLogTypeColor(log.type)}`}>
                                    {log.type}
                                </span>
                            </td>
                            <td className={`p-4 font-bold ${log.quantityChange > 0 ? 'text-green-500' : 'text-red-500'}`}>{log.quantityChange}</td>
                            <td className="p-4 font-semibold">{log.newQuantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InventoryPage;
