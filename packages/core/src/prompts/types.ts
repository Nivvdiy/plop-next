import type { UnknownRecord } from "../types";

/**
 * Config passed to a PromptHandler's ask() method.
 * Contains all prompt fields except the plop-next-only keys
 * (type, name, filter, when, askAnswered) which the runner strips before dispatch.
 */
export interface PromptHandlerConfig {
  /** Answer key — included so handlers can forward it if needed. */
  name: string;
  /** Internal use: resolved by core.setTheme({ ... }). */
  theme?: PromptThemeConfig;
  message?: unknown;
  default?: unknown;
  validate?: unknown;
  [key: string]: unknown;
}

/** Raw config shape expected by @inquirer prompt functions. */
export type InquirerPromptFn = (config: UnknownRecord) => Promise<unknown>;

/** Theme payload forwarded to @inquirer prompt functions. */
export type PromptThemeConfig = UnknownRecord;

/** File payload used by editor prompt. */
export type PromptFileConfig = UnknownRecord;

/**
 * Contract for a specialised prompt handler.
 *
 * Each handler encapsulates the rendering logic for one or more prompt types
 * (e.g. the select handler covers "list", "select").
 * Handlers are registered into PlopNextCore via `registerPrompt(handler)` and
 * are therefore available to any runtime that uses the core (CLI, test helpers,
 * custom runners, etc.).
 *
 * @example
 * // Register a custom date-picker handler
 * core.registerPrompt({
 *   types: ["datepicker"],
 *   async ask(_type, config) {
 *     return myDatePickerLib({ message: String(config.message ?? "") });
 *   },
 * });
 */
export interface PromptHandler {
  /**
   * Prompt type identifiers this handler supports.
   * The first entry is used as the canonical name in error messages.
   */
  readonly types: ReadonlyArray<string>;

  /**
   * Execute the prompt and return the user's answer.
   * @param type   The exact type string that was requested.
   * @param config All prompt fields minus the plop-next-only keys.
   */
  ask(type: string, config: PromptHandlerConfig): Promise<unknown>;
}
