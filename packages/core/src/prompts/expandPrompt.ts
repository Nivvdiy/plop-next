import { expand } from "@inquirer/prompts";
import type { PromptHandler, PromptHandlerConfig } from "./types";

type ExpandPromptFn = (config: Record<string, unknown>) => Promise<unknown>;

export const expandPromptHandler: PromptHandler = {
  types: ["expand"],

  async ask(_type: string, config: PromptHandlerConfig): Promise<unknown> {
    const {
      name: _name,
      message,
      choices,
      default: defaultValue,
      expanded,
      ...rest
    } = config;

    if (choices === undefined) {
      throw new Error('Prompt type "expand" requires a "choices" field.');
    }

    const unsupportedKeys = Object.keys(rest);
    if (unsupportedKeys.length > 0) {
      throw new Error(
        `Prompt type "expand" does not support: ${unsupportedKeys.join(", ")}. ` +
          `Supported fields are: message, choices, default, expanded.`,
      );
    }

    if (expanded !== undefined && typeof expanded !== "boolean") {
      throw new Error('Prompt type "expand" expects "expanded" to be a boolean.');
    }

    if (defaultValue !== undefined && typeof defaultValue !== "string") {
      throw new Error('Prompt type "expand" expects "default" to be a string key.');
    }

    const runExpand = expand as unknown as ExpandPromptFn;
    return runExpand({
      message: String(message ?? ""),
      choices: choices as unknown[],
      ...(defaultValue !== undefined && { default: defaultValue }),
      ...(expanded !== undefined && { expanded }),
    });
  },
};
