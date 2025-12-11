
import { SkillTreeDefinition } from '../types';

export const SKILL_TREES: SkillTreeDefinition[] = [
  {
    domain: 'Anglais',
    branches: [
      {
        id: 'eng_lexique',
        name: 'A. Lexique IA',
        description: 'Maîtrise du vocabulaire technique et des concepts IA.',
        nodes: [
          { id: 'en_lex_1', title: 'Bases Techniques', description: 'Vocabulaire essentiel du web.', cost: 1, costType: 'SP', perk: '+5% XP sur les Quêtes Anglais' },
          { id: 'en_lex_2', title: 'Jargon LLM', description: 'Comprendre tokens, context window, RAG.', cost: 1, costType: 'SP', parentId: 'en_lex_1', perk: 'Débloque les tests Anglais "Avancé"' },
          { id: 'en_lex_3', title: 'Expert Sémantique', description: 'Nuances fines des instructions.', cost: 1, costType: 'BP', parentId: 'en_lex_2', perk: 'Bonus: Générateur de Glossaire Personnel' }
        ]
      },
      {
        id: 'eng_oral',
        name: 'B. Communication',
        description: 'Fluidité des échanges et simulations orales.',
        nodes: [
          { id: 'en_com_1', title: 'Short Answers', description: 'Réponses concises et efficaces.', cost: 1, costType: 'SP', perk: '+1 Coin par bonne réponse' },
          { id: 'en_com_2', title: 'Debate Club', description: 'Argumenter ses choix techniques.', cost: 2, costType: 'SP', parentId: 'en_com_1' },
        ]
      }
    ]
  },
  {
    domain: 'Développement Web',
    branches: [
      {
        id: 'code_fund',
        name: 'A. Fondamentaux',
        description: 'Syntaxe, Algo et Structures de données.',
        nodes: [
          { id: 'co_fun_1', title: 'Clean Code', description: 'Variables et fonctions propres.', cost: 1, costType: 'SP', perk: 'Débloque les défis "Refactoring"' },
          { id: 'co_fun_2', title: 'Algo Master', description: 'Boucles et conditions complexes.', cost: 1, costType: 'SP', parentId: 'co_fun_1' },
          { id: 'co_fun_3', title: 'Pythonic Way', description: 'List comprehensions & decorators.', cost: 2, costType: 'BP', parentId: 'co_fun_2', perk: 'Accès anticipé aux solutions' }
        ]
      },
      {
        id: 'code_api',
        name: 'B. API & Frameworks',
        description: 'Connexion aux modèles et