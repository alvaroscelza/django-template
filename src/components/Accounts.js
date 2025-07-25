import React, { useState, useEffect } from 'react';
import api from '../api';
import EmptyState from './EmptyState';

export default function Accounts() {
    const [balancesData, setBalancesData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    // Modal and form state (moved from Accounts.js)
    const [showModal, setShowModal] = React.useState(false);
    const [modalType, setModalType] = React.useState(''); // 'account' or 'grouping'
    const [editingItem, setEditingItem] = React.useState(null);
    const [formData, setFormData] = React.useState({
        name: '',
        priority: 100,
        grouping: ''
    });

    const fetchBalances = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/reports/balances/');
            setBalancesData(response.data);
        } catch (error) {
            if (error.response?.data) {
                setError(error.response.data);
            } else {
                setError({
                    error: 'Error al cargar los balances',
                    message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
                    suggestions: ['Verifica tu conexión a internet', 'Recarga la página']
                });
            }
            console.error('Error fetching balances:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchBalances();
    }, []);

    const formatCurrency = (amount) => {
        return `$${amount.toLocaleString()}`;
    };

    const formatPercentage = (percentage) => {
        return `${percentage.toFixed(1)}%`;
    };

    const getPercentageColor = (actual, ideal) => {
        if (!ideal) return 'text-gray-600';
        const diff = Math.abs(actual - ideal);
        if (diff <= 5) return 'text-green-600';
        if (diff <= 15) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getPercentageStatus = (actual, ideal) => {
        if (!ideal) return 'neutral';
        const diff = Math.abs(actual - ideal);
        if (diff <= 5) return 'good';
        if (diff <= 15) return 'warning';
        return 'danger';
    };

    const renderProgressBar = (actual, ideal) => {
        if (!ideal) return null;
        
        const status = getPercentageStatus(actual, ideal);
        const barColor = {
            good: 'bg-green-500',
            warning: 'bg-yellow-500',
            danger: 'bg-red-500'
        }[status];

        const width = Math.min(actual, 100);

        return (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                    className={`h-2 rounded-full ${barColor} transition-all duration-300`}
                    style={{ width: `${width}%` }}
                ></div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span className="text-gray-700 font-medium">{formatPercentage(ideal)}</span>
                    <span>100%</span>
                </div>
            </div>
        );
    };

    // Add edit/delete handlers for groupings and accounts
    const handleEdit = async (item, type) => {
        if (type === 'account') {
            try {
                // For accounts, we need to fetch the actual account data with ID
                // since balances endpoint doesn't include account IDs
                const response = await api.get(`/accounts/?name=${encodeURIComponent(item.name)}`);
                const accounts = response.data?.results || response.data;
                const accountWithId = Array.isArray(accounts) ? accounts.find(acc => acc.name === item.name) : null;
                
                if (!accountWithId) {
                    setError('No se pudo encontrar la cuenta para editar');
                    return;
                }
                
                setEditingItem(accountWithId);
                setFormData({
                    name: accountWithId.name,
                    priority: 100,
                    grouping: accountWithId.grouping
                });
            } catch (error) {
                setError('Error al cargar datos de la cuenta');
                return;
            }
        } else {
            setEditingItem(item);
            setFormData({
                name: item.name,
                priority: item.priority,
                grouping: ''
            });
        }
        setModalType(type);
        setShowModal(true);
    };

    const handleDelete = async (itemOrId, type) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este elemento?')) return;
        try {
            if (type === 'grouping') {
                await api.delete(`/groupings/${itemOrId}/`);
            } else {
                // Always fetch the account by name to get its ID
                const account = itemOrId;
                const response = await api.get(`/accounts/?name=${encodeURIComponent(account.name)}`);
                const accounts = response.data?.results || response.data;
                const accountWithId = Array.isArray(accounts) ? accounts.find(acc => acc.name === account.name) : null;
                if (!accountWithId) {
                    setError('No se pudo encontrar la cuenta para eliminar');
                    return;
                }
                await api.delete(`/accounts/${accountWithId.id}/`);
            }
            fetchBalances();
        } catch (error) {
            setError(error.response?.data?.detail || 'Error al eliminar');
        }
    };

    const renderAccountRow = (account) => {
        const hasIdealPercentage = account.has_ideal_percentage;
        return (
            <tr key={account.name} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <i className="fas fa-credit-card text-gray-400 mr-3"></i>
                        <span className="text-sm font-medium text-gray-900">{account.name}</span>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-medium ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(account.balance)}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                    {hasIdealPercentage ? (
                        <div>
                            <span className={`text-sm font-medium ${getPercentageColor(account.percentage, account.ideal_percentage)}`}>
                                {formatPercentage(account.percentage)}
                            </span>
                            <div className="text-xs text-gray-500">
                                Meta: {formatPercentage(account.ideal_percentage)}
                            </div>
                        </div>
                    ) : (
                        <span className="text-sm text-gray-400">-</span>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                    {account.maximum_trust ? (
                        <span className="text-sm text-gray-600">
                            {formatCurrency(account.maximum_trust)}
                        </span>
                    ) : (
                        <span className="text-sm text-gray-400">-</span>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                        onClick={() => handleEdit(account, 'account')}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                        title="Editar cuenta"
                    >
                        <i className="fas fa-edit"></i>
                    </button>
                    <button
                        onClick={() => handleDelete(account, 'account')}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar cuenta"
                    >
                        <i className="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        );
    };

    const renderGroupingCard = (grouping, index) => {
        const hasIdealPercentage = grouping.has_ideal_percentage;
        const status = hasIdealPercentage ? getPercentageStatus(grouping.percentage, grouping.ideal_percentage) : 'neutral';
        const statusColors = {
            good: 'border-green-200 bg-green-50',
            warning: 'border-yellow-200 bg-yellow-50',
            danger: 'border-red-200 bg-red-50',
            neutral: 'border-gray-200 bg-gray-50'
        };
        return (
            <div key={index} className={`card ${statusColors[status]}`}> 
                <div className="card-header flex items-center justify-between">
                    <div className="flex items-center">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <i className="fas fa-layer-group text-blue-600 mr-3"></i>
                            {grouping.name}
                        </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="text-right mr-4">
                            <div className={`text-2xl font-bold ${grouping.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(grouping.total)}
                            </div>
                            {hasIdealPercentage && (
                                <div className="text-sm text-gray-500">
                                    {formatPercentage(grouping.percentage)} de {formatPercentage(grouping.ideal_percentage)}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => handleEdit(grouping, 'grouping')}
                            className="text-blue-600 hover:text-blue-900 mr-2"
                            title="Editar agrupación"
                        >
                            <i className="fas fa-edit"></i>
                        </button>
                        <button
                            onClick={() => handleDelete(grouping.id, 'grouping')}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar agrupación"
                        >
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                {hasIdealPercentage && renderProgressBar(grouping.percentage, grouping.ideal_percentage)}
                <div className="card-body">
                    {grouping.accounts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cuenta
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Balance
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Porcentaje
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Máximo Confianza
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {grouping.accounts.map(account => renderAccountRow(account))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <i className="fas fa-inbox text-gray-400 text-3xl mb-3"></i>
                            <p className="text-gray-500">No hay cuentas en esta agrupación</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="loading-spinner"></div>
                    <span className="ml-2">Cargando balances...</span>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
                        </div>
                        <div className="ml-3 flex-1">
                            <h3 className="text-lg font-semibold text-red-800 mb-2">
                                {typeof error === 'string' ? error : error.error}
                            </h3>
                            {typeof error === 'object' && error.message && (
                                <p className="text-red-700 mb-4">
                                    {error.message}
                                </p>
                            )}
                            {typeof error === 'object' && error.suggestions && error.suggestions.length > 0 && (
                                <div>
                                    <p className="text-red-700 font-medium mb-2">Qué puedes hacer:</p>
                                    <ul className="list-disc list-inside text-red-700 space-y-1">
                                        {error.suggestions.map((suggestion, index) => (
                                            <li key={index}>{suggestion}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        if (!balancesData) {
            return (
                <div className="text-center py-12">
                    <p className="text-gray-600">Preparando balances...</p>
                </div>
            );
        }

        // Show empty state if no groupings or all groupings have no accounts
        const hasAccounts = balancesData.groupings && balancesData.groupings.some(g => g.accounts && g.accounts.length > 0);
        if (!balancesData.groupings || balancesData.groupings.length === 0 || !hasAccounts) {
            return (
                <div className="card">
                    <div className="card-body">
                        <EmptyState
                            iconClass="fas fa-credit-card"
                            title="Sin cuentas aún"
                            description="Crea tu primera cuenta o agrupación para comenzar a organizar tus finanzas"
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {/* Groupings */}
                <div className="space-y-6">
                    {balancesData.groupings.map((grouping, index) => renderGroupingCard(grouping, index))}
                </div>
            </div>
        );
    };

    // Modal open helpers
    const openModal = (type) => {
        setModalType(type);
        setEditingItem(null);
        setFormData({ name: '', priority: 100, grouping: '' });
        setShowModal(true);
    };

    // Add form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (modalType === 'grouping') {
                const payload = {
                    name: formData.name,
                    priority: parseInt(formData.priority)
                };
                if (editingItem) {
                    await api.put(`/groupings/${editingItem.id}/`, payload);
                } else {
                    await api.post('/groupings/', payload);
                }
            } else {
                if (!formData.grouping || formData.grouping === '') {
                    setError('Debes seleccionar una agrupación');
                    return;
                }
                
                const payload = {
                    name: formData.name,
                    grouping: parseInt(formData.grouping)
                };
                
                if (editingItem) {
                    await api.put(`/accounts/${editingItem.id}/`, payload);
                } else {
                    await api.post('/accounts/', payload);
                }
            }
            setShowModal(false);
            setEditingItem(null);
            setFormData({ name: '', priority: 100, grouping: '' });
            fetchBalances();
        } catch (error) {
            if (error.response?.data) {
                const errorData = error.response.data;
                if (errorData.detail) {
                    setError(errorData.detail);
                } else {
                    const fieldErrors = Object.entries(errorData)
                        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                        .join('\n');
                    setError(fieldErrors);
                }
            } else {
                setError('Error al guardar');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold text-gray-900">Cuentas</h1>
                </div>
                <div className="space-x-2">
                    <button
                        onClick={() => openModal('grouping')}
                        className="btn-secondary"
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Agregar Agrupación
                    </button>
                    <button
                        onClick={() => openModal('account')}
                        className="btn-primary"
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Agregar Cuenta
                    </button>
                </div>
            </div>

            {/* Modal for add/edit grouping/account */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingItem ? 'Editar' : 'Agregar'} {modalType === 'grouping' ? 'Agrupación' : 'Cuenta'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="modal-close"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Nombre</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required
                                    />
                                </div>
                                {modalType === 'grouping' && (
                                    <div className="form-group">
                                        <label className="form-label">Prioridad</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                            required
                                        />
                                    </div>
                                )}
                                {modalType === 'account' && (
                                    <div className="form-group">
                                        <label className="form-label">Agrupación</label>
                                        <select
                                            className="form-select"
                                            value={formData.grouping}
                                            onChange={(e) => setFormData({...formData, grouping: e.target.value})}
                                            required
                                        >
                                            <option key="empty" value="">Seleccionar una agrupación</option>
                                            {balancesData && balancesData.groupings && balancesData.groupings.map((grouping) => (
                                                <option key={grouping.id} value={grouping.id}>
                                                    {grouping.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingItem ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {renderContent()}
        </div>
    );
}