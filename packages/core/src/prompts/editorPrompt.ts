import { editor } from "@inquirer/prompts";
import type { PromptHandler, PromptHandlerConfig } from "./types";

type EditorPromptFn = (config: Record<string, unknown>) => Promise<unknown>;

export const editorPromptHandler: PromptHandler = {
  types: ["editor"],

  async ask(_type: string, config: PromptHandlerConfig): Promise<unknown> {
    const {
      name: _name,
      message,
      default: defaultValue,
      validate,
      postfix,
      waitForUserInput,
      file,
      ...rest
    } = config;

    const unsupportedKeys = Object.keys(rest);
    if (unsupportedKeys.length > 0) {
      throw new Error(
        `Prompt type "editor" does not support: ${unsupportedKeys.join(", ")}. ` +
          `Supported fields are: message, default, postfix, waitForUserInput, file, validate.`,
      );
    }

    if (defaultValue !== undefined && typeof defaultValue !== "string") {
      throw new Error('Prompt type "editor" expects "default" to be a string.');
    }

    if (postfix !== undefined && typeof postfix !== "string") {
      throw new Error('Prompt type "editor" expects "postfix" to be a string.');
    }

    if (waitForUserInput !== undefined && typeof waitForUserInput !== "boolean") {
      throw new Error('Prompt type "editor" expects "waitForUserInput" to be a boolean.');
    }

    if (file !== undefined && (typeof file !== "object" || file === null)) {
      throw new Error('Prompt type "editor" expects "file" to be an object.');
    }

    if (validate !== undefined && typeof validate !== "function") {
      throw new Error('Prompt type "editor" expects "validate" to be a function.');
    }

    const runEditor = editor as unknown as EditorPromptFn;

    return runEditor({
      message: String(message ?? ""),
      ...(defaultValue !== undefined && { default: String(defaultValue) }),
      ...(validate !== undefined && {
        validate: validate as (value: string) => boolean | string | Promise<boolean | string>,
      }),
      ...(postfix !== undefined && { postfix: String(postfix) }),
      ...(waitForUserInput !== undefined && { waitForUserInput }),
      ...(file !== undefined && { file: file as Record<string, unknown> }),
    });
  },
};
