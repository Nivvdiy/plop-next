import { describe, it, expect, beforeEach } from "vitest";
import { I18nRegistry } from "../src/I18nRegistry";
import { CORE_DEFAULT_HELP_TEXTS } from "@plop-next/core";

describe("I18nRegistry — help texts (read-only)", () => {
  let registry: I18nRegistry;

  beforeEach(() => {
    registry = new I18nRegistry();
  });

  // ── getHelpTexts ─────────────────────────────────────────────────────────

  it("returns English help texts for 'en'", () => {
    const help = registry.getHelpTexts("en");
    expect(help.usage).toBe(CORE_DEFAULT_HELP_TEXTS.usage);
    expect(help.examples).toBe(CORE_DEFAULT_HELP_TEXTS.examples);
  });

  it("returns French help texts for 'fr'", () => {
    const help = registry.getHelpTexts("fr");
    expect(help.usage).toBe("Utilisation :");
    expect(help.examples).toBe("Exemples :");
  });

  it("returns Spanish help texts for 'es'", () => {
    const help = registry.getHelpTexts("es");
    expect(help.usage).toBe("Uso:");
    expect(help.examples).toBe("Ejemplos:");
  });

  it("returns English help texts for an unknown locale", () => {
    const help = registry.getHelpTexts("de");
    expect(help.usage).toBe(CORE_DEFAULT_HELP_TEXTS.usage);
  });

  it("falls back to parent locale help texts (fr-BE → fr)", () => {
    registry.registerLocale("fr-BE", { greet: "Bonjour" });
    const help = registry.getHelpTexts("fr-BE");
    expect(help.usage).toBe("Utilisation :");
  });

  it("falls back to English if parent locale has no help either", () => {
    registry.registerLocale("pt", { greet: "Ola" });
    const help = registry.getHelpTexts("pt");
    expect(help.usage).toBe(CORE_DEFAULT_HELP_TEXTS.usage);
  });

  // ── read-only protection via registerTexts ────────────────────────────────

  it("registerTexts() cannot overwrite the help section", () => {
    registry.registerTexts("en", {
      help: { usage: "HACKED USAGE" },
      cli: { welcome: "Custom welcome" },
    });
    const help = registry.getHelpTexts("en");
    expect(help.usage).toBe(CORE_DEFAULT_HELP_TEXTS.usage);
  });

  it("registerTexts() still merges non-help keys normally", () => {
    registry.registerTexts("en", { myKey: "custom value" });
    registry.setActiveLocale("en");
    expect(registry.t("myKey")).toBe("custom value");
  });

  // ── read-only protection via registerLocale ───────────────────────────────

  it("registerLocale() cannot overwrite the help section for an existing locale", () => {
    registry.registerLocale("fr", {
      help: { usage: "HACKED FR USAGE" },
    });
    const help = registry.getHelpTexts("fr");
    expect(help.usage).toBe("Utilisation :");
  });

  // ── read-only protection via registerText ────────────────────────────────

  it("registerText() silently ignores paths under 'help'", () => {
    registry.registerText("en", "help.usage", "HACKED");
    const help = registry.getHelpTexts("en");
    expect(help.usage).toBe(CORE_DEFAULT_HELP_TEXTS.usage);
  });

  it("registerText() silently ignores the exact path 'help'", () => {
    registry.registerText("fr", "help", { usage: "HACKED FR" } as unknown as string);
    const help = registry.getHelpTexts("fr");
    expect(help.usage).toBe("Utilisation :");
  });

  // ── new locale inherits parent help ──────────────────────────────────────

  it("new locale registered via registerLocale inherits parent locale help", () => {
    registry.registerLocale("fr-CA", { greet: "Allô" });
    const help = registry.getHelpTexts("fr-CA");
    // fr-CA should inherit fr's help texts
    expect(help.usage).toBe("Utilisation :");
  });

  it("new locale with no parent inherits English help", () => {
    registry.registerLocale("ja", { greet: "こんにちは" });
    const help = registry.getHelpTexts("ja");
    expect(help.usage).toBe(CORE_DEFAULT_HELP_TEXTS.usage);
  });
});
