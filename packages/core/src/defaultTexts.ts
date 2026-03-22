import type { HelpTexts, LocaleTexts } from "./types";

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
    forcedLangI18nMissing: (locale: string) =>
      `Forced locale "${locale}" ignored because @plop-next/i18n is not installed. Falling back to English.`,
    forcedLangUnavailable: (locale: string) =>
      `Forced locale "${locale}" is not available. Falling back to English.`,
  },

  /**
   * CLI `--help` display texts.
   * These are read-only and cannot be overridden via `registerLocale` / `registerTexts`.
   */
  help: {
    usage: "Usage:",
    usage1: "Select from a list of available generators",
    usage2: "Run a generator registered under that name",
    usage3: "Run the generator with input data to bypass prompts",
    options: "Options:",
    optHelp: "Show this help display",
    optShowTypeNames: "Show type names instead of abbreviations",
    optInit: "Generate a basic plopfile.ts",
    optInitJs: "Generate a basic plopfile.js",
    optInitTs: "Generate a basic plopfile.ts",
    optDemo: "Generate a demo generator in the plopfile",
    optI18n: "Initialize plopfile with i18n support",
    optVersion: "Print current version",
    optForce: "Run the generator forcefully",
    optLang: "Force display locale (e.g. en, fr)",
    danger: "danger waits for those who venture below the line",
    lowPlopfile: "Path to the plopfile",
    lowCwd:
      "Directory from which relative paths are calculated while locating the plopfile",
    lowPreload:
      "String or array of modules to require before running plop-next",
    lowDest:
      "Output to this directory instead of the plopfile parent directory",
    lowNoProgress: "Disable the progress spinner",
    lowCompletion: "Output shell completion script (bash|zsh|fish)",
    examples: "Examples:",
  } satisfies HelpTexts,
} as const;

/**
 * Backward-compatible alias.
 * Prefer `CORE_DEFAULT_TEXTS`.
 */
export const CORE_DEFAULT_TEXTS_EN: LocaleTexts = CORE_DEFAULT_TEXTS;

/**
 * Typed accessor for the built-in English help texts.
 * Use this in the CLI to render `--help` output.
 */
export const CORE_DEFAULT_HELP_TEXTS: HelpTexts =
  CORE_DEFAULT_TEXTS.help as HelpTexts;
