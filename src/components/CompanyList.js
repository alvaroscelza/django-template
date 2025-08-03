import React, { useState } from 'react';
import CompanyCard from './CompanyCard';

const CompanyList = ({ companies, onCompanySelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndustry, setSelectedIndustry] = useState('all');

    // Ensure companies is an array
    const companiesArray = Array.isArray(companies) ? companies : [];

    const filteredCompanies = companiesArray.filter(company => {
        const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (company.description && company.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesIndustry = selectedIndustry === 'all' ||
                               (company.industry && company.industry.name.toLowerCase() === selectedIndustry.toLowerCase());
        return matchesSearch && matchesIndustry;
    });

    const industries = [...new Set(companiesArray.map(c => c.industry?.name).filter(Boolean))];

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Empresas</h2>
                <p className="text-gray-600">Descubre y explora negocios locales con sus calificaciones y reseñas</p>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Empresas</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar por nombre o descripción..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Industria</label>
                        <select
                            value={selectedIndustry}
                            onChange={(e) => setSelectedIndustry(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="all">Todas las Industrias</option>
                            {industries.map(industry => (
                                <option key={industry} value={industry}>{industry}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
                <p className="text-gray-600">
                    Mostrando {filteredCompanies.length} de {companiesArray.length} empresas
                </p>
            </div>

            {/* Companies Grid */}
            {filteredCompanies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCompanies.map(company => (
                        <CompanyCard
                            key={company.id}
                            company={company}
                            onClick={onCompanySelect}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">
                        <i className="fas fa-search"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron empresas</h3>
                    <p className="text-gray-600">
                        Intenta ajustar tus términos de búsqueda o filtros
                    </p>
                </div>
            )}
        </div>
    );
};

export default CompanyList;
