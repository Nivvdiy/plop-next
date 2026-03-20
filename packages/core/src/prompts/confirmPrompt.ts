import { confirm } from "@inquirer/prompts";
import type { PromptHandler, PromptHandlerConfig } from "./types";

type ConfirmPromptFn = (config: Record<string, unknown>) => Promise<unknown>;

export const confirmPromptHandler: PromptHandler = {
  types: ["confirm"],

  async ask(_type: string, config: PromptHandlerConfig): Promise<unknown> {
    const {
      name: _name,
      message,
      default: defaultValue,
      transformer,
      ...rest
    } = config;

    const unsupportedKeys = Object.keys(rest);
    if (unsupportedKeys.length > 0) {
      throw new Error(
        `Prompt type "confirm" does not support: ${unsupportedKeys.join(", ")}. ` +
          `Supported fields are: message, default, transformer.`,
      );
    }

    if (defaultValue !== undefined && typeof defaultValue !== "boolean") {
      throw new Error('Prompt type "confirm" expects "default" to be a boolean.');
    }

    if (transformer !== undefined && typeof transformer !== "function") {
      throw new Error('Prompt type "confirm" expects "transformer" to be a function.');
    }

    const runConfirm = confirm as unknown as ConfirmPromptFn;

    return runConfirm({
      message: String(message ?? ""),
      ...(defaultValue !== undefined && { default: defaultValue }),
      ...(transformer !== undefined && {
        transformer: transformer as (value: boolean) => string,
      }),
    });
  },
};
