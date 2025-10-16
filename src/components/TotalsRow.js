import React from 'react';
import { formatCurrency } from '../utils/formatting';
import { useDashboardContext } from '../contexts/DashboardContext';
import { parseMonthName, getCurrentMonthName } from '../utils/dateUtils';

const TotalsRow = ({ 
    title, 
    bgColorClass = "bg-gray-100",
    textColorClass = "text-gray-700",
    isNetProfit = false,
    isGrandTotal = false,
    totalsData = null
}) => {
    const { monthsData, calculateTotalsForMonth, getConceptDataForMonthAndType } = useDashboardContext();
    
    return (
        <tr className={`${bgColorClass} border-t border-gray-200`}>
            <td className={`p-3 font-semibold sticky left-0 z-10 ${bgColorClass} border-r border-gray-100`} 
                style={{ width: '12rem', minWidth: '12rem', maxWidth: '12rem' }}>
                <span className="text-gray-800">{title}</span>
            </td>
            {monthsData.map((monthData, monthIndex) => {
                const currentMonthName = getCurrentMonthName();
                const currentDate = parseMonthName(currentMonthName);
                const monthDate = parseMonthName(monthData.month_name);
                const isFuture = monthDate > currentDate;
                const isCurrent = monthData.is_current_month;
                
                // For past months, only show real data
                if (monthDate < currentDate) {
                    let realValue;
                    
                    if (isGrandTotal && totalsData) {
                        // Use backend-calculated cumulative total
                        const monthData = monthsData[monthIndex];
                        const monthTotals = monthData?.totals;
                        
                        if (monthTotals && monthTotals.cumulative_total !== undefined) {
                            realValue = monthTotals.cumulative_total;
                        } else {
                            // Fallback to frontend calculation if backend cumulative total not available
                            let cumulativeTotal = totalsData.total_income + totalsData.total_outcome;
                            
                            // Subtract all months that come after the current month
                            for (let i = monthIndex + 1; i < monthsData.length; i++) {
                                const monthTotals = calculateTotalsForMonth(i);
                                cumulativeTotal -= monthTotals.balance;
                            }
                            
                            realValue = cumulativeTotal;
                        }
                    } else {
                        // Use backend-calculated totals for regular totals
                        const monthData = monthsData[monthIndex];
                        const monthTotals = monthData?.totals;
                        
                        if (monthTotals) {
                            if (isNetProfit) {
                                realValue = monthTotals.net_profit;
                            } else if (title.includes('Ingresos')) {
                                realValue = monthTotals.total_income;
                            } else if (title.includes('Gastos')) {
                                realValue = monthTotals.total_outcome;
                            }
                        } else {
                            // Fallback to frontend calculation if backend totals not available
                            const totals = calculateTotalsForMonth(monthIndex);
                            if (isNetProfit) {
                                realValue = totals.balance;
                            } else if (title.includes('Ingresos')) {
                                realValue = totals.income;
                            } else if (title.includes('Gastos')) {
                                realValue = totals.outcome;
                            }
                        }
                    }
                    
                    const getValueColor = (value) => {
                        if (isNetProfit || isGrandTotal) {
                            return value >= 0 ? 'text-green-700' : 'text-red-700';
                        }
                        // For Total Ingresos and Total Gastos, use dynamic colors based on value
                        if (title.includes('Ingresos') || title.includes('Gastos')) {
                            if (value > 0) return 'text-green-700';
                            if (value < 0) return 'text-red-700';
                            return 'text-gray-900'; // Black when 0
                        }
                        return textColorClass;
                    };
                    
                    return (
                        <td key={`real-${monthIndex}`} className={`p-3 text-right font-bold ${getValueColor(realValue)}`}>
                            {formatCurrency(realValue)}
                        </td>
                    );
                }
                
                // For current and future months, show both real and projected
                let realValue, projectedValue;
                
                if (isGrandTotal && totalsData) {
                    // Use backend-calculated cumulative total
                    const monthData = monthsData[monthIndex];
                    const monthTotals = monthData?.totals;
                    
                    if (monthTotals && monthTotals.cumulative_total !== undefined) {
                        realValue = monthTotals.cumulative_total;
                        projectedValue = monthTotals.cumulative_total_projected || monthTotals.cumulative_total;
                    } else {
                        // Fallback to frontend calculation if backend cumulative total not available
                        let cumulativeTotal = totalsData.total_income + totalsData.total_outcome;
                        
                        // Subtract all months that come after the current month
                        for (let i = monthIndex + 1; i < monthsData.length; i++) {
                            const monthTotals = calculateTotalsForMonth(i);
                            cumulativeTotal -= monthTotals.balance;
                        }
                        
                        realValue = cumulativeTotal;
                        projectedValue = cumulativeTotal; // For now, same as real
                    }
                } else {
                    // Use backend-calculated totals for regular totals
                    const monthData = monthsData[monthIndex];
                    const monthTotals = monthData?.totals;
                    
                    if (monthTotals) {
                        if (isNetProfit) {
                            realValue = monthTotals.net_profit;
                            projectedValue = monthTotals.net_profit_projected || monthTotals.net_profit;
                        } else if (title.includes('Ingresos')) {
                            realValue = monthTotals.total_income;
                            projectedValue = monthTotals.total_income_projected || monthTotals.total_income;
                        } else if (title.includes('Gastos')) {
                            realValue = monthTotals.total_outcome;
                            projectedValue = monthTotals.total_outcome_projected || monthTotals.total_outcome;
                        }
                    } else {
                        // Fallback to frontend calculation if backend totals not available
                        const totals = calculateTotalsForMonth(monthIndex);
                        const projectedTotals = calculateTotalsForMonth(monthIndex, true);
                        
                        if (isNetProfit) {
                            realValue = totals.balance;
                            projectedValue = projectedTotals.balance;
                        } else if (title.includes('Ingresos')) {
                            realValue = totals.income;
                            projectedValue = projectedTotals.income;
                        } else if (title.includes('Gastos')) {
                            realValue = totals.outcome;
                            projectedValue = projectedTotals.outcome;
                        }
                    }
                }
                
                const getValueColor = (value) => {
                    if (isGrandTotal) {
                        return value >= 0 ? 'text-green-700' : 'text-red-700';
                    }
                    if (isNetProfit) {
                        // Ganancia Neta: keep default color when 0, color when positive/negative
                        if (value === 0) return textColorClass;
                        return value > 0 ? 'text-green-700' : 'text-red-700';
                    }
                    // For Total Ingresos and Total Gastos, use dynamic colors based on value
                    if (title.includes('Ingresos') || title.includes('Gastos')) {
                        if (value > 0) return 'text-green-700';
                        if (value < 0) return 'text-red-700';
                        return 'text-gray-900'; // Black when 0
                    }
                    return textColorClass;
                };
                
                return [
                    /* Real Data Cell */
                    <td key={`real-${monthIndex}`} className={`p-3 text-right font-bold ${getValueColor(realValue)}`}>
                        {formatCurrency(realValue)}
                    </td>,
                    
                    /* Projected Data Cell */
                    <td key={`projected-${monthIndex}`} className={`p-3 text-right font-bold ${getValueColor(projectedValue)}`}>
                        {formatCurrency(projectedValue)}
                    </td>
                ];
            })}
        </tr>
    );
};

export default TotalsRow;