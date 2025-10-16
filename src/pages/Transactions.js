import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import CsvImport from './CsvImport';
import TransactionForm from '../components/TransactionForm';
import TransactionFilters from '../components/TransactionFilters';
import TransactionList from '../components/TransactionList';
import useTransactionSubmit from '../hooks/useTransactionSubmit';

export default function Transactions() {
    const [searchParams] = useSearchParams();
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [concepts, setConcepts] = useState([]);
    const [months, setMonths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showCsvImport, setShowCsvImport] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    
    // Search filters for transaction list - initialize from URL params
    const [searchFilters, setSearchFilters] = useState({
        account: searchParams.get('account') || '',
        concept: searchParams.get('concept') || '',
        month: searchParams.get('month') || ''
    });
    
    // Infinite scroll state
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    // Use the transaction submit hook
    const { handleSubmit, isSubmitting, formErrors, setFormErrors } = useTransactionSubmit({
        onSuccess: (message) => {
            setError('');
            // You could add a success message here if needed
        },
        onError: (errorMessage) => {
            setError(errorMessage);
        },
        onClose: () => {
            setShowModal(false);
            setEditingTransaction(null);
        },
        onRefresh: () => fetchTransactions(false)
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!loading) {
            fetchTransactions(false);
        }
    }, [loading]);

    // Re-fetch transactions when any filter changes (now all are server-side)
    useEffect(() => {
        if (!loading) {
            fetchTransactions(false);
        }
    }, [searchFilters.account, searchFilters.concept, searchFilters.month]);

    const fetchInitialData = async () => {
        try {
            const [accountsResponse, conceptsResponse, monthsResponse] = await Promise.all([
                api.get('/accounts/'),
                api.get('/concepts/?archived=false'),
                api.get('/months/')
            ]);

            const accountsData = accountsResponse.data?.results || accountsResponse.data;
            const conceptsData = conceptsResponse.data?.results || conceptsResponse.data;
            const monthsData = monthsResponse.data?.results || monthsResponse.data;

            // Filter out any archived accounts that might have been returned
            const activeAccounts = Array.isArray(accountsData) 
                ? accountsData.filter(account => !account.archived)
                : [];

            // Filter out any archived concepts that might have been returned
            const activeConcepts = Array.isArray(conceptsData)
                ? conceptsData.filter(concept => !concept.archived)
                : [];

            setAccounts(activeAccounts);
            setConcepts(activeConcepts);
            setMonths(Array.isArray(monthsData) ? monthsData : []);
        } catch (error) {
            console.error('Error fetching initial data:', error);
            setError('Error al cargar los datos');
            setAccounts([]);
            setConcepts([]);
            setMonths([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = useCallback(async (isLoadMore = false) => {
        try {
            if (isLoadMore) {
                setIsLoadingMore(true);
            } else {
                setTransactionsLoading(true);
                setPage(1);
                setHasMore(true);
            }
            
            const currentPage = isLoadMore ? page + 1 : 1;
            let requestUrl = `/transactions/?ordering=-month__starting_date&page=${currentPage}&page_size=${pageSize}`;
            
            // Add server-side filters to the request (using IDs)
            const filterParams = new URLSearchParams();
            
            if (searchFilters.account) {
                filterParams.append('account', searchFilters.account);
            }
            
            if (searchFilters.concept) {
                filterParams.append('concept', searchFilters.concept);
            }
            
            if (searchFilters.month) {
                filterParams.append('month', searchFilters.month);
            }
            
            // Append filter parameters to the URL
            if (filterParams.toString()) {
                requestUrl += `&${filterParams.toString()}`;
            }

            const transactionsResponse = await api.get(requestUrl);
            
            const transactionsData = transactionsResponse.data?.results || transactionsResponse.data;
            const newTransactions = Array.isArray(transactionsData) ? transactionsData : [];
            
            const serverTotalCount = transactionsResponse.data?.count || 0;
            setTotalCount(serverTotalCount);
            
            if (isLoadMore) {
                setTransactions(prev => {
                    const existingIds = new Set(prev.map(t => t.id));
                    const uniqueNewTransactions = newTransactions.filter(t => !existingIds.has(t.id));
                    const updatedTransactions = [...prev, ...uniqueNewTransactions];
                    
                    const newHasMore = updatedTransactions.length < serverTotalCount;
                    setHasMore(newHasMore);
                    
                    return updatedTransactions;
                });
                setPage(prev => prev + 1);
            } else {
                setTransactions(newTransactions);
                setPage(1);
                
                const newHasMore = newTransactions.length < serverTotalCount;
                setHasMore(newHasMore);
            }
            
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setError('Error al cargar las transacciones');
            if (!isLoadMore) {
                setTransactions([]);
            }
        } finally {
            setTransactionsLoading(false);
            setIsLoadingMore(false);
        }
    }, [page, pageSize, searchFilters, months]);
    


    const handleEdit = async (transaction) => {
        try {
            // Fetch fresh transaction data from the backend
            const response = await api.get(`/transactions/${transaction.id}/`);
            setEditingTransaction(response.data);
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching transaction data:', error);
            setError('Error al cargar los datos de la transacción');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta transacción?')) return;

        try {
            await api.delete(`/transactions/${id}/`);
            await fetchTransactions(false);
        } catch (error) {
            setError(error.response?.data?.detail || 'Error al eliminar la transacción');
        }
    };

    const openModal = () => {
        setEditingTransaction(null);
        setError('');
        setFormErrors({});
        setShowModal(true);
    };


    // Transactions are now filtered server-side, so we use them directly
    const filteredTransactions = Array.isArray(transactions) ? transactions : [];

    const handleSearchFilterChange = (filterType, value) => {
        setSearchFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const clearSearchFilters = () => {
        setSearchFilters({
            account: '',
            concept: '',
            month: ''
        });
    };

    const loadMoreTransactions = useCallback(() => {
        if (!isLoadingMore && hasMore) {
            fetchTransactions(true);
        }
    }, [isLoadingMore, hasMore, fetchTransactions]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Transacciones</h1>
                <div className="space-x-2">
                    <button
                        onClick={() => setShowCsvImport(true)}
                        className="btn-secondary"
                    >
                        <i className="fas fa-file-import mr-2"></i>
                        Importar CSV
                    </button>
                    <button
                        onClick={openModal}
                        className="btn-primary"
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Agregar Transacción
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {/* Search Filters */}
            <TransactionFilters 
                filters={searchFilters}
                onFilterChange={handleSearchFilterChange}
                onClearFilters={clearSearchFilters}
                resultCount={totalCount}
                accounts={accounts}
                concepts={concepts}
                months={months}
            />

            {/* Transactions Section */}
            <div className="card">
                <div className="card-body">
                    <TransactionList
                        transactions={filteredTransactions}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        loading={transactionsLoading}
                        isLoadingMore={isLoadingMore}
                        hasMore={hasMore}
                        onLoadMore={loadMoreTransactions}
                    />
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingTransaction ? 'Editar Transacción' : 'Agregar Transacción'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="modal-close"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <TransactionForm
                            editingTransaction={editingTransaction}
                            onSubmit={handleSubmit}
                            onCancel={() => setShowModal(false)}
                            accounts={accounts}
                            concepts={concepts}
                            months={months}
                            formErrors={formErrors}
                        />
                    </div>
                </div>
            )}


            {/* CSV Import Modal */}
            {showCsvImport && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Importar CSV</h3>
                            <button
                                onClick={() => setShowCsvImport(false)}
                                className="modal-close"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <CsvImport />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
