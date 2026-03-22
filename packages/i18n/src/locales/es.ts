import type { LocaleTexts } from "@plop-next/core";

/**
 * Spanish translations for plop-next built-in messages.
 * Covers the same key structure as `@plop-next/core` English messages.
 */
export const ES_MESSAGES: LocaleTexts = {
  cli: {
    welcome: "Bienvenido a plop-next! 🚀",
    welcomeMessage: null,
    selectGenerator: "Seleccione un generador",
    noGenerators:
      "No hay generadores registrados. Agreguelos en su plopfile.",
    generatorNotFound: (name: string) => `Generador \"${name}\" no encontrado.`,
    aborted: "Cancelado.",
    done: "Listo!",
    promptCancelled: "Consola cerrada por el usuario.",
  },

  inquirer: {
    confirm: {
      yesLabel: "Si",
      noLabel: "No",
      hintYes: "S/n",
      hintNo: "s/N",
    },
    select: {
      helpNavigate: "navegar",
      helpSelect: "seleccionar",
    },
    checkbox: {
      helpNavigate: "navegar",
      helpSelect: "seleccionar",
      helpSubmit: "enviar",
      helpAll: "todo",
      helpInvert: "invertir",
    },
    search: {
      helpNavigate: "navegar",
      helpSelect: "seleccionar",
    },
    password: {
      maskedText: "[entrada oculta]",
    },
  },

  actions: {
    add: {
      creating: (path: string) => `Creando ${path}`,
      created: (path: string) => `✔ Creado ${path}`,
      alreadyExists: (path: string) => `El archivo ya existe: ${path}`,
    },
    modify: {
      modifying: (path: string) => `Modificando ${path}`,
      modified: (path: string) => `✔ Modificado ${path}`,
      notFound: (path: string) => `Archivo no encontrado: ${path}`,
      patternNotFound: (path: string) =>
        `Patron no encontrado en: ${path}`,
    },
    append: {
      appending: (path: string) => `Anadiendo en ${path}`,
      appended: (path: string) => `✔ Anadido en ${path}`,
    },
  },

  errors: {
    unknownAction: (type: string) => `Tipo de accion desconocido: \"${type}\"`,
    plopfileNotFound:
      "No se pudo encontrar un plopfile (plopfile.js o plopfile.ts).",
    plopfileLoadFailed: (err: string) =>
      `Error al cargar el plopfile: ${err}`,
    generatorNotFound: (name: string) => `Generador \"${name}\" no encontrado.`,
    noGenerators:
      "No hay generadores registrados. Agreguelos en su plopfile.",
    invalidPrompt: (name: string, reason: string) =>
      `Prompt invalido \"${name}\": ${reason}`,
    bypassParse: (
      promptName: string,
      promptType: string,
      value: string,
      detail?: string,
    ) =>
      `No se puede asignar el valor de bypass \"${value}\" al prompt ${promptType} \"${promptName}\"${detail ? `: ${detail}` : ""}`,
    plopfileLoad: (path: string) => `Error al cargar el plopfile: ${path}`,
    plopfileExport: "El plopfile debe exportar una funcion por defecto.",
    userCancelled: "Prompt cancelado por el usuario.",
    plopfileNotFoundWarning:
      "No se encontro ningun plopfile. Cree un plopfile.js en su proyecto.",
    forcedLangI18nMissing: (locale: string) =>
      `La locale forzada \"${locale}\" se ignora porque @plop-next/i18n no esta instalado. Se usa ingles.`,
    forcedLangUnavailable: (locale: string) =>
      `La locale forzada \"${locale}\" no esta disponible. Se usa ingles.`,
  },

  /**
   * CLI `--help` display texts — Spanish.
   * Read-only: cannot be overridden via `registerLocale` / `registerTexts`.
   */
  help: {
    usage: "Uso:",
    usage1: "Elegir de la lista de generadores disponibles",
    usage2: "Ejecutar un generador registrado bajo este nombre",
    usage3:
      "Ejecutar el generador con datos de entrada para omitir prompts",
    options: "Opciones:",
    optHelp: "Mostrar esta ayuda",
    optShowTypeNames: "Mostrar nombres de tipo en lugar de abreviaciones",
    optInit: "Generar un plopfile.ts base",
    optInitJs: "Generar un plopfile.js base",
    optInitTs: "Generar un plopfile.ts base",
    optDemo: "Generar un generador de ejemplo en el plopfile",
    optI18n: "Inicializar el plopfile con soporte i18n",
    optVersion: "Mostrar la version actual",
    optForce: "Ejecutar el generador en modo forzado",
    optLang: "Forzar la locale de visualizacion (ej. en, es, fr)",
    danger: "el peligro espera a quienes se aventuran bajo esta linea",
    lowPlopfile: "Ruta al plopfile",
    lowCwd:
      "Directorio base para calcular rutas relativas durante la busqueda del plopfile",
    lowPreload: "Cadena o arreglo de modulos para cargar antes de plop-next",
    lowDest:
      "Escribir salida en esta carpeta en lugar de la carpeta padre del plopfile",
    lowNoProgress: "Desactivar el spinner de progreso",
    lowCompletion: "Mostrar script de completado de shell (bash|zsh|fish)",
    examples: "Ejemplos:",
  },
} as const;
