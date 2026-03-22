/**
 * Configuration for error behavior and reporting.
 */
export interface ErrorConfig {
  /** Whether this is a warning (non-fatal) or an error (fatal). */
  isWarning: boolean;
  /** Whether handling this issue should terminate the process. */
  shouldExit: boolean;
  /** Exit code to return when this error is handled. */
  exitCode: number;
  /** Whether to display the stack trace in output (depends on verbosity). */
  showStackTrace: boolean;
  /** Whether to allow logging this error to a file. */
  allowLogFile: boolean;
}

type ErrorLocale = "en" | "fr";

function detectErrorLocale(): ErrorLocale {
  const env =
    process.env["PLOP_NEXT_LOCALE"] ??
    process.env["LC_ALL"] ??
    process.env["LC_MESSAGES"] ??
    process.env["LANGUAGE"] ??
    process.env["LANG"] ??
    "en";

  return env.toLowerCase().startsWith("fr") ? "fr" : "en";
}

type ErrorMessageKey =
  | "generatorNotFound"
  | "noGenerators"
  | "invalidPrompt"
  | "bypassParse"
  | "plopfileLoad"
  | "plopfileExport"
  | "userCancelled"
  | "plopfileNotFound";

type ErrorMessageParams = {
  generatorName?: string;
  promptName?: string;
  reason?: string;
  promptType?: string;
  value?: string;
  detail?: string;
  filePath?: string;
};

function errorMessage(key: ErrorMessageKey, params: ErrorMessageParams = {}): string {
  const locale = detectErrorLocale();

  if (locale === "fr") {
    switch (key) {
      case "generatorNotFound":
        return `Generateur "${params.generatorName ?? ""}" introuvable.`;
      case "noGenerators":
        return "Aucun generateur enregistre. Ajoutez-en dans votre plopfile.";
      case "invalidPrompt":
        return `Prompt invalide "${params.promptName ?? ""}" : ${params.reason ?? ""}`;
      case "bypassParse":
        return `Impossible d'assigner la valeur de bypass "${params.value ?? ""}" au prompt ${params.promptType ?? ""} "${params.promptName ?? ""}"${params.detail ?? ""}`;
      case "plopfileLoad":
        return `Echec du chargement du plopfile : ${params.filePath ?? ""}`;
      case "plopfileExport":
        return params.reason || "Le plopfile doit exporter une fonction par defaut.";
      case "userCancelled":
        return "Prompt annule par l'utilisateur.";
      case "plopfileNotFound":
        return params.reason || "Aucun plopfile trouve. Creez un plopfile.js dans votre projet.";
    }
  }

  switch (key) {
    case "generatorNotFound":
      return `Generator "${params.generatorName ?? ""}" not found.`;
    case "noGenerators":
      return "No generators registered. Add some to your plopfile.";
    case "invalidPrompt":
      return `Invalid prompt "${params.promptName ?? ""}": ${params.reason ?? ""}`;
    case "bypassParse":
      return `Cannot assign bypass value "${params.value ?? ""}" to ${params.promptType ?? ""} prompt "${params.promptName ?? ""}"${params.detail ?? ""}`;
    case "plopfileLoad":
      return `Failed to load plopfile: ${params.filePath ?? ""}`;
    case "plopfileExport":
      return params.reason || "Plopfile must export a default function.";
    case "userCancelled":
      return "Prompt cancelled by user.";
    case "plopfileNotFound":
      return params.reason || "No plopfile found. Create a plopfile.js in your project.";
  }
}

/**
 * Base error class for plop-next errors.
 * All caught errors must extend this class for proper handling and logging.
 */
export class PlopError extends Error {
  readonly code: string;
  readonly isOperational: boolean = true;
  readonly config: ErrorConfig;

  constructor(code: string, message: string, config: ErrorConfig) {
    super(message);
    this.code = code;
    this.config = config;
    this.name = this.constructor.name;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, PlopError.prototype);
  }
}

/**
 * Generator not found error.
 */
export class GeneratorNotFoundError extends PlopError {
  constructor(generatorName: string) {
    super(
      "GENERATOR_NOT_FOUND",
      errorMessage("generatorNotFound", { generatorName }),
      {
        isWarning: false,
        shouldExit: true,
        exitCode: 1,
        showStackTrace: false,
        allowLogFile: true,
      }
    );
    Object.setPrototypeOf(this, GeneratorNotFoundError.prototype);
  }
}

/**
 * No generators registered error.
 */
export class NoGeneratorsError extends PlopError {
  constructor() {
    super(
      "NO_GENERATORS",
      errorMessage("noGenerators"),
      {
        isWarning: false,
        shouldExit: true,
        exitCode: 1,
        showStackTrace: false,
        allowLogFile: true,
      }
    );
    Object.setPrototypeOf(this, NoGeneratorsError.prototype);
  }
}

/**
 * Invalid prompt configuration error.
 */
export class InvalidPromptError extends PlopError {
  constructor(promptName: string, reason: string) {
    super(
      "INVALID_PROMPT",
      errorMessage("invalidPrompt", { promptName, reason }),
      {
        isWarning: false,
        shouldExit: true,
        exitCode: 1,
        showStackTrace: false,
        allowLogFile: true,
      }
    );
    Object.setPrototypeOf(this, InvalidPromptError.prototype);
  }
}

/**
 * Bypass value parsing error.
 */
export class BypassParseError extends PlopError {
  constructor(promptName: string, promptType: string, value: string, reason?: string) {
    const detail = reason ? `: ${reason}` : "";
    super(
      "BYPASS_PARSE_ERROR",
      errorMessage("bypassParse", { promptName, promptType, value, detail }),
      {
        isWarning: false,
        shouldExit: true,
        exitCode: 1,
        showStackTrace: false,
        allowLogFile: true,
      }
    );
    Object.setPrototypeOf(this, BypassParseError.prototype);
  }
}

/**
 * Plopfile loading error.
 */
export class PlopfileLoadError extends PlopError {
  readonly requireError?: Error;
  readonly importError?: Error;

  constructor(filePath: string, requireError?: Error, importError?: Error) {
    super(
      "PLOPFILE_LOAD_ERROR",
      errorMessage("plopfileLoad", { filePath }),
      {
        isWarning: false,
        shouldExit: true,
        exitCode: 1,
        showStackTrace: true,
        allowLogFile: true,
      }
    );
    this.requireError = requireError;
    this.importError = importError;
    Object.setPrototypeOf(this, PlopfileLoadError.prototype);
  }
}

/**
 * Invalid plopfile export error.
 */
export class PlopfileExportError extends PlopError {
  constructor(message?: string) {
    super(
      "PLOPFILE_EXPORT_ERROR",
      errorMessage("plopfileExport", { reason: message }),
      {
        isWarning: false,
        shouldExit: true,
        exitCode: 1,
        showStackTrace: false,
        allowLogFile: true,
      }
    );
    Object.setPrototypeOf(this, PlopfileExportError.prototype);
  }
}

/**
 * User cancelled the prompt (e.g., Ctrl+C).
 * This is not really an error, but treated as one for control flow.
 */
export class UserCancelledError extends PlopError {
  constructor() {
    super(
      "USER_CANCELLED",
      errorMessage("userCancelled"),
      {
        isWarning: true,
        shouldExit: true,
        exitCode: 0,
        showStackTrace: false,
        allowLogFile: false,
      }
    );
    Object.setPrototypeOf(this, UserCancelledError.prototype);
  }
}

/**
 * No plopfile found in current working directory.
 */
export class PlopfileNotFoundWarning extends PlopError {
  constructor(message?: string) {
    super(
      "PLOPFILE_NOT_FOUND",
      errorMessage("plopfileNotFound", { reason: message }),
      {
        isWarning: true,
        shouldExit: true,
        exitCode: 1,
        showStackTrace: false,
        allowLogFile: false,
      }
    );
    Object.setPrototypeOf(this, PlopfileNotFoundWarning.prototype);
  }
}
