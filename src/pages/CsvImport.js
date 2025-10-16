import React from 'react';

function CsvImport() {
    const [currentStep, setCurrentStep] = React.useState(1);
    const [csvFile, setCsvFile] = React.useState(null);
    const [csvPreview, setCsvPreview] = React.useState(null);
    const [importing, setImporting] = React.useState(false);
    const [importResult, setImportResult] = React.useState(null);
    const [error, setError] = React.useState('');
    const [importProgress, setImportProgress] = React.useState({ progress: 0, total: 0, message: '' });

    const steps = [
        { number: 1, title: 'Seleccionar Archivo', description: 'Selecciona tu archivo CSV' },
        { number: 2, title: 'Vista Previa', description: 'Revisa los datos antes de importar' },
        { number: 3, title: 'Importar', description: 'Procesar e importar transacciones' },
        { number: 4, title: 'Resultados', description: 'Resultados de la importación' }
    ];

    // Proper CSV parser that handles quoted fields
    const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        // Add the last field
        result.push(current.trim());
        
        // Remove quotes from the beginning and end of each field
        return result.map(field => field.replace(/^"|"$/g, ''));
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            setError('Por favor selecciona un archivo CSV válido');
            return;
        }

        setCsvFile(file);
        setError('');
        
        // Preview the CSV content
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\n').filter(line => line.trim());
            const headers = parseCSVLine(lines[0]);
            const rows = lines.slice(1, 6).map(line => // Show first 5 rows
                parseCSVLine(line)
            );
            
            setCsvPreview({ headers, rows, totalRows: lines.length - 1 });
            setCurrentStep(2);
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (!csvFile) return;

        setImporting(true);
        setError('');
        setImportProgress({ progress: 0, total: 0, message: 'Iniciando importación...' });

        try {
            const formData = new FormData();
            formData.append('file', csvFile);

            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/v1/transactions/import_stream/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Error al iniciar la importación');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            
                            if (data.type === 'progress') {
                                setImportProgress({
                                    progress: data.progress,
                                    total: data.total,
                                    message: data.message
                                });
                            } else if (data.type === 'complete') {
                                setImportResult(data);
                                setCurrentStep(4);
                                break;
                            } else if (data.type === 'error') {
                                setError(data.message);
                                break;
                            }
                        } catch (e) {
                            // Ignore malformed JSON lines
                        }
                    }
                }
            }
        } catch (error) {
            setError(error.message || 'Error al importar el CSV');
        } finally {
            setImporting(false);
        }
    };

    const resetWizard = () => {
        setCurrentStep(1);
        setCsvFile(null);
        setCsvPreview(null);
        setImportResult(null);
        setError('');
        setImportProgress({ progress: 0, total: 0, message: '' });
    };

    const goToStep = (step) => {
        if (step === 1) {
            resetWizard();
        } else if (step === 2 && csvFile) {
            setCurrentStep(2);
        } else if (step === 3 && csvPreview) {
            setCurrentStep(3);
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {/* Progress Steps */}
            <div className="card">
                <div className="card-body">
                    <div className="flex items-center justify-between mb-6">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center">
                                <div 
                                    className={`step-indicator ${
                                        currentStep >= step.number ? 'active' : ''
                                    } ${currentStep === step.number ? 'current' : ''}`}
                                    onClick={() => goToStep(step.number)}
                                >
                                    {currentStep > step.number ? (
                                        <i className="fas fa-check"></i>
                                    ) : (
                                        step.number
                                    )}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`step-connector ${
                                        currentStep > step.number ? 'completed' : ''
                                    }`}></div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            {steps[currentStep - 1].title}
                        </h2>
                        <p className="text-gray-600">
                            {steps[currentStep - 1].description}
                        </p>
                    </div>

                    {/* Step Content */}
                    {currentStep === 1 && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-medium text-blue-900 mb-3">
                                    <i className="fas fa-info-circle mr-2"></i>
                                    Formato CSV Esperado
                                </h4>
                                <div className="text-sm text-blue-800 space-y-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p><strong>Encabezados requeridos:</strong></p>
                                            <ul className="list-disc list-inside ml-2">
                                                <li>Fecha</li>
                                                <li>Concepto</li>
                                                <li>Monto</li>
                                                <li>Cuenta</li>
                                                <li>Detalle</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <p><strong>Formatos:</strong></p>
                                            <ul className="list-disc list-inside ml-2">
                                                <li>Fecha: MM/YYYY (ej.: 08/2020)</li>
                                                <li>Monto: usar coma decimal (ej.: "46,02")</li>
                                                <li>Concepto: vacío para transferencias</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <div className="space-y-4">
                                    <div className="text-gray-500">
                                        <i className="fas fa-cloud-upload-alt text-4xl mb-4"></i>
                                        <p className="text-lg font-medium">Selecciona tu archivo CSV</p>
                                        <p className="text-sm">o arrastra y suelta aquí</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="csv-upload"
                                    />
                                    <label
                                        htmlFor="csv-upload"
                                        className="btn-primary inline-flex items-center cursor-pointer"
                                    >
                                        <i className="fas fa-folder-open mr-2"></i>
                                        Seleccionar Archivo
                                    </label>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <i className="fas fa-exclamation-triangle text-yellow-600 mt-1 mr-2"></i>
                                    <div className="text-sm text-yellow-800">
                                        <p className="font-medium mb-1">Notas Importantes:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>Las cuentas y conceptos faltantes se crearán automáticamente</li>
                                            <li>Las transacciones con detalles iguales y montos opuestos se detectarán como transferencias</li>
                                            <li>Podrás revisar los datos antes de confirmar la importación</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && csvPreview && (
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h4 className="font-medium text-green-900 mb-2">
                                    <i className="fas fa-check-circle mr-2"></i>
                                    Archivo Cargado Exitosamente
                                </h4>
                                <div className="text-sm text-green-800">
                                    <p><strong>Archivo:</strong> {csvFile.name}</p>
                                    <p><strong>Total de filas:</strong> {csvPreview.totalRows}</p>
                                    <p><strong>Columnas detectadas:</strong> {csvPreview.headers.join(', ')}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Vista Previa de Datos</h4>
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                {csvPreview.headers.map((header, index) => (
                                                    <th key={index}>{header}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {csvPreview.rows.map((row, rowIndex) => (
                                                <tr key={rowIndex}>
                                                    {row.map((cell, cellIndex) => (
                                                        <td key={cellIndex}>{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {csvPreview.totalRows > 5 && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        Mostrando las primeras 5 filas de {csvPreview.totalRows} total
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-between">
                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className="btn-secondary"
                                >
                                    <i className="fas fa-arrow-left mr-2"></i>
                                    Volver
                                </button>
                                <button
                                    onClick={() => setCurrentStep(3)}
                                    className="btn-primary"
                                >
                                    Continuar
                                    <i className="fas fa-arrow-right ml-2"></i>
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="text-center">
                                <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                                    <i className="fas fa-upload text-blue-600 text-2xl"></i>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    ¿Listo para importar?
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Se procesarán {csvPreview?.totalRows || 0} filas desde el archivo {csvFile?.name}
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-3">Resumen del Proceso:</h4>
                                <ul className="text-sm text-gray-700 space-y-2">
                                    <li className="flex items-center">
                                        <i className="fas fa-check text-green-500 mr-2"></i>
                                        Crear cuentas y conceptos faltantes
                                    </li>
                                    <li className="flex items-center">
                                        <i className="fas fa-check text-green-500 mr-2"></i>
                                        Detectar transferencias automáticamente
                                    </li>
                                    <li className="flex items-center">
                                        <i className="fas fa-check text-green-500 mr-2"></i>
                                        Crear meses si no existen
                                    </li>
                                    <li className="flex items-center">
                                        <i className="fas fa-check text-green-500 mr-2"></i>
                                        Procesar todas las transacciones
                                    </li>
                                    <li className="flex items-center">
                                        <i className="fas fa-thin fa-triangle-exclamation mr-2"></i>
                                        Dependiendo del tamaño del archivo, esto puede tardar unos minutos.
                                        Por favor, no cierre ni recargue la página.
                                    </li>
                                    <li className="flex items-center">
                                        <i className="fas fa-thin fa-triangle-exclamation mr-2"></i>
                                        Todas las Transacciones existentes se eliminarán antes de la importación.
                                    </li>
                                </ul>
                            </div>

                            {importing && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <h4 className="font-medium text-blue-900 mb-3">
                                        <i className="fas fa-cog fa-spin mr-2"></i>
                                        Importando CSV
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="text-sm text-blue-800 mb-2">
                                            {importProgress.message}
                                        </div>
                                        <div className="w-full bg-blue-200 rounded-full h-2">
                                            <div 
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{
                                                    width: importProgress.total > 0 
                                                        ? `${(importProgress.progress / importProgress.total) * 100}%`
                                                        : '0%'
                                                }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-blue-700">
                                            <span>{importProgress.progress} de {importProgress.total}</span>
                                            <span>
                                                {importProgress.total > 0 
                                                    ? Math.round((importProgress.progress / importProgress.total) * 100)
                                                    : 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <button
                                    onClick={() => setCurrentStep(2)}
                                    className="btn-secondary"
                                    disabled={importing}
                                >
                                    <i className="fas fa-arrow-left mr-2"></i>
                                    Volver
                                </button>
                                <button
                                    onClick={handleImport}
                                    className="btn-primary"
                                    disabled={importing}
                                >
                                    {importing ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin mr-2"></i>
                                            Importando...
                                        </>
                                    ) : (
                                        <>
                                            Importar Ahora
                                            <i className="fas fa-file-import ml-2"></i>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && importResult && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="text-center">
                                <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                                    <i className="fas fa-check text-green-600 text-2xl"></i>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    ¡Importación Completada!
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Se han procesado todas las transacciones correctamente
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-800 mb-1">
                                        {importResult.imported_transactions || 0}
                                    </div>
                                    <div className="text-sm text-green-700">Transacciones Importadas</div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-800 mb-1">
                                        {importResult.summary?.success_rate || 0}%
                                    </div>
                                    <div className="text-sm text-blue-700">Tasa de Éxito</div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-3">Detalles:</h4>
                                <ul className="text-sm text-gray-700 space-y-2">
                                    <li className="flex items-center">
                                        <i className="fas fa-file-csv text-blue-500 mr-2"></i>
                                        <span>Total de filas procesadas: {importResult.summary?.total_rows || 0}</span>
                                    </li>
                                    <li className="flex items-center">
                                        <i className="fas fa-check-circle text-green-500 mr-2"></i>
                                        <span>Transacciones exitosas: {importResult.summary?.imported_transactions || 0}</span>
                                    </li>
                                    <li className="flex items-center">
                                        <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                                        <span>Errores encontrados: {importResult.summary?.errors_count || 0}</span>
                                    </li>
                                </ul>
                                {importResult.errors && importResult.errors.length > 0 && (
                                    <div className="mt-4">
                                        <h5 className="font-medium text-red-900 mb-2">Errores:</h5>
                                        <div className="max-h-32 overflow-y-auto">
                                            {importResult.errors.slice(0, 5).map((error, index) => (
                                                <div key={index} className="text-xs text-red-700 mb-1">
                                                    Error {index + 1}: {error.error}
                                                </div>
                                            ))}
                                            {importResult.errors.length > 5 && (
                                                <div className="text-xs text-red-600">
                                                    ... y {importResult.errors.length - 5} errores más
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-center">
                                <button
                                    onClick={resetWizard}
                                    className="btn-secondary mr-4"
                                >
                                    <i className="fas fa-redo mr-2"></i>
                                    Nueva Importación
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="btn-primary"
                                >
                                    <i className="fas fa-home mr-2"></i>
                                    Ir al Panel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CsvImport;
