import { CORE_DEFAULT_TEXTS, type PlopNextCore } from "@plop-next/core";

type TemplateLeaf = {
  valueCode: string;
  fallbackComment: string;
};

interface TemplateTree {
  [key: string]: TemplateTree | TemplateLeaf;
}

type NamedChoice = {
  name?: unknown;
  value?: unknown;
};

type PromptLike = {
  type?: unknown;
  name?: unknown;
  message?: unknown;
  description?: unknown;
  hint?: unknown;
  instructions?: unknown;
  helpText?: unknown;
  noResults?: unknown;
  searchingText?: unknown;
  choices?: unknown;
};

type GeneratorLike = {
  description?: unknown;
  prompts?: unknown;
};

const PROMPT_TEXT_FIELDS = [
  "message",
  "description",
  "hint",
  "instructions",
  "helpText",
  "noResults",
  "searchingText",
] as const;

const BUILT_IN_THEME_TYPES = [
  "input",
  "select",
  "generator-select",
  "list",
  "checkbox",
  "confirm",
  "search",
  "password",
  "expand",
  "editor",
  "number",
  "rawlist",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isGeneratorListItem(value: unknown): value is { name: string } {
  return isRecord(value) && typeof value.name === "string";
}

function isTemplateLeaf(value: TemplateTree | TemplateLeaf): value is TemplateLeaf {
  return (
    isRecord(value) &&
    typeof value.valueCode === "string" &&
    typeof value.fallbackComment === "string"
  );
}

function normalizeCommentText(value: string): string {
  return value.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
}

function quoteObjectKey(key: string): string {
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) {
    return key;
  }

  return JSON.stringify(key);
}

function toLeafFromDefault(value: unknown): TemplateLeaf {
  if (typeof value === "string") {
    return {
      valueCode: "\"\"",
      fallbackComment: value,
    };
  }

  if (typeof value === "function") {
    return {
      valueCode: "(..._args: unknown[]) => \"\"",
      fallbackComment: normalizeCommentText(value.toString()),
    };
  }

  if (value === null) {
    return {
      valueCode: "null",
      fallbackComment: "null",
    };
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return {
      valueCode: JSON.stringify(value),
      fallbackComment: JSON.stringify(value),
    };
  }

  return {
    valueCode: "\"\"",
    fallbackComment: String(value),
  };
}

function defaultsToTemplateTree(source: Record<string, unknown>): TemplateTree {
  const out: TemplateTree = {};

  for (const [key, value] of Object.entries(source)) {
    if (isRecord(value)) {
      out[key] = defaultsToTemplateTree(value);
      continue;
    }

    out[key] = toLeafFromDefault(value);
  }

  return out;
}

function setLeaf(target: TemplateTree, path: string[], fallback: string): void {
  if (path.length === 0) {
    return;
  }

  const [head, ...tail] = path;
  if (!head) {
    return;
  }

  if (tail.length === 0) {
    target[head] = {
      valueCode: "\"\"",
      fallbackComment: fallback,
    };
    return;
  }

  const existing = target[head];
  if (!existing || isTemplateLeaf(existing)) {
    const next: TemplateTree = {};
    target[head] = next;
    setLeaf(next, tail, fallback);
    return;
  }

  setLeaf(existing, tail, fallback);
}

function mergeTemplateTrees(base: TemplateTree, extra: TemplateTree): TemplateTree {
  const out: TemplateTree = { ...base };

  for (const [key, value] of Object.entries(extra)) {
    const current = out[key];

    if (!current) {
      out[key] = value;
      continue;
    }

    if (isTemplateLeaf(current) || isTemplateLeaf(value)) {
      out[key] = value;
      continue;
    }

    out[key] = mergeTemplateTrees(current, value);
  }

  return out;
}

function renderTemplateTree(tree: TemplateTree, indentLevel: number): string[] {
  const indent = "  ".repeat(indentLevel);
  const childIndent = "  ".repeat(indentLevel + 1);
  const lines: string[] = ["{"];

  for (const [key, value] of Object.entries(tree)) {
    if (isTemplateLeaf(value)) {
      lines.push(`${childIndent}// en: ${normalizeCommentText(value.fallbackComment)}`);
      lines.push(
        `${childIndent}${quoteObjectKey(key)}: ${value.valueCode},`,
      );
      continue;
    }

    const nested = renderTemplateTree(value, indentLevel + 1);
    lines.push(`${childIndent}${quoteObjectKey(key)}: ${nested[0]}`);
    lines.push(...nested.slice(1, -1));
    lines.push(`${childIndent}${nested[nested.length - 1]},`);
  }

  lines.push(`${indent}}`);
  return lines;
}

function buildGeneratorTextsTree(core: PlopNextCore): TemplateTree {
  const tree: TemplateTree = {};
  const list = core.getGeneratorList();

  for (const item of list) {
    if (!isGeneratorListItem(item)) {
      continue;
    }

    const generatorName = item.name;
    const generator = core.getGenerator(generatorName) as GeneratorLike | undefined;
    if (!generator) {
      continue;
    }

    if (!isRecord(tree[generatorName])) {
      tree[generatorName] = {};
    }

    const generatorTree = tree[generatorName] as TemplateTree;

    const description = typeof generator.description === "string"
      ? generator.description
      : undefined;
    const generatorLabelTree: TemplateTree = {};
    setLeaf(generatorLabelTree, ["name"], generatorName);
    if (description) {
      setLeaf(generatorLabelTree, ["description"], description);
    }
    generatorTree.generator = generatorLabelTree;

    const prompts = Array.isArray(generator.prompts)
      ? (generator.prompts as PromptLike[])
      : [];

    for (const prompt of prompts) {
      const promptName = typeof prompt.name === "string" ? prompt.name : undefined;
      if (!promptName) {
        continue;
      }

      const promptTree: TemplateTree = isRecord(generatorTree[promptName])
        ? (generatorTree[promptName] as TemplateTree)
        : {};

      if (typeof prompt.message === "string") {
        setLeaf(promptTree, ["message"], prompt.message);
      }

      for (const field of PROMPT_TEXT_FIELDS) {
        const rawValue = prompt[field];
        if (typeof rawValue === "string") {
          setLeaf(promptTree, [field], rawValue);
        }
      }

      const choices = prompt.choices;
      if (Array.isArray(choices)) {
        const choicesTree: TemplateTree = isRecord(promptTree.choices)
          ? (promptTree.choices as TemplateTree)
          : {};

        for (const choice of choices) {
          if (typeof choice === "string") {
            setLeaf(choicesTree, [choice], choice);
            continue;
          }

          if (!isRecord(choice)) {
            continue;
          }

          const namedChoice = choice as NamedChoice;
          if (typeof namedChoice.name !== "string") {
            continue;
          }

          const key =
            typeof namedChoice.value === "string" ||
            typeof namedChoice.value === "number"
              ? String(namedChoice.value)
              : namedChoice.name;

          setLeaf(choicesTree, [key], namedChoice.name);
        }

        if (Object.keys(choicesTree).length > 0) {
          promptTree.choices = choicesTree;
        }
      }

      if (Object.keys(promptTree).length > 0) {
        generatorTree[promptName] = promptTree;
      }
    }
  }

  return tree;
}

function renderNamedExport(name: string, tree: TemplateTree): string {
  const body = renderTemplateTree(tree, 0).join("\n");
  return [
    `export const ${name} = ${body} as const;`,
    "",
    `export default ${name};`,
    "",
  ].join("\n");
}

function leafCodeToDataValue(valueCode: string): unknown {
  if (valueCode === "null") return null;
  if (valueCode === "true") return true;
  if (valueCode === "false") return false;
  if (/^-?\d+(?:\.\d+)?$/.test(valueCode)) return Number(valueCode);
  return "";
}

function templateTreeToData(tree: TemplateTree): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(tree)) {
    if (isTemplateLeaf(value)) {
      out[key] = leafCodeToDataValue(value.valueCode);
      continue;
    }

    out[key] = templateTreeToData(value);
  }

  return out;
}

function buildLocaleTemplateTree(options: {
  includePlopfileTexts?: boolean;
  core?: PlopNextCore;
} = {}): TemplateTree {
  const defaultsTree = defaultsToTemplateTree(
    CORE_DEFAULT_TEXTS as unknown as Record<string, unknown>,
  );

  return options.includePlopfileTexts && options.core
    ? mergeTemplateTrees(defaultsTree, buildGeneratorTextsTree(options.core))
    : defaultsTree;
}

export function buildLocaleTemplateSource(options: {
  includePlopfileTexts?: boolean;
  core?: PlopNextCore;
} = {}): string {
  const mergedTree = buildLocaleTemplateTree(options);

  const header = [
    "// Template locale: valeurs vides avec commentaire de reference en anglais.",
    "// Completer les chaines vides puis enregistrer via i18n.registerLocale(...) ou i18n.registerLocales(...).",
    "",
  ].join("\n");

  return header + renderNamedExport("Local", mergedTree);
}

export function buildLocaleTemplateData(options: {
  includePlopfileTexts?: boolean;
  core?: PlopNextCore;
} = {}): Record<string, unknown> {
  return templateTreeToData(buildLocaleTemplateTree(options));
}

export function buildTextsTemplateSource(core: PlopNextCore): string {
  const tree = buildGeneratorTextsTree(core);
  const header = [
    "// Template textes: contient les cles traduisibles detectees dans le plopfile.",
    "// Les commentaires indiquent le texte par defaut detecte.",
    "",
  ].join("\n");

  return header + renderNamedExport("Text", tree);
}

export function buildTextsTemplateData(
  core: PlopNextCore,
): Record<string, unknown> {
  return templateTreeToData(buildGeneratorTextsTree(core));
}

export function buildThemeTemplateSource(): string {
  const promptTypeLines = BUILT_IN_THEME_TYPES
    .map((promptType) => `  // ${promptType}: surcharge pour ce type de prompt uniquement.`)
    .join("\n");

  return [
    "import { styleText } from \"node:util\";",
    "import figures from \"figures\";",
    "",
    "// Template theme: toutes les sections disponibles avec commentaire de role.",
    "export const Theme = {",
    "  // Icones affichees dans les invites (curseur, etat coche/non coche, etc.).",
    "  icon: {",
    "    idle: styleText(\"blue\", \"?\"),",
    "    done: styleText(\"green\", figures.tick),",
    "    cursor: figures.pointer,",
    "    checked: styleText(\"green\", figures.circleFilled),",
    "    unchecked: figures.circle,",
    "    disabledChecked: styleText(\"green\", figures.circleDouble),",
    "    disabledUnchecked: \"-\",",
    "  },",
    "  // Prefixe affiche avant le message de prompt selon l'etat.",
    "  prefix: {",
    "    idle: styleText(\"blue\", \"?\"),",
    "    done: styleText(\"green\", figures.tick),",
    "  },",
    "  // Animation pendant les etats de chargement.",
    "  spinner: {",
    "    interval: 80,",
    "    frames: [\"⠋\", \"⠙\", \"⠹\", \"⠸\", \"⠼\", \"⠴\", \"⠦\", \"⠧\", \"⠇\", \"⠏\"].map((frame) => styleText(\"yellow\", frame)),",
    "  },",
    "  // Fonctions de style pour chaque segment d'UI.",
    "  style: {",
    "    answer: (text: string) => styleText(\"cyan\", text),",
    "    message: (text: string) => styleText(\"bold\", text),",
    "    error: (text: string) => styleText(\"red\", `> ${text}`),",
    "    defaultAnswer: (text: string) => styleText(\"dim\", `(${text})`),",
    "    help: (text: string) => styleText(\"dim\", text),",
    "    highlight: (text: string) => styleText(\"cyan\", text),",
    "    description: (text: string) => styleText(\"cyan\", text),",
    "    disabled: (text: string) => styleText(\"dim\", text),",
    "    disabledChoice: (text: string) => styleText(\"dim\", `- ${text}`),",
    "    searchTerm: (text: string) => styleText(\"cyan\", text),",
    "    key: (text: string) => styleText(\"cyan\", styleText(\"bold\", `<${text}>`)),",
    "    maskedText: \"[input is masked]\",",
    "    waitingMessage: (enterKey: string) => `Press ${enterKey} to launch your preferred editor.`,",
    "  },",
    "  // Comportement de validation (keep: conserve la valeur, clear: efface).",
    "  validationFailureMode: \"keep\",",
    "  // Affichage de l'index pour select/list (hidden | number).",
    "  indexMode: \"hidden\",",
    "  // Textes techniques inquirer lies au theme.",
    "  i18n: {",
    "    disabledError: \"This option is disabled and cannot be selected.\",",
    "  },",
    "  // Raccourcis supplementaires clavier.",
    "  keybindings: [],",
    "  // Styles propres a plop-next (menus, logs d'action, erreurs).",
    "  plopNext: {",
    "    menuTitle: (text: string) => styleText([\"bold\", \"underline\"], text),",
    "    welcome: (text: string) => styleText(\"dim\", text),",
    "    generatorMenu: {",
    "      title: (text: string) => styleText(\"bold\", text),",
    "      description: (text: string) => styleText(\"dim\", text),",
    "    },",
    "    actionLog: {",
    "      success: (text: string) => styleText(\"green\", text),",
    "      error: (text: string) => styleText(\"red\", text),",
    "      warning: (text: string) => styleText(\"yellow\", text),",
    "      skipped: (text: string) => styleText(\"yellow\", text),",
    "      info: (text: string) => styleText(\"dim\", text),",
    "    },",
    "    errors: {",
    "      prefix: {",
    "        error: \"✖\",",
    "        warning: \"⚠\",",
    "      },",
    "      error: (text: string) => styleText(\"red\", text),",
    "      warning: (text: string) => styleText(\"yellow\", text),",
    "    },",
    "  },",
    "",
    "  // Surcharges par type de prompt.",
    promptTypeLines,
    "  input: {},",
    "  select: {},",
    "  \"generator-select\": {},",
    "  list: {},",
    "  checkbox: {},",
    "  confirm: {},",
    "  search: {},",
    "  password: {},",
    "  expand: {},",
    "  editor: {},",
    "  number: {},",
    "  rawlist: {},",
    "} as const;",
    "",
    "export default Theme;",
    "",
  ].join("\n");
}

export function buildThemeTemplateData(): Record<string, unknown> {
  return {
    icon: {
      idle: "?",
      done: "v",
      cursor: ">",
      checked: "*",
      unchecked: "o",
      disabledChecked: "*",
      disabledUnchecked: "-",
    },
    prefix: {
      idle: "?",
      done: "v",
    },
    spinner: {
      interval: 80,
      frames: ["-", "\\", "|", "/"],
    },
    style: {},
    validationFailureMode: "keep",
    indexMode: "hidden",
    i18n: {
      disabledError: "This option is disabled and cannot be selected.",
    },
    keybindings: [],
    plopNext: {
      generatorMenu: {},
      actionLog: {},
      errors: {
        prefix: {
          error: "x",
          warning: "!",
        },
      },
    },
    input: {},
    select: {},
    "generator-select": {},
    list: {},
    checkbox: {},
    confirm: {},
    search: {},
    password: {},
    expand: {},
    editor: {},
    number: {},
    rawlist: {},
  };
}
