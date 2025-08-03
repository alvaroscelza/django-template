import React, { useState } from 'react';

const BranchCard = ({ branch }) => {
    const [showReviews, setShowReviews] = useState(false);
    
    const formatScore = (score) => {
        return score || 0;
    };

    const getScoreColor = (score) => {
        switch (score) {
            case 2: return 'text-green-600';
            case 1: return 'text-blue-600';
            case -1: return 'text-orange-600';
            case -2: return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const reviews = branch.reviews || [];
    const hasReviews = reviews.length > 0;

    return (
        <div 
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer"
            onClick={() => setShowReviews(!showReviews)}
        >
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{branch.name}</h3>
                        {branch.address && (
                            <div className="flex items-center space-x-2 text-gray-600 mb-2">
                                <i className="fas fa-map-marker-alt text-sm"></i>
                                <span className="text-sm">{branch.address}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="text-right">
                        <div className="flex items-center space-x-1">
                            <i className="fas fa-star text-yellow-500 text-lg"></i>
                            <span className="text-2xl font-bold text-gray-900">{formatScore(branch.score)}</span>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                            <i className="fas fa-comments text-gray-600"></i>
                            <span className="text-sm font-medium text-gray-700">
                                Reseñas ({reviews.length})
                            </span>
                        </div>
                        {hasReviews && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowReviews(!showReviews);
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                {showReviews ? 'Ocultar' : 'Ver'} reseñas
                            </button>
                        )}
                    </div>

                    {!hasReviews && (
                        <p className="text-gray-500 text-sm text-center py-2">
                            No hay reseñas disponibles
                        </p>
                    )}

                    {showReviews && hasReviews && (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-900">
                                            {review.author?.first_name || 'Usuario'}
                                        </span>
                                        <span className={`text-xs font-medium ${getScoreColor(review.score)}`}>
                                            {review.score > 0 ? `+${review.score}` : review.score}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {review.opinion}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BranchCard; 