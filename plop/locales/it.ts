const Local = {
  cli: {
    welcome: "Benvenuti su Plop-Next! 🚀",
    welcomeMessage: null,
    selectGenerator: "Seleziona un generatore",
    noGenerators: "Nessun generatore registrato. Aggiungilo nel tuo plopfile.",
    generatorNotFound: "Generatore non trovato.",
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
      waitingMessage: "Premi Enter per avviare il tuo editor preferito.",
    },
    password: {
      maskedText: "[input nascosto]",
    },
  },
  actions: {
    add: {
      creating: "Creazione file in corso",
      created: "File creato",
      alreadyExists: "Il file esiste gia",
    },
    modify: {
      modifying: "Modifica file in corso",
      modified: "File modificato",
      notFound: "File non trovato",
      patternNotFound: "Pattern non trovato",
    },
    append: {
      appending: "Append in corso",
      appended: "Append completato",
    },
  },
  errors: {
    unknownAction: "Tipo azione sconosciuto.",
    plopfileNotFound:
      "Impossibile trovare un plopfile (plopfile.js o plopfile.ts).",
    plopfileLoadFailed: "Caricamento del plopfile non riuscito.",
    generatorNotFound: "Generatore non trovato.",
    noGenerators: "Nessun generatore registrato.",
    invalidPrompt: "Prompt non valido.",
    bypassParse: "Impossibile assegnare il valore bypass al prompt.",
    plopfileLoad: "Errore durante il caricamento del plopfile.",
    plopfileExport: "Il plopfile deve esportare una funzione di default.",
    userCancelled: "Prompt annullato dall'utente.",
    plopfileNotFoundWarning:
      "Nessun plopfile trovato. Crea un plopfile.js nel progetto.",
    forcedLangI18nMissing:
      "Lingua forzata ignorata perche @plop-next/i18n non e installato.",
    forcedLangUnavailable:
      "Lingua forzata non disponibile. Fallback su inglese.",
  },
  help: {
    usage: "Utilizzo:",
    usage1: "Scegli dalla lista dei generatori disponibili",
    usage2: "Esegui un generatore registrato con questo nome",
    usage3: "Esegui il generatore con dati in input per saltare i prompt",
    options: "Opzioni:",
    optHelp: "Mostra questo aiuto",
    optShowTypeNames: "Mostra i nomi dei tipi invece delle abbreviazioni",
    optInit: "Genera un plopfile.ts base",
    optInitJs: "Genera un plopfile.js base",
    optInitTs: "Genera un plopfile.ts base",
    optDemo: "Genera un generatore demo nel plopfile",
    optI18n: "Inizializza il plopfile con supporto i18n",
    optVersion: "Mostra la versione corrente",
    optForce: "Esegui il generatore in modalita force",
    optLang: "Forza la lingua di visualizzazione (es. en, it, fr)",
    danger: "il pericolo attende chi supera questa linea",
    lowPlopfile: "Percorso del plopfile",
    lowCwd:
      "Cartella base per calcolare percorsi relativi durante la ricerca del plopfile",
    lowPreload: "Stringa o array di moduli da caricare prima di plop-next",
    lowDest:
      "Scrive l'output in questa cartella invece della cartella padre del plopfile",
    lowNoProgress: "Disattiva lo spinner di avanzamento",
    lowCompletion: "Mostra lo script di completamento shell (bash|zsh|fish)",
    examples: "Esempi:",
  },
  generators: {
    "react-component": {
      description: "Genera un componente React con test (usando template .hbs)",
    },
    "typescript-utility": {
      description:
        "Genera una funzione utility TypeScript (usando template .hbs)",
    },
    "backend-service": {
      description:
        "Genera un servizio backend con metodi (usando template .hbs)",
    },
    "demo-all-prompts": {
      description: "Demo che mostra tutti i tipi di prompt e funzionalita",
    },
    "test-file": {
      description:
        "Genera un file di test specializzato con i dati delle risposte",
    },
  },
  "react-component": {
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

export default Local;
