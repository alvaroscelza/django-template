import React, { useRef, useCallback } from 'react';
import EmptyState from './EmptyState';
import { formatCurrency } from '../utils/formatting';

/**
 * Component for displaying a list of transactions with infinite scrolling
 * @param {Object} props
 * @param {Array} props.transactions - List of transactions to display
 * @param {Function} props.onEdit - Function to call when edit button is clicked
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 * @param {boolean} props.loading - Whether transactions are loading
 * @param {boolean} props.isLoadingMore - Whether more transactions are being loaded
 * @param {boolean} props.hasMore - Whether there are more transactions to load
 * @param {Function} props.onLoadMore - Function to call when more transactions should be loaded
 */
function TransactionList({
    transactions = [],
    onEdit,
    onDelete,
    loading = false,
    isLoadingMore = false,
    hasMore = false,
    onLoadMore = () => {}
}) {
    // Intersection Observer ref for infinite scrolling
    const observerRef = useRef();
    const lastTransactionRef = useCallback(node => {
        if (isLoadingMore) return;
        
        if (observerRef.current) observerRef.current.disconnect();
        
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                onLoadMore();
            }
        });
        
        if (node) observerRef.current.observe(node);
    }, [isLoadingMore, hasMore, onLoadMore]);

    const formatAmount = (amount) => {
        const num = parseFloat(amount);
        return formatCurrency(num);
    };

    const getAmountStyle = (amount) => {
        const num = parseFloat(amount);
        if (num > 0) return { color: '#059669', fontWeight: '600' };
        if (num < 0) return { color: '#dc2626', fontWeight: '600' };
        return { color: '#6b7280', fontWeight: '600' };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="loading-spinner"></div>
                <span className="ml-2 text-gray-600">Cargando transacciones...</span>
            </div>
        );
    }

    if (!Array.isArray(transactions) || transactions.length === 0) {
        return (
            <EmptyState
                iconClass="fas fa-exchange-alt"
                title="Sin transacciones aún"
                description="Crea tu primera transacción para rastrear tu actividad financiera"
            />
        );
    }

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Monto</th>
                            <th>Cuenta</th>
                            <th>Concepto</th>
                            <th>Detalle</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction, index) => (
                            <tr 
                                key={transaction.id} 
                                ref={index === transactions.length - 1 ? lastTransactionRef : null}
                            >
                                <td>
                                    {transaction.month?.name || 'Mes Desconocido'}
                                </td>
                                <td style={getAmountStyle(transaction.amount)}>
                                    {formatAmount(transaction.amount)}
                                </td>
                                <td>
                                    {transaction.account?.name || 'Cuenta Desconocida'}
                                </td>
                                <td>
                                    {transaction.concept ? (
                                        <span className={`concept-badge ${transaction.concept.is_income ? 'income' : 'expense'}`}>
                                            {transaction.concept.name}
                                        </span>
                                    ) : (
                                        <span className="text-gray-500">Ninguno</span>
                                    )}
                                </td>
                                <td>
                                    <div className="max-w-xs truncate">
                                        {transaction.detail || '-'}
                                    </div>
                                </td>
                                <td>
                                    <button
                                        onClick={() => onEdit(transaction)}
                                        className="text-blue-600 hover:text-blue-900 mr-2"
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button
                                        onClick={() => onDelete(transaction.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Loading indicator for infinite scroll */}
            {isLoadingMore && (
                <div className="flex items-center justify-center py-4">
                    <div className="loading-spinner"></div>
                    <span className="ml-2 text-gray-600">Cargando más transacciones...</span>
                </div>
            )}
            
            {/* End of results indicator */}
            {!hasMore && transactions.length > 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                    No hay más transacciones para cargar
                </div>
            )}
        </div>
    );
}

export default TransactionList;
