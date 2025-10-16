import { useState, useCallback } from 'react';
import api from '../api';
import { parseMonthName } from '../utils/dateUtils';
import { DASHBOARD_CONFIG } from '../constants/appConstants';

export const usePastMonths = (isCurrentMonthByName) => {
    const [pastMonthsData, setPastMonthsData] = useState([]);
    const [loadingPastMonths, setLoadingPastMonths] = useState(false);
    const [hasMorePastMonths, setHasMorePastMonths] = useState(true);
    const [oldestLoadedMonth, setOldestLoadedMonth] = useState(null);

    const MONTHS_TO_LOAD = DASHBOARD_CONFIG.MONTHS_TO_LOAD_PER_REQUEST;


    const fetchPastMonths = useCallback(async (referenceMonth = null) => {
        setLoadingPastMonths(true);
        try {
            let url = `/concept-balances/for-months/?month_offset=-${MONTHS_TO_LOAD}`;
            if (referenceMonth) {
                const referenceDate = parseMonthName(referenceMonth.month_name).toISOString().split('T')[0];
                url = `/concept-balances/for-months/?month_offset=-${MONTHS_TO_LOAD}&reference_date=${referenceDate}`;
            }
            
            const response = await api.get(url);
            
            if (response.data && response.data.length > 0) {
                const processedData = response.data.map(month => ({
                    ...month,
                    is_current_month: isCurrentMonthByName(month.month_name)
                }));
                
                if (referenceMonth) {
                    setPastMonthsData(prevMonths => [...processedData, ...prevMonths]);
                } else {
                    setPastMonthsData(processedData);
                }
                
                // Set the oldest month for pagination - find the actual oldest month by date
                const sortedByDate = processedData.sort((a, b) => {
                    const dateA = parseMonthName(a.month_name);
                    const dateB = parseMonthName(b.month_name);
                    return dateA.getTime() - dateB.getTime();
                });
                setOldestLoadedMonth(sortedByDate[0]);
                
                // Check if we have fewer than expected months, indicating no more data
                if (processedData.length < MONTHS_TO_LOAD) {
                    setHasMorePastMonths(false);
                }
            } else {
                setHasMorePastMonths(false);
            }
        } catch (error) {
            console.error('Error fetching past months:', error);
        } finally {
            setLoadingPastMonths(false);
        }
    }, [isCurrentMonthByName, parseMonthName]);

    const loadMorePastMonths = useCallback(async () => {
        if (loadingPastMonths) return;
        await fetchPastMonths(oldestLoadedMonth);
    }, [fetchPastMonths, loadingPastMonths, oldestLoadedMonth]);

    const resetPastMonths = useCallback(() => {
        setPastMonthsData([]);
        setOldestLoadedMonth(null);
        setHasMorePastMonths(true);
    }, []);

    return {
        pastMonthsData,
        loadingPastMonths,
        hasMorePastMonths,
        loadMorePastMonths,
        resetPastMonths,
        parseMonthName
    };
};
