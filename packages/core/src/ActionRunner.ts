import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve, isAbsolute, relative, basename } from "node:path";
import { glob } from "tinyglobby";
import type { ActionConfig } from "./types";
import type { PlopNextCore } from "./PlopNextCore";

export interface ActionRunnerOptions {
  /** Base directory for generated files. Relative action paths are resolved against this. */
  dest?: string;
  /** When true, overwrite existing files instead of throwing. */
  force?: boolean;
}

export interface ActionRunResult {
  type: string;
  message: string;
  /** Interpolated path template, useful for UI output. */
  path?: string;
  /** Absolute path used for filesystem operations. */
  absolutePath?: string;
}

/**
 * Built-in action handlers (business logic): add, modify, append.
 */
export class ActionRunner {
  constructor(
    private readonly core: PlopNextCore,
    private readonly opts: ActionRunnerOptions = {},
  ) {}

  async run(
    type: string,
    config: ActionConfig,
    answers: Record<string, unknown>,
  ): Promise<ActionRunResult> {
    switch (type) {
      case "add":
        return this.runAdd(config, answers);
      case "addMany":
        return this.runAddMany(config, answers);
      case "modify":
        return this.runModify(config, answers);
      case "append":
        return this.runAppend(config, answers);
      default:
        throw new Error(this.core.t("errors.unknownAction", [type], `Unknown action type: \"${type}\"`));
    }
  }

  private async runAdd(
    config: ActionConfig,
    answers: Record<string, unknown>,
  ): Promise<ActionRunResult> {
    const path = this.interpolate(config.path ?? "", answers);
    const absolutePath = this.toAbsolute(path);
    const force = this.opts.force || config.force === true;

    if (existsSync(absolutePath)) {
      if (config.skipIfExists) {
        return {
          type: "skip",
          message: `Skipped existing file: ${absolutePath}`,
          path,
          absolutePath,
        };
      }
      if (!force) {
        throw new Error(this.core.t("actions.add.alreadyExists", [absolutePath], `File already exists: ${absolutePath}`));
      }
    }

    let content = await this.resolveTemplate(config, answers);
    content = await this.applyTransform(config, content, answers);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, content, "utf8");

    return {
      type: "add",
      message: this.core.t("actions.add.created", [absolutePath], `Created ${absolutePath}`),
      path,
      absolutePath,
    };
  }

  private async runAddMany(
    config: ActionConfig,
    answers: Record<string, unknown>,
  ): Promise<ActionRunResult> {
    const force = this.opts.force || config.force === true;
    const destination = this.interpolate(config.destination ?? "", answers);
    const destinationAbs = this.toAbsolute(destination);

    const templatePatterns = config.templateFiles;
    if (!templatePatterns) {
      throw new Error("addMany requires templateFiles.");
    }

    const files = await glob(templatePatterns, {
      cwd: this.core.getPlopfilePath() ? dirname(this.core.getPlopfilePath() as string) : process.cwd(),
      ...(config.globOptions ?? {}),
    });

    const baseDir = config.base
      ? this.toAbsolute(this.interpolate(config.base, answers))
      : undefined;
    const stripExtensions = config.stripExtensions ?? ["hbs"];
    let written = 0;

    for (const file of files) {
      const templatePath = this.toAbsolute(file);
      const rel = baseDir
        ? relative(baseDir, templatePath)
        : basename(templatePath);
      let outRel = rel;

      for (const ext of stripExtensions) {
        const suffix = `.${ext}`;
        if (outRel.endsWith(suffix)) {
          outRel = outRel.slice(0, -suffix.length);
          break;
        }
      }

      outRel = this.interpolate(outRel, answers);
      const outputAbs = resolve(destinationAbs, outRel);

      if (existsSync(outputAbs)) {
        if (config.skipIfExists) {
          continue;
        }
        if (!force) {
          throw new Error(this.core.t("actions.add.alreadyExists", [outputAbs], `File already exists: ${outputAbs}`));
        }
      }

      const raw = await readFile(templatePath, "utf8");
      let content = this.interpolate(raw, { ...answers, ...(config.data ?? {}) });
      content = await this.applyTransform(config, content, answers);

      await mkdir(dirname(outputAbs), { recursive: true });
      await writeFile(outputAbs, content, "utf8");
      written += 1;
    }

    return {
      type: "addMany",
      message: `Added ${written} file(s) to ${destinationAbs}`,
      path: destination,
      absolutePath: destinationAbs,
    };
  }

  private async runModify(
    config: ActionConfig,
    answers: Record<string, unknown>,
  ): Promise<ActionRunResult> {
    const path = this.interpolate(config.path ?? "", answers);
    const absolutePath = this.toAbsolute(path);

    if (!existsSync(absolutePath)) {
      throw new Error(this.core.t("actions.modify.notFound", [absolutePath], `File not found: ${absolutePath}`));
    }

    let content = await readFile(absolutePath, "utf8");
    const pattern =
      config.pattern instanceof RegExp
        ? config.pattern
        : new RegExp(config.pattern ?? "$", "g");

    const replacement = await this.resolveTemplate(config, answers);

    if (!pattern.test(content)) {
      throw new Error(this.core.t("actions.modify.patternNotFound", [absolutePath], `Pattern not found in: ${absolutePath}`));
    }

    content = content.replace(pattern, replacement);
    content = await this.applyTransform(config, content, answers);
    await writeFile(absolutePath, content, "utf8");

    return {
      type: "modify",
      message: this.core.t("actions.modify.modified", [absolutePath], `Modified ${absolutePath}`),
      path,
      absolutePath,
    };
  }

  private async runAppend(
    config: ActionConfig,
    answers: Record<string, unknown>,
  ): Promise<ActionRunResult> {
    const path = this.interpolate(config.path ?? "", answers);
    const absolutePath = this.toAbsolute(path);
    const addition = await this.resolveTemplate(config, answers);

    let existing = existsSync(absolutePath)
      ? await readFile(absolutePath, "utf8")
      : "";

    const unique = config.unique !== false;
    if (!(unique && existing.includes(addition))) {
      if (config.pattern !== undefined) {
        const pattern =
          config.pattern instanceof RegExp
            ? config.pattern
            : new RegExp(String(config.pattern), "g");
        const separator = config.separator ?? "";
        existing = existing.replace(pattern, (match) => `${match}${separator}${addition}`);
      } else {
        existing = `${existing}${addition}`;
      }
    }

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, existing, "utf8");

    return {
      type: "append",
      message: this.core.t("actions.append.appended", [absolutePath], `Appended to ${absolutePath}`),
      path,
      absolutePath,
    };
  }

  private async resolveTemplate(
    config: ActionConfig,
    answers: Record<string, unknown>,
  ): Promise<string> {
    const model = { ...answers, ...(config.data ?? {}) };

    if (config.templateFile) {
      const templateFile = this.resolveTemplateFilePath(config.templateFile);
      const raw = await readFile(templateFile, "utf8");
      return this.interpolate(raw, model);
    }

    return this.interpolate(config.template ?? "", model);
  }

  private toAbsolute(path: string): string {
    if (isAbsolute(path)) return path;
    return resolve(this.opts.dest ?? this.core.getDestBasePath(), path);
  }

  private resolveTemplateFilePath(path: string): string {
    if (isAbsolute(path)) {
      return path;
    }

    const plopfilePath = this.core.getPlopfilePath();
    if (plopfilePath) {
      return resolve(dirname(plopfilePath), path);
    }

    return resolve(this.core.getDestBasePath(), path);
  }

  private interpolate(template: string, data: Record<string, unknown>): string {
    return this.core.renderString(template, data);
  }

  private async applyTransform(
    config: ActionConfig,
    content: string,
    answers: Record<string, unknown>,
  ): Promise<string> {
    if (!config.transform) {
      return content;
    }

    const transformed = await config.transform(content, {
      ...answers,
      ...(config.data ?? {}),
    });
    return transformed;
  }
}
