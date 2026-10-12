import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  RotateCcw, 
  Copy, 
  Check, 
  Search, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  HelpCircle, 
  Compass, 
  ArrowRight, 
  Cpu, 
  Scale, 
  ShieldCheck, 
  ThumbsUp, 
  ThumbsDown,
  Loader2
} from 'lucide-react';
import { api, ApiError } from '../services/api';
import { 
  AnalysisResponse, 
  CategoryType, 
  VerdictType 
} from '../types';
import { VerdictBadge } from '../components/VerdictBadge';
import { FollowUpChat } from '../components/FollowUpChat';

interface AnalyzePageProps {
  initialText?: string;
  initialCategory?: CategoryType;
  onClearInitial?: () => void;
}

const CATEGORIES: { id: CategoryType; label: string; desc: string }[] = [
  { id: 'General Assumption', label: 'General Assumption', desc: 'Everyday beliefs, cultural premises, or implicit rules' },
  { id: 'Fact Check', label: 'Fact Check', desc: 'Verifiable empirical, scientific, or historical claims' },
  { id: 'Personal Decision', label: 'Personal Decision', desc: 'Career, lifestyle, financial, or relationship choices' },
  { id: 'Logical Fallacy', label: 'Logical Fallacy', desc: 'Examining argument structure, deductions, and bias' },
  { id: 'Risk Analysis', label: 'Risk Analysis', desc: 'Downside consequences, investments, or high-stakes actions' },
];

const PRESET_PROMPTS = [
  {
    category: 'Risk Analysis' as CategoryType,
    text: "I should drop out of college and put all my savings into an unverified crypto trading scheme to achieve financial freedom fast.",
  },
  {
    category: 'Fact Check' as CategoryType,
    text: "Daily cardiovascular exercise significantly improves metabolic health and reduces cardiovascular disease risk.",
  },
  {
    category: 'Fact Check' as CategoryType,
    text: "The Earth is flat and all satellite images and orbital physics are fabricated conspiracies.",
  },
  {
    category: 'General Assumption' as CategoryType,
    text: "Remote work is universally superior to in-office work for every team and every business model.",
  },
  {
    category: 'Personal Decision' as CategoryType,
    text: "Opening a boutique artisan coffee shop in my hometown is guaranteed to be profitable because everyone loves coffee.",
  },
];

export const AnalyzePage: React.FC<AnalyzePageProps> = ({ 
  initialText = '', 
  initialCategory = 'General Assumption',
  onClearInitial
}) => {
  const [inputText, setInputText] = useState(initialText);
  const [category, setCategory] = useState<CategoryType>(initialCategory);
  const [searchEnabled, setSearchEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
    }
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialText, initialCategory]);

  // Loading animation step progression
  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
      }, 1200);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const loadingStepsText = [
    "Parsing input and isolating core claim...",
    "Extracting hidden assumptions and separating facts from opinions...",
    "Auditing logical validity, cognitive fallacies, and empirical boundaries...",
    "Calibrating verdict, estimating confidence score, and synthesizing alternatives..."
  ];

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || trimmed.length < 5) {
      setError("Please provide a statement or decision of at least 5 characters.");
      return;
    }
    if (trimmed.length > 5000) {
      setError("Input is too long. Please restrict statement to 5,000 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.analyze(trimmed, category, searchEnabled);
      setResult(response);
      window.scrollTo({ top: 380, behavior: 'smooth' });
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResults = () => {
    if (!result) return;
    const textToCopy = `
# ASSUMPTION CHECK AI ANALYSIS
Input: "${result.original_input}"
Category: ${result.category}
Verdict: ${result.verdict}
Confidence: ${result.confidence.score}/100 (${result.confidence.rating})
Summary: ${result.summary}

## Main Claim
${result.main_claim}

## Verdict Explanation
${result.verdict_explanation}

## Assumptions Detected
${result.detected_assumptions.map(a => `- ${a}`).join('\n')}

## Logical Issues
${result.logical_issues.map(l => `- ${l}`).join('\n')}

## Recommended Next Step
${result.recommended_next_step}

## Alternative Approach
${result.alternative_approach}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReset = () => {
    setResult(null);
    setInputText('');
    setError(null);
    if (onClearInitial) onClearInitial();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-brand-300">
          <Sparkles size={13} className="text-brand-400" />
          <span>Intelligent Analytical Workspace</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Analyze Any Premise, Claim, or Decision
        </h1>
        <p className="text-sm text-slate-400">
          Input your hypothesis, business idea, life choice, or factual claim below for structured critical evaluation.
        </p>
      </div>

      {/* Input Workspace Box */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Category Selector Tabs */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            1. Select Analytical Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  category === cat.id
                    ? 'bg-brand-600/20 border-brand-500 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-xs text-white">{cat.label}</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{cat.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              2. Enter Statement, Plan, or Argument
            </label>
            <span className="text-[11px] font-mono text-slate-500">
              {inputText.length} / 5,000 characters
            </span>
          </div>
          <div className="relative">
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. 'Starting an AI startup with no coding knowledge will make me wealthy in 6 months', or 'Remote work destroys company culture'..."
              disabled={loading}
              className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 text-sm sm:text-base text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-y min-h-[120px]"
            />
            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="absolute right-3 top-3 text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Preset Prompt Chips */}
        <div>
          <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
            <Compass size={14} className="text-brand-400" />
            <span>Or load an illustrative university test case:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputText(prompt.text);
                  setCategory(prompt.category);
                }}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/80 hover:border-brand-500/50 transition-colors text-left truncate max-w-sm"
              >
                <span className="text-brand-400 font-medium">[{prompt.category}]</span> {prompt.text.slice(0, 42)}...
              </button>
            ))}
          </div>
        </div>

        {/* Options & Action Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 select-none">
            <input
              type="checkbox"
              checked={searchEnabled}
              onChange={(e) => setSearchEnabled(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-brand-600 focus:ring-brand-500"
            />
            <span className="flex items-center gap-1">
              <Search size={13} className="text-slate-400" />
              Enable Verifiable Source Retrieval (if configured)
            </span>
          </label>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {result && (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw size={14} />
                <span>Start New</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || !inputText.trim()}
              className="flex-1 sm:flex-initial px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-brand-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Evaluating Premise...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Run Assumption Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
            <AlertTriangle size={18} className="shrink-0 mt-0.5 text-rose-400" />
            <div>
              <p className="font-semibold">Analysis Error</p>
              <p className="text-xs text-rose-300/90 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Loading Steps Indicator */}
      {loading && (
        <div className="rounded-2xl bg-slate-900/90 border border-brand-500/30 p-8 shadow-2xl text-center space-y-6 animate-pulse">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-brand-600/20 flex items-center justify-center text-brand-400 animate-spin">
                <Cpu size={32} />
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Critical Analysis in Progress</h3>
            <p className="text-xs font-mono text-brand-300 mt-2">
              {loadingStepsText[loadingStep]}
            </p>
          </div>
          {/* Progress bar */}
          <div className="w-full max-w-md mx-auto bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-brand-500 h-full transition-all duration-700 ease-out"
              style={{ width: `${(loadingStep + 1) * 25}%` }}
            />
          </div>
        </div>
      )}

      {/* Result Dashboard */}
      {result && !loading && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Banner: Verdict & Actions */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-slate-500">
                  ASSESSMENT VERDICT
                </span>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <VerdictBadge verdict={result.verdict} size="lg" />
                  <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Category: {result.category}
                  </span>
                  {result.is_demo_mode ? (
                    <span className="text-xs px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Heuristic Engine (Demo)
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Live AI Reasoning
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyResults}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Full Report</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-brand-600/20"
                >
                  <RotateCcw size={14} />
                  <span>New Analysis</span>
                </button>
              </div>
            </div>

            {/* Verdict Explanation & Confidence Meter */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Verdict Explanation */}
              <div className="lg:col-span-2 space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Verdict Explanation
                </h3>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  {result.verdict_explanation}
                </p>
              </div>

              {/* Confidence Metric Box */}
              <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Reasoning Firmness
                    </span>
                    <span className="text-xs font-mono font-bold text-brand-400">
                      {result.confidence.rating}
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">
                      {result.confidence.score}
                    </span>
                    <span className="text-xs text-slate-500">/ 100 Index</span>
                  </div>
                  {/* Gauge bar */}
                  <div className="mt-2 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-brand-500 to-indigo-400 h-full rounded-full"
                      style={{ width: `${result.confidence.score}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/60">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Metric Basis:</span>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {result.confidence.basis}
                  </p>
                </div>
              </div>
            </div>

            {/* Original Input & Main Claim */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Original Input
                </span>
                <p className="text-xs text-slate-300 italic">"{result.original_input}"</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Main Claim Identified
                </span>
                <p className="text-xs text-slate-200 font-medium">{result.main_claim}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Assumptions & Logical Issues */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Detected Assumptions */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Detected Assumptions</h3>
                  <p className="text-xs text-slate-400">Explicit and hidden premises identified beneath the statement.</p>
                </div>
              </div>

              <ul className="space-y-2.5">
                {result.detected_assumptions.map((item, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs sm:text-sm text-slate-300 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Logical Issues & Cognitive Biases */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                  <Scale size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Logical Issues & Cognitive Biases</h3>
                  <p className="text-xs text-slate-400">Flaws in deduction, overgeneralizations, or cognitive traps.</p>
                </div>
              </div>

              <ul className="space-y-2.5">
                {result.logical_issues.map((issue, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs sm:text-sm text-slate-300 flex items-start gap-2.5">
                    <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 3: Facts vs Opinions vs Predictions Breakdown */}
          {result.facts_and_opinions && result.facts_and_opinions.length > 0 && (
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-4 shadow-xl">
              <div>
                <h3 className="text-base font-semibold text-white">Epistemic Decomposition: Facts vs Opinions</h3>
                <p className="text-xs text-slate-400">Separating verified empirical reality from subjective preference.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.facts_and_opinions.map((fo, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        fo.type === 'fact' 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : fo.type === 'opinion' 
                          ? 'bg-purple-500/20 text-purple-300' 
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {fo.type}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-200">"{fo.statement}"</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{fo.assessment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Advantages vs Potential Risks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Advantages */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <ThumbsUp size={18} />
                </div>
                <h3 className="text-base font-semibold text-white">Potential Advantages & Upside</h3>
              </div>
              <ul className="space-y-2">
                {result.potential_advantages.map((adv, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Disadvantages and Risks */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                  <ThumbsDown size={18} />
                </div>
                <h3 className="text-base font-semibold text-white">Potential Disadvantages & Downside Risks</h3>
              </div>
              <ul className="space-y-2">
                {result.potential_risks.map((risk, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
                    <AlertTriangle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 5: Actionable Decision Guidance (Next Step & Alternative) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recommended Next Step */}
            <div className="rounded-2xl bg-gradient-to-br from-brand-950/60 to-slate-900 border border-brand-500/30 p-6 space-y-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-300 flex items-center gap-1.5">
                <Sparkles size={13} /> Recommended Immediate Next Step
              </span>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {result.recommended_next_step}
              </p>
            </div>

            {/* Alternative Approach */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 p-6 space-y-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Compass size={13} /> Calibrated Alternative Approach
              </span>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {result.alternative_approach}
              </p>
            </div>
          </div>

          {/* Missing Information & Epistemic Uncertainty */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <HelpCircle size={15} className="text-brand-400" />
              <span>Missing Context & Critical Unknowns</span>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
              {result.missing_information.map((item, idx) => (
                <li key={idx} className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
                  • {item}
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t border-slate-800/60 text-[11px] text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-400">Limitations & Uncertainty: </span>
              {result.limitations_and_uncertainty}
            </div>
          </div>

          {/* Interactive Follow-Up Component */}
          {result.id && (
            <FollowUpChat 
              analysisId={result.id} 
              initialQuestions={result.follow_up_questions} 
            />
          )}
        </div>
      )}
    </div>
  );
};
