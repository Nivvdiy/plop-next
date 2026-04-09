import { describe, it, expect } from "vitest";
import { PlopNextRunner } from "../src/PlopNextRunner";
import type {
  PlopNextCore,
  GeneratorMenuItem,
  UnknownRecord,
} from "@plop-next/core";

type CapturedPrompt = {
  choices?: unknown[];
};

describe("PlopNextRunner generator display name translation", () => {
  it("rejects generatorList when declared in generator prompts", async () => {
    const core = {
      getTheme() {
        return { plopNext: {} };
      },
      getGeneratorList() {
        return [{ name: "demo" }];
      },
      getGenerator(name: string) {
        if (name === "demo") {
          return {
            prompts: [
              {
                type: "generatorList",
                name: "badPrompt",
                message: "Should not be allowed",
              },
            ],
            actions: [],
          };
        }
        return undefined;
      },
      preparePrompts(_generatorName: string, prompts: unknown[]) {
        return prompts;
      },
      t(key: string, _args?: unknown[], fallback?: string) {
        return fallback ?? key;
      },
      async resolveActions() {
        return [];
      },
      async executeActions() {
        return { steps: [], failed: false };
      },
      getActionTypeDisplay(type: string) {
        return type;
      },
      formatActionTargetForDisplay(value: string) {
        return value;
      },
    } as unknown as PlopNextCore;

    const runner = new PlopNextRunner(core);

    await expect(runner.run("demo")).rejects.toThrow(
      'Prompt type "generatorList" is reserved for the internal generator menu and cannot be used in generator prompts.',
    );
  });

  it("uses generatorList prompt type for generator menu", async () => {
    let askedType: string | undefined;

    const core = {
      t(key: string, _args?: unknown[], fallback?: string) {
        return fallback ?? key;
      },
      getGeneratorPageSize() {
        return 7;
      },
      async askPrompt(type: string, _config: UnknownRecord) {
        askedType = type;
        return "react-component";
      },
    } as unknown as PlopNextCore;

    const runner = new PlopNextRunner(core);
    const list: GeneratorMenuItem[] = [{ name: "react-component" }];

    await (
      runner as unknown as {
        askGeneratorSelection(items: GeneratorMenuItem[]): Promise<string>;
      }
    ).askGeneratorSelection(list);

    expect(askedType).toBe("generatorList");
  });

  it("uses <generator>.generator.name translation when available", async () => {
    const captured: CapturedPrompt = {};

    const core = {
      t(key: string, _args?: unknown[], fallback?: string) {
        if (key === "react-component.generator.name") {
          return "Composant React";
        }
        return fallback ?? key;
      },
      getGeneratorPageSize() {
        return 7;
      },
      async askPrompt(_type: string, config: UnknownRecord) {
        captured.choices = config["choices"] as unknown[];
        return "react-component";
      },
    } as unknown as PlopNextCore;

    const runner = new PlopNextRunner(core);
    const list: GeneratorMenuItem[] = [{ name: "react-component" }];

    const selected = await (
      runner as unknown as {
        askGeneratorSelection(items: GeneratorMenuItem[]): Promise<string>;
      }
    ).askGeneratorSelection(list);

    expect(selected).toBe("react-component");

    const translatedChoice = (captured.choices ?? []).find((choice) => {
      return (
        typeof choice === "object" &&
        choice !== null &&
        (choice as { value?: unknown }).value === "react-component"
      );
    }) as { name: string } | undefined;

    expect(translatedChoice?.name).toBe("Composant React");
  });

  it("uses <generator>.generator.description translation when available", async () => {
    const captured: CapturedPrompt = {};

    const core = {
      t(key: string, _args?: unknown[], fallback?: string) {
        if (key === "react-component.generator.name") {
          return "UI Component";
        }
        if (key === "react-component.generator.description") {
          return "Build a reusable component";
        }
        return fallback ?? key;
      },
      getGeneratorPageSize() {
        return 7;
      },
      async askPrompt(_type: string, config: UnknownRecord) {
        captured.choices = config["choices"] as unknown[];
        return "react-component";
      },
    } as unknown as PlopNextCore;

    const runner = new PlopNextRunner(core);
    const list: GeneratorMenuItem[] = [{ name: "react-component" }];

    await (
      runner as unknown as {
        askGeneratorSelection(items: GeneratorMenuItem[]): Promise<string>;
      }
    ).askGeneratorSelection(list);

    const translatedChoice = (captured.choices ?? []).find((choice) => {
      return (
        typeof choice === "object" &&
        choice !== null &&
        (choice as { value?: unknown }).value === "react-component"
      );
    }) as { name: string; description?: string | null } | undefined;

    expect(translatedChoice?.name).toBe("UI Component");
    expect(translatedChoice?.description).toBe("Build a reusable component");
  });

  it("keeps backward compatibility with generators.<generator>.name", async () => {
    const captured: CapturedPrompt = {};

    const core = {
      t(key: string, _args?: unknown[], fallback?: string) {
        if (key === "generators.react-component.name") {
          return "React Component (legacy)";
        }
        return fallback ?? key;
      },
      getGeneratorPageSize() {
        return 7;
      },
      async askPrompt(_type: string, config: UnknownRecord) {
        captured.choices = config["choices"] as unknown[];
        return "react-component";
      },
    } as unknown as PlopNextCore;

    const runner = new PlopNextRunner(core);
    const list: GeneratorMenuItem[] = [{ name: "react-component" }];

    await (
      runner as unknown as {
        askGeneratorSelection(items: GeneratorMenuItem[]): Promise<string>;
      }
    ).askGeneratorSelection(list);

    const translatedChoice = (captured.choices ?? []).find((choice) => {
      return (
        typeof choice === "object" &&
        choice !== null &&
        (choice as { value?: unknown }).value === "react-component"
      );
    }) as { name: string } | undefined;

    expect(translatedChoice?.name).toBe("React Component (legacy)");
  });

  it("falls back to generator key when no name translation exists", async () => {
    const captured: CapturedPrompt = {};

    const core = {
      t(key: string, _args?: unknown[], fallback?: string) {
        return fallback ?? key;
      },
      getGeneratorPageSize() {
        return 7;
      },
      async askPrompt(_type: string, config: UnknownRecord) {
        captured.choices = config["choices"] as unknown[];
        return "demo-all-prompts";
      },
    } as unknown as PlopNextCore;

    const runner = new PlopNextRunner(core);
    const list: GeneratorMenuItem[] = [{ name: "demo-all-prompts" }];

    await (
      runner as unknown as {
        askGeneratorSelection(items: GeneratorMenuItem[]): Promise<string>;
      }
    ).askGeneratorSelection(list);

    const translatedChoice = (captured.choices ?? []).find((choice) => {
      return (
        typeof choice === "object" &&
        choice !== null &&
        (choice as { value?: unknown }).value === "demo-all-prompts"
      );
    }) as { name: string } | undefined;

    expect(translatedChoice?.name).toBe("demo-all-prompts");
  });
});
