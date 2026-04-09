import { ActionRunner } from "./ActionRunner";
import Handlebars from "handlebars";
import { dirname, extname, resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
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
  createPromptThemeSelector,
  PromptThemeSelectorRegistry,
  type PromptThemeSelector,
} from "./prompts/themeSelector";
import {
  askCustomPrompt,
  getCustomPrompt,
  listCustomPromptTypes,
  registerCustomPrompt,
} from "./prompts/customPrompt";
import {
  BUILT_IN_PROMPT_TYPES,
  defaultTheme,
  PROMPT_TYPE_THEMES,
} from "./theme";
import type { DefaultTheme, PromptThemeType, Theme } from "./theme";
import type { SeparatorLike } from "./prompts/Separator";
import type { PlopError } from "./errors/PlopError";

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
    localeOrTexts:
      | LocaleTag
      | Record<string, LocaleTexts>
      | LocaleTexts
      | string,
    maybeTexts?: LocaleTexts | string,
  ): void;
  registerText?(locale: LocaleTag, path: string, text: unknown): void;
  setLocale?(locale: LocaleTag): void;
  getLocale?(): LocaleTag;
  registerTranslatableFields?(
    promptType: string,
    rules: TranslatableFieldRule[],
  ): void;
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

const requireModule = createRequire(import.meta.url);
const MODULE_THEME_FILE_EXTENSIONS = new Set([".js", ".cjs", ".ts", ".cts"]);

export interface RegisterPromptOptions {
  /** Theme selector/extraction config for this custom prompt type. */
  theme?: PromptThemeSelector;
  /** Translatable field rules for this custom prompt type. */
  translatableFields?: TranslatableFieldRule[];
}

export class PlopNextCore {
  private readonly generators = new Map<string, GeneratorConfig>();
  private readonly generatorEntries: GeneratorEntry[] = [];
  private readonly actionTypes = new Map<string, CustomActionFunction>();
  /** Legacy custom prompt renderers (registered via addPrompt / setPrompt). */
  private readonly promptTypes = new Map<string, PromptRenderer>();
  /** Typed prompt handlers registered via registerPrompt(handler). */
  private readonly promptHandlerRegistry = new PromptHandlerRegistry();
  private readonly promptThemeSelectorRegistry =
    new PromptThemeSelectorRegistry();
  private i18nAdapter?: I18nAdapter;
  private readonly translatableFieldRules = new Map<
    string,
    TranslatableFieldRule[]
  >();
  private showWelcomeMessageFlag: boolean = false;
  private showTitleFlag: boolean = true;
  private generatorPageSize = 7;
  private plopfilePath?: string;
  private destBasePath: string = process.cwd();
  private defaultInclude: DefaultIncludeConfig = {};
  private theme: PlopNextTheme = {};
  private pkgCachePath?: string;
  private pkgCache?: UnknownRecord;
  private warningReporter?: (warning: PlopError) => void;

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
  registerPrompt(
    name: string,
    prompt: PromptRenderer,
    options: RegisterPromptOptions,
  ): this;
  registerPrompt(handler: PromptHandler): this;
  registerPrompt(
    nameOrHandler: string | PromptHandler,
    prompt?: PromptRenderer,
    options?: RegisterPromptOptions,
  ): this {
    if (typeof nameOrHandler === "string") {
      registerCustomPrompt(this.promptTypes, nameOrHandler, prompt);

      const themeOptions = options?.theme;
      if (themeOptions && Object.keys(themeOptions).length > 0) {
        this.promptThemeSelectorRegistry.registerWithDefault(
          nameOrHandler,
          createPromptThemeSelector(themeOptions),
        );
      } else {
        this.promptThemeSelectorRegistry.registerWithDefault(nameOrHandler);
      }

      if (
        options?.translatableFields &&
        options.translatableFields.length > 0
      ) {
        const existing = this.translatableFieldRules.get(nameOrHandler) ?? [];
        const merged = [...existing, ...options.translatableFields];
        this.translatableFieldRules.set(nameOrHandler, merged);
        this.i18nAdapter?.registerTranslatableFields?.(
          nameOrHandler,
          options.translatableFields,
        );
      }

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
          `Use core.setTheme({ ... }) or core.setTheme("./path/to/theme-file") instead.`,
      );
    }

    const promptTheme = this.resolvePromptTheme(type);
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

  setTheme(theme: PlopNextTheme | string): this {
    const resolvedTheme = this.resolveThemeInput(theme);
    this.theme = this.cloneTheme(resolvedTheme);
    return this;
  }

  getTheme(): PlopNextTheme {
    return this.cloneTheme(this.resolveTheme());
  }

  private resolveThemeInput(theme: PlopNextTheme | string): PlopNextTheme {
    if (typeof theme !== "string") {
      return theme;
    }

    const absolutePath = resolve(this.destBasePath, theme);
    if (!existsSync(absolutePath)) {
      throw new Error(`Theme file not found: ${absolutePath}`);
    }

    const extension = extname(absolutePath).toLowerCase();
    const parsed =
      extension === ".json"
        ? this.parseThemeJsonFile(absolutePath)
        : this.parseThemeModuleFile(absolutePath, extension);

    if (!this.isRecord(parsed)) {
      throw new Error(
        `Theme file must contain an object at root: ${absolutePath}`,
      );
    }

    if (
      this.looksLikeI18nSource(parsed) &&
      !this.looksLikeThemeSource(parsed)
    ) {
      throw new Error(
        `Invalid theme file at ${absolutePath}: looks like locales/texts content. ` +
          `Use registerLocale(s) or registerTexts for translation files.`,
      );
    }

    if (!this.looksLikeThemeSource(parsed)) {
      throw new Error(
        `Invalid theme file at ${absolutePath}: no theme fields were detected.`,
      );
    }

    return parsed as PlopNextTheme;
  }

  private parseThemeJsonFile(filePath: string): unknown {
    try {
      return JSON.parse(readFileSync(filePath, "utf8"));
    } catch (error) {
      throw new Error(
        `Invalid theme JSON file at ${filePath}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private parseThemeModuleFile(filePath: string, extension: string): unknown {
    if (!MODULE_THEME_FILE_EXTENSIONS.has(extension)) {
      throw new Error(
        `Unsupported theme file extension "${extension || "<none>"}" at ${filePath}. ` +
          `Supported extensions: .json, .js, .cjs, .ts, .cts.`,
      );
    }

    let loaded: unknown;
    try {
      loaded = requireModule(filePath);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Unable to load theme module at ${filePath}: ${message}. ` +
          `If this file is ESM-only, import it in your plopfile and pass the object directly to setTheme(...).`,
      );
    }

    const unwrapped = this.unwrapModuleDefault(loaded);
    if (typeof unwrapped === "function") {
      const resolved = unwrapped();
      return this.unwrapModuleDefault(resolved);
    }

    return unwrapped;
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
    return typeof helper === "function"
      ? (helper as HandlebarsHelper)
      : undefined;
  }

  getHelperList(): string[] {
    const helpers = Handlebars.helpers as UnknownRecord;
    return Object.keys(helpers).filter(
      (name) => typeof helpers[name] === "function",
    );
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

  showWelcomeMessage(show: boolean = true): this {
    this.showWelcomeMessageFlag = show;
    return this;
  }

  getWelcomeMessage(): string | null {
    return this.i18nAdapter?.getWelcomeMessage?.() ?? null;
  }

  isWelcomeMessageShown(): boolean {
    return this.showWelcomeMessageFlag;
  }

  showTitle(show: boolean = true): this {
    this.showTitleFlag = show;
    return this;
  }

  isTitleShown(): boolean {
    return this.showTitleFlag;
  }

  /**
   * Set page size used by the generator selection prompt.
   * Defaults to 7.
   */
  setGeneratorPageSize(pageSize: number): this {
    if (!Number.isInteger(pageSize) || pageSize < 1) {
      throw new Error(
        "Generator page size must be an integer greater than or equal to 1.",
      );
    }

    this.generatorPageSize = pageSize;
    return this;
  }

  /**
   * Get page size used by the generator selection prompt.
   */
  getGeneratorPageSize(): number {
    return this.generatorPageSize;
  }

  setI18nAdapter(adapter: I18nAdapter): this {
    this.i18nAdapter = adapter;
    return this;
  }

  setWarningReporter(reporter: ((warning: PlopError) => void) | undefined): this {
    this.warningReporter = reporter;
    return this;
  }

  reportWarning(warning: PlopError): this {
    this.warningReporter?.(warning);
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
    const compiled = Handlebars.compile(template, { noEscape: true });
    return compiled(data);
  }

  getGenerator(name: string): GeneratorConfig | undefined {
    return this.generators.get(name);
  }

  getGeneratorList(): GeneratorMenuItem[] {
    const result: GeneratorMenuItem[] = [];
    for (const entry of this.generatorEntries) {
      if (entry.kind === "separator") {
        result.push({
          type: "separator" as const,
          separator: entry.text ?? "",
        });
      } else {
        const cfg = this.generators.get(entry.name);
        if (cfg)
          result.push({ name: entry.name, description: cfg.description });
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
  registerTexts(
    localesOrTexts: Record<string, LocaleTexts> | LocaleTexts | string,
  ): this;
  registerTexts(
    localeOrTexts:
      | LocaleTag
      | Record<string, LocaleTexts>
      | LocaleTexts
      | string,
    maybeTexts?: LocaleTexts | string,
  ): this {
    if (
      typeof localeOrTexts === "string" &&
      typeof maybeTexts !== "undefined"
    ) {
      this.i18nAdapter?.registerTexts?.(localeOrTexts, maybeTexts);
      return this;
    }

    this.i18nAdapter?.registerTexts?.(
      localeOrTexts as Record<string, LocaleTexts> | LocaleTexts | string,
    );
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
          const customAction = this.actionTypes.get(
            action.type,
          ) as CustomActionFunction;
          const message = await customAction(
            answers,
            action as ActionConfig,
            this,
          );
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

  async resolveActions(
    actions: ActionsConfig,
    answers: Record<string, unknown>,
  ): Promise<Action[]> {
    const resolved =
      typeof actions === "function" ? await actions(answers) : actions;

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
    const applyCase = (
      formatter: (value: string) => string,
    ): HandlebarsHelper => {
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
    const baseDirectory = this.plopfilePath
      ? dirname(this.plopfilePath)
      : this.destBasePath;
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
    const segments = propertyPath
      .split(".")
      .filter((segment) => segment.length > 0);
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

  /**
   * Returns prepared prompts for a generator: prompt `message` fields are
   * transformed by plugins (like i18n) before they are rendered by Inquirer.
   */
  preparePrompts(generatorName: string, prompts: PlopPrompt[]): PlopPrompt[] {
    return this.i18nAdapter?.preparePrompts(generatorName, prompts) ?? prompts;
  }

  private resolvePromptTheme(type: string): UnknownRecord {
    const theme = this.resolvePromptTypeTheme(type);
    return this.promptThemeSelectorRegistry.resolveTheme(type, theme);
  }

  /**
   * Resolve the full theme for a specific prompt type.
   * Merges in order: defaultTheme → type defaults → user global theme → user type theme.
   */
  private resolvePromptTypeTheme(type: string): Theme {
    if (type === "generatorList") {
      const selectDefaults = PROMPT_TYPE_THEMES["select"];
      const userSelectTheme = this.resolveUserPromptTypeTheme("select");
      const userGeneratorSelectTheme = this.resolveUserPromptTypeTheme(type);

      return this.mergeThemeLayers(
        selectDefaults,
        this.resolveNormalizedGlobalTheme(),
        userSelectTheme,
        userGeneratorSelectTheme,
      );
    }

    const typeDefaults = PROMPT_TYPE_THEMES[type as PromptThemeType];
    const userTypeTheme = this.resolveUserPromptTypeTheme(type);

    return this.mergeThemeLayers(
      typeDefaults,
      this.resolveNormalizedGlobalTheme(),
      userTypeTheme,
    );
  }

  private resolveTheme(): Theme {
    return this.mergeThemeLayers(this.resolveNormalizedGlobalTheme());
  }

  private cloneTheme(theme: PlopNextTheme): PlopNextTheme {
    return this.cloneUnknown(theme) as PlopNextTheme;
  }

  private resolveNormalizedGlobalTheme(): Partial<Theme> {
    return this.normalizeThemeScope(this.theme as UnknownRecord);
  }

  private resolveUserPromptTypeTheme(type: string): Partial<Theme> | undefined {
    const source = this.theme as UnknownRecord;
    const rawTypeTheme = source[type];

    if (!this.isRecord(rawTypeTheme)) {
      return undefined;
    }

    return this.normalizeThemeScope(rawTypeTheme);
  }

  private normalizeThemeScope(source: UnknownRecord): Partial<Theme> {
    const normalized: UnknownRecord = {};

    for (const [key, value] of Object.entries(source)) {
      if (this.isPromptThemeTypeKey(key)) continue;
      if (
        key === "waitingMessage" ||
        key === "maskedText" ||
        key === "disabledError"
      ) {
        continue;
      }
      normalized[key] = value;
    }

    const style = this.isRecord(normalized.style)
      ? { ...normalized.style }
      : {};

    if (source.waitingMessage !== undefined) {
      if (typeof source.waitingMessage === "function") {
        style.waitingMessage = source.waitingMessage;
      } else if (typeof source.waitingMessage === "string") {
        const template = source.waitingMessage;
        style.waitingMessage = (enterKey: string) =>
          template
            .replaceAll("{{enterKey}}", enterKey)
            .replaceAll("{enterKey}", enterKey);
      }
    }

    if (typeof source.maskedText === "string") {
      style.maskedText = source.maskedText;
    }

    if (Object.keys(style).length > 0) {
      normalized.style = style;
    }

    const i18n = this.isRecord(normalized.i18n) ? { ...normalized.i18n } : {};

    if (typeof source.disabledError === "string") {
      i18n.disabledError = source.disabledError;
    }

    if (Object.keys(i18n).length > 0) {
      normalized.i18n = i18n;
    }

    return normalized as Partial<Theme>;
  }

  private mergeThemeLayers(
    ...layers: Array<Partial<Theme> | undefined>
  ): Theme {
    const mergedTheme: Theme = {
      icon: defaultTheme.icon,
      prefix: defaultTheme.prefix,
      spinner: {
        ...defaultTheme.spinner,
        frames: [...(defaultTheme.spinner?.frames ?? [])],
      },
      style: {
        ...defaultTheme.style,
      },
      validationFailureMode: defaultTheme.validationFailureMode,
      indexMode: defaultTheme.indexMode,
      i18n: {
        ...defaultTheme.i18n,
      },
      keybindings: defaultTheme.keybindings,
      plopNext: {
        ...defaultTheme.plopNext,
        generatorMenu: {
          ...defaultTheme.plopNext?.generatorMenu,
        },
        actionLog: {
          ...defaultTheme.plopNext?.actionLog,
        },
        errors: {
          ...defaultTheme.plopNext?.errors,
          prefix: {
            ...defaultTheme.plopNext?.errors?.prefix,
          },
        },
      },
    };

    for (const layer of layers) {
      if (!layer) continue;

      mergedTheme.icon = this.mergeIconLayers(mergedTheme.icon, layer.icon);

      if (layer.prefix !== undefined) {
        mergedTheme.prefix = layer.prefix;
      }

      if (layer.spinner) {
        mergedTheme.spinner = {
          ...mergedTheme.spinner,
          ...layer.spinner,
          ...(Array.isArray(layer.spinner.frames)
            ? { frames: [...layer.spinner.frames] }
            : {}),
        };
      }

      if (layer.style) {
        mergedTheme.style = {
          ...mergedTheme.style,
          ...layer.style,
        };
      }

      if (layer.validationFailureMode !== undefined) {
        mergedTheme.validationFailureMode = layer.validationFailureMode;
      }

      if (layer.indexMode !== undefined) {
        mergedTheme.indexMode = layer.indexMode;
      }

      if (layer.i18n) {
        mergedTheme.i18n = {
          ...mergedTheme.i18n,
          ...layer.i18n,
        };
      }

      if (layer.keybindings !== undefined) {
        mergedTheme.keybindings = [...layer.keybindings];
      }

      if (layer.plopNext) {
        mergedTheme.plopNext = {
          ...mergedTheme.plopNext,
          ...layer.plopNext,
          generatorMenu: {
            ...mergedTheme.plopNext?.generatorMenu,
            ...layer.plopNext.generatorMenu,
          },
          actionLog: {
            ...mergedTheme.plopNext?.actionLog,
            ...layer.plopNext.actionLog,
          },
          errors: {
            ...mergedTheme.plopNext?.errors,
            ...layer.plopNext.errors,
            prefix: {
              ...mergedTheme.plopNext?.errors?.prefix,
              ...layer.plopNext.errors?.prefix,
            },
          },
        };
      }
    }

    return mergedTheme;
  }

  private looksLikeThemeSource(value: UnknownRecord): boolean {
    const keys = Object.keys(value);
    if (keys.length === 0) {
      return false;
    }

    const rootThemeKeys = new Set([
      "icon",
      "prefix",
      "spinner",
      "style",
      "validationFailureMode",
      "indexMode",
      "i18n",
      "keybindings",
      "plopNext",
      "waitingMessage",
      "maskedText",
      "disabledError",
    ]);

    return keys.some(
      (key) => rootThemeKeys.has(key) || this.isPromptThemeTypeKey(key),
    );
  }

  private looksLikeI18nSource(value: UnknownRecord): boolean {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return false;
    }

    const localeBundle = entries.every(
      ([key, item]) => this.isLocaleLikeKey(key) && this.isRecord(item),
    );

    if (localeBundle) {
      return true;
    }

    const knownI18nRoots = new Set([
      "cli",
      "inquirer",
      "actions",
      "errors",
      "help",
    ]);
    return entries.some(([key]) => knownI18nRoots.has(key));
  }

  private isLocaleLikeKey(key: string): boolean {
    return /^[a-z]{2}(?:[-_][A-Za-z0-9]{2,8})*$/i.test(key);
  }

  private isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private isPromptThemeTypeKey(key: string): key is PromptThemeType {
    return (BUILT_IN_PROMPT_TYPES as readonly string[]).includes(key);
  }

  private unwrapModuleDefault(value: unknown): unknown {
    if (!this.isRecord(value)) {
      return value;
    }

    const defaultValue = value["default"];
    if (typeof defaultValue !== "undefined") {
      return defaultValue;
    }

    return value;
  }

  private cloneUnknown(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.cloneUnknown(item));
    }

    if (this.isRecord(value)) {
      const cloned: UnknownRecord = {};
      for (const [key, item] of Object.entries(value)) {
        cloned[key] = this.cloneUnknown(item);
      }
      return cloned;
    }

    return value;
  }

  /**
   * Merge icon values when applying one layer over another.
   */
  private mergeIconLayers(
    base: DefaultTheme["icon"],
    override: DefaultTheme["icon"] | undefined,
  ):
    | string
    | {
        idle?: string;
        done?: string;
        cursor?: string;
        checked?: string;
        unchecked?: string;
        disabledChecked?: string;
        disabledUnchecked?: string;
      }
    | undefined {
    if (override === undefined) return base;
    if (typeof override === "string") return override;
    if (typeof base === "string" || base === undefined) {
      return { ...override };
    }
    return { ...base, ...override };
  }
}
