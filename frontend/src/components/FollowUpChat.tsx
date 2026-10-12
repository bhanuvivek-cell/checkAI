import React, { useState } from 'react';
import { Send, MessageSquare, Sparkles, Loader2, CornerDownRight } from 'lucide-react';
import { api, ApiError } from '../services/api';
import { FollowUpResponse } from '../types';

interface FollowUpChatProps {
  analysisId: number;
  initialQuestions?: string[];
}

export const FollowUpChat: React.FC<FollowUpChatProps> = ({ 
  analysisId, 
  initialQuestions = [] 
}) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<FollowUpResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (qText: string) => {
    const textToSend = qText.trim();
    if (!textToSend || loading) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.askFollowUp(analysisId, textToSend);
      setMessages((prev) => [...prev, response]);
      setQuestion('');
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : 'Failed to retrieve follow-up answer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 rounded-2xl bg-slate-900/70 border border-slate-800 p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
            <MessageSquare size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Ask Follow-up Questions</h3>
            <p className="text-xs text-slate-400">Inquire further into this analysis, probe edge cases, or adjust constraints.</p>
          </div>
        </div>
      </div>

      {/* Suggested Follow-up Questions Chips */}
      {initialQuestions.length > 0 && messages.length === 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Sparkles size={13} className="text-brand-400" />
            Suggested inquiries based on this analysis:
          </span>
          <div className="flex flex-wrap gap-2">
            {initialQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestion(q);
                  handleSubmit(q);
                }}
                disabled={loading}
                className="text-left text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-brand-600/20 hover:text-brand-300 text-slate-300 border border-slate-700 hover:border-brand-500/40 transition-colors"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message History */}
      {messages.length > 0 && (
        <div className="space-y-4 pt-2">
          {messages.map((msg, index) => (
            <div key={index} className="space-y-3">
              {/* User Question Bubble */}
              <div className="flex items-start gap-2.5 justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-brand-600/20 border border-brand-500/30 px-4 py-2.5 text-sm text-brand-100">
                  <p className="font-medium text-xs text-brand-400 mb-0.5">Your Question</p>
                  <p>{msg.question}</p>
                </div>
              </div>

              {/* AI Answer Bubble */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-brand-400 mt-1">
                  <Sparkles size={14} />
                </div>
                <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-slate-800/60 border border-slate-700/80 px-4 py-3 text-sm text-slate-200 space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Assumption Check AI Response
                  </div>
                  <p className="leading-relaxed whitespace-pre-line">{msg.answer}</p>

                  {/* Suggested Perspectives if available */}
                  {msg.suggested_perspectives && msg.suggested_perspectives.length > 0 && (
                    <div className="pt-2 border-t border-slate-700/60 mt-2 space-y-1">
                      <span className="text-[11px] font-semibold text-brand-300 flex items-center gap-1">
                        <CornerDownRight size={12} /> Key Perspectives to Probe:
                      </span>
                      <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
                        {msg.suggested_perspectives.map((p, pIdx) => (
                          <li key={pIdx}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Input box */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(question);
        }}
        className="flex items-center gap-2 pt-2"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a clarifying question (e.g. 'What if my budget is doubled?' or 'What is the biggest risk?')..."
          disabled={loading}
          className="flex-1 bg-slate-950/70 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-brand-600/20 transition-all"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Thinking...</span>
            </>
          ) : (
            <>
              <Send size={16} />
              <span>Ask</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
