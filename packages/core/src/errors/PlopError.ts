import { CORE_DEFAULT_TEXTS } from "../defaultTexts";

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

export interface ErrorTranslation {
  key: string;
  args?: unknown[];
  fallback: string;
}

function resolveDefaultErrorText(key: string, args: unknown[] = []): string {
  const value = (CORE_DEFAULT_TEXTS.errors as Record<string, unknown>)[key];

  if (typeof value === "function") {
    return String((value as (...params: unknown[]) => unknown)(...args));
  }

  if (typeof value === "string") {
    return value;
  }

  return key;
}

/**
 * Base error class for plop-next errors.
 * All caught errors must extend this class for proper handling and logging.
 */
export class PlopError extends Error {
  readonly code: string;
  readonly isOperational: boolean = true;
  readonly config: ErrorConfig;
  readonly translation?: ErrorTranslation;

  constructor(
    code: string,
    message: string,
    config: ErrorConfig,
    translation?: ErrorTranslation,
  ) {
    super(message);
    this.code = code;
    this.config = config;
    this.translation = translation;
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
    const args = [generatorName];
    const fallback = resolveDefaultErrorText("generatorNotFound", args);
    super(
      "GENERATOR_NOT_FOUND",
      fallback,
      {
        isWarning: false,
        shouldExit: true,
        exitCode: 1,
        showStackTrace: false,
        allowLogFile: true,
      },
      { key: "errors.generatorNotFound", args, fallback },
    );
    Object.setPrototypeOf(this, GeneratorNotFoundError.prototype);
  }
}

/**
 * No generators registered error.
 */
export class NoGeneratorsError extends PlopError {
  constructor() {
    const fallback = resolveDefaultErrorText("noGenerators");
    super(
      "NO_GENERATORS",
      fallback,
      {
        isWarning: false,
        shouldExit: true,
        exitCode: 1,
        showStackTrace: false,
        allowLogFile: true,
      },
      { key: "errors.noGenerators", fallback },
    );
    Object.setPrototypeOf(this, NoGeneratorsError.prototype);
  }
}

/**
 * Invalid prompt configuration error.
 */
export class InvalidPromptError extends PlopError {
  constructor(promptName: string, reason: string) {
    const args = [promptName, reason];
    const fallback = resolveDefaultErrorText("invalidPrompt", args);
    super(
      "INVALID_PROMPT",
      fallback,
      {
        isWarning: false,
        shouldExit: true,
        exitCode: 1,
        showStackTrace: false,
        allowLogFile: true,
      },
      { key: "errors.invalidPrompt", args, fallback },
    );
    Object.setPrototypeOf(this, InvalidPromptError.prototype);
  }
}

/**
 * Bypass value parsing error.
 */
export class BypassParseError extends PlopError {
  constructor(promptName: string, promptType: string, value: string, reason?: string) {
    const args = [promptName, promptType, value, reason];
    const fallback = resolveDefaultErrorText("bypassParse", args);
    super(
      "BYPASS_PARSE_ERROR",
      fallback,
      {
        isWarning: false,
        shouldExit: true,
        exitCode: 1,
        showStackTrace: false,
        allowLogFile: true,
      },
      { key: "errors.bypassParse", args, fallback },
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
    const args = [filePath];
    const fallback = resolveDefaultErrorText("plopfileLoad", args);
    super(
      "PLOPFILE_LOAD_ERROR",
      fallback,
      {
        isWarning: false,
        shouldExit: true,
        exitCode: 1,
        showStackTrace: true,
        allowLogFile: true,
      },
      { key: "errors.plopfileLoad", args, fallback },
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
    const fallback = message ?? resolveDefaultErrorText("plopfileExport");
    super(
      "PLOPFILE_EXPORT_ERROR",
      fallback,
      {
        isWarning: false,
        shouldExit: true,
        exitCode: 1,
        showStackTrace: false,
        allowLogFile: true,
      },
      message ? undefined : { key: "errors.plopfileExport", fallback },
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
    const fallback = resolveDefaultErrorText("userCancelled");
    super(
      "USER_CANCELLED",
      fallback,
      {
        isWarning: true,
        shouldExit: true,
        exitCode: 0,
        showStackTrace: false,
        allowLogFile: false,
      },
      { key: "errors.userCancelled", fallback },
    );
    Object.setPrototypeOf(this, UserCancelledError.prototype);
  }
}

/**
 * No plopfile found in current working directory.
 */
export class PlopfileNotFoundWarning extends PlopError {
  constructor(message?: string) {
    const fallback = message ?? resolveDefaultErrorText("plopfileNotFoundWarning");
    super(
      "PLOPFILE_NOT_FOUND",
      fallback,
      {
        isWarning: true,
        shouldExit: true,
        exitCode: 1,
        showStackTrace: false,
        allowLogFile: false,
      },
      message ? undefined : { key: "errors.plopfileNotFoundWarning", fallback },
    );
    Object.setPrototypeOf(this, PlopfileNotFoundWarning.prototype);
  }
}
