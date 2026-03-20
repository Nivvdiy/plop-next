import { select } from "@inquirer/prompts";
import type { PromptHandler, PromptHandlerConfig } from "./types";

type PromptFn = (config: Record<string, unknown>) => Promise<unknown>;

export const selectPromptHandler: PromptHandler = {
  types: ["list", "select"],

  async ask(type: string, config: PromptHandlerConfig): Promise<unknown> {
    const {
      name: _name,
      message,
      default: defaultValue,
      choices,
      loop,
      pageSize,
      validate,
      ...rest
    } = config;

    if (choices === undefined) {
      throw new Error('Prompt type "select" requires a "choices" field.');
    }

    if (validate !== undefined) {
      throw new Error('Prompt type "select" does not support "validate".');
    }

    const unsupportedKeys = Object.keys(rest);
    if (unsupportedKeys.length > 0) {
      throw new Error(
        `Prompt type "select" does not support: ${unsupportedKeys.join(", ")}. ` +
          `Supported fields are: message, choices, default, pageSize, loop.`,
      );
    }

    if (pageSize !== undefined && (typeof pageSize !== "number" || Number.isNaN(pageSize))) {
      throw new Error('Prompt type "select" expects "pageSize" to be a number.');
    }

    if (loop !== undefined && typeof loop !== "boolean") {
      throw new Error('Prompt type "select" expects "loop" to be a boolean.');
    }

    const runSelect = select as unknown as PromptFn;
    return runSelect({
      message: String(message ?? ""),
      choices: choices as unknown[],
      ...(defaultValue !== undefined && { default: defaultValue }),
      ...(pageSize !== undefined && { pageSize }),
      ...(loop !== undefined && { loop }),
    });
  },
};
