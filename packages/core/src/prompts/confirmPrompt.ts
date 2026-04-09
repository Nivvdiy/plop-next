import { confirm } from "@inquirer/prompts";
import type {
  InquirerPromptFn,
  PromptHandler,
  PromptHandlerConfig,
  PromptThemeConfig,
} from "./types";

export function createConfirmHandler(fn?: InquirerPromptFn): PromptHandler {
  const confirmFn = fn ?? (confirm as unknown as InquirerPromptFn);
  return {
  types: ["confirm"],

  async ask(_type: string, config: PromptHandlerConfig): Promise<unknown> {
    const {
      name: _name,
      message,
      default: defaultValue,
      transformer,
      theme,
      ...rest
    } = config;

    const unsupportedKeys = Object.keys(rest);
    if (unsupportedKeys.length > 0) {
      throw new Error(
        `Prompt type "confirm" does not support: ${unsupportedKeys.join(", ")}. ` +
          `Supported fields are: message, default, transformer, theme.`,
      );
    }

    if (defaultValue !== undefined && typeof defaultValue !== "boolean") {
      throw new Error('Prompt type "confirm" expects "default" to be a boolean.');
    }

    if (transformer !== undefined && typeof transformer !== "function") {
      throw new Error('Prompt type "confirm" expects "transformer" to be a function.');
    }

    return confirmFn({
      message: String(message ?? ""),
      ...(defaultValue !== undefined && { default: defaultValue }),
      ...(transformer !== undefined && {
        transformer: transformer as (value: boolean) => string,
      }),
      ...(theme !== undefined && { theme: theme as PromptThemeConfig }),
    });
  },
  };
}

export const confirmPromptHandler = createConfirmHandler();
