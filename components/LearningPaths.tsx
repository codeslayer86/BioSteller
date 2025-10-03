import React from 'react';
import { Link } from 'react-router-dom';
import { CompassIcon } from './icons/CompassIcon';

const LEARNING_PATHS = [
    {
        title: "Plants in Space",
        description: "Explore how plants adapt to microgravity, from root growth to photosynthesis on the ISS.",
        query: "Plant growth experiments in microgravity on the ISS"
    },
    {
        title: "Human Health & Countermeasures",
        description: "Investigate the effects of spaceflight on the human body, such as bone density and muscle loss.",
        query: "Human health changes during long-duration space missions"
    },
    {
        title: "Model Organisms",
        description: "Discover why organisms like mice, zebrafish, and fruit flies are crucial for space biology research.",
        query: "Use of model organisms like mice and fruit flies in space"
    },
    {
        title: "Microbes on the ISS",
        description: "Learn about the invisible ecosystem of bacteria and fungi living alongside astronauts in space.",
        query: "Microbial life and bacteria growth in the ISS environment"
    }
];

const LearningPaths: React.FC = () => {
    return (
        <div className="bg-white dark:bg-space-dark/50 p-6 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-space-blue/30">
             <div className="flex items-center gap-4 mb-4">
                <CompassIcon className="w-8 h-8 text-emerald-primary dark:text-emerald-accent-bright" />
                <div>
                    <h3 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Learning Paths</h3>
                    <p className="text-md text-gray-600 dark:text-space-text-dim">Start your exploration with these guided topics.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LEARNING_PATHS.map(path => (
                    <Link
                        key={path.title}
                        to={`/explore?query=${encodeURIComponent(path.query)}`}
                        className="block p-4 bg-gray-50 dark:bg-space-dark/30 rounded-lg border border-gray-200 dark:border-space-blue/30 hover:border-emerald-primary dark:hover:border-emerald-accent-bright hover:bg-white dark:hover:bg-space-dark transition-all transform hover:scale-105"
                    >
                        <h4 className="font-bold text-lg text-space-light-blue">{path.title}</h4>
                        <p className="mt-1 text-sm text-gray-600 dark:text-ivory-text-dim">{path.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default LearningPaths;
