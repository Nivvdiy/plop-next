const FR = {
  cli: {
    title: "Bienvenue dans le générateur de code PlopNext !",
    welcomeMessage:
      "Cette interface est une demo des capacités de PlopNext. Sélectionnez un générateur pour voir comment il peut créer du code basé sur vos réponses.",
  },
  "react-component": {
    generator: {
      name: "Composant React",
      description: "Générer un composant React avec tests (via template .hbs)",
    },
    componentName: {
      message: "Nom du composant (PascalCase) ?",
    },
    description: {
      message: "Description du composant ?",
    },
    componentType: {
      message: "Type de composant ?",
      choices: {
        button: "bouton",
        card: "carte",
        modal: "modale",
        form: "formulaire",
        layout: "mise en page",
      },
    },
    author: {
      message: "Nom de l'auteur ?",
    },
    hasStorybook: {
      message: "Ajouter le support Storybook ?",
    },
  },
  "typescript-utility": {
    generator: {
      name: "Utilitaire TypeScript",
      description:
        "Générer une fonction utilitaire TypeScript (via template .hbs)",
    },
    utilityName: {
      message: "Nom de la fonction utilitaire (camelCase) ?",
    },
    description: {
      message: "Que fait cette utilitaire ?",
    },
    category: {
      message: "Catégorie ?",
      choices: {
        string: "chaîne",
        array: "tableau",
        object: "objet",
        math: "math",
        validation: "validation",
        formatting: "formatage",
        async: "asynchrone",
      },
    },
    inputType: {
      message: "Type du paramètre d'entrée ?",
    },
    returnType: {
      message: "Type de retour ?",
    },
    includeTypes: {
      message: "Inclure les types/interfaces TypeScript ?",
    },
    includeAsync: {
      message: "Générer aussi une version async ?",
    },
    includeValidation: {
      message: "Inclure une fonction de validation ?",
    },
  },
  "backend-service": {
    generator: {
      name: "Service Backend",
      description:
        "Générer un service backend avec méthodes (via template .hbs)",
    },
    serviceName: {
      message: "Nom du service (PascalCase) ?",
    },
    description: {
      message: "Description du service ?",
    },
    featureName: {
      message: "Nom de la feature ou du domaine ?",
    },
    environment: {
      message: "Environnement cible ?",
      choices: {
        development: "développement",
        staging: "préproduction",
        production: "production",
      },
    },
  },
  "demo-all-prompts": {
    generator: {
      name: "Demo Tous les Prompts",
      description: "Demo montrant tous les types de prompts et fonctionnalités",
    },
    projectName: {
      message: "Nom du projet ?",
    },
    generateTests: {
      message: "Générer les fichiers de test ?",
    },
    packageManager: {
      message: "Gestionnaire de paquets ?",
      choices: {
        npm: "npm",
        yarn: "yarn",
        pnpm: "pnpm",
        bun: "bun",
      },
    },
    features: {
      message: "Quelles fonctionnalités inclure ?",
      choices: {
        typescript: "TypeScript",
        eslint: "ESLint",
        prettier: "Prettier",
        husky: "Hooks Git",
        "github-actions": "CI/CD",
      },
    },
    confirmGeneration: {
      message: "Prêt à générer ?",
      choices: {
        yes: "Oui, générer maintenant",
        no: "Non, je veux relire",
        config: "Afficher la configuration",
      },
    },
  },
  "test-file": {
    generator: {
      name: "Fichier de Test",
      description: "Générer un fichier de test spécialisé avec les réponses",
    },
    testName: {
      message: "Nom du fichier de test ?",
    },
    testFramework: {
      message: "Framework de test ?",
      choices: {
        vitest: "vitest",
        jest: "jest",
        mocha: "mocha",
      },
    },
    testTypes: {
      message: "Que tester ?",
      choices: {
        unit: "Tests unitaires",
        integration: "Tests d'intégration",
        e2e: "Tests E2E",
      },
    },
    author: {
      message: "Nom de l'auteur ?",
    },
  },
} as const;

export {FR};
