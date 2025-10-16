import React from 'react';

/**
 * Reusable DataTable component for consistent table styling across the app
 * @param {Object} props
 * @param {Array} props.columns - Array of column definitions
 * @param {Array} props.data - Array of data objects
 * @param {Function} props.renderRow - Function to render each row
 * @param {boolean} props.loading - Whether data is loading
 * @param {React.Component} props.emptyState - Component to show when no data
 * @param {string} props.className - Additional CSS classes
 */
export default function DataTable({ 
    columns = [], 
    data = [], 
    renderRow, 
    loading = false, 
    emptyState = null,
    className = ''
}) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (data.length === 0 && emptyState) {
        return emptyState;
    }

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="table">
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th 
                                key={index}
                                className={column.headerClassName || ''}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => renderRow(item, index))}
                </tbody>
            </table>
        </div>
    );
}
