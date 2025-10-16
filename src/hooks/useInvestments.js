import { useState, useEffect } from 'react';
import api from '../api';

// API service functions
const investmentApi = {
    getAll: () => api.get('/investments/'),
    create: (data) => api.post('/investments/', data),
    update: (id, data) => api.put(`/investments/${id}/`, data),
    delete: (id) => api.delete(`/investments/${id}/`),
    getEntries: (investmentId) => api.get(`/investment-entries/?investment=${investmentId}`),
    createEntry: (investmentId, data) => api.post('/investment-entries/', { ...data, investment: investmentId }),
    updateEntry: (investmentId, entryId, data) => api.put(`/investment-entries/${entryId}/`, { ...data, investment: investmentId }),
    deleteEntry: (investmentId, entryId) => api.delete(`/investment-entries/${entryId}/`)
};

// Constants
const MESSAGES = {
    errors: {
        loadInvestments: 'Error al cargar las inversiones'
    }
};

export function useInvestments() {
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const fetchInvestments = async () => {
        try {
            setLoading(true);
            const response = await investmentApi.getAll();
            const allInvestments = response.data?.results || response.data || [];
            // Filter out archived investments by default
            const activeInvestments = allInvestments.filter(investment => !investment.archived);
            setInvestments(activeInvestments);
            setError('');
        } catch (err) {
            console.error('Error fetching investments:', err);
            setError(MESSAGES.errors.loadInvestments);
            setInvestments([]);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchInvestments();
    }, []);
    
    return { 
        investments, 
        loading, 
        error, 
        setError, 
        fetchInvestments,
        investmentApi
    };
}
