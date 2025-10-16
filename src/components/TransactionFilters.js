import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Component for filtering transactions
 * @param {Object} props
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Function to call when a filter changes
 * @param {Function} props.onClearFilters - Function to call when filters are cleared
 * @param {number} props.resultCount - Number of results after filtering
 * @param {Array} props.accounts - List of accounts for dropdown
 * @param {Array} props.concepts - List of concepts for dropdown
 * @param {Array} props.months - List of months for dropdown
 */
function TransactionFilters({ 
    filters, 
    onFilterChange, 
    onClearFilters,
    resultCount = null,
    accounts = [],
    concepts = [],
    months = []
}) {
    // Search state for each filter type
    const [accountSearch, setAccountSearch] = useState('');
    const [showAccountDropdown, setShowAccountDropdown] = useState(false);
    const [conceptSearch, setConceptSearch] = useState('');
    const [showConceptDropdown, setShowConceptDropdown] = useState(false);
    const [monthSearch, setMonthSearch] = useState('');
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);

    // Refs for positioning dropdowns
    const accountInputRef = useRef(null);
    const conceptInputRef = useRef(null);
    const monthInputRef = useRef(null);

    // State for dropdown positions
    const [accountDropdownPos, setAccountDropdownPos] = useState({ top: 0, left: 0, width: 0 });
    const [conceptDropdownPos, setConceptDropdownPos] = useState({ top: 0, left: 0, width: 0 });
    const [monthDropdownPos, setMonthDropdownPos] = useState({ top: 0, left: 0, width: 0 });

    // Filter the lists based on search terms
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

    // Function to calculate dropdown position
    const calculateDropdownPosition = (inputRef) => {
        if (!inputRef.current) return { top: 0, left: 0, width: 0 };
        
        const rect = inputRef.current.getBoundingClientRect();
        return {
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width
        };
    };

    // Selection handlers
    const handleAccountSelect = (account) => {
        onFilterChange('account', account.id);
        setAccountSearch(account.name);
        setShowAccountDropdown(false);
    };
    
    const handleAccountSearchChange = (e) => {
        const value = e.target.value;
        setAccountSearch(value);
        if (value.trim()) {
            setAccountDropdownPos(calculateDropdownPosition(accountInputRef));
            setShowAccountDropdown(true);
        } else {
            setShowAccountDropdown(false);
            onFilterChange('account', '');
        }
    };

    const handleAccountFocus = () => {
        if (accountSearch.trim() || filteredAccounts.length > 0) {
            setAccountDropdownPos(calculateDropdownPosition(accountInputRef));
            setShowAccountDropdown(true);
        }
    };
    
    const handleConceptSelect = (concept) => {
        onFilterChange('concept', concept.id);
        setConceptSearch(concept.name);
        setShowConceptDropdown(false);
    };
    
    const handleConceptSearchChange = (e) => {
        const value = e.target.value;
        setConceptSearch(value);
        if (value.trim()) {
            setConceptDropdownPos(calculateDropdownPosition(conceptInputRef));
            setShowConceptDropdown(true);
        } else {
            setShowConceptDropdown(false);
            onFilterChange('concept', '');
        }
    };

    const handleConceptFocus = () => {
        if (conceptSearch.trim() || filteredConcepts.length > 0) {
            setConceptDropdownPos(calculateDropdownPosition(conceptInputRef));
            setShowConceptDropdown(true);
        }
    };
    
    const handleMonthSelect = (month) => {
        onFilterChange('month', month.id);
        setMonthSearch(month.name);
        setShowMonthDropdown(false);
    };
    
    const handleMonthSearchChange = (e) => {
        const value = e.target.value;
        setMonthSearch(value);
        if (value.trim()) {
            setMonthDropdownPos(calculateDropdownPosition(monthInputRef));
            setShowMonthDropdown(true);
        } else {
            setShowMonthDropdown(false);
            onFilterChange('month', '');
        }
    };

    const handleMonthFocus = () => {
        if (monthSearch.trim() || filteredMonths.length > 0) {
            setMonthDropdownPos(calculateDropdownPosition(monthInputRef));
            setShowMonthDropdown(true);
        }
    };

    const handleClearFilters = () => {
        onClearFilters();
        setAccountSearch('');
        setConceptSearch('');
        setMonthSearch('');
    };

    // Effect to set search text when filters are applied from URL
    useEffect(() => {
        if (filters.account) {
            const selectedAccount = accounts.find(acc => acc.id == filters.account);
            if (selectedAccount) {
                setAccountSearch(selectedAccount.name);
            }
        }
        if (filters.concept) {
            const selectedConcept = concepts.find(concept => concept.id == filters.concept);
            if (selectedConcept) {
                setConceptSearch(selectedConcept.name);
            }
        }
        if (filters.month) {
            const selectedMonth = months.find(month => month.id == filters.month);
            if (selectedMonth) {
                setMonthSearch(selectedMonth.name);
            }
        }
    }, [filters, accounts, concepts, months]);

    return (
        <>
            <div className="card">
                <div className="card-body">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        <i className="fas fa-search mr-2"></i>
                        Filtros de Búsqueda
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="form-group relative">
                            <label className="form-label">Filtrar por Cuenta</label>
                            <input
                                ref={accountInputRef}
                                type="text"
                                className="form-input"
                                placeholder="Buscar cuenta..."
                                value={accountSearch}
                                onChange={handleAccountSearchChange}
                                onFocus={handleAccountFocus}
                                onBlur={() => setTimeout(() => setShowAccountDropdown(false), 200)}
                            />
                        </div>

                        <div className="form-group relative">
                            <label className="form-label">Filtrar por Concepto</label>
                            <input
                                ref={conceptInputRef}
                                type="text"
                                className="form-input"
                                placeholder="Buscar concepto..."
                                value={conceptSearch}
                                onChange={handleConceptSearchChange}
                                onFocus={handleConceptFocus}
                                onBlur={() => setTimeout(() => setShowConceptDropdown(false), 200)}
                            />
                        </div>

                        <div className="form-group relative">
                            <label className="form-label">Filtrar por Mes</label>
                            <input
                                ref={monthInputRef}
                                type="text"
                                className="form-input"
                                placeholder="Buscar mes..."
                                value={monthSearch}
                                onChange={handleMonthSearchChange}
                                onFocus={handleMonthFocus}
                                onBlur={() => setTimeout(() => setShowMonthDropdown(false), 200)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label invisible">Acciones</label>
                            <button
                                onClick={handleClearFilters}
                                className="btn-secondary w-full"
                                disabled={!filters.account && !filters.concept && !filters.month}
                            >
                                <i className="fas fa-times mr-2"></i>
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>

                    {/* Filter Results Summary */}
                    {(filters.account || filters.concept || filters.month) && resultCount !== null && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="flex items-center text-blue-800">
                                <i className="fas fa-info-circle mr-2"></i>
                                <span className="text-sm">
                                    Mostrando {resultCount} transacciones
                                    {filters.account && (
                                        <span> de la cuenta "{accounts.find(a => a.id == filters.account)?.name}"</span>
                                    )}
                                    {(filters.account && (filters.concept || filters.month)) && <span> y</span>}
                                    {filters.concept && (
                                        <span> del concepto "{concepts.find(c => c.id == filters.concept)?.name}"</span>
                                    )}
                                    {((filters.account || filters.concept) && filters.month) && <span> y</span>}
                                    {filters.month && (
                                        <span> del mes "{months.find(m => m.id == filters.month)?.name}"</span>
                                    )}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Portal-based dropdowns to bypass overflow clipping */}
            {showAccountDropdown && filteredAccounts.length > 0 && createPortal(
                <div 
                    className="bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
                    style={{
                        position: 'absolute',
                        top: accountDropdownPos.top,
                        left: accountDropdownPos.left,
                        width: accountDropdownPos.width,
                        zIndex: 9999
                    }}
                >
                    {filteredAccounts.map((account) => (
                        <div
                            key={account.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onMouseDown={() => handleAccountSelect(account)}
                        >
                            {account.name}
                        </div>
                    ))}
                </div>,
                document.body
            )}
            
            {showConceptDropdown && filteredConcepts.length > 0 && createPortal(
                <div 
                    className="bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
                    style={{
                        position: 'absolute',
                        top: conceptDropdownPos.top,
                        left: conceptDropdownPos.left,
                        width: conceptDropdownPos.width,
                        zIndex: 9999
                    }}
                >
                    {filteredConcepts.map((concept) => (
                        <div
                            key={concept.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onMouseDown={() => handleConceptSelect(concept)}
                        >
                            {concept.name} ({concept.is_income ? 'Ingreso' : 'Gasto'})
                        </div>
                    ))}
                </div>,
                document.body
            )}
            
            {showMonthDropdown && filteredMonths.length > 0 && createPortal(
                <div 
                    className="bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
                    style={{
                        position: 'absolute',
                        top: monthDropdownPos.top,
                        left: monthDropdownPos.left,
                        width: monthDropdownPos.width,
                        zIndex: 9999
                    }}
                >
                    {filteredMonths.map((month) => (
                        <div
                            key={month.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onMouseDown={() => handleMonthSelect(month)}
                        >
                            {month.name}
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </>
    );
}

export default TransactionFilters;
