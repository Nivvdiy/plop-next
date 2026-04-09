# Plop-Next

Plop-Next is a micro-generator framework for scaffolding files and text-based project structures with consistent conventions.

It is inspired by Plop philosophy and rebuilt from scratch with a modern stack, including current Inquirer prompt workflows.

## Full Documentation

This README is a summary.

- Full docs: [https://nivvdiy.github.io/plop-next/](https://nivvdiy.github.io/plop-next/)

## Quick Start

### 1) Install

Install in your project:

| npm                                | pnpm                    | yarn                    | bun                    |
| ---------------------------------- | ----------------------- | ----------------------- | ---------------------- |
| `npm install --save-dev plop-next` | `pnpm add -D plop-next` | `yarn add -D plop-next` | `bun add -d plop-next` |

Optional global install:

| npm                        | pnpm                    | yarn                        | bun                    |
| -------------------------- | ----------------------- | --------------------------- | ---------------------- |
| `npm install -g plop-next` | `pnpm add -g plop-next` | `yarn global add plop-next` | `bun add -g plop-next` |

### 2) Initialize a plopfile

```bash
plop-next --init
```

- `--init` creates `plopfile.ts`
- `--init-ts` creates `plopfile.ts`
- `--init-js` creates `plopfile.js`

### 3) Minimal generator

```ts
import type { PlopNext } from "@plop-next/cli";

export default function plop(plop: PlopNext) {
  plop.registerGenerator("component", {
    description: "Create a component",
    prompts: [{ type: "input", name: "name", message: "Component name" }],
    actions: [
      {
        type: "add",
        path: "src/components/{{pascalCase name}}/{{pascalCase name}}.tsx",
        templateFile: "templates/component.tsx.hbs",
      },
    ],
  });
}
```

### 4) Run generators

```bash
plop-next
plop-next component
plop-next component "MyButton"
plop-next component -- --name "MyButton" --type ui
plop-next component --force
```

## CLI Essentials

### Init

```bash
plop-next --init
plop-next --init-ts
plop-next --init-js
```

Supported options:

- `--cwd <dir>` initialize in another directory
- `--demo` add demo generator content
- `--i18n` include i18n setup and install `@plop-next/i18n`

Behavior highlights:

- Init fails if `plopfile.ts` or `plopfile.js` already exists.
- If both `--init-ts` and `--init-js` are passed, JS wins.
- Dependencies are auto-installed when `package.json` exists.

### Generate

```bash
plop-next --generate locale fr
plop-next --generate texts fr
plop-next --generate theme
```

Short form:

```bash
plop-next -g locale fr
```

Supported options:

- `-P, --path <dir>` output base directory
- `-e, --extension <ext>` `ts`, `js`, or `json` (default `ts`)
- `--include-custom-texts` valid only with `--generate locale`
- `-f, --force` overwrite output files
- `--cwd <dir>` resolve generation from another working directory

Generated files:

- `locale` -> `locales/<locale>.locale.<ext>`
- `texts` -> `locales/<locale>.texts.<ext>`
- `theme` -> `theme.<ext>`

## API Summary

Main registration methods:

- `registerGenerator(name, config)` alias: `setGenerator`
- `registerPrompt(...)` alias: `setPrompt`
- `registerHelper(name, fn)` alias: `setHelper`
- `registerPartial(name, content)` alias: `setPartial`
- `registerActionType(name, fn)` alias: `setActionType`

Useful runtime/config methods:

- `setTheme(theme)` and `getTheme()`
- `setDestBasePath(path)` and `getDestBasePath()`
- `showWelcomeMessage(show)` and `showTitle(show)`
- `getGenerator(name)` and `getGeneratorList()`

## Built-in Actions

Plop-Next includes four built-in action types:

- `add` create one file
- `addMany` create multiple files from globs
- `modify` update existing file content by pattern
- `append` append content by pattern or at file end

Also supported in `actions` arrays:

- function actions `(answers, config, plopNext) => string | Promise<string>`
- comment strings (logged, no file operation)

## Built-in Helpers

Built-in helpers include:

- case helpers: `camelCase`, `pascalCase`, `dashCase`, `snakeCase`, `titleCase`, etc.
- `pkg` helper to read values from the nearest `package.json`

## Internationalization Summary

I18n is provided by optional package `@plop-next/i18n`.

Typical flow:

1. Install `@plop-next/i18n`
2. Create `new PlopNextI18n(plop)`
3. Register locales/texts
4. Enable with `plop.useI18n({ auto: true })` or `plop.useI18n({ force: "fr" })`

Built-in locales include `en`, `fr`, `es`, `pt`, `zh`.

## Theming Summary

Set a theme with `setTheme(objectOrPath)`.

Theme source can be:

- inline object
- `.json`, `.js`, `.cjs`, `.ts`, `.cts` file
- theme directory (merged)

Theme controls prompt visuals and Plop-Next CLI rendering, including menu, action logs, errors, icons, and style functions.

## Advanced Usage

For advanced workflows, Plop-Next supports:

- dynamic action arrays (sync or async)
- custom prompt handlers
- custom action types
- wrapper CLIs around prepare/execute flow
- i18n and theme deep customization

For complete API signatures and full examples, use the full documentation page.

## License

MIT. See [LICENSE](LICENSE.md).
