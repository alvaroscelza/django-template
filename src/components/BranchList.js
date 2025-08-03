import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BranchCard from './BranchCard';

const BranchList = ({ company }) => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/v1/core/company-branches/?company=${company.id}`);
                const branchesData = response.data.results || response.data;
                setBranches(branchesData);
                setError(null);
            } catch (err) {
                setError('Error al cargar sucursales');
                console.error('Error fetching branches:', err);
            } finally {
                setLoading(false);
            }
        };

        if (company && company.id) {
            fetchBranches();
        }
    }, [company]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando sucursales...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar sucursales</h3>
                <p className="text-gray-600 mb-4">{error}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <i className="fas fa-building text-white text-2xl"></i>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">{company.name}</h2>
                            <p className="text-gray-600">Sucursales y Ubicaciones de la Empresa</p>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <div className="flex items-center space-x-1">
                            <i className="fas fa-star text-yellow-500 text-xl"></i>
                            <span className="text-3xl font-bold text-gray-900">{company.score || 0}</span>
                        </div>
                    </div>
                </div>
                
                {company.description && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
                        <p className="text-gray-700">{company.description}</p>
                    </div>
                )}
            </div>

            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">Sucursales ({branches.length})</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {branches.map(branch => (
                    <BranchCard key={branch.id} branch={branch} />
                ))}
            </div>

            {branches.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">
                        <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron sucursales</h3>
                    <p className="text-gray-600">
                        Esta empresa aún no tiene sucursales
                    </p>
                </div>
            )}
        </div>
    );
};

export default BranchList; 