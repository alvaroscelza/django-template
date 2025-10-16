import React, { useState, useEffect } from 'react';
import tutorialVideo1 from '../videos/tutorial_1.mp4';
import tutorialVideo2 from '../videos/tutorial_2.mp4';
import tutorialVideo3 from '../videos/tutorial_3.mp4';

const Tutorials = () => {
    const tutorials = [
        {
            id: 1,
            title: 'Funcionamiento Basico',
            videoSrc: tutorialVideo1,
            description: 'Tutorial básico sobre el funcionamiento de la aplicación'
        },
        {
            id: 2,
            title: 'Funcionamiento Avanzado',
            videoSrc: tutorialVideo2,
            description: 'Tutorial avanzado con funcionalidades adicionales de la aplicación'
        },
        {
            id: 3,
            title: 'Importación de Transacciones',
            videoSrc: tutorialVideo3,
            description: 'Cómo usar la herramienta de importación de Transacciones.'
        }
    ];

    const [selectedTutorial, setSelectedTutorial] = useState(tutorials[0]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Tutoriales</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tutorial List Sidebar */}
                <div className="bg-white rounded-lg shadow p-4">
                    <ul className="space-y-2">
                        {tutorials.map(tutorial => (
                            <li 
                                key={tutorial.id}
                                className={`p-3 rounded-md cursor-pointer transition-colors ${
                                    selectedTutorial.id === tutorial.id 
                                        ? 'bg-blue-100 text-blue-700' 
                                        : 'hover:bg-gray-100'
                                }`}
                                onClick={() => setSelectedTutorial(tutorial)}
                            >
                                <div className="font-medium">{tutorial.title}</div>
                            </li>
                        ))}
                    </ul>
                </div>
                
                {/* Video Player */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow p-4">
                        <h2 className="text-xl font-semibold mb-4">{selectedTutorial.title}</h2>
                        <div className="aspect-w-16 aspect-h-9 mb-4">
                            <video 
                                src={selectedTutorial.videoSrc} 
                                controls 
                                className="w-full h-auto rounded"
                            >
                                Tu navegador no soporta la reproducción de videos.
                            </video>
                        </div>
                        <p className="text-gray-700">{selectedTutorial.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tutorials;
