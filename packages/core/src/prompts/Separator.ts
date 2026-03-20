export interface SeparatorLike {
  type: "separator";
  separator: string;
}

/**
 * Prompt choices separator compatible with @inquirer/core.
 * Use this in plopfiles to avoid importing Separator from inquirer directly.
 */
export class Separator implements SeparatorLike {
  readonly type = "separator" as const;
  readonly separator: string;

  constructor(separator?: string) {
    this.separator = separator ?? "---------------";
  }

  static isSeparator(choice: unknown): choice is SeparatorLike {
    return Boolean(
      choice &&
        typeof choice === "object" &&
        "type" in choice &&
        (choice as { type?: unknown }).type === "separator",
    );
  }
}
