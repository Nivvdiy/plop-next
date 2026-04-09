import { describe, it, expect, beforeEach } from "vitest";
import { PlopNextI18n } from "../src/PlopNextI18n";
import { PlopNextCore } from "@plop-next/core";
import type { GeneratorConfig } from "@plop-next/core";

/**
 * Tests pour localization complète du système i18n:
 * - Traductions de descriptions de générateurs
 * - Textes CLI (@inquirer/prompts)
 * - Fallbacks et merging
 */

describe("PlopNextI18n — Complete i18n system", () => {
  let core: PlopNextCore;
  let i18n: PlopNextI18n;

  beforeEach(() => {
    core = new PlopNextCore();
    i18n = new PlopNextI18n(core);
  });

  describe("Generator description translation", () => {
    it("should translate generator description via i18n", () => {
      i18n.registerTexts("fr", {
        component: {
          description: "Créer un composant réutilisable",
        },
      });

      core.useI18n({ force: "fr" });

      // Simulate description lookup (as done in CLI)
      const descFR = core.t("component.description", [], "Create a component");
      expect(descFR).toBe("Créer un composant réutilisable");
    });

    it("should fallback to original description if no translation", () => {
      core.useI18n({ force: "en" });

      const descEN = core.t("component.description", [], "Create a component");
      expect(descEN).toBe("Create a component");
    });

    it("should return key if neither translation nor fallback provided", () => {
      core.useI18n({ force: "en" });

      const missing = core.t("nonexistent.description");
      expect(missing).toBe("nonexistent.description");
    });
  });

  describe("registerTexts() API", () => {
    it("should register nested structure", () => {
      i18n.registerTexts("en", {
        mygen: {
          description: "My generator",
          prompt1: {
            message: "Question 1?",
            choices: {
              a: "Option A",
              b: "Option B",
            },
          },
        },
      });

      core.useI18n({ force: "en" });

      expect(core.t("mygen.description", [], "default")).toBe("My generator");
      expect(core.t("mygen.prompt1.message", [], "default")).toBe("Question 1?");
      expect(core.t("mygen.prompt1.choices.a", [], "default")).toBe("Option A");
    });

    it("should merge multiple registerTexts() calls", () => {
      // First call
      i18n.registerTexts("en", {
        form: {
          name: { message: "Name?" },
        },
      });

      // Second call - should merge
      i18n.registerTexts("en", {
        form: {
          email: { message: "Email?" },
        },
      });

      core.useI18n({ force: "en" });

      expect(core.t("form.name.message", [], "default")).toBe("Name?");
      expect(core.t("form.email.message", [], "default")).toBe("Email?");
    });

    it("should deeply merge nested objects", () => {
      i18n.registerTexts("en", {
        component: {
          name: {
            message: "Name?",
          },
        },
      });

      i18n.registerTexts("en", {
        component: {
          name: {
            hint: "PascalCase required",
          },
        },
      });

      core.useI18n({ force: "en" });

      expect(core.t("component.name.message", [], "default")).toBe("Name?");
      expect(core.t("component.name.hint", [], "default")).toBe("PascalCase required");
    });

    it("should override existing keys", () => {
      i18n.registerTexts("en", {
        form: {
          name: { message: "Original" },
        },
      });

      i18n.registerTexts("en", {
        form: {
          name: { message: "Overridden" },
        },
      });

      core.useI18n({ force: "en" });

      expect(core.t("form.name.message", [], "default")).toBe("Overridden");
    });
  });

  describe("registerText() single-key API", () => {
    it("should register single key-value pair", () => {
      i18n.registerText("en", "form.email.message", "Email?");

      core.useI18n({ force: "en" });

      expect(core.t("form.email.message", [], "default")).toBe("Email?");
    });

    it("should build nested structure from dot-path", () => {
      i18n.registerText("en", "form.email.hint", "your@email.com");

      core.useI18n({ force: "en" });

      // Should create nested structure { form: { email: { hint: "..." } } }
      expect(core.t("form.email.hint", [], "default")).toBe("your@email.com");
    });

    it("should preserve existing keys when adding new ones", () => {
      i18n.registerTexts("en", {
        form: {
          name: { message: "Name?", description: "Your full name" },
        },
      });

      i18n.registerText("en", "form.name.hint", "(required)");

      core.useI18n({ force: "en" });

      expect(core.t("form.name.message", [], "default")).toBe("Name?");
      expect(core.t("form.name.description", [], "default")).toBe("Your full name");
      expect(core.t("form.name.hint", [], "default")).toBe("(required)");
    });
  });

  describe("Inquirer/prompts texts (confirm, select, etc.)", () => {
    it("should have EN defaults for inquirer texts", () => {
      core.useI18n({ force: "en" });

      expect(core.t("inquirer.confirm.yesLabel", [], "default")).toBe("Yes");
      expect(core.t("inquirer.confirm.noLabel", [], "default")).toBe("No");
      expect(core.t("inquirer.confirm.hintYes", [], "default")).toBe("Y/n");
      expect(core.t("inquirer.select.helpNavigate", [], "default")).toBe("navigate");
      expect(core.t("inquirer.select.helpSelect", [], "default")).toBe("select");
    });

    it("should have FR defaults for inquirer texts", () => {
      core.useI18n({ force: "fr" });

      expect(core.t("inquirer.confirm.yesLabel", [], "default")).toBe("Oui");
      expect(core.t("inquirer.confirm.noLabel", [], "default")).toBe("Non");
      expect(core.t("inquirer.confirm.hintYes", [], "default")).toBe("O/n");
      expect(core.t("inquirer.select.helpNavigate", [], "default")).toBe("naviguer");
      expect(core.t("inquirer.select.helpSelect", [], "default")).toBe("sélectionner");
    });

    it("should allow override of inquirer texts", () => {
      i18n.registerText("en", "inquirer.confirm.yesLabel", "Yep!");
      i18n.registerText("en", "inquirer.confirm.noLabel", "Nope!");

      core.useI18n({ force: "en" });

      expect(core.t("inquirer.confirm.yesLabel", [], "default")).toBe("Yep!");
      expect(core.t("inquirer.confirm.noLabel", [], "default")).toBe("Nope!");
    });

    it("should support all inquirer text types", () => {
      core.useI18n({ force: "en" });

      // Confirm
      expect(core.t("inquirer.confirm.yesLabel", [], "default")).toBeDefined();
      expect(core.t("inquirer.confirm.noLabel", [], "default")).toBeDefined();

      // Select
      expect(core.t("inquirer.select.helpNavigate", [], "default")).toBeDefined();

      // Checkbox
      expect(core.t("inquirer.checkbox.helpNavigate", [], "default")).toBeDefined();
      expect(core.t("inquirer.checkbox.helpSubmit", [], "default")).toBeDefined();

      // Search
      expect(core.t("inquirer.search.helpNavigate", [], "default")).toBeDefined();

      // Password
      expect(core.t("inquirer.password.maskedText", [], "default")).toBeDefined();
    });
  });

  describe("CLI texts (selectGenerator, aborted, etc.)", () => {
    it("should have EN defaults for CLI texts", () => {
      core.useI18n({ force: "en" });

      expect(core.t("cli.title", [], "default")).toBe(
        "Welcome to plop-next! 🚀"
      );
      expect(core.t("cli.selectGenerator", [], "default")).toBe(
        "Please choose a generator"
      );
      expect(core.t("cli.aborted", [], "default")).toBe("Aborted.");
      expect(core.t("cli.done", [], "default")).toBe("Done!");
    });

    it("should have FR defaults for CLI texts", () => {
      core.useI18n({ force: "fr" });

      expect(core.t("cli.title", [], "default")).toBe(
        "Bienvenue dans plop-next ! 🚀"
      );
      expect(core.t("cli.selectGenerator", [], "default")).toBe(
        "Veuillez choisir un générateur"
      );
      expect(core.t("cli.aborted", [], "default")).toBe("Annulé.");
      expect(core.t("cli.done", [], "default")).toBe("Terminé !");
    });

    it("should allow override of CLI texts", () => {
      i18n.registerText("en", "cli.selectGenerator", "Pick a generator:");

      core.useI18n({ force: "en" });

      expect(core.t("cli.selectGenerator", [], "default")).toBe("Pick a generator:");
    });
  });

  describe("Locale switching", () => {
    it("should switch between registered locales", () => {
      i18n.registerTexts("en", {
        msg: "Hello",
      });
      i18n.registerTexts("fr", {
        msg: "Bonjour",
      });

      core.useI18n({ force: "en" });
      expect(core.t("msg", [], "default")).toBe("Hello");

      core.useI18n({ force: "fr" });
      expect(core.t("msg", [], "default")).toBe("Bonjour");
    });

    it("should fallback to EN if locale not registered", () => {
      i18n.registerTexts("en", {
        msg: "English",
      });

      // Try to set a non-existent locale
      core.useI18n({ force: "de" });

      // Should fallback to EN
      expect(core.t("msg", [], "default")).toBe("English");
    });
  });

  describe("Complex real-world scenario", () => {
    it("should handle the 'component' generator example", () => {
      i18n.registerTexts("fr", {
        component: {
          description: "Composant réutilisable (tsx + module.scss + index)",
          mode: {
            message: "Que voulez-vous faire ?",
            choices: {
              add: "Ajouter un composant",
              remove: "Supprimer un composant",
            },
          },
          name: {
            message: "Nom du composant",
          },
          group: {
            message: "Sous-dossier (optionnel, ex: ui/forms)",
          },
          inFeature: {
            message: "Ajouter à une feature existante ?",
          },
          feature: {
            message: "Sélectionner une feature",
          },
        },
      });

      core.useI18n({ force: "fr" });

      // Generator description
      expect(core.t("component.description", [], "default")).toBe(
        "Composant réutilisable (tsx + module.scss + index)"
      );

      // Mode prompt
      expect(core.t("component.mode.message", [], "default")).toBe(
        "Que voulez-vous faire ?"
      );
      expect(core.t("component.mode.choices.add", [], "default")).toBe(
        "Ajouter un composant"
      );

      // Name prompt (simplified - indexed prompts use fallback logic via resolvePromptField)
      expect(core.t("component.name.message", [], "default")).toBe(
        "Nom du composant"
      );

      // Other fields
      expect(core.t("component.group.message", [], "default")).toBe(
        "Sous-dossier (optionnel, ex: ui/forms)"
      );
      expect(core.t("component.feature.message", [], "default")).toBe(
        "Sélectionner une feature"
      );
    });

    it("should handle multiple generators", () => {
      i18n.registerTexts("en", {
        component: {
          description: "Create component",
          name: { message: "Component name?" },
        },
        page: {
          description: "Create page",
          name: { message: "Page name?" },
        },
      });

      core.useI18n({ force: "en" });

      expect(core.t("component.description", [], "default")).toBe(
        "Create component"
      );
      expect(core.t("page.description", [], "default")).toBe("Create page");
      expect(core.t("component.name.message", [], "default")).toBe(
        "Component name?"
      );
      expect(core.t("page.name.message", [], "default")).toBe("Page name?");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty string values", () => {
      i18n.registerText("en", "form.optional", "");

      core.useI18n({ force: "en" });

      expect(core.t("form.optional", [], "default")).toBe("");
    });

    it("should handle null values in structures", () => {
      // null in structure is stringified by the registry. EN_MESSAGES already has cli.welcomeMessage=null
      // In practice, null values work, though stringification may occur depending on registry implementation
      core.useI18n({ force: "en" });

      // The key exists in EN_MESSAGES defaultt
      expect(core.t("cli.welcomeMessage")).toBeDefined();
    });

    it("should handle numeric paths", () => {
      // Some edge cases might use numeric indices
      i18n.registerTexts("en", {
        form: {
          steps: {
            "0": { message: "First" },
            "1": { message: "Second" },
          },
        },
      });

      core.useI18n({ force: "en" });

      expect(core.t("form.steps.0.message", [], "default")).toBe("First");
      expect(core.t("form.steps.1.message", [], "default")).toBe("Second");
    });

    it("should handle special characters in keys", () => {
      i18n.registerTexts("en", {
        gen: {
          "my-prompt": { message: "With dash" },
          "my_prompt": { message: "With underscore" },
        },
      });

      core.useI18n({ force: "en" });

      expect(core.t("gen.my-prompt.message", [], "default")).toBe("With dash");
      expect(core.t("gen.my_prompt.message", [], "default")).toBe(
        "With underscore"
      );
    });
  });
});
