import { describe, expect, it } from "vitest";
import { PlopNextCore } from "@plop-next/core";
import {
  buildLocaleTemplateSource,
  buildTextsTemplateSource,
  buildThemeTemplateSource,
} from "../src/templateScaffolds";

describe("templateScaffolds", () => {
  it("builds a locale template with empty values and english comments", () => {
    const source = buildLocaleTemplateSource();

    expect(source).toContain("export const Local");
    expect(source).toContain("// en: Welcome to plop-next! 🚀");
    expect(source).toContain("title: \"\"");
    expect(source).toContain("generatorNotFound: (..._args: unknown[]) => \"\"");
  });

  it("builds a texts template from translatable plopfile keys", () => {
    const core = new PlopNextCore();
    core.registerGenerator("component", {
      description: "Create a reusable component",
      prompts: [
        {
          type: "input",
          name: "name",
          message: "Component name?",
        },
        {
          type: "select",
          name: "kind",
          message: "Choose a kind",
          choices: ["ui", { name: "Data", value: "data" }],
        },
      ],
      actions: [],
    });

    const source = buildTextsTemplateSource(core);

    expect(source).toContain("export const Text");
    expect(source).toContain("component:");
    expect(source).toContain("generator:");
    expect(source).toContain("// en: component");
    expect(source).toContain("// en: Create a reusable component");
    expect(source).toContain("// en: Component name?");
    expect(source).toContain("choices:");
    expect(source).toContain("// en: Data");
    expect(source).toContain("data: \"\"");
  });

  it("can merge plopfile texts into locale template", () => {
    const core = new PlopNextCore();
    core.registerGenerator("demo", {
      prompts: [
        {
          type: "input",
          name: "title",
          message: "Title",
        },
      ],
      actions: [],
    });

    const source = buildLocaleTemplateSource({
      includePlopfileTexts: true,
      core,
    });

    expect(source).toContain("demo:");
    expect(source).toContain("title:");
    expect(source).toContain("// en: Title");
  });

  it("builds a theme template including generator-select override slot", () => {
    const source = buildThemeTemplateSource();

    expect(source).toContain("export const Theme");
    expect(source).toContain('"generator-select": {}');
    expect(source).toContain("input: {}");
    expect(source).toContain("rawlist: {}");
  });
});
