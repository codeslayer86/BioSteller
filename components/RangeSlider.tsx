import React, { useState, useEffect, useRef, useCallback } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

const RangeSlider: React.FC<RangeSliderProps> = ({ min, max, value, onChange }) => {
    const [minVal, setMinVal] = useState(value[0]);
    const [maxVal, setMaxVal] = useState(value[1]);
    const [minInput, setMinInput] = useState(value[0].toString());
    const [maxInput, setMaxInput] = useState(value[1].toString());

    const minValRef = useRef(value[0]);
    const maxValRef = useRef(value[1]);
    const range = useRef<HTMLDivElement>(null);
    const draggingThumb = useRef<'min' | 'max' | null>(null);

    useEffect(() => {
        setMinVal(value[0]);
        setMaxVal(value[1]);
        setMinInput(value[0].toString());
        setMaxInput(value[1].toString());
        minValRef.current = value[0];
        maxValRef.current = value[1];
    }, [value]);

    const getPercent = useCallback((val: number) => Math.round(((val - min) / (max - min)) * 100), [min, max]);

    const onPointerMove = useCallback((event: PointerEvent) => {
        if (!draggingThumb.current || !range.current) return;
        event.preventDefault();

        const rect = range.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const newValue = Math.round(min + percent * (max - min));

        if (draggingThumb.current === 'min') {
            const newMinVal = Math.min(newValue, maxValRef.current - 1);
            setMinVal(newMinVal);
            setMinInput(newMinVal.toString());
            minValRef.current = newMinVal;
        } else {
            const newMaxVal = Math.max(newValue, minValRef.current + 1);
            setMaxVal(newMaxVal);
            setMaxInput(newMaxVal.toString());
            maxValRef.current = newMaxVal;
        }
    }, [min, max]);

    const onPointerUp = useCallback(() => {
        if (draggingThumb.current) {
            onChange([minValRef.current, maxValRef.current]);
        }
        draggingThumb.current = null;
    }, [onChange]);

    useEffect(() => {
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
        return () => {
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
        };
    }, [onPointerMove, onPointerUp]);

    const handleMinInputBlur = () => {
        let newMin = parseInt(minInput, 10);
        if (isNaN(newMin) || newMin < min) newMin = min;
        if (newMin > maxValRef.current) newMin = maxValRef.current;
        setMinVal(newMin);
        setMinInput(newMin.toString());
        minValRef.current = newMin;
        onChange([newMin, maxValRef.current]);
    };

    const handleMaxInputBlur = () => {
        let newMax = parseInt(maxInput, 10);
        if (isNaN(newMax) || newMax > max) newMax = max;
        if (newMax < minValRef.current) newMax = minValRef.current;
        setMaxVal(newMax);
        setMaxInput(newMax.toString());
        maxValRef.current = newMax;
        onChange([minValRef.current, newMax]);
    };
    
    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
        }
    };


    return (
        <div className="flex items-center gap-4">
            <input
                type="number"
                value={minInput}
                min={min}
                max={max}
                onChange={(e) => setMinInput(e.target.value)}
                onBlur={handleMinInputBlur}
                onKeyDown={handleInputKeyDown}
                className="w-24 p-2 text-center bg-white dark:bg-space-dark border border-gray-300 dark:border-space-blue/50 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-space-light-blue [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-label="Minimum year"
            />
            <div className="relative w-full flex items-center h-8">
                <div className="relative w-full" ref={range}>
                    <div className="absolute w-full h-1 bg-gray-200 dark:bg-space-blue/50 rounded-full top-1/2 -translate-y-1/2"></div>
                    <div
                        className="absolute h-1 bg-emerald-primary rounded-full top-1/2 -translate-y-1/2"
                        style={{ left: `${getPercent(minVal)}%`, width: `${getPercent(maxVal) - getPercent(minVal)}%` }}
                    ></div>
                    <div
                        className="group absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white dark:bg-ivory-text-dim border-2 border-emerald-primary rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-dark"
                        style={{ left: `${getPercent(minVal)}%` }}
                        onPointerDown={() => draggingThumb.current = 'min'}
                        role="slider"
                        tabIndex={0}
                        aria-valuemin={min}
                        aria-valuemax={max}
                        aria-valuenow={minVal}
                        aria-label="Minimum year"
                    >
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-active:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none">
                            {minVal}
                        </div>
                    </div>
                    <div
                        className="group absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white dark:bg-ivory-text-dim border-2 border-emerald-primary rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-dark"
                        style={{ left: `${getPercent(maxVal)}%` }}
                        onPointerDown={() => draggingThumb.current = 'max'}
                        role="slider"
                        tabIndex={0}
                        aria-valuemin={min}
                        aria-valuemax={max}
                        aria-valuenow={maxVal}
                        aria-label="Maximum year"
                    >
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-active:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none">
                            {maxVal}
                        </div>
                    </div>
                </div>
            </div>
            <input
                type="number"
                value={maxInput}
                min={min}
                max={max}
                onChange={(e) => setMaxInput(e.target.value)}
                onBlur={handleMaxInputBlur}
                onKeyDown={handleInputKeyDown}
                className="w-24 p-2 text-center bg-white dark:bg-space-dark border border-gray-300 dark:border-space-blue/50 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-space-light-blue [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-label="Maximum year"
            />
        </div>
    );
};

export default RangeSlider;
