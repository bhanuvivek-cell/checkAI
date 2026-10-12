import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  Search, 
  CheckCircle2, 
  Compass, 
  Layers, 
  TrendingUp, 
  HelpCircle, 
  AlertTriangle, 
  Scale, 
  CheckCheck, 
  Cpu 
} from 'lucide-react';
import { VerdictBadge } from '../components/VerdictBadge';
import { CategoryType, VerdictType } from '../types';

interface LandingPageProps {
  onStartAnalysis: (initialText?: string, category?: CategoryType) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartAnalysis }) => {
  const [quickInput, setQuickInput] = useState('');

  const samplePrompts = [
    {
      text: "Quitting college to launch an AI SaaS startup is a guaranteed path to financial independence.",
      category: "Risk Analysis" as CategoryType,
      expectedVerdict: "POTENTIALLY RISKY" as VerdictType,
    },
    {
      text: "Daily cardiovascular exercise improves metabolic health and reduces long-term mortality risk.",
      category: "Fact Check" as CategoryType,
      expectedVerdict: "SUPPORTED" as VerdictType,
    },
    {
      text: "The Earth is stationary and flat; all orbital satellite imagery is computer generated.",
      category: "Fact Check" as CategoryType,
      expectedVerdict: "CONTRADICTED" as VerdictType,
    },
    {
      text: "Remote work is universally superior to in-office work for every company and employee.",
      category: "General Assumption" as CategoryType,
      expectedVerdict: "CONTEXT DEPENDENT" as VerdictType,
    },
  ];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickInput.trim()) {
      onStartAnalysis(quickInput.trim());
    } else {
      onStartAnalysis();
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 gradient-glow pointer-events-none" />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16 text-center">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-brand-300 mb-8 shadow-sm">
          <Sparkles size={13} className="text-brand-400" />
          <span>Epistemic Critical Thinking Platform • University Project</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
          Question Your Assumptions.{' '}
          <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Discover Better Answers.
          </span>
        </h1>

        {/* Hero Tagline */}
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          "Don't just assume. Analyze, verify, and decide."
        </p>
        <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
          Uncover hidden premises, dissect logical fallacies, verify empirical claims, 
          and evaluate decision risks before committing irreversible resources.
        </p>

        {/* Interactive Analysis Input Preview */}
        <div className="mt-10 max-w-2xl mx-auto">
          <form 
            onSubmit={handleQuickSubmit}
            className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl focus-within:border-brand-500/60 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Enter any belief, claim, or decision (e.g. 'Dropping out to do crypto is smart')..."
              className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition-all shrink-0"
            >
              <span>Analyze Now</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Example Prompts */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="text-slate-400 font-medium">Try an example:</span>
            {samplePrompts.slice(0, 2).map((item, idx) => (
              <button
                key={idx}
                onClick={() => onStartAnalysis(item.text, item.category)}
                className="px-3 py-1 rounded-full bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 border border-slate-700 hover:border-slate-600 transition-colors truncate max-w-xs"
              >
                "{item.text.slice(0, 40)}..."
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Verdict Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            The Five Analytical Verdicts
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            The platform eschews naive black-and-white judgements. Claims and decisions are classified into five epistemically calibrated categories:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {(['SUPPORTED', 'CONTRADICTED', 'INSUFFICIENT EVIDENCE', 'CONTEXT DEPENDENT', 'POTENTIALLY RISKY'] as VerdictType[]).map((v) => (
            <div 
              key={v}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 card-hover-fx flex flex-col justify-between"
            >
              <div>
                <VerdictBadge verdict={v} size="md" />
                <div className="mt-3">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {v === 'SUPPORTED' && 'Empirically backed by verifiable consensus, documentation, or sound deductive proof.'}
                    {v === 'CONTRADICTED' && 'Directly refuted by scientific evidence, recorded historical data, or physical reality.'}
                    {v === 'INSUFFICIENT EVIDENCE' && 'Incomplete premise lacking verifiable parameters, testable definitions, or citations.'}
                    {v === 'CONTEXT DEPENDENT' && 'Subject to personal priorities, budgetary constraints, risk appetite, and local trade-offs.'}
                    {v === 'POTENTIALLY RISKY' && 'High downside asymmetry, irreversible opportunity cost, or lack of safety buffer.'}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
                Calibrated Rating
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Engineered for Deep Critical Thinking
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Moving beyond simple question-answering to provide structured epistemic scrutiny.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 card-hover-fx space-y-3">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
              <Layers size={22} />
            </div>
            <h3 className="text-lg font-semibold text-white">Assumption Extraction</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Isolates the subtle, unstated premises and cognitive leaps that form the fragile foundation of an argument.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 card-hover-fx space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Scale size={22} />
            </div>
            <h3 className="text-lg font-semibold text-white">Fallacy & Bias Detection</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Identifies Survivorship Bias, Sunk Cost Fallacy, False Dilemmas, and Hasty Generalizations in proposed reasoning.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 card-hover-fx space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Search size={22} />
            </div>
            <h3 className="text-lg font-semibold text-white">Empirical Verification</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Distinguishes facts from opinions and predictions. Grounded external citations without hallucinating phantom sources.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 card-hover-fx space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp size={22} />
            </div>
            <h3 className="text-lg font-semibold text-white">Actionable Decision Guidance</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Provides balanced advantage vs risk calculations, missing variables, recommended next steps, and robust alternatives.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How The Analytical Pipeline Operates
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            A transparent, multistage epistemological framework built for university-level rigor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {[
            {
              step: '01',
              title: 'Input Ingestion & Categorization',
              desc: 'Parses statement, intent, scope, and analytical category (Fact Check, Risk Analysis, Decision).',
            },
            {
              step: '02',
              title: 'Premise Decomposition',
              desc: 'Extracts explicit vs hidden assumptions and bifurcates empirical facts from speculative opinions.',
            },
            {
              step: '03',
              title: 'Epistemic & Risk Scrutiny',
              desc: 'Cross-checks logical validity against known cognitive fallacies and queries evidence search.',
            },
            {
              step: '04',
              title: 'Structured Decision Dashboard',
              desc: 'Synthesizes calibrated verdict, confidence rationale, downside risks, and reversible next steps.',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 relative">
              <span className="text-3xl font-mono font-extrabold text-brand-500/40">{item.step}</span>
              <h4 className="mt-2 text-base font-semibold text-white">{item.title}</h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl bg-gradient-to-r from-brand-950 via-slate-900 to-indigo-950 border border-brand-500/30 p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready to challenge your assumptions?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
              Start evaluating claims and decisions with systematic reasoning and calibrated verdicts.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onStartAnalysis()}
                className="px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-xl shadow-brand-600/30 transition-all flex items-center gap-2"
              >
                <span>Open Analysis Workspace</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
