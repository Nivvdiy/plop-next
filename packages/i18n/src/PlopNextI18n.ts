import type {
  I18nAdapter,
  LocaleTexts,
  LocaleTag,
  PlopPrompt,
  TranslatableFieldRule,
  UnknownRecord,
  UseI18nOptions,
} from "@plop-next/core";
import {
  createConfirmHandler,
  createSelectHandler,
  createCheckboxHandler,
  createSearchHandler,
  createEditorHandler,
  createPasswordHandler,
} from "@plop-next/core";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, isAbsolute, resolve } from "node:path";
import { createRequire } from "node:module";
import type { PlopNextCore } from "@plop-next/core";
import type { InquirerPromptFn } from "@plop-next/core";
import { createLocalizedPrompts } from "@inquirer/i18n";
import type { Locale as InquirerLocale } from "@inquirer/i18n";
import { I18nRegistry } from "./I18nRegistry";

type LocalesBundle = Record<string, LocaleTexts>;
type LocaleSource = LocaleTexts | LocalesBundle | string;
type SourceIntent = "locale" | "locales" | "texts";
type NamedChoice = { name: string; value: unknown };
type PromptRecord = PlopPrompt & UnknownRecord;

const requireModule = createRequire(import.meta.url);
const SUPPORTED_I18N_FILE_EXTENSIONS = new Set([".json", ".js", ".cjs", ".ts", ".cts"]);

export interface RegisterLocaleOptions {
  /** If true, this locale becomes the active locale immediately. */
  activate?: boolean;
}

/**
 * PlopNextI18n
 *
 * Plugin class for `@plop-next/i18n`.
 * Must be installed on a `PlopNextCore` instance before `useI18n` is called.
 *
 * @example
 * import { PlopNextI18n } from "@plop-next/i18n";
 * const i18nPlugin = new PlopNextI18n(plopNext);
 * i18nPlugin.registerLocale("fr", frMessages);
 * plopNext.useI18n({ force: "fr" });
 */
export class PlopNextI18n {
  private readonly registry = new I18nRegistry();
  private enabled = false;
  private readonly translatableRules = new Map<string, TranslatableFieldRule[]>();

  constructor(private readonly core: PlopNextCore) {
    this.install();
  }

  install(): this {
    const adapter: I18nAdapter = {
      t: (key, args, fallback) => this.registry.t(key, args, fallback),
      preparePrompts: (generatorName, prompts) => this.preparePrompts(generatorName, prompts),
      getWelcomeMessage: () => {
        const value = this.registry.t("cli.welcomeMessage");
        return value === "cli.welcomeMessage" ? null : value;
      },
      use: (options) => this.enable(options),
      isEnabled: () => this.enabled,
      hasLocale: (locale) => this.registry.hasLocale(locale),
      registerLocale: (locale, messages, options) => {
        this.registerLocale(locale, messages, options);
      },
      registerLocales: (locales, options) => {
        this.registerLocales(locales, options);
      },
      registerTexts: (localeOrTexts, maybeTexts) => {
        if (typeof maybeTexts === "undefined") {
          this.registerTexts(localeOrTexts as LocaleSource);
          return;
        }
        this.registerTexts(localeOrTexts as LocaleTag, maybeTexts);
      },
      registerText: (locale, path, text) => {
        this.registerText(locale, path, text);
      },
      setLocale: (locale) => {
        this.registry.setActiveLocale(locale);
      },
      getLocale: () => this.registry.getActiveLocale(),
      registerTranslatableFields: (promptType, rules) => {
        const existing = this.translatableRules.get(promptType) ?? [];
        this.translatableRules.set(promptType, [...existing, ...rules]);
      },
    };

    this.core.setI18nAdapter(adapter);
    return this;
  }

  /**
   * Register (or extend) a locale's message map.
   * Merges deeply with any previously registered messages for that locale.
   *
   * @param locale   BCP-47 tag, e.g. "fr", "es", "ja"
   * @param messages Flat or nested translation map
   * @param options  `activate: true` sets this locale as active immediately
   */
  registerLocale(
    locale: LocaleTag,
    texts: LocaleTexts | string,
    options: RegisterLocaleOptions = {},
  ): this {
    this.registry.registerLocale(locale, this.resolveSingleLocaleTexts(locale, texts));
    if (options.activate) {
      this.registry.setActiveLocale(locale);
    }
    return this;
  }

  registerLocales(
    locales: LocaleSource,
    options: RegisterLocaleOptions = {},
  ): this {
    const resolved = this.resolveLocalesOrSingle(
      locales,
      this.registry.getActiveLocale(),
      "locales",
    );

    if (this.isLocalesBundle(resolved)) {
      const entries = Object.entries(resolved);
      for (const [locale, texts] of entries) {
        this.registry.registerLocale(locale, texts);
      }

      if (options.activate && entries[0]) {
        this.registry.setActiveLocale(entries[0][0]);
      }
      return this;
    }

    const active = this.registry.getActiveLocale();
    this.registry.registerLocale(active, resolved);
    if (options.activate) {
      this.registry.setActiveLocale(active);
    }
    return this;
  }

  /**
   * Add or override texts for a locale. Merges deeply with existing texts.
   *
   * @param locale  Locale tag, e.g. "fr"
   * @param texts   Partial or full nested text map
   */
  registerTexts(locale: LocaleTag, texts: LocaleTexts | string): this;
  registerTexts(localesOrTexts: LocaleSource): this;
  registerTexts(
    localeOrTexts: LocaleTag | LocaleSource,
    maybeTexts?: LocaleTexts | string,
  ): this {
    if (typeof localeOrTexts === "string" && typeof maybeTexts !== "undefined") {
      this.registry.registerTexts(
        localeOrTexts,
        this.resolveSingleLocaleTexts(localeOrTexts, maybeTexts),
      );
      return this;
    }

    const resolved = this.resolveLocalesOrSingle(
      localeOrTexts as LocaleSource,
      this.registry.getActiveLocale(),
      "texts",
    );

    if (this.isLocalesBundle(resolved)) {
      for (const [locale, texts] of Object.entries(resolved)) {
        this.registry.registerTexts(locale, texts);
      }
      return this;
    }

    this.registry.registerTexts(this.registry.getActiveLocale(), resolved);
    return this;
  }

  /**
   * Override a single text value identified by a dot-notation path.
   *
   * @param locale  Locale tag, e.g. "fr"
   * @param path    Dot-notation key, e.g. "cli.selectGenerator"
   * @param text    The translated string or function
   *
   * @example
   * i18n.registerText("fr", "cli.selectGenerator", "Choisissez un générateur");
   */
  registerText(locale: LocaleTag, path: string, text: unknown): this {
    this.registry.registerText(locale, path, text);
    return this;
  }

  /**
   * Return the currently active locale tag.
   */
  getActiveLocale(): LocaleTag {
    return this.registry.getActiveLocale();
  }

  /**
   * Check if a locale has been registered.
   */
  hasLocale(locale: LocaleTag): boolean {
    return this.registry.hasLocale(locale);
  }

  private resolveSingleLocaleTexts(locale: LocaleTag, input: LocaleTexts | string): LocaleTexts {
    const resolved = this.resolveLocalesOrSingle(input, locale, "locale");

    if (this.isLocalesBundle(resolved)) {
      if (resolved[locale]) {
        return resolved[locale];
      }

      const entries = Object.entries(resolved);
      if (entries.length === 1 && entries[0]) {
        return entries[0][1];
      }

      throw new Error(
        `Unable to resolve texts for locale "${locale}" from a multi-locale source.`,
      );
    }

    return resolved;
  }

  private resolveLocalesOrSingle(
    input: LocaleSource,
    fallbackLocale: LocaleTag,
    intent: SourceIntent,
  ): LocalesBundle | LocaleTexts {
    if (typeof input === "string") {
      return this.resolveFromPath(input, fallbackLocale, intent);
    }

    if (!this.isPlainObject(input)) {
      throw new Error(
        "i18n source must be an object, a locale file path (.json/.js/.cjs/.ts/.cts), or a directory path.",
      );
    }

    return this.normalizeObjectInput(input, fallbackLocale, intent);
  }

  private resolveFromPath(
    inputPath: string,
    fallbackLocale: LocaleTag,
    intent: SourceIntent,
  ): LocalesBundle | LocaleTexts {
    const absolutePath = isAbsolute(inputPath) ? inputPath : resolve(process.cwd(), inputPath);

    if (!existsSync(absolutePath)) {
      throw new Error(`i18n path not found: ${absolutePath}`);
    }

    const stats = statSync(absolutePath);
    if (stats.isDirectory()) {
      const files = readdirSync(absolutePath)
        .filter((name: string) => SUPPORTED_I18N_FILE_EXTENSIONS.has(extname(name).toLowerCase()))
        .sort();

      if (files.length === 0) {
        throw new Error(
          `No locale/text files found in directory: ${absolutePath}. ` +
            `Supported extensions: .json, .js, .cjs, .ts, .cts.`,
        );
      }

      const bundle: LocalesBundle = {};
      for (const fileName of files) {
        const filePath = resolve(absolutePath, fileName);
        const parsed = this.parseSourceFile(filePath);
        const normalized = this.normalizeObjectInput(parsed, fallbackLocale, intent);

        if (this.isLocalesBundle(normalized)) {
          for (const [locale, texts] of Object.entries(normalized)) {
            bundle[locale] = this.mergePlainObjects(bundle[locale] ?? {}, texts);
          }
          continue;
        }

        const locale = basename(fileName, extname(fileName));
        if (!this.isLocaleLikeKey(locale) && intent !== "locale") {
          throw new Error(
            `Invalid ${intent} file name "${fileName}" in directory: ${absolutePath}. ` +
              `Expected a locale-like name such as "en.json", "fr.js", or "de.ts".`,
          );
        }

        const targetLocale = this.isLocaleLikeKey(locale) ? locale : fallbackLocale;
        bundle[targetLocale] = this.mergePlainObjects(bundle[targetLocale] ?? {}, normalized);
      }

      return bundle;
    }

    const parsed = this.parseSourceFile(absolutePath);
    return this.normalizeObjectInput(parsed, fallbackLocale, intent);
  }

  private parseSourceFile(filePath: string): LocaleTexts {
    const extension = extname(filePath).toLowerCase();

    if (extension === ".json") {
      return this.parseJsonFile(filePath);
    }

    if (!SUPPORTED_I18N_FILE_EXTENSIONS.has(extension)) {
      throw new Error(
        `Unsupported i18n file extension "${extension || "<none>"}" at ${filePath}. ` +
          `Supported extensions: .json, .js, .cjs, .ts, .cts.`,
      );
    }

    return this.parseModuleFile(filePath);
  }

  private parseJsonFile(filePath: string): LocaleTexts {
    let parsed: unknown;
    try {
      parsed = JSON.parse(readFileSync(filePath, "utf8"));
    } catch (error) {
      throw new Error(
        `Invalid JSON file at ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    if (!this.isPlainObject(parsed)) {
      throw new Error(`JSON file must contain an object at root: ${filePath}`);
    }

    return parsed as LocaleTexts;
  }

  private parseModuleFile(filePath: string): LocaleTexts {
    let loaded: unknown;
    try {
      loaded = requireModule(filePath);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Unable to load i18n module at ${filePath}: ${message}. ` +
          `If this file is ESM-only, import it in your plopfile and pass the object directly.`,
      );
    }

    const unwrapped = this.unwrapModuleDefault(loaded);
    const value = typeof unwrapped === "function" ? this.unwrapModuleDefault(unwrapped()) : unwrapped;

    if (!this.isPlainObject(value)) {
      throw new Error(`i18n module must export an object at root: ${filePath}`);
    }

    return value as LocaleTexts;
  }

  private normalizeObjectInput(
    input: LocaleTexts,
    fallbackLocale: LocaleTag,
    intent: SourceIntent,
  ): LocalesBundle | LocaleTexts {
    if (this.looksLikeThemeObject(input)) {
      throw new Error(
        `Invalid ${intent} source: looks like a theme object. ` +
          `Use core.setTheme(pathOrTheme) for theme files.`,
      );
    }

    if (this.isLocalesBundle(input)) {
      return input;
    }

    // Single-locale depth in a multi-locale API is valid; it will target fallbackLocale.
    // Callers deciding multi-only behavior can wrap the result if needed.
    if (this.isPlainObject(input)) {
      return input;
    }

    return { [fallbackLocale]: input };
  }

  private isLocalesBundle(value: unknown): value is LocalesBundle {
    if (!this.isPlainObject(value)) {
      return false;
    }

    const entries = Object.entries(value);
    if (entries.length === 0) {
      return false;
    }

    // Multi-locale objects can contain one locale or many locales.
    return entries.every(
      ([key, val]) => this.isLocaleLikeKey(key) && this.isPlainObject(val),
    );
  }

  private isLocaleLikeKey(key: string): boolean {
    return /^[a-z]{2}(?:[-_][A-Za-z0-9]{2,8})*$/i.test(key);
  }

  private looksLikeThemeObject(value: LocaleTexts): boolean {
    if (!this.isPlainObject(value)) {
      return false;
    }

    const keys = Object.keys(value);
    if (keys.length === 0) {
      return false;
    }

    const directThemeKeys = new Set([
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
      "input",
      "select",
      "list",
      "checkbox",
      "confirm",
      "search",
      "password",
      "expand",
      "editor",
      "number",
      "rawlist",
    ]);

    return keys.some((key) => directThemeKeys.has(key));
  }

  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  private unwrapModuleDefault(value: unknown): unknown {
    if (!this.isPlainObject(value)) {
      return value;
    }

    if (typeof value.default !== "undefined") {
      return value.default;
    }

    return value;
  }

  private mergePlainObjects(
    target: LocaleTexts,
    source: LocaleTexts,
  ): LocaleTexts {
    const out: LocaleTexts = { ...target };
    for (const [key, value] of Object.entries(source)) {
      if (
        this.isPlainObject(value) &&
        this.isPlainObject(out[key])
      ) {
        out[key] = this.mergePlainObjects(out[key] as LocaleTexts, value);
      } else {
        out[key] = value;
      }
    }
    return out;
  }

  private normalize(value: string): string {
    const [withoutEncoding = ''] = value.split('.');
    const [lang = ''] = withoutEncoding.split(/[_-]/);
    return lang.toLowerCase();
  }

  private enable(options: UseI18nOptions = { auto: true }): void {
    this.enabled = true;

    const locale =
      options.force ??
      (options.auto !== false ? this.detectLocale() : undefined);

    if (locale) {
      this.registry.setActiveLocale(locale);
    }

    this.applyInquirerLocale();
  }

  private applyInquirerLocale(): void {
    const locale = this.buildInquirerLocale();
    const localized = createLocalizedPrompts(locale);
    this.core.registerPrompt(createConfirmHandler(localized.confirm as unknown as InquirerPromptFn));
    this.core.registerPrompt(createSelectHandler(localized.select as unknown as InquirerPromptFn));
    this.core.registerPrompt(createCheckboxHandler(localized.checkbox as unknown as InquirerPromptFn));
    this.core.registerPrompt(createSearchHandler(localized.search as unknown as InquirerPromptFn));
    this.core.registerPrompt(createEditorHandler(localized.editor as unknown as InquirerPromptFn));
    this.core.registerPrompt(createPasswordHandler(localized.password as unknown as InquirerPromptFn));
  }

  private buildInquirerLocale(): InquirerLocale {
    const t = (key: string, fallback: string): string => {
      const full = `inquirer.${key}`;
      const val = this.registry.t(full);
      return val === full ? fallback : val;
    };

    return {
      confirm: {
        yesLabel: t("confirm.yesLabel", "Yes"),
        noLabel: t("confirm.noLabel", "No"),
        hintYes: t("confirm.hintYes", "Y/n"),
        hintNo: t("confirm.hintNo", "y/N"),
      },
      select: {
        helpNavigate: t("select.helpNavigate", "navigate"),
        helpSelect: t("select.helpSelect", "select"),
      },
      checkbox: {
        helpNavigate: t("checkbox.helpNavigate", "navigate"),
        helpSelect: t("checkbox.helpSelect", "select"),
        helpSubmit: t("checkbox.helpSubmit", "submit"),
        helpAll: t("checkbox.helpAll", "all"),
        helpInvert: t("checkbox.helpInvert", "invert"),
      },
      search: {
        helpNavigate: t("search.helpNavigate", "navigate"),
        helpSelect: t("search.helpSelect", "select"),
      },
      editor: {
        waitingMessage: (enterKey: string) =>
          this.registry.t("inquirer.editor.waitingMessage", [enterKey], `Press ${enterKey} to launch your preferred editor.`),
      },
      password: {
        maskedText: t("password.maskedText", "[input is masked]"),
      },
    };
  }

  
  private detectLocale(): LocaleTag {

    // 1. LANGUAGE (GNU/Linux colon-separated preference list)
    for (const seg of (process.env["LANGUAGE"] ?? "").split(":")) {
      const lang = this.normalize(seg);
      if (lang) return lang;
    }

    // 2-4. LC_ALL, LC_MESSAGES, LANG
    for (const key of ["LC_ALL", "LC_MESSAGES", "LANG"] as const) {
      const lang = this.normalize(process.env[key] ?? "");
      if (lang) return lang;
    }

    // 5. Intl API (cross-platform / primary Windows path)
    try {
      const lang = this.normalize(Intl.DateTimeFormat().resolvedOptions().locale);
      if (lang) return lang;
    } catch {
      // ignore
    }

    return "en";
  }

  private preparePrompts(generatorName: string, prompts: PlopPrompt[]): PlopPrompt[] {
    if (!this.enabled) {
      return prompts;
    }

    return prompts.map((prompt) => {
      const resolvedPrompt: PlopPrompt = { ...prompt };
      const resolvedPromptRecord = resolvedPrompt as PromptRecord;

      const messageFallback =
        typeof prompt.message === "string" ? prompt.message : undefined;
      const message = this.resolvePromptField(
        generatorName,
        prompt.name,
        "message",
        messageFallback,
      );

      if (message !== undefined) {
        resolvedPrompt.message = message;
      }

      // Handle choices if they exist on this prompt type
      const promptRecord = prompt as PromptRecord;
      const choices = promptRecord["choices"];
      if (Array.isArray(choices)) {
        resolvedPromptRecord["choices"] = this.translateChoices(generatorName, prompt.name, choices);
      } else if (typeof choices === "function") {
        resolvedPromptRecord["choices"] = async (answers: Record<string, unknown>) => {
          const rawChoices = await choices(answers);
          return this.translateChoices(generatorName, prompt.name, rawChoices);
        };
      }

      const translatableFields = [
        "placeholder",
        "description",
        "hint",
        "instructions",
        "helpText",
        "noResults",
        "searchingText",
      ];

      for (const field of translatableFields) {
        const rawValue = resolvedPromptRecord[field];
        const fallback = typeof rawValue === "string" ? rawValue : undefined;
        const translated = this.resolvePromptField(
          generatorName,
          prompt.name,
          field,
          fallback,
        );

        if (translated !== undefined) {
          resolvedPromptRecord[field] = translated;
        }
      }

      // Apply custom translatable field rules registered for this prompt type.
      const customRules = this.translatableRules.get(prompt.type) ?? [];
      for (const rule of customRules) {
        this.applyRule(resolvedPromptRecord, rule, `${generatorName}.${prompt.name}`);
      }

      return resolvedPrompt;
    });
  }

  /**
   * Resolve a prompt field translation with fallback chain:
   * 1. Try with prompt name as-is (handles both plain names and indexed names like "name[0]")
   * 2. If that doesn't resolve, try without any index suffix (for indexed arrays)
   * 3. Fall back to provided default
   *
   * @example
   * // For promptName="name[0]" and field="message":
   * // Tries: "component.name[0].message" → "component.name.message" → fallback
   */
  private resolvePromptField(
    generatorName: string,
    promptName: string,
    field: string,
    fallback?: string,
  ): string | undefined {
    // Try with prompt name as-is
    const key = `${generatorName}.${promptName}.${field}`;
    let resolved = this.registry.t(key, [], undefined);

    // If not found and prompt name contains index pattern, try without index
    if (resolved === key && /\[\d+\]/.test(promptName)) {
      const nameWithoutIndex = promptName.replace(/\[\d+\]$/, "");
      const fallbackKey = `${generatorName}.${nameWithoutIndex}.${field}`;
      resolved = this.registry.t(fallbackKey, [], undefined);
    }

    // If still not found, use provided fallback
    if (resolved === key && typeof fallback !== "undefined") {
      return fallback;
    }

    // If resolved but is the key itself (not translated), return undefined
    if (resolved === key) {
      return undefined;
    }

    return resolved;
  }

  private translateChoices(
    generatorName: string,
    promptName: string,
    choices: Array<string | NamedChoice>,
  ): Array<string | NamedChoice> {
    return choices.map((choice) => {
      if (typeof choice === "string") {
        const key = `${generatorName}.${promptName}.choices.${choice}`;
        return this.registry.t(key, [], choice);
      }

      if (choice && typeof choice === "object") {
        const rawName = choice.name;
        if (typeof rawName !== "string") {
          return choice;
        }

        const valueKey = this.choiceKey(choice);
        const key = `${generatorName}.${promptName}.choices.${valueKey}`;
        return {
          ...choice,
          name: this.registry.t(key, [], rawName),
        };
      }

      return choice;
    });
  }

  private choiceKey(choice: NamedChoice): string {
    if (typeof choice.value === "string" || typeof choice.value === "number") {
      return String(choice.value);
    }

    return choice.name;
  }

  // ── Custom translatable-field engine ────────────────────────────────

  /**
   * Apply one translation rule to the (shallow-copied) prompt record.
   *
   * The implementation is purely functional: nested arrays / objects are
   * reconstructed copy-on-write, so the original prompt config is never
   * mutated.
   */
  private applyRule(
    promptRecord: Record<string, unknown>,
    rule: TranslatableFieldRule,
    keyBase: string,
  ): void {
    if (!rule.path) {
      // Simple top-level field — the shallow copy already owns this key.
      const fieldValue = promptRecord[rule.translateField];
      if (typeof fieldValue === "string") {
        const key = `${keyBase}.${rule.translateField}`;
        const translated = this.registry.t(key, [], fieldValue);
        if (translated !== fieldValue) {
          promptRecord[rule.translateField] = translated;
        }
      }
      return;
    }

    const hasWildcard = rule.path.includes("#");
    // Normalise: "path" without '#' + idField  →  treat path as array container
    const segments = !hasWildcard && rule.idField
      ? [...rule.path.split("."), "#"]
      : rule.path.split(".");

    const firstSeg = segments[0];
    if (!firstSeg) return;

    const original = promptRecord[firstSeg];
    const result = this.walkPath(original, segments, 1, `${keyBase}.${firstSeg}`, rule);
    if (result !== original) {
      promptRecord[firstSeg] = result;
    }
  }

  /**
   * Recursively walk `segments` starting at `idx`, navigating into `current`.
   * Returns a *new* value when a translation changed something, or `current`
   * unchanged when nothing was modified (enabling cheap reference equality
   * checks at every level).
   */
  private walkPath(
    current: unknown,
    segments: string[],
    idx: number,
    keyPath: string,
    rule: TranslatableFieldRule,
  ): unknown {
    if (idx >= segments.length) {
      return this.translateFieldValue(current, keyPath, rule.translateField);
    }

    const segment = segments[idx];

    if (segment === "#") {
      if (!Array.isArray(current)) return current;

      // idField applies only to the *last* '#' in the path.
      const isLastHash = !segments.slice(idx + 1).includes("#");

      let changed = false;
      const newArr = current.map((item: unknown, index: number) => {
        let keySegment: string;
        if (isLastHash && rule.idField) {
          const idVal =
            item !== null && typeof item === "object" && !Array.isArray(item)
              ? (item as Record<string, unknown>)[rule.idField]
              : undefined;
          keySegment = idVal != null ? String(idVal) : String(index);
        } else {
          keySegment = String(index);
        }
        const newItem = this.walkPath(
          item,
          segments,
          idx + 1,
          `${keyPath}.${keySegment}`,
          rule,
        );
        if (newItem !== item) changed = true;
        return newItem;
      });

      return changed ? newArr : current;
    }

    // Regular segment: navigate into a plain object property.
    if (!current || typeof current !== "object" || Array.isArray(current)) return current;
    const record = current as Record<string, unknown>;
    const next = record[segment];
    const newNext = this.walkPath(next, segments, idx + 1, `${keyPath}.${segment}`, rule);
    if (newNext === next) return current;
    return { ...record, [segment]: newNext };
  }

  /**
   * Translate `fieldName` on `obj`. Returns a *new* object when the translation
   * differs from the original value, or `obj` itself when nothing changed.
   */
  private translateFieldValue(
    obj: unknown,
    keyPath: string,
    fieldName: string,
  ): unknown {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return obj;
    const record = obj as Record<string, unknown>;
    const fieldValue = record[fieldName];
    if (typeof fieldValue !== "string") return obj;

    const translated = this.registry.t(keyPath, [], fieldValue);
    if (translated === fieldValue) return obj;
    return { ...record, [fieldName]: translated };
  }
}
