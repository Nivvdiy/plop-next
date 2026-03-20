import { input } from "@inquirer/prompts";
import type { PromptHandler, PromptHandlerConfig } from "./types";

export const inputPromptHandler: PromptHandler = {
  types: ["input"],

  async ask(_type: string, config: PromptHandlerConfig): Promise<unknown> {
    const {
      name: _name,
      message,
      default: defaultValue,
      validate,
      transformer,
      pattern,
      patternError,
      prefill,
      required,
      ...rest
    } = config;

    return input({
      message: String(message ?? ""),
      ...(defaultValue !== undefined && { default: String(defaultValue) }),
      ...(validate !== undefined && {
        validate: validate as (value: string) => boolean | string | Promise<boolean | string>,
      }),
      ...(transformer !== undefined && {
        transformer: transformer as (value: string, ctx: { isFinal: boolean }) => string,
      }),
      ...(pattern !== undefined && { pattern: pattern as RegExp }),
      ...(patternError !== undefined && { patternError: String(patternError) }),
      ...(prefill !== undefined && { prefill: prefill as "tab" | "editable" }),
      ...(required !== undefined && { required: Boolean(required) }),
      ...rest,
    });
  },
};
