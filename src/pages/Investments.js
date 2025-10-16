import React, { useState, useEffect } from 'react';
import api from '../api';
import EmptyState from '../components/EmptyState';
import InvestmentFormModal from '../components/InvestmentFormModal';
import InvestmentEntryFormModal from '../components/InvestmentEntryFormModal';
import ImportModal from '../components/ImportModal';
import InvestmentDetails from '../components/InvestmentDetails';
import ArchivableTable from '../components/ArchivableTable';
import TableActions from '../components/TableActions';
import { useInvestments } from '../hooks/useInvestments';
import { formatCurrency } from '../utils/formatting';

// Constants
const MESSAGES = {
    deleteInvestment: '¿Estás seguro de que quieres eliminar esta inversión?',
    errors: {
        saveInvestment: 'Error al guardar la inversión',
        saveEntry: 'Error al guardar el movimiento',
        deleteInvestment: 'Error al eliminar la inversión',
        formValidation: 'Por favor corrige los errores en el formulario'
    }
};


// Main Investments component
export default function Investments() {
    const { investments, loading, error, setError, fetchInvestments, investmentApi } = useInvestments();
    const [formErrors, setFormErrors] = useState({});
    const [archivedInvestments, setArchivedInvestments] = useState([]);
    const [showArchivedInvestments, setShowArchivedInvestments] = useState(false);
    const [loadingArchived, setLoadingArchived] = useState(false);
    const [flashMessage, setFlashMessage] = useState({ message: '', type: '', visible: false });
    
    const [showInvestmentModal, setShowInvestmentModal] = useState(false);
    const [showEntryModal, setShowEntryModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingInvestment, setEditingInvestment] = useState(null);
    const [editingEntry, setEditingEntry] = useState(null);
    const [selectedInvestment, setSelectedInvestment] = useState(null);
    const [currentInvestmentId, setCurrentInvestmentId] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isSubmittingEntry, setIsSubmittingEntry] = useState(false);

    const resetFormState = () => {
        setFormErrors({});
        setError('');
    };

    const fetchArchivedInvestments = async () => {
        setLoadingArchived(true);
        try {
            const response = await api.get('/investments/?archived=true');
            setArchivedInvestments(response.data?.results || response.data);
        } catch (error) {
            console.error('Error fetching archived investments:', error);
            setError('Error al cargar las inversiones archivadas');
        } finally {
            setLoadingArchived(false);
        }
    };

    const handleArchiveInvestment = async (investment) => {
        try {
            // First get the investment ID
            const response = await api.get(`/investments/?name=${encodeURIComponent(investment.name)}`);
            const investments = response.data?.results || response.data;
            const investmentWithId = Array.isArray(investments) ? investments.find(inv => inv.name === investment.name) : null;
            
            if (!investmentWithId) {
                setFlashMessage({
                    message: 'No se pudo encontrar la inversión para archivar',
                    type: 'error',
                    visible: true
                });
                return;
            }
            
            // Use PATCH to update the archived field
            await api.patch(`/investments/${investmentWithId.id}/`, { archived: true });
            fetchInvestments();
            if (showArchivedInvestments) {
                fetchArchivedInvestments();
            }
            setFlashMessage({
                message: `La inversión ${investment.name} ha sido archivada exitosamente`,
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
            } else if (error.response?.data?.archived) {
                // Handle validation errors from the model
                setFlashMessage({
                    message: error.response.data.archived[0],
                    type: 'error',
                    visible: true
                });
            } else {
                setFlashMessage({
                    message: 'Error al archivar la inversión',
                    type: 'error',
                    visible: true
                });
            }
        }
    };

    const handleUnarchiveInvestment = async (investment) => {
        try {
            // First get the investment ID
            const response = await api.get(`/investments/?name=${encodeURIComponent(investment.name)}`);
            const investments = response.data?.results || response.data;
            const investmentWithId = Array.isArray(investments) ? investments.find(inv => inv.name === investment.name) : null;
            
            if (!investmentWithId) {
                setFlashMessage({
                    message: 'No se pudo encontrar la inversión para desarchivar',
                    type: 'error',
                    visible: true
                });
                return;
            }
            
            // Use PATCH to update the archived field
            await api.patch(`/investments/${investmentWithId.id}/`, { archived: false });
            fetchArchivedInvestments();
            fetchInvestments();
            setFlashMessage({
                message: `La inversión ${investment.name} ha sido desarchivada exitosamente`,
                type: 'success',
                visible: true
            });
        } catch (error) {
            setFlashMessage({
                message: error.response?.data?.detail || 'Error al desarchivar la inversión',
                type: 'error',
                visible: true
            });
        }
    };

    const toggleArchivedInvestments = () => {
        if (!showArchivedInvestments) {
            fetchArchivedInvestments();
        }
        setShowArchivedInvestments(!showArchivedInvestments);
    };

    // Update selectedInvestment when investments array changes (after refresh)
    useEffect(() => {
        if (selectedInvestment && investments.length > 0) {
            const updatedInvestment = investments.find(inv => inv.id === selectedInvestment.id);
            if (updatedInvestment) {
                setSelectedInvestment(updatedInvestment);
            }
        }
    }, [investments]);

    const handleApiError = (err, defaultMessage) => {
        if (err.response?.data) {
            const errorData = err.response.data;
            
            if (typeof errorData === 'object' && !errorData.detail) {
                setFormErrors(errorData);
                setError(MESSAGES.errors.formValidation);
            } else {
                setError(errorData.detail || defaultMessage);
            }
        } else {
            setError(defaultMessage);
        }
    };

    const handleInvestmentSubmit = async (payload) => {
        resetFormState();

        try {
            if (editingInvestment) {
                await investmentApi.update(editingInvestment.id, payload);
            } else {
                await investmentApi.create(payload);
            }

            // Refresh investments first, then close modal
            await fetchInvestments();
            setShowInvestmentModal(false);
            setEditingInvestment(null);
        } catch (err) {
            handleApiError(err, MESSAGES.errors.saveInvestment);
        }
    };

    const handleEntrySubmit = async (payload) => {
        resetFormState();
        setIsSubmittingEntry(true);

        try {
            if (editingEntry) {
                // For updates, check if only notes field changed
                const isOnlyNotesUpdate = Object.keys(payload).length === 1 && 'notes' in payload;
                
                // Optimistic update: close modal immediately for notes-only updates
                if (isOnlyNotesUpdate) {
                    setShowEntryModal(false);
                    setEditingEntry(null);
                    
                    // Trigger minimal refresh
                    if (selectedInvestment && selectedInvestment.id === currentInvestmentId) {
                        setRefreshTrigger(prev => prev + 1);
                    }
                }
                
                await investmentApi.updateEntry(currentInvestmentId, editingEntry.id, payload);
                
                if (!isOnlyNotesUpdate) {
                    // For amount/date changes, refresh investments list to update balances and XIRR
                    await fetchInvestments();
                    setRefreshTrigger(prev => prev + 1);
                    
                    setShowEntryModal(false);
                    setEditingEntry(null);
                }
            } else {
                await investmentApi.createEntry(currentInvestmentId, payload);
                
                // For new entries, refresh investments list to update balances and XIRR
                await fetchInvestments();
                
                // Trigger refresh of investment details entries
                setRefreshTrigger(prev => prev + 1);
                
                setShowEntryModal(false);
                setEditingEntry(null);
            }
        } catch (err) {
            // Reopen modal on error for better UX
            if (editingEntry) {
                setShowEntryModal(true);
            }
            handleApiError(err, MESSAGES.errors.saveEntry);
        } finally {
            setIsSubmittingEntry(false);
        }
    };

    const handleDeleteInvestment = async (id) => {
        if (!confirm(MESSAGES.deleteInvestment)) return;

        try {
            await investmentApi.delete(id);
            
            // If we're viewing the investment that was deleted, close the details view
            if (selectedInvestment && selectedInvestment.id === id) {
                setSelectedInvestment(null);
            }
            
            await fetchInvestments();
        } catch (err) {
            setError(MESSAGES.errors.deleteInvestment);
        }
    };

    const openInvestmentModal = (investment = null) => {
        setEditingInvestment(investment);
        resetFormState();
        setShowInvestmentModal(true);
    };

    const openEntryModal = (investmentId, entry = null) => {
        setCurrentInvestmentId(investmentId);
        setEditingEntry(entry);
        resetFormState();
        setShowEntryModal(true);
    };

    const viewInvestmentDetails = (investment) => {
        setSelectedInvestment(investment);
    };

    const closeInvestmentModal = () => {
        setShowInvestmentModal(false);
        setEditingInvestment(null);
    };

    const closeEntryModal = () => {
        setShowEntryModal(false);
        setEditingEntry(null);
    };

    if (loading && investments.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {/* Main content area */}
            <div className="grid grid-cols-1 gap-6">
                {selectedInvestment ? (
                    <div className="card">
                        <div className="card-body">
                            <InvestmentDetails
                                investment={selectedInvestment}
                                onAddEntry={(investmentId) => openEntryModal(investmentId)}
                                onEditEntry={(entry) => openEntryModal(entry.investment, entry)}
                                onDeleteEntry={() => {
                                    fetchInvestments();
                                    setRefreshTrigger(prev => prev + 1);
                                }}
                                onClose={() => setSelectedInvestment(null)}
                                investmentApi={investmentApi}
                                refreshTrigger={refreshTrigger}
                            />
                        </div>
                    </div>
                ) : (
                    <ArchivableTable
                        title="Inversiones"
                        activeItems={investments}
                        archivedItems={archivedInvestments}
                        showArchived={showArchivedInvestments}
                        loadingArchived={loadingArchived}
                        onToggleArchived={toggleArchivedInvestments}
                        onArchive={handleArchiveInvestment}
                        onUnarchive={handleUnarchiveInvestment}
                        onEdit={openInvestmentModal}
                        onDelete={handleDeleteInvestment}
                        onViewDetails={viewInvestmentDetails}
                        columns={[
                            { header: 'Nombre' },
                            { header: 'Balance', headerClassName: 'text-right' },
                            { header: 'TIR', headerClassName: 'text-right' },
                            { header: 'Movimientos', headerClassName: 'text-right' },
                            { header: 'Notas' },
                            { header: 'Acciones', headerClassName: 'text-right' }
                        ]}
                        renderRow={(investment) => (
                            <tr key={investment.id} className="cursor-pointer" onClick={() => viewInvestmentDetails(investment)}>
                                <td>{investment.name}</td>
                                <td className="text-right">{formatCurrency(investment.balance)}</td>
                                <td className="text-right">{investment.xirr_display}</td>
                                <td className="text-right">{investment.entries_count}</td>
                                <td className="text-gray-600">
                                    {investment.notes ? (
                                        <span className="truncate max-w-xs block" title={investment.notes}>
                                            {investment.notes}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 italic">Sin notas</span>
                                    )}
                                </td>
                                <td>
                                    <TableActions
                                        onEdit={(e) => {
                                            e.stopPropagation();
                                            openInvestmentModal(investment);
                                        }}
                                        onDelete={(e) => {
                                            e.stopPropagation();
                                            handleDeleteInvestment(investment.id);
                                        }}
                                        onArchive={(e) => {
                                            e.stopPropagation();
                                            handleArchiveInvestment(investment);
                                        }}
                                        editTooltip="Editar"
                                        deleteTooltip="Eliminar"
                                        archiveTooltip="Archivar"
                                    />
                                </td>
                            </tr>
                        )}
                        renderArchivedRow={(investment) => (
                            <tr key={investment.id}>
                                <td className="text-gray-500">{investment.name}</td>
                                <td className="text-right text-gray-500">{formatCurrency(investment.balance)}</td>
                                <td className="text-right text-gray-500">{investment.xirr_display}</td>
                                <td className="text-right text-gray-500">{investment.entries_count}</td>
                                <td className="text-gray-500">
                                    {investment.notes ? (
                                        <span className="truncate max-w-xs block" title={investment.notes}>
                                            {investment.notes}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 italic">Sin notas</span>
                                    )}
                                </td>
                                <td>
                                    <TableActions
                                        onUnarchive={(e) => {
                                            e.stopPropagation();
                                            handleUnarchiveInvestment(investment);
                                        }}
                                        unarchiveTooltip="Desarchivar"
                                    />
                                </td>
                            </tr>
                        )}
                        flashMessage={flashMessage}
                        onCloseFlashMessage={() => setFlashMessage({ message: '', type: '', visible: false })}
                        emptyStateTitle="No hay inversiones"
                        emptyStateDescription="Agrega tu primera inversión para comenzar a hacer seguimiento"
                        emptyStateIcon="fa-chart-line"
                        archivedSectionTitle="Inversiones Archivadas"
                        toggleButtonText={showArchivedInvestments ? 'Ocultar Archivadas' : 'Ver Archivadas'}
                        toggleButtonIcon={showArchivedInvestments ? 'fa-eye-slash' : 'fa-archive'}
                        headerActions={
                            <>
                                <button
                                    onClick={() => setShowImportModal(true)}
                                    className="btn-secondary"
                                >
                                    <i className="fas fa-file-import mr-2"></i>
                                    Importar
                                </button>
                                <button
                                    onClick={() => openInvestmentModal()}
                                    className="btn-primary"
                                >
                                    <i className="fas fa-plus mr-2"></i>
                                    Agregar Inversión
                                </button>
                            </>
                        }
                    />
                )}
            </div>

            <InvestmentFormModal
                isOpen={showInvestmentModal}
                editingInvestment={editingInvestment}
                onSubmit={handleInvestmentSubmit}
                onClose={closeInvestmentModal}
                formErrors={formErrors}
            />

            <InvestmentEntryFormModal
                isOpen={showEntryModal}
                investmentId={currentInvestmentId}
                editingEntry={editingEntry}
                onSubmit={handleEntrySubmit}
                onClose={closeEntryModal}
                formErrors={formErrors}
                isLoading={isSubmittingEntry}
            />
            
            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
            />
        </div>
    );
}
