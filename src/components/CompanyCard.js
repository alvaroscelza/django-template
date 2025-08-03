import React from 'react';

const CompanyCard = ({ company, onClick }) => {
    const getCompanyLogo = (company) => {
        if (company.logo_url) {
            return company.logo_url;
        }
        return null;
    };

    const formatScore = (score) => {
        return score ? score.toLocaleString('es-ES') : '0';
    };

    return (
        <div 
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-100"
            onClick={() => onClick(company)}
        >
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden ${getCompanyLogo(company) ? 'bg-white' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
                            {getCompanyLogo(company) ? (
                                <img 
                                    src={getCompanyLogo(company)} 
                                    alt={`Logo de ${company.name}`}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        console.log('Image failed to load:', e.target.src);
                                        // If image fails to load, hide it and show icon
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                    onLoad={(e) => {
                                        console.log('Image loaded successfully:', e.target.src);
                                    }}
                                />
                            ) : null}
                            <i 
                                className={`fas fa-building text-white text-lg ${getCompanyLogo(company) ? 'hidden' : 'flex items-center justify-center'}`}
                                style={{ display: getCompanyLogo(company) ? 'none' : 'flex' }}
                            ></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{company.name}</h3>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center space-x-1">
                            <i className="fas fa-star text-yellow-500 text-lg"></i>
                            <span className="text-2xl font-bold text-gray-900">{formatScore(company.score)}</span>
                        </div>
                    </div>
                </div>

                {company.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{company.description}</p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                        {company.industry && (
                            <span className="flex items-center space-x-1">
                                <i className="fas fa-industry"></i>
                                <span>{company.industry.name}</span>
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-1 text-indigo-600">
                        <span>Ver sucursales</span>
                        <i className="fas fa-chevron-right text-xs"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyCard; 