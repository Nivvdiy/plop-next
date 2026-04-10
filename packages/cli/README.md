# @plop-next/cli

CLI package for plop-next.

This package provides:

- the `plop-next` command line interface
- TypeScript-friendly public types for your plopfile

## Installation

Install as a development dependency:

```bash
npm install -D @plop-next/cli
```

or:

```bash
yarn add -D @plop-next/cli
```

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

## Links

- Documentation: [https://nivvdiy.github.io/plop-next/](https://nivvdiy.github.io/plop-next/)
- Repository: [https://github.com/Nivvdiy/plop-next](https://github.com/Nivvdiy/plop-next)
- Issues: [https://github.com/Nivvdiy/plop-next/issues](https://github.com/Nivvdiy/plop-next/issues)
