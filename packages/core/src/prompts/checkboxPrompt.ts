import { checkbox } from "@inquirer/prompts";
import type { PromptHandler, PromptHandlerConfig } from "./types";

type CheckboxSelectedChoice = {
  value: unknown;
  name: string;
  checkedName: string;
  description?: string;
  short: string;
  disabled: boolean | string;
  checked: boolean;
};

type CheckboxPromptFn = (config: Record<string, unknown>) => Promise<unknown>;

export const checkboxPromptHandler: PromptHandler = {
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

    const runCheckbox = checkbox as unknown as CheckboxPromptFn;

    return runCheckbox({
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
      ...(shortcuts !== undefined && { shortcuts: shortcuts as Record<string, unknown> }),
      ...rest,
    });
  },
};
