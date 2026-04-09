import { password } from "@inquirer/prompts";
import type {
  InquirerPromptFn,
  PromptHandler,
  PromptHandlerConfig,
  PromptThemeConfig,
} from "./types";

export function createPasswordHandler(fn?: InquirerPromptFn): PromptHandler {
  const passwordFn = fn ?? (password as unknown as InquirerPromptFn);
  return {
  types: ["password"],

  async ask(_type: string, config: PromptHandlerConfig): Promise<unknown> {
    const {
      name: _name,
      message,
      validate,
      mask,
      theme,
      ...rest
    } = config;

    const unsupportedKeys = Object.keys(rest);
    if (unsupportedKeys.length > 0) {
      throw new Error(
        `Prompt type "password" does not support: ${unsupportedKeys.join(", ")}. ` +
          `Supported fields are: message, mask, validate, theme.`,
      );
    }

    if (mask !== undefined && typeof mask !== "boolean" && typeof mask !== "string") {
      throw new Error('Prompt type "password" expects "mask" to be a boolean or string.');
    }

    if (validate !== undefined && typeof validate !== "function") {
      throw new Error('Prompt type "password" expects "validate" to be a function.');
    }

    return passwordFn({
      message: String(message ?? ""),
      ...(validate !== undefined && {
        validate: validate as (value: string) => boolean | string | Promise<boolean | string>,
      }),
      ...(mask !== undefined && { mask }),
      ...(theme !== undefined && { theme: theme as PromptThemeConfig }),
    });
  },
  };
}

export const passwordPromptHandler = createPasswordHandler();
