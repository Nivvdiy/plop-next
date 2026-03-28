import type { UnknownRecord } from "../types";
import type { Theme } from "../theme";

/**
 * Extraction spec for one theme field.
 *
 * - `true`      → include the field as-is (scalar or full object)
 * - `string[]`  → field is an object; include only these sub-fields
 */
export type PromptThemeFieldSpec = true | string[];

/**
 * Flat selector declaration — no wrapper objects.
 *
 * Each key (except the reserved `baseSelector`) maps to an extraction spec:
 * - `fieldName: true`        → copy the top-level field value as-is
 * - `fieldName: string[]`    → field is an object; copy only the listed sub-keys
 *
 * @example
 * // Built-in select selector:
 * {
 *   prefix: true,
 *   spinner: true,
 *   indexMode: true,
 *   style: ["answer", "message", "description", "keysHelpTip"],
 *   icon: ["cursor"],
 * }
 */
export type PromptThemeSelector = {
  /** Inherit all entries from another registered selector, then apply overrides. */
  baseSelector?: string;
  [field: string]: PromptThemeFieldSpec | string | undefined;
};

// ---------------------------------------------------------------------------
// Built-in selectors
// ---------------------------------------------------------------------------

const BUILT_IN_PROMPT_THEME_SELECTORS: Record<string, PromptThemeSelector> = {
  common: {
    prefix: true,
    spinner: true,
    style: [
      "answer",
      "message",
      "error",
      "defaultAnswer",
      "help",
      "highlight",
      "key",
    ],
  },
  input: {
    prefix: true,
    spinner: true,
    validationFailureMode: true,
    style: ["answer", "message", "error", "defaultAnswer"],
  },
  select: {
    prefix: true,
    spinner: true,
    indexMode: true,
    style: [
      "answer",
      "message",
      "error",
      "help",
      "highlight",
      "description",
      "disabled",
      "keysHelpTip",
    ],
    icon: ["cursor"],
    i18n: true,
    keybindings: true,
  },
  list: { baseSelector: "select" },
  "generator-select": { baseSelector: "select" },
  checkbox: {
    prefix: true,
    spinner: true,
    style: [
      "answer",
      "message",
      "error",
      "defaultAnswer",
      "help",
      "highlight",
      "key",
      "disabled",
      "disabledChoice",
      "description",
      "renderSelectedChoices",
      "keysHelpTip",
    ],
    icon: [
      "checked",
      "unchecked",
      "cursor",
      "disabledChecked",
      "disabledUnchecked",
    ],
    i18n: true,
    keybindings: true,
  },
  confirm: {
    prefix: true,
    spinner: true,
    style: ["answer", "message", "defaultAnswer"],
  },
  search: {
    prefix: true,
    spinner: true,
    style: [
      "answer",
      "message",
      "error",
      "help",
      "highlight",
      "description",
      "disabled",
      "searchTerm",
      "keysHelpTip",
    ],
    icon: ["cursor"],
  },
  password: {
    prefix: true,
    spinner: true,
    style: ["answer", "message", "error", "help", "maskedText"],
  },
  expand: {
    prefix: true,
    spinner: true,
    style: ["answer", "message", "error", "defaultAnswer", "highlight"],
  },
  editor: {
    prefix: true,
    spinner: true,
    validationFailureMode: true,
    style: ["message", "error", "help", "key", "waitingMessage"],
  },
  number: {
    prefix: true,
    spinner: true,
    style: ["answer", "message", "error", "defaultAnswer"],
  },
  rawlist: {
    prefix: true,
    spinner: true,
    style: ["answer", "message", "error", "highlight", "description"],
  },
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

type ResolvedFields = Record<string, PromptThemeFieldSpec>;

export class PromptThemeSelectorRegistry {
  private readonly selectors = new Map<string, PromptThemeSelector>();
  private readonly defaultSelectorName = "common";

  constructor() {
    for (const [type, selector] of Object.entries(
      BUILT_IN_PROMPT_THEME_SELECTORS,
    )) {
      this.selectors.set(type, cloneSelector(selector));
    }
  }

  register(type: string, selector: PromptThemeSelector): void {
    this.selectors.set(type, cloneSelector(selector));
  }

  resolve(type: string): PromptThemeSelector | undefined {
    return this.selectors.get(type);
  }

  registerWithDefault(type: string, selector?: PromptThemeSelector): void {
    this.register(type, {
      baseSelector: this.defaultSelectorName,
      ...(selector ?? {}),
    });
  }

  resolveTheme(type: string, theme: Theme): UnknownRecord {
    const selector = this.resolve(type);

    if (!selector) {
      return this.resolveTheme(this.defaultSelectorName, theme);
    }

    const resolved = this.expandSelector(selector, new Set<string>());
    const source = theme as unknown as UnknownRecord;
    const output: UnknownRecord = {};

    for (const [field, spec] of Object.entries(resolved)) {
      if (!Object.prototype.hasOwnProperty.call(source, field)) continue;

      if (spec === true) {
        output[field] = source[field];
      } else {
        // spec is string[] — extract sub-fields from object
        const sourceObj = source[field];
        if (
          sourceObj === null ||
          typeof sourceObj !== "object" ||
          Array.isArray(sourceObj)
        ) {
          continue;
        }
        const filtered: UnknownRecord = {};
        for (const subField of spec) {
          if (Object.prototype.hasOwnProperty.call(sourceObj, subField)) {
            filtered[subField] = (sourceObj as UnknownRecord)[subField];
          }
        }
        if (Object.keys(filtered).length > 0) {
          output[field] = filtered;
        }
      }
    }

    return output;
  }

  private expandSelector(
    selector: PromptThemeSelector,
    visited: Set<string>,
  ): ResolvedFields {
    const result: Record<string, PromptThemeFieldSpec> = {};

    if (selector.baseSelector) {
      if (visited.has(selector.baseSelector)) {
        throw new Error(
          `Circular prompt theme selector inheritance detected for "${selector.baseSelector}".`,
        );
      }

      const base = this.selectors.get(selector.baseSelector);
      if (!base) {
        throw new Error(
          `Unknown prompt theme selector base "${selector.baseSelector}".`,
        );
      }

      visited.add(selector.baseSelector);
      const expandedBase = this.expandSelector(base, visited);
      Object.assign(result, expandedBase);
      visited.delete(selector.baseSelector);
    }

    for (const [field, spec] of Object.entries(selector)) {
      if (field === "baseSelector") continue;
      const typedSpec = spec as PromptThemeFieldSpec;

      if (typedSpec === true) {
        result[field] = true;
      } else if (Array.isArray(typedSpec)) {
        const existing = result[field];
        if (Array.isArray(existing)) {
          // union: child extends parent
          const merged = new Set([...existing, ...typedSpec]);
          result[field] = [...merged];
        } else {
          result[field] = [...typedSpec];
        }
      }
    }

    return result;
  }
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Options for declaring which theme fields a custom prompt should receive.
 *
 * The `selector` key is the only reserved entry; all other keys follow the
 * same flat extraction syntax as `PromptThemeSelector`.
 *
 * @example
 * plop.registerPrompt("table-multiple", handler, {
 *   selector: "select",        // inherit select's fields
 *   icon: ["cursor", "checked"], // extend icon with extra sub-fields
 * });
 */
export type PromptThemeSelectorOptions = {
  /** Inherit from an existing built-in selector (e.g. "select"). */
  selector?: string;
  [field: string]: PromptThemeFieldSpec | string | undefined;
};

export function createPromptThemeSelector(
  options: PromptThemeSelectorOptions,
): PromptThemeSelector {
  const { selector, ...fields } = options;
  return {
    ...(selector !== undefined ? { baseSelector: selector } : {}),
    ...fields,
  };
}

export function withPromptThemeDefaults(theme: Theme): Theme {
  return theme;
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function cloneSelector(selector: PromptThemeSelector): PromptThemeSelector {
  const cloned: PromptThemeSelector = {};
  if (selector.baseSelector !== undefined) {
    cloned.baseSelector = selector.baseSelector;
  }
  for (const [field, spec] of Object.entries(selector)) {
    if (field === "baseSelector") continue;
    cloned[field] = Array.isArray(spec) ? [...spec] : spec;
  }
  return cloned;
}
