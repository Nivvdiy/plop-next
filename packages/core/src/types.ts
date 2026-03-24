// ─────────────────────────────────────────────
//  Locale / i18n
// ─────────────────────────────────────────────

/** Flat or nested map of translation strings. */
export type LocaleTexts = Record<string, unknown>;

/** Generic object map used for dynamic/interoperability paths. */
export type UnknownRecord = Record<string, unknown>;

/** BCP-47 locale tag, e.g. "en", "fr", "es". */
export type LocaleTag = string;

/**
 * Flat map of read-only help/usage strings for the CLI `--help` display.
 * Keys match the entries declared in `CORE_DEFAULT_TEXTS.help`.
 */
export type HelpTexts = Readonly<Record<string, string>>;

/**
 * Rule that declares how a specific field inside a custom prompt type should be
 * translated by the i18n system.
 *
 * @example
 * // Translate a top-level field directly:
 * { translateField: "helpHint" }
 * // → key: `{gen}.{promptName}.helpHint`
 *
 * @example
 * // Translate `title` in each `columns` item, identified by `value`:
 * { path: "columns", translateField: "title", idField: "value" }
 * // → key: `{gen}.{promptName}.columns.{item.value}`
 *
 * @example
 * // Same with explicit array wildcard '#' (equivalent form):
 * { path: "columns.#", translateField: "title", idField: "value" }
 *
 * @example
 * // Deeply nested arrays (groups → items):
 * { path: "groups.#.items.#", translateField: "label", idField: "id" }
 * // → key: `{gen}.{promptName}.groups.{i}.items.{item.id}`
 */
export interface TranslatableFieldRule {
  /**
   * Dot-path to the container holding the field to translate.
   * Use `#` to mark array-iteration points.
   *
   * - Omit entirely for direct top-level fields on the prompt object.
   * - If provided without `#` **and** `idField` is set, an implicit `#` is
   *   appended: the last segment resolves to an array keyed by `idField`.
   * - Multiple `#` are supported for arbitrarily nested arrays; `idField`
   *   always applies to the **last** `#`.
   */
  path?: string;

  /**
   * The field whose string value should be translated.
   *
   * This field is used to read/write the display value inside the prompt config,
   * but it is NOT appended to the generated i18n key.
   */
  translateField: string;

  /**
   * Field used to build the i18n key for the **last** array in the path.
   * When set, `String(item[idField])` replaces the numeric index in the key,
   * making translations stable across item reordering.
   */
  idField?: string;
}

import type { Theme } from "./theme";

// ─────────────────────────────────────────────
//  Theme
// ─────────────────────────────────────────────

/** Raw @inquirer style object. */
export type InquirerStyleObject = Partial<Theme["style"]> & Record<string, unknown>;

/** Single theme object for both @inquirer and plop-next defaults/overrides. */
export type PlopNextTheme = Partial<Theme>;

// ─────────────────────────────────────────────
//  Prompts
// ─────────────────────────────────────────────

import type { SeparatorLike } from "./prompts/Separator";

// ─────────────────────────────────────────────
//  Generators
// ─────────────────────────────────────────────

/** Public generator item displayed in the CLI list. */
export interface GeneratorListItem {
  name: string;
  description?: string;
}

/** Public generator menu item displayed by the runner (generator or separator). */
export type GeneratorMenuItem = GeneratorListItem | SeparatorLike;

/**
 * Generic validate callback — T is the answer value type for the prompt.
 * Supports sync and async validation, returns true on success or an error string.
 */
export type ValidateFn<T = unknown> = (
  value: T,
  answers?: Record<string, any>,
) => boolean | string | Promise<boolean | string>;

/** Choices array item: string, separator, or labeled { name, value } object. */
export type ChoiceItem =
  | string
  | SeparatorLike
  | {
      name: string;
      value: unknown;
      [key: string]: unknown;
    };

/** Select/list choice item. */
export type SelectChoiceItem =
  | string
  | SeparatorLike
  | {
      value: unknown;
      name?: string;
      description?: string;
      short?: string;
      disabled?: boolean | string;
    };

/** Rawlist choice item. */
export type RawListChoiceItem =
  | string
  | SeparatorLike
  | {
      value: unknown;
      name?: string;
      short?: string;
      key?: string;
      description?: string;
    };

/** Expand choice item. */
export type ExpandChoiceItem =
  | SeparatorLike
  | {
      key: string;
      name?: string;
      value?: unknown;
    };

/** Choices value: static array or a dynamic async callback. */
export type ChoicesOrFn =
  | ChoiceItem[]
  | ((answers: Record<string, any>) => ChoiceItem[] | Promise<ChoiceItem[]>);

export type SelectChoicesOrFn =
  | SelectChoiceItem[]
  | ((answers: Record<string, any>) => SelectChoiceItem[] | Promise<SelectChoiceItem[]>);

export type RawListChoicesOrFn =
  | RawListChoiceItem[]
  | ((answers: Record<string, any>) => RawListChoiceItem[] | Promise<RawListChoiceItem[]>);

export type ExpandChoicesOrFn =
  | ExpandChoiceItem[]
  | ((answers: Record<string, any>) => ExpandChoiceItem[] | Promise<ExpandChoiceItem[]>);

/** Search choice item. */
export type SearchChoiceItem =
  | string
  | SeparatorLike
  | {
      value: unknown;
      name?: string;
      description?: string;
      short?: string;
      disabled?: boolean | string;
    };

export type SearchSourceFn = (
  term: string | undefined,
  opt: SearchSourceContext,
) => ReadonlyArray<SearchChoiceItem> | Promise<ReadonlyArray<SearchChoiceItem>>;

export interface SearchSourceContext {
  signal: AbortSignal;
}

export interface PromptTransformContext {
  isFinal: boolean;
}

/** Checkbox choice item. */
export type CheckboxChoiceItem =
  | string
  | SeparatorLike
  | {
      value: unknown;
      name?: string;
      checkedName?: string;
      description?: string;
      short?: string;
      checked?: boolean;
      disabled?: boolean | string;
    };

/** Selected checkbox item as received by inquirer validate callback. */
export type CheckboxSelectedChoice = {
  value: unknown;
  name: string;
  checkedName: string;
  description?: string;
  short: string;
  checked: boolean;
  disabled: boolean | string;
};

/** Checkbox global shortcuts. */
export type CheckboxShortcuts = {
  all?: string | null;
  invert?: string | null;
};

export type CheckboxChoicesOrFn =
  | CheckboxChoiceItem[]
  | ((answers: Record<string, any>) => CheckboxChoiceItem[] | Promise<CheckboxChoiceItem[]>);

/**
 * Base prompt configuration shared across all prompt types.
 * These are plop-next specific fields, separate from @inquirer/prompts fields.
 */
export interface PlopPromptBase {
  /** Prompt type: 'input', 'number', 'confirm', 'list', 'select', 'checkbox', etc. */
  type: string;
  /** Answer key in the answers hash. Should contain no spaces. */
  name: string;
  /**
   * Reserved for future plop-next theming API.
   * Intentionally blocked for now.
   */
  //theme?: never;
  /** Input message or callback to generate dynamic message. */
  message?: string | ((answers: Record<string, any>) => string);
  /** Default value if no answer provided. */
  default?: unknown;
  /** Filter the user input before storing in answers. */
  filter?: (value: unknown, answers: Record<string, any>) => unknown;
  /** Show or hide prompt based on condition or callback. */
  when?: boolean | ((answers: Record<string, any>) => boolean);
  /** Force prompt even if answer already exists. */
  askAnswered?: boolean;
}

/** Text input prompt. */
export interface PlopPromptInput extends PlopPromptBase {
  type: "input";
  /** Transform/format the raw value for display (visual only, does not affect stored value). */
  transformer?: (value: string, context: PromptTransformContext) => string;
  /** RegExp pattern the input must match. */
  pattern?: RegExp;
  /** Error message shown when pattern is not matched. */
  patternError?: string;
  /** Prefill behavior: 'tab' fills on Tab, 'editable' pre-fills the input field. */
  prefill?: "tab" | "editable";
  /** Reject empty input. */
  required?: boolean;
  /** Validate the text value before accepting. */
  validate?: ValidateFn<string>;
}

/** Numeric input prompt. */
export interface PlopPromptNumber extends PlopPromptBase {
  type: "number";
  default?: number;
  min?: number;
  max?: number;
  step?: number | "any";
  required?: boolean;
  /** Validate the numeric value before accepting. */
  validate?: ValidateFn<number | undefined>;
}

/** Boolean confirmation prompt (yes / no). */
export interface PlopPromptConfirm extends PlopPromptBase {
  type: "confirm";
  default?: boolean;
  /** Transform the displayed value (visual only). */
  transformer?: (value: boolean) => string;
}

/** Single-choice prompt (select one item from a list). */
export interface PlopPromptSelect extends PlopPromptBase {
  type: "list" | "select";
  choices: SelectChoicesOrFn;
  pageSize?: number;
  loop?: boolean;
}

/** Rawlist prompt (single choice with indexed shortcuts). */
export interface PlopPromptRawList extends PlopPromptBase {
  type: "rawlist";
  choices: RawListChoicesOrFn;
  loop?: boolean;
}

/** Expand prompt (single choice with explicit key shortcuts). */
export interface PlopPromptExpand extends PlopPromptBase {
  type: "expand";
  choices: ExpandChoicesOrFn;
  expanded?: boolean;
}

/** Search-based single-choice prompt (dynamic source function). */
export interface PlopPromptSearch extends PlopPromptBase {
  type: "search";
  /** Async function that returns filtered choices based on current input. */
  source: SearchSourceFn;
  pageSize?: number;
  /** Validate the selected value before accepting. */
  validate?: (value: unknown) => boolean | string | Promise<boolean | string>;
}

/** Multi-choice checkbox prompt. */
export interface PlopPromptCheckbox extends PlopPromptBase {
  type: "checkbox";
  choices: CheckboxChoicesOrFn;
  pageSize?: number;
  loop?: boolean;
  /** Reject empty selection. */
  required?: boolean;
  shortcuts?: CheckboxShortcuts;
  /** Validate the selected values array before accepting. */
  validate?: (choices: readonly CheckboxSelectedChoice[]) => boolean | string | Promise<boolean | string>;
}

/** Multi-line editor prompt (opens the user's $EDITOR). */
export interface PlopPromptEditor extends PlopPromptBase {
  type: "editor";
  default?: string;
  /** File extension for the temp file shown in the editor (e.g. ".md"). */
  postfix?: string;
  /** Open editor immediately without waiting for Enter. */
  waitForUserInput?: boolean;
  /** Low-level temp file options forwarded to @inquirer/external-editor. */
  file?: Record<string, unknown>;
  /** Validate the final text content before accepting. */
  validate?: ValidateFn<string>;
}

/** Masked password input. */
export interface PlopPromptPassword extends PlopPromptBase {
  type: "password";
  /** true uses "*", string uses a custom mask character/string, false keeps input transparent. */
  mask?: boolean | string;
  /** Validate the entered password before accepting. */
  validate?: ValidateFn<string>;
}

/** Union of all built-in prompt types plus a generic fallback for custom/unknown types. */
export type PlopPrompt =
  | PlopPromptInput
  | PlopPromptNumber
  | PlopPromptConfirm
  | PlopPromptSelect
  | PlopPromptRawList
  | PlopPromptExpand
  | PlopPromptSearch
  | PlopPromptCheckbox
  | PlopPromptEditor
  | PlopPromptPassword
  | PlopPromptBase;

// ─────────────────────────────────────────────
//  Actions
// ─────────────────────────────────────────────

export type ActionType = "add" | "modify" | "append" | string;

export type TransformFn = (
  input: string,
  data: Record<string, unknown>,
) => string | Promise<string>;

export type SkipFn = (
  answers: Record<string, any>,
  action: ActionConfig,
) => boolean | string | Promise<boolean | string>;

export interface ActionConfig {
  type: ActionType;
  path?: string;
  template?: string;
  templateFile?: string;
  pattern?: RegExp | string;
  transform?: TransformFn;
  skip?: SkipFn;
  skipIfExists?: boolean;
  force?: boolean;
  unique?: boolean;
  separator?: string;
  destination?: string;
  base?: string;
  templateFiles?: string | string[];
  stripExtensions?: string[];
  globOptions?: Record<string, unknown>;
  verbose?: boolean;
  abortOnFail?: boolean;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export type CustomActionFunction = (
  answers: Record<string, any>,
  config: ActionConfig,
  plopNext: unknown,
) => string | Promise<string>;

export type Action = ActionConfig | CustomActionFunction | string;

export type DynamicActionsFn = (
  answers: Record<string, any>,
) => Action[] | Promise<Action[]>;

export type ActionsConfig = Action[] | DynamicActionsFn;

export type HandlebarsHelper = (...args: unknown[]) => unknown;

/**
 * Legacy custom prompt renderer signature.
 *
 * Kept intentionally permissive because third-party prompt packages can expose
 * stricter config generics and optional extra params (e.g. context).
 */
export type PromptRenderer = (...args: any[]) => unknown | Promise<unknown>;

export interface ActionExecutionOptions {
  dest?: string;
  force?: boolean;
}

export interface ActionStepResult {
  type: string;
  status: "success" | "error";
  message: string;
  path?: string;
}

export interface ActionExecutionResult {
  steps: ActionStepResult[];
  failed: boolean;
}

export type DefaultIncludeConfig = Record<string, unknown>;

// ─────────────────────────────────────────────
//  Generator
// ─────────────────────────────────────────────

export interface GeneratorConfig {
  description?: string;
  prompts: PlopPrompt[];
  actions: ActionsConfig;
}

// ─────────────────────────────────────────────
//  Runtime config (returned by Liftoff)
// ─────────────────────────────────────────────

export interface PlopNextEnv {
  cwd: string;
  configPath: string | null;
  modulePath: string | null;
  config?: unknown;
}
