import React, { useState, useMemo } from 'react';
import { DailyRecord } from '../types';
import { X, Flame, Trophy, Target, CalendarDays, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface HistoryModalProps {
  history: DailyRecord[];
  onClose: () => void;
}

type Period = 'week' | 'month' | 'year';

export const HistoryModal: React.FC<HistoryModalProps> = ({ history, onClose }) => {
  const [period, setPeriod] = useState<Period>('week');

  // Helper pour obtenir la date locale string
  const getLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // --- 1. CALCUL DE LA "STREAK" (Série actuelle) ---
  const currentStreak = useMemo(() => {
    if (history.length === 0) return 0;

    let streak = 0;
    // Trier du plus récent au plus ancien
    const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const todayStr = getLocalDateString(today);
    const yesterdayStr = getLocalDateString(yesterday);

    // Vérifier si on a fait quelque chose aujourd'hui ou hier pour maintenir la flamme
    const lastActive = sorted[0];
    
    // Si la dernière activité n'est ni aujourd'hui ni hier, streak perdue
    if (lastActive.date !== todayStr && lastActive.date !== yesterdayStr) {
        return 0;
    }

    // Compter les jours consécutifs
    // Note: L'algorithme suppose qu'il n'y a qu'une entrée par jour dans history (garanti par App.tsx)
    let currentDateToCheck = new Date(lastActive.date);

    for (const record of sorted) {
        const recordDate = new Date(record.date);
        
        // La différence doit être de 0 ou 1 jour max par rapport à la date précédente itérée
        const diffTime = Math.abs(currentDateToCheck.getTime() - recordDate.getTime());
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 

        if (diffDays <= 1) { 
            streak++;
            currentDateToCheck = recordDate; 
        } else {
            break; 
        }
    }
    return streak;
  }, [history]);

  // --- 2. PRÉPARATION DES DONNÉES DU GRAPHIQUE ---
  const chartData = useMemo(() => {
    const today = new Date();
    // Trier chronologiquement pour le graph
    let filtered = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (period === 'week') {
        const limitDate = new Date();
        limitDate.setDate(today.getDate() - 7);
        filtered = filtered.filter(r => new Date(r.date) >= limitDate);
    } else if (period === 'month') {
        const limitDate = new Date();
        limitDate.setDate(today.getDate() - 30);
        filtered = filtered.filter(r => new Date(r.date) >= limitDate);
    } 
    else if (period === 'year') {
         filtered = filtered.slice(-50); // Limite visuelle
    }

    return filtered.map(f => {
        const d = new Date(f.date);
        return {
            ...f,
            dayName: d.toLocaleDateString('fr-FR', { weekday: 'short' }), // Lun, Mar...
            fullDate: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) // 24 Oct
        };
    });
  }, [history, period]);

  // --- 3. TOTAUX POUR LA PÉRIODE SÉLECTIONNÉE ---
  const totals = useMemo(() => {
    return chartData.reduce((acc, curr) => ({
        xp: acc.xp + curr.xp,
        quests: acc.quests + curr.questsCompleted,
    }), { xp: 0, quests: 0 });
  }, [chartData]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* EN-TÊTE SIMPLIFIÉ */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-500" /> 
            Vos Performances
          </h2>
          <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* 1. LA "STREAK" (ÉLÉMENT GAMIFIÉ PRINCIPAL) */}
            <div className="flex items-center justify-between bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 p-6 rounded-2xl">
                <div>
                    <p className="text-orange-400 font-bold uppercase tracking-widest text-xs mb-1">Série en cours</p>
                    <p className="text-3xl font-black text-white">{currentStreak} Jours</p>
                    <p className="text-slate-400 text-sm mt-1">L'assiduité est la clé de la maîtrise.</p>
                </div>
                <div className={`bg-orange-500/20 p-4 rounded-full ${currentStreak > 0 ? 'shadow-[0_0_15px_rgba(249,115,22,0.3)]' : ''}`}>
                    <Flame className={`w-10 h-10 text-orange-500 ${currentStreak > 0 ? 'fill-orange-500 animate-pulse' : 'opacity-50'}`} />
                </div>
            </div>

            {/* 2. SÉLECTEUR DE PÉRIODE (GROS BOUTONS) */}
            <div className="bg-slate-800 p-1 rounded-xl flex">
                {(['week', 'month', 'year'] as Period[]).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                            period === p 
                            ? 'bg-indigo-600 text-white shadow-lg' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        {p === 'week' ? '7 Jours' : p === 'month' ? '30 Jours' : 'Année'}
                    </button>
                ))}
            </div>

            {/* 3. CHIFFRES CLÉS (SIMPLE ET LISIBLE) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-purple-500/20 p-2 rounded-lg"><Trophy className="w-5 h-5 text-purple-400" /></div>
                        <span className="text-slate-400 text-sm font-medium">XP Gagnée</span>
                    </div>
                    <p className="text-3xl font-mono font-bold text-white">+{totals.xp}</p>
                </div>
                <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-500/20 p-2 rounded-lg"><Target className="w-5 h-5 text-blue-400" /></div>
                        <span className="text-slate-400 text-sm font-medium">Quêtes Finies</span>
                    </div>
                    <p className="text-3xl font-mono font-bold text-white">{totals.quests}</p>
                </div>
            </div>

            {/* 4. GRAPHIQUE UNIQUE ET ÉPURÉ */}
            <div className="h-64">
                <p className="text-sm font-bold text-slate-500 mb-4 pl-1">Évolution XP ({period === 'week' ? 'Cette semaine' : period === 'month' ? 'Ce mois' : 'Cette année'})</p>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis 
                                dataKey="dayName" 
                                stroke="#475569" 
                                tick={{fill: '#64748b', fontSize: 12}} 
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip 
                                cursor={{fill: '#334155', opacity: 0.2}}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
                                        <p className="text-indigo-300 font-bold text-sm mb-1">{payload[0].payload.fullDate}</p>
                                        <p className="text-white font-mono font-bold text-lg">+{payload[0].value} XP</p>
                                        </div>
                                    );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="xp" radius={[6, 6, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.xp > 150 ? '#8b5cf6' : '#6366f1'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                        <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                        <p>Pas encore de données sur cette période.</p>
                    </div>
                )}
            </div>

            {/* 5. HISTORIQUE RÉCENT (LISTE SIMPLE) */}
            <div>
                <p className="text-sm font-bold text-slate-500 mb-3 pl-1">Détails récents</p>
                <div className="space-y-3">
                    {chartData.slice().reverse().slice(0, 5).map((record, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-700 p-2 rounded-full">
                                    <CalendarDays className="w-4 h-4 text-slate-400" />
                                </div>
                                <span className="text-slate-300 text-sm font-medium">{record.fullDate}</span>
                            </div>
                            <div className="flex gap-4 text-sm">
                                {record.questsCompleted > 0 && <span className="text-blue-400">{record.questsCompleted} Quêtes</span>}
                                <span className="text-purple-400 font-bold">+{record.xp} XP</span>
                            </div>
                        </div>
                    ))}
                    {chartData.length === 0 && (
                        <p className="text-center text-slate-500 py-4 italic">Commencez une quête pour voir votre historique !</p>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};