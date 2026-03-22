import Liftoff from "liftoff";
import v8flags from "v8flags";
import pc from "picocolors";
import { jsVariants } from "interpret";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import {
  PlopNextCore,
  ErrorHandler,
  PlopfileNotFoundWarning,
  PlopfileLoadError,
  PlopfileExportError,
  type ErrorVerbosity,
} from "@plop-next/core";
import { PlopNextRunner } from "./PlopNextRunner";

export interface CLIOptions {
  /** First positional argument: run a specific generator directly. */
  generator?: string;
  /** Override the working directory (--cwd). */
  cwd?: string;
  /** Override the plopfile path (--plopfile / -p). */
  plopfile?: string;
  /** Modules to preload before loading the plopfile (--preload). */
  preload?: string[];
  /** Show action progress spinners (--[no-]progress, default: true). */
  progress?: boolean;
  /** Base directory for generated files (--dest / -d). */
  dest?: string;
  /** Overwrite existing files (--force / -f). */
  force?: boolean;
  /** Show full action type names in output (--show-type-names). */
  showTypeNames?: boolean;
  /** Positional bypass values passed after generator name. */
  bypassPositionals?: string[];
  /** Named bypass values passed after `--` (e.g. --name value). */
  bypassNamed?: Record<string, string | boolean>;
  /** Preferred locale for fallback CLI errors when no plopfile locale is available. */
  lang?: string;
  /** Error verbosity level (simple | verbose | debug). Default: simple. */
  errorVerbosity?: ErrorVerbosity;
  /** Optional file path to log errors to. */
  errorLogFile?: string;
}

type LiftoffEnv = Liftoff.LiftoffEnv;

export class PlopNextCLI {
  private readonly liftoff: InstanceType<typeof Liftoff>;
  private readonly require = createRequire(import.meta.url);
  private errorHandler: ErrorHandler;

  constructor() {
    this.errorHandler = new ErrorHandler();
    this.liftoff = new Liftoff({
      name: "plop-next",    // sets processTitle + moduleName to "plop-next"
      configName: "plopfile",
      extensions: jsVariants as unknown as Record<string, string | null>,
      v8flags,
    });

    this.liftoff.on("respawn", (flags: string[], child: { pid: number }) => {
      console.log(pc.dim(`Detected v8 flags: ${flags.join(", ")}`));
      console.log(pc.dim(`Respawned to PID: ${child.pid}`));
    });
  }

  launch(options: CLIOptions = {}): void {
    // prepare() locates the config file and the local plop-next installation.
    this.liftoff.prepare(
      {
        cwd:        options.cwd,
        configPath: options.plopfile,
        preload:    options.preload,
      },
      (env: LiftoffEnv) => {
        // execute() handles v8flags respawn, then calls our callback.
        this.liftoff.execute(env, (_env: LiftoffEnv) => {
          void this.onExecute(_env, options);
        });
      },
    );
  }

  private async onExecute(
    env: LiftoffEnv,
    options: CLIOptions,
  ): Promise<void> {
    // Configure error handler
    if (options.errorVerbosity) this.errorHandler.setVerbosity(options.errorVerbosity);
    if (options.errorLogFile) this.errorHandler.setLogFile(options.errorLogFile);
    await this.configureFallbackErrorLocalization(options.lang);

    try {
      if (!env.configPath) {
        throw new PlopfileNotFoundWarning();
      }

      const core = new PlopNextCore();
      this.errorHandler.setTranslator((key, args, fallback) => core.t(key, args, fallback));
      core.setPlopfilePath(env.configPath);

      let plopfileMod: unknown;
      let requireError: Error | undefined;
      let importError: Error | undefined;

      try {
        // Prefer require() first so Liftoff/interpret loaders (e.g. .ts) are used.
        plopfileMod = this.require(env.configPath);
      } catch (err) {
        requireError = err instanceof Error ? err : new Error(String(err));
        try {
          // Fallback for true ESM configs. On Windows, import() needs a file URL.
          plopfileMod = await import(pathToFileURL(env.configPath).href);
        } catch (err) {
          importError = err instanceof Error ? err : new Error(String(err));
          throw new PlopfileLoadError(env.configPath, requireError, importError);
        }
      }

      // Support both ESM default export and CJS module.exports.
      const setup =
        (plopfileMod as Record<string, unknown>)?.default ?? plopfileMod;

      if (typeof setup !== "function") {
        throw new PlopfileExportError();
      }

      await (setup as (core: PlopNextCore) => void | Promise<void>)(core);

      // Apply resolved runtime theme (including user overrides from plopfile)
      // to centralized error rendering.
      this.errorHandler.setTheme(core.getTheme());

      const runner = new PlopNextRunner(core, {
        dest:          options.dest,
        force:         options.force,
        progress:      options.progress ?? true,
        showTypeNames: options.showTypeNames,
        bypassPositionals: options.bypassPositionals,
        bypassNamed: options.bypassNamed,
        errorHandler: this.errorHandler,
      });
      await runner.run(options.generator);
    } catch (error) {
      const result = this.errorHandler.handle(error);
      if (result.shouldExit) {
        process.exit(result.exitCode);
      }
      process.exitCode = result.exitCode;
    }
  }

  private async configureFallbackErrorLocalization(lang?: string): Promise<void> {
    this.errorHandler.setTranslator(undefined);

    const locale = this.normalizeLocale(lang);
    if (!locale || locale === "en") {
      return;
    }

    try {
      const { I18nRegistry } = await import("@plop-next/i18n");
      const registry = new I18nRegistry();

      if (!registry.hasLocale(locale)) {
        return;
      }

      registry.setActiveLocale(locale);
      this.errorHandler.setTranslator((key, args, fallback) => registry.t(key, args, fallback));
    } catch {
      // Keep English defaults when the optional i18n package is unavailable.
    }
  }

  private normalizeLocale(locale?: string): string | undefined {
    if (!locale) {
      return undefined;
    }

    const normalized = locale.trim().toLowerCase();
    return normalized.length > 0 ? normalized : undefined;
  }
}

