/**
 * Utility functions for formatting numbers, currencies, and dates
 * throughout the application
 */

/**
 * Format a number with European style formatting
 * @param {number} number - The number to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.currency - Whether to format as currency (default: false)
 * @param {number} options.decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number string (e.g., 1.573,04 or $1.573,04)
 */
export const formatNumber = (number, options = {}) => {
  const { currency = false, decimals = 2 } = options;
  
  if (currency) {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU'
    }).format(number);
  }
  
  return new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

/**
 * Format a number as currency (convenience function)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return formatNumber(amount, { currency: true });
};

/**
 * Format a number as percentage with European style formatting
 * @param {number} percentage - The percentage to format
 * @returns {string} Formatted percentage string (e.g., 31,0%)
 */
export const formatPercentage = (percentage) => {
  return new Intl.NumberFormat('es-UY', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(percentage / 100);
};
