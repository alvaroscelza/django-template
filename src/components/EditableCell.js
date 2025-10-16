import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/formatting';
import { useDashboardContext } from '../contexts/DashboardContext';
import api from '../api';

const EditableCell = ({
    conceptData,
    monthData,
    monthIndex,
    isEditing,
    projectionAmount,
    savingProjection,
    onEdit,
    onSave,
    onCancel,
    onAmountChange,
    shouldHighlight,
    isExpense = false,
    isProjected = false,
    onEditProjection,
    onProjectionUpdate,
    hasMismatch = false
}) => {
    const [isEditingInline, setIsEditingInline] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const amount = conceptData?.balance || 0;

    useEffect(() => {
        if (isEditingInline) {
            setEditValue(amount.toString());
        }
    }, [isEditingInline, amount]);

    const handleEditClick = () => {
        setIsEditingInline(true);
        setError('');
    };

    const handleSave = async () => {
        if (!conceptData || !monthData) return;

        setSaving(true);
        setError('');

        try {
            const response = await api.post('/concept-balances/upsert-projection/', {
                concept: conceptData.id,
                month: monthData.id,
                balance: parseFloat(editValue) || 0
            });

            if (response.status === 200 || response.status === 201) {
                setIsEditingInline(false);
                onProjectionUpdate && onProjectionUpdate();
            }
        } catch (error) {
            console.error('Error updating projection:', error);
            setError('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditingInline(false);
        setEditValue('');
        setError('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    if (isProjected && isEditingInline) {
        return (
            <td 
                className="p-2 text-right text-gray-700 relative"
                style={hasMismatch ? { backgroundColor: '#fed7aa' } : {}}
            >
                <div className="flex items-center justify-end gap-2">
                    <div className="flex items-center gap-1">
                        <span className="text-gray-500">$</span>
                        <input
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded disabled:opacity-50"
                            title="Guardar"
                        >
                            <i className="fas fa-check text-xs"></i>
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
                            title="Cancelar"
                        >
                            <i className="fas fa-times text-xs"></i>
                        </button>
                    </div>
                </div>
                {error && (
                    <div className="absolute top-full left-0 right-0 mt-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-1">
                        {error}
                    </div>
                )}
            </td>
        );
    }

    return (
        <td 
            className="p-2 text-right text-gray-700 relative group"
            style={hasMismatch ? { backgroundColor: '#fed7aa' } : {}}
        >
            <div className="flex items-center justify-end gap-2">
                <span className="font-medium text-gray-700">
                    {amount !== 0 ? formatCurrency(amount) : '-'}
                </span>
                {isProjected && (
                    <button
                        onClick={handleEditClick}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar proyección"
                    >
                        <i className="fas fa-pencil-alt text-xs"></i>
                    </button>
                )}
            </div>
        </td>
    );
};

export default EditableCell;