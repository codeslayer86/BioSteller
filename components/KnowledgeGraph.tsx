import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
// FIX: Use namespace import for d3 to resolve module errors.
import * as d3 from 'd3';
import { KnowledgeGraphData, GraphNode, GraphLink } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface KnowledgeGraphProps {
  data: KnowledgeGraphData;
  filters: { [key: string]: boolean };
  forceParams: {
    charge: number;
    linkDistance: number;
    collisionRadius: number;
  };
}

export interface ExportHandles {
  exportAsSvg: (filename: string) => void;
  exportAsPng: (filename: string) => void;
}

const KnowledgeGraph = forwardRef<ExportHandles, KnowledgeGraphProps>(({ data, filters, forceParams }, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const exportSvgToFile = (svgEl: SVGSVGElement, filename: string, format: 'svg' | 'png') => {
      const contentGroup = svgEl.querySelector('g');
      if (!contentGroup) return;

      // Get bbox from the original element before transformations
      const bbox = contentGroup.getBBox();
      if (bbox.width === 0 && bbox.height === 0) return;
      
      const padding = 20;
      const isDarkMode = document.documentElement.classList.contains('dark');
      const backgroundColor = isDarkMode ? '#1A1A1A' : '#FFFFF0';

      // 1. Clone the SVG to avoid altering the live display
      const clonedSvg = svgEl.cloneNode(true) as SVGSVGElement;
      
      // 2. Set explicit dimensions for the export
      clonedSvg.setAttribute('width', `${bbox.width + padding * 2}`);
      clonedSvg.setAttribute('height', `${bbox.height + padding * 2}`);
      clonedSvg.removeAttribute('viewBox');

      // 3. Create background and style definitions
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      style.textContent = `
          svg { font-family: 'Roboto', sans-serif; }
          text { fill: ${isDarkMode ? '#E0E0D6' : '#1A1A1A'}; }
      `;
      defs.appendChild(style);
      clonedSvg.insertBefore(defs, clonedSvg.firstChild);

      const backgroundRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      backgroundRect.setAttribute('width', '100%');
      backgroundRect.setAttribute('height', '100%');
      backgroundRect.setAttribute('fill', backgroundColor);
      clonedSvg.insertBefore(backgroundRect, defs.nextSibling);

      // 4. Adjust the main group's transform to frame the content
      const clonedContentGroup = clonedSvg.querySelector('g');
      if (clonedContentGroup) {
          clonedContentGroup.setAttribute('transform', `translate(${-bbox.x + padding}, ${-bbox.y + padding})`);
      }
      
      // 5. Serialize the modified SVG
      const svgString = new XMLSerializer().serializeToString(clonedSvg);
      
      // 6. Trigger download
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style.display = 'none';

      if (format === 'svg') {
          const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          a.href = url;
          a.download = `${filename}.svg`;
          a.click();
          URL.revokeObjectURL(url);
          document.body.removeChild(a);
      } else { // png
          const svgUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
          const img = new Image();
          img.onload = () => {
              const canvas = document.createElement('canvas');
              const scale = 2; // For higher resolution
              canvas.width = (bbox.width + padding * 2) * scale;
              canvas.height = (bbox.height + padding * 2) * scale;
    
              const ctx = canvas.getContext('2d');
              if (!ctx) return;
              
              ctx.scale(scale, scale);
              ctx.drawImage(img, 0, 0);
            
              const pngUrl = canvas.toDataURL('image/png');
              a.href = pngUrl;
              a.download = `${filename}.png`;
              a.click();
              document.body.removeChild(a);
          };
          img.onerror = (err) => {
              console.error("Failed to load image for PNG conversion.", err);
              document.body.removeChild(a);
          }
          img.src = svgUrl;
        }
  };

  useImperativeHandle(ref, () => ({
      exportAsSvg: (filename: string) => {
        if (svgRef.current) exportSvgToFile(svgRef.current, filename, 'svg');
      },
      exportAsPng: (filename: string) => {
        if (svgRef.current) exportSvgToFile(svgRef.current, filename, 'png');
      },
  }));

  useEffect(() => {
    if (!svgRef.current || !data || !tooltipRef.current || !filters) return;
    
    // Filter data based on active filters
    const activeNodeTypes = Object.keys(filters).filter(type => filters[type]);
    const filteredNodes = data.nodes.filter(node => activeNodeTypes.includes(node.type));
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    
    const filteredLinks = data.links.filter(link => {
        // At this initial stage from props, source/target are strings
        return filteredNodeIds.has(link.source as string) && filteredNodeIds.has(link.target as string);
    });

    // FIX: Use 'd3.select' from namespace import.
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // FIX: Removed the generic SVG <title> that caused an unwanted browser tooltip.
    // The custom HTML tooltip is used instead, preventing visual overlap.
    svg.attr('role', 'img');

    // FIX: Use 'd3.select' from namespace import.
    const tooltip = d3.select(tooltipRef.current);

    const container = svg.node()?.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    
    svg.attr('viewBox', [0, 0, width, height]);

    // Make copies of data to avoid mutating props
    const nodes = filteredNodes.map(d => ({ ...d })) as GraphNode[];
    const links = filteredLinks.map(d => ({ ...d })) as GraphLink[];

    // --- Simulation setup ---
    // FIX: Use d3 force simulation functions from namespace import.
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id(d => (d as GraphNode).id).distance(forceParams.linkDistance))
      .force('charge', d3.forceManyBody().strength(forceParams.charge))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(forceParams.collisionRadius));

    // --- Adjacency list for highlighting ---
    const adjacency = new Map<string, Set<string>>();
    links.forEach(link => {
        const sourceId = (link.source as GraphNode).id || link.source as string;
        const targetId = (link.target as GraphNode).id || link.target as string;

        if (!adjacency.has(sourceId)) adjacency.set(sourceId, new Set());
        if (!adjacency.has(targetId)) adjacency.set(targetId, new Set());

        adjacency.get(sourceId)!.add(targetId);
        adjacency.get(targetId)!.add(sourceId);
    });

    function areNodesConnected(a: GraphNode, b: GraphNode): boolean {
        return a.id === b.id || (adjacency.has(a.id) && adjacency.get(a.id)!.has(b.id));
    }

    // --- Main SVG Group for Zooming ---
    const g = svg.append('g');

    // --- Links ---
    const link = g.append('g')
      .attr('stroke', theme === 'dark' ? '#046307' : '#A3A39A') // Use new theme colors
      .attr('stroke-opacity', 0.5)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1.5);

    // --- Link Labels ---
    const linkLabel = g.append("g")
      .selectAll("text")
      .data(links)
      .join("text")
      .attr('font-size', '9px')
      .attr('fill', theme === 'dark' ? '#A3A39A' : '#6b7280')
      .attr('text-anchor', 'middle')
      .text(d => d.label)
      .style('cursor', 'help')
      .on('mouseover', function(event, d) {
        const [x, y] = d3.pointer(event, container);
        tooltip.style('opacity', 1)
               .html(`<strong>Relationship:</strong> ${d.label}<br/>
                      <strong>Source:</strong> ${(d.source as GraphNode).id}<br/>
                      <strong>Target:</strong> ${(d.target as GraphNode).id}`)
               .style('left', `${x + 15}px`)
               .style('top', `${y + 10}px`);
      })
      .on('mouseout', function() {
        tooltip.style('opacity', 0);
      });

    // --- Nodes ---
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g');

    const color = (type: string) => {
        // New palette to match emerald and ivory theme
        switch(type.toLowerCase()) {
            case 'experiment': return '#046307'; // Emerald
            case 'organism': return '#208080';   // Teal
            case 'result': return '#87ae73';     // Sage Green
            case 'condition': return '#b59475';  // Muted Gold
            default: return theme === 'dark' ? '#A3A39A' : '#9ca3af';
        }
    }
    
    const symbolGenerator = (type: string) => {
      const size = 250;
      // FIX: Use d3 symbol functions from namespace import.
      switch(type.toLowerCase()) {
          case 'experiment': return d3.symbol().type(d3.symbolSquare).size(size);
          case 'organism': return d3.symbol().type(d3.symbolCircle).size(size);
          case 'result': return d3.symbol().type(d3.symbolDiamond).size(size);
          case 'condition': return d3.symbol().type(d3.symbolWye).size(size);
          default: return d3.symbol().type(d3.symbolCircle).size(size);
      }
    }

    node.append('path')
        .attr('d', d => symbolGenerator(d.type)())
        .attr('fill', d => color(d.type))
        .attr('stroke', theme === 'dark' ? '#1A1A1A' : '#FFFFF0') // charcoal-deep or ivory-bg
        .attr('stroke-width', 2.5);

    // --- Node Labels ---
    const nodeLabel = node.append('text')
      .text(d => d.id)
      .attr('x', 18)
      .attr('y', 5)
      .attr('fill', theme === 'dark' ? '#E0E0D6' : '#1A1A1A') // ivory-text or charcoal-text
      .attr('font-size', '11px');

    // --- Drag Logic ---
    // FIX: Use imported d3.Simulation and d3.D3DragEvent types.
    const drag = (simulation: d3.Simulation<GraphNode, undefined>) => {
      function dragstarted(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      function dragended(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
        if (!event.active) simulation.alphaTarget(0);
        // Only release the node if it's not pinned
        if (!event.subject.isPinned) {
            event.subject.fx = null;
            event.subject.fy = null;
        }
      }
      // FIX: Use 'd3.drag' from namespace import.
      return d3.drag<SVGGElement, GraphNode>()
        .on('start', dragstarted).on('drag', dragged).on('end', dragended);
    }
    node.call(drag(simulation));

    // --- Hover, Pinning, and Tooltip Logic ---
    node
    .on('mouseover', function(event, d) {
        // FIX: Use 'd3.pointer' from namespace import.
        const [x, y] = d3.pointer(event, container);
        tooltip.style('opacity', 1)
               .html(`<strong>ID:</strong> ${d.id}<br/><strong>Type:</strong> ${d.type}`)
               .style('left', (x + 15) + 'px')
               .style('top', (y + 10) + 'px');
        
        node.transition().duration(100).style('opacity', o => areNodesConnected(d, o) ? 1 : 0.15);
        nodeLabel.transition().duration(100).style('opacity', o => areNodesConnected(d, o) ? 1 : 0.15);
        link.transition().duration(100).attr('stroke-opacity', o => ((o.source as GraphNode).id === d.id || (o.target as GraphNode).id === d.id) ? 1 : 0.1);
        linkLabel.transition().duration(100).style('opacity', o => ((o.source as GraphNode).id === d.id || (o.target as GraphNode).id === d.id) ? 1 : 0.1);
    })
    .on('mouseout', function() {
        tooltip.style('opacity', 0);
        node.transition().duration(200).style('opacity', 1);
        nodeLabel.transition().duration(200).style('opacity', 1);
        link.transition().duration(200).attr('stroke-opacity', 0.5);
        linkLabel.transition().duration(200).style('opacity', 1);
    })
    .on('dblclick', function(event, d) {
        // Toggle the pinned state
        d.isPinned = !d.isPinned;
        if (d.isPinned) {
            // Pin the node at its current position
            d.fx = d.x;
            d.fy = d.y;
            // Apply visual feedback for pinned state
            d3.select(this).select('path')
                .attr('stroke', '#046307') // Use new theme accent color
                .attr('stroke-width', 4);
        } else {
            // Unpin the node
            d.fx = null;
            d.fy = null;
            // Revert to original visual state
            d3.select(this).select('path')
                .attr('stroke', theme === 'dark' ? '#1A1A1A' : '#FFFFF0')
                .attr('stroke-width', 2.5);
        }
    });

    // --- Simulation Tick ---
    simulation.on('tick', () => {
      // FIX: Cast source and target to d3.SimulationNodeDatum to access x/y properties.
      // After simulation starts, these are guaranteed to be node objects with positions.
      link
        .attr('x1', d => (d.source as d3.SimulationNodeDatum).x!)
        .attr('y1', d => (d.source as d3.SimulationNodeDatum).y!)
        .attr('x2', d => (d.target as d3.SimulationNodeDatum).x!)
        .attr('y2', d => (d.target as d3.SimulationNodeDatum).y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);

      // FIX: Cast source and target to d3.SimulationNodeDatum to access x/y properties.
      linkLabel
        .attr('x', d => ((d.source as d3.SimulationNodeDatum).x! + (d.target as d3.SimulationNodeDatum).x!) / 2)
        .attr('y', d => ((d.source as d3.SimulationNodeDatum).y! + (d.target as d3.SimulationNodeDatum).y!) / 2);
    });
    
    // --- Zoom Logic ---
    // FIX: Use 'd3.zoom' from namespace import.
    const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.2, 5])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });
    svg.call(zoom);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, theme, filters, forceParams]);

  return (
    <div className="w-full h-full relative">
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing"></svg>
        <div 
            ref={tooltipRef} 
            className="absolute bg-gray-900 text-white text-xs rounded py-1 px-2 pointer-events-none opacity-0 transition-opacity duration-200 shadow-lg"
            style={{ zIndex: 100 }}
        ></div>
    </div>
  );
});

export default KnowledgeGraph;