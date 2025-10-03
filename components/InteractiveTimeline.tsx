import React, { useMemo, useState, useRef, useEffect } from 'react';
import _ from 'lodash';
import { DetailedReportItem } from '../types';
import { useTheme } from '../contexts/ThemeContext';
// FIX: Use namespace import for d3 to resolve module errors.
import * as d3 from 'd3';


interface InteractiveTimelineProps {
  data: DetailedReportItem[];
}

const TimelineEvent: React.FC<{
    item: DetailedReportItem & { originalIndex: number };
    onEventClick: (index: number) => void;
    isAbove: boolean;
    isSelected: boolean;
}> = ({ item, onEventClick, isAbove, isSelected }) => {

    return (
        <div
            className={`relative flex ${isAbove ? 'items-start' : 'items-end'} group w-72`}
            onClick={() => onEventClick(item.originalIndex)}
            role={'button'}
            tabIndex={0}
            onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onEventClick(item.originalIndex)}
            aria-label={`View details for ${item.title}`}
            aria-expanded={isSelected}
        >
            {/* Connecting Line */}
            <div className={`absolute top-1/2 -translate-y-1/2 w-full h-0.5 bg-space-light-blue/50 ${isAbove ? 'top-0' : 'bottom-0'}`}></div>
            <div className={`absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-space-light-blue/50 ${isAbove ? 'top-1/2' : 'bottom-1/2'}`}></div>

            {/* Event Content */}
            <div className={`relative z-10 p-4 w-full cursor-pointer transition-all duration-300 group-hover:scale-105 group-focus:scale-105 ${isAbove ? 'mt-4' : 'mb-4'}`}>
                <div className="bg-white dark:bg-space-dark/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 dark:border-space-blue/30 text-left">
                    <p className="font-bold text-sm text-gray-900 dark:text-space-text">{item.title}</p>
                    <p className="text-xs text-gray-500 dark:text-space-text-dim mt-1">{item.mission_or_experiment}</p>
                    
                    {/* Hover Tooltip for Main Findings */}
                    <div className={
                        `absolute w-full left-0 opacity-0 
                        ${!isSelected ? 'group-hover:opacity-100 group-focus-within:opacity-100' : ''} 
                        transition-opacity duration-300 pointer-events-none z-20
                        ${isAbove ? 'bottom-full mb-2' : 'top-full mt-2'}`
                    }>
                         <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 shadow-lg max-w-full break-words">
                            {item.main_findings}
                            {isAbove ? (
                                <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                                    <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
                                </svg>
                            ) : (
                                <svg className="absolute text-gray-900 h-2 w-full left-0 bottom-full" x="0px" y="0px" viewBox="0 0 255 255">
                                    <polygon className="fill-current" points="0,255 127.5,127.5 255,255"/>
                                </svg>
                            )}
                         </div>
                    </div>
                    
                    {/* Expanded view on click */}
                    {isSelected && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-space-blue/50 max-h-32 overflow-y-auto">
                            <h5 className="text-xs font-bold text-gray-700 dark:text-space-text-dim mb-1">Main Findings:</h5>
                            <p className="text-xs text-gray-600 dark:text-ivory-text leading-relaxed">
                                {item.main_findings}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Timeline Dot */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-space-accent rounded-full border-4 border-white dark:border-space-dark z-20 transition-transform duration-300 group-hover:scale-125 group-focus:scale-125 ${isSelected ? 'scale-125 ring-2 ring-emerald-primary' : ''}`}></div>
        </div>
    );
};


const InteractiveTimeline: React.FC<InteractiveTimelineProps> = ({ data }) => {
  const { theme } = useTheme();
  const brushRef = useRef<SVGSVGElement>(null);
  
  const sortedData = useMemo(() => 
    data
      .map((item, index) => ({ ...item, originalIndex: index }))
      .sort((a, b) => a.year - b.year), 
    [data]
  );
  
  const [filteredData, setFilteredData] = useState(sortedData);
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null);

  const handleEventClick = (index: number) => {
    // Toggle selection
    setSelectedEventIndex(prevIndex => (prevIndex === index ? null : index));
  };
  
  useEffect(() => {
    // When the original data changes, reset the filtered data and selection
    setFilteredData(sortedData);
    setSelectedEventIndex(null);
  }, [sortedData]);


  useEffect(() => {
    if (!brushRef.current || sortedData.length < 2) return;

    const allYears = sortedData.map(d => d.year);
    const [minYear, maxYear] = d3.extent(allYears) as [number, number];

    const yearCounts = _.countBy(allYears);
    const brushChartData = Object.entries(yearCounts).map(([year, count]) => ({ year: +year, count }));
    const countMax = d3.max(brushChartData, d => d.count) || 1;

    const margin = { top: 10, right: 20, bottom: 30, left: 20 };
    const parentWidth = brushRef.current.parentElement!.clientWidth;
    const width = parentWidth - margin.left - margin.right;
    const height = 80 - margin.top - margin.bottom;

    const svg = d3.select(brushRef.current)
        .attr('width', parentWidth)
        .attr('height', height + margin.top + margin.bottom);
        
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain([minYear - 1, maxYear + 1]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, countMax]).range([height, 0]);

    // Bars for the mini-chart in the brush background
    g.selectAll(".bar")
      .data(brushChartData)
      .join("rect")
      .attr("x", d => xScale(d.year) - (xScale(d.year + 1) - xScale(d.year)) / 2)
      .attr("y", d => yScale(d.count))
      .attr("width", d => Math.max(1, xScale(d.year + 1) - xScale(d.year)))
      .attr("height", d => height - yScale(d.count))
      .attr("fill", theme === 'dark' ? "rgba(4, 99, 7, 0.5)" : "rgba(5, 122, 9, 0.4)");

    const xAxis = d3.axisBottom(xScale).ticks(Math.min(maxYear - minYear, 20)).tickFormat(d => d.toString());
    
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .call(g => g.selectAll("text").style("fill", theme === 'dark' ? '#A3A39A' : '#6b7280'))
      .call(g => g.selectAll(".domain, .tick line").attr("stroke", theme === 'dark' ? '#333333' : '#e5e7eb'));

    const brushed = ({ selection }: { selection: [number, number] | null }) => {
        if (selection) {
            const [minPixel, maxPixel] = selection;
            const selectedDomain = [Math.round(xScale.invert(minPixel)), Math.round(xScale.invert(maxPixel))];
            setFilteredData(sortedData.filter(d => d.year >= selectedDomain[0] && d.year <= selectedDomain[1]));
        } else {
            setFilteredData(sortedData);
        }
        // Reset selection when brush is used
        setSelectedEventIndex(null);
    };

    const brush = d3.brushX().extent([[0, 0],[width, height]]).on('brush end', brushed);

    const brushGroup = g.append('g').call(brush);

    // Style brush handles for better visibility
    brushGroup.selectAll('.handle').attr('fill', '#046307');
    brushGroup.selectAll('.selection').attr('fill-opacity', 0.3).attr('stroke', '#046307');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedData, theme]);
  
  if (!sortedData || sortedData.length === 0) {
    return <p className="text-center text-gray-500 dark:text-space-text-dim">No timeline data available.</p>;
  }

  return (
    <div className="bg-white dark:bg-space-dark/50 p-6 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-space-blue/30 w-full overflow-hidden">
        {/* Main Timeline View */}
        <div className="w-full overflow-x-auto pb-8 -mb-8">
            <div className="relative flex items-center min-w-max py-12 px-4">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-space-light-blue/70 rounded-full"></div>
                <div className="relative flex justify-between w-full">
                    {filteredData.map((item, index) => (
                        <div key={item.originalIndex} className="relative flex flex-col items-center first:pl-8 last:pr-8">
                            {/* This container positions the event card above or below the timeline */}
                            <div className={`flex justify-center w-full ${index % 2 !== 0 ? 'mt-8 self-start' : 'mb-8 self-end'}`}>
                                <TimelineEvent 
                                  item={item} 
                                  onEventClick={handleEventClick} 
                                  isAbove={index % 2 !== 0}
                                  isSelected={selectedEventIndex === item.originalIndex}
                                />
                            </div>
                            <div className="absolute top-1/2 -translate-y-1/2 text-center">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-space-dark rounded-full"></div>
                                <span className="mt-4 text-xs font-semibold text-gray-700 dark:text-space-text-dim bg-white/80 dark:bg-space-dark/80 px-2 py-1 rounded-full">{item.year}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        {/* Time Range Filter Control */}
        {sortedData.length > 1 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-space-blue/30">
            <h4 className="text-sm font-semibold text-center text-gray-600 dark:text-space-text-dim mb-2">Filter by Year</h4>
            <div className="w-full">
                <svg ref={brushRef} className="w-full"></svg>
            </div>
          </div>
        )}
    </div>
  );
};

export default InteractiveTimeline;