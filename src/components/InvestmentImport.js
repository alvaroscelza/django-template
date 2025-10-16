import React, { useState } from 'react';
import api from '../api';

/**
 * Component for importing investments from CSV files (exported from Google Sheets)
 */
function InvestmentImport() {
    const [currentStep, setCurrentStep] = useState(1);
    const [csvFile, setCsvFile] = useState(null);
    const [csvPreview, setCsvPreview] = useState(null);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [error, setError] = useState('');
    const [formatType, setFormatType] = useState('standard');
    const [columnMapping, setColumnMapping] = useState({
        investment_name: '',
        date: '',
        amount: '',
        description: ''
    });

    const steps = [
        { number: 1, title: 'Seleccionar Archivo', description: 'Selecciona tu archivo CSV exportado de Google Sheets' },
        { number: 2, title: 'Seleccionar Formato', description: 'Indica el formato de tu archivo CSV' },
        { number: 3, title: 'Mapear Columnas', description: 'Indica qué columnas corresponden a cada campo' },
        { number: 4, title: 'Vista Previa', description: 'Revisa los datos antes de importar' },
        { number: 5, title: 'Importar', description: 'Procesar e importar inversiones' },
        { number: 6, title: 'Resultados', description: 'Resultados de la importación' }
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
        setCurrentStep(2); // Go to format selection step
    };

    const handleFormatSelect = (format) => {
        setFormatType(format);
        
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
            
            if (format === 'multi_column') {
                // For multi-column format, we skip the column mapping step
                setCurrentStep(4);
            } else {
                setCurrentStep(3); // Go to column mapping step for standard format
            }
        };
        reader.readAsText(csvFile);
    };

    const handleColumnMappingChange = (field, value) => {
        setColumnMapping(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const goToPreview = () => {
        // Validate that required mappings are set
        const requiredFields = ['investment_name', 'date', 'amount'];
        const missingFields = requiredFields.filter(field => !columnMapping[field]);
        
        if (missingFields.length > 0) {
            setError(`Por favor selecciona columnas para: ${missingFields.join(', ')}`);
            return;
        }
        
        setError('');
        setCurrentStep(4);
    };

    const handleImport = async () => {
        if (!csvFile) return;

        setImporting(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', csvFile);
            formData.append('format_type', formatType); // Use the selected format type
            formData.append('column_mapping', JSON.stringify(columnMapping));

            const response = await api.post('/investments/import-csv/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setImportResult(response.data);
            setCurrentStep(6);
        } catch (error) {
            setError(error.response?.data?.error || 'Error al importar el CSV');
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
        setFormatType('standard');
        setColumnMapping({
            investment_name: '',
            date: '',
            amount: '',
            description: ''
        });
    };

    const goToStep = (step) => {
        if (step === 1) {
            resetWizard();
        } else if (step === 2 && csvFile) {
            setCurrentStep(2);
        } else if (step === 3 && formatType === 'standard') {
            setCurrentStep(3);
        } else if (step === 4 && csvPreview) {
            setCurrentStep(4);
        } else if (step === 5) {
            setCurrentStep(5);
        }
    };

    return (
        <div className="investment-import">
            {/* Step Progress */}
            <div className="bg-gray-50 py-6 px-4 border-b border-gray-200">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between">
                        {steps.map((step) => (
                            <div key={step.number} className="flex flex-col items-center">
                                <div 
                                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                                        step.number < currentStep 
                                            ? 'bg-indigo-600 text-white' 
                                            : step.number === currentStep 
                                                ? 'bg-white border-2 border-indigo-600 text-indigo-600' 
                                                : 'bg-gray-200 text-gray-500'
                                    }`}
                                >
                                    {step.number < currentStep ? (
                                        <i className="fas fa-check"></i>
                                    ) : (
                                        step.number
                                    )}
                                </div>
                                <span className={`text-xs font-medium ${
                                    step.number === currentStep ? 'text-indigo-600' : 'text-gray-500'
                                }`}>
                                    {step.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Step Content */}
            <div className="p-6">
                <div className="max-w-3xl mx-auto">
                    {/* Step Title */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {steps.find(s => s.number === currentStep)?.title}
                        </h2>
                        <p className="text-gray-600">
                            {steps.find(s => s.number === currentStep)?.description}
                        </p>
                    </div>

                    {/* File Selection Step */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <div className="mb-4">
                                    <i className="fas fa-file-csv text-indigo-500 text-4xl mb-4"></i>
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">Selecciona un archivo CSV</h3>
                                    <p className="text-gray-500 text-sm mb-4">Arrastra y suelta o haz clic para seleccionar</p>
                                </div>
                                
                                <input
                                    type="file"
                                    id="csv-file"
                                    accept=".csv"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <label 
                                    htmlFor="csv-file" 
                                    className="btn-primary inline-flex items-center cursor-pointer"
                                >
                                    <i className="fas fa-upload mr-2"></i>
                                    Seleccionar Archivo
                                </label>
                                
                                {error && (
                                    <div className="mt-4 text-red-500 text-sm">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {error}
                                    </div>
                                )}
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex">
                                    <i className="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium mb-2">Formato esperado:</p>
                                        <p>El archivo CSV debe estar exportado desde Google Sheets y contener las columnas necesarias para la importación.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Format Selection Step */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-medium text-blue-900 mb-2">
                                    <i className="fas fa-info-circle mr-2"></i>
                                    Selecciona el Formato de tu CSV
                                </h4>
                                <div className="text-sm text-blue-800 space-y-2">
                                    <p>Tenemos dos formatos disponibles para importar tus inversiones:</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div 
                                    className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${formatType === 'standard' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                                    onClick={() => handleFormatSelect('standard')}
                                >
                                    <h3 className="font-medium text-lg mb-2">Formato Estándar</h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Cada fila representa una entrada de inversión con columnas para nombre, fecha, monto, etc.
                                    </p>
                                    <div className="text-xs bg-gray-100 p-2 rounded">
                                        <pre>
                                            Inversión, Fecha, Monto, Detalle<br/>
                                            Bitcoin, 01/01/2023, 1000, Compra inicial<br/>
                                            Bitcoin, 01/02/2023, 500, Compra adicional<br/>
                                            Ethereum, 01/01/2023, 800, Primera compra
                                        </pre>
                                    </div>
                                </div>

                                <div 
                                    className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${formatType === 'multi_column' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                                    onClick={() => handleFormatSelect('multi_column')}
                                >
                                    <h3 className="font-medium text-lg mb-2">Formato Multi-Columna</h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Cada inversión tiene su propio grupo de columnas (fecha, monto, etc.)
                                    </p>
                                    <div className="text-xs bg-gray-100 p-2 rounded">
                                        <pre>
                                            Bitcoin, , , Ethereum, , <br/>
                                            Fecha, Monto, Precio, Fecha, Monto<br/>
                                            01/01/2023, 1000, 20000, 01/01/2023, 800<br/>
                                            01/02/2023, 500, 22000, 01/02/2023, 400
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Column Mapping Step */}
                    {currentStep === 3 && csvPreview && (
                        <div className="space-y-6">
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

                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-4">Mapeo de Columnas</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Selecciona qué columna de tu CSV corresponde a cada campo requerido
                                </p>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label className="form-label">
                                                Nombre de Inversión <span className="text-red-500">*</span>
                                            </label>
                                            <select 
                                                className="form-input"
                                                value={columnMapping.investment_name}
                                                onChange={(e) => handleColumnMappingChange('investment_name', e.target.value)}
                                                required
                                            >
                                                <option value="">Seleccionar columna...</option>
                                                {csvPreview.headers.map((header, index) => (
                                                    <option key={index} value={header}>{header}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Fecha <span className="text-red-500">*</span>
                                            </label>
                                            <select 
                                                className="form-input"
                                                value={columnMapping.date}
                                                onChange={(e) => handleColumnMappingChange('date', e.target.value)}
                                                required
                                            >
                                                <option value="">Seleccionar columna...</option>
                                                {csvPreview.headers.map((header, index) => (
                                                    <option key={index} value={header}>{header}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Monto <span className="text-red-500">*</span>
                                            </label>
                                            <select 
                                                className="form-input"
                                                value={columnMapping.amount}
                                                onChange={(e) => handleColumnMappingChange('amount', e.target.value)}
                                                required
                                            >
                                                <option value="">Seleccionar columna...</option>
                                                {csvPreview.headers.map((header, index) => (
                                                    <option key={index} value={header}>{header}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Descripción (Opcional)
                                            </label>
                                            <select 
                                                className="form-input"
                                                value={columnMapping.description}
                                                onChange={(e) => handleColumnMappingChange('description', e.target.value)}
                                            >
                                                <option value="">Seleccionar columna...</option>
                                                {csvPreview.headers.map((header, index) => (
                                                    <option key={index} value={header}>{header}</option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Nota: Cualquier otra columna (como Precio) se añadirá automáticamente a la descripción
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button 
                                    className="btn-primary"
                                    onClick={goToPreview}
                                >
                                    Continuar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Preview Step */}
                    {currentStep === 4 && csvPreview && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-medium text-blue-900 mb-2">
                                    <i className="fas fa-info-circle mr-2"></i>
                                    Vista Previa de Datos
                                </h4>
                                <div className="text-sm text-blue-800">
                                    {formatType === 'standard' ? (
                                        <p>Revisa los datos antes de importar. Se mostrarán las primeras 5 filas.</p>
                                    ) : (
                                        <p>
                                            Formato multi-columna detectado. El sistema procesará automáticamente 
                                            las inversiones agrupadas por columnas. Cada grupo debe tener columnas 
                                            de fecha y monto.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {formatType === 'standard' && (
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Inversión</th>
                                                <th>Fecha</th>
                                                <th>Monto</th>
                                                <th>Descripción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {csvPreview.rows.map((row, rowIndex) => {
                                                const investmentIndex = csvPreview.headers.indexOf(columnMapping.investment_name);
                                                const dateIndex = csvPreview.headers.indexOf(columnMapping.date);
                                                const amountIndex = csvPreview.headers.indexOf(columnMapping.amount);
                                                const descriptionIndex = columnMapping.description ? csvPreview.headers.indexOf(columnMapping.description) : -1;
                                                
                                                // Generate description including other columns
                                                let fullDescription = descriptionIndex >= 0 ? row[descriptionIndex] : '';
                                                const extraInfo = [];
                                                
                                                // Add other columns to description preview
                                                row.forEach((value, index) => {
                                                    const header = csvPreview.headers[index];
                                                    if (index !== investmentIndex && 
                                                        index !== dateIndex && 
                                                        index !== amountIndex && 
                                                        index !== descriptionIndex && 
                                                        value.trim()) {
                                                        extraInfo.push(`${header}: ${value}`);
                                                    }
                                                });
                                                
                                                if (extraInfo.length > 0) {
                                                    if (fullDescription) {
                                                        fullDescription += ' | ';
                                                    }
                                                    fullDescription += extraInfo.join(' | ');
                                                }
                                                
                                                return (
                                                    <tr key={rowIndex}>
                                                        <td>{investmentIndex >= 0 ? row[investmentIndex] : ''}</td>
                                                        <td>{dateIndex >= 0 ? row[dateIndex] : ''}</td>
                                                        <td>{amountIndex >= 0 ? row[amountIndex] : ''}</td>
                                                        <td>{fullDescription}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {formatType === 'multi_column' && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <i className="fas fa-info-circle text-yellow-600 mt-1 mr-2"></i>
                                        <div className="text-sm text-yellow-800">
                                            <p className="font-medium mb-1">Formato Multi-Columna:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>La primera fila debe contener los nombres de las inversiones</li>
                                                <li>La segunda fila debe contener los tipos de columnas (Fecha, Monto, etc.)</li>
                                                <li>El sistema detectará automáticamente las columnas de fecha y monto para cada inversión</li>
                                                <li>Cualquier otra columna se añadirá a la descripción</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3">
                                <button 
                                    className="btn-secondary"
                                    onClick={() => setCurrentStep(formatType === 'standard' ? 3 : 2)}
                                >
                                    Atrás
                                </button>
                                <button 
                                    className="btn-primary"
                                    onClick={() => setCurrentStep(5)}
                                >
                                    Continuar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Import Step */}
                    {currentStep === 5 && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 bg-amber-100 rounded-full p-2 mr-4">
                                        <i className="fas fa-exclamation-triangle text-amber-600 text-xl"></i>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-amber-800 mb-3">Antes de importar:</h4>
                                        <ul className="space-y-2 text-amber-700">
                                            <li className="flex items-start">
                                                <i className="fas fa-check-circle text-amber-600 mt-1 mr-2"></i>
                                                <span>Se crearán inversiones nuevas si no existen</span>
                                            </li>
                                            <li className="flex items-start">
                                                <i className="fas fa-check-circle text-amber-600 mt-1 mr-2"></i>
                                                <span>Se agregarán nuevos movimientos a las inversiones existentes</span>
                                            </li>
                                            <li className="flex items-start">
                                                <i className="fas fa-check-circle text-amber-600 mt-1 mr-2"></i>
                                                <span>Cualquier columna adicional (como Precio) se añadirá automáticamente a la descripción</span>
                                            </li>
                                            <li className="flex items-start">
                                                <i className="fas fa-exclamation-circle text-amber-600 mt-1 mr-2"></i>
                                                <span className="font-medium">Este proceso no se puede deshacer</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center mt-8">
                                <button 
                                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center text-lg"
                                    onClick={handleImport}
                                    disabled={importing}
                                >
                                    {importing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Importando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-file-import mr-2"></i>
                                            Importar Datos
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Results Step */}
                    {currentStep === 6 && importResult && (
                        <div className="max-w-4xl mx-auto space-y-8">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 shadow-md">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 bg-emerald-100 rounded-full p-3 mr-4">
                                        <i className="fas fa-check-circle text-emerald-600 text-2xl"></i>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-emerald-800 mb-4">
                                            Importación Completada Exitosamente
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white rounded-lg p-4 border border-emerald-100 shadow-sm">
                                                <div className="text-sm text-emerald-600 font-medium mb-1">Inversiones creadas</div>
                                                <div className="text-3xl font-bold text-emerald-700">{importResult.created_investments}</div>
                                            </div>
                                            <div className="bg-white rounded-lg p-4 border border-emerald-100 shadow-sm">
                                                <div className="text-sm text-emerald-600 font-medium mb-1">Movimientos creados</div>
                                                <div className="text-3xl font-bold text-emerald-700">{importResult.created_entries}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {importResult.errors && importResult.errors.length > 0 && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-md">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 bg-amber-100 rounded-full p-3 mr-4">
                                            <i className="fas fa-exclamation-triangle text-amber-600 text-2xl"></i>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-amber-800 mb-3">
                                                Advertencias ({importResult.errors.length})
                                            </h4>
                                            <div className="bg-white rounded-lg border border-amber-100 p-4 shadow-sm">
                                                <ul className="space-y-2 text-amber-800">
                                                    {importResult.errors.slice(0, 5).map((error, index) => (
                                                        <li key={index} className="flex items-start">
                                                            <i className="fas fa-exclamation-circle text-amber-500 mt-1 mr-2"></i>
                                                            <span>{error}</span>
                                                        </li>
                                                    ))}
                                                    {importResult.errors.length > 5 && (
                                                        <li className="flex items-start text-amber-600 font-medium">
                                                            <i className="fas fa-plus-circle mt-1 mr-2"></i>
                                                            <span>Y {importResult.errors.length - 5} advertencias más</span>
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-center mt-8">
                                <button 
                                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center text-lg"
                                    onClick={resetWizard}
                                >
                                    <i className="fas fa-file-import mr-2"></i>
                                    Importar Otro Archivo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default InvestmentImport;
