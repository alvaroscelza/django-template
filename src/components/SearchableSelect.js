import React, { useState, useMemo } from 'react';

const SearchableSelect = ({ 
    label, 
    value, 
    onChange, 
    options = [], 
    placeholder = 'Buscar...', 
    required = false, 
    error = null,
    displayKey = 'name',
    valueKey = 'id',
    additionalInfo = null
}) => {
    const [search, setSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const filteredOptions = useMemo(() => {
        if (!search.trim()) return options;
        return options.filter(option => 
            option[displayKey].toLowerCase().includes(search.toLowerCase())
        );
    }, [options, search, displayKey]);

    const selectedOption = options.find(option => option[valueKey] == value);
    const displayValue = selectedOption ? selectedOption[displayKey] : search;

    const handleSelect = (option) => {
        onChange(option[valueKey]);
        setSearch(option[displayKey]);
        setShowDropdown(false);
    };

    const handleSearchChange = (e) => {
        const newSearch = e.target.value;
        setSearch(newSearch);
        setShowDropdown(true);
        if (!newSearch.trim()) {
            onChange('');
        }
    };

    const handleFocus = () => {
        setShowDropdown(true);
    };

    const handleBlur = () => {
        setTimeout(() => setShowDropdown(false), 200);
    };

    return (
        <div className="form-group relative">
            <label className="form-label">{label}</label>
            <input
                type="text"
                className={`form-input ${error ? 'border-red-500' : ''}`}
                placeholder={placeholder}
                value={displayValue}
                onChange={handleSearchChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                required={required}
            />
            {showDropdown && filteredOptions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                    {filteredOptions.map((option) => (
                        <div
                            key={option[valueKey]}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onMouseDown={() => handleSelect(option)}
                        >
                            {option[displayKey]}
                            {additionalInfo && additionalInfo(option) && (
                                <span className="text-gray-500 ml-2">
                                    {additionalInfo(option)}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {error && (
                <div className="text-red-500 text-sm mt-1">{error}</div>
            )}
        </div>
    );
};

export default SearchableSelect;
