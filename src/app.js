import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import CompanyList from './components/CompanyList';
import BranchList from './components/BranchList';

// Main App Component
function App() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/v1/core/companies/');
            // Handle DRF pagination - access results array
            const companiesData = response.data.results || response.data;
            setCompanies(companiesData);
            setError(null);
        } catch (err) {
            setError('Error al cargar empresas');
            console.error('Error fetching companies:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCompanySelect = (company) => {
        setSelectedCompany(company);
    };

    const handleBackToCompanies = () => {
        setSelectedCompany(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando empresas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Ups!</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={fetchCompanies}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Header />
            
            <main className="container mx-auto px-4 py-8">
                {selectedCompany ? (
                    <div>
                        <button 
                            onClick={handleBackToCompanies}
                            className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                            <i className="fas fa-arrow-left mr-2"></i>
                            Volver a Empresas
                        </button>
                        <BranchList company={selectedCompany} />
                    </div>
                ) : (
                    <CompanyList 
                        companies={companies} 
                        onCompanySelect={handleCompanySelect}
                    />
                )}
            </main>
        </div>
    );
}

export default App;