const Text = {
  generators: {
    "react-component": {
      description:
        "Generate a React component with tests (using .hbs templates)",
    },
    "typescript-utility": {
      description:
        "Generate a TypeScript utility function (using .hbs template)",
    },
    "backend-service": {
      description:
        "Generate a backend service with methods (using .hbs template)",
    },
    "demo-all-prompts": {
      description: "Demo showing all prompt types and functionality",
    },
    "test-file": {
      description: "Generate specialized test file with response data",
    },
  },
  "react-component": {
    componentName: {
      message: "Component name (PascalCase)?",
    },
    description: {
      message: "Component description?",
    },
    componentType: {
      message: "Component type?",
      choices: {
        button: "button",
        card: "card",
        modal: "modal",
        form: "form",
        layout: "layout",
      },
    },
    author: {
      message: "Author name?",
    },
    hasStorybook: {
      message: "Add Storybook support?",
    },
  },
  "typescript-utility": {
    utilityName: {
      message: "Utility function name (camelCase)?",
    },
    description: {
      message: "What does this utility do?",
    },
    category: {
      message: "Category?",
      choices: {
        string: "string",
        array: "array",
        object: "object",
        math: "math",
        validation: "validation",
        formatting: "formatting",
        async: "async",
      },
    },
    inputType: {
      message: "Input parameter type?",
    },
    returnType: {
      message: "Return type?",
    },
    includeTypes: {
      message: "Include TypeScript types/interfaces?",
    },
    includeAsync: {
      message: "Generate async version too?",
    },
    includeValidation: {
      message: "Include validation function?",
    },
  },
  "backend-service": {
    serviceName: {
      message: "Service name (PascalCase)?",
    },
    description: {
      message: "Service description?",
    },
    featureName: {
      message: "Feature or domain name?",
    },
    environment: {
      message: "Target environment?",
      choices: {
        development: "development",
        staging: "staging",
        production: "production",
      },
    },
  },
  "demo-all-prompts": {
    projectName: {
      message: "Project name?",
    },
    generateTests: {
      message: "Generate test files?",
    },
    packageManager: {
      message: "Package manager?",
      choices: {
        npm: "npm",
        yarn: "yarn",
        pnpm: "pnpm",
        bun: "bun",
      },
    },
    features: {
      message: "Which features to include?",
      choices: {
        typescript: "TypeScript",
        eslint: "ESLint",
        prettier: "Prettier",
        husky: "Git Hooks",
        "github-actions": "CI/CD",
      },
    },
    confirmGeneration: {
      message: "Ready to generate?",
      choices: {
        yes: "Yes, generate now",
        no: "No, let me review",
        config: "Show config",
      },
    },
  },
  "test-file": {
    testName: {
      message: "Test file name?",
    },
    testFramework: {
      message: "Test framework?",
      choices: {
        vitest: "vitest",
        jest: "jest",
        mocha: "mocha",
      },
    },
    testTypes: {
      message: "What to test?",
      choices: {
        unit: "Unit Tests",
        integration: "Integration Tests",
        e2e: "E2E Tests",
      },
    },
    author: {
      message: "Author name?",
    },
  },
} as const;

export default Text;
