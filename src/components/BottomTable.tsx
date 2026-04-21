import React, { useState, useMemo } from 'react';
import { EvaluationRecord, Level3 } from '../types';
import { ChevronUp, ChevronDown, Search, Download, Filter, ListOrdered } from 'lucide-react';

interface BottomTableProps {
  records: EvaluationRecord[];
  indicator: Level3 | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const BottomTable: React.FC<BottomTableProps> = ({ records, indicator, isOpen, setIsOpen }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof EvaluationRecord; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredRecords = useMemo(() => {
    let filtered = records;
    if (indicator) {
      filtered = filtered.filter(r => r.indicatorId === indicator.id);
    }
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.targetName.includes(searchTerm) || 
        r.className.includes(searchTerm) || 
        r.evaluator.includes(searchTerm)
      );
    }
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return filtered;
  }, [records, indicator, searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const currentData = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const requestSort = (key: keyof EvaluationRecord) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <>
      {/* Toggle Button */}
      {indicator && (
        <div 
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-full px-6 py-2.5 flex items-center justify-center cursor-pointer hover:bg-white hover:shadow-lg transition-all duration-500 z-20 shadow-md group ${isOpen ? 'opacity-0 pointer-events-none translate-y-10' : 'opacity-100 translate-y-0'}`}
          onClick={() => setIsOpen(true)}
        >
          <div className="flex items-center gap-2 text-sm text-slate-700 font-bold tracking-wide">
            <ListOrdered size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
            查看评价记录明细 <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md ml-1">{indicator.name}</span>
            <ChevronUp size={16} className="text-slate-400 ml-1 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      )}

      {/* Drawer */}
      <div className={`absolute bottom-0 left-0 right-0 h-96 bg-white/95 backdrop-blur-xl border-t border-slate-200/60 flex flex-col z-30 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] rounded-t-3xl overflow-hidden ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white/50">
        <div className="flex items-center gap-4">
          <h3 className="font-extrabold text-slate-800 flex items-center gap-2 text-lg tracking-tight">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <ListOrdered size={18} />
            </div>
            评价记录明细
            {indicator && <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg ml-2 border border-blue-100 shadow-sm">{indicator.name}</span>}
          </h3>
          <div className="relative group ml-4">
            <Search className="absolute left-3 top-2.5 text-slate-400 group-hover:text-blue-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="搜索对象、班级或评价人..."
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all shadow-sm focus:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-4 py-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-full text-sm transition-all border border-slate-200 hover:border-blue-200 bg-white shadow-sm font-medium">
            <Download size={16} /> 导出数据
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors bg-white border border-slate-200 shadow-sm">
            <ChevronDown size={20} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-slate-50/30">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold tracking-wider cursor-pointer hover:text-blue-600 transition-colors" onClick={() => requestSort('evaluateTime')}>
                <div className="flex items-center gap-1">评价时间 {sortConfig?.key === 'evaluateTime' && <span className="text-blue-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}</div>
              </th>
              <th className="px-6 py-4 font-bold tracking-wider cursor-pointer hover:text-blue-600 transition-colors" onClick={() => requestSort('targetName')}>
                <div className="flex items-center gap-1">评价对象 {sortConfig?.key === 'targetName' && <span className="text-blue-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}</div>
              </th>
              <th className="px-6 py-4 font-bold tracking-wider">对象类型</th>
              <th className="px-6 py-4 font-bold tracking-wider cursor-pointer hover:text-blue-600 transition-colors" onClick={() => requestSort('className')}>
                <div className="flex items-center gap-1">所属班级 {sortConfig?.key === 'className' && <span className="text-blue-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}</div>
              </th>
              <th className="px-6 py-4 font-bold tracking-wider cursor-pointer hover:text-blue-600 transition-colors" onClick={() => requestSort('score')}>
                <div className="flex items-center gap-1">得分 {sortConfig?.key === 'score' && <span className="text-blue-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}</div>
              </th>
              <th className="px-6 py-4 font-bold tracking-wider">数据来源</th>
              <th className="px-6 py-4 font-bold tracking-wider">评价人</th>
              <th className="px-6 py-4 font-bold tracking-wider">备注</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {currentData.length > 0 ? (
              currentData.map((record) => (
                <tr key={record.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-3.5 whitespace-nowrap text-slate-500 font-medium">{record.evaluateTime}</td>
                  <td className="px-6 py-3.5 font-bold text-slate-800">{record.targetName}</td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold shadow-sm border ${
                      record.targetType === 'student' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      record.targetType === 'class' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                      'bg-teal-50 text-teal-700 border-teal-100'
                    }`}>
                      {record.targetType === 'student' ? '学生' : record.targetType === 'class' ? '班级' : '宿舍'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-600 font-medium">{record.className}</td>
                  <td className="px-6 py-3.5 font-extrabold text-slate-800 text-base">{record.score}</td>
                  <td className="px-6 py-3.5"><span className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-md text-xs border border-slate-200 font-medium shadow-sm">{record.source}</span></td>
                  <td className="px-6 py-3.5 text-slate-700 font-medium">{record.evaluator}</td>
                  <td className="px-6 py-3.5 text-slate-500 truncate max-w-[250px]" title={record.remark}>{record.remark}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-medium">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search size={32} className="text-slate-300 mb-2" />
                    暂无符合条件的评价记录
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white text-sm text-slate-600">
        <div className="font-medium">
          共 <span className="font-bold text-slate-800 text-base mx-1">{filteredRecords.length}</span> 条记录
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
          >
            上一页
          </button>
          <div className="px-4 py-1.5 bg-slate-50 rounded-lg border border-slate-100 font-medium text-slate-700">
            <span className="text-blue-600 font-bold">{currentPage}</span> / {Math.max(1, totalPages)}
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
          >
            下一页
          </button>
        </div>
      </div>
      </div>
    </>
  );
};
