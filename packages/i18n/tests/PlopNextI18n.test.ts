import { describe, it, expect, beforeEach } from "vitest";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PlopNextCore } from "@plop-next/core";
import { PlopNextI18n } from "../src/PlopNextI18n";
import { FR_MESSAGES } from "../src/locales/fr";

const fixturesDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "fixtures",
);

describe("PlopNextI18n", () => {
  let core: PlopNextCore;
  let i18n: PlopNextI18n;

  beforeEach(() => {
    core = new PlopNextCore();
    i18n = new PlopNextI18n(core);
  });

  // ── registerLocale ───────────────────────────────────────────────

  it("registerLocale registers a new locale", () => {
    i18n.registerLocale("de", { hello: "Hallo" });
    expect(i18n.hasLocale("de")).toBe(true);
  });

  it("registerLocale with activate sets active locale", () => {
    i18n.registerLocale("fr", FR_MESSAGES, { activate: true });
    expect(i18n.getActiveLocale()).toBe("fr");
  });

  it("registerLocale is chainable", () => {
    expect(i18n.registerLocale("es", { hi: "Hola" })).toBe(i18n);
  });

  // ── registerTexts ────────────────────────────────────────────────

  it("registerTexts extends an existing locale", () => {
    i18n.registerLocale("fr", { a: "A" });
    i18n.registerTexts("fr", { b: "B" });
    core.useI18n({ force: "fr" });
    expect(core.t("b")).toBe("B");
  });

  it("registerTexts is chainable", () => {
    expect(i18n.registerTexts("en", {})).toBe(i18n);
  });

  // ── French locale ────────────────────────────────────────────────

  it("French locale is loadable and resolves cli keys", () => {
    i18n.registerLocale("fr", FR_MESSAGES, { activate: true });
    core.useI18n({ force: "fr" });
    const value = core.t("cli.welcome");
    expect(typeof value).toBe("string");
    expect(value.length).toBeGreaterThan(0);
  });

  // ── getActiveLocale / hasLocale ──────────────────────────────────

  it("getActiveLocale returns current locale", () => {
    expect(i18n.getActiveLocale()).toBe("en");
  });

  it("hasLocale returns false for unregistered locale", () => {
    expect(i18n.hasLocale("ko")).toBe(false);
  });

  it("hasLocale returns true for EN (always registered)", () => {
    expect(i18n.hasLocale("en")).toBe(true);
  });

  it("hasLocale returns true for ES (built-in)", () => {
    expect(i18n.hasLocale("es")).toBe(true);
  });

  it("hasLocale returns true for PT (built-in)", () => {
    expect(i18n.hasLocale("pt")).toBe(true);
  });

  it("hasLocale returns true for ZH (built-in)", () => {
    expect(i18n.hasLocale("zh")).toBe(true);
  });

  // ── registerLocale/registerLocales/registerTexts sources ───────

  it("registerLocale accepts single-locale JSON file path", () => {
    i18n.registerLocale(
      "fr",
      resolve(fixturesDir, "single-locale-texts.json"),
      { activate: true },
    );

    core.useI18n({ force: "fr" });
    expect(core.t("cli.selectGenerator")).toBe("Select from single file");
  });

  it("registerLocale accepts multi-locale JSON with one locale entry", () => {
    i18n.registerLocale(
      "fr",
      resolve(fixturesDir, "multi-locales-single-entry.json"),
      { activate: true },
    );

    core.useI18n({ force: "fr" });
    expect(core.t("cli.selectGenerator")).toBe("Choix depuis multi single entry");
  });

  it("registerLocales accepts multi-locales object with a single locale key", () => {
    i18n.registerLocales(
      {
        fr: {
          cli: {
            selectGenerator: "FR from single-entry multi object",
          },
        },
      },
      { activate: true },
    );

    core.useI18n({ force: "fr" });
    expect(core.t("cli.selectGenerator")).toBe("FR from single-entry multi object");
  });

  it("registerLocales accepts a JSON file path", () => {
    i18n.registerLocales(resolve(fixturesDir, "multi-locales.json"));

    core.useI18n({ force: "en" });
    expect(core.t("cli.selectGenerator")).toBe("Choose via multi file");

    core.useI18n({ force: "fr" });
    expect(core.t("cli.selectGenerator")).toBe("Choisir via fichier multi");
  });

  it("registerLocales accepts a directory path with one JSON per locale", () => {
    i18n.registerLocales(resolve(fixturesDir, "locales"));

    core.useI18n({ force: "en" });
    expect(core.t("cli.selectGenerator")).toBe("Choose via directory");

    core.useI18n({ force: "fr" });
    expect(core.t("cli.selectGenerator")).toBe("Choisir via dossier");
  });

  it("registerTexts accepts one-argument single-locale depth object and applies active locale", () => {
    i18n.registerLocale("de", {}, { activate: true });
    i18n.registerTexts({
      cli: {
        selectGenerator: "DE from one-arg single depth",
      },
    });

    core.useI18n({ force: "de" });
    expect(core.t("cli.selectGenerator")).toBe("DE from one-arg single depth");
  });

  it("registerTexts accepts one-argument multi-locales depth object with single locale", () => {
    i18n.registerTexts({
      fr: {
        cli: {
          selectGenerator: "FR from one-arg multi depth",
        },
      },
    });

    core.useI18n({ force: "fr" });
    expect(core.t("cli.selectGenerator")).toBe("FR from one-arg multi depth");
  });
});
