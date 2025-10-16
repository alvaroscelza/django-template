import React, { useState, useEffect } from 'react';
import EmptyState from './EmptyState';
import { formatCurrency } from '../utils/formatting';

// Constants
const MESSAGES = {
    deleteEntry: '¿Estás seguro de que quieres eliminar este movimiento?',
    errors: {
        loadEntries: 'Error al cargar los movimientos de la inversión',
        deleteEntry: 'Error al eliminar el movimiento'
    }
};

export default function InvestmentDetails({ 
    investment, 
    onAddEntry, 
    onEditEntry, 
    onDeleteEntry, 
    onClose,
    investmentApi,
    refreshTrigger
}) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchEntries = async () => {
        try {
            setLoading(true);
            const response = await investmentApi.getEntries(investment.id);
            setEntries(response.data || []);
            setError('');
        } catch (err) {
            console.error('Error fetching investment entries:', err);
            setError(MESSAGES.errors.loadEntries);
            setEntries([]);
        } finally {
            setLoading(false);
        }
    };

    const updateEntryInList = (updatedEntry) => {
        setEntries(prevEntries => 
            prevEntries.map(entry => 
                entry.id === updatedEntry.id ? updatedEntry : entry
            )
        );
    };

    useEffect(() => {
        fetchEntries();
    }, [investment.id, refreshTrigger]);

    const handleDeleteEntry = async (entryId) => {
        if (!confirm(MESSAGES.deleteEntry)) return;

        try {
            await investmentApi.deleteEntry(investment.id, entryId);
            await fetchEntries();
            onDeleteEntry();
        } catch (err) {
            setError(MESSAGES.errors.deleteEntry);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <button 
                        onClick={onClose} 
                        className="btn-secondary mr-3 flex items-center"
                        title="Volver a la lista de inversiones"
                    >
                        <i className="fas fa-arrow-left mr-2"></i>
                        Volver
                    </button>
                    <h2 className="text-xl font-bold">{investment.name}</h2>
                </div>
                <button onClick={onClose} className="btn-icon">
                    <i className="fas fa-times"></i>
                </button>
            </div>

            {investment.notes && (
                <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-gray-700">{investment.notes}</p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-md">
                    <div className="text-sm text-blue-700">Balance</div>
                    <div className="text-xl font-bold">{formatCurrency(investment.balance)}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-md">
                    <div className="text-sm text-green-700">TIR</div>
                    <div className="text-xl font-bold">{investment.xirr_display}</div>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Movimientos</h3>
                <button onClick={() => onAddEntry(investment.id)} className="btn-primary btn-sm">
                    <i className="fas fa-plus mr-1"></i> Agregar Movimiento
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {loading ? (
                <div className="flex justify-center py-4">
                    <div className="loading-spinner"></div>
                </div>
            ) : entries.length === 0 ? (
                <EmptyState
                    icon="fa-money-bill-wave"
                    title="No hay movimientos"
                    description="Agrega movimientos a esta inversión para calcular su TIR"
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="table-auto w-full">
                        <thead>
                            <tr>
                                <th className="text-left px-2">Fecha</th>
                                <th className="text-right px-4">Monto</th>
                                <th className="text-left px-4">Notas</th>
                                <th className="text-right px-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map(entry => (
                                <tr key={entry.id} className="border-t">
                                    <td className="py-2 px-2">{entry.date}</td>
                                    <td className={`py-2 px-4 text-right ${entry.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatCurrency(entry.amount)}
                                    </td>
                                    <td className="py-2 px-4">{entry.notes || '-'}</td>
                                    <td className="py-2 px-2 text-right">
                                        <button
                                            onClick={() => onEditEntry(entry)}
                                            className="btn-icon btn-sm mr-1"
                                            title="Editar"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteEntry(entry.id)}
                                            className="btn-icon btn-sm text-red-500"
                                            title="Eliminar"
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
        </div>
    );
}
