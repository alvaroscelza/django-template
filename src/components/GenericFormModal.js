import React from 'react';
import GenericForm from './GenericForm';

const GenericFormModal = ({ 
    isOpen,
    title,
    editingItem,
    formData,
    setFormData,
    onSubmit,
    onClose,
    formErrors = {},
    fields = [],
    submitButtonText = null,
    cancelButtonText = "Cancelar"
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button
                        onClick={onClose}
                        className="modal-close"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <GenericForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={onSubmit}
                    onCancel={onClose}
                    editingItem={editingItem}
                    formErrors={formErrors}
                    fields={fields}
                    submitButtonText={submitButtonText}
                    cancelButtonText={cancelButtonText}
                />
            </div>
        </div>
    );
};

export default GenericFormModal;
