
import React, { useState } from 'react';
import { SKILL_TREES } from '../data/skillTreeData';
import { UserState, mapDomainToKey, SkillNode } from '../types';
import { Lock, Unlock, Check, Star, Bot, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { generateSkillTreeAdvice } from '../services/geminiService';

interface SkillTreeModalProps {
  userState: UserState;
  onUnlock: (node: SkillNode, cost: number, type: 'BP' | 'SP') => void;
  onClose?: () => void; // Optional if embedded
}

export const SkillTreeModal: React.FC<SkillTreeModalProps> = ({ userState, onUnlock, onClose }) => {
  const [activeDomainIndex, setActiveDomainIndex] = useState(0);
  const [advice, setAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const activeTree = SKILL_TREES[activeDomainIndex];
  const skillKey = mapDomainToKey(activeTree.domain);
  const availableSP = userState.skillPoints[skillKey];
  const availableBP = userState.buildPoints;

  const isUnlocked = (nodeId: string) => userState.unlockedNodes.includes(nodeId);
  
  const canUnlock = (node: SkillNode) => {
    if (isUnlocked(node.id)) return false;
    
    // Check parent
    if (node.parentId && !isUnlocked(node.parentId)) return false;
    
    // Check cost
    if (node.costType === 'BP') return availableBP >= node.cost;
    if (node.costType === 'SP') return availableSP >= node.cost;
    
    return false;
  };

  const handleAskAdvice = async () => {
      setLoadingAdvice(true);
      try {
          const result = await generateSkillTreeAdvice(userState);
          setAdvice(result.advice);
      } catch (e) {
          setAdvice("Impossible de contacter Prométhée pour le moment.");
      } finally {
          setLoadingAdvice(false);
      }
  };

  return (
    <div className="bg-slate-900 min-h-full text-slate-100 flex flex-col animate-in fade-in duration-300">
      
      {/* HEADER: RESOURCES & TABS */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-20 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
             <div>
                 <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-indigo-400" /> Arbre de Talents
                 </h2>
                 <p className="text-slate-400 text-sm">Spécialisez votre Build</p>
             </div>
             
             {/* POINTS COUNTER */}
             <div className="flex gap-4">
                 <div className="bg-slate-900 border border-indigo-500/50 p-2 px-4 rounded-xl flex flex-col items-center min-w-[100px]">
                     <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Build Pts</span>
                     <span className="text-2xl font-mono font-bold text-white">{availableBP}</span>
                 </div>
                 <div className="bg-slate-900 border border-emerald-500/50 p-2 px-4 rounded-xl flex flex-col items-center min-w-[100px]">
                     <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">{activeTree.domain.split(' ')[0]} Pts</span>
                     <span className="text-2xl font-mono font-bold text-white">{availableSP}</span>
                 </div>
             </div>
        </div>

        {/* DOMAIN TABS */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar">
            {SKILL_TREES.map((tree, idx) => (
                <button
                    key={tree.domain}
                    onClick={() => { setActiveDomainIndex(idx); setAdvice(null); }}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
                        activeDomainIndex === idx 
                        ? 'bg-indigo-600 text-white shadow-lg' 
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                >
                    {tree.domain}
                </button>
            ))}
        </div>
      </div>

      {/* AI ADVISOR */}
      <div className="p-4 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-b border-white/5">
         <div className="max-w-4xl mx-auto flex items-start gap-4">
            <div className="bg-purple-500/20 p-2 rounded-full mt-1">
                <Bot className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-bold text-purple-300 uppercase mb-1">Conseil Stratégique</h4>
                {advice ? (
                    <p className="text-slate-200 italic animate-in slide-in-from-left-2">"{advice}"</p>
                ) : (
                    <div className="flex items-center gap-3">
                        <p className="text-slate-400 text-sm">Besoin d'aide pour choisir votre prochaine compétence ?</p>
                        <button 
                            onClick={handleAskAdvice}
                            disabled={loadingAdvice}
                            className="text-xs bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded text-white transition-colors"
                        >
                            {loadingAdvice ? "Analyse..." : "Demander à Prométhée"}
                        </button>
                    </div>
                )}
            </div>
         </div>
      </div>

      {/* TREE CONTENT */}
      <div className="p-6 max-w-5xl mx-auto w-full flex-1 overflow-y-auto">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {activeTree.branches.map((branch) => (
                 <div key={branch.id} className="flex flex-col gap-6 relative">
                     {/* Branch Header */}
                     <div className="text-center mb-4">
                         <h3 className="text-lg font-bold text-white">{branch.name}</h3>
                         <p className="text-xs text-slate-400 h-8">{branch.description}</p>
                     </div>

                     {/* Nodes Line */}
                     <div className="absolute left-1/2 top-16 bottom-0 w-1 bg-slate-800 -translate-x-1/2 z-0 rounded-full" />

                     {/* Nodes */}
                     {branch.nodes.map((node) => {
                         const unlocked = isUnlocked(node.id);
                         const available = canUnlock(node);
                         const locked = !unlocked && !available;

                         return (
                             <div key={node.id} className="relative z-10 flex flex-col items-center group">
                                 <button
                                    onClick={() => available && onUnlock(node, node.cost, node.costType)}
                                    disabled={!available}
                                    className={`
                                        w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 relative
                                        ${unlocked 
                                            ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.4)]' 
                                            : available 
                                                ? 'bg-slate-700 border-emerald-400 cursor-pointer hover:scale-110 hover:shadow-[0_0_15px_rgba(52,211,153,0.4)] animate-pulse' 
                                                : 'bg-slate-800 border-slate-700 opacity-60 cursor-not-allowed grayscale'
                                        }
                                    `}
                                 >
                                     {unlocked ? <Check className="w-8 h-8 text-white" /> : locked ? <Lock className="w-6 h-6 text-slate-500" /> : <Unlock className="w-8 h-8 text-emerald-400" />}
                                     
                                     {/* Cost Badge */}
                                     {!unlocked && (
                                         <div className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold border ${node.costType === 'BP' ? 'bg-indigo-900 border-indigo-500 text-indigo-300' : 'bg-emerald-900 border-emerald-500 text-emerald-300'}`}>
                                             {node.cost} {node.costType}
                                         </div>
                                     )}
                                 </button>

                                 {/* Info Box (Tooltip-ish but static for mobile friendliness) */}
                                 <div className="mt-3 bg-slate-800/80 border border-slate-700 p-3 rounded-xl w-full text-center hover:bg-slate-800 transition-colors">
                                     <p className={`font-bold text-sm ${unlocked ? 'text-indigo-300' : 'text-slate-300'}`}>{node.title}</p>
                                     <p className="text-xs text-slate-500 mt-1 leading-tight">{node.description}</p>
                                     {node.perk && (
                                         <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-yellow-400 font-bold bg-yellow-400/10 py-1 px-2 rounded-lg">
                                             <Star className="w-3 h-3" /> {node.perk}
                                         </div>
                                     )}
                                 </div>
                             </div>
                         );
                     })}
                 </div>
             ))}
         </div>
      </div>
    </div>
  );
};
