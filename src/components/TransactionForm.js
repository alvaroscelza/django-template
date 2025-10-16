import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';

/**
 * Reusable transaction form component for creating and editing transactions
 * @param {Object} props
 * @param {Object} props.editingTransaction - Transaction to edit (null for new transaction)
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {Function} props.onCancel - Function to call when form is cancelled
 * @param {Array} props.accounts - List of accounts
 * @param {Array} props.concepts - List of concepts
 * @param {Array} props.months - List of months
 */
function TransactionForm({ 
    editingTransaction = null, 
    onSubmit, 
    onCancel,
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
        month_id: '',
        is_recurring: false,
        installments: 1
    });

    const [accountSearch, setAccountSearch] = useState('');
    const [showAccountDropdown, setShowAccountDropdown] = useState(false);
    const [conceptSearch, setConceptSearch] = useState('');
    const [showConceptDropdown, setShowConceptDropdown] = useState(false);
    const [monthSearch, setMonthSearch] = useState('');
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form with editing transaction data or set defaults
    useEffect(() => {
        if (editingTransaction) {
            // Handle nested data structure from serializer with depth=1
            const accountId = editingTransaction.account?.id || editingTransaction.account_id;
            const conceptId = editingTransaction.concept?.id || editingTransaction.concept_id;
            const monthId = editingTransaction.month?.id || editingTransaction.month_id;
            
            // Check if this is a new transaction with just pre-selected account
            const isNewWithPreselectedAccount = !editingTransaction.amount && !editingTransaction.id;
            
            if (!isNewWithPreselectedAccount) {
                setFormData({
                    amount: editingTransaction.amount,
                    detail: editingTransaction.detail || '',
                    account_id: accountId,
                    concept_id: conceptId || '',
                    month_id: monthId,
                    is_recurring: false,
                    installments: 1
                });
            } else {
                // For new transaction with pre-selected account
                setFormData(prev => ({
                    ...prev,
                    account_id: accountId
                }));
                
                // Set current month as default for new transactions with pre-selected account
                if (months.length > 0) {
                    const currentDate = new Date();
                    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                      'July', 'August', 'September', 'October', 'November', 'December'];
                    const currentMonthName = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
                    
                    const currentMonth = months.find(month => month.name === currentMonthName);
                    
                    if (currentMonth) {
                        setFormData(prev => ({...prev, month_id: currentMonth.id}));
                        setMonthSearch(currentMonth.name);
                    } else {
                        // Use the most recent month as fallback
                        const sortedMonths = [...months].sort((a, b) => b.name.localeCompare(a.name));
                        if (sortedMonths.length > 0) {
                            setFormData(prev => ({...prev, month_id: sortedMonths[0].id}));
                            setMonthSearch(sortedMonths[0].name);
                        }
                    }
                }
            }
            
            // Set search fields using nested data if available, otherwise fallback to ID lookup
            const accountName = editingTransaction.account?.name || accounts.find(acc => acc.id === accountId)?.name || '';
            setAccountSearch(accountName);
            
            if (!isNewWithPreselectedAccount) {
                const conceptName = editingTransaction.concept?.name || concepts.find(con => con.id === conceptId)?.name || '';
                setConceptSearch(conceptName);
                
                const monthName = editingTransaction.month?.name || months.find(mon => mon.id === monthId)?.name || '';
                setMonthSearch(monthName);
            }
        } else {
            // Set current month as default for new transactions only
            if (months.length > 0) {
                const currentDate = new Date();
                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                  'July', 'August', 'September', 'October', 'November', 'December'];
                const currentMonthName = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
                
                const currentMonth = months.find(month => month.name === currentMonthName);
                
                if (currentMonth) {
                    setFormData(prev => ({...prev, month_id: currentMonth.id}));
                    setMonthSearch(currentMonth.name);
                } else {
                    // Use the most recent month as fallback
                    const sortedMonths = [...months].sort((a, b) => b.name.localeCompare(a.name));
                    if (sortedMonths.length > 0) {
                        setFormData(prev => ({...prev, month_id: sortedMonths[0].id}));
                        setMonthSearch(sortedMonths[0].name);
                    }
                }
            }
        }
    }, [editingTransaction, accounts, concepts, months, editingTransaction?.id, editingTransaction?.month?.id]);

    const formatAmountForDisplay = (value) => {
        if (!value || value === '') return '';
        // Convert from internal format (dot as decimal) to display format (comma as decimal)
        return value.toString().replace('.', ',');
    };
    
    const parseAmountFromInput = (value) => {
        if (!value) return '';
        
        // Check if the value contains a dot that might be a decimal separator
        if (value.includes('.')) {
            // If there's already a comma, treat the dot as a thousands separator
            if (value.includes(',')) {
                return value.replace(/\./g, '').replace(',', '.');
            } else {
                // If there's no comma, treat the dot as a decimal separator
                return value;
            }
        } else {
            // Original behavior: replace comma with dot
            return value.replace(',', '.');
        }
    };
    
    const handleAmountChange = (e) => {
        const inputValue = e.target.value;
        // Only allow numbers, dots, commas, and minus sign
        if (!/^-?[\d.,]*$/.test(inputValue)) return;
        
        const parsedValue = parseAmountFromInput(inputValue);
        console.log('Amount change:', { inputValue, parsedValue, formDataAmount: formData.amount });
        setFormData({...formData, amount: parsedValue});
    };
    
    const filteredAccounts = useMemo(() => {
        if (!accountSearch.trim()) return accounts;
        return accounts.filter(account => 
            account.name.toLowerCase().includes(accountSearch.toLowerCase())
        );
    }, [accounts, accountSearch]);
    
    const filteredConcepts = useMemo(() => {
        if (!conceptSearch.trim()) return concepts;
        return concepts.filter(concept => 
            concept.name.toLowerCase().includes(conceptSearch.toLowerCase())
        );
    }, [concepts, conceptSearch]);
    
    const filteredMonths = useMemo(() => {
        if (!monthSearch.trim()) return months;
        return months.filter(month => 
            month.name.toLowerCase().includes(monthSearch.toLowerCase())
        );
    }, [months, monthSearch]);
    
    const handleAccountSelect = (account) => {
        setFormData({...formData, account_id: account.id});
        setAccountSearch(account.name);
        setShowAccountDropdown(false);
    };
    
    const handleAccountSearchChange = (e) => {
        const value = e.target.value;
        console.log('Account search change:', { value, accountSearch });
        setAccountSearch(value);
        setShowAccountDropdown(true);
        if (!value.trim()) {
            setFormData({...formData, account_id: ''});
        }
    };
    
    const handleConceptSelect = (concept) => {
        setFormData({...formData, concept_id: concept.id});
        setConceptSearch(concept.name);
        setShowConceptDropdown(false);
    };
    
    const handleConceptSearchChange = (e) => {
        const value = e.target.value;
        setConceptSearch(value);
        setShowConceptDropdown(true);
        if (!value.trim()) {
            setFormData({...formData, concept_id: ''});
        }
    };
    
    const handleMonthSelect = (month) => {
        setFormData({...formData, month_id: month.id});
        setMonthSearch(month.name);
        setShowMonthDropdown(false);
    };
    
    const handleMonthSearchChange = (e) => {
        const value = e.target.value;
        console.log('Month search change:', { value, monthSearch });
        setMonthSearch(value);
        setShowMonthDropdown(true);
        if (!value.trim()) {
            setFormData({...formData, month_id: ''});
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (formData.is_recurring) {
                const payload = {
                    amount: parseFloat(formData.amount),
                    detail: formData.detail,
                    account: parseInt(formData.account_id),
                    concept: formData.concept_id ? parseInt(formData.concept_id) : null,
                    start_month: parseInt(formData.month_id),
                    installments: parseInt(formData.installments)
                };
                
                
                await api.post('/transactions/create_installments/', payload);
                // For recurring transactions, we don't call onSubmit() because we already made the API call
                // We need to signal success to the parent component
                onSubmit({ success: true });
            } else {
                const payload = {
                    amount: parseFloat(formData.amount),
                    detail: formData.detail,
                    account: parseInt(formData.account_id),
                    concept: formData.concept_id ? parseInt(formData.concept_id) : null,
                    month: parseInt(formData.month_id)
                };
                
                // Include the transaction ID if we're editing
                if (editingTransaction && editingTransaction.id) {
                    payload.id = editingTransaction.id;
                }
                
                onSubmit(payload);
            }
        } catch (error) {
            console.error('Error creating transaction(s):', error);
            if (error.response?.data) {
                const errorData = error.response.data;
                if (typeof errorData === 'object' && !errorData.detail) {
                    onSubmit(errorData);
                } else {
                    onSubmit({ detail: errorData.detail || 'Error al crear la(s) transacción(es)' });
                }
            } else {
                onSubmit({ detail: 'Error al crear la(s) transacción(es)' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const getFieldError = (fieldName) => {
        const errors = formErrors[fieldName];
        return errors && errors.length > 0 ? errors[0] : null;
    };


    return (
        <form onSubmit={handleSubmit}>
            <div className="modal-body space-y-4">
                <div className="form-group">
                    <label className="form-label">Monto</label>
                    <input
                        type="text"
                        className={`form-input ${getFieldError('amount') ? 'border-red-500' : ''}`}
                        value={formatAmountForDisplay(formData.amount) ?? ''}
                        onChange={handleAmountChange}
                        placeholder="0,00"
                        required
                    />
                    {getFieldError('amount') && (
                        <div className="text-red-500 text-sm mt-1">{getFieldError('amount')}</div>
                    )}
                </div>

                <div className="form-group relative">
                    <label className="form-label">Cuenta</label>
                    <input
                        type="text"
                        className={`form-input ${getFieldError('account') ? 'border-red-500' : ''}`}
                        placeholder="Buscar cuenta..."
                        value={accountSearch ?? ''}
                        onChange={handleAccountSearchChange}
                        onFocus={() => setShowAccountDropdown(true)}
                        onBlur={() => setTimeout(() => setShowAccountDropdown(false), 200)}
                        required
                    />
                    {showAccountDropdown && filteredAccounts.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                            {filteredAccounts.map((account) => (
                                <div
                                    key={account.id}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                    onMouseDown={() => handleAccountSelect(account)}
                                >
                                    {account.name}
                                </div>
                            ))}
                        </div>
                    )}
                    {getFieldError('account') && (
                        <div className="text-red-500 text-sm mt-1">{getFieldError('account')}</div>
                    )}
                </div>

                <div className="form-group relative">
                    <label className="form-label">Concepto (Opcional)</label>
                    <input
                        type="text"
                        className={`form-input ${getFieldError('concept') ? 'border-red-500' : ''}`}
                        placeholder="Buscar concepto..."
                        value={conceptSearch ?? ''}
                        onChange={handleConceptSearchChange}
                        onFocus={() => setShowConceptDropdown(true)}
                        onBlur={() => setTimeout(() => setShowConceptDropdown(false), 200)}
                    />
                    {showConceptDropdown && filteredConcepts.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                            {filteredConcepts.map((concept) => (
                                <div
                                    key={concept.id}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                    onMouseDown={() => handleConceptSelect(concept)}
                                >
                                    {concept.name} ({concept.is_income ? 'Ingreso' : 'Gasto'})
                                </div>
                            ))}
                        </div>
                    )}
                    {getFieldError('concept') && (
                        <div className="text-red-500 text-sm mt-1">{getFieldError('concept')}</div>
                    )}
                </div>

                <div className="form-group relative">
                    <label className="form-label">Mes</label>
                    <input
                        type="text"
                        className={`form-input ${getFieldError('month') ? 'border-red-500' : ''}`}
                        placeholder="Buscar mes..."
                        value={monthSearch ?? ''}
                        onChange={handleMonthSearchChange}
                        onFocus={() => setShowMonthDropdown(true)}
                        onBlur={() => setTimeout(() => setShowMonthDropdown(false), 200)}
                        required
                    />
                    {showMonthDropdown && filteredMonths.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                            {filteredMonths.map((month) => (
                                <div
                                    key={month.id}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                    onMouseDown={() => handleMonthSelect(month)}
                                >
                                    {month.name}
                                </div>
                            ))}
                        </div>
                    )}
                    {getFieldError('month') && (
                        <div className="text-red-500 text-sm mt-1">{getFieldError('month')}</div>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Detalle (Opcional)</label>
                    <textarea
                        className={`form-input ${getFieldError('detail') ? 'border-red-500' : ''}`}
                        rows="3"
                        value={formData.detail ?? ''}
                        onChange={(e) => setFormData({...formData, detail: e.target.value})}
                        placeholder="Detalles de la transacción..."
                    />
                    {getFieldError('detail') && (
                        <div className="text-red-500 text-sm mt-1">{getFieldError('detail')}</div>
                    )}
                </div>

                <div className="form-group">
                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            id="is_recurring"
                            checked={formData.is_recurring}
                            onChange={(e) => setFormData({...formData, is_recurring: e.target.checked, installments: e.target.checked ? (formData.installments || 1) : 1})}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="is_recurring" className="form-label mb-0">
                            Pago en cuotas
                        </label>
                    </div>
                </div>

                <div className={`form-group ${!formData.is_recurring ? 'hidden' : ''}`}>
                    <label className="form-label">Número de cuotas</label>
                    <input
                        type="number"
                        min="1"
                        max="60"
                        className={`form-input ${getFieldError('installments') ? 'border-red-500' : ''}`}
                        value={formData.installments ?? 1}
                        onChange={(e) => setFormData({...formData, installments: parseInt(e.target.value) || 1})}
                        required={formData.is_recurring}
                    />
                    {getFieldError('installments') && (
                        <div className="text-red-500 text-sm mt-1">{getFieldError('installments')}</div>
                    )}
                </div>
            </div>

            <div className="modal-footer">
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn-secondary"
                >
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting 
                        ? 'Creando...' 
                        : formData.is_recurring 
                            ? `Crear ${formData.installments ?? 1} transacciones`
                            : (formData.transaction_id ? 'Actualizar' : 'Crear')
                    }
                </button>
            </div>
        </form>
    );
}

export default TransactionForm;
