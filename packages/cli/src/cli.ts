#!/usr/bin/env node
import { parseArgs } from "node:util";
import { writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import pc from "picocolors";
import { PlopNextCLI } from "./PlopNextCLI";
import { CORE_DEFAULT_HELP_TEXTS } from "@plop-next/core";
import type { HelpTexts } from "@plop-next/core";

const require = createRequire(import.meta.url);
type CliPackageInfo = {
  version: string;
  name: string;
};

type PackageManagerField = {
  packageManager?: string;
};

const pkg = require("../package.json") as CliPackageInfo;

type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

type InitTemplateOptions = {
  useTs: boolean;
  withDemo: boolean;
  withI18n: boolean;
};

type BypassParseResult = {
  positional: string[];
  named: Record<string, string | boolean>;
};

const PARSE_OPTIONS = {
  // generator is a positional: `plop-next componentName`
  cwd: { type: "string" },
  preload: { type: "string", multiple: true },
  plopfile: { type: "string", short: "p" },
  progress: { type: "boolean", default: true },
  dest: { type: "string", short: "d" },
  force: { type: "boolean", short: "f" },
  "show-type-names": { type: "boolean", short: "t" },
  lang: { type: "string", short: "l" },
  generate: { type: "string", short: "g" },
  path: { type: "string", short: "P" },
  extension: { type: "string", short: "e" },
  "include-custom-texts": { type: "boolean" },
  help: { type: "boolean", short: "h" },
  init: { type: "boolean", short: "i" },
  "init-ts": { type: "boolean" },
  "init-js": { type: "boolean" },
  demo: { type: "boolean" },
  i18n: { type: "boolean" },
  version: { type: "boolean", short: "v" },
} as const;

function normalizeCliOptionAliases(args: string[]): string[] {
  const normalized: string[] = [];
  let afterSeparator = false;

  for (const token of args) {
    if (token === "--") {
      afterSeparator = true;
      normalized.push(token);
      continue;
    }

    if (!afterSeparator) {
      if (token === "-ext" || token === "--ext") {
        normalized.push("--extension");
        continue;
      }

      if (token.startsWith("-ext=")) {
        normalized.push(`--extension=${token.slice(5)}`);
        continue;
      }

      if (token.startsWith("--ext=")) {
        normalized.push(`--extension=${token.slice(6)}`);
        continue;
      }
    }

    normalized.push(token);
  }

  return normalized;
}

/**
 * Resolves the help texts for `--help` display.
 * Tries to load the matching locale from `@plop-next/i18n` (optional dep),
 * and falls back to the built-in English texts if i18n is unavailable or the
 * locale has no help section.
 */
async function resolveHelpTexts(lang?: string): Promise<HelpTexts> {
  if (!lang) return CORE_DEFAULT_HELP_TEXTS;
  const locale = lang.trim().toLowerCase();
  if (!locale || locale === "en") return CORE_DEFAULT_HELP_TEXTS;
  try {
    const { I18nRegistry } = await import("@plop-next/i18n");
    const registry = new I18nRegistry();
    return registry.getHelpTexts(locale);
  } catch {
    // @plop-next/i18n not installed — use English default.
    return CORE_DEFAULT_HELP_TEXTS;
  }
}

function detectPackageManager(projectDir: string): PackageManager {
  const packageJsonPath = resolve(projectDir, "package.json");
  if (existsSync(packageJsonPath)) {
    try {
      const raw = require(packageJsonPath) as PackageManagerField;
      const packageManager = raw.packageManager?.toLowerCase() ?? "";
      if (packageManager.startsWith("yarn@")) return "yarn";
      if (packageManager.startsWith("pnpm@")) return "pnpm";
      if (packageManager.startsWith("bun@")) return "bun";
      if (packageManager.startsWith("npm@")) return "npm";
    } catch {
      // Fallback to lockfile detection.
    }
  }

  if (existsSync(resolve(projectDir, "yarn.lock"))) return "yarn";
  if (existsSync(resolve(projectDir, "pnpm-lock.yaml"))) return "pnpm";
  if (
    existsSync(resolve(projectDir, "bun.lockb")) ||
    existsSync(resolve(projectDir, "bun.lock"))
  )
    return "bun";
  if (existsSync(resolve(projectDir, "package-lock.json"))) return "npm";

  return "npm";
}

function installInitDevDependencies(
  projectDir: string,
  includeI18n: boolean,
): boolean {
  if (!existsSync(resolve(projectDir, "package.json"))) {
    console.log(
      pc.yellow("⚠ No package.json found, skipping dependency installation."),
    );
    return true;
  }

  const deps = ["@plop-next/cli"];
  if (includeI18n) deps.push("@plop-next/i18n");

  const manager = detectPackageManager(projectDir);
  const args =
    manager === "npm"
      ? ["install", "-D", ...deps]
      : manager === "bun"
        ? ["add", "-d", ...deps]
        : ["add", "-D", ...deps];

  console.log(
    pc.dim(`Installing devDependencies with ${manager}: ${deps.join(", ")}`),
  );

  const result = spawnSync(manager, args, {
    cwd: projectDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  return result.status === 0;
}

function buildInitPlopfileContent(options: InitTemplateOptions): string {
  const lines: string[] = [];
  const isTs = options.useTs;
  const i18nImported = options.withI18n;
  const isDemo = options.withDemo;

  if (isTs) {
    lines.push(`import type { PlopNext } from "@plop-next/cli";`);
  }
  if (i18nImported) {
    lines.push(`import { PlopNextI18n } from "@plop-next/i18n";`);
    lines.push("");
  }
  if (isTs) {
    lines.push(`export default function plop(plop: PlopNext) {`);
  } else {
    lines.push(`export default function plop(plop) {`);
  }

  if (i18nImported) {
    lines.push(`  const i18n = new PlopNextI18n(plop);`);
    if (isDemo) {
      lines.push(``);
      lines.push(`  i18n.registerTexts("en", {`);
      lines.push(`    example: { `);
      lines.push(`      description: "An example generator",`);
      lines.push(`      name: {message: "What is your component name?"},`);
      lines.push(`    },`);
      lines.push(`  });`);
    }
    lines.push("");
    lines.push(`  // You can force a specific locale with:`);
    lines.push(`  // plop.useI18n({ locale: "en" });`);
    lines.push(`  plop.useI18n({ auto: true });`);
    lines.push("");
  }

  if (isDemo) {
    lines.push(`  plop.registerGenerator("example", {`);
    lines.push(`    description: "An example generator",`);
    lines.push(`    prompts: [`);
    lines.push(`      {`);
    lines.push(`        type: "input",`);
    lines.push(`        name: "name",`);
    lines.push(`        message: "What is your component name?",`);
    lines.push(`      },`);
    lines.push(`    ],`);
    lines.push(`    actions: [`);
    lines.push(`      {`);
    lines.push(`        type: "add",`);
    lines.push(`        path: "demoFiles/{{name}}.ts",`);
    lines.push(`        template: "export const {{name}} = () => {};\\n",`);
    lines.push(`      },`);
    lines.push(`    ],`);
    lines.push(`  });`);
  }

  lines.push(isTs ? `}` : `};`);
  lines.push("");
  return lines.join("\n");
}

function parseNamedBypass(tokens: string[]): Record<string, string | boolean> {
  const named: Record<string, string | boolean> = {};

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i] ?? "";
    if (!token.startsWith("--") || token === "--") {
      continue;
    }

    const eqIndex = token.indexOf("=");
    if (eqIndex > 2) {
      const key = token.slice(2, eqIndex);
      const value = token.slice(eqIndex + 1);
      if (key) {
        named[key] = value;
      }
      continue;
    }

    const key = token.slice(2);
    if (!key) {
      continue;
    }

    const next = tokens[i + 1];
    if (typeof next === "string" && !next.startsWith("--")) {
      named[key] = next;
      i += 1;
    } else {
      named[key] = true;
    }
  }

  return named;
}

function parseBypassArgs(rawArgs: string[], fallbackPositionals: string[]): BypassParseResult {
  const separatorIndex = rawArgs.indexOf("--");

  if (separatorIndex === -1) {
    return {
      positional: fallbackPositionals.slice(1).map(String),
      named: {},
    };
  }

  const beforeSeparator = parseArgs({
    args: rawArgs.slice(0, separatorIndex),
    options: PARSE_OPTIONS,
    allowPositionals: true,
    strict: false,
  });

  return {
    positional: beforeSeparator.positionals.slice(1).map(String),
    named: parseNamedBypass(rawArgs.slice(separatorIndex + 1).map(String)),
  };
}

(async () => {
const rawArgs = normalizeCliOptionAliases(process.argv.slice(2));

const { values, positionals } = parseArgs({
  args: rawArgs,
  options: PARSE_OPTIONS,
  allowPositionals: true,
  strict: false,
});

const bypass = parseBypassArgs(rawArgs, positionals);

// ── --version ────────────────────────────────────────────────────────────────
if (values.version) {
  console.log(pkg.version);
  process.exit(0);
}

// ── --help ───────────────────────────────────────────────────────────────────
if (values.help) {
  // eslint-disable-next-line no-await-in-loop
  const t = await resolveHelpTexts(values.lang as string | undefined);

  console.log(
    [
      "",
      `${pc.bold(pkg.name)} ${pc.dim(`v${pkg.version}`)}`,
      "",
      pc.bold(t.usage),
      `  $ plop-next                 ${pc.dim(t.usage1)}`,
      `  $ plop-next <name>          ${pc.dim(t.usage2)}`,
      `  $ plop-next <name> [input]  ${pc.dim(t.usage3)}`,
      "",
      pc.bold(t.options),
      `  -h, --help             ${pc.dim(t.optHelp)}`,
      `  ----- ${pc.dim(t.optInitTitle)} -----`,
      `  -i, --init             ${pc.dim(t.optInit)}`,
      `      --init-js          ${pc.dim(t.optInitJs)}`,
      `      --init-ts          ${pc.dim(t.optInitTs)}`,
      `      --i18n             ${pc.dim(t.optI18n)}`,
      `      --demo             ${pc.dim(t.optDemo)}`,
      `  ---- ${pc.dim(t.optGenerateTitle)} -----`,
      `  -g, --generate <kind>  ${pc.dim(t.optGenerate)}`,
      `  -P, --path <dir>       ${pc.dim(t.optPath)}`,
      `  -e, --extension <ext>  ${pc.dim(t.optExtension)}`,
      `      --include-custom-texts ${pc.dim(t.optIncludeCustomTexts)}`,
      `  ---- ${pc.dim(t.optOthersTitle)} -----`,
      `  -t, --show-type-names  ${pc.dim(t.optShowTypeNames)}`,
      `  -v, --version          ${pc.dim(t.optVersion)}`,
      `  -f, --force            ${pc.dim(t.optForce)}`,
      `  -l, --lang <locale>    ${pc.dim(t.optLang)}`,
      "",
      pc.dim(" ------------------------------------------------------"),
      pc.dim(`  ${t.danger}`),
      "",
      pc.dim(`  --plopfile             ${t.lowPlopfile}`),
      pc.dim(`  --cwd                  ${t.lowCwd}`),
      pc.dim(`  --preload              ${t.lowPreload}`),
      pc.dim(`  --dest                 ${t.lowDest}`),
      pc.dim(`  --no-progress          ${t.lowNoProgress}`),
      "",
      pc.bold(t.examples),
      `  $ ${pc.blue("plop-next")}`,
      `  $ ${pc.blue("plop-next component")}`,
      `  $ ${pc.blue('plop-next component "name of component"')}`,
      "",
    ].join("\n"),
  );
  process.exit(0);
}

// ── --init / --init-js ───────────────────────────────────────────────────────
if (values.init || values["init-ts"] || values["init-js"]) {
  const useTs = !values["init-js"];
  const withDemo = values.demo === true;
  const withI18n = values.i18n === true;
  const filename = useTs ? "plopfile.ts" : "plopfile.js";
  const otherFilename = useTs ? "plopfile.js" : "plopfile.ts";
  const projectDir = resolve(
    (values.cwd as string | undefined) ?? process.cwd(),
  );
  const dest = resolve(projectDir, filename);
  const otherDest = resolve(projectDir, otherFilename);

  if (existsSync(dest)) {
    console.error(pc.red(`✖ ${filename} already exists.`));
    process.exit(1);
  }

  if (existsSync(otherDest)) {
    console.error(
      pc.red(`✖ ${otherFilename} already exists. Remove it before initializing ${filename}.`),
    );
    process.exit(1);
  }

  const content = buildInitPlopfileContent({ useTs, withDemo, withI18n });
  writeFileSync(dest, content, "utf8");

  const installOk = installInitDevDependencies(projectDir, withI18n);
  if (!installOk) {
    console.error(pc.red("✖ Failed to install init dependencies."));
    process.exit(1);
  }

  console.log(pc.green(`✔ Created ${dest}`));
  process.exit(0);
}

// ── Run generator ────────────────────────────────────────────────────────────
// First positional is the generator name: `plop-next component`
const generateMode = values.generate as string | undefined;
const generationLocale = generateMode ? positionals[0] : undefined;
const generator = generateMode ? undefined : positionals[0];

const cli = new PlopNextCLI();
cli.launch({
  generator,
  cwd: values.cwd as string | undefined,
  plopfile: values.plopfile as string | undefined,
  preload: values.preload as string[] | undefined,
  progress: values.progress as boolean,
  dest: values.dest as string | undefined,
  force: values.force as boolean | undefined,
  lang: values.lang as string | undefined,
  generateMode,
  generateLocale: generationLocale,
  path: values.path as string | undefined,
  extension: values.extension as string | undefined,
  includeCustomTexts: values["include-custom-texts"] as boolean | undefined,
  showTypeNames: values["show-type-names"] as boolean | undefined,
  bypassPositionals: bypass.positional,
  bypassNamed: bypass.named,
});
})().catch((err: unknown) => {
  console.error(pc.red(String(err)));
  process.exit(1);
});
