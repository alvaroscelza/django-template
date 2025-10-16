import React, { useState, useEffect } from 'react';
import GenericFormModal from './GenericFormModal';

export default function ConceptFormModal({ 
    isOpen, 
    editingConcept, 
    onSubmit, 
    onClose, 
    formErrors 
}) {
    const [formData, setFormData] = useState({ name: '', is_income: false });

    useEffect(() => {
        if (editingConcept) {
            setFormData({
                name: editingConcept.name || '',
                is_income: editingConcept.is_income || false
            });
        } else {
            setFormData({ name: '', is_income: false });
        }
    }, [editingConcept, isOpen]);

    const handleSubmit = () => {
        onSubmit(formData);
    };

    const fields = [
        {
            name: 'name',
            label: 'Nombre',
            type: 'text',
            placeholder: 'Nombre del concepto',
            required: true
        },
        {
            name: 'is_income',
            label: 'Tipo',
            type: 'radio',
            options: [
                { value: false, label: 'Gasto' },
                { value: true, label: 'Ingreso' }
            ]
        }
    ];

    return (
        <GenericFormModal
            isOpen={isOpen}
            title={editingConcept ? 'Editar Concepto' : 'Nuevo Concepto'}
            editingItem={editingConcept}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onClose={onClose}
            formErrors={formErrors}
            fields={fields}
        />
    );
}
