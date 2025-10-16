import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { isCurrentMonth } from '../utils/dateUtils';
import { ERROR_MESSAGES } from '../constants/appConstants';

export const useDashboardData = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const isCurrentMonthByName = useCallback((monthName) => {
        return isCurrentMonth(monthName);
    }, []);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [balancesResponse, totalsResponse] = await Promise.all([
                api.get('/concept-balances/for-months/?month_offset=6'),
                api.get('/transactions/totals/')
            ]);
            
            const combinedData = {
                months_data: balancesResponse.data.map(month => ({
                    ...month,
                    is_current_month: isCurrentMonthByName(month.month_name)
                })),
                totals_data: totalsResponse.data
            };
            
            setDashboardData(combinedData);
        } catch (error) {
            if (error.response?.data) {
                setError(error.response.data);
            } else {
                setError({
                    error: ERROR_MESSAGES.LOADING_ERROR,
                    message: ERROR_MESSAGES.NETWORK_ERROR,
                    suggestions: ['Verifica tu conexión a internet', 'Recarga la página']
                });
            }
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [isCurrentMonthByName]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return {
        dashboardData,
        loading,
        error,
        refetchData: fetchDashboardData,
        isCurrentMonthByName
    };
};
