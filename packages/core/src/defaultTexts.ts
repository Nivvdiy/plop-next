import type { LocaleTexts } from "./types";

/**
 * Core-owned default UI texts used by plop-next.
 * This file is intentionally locale-agnostic from a folder/filename perspective.
 */
export const CORE_DEFAULT_TEXTS: LocaleTexts = {
  cli: {
    welcome: "Welcome to plop-next! 🚀",
    welcomeMessage: null,
    selectGenerator: "Please choose a generator",
    noGenerators: "No generators registered. Add some to your plopfile.",
    generatorNotFound: (name: string) => `Generator \"${name}\" not found.`,
    aborted: "Aborted.",
    done: "Done!",
    promptCancelled: "Console exited by user.",
  },

  inquirer: {
    confirm: {
      yesLabel: "Yes",
      noLabel: "No",
      hintYes: "Y/n",
      hintNo: "y/N",
    },
    select: {
      helpNavigate: "navigate",
      helpSelect: "select",
    },
    checkbox: {
      helpNavigate: "navigate",
      helpSelect: "select",
      helpSubmit: "submit",
      helpAll: "toggle all",
      helpInvert: "invert selection",
    },
    search: {
      helpNavigate: "navigate",
      helpSelect: "select",
    },
    password: {
      maskedText: "[input is hidden]",
    },
  },

  actions: {
    add: {
      creating: (path: string) => `Creating ${path}`,
      created: (path: string) => `✔ Created ${path}`,
      alreadyExists: (path: string) => `File already exists: ${path}`,
    },
    modify: {
      modifying: (path: string) => `Modifying ${path}`,
      modified: (path: string) => `✔ Modified ${path}`,
      notFound: (path: string) => `File not found: ${path}`,
      patternNotFound: (path: string) => `Pattern not found in: ${path}`,
    },
    append: {
      appending: (path: string) => `Appending to ${path}`,
      appended: (path: string) => `✔ Appended to ${path}`,
    },
  },

  errors: {
    unknownAction: (type: string) => `Unknown action type: \"${type}\"`,
    plopfileNotFound: "Could not find a plopfile (plopfile.js or plopfile.ts).",
    plopfileLoadFailed: (err: string) => `Failed to load plopfile: ${err}`,
    generatorNotFound: (name: string) => `Generator \"${name}\" not found.`,
    noGenerators: "No generators registered. Add some to your plopfile.",
    invalidPrompt: (name: string, reason: string) =>
      `Invalid prompt \"${name}\": ${reason}`,
    bypassParse: (
      promptName: string,
      promptType: string,
      value: string,
      detail?: string,
    ) =>
      `Cannot assign bypass value \"${value}\" to ${promptType} prompt \"${promptName}\"${detail ? `: ${detail}` : ""}`,
    plopfileLoad: (path: string) => `Failed to load plopfile: ${path}`,
    plopfileExport: "Plopfile must export a default function.",
    userCancelled: "Prompt cancelled by user.",
    plopfileNotFoundWarning:
      "No plopfile found. Create a plopfile.js in your project.",
  },
} as const;

/**
 * Backward-compatible alias.
 * Prefer `CORE_DEFAULT_TEXTS`.
 */
export const CORE_DEFAULT_TEXTS_EN: LocaleTexts = CORE_DEFAULT_TEXTS;
