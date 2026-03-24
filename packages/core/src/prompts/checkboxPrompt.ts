import { checkbox } from "@inquirer/prompts";
import type { CheckboxSelectedChoice } from "../types";
import type {
  InquirerPromptFn,
  PromptHandler,
  PromptHandlerConfig,
  PromptThemeConfig,
} from "./types";

export function createCheckboxHandler(fn?: InquirerPromptFn): PromptHandler {
  const checkboxFn = fn ?? (checkbox as unknown as InquirerPromptFn);
  return {
  types: ["checkbox"],

  async ask(_type: string, config: PromptHandlerConfig): Promise<unknown> {
    const {
      name: _name,
      message,
      default: defaultValue,
      choices,
      pageSize,
      loop,
      required,
      shortcuts,
      validate,
      ...rest
    } = config;

    if (choices === undefined) {
      throw new Error('Prompt type "checkbox" requires a "choices" field.');
    }

    if (defaultValue !== undefined) {
      throw new Error('Prompt type "checkbox" does not support "default". Use choice.checked instead.');
    }

    return checkboxFn({
      message: String(message ?? ""),
      choices: choices as unknown[],
      ...(pageSize !== undefined && { pageSize: Number(pageSize) }),
      ...(loop !== undefined && { loop: Boolean(loop) }),
      ...(validate !== undefined && {
        validate:
          validate as (
            selected: readonly CheckboxSelectedChoice[],
          ) => boolean | string | Promise<boolean | string>,
      }),
      ...(required !== undefined && { required: Boolean(required) }),
      ...(shortcuts !== undefined && { shortcuts: shortcuts as PromptThemeConfig }),
      ...rest,
    });
  },
  };
}

export const checkboxPromptHandler = createCheckboxHandler();
