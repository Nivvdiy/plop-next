import type { PromptRenderer } from "../types";
import type { PromptHandlerConfig } from "./types";

/** Register a legacy custom prompt renderer by name. */
export function registerCustomPrompt(
  promptTypes: Map<string, PromptRenderer>,
  name: string,
  prompt?: PromptRenderer,
): void {
  if (!prompt) {
    throw new Error(`registerPrompt("${name}", prompt) requires a prompt function.`);
  }

  promptTypes.set(name, prompt);
}

/** Return a previously registered custom prompt renderer. */
export function getCustomPrompt(
  promptTypes: Map<string, PromptRenderer>,
  name: string,
): PromptRenderer | undefined {
  return promptTypes.get(name);
}

/** List custom prompt renderer type names. */
export function listCustomPromptTypes(
  promptTypes: Map<string, PromptRenderer>,
): string[] {
  return Array.from(promptTypes.keys());
}

/** Execute a legacy custom prompt renderer with plop-next internal keys stripped. */
export function askCustomPrompt(
  prompt: PromptRenderer,
  config: PromptHandlerConfig,
): Promise<unknown> {
  const { name: _name, ...rest } = config;
  return Promise.resolve(prompt(rest));
}
