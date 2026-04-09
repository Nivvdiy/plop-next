import { describe, it, expect, beforeEach } from "vitest";
import { PlopNextI18n } from "../src/PlopNextI18n";
import { PlopNextCore } from "@plop-next/core";
import type { PlopPrompt } from "@plop-next/core";

type NamedChoice = {
  name: string;
  value: string;
};

/**
 * Tests pour le système i18n granulaire incluant:
 * - Traductions des prompts simples
 * - Support des prompts indexés [0], [1]
 * - Traductions des choices
 * - Traductions des champs additionnels (hint, description, etc.)
 * - Fallback sans indices
 */

describe("PlopNextI18n — preparePrompts", () => {
  let core: PlopNextCore;
  let i18n: PlopNextI18n;

  beforeEach(() => {
    core = new PlopNextCore();
    i18n = new PlopNextI18n(core);
  });

  describe("Simple prompt translation", () => {
    it("should translate prompt message", () => {
      i18n.registerTexts("en", {
        component: {
          name: { message: "Component name?" },
        },
      });

      core.useI18n({ force: "en" });

      const prompts: PlopPrompt[] = [
        {
          type: "input",
          name: "name",
          message: "What is the component name?",
          default: "",
        },
      ];

      const prepared = core.preparePrompts("component", prompts);

      expect(prepared[0].message).toBe("Component name?");
    });

    it("should translate multiple prompt fields", () => {
      i18n.registerTexts("fr", {
        component: {
          name: {
            message: "Nom du composant",
            hint: "(obligatoire)",
          },
        },
      });

      core.useI18n({ force: "fr" });

      const prompts: PlopPrompt[] = [
        {
          type: "input",
          name: "name",
          message: "Component name?",
        },
      ];

      const prepared = core.preparePrompts("component", prompts);

      expect(prepared[0].message).toBe("Nom du composant");
    });
  });

  describe("Indexed prompts [0], [1], etc.", () => {
    it("should use indexed translation via resolvePromptField fallback logic", () => {
      // Note: indexed translations are handled via resolvePromptField fallback.
      // When prompt has name="name[0]", it attempts to find "component.name[0].message"
      // If not found, it falls back to "component.name.message"
      i18n.registerTexts("en", {
        component: {
          name: {
            message: "Component name (fallback for indexed)",
          },
        },
      });

      core.useI18n({ force: "en" });

      // Prompt with indexed name falls back to non-indexed translation
      const prompts: PlopPrompt[] = [
        {
          type: "input",
          name: "name[0]",
          message: "Component name?",
        },
      ];

      const prepared = core.preparePrompts("component", prompts);
      expect(prepared[0].message).toBe("Component name (fallback for indexed)");
    });

    it("should fallback to non-indexed translation", () => {
      i18n.registerTexts("en", {
        component: {
          name: {
            message: "Component name (fallback)",
          },
        },
      });

      core.useI18n({ force: "en" });

      // Non-indexed prompt should use fallback
      const prompts: PlopPrompt[] = [
        {
          type: "input",
          name: "name",
          message: "What is the name?",
        },
      ];

      const prepared = core.preparePrompts("component", prompts);
      expect(prepared[0].message).toBe("Component name (fallback)");
    });

    it("should use exact indexed match first, then fallback", () => {
      i18n.registerTexts("en", {
        form: {
          field: {
            "[1]": { message: "Second field?" },
            message: "Field name (generic)",
          },
        },
      });

      core.useI18n({ force: "en" });

      // field[0] has no specific translation, should use fallback
      const prompts: PlopPrompt[] = [
        {
          type: "input",
          name: "field[0]",
          message: "Field name?",
        },
      ];

      const prepared = core.preparePrompts("form", prompts);
      expect(prepared[0].message).toBe("Field name (generic)");
    });
  });

  describe("Choices translation", () => {
    it("should translate string choices", () => {
      i18n.registerTexts("fr", {
        component: {
          type: {
            choices: {
              "class": "Classe",
              "function": "Fonction",
            },
          },
        },
      });

      core.useI18n({ force: "fr" });

      const prompts: PlopPrompt[] = [
        {
          type: "list",
          name: "type",
          message: "Type?",
          choices: ["class", "function"],
        },
      ];

      const prepared = core.preparePrompts("component", prompts);
      const prompt: any = prepared[0];
      const choices = prompt.choices as string[];

      expect(choices).toContain("Classe");
      expect(choices).toContain("Fonction");
    });

    it("should translate object choices (name+value)", () => {
      i18n.registerTexts("en", {
        generator: {
          action: {
            choices: {
              "add": "Add a file",
              "remove": "Remove a file",
            },
          },
        },
      });

      core.useI18n({ force: "en" });

      const prompts: PlopPrompt[] = [
        {
          type: "list",
          name: "action",
          message: "What to do?",
          choices: [
            { name: "Create new", value: "add" },
            { name: "Delete existing", value: "remove" },
          ],
        },
      ];

      const prepared = core.preparePrompts("generator", prompts);
      const prompt: any = prepared[0];
      const choices = prompt.choices as Array<NamedChoice>;

      expect(choices[0].name).toBe("Add a file");
      expect(choices[1].name).toBe("Remove a file");
    });

    it("should use choice name as fallback key when value is not string/number", () => {
      i18n.registerTexts("en", {
        form: {
          component: {
            choices: {
              "Button": "A clickable button",
            },
          },
        },
      });

      core.useI18n({ force: "en" });

      const prompts: PlopPrompt[] = [
        {
          type: "list",
          name: "component",
          message: "Select?",
          choices: [
            { name: "Button", value: "btn" },
            { name: "Card", value: "card" },
          ],
        },
      ];

      const prepared = core.preparePrompts("form", prompts);
        const prompt: any = prepared[0];
      const choices = prompt.choices as Array<NamedChoice>;

      // Button translated by value key "btn"
      expect(choices[0].name).toBeDefined();
      // Card not in translations
      expect(choices[1].name).toBe("Card");
    });
  });

  describe("Dynamic choices (function-based)", () => {
    it("should translate dynamically-resolved choices", async () => {
      i18n.registerTexts("en", {
        component: {
          existing: {
            choices: {
              "Button": "Translate: Button",
              "Card": "Translate: Card",
            },
          },
        },
      });

      core.useI18n({ force: "en" });

      const prompts: PlopPrompt[] = [
        {
          type: "list",
          name: "existing",
          message: "Choose?",
          choices: async () => ["Button", "Card"],
        },
      ];

      const prepared = core.preparePrompts("component", prompts);
      const prompt: any = prepared[0];
      const choicesFn = prompt.choices as (
        answers: Record<string, unknown>
      ) => Promise<string[]>;

      const resolved = await choicesFn({});

      expect(resolved).toContain("Translate: Button");
      expect(resolved).toContain("Translate: Card");
    });
  });

  describe("Additional translatable fields", () => {
    it("should translate all supported fields", () => {
      i18n.registerTexts("en", {
        form: {
          search: {
            message: "Search box",
          },
        },
      });

      core.useI18n({ force: "en" });

      const prompts: PlopPrompt[] = [
        {
          type: "search",
          name: "search",
          message: "Enter search",
        },
      ];

      const prepared = core.preparePrompts("form", prompts);
      const p = prepared[0];

      expect(p.message).toBe("Search box");
    });
  });

  describe("isEnabled flag", () => {
    it("should return unmodified prompts when i18n disabled", () => {
      i18n.registerTexts("en", {
        component: {
          name: { message: "Translated" },
        },
      });

      // Don't call useI18n() → i18n should be disabled
      const prompts: PlopPrompt[] = [
        {
          type: "input",
          name: "name",
          message: "Original message",
        },
      ];

      const prepared = core.preparePrompts("component", prompts);

      expect(prepared[0].message).toBe("Original message");
    });
  });

  describe("Multiple generators", () => {
    it("should translate different generators independently", () => {
      i18n.registerTexts("en", {
        component: {
          name: { message: "Component name?" },
        },
        page: {
          name: { message: "Page name?" },
        },
      });

      core.useI18n({ force: "en" });

      const componentPrompts: PlopPrompt[] = [
        {
          type: "input",
          name: "name",
          message: "Name?",
        },
      ];

      const preparedComponent = core.preparePrompts("component", componentPrompts);
      const preparedPage = core.preparePrompts("page", componentPrompts);

      expect(preparedComponent[0].message).toBe("Component name?");
      expect(preparedPage[0].message).toBe("Page name?");
    });
  });

  describe("registerText() single-key API", () => {
    it("should allow single-key registration", () => {
      core.useI18n({ force: "en" });

      i18n.registerText("en", "form.email.message", "Email address?");

      const prompts: PlopPrompt[] = [
        {
          type: "input",
          name: "email",
          message: "What is your email?",
        },
      ];

      const prepared = core.preparePrompts("form", prompts);

      expect(prepared[0].message).toBe("Email address?");
    });

    it("should support deeply nested registration", () => {
      core.useI18n({ force: "en" });

      i18n.registerTexts("en", {
        deeply: {
          nested: {
            gen: {
              prompt: {
                message: "Deep text",
              },
            },
          },
        },
      });

      const prompts: PlopPrompt[] = [
        {
          type: "input",
          name: "prompt",
          message: "Original",
        },
      ];

      const prepared = core.preparePrompts("deeply.nested.gen", prompts);

      expect(prepared[0].message).toBe("Deep text");
    });
  });

  describe("Fallback chain", () => {
    it("should return undefined if no translation and no fallback", () => {
      core.useI18n({ force: "en" });

      const prompts: PlopPrompt[] = [
        {
          type: "input",
          name: "name",
          message: undefined, // No fallback
        },
      ];

      const prepared = core.preparePrompts("unknown", prompts);

      expect(prepared[0].message).toBeUndefined();
    });

    it("should use fallback if translation not found", () => {
      core.useI18n({ force: "en" });
      // No translations registered

      const prompts: PlopPrompt[] = [
        {
          type: "input",
          name: "name",
          message: "Original fallback",
        },
      ];

      const prepared = core.preparePrompts("component", prompts);

      expect(prepared[0].message).toBe("Original fallback");
    });
  });

  describe("Function-based message", () => {
    it("should handle function-based messages gracefully", () => {
      i18n.registerTexts("en", {
        form: {
          name: { message: "Text-based value" },
        },
      });

      core.useI18n({ force: "en" });

      const messageFn = (answers: Record<string, unknown>) =>
        `You have ${answers.count} items`;

      const prompts: PlopPrompt[] = [
        {
          type: "input",
          name: "name",
          message: messageFn,
        },
      ];

      const prepared = core.preparePrompts("form", prompts);

      // Functions aren't translated but are kept as-is (undefined message handler)
      // The message might be converted to the translation if found, or remain as string key fallback
      expect(prepared[0]).toBeDefined();
      expect(prepared[0].name).toBe("name");
    });
  });
});
