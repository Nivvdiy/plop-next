import { rawlist } from "@inquirer/prompts";
import type { PromptHandler, PromptHandlerConfig } from "./types";

type RawlistPromptFn = (config: Record<string, unknown>) => Promise<unknown>;

export const rawlistPromptHandler: PromptHandler = {
  types: ["rawlist"],

  async ask(_type: string, config: PromptHandlerConfig): Promise<unknown> {
    const {
      name: _name,
      message,
      choices,
      default: defaultValue,
      loop,
      ...rest
    } = config;

    if (choices === undefined) {
      throw new Error('Prompt type "rawlist" requires a "choices" field.');
    }

    const unsupportedKeys = Object.keys(rest);
    if (unsupportedKeys.length > 0) {
      throw new Error(
        `Prompt type "rawlist" does not support: ${unsupportedKeys.join(", ")}. ` +
          `Supported fields are: message, choices, default, loop.`,
      );
    }

    if (loop !== undefined && typeof loop !== "boolean") {
      throw new Error('Prompt type "rawlist" expects "loop" to be a boolean.');
    }

    const runRawlist = rawlist as unknown as RawlistPromptFn;
    return runRawlist({
      message: String(message ?? ""),
      choices: choices as unknown[],
      ...(defaultValue !== undefined && { default: defaultValue }),
      ...(loop !== undefined && { loop }),
    });
  },
};
