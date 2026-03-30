import { createSpinner } from "nanospinner";
import pc from "picocolors";
import { Separator } from "@inquirer/prompts";
import type {
  PlopNextCore,
  PlopPrompt,
  ErrorHandler,
  GeneratorListItem,
  GeneratorMenuItem,
  UnknownRecord,
} from "@plop-next/core";
import {
  NoGeneratorsError,
  GeneratorNotFoundError,
  InvalidPromptError,
  BypassParseError,
  UserCancelledError,
} from "@plop-next/core";

export interface RunnerOptions {
  /** Base directory for generated files (--dest). */
  dest?: string;
  /** Overwrite existing files without error (--force). */
  force?: boolean;
  /** Show action progress spinners (default: true). */
  progress?: boolean;
  /** Show full action type names instead of symbols (--show-type-names). */
  showTypeNames?: boolean;
  /** Positional bypass values consumed in prompt order. */
  bypassPositionals?: string[];
  /** Named bypass values keyed by prompt name. */
  bypassNamed?: Record<string, string | boolean>;
  /** Error handler for configurable error reporting. */
  errorHandler?: ErrorHandler;
}

type ChoiceWithType = {
  type?: unknown;
};

type PromptRecord = PlopPrompt & UnknownRecord;

/**
 * Interactive runner: displays the generator menu and executes the chosen one.
 */
export class PlopNextRunner {
  private bypassIndex = 0;
  private readonly bypassPositionals: readonly string[];
  private readonly bypassNamed: Map<string, string | boolean>;

  constructor(
    private readonly core: PlopNextCore,
    private readonly opts: RunnerOptions = {},
  ) {
    this.bypassPositionals = opts.bypassPositionals ?? [];
    this.bypassNamed = new Map(Object.entries(opts.bypassNamed ?? {}));
  }

  async run(generatorName?: string): Promise<void> {
    const theme = this.getCliTheme();
    const list = this.core.getGeneratorList();

    if (list.length === 0) {
      throw new NoGeneratorsError();
    }

    // ── Choose generator ─────────────────────────────────────────────
    let chosen: string;

    if (generatorName) {
      if (!this.core.getGenerator(generatorName)) {
        throw new GeneratorNotFoundError(generatorName);
      }
      chosen = generatorName;
    } else {
      // Filter out separators to find actual generators
      const generators = list.filter(
        (item) => !("type" in item) || item.type !== "separator",
      );
      if (generators.length === 1 && generators[0] && "name" in generators[0]) {
        chosen = generators[0].name;
      } else {
        const showTitle = this.core.isTitleShown();
        if (showTitle) {
          const title = this.core.t(
            "cli.title",
            [],
            "Please choose a generator",
          );
          if (title && title !== "") {
            console.log(theme.menuTitle(title));
          }
        }
        const showWelcome = this.core.isWelcomeMessageShown();
        if (showWelcome) {
          const welcomeMessage = this.core.getWelcomeMessage();
          if (
            welcomeMessage &&
            welcomeMessage !== "" &&
            welcomeMessage !== null
          ) {
            console.log(theme.welcome(welcomeMessage));
          }
        }
        console.log();

        chosen = await this.askGeneratorSelection(list);
      }
    }

    await this.runGenerator(chosen);
  }

  // ── Private ──────────────────────────────────────────────────────

  private async runGenerator(name: string): Promise<void> {
    const theme = this.getCliTheme();
    const config = this.core.getGenerator(name);
    if (!config) {
      throw new GeneratorNotFoundError(name);
    }

    console.log("\n" + theme.generatorTitle(name));

    // ── Run prompts ──────────────────────────────────────────────────
    const preparedPrompts = this.core.preparePrompts(name, config.prompts);
    const answers: Record<string, unknown> = {};

    for (const rawPrompt of preparedPrompts) {
      const prompt = await this.resolvePrompt(rawPrompt, answers);

      if (!prompt) {
        continue;
      }

      const {
        type,
        name: promptName,
        filter: filterFn,
        validate: validateFn,
        source: sourceFn,
        askAnswered,
        when: _when,
        // plop-next only fields, not passed to inquirer
        ...inquirerConfig
      } = prompt;

      const promptType = typeof type === "string" ? type : "input";

      if (promptType === "generator-select") {
        throw new InvalidPromptError(
          typeof promptName === "string" ? promptName : String(promptName),
          'Prompt type "generator-select" is reserved for the internal generator menu and cannot be used in generator prompts.',
        );
      }

      if (typeof promptName !== "string" || promptName.length === 0) {
        throw new InvalidPromptError(
          String(promptName),
          "Prompt name must be a non-empty string.",
        );
      }

      // Skip if answer already exists and askAnswered is not true
      if (answers.hasOwnProperty(promptName) && !askAnswered) {
        continue;
      }

      const runtimeConfig: UnknownRecord = {
        ...(inquirerConfig as UnknownRecord),
      };

      if (typeof validateFn === "function") {
        runtimeConfig["validate"] = (value: unknown) =>
          (
            validateFn as (
              value: unknown,
              answers?: Record<string, unknown>,
            ) => unknown
          )(value, answers);
      }

      if (typeof sourceFn === "function") {
        runtimeConfig["source"] = (term: string | undefined, opt: unknown) =>
          (
            sourceFn as (
              term: string | undefined,
              opt: unknown,
              answers?: Record<string, unknown>,
            ) => unknown
          )(term, opt, answers);
      }

      const bypass = this.consumeBypass(promptName);

      let value: unknown;
      if (typeof bypass !== "undefined") {
        value = this.coerceBypassValue(
          promptType,
          bypass,
          runtimeConfig,
          promptName,
        );
      } else {
        // Dynamically import the right inquirer prompt.
        value = await this.askPrompt(promptType, promptName, runtimeConfig);
      }

      // Apply plop-next filter if provided
      if (typeof filterFn === "function") {
        value = filterFn(value, answers);
      }

      answers[promptName] = value;
    }

    // ── Run actions (business logic is in core) ─────────────────────
    const showProgress = this.opts.progress !== false;
    const actions = await this.core.resolveActions(config.actions, answers);
    const { steps, failed } = await this.core.executeActions(actions, answers, {
      dest: this.opts.dest,
      force: this.opts.force,
    });

    for (const step of steps) {
      if (step.type === "comment") {
        console.log(theme.info(step.message));
        continue;
      }

      const labelRaw = this.core.getActionTypeDisplay(
        step.type,
        this.opts.showTypeNames,
      );
      const label = this.opts.showTypeNames
        ? pc.dim(labelRaw)
        : this.colorizeActionLabel(step.type, labelRaw);
      const target = this.core.formatActionTargetForDisplay(
        step.path ?? step.message,
      );
      const text = `${label} ${pc.dim(target)}`;

      if (step.status === "success") {
        if (showProgress) {
          createSpinner("Running action").success({
            text: theme.success(text),
          });
        } else {
          console.log(theme.success(text));
        }
      } else if (showProgress) {
        createSpinner("Running action").error({
          text: theme.error(step.message),
        });
      } else {
        console.error(theme.error(step.message));
      }
    }

    if (!failed && steps.length === 0) {
      const text = theme.success(this.core.t("cli.done", [], "Done!"));
      console.log(text);
    }
  }

  private async askPrompt(
    type: string,
    name: string,
    inquirerConfig: Record<string, unknown>,
  ): Promise<unknown> {
    try {
      return await this.core.askPrompt(type, { name, ...inquirerConfig });
    } catch (error) {
      // @inquirer/prompts throws ExitPromptError when user presses Ctrl+C.
      if (error instanceof Error && this.isPromptCancelled(error)) {
        throw new UserCancelledError();
      }
      throw error;
    }
  }

  private async askGeneratorSelection(
    list: GeneratorMenuItem[],
  ): Promise<string> {
    const choices = [
      ...list.map((item) => {
        if ("type" in item && item.type === "separator") {
          return new Separator(item.separator || undefined);
        }

        if (!this.isGeneratorListItem(item)) {
          return new Separator();
        }

        const g = item;
        const displayName = this.resolveGeneratorDisplayName(g.name);
        const translatedDescription = this.resolveGeneratorDescription(
          g.name,
          g.description,
        );

        return {
          name: displayName,
          value: g.name,
          description: translatedDescription ?? null,
        };
      }),
      new Separator(),
    ];

    try {
      const selected = await this.core.askPrompt("generator-select", {
        name: "__generator",
        message: `[PLOP] ${this.core.t("cli.selectGenerator", [], "Please choose a generator")}`,
        choices,
        pageSize: this.core.getGeneratorPageSize(),
      });

      if (typeof selected !== "string" || selected.length === 0) {
        throw new InvalidPromptError(
          "__generator",
          "Generator selection returned an invalid value.",
        );
      }

      return selected;
    } catch (error) {
      // @inquirer/prompts throws ExitPromptError when user presses Ctrl+C.
      if (error instanceof Error && this.isPromptCancelled(error)) {
        throw new UserCancelledError();
      }
      throw error;
    }
  }

  private async resolvePrompt(
    prompt: PlopPrompt,
    answers: Record<string, unknown>,
  ): Promise<Record<string, unknown> | undefined> {
    const shouldAsk = await this.resolveWhen(prompt.when, answers);
    if (!shouldAsk) {
      return undefined;
    }

    const promptRecord = prompt as PromptRecord;
    const resolved: UnknownRecord = { ...promptRecord };

    if (typeof prompt.message === "function") {
      resolved["message"] = String(prompt.message(answers));
    }

    if (typeof prompt.default === "function") {
      resolved["default"] = await (
        prompt.default as (a: Record<string, unknown>) => Promise<unknown>
      )(answers);
    }

    const rawChoices = promptRecord["choices"];
    if (typeof rawChoices === "function") {
      resolved["choices"] = await (
        rawChoices as (a: Record<string, unknown>) => Promise<unknown>
      )(answers);
    }

    return resolved;
  }

  private consumeBypass(promptName: string): string | undefined {
    if (this.bypassNamed.has(promptName)) {
      const raw = this.bypassNamed.get(promptName);
      this.bypassNamed.delete(promptName);
      return typeof raw === "string" ? raw : String(raw);
    }

    if (this.bypassIndex >= this.bypassPositionals.length) {
      return undefined;
    }

    const raw = this.bypassPositionals[this.bypassIndex];
    this.bypassIndex += 1;

    if (raw === "_") {
      return undefined;
    }

    return raw;
  }

  private isGeneratorListItem(
    item: GeneratorMenuItem,
  ): item is GeneratorListItem {
    return "name" in item && typeof item.name === "string";
  }

  private resolveGeneratorDisplayName(generatorName: string): string {
    const scopedKey = `${generatorName}.generator.name`;
    const scoped = this.core.t(scopedKey, [], undefined);
    if (scoped !== scopedKey) {
      return scoped;
    }

    const namespacedKey = `generators.${generatorName}.name`;
    const namespaced = this.core.t(namespacedKey, [], undefined);
    if (namespaced !== namespacedKey) {
      return namespaced;
    }

    const legacyKey = `${generatorName}.name`;
    const legacy = this.core.t(legacyKey, [], undefined);
    if (legacy !== legacyKey) {
      return legacy;
    }

    return generatorName;
  }

  private resolveGeneratorDescription(
    generatorName: string,
    fallback?: string,
  ): string | undefined {
    const scopedKey = `${generatorName}.generator.description`;
    const scoped = this.core.t(scopedKey, [], undefined);
    if (scoped !== scopedKey) {
      return scoped;
    }

    const namespacedKey = `generators.${generatorName}.description`;
    const namespaced = this.core.t(namespacedKey, [], undefined);
    if (namespaced !== namespacedKey) {
      return namespaced;
    }

    const legacyKey = `${generatorName}.description`;
    const legacy = this.core.t(legacyKey, [], fallback);
    if (legacy !== legacyKey) {
      return legacy;
    }

    return undefined;
  }

  private coerceBypassValue(
    promptType: string,
    raw: string,
    inquirerConfig: Record<string, unknown>,
    promptName: string,
  ): unknown {
    if (promptType === "confirm") {
      const normalized = raw.trim().toLowerCase();
      if (["1", "y", "yes", "t", "true"].includes(normalized)) return true;
      if (["0", "n", "no", "f", "false"].includes(normalized)) return false;
      throw new BypassParseError(
        promptName,
        promptType,
        raw,
        `Expected boolean value (y/n), got "${raw}"`,
      );
    }

    if (promptType === "number") {
      const num = Number(raw);
      if (Number.isFinite(num)) {
        return num;
      }
      throw new BypassParseError(
        promptName,
        promptType,
        raw,
        `Expected number, got "${raw}"`,
      );
    }

    if (
      promptType === "list" ||
      promptType === "select" ||
      promptType === "rawlist" ||
      promptType === "expand"
    ) {
      return this.resolveChoiceBypassValue(
        raw,
        inquirerConfig,
        promptName,
        promptType,
      );
    }

    if (promptType === "checkbox") {
      const tokens = raw
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
      return tokens.map((token) =>
        this.resolveChoiceBypassValue(
          token,
          inquirerConfig,
          promptName,
          promptType,
        ),
      );
    }

    return raw;
  }

  private resolveChoiceBypassValue(
    raw: string,
    inquirerConfig: Record<string, unknown>,
    promptName: string,
    promptType: string,
  ): unknown {
    const choices = inquirerConfig["choices"];
    if (!Array.isArray(choices)) {
      throw new BypassParseError(
        promptName,
        promptType,
        raw,
        `Resolved choices are missing or invalid`,
      );
    }

    const choiceList = choices.filter((choice) => {
      if (typeof choice === "string") {
        return true;
      }
      if (!choice || typeof choice !== "object") {
        return false;
      }
      return (choice as ChoiceWithType).type !== "separator";
    });

    const asNumber = Number(raw);
    if (
      Number.isInteger(asNumber) &&
      asNumber >= 1 &&
      asNumber <= choiceList.length
    ) {
      return this.choiceValue(choiceList[asNumber - 1]);
    }

    if (
      Number.isInteger(asNumber) &&
      asNumber >= 0 &&
      asNumber < choiceList.length
    ) {
      return this.choiceValue(choiceList[asNumber]);
    }

    for (const choice of choiceList) {
      if (typeof choice === "string") {
        if (choice === raw) return choice;
        continue;
      }

      const record = choice as UnknownRecord;

      if (
        typeof record["value"] !== "undefined" &&
        String(record["value"]) === raw
      ) {
        return record["value"];
      }

      if (
        typeof record["key"] !== "undefined" &&
        String(record["key"]) === raw
      ) {
        return this.choiceValue(record);
      }

      if (
        typeof record["name"] !== "undefined" &&
        String(record["name"]) === raw
      ) {
        return this.choiceValue(record);
      }
    }

    throw new BypassParseError(
      promptName,
      promptType,
      raw,
      `Could not match value "${raw}" against available choices`,
    );
  }

  private choiceValue(choice: unknown): unknown {
    if (typeof choice === "string") {
      return choice;
    }

    if (!choice || typeof choice !== "object") {
      return choice;
    }

    const record = choice as UnknownRecord;
    if (Object.prototype.hasOwnProperty.call(record, "value")) {
      return record["value"];
    }

    if (Object.prototype.hasOwnProperty.call(record, "name")) {
      return record["name"];
    }

    return choice;
  }

  private async resolveWhen(
    when: unknown,
    answers: Record<string, unknown>,
  ): Promise<boolean> {
    if (typeof when === "undefined") {
      return true;
    }

    if (typeof when === "boolean") {
      return when;
    }

    if (typeof when === "function") {
      return Boolean(await when(answers));
    }

    return true;
  }

  private isPromptCancelled(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    // @inquirer/prompts throws ExitPromptError when user presses Ctrl+C.
    return (
      error.name === "ExitPromptError" ||
      error.message.includes("SIGINT") ||
      error.message.includes("User force closed the prompt")
    );
  }

  private colorizeActionLabel(type: string, label: string): string {
    if (type === "function") return pc.yellow(label);
    if (
      type === "add" ||
      type === "addMany" ||
      type === "append" ||
      type === "skip"
    ) {
      return pc.green(label);
    }
    if (type === "modify") {
      return `${pc.green("+")}${pc.red("-")}`;
    }
    return pc.dim(label);
  }

  private getCliTheme(): {
    menuTitle: (text: string) => string;
    welcome: (text: string) => string;
    generatorTitle: (text: string) => string;
    generatorDescription: (text: string) => string;
    success: (text: string) => string;
    error: (text: string) => string;
    skipped: (text: string) => string;
    info: (text: string) => string;
  } {
    const theme = this.core.getTheme().plopNext;

    return {
      menuTitle: theme?.menuTitle ?? ((text: string) => pc.bold(text)),
      welcome: theme?.welcome ?? ((text: string) => pc.dim(text)),
      generatorTitle:
        theme?.generatorMenu?.title ?? ((text: string) => pc.bold(text)),
      generatorDescription:
        theme?.generatorMenu?.description ?? ((text: string) => pc.dim(text)),
      success: theme?.actionLog?.success ?? ((text: string) => pc.green(text)),
      error: theme?.actionLog?.error ?? ((text: string) => pc.red(text)),
      skipped: theme?.actionLog?.skipped ?? ((text: string) => pc.yellow(text)),
      info: theme?.actionLog?.info ?? ((text: string) => pc.dim(text)),
    };
  }
}
