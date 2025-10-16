import React, { useState, useEffect } from 'react';
import GenericFormModal from './GenericFormModal';

export default function InvestmentEntryFormModal({ 
    isOpen, 
    investmentId, 
    editingEntry, 
    onSubmit, 
    onClose, 
    formErrors,
    isLoading = false
}) {
    const [formData, setFormData] = useState({ 
        date: new Date().toISOString().split('T')[0], 
        amount: '', 
        notes: '' 
    });

    useEffect(() => {
        if (editingEntry) {
            setFormData({
                date: editingEntry.date || new Date().toISOString().split('T')[0],
                amount: editingEntry.amount || '',
                notes: editingEntry.notes || ''
            });
        } else {
            setFormData({ 
                date: new Date().toISOString().split('T')[0], 
                amount: '', 
                notes: '' 
            });
        }
    }, [editingEntry, isOpen]);

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
        onSubmit({
            ...formData,
            amount: parseFloat(formData.amount)
        });
    };

    const fields = [
        {
            name: 'date',
            label: 'Fecha',
            type: 'date',
            required: true
        },
        {
            name: 'amount',
            label: 'Monto',
            type: 'text',
            placeholder: '0,00',
            required: true,
            customHandler: handleAmountChange,
            customValue: formatAmountForDisplay(formData.amount),
            helpText: 'Negativo para ingresar dinero, positivo para retirar'
        },
        {
            name: 'notes',
            label: 'Notas',
            type: 'textarea',
            placeholder: 'Notas del movimiento',
            rows: 3
        }
    ];

    return (
        <GenericFormModal
            isOpen={isOpen}
            title={editingEntry ? 'Editar Movimiento' : 'Nuevo Movimiento'}
            editingItem={editingEntry}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onClose={onClose}
            formErrors={formErrors}
            fields={fields}
            submitButtonText={isLoading ? (
                <>
                    <div className="loading-spinner mr-2" style={{ width: '1rem', height: '1rem' }}></div>
                    {editingEntry ? 'Actualizando...' : 'Agregando...'}
                </>
            ) : (
                editingEntry ? 'Actualizar' : 'Agregar'
            )}
        />
    );
}
