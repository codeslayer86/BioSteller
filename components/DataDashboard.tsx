import React, { useMemo, useEffect, useRef, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { DetailedReportItem } from '../types';
import _ from 'lodash';
import { useTheme } from '../contexts/ThemeContext';
// FIX: Use namespace import for d3 to resolve module errors.
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import { PieChartIcon } from './icons/PieChartIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { TextIcon } from './icons/TextIcon';
import { GridIcon } from './icons/GridIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { FlaskConicalIcon } from './icons/FlaskConicalIcon';
import { RocketIcon } from './icons/RocketIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { LoadingIcon } from './icons/LoadingIcon';

// Declare html2canvas for TypeScript since it's loaded from a script tag.
declare const html2canvas: any;

// Helper to group specific missions into broader categories for clearer charts
const generalizeMission = (mission: string): string => {
    const m = mission.toLowerCase();
    if (m.includes('iss') || m.includes('expedition')) return 'ISS';
    if (m.includes('shuttle') || m.includes('sts')) return 'Shuttle';
    if (m.includes('glds')) return 'GeneLab';
    if (m.includes('veggie')) return 'VEGGIE';
    if (m.includes('aph')) return 'APH';
    if (m.includes('rr-') || m.includes('rodent research')) return 'Rodent Research';
    if (m.includes('artemis')) return 'Artemis';
    if (m.includes('twins study')) return 'Twins Study';
    if (m === 'n/a') return 'N/A';
    return 'Other';
};

interface ChartContainerProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, description, icon, children, className = '' }) => {
    const titleId = title.replace(/\s+/g, '-').toLowerCase();

    return (
        <div role="region" aria-labelledby={titleId} className={`bg-white dark:bg-space-dark/50 p-6 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-space-blue/30 flex flex-col ${className}`}>
            <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 text-emerald-primary dark:text-emerald-accent-bright bg-emerald-primary/10 dark:bg-emerald-accent-bright/20 p-2 rounded-lg">
                    {icon}
                </div>
                <div className="flex-grow">
                    <h4 id={titleId} className="font-bold font-display text-lg text-gray-900 dark:text-ivory-text">{title}</h4>
                    <p className="text-sm text-gray-600 dark:text-ivory-text-dim">{description}</p>
                </div>
            </div>
            <div className="flex-grow w-full h-full min-h-[300px]">
                {children}
            </div>
        </div>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="bg-white dark:bg-space-dark/50 p-4 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-space-blue/30 flex items-center gap-4">
        <div className="flex-shrink-0 text-emerald-primary dark:text-emerald-accent-bright bg-emerald-primary/10 dark:bg-emerald-accent-bright/20 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <div className="text-sm font-medium text-gray-600 dark:text-ivory-text-dim">{label}</div>
            <div className="text-xl font-bold text-gray-900 dark:text-ivory-text">{value}</div>
        </div>
    </div>
);


const DataDashboard: React.FC<{ data: DetailedReportItem[] }> = ({ data }) => {
    const { theme } = useTheme();
    const wordCloudRef = useRef<SVGSVGElement>(null);
    const dashboardRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);


    const themeColors = {
        grid: theme === 'dark' ? '#333333' : '#e5e7eb',
        axis: theme === 'dark' ? '#A3A39A' : '#6b7280',
        tooltipBg: theme === 'dark' ? '#1A1A1A' : '#ffffff',
        tooltipBorder: theme === 'dark' ? '#333333' : '#d1d5db',
        text: theme === 'dark' ? '#E0E0D6' : '#1A1A1A',
    };

    const stats = useMemo(() => {
        if (!data || data.length === 0) {
            return {
                totalReports: 0,
                yearRange: 'N/A',
                topOrganism: 'N/A',
                topMission: 'N/A',
            };
        }
        const years = data.map(d => d.year);
        const organismCounts = _.countBy(data, 'organism');
        const missionCounts = _.countBy(data, item => generalizeMission(item.mission_or_experiment));
    
        return {
            totalReports: data.length,
            yearRange: years.length > 1 ? `${Math.min(...years)} – ${Math.max(...years)}` : years[0] || 'N/A',
            topOrganism: Object.keys(organismCounts).length > 0 ? Object.keys(organismCounts).reduce((a, b) => organismCounts[a] > organismCounts[b] ? a : b) : 'N/A',
            topMission: Object.keys(missionCounts).length > 0 ? Object.keys(missionCounts).reduce((a, b) => missionCounts[a] > missionCounts[b] ? a : b) : 'N/A',
        };
    }, [data]);

    const handleExportDashboard = async () => {
        const element = dashboardRef.current;
        if (!element || typeof html2canvas === 'undefined') {
            alert('Export functionality is not available.');
            return;
        };

        setIsExporting(true);

        try {
            const isDarkMode = document.documentElement.classList.contains('dark');
            const backgroundColor = isDarkMode ? '#1A1A1A' : '#FFFFF0';

            const canvas = await html2canvas(element, {
                backgroundColor: backgroundColor,
                scale: 2, // for higher resolution
                useCORS: true, // attempt to load cross-origin images
                allowTaint: true, // may be needed for certain assets
                onclone: (clonedDoc) => {
                    // This callback runs on the cloned document before rendering.
                    // Re-render recharts on the clone to fix rendering issues.
                    const svgs = clonedDoc.querySelectorAll('svg.recharts-surface');
                    svgs.forEach(svg => {
                        svg.setAttribute('width', svg.parentElement?.offsetWidth.toString() || '0');
                        svg.setAttribute('height', svg.parentElement?.offsetHeight.toString() || '0');
                        // @ts-ignore
                        svg.style.width = null;
                        // @ts-ignore
                        svg.style.height = null;
                    });
                }
            });

            const pngUrl = canvas.toDataURL('image/png', 1.0);
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = 'biosteller-dashboard.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error("Dashboard export failed:", error);
            alert("An unexpected error occurred during the export process. This can sometimes happen due to browser security restrictions on external assets.");
        } finally {
            setIsExporting(false);
        }
    };


    // 1. Data for Mission Distribution Donut Chart
    const missionDistributionData = useMemo(() => {
        const grouped = _.groupBy(data, item => generalizeMission(item.mission_or_experiment));
        return Object.entries(grouped).map(([name, values]) => ({
            name,
            // FIX: Cast `values` to the expected array type to access its `length` property.
            value: (values as DetailedReportItem[]).length,
        })).sort((a, b) => b.value - a.value);
    }, [data]);
    
    const LIGHT_CHART_COLORS = ['#046307', '#208080', '#87ae73', '#b59475', '#5f9ea0', '#6b8e23'];
    const DARK_CHART_COLORS = ['#6EE7B7', '#81E6D9', '#FFD6A5', '#C4B5FD', '#FBB6CE', '#A7F3D0'];
    const activeChartColors = theme === 'dark' ? DARK_CHART_COLORS : LIGHT_CHART_COLORS;

    // 2. Data for Organism Research Trends Over Time
    const { organismTrendData, trendOrganisms } = useMemo(() => {
        if (!data.length) return { organismTrendData: [], trendOrganisms: [] };
        const organisms = _.uniq(data.map(d => d.organism));
        const groupedByYear = _.groupBy(data, 'year');
        const years = _.sortBy(Object.keys(groupedByYear).map(Number));
        
        const trendData = years.map(year => {
            const yearData = groupedByYear[year];
            const yearSummary: { year: number; [key:string]: number } = { year };
            organisms.forEach(org => {
                yearSummary[org] = _.filter(yearData, { organism: org }).length;
            });
            return yearSummary;
        });
        return { organismTrendData: trendData, trendOrganisms: organisms };
    }, [data]);

    // 3. Data for Organism vs. Mission Heatmap
    const { heatmapData, organisms, missions, maxCount } = useMemo(() => {
        if (!data.length) return { heatmapData: {}, organisms: [], missions: [], maxCount: 0 };
    
        const uniqueOrganisms = _.sortBy(_.uniq(data.map(d => d.organism)));
        const uniqueMissions = _.sortBy(_.uniq(data.map(d => generalizeMission(d.mission_or_experiment))));
        
        const matrix: { [key: string]: { [key: string]: number } } = {};
        let max = 0;
    
        uniqueOrganisms.forEach(org => {
            matrix[org] = {};
            uniqueMissions.forEach(mis => {
                matrix[org][mis] = 0;
            });
        });
    
        data.forEach(item => {
            const org = item.organism;
            const mis = generalizeMission(item.mission_or_experiment);
            if (matrix[org] && matrix[org][mis] !== undefined) {
                matrix[org][mis]++;
                if (matrix[org][mis] > max) max = matrix[org][mis];
            }
        });
    
        return { heatmapData: matrix, organisms: uniqueOrganisms, missions: uniqueMissions, maxCount: max };
    }, [data]);

    const colorScale = d3.scaleLinear<string>().domain([0, maxCount]).range(['#fefef5', '#046307']);
    const darkColorScale = d3.scaleLinear<string>().domain([0, maxCount]).range(['#023020', '#6EE7B7']);

    // 4. Word Cloud Logic
    useEffect(() => {
        if (!data.length || !wordCloudRef.current) {
            const svg = d3.select(wordCloudRef.current);
            svg.selectAll('*').remove(); // Clear previous cloud if data is empty
            return;
        };

        const text = data.map(d => `${d.title} ${d.main_findings}`).join(' ');
        const stopWords = new Set(["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can", "did", "do", "does", "doing", "don", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just", "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once", "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own", "s", "same", "she", "should", "so", "some", "such", "t", "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "will", "with", "you", "your", "yours", "yourself", "yourselves", "cell", "cells", "effect", "effects", "study", "studies", "found", "showed", "analysis", "data", "results", "using", "response", "changes"]);
        
        const words = text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
        const wordCounts = _.countBy(words);
        // FIX: The `value` from `Object.entries` may not be inferred as a number, causing a type error in arithmetic operations. Explicitly casting `value` to a number resolves this.
        const layoutData = Object.entries(wordCounts).map(([text, value]) => ({ text, size: 10 + Math.sqrt(Number(value)) * 6 })).sort((a, b) => b.size - a.size).slice(0, 75);

        const svg = d3.select(wordCloudRef.current);
        svg.selectAll('*').remove();
        const container = svg.node()?.parentElement;
        if (!container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;

        svg.attr('viewBox', [0, 0, width, height]).append('title').text('Word cloud of common research themes.');

        const layout = cloud().size([width, height]).words(layoutData).padding(5)
            .rotate(() => (Math.random() > 0.5 ? 0 : 90)).font('Roboto').fontSize(d => d.size!).on('end', draw);
        layout.start();

        function draw(words: cloud.Word[]) {
            const color = d3.scaleOrdinal(activeChartColors);
            svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`).selectAll('text').data(words)
                .enter().append('text').style('font-size', d => `${d.size}px`).style('font-family', 'Roboto')
                .style('fill', (d, i) => color(i.toString())).attr('text-anchor', 'middle')
                .attr('transform', d => `translate(${d.x}, ${d.y})rotate(${d.rotate})`).text(d => d.text!)
                .style('opacity', 0).transition().duration(500).style('opacity', 1);
        }
    }, [data, theme, activeChartColors]);

    if (!data || data.length === 0) {
        return <div className="text-center py-12 text-gray-500 dark:text-ivory-text-dim bg-white dark:bg-space-dark/50 p-6 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-space-blue/30">No data available for the selected filters.</div>;
    }

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleExportDashboard}
                    disabled={isExporting}
                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-space-blue hover:bg-space-light-blue disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isExporting ? <LoadingIcon className="w-5 h-5 mr-2" /> : <DownloadIcon className="w-5 h-5 mr-2" />}
                    {isExporting ? 'Exporting...' : 'Export Dashboard as PNG'}
                </button>
            </div>
            <div ref={dashboardRef}>
                <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={<FileTextIcon className="w-6 h-6" />} label="Total Reports" value={stats.totalReports} />
                    <StatCard icon={<CalendarIcon className="w-6 h-6" />} label="Time Span" value={stats.yearRange} />
                    <StatCard icon={<FlaskConicalIcon className="w-6 h-6" />} label="Top Organism" value={stats.topOrganism} />
                    <StatCard icon={<RocketIcon className="w-6 h-6" />} label="Top Mission" value={stats.topMission} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartContainer 
                        title="Mission & Platform Distribution"
                        description="Shows the proportion of research conducted on different space missions and platforms."
                        icon={<PieChartIcon className="w-6 h-6" />}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart role="img" aria-label="Mission and platform distribution donut chart">
                                <Pie data={missionDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {missionDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={activeChartColors[index % activeChartColors.length]} />)}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: themeColors.tooltipBg, 
                                        border: `1px solid ${themeColors.tooltipBorder}`,
                                        color: themeColors.text
                                    }}
                                    itemStyle={{ color: themeColors.text }}
                                />
                                <Legend wrapperStyle={{ color: themeColors.text }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <ChartContainer
                        title="Organism Research Trends"
                        description="Tracks the number of studies for each organism type over the years, revealing shifts in research focus."
                        icon={<TrendingUpIcon className="w-6 h-6" />}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart role="img" aria-label="Organism research trends area chart" data={organismTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
                                <XAxis dataKey="year" stroke={themeColors.axis} tick={{ fill: themeColors.axis }} />
                                <YAxis allowDecimals={false} stroke={themeColors.axis} tick={{ fill: themeColors.axis }} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: themeColors.tooltipBg, 
                                        border: `1px solid ${themeColors.tooltipBorder}`,
                                    }}
                                    itemStyle={{ color: themeColors.text }}
                                    labelStyle={{ color: themeColors.text }}
                                />
                                <Legend wrapperStyle={{ color: themeColors.text }}/>
                                {trendOrganisms.map((org, index) => (
                                    <Area key={org} type="monotone" dataKey={org} stackId="1" stroke={activeChartColors[index % activeChartColors.length]} fill={activeChartColors[index % activeChartColors.length]} />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <ChartContainer
                        title="Common Research Themes"
                        description="Visualizes the most frequent terms found in research titles and findings, highlighting key topics."
                        icon={<TextIcon className="w-6 h-6" />}
                    >
                        <svg ref={wordCloudRef} className="w-full h-full"></svg>
                    </ChartContainer>

                    <ChartContainer
                        title="Organism vs. Mission Heatmap"
                        description="Reveals concentrations of research, showing which organisms were studied on specific missions."
                        icon={<GridIcon className="w-6 h-6" />}
                    >
                        <div className="w-full h-full overflow-auto text-xs relative">
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 bg-white dark:bg-charcoal-deep z-10">
                                    <tr>
                                        <th className="sticky left-0 bg-white dark:bg-charcoal-deep p-2 border-b border-r border-gray-300 dark:border-space-blue/50 w-24 text-gray-900 dark:text-ivory-text">Organism</th>
                                        {missions.map(mis => (
                                            <th key={mis} className="p-2 border-b border-gray-300 dark:border-space-blue/50 min-w-[80px] font-semibold text-gray-900 dark:text-ivory-text">
                                                {mis}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {organisms.map(org => (
                                        <tr key={org}>
                                            <td className="sticky left-0 bg-white dark:bg-charcoal-deep font-bold p-2 border-r border-b border-gray-300 dark:border-space-blue/50 w-24 text-gray-900 dark:text-ivory-text">{org}</td>
                                            {missions.map(mis => {
                                                const count = heatmapData[org]?.[mis] || 0;
                                                return (
                                                    <td key={`${org}-${mis}`} 
                                                        className="text-center border-r border-b border-gray-200 dark:border-space-blue/30 h-10"
                                                        style={{ backgroundColor: count > 0 ? (theme === 'dark' ? darkColorScale(count) : colorScale(count)) : 'transparent' }}
                                                        aria-label={`${count} reports for ${org} in ${mis} missions`}
                                                    >
                                                        {count > 0 && (
                                                            <span className="font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                                                                {count}
                                                            </span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </ChartContainer>
                </div>
            </div>
        </div>
    );
};

export default DataDashboard;