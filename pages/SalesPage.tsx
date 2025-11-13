
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { formatCurrency } from '../utils/helpers';
import { Plus, Trash2, Search, XCircle } from 'lucide-react';
import { Product, SaleItem, SaleStatus, Customer } from '../types';
import { Modal } from '../components/ui/Modal';

const SalesPage: React.FC = () => {
    const { products, customers, employees, addSale, addCustomer, loading } = useAppContext();
    const [cart, setCart] = useState<SaleItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [discount, setDiscount] = useState(0);
    
    const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.barcode.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const handleAddToCart = (product: Product, quantity: number) => {
        if (quantity <= 0 || quantity > product.quantityInStock) return;

        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.productId === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: Math.min(item.quantity + quantity, product.quantityInStock) }
                        : item
                );
            }
            return [...prevCart, {
                productId: product.id,
                productName: product.name,
                quantity,
                price: product.sellingPrice,
                purchasePrice: product.purchasePrice
            }];
        });
    };
    
    const handleUpdateQuantity = (productId: string, newQuantity: number) => {
        const product = products.find(p => p.id === productId);
        if (!product || newQuantity < 0 || newQuantity > product.quantityInStock) return;
        if (newQuantity === 0) {
            handleRemoveFromCart(productId);
            return;
        }
        setCart(cart.map(item => item.productId === productId ? { ...item, quantity: newQuantity } : item));
    };

    const handleRemoveFromCart = (productId: string) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const cartTotals = useMemo(() => {
        const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const finalAmount = totalAmount - discount;
        return { totalAmount, finalAmount };
    }, [cart, discount]);
    
    const handleCreateSale = async () => {
        if (cart.length === 0 || !selectedEmployeeId) {
            alert('Vui lòng thêm sản phẩm vào giỏ hàng và chọn nhân viên.');
            return;
        }

        const customer = customers.find(c => c.id === selectedCustomerId);
        const employee = employees.find(e => e.id === selectedEmployeeId);

        await addSale({
            items: cart,
            totalAmount: cartTotals.totalAmount,
            discount: discount,
            finalAmount: cartTotals.finalAmount,
            status: SaleStatus.Pending,
            customerId: selectedCustomerId || undefined,
            customerName: selectedCustomerId ? (customer?.name ?? 'Khách lẻ') : 'Khách lẻ',
            employeeId: selectedEmployeeId,
            employeeName: employee?.name ?? 'Không rõ',
            notes: ''
        });

        setCart([]);
        setDiscount(0);
        setSelectedCustomerId('');
        setSelectedEmployeeId('');
    };
    
    const handleAddNewCustomer = async () => {
        if (!newCustomer.name || !newCustomer.phone) {
            alert('Vui lòng nhập tên và số điện thoại khách hàng.');
            return;
        }
        await addCustomer(newCustomer);
        setCustomerModalOpen(false);
        setNewCustomer({ name: '', phone: '', address: '' });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
            {/* Products List */}
            <div className="lg:col-span-2 flex flex-col h-full">
                <Card className="flex-shrink-0 mb-4">
                    <div className="relative">
                        <Input 
                            type="text"
                            placeholder="Tìm kiếm sản phẩm theo tên hoặc mã vạch..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                </Card>
                <div className="flex-grow overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Invoice */}
            <div className="flex flex-col h-full">
                <Card className="flex-grow flex flex-col">
                    <h2 className="text-xl font-bold mb-4">Hóa đơn</h2>
                    <div className="flex-grow overflow-y-auto -mx-6 px-6">
                        {cart.length === 0 ? (
                            <p className="text-gray-500 text-center py-10">Chưa có sản phẩm trong giỏ</p>
                        ) : (
                            <div className="space-y-3">
                                {cart.map(item => (
                                    <div key={item.productId} className="flex items-center gap-3">
                                        <div className="flex-grow">
                                            <p className="font-semibold text-sm">{item.productName}</p>
                                            <p className="text-xs text-gray-500">{formatCurrency(item.price)}</p>
                                        </div>
                                        <Input
                                            type="number"
                                            className="w-16 text-center"
                                            value={item.quantity}
                                            onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value) || 0)}
                                            min="0"
                                            max={products.find(p => p.id === item.productId)?.quantityInStock}
                                        />
                                        <button onClick={() => handleRemoveFromCart(item.productId)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="mt-4 border-t pt-4 space-y-3">
                        <div className="flex justify-between">
                            <span>Tổng tiền hàng</span>
                            <span className="font-semibold">{formatCurrency(cartTotals.totalAmount)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Giảm giá</span>
                            <Input 
                                type="number"
                                className="w-32 text-right"
                                value={discount}
                                onChange={(e) => setDiscount(Number(e.target.value))}
                            />
                        </div>
                         <div className="flex justify-between text-lg font-bold">
                            <span>Thành tiền</span>
                            <span>{formatCurrency(cartTotals.finalAmount)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)}>
                                <option value="">Khách lẻ</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                            </Select>
                             <Button variant="secondary" size="sm" onClick={() => setCustomerModalOpen(true)}><Plus size={16}/></Button>
                        </div>
                        <Select value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)}>
                            <option value="">-- Chọn nhân viên --</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </Select>
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleCreateSale}
                            disabled={cart.length === 0 || !selectedEmployeeId || loading}
                        >
                            Tạo Hóa đơn
                        </Button>
                    </div>
                </Card>
            </div>
             <Modal isOpen={isCustomerModalOpen} onClose={() => setCustomerModalOpen(false)} title="Thêm khách hàng mới">
                <div className="space-y-4">
                    <Input label="Tên khách hàng" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
                    <Input label="Số điện thoại" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
                    <Input label="Địa chỉ" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setCustomerModalOpen(false)}>Hủy</Button>
                        <Button onClick={handleAddNewCustomer} disabled={loading}>Thêm</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const ProductCard: React.FC<{ product: Product; onAddToCart: (product: Product, quantity: number) => void }> = ({ product, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);
    const isOutOfStock = product.quantityInStock <= 0;

    const handleAdd = () => {
        if (isOutOfStock) return;
        onAddToCart(product, quantity);
        setQuantity(1);
    }

    return (
        <Card className={`relative flex flex-col p-3 ${isOutOfStock ? 'opacity-50' : ''}`}>
            {isOutOfStock && (
                <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-10">
                    <span className="text-white font-bold bg-red-500 px-2 py-1 rounded">Hết hàng</span>
                </div>
            )}
            <div className="flex-grow">
                <p className="font-bold text-sm truncate">{product.name}</p>
                <p className="text-primary-500 font-semibold">{formatCurrency(product.sellingPrice)}</p>
                <p className="text-xs text-gray-500">Tồn kho: {product.quantityInStock}</p>
            </div>
            <div className="flex gap-2 mt-2">
                <Input 
                    type="number" 
                    className="w-16 text-center" 
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    disabled={isOutOfStock}
                    min="1"
                    max={product.quantityInStock}
                />
                <Button onClick={handleAdd} size="sm" className="flex-grow" disabled={isOutOfStock}><Plus size={16} /></Button>
            </div>
        </Card>
    );
}

export default SalesPage;
