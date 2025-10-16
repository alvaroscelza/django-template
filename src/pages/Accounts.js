import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import EmptyState from '../components/EmptyState';
import FlashMessage from '../components/FlashMessage';
import TransactionForm from '../components/TransactionForm';
import DataTable from '../components/DataTable';
import TableActions from '../components/TableActions';
import ArchivedAccountsSection from '../components/ArchivedAccountsSection';
import GenericFormModal from '../components/GenericFormModal';
import { formatCurrency, formatPercentage } from '../utils/formatting';
import useTransactionSubmit from '../hooks/useTransactionSubmit';

export default function Accounts() {
    const navigate = useNavigate();
    const [balancesData, setBalancesData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [archivedAccounts, setArchivedAccounts] = React.useState([]);
    const [showArchivedAccounts, setShowArchivedAccounts] = React.useState(false);
    const [loadingArchived, setLoadingArchived] = React.useState(false);
    const [flashMessage, setFlashMessage] = React.useState({ message: '', type: '', visible: false });

    // Modal and form state (moved from Accounts.js)
    const [showModal, setShowModal] = React.useState(false);
    const [modalType, setModalType] = React.useState(''); // 'account' or 'grouping'
    const [editingItem, setEditingItem] = React.useState(null);
    const [formData, setFormData] = React.useState({
        name: '',
        position_in_page: 100,
        grouping: '',
        notes: '',
        maximum_trust: '',
        ideal_percentage: ''
    });
    
    // Transaction modal state
    const [showTransactionModal, setShowTransactionModal] = React.useState(false);
    const [selectedAccount, setSelectedAccount] = React.useState(null);
    const [accountsList, setAccountsList] = React.useState([]);
    const [conceptsList, setConceptsList] = React.useState([]);
    const [monthsList, setMonthsList] = React.useState([]);

    // Use the transaction submit hook
    const { handleSubmit, isSubmitting, formErrors, setFormErrors } = useTransactionSubmit({
        onSuccess: (message) => {
            setError('');
            setFlashMessage({
                message: message,
                type: 'success',
                visible: true
            });
        },
        onError: (errorMessage) => {
            setError(errorMessage);
        },
        onClose: () => {
            setShowTransactionModal(false);
        },
        onRefresh: () => fetchBalances()
    });

    const fetchBalances = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/groupings/balances/');
            const data = response.data; // Get current month data
            setBalancesData({
                month: data.month_name,
                groupings: data.groupings_data,
                total_balance: data.groupings_data.reduce((total, grouping) => total + grouping.balance, 0)
            });
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

    // Function to fetch concepts and months data for the transaction form
    const fetchTransactionFormData = async () => {
        try {
            const [conceptsResponse, monthsResponse] = await Promise.all([
                api.get('/concepts/?archived=false'),
                api.get('/months/')
            ]);

            const conceptsData = conceptsResponse.data?.results || conceptsResponse.data;
            const monthsData = monthsResponse.data?.results || monthsResponse.data;

            setConceptsList(Array.isArray(conceptsData) ? conceptsData : []);
            setMonthsList(Array.isArray(monthsData) ? monthsData : []);
        } catch (error) {
            console.error('Error fetching transaction form data:', error);
            setError('Error al cargar los datos para la transacción');
        }
    };

    const fetchArchivedAccounts = async () => {
        setLoadingArchived(true);
        try {
            const response = await api.get('/accounts/?archived=true');
            setArchivedAccounts(response.data?.results || response.data);
        } catch (error) {
            console.error('Error fetching archived accounts:', error);
            setError('Error al cargar las cuentas archivadas');
        } finally {
            setLoadingArchived(false);
        }
    };

    const handleArchiveAccount = async (account) => {
        try {
            // First get the account ID
            const response = await api.get(`/accounts/?name=${encodeURIComponent(account.name)}`);
            const accounts = response.data?.results || response.data;
            const accountWithId = Array.isArray(accounts) ? accounts.find(acc => acc.name === account.name) : null;
            
            if (!accountWithId) {
                setFlashMessage({
                    message: 'No se pudo encontrar la cuenta para archivar',
                    type: 'error',
                    visible: true
                });
                return;
            }
            
            // Use the new archive endpoint that validates zero balance
            await api.patch(`/accounts/${accountWithId.id}/archive/`);
            fetchBalances();
            if (showArchivedAccounts) {
                fetchArchivedAccounts();
            }
            setFlashMessage({
                message: `La cuenta ${account.name} ha sido archivada exitosamente`,
                type: 'success',
                visible: true
            });
        } catch (error) {
            if (error.response?.data?.error) {
                setFlashMessage({
                    message: error.response.data.error,
                    type: 'error',
                    visible: true
                });
            } else if (error.response?.data?.detail) {
                // Handle validation errors from the archive endpoint
                setFlashMessage({
                    message: error.response.data.detail,
                    type: 'error',
                    visible: true
                });
            } else {
                setFlashMessage({
                    message: 'Error al archivar la cuenta. Asegúrate de que el balance sea cero.',
                    type: 'error',
                    visible: true
                });
            }
        }
    };

    const openTransactionModal = async (account) => {
        try {
            // For accounts, we need to fetch the actual account data with ID
            // since balances endpoint doesn't include account IDs
            const response = await api.get(`/accounts/?name=${encodeURIComponent(account.name)}`);
            const accounts = response.data?.results || response.data;
            const accountInList = Array.isArray(accounts) ? accounts.find(acc => acc.name === account.name) : null;
            
            if (!accountInList) {
                setError('No se pudo encontrar la cuenta para crear transacción');
                return;
            }
            
            setSelectedAccount(accountInList);
            setFormErrors({});
            
            // Fetch concepts and months if not already loaded
            if (conceptsList.length === 0 || monthsList.length === 0) {
                await fetchTransactionFormData();
            }
            
            setShowTransactionModal(true);
        } catch (error) {
            setError('Error al preparar el formulario de transacción');
        }
    };

    const navigateToAccountTransactions = async (account) => {
        try {
            // For accounts, we need to fetch the actual account data with ID
            // since balances endpoint doesn't include account IDs
            const response = await api.get(`/accounts/?name=${encodeURIComponent(account.name)}`);
            const accounts = response.data?.results || response.data;
            const accountInList = Array.isArray(accounts) ? accounts.find(acc => acc.name === account.name) : null;
            
            if (!accountInList) {
                setError('No se pudo encontrar la cuenta para ver transacciones');
                return;
            }
            
            // Navigate to transactions page with account filter
            navigate(`/transactions?account=${accountInList.id}`);
        } catch (error) {
            setError('Error al navegar a las transacciones de la cuenta');
        }
    };

    const handleUnarchiveAccount = async (account) => {
        try {
            // First get the account ID
            const response = await api.get(`/accounts/?name=${encodeURIComponent(account.name)}`);
            const accounts = response.data?.results || response.data;
            const accountWithId = Array.isArray(accounts) ? accounts.find(acc => acc.name === account.name) : null;
            
            if (!accountWithId) {
                setFlashMessage({
                    message: 'No se pudo encontrar la cuenta para desarchivar',
                    type: 'error',
                    visible: true
                });
                return;
            }
            
            // Use PATCH to update the archived field
            await api.patch(`/accounts/${accountWithId.id}/`, { archived: false });
            fetchArchivedAccounts();
            fetchBalances();
            setFlashMessage({
                message: `La cuenta ${account.name} ha sido desarchivada exitosamente`,
                type: 'success',
                visible: true
            });
        } catch (error) {
            setFlashMessage({
                message: error.response?.data?.detail || 'Error al desarchivar la cuenta',
                type: 'error',
                visible: true
            });
        }
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

        // The bar shows the actual percentage directly (not as a ratio)
        // Capped at 100% for display purposes
        const barWidth = Math.min(actual, 100);
        
        return (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2 relative">
                {/* The actual percentage bar */}
                <div 
                    className={`h-2 rounded-full ${barColor} transition-all duration-300`}
                    style={{ width: `${barWidth}%` }}
                ></div>
                
                {/* Ideal percentage marker */}
                <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-gray-800"
                    style={{ left: `${ideal}%` }}
                    title={`Meta: ${formatPercentage(ideal)}`}
                ></div>
                
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span className="text-gray-700 font-medium">{formatPercentage(ideal)}</span>
                    <span>100%</span>
                </div>
            </div>
        );
    };

    const handleEdit = async (item, type) => {
        if (type === 'account') {
            try {
                // For accounts, we need to fetch the actual account data with ID
                // since balances endpoint doesn't include account IDs
                const response = await api.get(`/accounts/?name=${encodeURIComponent(item.name)}`);
                const accounts = response.data?.results || response.data;
                const accountInList = Array.isArray(accounts) ? accounts.find(acc => acc.name === item.name) : null;
                
                if (!accountInList) {
                    setError('No se pudo encontrar la cuenta para editar');
                    return;
                }
                
                // Always fetch the full account data to ensure we have all details
                const fullResponse = await api.get(`/accounts/${accountInList.id}/`);
                const fullAccountData = fullResponse.data;
                
                setEditingItem(fullAccountData);
                
                // Handle nested data structure from serializer with depth=1
                let groupingId = fullAccountData.grouping?.id || fullAccountData.grouping;
                
                // Ensure groupingId is a string for the form
                if (groupingId !== null && groupingId !== undefined) {
                    groupingId = groupingId.toString();
                }
                
                const newFormData = {
                    name: fullAccountData.name,
                    position_in_page: fullAccountData.position_in_page !== undefined ? fullAccountData.position_in_page : 100,
                    grouping: groupingId,
                    notes: fullAccountData.notes || '',
                    maximum_trust: fullAccountData.maximum_trust || '',
                    ideal_percentage: fullAccountData.ideal_percentage || ''
                };
                
                setFormData(newFormData);
                
            } catch (error) {
                setError('Error al cargar datos de la cuenta');
                return;
            }
        } else {
            setEditingItem(item);
            setFormData({
                name: item.name,
                position_in_page: item.position_in_page !== undefined ? item.position_in_page : 100,
                grouping: '',
                notes: '',
                maximum_trust: '',
                ideal_percentage: item.ideal_percentage || ''
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
                // since balances endpoint doesn't include account IDs
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
            setFlashMessage({ message: 'Elemento eliminado con éxito', type: 'success', visible: true });
        } catch (error) {
            setError(error.response?.data?.detail || 'Error al eliminar');
        }
    };

    const renderAccountRow = (account) => {
        // Ensure percentage and ideal_percentage are numbers or default to 0
        const percentage = typeof account.percentage === 'number' ? account.percentage : 0;
        const idealPercentage = typeof account.ideal_percentage === 'number' ? account.ideal_percentage : 0;
        const hasIdealPercentage = account.ideal_percentage !== null && account.ideal_percentage !== undefined;
        
        // Fix NaN percentage issue
        if (isNaN(percentage)) {
            percentage = 0;
        }
        if (isNaN(idealPercentage)) {
            idealPercentage = 0;
        }
        
        return (
            <tr 
                key={account.name}
                onClick={() => navigateToAccountTransactions(account)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                title="Ver transacciones de esta cuenta"
            >
                <td>
                    <div className="flex items-center">
                        <i className="fas fa-credit-card text-gray-400 mr-3"></i>
                        <span className="text-sm font-medium text-gray-900">{account.name}</span>
                    </div>
                </td>
                <td className="text-right">
                    <span className={`text-sm font-medium ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(account.balance)}
                    </span>
                </td>
                <td>
                    {account.notes ? (
                        <span className="text-sm text-gray-700 max-w-xs truncate block" title={account.notes}>
                            {account.notes}
                        </span>
                    ) : (
                        <span className="text-sm text-gray-400">-</span>
                    )}
                </td>
                <td className="text-right">
                    {hasIdealPercentage ? (
                        <div>
                            <span className={`text-sm font-medium ${getPercentageColor(percentage, idealPercentage)}`}>
                                {formatPercentage(percentage)}
                            </span>
                            <div className="text-xs text-gray-500">
                                Meta: {formatPercentage(idealPercentage)}
                            </div>
                        </div>
                    ) : (
                        <span className="text-sm text-gray-400">-</span>
                    )}
                </td>
                <td className="text-right">
                    {account.maximum_trust ? (
                        <span className="text-sm text-gray-600">
                            {formatCurrency(account.maximum_trust)}
                        </span>
                    ) : (
                        <span className="text-sm text-gray-400">-</span>
                    )}
                </td>
                <td>
                    <div className="flex items-center justify-end space-x-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateToAccountTransactions(account);
                            }}
                            className="btn-icon btn-sm text-purple-600 hover:text-purple-700"
                            title="Ver transacciones"
                        >
                            <i className="fas fa-list"></i>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                openTransactionModal(account);
                            }}
                            className="btn-icon btn-sm text-green-600 hover:text-green-700"
                            title="Crear transacción"
                        >
                            <i className="fas fa-plus-circle"></i>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(account, 'account');
                            }}
                            className="btn-icon btn-sm text-blue-600 hover:text-blue-700"
                            title="Editar cuenta"
                        >
                            <i className="fas fa-edit"></i>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleArchiveAccount(account);
                            }}
                            className="btn-icon btn-sm text-yellow-600 hover:text-yellow-700"
                            title="Archivar cuenta"
                        >
                            <i className="fas fa-archive"></i>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(account, 'account');
                            }}
                            className="btn-icon btn-sm text-red-600 hover:text-red-700"
                            title="Eliminar cuenta"
                        >
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        );
    };

    const renderGroupingCard = (grouping, index) => {
        // Ensure percentage is a number or default to 0
        const percentage = typeof grouping.percentage === 'number' ? grouping.percentage : 0;
        const idealPercentage = typeof grouping.ideal_percentage === 'number' ? grouping.ideal_percentage : 0;
        const status = getPercentageStatus(percentage, idealPercentage);
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
                            <div className={`text-2xl font-bold ${grouping.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(grouping.balance)}
                            </div>
                            <div className="text-sm text-gray-500">
                                {formatPercentage(percentage)} de {formatPercentage(idealPercentage)}
                            </div>
                        </div>
                        <button
                            onClick={() => openModal('account', grouping.id)}
                            className="btn-icon btn-sm text-green-600 hover:text-green-700"
                            title="Agregar cuenta"
                        >
                            <i className="fas fa-plus-circle"></i>
                        </button>
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
                {renderProgressBar(percentage, idealPercentage)}
                <div className="card-body">
                    {grouping.accounts.length > 0 ? (
                        <DataTable
                            columns={[
                                { header: 'Cuenta' },
                                { header: 'Balance', headerClassName: 'text-right' },
                                { header: 'Notas' },
                                { header: 'Porcentaje', headerClassName: 'text-right' },
                                { header: 'Máximo Confianza', headerClassName: 'text-right' },
                                { header: 'Acciones', headerClassName: 'text-right' }
                            ]}
                            data={grouping.accounts}
                            renderRow={(account) => renderAccountRow(account)}
                        />
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


    const openModal = (type, groupingId = null) => {
        setModalType(type);
        setEditingItem(null);
        setFormData({ 
            name: '', 
            position_in_page: 100, 
            grouping: groupingId || '', 
            notes: '', 
            maximum_trust: '',
            ideal_percentage: '' 
        });
        setShowModal(true);
    };

    const getFields = () => {
        const baseFields = [
            {
                name: 'name',
                label: 'Nombre',
                type: 'text',
                required: true
            }
        ];

        if (modalType === 'grouping') {
            return [
                ...baseFields,
                {
                    name: 'position_in_page',
                    label: 'Posición en página',
                    type: 'number',
                    required: true
                }
            ];
        }

        if (modalType === 'account') {
            return [
                ...baseFields,
                {
                    name: 'grouping',
                    label: 'Agrupación',
                    type: 'select',
                    required: true,
                    placeholder: 'Seleccionar una agrupación',
                    options: balancesData?.groupings?.map(grouping => ({
                        value: grouping.id.toString(),
                        label: grouping.name
                    })) || []
                },
                {
                    name: 'notes',
                    label: 'Notas',
                    type: 'textarea',
                    placeholder: 'Notas adicionales sobre la cuenta...',
                    rows: 3
                },
                {
                    name: 'maximum_trust',
                    label: 'Máximo Confianza',
                    type: 'number',
                    step: '0.01',
                    min: '0',
                    placeholder: 'Máximo confianza'
                }
            ];
        }

        return baseFields;
    };

    const fields = [
        ...getFields(),
        {
            name: 'ideal_percentage',
            label: 'Porcentaje Ideal (%)',
            type: 'number',
            step: '0.01',
            min: '0',
            max: '100',
            placeholder: 'Porcentaje ideal (0-100)'
        }
    ];

    // Add form submission handler
    const handleFormSubmit = async (e) => {
        if (e) {
            e.preventDefault();
        }
        console.log('Form submitted:', { editingItem, formData, modalType });
        
        try {
            if (modalType === 'grouping') {
                const payload = {
                    name: formData.name,
                    position_in_page: parseInt(formData.position_in_page),
                    ideal_percentage: formData.ideal_percentage || null
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
                    grouping: parseInt(formData.grouping),
                    notes: formData.notes,
                    maximum_trust: formData.maximum_trust,
                    ideal_percentage: formData.ideal_percentage || null
                };
                
                if (editingItem) {
                    console.log('Updating account:', editingItem.id, payload);
                    await api.put(`/accounts/${editingItem.id}/`, payload);
                } else {
                    console.log('Creating account:', payload);
                    await api.post('/accounts/', payload);
                }
            }
            
            // Refresh data first, then close modal
            await fetchBalances();
            setShowModal(false);
            setEditingItem(null);
            setFormData({ 
                name: '', 
                position_in_page: 100, 
                grouping: '', 
                notes: '', 
                maximum_trust: '',
                ideal_percentage: '' 
            });
            setFlashMessage({ 
                message: editingItem ? 'Elemento actualizado con éxito' : 'Elemento creado con éxito', 
                type: 'success', 
                visible: true 
            });
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

    // Debug form data when editing
    if (editingItem && modalType === 'account') {
        console.log('Current form data:', formData);
        console.log('Available groupings:', balancesData?.groupings);
    }
    
    React.useEffect(() => {
        fetchBalances();
    }, []);

    React.useEffect(() => {
        if (showArchivedAccounts) {
            fetchArchivedAccounts();
        }
    }, [showArchivedAccounts]);


    return (
        <div className="space-y-6">
            {/* Flash Message */}
            {flashMessage.visible && (
                <FlashMessage
                    message={flashMessage.message}
                    type={flashMessage.type}
                    duration={5000}
                    onClose={() => setFlashMessage({ ...flashMessage, visible: false })}
                />
            )}
            
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Cuentas</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setShowArchivedAccounts(!showArchivedAccounts)}
                        className="btn-secondary"
                    >
                        <i className={`fas ${showArchivedAccounts ? 'fa-eye-slash' : 'fa-archive'} mr-2`}></i>
                        {showArchivedAccounts ? 'Ocultar Archivadas' : 'Ver Archivadas'}
                    </button>
                    <button
                        onClick={() => openModal('grouping')}
                        className="btn-primary"
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Agregar Agrupación
                    </button>
                </div>
            </div>

            {/* Modal for add/edit grouping/account */}
            <GenericFormModal
                isOpen={showModal}
                title={`${editingItem ? 'Editar' : 'Agregar'} ${modalType === 'grouping' ? 'Agrupación' : 'Cuenta'}`}
                editingItem={editingItem}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleFormSubmit}
                onClose={() => setShowModal(false)}
                fields={fields}
            />

            {showArchivedAccounts && (
                <ArchivedAccountsSection
                    archivedAccounts={archivedAccounts}
                    loadingArchived={loadingArchived}
                    onUnarchive={handleUnarchiveAccount}
                />
            )}

            {renderContent()}

            {/* Transaction Modal */}
            {showTransactionModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">
                                Crear Transacción para {selectedAccount?.name}
                            </h3>
                            <button
                                onClick={() => setShowTransactionModal(false)}
                                className="modal-close"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <TransactionForm
                            editingTransaction={{
                                account: selectedAccount,
                                account_id: selectedAccount?.id,
                                isNew: true
                            }}
                            onSubmit={handleSubmit}
                            onCancel={() => setShowTransactionModal(false)}
                            accounts={[selectedAccount]}
                            concepts={conceptsList}
                            months={monthsList}
                            formErrors={formErrors}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}