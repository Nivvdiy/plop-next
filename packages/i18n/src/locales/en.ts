import type { LocaleTag, LocaleTexts } from "@plop-next/core";
import { CORE_DEFAULT_TEXTS } from "@plop-next/core";

/**
 * i18n-facing export of core-owned default English texts.
 * Keep this alias for backward compatibility.
 */
export const EN_MESSAGES: LocaleTexts = CORE_DEFAULT_TEXTS;
export const BASE_LOCALE: LocaleTag = "en";

/**
 * Preferred explicit naming for consumers wanting the default text bundle.
 */
export const DEFAULT_TEXTS_EN: LocaleTexts = CORE_DEFAULT_TEXTS;
