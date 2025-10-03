import React from 'react';
import { SlidersIcon } from './icons/SlidersIcon';

interface GraphPhysicsControlsProps {
  params: {
    charge: number;
    linkDistance: number;
    collisionRadius: number;
  };
  onParamsChange: (newParams: GraphPhysicsControlsProps['params']) => void;
}

const SliderControl: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}> = ({ label, value, min, max, step, onChange }) => (
  <div className="flex-1 min-w-[200px]">
    <label className="flex items-center text-sm text-gray-700 dark:text-space-text-dim">
      <span className="w-32 flex-shrink-0">{label}:</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-space-blue/50"
        aria-label={label}
      />
      <span className="ml-3 font-mono text-xs w-12 text-right">{value}</span>
    </label>
  </div>
);

const GraphPhysicsControls: React.FC<GraphPhysicsControlsProps> = ({ params, onParamsChange }) => {
  return (
    <div className="bg-white/50 dark:bg-space-dark/30 backdrop-blur-sm p-3 rounded-md mb-4 border border-gray-200 dark:border-space-blue/30">
      <div className="flex items-center flex-wrap gap-x-6 gap-y-2">
        <span className="font-semibold text-sm text-gray-800 dark:text-space-text mr-2 flex items-center">
            <SlidersIcon className="w-4 h-4 mr-2" />
            Graph Physics:
        </span>
        <SliderControl
          label="Repulsion Strength"
          value={params.charge}
          min={-1000}
          max={-50}
          step={10}
          onChange={(value) => onParamsChange({ ...params, charge: value })}
        />
        <SliderControl
          label="Link Distance"
          value={params.linkDistance}
          min={20}
          max={300}
          step={5}
          onChange={(value) => onParamsChange({ ...params, linkDistance: value })}
        />
        <SliderControl
          label="Node Spacing"
          value={params.collisionRadius}
          min={10}
          max={100}
          step={1}
          onChange={(value) => onParamsChange({ ...params, collisionRadius: value })}
        />
      </div>
    </div>
  );
};

export default GraphPhysicsControls;