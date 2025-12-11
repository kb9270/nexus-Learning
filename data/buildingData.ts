
import { BuildingDefinition } from '../types';

export const BUILDINGS: BuildingDefinition[] = [
    {
      "domaine": "Développement Web",
      "progression": [
        {
          "niveau": 1,
          "titre": "Atelier de Code Débutant",
          "description_visuelle": "Une petite cabane en bois avec une antenne satellite rudimentaire.",
          "exigence": 0,
          "unite_exigence": "Quêtes Validées"
        },
        {
          "niveau": 2,
          "titre": "Laboratoire d'Algorithmes",
          "description_visuelle": "Un bâtiment moderne en briques rouges avec de grandes fenêtres et des serveurs visibles à l'intérieur.",
          "exigence": 100,
          "unite_exigence": "Quêtes Validées"
        },
        {
          "niveau": 3,
          "titre": "Usine Logicielle",
          "description_visuelle": "Un complexe industriel à plusieurs étages avec des lignes d'assemblage de robots (virtuels).",
          "exigence": 500,
          "unite_exigence": "Quêtes Validées"
        }
      ]
    },
    {
      "domaine": "Anglais",
      "progression": [
        {
          "niveau": 1,
          "titre": "Cahier de Notes",
          "description_visuelle": "Un pupitre simple à côté d'une chaise, avec un dictionnaire ouvert.",
          "exigence": 0,
          "unite_exigence": "Mots Maîtrisés"
        },
        {
          "niveau": 2,
          "titre": "Bibliothèque Technique",
          "description_visuelle": "Une petite pièce remplie de livres techniques en anglais et d'écrans de traduction.",
          "exigence": 50,
          "unite_exigence": "Mots Maîtrisés"
        },
        {
          "niveau": 3,
          "titre": "Centre de Traduction Internationale",
          "description_visuelle": "Un grand dôme de verre avec des symboles linguistiques flottants.",
          "exigence": 200,
          "unite_exigence": "Mots Maîtrisés"
        }
      ]
    },
    {
      "domaine": "Ingénierie IA",
      "progression": [
        {
          "niveau": 1,
          "titre": "Antenne d'Observation",
          "description_visuelle": "Une petite antenne parabolique pointant vers le ciel.",
          "exigence": 0,
          "unite_exigence": "Prompts Testés"
        },
        {
          "niveau": 2,
          "titre": "Centre de Données Gemini",
          "description_visuelle": "Une pièce souterraine blindée avec des racks de serveurs lumineux.",
          "exigence": 30,
          "unite_exigence": "Prompts Testés"
        },
        {
          "niveau": 3,
          "titre": "Forge de Modèles",
          "description_visuelle": "Une haute tour avec une énergie bleu-électrique pulsing au sommet.",
          "exigence": 150,
          "unite_exigence": "Prompts Testés"
        }
      ]
    },
    {
        "domaine": "Conduite",
        "progression": [
            {
                "niveau": 1,
                "titre": "Garage Personnel",
                "description_visuelle": "Un petit garage avec des outils et une voiture en réparation.",
                "exigence": 0,
                "unite_exigence": "KM parcourus"
            },
            {
                "niveau": 2,
                "titre": "École de Pilotage",
                "description_visuelle": "Un circuit asphalté avec des cônes et une tour de contrôle.",
                "exigence": 50,
                "unite_exigence": "KM parcourus"
            },
            {
                "niveau": 3,
                "titre": "Hub de Transport",
                "description_visuelle": "Une station futuriste avec des véhicules autonomes en mouvement constant.",
                "exigence": 200,
                "unite_exigence": "KM parcourus"
            }
        ]
    },
    {
        "domaine": "Bibliothèque",
        "progression": [
            {
                "niveau": 1,
                "titre": "Coin Lecture",
                "description_visuelle": "Un fauteuil confortable sous une lampe, entouré de quelques piles de livres.",
                "exigence": 0,
                "unite_exigence": "Livres lus"
            },
            {
                "niveau": 2,
                "titre": "Archives Municipales",
                "description_visuelle": "Un bâtiment classique avec des colonnes et des rangées infinies d'étagères.",
                "exigence": 10,
                "unite_exigence": "Livres lus"
            },
            {
                "niveau": 3,
                "titre": "Sanctuaire du Savoir",
                "description_visuelle": "Une structure cristalline flottante où les livres tournent en orbite.",
                "exigence": 50,
                "unite_exigence": "Livres lus"
            }
        ]
    },
    {
        "domaine": "Horlogerie",
        "progression": [
            {
                "niveau": 1,
                "titre": "Établi d'Apprenti",
                "description_visuelle": "Une table de travail avec des loupes et des petits engrenages éparpillés.",
                "exigence": 0,
                "unite_exigence": "Montres réparées"
            },
            {
                "niveau": 2,
                "titre": "Atelier de Précision",
                "description_visuelle": "Une boutique élégante avec des horloges de toutes les époques aux murs.",
                "exigence": 5,
                "unite_exigence": "Montres réparées"
            },
            {
                "niveau": 3,
                "titre": "Maître du Temps",
                "description_visuelle": "Une tour d'horloge géante avec des mécanismes visibles et complexes à l'extérieur.",
                "exigence": 20,
                "unite_exigence": "Montres réparées"
            }
        ]
    }
];