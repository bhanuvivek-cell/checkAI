import React from 'react';
import { ShieldCheck, Brain, Sparkles, Scale, GraduationCap } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: 'landing' | 'analyze' | 'history' | 'about') => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-navy-950/90 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Description */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <ShieldCheck size={18} />
            </div>
            <span className="font-bold text-white text-base tracking-tight">ASSUMPTION CHECK AI</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-md">
            An intelligent decision-analysis and critical-thinking platform engineered to evaluate implicit assumptions, 
            detect cognitive fallacies, verify empirical claims, and calculate actionable risk parameters.
          </p>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            <span className="text-brand-400 font-semibold font-mono">CORE MOTTO: </span>
            <span className="italic">"Don't just assume. Analyze, verify, and decide."</span>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase font-bold tracking-wider text-slate-200">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <button 
                onClick={() => { setActiveTab('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                className="hover:text-brand-400 transition-colors"
              >
                Platform Overview
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setActiveTab('analyze'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                className="hover:text-brand-400 transition-colors"
              >
                Analytical Workspace
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setActiveTab('history'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                className="hover:text-brand-400 transition-colors"
              >
                Analysis History
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setActiveTab('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                className="hover:text-brand-400 transition-colors"
              >
                Project Methodology & Architecture
              </button>
            </li>
          </ul>
        </div>

        {/* Academic / Ethical Disclaimer */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-slate-200">
            <GraduationCap size={15} className="text-brand-400" />
            <span>Academic Project</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Engineered as a full-stack university capstone project showcasing modern AI architecture, 
            Pydantic validation, relational persistence, and epistemological reasoning.
          </p>
          <div className="text-[11px] text-slate-500 border-t border-slate-800/60 pt-2">
            AI recommendations do not constitute legal, medical, or certified financial advice.
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© {new Date().getFullYear()} Assumption Check AI. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <span>FastAPI + SQLite Backend</span>
          <span>•</span>
          <span>React + Vite Frontend</span>
          <span>•</span>
          <span>Structured Reasoning Protocol</span>
        </div>
      </div>
    </footer>
  );
};
