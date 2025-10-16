import React from 'react';

const AccountForm = ({ 
    formData, 
    setFormData, 
    modalType, 
    balancesData, 
    onSubmit, 
    onCancel,
    editingItem 
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    return (
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
                        <label className="form-label">Posición en página</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.position_in_page}
                            onChange={(e) => setFormData({...formData, position_in_page: e.target.value})}
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
                                <option key={grouping.id} value={grouping.id.toString()}>
                                    {grouping.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                
                {modalType === 'account' && (
                    <div className="form-group">
                        <label className="form-label">Notas</label>
                        <textarea
                            className="form-input"
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            rows="3"
                            placeholder="Notas adicionales sobre la cuenta..."
                        />
                    </div>
                )}
                
                {modalType === 'account' && (
                    <div className="form-group">
                        <label className="form-label">Máximo Confianza</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="form-input"
                            value={formData.maximum_trust}
                            onChange={(e) => setFormData({...formData, maximum_trust: e.target.value})}
                            placeholder="Máximo confianza"
                        />
                    </div>
                )}
                
                <div className="form-group">
                    <label className="form-label">Porcentaje Ideal (%)</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        className="form-input"
                        value={formData.ideal_percentage}
                        onChange={(e) => setFormData({...formData, ideal_percentage: e.target.value})}
                        placeholder="Porcentaje ideal (0-100)"
                    />
                </div>
            </div>
            <div className="modal-footer">
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-secondary"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                >
                    {editingItem ? 'Actualizar' : 'Crear'}
                </button>
            </div>
        </form>
    );
};

export default AccountForm;
