import React, { useState, useEffect } from 'react';

/**
 * FlashMessage component for displaying temporary notifications
 * @param {Object} props - Component props
 * @param {string} props.message - Message to display
 * @param {string} props.type - Type of message: 'success', 'error', 'warning', 'info'
 * @param {number} props.duration - Duration in milliseconds before auto-hiding (0 for no auto-hide)
 * @param {function} props.onClose - Function to call when message is closed
 */
const FlashMessage = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible || !message) return null;

  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconStyles = {
    success: 'fas fa-check-circle text-green-500',
    error: 'fas fa-exclamation-circle text-red-500',
    warning: 'fas fa-exclamation-triangle text-yellow-500',
    info: 'fas fa-info-circle text-blue-500'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md animate-fade-in-down`}>
      <div className={`${typeStyles[type] || typeStyles.info} border rounded-lg p-4 shadow-lg`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <i className={`${iconStyles[type] || iconStyles.info} text-xl`}></i>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={handleClose}
            >
              <span className="sr-only">Cerrar</span>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashMessage;
