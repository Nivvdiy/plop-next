import type { LocaleTexts, LocaleTag } from "@plop-next/core";
import { BASE_LOCALE, EN_MESSAGES } from "./locales/en";
import { FR_MESSAGES } from "./locales/fr";

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
    this.locales.set("fr", FR_MESSAGES);
  }

  registerTexts(locale: LocaleTag, texts: LocaleTexts): void {
    const existing = this.locales.get(locale) ?? {};
    this.locales.set(locale, this.deepMerge(existing, texts));
  }

  registerText(locale: LocaleTag, path: string, text: unknown): void {
    const keys = path.split(".").filter(Boolean);
    const nested = keys.reduceRight<unknown>((acc, key) => ({ [key]: acc }), text) as LocaleTexts;
    this.registerTexts(locale, nested);
  }

  registerLocale(locale: LocaleTag, texts: LocaleTexts): void {
    if (!this.locales.has(locale)) {
      this.locales.set(locale, {});
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
