import { styleText } from "node:util";

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Union type representing the possible statuses of a prompt.
 */
export type Status = "loading" | "idle" | "done" | (string & {});

export type DefaultTheme = {
  /**
   * Prefix shown before the prompt message.
   */
  prefix: string | Prettify<Omit<Record<Status, string>, "loading">>;

  /**
   * Spinner shown while prompt status is "loading".
   */
  spinner: {
    interval: number;
    frames: string[];
  };

  /**
   * Functions used to style prompt segments.
   */
  style: {
    answer: (text: string) => string;
    message: (text: string, status: Status) => string;
    error: (text: string) => string;
    defaultAnswer: (text: string) => string;
    help: (text: string) => string;
    highlight: (text: string) => string;
    key: (text: string) => string;
  };

  /**
   * plop-next specific CLI style helpers.
   */
  plopNext: {
    welcome: (text: string) => string;
    generatorMenu: {
      title: (text: string) => string;
      description: (text: string) => string;
    };
    actionLog: {
      success: (text: string) => string;
      error: (text: string) => string;
      skipped: (text: string) => string;
      info: (text: string) => string;
    };
  };
};

export type Theme<Extension extends object = object> = Prettify<Extension & DefaultTheme>;

export const defaultTheme: DefaultTheme = {
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
    key: (text: string) => styleText("cyan", styleText("bold", `<${text}>`)),
  },
  plopNext: {
    welcome: (text: string) => styleText("dim", text),
    generatorMenu: {
      title: (text: string) => styleText("bold", text),
      description: (text: string) => styleText("dim", text),
    },
    actionLog: {
      success: (text: string) => styleText("green", text),
      error: (text: string) => styleText("red", text),
      skipped: (text: string) => styleText("yellow", text),
      info: (text: string) => styleText("dim", text),
    },
  },
};
