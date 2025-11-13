
import React, { useState, useMemo } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { ConfirmModal } from './ui/ConfirmModal';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

// Fix: Export the Column interface so it can be used in other files.
export interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (value: any) => React.ReactNode;
}

interface CrudTemplateProps<T extends { id: string }> {
  title: string;
  data: T[];
  columns: Column<T>[];
  renderForm: (item: Partial<T> | null, handleChange: (field: keyof T, value: any) => void) => React.ReactNode;
  onAdd: (item: Omit<T, 'id' | 'createdAt'>) => Promise<void>;
  onUpdate: (id: string, item: Partial<T>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading: boolean;
  initialData: Omit<T, 'id' | 'createdAt'>;
}

function CrudTemplate<T extends { id: string }>(
  { title, data, columns, renderForm, onAdd, onUpdate, onDelete, loading, initialData }: CrudTemplateProps<T>
) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<T> | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() =>
    data.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    ),
    [data, searchTerm]
  );

  const openModal = (item: Partial<T> | null = null) => {
    // Fix: Cast initialData to Partial<T> to match the state type.
    setCurrentItem(item ? { ...item } : ({ ...initialData } as Partial<T>));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentItem(null);
  };

  const openConfirm = (id: string) => {
    setItemToDelete(id);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setItemToDelete(null);
    setConfirmOpen(false);
  };

  const handleSave = async () => {
    if (!currentItem) return;
    const currentData = { ...currentItem };
    
    if ('id' in currentData && currentData.id) {
        // Fix: Avoid destructuring generics which can cause type issues.
        // Instead, copy id and delete it from the update payload.
        const id = currentData.id;
        delete currentData.id;
        await onUpdate(id, currentData);
    } else {
        await onAdd(currentData as Omit<T, 'id'|'createdAt'>);
    }
    closeModal();
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      await onDelete(itemToDelete);
      closeConfirm();
    }
  };
  
  const handleChange = (field: keyof T, value: any) => {
    setCurrentItem(prev => (prev ? { ...prev, [field]: value } : null));
  };


  return (
    <Card>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h2 className="text-2xl font-bold">{title}</h2>
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
            <Plus size={20} /> Thêm mới
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map(col => <th key={String(col.accessor)} className="p-4">{col.header}</th>)}
              <th className="p-4">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(item => (
              <tr key={item.id} className="border-b dark:border-gray-600">
                {columns.map(col => (
                  <td key={String(col.accessor)} className="p-4">
                    {col.render ? col.render(item[col.accessor]) : String(item[col.accessor])}
                  </td>
                ))}
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openModal(item)}><Edit size={16} /></Button>
                    <Button size="sm" variant="danger" onClick={() => openConfirm(item.id)}><Trash2 size={16} /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={(currentItem as T)?.id ? `Sửa ${title}` : `Thêm ${title}`}>
          {renderForm(currentItem, handleChange)}
          <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={closeModal}>Hủy</Button>
              <Button onClick={handleSave} disabled={loading}>Lưu</Button>
          </div>
      </Modal>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác.`}
      />
    </Card>
  );
}

export default CrudTemplate;