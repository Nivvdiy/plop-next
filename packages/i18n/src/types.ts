import type { LocaleTexts, LocaleTag } from "@plop-next/core";

/**
 * Texts for a single prompt field (indexed or not).
 *
 * @example
 * {
 *   message: "What is your name?",
 *   hint: "(required)",
 *   description: "Your full name",
 *   validate: "Name is required",
 * }
 */
export interface PromptFieldTexts {
  message?: string;
  hint?: string;
  description?: string;
  validate?: string;
  instructions?: string;
  helpText?: string;
  noResults?: string;
  searchingText?: string;
  // For 'choices' type prompts
  choices?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Texts for a generator with multiple prompts.
 * Structure: promptName -> { message, hint, description, choices, ... }
 * For arrays of prompts, use numeric indices: name[0], name[1], etc.
 *
 * @example
 * {
 *   description: "Create a new component",
 *   mode: {
 *     message: "Quel mode ?",
 *     choices: { add: "Ajouter", remove: "Supprimer" }
 *   },
 *   name: {
 *     // For indexed prompts
 *     "[0]": { message: "First component name" },
 *     "[1]": { message: "Second component name" }
 *   }
 * }
 */
export interface GeneratorTexts extends Record<string, unknown> {
  description?: string;
  [promptName: string]: PromptFieldTexts | string | unknown;
}

/**
 * Texts for CLI interface (select generator, no generators, etc.)
 *
 * @example
 * {
 *   welcome: "Welcome to plop-next!",
 *   selectGenerator: "Please choose a generator",
 *   noGenerators: "No generators registered",
 *   aborted: "Operation cancelled",
 *   done: "Done!",
 * }
 */
export interface CliTexts {
  welcome?: string;
  welcomeMessage?: string | null;
  selectGenerator?: string;
  noGenerators?: string;
  generatorNotFound?: string | ((...args: unknown[]) => string);
  aborted?: string;
  done?: string;
}

/**
 * @inquirer/prompts locale configuration.
 * These control UI elements like confirm (Yes/No), select help text, etc.
 *
 * @example
 * {
 *   confirm: {
 *     yesLabel: "Yes",
 *     noLabel: "No",
 *     hintYes: "Y/n",
 *     hintNo: "y/N",
 *   },
 *   select: {
 *     helpNavigate: "navigate",
 *     helpSelect: "select",
 *   },
 * }
 */
export interface InquirerTexts {
  confirm?: {
    yesLabel?: string;
    noLabel?: string;
    hintYes?: string;
    hintNo?: string;
  };
  select?: {
    helpNavigate?: string;
    helpSelect?: string;
  };
  checkbox?: {
    helpNavigate?: string;
    helpSelect?: string;
    helpSubmit?: string;
    helpAll?: string;
    helpInvert?: string;
  };
  search?: {
    helpNavigate?: string;
    helpSelect?: string;
  };
  expand?: Record<string, unknown>;
  rawlist?: Record<string, unknown>;
  editor?: {
    waitingMessage?: string | ((enterKey: string) => string);
  };
  input?: Record<string, unknown>;
  number?: Record<string, unknown>;
  password?: {
    maskedText?: string;
  };
}

/**
 * Complete i18n text bundle for a locale.
 * Includes CLI texts, generator-specific texts, and @inquirer/prompts texts.
 *
 * @example
 * {
 *   cli: { ... },
 *   inquirer: { ... },
 *   component: { description: "...", name: { ... } },
 *   myGenerator: { ... },
 * }
 */
export interface LocalizedTextsBundle extends LocaleTexts {
  cli?: CliTexts;
  inquirer?: InquirerTexts;
  [generatorName: string]: unknown;
}

/**
 * Helper type to define all texts for a locale in a type-safe manner.
 * Use as const to ensure proper typing:
 *
 * @example
 * const frTexts: LocaleTextsDef = {
 *   cli: { selectGenerator: "Choisir un générateur" },
 *   inquirer: { confirm: { yesLabel: "Oui" } },
 *   component: { description: "Créer un composant" },
 * } as const;
 */
export type LocaleTextsDef = LocalizedTextsBundle;
