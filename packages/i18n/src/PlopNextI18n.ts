import type {
  I18nAdapter,
  LocaleTexts,
  LocaleTag,
  PlopPrompt,
  UnknownRecord,
  UseI18nOptions,
} from "@plop-next/core";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, isAbsolute, resolve } from "node:path";
import type { PlopNextCore } from "@plop-next/core";
import { I18nRegistry } from "./I18nRegistry";

type LocalesBundle = Record<string, LocaleTexts>;
type LocaleSource = LocaleTexts | LocalesBundle | string;
type NamedChoice = { name: string; value: unknown };
type PromptRecord = PlopPrompt & UnknownRecord;

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
    const resolved = this.resolveLocalesOrSingle(locales, this.registry.getActiveLocale());

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
    const resolved = this.resolveLocalesOrSingle(input, locale);

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
  ): LocalesBundle | LocaleTexts {
    if (typeof input === "string") {
      return this.resolveFromPath(input, fallbackLocale);
    }

    if (!this.isPlainObject(input)) {
      throw new Error("i18n source must be an object, a JSON file path, or a directory path.");
    }

    return this.normalizeObjectInput(input, fallbackLocale);
  }

  private resolveFromPath(inputPath: string, fallbackLocale: LocaleTag): LocalesBundle | LocaleTexts {
    const absolutePath = isAbsolute(inputPath) ? inputPath : resolve(process.cwd(), inputPath);

    if (!existsSync(absolutePath)) {
      throw new Error(`i18n path not found: ${absolutePath}`);
    }

    const stats = statSync(absolutePath);
    if (stats.isDirectory()) {
      const files = readdirSync(absolutePath)
        .filter((name: string) => extname(name).toLowerCase() === ".json")
        .sort();

      if (files.length === 0) {
        throw new Error(`No JSON locale files found in directory: ${absolutePath}`);
      }

      const bundle: LocalesBundle = {};
      for (const fileName of files) {
        const filePath = resolve(absolutePath, fileName);
        const parsed = this.parseJsonFile(filePath);
        const normalized = this.normalizeObjectInput(parsed, fallbackLocale);

        if (this.isLocalesBundle(normalized)) {
          for (const [locale, texts] of Object.entries(normalized)) {
            bundle[locale] = this.mergePlainObjects(bundle[locale] ?? {}, texts);
          }
          continue;
        }

        const locale = basename(fileName, ".json");
        bundle[locale] = this.mergePlainObjects(bundle[locale] ?? {}, normalized);
      }

      return bundle;
    }

    const parsed = this.parseJsonFile(absolutePath);
    return this.normalizeObjectInput(parsed, fallbackLocale);
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

  private normalizeObjectInput(
    input: LocaleTexts,
    fallbackLocale: LocaleTag,
  ): LocalesBundle | LocaleTexts {
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

  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
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

  private enable(options: UseI18nOptions = { auto: true }): void {
    this.enabled = true;

    const locale =
      options.force ??
      (options.auto !== false ? this.detectLocale() : undefined);

    if (locale) {
      this.registry.setActiveLocale(locale);
    }
  }

  private detectLocale(): LocaleTag {
    const env =
      process.env["LANG"] ??
      process.env["LANGUAGE"] ??
      process.env["LC_ALL"] ??
      process.env["LC_MESSAGES"] ??
      "en";

    return env.split(/[_.-]/)[0] ?? "en";
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
}
