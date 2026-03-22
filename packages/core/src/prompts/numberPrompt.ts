import { number as numberPrompt } from "@inquirer/prompts";
import type { PromptHandler, PromptHandlerConfig } from "./types";

type NumberPromptFn = (config: Record<string, unknown>) => Promise<unknown>;

export const numberPromptHandler: PromptHandler = {
  types: ["number"],

  async ask(_type: string, config: PromptHandlerConfig): Promise<unknown> {
    const {
      name: _name,
      message,
      default: defaultValue,
      min,
      max,
      step,
      required,
      validate,
      theme,
      ...rest
    } = config;

    const unsupportedKeys = Object.keys(rest);
    if (unsupportedKeys.length > 0) {
      throw new Error(
        `Prompt type "number" does not support: ${unsupportedKeys.join(", ")}. ` +
          `Supported fields are: message, default, min, max, step, required, validate, theme.`,
      );
    }

    if (defaultValue !== undefined && typeof defaultValue !== "number") {
      throw new Error('Prompt type "number" expects "default" to be a number.');
    }

    if (min !== undefined && typeof min !== "number") {
      throw new Error('Prompt type "number" expects "min" to be a number.');
    }

    if (max !== undefined && typeof max !== "number") {
      throw new Error('Prompt type "number" expects "max" to be a number.');
    }

    if (step !== undefined && step !== "any" && typeof step !== "number") {
      throw new Error('Prompt type "number" expects "step" to be a number or "any".');
    }

    if (required !== undefined && typeof required !== "boolean") {
      throw new Error('Prompt type "number" expects "required" to be a boolean.');
    }

    if (validate !== undefined && typeof validate !== "function") {
      throw new Error('Prompt type "number" expects "validate" to be a function.');
    }

    const runNumberPrompt = numberPrompt as unknown as NumberPromptFn;

    return runNumberPrompt({
      message: String(message ?? ""),
      ...(defaultValue !== undefined && { default: defaultValue }),
      ...(validate !== undefined && {
        validate: validate as (value: number | undefined) => boolean | string | Promise<boolean | string>,
      }),
      ...(min !== undefined && { min }),
      ...(max !== undefined && { max }),
      ...(step !== undefined && { step }),
      ...(required !== undefined && { required }),
      ...(theme !== undefined && { theme: theme as Record<string, unknown> }),
    });
  },
};
