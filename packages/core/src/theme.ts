import { styleText } from "node:util";

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Union type representing the possible statuses of a prompt.
 */
export type Status = "loading" | "idle" | "done" | (string & {});

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
    renderSelectedChoices?: (
      selectedChoices: ReadonlyArray<unknown>,
      allChoices: ReadonlyArray<unknown>,
    ) => string;
    /**
     * Formats the keyboard shortcuts tip shown below a prompt.
     * - `input` passes `string[]`
     * - `select` / `list` / `checkbox` pass `[key: string, action: string][]` (paires)
     * Can return `undefined` to hide the tip entirely.
     */
    keysHelpTip?: (keys: [string, string][] | string[]) => string | undefined;
    key?: (text: string) => string;
  };

  validationFailureMode?: "keep" | "clear";

  indexMode?: "hidden" | "number";

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

export const defaultTheme: DefaultTheme = {
  icon: {
    idle: "?",
    done: "v",
    cursor: "❯",
    checked: "◉",
    unchecked: "◯",
  },
  prefix: {
    idle: styleText("blue", "?"),
    done: styleText("green", "v"),
  },
  spinner: {
    interval: 80,
    frames: ["-", "\\", "|", "/"].map((frame) => styleText("yellow", frame)),
  },
  style: {
    answer: (text: string) => styleText("cyan", text),
    message: (text: string) => styleText("bold", text),
    error: (text: string) => styleText("red", `> ${text}`),
    defaultAnswer: (text: string) => styleText("dim", `(${text})`),
    help: (text: string) => styleText("dim", text),
    highlight: (text: string) => styleText("cyan", text),
    description: (text: string) => styleText("dim", text),
    disabled: (text: string) => styleText("dim", text),
    disabledChoice: (text: string) => styleText("dim", `- ${text}`),
    searchTerm: (text: string) => styleText("cyan", text),
    renderSelectedChoices: (selectedChoices: ReadonlyArray<unknown>) =>
      (selectedChoices as Array<{ name?: string; value?: unknown }>)
        .map((c) => c.name ?? String(c.value ?? ""))
        .join(", "),
    keysHelpTip: (keys: [string, string][] | string[]) => {
      const parts = (keys as unknown[]).map((k) =>
        Array.isArray(k) ? `${k[0]}: ${k[1]}` : String(k),
      );
      return styleText("dim", parts.join(" • "));
    },
    key: (text: string) => styleText("cyan", styleText("bold", `<${text}>`)),
  },
  validationFailureMode: "keep",
  indexMode: "number",
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
