import { useState } from 'react';
import api from '../api';

/**
 * Custom hook for handling transaction submission logic
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Callback when transaction is successful
 * @param {Function} options.onError - Callback when transaction fails
 * @param {Function} options.onClose - Callback to close modal/form
 * @param {Function} options.onRefresh - Callback to refresh data
 */
const useTransactionSubmit = ({ onSuccess, onError, onClose, onRefresh }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const handleTransactionSubmit = async (payload) => {
        setFormErrors({});
        setIsSubmitting(true);

        try {
            // Handle recurring transactions that were already processed
            if (payload && payload.success) {
                onSuccess('Transacciones creadas exitosamente');
                onClose();
                onRefresh();
                return;
            }

            // Handle normal transactions
            if (payload && payload.id) {
                // Editing existing transaction - remove id from payload
                const { id, ...updatePayload } = payload;
                await api.put(`/transactions/${id}/`, updatePayload);
                onSuccess('Transacción actualizada exitosamente');
            } else {
                // Creating new transaction
                await api.post('/transactions/', payload);
                onSuccess('Transacción creada exitosamente');
            }

            onClose();
            onRefresh();
        } catch (error) {
            console.error('Error creating/updating transaction:', error);
            
            if (error.response?.data) {
                const errorData = error.response.data;
                
                // Handle field validation errors
                if (typeof errorData === 'object' && !errorData.detail) {
                    setFormErrors(errorData);
                    onError('Por favor corrige los errores en el formulario');
                } else {
                    // Handle general errors
                    onError(errorData.detail || 'Error al guardar la transacción');
                }
            } else {
                onError('Error al guardar la transacción');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        handleSubmit: handleTransactionSubmit,
        isSubmitting,
        formErrors,
        setFormErrors
    };
};

export default useTransactionSubmit;
