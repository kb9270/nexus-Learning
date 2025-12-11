
import React, { useState, useEffect } from 'react';
import { generateDailyQuests, generateEnglishDailyTest, generateAIChallenge } from './services/geminiService';
import { Quest, UserState, mapDomainToKey, EnglishQuestion, AIChallengeScenario, DailyRecord, SkillNode } from './types';
import { QuestCard } from './components/QuestCard';
import { StatCard } from './components/StatCard';
import { EnglishTestModal } from './components/EnglishTestModal';
import { AIChallengeModal } from './components/AIChallengeModal';
import { HistoryModal } from './components/HistoryModal';
import { SkillTreeModal } from './components/SkillTreeModal';
import { TownView } from './components/TownView';
import { 
  Brain, 
  Sparkles, 
  Coins, 
  User, 
  LayoutDashboard, 
  ListTodo,
  Loader2,
  RefreshCw,
  Globe,
  Code2,
  Target,
  PlusCircle,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Save,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

// --- UTILS ---
const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- INITIAL STATE (CLEAN) ---
const INITIAL_USER_STATE: UserState = {
  xp: 0,
  level: 1,
  gemCoins: 0,
  stepsCompleted: 0,
  skillLevels: {
    anglais: 1,
    webDev: 1,
    aiEngineering: 1,
  },
  lastQuestDate: null,
  history: [], 
  
  // NEW BUILD SYSTEM DEFAULTS
  buildPoints: 1, 
  skillPoints: {
      anglais: 0,
      webDev: 0,
      aiEngineering: 0
  },
  unlockedNodes: [],

  // NEW BUILDING STATS
  stats: {
      wordsMastered: 0,
      promptsTested: 0,
      codeQuestsCompleted: 0
  }
};

export default function App() {
  // --- STATE WITH PERSISTENCE ---
  const [userState, setUserState] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem('ai_quest_user_state_v1');
      if (saved) {
          const parsed = JSON.parse(saved);
          // Migration: Ensure new fields exist for old users
          return {
              ...INITIAL_USER_STATE,
              ...parsed,
              stats: parsed.stats || INITIAL_USER_STATE.stats, // Ensure stats object exists
              skillPoints: parsed.skillPoints || INITIAL_USER_STATE.skillPoints,
              buildPoints: parsed.buildPoints !== undefined ? parsed.buildPoints : INITIAL_USER_STATE.buildPoints,
              unlockedNodes: parsed.unlockedNodes || INITIAL_USER_STATE.unlockedNodes
          };
      }
      return INITIAL_USER_STATE;
    } catch (e) {
      return INITIAL_USER_STATE;
    }
  });

  const [quests, setQuests] = useState<Quest[]>(() => {
    try {
      const saved = localStorage.getItem('ai_quest_current_quests_v1');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'quests' | 'profile' | 'town'>('dashboard');
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [justIncremented, setJustIncremented] = useState(false);

  // States for Modals
  const [englishTestOpen, setEnglishTestOpen] = useState(false);
  const [englishQuestions, setEnglishQuestions] = useState<EnglishQuestion[]>([]);
  const [englishLoading, setEnglishLoading] = useState(false);

  const [aiChallengeOpen, setAiChallengeOpen] = useState(false);
  const [aiScenario, setAiScenario] = useState<AIChallengeScenario | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [historyOpen, setHistoryOpen] = useState(false);

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => {
    localStorage.setItem('ai_quest_user_state_v1', JSON.stringify(userState));
  }, [userState]);

  useEffect(() => {
    localStorage.setItem('ai_quest_current_quests_v1', JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
    }
  }, []);

  // --- HELPER TO UPDATE HISTORY ---
  const updateHistoryState = (xpGained: number, stepsAdded: number, questsCompleted: number) => {
    setUserState(prev => {
      const todayStr = getTodayDate();
      const historyCopy = [...prev.history];
      const todayIndex = historyCopy.findIndex(r => r.date === todayStr);

      if (todayIndex >= 0) {
        historyCopy[todayIndex] = {
          ...historyCopy[todayIndex],
          xp: historyCopy[todayIndex].xp + xpGained,
          stepsAdded: historyCopy[todayIndex].stepsAdded + stepsAdded,
          questsCompleted: historyCopy[todayIndex].questsCompleted + questsCompleted
        };
      } else {
        historyCopy.push({
          date: todayStr,
          xp: xpGained,
          stepsAdded: stepsAdded,
          questsCompleted: questsCompleted
        });
      }
      return { ...prev, history: historyCopy };
    });
  };

  // --- QUEST LOGIC ---
  const handleGenerateQuests = async () => {
    if (!process.env.API_KEY) {
        alert("API Key is missing.");
        return;
    }
    
    setLoading(true);
    try {
      const generated = await generateDailyQuests(userState.skillLevels, userState.stepsCompleted);
      const newQuests: Quest[] = generated.map((q, index) => ({
        ...q,
        id: `q-${Date.now()}-${index}`,
        isCompleted: false
      }));
      setQuests(newQuests);
      setActiveTab('quests');
    } catch (error) {
      console.error("Failed to generate quests:", error);
      alert("Erreur de génération.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteQuest = (id: string) => {
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.isCompleted) return;

    setQuests(prev => prev.map(q => q.id === id ? { ...q, isCompleted: true } : q));

    // Update global state AND Handle Points logic
    setUserState(prev => {
      const newXp = prev.xp + quest.xp_attribuee;
      const coinBonus = Math.floor(quest.xp_attribuee * 0.2); 
      
      // Global Level Up Logic
      const oldLevel = prev.level;
      const newLevel = Math.floor(newXp / 1000) + 1;
      const levelUp = newLevel > oldLevel;

      // Skill Level Logic
      const skillKey = mapDomainToKey(quest.domaine);
      const oldSkillLevel = prev.skillLevels[skillKey];
      // Simulate slight skill gain
      let newSkillVal = prev.skillLevels[skillKey];
      if (Math.random() > 0.5) newSkillVal = Math.min(10, newSkillVal + 0.1);
      
      const skillLevelUp = Math.floor(newSkillVal) > Math.floor(oldSkillLevel);

      // --- BUILDING STATS UPDATE ---
      const newStats = { ...prev.stats };
      if (quest.domaine === 'Anglais') {
          newStats.wordsMastered += 1; // 1 Quest = 1 Word context usually
      } else if (quest.domaine === 'Ingénierie IA') {
          newStats.promptsTested += 1; // 1 Quest = 1 Prompt test scenario
      } else if (quest.domaine === 'Développement Web') {
          newStats.codeQuestsCompleted += 1;
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        gemCoins: prev.gemCoins + coinBonus,
        skillLevels: { ...prev.skillLevels, [skillKey]: newSkillVal },
        lastQuestDate: getTodayDate(),
        // Award points
        buildPoints: levelUp ? prev.buildPoints + 1 : prev.buildPoints,
        skillPoints: {
            ...prev.skillPoints,
            [skillKey]: skillLevelUp ? prev.skillPoints[skillKey] + 1 : prev.skillPoints[skillKey]
        },
        stats: newStats
      };
    });

    updateHistoryState(quest.xp_attribuee, 0, 1);
  };

  const handleStepIncrement = () => {
    const xpGain = 10;
    setUserState(prev => {
        return {
            ...prev,
            stepsCompleted: prev.stepsCompleted + 1,
            xp: prev.xp + xpGain,
            gemCoins: prev.gemCoins + 1
        }
    });
    updateHistoryState(xpGain, 1, 0);

    setJustIncremented(true);
    setTimeout(() => setJustIncremented(false), 500);
  };

  // --- MODAL HANDLERS ---
  const handleLaunchEnglishTest = async () => { 
     if (!process.env.API_KEY) return;
     setEnglishLoading(true);
     try {
         const questions = await generateEnglishDailyTest(userState.skillLevels.anglais);
         setEnglishQuestions(questions);
         setEnglishTestOpen(true);
     } catch (error) { console.error(error); setEnglishLoading(false); } finally { setEnglishLoading(false); }
  };
  const handleEnglishTestComplete = (score: number) => { 
      setEnglishTestOpen(false);
      if(score > 0) {
          const xpReward = score * 30;
          setUserState(prev => ({
              ...prev, xp: prev.xp + xpReward, gemCoins: prev.gemCoins + (score * 5),
              skillLevels: { ...prev.skillLevels, anglais: Math.min(10, prev.skillLevels.anglais + 0.1) },
              stats: { ...prev.stats, wordsMastered: prev.stats.wordsMastered + score } // Bonus words
          }));
          updateHistoryState(xpReward, 0, 1);
      }
  };
  const handleLaunchAIChallenge = async () => { 
      if (!process.env.API_KEY) return;
      setAiLoading(true);
      try {
          const scenario = await generateAIChallenge(userState.skillLevels.aiEngineering);
          setAiScenario(scenario);
          setAiChallengeOpen(true);
      } catch (error) { console.error(error); setAiLoading(false); } finally { setAiLoading(false); }
  };
  const handleAIChallengeComplete = (score: number) => { 
      setAiChallengeOpen(false);
      const xpReward = score * 2;
      setUserState(prev => ({
        ...prev, xp: prev.xp + xpReward, gemCoins: prev.gemCoins + Math.floor(score/2),
        skillLevels: { ...prev.skillLevels, aiEngineering: Math.min(10, prev.skillLevels.aiEngineering + 0.1) },
        stats: { ...prev.stats, promptsTested: prev.stats.promptsTested + 1 } // 1 challenge = 1 prompt tested
      }));
      updateHistoryState(xpReward, 0, 1);
  };

  const chartData = [
    { subject: 'Anglais', A: userState.skillLevels.anglais, fullMark: 10 },
    { subject: 'Web Dev', A: userState.skillLevels.webDev, fullMark: 10 },
    { subject: 'IA Eng.', A: userState.skillLevels.aiEngineering, fullMark: 10 },
  ];

  if (apiKeyMissing) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4 text-center">
              <div><h1 className="text-3xl font-bold mb-4 text-red-500">Configuration Error</h1><p>API Key missing.</p></div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20 md:pb-0 font-sans">
      
      {/* --- MODALS --- */}
      {englishTestOpen && <EnglishTestModal questions={englishQuestions} onClose={() => setEnglishTestOpen(false)} onComplete={handleEnglishTestComplete} />}
      {aiChallengeOpen && aiScenario && <AIChallengeModal scenario={aiScenario} onClose={() => setAiChallengeOpen(false)} onComplete={handleAIChallengeComplete} />}
      {historyOpen && <HistoryModal history={userState.history} onClose={() => setHistoryOpen(false)} />}

      {/* --- HEADER --- */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
                <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block text-slate-100">AI Learning Quest</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 bg-slate-800 py-1.5 px-3 rounded-full border border-slate-700">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="font-mono font-bold text-yellow-400">{userState.gemCoins}</span>
            </div>
            <div 
                className="flex items-center gap-2 cursor-pointer hover:bg-slate-800 py-1.5 px-3 rounded-full border border-transparent hover:border-slate-700 transition-colors"
                onClick={() => setHistoryOpen(true)}
            >
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="font-mono font-bold text-purple-400">{Math.floor(userState.xp)} XP</span>
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8 border-b border-slate-700 pb-1 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all font-medium ${activeTab === 'dashboard' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}><LayoutDashboard className="w-4 h-4" /> Tableau de Bord</button>
          <button onClick={() => setActiveTab('quests')} className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all font-medium ${activeTab === 'quests' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}><ListTodo className="w-4 h-4" /> Quêtes {quests.length > 0 && <span className="ml-1 bg-indigo-600 text-white text-[10px] px-1.5 rounded-full">{quests.filter(q => !q.isCompleted).length}</span>}</button>
          <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all font-medium ${activeTab === 'profile' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}><ShieldCheck className="w-4 h-4" /> Talents</button>
          <button onClick={() => setActiveTab('town')} className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all font-medium ${activeTab === 'town' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}><Building2 className="w-4 h-4" /> Quartier Général</button>
          <button onClick={() => setHistoryOpen(true)} className="flex items-center gap-2 px-4 py-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-all font-medium"><TrendingUp className="w-4 h-4" /> Chroniques</button>
        </div>

        {/* --- VIEW: DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-300">
            {/* REAL-TIME TRACKER SECTION */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                         <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-2">
                           <Target className="w-6 h-6 text-indigo-500" />
                           Synchronisation FreeCodeCamp
                         </h2>
                         <p className="text-slate-400 max-w-lg">
                           Validez chaque étape réussie ici pour mettre à jour votre profil et générer de nouvelles quêtes adaptées.
                         </p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Prochaine</p>
                            <p className="text-3xl font-mono font-bold text-white">#{userState.stepsCompleted + 1}</p>
                        </div>

                        <button 
                            onClick={handleStepIncrement}
                            className={`group relative flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${justIncremented ? 'bg-green-500 text-white scale-105' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'}`}
                        >
                            {justIncremented ? <CheckCircle className="w-6 h-6" /> : <PlusCircle className="w-6 h-6" />}
                            {justIncremented ? "Validé !" : "J'ai validé l'étape"}
                        </button>
                    </div>
                </div>
                 <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-500" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Étapes Validées" value={`${userState.stepsCompleted}/1445`} icon={Target} colorClass="text-green-400" />
              <StatCard label="Test Anglais" value={`Niveau ${userState.skillLevels.anglais.toFixed(1)}`} icon={Brain} colorClass="text-blue-400" onClick={handleLaunchEnglishTest} cta="Quiz" />
              <StatCard label="Niveau Web Dev" value={userState.skillLevels.webDev.toFixed(1)} icon={Globe} colorClass="text-cyan-400" />
              <StatCard label="Dojo IA" value={`Niveau ${userState.skillLevels.aiEngineering.toFixed(1)}`} icon={Code2} colorClass="text-purple-400" onClick={handleLaunchAIChallenge} cta="Challenge" />
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Radar className="w-5 h-5 text-slate-400" /> Triangulation des Compétences</h3>
                    <div className="h-[300px] w-full"><ResponsiveContainer width="100%" height="100%"><RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}><PolarGrid stroke="#334155" /><PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} /><PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} /><Radar name="Niveau Actuel" dataKey="A" stroke="#818cf8" strokeWidth={3} fill="#818cf8" fillOpacity={0.4} /></RadarChart></ResponsiveContainer></div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
                    <div>
                        <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-white">Route vers la Certification</h3></div>
                        <div className="w-full bg-slate-700 rounded-full h-4 mb-8 overflow-hidden"><div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full relative" style={{ width: `${(userState.stepsCompleted / 1445) * 100}%` }}><div className="absolute top-0 right-0 h-full w-full bg-white/10 animate-pulse" /></div></div>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-center text-xs text-slate-600 gap-2 items-center pb-4"><Save className="w-3 h-3" /> Données sauvegardées localement</div>
          </div>
        )}

        {/* --- VIEW: QUESTS --- */}
        {activeTab === 'quests' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {quests.length === 0 ? (
                <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
                    <ListTodo className="w-16 h-16 text-slate-600 mx-auto mb-4" /><h3 className="text-xl font-bold text-slate-300 mb-2">Prêt à travailler ?</h3>
                    <button onClick={handleGenerateQuests} disabled={loading} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium">{loading ? "Génération en cours..." : "Lancer les Quêtes"}</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{quests.map((quest) => (<div key={quest.id} className="h-full"><QuestCard quest={quest} onComplete={handleCompleteQuest} /></div>))}</div>
            )}
          </div>
        )}

        {/* --- VIEW: SKILL TREE --- */}
        {activeTab === 'profile' && (
            <SkillTreeModal 
                userState={userState}
                onUnlock={(node, cost, type) => {
                    setUserState(prev => {
                        let newBP = prev.buildPoints;
                        let newSP = { ...prev.skillPoints };

                        if (type === 'BP') {
                            newBP -= cost;
                        } else {
                           if(node.id.startsWith('en')) newSP.anglais -= cost;
                           else if(node.id.startsWith('co')) newSP.webDev -= cost;
                           else if(node.id.startsWith('ai')) newSP.aiEngineering -= cost;
                        }

                        return {
                            ...prev,
                            buildPoints: newBP,
                            skillPoints: newSP,
                            unlockedNodes: [...prev.unlockedNodes, node.id]
                        };
                    });
                }}
            />
        )}

        {/* --- VIEW: TOWN (NEW) --- */}
        {activeTab === 'town' && (
            <TownView userState={userState} />
        )}

      </main>
    </div>
  );
}
