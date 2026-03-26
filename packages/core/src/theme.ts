import { styleText } from "node:util";
import figures from "figures";
import type { Separator } from "./prompts/Separator";

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Union type representing the possible statuses of a prompt.
 */
export type Status = "loading" | "idle" | "done" | (string & {});

/**
 * A keybinding entry associating one or more key sequences to a named action.
 */
export type Keybinding = {
  key: string | string[];
  action: string;
  description?: string;
};

export const BUILT_IN_PROMPT_TYPES = [
  "input",
  "select",
  "list",
  "checkbox",
  "confirm",
  "search",
  "password",
  "expand",
  "editor",
  "number",
  "rawlist",
] as const;

export type PromptThemeType = (typeof BUILT_IN_PROMPT_TYPES)[number];

type NormalizedChoice<Value> = {
  value: Value;
  name: string;
  checkedName: string;
  description?: string;
  short: string;
  disabled: boolean | string;
  checked: boolean;
};

export type DefaultTheme = {
  icon?: string | {
    /** Idle state icon (used by prefix-like contexts). */
    idle?: string;
    /** Done state icon (used by prefix-like contexts). */
    done?: string;
    /** Cursor icon, used by select/list/checkbox to mark the focused item. */
    cursor?: string;
    /** Checked icon, used by checkbox for selected items. */
    checked?: string;
    /** Unchecked icon, used by checkbox for unselected items. */
    unchecked?: string;
    /** Checked icon shown for a disabled-but-checked item in checkbox prompts. */
    disabledChecked?: string;
    /** Unchecked icon shown for a disabled-but-unchecked item in checkbox prompts. */
    disabledUnchecked?: string;
  };

  /**
   * Prefix shown before the prompt message.
   */
  prefix?: string | Prettify<Omit<Record<Status, string>, "loading">>;

  /**
   * Spinner shown while prompt status is "loading".
   */
  spinner?: {
    interval?: number;
    frames?: string[];
  };

  /**
   * Functions used to style prompt segments.
   */
  style?: {
    answer?: (text: string) => string;
    message?: (text: string, status: Status) => string;
    error?: (text: string) => string;
    defaultAnswer?: (text: string) => string;
    help?: (text: string) => string;
    highlight?: (text: string) => string;
    description?: (text: string) => string;
    disabled?: (text: string) => string;
    /** Styles a disabled choice label (checkbox). */
    disabledChoice?: (text: string) => string;
    /** Styles the active search term in a search prompt. */
    searchTerm?: (text: string) => string;
    /**
     * Renders the summary of selected choices for a checkbox prompt.
     * Receives the selected choices and the full list (including Separators).
     */
    renderSelectedChoices?: <T>(
      selectedChoices: ReadonlyArray<NormalizedChoice<T>>,
      allChoices: ReadonlyArray<NormalizedChoice<T> | Separator>,
    ) => string;
    /**
     * Formats the keyboard shortcuts tip shown below a prompt.
     * - `input` passes `string[]`
     * - `select` / `list` / `checkbox` pass `[key: string, action: string][]` (paires)
     * Can return `undefined` to hide the tip entirely.
     */
    keysHelpTip?: (keys: [key: string, action: string][]) => string | undefined;
    key?: (text: string) => string;
    /**
     * Static text displayed as a masked placeholder in password prompts
     * when no mask character is set.
     */
    maskedText?: string;
    /** Message shown while waiting for the user to open the editor (editor prompts). */
    waitingMessage?: (enterKey: string) => string;
  };

  validationFailureMode?: "keep" | "clear";

  indexMode?: "hidden" | "number";

  /** Internationalisation strings used by individual prompt types. */
  i18n?: {
    /** Message shown when the user tries to interact with a disabled option. */
    disabledError?: string;
  };

  /**
   * Custom keybindings appended to the default set of a prompt.
   * Each entry maps one or more key sequences to a named action.
   */
  keybindings?: ReadonlyArray<Keybinding>;

  /**
   * plop-next specific CLI style helpers.
   */
  plopNext?: {
    welcome?: (text: string) => string;
    generatorMenu?: {
      title?: (text: string) => string;
      description?: (text: string) => string;
    };
    actionLog?: {
      success?: (text: string) => string;
      error?: (text: string) => string;
      warning?: (text: string) => string;
      skipped?: (text: string) => string;
      info?: (text: string) => string;
    };
    errors?: {
      prefix?: {
        error?: string;
        warning?: string;
      };
      error?: (text: string) => string;
      warning?: (text: string) => string;
    };
  };
};

export type Theme<Extension extends object = object> = Prettify<Extension & DefaultTheme>;

/**
 * Shorthand aliases accepted in theme configs.
 * They are normalized to style/i18n at runtime.
 */
export type ThemeAliases = {
  waitingMessage?: (enterKey: string) => string;
  maskedText?: string;
  disabledError?: string;
};

/**
 * One theme scope (global or prompt-specific).
 */
export type PromptThemeScope = Prettify<Partial<Theme> & ThemeAliases>;

/**
 * Public theme input accepted by setTheme/core config.
 * Allows global fields and per-prompt overrides at the same level.
 */
export type ThemeConfig = Prettify<
  PromptThemeScope &
  Partial<Record<PromptThemeType, PromptThemeScope>>
>;

export const defaultTheme: DefaultTheme = {
  icon: {
    idle: styleText('blue', '?'),
    done: styleText('green', figures.tick),
    cursor: figures.pointer,
    checked: styleText('green', figures.circleFilled),
    unchecked: figures.circle,
    disabledChecked: styleText('green', figures.circleDouble),
    disabledUnchecked: "-",
  },
  prefix: {
    idle: styleText('blue', '?'),
    done: styleText('green', figures.tick),
  },
  spinner: {
    interval: 80,
    frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'].map((frame) =>
      styleText('yellow', frame),
    ),
  },
  style: {
    answer: (text: string) => styleText("cyan", text),
    message: (text: string) => styleText("bold", text),
    error: (text: string) => styleText("red", `> ${text}`),
    defaultAnswer: (text: string) => styleText("dim", `(${text})`),
    help: (text: string) => styleText("dim", text),
    highlight: (text: string) => styleText("cyan", text),
    description: (text: string) => styleText('cyan', text),
    disabled: (text: string) => styleText('dim', text),
    disabledChoice: (text: string) => styleText("dim", `- ${text}`),
    searchTerm: (text: string) => styleText('cyan', text),
    renderSelectedChoices: (selectedChoices) =>
      selectedChoices.map((choice) => choice.short).join(', '),
    keysHelpTip: (keys: [string, string][]) =>
      keys
        .map(([key, action]) => `${styleText('bold', key)} ${styleText('dim', action)}`)
        .join(styleText('dim', ' • ')),
    key: (text: string) => styleText("cyan", styleText("bold", `<${text}>`)),
    maskedText: "[input is masked]",
    waitingMessage: (enterKey: string) =>
      `Press ${enterKey} to launch your preferred editor.`,
  },
  validationFailureMode: "keep",
  indexMode: "hidden",
  i18n: {
    disabledError: "This option is disabled and cannot be selected.",
  },
  keybindings: [] as ReadonlyArray<Keybinding>,
  plopNext: {
    welcome: (text: string) => styleText("dim", text),
    generatorMenu: {
      title: (text: string) => styleText("bold", text),
      description: (text: string) => styleText("dim", text),
    },
    actionLog: {
      success: (text: string) => styleText("green", text),
      error: (text: string) => styleText("red", text),
      warning: (text: string) => styleText("yellow", text),
      skipped: (text: string) => styleText("yellow", text),
      info: (text: string) => styleText("dim", text),
    },
    errors: {
      prefix: {
        error: "✖",
        warning: "⚠",
      },
      error: (text: string) => styleText("red", text),
      warning: (text: string) => styleText("yellow", text),
    },
  },
};

/**
 * Type-specific theme overrides for each @inquirer/prompts prompt type.
 * These are merged after the global defaultTheme.
 */
export const PROMPT_TYPE_THEMES: Partial<Record<PromptThemeType, PromptThemeScope>> = {
  /**
   * Checkbox-specific defaults.
   * - Different disabledError message ("toggled" instead of "selected")
   */
  checkbox: {
    i18n: {
      disabledError: "This option is disabled and cannot be toggled.",
    },
  },

  /**
   * Search-specific defaults.
   * - Disabled items are prefixed with "- " for visibility
   */
  search: {
    style: {
      disabled: (text: string) => styleText("dim", `- ${text}`),
    },
  },
};
