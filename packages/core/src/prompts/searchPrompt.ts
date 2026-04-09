import { search } from "@inquirer/prompts";
import type {
  InquirerPromptFn,
  PromptHandler,
  PromptHandlerConfig,
  PromptThemeConfig,
} from "./types";
import type { SearchSourceFn } from "../types";

export function createSearchHandler(fn?: InquirerPromptFn): PromptHandler {
  const searchFn = fn ?? (search as unknown as InquirerPromptFn);
  return {
  types: ["search"],

  async ask(_type: string, config: PromptHandlerConfig): Promise<unknown> {
    const {
      name: _name,
      message,
      source,
      pageSize,
      default: defaultValue,
      validate,
      theme,
      ...rest
    } = config;

    if (typeof source !== "function") {
      throw new Error('Prompt type "search" requires a "source" function.');
    }

    const unsupportedKeys = Object.keys(rest);
    if (unsupportedKeys.length > 0) {
      throw new Error(
        `Prompt type "search" does not support: ${unsupportedKeys.join(", ")}. ` +
          `Supported fields are: message, source, pageSize, default, validate, theme.`,
      );
    }

    if (pageSize !== undefined && (typeof pageSize !== "number" || Number.isNaN(pageSize))) {
      throw new Error('Prompt type "search" expects "pageSize" to be a number.');
    }

    if (validate !== undefined && typeof validate !== "function") {
      throw new Error('Prompt type "search" expects "validate" to be a function.');
    }

    return searchFn({
      message: String(message ?? ""),
      source: source as SearchSourceFn,
      ...(pageSize !== undefined && { pageSize }),
      ...(defaultValue !== undefined && { default: defaultValue }),
      ...(validate !== undefined && {
        validate: validate as (value: unknown) => boolean | string | Promise<boolean | string>,
      }),
      ...(theme !== undefined && { theme: theme as PromptThemeConfig }),
    });
  },
  };
}

export const searchPromptHandler = createSearchHandler();
