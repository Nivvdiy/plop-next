import { select } from "@inquirer/prompts";
import type {
  InquirerPromptFn,
  PromptHandler,
  PromptHandlerConfig,
  PromptThemeConfig,
} from "./types";

export function createSelectHandler(fn?: InquirerPromptFn): PromptHandler {
  const selectFn = fn ?? (select as unknown as InquirerPromptFn);
  return {
    types: ["list", "select", "generatorList"],

    async ask(type: string, config: PromptHandlerConfig): Promise<unknown> {
      const {
        name: _name,
        message,
        default: defaultValue,
        choices,
        loop,
        pageSize,
        validate,
        theme,
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
            `Supported fields are: message, choices, default, pageSize, loop, theme.`,
        );
      }

      if (
        pageSize !== undefined &&
        (typeof pageSize !== "number" || Number.isNaN(pageSize))
      ) {
        throw new Error(
          'Prompt type "select" expects "pageSize" to be a number.',
        );
      }

      if (loop !== undefined && typeof loop !== "boolean") {
        throw new Error('Prompt type "select" expects "loop" to be a boolean.');
      }

      return selectFn({
        message: String(message ?? ""),
        choices: choices as unknown[],
        ...(defaultValue !== undefined && { default: defaultValue }),
        ...(pageSize !== undefined && { pageSize }),
        ...(loop !== undefined && { loop }),
        ...(theme !== undefined && { theme: theme as PromptThemeConfig }),
      });
    },
  };
}

export const selectPromptHandler = createSelectHandler();
