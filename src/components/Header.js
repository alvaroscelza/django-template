import React from 'react';

const Header = () => {
    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <i className="fas fa-star text-white text-lg"></i>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Puntua</h1>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;