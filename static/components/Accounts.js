function Accounts() {
    const [accounts, setAccounts] = React.useState([]);
    const [groupings, setGroupings] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [showModal, setShowModal] = React.useState(false);
    const [modalType, setModalType] = React.useState(''); // 'account' or 'grouping'
    const [editingItem, setEditingItem] = React.useState(null);
    const [formData, setFormData] = React.useState({
        name: '',
        priority: 100,
        grouping_id: ''
    });
    
    // Pagination state
    const [accountsPagination, setAccountsPagination] = React.useState({
        count: 0,
        next: null,
        previous: null
    });
    const [groupingsPagination, setGroupingsPagination] = React.useState({
        count: 0,
        next: null,
        previous: null
    });

    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (accountsUrl = '/accounts/', groupingsUrl = '/groupings/') => {
        try {
            // For initial load, we need all groupings for the modal dropdown
            const isInitialLoad = accountsUrl === '/accounts/' && groupingsUrl === '/groupings/';
            const finalGroupingsUrl = isInitialLoad ? '/groupings/?limit=1000' : groupingsUrl;
            
            const [accountsResponse, groupingsResponse] = await Promise.all([
                api.get(accountsUrl),
                api.get(finalGroupingsUrl)
            ]);
            
            // Handle paginated responses
            const accountsData = accountsResponse.data?.results || accountsResponse.data;
            const groupingsData = groupingsResponse.data?.results || groupingsResponse.data;
            
            setAccounts(Array.isArray(accountsData) ? accountsData : []);
            setGroupings(Array.isArray(groupingsData) ? groupingsData : []);
            
            // Update pagination info only for paginated requests
            if (accountsResponse.data?.count !== undefined) {
                setAccountsPagination({
                    count: accountsResponse.data.count,
                    next: accountsResponse.data.next,
                    previous: accountsResponse.data.previous
                });
            }
            // Only update groupings pagination if it's actually a paginated request
            if (groupingsResponse.data?.count !== undefined && !isInitialLoad) {
                setGroupingsPagination({
                    count: groupingsResponse.data.count,
                    next: groupingsResponse.data.next,
                    previous: groupingsResponse.data.previous
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error al cargar los datos de cuentas');
            setAccounts([]);
            setGroupings([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (url, type) => {
        if (!url) return;
        
        // Convert full URL to relative path for api client
        const urlObj = new URL(url);
        // Remove the /api/v1/ prefix since the API client already includes it
        const relativePath = urlObj.pathname.replace('/api/v1/', '/') + urlObj.search;
        
        if (type === 'accounts') {
            fetchData(relativePath, '/groupings/');
        } else if (type === 'groupings') {
            fetchData('/accounts/', relativePath);
        }
    };

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
                const payload = {
                    name: formData.name,
                    grouping: parseInt(formData.grouping_id)
                };

                if (editingItem) {
                    await api.put(`/accounts/${editingItem.id}/`, payload);
                } else {
                    await api.post('/accounts/', payload);
                }
            }

            setShowModal(false);
            setEditingItem(null);
            setFormData({ name: '', priority: 100, grouping_id: '' });
            fetchData();
        } catch (error) {
            if (error.response?.data) {
                const errorData = error.response.data;
                if (errorData.detail) {
                    // General error
                    setError(errorData.detail);
                } else {
                    // Field-specific errors
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

    const handleEdit = (item, type) => {
        setEditingItem(item);
        setModalType(type);
        if (type === 'grouping') {
            setFormData({
                name: item.name,
                priority: item.priority,
                grouping_id: ''
            });
        } else {
            setFormData({
                name: item.name,
                priority: 100,
                grouping_id: item.grouping_id
            });
        }
        setShowModal(true);
    };

    const handleDelete = async (id, type) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este elemento?')) return;

        try {
            if (type === 'grouping') {
                await api.delete(`/groupings/${id}/`);
            } else {
                await api.delete(`/accounts/${id}/`);
            }
            fetchData();
        } catch (error) {
            setError(error.response?.data?.detail || 'Error al eliminar');
        }
    };

    const openModal = (type) => {
        setModalType(type);
        setEditingItem(null);
        setFormData({ name: '', priority: 100, grouping_id: '' });
        setShowModal(true);
    };

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
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Cuentas</h1>
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

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {/* Groupings Section */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-medium text-gray-900">Agrupaciones de Cuentas</h3>
                </div>
                <div className="card-body">
                    {groupings.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <i className="fas fa-folder-open"></i>
                            </div>
                            <div className="empty-state-title">Sin agrupaciones aún</div>
                            <div className="empty-state-description">
                                Crea tu primera agrupación de cuentas para organizar tus cuentas
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Prioridad</th>
                                        <th>Cuentas</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupings.map((grouping) => (
                                        <tr key={grouping.id}>
                                            <td>{grouping.name}</td>
                                            <td>{grouping.priority}</td>
                                            <td>
                                                {accounts.filter(a => a.grouping_id === grouping.id).length}
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleEdit(grouping, 'grouping')}
                                                    className="text-blue-600 hover:text-blue-900 mr-2"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(grouping.id, 'grouping')}
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
                    )}
                    
                    {/* Groupings Pagination */}
                    {groupingsPagination.count > 10 && (
                        <div className="flex justify-between items-center mt-4">
                            <div className="text-sm text-gray-700">
                                Mostrando {groupings.length} de {groupingsPagination.count} agrupaciones
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handlePageChange(groupingsPagination.previous, 'groupings')}
                                    disabled={!groupingsPagination.previous}
                                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => handlePageChange(groupingsPagination.next, 'groupings')}
                                    disabled={!groupingsPagination.next}
                                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Accounts Section */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-medium text-gray-900">Cuentas</h3>
                </div>
                <div className="card-body">
                    {accounts.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <i className="fas fa-wallet"></i>
                            </div>
                            <div className="empty-state-title">Sin cuentas aún</div>
                            <div className="empty-state-description">
                                Crea tu primera cuenta para comenzar a gestionar tus finanzas
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Agrupación</th>
                                        <th>Saldo</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {accounts.map((account) => (
                                        <tr key={account.id}>
                                            <td>{account.name}</td>
                                            <td>{account.grouping?.name || 'Desconocida'}</td>
                                            <td className="account-balance">
                                                $0.00
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleEdit(account, 'account')}
                                                    className="text-blue-600 hover:text-blue-900 mr-2"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(account.id, 'account')}
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
                    )}
                    
                    {/* Accounts Pagination */}
                    {accountsPagination.count > 10 && (
                        <div className="flex justify-between items-center mt-4">
                            <div className="text-sm text-gray-700">
                                Mostrando {accounts.length} de {accountsPagination.count} cuentas
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handlePageChange(accountsPagination.previous, 'accounts')}
                                    disabled={!accountsPagination.previous}
                                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => handlePageChange(accountsPagination.next, 'accounts')}
                                    disabled={!accountsPagination.next}
                                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
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
                                            value={formData.grouping_id}
                                            onChange={(e) => setFormData({...formData, grouping_id: e.target.value})}
                                            required
                                        >
                                            <option value="">Seleccionar una agrupación</option>
                                            {groupings.map((grouping) => (
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
        </div>
    );
}