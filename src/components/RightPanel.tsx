import React, { useMemo, useState, useEffect } from 'react';
import { Level1, Level2, Level3, TrendData, ClassCompareData } from '../types';
import ReactECharts from 'echarts-for-react';
import { X, ChevronRight, Activity, BarChart2, TrendingUp, Info, PieChart, Sparkles, RefreshCw, List } from 'lucide-react';
import { mockTrends, mockClassCompare } from '../mock';

interface RightPanelProps {
  selectedNode: Level1 | Level2 | Level3;
  nodeType: 'level1' | 'level2' | 'level3';
  level1Data: Level1[];
  level2Data: Level2[];
  level3Data: Level3[];
  trend: TrendData | null;
  classCompare: ClassCompareData | null;
  onClose: () => void;
  onViewRecords: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  selectedNode,
  nodeType,
  level1Data,
  level2Data,
  level3Data,
  trend,
  classCompare,
  onClose,
  onViewRecords,
}) => {
  const [compareSort, setCompareSort] = useState<'desc' | 'asc'>('desc');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  useEffect(() => {
    setAnalysisResult(null);
    setIsAnalyzing(false);
  }, [selectedNode.id]);

  const aggregatedData = useMemo(() => {
    let childrenL3: Level3[] = [];
    let childrenL2: Level2[] = [];
    let parentL1: Level1 | null = null;
    let parentL2: Level2 | null = null;

    if (nodeType === 'level1') {
      childrenL3 = level3Data.filter(l => l.level1Id === selectedNode.id);
      childrenL2 = level2Data.filter(l => l.parentId === selectedNode.id);
    } else if (nodeType === 'level2') {
      childrenL3 = level3Data.filter(l => l.level2Id === selectedNode.id);
      parentL1 = level1Data.find(l => l.id === (selectedNode as Level2).parentId) || null;
    } else {
      parentL1 = level1Data.find(l => l.id === (selectedNode as Level3).level1Id) || null;
      parentL2 = level2Data.find(l => l.id === (selectedNode as Level3).level2Id) || null;
    }

    const totalCount = nodeType === 'level3' ? (selectedNode as Level3).totalCount : childrenL3.reduce((acc, curr) => acc + curr.totalCount, 0);
    const totalScore = nodeType === 'level3' ? Math.round((selectedNode as Level3).avgScore * (selectedNode as Level3).totalCount) : childrenL3.reduce((acc, curr) => acc + Math.round(curr.avgScore * curr.totalCount), 0);
    const maxScore = nodeType === 'level3' ? (selectedNode as Level3).maxScore : childrenL3.length > 0 ? Math.max(...childrenL3.map(l => l.maxScore)) : 0;
    const minScore = nodeType === 'level3' ? (selectedNode as Level3).minScore : childrenL3.length > 0 ? Math.min(...childrenL3.map(l => l.minScore)) : 0;
    const avgScore = totalCount > 0 ? totalScore / totalCount : 0;

    let aggClassCompare: { className: string; totalScore: number }[] = [];
    if (nodeType === 'level3' && classCompare) {
      aggClassCompare = classCompare.classCompare.map(c => ({ className: c.className, totalScore: Math.round(c.totalCount * c.avgScore) }));
    } else {
      const classMap = new Map<string, number>();
      childrenL3.forEach(l3 => {
        const cc = mockClassCompare[l3.id];
        if (cc) {
          cc.classCompare.forEach(c => {
            classMap.set(c.className, (classMap.get(c.className) || 0) + Math.round(c.totalCount * c.avgScore));
          });
        }
      });
      aggClassCompare = Array.from(classMap.entries()).map(([className, totalScore]) => ({ className, totalScore }));
    }

    let aggTrend: number[] = Array(7).fill(0);
    if (nodeType === 'level3' && trend) {
      aggTrend = trend.weekTrend;
    } else {
      childrenL3.forEach(l3 => {
        const t = mockTrends[l3.id];
        if (t) {
          t.weekTrend.forEach((val, idx) => {
            aggTrend[idx] += val;
          });
        }
      });
    }

    let subItems: { name: string; totalScore: number }[] = [];
    if (nodeType === 'level1') {
      subItems = childrenL2.map(l2 => {
        const l2Children = childrenL3.filter(l3 => l3.level2Id === l2.id);
        const l2TotalScore = l2Children.reduce((acc, curr) => acc + Math.round(curr.avgScore * curr.totalCount), 0);
        return { name: l2.name, totalScore: l2TotalScore };
      });
    } else if (nodeType === 'level2') {
      subItems = childrenL3.map(l3 => ({
        name: l3.name,
        totalScore: Math.round(l3.avgScore * l3.totalCount)
      }));
    }

    return {
      childrenL3,
      childrenL2,
      parentL1,
      parentL2,
      totalCount,
      totalScore,
      maxScore,
      minScore,
      avgScore,
      aggClassCompare,
      aggTrend,
      subItems
    };
  }, [selectedNode, nodeType, level1Data, level2Data, level3Data, trend, classCompare]);

  const trendOption = useMemo(() => {
    return {
      tooltip: { 
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        textStyle: { color: '#334155' },
        extraCssText: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-radius: 0.5rem;'
      },
      grid: { top: 20, right: 20, bottom: 20, left: 40, containLabel: true },
      xAxis: { 
        type: 'category', 
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], 
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b', fontSize: 10 }
      },
      yAxis: { 
        type: 'value', 
        splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
        axisLabel: { color: '#64748b', fontSize: 10 }
      },
      series: [{
        data: aggregatedData.aggTrend,
        type: 'line',
        smooth: true,
        color: '#3b82f6',
        symbolSize: 6,
        itemStyle: {
          borderWidth: 2,
          borderColor: '#fff'
        },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(59, 130, 246, 0.2)' }, { offset: 1, color: 'rgba(59, 130, 246, 0)' }]
          }
        }
      }]
    };
  }, [aggregatedData.aggTrend]);

  const compareOption = useMemo(() => {
    const sortedData = [...aggregatedData.aggClassCompare]
      .sort((a, b) => compareSort === 'desc' ? b.totalScore - a.totalScore : a.totalScore - b.totalScore)
      .slice(0, 5);

    return {
      tooltip: { 
        trigger: 'axis', 
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        textStyle: { color: '#334155' },
        extraCssText: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-radius: 0.5rem;'
      },
      grid: { top: 20, right: 20, bottom: 20, left: 40, containLabel: true },
      xAxis: { 
        type: 'category', 
        data: sortedData.map(c => c.className), 
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b', fontSize: 10, interval: 0, rotate: 30 }
      },
      yAxis: { 
        type: 'value', 
        splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
        axisLabel: { color: '#64748b', fontSize: 10 }
      },
      series: [{
        name: '评价总分',
        data: sortedData.map(c => c.totalScore),
        type: 'bar',
        barWidth: '30%',
        itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] }
      }]
    };
  }, [aggregatedData.aggClassCompare, compareSort]);

  const subItemsOption = useMemo(() => {
    if (nodeType === 'level3') return {};

    const sortedData = [...aggregatedData.subItems].sort((a, b) => b.totalScore - a.totalScore);

    return {
      tooltip: { 
        trigger: 'axis', 
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        textStyle: { color: '#334155' },
        extraCssText: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-radius: 0.5rem;'
      },
      grid: { top: 20, right: 20, bottom: 20, left: 40, containLabel: true },
      xAxis: { 
        type: 'category', 
        data: sortedData.map(c => c.name), 
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b', fontSize: 10, interval: 0, rotate: 30 }
      },
      yAxis: { 
        type: 'value', 
        splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
        axisLabel: { color: '#64748b', fontSize: 10 }
      },
      series: [{
        name: '评价总分',
        data: sortedData.map(c => c.totalScore),
        type: 'bar',
        barWidth: '30%',
        itemStyle: { color: '#8b5cf6', borderRadius: [4, 4, 0, 0] }
      }]
    };
  }, [aggregatedData.subItems, nodeType]);

  const sourceOption = useMemo(() => {
    const seed = selectedNode.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const sources = [
      { name: '学生自主上传', value: (seed % 40) + 10, itemStyle: { color: '#3b82f6' } },
      { name: '课堂教师评价', value: ((seed * 2) % 30) + 5, itemStyle: { color: '#8b5cf6' } },
      { name: '学生互评', value: ((seed * 3) % 20) + 5, itemStyle: { color: '#10b981' } },
      { name: '第三方数据', value: ((seed * 5) % 15) + 2, itemStyle: { color: '#f59e0b' } },
    ];

    return {
      tooltip: { 
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        textStyle: { color: '#334155' },
        extraCssText: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-radius: 0.5rem;'
      },
      legend: { 
        bottom: '0%', 
        left: 'center', 
        itemWidth: 8, 
        itemHeight: 8, 
        textStyle: { color: '#64748b', fontSize: 11 },
        icon: 'circle'
      },
      series: [
        {
          name: '数据来源',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '40%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: { show: false, position: 'center' },
          emphasis: {
            label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#334155' }
          },
          labelLine: { show: false },
          data: sources
        }
      ]
    };
  }, [selectedNode.id]);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      let scoreDesc = '良好水平';
      if (nodeType === 'level3') {
        const l3 = selectedNode as Level3;
        scoreDesc = l3.normalizedScore !== null && l3.normalizedScore < 40 ? '<span class="text-rose-600 font-bold">偏低水平</span>，需引起重视' : '<span class="text-emerald-600 font-bold">良好水平</span>';
      }
      const freqDesc = aggregatedData.totalCount > 100 ? '全校关注度<span class="text-amber-600 font-bold">极高</span>' : '全校关注度一般';
      setAnalysisResult(`综合全校数据来看，当前${nodeType === 'level1' ? '一级分类' : nodeType === 'level2' ? '二级分类' : '指标'} <strong>【${selectedNode.name}】</strong> 的整体表现处于${scoreDesc}。该项${freqDesc}，共产生 ${aggregatedData.totalCount} 条记录。建议在后续的教学与管理中，针对得分较低的班级或个体进行定向辅导，以提升整体水平。`);
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="w-[600px] shrink-0 bg-white/80 backdrop-blur-xl border-l border-slate-100/60 flex flex-col h-full shadow-[-10px_0_30px_-10px_rgba(0,0,0,0.05)] z-20 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="p-6 border-b border-slate-100/60 flex items-start justify-between sticky top-0 bg-white/95 backdrop-blur-md z-30">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight leading-tight">{selectedNode.name}</h2>
          <div className="flex items-center text-xs font-medium text-slate-500 mt-2 gap-1.5 bg-slate-50 w-fit px-2 py-1 rounded-md border border-slate-100">
            {nodeType === 'level3' && (
              <>
                <span>{aggregatedData.parentL1?.name}</span>
                <ChevronRight size={12} className="text-slate-400" />
                <span>{aggregatedData.parentL2?.name}</span>
              </>
            )}
            {nodeType === 'level2' && (
              <>
                <span>{aggregatedData.parentL1?.name}</span>
                <ChevronRight size={12} className="text-slate-400" />
                <span>{selectedNode.name}</span>
              </>
            )}
            {nodeType === 'level1' && (
              <span>{selectedNode.name}</span>
            )}
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="p-6 flex flex-col gap-8">
        {/* Basic Info */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
              <Info size={14} />
            </div>
            基础信息
          </h3>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-sm flex flex-col gap-3">
            {nodeType === 'level3' ? (
              <>
                <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">评价类型</span><span className="font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded text-xs">{(selectedNode as Level3).evaluationType}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">评价对象</span><span className="font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded text-xs">{(selectedNode as Level3).targetType === 'student' ? '学生' : (selectedNode as Level3).targetType === 'class' ? '班级' : '宿舍'}</span></div>
                <div className="mt-2 pt-3 border-t border-slate-100 text-slate-600 text-sm leading-relaxed">
                  {(selectedNode as Level3).description}
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">分类名称</span><span className="font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded text-xs">{selectedNode.name}</span></div>
                {nodeType === 'level2' && <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">所属一级分类</span><span className="font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded text-xs">{aggregatedData.parentL1?.name}</span></div>}
                <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">基础分</span><span className="font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded text-xs">{(selectedNode as any).baseScore || 100} (每学期)</span></div>
                {nodeType === 'level1' && <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">包含二级分类</span><span className="font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded text-xs">{aggregatedData.childrenL2.length} 个</span></div>}
                <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">包含三级指标</span><span className="font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded text-xs">{aggregatedData.childrenL3.length} 项</span></div>
              </>
            )}
          </div>
        </section>

        {/* AI Analysis */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
                <Sparkles size={14} />
              </div>
              智能分析
            </h3>
            {!analysisResult && !isAnalyzing && (
              <button onClick={handleAnalyze} className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
                <Sparkles size={12} /> 生成分析
              </button>
            )}
          </div>
          {isAnalyzing && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-2xl border border-indigo-100/50 flex items-center gap-3 mb-6 shadow-sm">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-indigo-700 font-medium">正在结合全校数据生成分析报告...</span>
            </div>
          )}
          {analysisResult && !isAnalyzing && (
            <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4 rounded-2xl border border-indigo-100 shadow-sm text-sm text-slate-700 leading-relaxed relative group mb-6">
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={handleAnalyze} className="text-indigo-400 hover:text-indigo-600 p-1"><RefreshCw size={14} /></button>
              </div>
              <div dangerouslySetInnerHTML={{ __html: analysisResult }} />
            </div>
          )}
        </section>

        {/* Stats Overview */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
              <Activity size={14} />
            </div>
            整体统计
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatBox label="总评价数" value={aggregatedData.totalCount} color="blue" />
            <StatBox label="总分" value={aggregatedData.totalScore} color="purple" />
            <StatBox label="最高分" value={aggregatedData.maxScore} color="emerald" />
            <StatBox label="最低分" value={aggregatedData.minScore} color="amber" />
          </div>
          {nodeType === 'level3' && (
            <div className="mt-4 flex flex-wrap gap-2">
              {(selectedNode as Level3).normalizedScore !== null && (selectedNode as Level3).normalizedScore! < 40 && <span className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-100 text-xs rounded-full font-bold shadow-sm">低表现预警</span>}
              {aggregatedData.totalCount < 10 && <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 text-xs rounded-full font-bold shadow-sm">样本不足</span>}
              {aggregatedData.totalCount > 100 && <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs rounded-full font-bold shadow-sm">高关注度</span>}
            </div>
          )}
        </section>

        {/* Sub Items Compare (Only for L1 and L2) */}
        {nodeType !== 'level3' && (
          <section>
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-purple-50 text-purple-600 rounded-md">
                <List size={14} />
              </div>
              {nodeType === 'level1' ? '二级分类得分统计' : '三级指标得分统计'}
            </h3>
            <div className="h-56 bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
              <ReactECharts option={subItemsOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </section>
        )}

        {/* Class Compare */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <div className="p-1.5 bg-purple-50 text-purple-600 rounded-md">
                <BarChart2 size={14} />
              </div>
              各班级总分对比
            </h3>
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button onClick={() => setCompareSort('desc')} className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${compareSort === 'desc' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>从高到低</button>
              <button onClick={() => setCompareSort('asc')} className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${compareSort === 'asc' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>从低到高</button>
            </div>
          </div>
          <div className="h-56 bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
            <ReactECharts option={compareOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </section>

        {/* Trend Analysis */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <div className="p-1.5 bg-orange-50 text-orange-600 rounded-md">
              <TrendingUp size={14} />
            </div>
            得分趋势 <span className="text-xs font-medium text-slate-400 font-normal ml-1">(按周)</span>
          </h3>
          <div className="h-56 bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
            <ReactECharts option={trendOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </section>

        {/* Data Source Pie Chart */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
              <PieChart size={14} />
            </div>
            数据来源
          </h3>
          <div className="h-56 bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
            <ReactECharts option={sourceOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </section>

        {/* Actions */}
        <section className="mt-2 pb-8">
          <button
            onClick={onViewRecords}
            className="w-full py-3.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            查看详情
          </button>
        </section>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, className = '', color }: any) => {
  const colorStyles = {
    blue: 'border-slate-100 hover:border-blue-200 text-slate-800',
    purple: 'border-slate-100 hover:border-purple-200 text-slate-800',
    emerald: 'border-slate-100 hover:border-emerald-200 text-slate-800',
    amber: 'border-slate-100 hover:border-amber-200 text-slate-800',
  };

  return (
    <div 
      className={`bg-white rounded-xl p-4 flex flex-col justify-center transition-all shadow-sm border ${colorStyles[color as keyof typeof colorStyles]} ${className}`}
    >
      <div className="text-xs font-medium text-slate-500 mb-1.5">{label}</div>
      <div className={`text-2xl font-extrabold tracking-tight text-slate-800`}>{value}</div>
    </div>
  );
};
