import React, { useState } from 'react';
import { AIChallengeScenario, AIPromptEvaluation } from '../types';
import { evaluateUserPrompt } from '../services/geminiService';
import { X, Bot, Send, Sparkles, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface AIChallengeModalProps {
  scenario: AIChallengeScenario;
  onClose: () => void;
  onComplete: (score: number) => void;
}

export const AIChallengeModal: React.FC<AIChallengeModalProps> = ({ scenario, onClose, onComplete }) => {
  const [userPrompt, setUserPrompt] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<AIPromptEvaluation | null>(null);

  const handleSubmit = async () => {
    if (userPrompt.trim().length < 10) return;
    
    setEvaluating(true);
    try {
        const evaluation = await evaluateUserPrompt(scenario, userPrompt);
        setResult(evaluation);
    } catch (e) {
        console.error(e);
        alert("Erreur lors de l'évaluation du prompt.");
    } finally {
        setEvaluating(false);
    }
  };

  const handleFinish = () => {
      if (result) {
          onComplete(result.score);
      }
  };

  if (result) {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-slate-800 border border-purple-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                <div className="p-6 border-b border-purple-500/20 bg-purple-500/5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Bot className="w-6 h-6 text-purple-400" /> Analyse du Prompt
                        </h3>
                        <div className={`px-4 py-1 rounded-full text-lg font-mono font-bold border ${result.score >= 80 ? 'border-green-500 text-green-400 bg-green-500/10' : result.score >= 50 ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10' : 'border-red-500 text-red-400 bg-red-500/10'}`}>
                            Score: {result.score}/100
                        </div>
                    </div>
                    <p className="text-slate-300 italic">"{result.feedback}"</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                            <h4 className="text-sm font-bold text-green-400 mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Points Forts</h4>
                            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                                {result.strengths?.map((s, i) => <li key={i}>{s}</li>) || <li>Aucun point fort détecté</li>}
                            </ul>
                        </div>
                        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                            <h4 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> À Améliorer</h4>
                            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                                {result.weaknesses?.map((w, i) => <li key={i}>{w}</li>) || <li>Rien à signaler</li>}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-5 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                             <Sparkles className="w-16 h-16 text-purple-500" />
                         </div>
                         <h4 className="text-sm font-bold text-purple-400 mb-2 uppercase tracking-wider">Golden Prompt (Correction)</h4>
                         <p className="text-sm text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">{result.improvedPrompt}</p>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-700 bg-slate-800/50">
                    <button 
                        onClick={handleFinish}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20"
                    >
                        Récupérer mes XP
                    </button>
                </div>
            </div>
        </div>
      )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/20 p-2 rounded-lg">
                <Bot className="w-6 h-6 text-purple-400" />
            </div>
            <div>
                <h3 className="font-bold text-white text-lg">Dojo de Prompt Engineering</h3>
                <p className="text-xs text-purple-400 uppercase tracking-widest font-semibold">{scenario.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
            {/* Context Box */}
            <div className="bg-slate-700/30 rounded-xl p-5 mb-6 border border-slate-600">
                <h4 className="text-sm font-bold text-slate-300 mb-2">CONTEXTE :</h4>
                <p className="text-slate-100 mb-4">{scenario.context}</p>
                <h4 className="text-sm font-bold text-indigo-400 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> OBJECTIF IA :
                </h4>
                <p className="text-white font-medium italic">"{scenario.goal}"</p>
            </div>

            <div className="space-y-2">
                <label className="text-sm text-slate-400">Votre Prompt pour l'IA :</label>
                <textarea 
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Écrivez ici le prompt exact que vous enverriez à ChatGPT ou Gemini pour obtenir le meilleur résultat..."
                    className="w-full h-40 bg-slate-900 border border-slate-600 rounded-xl p-4 text-white font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none placeholder:text-slate-600"
                />
                <p className="text-xs text-slate-500 text-right">Soyez précis, donnez du contexte et des contraintes.</p>
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-800/50 rounded-b-2xl">
            <button
                onClick={handleSubmit}
                disabled={evaluating || userPrompt.trim().length < 10}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
            >
                {evaluating ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Analyse par Prométhée...</>
                ) : (
                    <><Send className="w-5 h-5" /> Soumettre mon Prompt</>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};