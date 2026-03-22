import type { HelpTexts, LocaleTexts, LocaleTag } from "@plop-next/core";
import { BASE_LOCALE, EN_MESSAGES } from "./locales/en";
import { ES_MESSAGES } from "./locales/es";
import { FR_MESSAGES } from "./locales/fr";
import { PT_MESSAGES } from "./locales/pt";

function resolvePath(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce(
      (acc, key) =>
        acc !== null && typeof acc === "object"
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      obj,
    );
}

export class I18nRegistry {
  private readonly locales = new Map<LocaleTag, LocaleTexts>();
  private activeLocale: LocaleTag = BASE_LOCALE;

  constructor() {
    this.locales.set(BASE_LOCALE, EN_MESSAGES);
    this.locales.set("es", ES_MESSAGES);
    this.locales.set("fr", FR_MESSAGES);
    this.locales.set("pt", PT_MESSAGES);
  }

  registerTexts(locale: LocaleTag, texts: LocaleTexts): void {
    const existing = this.locales.get(locale) ?? {};
    // The `help` section is read-only: strip it before merging.
    const { help: _ignored, ...safeTexts } = texts as Record<string, unknown>;
    this.locales.set(locale, this.deepMerge(existing, safeTexts as LocaleTexts));
  }

  registerText(locale: LocaleTag, path: string, text: unknown): void {
    // Reject any write that targets the read-only `help` section.
    if (path === "help" || path.startsWith("help.")) return;
    const keys = path.split(".").filter(Boolean);
    const nested = keys.reduceRight<unknown>((acc, key) => ({ [key]: acc }), text) as LocaleTexts;
    this.registerTexts(locale, nested);
  }

  registerLocale(locale: LocaleTag, texts: LocaleTexts): void {
    if (!this.locales.has(locale)) {
      // Seed the help texts from the closest parent locale (e.g. "fr-BE" → "fr" → "en").
      const parentHelp = this.resolveParentHelpTexts(locale);
      const seed: LocaleTexts = parentHelp ? { help: parentHelp } : {};
      this.locales.set(locale, seed);
    }
    this.registerTexts(locale, texts);
  }

  setActiveLocale(locale: LocaleTag): void {
    this.activeLocale = locale;
  }

  getActiveLocale(): LocaleTag {
    return this.activeLocale;
  }

  hasLocale(locale: LocaleTag): boolean {
    return this.locales.has(locale);
  }

  t(
    key: string,
    args: unknown[] = [],
    defaultMessage?: string | ((...a: unknown[]) => string),
  ): string {
    const value = this.findValue(key);

    if (value !== undefined) {
      return typeof value === "function"
        ? String((value as (...a: unknown[]) => unknown)(...args))
        : String(value);
    }

    if (defaultMessage !== undefined) {
      return typeof defaultMessage === "function"
        ? defaultMessage(...args)
        : defaultMessage;
    }

    return key;
  }

  private findValue(key: string): unknown {
    const active = this.locales.get(this.activeLocale);
    const inActive = active ? resolvePath(active, key) : undefined;
    if (inActive !== undefined) return inActive;

    if (this.activeLocale !== BASE_LOCALE) {
      const en = this.locales.get(BASE_LOCALE);
      const inEn = en ? resolvePath(en, key) : undefined;
      if (inEn !== undefined) return inEn;
    }

    return undefined;
  }

  /**
   * Returns the `help` texts for the given locale, walking up parent locales
   * (e.g. "fr-BE" → "fr" → "en") until a `help` section is found.
   * Always returns at least the English default help texts.
   */
  getHelpTexts(locale: LocaleTag): HelpTexts {
    for (const candidate of this.parentLocaleChain(locale)) {
      const entry = this.locales.get(candidate);
      if (entry && typeof entry["help"] === "object" && entry["help"] !== null) {
        return entry["help"] as HelpTexts;
      }
    }
    // Ultimate fallback: English help (always registered in constructor).
    const en = this.locales.get(BASE_LOCALE);
    return (en?.["help"] ?? {}) as HelpTexts;
  }

  /**
   * Resolves help texts from the closest parent locale of `locale`.
   * Returns `undefined` if no parent locale has help texts.
   */
  private resolveParentHelpTexts(locale: LocaleTag): HelpTexts | undefined {
    const chain = this.parentLocaleChain(locale);
    // Skip the locale itself (index 0); look at parents.
    for (const candidate of chain.slice(1)) {
      const entry = this.locales.get(candidate);
      if (entry && typeof entry["help"] === "object" && entry["help"] !== null) {
        return entry["help"] as HelpTexts;
      }
    }
    return undefined;
  }

  /**
   * Returns an ordered list of candidate locales to try for `locale`.
   * E.g. "fr-BE" → ["fr-BE", "fr", "en"]
   */
  private parentLocaleChain(locale: LocaleTag): LocaleTag[] {
    const chain: LocaleTag[] = [locale];
    const parts = locale.split(/[-_]/);
    for (let i = parts.length - 1; i > 0; i--) {
      chain.push(parts.slice(0, i).join("-"));
    }
    if (!chain.includes(BASE_LOCALE)) chain.push(BASE_LOCALE);
    return chain;
  }

  private deepMerge(target: LocaleTexts, source: LocaleTexts): LocaleTexts {
    const result: LocaleTexts = { ...target };
    for (const [key, value] of Object.entries(source)) {
      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        typeof target[key] === "object" &&
        target[key] !== null
      ) {
        result[key] = this.deepMerge(
          target[key] as LocaleTexts,
          value as LocaleTexts,
        );
      } else {
        result[key] = value;
      }
    }
    return result;
  }
}
