import React, { useState, useEffect } from 'react';
import api from '../api';
import ArchivableTable from '../components/ArchivableTable';
import TableActions from '../components/TableActions';

export default function Concepts() {
    const [concepts, setConcepts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingConcept, setEditingConcept] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        is_income: false
    });
    const [archivedConcepts, setArchivedConcepts] = useState([]);
    const [showArchivedConcepts, setShowArchivedConcepts] = useState(false);
    const [loadingArchived, setLoadingArchived] = useState(false);
    const [flashMessage, setFlashMessage] = useState({ message: '', type: '', visible: false });

    
    // Pagination state
    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null
    });

    useEffect(() => {
        fetchConcepts();
    }, []);

    const fetchConcepts = async (url = '/concepts/?archived=false') => {
        try {
            const response = await api.get(url);
            
            // Handle paginated responses
            const conceptsData = response.data?.results || response.data;
            
            setConcepts(Array.isArray(conceptsData) ? conceptsData : []);
            
            // Update pagination info
            if (response.data?.count !== undefined) {
                setPagination({
                    count: response.data.count,
                    next: response.data.next,
                    previous: response.data.previous
                });
            }
        } catch (error) {
            console.error('Error fetching concepts:', error);
            setError('Error al cargar los conceptos');
            setConcepts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchArchivedConcepts = async () => {
        setLoadingArchived(true);
        try {
            const response = await api.get('/concepts/?archived=true');
            setArchivedConcepts(response.data?.results || response.data);
        } catch (error) {
            console.error('Error fetching archived concepts:', error);
            setError('Error al cargar los conceptos archivados');
        } finally {
            setLoadingArchived(false);
        }
    };

    const handlePageChange = (url) => {
        if (!url) return;
        
        // Convert full URL to relative path for api client
        const urlObj = new URL(url);
        // Remove the /api/v1/ prefix since the API client already includes it
        const relativePath = urlObj.pathname.replace('/api/v1/', '/');
        
        // Ensure we preserve the archived=false parameter
        const searchParams = new URLSearchParams(urlObj.search);
        if (!searchParams.has('archived')) {
            searchParams.append('archived', 'false');
        }
        
        fetchConcepts(relativePath + '?' + searchParams.toString());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const payload = {
                name: formData.name,
                is_income: formData.is_income
            };
            
            if (editingConcept) {
                await api.put(`/concepts/${editingConcept.id}/`, payload);
            } else {
                await api.post('/concepts/', payload);
            }
            
            setShowModal(false);
            setEditingConcept(null);
            setFormData({ name: '', is_income: false });
            fetchConcepts();
        } catch (error) {
            setError(error.response?.data?.detail || 'Error al guardar el concepto');
        }
    };

    const handleEdit = (concept) => {
        setEditingConcept(concept);
        setFormData({
            name: concept.name,
            is_income: concept.is_income
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este concepto?')) return;
        
        try {
            await api.delete(`/concepts/${id}/`);
            fetchConcepts();
        } catch (error) {
            setError(error.response?.data?.detail || 'Error al eliminar el concepto');
        }
    };

    const handleArchiveConcept = async (concept) => {
        try {
            // First get the concept ID
            const response = await api.get(`/concepts/?name=${encodeURIComponent(concept.name)}`);
            const concepts = response.data?.results || response.data;
            const conceptWithId = Array.isArray(concepts) ? concepts.find(c => c.name === concept.name) : null;
            
            if (!conceptWithId) {
                setFlashMessage({
                    message: 'No se pudo encontrar el concepto para archivar',
                    type: 'error',
                    visible: true
                });
                return;
            }
            
            // Use PATCH to update the archived field
            await api.patch(`/concepts/${conceptWithId.id}/`, { archived: true });
            fetchConcepts();
            if (showArchivedConcepts) {
                fetchArchivedConcepts();
            }
            setFlashMessage({
                message: `El concepto ${concept.name} ha sido archivado exitosamente`,
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
                    message: 'Error al archivar el concepto. Asegúrate de que no tenga transacciones.',
                    type: 'error',
                    visible: true
                });
            }
        }
    };

    const handleUnarchiveConcept = async (concept) => {
        try {
            // First get the concept ID
            const response = await api.get(`/concepts/?name=${encodeURIComponent(concept.name)}`);
            const concepts = response.data?.results || response.data;
            const conceptWithId = Array.isArray(concepts) ? concepts.find(c => c.name === concept.name) : null;
            
            if (!conceptWithId) {
                setFlashMessage({
                    message: 'No se pudo encontrar el concepto para desarchivar',
                    type: 'error',
                    visible: true
                });
                return;
            }
            
            // Use PATCH to update the archived field
            await api.patch(`/concepts/${conceptWithId.id}/`, { archived: false });
            fetchArchivedConcepts();
            fetchConcepts();
            setFlashMessage({
                message: `El concepto ${concept.name} ha sido desarchivado exitosamente`,
                type: 'success',
                visible: true
            });
        } catch (error) {
            setFlashMessage({
                message: error.response?.data?.detail || 'Error al desarchivar el concepto',
                type: 'error',
                visible: true
            });
        }
    };

    const openModal = () => {
        setEditingConcept(null);
        setFormData({ name: '', is_income: false });
        setShowModal(true);
    };

    const toggleArchivedConcepts = () => {
        if (!showArchivedConcepts) {
            fetchArchivedConcepts();
        }
        setShowArchivedConcepts(!showArchivedConcepts);
    };

    const filteredConcepts = Array.isArray(concepts) ? concepts : [];


    if (loading) {
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

            <ArchivableTable
                title="Conceptos"
                activeItems={filteredConcepts}
                archivedItems={archivedConcepts}
                showArchived={showArchivedConcepts}
                loadingArchived={loadingArchived}
                onToggleArchived={toggleArchivedConcepts}
                onArchive={handleArchiveConcept}
                onUnarchive={handleUnarchiveConcept}
                onEdit={handleEdit}
                onDelete={handleDelete}
                columns={[
                    { header: 'Nombre' },
                    { header: 'Tipo' },
                    { header: 'Acciones', headerClassName: 'text-right' }
                ]}
                renderRow={(concept) => (
                    <tr key={concept.id}>
                        <td>
                            <div className="flex items-center">
                                <i className={`fas ${concept.is_income ? 'fa-arrow-up text-green-600' : 'fa-arrow-down text-red-600'} mr-2`}></i>
                                {concept.name}
                            </div>
                        </td>
                        <td>
                            <span className={`concept-badge ${concept.is_income ? 'income' : 'expense'}`}>
                                {concept.is_income ? 'Ingreso' : 'Gasto'}
                            </span>
                        </td>
                        <td>
                            <TableActions
                                onEdit={() => handleEdit(concept)}
                                onDelete={() => handleDelete(concept.id)}
                                onArchive={() => handleArchiveConcept(concept)}
                                editTooltip="Editar concepto"
                                deleteTooltip="Eliminar concepto"
                                archiveTooltip="Archivar concepto"
                            />
                        </td>
                    </tr>
                )}
                renderArchivedRow={(concept) => (
                    <tr key={concept.id}>
                        <td className="text-gray-500">
                            <div className="flex items-center">
                                <i className={`fas ${concept.is_income ? 'fa-arrow-up text-green-600' : 'fa-arrow-down text-red-600'} mr-2`}></i>
                                {concept.name}
                            </div>
                        </td>
                        <td className="text-gray-500">
                            <span className={`concept-badge ${concept.is_income ? 'income' : 'expense'}`}>
                                {concept.is_income ? 'Ingreso' : 'Gasto'}
                            </span>
                        </td>
                        <td>
                            <TableActions
                                onUnarchive={() => handleUnarchiveConcept(concept)}
                                unarchiveTooltip="Desarchivar concepto"
                            />
                        </td>
                    </tr>
                )}
                flashMessage={flashMessage}
                onCloseFlashMessage={() => setFlashMessage({ ...flashMessage, visible: false })}
                emptyStateTitle="Sin conceptos aún"
                emptyStateDescription="Crea tu primer concepto para categorizar tus transacciones"
                emptyStateIcon="fa-tags"
                archivedSectionTitle="Conceptos Archivados"
                toggleButtonText={showArchivedConcepts ? 'Ocultar Archivados' : 'Ver Archivados'}
                toggleButtonIcon={showArchivedConcepts ? 'fa-eye-slash' : 'fa-archive'}
                headerActions={
                    <button
                        onClick={openModal}
                        className="btn-primary"
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Agregar Concepto
                    </button>
                }
            />

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingConcept ? 'Editar Concepto' : 'Agregar Nuevo Concepto'}
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
                                        placeholder="Ingresa el nombre del concepto"
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">Tipo</label>
                                    <div className="mt-2 space-x-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="is_income"
                                                value="false"
                                                checked={!formData.is_income}
                                                onChange={(e) => setFormData({...formData, is_income: false})}
                                                className="form-radio text-red-600"
                                            />
                                            <span className="ml-2">Gasto</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="is_income"
                                                value="true"
                                                checked={formData.is_income}
                                                onChange={(e) => setFormData({...formData, is_income: true})}
                                                className="form-radio text-green-600"
                                            />
                                            <span className="ml-2">Ingreso</span>
                                        </label>
                                    </div>
                                </div>
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
                                    {editingConcept ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
