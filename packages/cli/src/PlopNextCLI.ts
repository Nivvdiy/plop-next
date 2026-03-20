import Liftoff from "liftoff";
import v8flags from "v8flags";
import pc from "picocolors";
import { jsVariants } from "interpret";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { PlopNextCore } from "@plop-next/core";
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
}

type LiftoffEnv = Liftoff.LiftoffEnv;

export class PlopNextCLI {
  private readonly liftoff: InstanceType<typeof Liftoff>;
  private readonly require = createRequire(import.meta.url);

  constructor() {
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
    if (!env.configPath) {
      console.error(
        pc.red("✖ No plopfile found. Create a plopfile.js in your project."),
      );
      process.exitCode = 1;
      return;
    }

    const core = new PlopNextCore();
    core.setPlopfilePath(env.configPath);

    let plopfileMod: unknown;
    try {
      // Prefer require() first so Liftoff/interpret loaders (e.g. .ts) are used.
      plopfileMod = this.require(env.configPath);
    } catch (requireError) {
      try {
        // Fallback for true ESM configs. On Windows, import() needs a file URL.
        plopfileMod = await import(pathToFileURL(env.configPath).href);
      } catch (importError) {
        const requireMessage =
          requireError instanceof Error ? requireError.message : String(requireError);
        const importMessage =
          importError instanceof Error ? importError.message : String(importError);
        console.error(pc.red(`✖ Failed to load plopfile: ${env.configPath}`));
        console.error(pc.dim(`  require(): ${requireMessage}`));
        console.error(pc.dim(`  import(): ${importMessage}`));
        process.exitCode = 1;
        return;
      }
    }

    // Support both ESM default export and CJS module.exports.
    const setup =
      (plopfileMod as Record<string, unknown>)?.default ?? plopfileMod;

    if (typeof setup !== "function") {
      console.error(pc.red("✖ Plopfile must export a default function."));
      process.exitCode = 1;
      return;
    }

    await (setup as (core: PlopNextCore) => void | Promise<void>)(core);

    const runner = new PlopNextRunner(core, {
      dest:          options.dest,
      force:         options.force,
      progress:      options.progress ?? true,
      showTypeNames: options.showTypeNames,
      bypassPositionals: options.bypassPositionals,
      bypassNamed: options.bypassNamed,
    });
    await runner.run(options.generator);
  }
}

