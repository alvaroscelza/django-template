import React from 'react';
import GenericForm from './GenericForm';

const AccountFormRefactored = ({ 
    formData, 
    setFormData, 
    modalType, 
    balancesData, 
    onSubmit, 
    onCancel,
    editingItem 
}) => {
    const getFields = () => {
        const baseFields = [
            {
                name: 'name',
                label: 'Nombre',
                type: 'text',
                required: true
            }
        ];

        if (modalType === 'grouping') {
            return [
                ...baseFields,
                {
                    name: 'position_in_page',
                    label: 'Posición en página',
                    type: 'number',
                    required: true
                }
            ];
        }

        if (modalType === 'account') {
            return [
                ...baseFields,
                {
                    name: 'grouping',
                    label: 'Agrupación',
                    type: 'select',
                    required: true,
                    placeholder: 'Seleccionar una agrupación',
                    options: balancesData?.groupings?.map(grouping => ({
                        value: grouping.id.toString(),
                        label: grouping.name
                    })) || []
                },
                {
                    name: 'notes',
                    label: 'Notas',
                    type: 'textarea',
                    placeholder: 'Notas adicionales sobre la cuenta...',
                    rows: 3
                },
                {
                    name: 'maximum_trust',
                    label: 'Máximo Confianza',
                    type: 'number',
                    step: '0.01',
                    min: '0',
                    placeholder: 'Máximo confianza'
                }
            ];
        }

        return baseFields;
    };

    const fields = [
        ...getFields(),
        {
            name: 'ideal_percentage',
            label: 'Porcentaje Ideal (%)',
            type: 'number',
            step: '0.01',
            min: '0',
            max: '100',
            placeholder: 'Porcentaje ideal (0-100)'
        }
    ];

    return (
        <GenericForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={onSubmit}
            onCancel={onCancel}
            editingItem={editingItem}
            fields={fields}
        />
    );
};

export default AccountFormRefactored;
