import React, { useMemo } from 'react';
import { formatCurrency } from '../utils/formatting';
import { parseMonthName, getCurrentMonthName } from '../utils/dateUtils';
import { useDashboardData } from '../hooks/useDashboardData';
import { usePastMonths } from '../hooks/usePastMonths';
import { DashboardProvider } from '../contexts/DashboardContext';
import ConceptRow from '../components/ConceptRow';
import TotalsRow from '../components/TotalsRow';

function Dashboard({ user }) {
    // Custom hooks for data management
    const { dashboardData, loading, error, refetchData, isCurrentMonthByName } = useDashboardData();
    const { pastMonthsData, loadingPastMonths, hasMorePastMonths, loadMorePastMonths, resetPastMonths } = usePastMonths(isCurrentMonthByName);

    // Reset past months when dashboard data changes
    React.useEffect(() => {
        if (dashboardData) {
            resetPastMonths();
        }
    }, [dashboardData, resetPastMonths]);

    // Memoized calculations for better performance
    const getAllMonthsData = useMemo(() => {
        if (!dashboardData?.months_data) return [];
        
        if (pastMonthsData.length > 0) {
            const monthsMap = new Map();
            
            pastMonthsData.forEach(month => {
                monthsMap.set(month.id, month);
            });
            
            dashboardData.months_data.forEach(month => {
                monthsMap.set(month.id, month);
            });
            
            return Array.from(monthsMap.values()).sort((a, b) => {
                const dateA = parseMonthName(a.month_name);
                const dateB = parseMonthName(b.month_name);
                return dateA.getTime() - dateB.getTime();
            });
        } else {
            return dashboardData.months_data;
        }
    }, [dashboardData, pastMonthsData, parseMonthName]);

    const allConcepts = useMemo(() => {
        if (!getAllMonthsData.length) return { income: [], outcome: [] };

        const incomeSet = new Set();
        const outcomeSet = new Set();

        getAllMonthsData.forEach((monthData) => {
            monthData.concepts_data.forEach((concept) => {
                if (concept.is_income) {
                    incomeSet.add(concept.name);
                } else {
                    outcomeSet.add(concept.name);
                }
            });
        });

        return {
            income: Array.from(incomeSet).sort(),
            outcome: Array.from(outcomeSet).sort()
        };
    }, [getAllMonthsData]);

    // Get concepts for real data only
    const getRealConcepts = useMemo(() => {
        if (!getRealMonthsData || !getRealMonthsData.length) return { income: [], outcome: [] };

        const incomeSet = new Set();
        const outcomeSet = new Set();

        getRealMonthsData.forEach((monthData) => {
            monthData.concepts_data.forEach((concept) => {
                if (concept.is_income) {
                    incomeSet.add(concept.name);
                } else {
                    outcomeSet.add(concept.name);
                }
            });
        });

        return {
            income: Array.from(incomeSet).sort(),
            outcome: Array.from(outcomeSet).sort()
        };
    }, [getRealMonthsData]);

    // Get concepts for projected data only
    const getProjectedConcepts = useMemo(() => {
        if (!getProjectedMonthsData || !getProjectedMonthsData.length) return { income: [], outcome: [] };

        const incomeSet = new Set();
        const outcomeSet = new Set();

        getProjectedMonthsData.forEach((monthData) => {
            monthData.concepts_data.forEach((concept) => {
                if (concept.is_income) {
                    incomeSet.add(concept.name);
                } else {
                    outcomeSet.add(concept.name);
                }
            });
        });

        return {
            income: Array.from(incomeSet).sort(),
            outcome: Array.from(outcomeSet).sort()
        };
    }, [getProjectedMonthsData]);

    const calculateTotalsForMonth = useMemo(() => {
        return (monthIndex, useProjected = false) => {
            if (!getAllMonthsData[monthIndex]?.concepts_data) {
                return {
                    income: 0,
                    outcome: 0,
                    balance: 0
                };
            }

            let income = 0;
            let outcome = 0;

            getAllMonthsData[monthIndex].concepts_data.forEach(concept => {
                if (concept.is_income) {
                    if (useProjected && concept.projected_balance !== null) {
                        income += concept.projected_balance || 0;
                    } else {
                        income += concept.balance || 0;
                    }
                } else {
                    if (useProjected && concept.projected_balance !== null) {
                        outcome += concept.projected_balance || 0;
                    } else {
                        outcome += concept.balance || 0;
                    }
                }
            });

            return {
                income,
                outcome,
                balance: income + outcome
            };
        };
    }, [getAllMonthsData]);

    // Calculate totals for real data
    const calculateRealTotalsForMonth = useMemo(() => {
        return (monthIndex) => {
            if (!getRealMonthsData[monthIndex]?.concepts_data) {
                return {
                    income: 0,
                    outcome: 0,
                    balance: 0
                };
            }

            let income = 0;
            let outcome = 0;

            getRealMonthsData[monthIndex].concepts_data.forEach(concept => {
                if (concept.is_income) {
                    income += concept.balance || 0;
                } else {
                    outcome += concept.balance || 0;
                }
            });

            return {
                income,
                outcome,
                balance: income + outcome
            };
        };
    }, [getRealMonthsData]);

    // Calculate totals for projected data
    const calculateProjectedTotalsForMonth = useMemo(() => {
        return (monthIndex) => {
            if (!getProjectedMonthsData[monthIndex]?.concepts_data) {
                return {
                    income: 0,
                    outcome: 0,
                    balance: 0
                };
            }

            let income = 0;
            let outcome = 0;

            getProjectedMonthsData[monthIndex].concepts_data.forEach(concept => {
                if (concept.is_income) {
                    income += concept.balance || 0;
                } else {
                    outcome += concept.balance || 0;
                }
            });

            return {
                income,
                outcome,
                balance: income + outcome
            };
        };
    }, [getProjectedMonthsData]);

    const getConceptDataForMonth = useMemo(() => {
        return (conceptName, monthIndex) => {
            if (!getAllMonthsData[monthIndex]?.concepts_data) return null;
            
            return getAllMonthsData[monthIndex].concepts_data.find(
                concept => concept.name === conceptName
            ) || null;
        };
    }, [getAllMonthsData]);

    // Get concept data for a specific month and data type (real/projected)
    const getConceptDataForMonthAndType = useMemo(() => {
        return (conceptName, monthIndex, isProjected = false) => {
            if (!getAllMonthsData[monthIndex]?.concepts_data) return null;
            
            const conceptData = getAllMonthsData[monthIndex].concepts_data.find(
                concept => concept.name === conceptName
            );
            
            if (!conceptData) return null;
            
            // For now, return the same data for both real and projected
            // This will be enhanced when backend projection logic is implemented
            return conceptData;
        };
    }, [getAllMonthsData]);

    // Get concept data for real months
    const getRealConceptDataForMonth = useMemo(() => {
        return (conceptName, monthIndex) => {
            if (!getRealMonthsData[monthIndex]?.concepts_data) return null;
            
            return getRealMonthsData[monthIndex].concepts_data.find(
                concept => concept.name === conceptName
            ) || null;
        };
    }, [getRealMonthsData]);

    // Get concept data for projected months
    const getProjectedConceptDataForMonth = useMemo(() => {
        return (conceptName, monthIndex) => {
            if (!getProjectedMonthsData[monthIndex]?.concepts_data) return null;
            
            return getProjectedMonthsData[monthIndex].concepts_data.find(
                concept => concept.name === conceptName
            ) || null;
        };
    }, [getProjectedMonthsData]);

    const shouldHighlightDifference = useMemo(() => {
        return (amount, projection, monthData) => {
            return false; // No highlighting without projections
        };
    }, []);

    // Separate months into real and projected data
    const getRealMonthsData = useMemo(() => {
        if (!getAllMonthsData || !getAllMonthsData.length) return [];
        
        const currentMonthName = getCurrentMonthName();
        const currentDate = parseMonthName(currentMonthName);
        
        // Get last 3 months including current month + all future months for real data
        const threeMonthsAgo = new Date(currentDate);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 2); // 3 months total (current + 2 previous)
        
        return getAllMonthsData.filter(month => {
            const monthDate = parseMonthName(month.month_name);
            return monthDate >= threeMonthsAgo; // Include all months from 3 months ago onwards
        });
    }, [getAllMonthsData]);

    const getProjectedMonthsData = useMemo(() => {
        if (!getAllMonthsData || !getAllMonthsData.length) return [];
        
        const currentMonthName = getCurrentMonthName();
        const currentDate = parseMonthName(currentMonthName);
        
        // Include current month + future months for projections
        return getAllMonthsData.filter(month => {
            const monthDate = parseMonthName(month.month_name);
            return monthDate >= currentDate;
        });
    }, [getAllMonthsData]);

    // Determine if a month is in the future (for visual separation)
    const getCurrentMonthIndex = useMemo(() => {
        if (!getAllMonthsData.length) return -1;
        
        const currentMonthName = getCurrentMonthName();
        return getAllMonthsData.findIndex(month => month.month_name === currentMonthName);
    }, [getAllMonthsData]);

    const isFutureMonth = useMemo(() => {
        return (monthIndex) => {
            return monthIndex > getCurrentMonthIndex;
        };
    }, [getCurrentMonthIndex]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="loading-spinner"></div>
                <span className="ml-2">Cargando panel...</span>
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
                <p className="text-gray-600">Preparando panel...</p>
            </div>
        );
    }

    const totalsData = dashboardData.totals_data;
    
    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    ¡Bienvenido de vuelta, {user.username || user.email.split('@')[0]}! 👋
                </h1>
            </div>

            {/* Combined Tables Layout */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <i className="fas fa-table text-blue-500"></i>
                        Balances por Concepto
                    </h3>
                </div>
                <div className="card-body p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                {/* First row: Month names with colspan for current/future months */}
                                <tr>
                                    {/* Fixed Concept Column */}
                                    <th className="bg-transparent p-3 text-left sticky left-0 z-10 relative font-bold text-gray-600" style={{ width: '12rem', minWidth: '12rem', maxWidth: '12rem' }}>
                                        <strong>Concepto</strong>
                                        {/* Single button to load past months - only shown when there are more months to load */}
                                        {hasMorePastMonths && (
                                            <button 
                                                className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-blue-500 border-2 border-white text-white flex items-center justify-center cursor-pointer hover:bg-blue-600 focus:outline-none z-20 shadow-md"
                                                onClick={loadMorePastMonths}
                                                disabled={loadingPastMonths}
                                                title="Cargar 3 meses anteriores"
                                                style={{ fontSize: '12px' }}
                                            >
                                                <i className={`fas ${loadingPastMonths ? 'fa-spinner fa-spin' : 'fa-arrow-left'}`}></i>
                                            </button>
                                        )}
                                    </th>
                                    
                                    {getAllMonthsData && getAllMonthsData.length > 0 && getAllMonthsData.map((monthData, monthIndex) => {
                                        const currentMonthName = getCurrentMonthName();
                                        const currentDate = parseMonthName(currentMonthName);
                                        const monthDate = parseMonthName(monthData.month_name);
                                        
                                        // For past months, single column
                                        if (!monthData.is_current_month && monthDate < currentDate) {
                                            return (
                                                <th 
                                                    key={`month-${monthIndex}`} 
                                                    className="bg-transparent p-3 text-center font-bold text-gray-600"
                                                >
                                                    <strong>{monthData.month_name}</strong>
                                                </th>
                                            );
                                        }
                                        
                                        // For current and future months, colspan=2 to span both real and projected columns
                                        return (
                                            <th 
                                                key={`month-${monthIndex}`} 
                                                colSpan={2}
                                                className="bg-transparent p-3 text-center font-bold text-gray-600"
                                            >
                                                <strong>{monthData.month_name}</strong>
                                            </th>
                                        );
                                    })}
                                </tr>
                                
                                {/* Second row: Data type labels for current/future months */}
                                <tr>
                                    <th className="bg-transparent p-2 text-left font-medium text-gray-500 sticky left-0 z-10" 
                                        style={{ width: '12rem', minWidth: '12rem', maxWidth: '12rem' }}>
                                        {/* Empty cell for concept column */}
                                    </th>
                                    
                                    {getAllMonthsData && getAllMonthsData.length > 0 && getAllMonthsData.map((monthData, monthIndex) => {
                                        const currentMonthName = getCurrentMonthName();
                                        const currentDate = parseMonthName(currentMonthName);
                                        const monthDate = parseMonthName(monthData.month_name);
                                        
                                        
                                        // For past months, empty cell (no data type needed)
                                        if (!monthData.is_current_month && monthDate < currentDate) {
                                            return (
                                                <th 
                                                    key={`type-${monthIndex}`} 
                                                    className="bg-transparent p-2 text-center font-medium text-gray-500"
                                                >
                                                    {/* Empty for past months */}
                                                </th>
                                            );
                                        }
                                        
                                        // For current and future months, show both real and projected labels
                                        return [
                                            <th 
                                                key={`real-type-${monthIndex}`} 
                                                className="bg-transparent p-2 text-center font-medium text-green-600"
                                            >
                                                Real
                                            </th>,
                                            <th 
                                                key={`projected-type-${monthIndex}`} 
                                                className="bg-transparent p-2 text-center font-medium text-blue-600"
                                            >
                                                Proyectado
                                            </th>
                                        ];
                                    })}
                                </tr>
                            </thead>
                            <DashboardProvider
                                monthsData={getAllMonthsData}
                                getConceptDataForMonth={getConceptDataForMonth}
                                getConceptDataForMonthAndType={getConceptDataForMonthAndType}
                                calculateTotalsForMonth={calculateTotalsForMonth}
                            >
                                <tbody>
                                    {/* Income Concepts */}
                                    {allConcepts.income.map((conceptName) => (
                                        <ConceptRow
                                            key={conceptName}
                                            conceptName={conceptName}
                                            isExpense={false}
                                            onProjectionUpdate={refetchData}
                                        />
                                    ))}

                                    {/* Total Income Row */}
                                    <TotalsRow
                                        title="Total Ingresos"
                                        bgColorClass="bg-green-100"
                                        textColorClass="text-green-700"
                                    />

                                    {/* Expense Concepts */}
                                    {allConcepts.outcome.map((conceptName) => (
                                        <ConceptRow
                                            key={conceptName}
                                            conceptName={conceptName}
                                            isExpense={true}
                                            onProjectionUpdate={refetchData}
                                        />
                                    ))}

                                    {/* Total Expenses Row */}
                                    <TotalsRow
                                        title="Total Gastos"
                                        bgColorClass="bg-red-100"
                                        textColorClass="text-green-700"
                                    />

                                    {/* Net Profit Row */}
                                    <TotalsRow
                                        title="Ganancia Neta"
                                        bgColorClass="bg-gray-100"
                                        isNetProfit={true}
                                    />

                                    {/* Total Row */}
                                    <TotalsRow
                                        title="Total"
                                        bgColorClass="bg-blue-100"
                                        isGrandTotal={true}
                                        totalsData={totalsData}
                                    />
                                </tbody>
                            </DashboardProvider>
                        </table>
                    </div>
                </div>
            </div>

            {/* Overall Totals */}
            {totalsData && (
                <div className="card mt-6">
                    <div className="card-header">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <i className="fas fa-calculator text-blue-500"></i>
                            Totales Acumulados
                        </h3>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="border rounded-lg p-3 bg-gray-50">
                                <div className="text-sm font-medium text-gray-700">Ingresos Totales</div>
                                <div className="text-xl font-bold">{formatCurrency(totalsData.total_income || 0)}</div>
                            </div>
                            <div className="border rounded-lg p-3 bg-gray-50">
                                <div className="text-sm font-medium text-gray-700">Gastos Totales</div>
                                <div className="text-xl font-bold">{formatCurrency(totalsData.total_outcome || 0)}</div>
                            </div>
                            <div className="border rounded-lg p-3 bg-gray-50">
                                <div className="text-sm font-medium text-gray-700">Balance Total</div>
                                <div className={`text-xl font-bold ${(totalsData.total_income + totalsData.total_outcome) >= 0 ? '' : 'text-red-600'}`}>
                                    {formatCurrency((totalsData.total_income || 0) + (totalsData.total_outcome || 0))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;