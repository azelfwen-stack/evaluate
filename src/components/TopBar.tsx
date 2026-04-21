import React from 'react';
import { FilterState, Level1, Level2, Level3 } from '../types';
import { RefreshCw, Search, AlertTriangle, Activity } from 'lucide-react';

interface TopBarProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  level1Data: Level1[];
  level2Data: Level2[];
  level3Data: Level3[];
  onApply: () => void;
  onReset: () => void;
  onHighlightLowScore: () => void;
  onHighlightHighFreq: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  filter,
  setFilter,
  level1Data,
  level2Data,
  level3Data,
  onApply,
  onReset,
  onHighlightLowScore,
  onHighlightHighFreq,
}) => {
  const totalRecords = level3Data.reduce((acc, curr) => acc + curr.totalCount, 0);
  const lowScoreCount = level3Data.filter(l => l.normalizedScore !== null && l.normalizedScore < 40).length;
  const highFreqCount = level3Data.filter(l => l.totalCount > 100).length;

  return (
    <div className="relative px-8 py-6 flex flex-col gap-6 border-b border-indigo-100/80 z-10 bg-gradient-to-br from-indigo-50/95 via-white/95 to-blue-50/95 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-60" style={{ backgroundImage: 'linear-gradient(rgba(79, 70, 229, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(79, 70, 229, 0.06) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/60 to-transparent pointer-events-none"></div>
      
      {/* Filters */}
      <div className="relative z-10 flex flex-wrap items-center gap-3 text-sm">
        <select
          className="bg-white border border-slate-200 rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-slate-700 font-medium shadow-sm hover:border-slate-300 transition-colors"
          value={filter.semester}
          onChange={(e) => setFilter({ ...filter, semester: e.target.value })}
        >
          <option value="">全部学期</option>
          <option value="2025-2026-1">2025-2026 第一学期</option>
          <option value="2025-2026-2">2025-2026 第二学期</option>
        </select>

        <select
          className="bg-white border border-slate-200 rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-slate-700 font-medium shadow-sm hover:border-slate-300 transition-colors"
          value={filter.level1Id}
          onChange={(e) => setFilter({ ...filter, level1Id: e.target.value, level2Id: '' })}
        >
          <option value="">全部一级分类</option>
          {level1Data.map(l1 => (
            <option key={l1.id} value={l1.id}>{l1.name}</option>
          ))}
        </select>

        {filter.level1Id && (
          <select
            className="bg-white border border-slate-200 rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-slate-700 font-medium shadow-sm hover:border-slate-300 transition-colors"
            value={filter.level2Id}
            onChange={(e) => setFilter({ ...filter, level2Id: e.target.value })}
          >
            <option value="">全部二级分类</option>
            {level2Data.filter(l2 => l2.parentId === filter.level1Id).map(l2 => (
              <option key={l2.id} value={l2.id}>{l2.name}</option>
            ))}
          </select>
        )}

        {/* Search moved here */}
        <div className="relative group ml-2 w-64">
          <input
            type="text"
            placeholder="搜索指标或分类..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all shadow-sm group-hover:border-slate-300"
            value={filter.searchText || ''}
            onChange={(e) => setFilter({ ...filter, searchText: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && onApply()}
          />
          <Search className="absolute left-3.5 top-2.5 text-slate-400 group-hover:text-blue-500 transition-colors" size={14} />
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-5 py-2 text-slate-600 bg-white hover:bg-slate-50 rounded-full border border-slate-200 shadow-sm transition-all font-medium hover:shadow"
          >
            <RefreshCw size={14} /> 重置
          </button>
          <button
            onClick={onApply}
            className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 rounded-full shadow-md shadow-blue-500/20 transition-all font-medium hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5"
          >
            <Search size={14} /> 应用筛选
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="relative z-10 grid grid-cols-6 gap-5">
        <StatCard title="一级分类" value={level1Data.length} unit="个" />
        <StatCard title="二级分类" value={level2Data.length} unit="个" />
        <StatCard title="三级指标" value={level3Data.length} unit="项" />
        <StatCard title="评价记录总数" value={totalRecords} unit="条" />
        <StatCard
          title="低分预警指标"
          value={lowScoreCount}
          unit="项"
          icon={<AlertTriangle size={16} className="text-rose-500" />}
          onClick={onHighlightLowScore}
          className="cursor-pointer hover:ring-2 hover:ring-rose-400/50"
          valueColor="text-rose-600"
        />
        <StatCard
          title="高频指标"
          value={highFreqCount}
          unit="项"
          icon={<Activity size={16} className="text-amber-500" />}
          onClick={onHighlightHighFreq}
          className="cursor-pointer hover:ring-2 hover:ring-amber-400/50"
          valueColor="text-amber-600"
        />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, unit, icon, onClick, className = '', valueColor = 'text-slate-800' }: any) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 flex flex-col justify-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 transition-all duration-300 relative overflow-hidden group ${onClick ? 'hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] cursor-pointer' : ''} ${className}`}
    >
      <div className="text-sm font-bold text-slate-500 flex items-center gap-1.5 mb-2 z-10">
        {title}
        {icon}
      </div>
      <div className="flex items-baseline gap-1 z-10">
        <div className={`text-2xl font-extrabold tracking-tight ${valueColor}`}>{value}</div>
        {unit && <div className="text-xs font-semibold text-slate-400 ml-0.5">{unit}</div>}
      </div>

      {/* Decorative background element */}
      <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
    </div>
  );
};
