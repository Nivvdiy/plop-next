import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PlopNextCore } from "../src/PlopNextCore";
import type { GeneratorConfig } from "../src/types";

describe("PlopNextCore", () => {
  let core: PlopNextCore;

  beforeEach(() => {
    core = new PlopNextCore();
  });

  // ── Generator registry ───────────────────────────────────────────

  it("registers and retrieves a generator", () => {
    const cfg: GeneratorConfig = { prompts: [], actions: [] };
    core.setGenerator("comp", cfg);
    expect(core.getGenerator("comp")).toBe(cfg);
  });

  it("returns undefined for unknown generators", () => {
    expect(core.getGenerator("missing")).toBeUndefined();
  });

  it("getGeneratorList returns registered generators", () => {
    core.setGenerator("a", { description: "Alpha", prompts: [], actions: [] });
    core.setGenerator("b", { prompts: [], actions: [] });
    const list = core.getGeneratorList();
    expect(list).toHaveLength(2);
    expect(list[0].name).toBe("a");
    expect(list[0].description).toBe("Alpha");
    expect(list[1].name).toBe("b");
  });

  it("setGenerator is chainable", () => {
    const result = core
      .setGenerator("x", { prompts: [], actions: [] })
      .setGenerator("y", { prompts: [], actions: [] });
    expect(result).toBe(core);
    expect(core.getGeneratorList()).toHaveLength(2);
  });

  // ── i18n adapter hooks ──────────────────────────────────────────

  it("i18n is disabled by default", () => {
    expect(core.isI18nEnabled()).toBe(false);
  });

  it("useI18n enables i18n", () => {
    core.useI18n();
    expect(core.isI18nEnabled()).toBe(false);
  });

  it("useI18n with force sets active locale", () => {
    core.useI18n({ force: "fr" });
    expect(core.getLocale()).toBe("en");
  });

  it("useI18n is chainable", () => {
    expect(core.useI18n()).toBe(core);
  });

  it("registerLocale is a no-op without plugin and stays chainable", () => {
    expect(core.registerLocale("custom", { cli: { welcome: "Custom welcome" } })).toBe(core);
    expect(core.getLocale()).toBe("en");
  });

  it("setLocale is a no-op without plugin", () => {
    core.setLocale("es");
    expect(core.getLocale()).toBe("en");
  });

  it("registerTexts aliases addTexts and is chainable", () => {
    expect(core.registerTexts("en", { alias: { works: "yes" } })).toBe(core);
  });

  // ── resolveText ──────────────────────────────────────────────────

  it("resolveText returns defaultMessage when i18n disabled", () => {
    const result = core.resolveText("gen", "name", "message", "Enter name");
    expect(result).toBe("Enter name");
  });

  it("resolveText falls back to defaultMessage when key missing", () => {
    core.useI18n({ force: "en" });
    const result = core.resolveText("gen", "name", "label", "fallback");
    expect(result).toBe("fallback");
  });

  // ── t ────────────────────────────────────────────────────────────

  it("t returns key without plugin", () => {
    expect(core.t("cli.welcome")).toBe("cli.welcome");
  });

  it("t returns fallback when key missing", () => {
    expect(core.t("unknown.key", [], "default")).toBe("default");
  });

  // ── addTexts ──────────────────────────────────────────────────

  it("addTexts is a no-op without plugin", () => {
    core.addTexts("en", { custom: "Custom text" });
    expect(core.t("custom")).toBe("custom");
  });

  it("addTexts is chainable", () => {
    expect(core.addTexts("en", {})).toBe(core);
  });

  it("resolves dynamic actions array based on answers", async () => {
    const config: GeneratorConfig = {
      prompts: [],
      actions: (answers) => {
        if (answers["wantTacos"]) {
          return [
            {
              type: "add",
              path: "folder/{{dashCase name}}.txt",
              template: "tacos",
            },
          ];
        }

        return [
          {
            type: "add",
            path: "folder/{{dashCase name}}.txt",
            template: "burritos",
          },
        ];
      },
    };

    const tacosActions = await core.resolveActions(config.actions, { wantTacos: true });
    const burritosActions = await core.resolveActions(config.actions, { wantTacos: false });

    expect(tacosActions).toHaveLength(1);
    expect(burritosActions).toHaveLength(1);
    expect(tacosActions[0]).toMatchObject({ template: "tacos" });
    expect(burritosActions[0]).toMatchObject({ template: "burritos" });
  });

  // ── built-in helpers ────────────────────────────────────────────

  it("registers case modifier helpers by default", () => {
    expect(core.renderString("{{camelCase value}}", { value: "My component" })).toBe("myComponent");
    expect(core.renderString("{{snakeCase value}}", { value: "My component" })).toBe("my_component");
    expect(core.renderString("{{dotCase value}}", { value: "My component" })).toBe("my.component");
    expect(core.renderString("{{pathCase value}}", { value: "My component" })).toBe("my/component");
    expect(core.renderString("{{constantCase value}}", { value: "My component" })).toBe("MY_COMPONENT");
    expect(core.renderString("{{titleCase value}}", { value: "my component" })).toBe("My Component");
  });

  it("supports dash/kebab and proper/pascal aliases", () => {
    const data = { value: "My component" };

    expect(core.renderString("{{dashCase value}}", data)).toBe("my-component");
    expect(core.renderString("{{kebabCase value}}", data)).toBe("my-component");
    expect(core.renderString("{{kabobCase value}}", data)).toBe("my-component");

    expect(core.renderString("{{properCase value}}", data)).toBe("MyComponent");
    expect(core.renderString("{{pascalCase value}}", data)).toBe("MyComponent");
  });

  it("supports lowerCase and upperCase helpers", () => {
    const data = { value: "My Component" };
    expect(core.renderString("{{lowerCase value}}", data)).toBe("my component");
    expect(core.renderString("{{upperCase value}}", data)).toBe("MY COMPONENT");
  });

  it("pkg helper reads package.json next to plopfile", () => {
    const dir = mkdtempSync(join(tmpdir(), "plop-next-core-"));

    try {
      const plopfilePath = join(dir, "plopfile.ts");
      const packagePath = join(dir, "package.json");

      writeFileSync(
        packagePath,
        JSON.stringify(
          {
            name: "test-pkg",
            version: "1.2.3",
            config: {
              scope: "demo",
            },
          },
          null,
          2,
        ),
        "utf8",
      );

      core.setPlopfilePath(plopfilePath);

      expect(core.renderString("{{pkg 'name'}}", {})).toBe("test-pkg");
      expect(core.renderString("{{pkg 'config.scope'}}", {})).toBe("demo");
      expect(core.renderString("{{pkg 'missing.value'}}", {})).toBe("");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
