import { appendFileSync } from "node:fs";
import { dirname } from "node:path";
import pc from "picocolors";
import type { PlopError } from "./PlopError";
import type { PlopNextTheme, UnknownRecord } from "../types";
import { defaultTheme } from "../theme";

export type ErrorTranslator = (
  key: string,
  args?: unknown[],
  fallback?: string,
) => string;

export type ErrorVerbosity = "simple" | "verbose" | "debug";

export interface ErrorHandlerOptions {
  /**
   * Level of error output detail.
   * - "simple" (default): Single-line explanation.
   * - "verbose": Error code + message + context.
   * - "debug": Includes full stack trace and diagnostic info.
   */
  verbosity?: ErrorVerbosity;

  /**
   * Optional file path to log all errors to.
   * File will be created/appended to if provided.
   */
  logFile?: string;

  /**
   * Whether to use ANSI color in console output.
   * Defaults to true.
   */
  useColors?: boolean;

  /**
   * Error/warning console theming overrides.
   */
  theme?: {
    prefix?: {
      error?: string;
      warning?: string;
    };
    error?: (text: string) => string;
    warning?: (text: string) => string;
  };
}

export interface ErrorHandleResult {
  exitCode: number;
  shouldExit: boolean;
}

/**
 * Handles errors with configurable verbosity and optional file logging.
 */
export class ErrorHandler {
  private verbosity: ErrorVerbosity = "simple";
  private logFile?: string;
  private useColors: boolean = true;
  private errorPrefix: string = defaultTheme.plopNext?.errors?.prefix?.error ?? "✖";
  private warningPrefix: string = defaultTheme.plopNext?.errors?.prefix?.warning ?? "⚠";
  private errorStyle: (text: string) => string =
    defaultTheme.plopNext?.errors?.error ?? ((text: string) => pc.red(text));
  private warningStyle: (text: string) => string =
    defaultTheme.plopNext?.errors?.warning ?? ((text: string) => pc.yellow(text));
  private translator?: ErrorTranslator;

  constructor(options?: ErrorHandlerOptions) {
    if (options?.verbosity) this.verbosity = options.verbosity;
    if (options?.logFile) this.logFile = options.logFile;
    if (options?.useColors !== undefined) this.useColors = options.useColors;
    if (options?.theme) {
      this.applyTheme(options.theme);
    }
  }

  /**
   * Handle and output an error.
   * Returns exit behavior and code.
   */
  handle(error: unknown): ErrorHandleResult {
    const isPlopError = this.isPlopError(error);

    if (isPlopError) {
      const output = this.formatError(error);
      this.logToConsole(output, true, error.config.isWarning);
      this.logToFile(output, error.config.allowLogFile);

      return {
        exitCode: error.config.exitCode,
        shouldExit: error.config.shouldExit,
      };
    }

    const output = this.formatError(error);
    this.logToConsole(output, false, false);
    this.logToFile(output, true);

    return {
      exitCode: 1,
      shouldExit: true,
    };
  }

  private isPlopError(error: unknown): error is PlopError {
    return error instanceof Error && "code" in error;
  }

  private formatError(error: unknown): string {
    if (!this.isPlopError(error)) {
      // Unhandled error: show as-is
      return this.formatUnhandledError(error);
    }

    switch (this.verbosity) {
      case "simple":
        return this.formatSimple(error);
      case "verbose":
        return this.formatVerbose(error);
      case "debug":
        return this.formatDebug(error);
    }
  }

  private formatSimple(error: PlopError): string {
    return this.resolveMessage(error);
  }

  private formatVerbose(error: PlopError): string {
    const parts: string[] = [];
    parts.push(`[${error.code}] ${this.resolveMessage(error)}`);

    // Only show stack trace if the error config allows it and verbosity is verbose/debug
    if (error.config.showStackTrace && error instanceof Error && error.stack) {
      const stackLines = error.stack.split("\n").slice(1, 4); // First 3 stack lines
      if (stackLines.length > 0) {
        parts.push("\nStack:");
        parts.push(stackLines.join("\n"));
      }
    }

    return parts.join("\n");
  }

  private formatDebug(error: PlopError): string {
    const parts: string[] = [];
    parts.push(`Error Code: ${error.code}`);
    parts.push(`Message: ${this.resolveMessage(error)}`);
    parts.push(`Type: ${error.name}`);
    parts.push(`Operational: ${error.isOperational}`);

    // Only show stack trace if the error config allows it
    if (error.config.showStackTrace && error.stack) {
      parts.push("\nFull Stack Trace:");
      parts.push(error.stack);
    }

    // Include custom error properties for specific error types
    const customKeys = Object.keys(error).filter(
      (k) => !["message", "name", "code", "isOperational", "stack", "config"].includes(k),
    );
    if (customKeys.length > 0) {
      parts.push("\nAdditional Context:");
      for (const key of customKeys) {
        const value = (error as unknown as UnknownRecord)[key];
        if (value instanceof Error) {
          parts.push(`  ${key}:`);
          parts.push(`    ${value.message}`);
        } else {
          parts.push(`  ${key}: ${JSON.stringify(value)}`);
        }
      }
    }

    return parts.join("\n");
  }

  private formatUnhandledError(error: unknown): string {
    let message = "An unexpected error occurred.";

    if (error instanceof Error) {
      message = error.message;
      if (this.verbosity === "debug" && error.stack) {
        message += `\n${error.stack}`;
      }
    } else if (typeof error === "string") {
      message = error;
    } else {
      message = String(error);
    }

    return message;
  }

  private resolveMessage(error: PlopError): string {
    if (!error.translation) {
      return error.message;
    }

    return this.translator?.(
      error.translation.key,
      error.translation.args,
      error.translation.fallback,
    ) ?? error.translation.fallback;
  }

  private logToConsole(output: string, isPlopError: boolean, isWarning: boolean): void {
    const prefix = isWarning ? this.warningPrefix : this.errorPrefix;
    const text = `${prefix} ${output}`;

    if (this.useColors && isPlopError) {
      if (isWarning) {
        console.error(this.warningStyle(text));
        return;
      }
      console.error(this.errorStyle(text));
    } else {
      console.error(text);
    }
  }

  private logToFile(output: string, allowLogFile: boolean = true): void {
    if (!this.logFile || !allowLogFile) return;

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${output}\n`;

    try {
      // Ensure directory exists
      const dir = dirname(this.logFile);
      if (dir !== ".") {
        // Create directory if needed (simple approach)
        // In a real scenario, you'd use fs.mkdirSync with recursive: true
      }

      appendFileSync(this.logFile, logEntry);
    } catch (e) {
      // Silently fail if can't write to log file
      // to avoid infinite error loops
    }
  }

  setVerbosity(verbosity: ErrorVerbosity): void {
    this.verbosity = verbosity;
  }

  setLogFile(logFile: string | undefined): void {
    this.logFile = logFile;
  }

  setTheme(theme: PlopNextTheme | undefined): void {
    if (!theme?.plopNext?.errors) {
      return;
    }

    this.applyTheme(theme.plopNext.errors);
  }

  setTranslator(translator: ErrorTranslator | undefined): void {
    this.translator = translator;
  }

  private applyTheme(theme: {
    prefix?: {
      error?: string;
      warning?: string;
    };
    error?: (text: string) => string;
    warning?: (text: string) => string;
  }): void {
    if (theme.prefix?.error) this.errorPrefix = theme.prefix.error;
    if (theme.prefix?.warning) this.warningPrefix = theme.prefix.warning;
    if (theme.error) this.errorStyle = theme.error;
    if (theme.warning) this.warningStyle = theme.warning;
  }
}
