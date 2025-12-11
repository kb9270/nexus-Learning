
import React from 'react';
import { BUILDINGS } from '../data/buildingData';
import { UserState } from '../types';
import { Home, Warehouse, Factory, Book, Library, Globe, Radio, Server, Cpu, Lock, ArrowUpCircle } from 'lucide-react';

interface TownViewProps {
  userState: UserState;
}

export const TownView: React.FC<TownViewProps> = ({ userState }) => {

  // Helper pour obtenir la métrique actuelle de l'utilisateur pour un bâtiment donné
  const getCurrentMetric = (domaine: string) => {
      switch(domaine) {
          case 'Code': return userState.stats.codeQuestsCompleted;
          case 'Anglais': return userState.stats.wordsMastered;
          case 'Ingénierie IA': return userState.stats.promptsTested;
          default: return 0;
      }
  };

  // Helper pour obtenir l'icône visuelle basée sur le niveau et le domaine
  const getVisualIcon = (domaine: string, niveau: number) => {
      if (domaine === 'Code') {
          if (niveau === 1) return Home;
          if (niveau === 2) return Warehouse;
          return Factory;
      }
      if (domaine === 'Anglais') {
          if (niveau === 1) return Book;
          if (niveau === 2) return Library;
          return Globe;
      }
      if (domaine === 'Ingénierie IA') {
          if (niveau === 1) return Radio;
          if (niveau === 2) return Server;
          return Cpu;
      }
      return Home;
  };

  return (
    <div className="animate-in fade-in zoom-in duration-300 space-y-8 pb-10">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-2">Quartier Général</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Visualisez l'évolution de votre infrastructure d'apprentissage. Chaque quête accomplie, chaque mot appris et chaque prompt testé contribue à l'expansion de votre base.
                </p>
            </div>
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-10 left-10 w-20 h-20 bg-indigo-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
            </div>
        </div>

        {/* Buildings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {BUILDINGS.map((batiment) => {
                const currentVal = getCurrentMetric(batiment.domaine);
                
                // Trouver le niveau actuel (le plus haut niveau dont l'exigence est atteinte)
                // On reverse pour trouver le plus grand index satisfaisant la condition
                const currentLevelIdx = [...batiment.progression].reverse().findIndex(lvl => currentVal >= lvl.exigence);
                // Si trouvé (index dans le tableau inversé), on le convertit. Sinon niveau 0 (index -1 -> on prend le premier élément du vrai tableau)
                const realIndex = currentLevelIdx >= 0 ? (batiment.progression.length - 1) - currentLevelIdx : 0;
                
                const currentLevel = batiment.progression[realIndex];
                const nextLevel = batiment.progression[realIndex + 1];
                
                const Icon = getVisualIcon(batiment.domaine, currentLevel.niveau);

                // Progress Calculation
                let progressPercent = 100;
                if (nextLevel) {
                    const range = nextLevel.exigence - currentLevel.exigence;
                    const progress = currentVal - currentLevel.exigence;
                    progressPercent = Math.min(100, Math.max(0, (progress / range) * 100));
                }

                return (
                    <div key={batiment.domaine} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden flex flex-col shadow-xl hover:shadow-2xl transition-shadow duration-300">
                        {/* Visual Header */}
                        <div className={`h-40 relative flex items-center justify-center ${batiment.domaine === 'Code' ? 'bg-blue-900/30' : batiment.domaine === 'Anglais' ? 'bg-emerald-900/30' : 'bg-purple-900/30'}`}>
                            <Icon className={`w-20 h-20 ${batiment.domaine === 'Code' ? 'text-blue-400' : batiment.domaine === 'Anglais' ? 'text-emerald-400' : 'text-purple-400'} drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`} />
                            <div className="absolute bottom-3 right-3 bg-slate-900/80 px-3 py-1 rounded-full text-xs font-bold text-white border border-slate-700">
                                Niv. {currentLevel.niveau}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-white mb-1">{batiment.domaine}</h3>
                            <p className="text-lg text-indigo-300 font-semibold mb-3">{currentLevel.titre}</p>
                            
                            <p className="text-sm text-slate-400 mb-6 italic min-h-[40px]">
                                "{currentLevel.description_visuelle}"
                            </p>

                            <div className="mt-auto">
                                {nextLevel ? (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wide">
                                            <span>Prochain: {nextLevel.titre}</span>
                                            <span>{currentVal} / {nextLevel.exigence} {currentLevel.unite_exigence}</span>
                                        </div>
                                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${batiment.domaine === 'Code' ? 'bg-blue-500' : batiment.domaine === 'Anglais' ? 'bg-emerald-500' : 'bg-purple-500'}`}
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 text-right mt-1 flex items-center justify-end gap-1">
                                            <ArrowUpCircle className="w-3 h-3" /> 
                                            Manque {nextLevel.exigence - currentVal} pour upgrade
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
                                        <span className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Niveau Max Atteint</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};
