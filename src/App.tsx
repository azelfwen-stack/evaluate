import React, { useState, useEffect, useMemo } from 'react';
import { TopBar } from './components/TopBar';
import { GraphCanvas } from './components/GraphCanvas';
import { RightPanel } from './components/RightPanel';
import { BottomTable } from './components/BottomTable';
import { FilterState, GraphControlState, Level3 } from './types';
import { mockLevel1, mockLevel2, mockLevel3, mockRecords, mockTrends, mockClassCompare } from './mock';

export default function App() {
  const [filter, setFilter] = useState<FilterState>({
    semester: '',
    month: '',
    week: '',
    dateRange: null,
    targetTypes: [],
    level1Id: '',
    level2Id: '',
    classes: [],
    dataSources: [],
  });

  const [control, setControl] = useState<GraphControlState>({
    displayMode: 'evaluationCount',
    onlyWithData: false,
    hideLowFreq: false,
    hideEmptyCategory: false,
    expanded: true,
    autoFocusAnomaly: false,
    searchText: '',
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [highlightNodeIds, setHighlightNodeIds] = useState<string[]>([]);
  const [isTableOpen, setIsTableOpen] = useState(false);

  // Derived state for selected indicator
  const selectedIndicator = selectedNodeId ? mockLevel3.find(l => l.id === selectedNodeId) || null : null;
  const selectedLevel2 = selectedNodeId ? mockLevel2.find(l => l.id === selectedNodeId) || null : null;
  const selectedLevel1 = selectedNodeId ? mockLevel1.find(l => l.id === selectedNodeId) || null : null;

  const nodeType = selectedIndicator ? 'level3' : selectedLevel2 ? 'level2' : selectedLevel1 ? 'level1' : null;
  const selectedNode = selectedIndicator || selectedLevel2 || selectedLevel1;

  const trendData = selectedIndicator ? mockTrends[selectedIndicator.id] || null : null;
  const classCompareData = selectedIndicator ? mockClassCompare[selectedIndicator.id] || null : null;

  // Filtered data based on TopBar filters
  const filteredLevel3 = useMemo(() => {
    let result = mockLevel3;
    if (filter.level1Id) result = result.filter(l => l.level1Id === filter.level1Id);
    if (filter.level2Id) result = result.filter(l => l.level2Id === filter.level2Id);
    return result;
  }, [filter]);

  const handleApplyFilter = () => {
    // In a real app, this would fetch new data.
    // Here we just trigger a re-render with the current filter state.
    console.log('Applied filters:', filter);
  };

  const handleResetFilter = () => {
    setFilter({
      semester: '',
      month: '',
      week: '',
      dateRange: null,
      targetTypes: [],
      level1Id: '',
      level2Id: '',
      classes: [],
      dataSources: [],
    });
    setHighlightNodeIds([]);
    setSelectedNodeId(null);
  };

  const handleSearch = () => {
    if (!control.searchText) {
      setHighlightNodeIds([]);
      return;
    }
    const found = mockLevel3.find(l => l.name.includes(control.searchText));
    if (found) {
      setHighlightNodeIds([found.id]);
      setSelectedNodeId(found.id);
    } else {
      const foundL1 = mockLevel1.find(l => l.name.includes(control.searchText));
      if (foundL1) setHighlightNodeIds([foundL1.id]);
      else {
        const foundL2 = mockLevel2.find(l => l.name.includes(control.searchText));
        if (foundL2) setHighlightNodeIds([foundL2.id]);
      }
    }
  };

  const handleHighlightLowScore = () => {
    const lowScoreNodes = filteredLevel3.filter(l => l.normalizedScore !== null && l.normalizedScore < 40);
    if (lowScoreNodes.length > 0) {
      setHighlightNodeIds(lowScoreNodes.map(n => n.id));
      setSelectedNodeId(null); // Clear selected node to show all highlights
    }
  };

  const handleHighlightHighFreq = () => {
    const highFreqNodes = filteredLevel3.filter(l => l.totalCount > 100);
    if (highFreqNodes.length > 0) {
      setHighlightNodeIds(highFreqNodes.map(n => n.id));
      setSelectedNodeId(null);
    }
  };

  const handleNodeClick = (nodeData: any) => {
    setSelectedNodeId(nodeData.id);
    setHighlightNodeIds([nodeData.id]);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 flex flex-col h-screen box-border bg-gradient-to-br from-[#eef2ff] via-[#f5f3ff] to-[#fff1f2] font-sans">
      <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white flex flex-col flex-1 overflow-hidden">
        {/* Top Area */}
        <TopBar
          filter={filter}
          setFilter={setFilter}
          level1Data={mockLevel1}
          level2Data={mockLevel2}
          level3Data={filteredLevel3}
          onApply={handleApplyFilter}
          onReset={handleResetFilter}
          onHighlightLowScore={handleHighlightLowScore}
          onHighlightHighFreq={handleHighlightHighFreq}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden relative bg-slate-50/30">
          {/* Center Graph Canvas */}
          <div className="flex-1 relative min-w-0 overflow-hidden">
            <GraphCanvas
              level1Data={mockLevel1}
              level2Data={mockLevel2}
              level3Data={filteredLevel3}
              control={control}
              onNodeClick={handleNodeClick}
              highlightNodeIds={highlightNodeIds}
            />

            {/* Bottom Table (Absolute positioned over canvas) */}
            <BottomTable
              records={mockRecords}
              indicator={selectedIndicator}
              isOpen={isTableOpen}
              setIsOpen={setIsTableOpen}
            />
          </div>

          {/* Right Detail Panel */}
          {selectedNode && nodeType && (
            <RightPanel
              selectedNode={selectedNode}
              nodeType={nodeType}
              level1Data={mockLevel1}
              level2Data={mockLevel2}
              level3Data={filteredLevel3}
              trend={trendData}
              classCompare={classCompareData}
              onClose={() => {
                setSelectedNodeId(null);
                setHighlightNodeIds([]);
              }}
              onViewRecords={() => setIsTableOpen(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
