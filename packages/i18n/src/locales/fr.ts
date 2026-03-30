import type { LocaleTexts } from "@plop-next/core";

/**
 * French translations for plop-next built-in messages.
 * Covers the same key structure as `@plop-next/core` English messages.
 */
export const FR_MESSAGES: LocaleTexts = {
  cli: {
    title: "Bienvenue dans plop-next ! 🚀",
    welcomeMessage: null,
    selectGenerator: "Veuillez choisir un générateur",
    noGenerators:
      "Aucun générateur enregistré. Ajoutez-en dans votre plopfile.",
    generatorNotFound: (name: string) => `Générateur "${name}" introuvable.`,
    aborted: "Annulé.",
    done: "Terminé !",
    promptCancelled: "Console fermée par l'utilisateur.",
  },

  inquirer: {
    confirm: {
      yesLabel: "Oui",
      noLabel: "Non",
      hintYes: "O/n",
      hintNo: "o/N",
    },
    select: {
      helpNavigate: "naviguer",
      helpSelect: "sélectionner",
    },
    checkbox: {
      helpNavigate: "naviguer",
      helpSelect: "sélectionner",
      helpSubmit: "soumettre",
      helpAll: "tout",
      helpInvert: "inverser",
    },
    search: {
      helpNavigate: "naviguer",
      helpSelect: "sélectionner",
    },
    editor: {
      waitingMessage: (enterKey: any) =>
        `Appuyez sur ${enterKey} pour lancer votre éditeur préféré.`,
    },
    password: {
      maskedText: "[saisie masquée]",
    },
  },

  actions: {
    add: {
      creating: (path: string) => `Création de ${path}`,
      created: (path: string) => `✔ Créé ${path}`,
      alreadyExists: (path: string) => `Le fichier existe déjà : ${path}`,
    },
    modify: {
      modifying: (path: string) => `Modification de ${path}`,
      modified: (path: string) => `✔ Modifié ${path}`,
      notFound: (path: string) => `Fichier introuvable : ${path}`,
      patternNotFound: (path: string) => `Motif introuvable dans : ${path}`,
    },
    append: {
      appending: (path: string) => `Ajout dans ${path}`,
      appended: (path: string) => `✔ Ajouté dans ${path}`,
    },
  },

  errors: {
    unknownAction: (type: string) => `Type d'action inconnu : "${type}"`,
    plopfileNotFound:
      "Impossible de trouver un plopfile (plopfile.js ou plopfile.ts).",
    plopfileLoadFailed: (err: string) =>
      `Échec du chargement du plopfile : ${err}`,
    generatorNotFound: (name: string) => `Générateur "${name}" introuvable.`,
    noGenerators:
      "Aucun générateur enregistré. Ajoutez-en dans votre plopfile.",
    invalidPrompt: (name: string, reason: string) =>
      `Prompt invalide "${name}" : ${reason}`,
    bypassParse: (
      promptName: string,
      promptType: string,
      value: string,
      detail?: string,
    ) =>
      `Impossible d'assigner la valeur de bypass "${value}" au prompt ${promptType} "${promptName}"${detail ? `: ${detail}` : ""}`,
    plopfileLoad: (path: string) => `Échec du chargement du plopfile : ${path}`,
    plopfileExport: "Le plopfile doit exporter une fonction par défaut.",
    userCancelled: "Prompt annulé par l'utilisateur.",
    plopfileNotFoundWarning:
      "Aucun plopfile trouvé. Créez un plopfile.js dans votre projet.",
    forcedLangI18nMissing: (locale: string) =>
      `La locale forcée "${locale}" est ignorée car @plop-next/i18n n'est pas installé. Repli sur l'anglais.`,
    forcedLangUnavailable: (locale: string) =>
      `La locale forcée "${locale}" n'est pas disponible. Repli sur l'anglais.`,
  },

  /**
   * CLI `--help` display texts — French.
   * Read-only: cannot be overridden via `registerLocale` / `registerTexts`.
   */
  help: {
    usage: "Utilisation :",
    usage1: "Choisir dans la liste des générateurs disponibles",
    usage2: "Executer un générateur enregistre sous ce nom",
    usage3:
      "Executer le générateur avec des donnees d'entree pour passer les prompts",
    options: "Options :",
    optHelp: "Afficher cette aide",
    optShowTypeNames: "Afficher les noms de type au lieu des abréviations",
    optInitTitle: "Initialisation du Plopfile",
    optGenerateTitle: "Générer des fichiers Locale, Texts, Theme",
    optOthersTitle: "Autres options",
    optInit: "Générer un plopfile.ts de base",
    optInitJs: "Générer un plopfile.js de base",
    optInitTs: "Générer un plopfile.ts de base",
    optDemo: "Générer un générateur de demo dans le plopfile",
    optI18n: "Initialiser le plopfile avec le support i18n",
    optGenerate: "Générer un modèle : locale | textes | thème",
    optPath: "Répertoire de sortie de base pour les fichiers de modèle générés",
    optExtension: "Extension de fichier générée : ts | js | json",
    optIncludeCustomTexts:
      "Pour la génération de locale, inclure les clés traduisibles du plopfile",
    optVersion: "Afficher la version courante",
    optForce: "Executer le générateur en mode force",
    optLang: "Forcer la locale d'affichage (ex. en, fr)",
    danger: "le danger attend ceux qui s'aventurent sous la ligne",
    lowPlopfile: "Chemin vers le plopfile",
    lowCwd:
      "Repertoire de base pour calculer les chemins relatifs pendant la recherche du plopfile",
    lowPreload: "Chaine ou tableau de modules a charger avant plop-next",
    lowDest:
      "Écrire la sortie dans ce dossier au lieu du dossier parent du plopfile",
    lowNoProgress: "Désactiver le spinner de progression",
    examples: "Exemples :",
  },
} as const;
