import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  RotateCcw, 
  Eye, 
  Filter, 
  Calendar, 
  Sparkles, 
  ArrowUpRight, 
  AlertTriangle, 
  Check, 
  X,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { api, ApiError } from '../services/api';
import { HistoryItem, AnalysisResponse, VerdictType, CategoryType } from '../types';
import { VerdictBadge } from '../components/VerdictBadge';

interface HistoryPageProps {
  onReopenAnalysis: (text: string, category: CategoryType) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onReopenAnalysis }) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVerdict, setSelectedVerdict] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDetail, setSelectedDetail] = useState<AnalysisResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [clearAllConfirm, setClearAllConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await api.getHistory({
        category: selectedCategory || undefined,
        verdict: selectedVerdict || undefined,
        search: searchTerm || undefined,
      });
      setHistoryItems(items);
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : 'Failed to retrieve analysis history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedCategory, selectedVerdict]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleOpenDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const detail = await api.getHistoryDetail(id);
      setSelectedDetail(detail);
    } catch (err: any) {
      setError('Could not load analysis details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await api.deleteHistoryItem(id);
      setHistoryItems((prev) => prev.filter((item) => item.id !== id));
      setDeleteConfirmId(null);
      if (selectedDetail?.id === id) {
        setSelectedDetail(null);
      }
    } catch (err: any) {
      setError('Failed to delete history record.');
    }
  };

  const handleClearAll = async () => {
    try {
      await api.clearAllHistory();
      setHistoryItems([]);
      setClearAllConfirm(false);
      setSelectedDetail(null);
    } catch (err: any) {
      setError('Failed to clear history.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Clear All */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-brand-300 mb-2">
            <Sparkles size={13} className="text-brand-400" />
            <span>Persistent Database Records</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Analysis History</h1>
          <p className="text-sm text-slate-400 mt-1">
            Review past evaluations, revisit verdicts, and query previous reasoning.
          </p>
        </div>

        {historyItems.length > 0 && (
          <div>
            {clearAllConfirm ? (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <span className="text-xs text-rose-300 font-medium">Clear all records?</span>
                <button
                  onClick={handleClearAll}
                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                >
                  Yes, Clear
                </button>
                <button
                  onClick={() => setClearAllConfirm(false)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setClearAllConfirm(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={14} />
                <span>Clear All History</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search inputs or conclusions in database..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
          <Search size={16} className="absolute left-3.5 top-3 text-slate-500" />
        </form>

        {/* Verdict Filter */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          <Filter size={14} className="text-slate-500 shrink-0" />
          <select
            value={selectedVerdict}
            onChange={(e) => setSelectedVerdict(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 w-full sm:w-auto"
          >
            <option value="">All Verdicts</option>
            <option value="SUPPORTED">Supported</option>
            <option value="CONTRADICTED">Contradicted</option>
            <option value="INSUFFICIENT EVIDENCE">Insufficient Evidence</option>
            <option value="CONTEXT DEPENDENT">Context Dependent</option>
            <option value="POTENTIALLY RISKY">Potentially Risky</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 w-full sm:w-auto"
          >
            <option value="">All Categories</option>
            <option value="General Assumption">General Assumption</option>
            <option value="Fact Check">Fact Check</option>
            <option value="Personal Decision">Personal Decision</option>
            <option value="Logical Fallacy">Logical Fallacy</option>
            <option value="Risk Analysis">Risk Analysis</option>
          </select>
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 size={32} className="animate-spin text-brand-400 mx-auto" />
          <p className="text-xs text-slate-400">Loading analysis records from database...</p>
        </div>
      ) : historyItems.length === 0 ? (
        /* Empty State */
        <div className="py-20 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-500 mx-auto">
            <FolderOpen size={28} />
          </div>
          <h3 className="text-lg font-semibold text-white">No Analysis Records Found</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            {searchTerm || selectedVerdict || selectedCategory 
              ? "No saved analyses match your search criteria. Try resetting the filters."
              : "You haven't run any assumption analyses yet. Launch the workspace to evaluate your first premise."}
          </p>
          {(searchTerm || selectedVerdict || selectedCategory) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedVerdict('');
                setSelectedCategory('');
                fetchHistory();
              }}
              className="text-xs px-4 py-2 rounded-lg bg-slate-800 text-brand-300 hover:bg-slate-700 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        /* History Items List */
        <div className="space-y-3">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 card-hover-fx"
            >
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <VerdictBadge verdict={item.verdict} size="sm" />
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <Calendar size={12} />
                    {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white line-clamp-1">
                  "{item.original_input}"
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  onClick={() => handleOpenDetail(item.id)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Eye size={14} />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => onReopenAnalysis(item.original_input, item.category)}
                  className="px-3 py-2 rounded-xl bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw size={14} />
                  <span>Reopen</span>
                </button>

                {deleteConfirmId === item.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs"
                      title="Confirm delete"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
                      title="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(item.id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal / Drawer */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-3xl w-full rounded-3xl bg-navy-950 border border-slate-700 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto my-8">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono uppercase text-slate-500">SAVED ANALYSIS RECORD #{selectedDetail.id}</span>
                <div className="mt-1 flex items-center gap-2">
                  <VerdictBadge verdict={selectedDetail.verdict} size="md" />
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {selectedDetail.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-semibold uppercase text-slate-400">Statement:</span>
                <p className="text-sm text-slate-200 mt-1 italic">"{selectedDetail.original_input}"</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-400 mb-1">Verdict Explanation</h4>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  {selectedDetail.verdict_explanation}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">Detected Assumptions</h4>
                <ul className="space-y-1.5">
                  {selectedDetail.detected_assumptions.map((ass, idx) => (
                    <li key={idx} className="text-xs text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80">
                      • {ass}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-brand-950/40 border border-brand-500/20">
                  <span className="text-[11px] font-bold text-brand-300">Recommended Next Step:</span>
                  <p className="text-xs text-slate-200 mt-1">{selectedDetail.recommended_next_step}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20">
                  <span className="text-[11px] font-bold text-indigo-300">Alternative Approach:</span>
                  <p className="text-xs text-slate-200 mt-1">{selectedDetail.alternative_approach}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  onReopenAnalysis(selectedDetail.original_input, selectedDetail.category);
                  setSelectedDetail(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-2"
              >
                <RotateCcw size={14} />
                <span>Open in Workspace</span>
              </button>
              <button
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
