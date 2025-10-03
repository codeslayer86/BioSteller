import React from 'react';
import { AdvancedFilters } from '../types';

interface ActiveSearchInfoProps {
    query: string;
    filters: AdvancedFilters;
}

const ActiveSearchInfo: React.FC<ActiveSearchInfoProps> = ({ query, filters }) => {
    const activeFilters = [];
    if (filters.yearRange[0] !== 1960 || filters.yearRange[1] !== new Date().getFullYear()) {
        activeFilters.push(`Years: ${filters.yearRange[0]}-${filters.yearRange[1]}`);
    }
    if (filters.organisms.length > 0) {
        activeFilters.push(`Organisms: ${filters.organisms.length}`);
    }
    if (filters.missions.length > 0) {
        activeFilters.push(`Missions: ${filters.missions.length}`);
    }
    if (filters.researchAreas.length > 0) {
        activeFilters.push(`Areas: ${filters.researchAreas.length}`);
    }
    if (filters.publicationTypes.length > 0) {
        activeFilters.push(`Types: ${filters.publicationTypes.length}`);
    }
    
    const hasActiveFilters = activeFilters.length > 0;
    const hasQuery = query.trim().length > 0;

    if (!hasQuery && !hasActiveFilters) {
        return null;
    }

    return (
        <div className="mt-6 p-4 bg-gray-100 dark:bg-space-dark/70 rounded-lg border border-gray-200 dark:border-space-blue/30">
            <h2 className="text-sm font-semibold text-gray-600 dark:text-ivory-text-dim mb-2">Search Results for:</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {hasQuery && (
                    <p className="text-lg font-bold text-gray-900 dark:text-white">"{query}"</p>
                )}
                {hasQuery && hasActiveFilters && <div className="h-5 w-px bg-gray-300 dark:bg-space-blue/50"></div>}
                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        {activeFilters.map((filter, index) => (
                            <span key={index} className="text-xs font-medium bg-emerald-primary/20 text-emerald-dark dark:bg-emerald-accent-bright/30 dark:text-emerald-accent-bright px-2.5 py-1 rounded-full">
                                {filter}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveSearchInfo;
