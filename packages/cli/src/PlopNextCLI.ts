import Liftoff from "liftoff";
import v8flags from "v8flags";
import pc from "picocolors";
import { jsVariants } from "interpret";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PlopNextCore,
  ErrorHandler,
  PlopfileNotFoundWarning,
  PlopfileLoadError,
  PlopfileExportError,
  ForcedLangFallbackWarning,
  type ForcedLangFallbackReason,
  type ErrorVerbosity,
  type UnknownRecord,
} from "@plop-next/core";
import { PlopNextRunner } from "./PlopNextRunner";
import {
  buildLocaleTemplateSource,
  buildLocaleTemplateData,
  buildTextsTemplateSource,
  buildTextsTemplateData,
  buildThemeTemplateSource,
  buildThemeTemplateData,
} from "./templateScaffolds";

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
  /** Preferred locale for CLI errors and runtime i18n override when available. */
  lang?: string;
  /** Error verbosity level (simple | verbose | debug). Default: simple. */
  errorVerbosity?: ErrorVerbosity;
  /** Optional file path to log errors to. */
  errorLogFile?: string;
  /** Generate template mode: locale | texts | theme. */
  generateMode?: string;
  /** Locale tag argument used by locale/texts generation (e.g. "de"). */
  generateLocale?: string;
  /** Base output directory for generated files. */
  path?: string;
  /** Generated file extension for template scaffolding: ts | js | json. */
  extension?: string;
  /** For locale generation, include plopfile custom translatable texts. */
  includeCustomTexts?: boolean;
}

type LiftoffEnv = Liftoff.LiftoffEnv;
type RespawnChild = {
  pid: number;
};

export class PlopNextCLI {
  private readonly liftoff: InstanceType<typeof Liftoff>;
  private readonly require = createRequire(import.meta.url);
  private errorHandler: ErrorHandler;
  private forcedLangWarningShown = false;

  constructor() {
    this.errorHandler = new ErrorHandler();
    this.liftoff = new Liftoff({
      name: "plop-next",    // sets processTitle + moduleName to "plop-next"
      configName: "plopfile",
      extensions: jsVariants as unknown as Record<string, string | null>,
      v8flags,
    });

    this.liftoff.on("respawn", (flags: string[], child: RespawnChild) => {
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
    this.forcedLangWarningShown = false;

    // Configure error handler
    if (options.errorVerbosity) this.errorHandler.setVerbosity(options.errorVerbosity);
    if (options.errorLogFile) this.errorHandler.setLogFile(options.errorLogFile);
    await this.configureFallbackErrorLocalization(options.lang);

    try {
      const generateMode = this.normalizeGenerateMode(options.generateMode);
      const shouldGenerateTemplates =
        typeof generateMode !== "undefined";

      const requiresPlopfile =
        shouldGenerateTemplates !== true ||
        generateMode === "texts" ||
        (generateMode === "locale" && options.includeCustomTexts === true);

      let core: PlopNextCore | undefined;

      if (env.configPath) {
        const loadedCore = new PlopNextCore();
        core = loadedCore;
        this.errorHandler.setTranslator((key, args, fallback) => loadedCore.t(key, args, fallback));
        loadedCore.setWarningReporter((warning) => {
          this.errorHandler.handle(warning);
        });
        loadedCore.setPlopfilePath(env.configPath);

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
          } catch (importErr) {
            importError =
              importErr instanceof Error
                ? importErr
                : new Error(String(importErr));
            throw new PlopfileLoadError(env.configPath, requireError, importError);
          }
        }

        // Support both ESM default export and CJS module.exports.
        const setup =
          (plopfileMod as UnknownRecord)?.default ?? plopfileMod;

        if (typeof setup !== "function") {
          throw new PlopfileExportError();
        }

        await (setup as (nextCore: PlopNextCore) => void | Promise<void>)(loadedCore);
        await this.applyLangOverride(loadedCore, options.lang, env.configPath);

        // Apply resolved runtime theme (including user overrides from plopfile)
        // to centralized error rendering.
        this.errorHandler.setTheme(loadedCore.getTheme());
      } else if (requiresPlopfile) {
        throw new PlopfileNotFoundWarning();
      }

      if (shouldGenerateTemplates) {
        await this.generateTemplates(generateMode as "locale" | "texts" | "theme", core, options, env);
        return;
      }

      if (!core) {
        throw new PlopfileNotFoundWarning();
      }

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

  private async generateTemplates(
    mode: "locale" | "texts" | "theme",
    core: PlopNextCore | undefined,
    options: CLIOptions,
    env: LiftoffEnv,
  ): Promise<void> {
    const force = options.force === true;
    const defaultBasePath = options.cwd ?? env.cwd ?? process.cwd();
    const basePath = resolve(defaultBasePath, options.path ?? ".");
    const fileExtension = this.normalizeGenerateExtension(options.extension);

    if (options.includeCustomTexts && mode !== "locale") {
      throw new Error(
        `--include-custom-texts is only valid with --generate locale.`,
      );
    }

    if (mode === "locale") {
      const localeTag = this.normalizeLocale(options.generateLocale);
      if (!localeTag) {
        throw new Error(
          `Missing locale argument. Usage: plop-next --generate locale <locale> [--path <dir>] [--include-custom-texts]`,
        );
      }

      const localesDir = resolve(basePath, "locales");
      const localeFile = resolve(
        localesDir,
        `${localeTag}.locale.${fileExtension}`,
      );

      if (options.includeCustomTexts && !core) {
        throw new PlopfileNotFoundWarning();
      }

      if (existsSync(localeFile) && !force) {
        throw new Error(
          `Locale template already exists: ${localeFile}. Use --force to overwrite it.`,
        );
      }

      mkdirSync(localesDir, { recursive: true });
      writeFileSync(
        localeFile,
        this.buildLocaleTemplateContent(fileExtension, localeTag, {
          includePlopfileTexts: options.includeCustomTexts,
          core,
        }),
        "utf8",
      );

      console.log(pc.green(`✔ Created locale template: ${localeFile}`));
    }

    if (mode === "texts") {
      if (!core) {
        throw new PlopfileNotFoundWarning();
      }

      const localeTag = this.normalizeLocale(options.generateLocale);
      if (!localeTag) {
        throw new Error(
          `Missing locale argument. Usage: plop-next --generate texts <locale> [--path <dir>]`,
        );
      }

      const localesDir = resolve(basePath, "locales");
      const textsFile = resolve(
        localesDir,
        `${localeTag}.texts.${fileExtension}`,
      );

      if (existsSync(textsFile) && !force) {
        throw new Error(
          `Texts template already exists: ${textsFile}. Use --force to overwrite it.`,
        );
      }

      mkdirSync(localesDir, { recursive: true });
      writeFileSync(
        textsFile,
        this.buildTextsTemplateContent(fileExtension, localeTag, core),
        "utf8",
      );

      console.log(pc.green(`✔ Created texts template: ${textsFile}`));
    }

    if (mode === "theme") {
      const themeFile = resolve(basePath, `theme.${fileExtension}`);

      if (existsSync(themeFile) && !force) {
        throw new Error(
          `Theme template already exists: ${themeFile}. Use --force to overwrite it.`,
        );
      }

      mkdirSync(basePath, { recursive: true });
      writeFileSync(themeFile, this.buildThemeTemplateContent(fileExtension), "utf8");

      console.log(pc.green(`✔ Created theme template: ${themeFile}`));
    }
  }

  private normalizeGenerateExtension(
    extension?: string,
  ): "ts" | "js" | "json" {
    if (!extension) {
      return "ts";
    }

    const normalized = extension.trim().toLowerCase();
    if (normalized === "ts" || normalized === "js" || normalized === "json") {
      return normalized;
    }

    throw new Error(
      `Unknown extension "${extension}". Supported values: ts, js, json.`,
    );
  }

  private buildLocaleTemplateContent(
    extension: "ts" | "js" | "json",
    localeTag: string,
    options: {
      includePlopfileTexts?: boolean;
      core?: PlopNextCore;
    },
  ): string {
    if (extension === "ts") {
      return buildLocaleTemplateSource(options);
    }

    const localeData = buildLocaleTemplateData(options);
    if (extension === "json") {
      return `${JSON.stringify({ [localeTag]: localeData }, null, 2)}\n`;
    }

    return [
      `const ${localeTag.toUpperCase().replace(/[^A-Z0-9]/g, "_")} = ${JSON.stringify(localeData, null, 2)};`,
      "",
      `module.exports = { ${JSON.stringify(localeTag)}: ${localeTag.toUpperCase().replace(/[^A-Z0-9]/g, "_")} };`,
      "",
    ].join("\n");
  }

  private buildTextsTemplateContent(
    extension: "ts" | "js" | "json",
    localeTag: string,
    core: PlopNextCore,
  ): string {
    if (extension === "ts") {
      return buildTextsTemplateSource(core);
    }

    const textsData = buildTextsTemplateData(core);
    if (extension === "json") {
      return `${JSON.stringify({ [localeTag]: textsData }, null, 2)}\n`;
    }

    return [
      `const ${localeTag.toUpperCase().replace(/[^A-Z0-9]/g, "_")} = ${JSON.stringify(textsData, null, 2)};`,
      "",
      `module.exports = { ${JSON.stringify(localeTag)}: ${localeTag.toUpperCase().replace(/[^A-Z0-9]/g, "_")} };`,
      "",
    ].join("\n");
  }

  private buildThemeTemplateContent(
    extension: "ts" | "js" | "json",
  ): string {
    if (extension === "ts") {
      return buildThemeTemplateSource();
    }

    const themeData = buildThemeTemplateData();
    if (extension === "json") {
      return `${JSON.stringify(themeData, null, 2)}\n`;
    }

    return `module.exports = ${JSON.stringify(themeData, null, 2)};\n`;
  }

  private normalizeGenerateMode(
    mode?: string,
  ): "locale" | "texts" | "theme" | undefined {
    if (!mode) {
      return undefined;
    }

    const normalized = mode.trim().toLowerCase();

    if (normalized === "locale" || normalized === "locales") {
      return "locale";
    }

    if (normalized === "text" || normalized === "texts") {
      return "texts";
    }

    if (normalized === "theme") {
      return "theme";
    }

    throw new Error(
      `Unknown generate mode "${mode}". Supported values: locale, texts, theme.`,
    );
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
        this.warnForcedLangFallback(locale, "locale-not-found");
        return;
      }

      registry.setActiveLocale(locale);
      this.errorHandler.setTranslator((key, args, fallback) => registry.t(key, args, fallback));
    } catch {
      this.warnForcedLangFallback(locale, "i18n-missing");
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

  private async applyLangOverride(
    core: PlopNextCore,
    lang: string | undefined,
    configPath: string,
  ): Promise<void> {
    const locale = this.normalizeLocale(lang);
    if (!locale) {
      return;
    }

    // Only override plopfile-configured locale if @plop-next/i18n is installed
    // in the target project environment.
    if (!this.isI18nInstalledForProject(configPath)) {
      this.warnForcedLangFallback(locale, "i18n-missing");
      return;
    }

    if (!core.hasLocale(locale)) {
      this.warnForcedLangFallback(locale, "locale-not-found");
      core.setLocale("en");
      return;
    }

    core.setLocale(locale);
  }

  private isI18nInstalledForProject(configPath: string): boolean {
    try {
      const projectRequire = createRequire(pathToFileURL(configPath).href);
      projectRequire.resolve("@plop-next/i18n");
      return true;
    } catch {
      return false;
    }
  }

  private warnForcedLangFallback(
    locale: string,
    reason: ForcedLangFallbackReason,
  ): void {
    if (this.forcedLangWarningShown) {
      return;
    }

    this.forcedLangWarningShown = true;

    this.errorHandler.handle(new ForcedLangFallbackWarning(locale, reason));
  }
}

