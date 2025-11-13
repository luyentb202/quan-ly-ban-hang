
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
// Fix: Import Column type for strong typing.
import CrudTemplate, { Column } from '../components/CrudTemplate';
import { Input } from '../components/ui/Input';
import { Employee } from '../types';

const EmployeesPage: React.FC = () => {
    const { employees, addEmployee, updateEmployee, deleteEmployee, loading } = useAppContext();

    // Fix: Add explicit type to ensure accessor values are keys of Employee.
    const columns: Column<Employee>[] = [
        { header: 'Tên nhân viên', accessor: 'name' },
        { header: 'Số điện thoại', accessor: 'phone' },
        { header: 'Email', accessor: 'email' },
        { header: 'Chức vụ', accessor: 'position' },
        { header: 'Ngày vào làm', accessor: 'startDate', render: (date: string) => new Date(date).toLocaleDateString('vi-VN') },
    ];
    
    const renderForm = (
        currentEmployee: Partial<Employee> | null,
        handleChange: (field: keyof Employee, value: any) => void
    ) => (
        <div className="space-y-4">
            <Input label="Tên nhân viên" value={currentEmployee?.name || ''} onChange={e => handleChange('name', e.target.value)} />
            <Input label="Số điện thoại" value={currentEmployee?.phone || ''} onChange={e => handleChange('phone', e.target.value)} />
            <Input label="Email" type="email" value={currentEmployee?.email || ''} onChange={e => handleChange('email', e.target.value)} />
            <Input label="Chức vụ" value={currentEmployee?.position || ''} onChange={e => handleChange('position', e.target.value)} />
            <Input label="Ngày vào làm" type="date" value={currentEmployee?.startDate ? new Date(currentEmployee.startDate).toISOString().split('T')[0] : ''} onChange={e => handleChange('startDate', e.target.value)} />
        </div>
    );

    return (
        <CrudTemplate
            title="Nhân viên"
            data={employees}
            columns={columns}
            renderForm={renderForm}
            onAdd={addEmployee}
            onUpdate={updateEmployee}
            onDelete={deleteEmployee}
            loading={loading}
            initialData={{ name: '', phone: '', email: '', position: '', startDate: new Date().toISOString() }}
        />
    );
};

export default EmployeesPage;