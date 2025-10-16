/**
 * Date utility functions for consistent date handling across the application
 */

/**
 * Get the current month in the same format as the backend (e.g., "Aug 2025")
 * This matches the backend's month.starting_date.strftime('%b %Y') format
 */
export const getCurrentMonthName = () => {
    const now = new Date();
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthName = monthNames[now.getMonth()];
    const year = now.getFullYear();
    
    return `${monthName} ${year}`;
};

/**
 * Parse month name into a Date object for sorting
 * Converts "Aug 2025" or "August 2025" format to a Date object
 */
export const parseMonthName = (monthName) => {
    const [monthStr, yearStr] = monthName.split(' ');
    const monthMap = {
        'Jan': 0, 'January': 0, 'Feb': 1, 'February': 1, 'Mar': 2, 'March': 2,
        'Apr': 3, 'April': 3, 'May': 4, 'Jun': 5, 'June': 5,
        'Jul': 6, 'July': 6, 'Aug': 7, 'August': 7, 'Sep': 8, 'September': 8,
        'Oct': 9, 'October': 9, 'Nov': 10, 'November': 10, 'Dec': 11, 'December': 11
    };
    const month = monthMap[monthStr];
    const year = parseInt(yearStr);
    return new Date(year, month, 1);
};

/**
 * Check if a month name represents the current month
 */
export const isCurrentMonth = (monthName) => {
    return monthName === getCurrentMonthName();
};
