
export type Domain = 'Anglais' | 'Développement Web' | 'Ingénierie IA' | 'Conduite' | 'Bibliothèque' | 'Horlogerie';
export type Difficulty = 'Facile' | 'Moyen' | 'Difficile' | 'Expert';

export interface Quest {
  id: string; // generated client-side
  titre: string;
  domaine: Domain;
  difficulte: Difficulty;
  xp_attribuee: number;
  description: string;
  conditions_de_validation: string;
  isCompleted: boolean;
}

export interface SkillLevels {
  anglais: number;
  webDev: number;
  aiEngineering: number;
  conduite: number;
  bibliotheque: number;
  horlogerie: number;
}

export interface DailyRecord {
  date: string; // Format YYYY-MM-DD
  xp: number;
  questsCompleted: number;
  stepsAdded: number;
}

// --- ARBRE DE COMPÉTENCES ---
export interface SkillNode {
  id: string;
  title: string;
  description: string;
  cost: number;
  costType: 'BP' | 'SP';
  parentId?: string;
  perk?: string;
}

export interface SkillBranch {
  id: string;
  name: string;
  description: string;
  nodes: SkillNode[];
}

export interface SkillTreeDefinition {
  domain: Domain;
  branches: SkillBranch[];
}

// --- SYSTÈME DE BÂTIMENTS ---
export interface BuildingLevel {
  niveau: number;
  titre: string;
  description_visuelle: string;
  exigence: number;
  unite_exigence: string;
}

export interface BuildingDefinition {
  domaine: string; 
  progression: BuildingLevel[];
}

export interface UserStats {
  wordsMastered: number;   // Anglais
  promptsTested: number;   // IA
  codeQuestsCompleted: number; // Code
  kmDriven: number; // Conduite
  booksRead: number; // Bibliothèque
  watchesFixed: number; // Horlogerie
}

export interface UserState {
  xp: number;
  level: number;
  gemCoins: number;
  skillLevels: SkillLevels;
  stepsCompleted: number;
  lastQuestDate: string | null;
  history: DailyRecord[];
  
  // BUILD
  buildPoints: number;
  skillPoints: { [key in keyof SkillLevels]: number };
  unlockedNodes: string[];

  // STATS BÂTIMENTS
  stats: UserStats;
}

// Interfaces pour le Test d'Anglais
export interface EnglishQuestion {
  question: string;
  options: string[];
  correctAnswer: string; 
  explanation: string;
}

// Interfaces pour le Dojo IA
export interface AIChallengeScenario {
  title: string;
  context: string;
  goal: string; 
}

export interface AIPromptEvaluation {
  score: number; 
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  improvedPrompt: string; 
}

export const mapDomainToKey = (domain: Domain): keyof SkillLevels => {
  switch (domain) {
    case 'Anglais': return 'anglais';
    case 'Développement Web': return 'webDev';
    case 'Ingénierie IA': return 'aiEngineering';
    case 'Conduite': return 'conduite';
    case 'Bibliothèque': return 'bibliotheque';
    case 'Horlogerie': return 'horlogerie';
    default: return 'webDev';
  }
};