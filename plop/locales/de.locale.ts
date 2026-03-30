const Local = {
  cli: {
    title: "Willkommen bei plop-next! 🚀",
    welcomeMessage:
      "Diese interaktive CLI ist eine Demo der Fähigkeiten von PlopNext. Wählen Sie einen Generator aus, um zu sehen, wie er Code basierend auf Ihren Eingaben erstellen kann.",
    selectGenerator: "Bitte waehlen Sie einen Generator",
    noGenerators:
      "Keine Generatoren registriert. Fuegen Sie welche in Ihrer plopfile hinzu.",
    generatorNotFound: (name: string) =>
      `Generator \"${name}\" nicht gefunden.`,
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
      waitingMessage: (enterKey: any) =>
        `Druecken Sie ${enterKey}, um Ihren bevorzugten Editor zu starten.`,
    },
    password: {
      maskedText: "[eingabe ist ausgeblendet]",
    },
  },
  actions: {
    add: {
      creating: (path: string) => `Datei wird erstellt: ${path}`,
      created: (path: string) => `Datei erstellt: ${path}`,
      alreadyExists: (path: string) => `Datei existiert bereits: ${path}`,
    },
    modify: {
      modifying: (path: string) => `Datei wird bearbeitet: ${path}`,
      modified: (path: string) => `Datei bearbeitet: ${path}`,
      notFound: (path: string) => `Datei nicht gefunden: ${path}`,
      patternNotFound: (path: string) => `Muster nicht gefunden in: ${path}`,
    },
    append: {
      appending: (path: string) => `In Datei wird angehaengt: ${path}`,
      appended: (path: string) => `In Datei angehaengt: ${path}`,
    },
  },
  errors: {
    unknownAction: (type: string) => `Unbekannter Aktionstyp: \"${type}\"`,
    plopfileNotFound: "Keine plopfile gefunden (plopfile.js oder plopfile.ts).",
    plopfileLoadFailed: (err: string) =>
      `plopfile konnte nicht geladen werden: ${err}`,
    generatorNotFound: (name: string) =>
      `Generator \"${name}\" nicht gefunden.`,
    noGenerators: "Keine Generatoren registriert.",
    invalidPrompt: (name: string, reason: string) =>
      `Ungueltiger Prompt \"${name}\": ${reason}`,
    bypassParse: (
      promptName: string,
      promptType: string,
      value: string,
      detail?: string,
    ) =>
      `Bypass-Wert \"${value}\" konnte dem Prompt ${promptType} \"${promptName}\"${detail ? `: ${detail}` : ""} nicht zugewiesen werden.`,
    plopfileLoad: (path: string) => `Fehler beim Laden der plopfile: ${path}`,
    plopfileExport: "Die plopfile muss eine Default-Funktion exportieren.",
    userCancelled: "Prompt vom Benutzer abgebrochen.",
    plopfileNotFoundWarning:
      "Keine plopfile gefunden. Erstellen Sie eine plopfile.js im Projekt.",
    forcedLangI18nMissing: (locale: string) =>
      `Erzwungene Sprache \"${locale}\" ignoriert, da @plop-next/i18n nicht installiert ist.`,
    forcedLangUnavailable: (locale: string) =>
      `Erzwungene Sprache \"${locale}\" ist nicht verfuegbar. Fallback auf Englisch.`,
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
    optInitTitle: "Plopfile Initialisierung",
    optGenerateTitle: "Locale-, Text- und Theme- Dateien generieren",
    optOthersTitle: "Weitere Optionen",
    optInit: "Eine grundlegende plopfile.ts erzeugen",
    optInitJs: "Eine grundlegende plopfile.js erzeugen",
    optInitTs: "Eine grundlegende plopfile.ts erzeugen",
    optDemo: "Einen Demo-Generator in der plopfile erzeugen",
    optI18n: "plopfile mit i18n-Unterstuetzung initialisieren",
    optGenerate: "Ein Modell generieren: locale | texte | thema",
    optPath: "Basis-Ausgabeverzeichnis für die generierten Modell-Dateien",
    optExtension: "Generierte Dateierweiterung: ts | js | json",
    optIncludeCustomTexts:
      "Für die Locale-Generierung die übersetzbaren Schlüssel aus der plopfile einbeziehen",
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
