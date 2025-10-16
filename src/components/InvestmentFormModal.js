import React, { useState, useEffect } from 'react';
import GenericFormModal from './GenericFormModal';

export default function InvestmentFormModal({ 
    isOpen, 
    editingInvestment, 
    onSubmit, 
    onClose, 
    formErrors 
}) {
    const [formData, setFormData] = useState({ name: '', notes: '' });

    useEffect(() => {
        if (isOpen) {
            if (editingInvestment) {
                setFormData({
                    name: editingInvestment.name || '',
                    notes: editingInvestment.notes || ''
                });
            } else {
                setFormData({ name: '', notes: '' });
            }
        }
    }, [editingInvestment, isOpen]);

    const handleSubmit = () => {
        onSubmit(formData);
    };

    const fields = [
        {
            name: 'name',
            label: 'Nombre',
            type: 'text',
            placeholder: 'Nombre de la inversión',
            required: true
        },
        {
            name: 'notes',
            label: 'Notas',
            type: 'textarea',
            placeholder: 'Detalles adicionales sobre esta inversión',
            rows: 3
        }
    ];

    return (
        <GenericFormModal
            isOpen={isOpen}
            title={editingInvestment ? 'Editar Inversión' : 'Nueva Inversión'}
            editingItem={editingInvestment}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onClose={onClose}
            formErrors={formErrors}
            fields={fields}
        />
    );
}
