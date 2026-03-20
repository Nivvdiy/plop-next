import type { PlopNext } from "@plop-next/cli";
import { PlopNextI18n } from "@plop-next/i18n";

/**
 * Mock functions for dynamic choice lists
 * In a real project, these would read from the filesystem or database
 */
function getExistingComponents(): string[] {
  return ["Button", "Card", "Modal"];
}

function getExistingFeatures(): string[] {
  return ["ui", "forms", "layout"];
}

export default function plop(plop: PlopNext) {
  // 1. Instancier le plugin i18n (les locales EN et FR sont pré-enregistrées)
  const i18n = new PlopNextI18n(plop);

  // 2. Enregistrer les textes i18n pour le générateur "component"
  i18n.registerTexts("fr", {
    allTypesTest: {
      description: "Composant réutilisable (tsx + module.scss + index)",
      inputName: {
        message: "Quel est le nom de l'input ?",
        validate: {
          empty: "Le nom ne peut pas être vide",
        },
        patternError: "Le nom doit contenir uniquement des lettres",
      },
    },
  });

  // 3. Enregistrer textes @inquirer/prompts si utilisation via plop-next
  i18n.registerTexts("fr", {
    inquirer: {
      confirm: {
        yesLabel: "Oui",
        noLabel: "Non",
        hintYes: "O/n",
        hintNo: "o/N",
      },
      select: {
        helpNavigate: "naviguer",
        helpSelect: "sélectionner",
      },
    },
  });

  // 4. Forcer le français pour la démo
  plop.useI18n({ force: "fr" });

  // ── Générateur "component" ──────────────────────────────────────────

  plop.setGenerator("allTypesTest", {
    description: "Composant réutilisable (tsx + module.scss + index)",
    prompts: [
      {
        type: "input",
        name: "inputName",
        message: "What is the name of the input?",
        default: "Default value",
        required: true,
        transformer: (inputName: string) => inputName.trim(),
        validate: (inputName: string) => {
          if (inputName.trim() === "") {
            return "Name cannot be empty";
          }
          return true;
        },
        pattern: /^[a-zA-Z]+$/,
        patternError: "Name must contain only letters",
      },
      {
        type: "select",
        name: "selectFeature",
        message: "Select a feature",
        choices: getExistingFeatures().map((feature) => ({
          name: feature,
          value: feature,
        })),
        default: "ui",
        loop: true,
      },
      {
        type: "checkbox",
        name: "checkboxComponents",
        message: "Select components to update",
        choices: getExistingComponents().map((component) => ({
          name: component,
          value: component,
        })),
        loop: false,
        required: true,
        validate: (selected: string[]) => {
          if (selected.length === 0) {
            return "You must select at least one component";
          } else {
            //card and modal cannot be selected together for this example
            if (selected.includes("Card") && selected.includes("Modal")) {
              return "Card and Modal cannot be selected together";
            }
          }
          return true;
        },
      },
      {
        type: "confirm",
        name: "confirmAction",
        message: "Do you want to proceed?",
        default: true,
        transformer: (value: boolean) =>
          value ? "Yes, let's do it!" : "No, cancel",
      },
      {
        type: "password",
        name: "password",
        message: "Enter your password",
        mask: "*",
        validate: (value: string) => {
          if (value.length < 6) {
            return "Password must be at least 6 characters";
          }
          return true;
        },
      },
      {
        type: "search",
        name: "searchComponent",
        message: "Search for a component",
        source: async (input: string) => {
          if (!input) {
            return [];
          }
          const allComponents = getExistingComponents();
          return allComponents.filter((component) =>
            component.toLowerCase().includes(input.toLowerCase()),
          );
        },
      },
      {
        type: "expand",
        name: "expandChoice",
        message: "Conflict on file.js",
        choices: [
          {
            key: "y",
            name: "Overwrite",
            value: "overwrite",
          },
          {
            key: "a",
            name: "Overwrite this one and all next",
            value: "overwrite_all",
          },
          {
            key: "d",
            name: "Show diff",
            value: "diff",
          },
          {
            key: "x",
            name: "Abort",
            value: "abort",
          },
        ],
        default: "y",
      },
    ],
    actions: (answers) => {
      console.log("Received answers:", answers);
      return [];
    },
  });
}
