/**
 * Application-wide constants and configuration values
 */

// Dashboard Configuration
export const DASHBOARD_CONFIG = {
    MONTHS_TO_LOAD_PER_REQUEST: 3,
    DEFAULT_MONTH_OFFSET: 5,
    TABLE_COLUMN_WIDTH: '12rem',
    CELL_WIDTH: '24px' // w-24 equivalent
};

// UI Constants
export const UI_CONSTANTS = {
    LOADING_SPINNER_DELAY: 300, // ms before showing spinner
    DEBOUNCE_DELAY: 300, // ms for input debouncing
    ANIMATION_DURATION: 200, // ms for transitions
};

// Color Constants
export const COLORS = {
    HIGHLIGHT_BACKGROUND: 'rgb(223, 161, 0)', // Gold highlight for differences
    SUCCESS: 'text-green-700',
    ERROR: 'text-red-700',
    WARNING: 'text-yellow-600',
    INFO: 'text-blue-600'
};

// API Configuration
export const API_CONFIG = {
    DEFAULT_TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 second
};

// Form Validation
export const VALIDATION = {
    MAX_PROJECTION_AMOUNT: 999999999.99,
    MIN_PROJECTION_AMOUNT: -999999999.99,
    DECIMAL_PLACES: 2
};

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
    INVALID_AMOUNT: 'El monto debe ser un número válido',
    GENERIC_ERROR: 'Ha ocurrido un error inesperado. Intente nuevamente.',
    LOADING_ERROR: 'Error al cargar el panel',
    SAVE_ERROR: 'Error al guardar la proyección. Intente nuevamente.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
    PROJECTION_SAVED: 'Proyección guardada exitosamente',
    DATA_REFRESHED: 'Datos actualizados correctamente'
};
