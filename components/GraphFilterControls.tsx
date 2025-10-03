import React from 'react';

interface GraphFilterControlsProps {
  nodeTypes: string[];
  activeFilters: { [key: string]: boolean };
  onFilterChange: (filters: { [key: string]: boolean }) => void;
}

const GraphFilterControls: React.FC<GraphFilterControlsProps> = ({ nodeTypes, activeFilters, onFilterChange }) => {
  if (nodeTypes.length === 0) {
    return null;
  }

  const handleToggle = (type: string) => {
    onFilterChange({
      ...activeFilters,
      [type]: !activeFilters[type],
    });
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="bg-white/50 dark:bg-space-dark/30 backdrop-blur-sm p-3 rounded-md mb-4 border border-gray-200 dark:border-space-blue/30">
      <div className="flex items-center flex-wrap gap-x-6 gap-y-2">
        <span className="font-semibold text-sm text-gray-800 dark:text-space-text mr-2">Filter Nodes:</span>
        {nodeTypes.sort().map(type => (
          <label key={type} className="flex items-center cursor-pointer text-sm text-gray-700 dark:text-space-text-dim">
            <input
              type="checkbox"
              checked={activeFilters[type] ?? false}
              onChange={() => handleToggle(type)}
              className="h-4 w-4 rounded border-gray-300 dark:border-space-blue/50 text-space-light-blue focus:ring-space-light-blue bg-gray-100 dark:bg-space-blue/50 transition-colors"
              aria-label={`Filter by ${type}`}
            />
            <span className="ml-2">{capitalize(type)}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default GraphFilterControls;
