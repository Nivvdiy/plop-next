# @plop-next/core

Core engine for plop-next.

This package contains the low-level building blocks used by the CLI:

- generator registry and execution primitives
- prompt handler registry
- theming system
- error classes and utilities

If you only need the CLI, use `@plop-next/cli`.

## Installation

```bash
npm install @plop-next/core
```

or:

```bash
yarn add @plop-next/core
```

## Quick example

```ts
import { PlopNextCore } from "@plop-next/core";

const core = new PlopNextCore();

core.setGenerator("demo", {
  description: "Minimal generator",
  prompts: [],
  actions: [],
});

const generators = core.getGeneratorList();
console.log(generators.map((g) => ("name" in g ? g.name : "separator")));
```

## Common exports

- `PlopNextCore`
- `ActionRunner`
- `PromptHandlerRegistry`
- `registerBuiltInPromptHandlers`
- `defaultTheme`
- `ErrorHandler`
- `Separator`

## Development scripts

```bash
yarn workspace @plop-next/core build
yarn workspace @plop-next/core test
```

## Links

- Documentation: [https://nivvdiy.github.io/plop-next/](https://nivvdiy.github.io/plop-next/)
- Repository: [https://github.com/nivvdiy/plop-next](https://github.com/nivvdiy/plop-next)
- Issues: [https://github.com/nivvdiy/plop-next/issues](https://github.com/nivvdiy/plop-next/issues)
