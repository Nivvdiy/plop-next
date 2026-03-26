import type { PlopNext, PlopNextTheme, PlopPromptBase } from "@plop-next/cli";
import { styleText } from "node:util";
import { PlopNextI18n } from "@plop-next/i18n";
import TableMultiple from "@bartheleway/inquirer-table-multiple";

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
    frames: [
      ".     ",
      " .    ",
      "  .   ",
      "   .  ",
      "    . ",
      "     .",
      "      ",
    ].map((frame) => styleText("magenta", frame)),
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
      //error: (text: string) => styleText(["bold", "red"], `✖ ${text}`),
      skipped: (text: string) => styleText("magenta", `● ${text}`),
      info: (text: string) => styleText("white", text),
    },
    errors: {
      prefix: {
        error: styleText(["bold", "red"], "✖"),
        warning: styleText(["bold", "yellow"], "⚠"),
      },
      error: (text: string) => styleText(["bold", "red"], text),
      warning: (text: string) => styleText(["bold", "yellow"], text),
    },
  },
};

type TableMultiplePrompt = Parameters<typeof TableMultiple>[0] & PlopPromptBase;

/**
 * Helper personnalisé pour formater les dates
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Helper personnalisé pour convertir une liste en string comma-separated
 */
function joinArray(items: string[], separator: string = ", "): string {
  if (Array.isArray(items)) {
    return items.join(separator);
  }
  return String(items);
}

export default function plop(plop: PlopNext) {
  plop.setWelcomeMessage(
    styleText(
      ["bold", "cyan"],
      "🎉 Welcome to plop-next comprehensive demo!\n",
    ) +
      styleText(
        "gray",
        "This demo showcases multiple generators with templates, helpers, and file generation.",
      ),
  );

  // ==================
  // 1. CONFIGURATION & HELPERS
  // ==================

  // Enregistrer des helpers Handlebars personnalisés
  plop.registerHelper("now", () => formatDate(new Date()));

  plop.registerHelper("joinArray", (...args: unknown[]) =>
    joinArray(args[0] as string[], args[1] as string),
  );

  plop.registerHelper("eq", function (this: unknown, ...args: unknown[]) {
    const options = args[args.length - 1] as
      | { fn?: (ctx: unknown) => string; inverse?: (ctx: unknown) => string }
      | undefined;
    const [a, b] = args;
    const isEqual = a === b;
    // Mode block helper : {{#eq a b}}...{{/eq}}
    if (typeof options?.fn === "function") {
      return isEqual ? options.fn(this) : (options.inverse?.(this) ?? "");
    }
    // Mode sous-expression : {{#if (eq a b)}}
    return isEqual;
  });

  plop.registerHelper("upper", (...args: unknown[]) =>
    String(args[0] ?? "").toUpperCase(),
  );

  plop.registerHelper("lower", (...args: unknown[]) =>
    String(args[0] ?? "").toLowerCase(),
  );

  // Instancier le plugin i18n
  const i18n = new PlopNextI18n(plop);

  // Enregistrer prompt custom
  plop.registerPrompt("table-multiple", TableMultiple, {
    theme: { selector: "select" },
    translatableFields: [
      { path: "columns.#", translateField: "title" },
      { path: "rows", translateField: "title", idField: "value" },
    ],
  });

  // Appliquer le thème et la locale
  plop.setTheme(customTheme);
  plop.useI18n({ auto: true });

  // ==================
  // 2. GÉNÉRATEUR: Composant React (avec templates .hbs)
  // ==================

  plop.setGenerator("react-component", {
    description: "Generate a React component with tests (using .hbs templates)",
    prompts: [
      {
        type: "input",
        name: "componentName",
        message: "Component name (PascalCase)?",
        default: "MyComponent",
        validate: (input: string) =>
          /^[A-Z][a-zA-Z]*$/.test(input) || "Must start with uppercase letter",
      },
      {
        type: "input",
        name: "description",
        message: "Component description?",
        default: "A reusable component",
      },
      {
        type: "select",
        name: "componentType",
        message: "Component type?",
        choices: ["button", "card", "modal", "form", "layout"],
        default: "card",
      },
      {
        type: "input",
        name: "author",
        message: "Author name?",
        default: "Your Team",
      },
      {
        type: "confirm",
        name: "hasStorybook",
        message: "Add Storybook support?",
        default: true,
      },
    ],
    actions: (answers) => [
      // Générer le composant TSX depuis template .hbs
      {
        type: "add",
        path: "generated/components/{{pascalCase componentName}}/{{pascalCase componentName}}.tsx",
        templateFile: "templates/component.tsx.hbs",
      },
      // Générer le fichier de styles depuis template .hbs
      {
        type: "add",
        path: "generated/components/{{pascalCase componentName}}/{{pascalCase componentName}}.module.scss",
        templateFile: "templates/component.module.scss.hbs",
      },
      // Générer le fichier de test depuis template .hbs
      {
        type: "add",
        path: "generated/components/{{pascalCase componentName}}/{{pascalCase componentName}}.test.tsx",
        templateFile: "templates/component.test.ts.hbs",
      },
      // Générer un fichier index (template inline avec helpers)
      {
        type: "add",
        path: "generated/components/{{pascalCase componentName}}/index.ts",
        template: `/**
 * {{pascalCase componentName}} - Export file
 * Generated at: {{now}}
 */

export { {{pascalCase componentName}}, type {{pascalCase componentName}}Props } from './{{pascalCase componentName}}';
export type * from './{{pascalCase componentName}}';
`,
      },
      // Générer un fichier de documentation (inline template montrant l'utilisation de helpers avec données)
      {
        type: "add",
        path: "generated/components/{{pascalCase componentName}}/README.md",
        template: `# {{pascalCase componentName}}

**Description:** {{description}}

**Type:** {{upper componentType}}

**Author:** {{author}}

**Generated:** {{now}}

## Usage

\`\`\`tsx
import { {{pascalCase componentName}} } from './{{pascalCase componentName}}';

export function App() {
  return (
    <{{pascalCase componentName}} 
      title="{{pascalCase componentName}} Title"
      onAction={() => console.log('Action triggered!')}
    >
      Your content here
    </{{pascalCase componentName}}>
  );
}
\`\`\`

## Props

- \`title\` (string): The component title
- \`disabled\` (boolean): Disable the action button
- \`children\` (ReactNode): Content to display
- \`onAction\` (function): Callback when action is triggered

## Type
This is a **{{componentType}}** component.

{{#if hasStorybook}}
### Storybook
📖 [View in Storybook](https://storybook.example.com/{{kebabCase componentName}})
{{/if}}

## Tests
Run tests with: \`npm test -- {{pascalCase componentName}}.test.tsx\`
`,
      },
    ],
  });

  // ==================
  // 3. GÉNÉRATEUR: Utilitaire TypeScript (avec templates .hbs)
  // ==================

  plop.setGenerator("typescript-utility", {
    description: "Generate a TypeScript utility function (using .hbs template)",
    prompts: [
      {
        type: "input",
        name: "utilityName",
        message: "Utility function name (camelCase)?",
        default: "processData",
      },
      {
        type: "input",
        name: "description",
        message: "What does this utility do?",
        default: "Processes and transforms data",
      },
      {
        type: "select",
        name: "category",
        message: "Category?",
        choices: [
          "string",
          "array",
          "object",
          "math",
          "validation",
          "formatting",
          "async",
        ],
        default: "string",
      },
      {
        type: "input",
        name: "inputType",
        message: "Input parameter type?",
        default: "string",
      },
      {
        type: "input",
        name: "returnType",
        message: "Return type?",
        default: "string",
      },
      {
        type: "confirm",
        name: "includeTypes",
        message: "Include TypeScript types/interfaces?",
        default: true,
      },
      {
        type: "confirm",
        name: "includeAsync",
        message: "Generate async version too?",
        default: false,
      },
      {
        type: "confirm",
        name: "includeValidation",
        message: "Include validation function?",
        default: true,
      },
    ],
    actions: (answers) => [
      // Générer l'utilitaire depuis template .hbs
      {
        type: "add",
        path: "generated/utils/{{kebabCase utilityName}}.ts",
        templateFile: "templates/util.ts.hbs",
      },
      // Générer un fichier de test (inline template utilisant les réponses)
      {
        type: "add",
        path: "generated/utils/{{kebabCase utilityName}}.test.ts",
        template: `/**
 * Tests for {{camelCase utilityName}}
 * Category: {{category}}
 * Auto-generated by plop-next
 */

import { describe, it, expect } from 'vitest';
import { {{camelCase utilityName}}{{#if includeAsync}}, {{camelCase utilityName}}Async{{/if}}{{#if includeValidation}}, validate{{pascalCase utilityName}}Input{{/if}} } from './{{kebabCase utilityName}}';

describe('{{camelCase utilityName}} ({{category}})', () => {
  describe('basic functionality', () => {
    it('should be a function', () => {
      expect(typeof {{camelCase utilityName}}).toBe('function');
    });

    it('should accept {{inputType}} input', () => {
      const input: {{inputType}} = null as unknown as {{inputType}};
      expect(() => {{camelCase utilityName}}(input)).not.toThrow();
    });

    it('should return {{returnType}}', () => {
      const result = {{camelCase utilityName}}(null as unknown as {{inputType}});
      // This is a template-generated test
      expect(result).toBeDefined();
    });
  });

  {{#if includeAsync}}
  describe('async version', () => {
    it('should have async variant', () => {
      expect(typeof {{camelCase utilityName}}Async).toBe('function');
    });

    it('should return a promise', async () => {
      const result = {{camelCase utilityName}}Async(null as unknown as {{inputType}});
      expect(result).toBeInstanceOf(Promise);
    });
  });
  {{/if}}

  {{#if includeValidation}}
  describe('validation', () => {
    it('should validate input', () => {
      const isValid = validate{{pascalCase utilityName}}Input(null);
      expect(typeof isValid).toBe('boolean');
    });
  });
  {{/if}}
});
`,
      },
      // Générer un fichier index
      {
        type: "add",
        path: "generated/utils/index.ts",
        template: `// Auto-generated exports
export { {{camelCase utilityName}}{{#if includeAsync}}, {{camelCase utilityName}}Async{{/if}} } from './{{kebabCase utilityName}}';
`,
      },
    ],
  });

  // ==================
  // 4. GÉNÉRATEUR: Service Backend (avec templates .hbs)
  // ==================

  plop.addSeparator("─── Services & Advanced ───");

  plop.setGenerator("backend-service", {
    description:
      "Generate a backend service with methods (using .hbs template)",
    prompts: [
      {
        type: "input",
        name: "serviceName",
        message: "Service name (PascalCase)?",
        default: "UserService",
      },
      {
        type: "input",
        name: "description",
        message: "Service description?",
        default: "Handles service operations",
      },
      {
        type: "input",
        name: "featureName",
        message: "Feature or domain name?",
        default: "core",
      },
      {
        type: "select",
        name: "environment",
        message: "Target environment?",
        choices: ["development", "staging", "production"],
        default: "development",
      },
    ],
    actions: (answers) => [
      // Générer le service depuis template .hbs
      {
        type: "add",
        path: "generated/services/{{kebabCase serviceName}}/{{camelCase serviceName}}.service.ts",
        templateFile: "templates/service.ts.hbs",
        skip: (answers) => {
          // Exemple de skip conditionnelle
          return false;
        },
      },
      // Générer un fichier de config (inline template montrant comment utiliser les données formatées)
      {
        type: "add",
        path: "generated/services/{{kebabCase serviceName}}/config.ts",
        template: `/**
 * Configuration for {{serviceName}} Service
 * Environment: {{upper environment}}
 * Feature: {{featureName}}
 * Generated: {{now}}
 */

const environments = {
  development: {
    baseUrl: 'http://localhost:3000/api',
    timeout: 10000,
    retryAttempts: 3,
  },
  staging: {
    baseUrl: 'https://staging-api.example.com',
    timeout: 8000,
    retryAttempts: 2,
  },
  production: {
    baseUrl: 'https://api.example.com',
    timeout: 5000,
    retryAttempts: 1,
  },
};

export const {{camelCase serviceName}}Config = environments['{{lower environment}}' as keyof typeof environments];

export const SERVICE_METADATA = {
  name: '{{serviceName}}',
  environment: '{{upper environment}}',
  feature: '{{featureName}}',
  version: '1.0.0',
  createdAt: new Date('{{now}}'),
} as const;
`,
      },
      // Générer un fichier exemple d'utilisation
      {
        type: "add",
        path: "generated/services/{{kebabCase serviceName}}/example.ts",
        template: `/**
 * Example usage of {{serviceName}}
 */

import { create{{pascalCase serviceName}}Service } from './{{camelCase serviceName}}.service';
import { {{camelCase serviceName}}Config } from './config';

// Initialize the service
const service = create{{pascalCase serviceName}}Service({{camelCase serviceName}}Config);

// Usage example
async function example() {
  try {
    // Initialize
    await service.init();
    console.log('{{serviceName}} initialized');

    // Make requests (implement methods in service)
    // const result = await service.getData();
    // console.log(result);

  } finally {
    // Clean up
    service.dispose();
  }
}

// Run example
example().catch(console.error);
`,
      },
    ],
  });

  // ==================
  // 5. GÉNÉRATEUR DE DÉMONSTRATION: Tous les types de prompts
  // ==================

  plop.addSeparator();

  plop.setGenerator("demo-all-prompts", {
    description: "Demo showing all prompt types and functionality",
    prompts: [
      {
        type: "input",
        name: "projectName",
        message: "Project name?",
        default: "my-project",
        validate: (val: string) =>
          val.length > 0 || "Project name cannot be empty",
      },
      {
        type: "confirm",
        name: "generateTests",
        message: "Generate test files?",
        default: true,
      },
      {
        type: "select",
        name: "packageManager",
        message: "Package manager?",
        choices: ["npm", "yarn", "pnpm", "bun"],
        default: "npm",
      },
      {
        type: "checkbox",
        name: "features",
        message: "Which features to include?",
        required: true,
        choices: [
          { name: "TypeScript", value: "typescript" },
          { name: "ESLint", value: "eslint" },
          { name: "Prettier", value: "prettier" },
          { name: "Git Hooks", value: "husky" },
          { name: "CI/CD", value: "github-actions" },
        ],
        validate: (val: readonly { value: unknown }[]) =>
          val.length > 0 || "Select at least one feature",
      },
      {
        type: "expand",
        name: "confirmGeneration",
        message: "Ready to generate?",
        choices: [
          { key: "y", name: "Yes, generate now", value: "yes" },
          { key: "n", name: "No, let me review", value: "no" },
          { key: "l", name: "Show config", value: "config" },
        ],
      },
    ],
    actions: (answers) => [
      // Générer un fichier de config (inline template montrant l'utilisation de tous les helpers)
      {
        type: "add",
        path: "generated/demo/project-config.json",
        template: `{
  "name": "{{kebabCase projectName}}",
  "displayName": "{{pascalCase projectName}}",
  "camelName": "{{camelCase projectName}}",
  "snakeName": "{{snakeCase projectName}}",
  "generateTests": {{generateTests}},
  "packageManager": "{{packageManager}}",
  "features": [{{#each features}}"{{this}}"{{#unless @last}}, {{/unless}}{{/each}}],
  "featureCount": {{features.length}},
  "generatedAt": "{{now}}",
  "metdata": {
    "environment": "development",
    "version": "1.0.0"
  }
}
`,
      },
      // Générer un fichier README avec toutes les transformations
      {
        type: "add",
        path: "generated/demo/README.md",
        template: `# {{pascalCase projectName}} Demo

## Project Details

- **Name**: {{projectName}}
- **Package Manager**: {{packageManager}}
- **Generate Tests**: {{#if generateTests}}Yes ✅{{else}}No ❌{{/if}}
- **Generated At**: {{now}}

## Name Transformations

{{projectName}} gets transformed as:
- **PascalCase**: {{pascalCase projectName}}
- **camelCase**: {{camelCase projectName}}
- **kebab-case**: {{kebabCase projectName}}
- **snake_case**: {{snakeCase projectName}}

## Features Included

{{#if features.length}}
Selected features ({{features.length}} total):
{{#each features}}
- ✓ {{this}}
{{/each}}
{{else}}
No features selected.
{{/if}}

## Test Generation

{{#if generateTests}}
Test files will be generated for all modules.
Run: \`npm test\`
{{else}}
Test files will NOT be generated.
Use the test generator separately if needed.
{{/if}}

---

This file was auto-generated by plop-next comprehensive demo.
`,
      },
    ],
  });

  // ==================
  // 6. GÉNÉRATEUR DE FICHIERS DE TEST PERSONNALISÉ
  // ==================

  plop.addSeparator("─── Specialized ───");

  plop.setGenerator("test-file", {
    description: "Generate specialized test file with response data",
    prompts: [
      {
        type: "input",
        name: "testName",
        message: "Test file name?",
        default: "feature",
      },
      {
        type: "select",
        name: "testFramework",
        message: "Test framework?",
        choices: ["vitest", "jest", "mocha"],
        default: "vitest",
      },
      {
        type: "checkbox",
        name: "testTypes",
        message: "What to test?",
        required: true,
        choices: [
          { name: "Unit Tests", value: "unit" },
          { name: "Integration Tests", value: "integration" },
          { name: "E2E Tests", value: "e2e" },
        ],
      },
      {
        type: "input",
        name: "author",
        message: "Author name?",
        default: "Test Author",
      },
    ],
    actions: (answers) => [
      {
        type: "add",
        path: "generated/tests/{{kebabCase testName}}.test.ts",
        template: `/**
 * {{pascalCase testName}} Test Suite
 * 
 * Framework: {{upper testFramework}}
 * Author: {{author}}
 * Generated: {{now}}
 * Types: {{joinArray testTypes}}
 */

import { describe, it, expect{{#eq testFramework "vitest"}}, beforeEach, vi{{/eq}} } from '{{testFramework}}';

describe('{{pascalCase testName}}', () => {
  {{#eq testFramework "vitest"}}
  beforeEach(() => {
    vi.clearAllMocks();
  });
  {{/eq}}

  {{#each testTypes}}
  describe('{{this}}', () => {
    it('should be implemented', () => {
      expect(true).toBe(true);
    });
  });

  {{/each}}
});
`,
      },
    ],
  });
}
