import React from 'react';

/**
 * Reusable TableActions component for consistent action buttons styling
 * @param {Object} props
 * @param {Function} props.onEdit - Function to call when edit button is clicked
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 * @param {Function} props.onArchive - Function to call when archive button is clicked
 * @param {Function} props.onUnarchive - Function to call when unarchive button is clicked
 * @param {Function} props.onAdd - Function to call when add button is clicked (optional)
 * @param {boolean} props.showAdd - Whether to show the add button
 * @param {string} props.addTooltip - Tooltip text for add button
 * @param {string} props.editTooltip - Tooltip text for edit button
 * @param {string} props.deleteTooltip - Tooltip text for delete button
 * @param {string} props.archiveTooltip - Tooltip text for archive button
 * @param {string} props.unarchiveTooltip - Tooltip text for unarchive button
 */
export default function TableActions({ 
    onEdit, 
    onDelete, 
    onArchive,
    onUnarchive,
    onAdd, 
    showAdd = false,
    addTooltip = "Agregar",
    editTooltip = "Editar",
    deleteTooltip = "Eliminar",
    archiveTooltip = "Archivar",
    unarchiveTooltip = "Desarchivar"
}) {
    return (
        <div className="flex items-center justify-end space-x-1">
            {showAdd && onAdd && (
                <button
                    onClick={onAdd}
                    className="btn-icon btn-sm text-green-600 hover:text-green-700"
                    title={addTooltip}
                >
                    <i className="fas fa-plus"></i>
                </button>
            )}
            {onEdit && (
                <button
                    onClick={onEdit}
                    className="btn-icon btn-sm text-blue-600 hover:text-blue-700"
                    title={editTooltip}
                >
                    <i className="fas fa-edit"></i>
                </button>
            )}
            {onDelete && (
                <button
                    onClick={onDelete}
                    className="btn-icon btn-sm text-red-600 hover:text-red-700"
                    title={deleteTooltip}
                >
                    <i className="fas fa-trash"></i>
                </button>
            )}
            {onArchive && (
                <button
                    onClick={onArchive}
                    className="btn-icon btn-sm text-orange-600 hover:text-orange-700"
                    title={archiveTooltip}
                >
                    <i className="fas fa-archive"></i>
                </button>
            )}
            {onUnarchive && (
                <button
                    onClick={onUnarchive}
                    className="btn-icon btn-sm text-green-600 hover:text-green-700"
                    title={unarchiveTooltip}
                >
                    <i className="fas fa-undo"></i>
                </button>
            )}
        </div>
    );
}
