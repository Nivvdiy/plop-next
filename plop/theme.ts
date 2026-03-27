import { styleText } from "node:util";

const spinnerFrames = [
  ".     ",
  " .    ",
  "  .   ",
  "   .  ",
  "    . ",
  "     .",
  "      ",
].map((frame) => styleText("magenta", frame));

const Theme = {
  prefix: {
    idle: styleText("magenta", ">>"),
    done: styleText("yellow", "OK"),
  },
  spinner: {
    interval: 100,
    frames: spinnerFrames,
  },
  style: {
    answer: (text: string) => styleText("magenta", text),
    message: (text: string) => styleText(["bold", "white"], text),
    error: (text: string) => styleText(["redBright", "underline"], `> ${text}`),
    defaultAnswer: (text: string) => styleText("green", `(${text})`),
    help: (text: string) => styleText(["italic", "cyan"], text),
    highlight: (text: string) => styleText("yellow", text),
    key: (text: string) => styleText(["yellow", "bold"], `<${text}>`),
    waitingMessage: (enterKey: string) =>
      styleText("gray", `Press ${enterKey} to launch your preferred editor.`),
    maskedText: styleText("gray", "[input is masked]"),
  },
  i18n: {
    disabledError: "This option is disabled and cannot be selected.",
  },
  plopNext: {
    welcome: (text: string) => styleText(["bold", "magenta"], text),
    generatorMenu: {
      title: (text: string) => styleText(["bold", "yellow"], text),
      description: (text: string) => styleText("magenta", text),
    },
    actionLog: {
      success: (text: string) => styleText("yellow", `+ ${text}`),
      skipped: (text: string) => styleText("magenta", `- ${text}`),
      info: (text: string) => styleText("white", text),
    },
    errors: {
      prefix: {
        error: styleText(["bold", "red"], "ERR"),
        warning: styleText(["bold", "yellow"], "WARN"),
      },
      error: (text: string) => styleText(["bold", "red"], text),
      warning: (text: string) => styleText(["bold", "yellow"], text),
    },
  },
};

export default Theme;
