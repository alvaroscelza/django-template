import React from 'react';
import EditableCell from './EditableCell';
import { useDashboardContext } from '../contexts/DashboardContext';
import { parseMonthName, getCurrentMonthName } from '../utils/dateUtils';

const ConceptRow = ({ conceptName, isExpense = false, onProjectionUpdate }) => {
    const {
        monthsData,
        getConceptDataForMonth,
        getConceptDataForMonthAndType
    } = useDashboardContext();

    return (
        <tr key={conceptName} className="hover:bg-gray-50 transition-colors duration-200">
            <td className="p-3 sticky left-0 z-10 bg-white/80 backdrop-blur-sm border-r border-gray-100" style={{ width: '12rem', minWidth: '12rem', maxWidth: '12rem' }}>
                <span className="text-gray-700 font-medium">{conceptName}</span>
            </td>
            {monthsData.map((monthData, monthIndex) => {
                const currentMonthName = getCurrentMonthName();
                const currentDate = parseMonthName(currentMonthName);
                const monthDate = parseMonthName(monthData.month_name);
                const isFuture = monthDate > currentDate;
                const isCurrent = monthData.is_current_month;
                
                // For past months, only show real data
                if (monthDate < currentDate) {
                    const conceptData = getConceptDataForMonth(conceptName, monthIndex);
                    return (
                        <EditableCell
                            key={`real-${monthIndex}`}
                            conceptData={conceptData}
                            monthData={monthData}
                            monthIndex={monthIndex}
                            isExpense={isExpense}
                        />
                    );
                }
                
                // For current and future months, show both real and projected
                const realConceptData = getConceptDataForMonth(conceptName, monthIndex);
                const projectedConceptData = realConceptData && realConceptData.projected_balance !== null 
                    ? { ...realConceptData, balance: realConceptData.projected_balance, isProjected: true }
                    : null;
                
                // Check for mismatch between real and projected values (only for current month)
                const realValue = realConceptData?.balance || 0;
                const projectedValue = realConceptData?.projected_balance || 0;
                
                const hasMismatch = isCurrent && (
                    // Case 1: Both have values but different
                    (realValue !== 0 && projectedValue !== 0 && realValue !== projectedValue) ||
                    // Case 2: Real has value, projected doesn't
                    (realValue !== 0 && projectedValue === 0) ||
                    // Case 3: Real doesn't have value, projected does
                    (realValue === 0 && projectedValue !== 0)
                );
                
                return [
                    /* Real Data Cell */
                    <EditableCell
                        key={`real-${monthIndex}`}
                        conceptData={realConceptData}
                        monthData={monthData}
                        monthIndex={monthIndex}
                        isExpense={isExpense}
                        isProjected={false}
                        hasMismatch={hasMismatch}
                    />,
                    
                    /* Projected Data Cell */
                    <EditableCell
                        key={`projected-${monthIndex}`}
                        conceptData={projectedConceptData}
                        monthData={monthData}
                        monthIndex={monthIndex}
                        isExpense={isExpense}
                        isProjected={true}
                        onProjectionUpdate={onProjectionUpdate}
                        hasMismatch={hasMismatch}
                    />
                ];
            })}
        </tr>
    );
};

export default ConceptRow;
