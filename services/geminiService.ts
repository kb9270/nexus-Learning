
import { GoogleGenAI, Type } from "@google/genai";
import { SkillLevels, Quest, EnglishQuestion, AIChallengeScenario, AIPromptEvaluation, UserState } from "../types";
import { SKILL_TREES } from "../data/skillTreeData";

// Initialize the client. API_KEY is expected in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

export const generateDailyQuests = async (skills: SkillLevels, stepsCompleted: number): Promise<Omit<Quest, 'id' | 'isCompleted'>[]> => {
  
  const nextStepStart = stepsCompleted + 1;
  const nextStepEnd = stepsCompleted + 10; 

  const prompt = `
Agis comme "Prométhée", un mentor pour la certification "Responsive Web Design" de FreeCodeCamp (1445 étapes au total).

**ÉTAT ACTUEL DE L'UTILISATEUR :**
- **Étapes validées :** ${stepsCompleted} / 1445.
- **Prochaine étape à faire :** ${nextStepStart}.

**INSTRUCTION DE GÉNÉRATION (JSON) :**
Génère STRICTEMENT 3 Quêtes pour aujourd'hui :

1.  **Quête Anglais (Interactive)** :
    - Choisis un terme technique probable que l'on rencontre aux alentours de l'étape ${nextStepStart} (ex: si HTML débutant : "nesting", "anchor", "attribute").
    - Titre : "Anglais : Le mot du jour"
    - Description : "Traduis et explique en une phrase le terme technique lié à ton étape actuelle."
    - Condition : "Saisie validée".

2.  **Quête Web Dev (Progression)** :
    - L'utilisateur avance pas à pas.
    - Titre : "Sprint FCC : Étapes ${nextStepStart} à ${nextStepEnd}"
    - Description : "Concentre-toi et valide les 10 prochaines étapes sur FreeCodeCamp."
    - Condition : "Valide tes étapes sur le compteur de l'app au fur et à mesure".

3.  **Quête IA (Assistance)** :
    - Titre : "Coach IA"
    - Description : "Demande à Gemini une astuce ou une bonne pratique concernant l'élément HTML que tu es en train d'étudier à l'étape ${nextStepStart}."

Adapte la difficulté aux niveaux : Anglais ${skills.anglais}/10, Web ${skills.webDev}/10.
`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            titre: { type: Type.STRING },
            domaine: { type: Type.STRING, enum: ["Anglais", "Développement Web", "Ingénierie IA"] },
            difficulte: { type: Type.STRING },
            xp_attribuee: { type: Type.NUMBER },
            description: { type: Type.STRING },
            conditions_de_validation: { type: Type.STRING }
          },
          required: ["titre", "domaine", "difficulte", "xp_attribuee", "description", "conditions_de_validation"]
        }
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text);
  }

  throw new Error("No content generated from Gemini");
};

export const generateEnglishDailyTest = async (level: number): Promise<EnglishQuestion[]> => {
    const prompt = `
      Génère un mini-quiz d'anglais technique pour un développeur Web niveau ${level}/10.
      Sujet: Vocabulaire HTML/CSS, verbes d'actions techniques (debug, commit, merge, nest), ou faux-amis.
      
      Format attendu : 3 Questions à Choix Multiples (QCM).
      Chaque question doit avoir 3 choix.
      
      Exemple de question : "What does 'nesting' mean in HTML context?"
    `;
  
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              correctAnswer: { type: Type.STRING, description: "The exact string of the correct option" },
              explanation: { type: Type.STRING, description: "Short explanation in French" }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });
  
    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Failed to generate English test");
  };

// --- AI DOJO FUNCTIONS ---

export const generateAIChallenge = async (level: number): Promise<AIChallengeScenario> => {
    const prompt = `
      Génère un scénario de "Prompt Engineering Challenge" pour un développeur web.
      Niveau de complexité : ${level}/10.
      
      Le but : L'utilisateur doit écrire un prompt pour demander à une IA de générer du code spécifique.
      
      Exemples de scénarios :
      - "Générer une requête SQL complexe avec jointures"
      - "Créer un composant React pour une barre de navigation responsive"
      - "Écrire une Regex pour valider un format spécifique"
      - "Expliquer un bug dans un code Python fourni"

      Génère un seul objet JSON.
    `;

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "Titre court du défi (ex: Le Maître SQL)" },
                    context: { type: Type.STRING, description: "Mise en situation (ex: Vous travaillez sur une app E-commerce...)" },
                    goal: { type: Type.STRING, description: "L'objectif technique précis à faire générer par l'IA." }
                },
                required: ["title", "context", "goal"]
            }
        }
    });

    if (response.text) {
        return JSON.parse(response.text);
    }
    throw new Error("Failed to generate AI Challenge");
};

export const evaluateUserPrompt = async (scenario: AIChallengeScenario, userPrompt: string): Promise<AIPromptEvaluation> => {
    const prompt = `
      Tu es un expert mondial en Prompt Engineering.
      
      SCÉNARIO INITIAL :
      Contexte : ${scenario.context}
      Objectif : ${scenario.goal}
      
      PROMPT DE L'UTILISATEUR :
      "${userPrompt}"
      
      TA MISSION :
      Évalue la qualité du prompt de l'utilisateur pour obtenir le meilleur code possible d'un LLM.
      Critères : Clarté, Contexte fourni, Contraintes techniques (langage, format), Gestion des cas limites.
      
      Donne un score sur 100.
      Donne un feedback constructif.
      Propose une version "Golden Prompt" (le prompt parfait).
    `;

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.NUMBER, description: "Score sur 100" },
                    feedback: { type: Type.STRING, description: "Analyse critique en Français" },
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Points forts du prompt utilisateur" },
                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Points faibles ou manquants" },
                    improvedPrompt: { type: Type.STRING, description: "La version optimisée du prompt" }
                },
                required: ["score", "feedback", "improvedPrompt"]
            }
        }
    });

    if (response.text) {
        return JSON.parse(response.text);
    }
    throw new Error("Failed to evaluate prompt");
};

// --- SKILL TREE ADVISOR ---

export const generateSkillTreeAdvice = async (userState: UserState): Promise<{ advice: string; suggestedNodeId: string }> => {
  // Simple serialization of unlocked nodes for context
  const unlocked = userState.unlockedNodes.join(', ');
  const skills = JSON.stringify(userState.skillLevels);
  
  const prompt = `
    Agis comme Prométhée, un conseiller en stratégie RPG pour un développeur.
    
    L'utilisateur a ces niveaux de compétences : ${skills}
    Il a débloqué ces compétences dans son arbre : ${unlocked || "Aucune pour l'instant"}.
    Il a ${userState.buildPoints} Points de Build (BP) et des Points de Compétence (SP).

    Analyse sa progression et suggère LA prochaine compétence à débloquer dans l'arbre pour optimiser son build "Full Stack AI Engineer".
    Sois bref, motivant et stratégique.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                advice: { type: Type.STRING, description: "Conseil court et stratégique (max 2 phrases)" },
                suggestedNodeId: { type: Type.STRING, description: "ID du nœud suggéré (si connu, sinon laisser vide)" }
            }
        }
    }
  });

  if (response.text) {
      return JSON.parse(response.text);
  }
  return { advice: "Concentrez-vous sur les fondamentaux pour l'instant.", suggestedNodeId: "" };
};
