import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  History, 
  Info, 
  Menu, 
  X, 
  CheckCircle2, 
  Radio, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';
import { HealthStatus } from '../types';

interface NavbarProps {
  activeTab: 'landing' | 'analyze' | 'history' | 'about';
  setActiveTab: (tab: 'landing' | 'analyze' | 'history' | 'about') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const data = await api.getHealth();
        setHealth(data);
        setIsHealthy(true);
      } catch (err) {
        setIsHealthy(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  interface NavItem {
    id: 'landing' | 'analyze' | 'history' | 'about';
    label: string;
    highlight?: boolean;
  }

  const navItems: NavItem[] = [
    { id: 'landing', label: 'Home' },
    { id: 'analyze', label: 'Analyze', highlight: true },
    { id: 'history', label: 'History' },
    { id: 'about', label: 'About' },
  ];

  const handleNav = (id: 'landing' | 'analyze' | 'history' | 'about') => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-navy-950/80 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div 
            onClick={() => handleNav('landing')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-brand-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  ASSUMPTION CHECK
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider hidden sm:block">
                ANALYZE • VERIFY • DECIDE
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'text-white bg-slate-800/80 shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {item.label}
                {item.highlight && activeTab !== item.id && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Backend Status & CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {/* System Engine Status */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
              {isHealthy === true ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-slate-300">
                    {health?.demo_mode ? 'Analytical Heuristics (Demo)' : `OpenAI (${health?.openai_model})`}
                  </span>
                </>
              ) : isHealthy === false ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="text-rose-400">Backend Offline</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-spin"></span>
                  <span className="text-slate-400">Connecting...</span>
                </>
              )}
            </div>

            <button
              onClick={() => handleNav('analyze')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs sm:text-sm font-semibold hover:from-brand-500 hover:to-indigo-500 shadow-md shadow-brand-600/20 hover:shadow-brand-600/30 transition-all"
            >
              <Sparkles size={14} />
              <span>Launch Analysis</span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-navy-950/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-2 animate-fadeIn">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium flex items-center justify-between ${
                activeTab === item.id
                  ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <span>{item.label}</span>
              {item.highlight && (
                <span className="text-xs px-2 py-0.5 rounded bg-brand-500 text-white font-semibold">
                  New
                </span>
              )}
            </button>
          ))}
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 px-2">
              <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400' : 'bg-rose-500'}`}></span>
              <span>Backend Status: {isHealthy ? 'Connected' : 'Offline'}</span>
            </div>
            <button
              onClick={() => handleNav('analyze')}
              className="w-full py-2.5 rounded-lg bg-brand-600 text-white font-medium text-center shadow-lg"
            >
              Analyze an Assumption
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
