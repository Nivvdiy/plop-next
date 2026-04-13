# @plop-next/cli

[![npm version](https://img.shields.io/npm/v/@plop-next/cli)](https://www.npmjs.com/package/@plop-next/cli)
![downloads](https://img.shields.io/npm/dw/@plop-next/cli)
![license](https://img.shields.io/npm/l/@plop-next/cli)
![types](https://img.shields.io/npm/types/@plop-next/i18n)
![node](https://img.shields.io/node/v/@plop-next/cli)

[![docs](https://img.shields.io/badge/docs-online-blue)](https://nivvdiy.github.io/plop-next/)

CLI for **plop-next** — a modern, type-safe generator system.

---

## Features

- Interactive CLI (`plop-next`)
- TypeScript-first experience
- Fully extensible
- Plugin system support

---

## Installation

Install as a development dependency:

```bash
npm install -D @plop-next/cli
```

or:

```bash
yarn add -D @plop-next/cli
```

---

## Basic usage

Run the CLI from your project:

```bash
npx plop-next
```

or with a script:

```json
{
  "scripts": {
    "plop-next": "plop-next"
  }
}
```

Then run:

```bash
npm run plop-next
```

---

## Type-safe plopfile example

```ts
import type { PlopNext } from "@plop-next/cli";

export default function plop(plop: PlopNext) {
  plop.setGenerator("component", {
    description: "Create a component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Component name",
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/components/{{name}}.ts",
        template: "export const {{name}} = () => null;",
      },
    ],
  });
}
```

---

## Ecosystem

- @plop-next/core → internal engine
- @plop-next/i18n → internationalization plugin

---

## Links

- Documentation: [https://nivvdiy.github.io/plop-next/](https://nivvdiy.github.io/plop-next/)
- Repository: [https://github.com/Nivvdiy/plop-next](https://github.com/Nivvdiy/plop-next)
- Issues: [https://github.com/Nivvdiy/plop-next/issues](https://github.com/Nivvdiy/plop-next/issues)
