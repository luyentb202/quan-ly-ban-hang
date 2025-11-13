
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
// Fix: Import Column type for strong typing.
import CrudTemplate, { Column } from '../components/CrudTemplate';
import { Input } from '../components/ui/Input';
import { Customer } from '../types';

const CustomersPage: React.FC = () => {
    const { customers, addCustomer, updateCustomer, deleteCustomer, loading } = useAppContext();

    // Fix: Add explicit type to ensure accessor values are keys of Customer.
    const columns: Column<Customer>[] = [
        { header: 'Tên khách hàng', accessor: 'name' },
        { header: 'Số điện thoại', accessor: 'phone' },
        { header: 'Email', accessor: 'email' },
        { header: 'Địa chỉ', accessor: 'address' },
    ];
    
    const renderForm = (
        currentCustomer: Partial<Customer> | null,
        handleChange: (field: keyof Customer, value: any) => void
    ) => (
        <div className="space-y-4">
            <Input label="Tên khách hàng" value={currentCustomer?.name || ''} onChange={e => handleChange('name', e.target.value)} />
            <Input label="Số điện thoại" value={currentCustomer?.phone || ''} onChange={e => handleChange('phone', e.target.value)} />
            <Input label="Email" type="email" value={currentCustomer?.email || ''} onChange={e => handleChange('email', e.target.value)} />
            <Input label="Địa chỉ" value={currentCustomer?.address || ''} onChange={e => handleChange('address', e.target.value)} />
        </div>
    );

    return (
        <CrudTemplate
            title="Khách hàng"
            data={customers}
            columns={columns}
            renderForm={renderForm}
            onAdd={addCustomer}
            onUpdate={updateCustomer}
            onDelete={deleteCustomer}
            loading={loading}
            initialData={{ name: '', phone: '', email: '', address: '' }}
        />
    );
};

export default CustomersPage;