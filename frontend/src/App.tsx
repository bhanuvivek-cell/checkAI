import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { HistoryPage } from './pages/HistoryPage';
import { AboutPage } from './pages/AboutPage';
import { CategoryType } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'landing' | 'analyze' | 'history' | 'about'>('landing');
  const [prefilledText, setPrefilledText] = useState<string>('');
  const [prefilledCategory, setPrefilledCategory] = useState<CategoryType>('General Assumption');

  const handleStartAnalysis = (initialText?: string, category?: CategoryType) => {
    if (initialText) {
      setPrefilledText(initialText);
    }
    if (category) {
      setPrefilledCategory(category);
    }
    setActiveTab('analyze');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReopenAnalysis = (text: string, category: CategoryType) => {
    setPrefilledText(text);
    setPrefilledCategory(category);
    setActiveTab('analyze');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Page Body */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage onStartAnalysis={handleStartAnalysis} />
        )}

        {activeTab === 'analyze' && (
          <AnalyzePage 
            initialText={prefilledText} 
            initialCategory={prefilledCategory} 
            onClearInitial={() => {
              setPrefilledText('');
            }}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage onReopenAnalysis={handleReopenAnalysis} />
        )}

        {activeTab === 'about' && (
          <AboutPage />
        )}
      </main>

      {/* Global Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
