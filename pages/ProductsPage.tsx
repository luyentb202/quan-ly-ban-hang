
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Card } from '../components/ui/Card';
import { formatCurrency } from '../utils/helpers';
import { Plus, Edit, Trash2, Search, FileSpreadsheet } from 'lucide-react';
import { Product, SaleStatus, Customer, Employee } from '../types';
// Fix: Import the Select component.
import { Select } from '../components/ui/Select';

const ProductsPage: React.FC = () => {
    const { products, deleteProduct, updateProduct, addProduct, customers, employees, addSale, loading } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [isBulkModalOpen, setBulkModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [bulkOrderData, setBulkOrderData] = useState({
        product: null as Product | null,
        customerNames: '',
        customerPhones: '',
        quantityPerOrder: 1,
        discountPerOrder: 0,
        employeeId: ''
    });

    const filteredProducts = useMemo(() =>
        products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [products, searchTerm]
    );

    const openModal = (product: Partial<Product> | null = null) => {
        setCurrentProduct(product || { name: '', purchasePrice: 0, sellingPrice: 0, barcode: '', quantityInStock: 0 });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setCurrentProduct(null);
    };

    const openConfirm = (id: string) => {
        setProductToDelete(id);
        setConfirmOpen(true);
    };

    const closeConfirm = () => {
        setProductToDelete(null);
        setConfirmOpen(false);
    };
    
    const openBulkModal = (product: Product) => {
        setBulkOrderData({ ...bulkOrderData, product });
        setBulkModalOpen(true);
    }
    
    const closeBulkModal = () => {
        setBulkOrderData({ product: null, customerNames: '', customerPhones: '', quantityPerOrder: 1, discountPerOrder: 0, employeeId: '' });
        setBulkModalOpen(false);
    }

    const handleSave = async () => {
        if (!currentProduct) return;

        if (currentProduct.id) {
            await updateProduct(currentProduct.id, currentProduct);
        } else {
            await addProduct(currentProduct as Omit<Product, 'id' | 'createdAt'>);
        }
        closeModal();
    };

    const handleDelete = async () => {
        if (productToDelete) {
            await deleteProduct(productToDelete);
            closeConfirm();
        }
    };
    
    const handleCreateBulkOrders = async () => {
        const { product, customerNames, customerPhones, quantityPerOrder, discountPerOrder, employeeId } = bulkOrderData;
        const names = customerNames.split('\n').filter(n => n.trim() !== '');
        const phones = customerPhones.split('\n').filter(p => p.trim() !== '');

        if (!product || names.length === 0 || names.length !== phones.length || !employeeId) {
            alert('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
            return;
        }

        const employee = employees.find(e => e.id === employeeId);
        if (!employee) {
            alert('Không tìm thấy nhân viên.');
            return;
        }
        
        const totalQuantityNeeded = names.length * quantityPerOrder;
        if (totalQuantityNeeded > product.quantityInStock) {
            alert(`Không đủ hàng tồn kho. Cần ${totalQuantityNeeded}, chỉ có ${product.quantityInStock}.`);
            return;
        }

        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const phone = phones[i];
            
            // Find existing customer or use name/phone
            let customer: Customer | undefined = customers.find(c => c.phone === phone);
            
            const saleItem = {
                productId: product.id,
                productName: product.name,
                quantity: quantityPerOrder,
                price: product.sellingPrice,
                purchasePrice: product.purchasePrice
            };
            const totalAmount = saleItem.price * saleItem.quantity;
            
            await addSale({
                items: [saleItem],
                totalAmount: totalAmount,
                discount: discountPerOrder,
                finalAmount: totalAmount - discountPerOrder,
                status: SaleStatus.Pending,
                customerId: customer?.id,
                customerName: customer?.name ?? name,
                employeeId: employee.id,
                employeeName: employee.name,
            });
        }
        alert(`Đã tạo thành công ${names.length} hóa đơn.`);
        closeBulkModal();
    }


    return (
        <Card>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h2 className="text-2xl font-bold">Quản lý Sản phẩm</h2>
                <div className="flex gap-2 items-center">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-10"
                        />
                        <Search className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400" />
                    </div>
                    <Button onClick={() => openModal()}>
                        <Plus size={20} /> Thêm Sản phẩm
                    </Button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-4">Tên sản phẩm</th>
                            <th className="p-4">Mã vạch</th>
                            <th className="p-4">Giá bán</th>
                            <th className="p-4">Tồn kho</th>
                            <th className="p-4">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id} className="border-b dark:border-gray-600">
                                <td className="p-4 font-medium">{product.name}</td>
                                <td className="p-4">{product.barcode}</td>
                                <td className="p-4">{formatCurrency(product.sellingPrice)}</td>
                                <td className="p-4">{product.quantityInStock}</td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="secondary" onClick={() => openModal(product)}><Edit size={16} /></Button>
                                        <Button size="sm" variant="danger" onClick={() => openConfirm(product.id)}><Trash2 size={16} /></Button>
                                        <Button size="sm" variant="primary" onClick={() => openBulkModal(product)}><FileSpreadsheet size={16} /></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentProduct?.id ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}>
                <div className="space-y-4">
                    <Input label="Tên sản phẩm" value={currentProduct?.name || ''} onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })} />
                    <Input label="Mã vạch" value={currentProduct?.barcode || ''} onChange={e => setCurrentProduct({ ...currentProduct, barcode: e.target.value })} />
                    <Input type="number" label="Giá mua" value={currentProduct?.purchasePrice || ''} onChange={e => setCurrentProduct({ ...currentProduct, purchasePrice: Number(e.target.value) })} />
                    <Input type="number" label="Giá bán" value={currentProduct?.sellingPrice || ''} onChange={e => setCurrentProduct({ ...currentProduct, sellingPrice: Number(e.target.value) })} />
                    {!currentProduct?.id && (
                        <Input type="number" label="Số lượng tồn kho ban đầu" value={currentProduct?.quantityInStock || ''} onChange={e => setCurrentProduct({ ...currentProduct, quantityInStock: Number(e.target.value) })} />
                    )}
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={closeModal}>Hủy</Button>
                        <Button onClick={handleSave} disabled={loading}>Lưu</Button>
                    </div>
                </div>
            </Modal>
            
            <Modal isOpen={isBulkModalOpen} onClose={closeBulkModal} title={`Tạo đơn hàng loạt cho: ${bulkOrderData.product?.name}`} size="lg">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium">Tên khách hàng (mỗi dòng 1 tên)</label>
                        <textarea 
                            rows={10} 
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            value={bulkOrderData.customerNames}
                            onChange={e => setBulkOrderData({...bulkOrderData, customerNames: e.target.value})}
                        ></textarea>
                    </div>
                     <div className="space-y-2">
                        <label className="block text-sm font-medium">Số điện thoại (thứ tự tương ứng)</label>
                        <textarea 
                            rows={10} 
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            value={bulkOrderData.customerPhones}
                            onChange={e => setBulkOrderData({...bulkOrderData, customerPhones: e.target.value})}
                        ></textarea>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <Input type="number" label="Số lượng/đơn" value={bulkOrderData.quantityPerOrder} onChange={e => setBulkOrderData({...bulkOrderData, quantityPerOrder: Number(e.target.value)})} />
                    <Input type="number" label="Giảm giá/đơn (VND)" value={bulkOrderData.discountPerOrder} onChange={e => setBulkOrderData({...bulkOrderData, discountPerOrder: Number(e.target.value)})} />
                </div>
                <div className="mt-4">
                    <Select label="Nhân viên tạo đơn" value={bulkOrderData.employeeId} onChange={e => setBulkOrderData({...bulkOrderData, employeeId: e.target.value})}>
                        <option value="">-- Chọn nhân viên --</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </Select>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="secondary" onClick={closeBulkModal}>Hủy</Button>
                    <Button onClick={handleCreateBulkOrders} disabled={loading}>Tạo {bulkOrderData.customerNames.split('\n').filter(n => n.trim() !== '').length} Hóa đơn</Button>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={closeConfirm}
                onConfirm={handleDelete}
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
            />
        </Card>
    );
};

export default ProductsPage;