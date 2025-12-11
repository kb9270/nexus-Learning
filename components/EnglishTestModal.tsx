import React, { useState } from 'react';
import { EnglishQuestion } from '../types';
import { X, CheckCircle, AlertCircle, Brain, ArrowRight, Trophy } from 'lucide-react';

interface EnglishTestModalProps {
  questions: EnglishQuestion[];
  onClose: () => void;
  onComplete: (score: number) => void;
}

export const EnglishTestModal: React.FC<EnglishTestModalProps> = ({ questions, onClose, onComplete }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentQIndex];

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const handleValidate = () => {
    if (!selectedOption) return;
    
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    if (isCorrect) setScore(s => s + 1);
    
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const handleFinish = () => {
    onComplete(score);
  };

  if (showResults) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="mx-auto bg-indigo-500/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6">
            <Trophy className="w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Test Terminé !</h2>
          <p className="text-slate-400 mb-6">Votre score : <span className="text-white font-mono font-bold text-xl">{score} / {questions.length}</span></p>
          
          <div className="bg-slate-900/50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-slate-300">
                {score === questions.length 
                    ? "Excellent ! Votre vocabulaire technique est solide." 
                    : score > 0 
                    ? "Bien joué. Continuez à pratiquer pour maîtriser les nuances." 
                    : "Courage, l'apprentissage est un processus continu."}
            </p>
          </div>

          <button 
            onClick={handleFinish}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all"
          >
            Récupérer mes XP
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
                <Brain className="w-5 h-5 text-blue-400" />
            </div>
            <div>
                <h3 className="font-bold text-white">Daily English Drill</h3>
                <p className="text-xs text-slate-400">Question {currentQIndex + 1} sur {questions.length}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <h4 className="text-lg font-medium text-white mb-6 leading-relaxed">
            {currentQuestion.question}
          </h4>

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              let btnClass = "border-slate-600 bg-slate-700/30 hover:bg-slate-700 hover:border-slate-500";
              
              if (isAnswered) {
                if (option === currentQuestion.correctAnswer) {
                    btnClass = "border-green-500 bg-green-500/20 text-green-300"; // Correct
                } else if (option === selectedOption) {
                    btnClass = "border-red-500 bg-red-500/20 text-red-300"; // Wrong selection
                } else {
                    btnClass = "border-slate-700 bg-slate-800/50 opacity-50"; // Others
                }
              } else if (selectedOption === option) {
                btnClass = "border-indigo-500 bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 text-sm md:text-base ${btnClass}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="mt-6 p-4 bg-slate-900/80 border border-slate-700 rounded-xl animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 mb-2 font-bold text-sm uppercase tracking-wide">
                    {selectedOption === currentQuestion.correctAnswer ? (
                        <span className="text-green-400 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Correct</span>
                    ) : (
                        <span className="text-red-400 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Incorrect</span>
                    )}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                    {currentQuestion.explanation}
                </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-800/50 rounded-b-2xl">
          {!isAnswered ? (
            <button
                onClick={handleValidate}
                disabled={!selectedOption}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
            >
                Valider
            </button>
          ) : (
            <button
                onClick={handleNext}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
                {currentQIndex < questions.length - 1 ? "Question Suivante" : "Voir les Résultats"} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};