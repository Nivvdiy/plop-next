import { ActionRunner } from "./ActionRunner";
import Handlebars from "handlebars";
import { dirname, resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import {
  camelCase,
  snakeCase,
  dotCase,
  pathCase,
  sentenceCase,
  constantCase,
  kebabCase,
  pascalCase,
} from "change-case";
import { titleCase } from "title-case";
import type {
  GeneratorConfig,
  GeneratorMenuItem,
  PlopPrompt,
  LocaleTexts,
  UnknownRecord,
  LocaleTag,
  Action,
  ActionsConfig,
  ActionConfig,
  CustomActionFunction,
  HandlebarsHelper,
  PromptRenderer,
  ActionExecutionOptions,
  ActionExecutionResult,
  ActionStepResult,
  DefaultIncludeConfig,
  PlopNextTheme,
  TranslatableFieldRule,
} from "./types";
import { PromptHandlerRegistry } from "./prompts/PromptHandlerRegistry";
import type { PromptHandler, PromptHandlerConfig } from "./prompts/types";
import { registerBuiltInPromptHandlers } from "./prompts/registerBuiltins";
import {
  askCustomPrompt,
  getCustomPrompt,
  listCustomPromptTypes,
  registerCustomPrompt,
} from "./prompts/customPrompt";
import { defaultTheme } from "./theme";
import type { DefaultTheme, Theme } from "./theme";
import type { SeparatorLike } from "./prompts/Separator";

export interface UseI18nOptions {
  /** Force a specific locale tag, e.g. "fr". */
  force?: LocaleTag;
  /**
   * Use auto-detection (OS locale) when `force` is not provided.
   * Defaults to true when calling useI18n().
   */
  auto?: boolean;
}

export interface RegisterLocaleOptions {
  /** If true, this locale becomes active immediately. */
  activate?: boolean;
}

export interface I18nAdapter {
  t(key: string, args?: unknown[], fallback?: string): string;
  preparePrompts(generatorName: string, prompts: PlopPrompt[]): PlopPrompt[];
  getWelcomeMessage?(): string | null;
  use?(options: UseI18nOptions): void;
  isEnabled?(): boolean;
  hasLocale?(locale: LocaleTag): boolean;
  registerLocale?(
    locale: LocaleTag,
    messages: LocaleTexts | string,
    options?: RegisterLocaleOptions,
  ): void;
  registerLocales?(
    locales: Record<string, LocaleTexts> | LocaleTexts | string,
    options?: RegisterLocaleOptions,
  ): void;
  registerTexts?(
    localeOrTexts: LocaleTag | Record<string, LocaleTexts> | LocaleTexts | string,
    maybeTexts?: LocaleTexts | string,
  ): void;
  registerText?(locale: LocaleTag, path: string, text: unknown): void;
  setLocale?(locale: LocaleTag): void;
  getLocale?(): LocaleTag;
  registerTranslatableField?(promptType: string, rules: TranslatableFieldRule[]): void;
}

/**
 * PlopNextCore
 *
 * Central registry used by the CLI and optionally by the i18n plugin.
 * Should never be instantiated directly by end-users: the CLI boots it.
 */
interface GeneratorDefinitionEntry {
  kind: "generator";
  name: string;
}

interface GeneratorSeparatorEntry {
  kind: "separator";
  text?: string;
}

type GeneratorEntry = GeneratorDefinitionEntry | GeneratorSeparatorEntry;

export class PlopNextCore {
  private readonly generators = new Map<string, GeneratorConfig>();
  private readonly generatorEntries: GeneratorEntry[] = [];
  private readonly actionTypes = new Map<string, CustomActionFunction>();
  /** Legacy custom prompt renderers (registered via addPrompt / setPrompt). */
  private readonly promptTypes = new Map<string, PromptRenderer>();
  /** Typed prompt handlers registered via registerPrompt(handler). */
  private readonly promptHandlerRegistry = new PromptHandlerRegistry();
  private i18nAdapter?: I18nAdapter;
  private readonly translatableFieldRules = new Map<string, TranslatableFieldRule[]>();
  private welcomeMessage: string | null = null;
  private plopfilePath?: string;
  private destBasePath: string = process.cwd();
  private defaultInclude: DefaultIncludeConfig = {};
  private theme: PlopNextTheme = {};
  private pkgCachePath?: string;
  private pkgCache?: UnknownRecord;

  constructor() {
    this.registerBuiltInHelpers();
    registerBuiltInPromptHandlers(this.promptHandlerRegistry);
  }

  // ── Generators ────────────────────────────────────────────────────

  /**
   * Register a named generator.
   *
   * @example
   * plopNext.registerGenerator("component", { prompts: [...], actions: [...] });
   */
  registerGenerator(name: string, config: GeneratorConfig): this {
    if (!this.generators.has(name)) {
      this.generatorEntries.push({ kind: "generator", name });
    }
    this.generators.set(name, config);
    return this;
  }

  addSeparator(text?: string): this {
    this.generatorEntries.push({ kind: "separator", text });
    return this;
  }

  // Backward-compatible alias.
  setGenerator(name: string, config: GeneratorConfig): this {
    return this.registerGenerator(name, config);
  }

  registerHelper(name: string, helper: HandlebarsHelper): this {
    Handlebars.registerHelper(name, helper);
    return this;
  }

  // Backward-compatible alias.
  setHelper(name: string, helper: HandlebarsHelper): this {
    return this.registerHelper(name, helper);
  }

  registerPartial(name: string, partial: string): this {
    Handlebars.registerPartial(name, partial);
    return this;
  }

  // Backward-compatible alias.
  setPartial(name: string, partial: string): this {
    return this.registerPartial(name, partial);
  }

  registerActionType(name: string, actionType: CustomActionFunction): this {
    this.actionTypes.set(name, actionType);
    return this;
  }

  // Backward-compatible alias.
  setActionType(name: string, actionType: CustomActionFunction): this {
    return this.registerActionType(name, actionType);
  }

  registerPrompt(name: string, prompt: PromptRenderer): this;
  registerPrompt(handler: PromptHandler): this;
  registerPrompt(
    nameOrHandler: string | PromptHandler,
    prompt?: PromptRenderer,
  ): this {
    if (typeof nameOrHandler === "string") {
      registerCustomPrompt(this.promptTypes, nameOrHandler, prompt);
      return this;
    }

    this.promptHandlerRegistry.register(nameOrHandler);
    return this;
  }

  // Backward-compatible alias.
  setPrompt(name: string, prompt: PromptRenderer): this {
    return this.registerPrompt(name, prompt);
  }

  getPrompt(name: string): PromptRenderer | undefined {
    return getCustomPrompt(this.promptTypes, name);
  }

  getPromptList(): string[] {
    return listCustomPromptTypes(this.promptTypes);
  }

  /** List the type strings that have a registered PromptHandler. */
  getPromptHandlerTypes(): string[] {
    return this.promptHandlerRegistry.getRegisteredTypes();
  }

  /**
   * Dispatch a prompt to the appropriate handler.
   *
   * Resolution order:
   * 1. Legacy PromptRenderer registered via `addPrompt()` / `setPrompt()` — highest priority.
  * 2. PromptHandler registered via `registerPrompt(handler)` for the exact type.
   * 3. PromptHandler registered for "input" as fallback.
   *
   * @param type   Prompt type string (e.g. "input", "list", "datepicker").
   * @param config All prompt fields minus plop-next-only keys (type/name/filter/when/askAnswered).
   */
  async askPrompt(type: string, config: PromptHandlerConfig): Promise<unknown> {
    if (Object.prototype.hasOwnProperty.call(config, "theme")) {
      throw new Error(
        `The "theme" prompt field is not supported in plop-next. ` +
          `Use core.setTheme({ ... }) instead.`,
      );
    }

    const promptTheme = this.resolvePromptTheme();
    const configWithTheme =
      promptTheme === undefined
        ? config
        : {
            ...config,
            theme: promptTheme,
          };

    // 1. Legacy renderer wins
    const customFn = this.getPrompt(type);
    if (customFn) {
      return askCustomPrompt(customFn, configWithTheme);
    }

    // 2 & 3. Typed handler (or input fallback)
    return this.promptHandlerRegistry.ask(type, configWithTheme, {
      allowTheme: true,
    });
  }

  setTheme(theme: PlopNextTheme): this {
    this.theme = this.cloneTheme(theme);
    return this;
  }

  getTheme(): PlopNextTheme {
    return this.cloneTheme(this.resolveTheme());
  }

  getActionType(name: string): CustomActionFunction | undefined {
    return this.actionTypes.get(name);
  }

  getActionTypeList(): string[] {
    return Array.from(this.actionTypes.keys());
  }

  getHelper(name: string): HandlebarsHelper | undefined {
    const helpers = Handlebars.helpers as UnknownRecord;
    const helper = helpers[name];
    return typeof helper === "function" ? (helper as HandlebarsHelper) : undefined;
  }

  getHelperList(): string[] {
    const helpers = Handlebars.helpers as UnknownRecord;
    return Object.keys(helpers).filter((name) => typeof helpers[name] === "function");
  }

  getPartial(name: string): string | undefined {
    const partials = Handlebars.partials as UnknownRecord;
    const partial = partials[name];

    if (typeof partial === "string") {
      return partial;
    }

    // Compiled partials exist as functions; return undefined instead of serializing internals.
    return undefined;
  }

  getPartialList(): string[] {
    const partials = Handlebars.partials as UnknownRecord;
    return Object.keys(partials);
  }

  setWelcomeMessage(message: string | null): this {
    this.welcomeMessage = message;
    return this;
  }

  getWelcomeMessage(): string | null {
    if (this.welcomeMessage !== null) {
      return this.welcomeMessage;
    }

    return this.i18nAdapter?.getWelcomeMessage?.() ?? null;
  }

  setI18nAdapter(adapter: I18nAdapter): this {
    this.i18nAdapter = adapter;
    return this;
  }

  clearI18nAdapter(): this {
    this.i18nAdapter = undefined;
    return this;
  }

  setPlopfilePath(path: string): this {
    this.plopfilePath = resolve(path);
    this.destBasePath = dirname(this.plopfilePath);
    this.pkgCache = undefined;
    this.pkgCachePath = undefined;
    return this;
  }

  getPlopfilePath(): string | undefined {
    return this.plopfilePath;
  }

  setDestBasePath(path: string): this {
    this.destBasePath = resolve(path);
    return this;
  }

  getDestBasePath(): string {
    return this.destBasePath;
  }

  setDefaultInclude(include: DefaultIncludeConfig): this {
    this.defaultInclude = { ...include };
    return this;
  }

  getDefaultInclude(): DefaultIncludeConfig {
    return { ...this.defaultInclude };
  }

  renderString(template: string, data: Record<string, unknown>): string {
    const unresolved = new Map<string, string>();
    let unresolvedIndex = 0;

    const safeTemplate = template.replace(/{{\s*([A-Za-z0-9_.]+)\s*}}/g, (full, rawPath: string) => {
      if (this.lookupValue(data, rawPath) !== undefined) {
        return full;
      }

      const token = `__PLOPNEXT_UNRESOLVED_${unresolvedIndex++}__`;
      unresolved.set(token, full);
      return token;
    });

    const compiled = Handlebars.compile(safeTemplate, { noEscape: true });
    let rendered = compiled(data);

    for (const [token, original] of unresolved.entries()) {
      rendered = rendered.split(token).join(original);
    }

    return rendered;
  }

  getGenerator(name: string): GeneratorConfig | undefined {
    return this.generators.get(name);
  }

  getGeneratorList(): GeneratorMenuItem[] {
    const result: GeneratorMenuItem[] = [];
    for (const entry of this.generatorEntries) {
      if (entry.kind === "separator") {
        result.push({ type: "separator" as const, separator: entry.text ?? "" });
      } else {
        const cfg = this.generators.get(entry.name);
        if (cfg) result.push({ name: entry.name, description: cfg.description });
      }
    }
    return result;
  }

  // ── i18n integration ─────────────────────────────────────────────

  /**
   * Enable i18n support.
   *
   * - `force`: always use this locale.
   * - `auto` (default): detect locale from process environment,
   *   then fall back to English.
   */
  useI18n(options: UseI18nOptions = { auto: true }): this {
    this.i18nAdapter?.use?.(options);

    return this;
  }

  isI18nEnabled(): boolean {
    return this.i18nAdapter?.isEnabled?.() ?? false;
  }

  // ── Text resolution ───────────────────────────────────────────────

  /**
   * Resolve the display text for a prompt field.
   *
   * When i18n is **disabled**: returns `defaultMessage` as-is.
   * When i18n is **enabled**: looks up `<generatorName>.<promptName>.<field>`
   * in the active locale, falls back to English, then to `defaultMessage`.
   *
   * @param generatorName  Generator key, e.g. "component"
   * @param promptName     Prompt name, e.g. "name"
   * @param field          Field name, e.g. "message"
   * @param defaultMessage Raw string or function defined inside setGenerator
   */
  resolveText(
    generatorName: string,
    promptName: string,
    field: string,
    defaultMessage?: string | ((...args: unknown[]) => string),
    args: unknown[] = [],
  ): string | ((...args: unknown[]) => string) | undefined {
    if (!this.i18nAdapter) {
      return defaultMessage;
    }

    const key = `${generatorName}.${promptName}.${field}`;
    const fallback =
      typeof defaultMessage === "function"
        ? defaultMessage(...args)
        : defaultMessage;
    const resolved = this.i18nAdapter.t(key, args, fallback);

    return resolved !== key ? resolved : (defaultMessage ?? key);
  }

  /**
   * Resolve a built-in core UI text (e.g. "cli.welcome").
   */
  t(key: string, args: unknown[] = [], fallback?: string): string {
    if (!this.i18nAdapter) {
      return fallback ?? key;
    }

    return this.i18nAdapter.t(key, args, fallback);
  }

  // ── Locale helpers ────────────────────────────────────────────────

  /**
   * Add or override messages for an existing locale.
   * Available whether or not i18n plugin is loaded.
   */
  addTexts(locale: LocaleTag, texts: LocaleTexts): this {
    this.i18nAdapter?.registerTexts?.(locale, texts);
    return this;
  }

  registerText(locale: LocaleTag, path: string, text: unknown): this {
    this.i18nAdapter?.registerText?.(locale, path, text);
    return this;
  }

  registerLocale(
    locale: LocaleTag,
    messages: LocaleTexts | string,
    options: RegisterLocaleOptions = {},
  ): this {
    this.i18nAdapter?.registerLocale?.(locale, messages, options);
    return this;
  }

  registerLocales(
    locales: Record<string, LocaleTexts> | LocaleTexts | string,
    options: RegisterLocaleOptions = {},
  ): this {
    this.i18nAdapter?.registerLocales?.(locales, options);
    return this;
  }

  registerTexts(locale: LocaleTag, texts: LocaleTexts | string): this;
  registerTexts(localesOrTexts: Record<string, LocaleTexts> | LocaleTexts | string): this;
  registerTexts(
    localeOrTexts: LocaleTag | Record<string, LocaleTexts> | LocaleTexts | string,
    maybeTexts?: LocaleTexts | string,
  ): this {
    if (typeof localeOrTexts === "string" && typeof maybeTexts !== "undefined") {
      this.i18nAdapter?.registerTexts?.(localeOrTexts, maybeTexts);
      return this;
    }

    this.i18nAdapter?.registerTexts?.(localeOrTexts as Record<string, LocaleTexts> | LocaleTexts | string);
    return this;
  }

  setLocale(locale: LocaleTag): this {
    this.i18nAdapter?.setLocale?.(locale);
    return this;
  }

  getLocale(): LocaleTag {
    return this.i18nAdapter?.getLocale?.() ?? "en";
  }

  hasLocale(locale: LocaleTag): boolean {
    if (locale === "en") {
      return true;
    }

    return this.i18nAdapter?.hasLocale?.(locale) ?? false;
  }

  /**
   * Declare which fields of a custom prompt type are translatable.
   *
   * Each rule specifies a `translateField` (the string to translate) and an
   * optional `path` / `idField` for locating items inside nested arrays.
   * Multiple calls for the same `promptType` accumulate rules.
   *
   * @param promptType  The `type` string used in `registerPrompt()`, e.g. `"table-multiple"`.
   * @param rules       One or more translation rules for this prompt type.
   *
   * @example
   * plop.registerTranslatableField("table-multiple", [
   *   { path: "columns", translateField: "title", idField: "value" },
   *   { path: "rows.#",  translateField: "title", idField: "value" },
   * ]);
   */
  registerTranslatableField(promptType: string, rules: TranslatableFieldRule[]): this {
    const existing = this.translatableFieldRules.get(promptType) ?? [];
    this.translatableFieldRules.set(promptType, [...existing, ...rules]);
    this.i18nAdapter?.registerTranslatableField?.(promptType, rules);
    return this;
  }

  async executeActions(
    actions: Action[],
    answers: Record<string, unknown>,
    options: ActionExecutionOptions = {},
  ): Promise<ActionExecutionResult> {
    const runner = new ActionRunner(this, {
      dest: options.dest,
      force: options.force,
    });

    const steps: ActionStepResult[] = [];
    let failed = false;

    for (const action of actions) {
      try {
        if (typeof action === "string") {
          steps.push({
            type: "comment",
            status: "success",
            message: action,
          });
          continue;
        }

        if (typeof action === "function") {
          const message = await action(answers, { type: "custom" }, this);
          steps.push({
            type: "function",
            status: "success",
            message: String(message),
          });
          continue;
        }

        if (action.skip) {
          const skipResult = await action.skip(answers, action);
          if (skipResult) {
            steps.push({
              type: "skip",
              status: "success",
              message: typeof skipResult === "string" ? skipResult : "Skipped",
              path: typeof action.path === "string" ? action.path : undefined,
            });
            continue;
          }
        }

        if (this.actionTypes.has(action.type)) {
          const customAction = this.actionTypes.get(action.type) as CustomActionFunction;
          const message = await customAction(answers, action as ActionConfig, this);
          steps.push({
            type: action.type,
            status: "success",
            message: String(message),
            path: typeof action.path === "string" ? action.path : undefined,
          });
          continue;
        }

        const result = await runner.run(action.type, action, answers);
        steps.push({
          type: result.type,
          status: "success",
          message: result.message,
          path: result.path,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const type =
          typeof action === "function"
            ? "function"
            : typeof action === "string"
              ? "comment"
              : action.type;
        steps.push({ type, status: "error", message });

        if (typeof action === "object" && action.abortOnFail !== false) {
          failed = true;
          break;
        }
      }
    }

    return { steps, failed };
  }

  async resolveActions(actions: ActionsConfig, answers: Record<string, unknown>): Promise<Action[]> {
    const resolved = typeof actions === "function" ? await actions(answers) : actions;

    if (!Array.isArray(resolved)) {
      throw new Error("Generator actions must resolve to an array.");
    }

    return resolved;
  }

  getActionTypeDisplay(type: string, showTypeNames = false): string {
    if (showTypeNames) {
      return type;
    }

    const typeDisplay: Record<string, string> = {
      function: "->",
      add: "++",
      addMany: "+!",
      modify: "+-",
      append: "_+",
      skip: "--",
    };

    return typeDisplay[type] ?? type;
  }

  formatActionTargetForDisplay(value: string): string {
    if (process.platform !== "win32") {
      return value;
    }

    const normalized = value.replaceAll("/", "\\");

    if (!normalized.startsWith("\\") && !/^[A-Za-z]:\\/.test(normalized)) {
      return `\\${normalized}`;
    }

    return normalized;
  }

  // ── Private ───────────────────────────────────────────────────────

  private registerBuiltInHelpers(): void {
    const applyCase = (formatter: (value: string) => string): HandlebarsHelper => {
      return (value: unknown) => formatter(String(value ?? ""));
    };

    const helperMap: Record<string, HandlebarsHelper> = {
      camelCase: applyCase(camelCase),
      snakeCase: applyCase(snakeCase),
      dashCase: applyCase(kebabCase),
      kabobCase: applyCase(kebabCase),
      kebabCase: applyCase(kebabCase),
      dotCase: applyCase(dotCase),
      pathCase: applyCase(pathCase),
      properCase: applyCase(pascalCase),
      pascalCase: applyCase(pascalCase),
      lowerCase: (value: unknown) => String(value ?? "").toLowerCase(),
      upperCase: (value: unknown) => String(value ?? "").toUpperCase(),
      sentenceCase: applyCase(sentenceCase),
      constantCase: applyCase(constantCase),
      titleCase: applyCase(titleCase),
      pkg: (propertyPath: unknown) => this.readPackageProperty(propertyPath),
    };

    for (const [name, helper] of Object.entries(helperMap)) {
      this.registerHelper(name, helper);
    }
  }

  private readPackageProperty(propertyPath: unknown): string {
    if (typeof propertyPath !== "string" || propertyPath.trim().length === 0) {
      return "";
    }

    const pkg = this.loadPackageJsonNearPlopfile();
    if (!pkg) {
      return "";
    }

    const value = this.getPathValue(pkg, propertyPath);
    if (value === undefined || value === null) {
      return "";
    }

    return String(value);
  }

  private loadPackageJsonNearPlopfile(): UnknownRecord | undefined {
    const baseDirectory = this.plopfilePath ? dirname(this.plopfilePath) : this.destBasePath;
    const packagePath = resolve(baseDirectory, "package.json");

    if (this.pkgCachePath === packagePath) {
      return this.pkgCache;
    }

    this.pkgCachePath = packagePath;

    if (!existsSync(packagePath)) {
      this.pkgCache = undefined;
      return undefined;
    }

    try {
      const raw = readFileSync(packagePath, "utf8");
      const parsed = JSON.parse(raw) as UnknownRecord;
      this.pkgCache = parsed;
      return parsed;
    } catch {
      this.pkgCache = undefined;
      return undefined;
    }
  }

  private getPathValue(source: UnknownRecord, propertyPath: string): unknown {
    const segments = propertyPath.split(".").filter((segment) => segment.length > 0);
    let current: unknown = source;

    for (const segment of segments) {
      if (current === null || typeof current !== "object") {
        return undefined;
      }

      const record = current as UnknownRecord;
      if (!(segment in record)) {
        return undefined;
      }

      current = record[segment];
    }

    return current;
  }

  private lookupValue(data: UnknownRecord, path: string): unknown {
    const keys = path.split(".").filter(Boolean);
    let current: unknown = data;

    for (const key of keys) {
      if (current === null || typeof current !== "object") {
        return undefined;
      }

      const record = current as UnknownRecord;
      current = record[key];
    }

    return current;
  }

  /**
   * Returns prepared prompts for a generator: prompt `message` fields are
   * transformed by plugins (like i18n) before they are rendered by Inquirer.
   */
  preparePrompts(generatorName: string, prompts: PlopPrompt[]): PlopPrompt[] {
    return this.i18nAdapter?.preparePrompts(generatorName, prompts) ?? prompts;
  }

  private resolvePromptTheme(): Pick<DefaultTheme, "prefix" | "spinner" | "style"> {
    const theme = this.resolveTheme();
    return {
      prefix: theme.prefix,
      spinner: theme.spinner,
      style: theme.style,
    };
  }

  private resolveTheme(): Theme {
    const spinnerFrames = this.theme.spinner?.frames;

    return {
      prefix: this.theme.prefix ?? defaultTheme.prefix,
      spinner: {
        ...defaultTheme.spinner,
        ...(this.theme.spinner ?? {}),
        frames: Array.isArray(spinnerFrames)
          ? [...spinnerFrames]
          : [...(defaultTheme.spinner?.frames ?? [])],
      },
      style: {
        ...defaultTheme.style,
        ...(this.theme.style ?? {}),
      },
      plopNext: {
        ...defaultTheme.plopNext,
        ...(this.theme.plopNext ?? {}),
        generatorMenu: {
          ...defaultTheme.plopNext?.generatorMenu,
          ...(this.theme.plopNext?.generatorMenu ?? {}),
        },
        actionLog: {
          ...defaultTheme.plopNext?.actionLog,
          ...(this.theme.plopNext?.actionLog ?? {}),
        },
        errors: {
          ...defaultTheme.plopNext?.errors,
          ...(this.theme.plopNext?.errors ?? {}),
          prefix: {
            ...defaultTheme.plopNext?.errors?.prefix,
            ...(this.theme.plopNext?.errors?.prefix ?? {}),
          },
        },
      },
    };
  }

  private cloneTheme(theme: PlopNextTheme): PlopNextTheme {
    return {
      ...(theme.prefix !== undefined ? { prefix: theme.prefix } : {}),
      ...(theme.spinner !== undefined
        ? {
            spinner: {
              ...theme.spinner,
              ...(Array.isArray(theme.spinner.frames)
                ? { frames: [...theme.spinner.frames] }
                : {}),
            },
          }
        : {}),
      ...(theme.style !== undefined ? { style: { ...theme.style } } : {}),
      ...(theme.plopNext !== undefined
        ? {
            plopNext: {
              ...theme.plopNext,
              ...(theme.plopNext.generatorMenu
                ? {
                    generatorMenu: {
                      ...theme.plopNext.generatorMenu,
                    },
                  }
                : {}),
              ...(theme.plopNext.actionLog
                ? {
                    actionLog: {
                      ...theme.plopNext.actionLog,
                    },
                  }
                : {}),
              ...(theme.plopNext.errors
                ? {
                    errors: {
                      ...theme.plopNext.errors,
                      ...(theme.plopNext.errors.prefix
                        ? {
                            prefix: {
                              ...theme.plopNext.errors.prefix,
                            },
                          }
                        : {}),
                    },
                  }
                : {}),
            },
          }
        : {}),
    };
  }

  private isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
