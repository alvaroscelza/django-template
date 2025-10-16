import React from 'react';
import SearchableSelect from './SearchableSelect';

const GenericForm = ({ 
    formData, 
    setFormData, 
    onSubmit, 
    onCancel,
    editingItem,
    formErrors = {},
    fields = [],
    submitButtonText = null,
    cancelButtonText = "Cancelar"
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    const getFieldError = (fieldName) => {
        const errors = formErrors[fieldName];
        return errors && errors.length > 0 ? errors[0] : null;
    };

    const renderField = (field) => {
        const {
            name,
            label,
            type = 'text',
            placeholder = '',
            required = false,
            options = [],
            rows = 3,
            step = null,
            min = null,
            max = null,
            conditional = null,
            customHandler = null,
            customValue = null,
            helpText = null
        } = field;

        // Check if field should be rendered based on conditional logic
        if (conditional && !conditional(formData)) {
            return null;
        }

        const hasError = getFieldError(name);
        const inputClassName = `form-input ${hasError ? 'border-red-500' : ''}`;
        const selectClassName = `form-select ${hasError ? 'border-red-500' : ''}`;
        const textareaClassName = `form-input ${hasError ? 'border-red-500' : ''}`;

        // Use custom value if provided, otherwise use formData
        const fieldValue = customValue !== null ? customValue : (formData[name] || '');
        // Use custom handler if provided, otherwise use default
        const fieldHandler = customHandler || ((e) => setFormData({...formData, [name]: e.target.value}));

        return (
            <div key={name} className="form-group">
                {type === 'searchable-select' ? (
                    <SearchableSelect
                        label={label}
                        value={fieldValue}
                        onChange={(value) => setFormData({...formData, [name]: value})}
                        options={options}
                        placeholder={placeholder}
                        required={required}
                        error={hasError}
                        displayKey={field.displayKey || 'name'}
                        valueKey={field.valueKey || 'id'}
                        additionalInfo={field.additionalInfo}
                    />
                ) : (
                    <>
                        <label className="form-label">{label}</label>
                        
                        {type === 'select' ? (
                            <select
                                className={selectClassName}
                                value={fieldValue}
                                onChange={fieldHandler}
                                required={required}
                            >
                                <option value="">{placeholder || `Seleccionar ${label.toLowerCase()}`}</option>
                                {options.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        ) : type === 'radio' ? (
                            <div className="space-y-2">
                                {options.map((option) => (
                                    <label key={option.value} className="flex items-center">
                                        <input
                                            type="radio"
                                            name={name}
                                            value={option.value}
                                            checked={fieldValue === option.value}
                                            onChange={fieldHandler}
                                            className="mr-2"
                                        />
                                        <span>{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        ) : type === 'textarea' ? (
                            <textarea
                                className={textareaClassName}
                                value={fieldValue}
                                onChange={fieldHandler}
                                placeholder={placeholder}
                                rows={rows}
                                required={required}
                            />
                        ) : (
                            <input
                                type={type}
                                className={inputClassName}
                                value={fieldValue}
                                onChange={fieldHandler}
                                placeholder={placeholder}
                                required={required}
                                step={step}
                                min={min}
                                max={max}
                            />
                        )}
                        
                        {helpText && (
                            <div className="text-sm text-gray-500 mt-1">{helpText}</div>
                        )}
                        
                        {hasError && (
                            <div className="text-red-500 text-sm mt-1">{hasError}</div>
                        )}
                    </>
                )}
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="modal-body">
                {fields.map(renderField)}
            </div>
            <div className="modal-footer">
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-secondary"
                >
                    {cancelButtonText}
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                >
                    {submitButtonText || (editingItem ? 'Actualizar' : 'Crear')}
                </button>
            </div>
        </form>
    );
};

export default GenericForm;
