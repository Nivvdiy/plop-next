const it = {
  cli: {
    title: "Benvenuti su Plop-Next! 🚀",
    welcomeMessage:
      "Questa interfaccia è una demo delle capacità di PlopNext. Seleziona un generatore per vedere come può creare codice basato sulle tue risposte.",
    selectGenerator: "Seleziona un generatore",
    noGenerators: "Nessun generatore registrato. Aggiungilo nel tuo plopfile.",
    generatorNotFound: (name: string) => `Generatore "${name}" non trovato.`,
    aborted: "Annullato.",
    done: "Completato!",
    promptCancelled: "Console chiusa dall'utente.",
  },
  inquirer: {
    confirm: {
      yesLabel: "Si",
      noLabel: "No",
      hintYes: "S/n",
      hintNo: "s/N",
    },
    select: {
      helpNavigate: "navigare",
      helpSelect: "selezionare",
    },
    checkbox: {
      helpNavigate: "navigare",
      helpSelect: "selezionare",
      helpSubmit: "inviare",
      helpAll: "tutti",
      helpInvert: "invertire",
    },
    search: {
      helpNavigate: "navigare",
      helpSelect: "selezionare",
    },
    editor: {
      waitingMessage: (enterKey: any) => `Premi ${enterKey} per avviare il tuo editor preferito.`,
    },
    password: {
      maskedText: "[input nascosto]",
    },
  },
  actions: {
    add: {
      creating: (path: string) => `Creazione file in corso: ${path}`,
      created: (path: string) => `File creato: ${path}`,
      alreadyExists: (path: string) => `Il file esiste gia: ${path}`,
    },
    modify: {
      modifying: (path: string) => `Modifica file in corso: ${path}`,
      modified: (path: string) => `File modificato: ${path}`,
      notFound: (path: string) => `File non trovato: ${path}`,
      patternNotFound: (path: string) => `Pattern non trovato in: ${path}`,
    },
    append: {
      appending: (path: string) => `Append in corso: ${path}`,
      appended: (path: string) => `Append completato: ${path}`,
    },
  },
  errors: {
    unknownAction: (type: string) => `Tipo azione sconosciuto: "${type}"`,
    plopfileNotFound: (path: string) => `Impossibile trovare un plopfile: ${path}`,
    plopfileLoadFailed: (err: string) => `Caricamento del plopfile non riuscito: ${err}`,
    generatorNotFound: (name: string) => `Generatore "${name}" non trovato.`,
    noGenerators: "Nessun generatore registrato.",
    invalidPrompt: (name: string, reason: string) => `Prompt non valido "${name}": ${reason}`,
    bypassParse: (promptName: string, promptType: string, value: string, detail?: string) =>
      `Impossibile assegnare il valore bypass "${value}" al prompt ${promptType} "${promptName}"${detail ? `: ${detail}` : ""}.`,
    plopfileLoad: (path: string) => `Errore durante il caricamento del plopfile: ${path}`,
    plopfileExport: "Il plopfile deve esportare una funzione di default.",
    userCancelled: "Prompt annullato dall'utente.",
    plopfileNotFoundWarning:
      "Nessun plopfile trovato. Crea un plopfile.js nel progetto.",
    forcedLangI18nMissing: (locale: string) =>
      `Lingua forzata "${locale}" ignorata perché @plop-next/i18n non è installato.`,
    forcedLangUnavailable: (locale: string) =>
      `Lingua forzata "${locale}" non disponibile. Fallback su inglese.`,
  },
  help: {
    usage: "Utilizzo:",
    usage1: "Scegli dalla lista dei generatori disponibili",
    usage2: "Esegui un generatore registrato con questo nome",
    usage3: "Esegui il generatore con dati in input per saltare i prompt",
    options: "Opzioni:",
    optHelp: "Mostra questo aiuto",
    optShowTypeNames: "Mostra i nomi dei tipi invece delle abbreviazioni",
    optInitTitle: "Inizializzazione del Plopfile",
    optGenerateTitle: "Genera file Locale, Testi, Tema",
    optOthersTitle: "Altre opzioni",
    optInit: "Genera un plopfile.ts base",
    optInitJs: "Genera un plopfile.js base",
    optInitTs: "Genera un plopfile.ts base",
    optDemo: "Genera un generatore demo nel plopfile",
    optI18n: "Inizializza il plopfile con supporto i18n",
    optVersion: "Mostra la versione corrente",
    optGenerate: "Genera un modello: locale | testi | tema",
    optPath: "Cartella di output di base per i file modello generati",
    optExtension: "Estensione del file generato: ts | js | json",
    optIncludeCustomTexts:
      "Per la generazione della locale, includi le chiavi traducibili dal plopfile",
    optForce: "Esegui il generatore in modalità force",
    optLang: "Forza la lingua di visualizzazione (es. en, it, fr)",
    danger: "il pericolo attende chi supera questa linea",
    lowPlopfile: "Percorso del plopfile",
    lowCwd:
      "Cartella base per calcolare percorsi relativi durante la ricerca del plopfile",
    lowPreload: "Stringa o array di moduli da caricare prima di plop-next",
    lowDest:
      "Scrive l'output in questa cartella invece della cartella padre del plopfile",
    lowNoProgress: "Disattiva lo spinner di avanzamento",
    examples: "Esempi:",
  },
  "react-component": {
    generator: {
      name: "Componente React",
      description: "Genera un componente React con test (usando template .hbs)",
    },
    componentName: {
      message: "Nome del componente (PascalCase)?",
    },
    description: {
      message: "Descrizione del componente?",
    },
    componentType: {
      message: "Tipo di componente?",
      choices: {
        button: "bottone",
        card: "scheda",
        modal: "modale",
        form: "form",
        layout: "layout",
      },
    },
    author: {
      message: "Nome autore?",
    },
    hasStorybook: {
      message: "Aggiungere supporto Storybook?",
    },
  },
  "typescript-utility": {
    generator: {
      name: "Utility TypeScript",
      description:
        "Genera una funzione utility TypeScript (usando template .hbs)",
    },
    utilityName: {
      message: "Nome funzione utility (camelCase)?",
    },
    description: {
      message: "Cosa fa questa utility?",
    },
    category: {
      message: "Categoria?",
      choices: {
        string: "stringa",
        array: "array",
        object: "oggetto",
        math: "matematica",
        validation: "validazione",
        formatting: "formattazione",
        async: "asincrono",
      },
    },
    inputType: {
      message: "Tipo parametro di input?",
    },
    returnType: {
      message: "Tipo di ritorno?",
    },
    includeTypes: {
      message: "Includere tipi/interfacce TypeScript?",
    },
    includeAsync: {
      message: "Generare anche una versione async?",
    },
    includeValidation: {
      message: "Includere funzione di validazione?",
    },
  },
  "backend-service": {
    generator: {
      name: "Servizio Backend",
      description:
        "Genera un servizio backend con metodi (usando template .hbs)",
    },
    serviceName: {
      message: "Nome del servizio (PascalCase)?",
    },
    description: {
      message: "Descrizione del servizio?",
    },
    featureName: {
      message: "Nome feature o dominio?",
    },
    environment: {
      message: "Ambiente di destinazione?",
      choices: {
        development: "sviluppo",
        staging: "staging",
        production: "produzione",
      },
    },
  },
  "demo-all-prompts": {
    generator: {
      name: "Demo Tutti i Prompt",
      description: "Demo che mostra tutti i tipi di prompt e funzionalita",
    },
    projectName: {
      message: "Nome progetto?",
    },
    generateTests: {
      message: "Generare file di test?",
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
      message: "Quali funzionalita includere?",
      choices: {
        typescript: "TypeScript",
        eslint: "ESLint",
        prettier: "Prettier",
        husky: "Git Hooks",
        "github-actions": "CI/CD",
      },
    },
    confirmGeneration: {
      message: "Pronto a generare?",
      choices: {
        yes: "Si, genera ora",
        no: "No, fammi rivedere",
        config: "Mostra configurazione",
      },
    },
  },
  "test-file": {
    generator: {
      name: "File di Test",
      description:
        "Genera un file di test specializzato con i dati delle risposte",
    },
    testName: {
      message: "Nome file di test?",
    },
    testFramework: {
      message: "Framework di test?",
      choices: {
        vitest: "vitest",
        jest: "jest",
        mocha: "mocha",
      },
    },
    testTypes: {
      message: "Cosa vuoi testare?",
      choices: {
        unit: "Test unitari",
        integration: "Test di integrazione",
        e2e: "Test E2E",
      },
    },
    author: {
      message: "Nome autore?",
    },
  },
} as const;

export { it };
