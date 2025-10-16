import React from 'react';
import InvestmentImport from './InvestmentImport';

export default function ImportModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container max-w-4xl rounded-xl overflow-hidden shadow-2xl">
                <div className="modal-header bg-gradient-to-r from-indigo-500 to-purple-600 py-5 px-6 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <i className="fas fa-file-import mr-3"></i>
                        Importar Inversiones desde Google Sheets
                    </h3>
                    <button
                        onClick={onClose}
                        className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 flex items-center justify-center w-8 h-8"
                        title="Cerrar"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="modal-body bg-white p-0">
                    <InvestmentImport />
                </div>
            </div>
        </div>
    );
}
