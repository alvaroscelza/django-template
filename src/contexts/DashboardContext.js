import React, { createContext, useContext } from 'react';

/**
 * Dashboard Context to reduce prop drilling and centralize dashboard state management
 */
const DashboardContext = createContext(null);

export const useDashboardContext = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboardContext must be used within a DashboardProvider');
    }
    return context;
};

export const DashboardProvider = ({ 
    children,
    monthsData,
    getConceptDataForMonth,
    getConceptDataForMonthAndType,
    calculateTotalsForMonth
}) => {
    const contextValue = {
        monthsData,
        getConceptDataForMonth,
        getConceptDataForMonthAndType,
        calculateTotalsForMonth
    };

    return (
        <DashboardContext.Provider value={contextValue}>
            {children}
        </DashboardContext.Provider>
    );
};
