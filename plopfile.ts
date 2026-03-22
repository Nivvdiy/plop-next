import type { PlopNext, PlopNextTheme } from "@plop-next/cli";
import { Separator, defaultTheme } from "@plop-next/cli";
import { styleText } from "node:util";
import { PlopNextI18n } from "@plop-next/i18n";

/**
 * Thème personnalisé — remplace les couleurs cyan/green/bold par des tons magenta/jaune.
 */
const customTheme: PlopNextTheme = {
  prefix: {
    idle: styleText("magenta", "◆"),
    done: styleText("yellow", "◇"),
  },
  spinner: {
    interval: 100,
    frames: ["⣾", "⣷", "⣯", "⣟", "⣻", "⣽"].map((frame) =>
      styleText("magenta", frame),
    ),
  },
  style: {
    answer: (text: string) => styleText("magenta", text),
    message: (text: string) => styleText(["bold", "white"], text),
    error: (text: string) => styleText(["redBright", "underline"], `> ${text}`),
    defaultAnswer: (text: string) => styleText("green", `(${text})`),
    help: (text: string) => styleText(["italic", "cyan"], text),
    highlight: (text: string) => styleText("yellow", text),
    key: (text: string) => styleText(["yellow", "bold"], `<${text}>`),
  },
  plopNext: {
    welcome: (text: string) => styleText(["bold", "magenta"], text),
    generatorMenu: {
      title: (text: string) => styleText(["bold", "yellow"], text),
      description: (text: string) => styleText("magenta", text),
    },
    actionLog: {
      success: (text: string) => styleText("yellow", `✔ ${text}`),
      error: (text: string) => styleText(["bold", "red"], `✖ ${text}`),
      skipped: (text: string) => styleText("magenta", `● ${text}`),
      info: (text: string) => styleText("white", text),
    },
  },
};

/**
 * Mock functions for dynamic choice lists
 * In a real project, these would read from the filesystem or database
 */
function getExistingComponents(): string[] {
  return ["Button", "Card", "Modal"];
}

function getExistingFeatures(): string[] {
  return ["ui", "forms", "separator", "layout"];
}

export default function plop(plop: PlopNext) {

  plop.setWelcomeMessage("Welcome to the PlopNext demo! Please select a generator to get started.");

  // 1. Instancier le plugin i18n (les locales EN et FR sont pré-enregistrées)
  const i18n = new PlopNextI18n(plop);

  // 2. Enregistrer les textes i18n pour le générateur "component"
  i18n.registerTexts("fr", {
    welcomeMessage: "Bienvenue dans la démo de PlopNext ! Veuillez sélectionner un générateur pour commencer.",
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

  // 5. Appliquer le thème custom
  plop.setTheme(customTheme);

  // ── Générateur "component" ──────────────────────────────────────────

  /*plop.setGenerator("allTypesTest", {
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
        type: "list",
        name: "selectFeature",
        message: "Select a feature",
        choices: getExistingFeatures().map((feature) => {
          if (feature === "separator") {
            return new Separator("──────────");
          } else {
            return {
              name: feature,
              value: feature,
            };
          }
        }),
        default: "ui",
        loop: true,
      },
      {
        type: "select",
        name: "selectComponent",
        message: "Select a component to update",
        choices: getExistingComponents().map((component) => ({
          name: component,
          value: component,
        })),
        loop: false,
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
        validate: (choices) => {
          let choicesNames = choices.map((choice) => {
            return choice.value || choice.name || choice;
          });
          if (choicesNames.length === 0) {
            return "You must select at least one component";
          } else {
            //card and modal cannot be selected together for this example
            if (choicesNames.includes("Card") && choicesNames.includes("Modal")) {
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
        source: async (input) => {
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
        expanded: false,
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
          new Separator(),
          {
            key: "x",
            name: "Abort",
            value: "abort",
          },
        ],
        default: "H",
      },
      {
        type: "number",
        name: "numberInput",
        message: "Enter a number",
        default: 0,
        min: 0,
        max: 100,
        validate: (value) => {
          if (isNaN(value as unknown as number)) {
            return "Please enter a valid number";
          }
          if ((value as unknown as number) < 0 || (value as unknown as number) > 100) {
            return "Number must be between 0 and 100";
          }
          return true;
        },
      },
      {
        type: "rawlist",
        name: "rawlistChoice",
        message: "Choose an option",
        choices: [
          {
            name: "Option 1",
            value: "option1",
          },
          {
            name: "Option 2",
            value: "option2",
          },
        ],
      },
      {
        type: "editor",
        name: "editorInput",
        message: "Provide a longer description",
        default: '# This prompt was automatically opened. You can write anything:\n\n',
        postfix: ".md",
        //file: ,
        waitForUserInput: true,
      },
    ],
    actions: (answers) => {
      console.log("Received answers:", answers);
      return [];
    },
  });

  plop.setGenerator("helloWorld", {
    description: "Simple generator that says hello",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is your name?",
        default: "World",
      },
    ],
    actions: (answers) => {
      console.log(`Hello, ${answers.name}!`);
      return [];
    },
  });*/

  // ── Séparateurs dans le menu des générateurs ──────────────────────
  // addSeparator() insère une ligne entre les générateurs dans le select.
  // Sans argument → ligne vide gérée par Inquirer par défaut.
  // Avec argument → texte personnalisé affiché comme séparateur.
  plop.addSeparator();
 /* plop.setGenerator("utilsGenerator", {
    description: "Génère un fichier utilitaire TypeScript",
    prompts: [
      {
        type: "input",
        name: "utilName",
        message: "Nom de l'utilitaire ?",
        default: "myUtil",
      },
    ],
    actions: (answers) => {
      console.log(`Generating utility: ${answers.utilName}`);
      return [];
    },
  });*/

  plop.addSeparator("── Avancé ──────────────────────────────────────");
  /*plop.setGenerator("advancedGenerator", {
    description: "Générateur avec configuration avancée",
    prompts: [
      {
        type: "input",
        name: "featureName",
        message: "Nom de la feature ?",
      },
    ],
    actions: (answers) => {
      console.log(`Advanced feature: ${answers.featureName}`);
      return [];
    },
  });*/
}
