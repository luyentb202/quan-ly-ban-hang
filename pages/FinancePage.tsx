
import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Plus, Trash2, Edit } from 'lucide-react';

type Transaction = { id: string; type: 'income' | 'expense' } & (
    { type: 'income', data: { description: string; amount: number; categoryName: string; createdAt: string } } |
    { type: 'expense', data: { description: string; amount: number; categoryName: string; createdAt: string } }
);

const FinancePage: React.FC = () => {
    const { incomes, expenses, incomeCategories, expenseCategories, addIncome, addExpense, deleteIncome, deleteExpense, addIncomeCategory, addExpenseCategory, deleteIncomeCategory, deleteExpenseCategory, loading } = useAppContext();
    const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
    const [newTransaction, setNewTransaction] = useState({ description: '', amount: 0, categoryId: '' });
    const [newCategory, setNewCategory] = useState({ name: '', type: 'expense' });
    const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'income' | 'expense' | 'incomeCat' | 'expenseCat' } | null>(null);

    const combinedTransactions: Transaction[] = [
        ...incomes.map(i => ({ id: i.id, type: 'income' as const, data: { ...i } })),
        ...expenses.map(e => ({ id: e.id, type: 'expense' as const, data: { ...e } }))
    ].sort((a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime());

    const openTransactionModal = (type: 'income' | 'expense') => {
        setTransactionType(type);
        setNewTransaction({ description: '', amount: 0, categoryId: '' });
        setTransactionModalOpen(true);
    };

    const handleSaveTransaction = async () => {
        if (!newTransaction.description || newTransaction.amount <= 0 || !newTransaction.categoryId) return;
        if (transactionType === 'income') {
            const category = incomeCategories.find(c => c.id === newTransaction.categoryId);
            await addIncome({ ...newTransaction, categoryName: category?.name || '' });
        } else {
            const category = expenseCategories.find(c => c.id === newTransaction.categoryId);
            await addExpense({ ...newTransaction, categoryName: category?.name || '' });
        }
        setTransactionModalOpen(false);
    };
    
    const handleSaveCategory = async () => {
        if (!newCategory.name) return;
        if (newCategory.type === 'income') {
            await addIncomeCategory({ name: newCategory.name });
        } else {
            await addExpenseCategory({ name: newCategory.name });
        }
        setNewCategory({ name: '', type: 'expense' });
    }
    
    const openConfirm = (id: string, type: 'income' | 'expense' | 'incomeCat' | 'expenseCat') => {
        setItemToDelete({id, type});
        setConfirmOpen(true);
    }
    
    const handleDelete = async () => {
        if (!itemToDelete) return;
        switch(itemToDelete.type) {
            case 'income': await deleteIncome(itemToDelete.id); break;
            case 'expense': await deleteExpense(itemToDelete.id); break;
            case 'incomeCat': 
                if (incomes.some(i => i.categoryId === itemToDelete.id)) {
                    alert("Không thể xóa danh mục đang được sử dụng.");
                } else {
                    await deleteIncomeCategory(itemToDelete.id);
                }
                break;
            case 'expenseCat': 
                 if (expenses.some(e => e.categoryId === itemToDelete.id)) {
                    alert("Không thể xóa danh mục đang được sử dụng.");
                } else {
                    await deleteExpenseCategory(itemToDelete.id);
                }
                break;
        }
        setConfirmOpen(false);
    }

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Quản lý Thu/Chi</h2>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => openTransactionModal('income')}>Thêm khoản thu</Button>
                    <Button onClick={() => openTransactionModal('expense')}>Thêm khoản chi</Button>
                    <Button variant="primary" onClick={() => setCategoryModalOpen(true)}>Quản lý danh mục</Button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-4">Ngày</th>
                            <th className="p-4">Mô tả</th>
                            <th className="p-4">Danh mục</th>
                            <th className="p-4">Số tiền</th>
                            <th className="p-4">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {combinedTransactions.map(t => (
                            <tr key={`${t.type}-${t.id}`} className="border-b dark:border-gray-600">
                                <td className="p-4">{formatDate(t.data.createdAt)}</td>
                                <td className="p-4">{t.data.description}</td>
                                <td className="p-4">{t.data.categoryName}</td>
                                <td className={`p-4 font-bold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.data.amount)}
                                </td>
                                <td className="p-4">
                                    <Button size="sm" variant="danger" onClick={() => openConfirm(t.id, t.type)}><Trash2 size={16} /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isTransactionModalOpen} onClose={() => setTransactionModalOpen(false)} title={transactionType === 'income' ? 'Thêm khoản thu' : 'Thêm khoản chi'}>
                <div className="space-y-4">
                    <Input label="Mô tả" value={newTransaction.description} onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })} />
                    <Input type="number" label="Số tiền" value={newTransaction.amount} onChange={e => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })} />
                    <Select label="Danh mục" value={newTransaction.categoryId} onChange={e => setNewTransaction({ ...newTransaction, categoryId: e.target.value })}>
                        <option value="">-- Chọn danh mục --</option>
                        {(transactionType === 'income' ? incomeCategories : expenseCategories).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setTransactionModalOpen(false)}>Hủy</Button>
                        <Button onClick={handleSaveTransaction} disabled={loading}>Lưu</Button>
                    </div>
                </div>
            </Modal>
            
            <Modal isOpen={isCategoryModalOpen} onClose={() => setCategoryModalOpen(false)} title="Quản lý danh mục" size="lg">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-bold mb-2">Danh mục chi</h3>
                        <div className="space-y-2 mb-4">
                            {expenseCategories.map(c => (
                                <div key={c.id} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                    <span>{c.name}</span>
                                    <Button size="sm" variant="danger" onClick={() => openConfirm(c.id, 'expenseCat')}><Trash2 size={14} /></Button>
                                </div>
                            ))}
                        </div>
                         <h3 className="font-bold mb-2">Thêm danh mục chi mới</h3>
                        <div className="flex gap-2">
                           <Input placeholder="Tên danh mục..." value={newCategory.type === 'expense' ? newCategory.name : ''} onChange={e => setNewCategory({name: e.target.value, type: 'expense'})} />
                           <Button onClick={handleSaveCategory} disabled={loading || newCategory.type !== 'expense'}><Plus size={16} /></Button>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold mb-2">Danh mục thu</h3>
                        <div className="space-y-2 mb-4">
                             {incomeCategories.map(c => (
                                <div key={c.id} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                    <span>{c.name}</span>
                                    <Button size="sm" variant="danger" onClick={() => openConfirm(c.id, 'incomeCat')}><Trash2 size={14} /></Button>
                                </div>
                            ))}
                        </div>
                         <h3 className="font-bold mb-2">Thêm danh mục thu mới</h3>
                        <div className="flex gap-2">
                            <Input placeholder="Tên danh mục..." value={newCategory.type === 'income' ? newCategory.name : ''} onChange={e => setNewCategory({name: e.target.value, type: 'income'})} />
                            <Button onClick={handleSaveCategory} disabled={loading || newCategory.type !== 'income'}><Plus size={16} /></Button>
                        </div>
                    </div>
                </div>
            </Modal>
            
            <ConfirmModal isOpen={isConfirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Xác nhận xóa" message="Bạn có chắc chắn muốn xóa mục này?" />
        </Card>
    );
};

export default FinancePage;
