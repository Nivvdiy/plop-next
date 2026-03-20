import type { LocaleTexts } from "@plop-next/core";

/**
 * French translations for plop-next built-in messages.
 * Covers the same key structure as `@plop-next/core` English messages.
 */
export const FR_MESSAGES: LocaleTexts = {
  cli: {
    welcome: "Bienvenue dans plop-next ! 🚀",
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
    password: {
      maskedText: "[entrée masquée]",
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
      patternNotFound: (path: string) =>
        `Motif introuvable dans : ${path}`,
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
  },
} as const;
