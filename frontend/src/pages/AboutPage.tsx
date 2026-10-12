import React from 'react';
import { 
  ShieldCheck, 
  Brain, 
  Scale, 
  Cpu, 
  Database, 
  Layers, 
  FileCode, 
  GraduationCap, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen 
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-brand-300">
          <GraduationCap size={14} className="text-brand-400" />
          <span>University Capstone & Viva Documentation</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          About Assumption Check AI
        </h1>
        <p className="text-base text-slate-300 leading-relaxed">
          An epistemic decision-analysis system designed to instill rigorous critical-thinking habits in the age of generative certainty.
        </p>
      </div>

      {/* Motto Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-950 via-slate-900 to-indigo-950 border border-brand-500/30 text-center">
        <span className="text-xs uppercase tracking-widest font-mono text-brand-400">FOUNDATIONAL PRINCIPLE</span>
        <blockquote className="mt-2 text-xl font-bold text-white italic">
          "Don't just assume. Analyze, verify, and decide."
        </blockquote>
      </div>

      {/* 1. What Assumption Check AI Does */}
      <section className="rounded-3xl bg-slate-900/60 border border-slate-800 p-8 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
            <Brain size={22} />
          </div>
          <h2 className="text-xl font-bold text-white">What the Platform Does</h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Most modern chat interfaces act as eager sycophants—confirming whatever hypothesis the user presents or giving superficial bulleted lists. 
          <strong> Assumption Check AI</strong> is explicitly engineered to act as an impartial critical auditor.
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          When presented with any statement, business hypothesis, claim, or proposed action, it decomposes the argument into foundational axioms, 
          identifies cognitive fallacies, evaluates risk asymmetry, questions empirical verifiability, and issues one of five calibrated verdicts.
        </p>
      </section>

      {/* 2. Why Critical Thinking Matters */}
      <section className="rounded-3xl bg-slate-900/60 border border-slate-800 p-8 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Scale size={22} />
          </div>
          <h2 className="text-xl font-bold text-white">Why Critical Thinking Matters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <h3 className="text-sm font-semibold text-white">Combating Cognitive Blindspots</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Humans naturally fall victim to Confirmation Bias, Survivorship Bias, and the Sunk Cost Fallacy when making major life or business decisions.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <h3 className="text-sm font-semibold text-white">Downside Risk Asymmetry</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Believing a false factual claim may be harmless, but committing irreversible capital or life stability to an untested assumption can be catastrophic.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <h3 className="text-sm font-semibold text-white">Epistemic Humility</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Acknowledging what is verified, what remains conditional, and what is currently unknown prevents naive overconfidence.
            </p>
          </div>
        </div>
      </section>

      {/* 3. The 5 Verdict Categories Definition */}
      <section className="rounded-3xl bg-slate-900/60 border border-slate-800 p-8 space-y-6">
        <h2 className="text-xl font-bold text-white">The Five Calibrated Verdicts</h2>
        <div className="space-y-3">
          {[
            {
              verdict: 'SUPPORTED',
              meaning: 'Available empirical evidence or formal logical derivation corroborates the premise.',
              criteria: 'Consensus from primary scientific sources, mathematical proofs, or verified documentation.',
            },
            {
              verdict: 'CONTRADICTED',
              meaning: 'Reliable evidence directly conflicts with or refutes the claim.',
              criteria: 'Empirical data or physical observation conclusively contradicts the stated premise.',
            },
            {
              verdict: 'INSUFFICIENT EVIDENCE',
              meaning: 'Not enough verifiable information is available to confirm or deny the premise.',
              criteria: 'Premise is underspecified, lacks testable metrics, or addresses currently unknowable factors.',
            },
            {
              verdict: 'CONTEXT DEPENDENT',
              meaning: 'The valid conclusion depends on individual constraints, goals, trade-offs, or circumstances.',
              criteria: 'No single universal answer exists; depends on budget, time horizon, and risk tolerance.',
            },
            {
              verdict: 'POTENTIALLY RISKY',
              meaning: 'The proposed action creates severe downside exposure, irreversible cost, or safety hazards.',
              criteria: 'Unhedged commitments, speculative bets without margin of safety, or high regret probability.',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="font-mono text-xs font-bold text-brand-300">{item.verdict}</span>
                <p className="text-xs text-slate-300 font-medium">{item.meaning}</p>
                <p className="text-[11px] text-slate-500 italic">Criteria: {item.criteria}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Technology Stack & Architectural Design */}
      <section className="rounded-3xl bg-slate-900/60 border border-slate-800 p-8 space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Cpu size={22} />
          </div>
          <h2 className="text-xl font-bold text-white">Technology Stack & System Architecture</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-brand-400 text-sm font-semibold">
              <FileCode size={18} />
              <span>Backend Architecture</span>
            </div>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li><strong>Python 3.12 + FastAPI:</strong> High performance asynchronous REST API.</li>
              <li><strong>Pydantic v2:</strong> Strict request/response validation and data contracts.</li>
              <li><strong>SQLAlchemy 2.0 (Async):</strong> Modern ORM with async session management.</li>
              <li><strong>SQLite + PostgreSQL-Ready:</strong> Local aiosqlite development, seamless PostgreSQL migration.</li>
              <li><strong>OpenAI LLM Integration:</strong> Configurable model (GPT-4o / GPT-4o-mini) with structured output format.</li>
              <li><strong>Dual-Mode AI Engine:</strong> Live LLM or fallback deterministic analytical heuristic engine.</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold">
              <Layers size={18} />
              <span>Frontend Architecture</span>
            </div>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li><strong>React 18 + TypeScript:</strong> Type-safe component architecture.</li>
              <li><strong>Vite:</strong> Ultra-fast developer tooling and optimized production bundling.</li>
              <li><strong>Tailwind CSS:</strong> Polished dark-navy bespoke aesthetic, glowing accents, and micro-interactions.</li>
              <li><strong>Lucide Icons:</strong> Consistent, clean iconography throughout the UI.</li>
              <li><strong>Adaptive State Management:</strong> Instant client-side tab switching with persistent API sync.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Limitations & Responsible AI Disclaimer */}
      <section className="rounded-3xl bg-slate-900/60 border border-slate-800 p-8 space-y-4">
        <div className="flex items-center gap-2 text-rose-400">
          <AlertTriangle size={20} />
          <h2 className="text-lg font-bold text-white">Limitations and Responsible Use</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          AI models generate evaluations based on statistical correlations and reasoning patterns. 
          While Assumption Check AI minimizes hallucinations and grounds analysis in structured epistemic criteria:
        </p>
        <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
          <li>Never use this system as a substitute for certified medical diagnosis, licensed legal counsel, or professional fiduciary investment management.</li>
          <li>Real-world decisions involve non-computable subjective values, interpersonal trust, and unique emotional constraints.</li>
          <li>Always verify high-stakes empirical assertions using primary source documentation.</li>
        </ul>
      </section>
    </div>
  );
};
