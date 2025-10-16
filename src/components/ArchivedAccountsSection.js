import React from 'react';
import DataTable from './DataTable';
import TableActions from './TableActions';

/**
 * Component for displaying archived accounts section
 * @param {Object} props
 * @param {Array} props.archivedAccounts - Array of archived accounts
 * @param {boolean} props.loadingArchived - Loading state for archived accounts
 * @param {Function} props.onUnarchive - Function to unarchive an account
 */
export default function ArchivedAccountsSection({
    archivedAccounts = [],
    loadingArchived = false,
    onUnarchive
}) {
    if (loadingArchived) {
        return (
            <div className="card">
                <div className="card-header">
                    <h2 className="text-lg font-semibold text-gray-900">
                        <i className="fas fa-archive mr-2 text-orange-500"></i>
                        Cuentas Archivadas
                    </h2>
                </div>
                <div className="card-body">
                    <div className="flex items-center justify-center py-8">
                        <div className="loading-spinner"></div>
                        <span className="ml-2">Cargando cuentas archivadas...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (archivedAccounts.length === 0) {
        return (
            <div className="card">
                <div className="card-header">
                    <h2 className="text-lg font-semibold text-gray-900">
                        <i className="fas fa-archive mr-2 text-orange-500"></i>
                        Cuentas Archivadas
                    </h2>
                </div>
                <div className="card-body">
                    <div className="text-center py-8 text-gray-500">
                        <i className="fas fa-archive text-4xl text-gray-300 mb-4"></i>
                        <p>No hay elementos archivados</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">
                    <i className="fas fa-archive mr-2 text-orange-500"></i>
                    Cuentas Archivadas
                </h2>
            </div>
            <div className="card-body">
                <DataTable
                    columns={[
                        { header: 'Cuenta' },
                        { header: 'Agrupación' },
                        { header: 'Notas' },
                        { header: 'Acciones', headerClassName: 'text-right' }
                    ]}
                    data={archivedAccounts}
                    renderRow={(account) => (
                        <tr key={account.id}>
                            <td className="text-gray-500">
                                <div className="flex items-center">
                                    <i className="fas fa-credit-card text-gray-400 mr-3"></i>
                                    {account.name}
                                </div>
                            </td>
                            <td className="text-gray-500">
                                {account.grouping?.name || '-'}
                            </td>
                            <td className="text-gray-500">
                                {account.notes ? (
                                    <span className="truncate max-w-xs block" title={account.notes}>
                                        {account.notes}
                                    </span>
                                ) : (
                                    <span className="text-gray-400 italic">Sin notas</span>
                                )}
                            </td>
                            <td>
                                <TableActions
                                    onUnarchive={() => onUnarchive(account)}
                                    unarchiveTooltip="Desarchivar cuenta"
                                />
                            </td>
                        </tr>
                    )}
                />
            </div>
        </div>
    );
}
