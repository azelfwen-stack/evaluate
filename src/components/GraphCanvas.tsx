import React, { useMemo, useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Level1, Level2, Level3, GraphControlState } from '../types';

import { Layers } from 'lucide-react';

interface GraphCanvasProps {
  level1Data: Level1[];
  level2Data: Level2[];
  level3Data: Level3[];
  control: GraphControlState;
  onNodeClick: (node: any) => void;
  highlightNodeIds: string[];
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  level1Data,
  level2Data,
  level3Data,
  control,
  onNodeClick,
  highlightNodeIds,
}) => {
  const echartsRef = useRef<ReactECharts>(null);

  const option = useMemo(() => {
    const nodes: any[] = [];
    const links: any[] = [];

    // Filter logic based on control
    let filteredL3 = level3Data;
    if (control.onlyWithData) {
      filteredL3 = filteredL3.filter(l => l.totalCount > 0);
    }
    if (control.hideLowFreq) {
      filteredL3 = filteredL3.filter(l => l.totalCount > 10); // arbitrary threshold
    }

    const validL2Ids = new Set(filteredL3.map(l => l.level2Id));
    let filteredL2 = level2Data;
    if (control.hideEmptyCategory) {
      filteredL2 = filteredL2.filter(l => validL2Ids.has(l.id));
    }

    const validL1Ids = new Set(filteredL2.map(l => l.parentId));
    let filteredL1 = level1Data;
    if (control.hideEmptyCategory) {
      filteredL1 = filteredL1.filter(l => validL1Ids.has(l.id));
    }

    // Find path if highlightNodeIds is set
    const highlightPath = new Set<string>();
    const hasHighlight = highlightNodeIds.length > 0;
    
    if (hasHighlight) {
      highlightPath.add('root');
    }

    const addDescendants = (id: string) => {
      const isL1 = level1Data.some(l => l.id === id);
      if (isL1) {
        level2Data.filter(l => l.parentId === id).forEach(l2 => {
          highlightPath.add(l2.id);
          level3Data.filter(l3 => l3.level2Id === l2.id).forEach(l3 => highlightPath.add(l3.id));
        });
      }
      const isL2 = level2Data.some(l => l.id === id);
      if (isL2) {
        level3Data.filter(l3 => l3.level2Id === id).forEach(l3 => highlightPath.add(l3.id));
      }
    };

    highlightNodeIds.forEach(id => {
      highlightPath.add(id);
      const l3 = level3Data.find(l => l.id === id);
      if (l3) {
        highlightPath.add(l3.level1Id);
        highlightPath.add(l3.level2Id);
      } else {
        const l2 = level2Data.find(l => l.id === id);
        if (l2) {
          highlightPath.add(l2.parentId);
        }
      }
      addDescendants(id);
    });

    // Root node
    const rootOpacity = hasHighlight && !highlightPath.has('root') ? 0.15 : 1;
    nodes.push({
      id: 'root',
      name: '评价体系',
      category: 0,
      symbolSize: 90,
      itemStyle: { 
        color: '#4f46e5', // Indigo 600
        shadowBlur: 20,
        shadowColor: 'rgba(79, 70, 229, 0.4)',
        opacity: rootOpacity
      },
      label: { show: true, position: 'inside', color: hasHighlight && !highlightPath.has('root') ? 'rgba(255,255,255,0.3)' : '#fff', fontWeight: 'bold', fontSize: 16 }
    });

    // L1 Nodes
    filteredL1.forEach(l1 => {
      const isHighlighted = highlightPath.has(l1.id);
      const opacity = hasHighlight && !isHighlighted ? 0.15 : 1;
      nodes.push({
        id: l1.id,
        name: l1.name,
        category: 1,
        symbolSize: isHighlighted ? 75 : 65,
        itemStyle: { 
          color: '#8b5cf6', // Violet 500
          borderColor: isHighlighted ? '#6d28d9' : '#fff', // Violet 700
          borderWidth: isHighlighted ? 3 : 2,
          shadowBlur: isHighlighted ? 15 : 5,
          shadowColor: 'rgba(139, 92, 246, 0.4)',
          opacity
        },
        label: { 
          show: true, 
          position: 'inside', 
          color: hasHighlight && !isHighlighted ? 'rgba(255,255,255,0.3)' : '#fff', 
          fontSize: 13, 
          fontWeight: 'bold'
        },
        data: l1
      });
      links.push({ 
        source: 'root', 
        target: l1.id,
        lineStyle: {
          opacity: hasHighlight ? (isHighlighted && highlightPath.has('root') ? 0.8 : 0.05) : 0.7,
          width: hasHighlight && isHighlighted && highlightPath.has('root') ? 3 : 1.5,
          color: hasHighlight && isHighlighted && highlightPath.has('root') ? '#94a3b8' : '#cbd5e1'
        }
      });
    });

    // L2 Nodes
    filteredL2.forEach(l2 => {
      const isHighlighted = highlightPath.has(l2.id);
      const opacity = hasHighlight && !isHighlighted ? 0.15 : 1;
      nodes.push({
        id: l2.id,
        name: l2.name,
        category: 2,
        symbolSize: isHighlighted ? 55 : 45,
        itemStyle: { 
          color: '#06b6d4', // Cyan 500
          borderColor: isHighlighted ? '#0e7490' : '#fff', // Cyan 700
          borderWidth: isHighlighted ? 2 : 1.5,
          shadowBlur: isHighlighted ? 10 : 0,
          shadowColor: 'rgba(6, 182, 212, 0.4)',
          opacity
        },
        label: { 
          show: true, 
          position: 'right', 
          color: hasHighlight && !isHighlighted ? 'rgba(51,65,85,0.3)' : '#334155', 
          fontSize: 12, 
          fontWeight: '500'
        },
        data: l2
      });
      links.push({ 
        source: l2.parentId, 
        target: l2.id,
        lineStyle: {
          opacity: hasHighlight ? (isHighlighted && highlightPath.has(l2.parentId) ? 0.8 : 0.05) : 0.7,
          width: hasHighlight && isHighlighted && highlightPath.has(l2.parentId) ? 3 : 1.5,
          color: hasHighlight && isHighlighted && highlightPath.has(l2.parentId) ? '#94a3b8' : '#cbd5e1'
        }
      });
    });

    // L3 Nodes
    filteredL3.forEach(l3 => {
      let color = '#cbd5e1'; // default gray for no data
      let symbolSize = 20;
      let symbol = 'circle';

      // Shape based on targetType
      if (l3.targetType === 'student') symbol = 'circle';
      else if (l3.targetType === 'class') symbol = 'rect';
      else if (l3.targetType === 'dormitory') symbol = 'triangle'; // simplified

      if (l3.totalCount > 0) {
        // Size based on count
        symbolSize = Math.max(15, Math.min(40, 15 + (l3.totalCount / 300) * 25));

        // Color based on mode
        if (control.displayMode === 'normalizedScore') {
          if (l3.normalizedScore !== null) {
            if (l3.normalizedScore <= 40) color = '#f43f5e'; // rose
            else if (l3.normalizedScore <= 70) color = '#f59e0b'; // amber
            else color = '#10b981'; // emerald
          }
        } else if (control.displayMode === 'evaluationCount') {
          // Heatmap style color for count
          const ratio = Math.min(1, l3.totalCount / 300);
          color = `rgba(244, 63, 94, ${Math.max(0.2, ratio)})`; // Rose intensity, min 0.2 opacity
        } else if (control.displayMode === 'targetType') {
          if (l3.targetType === 'student') color = '#3b82f6';
          else if (l3.targetType === 'class') color = '#a855f7';
          else color = '#14b8a6';
        }
      }

      const isHighlighted = highlightPath.has(l3.id);
      const opacity = hasHighlight && !isHighlighted ? 0.15 : 1;

      if (isHighlighted) {
        symbolSize *= 1.5;
      }

      let activeBorderColor = color;
      if (color.startsWith('rgba')) activeBorderColor = '#e11d48';
      else if (color === '#f43f5e') activeBorderColor = '#e11d48';
      else if (color === '#f59e0b') activeBorderColor = '#d97706';
      else if (color === '#10b981') activeBorderColor = '#059669';
      else if (color === '#3b82f6') activeBorderColor = '#2563eb';
      else if (color === '#a855f7') activeBorderColor = '#9333ea';
      else if (color === '#14b8a6') activeBorderColor = '#0d9488';
      else activeBorderColor = '#94a3b8';

      nodes.push({
        id: l3.id,
        name: l3.name,
        category: 3,
        symbolSize,
        symbol,
        itemStyle: { 
          color,
          borderColor: isHighlighted ? activeBorderColor : '#fff',
          borderWidth: isHighlighted ? 3 : 1.5,
          shadowBlur: isHighlighted ? 15 : 4,
          shadowColor: isHighlighted ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)',
          opacity
        },
        label: { show: true, position: 'right', color: hasHighlight && !isHighlighted ? 'rgba(71,85,105,0.3)' : '#475569', fontSize: 10, fontWeight: isHighlighted ? 'bold' : 'normal' },
        data: l3,
        tooltip: {
          formatter: () => {
             return `
              <div class="p-3 text-sm font-sans">
                <div class="font-bold text-base mb-2 text-slate-800">${l3.name}</div>
                <div class="text-slate-600 mb-1">所属分类: <span class="font-medium text-slate-700">${filteredL1.find(l => l.id === l3.level1Id)?.name} > ${filteredL2.find(l => l.id === l3.level2Id)?.name}</span></div>
                <div class="text-slate-600">评价对象: <span class="font-medium text-slate-700">${l3.targetType === 'student' ? '学生' : l3.targetType === 'class' ? '班级' : '宿舍'}</span></div>
                <div class="mt-3 border-t border-slate-200 pt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                  <div class="text-slate-500">总评价数</div>
                  <div class="font-bold text-slate-800 text-right">${l3.totalCount}</div>
                  <div class="text-slate-500">平均分</div>
                  <div class="font-bold text-slate-800 text-right">${l3.avgScore.toFixed(1)}</div>
                  <div class="text-slate-500">标准化得分</div>
                  <div class="font-bold text-blue-600 text-right">${l3.normalizedScore !== null ? l3.normalizedScore.toFixed(1) : '--'}</div>
                </div>
              </div>
            `;
          }
        }
      });
      links.push({ 
        source: l3.parentId, 
        target: l3.id,
        lineStyle: {
          opacity: hasHighlight ? (isHighlighted && highlightPath.has(l3.parentId) ? 0.8 : 0.05) : 0.7,
          width: hasHighlight && isHighlighted && highlightPath.has(l3.parentId) ? 3 : 1.5,
          color: hasHighlight && isHighlighted && highlightPath.has(l3.parentId) ? '#94a3b8' : '#cbd5e1'
        }
      });
    });

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#334155' },
        extraCssText: 'box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); border-radius: 0.75rem; padding: 0;'
      },
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: nodes,
          links: links,
          roam: true,
          draggable: true,
          label: {
            position: 'right',
            formatter: '{b}'
          },
          force: {
            repulsion: 400,
            edgeLength: [60, 180],
            gravity: 0.05
          },
          lineStyle: {
            color: '#cbd5e1',
            curveness: 0.2,
            width: 1.5,
            opacity: 0.7
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 3,
              opacity: 1,
              color: '#94a3b8'
            }
          }
        }
      ]
    };
  }, [level1Data, level2Data, level3Data, control, highlightNodeIds]);

  const onEvents = {
    click: (params: any) => {
      if (params.dataType === 'node' && params.data.data) {
        onNodeClick(params.data.data);
      }
    }
  };

  return (
    <div className="flex-1 h-full relative bg-transparent">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl"></div>
      </div>
      
      <ReactECharts
        ref={echartsRef}
        option={option}
        style={{ height: '100%', width: '100%' }}
        onEvents={onEvents}
        opts={{ renderer: 'canvas' }}
      />

      {/* Floating Legend */}
      <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/60 shadow-lg z-10 w-64 pointer-events-none">
        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <div className="p-1 bg-blue-50 text-blue-600 rounded">
            <Layers size={14} />
          </div>
          图例说明
        </h4>
        <div className="space-y-5">
          <div>
            <div className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">节点颜色 (评价次数)</div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 rounded-full bg-gradient-to-r from-rose-100 to-rose-500 shadow-inner"></div>
              <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">少 ➔ 多</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">节点大小</div>
            <div className="text-xs text-slate-600 font-medium flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-slate-300"></div>
              <div className="w-3 h-3 rounded-full bg-slate-400"></div>
              <div className="w-4 h-4 rounded-full bg-slate-500"></div>
              <span className="text-[11px] text-slate-500 ml-1">正比于评价次数</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">评价对象 (形状)</div>
            <div className="flex items-center gap-4 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-slate-400 rounded-full"></div> 学生</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-slate-400 rounded-sm"></div> 班级</div>
              <div className="flex items-center gap-1.5"><div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-slate-400"></div> 宿舍</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
