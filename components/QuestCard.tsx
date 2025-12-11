import React, { useState } from 'react';
import { Quest } from '../types';
import { CheckCircle2, Circle, Sword, BookOpen, Globe, Trophy, PencilLine } from 'lucide-react';

interface QuestCardProps {
  quest: Quest;
  onComplete: (id: string) => void;
}

export const QuestCard: React.FC<QuestCardProps> = ({ quest, onComplete }) => {
  const [userResponse, setUserResponse] = useState('');

  const getIcon = () => {
    switch (quest.domaine) {
      case 'Anglais': return BookOpen;
      case 'Développement Web': return Globe;
      case 'Ingénierie IA': return Sword; 
      default: return Circle;
    }
  };

  const Icon = getIcon();
  const isEnglishQuest = quest.domaine === 'Anglais';

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'facile': return 'text-green-400 border-green-400/30 bg-green-400/10';
      case 'moyen': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'difficile': return 'text-orange-400 border-orange-400/30 bg-orange-400/10';
      case 'expert': return 'text-red-400 border-red-400/30 bg-red-400/10';
      default: return 'text-slate-400';
    }
  };

  const handleValidate = () => {
    if (isEnglishQuest && userResponse.trim().length < 3) {
      alert("Veuillez compléter l'exercice d'anglais avant de valider.");
      return;
    }
    onComplete(quest.id);
  };

  return (
    <div className={`relative group flex flex-col justify-between h-full bg-slate-800/50 backdrop-blur-sm border ${quest.isCompleted ? 'border-green-500/50' : 'border-slate-700'} rounded-2xl p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl`}>
      {/* Background glow effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none`} />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-lg ${quest.domaine === 'Ingénierie IA' ? 'bg-purple-500/20 text-purple-400' : quest.domaine === 'Anglais' ? 'bg-blue-500/20 text-blue-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
            <Icon className="w-6 h-6" />
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-mono border ${getDifficultyColor(quest.difficulte)}`}>
            {quest.difficulte}
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{quest.titre}</h3>
        
        <div className="mb-4">
             <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Mission</span>
            <p className="text-slate-300 text-sm mt-1 leading-relaxed">{quest.description}</p>
        </div>

        {/* Input Zone for English Quests */}
        {isEnglishQuest && !quest.isCompleted && (
          <div className="mb-4">
             <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <PencilLine className="w-3 h-3" /> Votre Réponse
             </span>
             <textarea 
               value={userResponse}
               onChange={(e) => setUserResponse(e.target.value)}
               placeholder="Écrivez votre réponse en anglais ici..."
               className="w-full bg-slate-900/80 border border-slate-600 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none min-h-[80px]"
             />
          </div>
        )}

        {/* Display response if completed */}
        {isEnglishQuest && quest.isCompleted && userResponse && (
           <div className="mb-4 p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-lg">
              <span className="text-xs text-indigo-300 uppercase block mb-1">Votre réponse :</span>
              <p className="text-sm text-slate-300 italic">"{userResponse}"</p>
           </div>
        )}

        {!isEnglishQuest && (
          <div className="mb-6 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
               <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Trophy className="w-3 h-3 text-yellow-500" /> Objectif de Validation
               </span>
               <p className="text-slate-400 text-sm mt-1 italic">{quest.conditions_de_validation}</p>
          </div>
        )}
      </div>

      <div className="relative z-10 pt-4 border-t border-slate-700/50 flex items-center justify-between">
        <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase">Récompense</span>
            <span className="text-yellow-400 font-mono font-bold">+{quest.xp_attribuee} XP</span>
        </div>

        <button
          onClick={handleValidate}
          disabled={quest.isCompleted || (isEnglishQuest && userResponse.trim().length === 0)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-semibold ${
            quest.isCompleted
              ? 'bg-green-500/20 text-green-400 cursor-default'
              : (isEnglishQuest && userResponse.trim().length === 0) 
                 ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                 : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 active:scale-95'
          }`}
        >
          {quest.isCompleted ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Validé
            </>
          ) : (
            <>
              {isEnglishQuest ? 'Soumettre' : 'Valider'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};