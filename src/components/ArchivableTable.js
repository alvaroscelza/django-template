import React from 'react';
import DataTable from './DataTable';
import TableActions from './TableActions';
import FlashMessage from './FlashMessage';

/**
 * Reusable component for tables that support archivation
 * @param {Object} props
 * @param {Array} props.activeItems - Array of active (non-archived) items
 * @param {Array} props.archivedItems - Array of archived items
 * @param {boolean} props.showArchived - Whether to show archived items
 * @param {boolean} props.loadingArchived - Loading state for archived items
 * @param {Function} props.onToggleArchived - Function to toggle archived visibility
 * @param {Function} props.onArchive - Function to archive an item
 * @param {Function} props.onUnarchive - Function to unarchive an item
 * @param {Function} props.onEdit - Function to edit an item
 * @param {Function} props.onDelete - Function to delete an item
 * @param {Function} props.onViewDetails - Function to view item details (optional)
 * @param {Array} props.columns - Column configuration for the table
 * @param {Function} props.renderRow - Function to render each row
 * @param {Function} props.renderArchivedRow - Function to render archived rows (optional)
 * @param {Object} props.flashMessage - Flash message state
 * @param {Function} props.onCloseFlashMessage - Function to close flash message
 * @param {string} props.emptyStateTitle - Title for empty state
 * @param {string} props.emptyStateDescription - Description for empty state
 * @param {string} props.emptyStateIcon - Icon for empty state
 * @param {string} props.archivedSectionTitle - Title for archived section
 * @param {string} props.toggleButtonText - Text for toggle button
 * @param {string} props.toggleButtonIcon - Icon for toggle button
 * @param {React.ReactNode} props.headerActions - Additional header actions (optional)
 * @param {string} props.title - Page title
 */
export default function ArchivableTable({
    activeItems = [],
    archivedItems = [],
    showArchived = false,
    loadingArchived = false,
    onToggleArchived,
    onArchive,
    onUnarchive,
    onEdit,
    onDelete,
    onViewDetails,
    columns = [],
    renderRow,
    renderArchivedRow,
    flashMessage = { message: '', type: '', visible: false },
    onCloseFlashMessage,
    emptyStateTitle = 'No hay elementos',
    emptyStateDescription = 'Agrega tu primer elemento',
    emptyStateIcon = 'fa-list',
    archivedSectionTitle = 'Elementos Archivados',
    toggleButtonText = 'Ver Archivados',
    toggleButtonIcon = 'fa-archive',
    headerActions = null,
    title = 'Elementos'
}) {
    const defaultRenderArchivedRow = (item) => (
        <tr key={item.id}>
            <td className="text-gray-500">{item.name}</td>
            <td className="text-right text-gray-500">{item.balance ? `$${item.balance.toLocaleString()}` : ''}</td>
            <td className="text-gray-500">{item.notes || <span className="text-gray-400 italic">Sin notas</span>}</td>
            <td>
                <TableActions
                    onUnarchive={(e) => {
                        e.stopPropagation();
                        onUnarchive(item);
                    }}
                    unarchiveTooltip="Desarchivar"
                />
            </td>
        </tr>
    );

    const defaultRenderRow = (item) => (
        <tr 
            key={item.id} 
            className={onViewDetails ? "cursor-pointer" : ""} 
            onClick={onViewDetails ? () => onViewDetails(item) : undefined}
        >
            <td>{item.name}</td>
            <td className="text-right">{item.balance ? `$${item.balance.toLocaleString()}` : ''}</td>
            <td className="text-gray-600">
                {item.notes ? (
                    <span className="truncate max-w-xs block" title={item.notes}>
                        {item.notes}
                    </span>
                ) : (
                    <span className="text-gray-400 italic">Sin notas</span>
                )}
            </td>
            <td>
                <TableActions
                    onEdit={(e) => {
                        e.stopPropagation();
                        onEdit(item);
                    }}
                    onDelete={(e) => {
                        e.stopPropagation();
                        onDelete(item);
                    }}
                    onArchive={(e) => {
                        e.stopPropagation();
                        onArchive(item);
                    }}
                    editTooltip="Editar"
                    deleteTooltip="Eliminar"
                    archiveTooltip="Archivar"
                />
            </td>
        </tr>
    );

    return (
        <div className="space-y-6">
            {/* Header with toggle button */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={onToggleArchived}
                        className="btn-secondary"
                    >
                        <i className={`fas ${toggleButtonIcon} mr-2`}></i>
                        {toggleButtonText}
                    </button>
                    {headerActions}
                </div>
            </div>

            {/* Flash Message */}
            {flashMessage.visible && (
                <FlashMessage
                    message={flashMessage.message}
                    type={flashMessage.type}
                    onClose={onCloseFlashMessage}
                />
            )}

            {/* Archived Items Section */}
            {showArchived && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="text-lg font-semibold text-gray-900">
                            <i className={`fas ${toggleButtonIcon} mr-2 text-orange-500`}></i>
                            {archivedSectionTitle}
                        </h2>
                    </div>
                    <div className="card-body">
                        {loadingArchived ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="loading-spinner"></div>
                            </div>
                        ) : archivedItems.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <i className="fas fa-archive text-4xl text-gray-300 mb-4"></i>
                                <p>No hay elementos archivados</p>
                            </div>
                        ) : (
                            <DataTable
                                columns={columns}
                                data={archivedItems}
                                renderRow={renderArchivedRow || defaultRenderArchivedRow}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Active Items Section */}
            <div className="card">
                <div className="card-body">
                    {activeItems.length === 0 ? (
                        <div className="text-center py-12">
                            <i className={`fas ${emptyStateIcon} text-6xl text-gray-300 mb-4`}></i>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyStateTitle}</h3>
                            <p className="text-gray-500">{emptyStateDescription}</p>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={activeItems}
                            renderRow={renderRow || defaultRenderRow}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
