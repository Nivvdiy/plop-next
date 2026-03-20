import type { PromptHandler, PromptHandlerConfig } from "./types";

/**
 * Registry that maps prompt type strings to their PromptHandler.
 *
 * Embedded in PlopNextCore — handlers are registered there via
 * `core.registerPrompt(handler)`.
 *
 * Resolution order when PlopNextCore.askPrompt() is called:
 * 1. User-registered PromptRenderer (legacy `addPrompt` / `setPrompt` API) — highest priority.
 * 2. Registered PromptHandler matching the exact type string.
 * 3. Registered PromptHandler for "input" as fallback.
 */
export class PromptHandlerRegistry {
  private readonly map = new Map<string, PromptHandler>();

  /**
   * Register a handler for all its declared types.
   * If a type is already registered, the new handler replaces the previous one,
   * allowing built-in handlers to be overridden by plugins or users.
   */
  register(handler: PromptHandler): this {
    for (const type of handler.types) {
      this.map.set(type, handler);
    }
    return this;
  }

  /** Return the handler for the given type, or undefined if none is registered. */
  get(type: string): PromptHandler | undefined {
    return this.map.get(type);
  }

  /** True if a handler is registered for the given type. */
  has(type: string): boolean {
    return this.map.has(type);
  }

  /** List of all registered type strings. */
  getRegisteredTypes(): string[] {
    return Array.from(this.map.keys());
  }

  /**
   * Dispatch a prompt to the right handler.
   *
   * @param type   The prompt type string.
   * @param config Prompt fields without plop-next-only keys.
   * @returns      The user's answer.
   * @throws       If no handler is registered for the type and no "input" fallback exists.
   */
  async ask(type: string, config: PromptHandlerConfig): Promise<unknown> {
    const handler = this.map.get(type) ?? this.map.get("input");
    if (!handler) {
      throw new Error(
        `No handler registered for prompt type "${type}". ` +
          `Register one with core.registerPrompt(handler).`,
      );
    }
    if (Object.prototype.hasOwnProperty.call(config, "theme")) {
      throw new Error(
        `The "theme" prompt field is not supported in plop-next yet. ` +
          `Remove it from prompt "${String(config.name)}".`,
      );
    }
    return handler.ask(type, config);
  }
}
