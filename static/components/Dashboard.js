function Dashboard({ user }) {
    const [dashboardData, setDashboardData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/dashboard/');
            setDashboardData(response.data);
        } catch (error) {
            if (error.response?.data) {
                setError(error.response.data);
            } else {
                setError({
                    error: 'Error al cargar el dashboard',
                    message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
                    suggestions: ['Verifica tu conexión a internet', 'Recarga la página']
                });
            }
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-UY', {
            style: 'currency',
            currency: 'UYU'
        }).format(amount);
    };

    const getCellValue = (conceptData) => {
        if (typeof conceptData === 'number') {
            return conceptData;
        }
        return 0;
    };

    const getAllConcepts = () => {
        if (!dashboardData?.current_month_cashflow_data) return { income: [], outcome: [] };

        const incomeSet = new Set();
        const outcomeSet = new Set();

        Object.keys(dashboardData.current_month_cashflow_data.income_concepts || {}).forEach(concept => incomeSet.add(concept));
        Object.keys(dashboardData.current_month_cashflow_data.outcome_concepts || {}).forEach(concept => outcomeSet.add(concept));

        return {
            income: Array.from(incomeSet).sort(),
            outcome: Array.from(outcomeSet).sort()
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="loading-spinner"></div>
                <span className="ml-2">Cargando dashboard...</span>
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

    if (!dashboardData) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Preparando dashboard...</p>
            </div>
        );
    }

    const concepts = getAllConcepts();
    const totalsData = dashboardData.totals_data;
    const cashflowData = dashboardData.current_month_cashflow_data;

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    ¡Bienvenido de vuelta, {user.email}! 👋
                </h1>
            </div>

            {/* Current Month Cashflow */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <i className="fas fa-stream text-blue-500"></i>
                        Flujo de Caja del Mes Actual
                    </h3>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="loading-spinner"></div>
                            <span className="ml-2">Cargando flujo de caja...</span>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <i className="fas fa-exclamation-triangle text-red-500 text-lg"></i>
                                </div>
                                <div className="ml-3 flex-1">
                                    <h4 className="text-sm font-semibold text-red-800">
                                        {typeof error === 'string' ? error : error.error}
                                    </h4>
                                </div>
                            </div>
                        </div>
                    ) : cashflowData ? (
                        <div className="space-y-6">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{cashflowData.name}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className={`border rounded-lg p-4 ${cashflowData.income >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                        <div className={`text-sm font-medium ${cashflowData.income >= 0 ? 'text-green-800' : 'text-red-800'}`}>Ingresos</div>
                                        <div className={`text-2xl font-bold ${cashflowData.income >= 0 ? 'text-green-900' : 'text-red-900'}`}>{formatCurrency(cashflowData.income)}</div>
                                        <div className="text-xs text-gray-500 mt-1">Proyección: {formatCurrency(cashflowData.projected_income || 0)}</div>
                                    </div>
                                    <div className={`border rounded-lg p-4 ${cashflowData.outcome < 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                        <div className={`text-sm font-medium ${cashflowData.outcome < 0 ? 'text-red-800' : 'text-green-800'}`}>Gastos</div>
                                        <div className={`text-2xl font-bold ${cashflowData.outcome < 0 ? 'text-red-900' : 'text-green-900'}`}>{formatCurrency(cashflowData.outcome)}</div>
                                        <div className="text-xs text-gray-500 mt-1">Proyección: {formatCurrency(cashflowData.projected_outcome || 0)}</div>
                                    </div>
                                    <div className={`border rounded-lg p-4 ${cashflowData.balance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                        <div className={`text-sm font-medium ${cashflowData.balance >= 0 ? 'text-green-800' : 'text-red-800'}`}>Balance</div>
                                        <div className={`text-2xl font-bold ${cashflowData.balance >= 0 ? 'text-green-900' : 'text-red-900'}`}>{formatCurrency(cashflowData.balance)}</div>
                                        <div className="text-xs text-gray-500 mt-1">Proyección: {formatCurrency(cashflowData.projected_balance || 0)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Ingresos Section */}
                                <div>
                                    <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                                        <i className="fas fa-arrow-up mr-2"></i>
                                        Ingresos
                                    </h3>
                                    <div className="space-y-3">
                                        {concepts.income.map((conceptName) => {
                                            const conceptData = cashflowData.income_concepts[conceptName];
                                            const amount = conceptData?.total || 0;
                                            const projection = conceptData?.projected_total || 0;
                                            return (
                                                <div key={conceptName} className="p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium text-gray-700">{conceptName}</span>
                                                        <span className="text-green-600 font-semibold">
                                                            {amount !== 0 ? formatCurrency(amount) : '-'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-end mt-1">
                                                        <span className="text-xs text-gray-500">
                                                            Proyección: {projection !== 0 ? formatCurrency(projection) : '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {concepts.income.length === 0 && (
                                            <div className="text-center py-4 text-gray-500">
                                                No hay conceptos de ingreso
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Gastos Section */}
                                <div>
                                    <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                                        <i className="fas fa-arrow-down mr-2"></i>
                                        Gastos
                                    </h3>
                                    <div className="space-y-3">
                                        {concepts.outcome.map((conceptName) => {
                                            const conceptData = cashflowData.outcome_concepts[conceptName];
                                            const amount = conceptData?.total || 0;
                                            const projection = conceptData?.projected_total || 0;
                                            return (
                                                <div key={conceptName} className="p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium text-gray-700">{conceptName}</span>
                                                        <span className="text-red-600 font-semibold">
                                                            {amount !== 0 ? formatCurrency(amount) : '-'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-end mt-1">
                                                        <span className="text-xs text-gray-500">
                                                            Proyección: {projection !== 0 ? formatCurrency(projection) : '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {concepts.outcome.length === 0 && (
                                            <div className="text-center py-4 text-gray-500">
                                                No hay conceptos de gasto
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Preparando flujo de caja...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Totals Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`bg-gradient-to-r ${totalsData.total_income >= 0 ? 'from-green-50 to-green-100 border-green-200' : 'from-red-50 to-red-100 border-red-200'} border rounded-lg p-6`}>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className={`w-12 h-12 ${totalsData.total_income >= 0 ? 'bg-green-500' : 'bg-red-500'} rounded-lg flex items-center justify-center`}>
                                <i className={`fas ${totalsData.total_income >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'} text-white text-xl`}></i>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className={`text-sm font-medium ${totalsData.total_income >= 0 ? 'text-green-800' : 'text-red-800'}`}>Total Ingresos</p>
                            <p className={`text-2xl font-bold ${totalsData.total_income >= 0 ? 'text-green-900' : 'text-red-900'}`}>{formatCurrency(totalsData.total_income)}</p>
                        </div>
                    </div>
                </div>

                <div className={`bg-gradient-to-r ${totalsData.total_outcome < 0 ? 'from-red-50 to-red-100 border-red-200' : 'from-green-50 to-green-100 border-green-200'} border rounded-lg p-6`}>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className={`w-12 h-12 ${totalsData.total_outcome < 0 ? 'bg-red-500' : 'bg-green-500'} rounded-lg flex items-center justify-center`}>
                                <i className={`fas ${totalsData.total_outcome < 0 ? 'fa-arrow-down' : 'fa-arrow-up'} text-white text-xl`}></i>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className={`text-sm font-medium ${totalsData.total_outcome < 0 ? 'text-red-800' : 'text-green-800'}`}>Total Gastos</p>
                            <p className={`text-2xl font-bold ${totalsData.total_outcome < 0 ? 'text-red-900' : 'text-green-900'}`}>{formatCurrency(totalsData.total_outcome)}</p>
                        </div>
                    </div>
                </div>

                <div className={`bg-gradient-to-r ${totalsData.total_balance >= 0 ? 'from-green-50 to-green-100 border-green-200' : 'from-red-50 to-red-100 border-red-200'} border rounded-lg p-6`}>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className={`w-12 h-12 ${totalsData.total_balance >= 0 ? 'bg-green-500' : 'bg-red-500'} rounded-lg flex items-center justify-center`}>
                                <i className={`fas ${totalsData.total_balance >= 0 ? 'fa-check-circle' : 'fa-exclamation-triangle'} text-white text-xl`}></i>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className={`text-sm font-medium ${totalsData.total_balance >= 0 ? 'text-green-800' : 'text-red-800'}`}>Balance Total</p>
                            <p className={`text-2xl font-bold ${totalsData.total_balance >= 0 ? 'text-green-900' : 'text-red-900'}`}>{formatCurrency(totalsData.total_balance)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}