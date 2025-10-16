import React, { useState, useEffect } from 'react';
import GenericFormModal from './GenericFormModal';

export default function TransactionFormModal({ 
    isOpen,
    editingTransaction,
    onSubmit,
    onClose,
    accounts = [],
    concepts = [],
    months = [],
    formErrors = {}
}) {
    const [formData, setFormData] = useState({
        amount: '',
        detail: '',
        account_id: '',
        concept_id: '',
        month_id: ''
    });

    useEffect(() => {
        if (editingTransaction) {
            const accountId = editingTransaction.account?.id || editingTransaction.account_id;
            const conceptId = editingTransaction.concept?.id || editingTransaction.concept_id;
            const monthId = editingTransaction.month?.id || editingTransaction.month_id;
            
            const isNewWithPreselectedAccount = !editingTransaction.amount && !editingTransaction.id;
            
            if (!isNewWithPreselectedAccount) {
                setFormData({
                    amount: editingTransaction.amount,
                    detail: editingTransaction.detail || '',
                    account_id: accountId,
                    concept_id: conceptId || '',
                    month_id: monthId
                });
            } else {
                setFormData(prev => ({
                    ...prev,
                    account_id: accountId
                }));
            }
        } else {
            setFormData({
                amount: '',
                detail: '',
                account_id: '',
                concept_id: '',
                month_id: ''
            });
        }
    }, [editingTransaction, isOpen]);

    // Set current month as default for new transactions
    useEffect(() => {
        if (months.length > 0 && (!editingTransaction || !editingTransaction.month_id)) {
            const currentDate = new Date();
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                              'July', 'August', 'September', 'October', 'November', 'December'];
            const currentMonthName = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
            
            const currentMonth = months.find(month => month.name === currentMonthName);
            
            if (currentMonth) {
                setFormData(prev => ({...prev, month_id: currentMonth.id}));
            } else {
                const sortedMonths = [...months].sort((a, b) => b.name.localeCompare(a.name));
                if (sortedMonths.length > 0) {
                    setFormData(prev => ({...prev, month_id: sortedMonths[0].id}));
                }
            }
        }
    }, [months, editingTransaction]);

    const formatAmountForDisplay = (value) => {
        if (!value) return '';
        return value.toString().replace('.', ',');
    };
    
    const parseAmountFromInput = (value) => {
        if (!value) return '';
        
        if (value.includes('.')) {
            if (value.includes(',')) {
                return value.replace(/\./g, '').replace(',', '.');
            } else {
                return value;
            }
        } else {
            return value.replace(',', '.');
        }
    };
    
    const handleAmountChange = (e) => {
        const inputValue = e.target.value;
        if (!/^-?[\d.,]*$/.test(inputValue)) return;
        
        const parsedValue = parseAmountFromInput(inputValue);
        setFormData(prev => ({...prev, amount: parsedValue}));
    };

    const handleSubmit = () => {
        const payload = {
            amount: parseFloat(formData.amount),
            detail: formData.detail,
            account: parseInt(formData.account_id),
            concept: formData.concept_id ? parseInt(formData.concept_id) : null,
            month: parseInt(formData.month_id)
        };
        
        onSubmit(payload);
    };

    const fields = [
        {
            name: 'amount',
            label: 'Monto',
            type: 'text',
            placeholder: '0,00',
            required: true,
            customHandler: handleAmountChange,
            customValue: formatAmountForDisplay(formData.amount)
        },
        {
            name: 'account_id',
            label: 'Cuenta',
            type: 'searchable-select',
            placeholder: 'Buscar cuenta...',
            required: true,
            options: accounts,
            displayKey: 'name',
            valueKey: 'id'
        },
        {
            name: 'concept_id',
            label: 'Concepto (Opcional)',
            type: 'searchable-select',
            placeholder: 'Buscar concepto...',
            options: concepts,
            displayKey: 'name',
            valueKey: 'id',
            additionalInfo: (concept) => `(${concept.is_income ? 'Ingreso' : 'Gasto'})`
        },
        {
            name: 'month_id',
            label: 'Mes',
            type: 'searchable-select',
            placeholder: 'Buscar mes...',
            required: true,
            options: months,
            displayKey: 'name',
            valueKey: 'id'
        },
        {
            name: 'detail',
            label: 'Detalle (Opcional)',
            type: 'textarea',
            placeholder: 'Detalles de la transacción...',
            rows: 3
        }
    ];

    return (
        <GenericFormModal
            isOpen={isOpen}
            title={editingTransaction ? 'Editar Transacción' : 'Nueva Transacción'}
            editingItem={editingTransaction}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onClose={onClose}
            formErrors={formErrors}
            fields={fields}
        />
    );
}
