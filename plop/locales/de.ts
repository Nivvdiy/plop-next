const Local = {
  cli: {
    welcome: "Willkommen bei plop-next! 🚀",
    welcomeMessage:
      "Diese interaktive CLI ist eine Demo der Fähigkeiten von PlopNext. Wählen Sie einen Generator aus, um zu sehen, wie er Code basierend auf Ihren Eingaben erstellen kann.",
    selectGenerator: "Bitte waehlen Sie einen Generator",
    noGenerators:
      "Keine Generatoren registriert. Fuegen Sie welche in Ihrer plopfile hinzu.",
    generatorNotFound: "Generator nicht gefunden.",
    aborted: "Abgebrochen.",
    done: "Fertig!",
    promptCancelled: "Konsole vom Benutzer geschlossen.",
  },
  inquirer: {
    confirm: {
      yesLabel: "Ja",
      noLabel: "Nein",
      hintYes: "J/n",
      hintNo: "j/N",
    },
    select: {
      helpNavigate: "navigieren",
      helpSelect: "auswaehlen",
    },
    checkbox: {
      helpNavigate: "navigieren",
      helpSelect: "auswaehlen",
      helpSubmit: "bestaetigen",
      helpAll: "alle",
      helpInvert: "invertieren",
    },
    search: {
      helpNavigate: "navigieren",
      helpSelect: "auswaehlen",
    },
    editor: {
      waitingMessage:
        "Druecken Sie Enter, um Ihren bevorzugten Editor zu starten.",
    },
    password: {
      maskedText: "[eingabe ist ausgeblendet]",
    },
  },
  actions: {
    add: {
      creating: "Datei wird erstellt",
      created: "Datei erstellt",
      alreadyExists: "Datei existiert bereits",
    },
    modify: {
      modifying: "Datei wird bearbeitet",
      modified: "Datei bearbeitet",
      notFound: "Datei nicht gefunden",
      patternNotFound: "Muster nicht gefunden",
    },
    append: {
      appending: "In Datei wird angehaengt",
      appended: "In Datei angehaengt",
    },
  },
  errors: {
    unknownAction: "Unbekannter Aktionstyp.",
    plopfileNotFound: "Keine plopfile gefunden (plopfile.js oder plopfile.ts).",
    plopfileLoadFailed: "plopfile konnte nicht geladen werden.",
    generatorNotFound: "Generator nicht gefunden.",
    noGenerators: "Keine Generatoren registriert.",
    invalidPrompt: "Ungueltiger Prompt.",
    bypassParse: "Bypass-Wert konnte dem Prompt nicht zugewiesen werden.",
    plopfileLoad: "Fehler beim Laden der plopfile.",
    plopfileExport: "Die plopfile muss eine Default-Funktion exportieren.",
    userCancelled: "Prompt vom Benutzer abgebrochen.",
    plopfileNotFoundWarning:
      "Keine plopfile gefunden. Erstellen Sie eine plopfile.js im Projekt.",
    forcedLangI18nMissing:
      "Erzwungene Sprache ignoriert, da @plop-next/i18n nicht installiert ist.",
    forcedLangUnavailable:
      "Erzwungene Sprache ist nicht verfuegbar. Fallback auf Englisch.",
  },
  help: {
    usage: "Verwendung:",
    usage1: "Aus der Liste der verfuegbaren Generatoren waehlen",
    usage2: "Einen unter diesem Namen registrierten Generator ausfuehren",
    usage3:
      "Generator mit Eingabedaten ausfuehren, um Prompts zu ueberspringen",
    options: "Optionen:",
    optHelp: "Diese Hilfe anzeigen",
    optShowTypeNames: "Typnamen statt Abkuerzungen anzeigen",
    optInit: "Eine grundlegende plopfile.ts erzeugen",
    optInitJs: "Eine grundlegende plopfile.js erzeugen",
    optInitTs: "Eine grundlegende plopfile.ts erzeugen",
    optDemo: "Einen Demo-Generator in der plopfile erzeugen",
    optI18n: "plopfile mit i18n-Unterstuetzung initialisieren",
    optVersion: "Aktuelle Version anzeigen",
    optForce: "Generator im Force-Modus ausfuehren",
    optLang: "Anzeigesprache erzwingen (z. B. en, de, fr)",
    danger: "Gefahr erwartet alle, die unter diese Zeile gehen",
    lowPlopfile: "Pfad zur plopfile",
    lowCwd: "Basisverzeichnis fuer relative Pfade bei der plopfile-Suche",
    lowPreload:
      "String oder Array von Modulen, die vor plop-next geladen werden",
    lowDest:
      "Ausgabe in diesen Ordner schreiben statt in den Elternordner der plopfile",
    lowNoProgress: "Fortschritts-Spinner deaktivieren",
    lowCompletion: "Shell-Completion-Skript anzeigen (bash|zsh|fish)",
    examples: "Beispiele:",
  },
  "react-component": {
    generator: {
      name: "React-Komponente",
      description:
        "Erzeuge eine React-Komponente mit Tests (mit .hbs-Template)",
    },
    componentName: {
      message: "Komponentenname (PascalCase)?",
    },
    description: {
      message: "Komponentenbeschreibung?",
    },
    componentType: {
      message: "Komponententyp?",
      choices: {
        button: "Button",
        card: "Karte",
        modal: "Modal",
        form: "Formular",
        layout: "Layout",
      },
    },
    author: {
      message: "Autorname?",
    },
    hasStorybook: {
      message: "Storybook-Unterstuetzung hinzufuegen?",
    },
  },
  "typescript-utility": {
    generator: {
      name: "TypeScript-Utility",
      description:
        "Erzeuge eine TypeScript-Utility-Funktion (mit .hbs-Template)",
    },
    utilityName: {
      message: "Name der Utility-Funktion (camelCase)?",
    },
    description: {
      message: "Was macht diese Utility?",
    },
    category: {
      message: "Kategorie?",
      choices: {
        string: "String",
        array: "Array",
        object: "Objekt",
        math: "Mathe",
        validation: "Validierung",
        formatting: "Formatierung",
        async: "Asynchron",
      },
    },
    inputType: {
      message: "Eingabeparametertyp?",
    },
    returnType: {
      message: "Rueckgabetyp?",
    },
    includeTypes: {
      message: "TypeScript-Typen/Interfaces einbinden?",
    },
    includeAsync: {
      message: "Auch eine async-Version erzeugen?",
    },
    includeValidation: {
      message: "Validierungsfunktion einbinden?",
    },
  },
  "backend-service": {
    generator: {
      name: "Backend-Service",
      description:
        "Erzeuge einen Backend-Service mit Methoden (mit .hbs-Template)",
    },
    serviceName: {
      message: "Service-Name (PascalCase)?",
    },
    description: {
      message: "Service-Beschreibung?",
    },
    featureName: {
      message: "Feature- oder Domain-Name?",
    },
    environment: {
      message: "Zielumgebung?",
      choices: {
        development: "Entwicklung",
        staging: "Staging",
        production: "Produktion",
      },
    },
  },
  "demo-all-prompts": {
    generator: {
      name: "Demo Alle Prompts",
      description: "Demo mit allen Prompt-Typen und Funktionen",
    },
    projectName: {
      message: "Projektname?",
    },
    generateTests: {
      message: "Testdateien erzeugen?",
    },
    packageManager: {
      message: "Paketmanager?",
      choices: {
        npm: "npm",
        yarn: "yarn",
        pnpm: "pnpm",
        bun: "bun",
      },
    },
    features: {
      message: "Welche Features sollen enthalten sein?",
      choices: {
        typescript: "TypeScript",
        eslint: "ESLint",
        prettier: "Prettier",
        husky: "Git Hooks",
        "github-actions": "CI/CD",
      },
    },
    confirmGeneration: {
      message: "Bereit zum Generieren?",
      choices: {
        yes: "Ja, jetzt generieren",
        no: "Nein, erst pruefen",
        config: "Konfiguration anzeigen",
      },
    },
  },
  "test-file": {
    generator: {
      name: "Testdatei",
      description: "Erzeuge eine spezialisierte Testdatei mit Antwortdaten",
    },
    testName: {
      message: "Name der Testdatei?",
    },
    testFramework: {
      message: "Test-Framework?",
      choices: {
        vitest: "vitest",
        jest: "jest",
        mocha: "mocha",
      },
    },
    testTypes: {
      message: "Was soll getestet werden?",
      choices: {
        unit: "Unit-Tests",
        integration: "Integrationstests",
        e2e: "E2E-Tests",
      },
    },
    author: {
      message: "Autorname?",
    },
  },
} as const;

export default Local;
