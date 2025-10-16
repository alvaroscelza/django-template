import React from 'react';
import api from '../api';

function FinancialStrategyReport({ onBack }) {
    const [strategyData, setStrategyData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const fetchFinancialStrategy = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/transactions/financial-strategy/');
            setStrategyData(response.data);
        } catch (error) {
            // Extract detailed error information from API response
            if (error.response?.data) {
                setError(error.response.data);
            } else {
                setError({
                    error: 'Error al cargar la estrategia financiera',
                    message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
                    suggestions: ['Verifica tu conexión a internet', 'Recarga la página']
                });
            }
            console.error('Error fetching financial strategy:', error);

            // Log detailed information about the error
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
            } else if (error.request) {
                console.error('Error request:', error.request);
            }
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch data when component mounts
    React.useEffect(() => {
        fetchFinancialStrategy();
    }, []);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="loading-spinner"></div>
                    <span className="ml-2">Calculando estrategia financiera...</span>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
                        </div>
                        <div className="ml-3 flex-1">
                            <h3 className="text-lg font-semibold text-red-800 mb-2">
                                {typeof error === 'string' ? error : error.error}
                            </h3>
                            {typeof error === 'object' && error.message && (
                                <p className="text-red-700 mb-4">
                                    {error.message}
                                </p>
                            )}
                            {typeof error === 'object' && error.suggestions && error.suggestions.length > 0 && (
                                <div>
                                    <p className="text-red-700 font-medium mb-2">Qué puedes hacer:</p>
                                    <ul className="list-disc list-inside text-red-700 space-y-1">
                                        {error.suggestions.map((suggestion, index) => (
                                            <li key={index}>{suggestion}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        if (!strategyData && !loading) {
            return (
                <div className="text-center py-12">
                    <p className="text-gray-600">Preparando su estrategia financiera...</p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
                        </div>
                        <div className="card-body space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Edad actual:</span>
                                <span className="font-semibold">{strategyData.current_age} años</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Expectativa de vida:</span>
                                <span className="font-semibold">{strategyData.life_expectancy} años</span>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-semibold text-gray-900">Egresos</h3>
                        </div>
                        <div className="card-body space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Promedio gasto mensual ultimo año:</span>
                                <span className="font-semibold amount-negative">${strategyData.last_year_monthly_outcome_average}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Gasto anual ultimo año:</span>
                                <span className="font-semibold amount-negative">${strategyData.last_year_outcome}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-semibold text-gray-900">Ingresos</h3>
                        </div>
                        <div className="card-body space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Ingreso neto mensual promedio:</span>
                                <span className="font-semibold amount-positive">${strategyData.last_year_monthly_net_income_average}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Ingreso neto anual:</span>
                                <span className="font-semibold amount-positive">${strategyData.last_year_net_income}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-semibold text-gray-900">Proyecciones</h3>
                        </div>
                        <div className="card-body space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Años que podría vivir sin trabajar:</span>
                                <span className="font-semibold text-blue-600">{strategyData.years_without_working} años</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Edad esperada de retiro:</span>
                                <span className="font-semibold text-green-600">{strategyData.expected_retirement_age} años</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                        <strong>Supuestos:</strong> Los gastos no crecerán, la ganancia neta mensual no crecerá.
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold text-gray-900">Estrategia Financiera</h1>
                </div>
            </div>

            {renderContent()}
        </div>
    );
}

export default FinancialStrategyReport;
