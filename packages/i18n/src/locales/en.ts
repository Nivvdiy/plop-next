import type { LocaleTag, LocaleTexts } from "@plop-next/core";

export const EN_MESSAGES: LocaleTexts = {
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
  },
} as const;

export const BASE_LOCALE: LocaleTag = "en";
