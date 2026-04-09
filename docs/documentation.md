<script setup>
import { data } from './version.data.ts'
</script>

# Plop Next

<p><code>plop-next@{{ data.version }}</code> <em>- <a :href="`https://github.com/Nivvdiy/plop-next/releases/tag/v${data.version}`">plop-next@{{ data.version }}</a></em></p>
<p class="package-badges"><a href="https://www.npmjs.com/package/@plop-next/cli"><img src="https://img.shields.io/npm/dm/@plop-next/cli.svg" alt="npm downloads"></a><a href="https://www.npmjs.com/package/@plop-next/cli"><img src="https://img.shields.io/npm/v/@plop-next/cli.svg" alt="npm version"></a></p>

## Getting Started

### What is Plop Next?

Plop Next is inspired by Plop, and keeps the same "micro-generator framework" spirit while embracing modern tooling, including the latest Inquirer stack through `@inquirer/prompts`.

Plop Next is a small but powerful CLI designed to generate code and any other flat text files in a consistent, maintainable way. In real projects, teams repeatedly create the same kinds of structures over time: routes, controllers, services, components, tests, helpers, configuration files, and more. Those patterns evolve, and the "best" way to create a new file is often scattered across many existing examples in the codebase, which slows people down and creates drift between team members. Plop Next solves this by encoding your best practices directly in generators, so the standard way of creating files becomes the easiest way: run a command, answer prompts, and get files that already match your project conventions. Instead of searching for the right file to copy and manually adapting it, you automate that process with templates and prompt-driven decisions. At its core, Plop Next is glue code between `@inquirer/prompts` interactions and Handlebars templates, with a focus on keeping scaffolding workflows explicit, reusable, and easy to evolve as your architecture changes.

Useful links:

- Plop GitHub: [https://github.com/plopjs/plop](https://github.com/plopjs/plop)
- Plop documentation: [https://plopjs.com/](https://plopjs.com/)
- Plop npm: [https://www.npmjs.com/package/plop](https://www.npmjs.com/package/plop)
- Inquirer GitHub: [https://github.com/SBoudrias/Inquirer.js](https://github.com/SBoudrias/Inquirer.js)
- Inquirer npm: [https://www.npmjs.com/package/inquirer](https://www.npmjs.com/package/inquirer)

### Installation

#### 1. Add plop-next to your project

:::tabs key:package-manager variant:code
== npm

```bash
npm install --save-dev plop-next
```

== yarn

```bash
yarn add -D plop-next
```

== pnpm

```bash
pnpm add -D plop-next
```

== bun

```bash
bun add -d plop-next
```

:::

#### 2. Install plop-next globally (optional, but recommended for easy access)

:::tabs key:package-manager variant:code
== npm

```bash
npm install -g plop-next
```

== yarn

```bash
yarn global add plop-next
```

== pnpm

```bash
pnpm add -g plop-next
```

== bun

```bash
bun add -g plop-next
```

:::

#### 3. Create a plopfile at the root of your project

plop-next is TypeScript-first. By default, `plop-next --init` creates a `plopfile.ts`. JavaScript is still supported, but TypeScript is the recommended default.

:::tabs key:plopfile-lang variant:code
== plopfile.ts (recommended)

```ts
import type { PlopNext } from "@plop-next/cli";

export default function plop(plop: PlopNext) {
  // create your generators here
  plop.registerGenerator("basics", {
    description: "this is a skeleton plopfile",
    prompts: [], // array of inquirer prompts
    actions: [], // array of actions
  });
}
```

== plopfile.js (alternative)

```js
export default function plop(plop) {
  // create your generators here
  plop.registerGenerator("basics", {
    description: "this is a skeleton plopfile",
    prompts: [], // array of inquirer prompts
    actions: [], // array of actions
  });
}
```

:::

> `export default` works in Node.js when your file is loaded as ESM.
>
> Use one of these ESM options:
>
> - `plopfile.js` with `type: "module"` in `package.json`
> - `plopfile.mjs` with any `type` in `package.json`
> - `plopfile.ts` when your environment supports TypeScript loading
>
> If you prefer CommonJS, use `module.exports = function (plop) { ... }`.
>
> Use one of these CommonJS options:
>
> - `plopfile.js` with `type: "commonjs"` in `package.json`
> - `plopfile.cjs` with any `type` in `package.json`
> - `plopfile.cts` when your environment supports TypeScript loading

### Your First Plopfile

A plopfile starts as a Node module that exports a function receiving the `plop` instance as its first argument.

:::tabs key:plopfile-language variant:code
== TypeScript (recommended)

```ts
import type { PlopNext } from "@plop-next/cli";

export default function plop(plop: PlopNext) {}
```

== JavaScript (alternative)

```js
export default function plop(plop) {}
```

:::

The `plop` instance exposes the plop-next API, including `registerGenerator(name, config)`. This is where you declare the generators available in your project. When you run plop-next in this directory (or a sub-directory), you will see the list of declared generators.

Let's create a basic generator:

:::tabs key:plopfile-language variant:code
== TypeScript (recommended)

```ts
import type { PlopNext } from "@plop-next/cli";

export default function plop(plop: PlopNext) {
  // controller generator
  plop.registerGenerator("controller", {
    description: "application controller logic",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "controller name please",
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/{{name}}.ts",
        templateFile: "plop-templates/controller.hbs",
      },
    ],
  });
}
```

== JavaScript (alternative)

```js
export default function plop(plop) {
  // controller generator
  plop.registerGenerator("controller", {
    description: "application controller logic",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "controller name please",
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/{{name}}.js",
        templateFile: "plop-templates/controller.hbs",
      },
    ],
  });
}
```

:::

This `controller` generator asks one question and creates one file. You can scale this approach to multiple prompts and multiple actions to match your project needs.

### Using Prompts

plop-next relies on the modern Inquirer ecosystem (`@inquirer/prompts`) to collect input from users before running actions.

Prompt types and usage references:

- Inquirer repository: [https://github.com/SBoudrias/Inquirer.js](https://github.com/SBoudrias/Inquirer.js)
- Prompt packages: [https://github.com/SBoudrias/Inquirer.js/tree/main/packages](https://github.com/SBoudrias/Inquirer.js/tree/main/packages)

In practice, prompts let you ask for names, options, and choices, then reuse those answers in paths, templates, and conditional actions.

### CLI Usage

Once plop-next is installed and you have created a generator, you are ready to run it from the terminal.

Running `plop-next` with no parameters shows a list of available generators. You can also run `plop-next [generatorName]` to start one generator directly.

If you did not install a global command, add a script in your `package.json` and run it through your package manager:

```json
{
  "scripts": {
    "plop-next": "plop-next"
  }
}
```

:::tabs key:cli-run-script variant:code
== npm

```bash
npm run plop-next
npm run plop-next -- component
```

== yarn

```bash
yarn plop-next
yarn plop-next component
```

== pnpm

```bash
pnpm run plop-next
pnpm run plop-next -- component
```

== bun

```bash
bun run plop-next
bun run plop-next -- component
```

:::

#### Bypassing Prompts

Once you know a generator well, you can pass prompt answers directly from the command line.

If you have a `component` generator with one prompt (`name`), you can run it like this:

```bash
plop-next component "some component name"
```

If that same generator has a second prompt, only the first one is bypassed and the second one is still asked interactively.

Standard prompt types also try to interpret CLI values in a useful way:

- `confirm`: values like `y`, `yes`, `t`, or `true` are interpreted as `true`
- `list` and `rawlist`: you can select by value, key, index, or name
- `checkbox`: you can pass a comma-separated list to select multiple values

If you want to bypass the second prompt but not the first, use `_` as a skip marker:

```bash
plop-next component _ "input for second prompt"
```

plop-next includes bypass logic for standard prompt types, and custom prompt types can provide their own parsing logic when needed.

#### Bypassing Prompts by Name

You can also bypass prompts by prompt name using `--` followed by named arguments:

```bash
plop-next component -- --name "some component name" --type ui
```

This form is often easier to read when a generator has many prompts.

##### Bypass Examples

```bash
# Bypassing both prompt 1 and 2
plop-next component "my component" react
plop-next component -- --name "my component" --type react

# Bypassing only prompt 2 (you will still be prompted for name)
plop-next component _ react
plop-next component -- --type react
```

#### Running a Generator Forcefully

By default, plop-next keeps your files safe and fails when an operation looks unsafe. For example, an `add` action does not overwrite an existing file unless you explicitly allow it.

Actions can define their own `force` behavior, and you can also use `--force` on the CLI to force the whole run:

```bash
plop-next component --force
```

Using `--force` tells every action in the generator run to execute forcefully, so use it carefully.

#### Scripts with TypeScript by Node.js version

If your project runs plop-next with a TypeScript setup, script configuration can vary by Node.js version.

##### Node.js v22.18+

Use the standard script:

```json
{
  "scripts": {
    "plop-next": "plop-next"
  }
}
```

##### Node.js v20.x and below

Install `tsx` and optionally `cross-env`:

```bash
npm i -D tsx cross-env
```

Then configure the script with `NODE_OPTIONS`:

:::tabs key:node-tsx-loader variant:code
== Node.js v20.6 and above

```json
{
  "scripts": {
    "plop-next": "cross-env-shell \"NODE_OPTIONS=--import tsx\" plop-next --plopfile=plopfile.ts"
  }
}
```

== Node.js v20.5.1 and below

```json
{
  "scripts": {
    "plop-next": "cross-env-shell \"NODE_OPTIONS=--loader tsx\" plop-next --plopfile=plopfile.ts"
  }
}
```

:::

### Why Generators?

Because when your boilerplate lives outside your day-to-day feature code, you naturally spend more time refining it, improving it, and turning it into something your whole project can rely on.

Because saving yourself or your team even a few minutes every time you create a route, component, controller, helper, service, test, or configuration file adds up very quickly over the life of a project.

Because context switching is expensive: every time you stop to search for the right file to copy, remember naming conventions, or check how a pattern is currently implemented, you lose momentum. plop-next helps turn those repeated decisions into a fast, repeatable workflow so the recommended way to create something also becomes the easiest way.

## Plopfile API

The plopfile API is the collection of methods exposed by the `plop` object.
In plop-next, most workflows are centered around `registerGenerator(name, config)`.
`setGenerator(name, config)` is still available as a compatibility alias.

### JSDoc Support

Even if you write your plopfile in JavaScript, many editors provide autocomplete and inline documentation through JSDoc types.

```js
// plopfile.js
export default function plop(
  /** @type {import('@plop-next/cli').PlopNext} */
  plop,
) {
  // Plop-Next generator code
}
```

### Main Methods

These are the methods you will commonly use when creating a plopfile. Other methods that are mostly for internal use are listed in the [other methods](#other-methods) section.

Unlike Plop, `load` is not currently implemented in plop-next.

| Method                                                                                                   | Parameters                                                                                                                                                                                                                | Returns | Description                    |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------ |
| [**registerGenerator**](#register-a-generator)<span class="method-alias-separator"/>alias:`setGenerator` | _name: string,<br>config: [GeneratorConfig](#interface-generatorconfig)_                                                                                                                                                  | _this_  | setup a generator              |
| [**registerHelper**](#registerhelper)<span class="method-alias-separator"/>alias:`setHelper`             | _name: string,<br>helper: HandlebarsHelper_                                                                                                                                                                               | _this_  | setup a Handlebars helper      |
| [**registerPartial**](#registerpartial)<span class="method-alias-separator"/>alias:`setPartial`          | _name: string,<br>partial: string_                                                                                                                                                                                        | _this_  | setup a Handlebars partial     |
| [**registerActionType**](#registeractiontype)<span class="method-alias-separator"/>alias:`setActionType` | _name: string,<br>actionType: CustomActionFunction_                                                                                                                                                                       | _this_  | register a custom action type  |
| [**registerPrompt**](#registerprompt)<span class="method-alias-separator"/>alias:`setPrompt`             | _name: string,<br>prompt: PromptRenderer_<span class="method-alias-separator"/>_name: string,<br>prompt: PromptRenderer,<br>options: RegisterPromptOptions_<span class="method-alias-separator"/>_handler: PromptHandler_ | _this_  | registers a custom prompt type |

### registerHelper

`registerHelper` directly corresponds to the Handlebars method `registerHelper`.
If you are already familiar with [Handlebars helpers](https://handlebarsjs.com/guide/expressions.html#helpers), the behavior is the same in plop-next.
`setHelper` is still available as a backward-compatible alias.

:::tabs key:register-helper-lang variant:code

== plopfile.ts

```ts
import type { PlopNext } from "@plop-next/cli";

export default function plop(plop: PlopNext) {
  plop.registerHelper("upperCase", function (text: string) {
    return text.toUpperCase();
  });

  // or with an arrow function
  plop.registerHelper("shout", (text: string) => text.toUpperCase());
}
```

== plopfile.js

```js
export default function plop(plop) {
  plop.registerHelper("upperCase", function (text) {
    return text.toUpperCase();
  });

  // or with an arrow function
  plop.registerHelper("shout", (text) => text.toUpperCase());
}
```

:::

You can then use the helper in your templates, for example with <code v-pre>{{upperCase name}}</code>.

### registerPartial

`registerPartial` directly corresponds to the Handlebars method `registerPartial`.
If you are already familiar with [Handlebars partials](https://handlebarsjs.com/guide/partials.html), the behavior is the same in plop-next.
`setPartial` is still available as a backward-compatible alias.

:::tabs key:register-partial-lang variant:code

== plopfile.ts

```ts
import type { PlopNext } from "@plop-next/cli";

export default function plop(plop: PlopNext) {
  plop.registerPartial("myTitlePartial", "<h1>{{titleCase name}}</h1>");
}
```

== plopfile.js

```js
export default function plop(plop) {
  plop.registerPartial("myTitlePartial", "<h1>{{titleCase name}}</h1>");
}
```

:::

You can then use the partial in your templates, for example with <code v-pre>{{> myTitlePartial }}</code>.

### registerActionType

`registerActionType` allows you to create your own actions (similar to `add` or `modify`) that can be used in your plopfiles.
These are highly reusable custom action functions. `setActionType` is still available as a backward-compatible alias.

#### _FunctionSignature_ CustomActionFunction

| Parameter    | Type                  | Description                                         |
| ------------ | --------------------- | --------------------------------------------------- |
| **answers**  | `Record<string, any>` | Answers to the generator prompts                    |
| **config**   | `ActionConfig`        | The object in the `actions` array for the generator |
| **plopNext** | `PlopNext`            | The plop-next API instance for the current plopfile |

The function must return a `string` (success message) or `Promise<string>`. Throw a string or an `Error` to signal failure.

:::tabs key:register-action-type-lang variant:code

== plopfile.ts

```ts
import type { PlopNext, ActionConfig } from "@plop-next/cli";

export default function plop(plop: PlopNext) {
  plop.registerActionType(
    "doTheThing",
    function (answers, config: ActionConfig, plopNext) {
      // do something
      doSomething(config.configProp);
      // if something went wrong
      throw "error message";
      // otherwise
      return "success status message";
    },
  );

  // or do async things inside of an action
  plop.registerActionType(
    "doTheAsyncThing",
    function (answers, config: ActionConfig, plopNext) {
      return new Promise<string>((resolve, reject) => {
        if (success) {
          resolve("success status message");
        } else {
          reject("error message");
        }
      });
    },
  );

  // use the custom action
  plop.registerGenerator("test", {
    prompts: [],
    actions: [
      {
        type: "doTheThing",
        configProp: "available from the config param",
      },
      {
        type: "doTheAsyncThing",
        speed: "slow",
      },
    ],
  });
}
```

== plopfile.js

```js
export default function plop(plop) {
  plop.registerActionType("doTheThing", function (answers, config, plopNext) {
    // do something
    doSomething(config.configProp);
    // if something went wrong
    throw "error message";
    // otherwise
    return "success status message";
  });

  // or do async things inside of an action
  plop.registerActionType(
    "doTheAsyncThing",
    function (answers, config, plopNext) {
      return new Promise((resolve, reject) => {
        if (success) {
          resolve("success status message");
        } else {
          reject("error message");
        }
      });
    },
  );

  // use the custom action
  plop.registerGenerator("test", {
    prompts: [],
    actions: [
      {
        type: "doTheThing",
        configProp: "available from the config param",
      },
      {
        type: "doTheAsyncThing",
        speed: "slow",
      },
    ],
  });
}
```

:::

### registerPrompt

`registerPrompt` lets you register custom prompt types for use in your generators.
`setPrompt` is still available as a backward-compatible alias.

plop-next supports three signatures:

| Signature                               | When to use                                                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `registerPrompt(name, prompt)`          | Legacy Inquirer-style prompt renderer                                                                        |
| `registerPrompt(name, prompt, options)` | Renderer with theme/i18n options → see [Theming](#theming) and [Internationalization](#internationalization) |
| `registerPrompt(handler)`               | Modern typed `PromptHandler` object                                                                          |

#### registerPrompt(name: string, prompt: PromptRenderer)

Any function compatible with `@inquirer/prompts` or older Inquirer plugins can be registered by name.

:::tabs key:register-prompt-renderer-lang variant:code

== plopfile.ts

```ts
import type { PlopNext } from "@plop-next/cli";
import autocompletePrompt from "inquirer-autocomplete-prompt";

export default function plop(plop: PlopNext) {
  plop.registerPrompt("autocomplete", autocompletePrompt);

  plop.registerGenerator("test", {
    prompts: [
      {
        type: "autocomplete",
        name: "target",
        message: "Choose a target",
        source: (_answers: unknown, input: string) => filterChoices(input),
      },
    ],
    actions: [],
  });
}
```

== plopfile.js

```js
import autocompletePrompt from "inquirer-autocomplete-prompt";

export default function plop(plop) {
  plop.registerPrompt("autocomplete", autocompletePrompt);

  plop.registerGenerator("test", {
    prompts: [
      {
        type: "autocomplete",
        name: "target",
        message: "Choose a target",
        source: (_answers, input) => filterChoices(input),
      },
    ],
    actions: [],
  });
}
```

:::

#### registerPrompt(name: string, prompt: PromptRenderer, options: RegisterPromptOptions)

See [Theming](#theming) and [Internationalization](#internationalization) for the full documentation of `RegisterPromptOptions` (`theme` and `translatableFields`).

#### registerPrompt(handler: PromptHandler)

A `PromptHandler` is a typed object with a `types` array and an `ask()` method — the recommended approach for new custom prompts.

:::tabs key:register-prompt-handler-lang variant:code

== plopfile.ts

```ts
import type { PlopNext } from "@plop-next/cli";
import type { PromptHandler, PromptHandlerConfig } from "@plop-next/cli";

const datepickerHandler: PromptHandler = {
  types: ["datepicker"],
  async ask(_type: string, config: PromptHandlerConfig) {
    return myDatePickerLib({ message: String(config.message ?? "") });
  },
};

export default function plop(plop: PlopNext) {
  plop.registerPrompt(datepickerHandler);

  plop.registerGenerator("test", {
    prompts: [{ type: "datepicker", name: "date", message: "Pick a date" }],
    actions: [],
  });
}
```

== plopfile.js

```js
const datepickerHandler = {
  types: ["datepicker"],
  async ask(_type, config) {
    return myDatePickerLib({ message: String(config.message ?? "") });
  },
};

export default function plop(plop) {
  plop.registerPrompt(datepickerHandler);

  plop.registerGenerator("test", {
    prompts: [{ type: "datepicker", name: "date", message: "Pick a date" }],
    actions: [],
  });
}
```

:::

### Register a Generator

`registerGenerator` is the method used to declare a named generator in your plopfile.
The generator config must include `prompts` and `actions`; `description` is optional.
`setGenerator` is still available as a backward-compatible alias.

Unlike Plop, plop-next does not expose a public `PlopGenerator` interface from `registerGenerator`.
The method is fluent and returns the `plop` instance itself.

:::tabs key:register-generator-lang variant:code

== plopfile.ts

```ts
import type { PlopNext } from "@plop-next/cli";

export default function plop(plop: PlopNext) {
  plop.registerGenerator("component", {
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
        path: "src/components/{{pascalCase name}}/{{pascalCase name}}.tsx",
        templateFile: "templates/component.hbs",
      },
    ],
  });
}
```

== plopfile.js

```js
export default function plop(plop) {
  plop.registerGenerator("component", {
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
        path: "src/components/{{pascalCase name}}/{{pascalCase name}}.tsx",
        templateFile: "templates/component.hbs",
      },
    ],
  });
}
```

:::

#### _Interface_ GeneratorConfig

| Property        | Type            | Required | Description                                                  |
| --------------- | --------------- | -------- | ------------------------------------------------------------ |
| **description** | `string`        | No       | Short description shown in generator selection               |
| **prompts**     | `PlopPrompt[]`  | Yes      | Questions asked before actions run                           |
| **actions**     | `ActionsConfig` | Yes      | Actions to execute, either as an array or a dynamic function |

`ActionsConfig` is `Action[] | DynamicActionsFn`.
If you need actions to depend on previous answers, use a function with the signature `((answers) => Action[] | Promise<Action[]>)`.

#### _Interface_ ActionConfig

The properties below are the standard action fields handled by plop-next.
Additional properties can be added for custom action types registered with [registerActionType](#registeractiontype).

| Property            | Type                      | Description                                                                   |
| ------------------- | ------------------------- | ----------------------------------------------------------------------------- |
| **type**            | `ActionType`              | Action type, such as `add`, `modify`, `append`, or a custom registered type   |
| **path**            | `string`                  | Destination path used by file-based actions                                   |
| **template**        | `string`                  | Inline template source                                                        |
| **templateFile**    | `string`                  | Path to a template file                                                       |
| **pattern**         | `RegExp \| string`        | Search pattern used by update-style actions                                   |
| **transform**       | `TransformFn`             | Optional content transform before writing                                     |
| **skip**            | `SkipFn`                  | Return `true`, `false`, or a reason string to control whether the action runs |
| **skipIfExists**    | `boolean`                 | Skip creation when the destination already exists                             |
| **force**           | `boolean`                 | Force behavior when supported by the action                                   |
| **unique**          | `boolean`                 | Prevent duplicate appended content when supported                             |
| **separator**       | `string`                  | Separator used by append-style actions                                        |
| **destination**     | `string`                  | Destination directory, typically for bulk actions                             |
| **base**            | `string`                  | Base directory used for template expansion                                    |
| **templateFiles**   | `string \| string[]`      | One or more template file globs                                               |
| **stripExtensions** | `string[]`                | Extensions removed from generated output paths                                |
| **globOptions**     | `Record<string, unknown>` | Glob behavior overrides                                                       |
| **verbose**         | `boolean`                 | Emit more detailed execution output                                           |
| **abortOnFail**     | `boolean`                 | Stop remaining actions after a failure                                        |
| **data**            | `Record<string, unknown>` | Extra data merged into the template context                                   |

`ActionConfig` is extensible, so custom action types can require extra properties beyond this base shape.

### Other Methods

These methods are also exposed by plop-next.
They are less central than the main registration methods, but several are still useful when you need to inspect the current configuration, customize the CLI experience, or resolve templates manually.

| Method                  | Parameters                                        | Returns                             | Description                                                                                                   |
| ----------------------- | ------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `addSeparator`          | `text?: string`                                   | `this`                              | Adds a separator entry to the generator selection menu                                                        |
| `getHelper`             | `name: string`                                    | `HandlebarsHelper \| undefined`     | Gets a registered helper by name                                                                              |
| `getHelperList`         |                                                   | `string[]`                          | Gets the list of registered helper names                                                                      |
| `getPartial`            | `name: string`                                    | `string \| undefined`               | Gets a registered partial by name when it is stored as a raw string                                           |
| `getPartialList`        |                                                   | `string[]`                          | Gets the list of registered partial names                                                                     |
| `getActionType`         | `name: string`                                    | `CustomActionFunction \| undefined` | Gets a registered custom action type                                                                          |
| `getActionTypeList`     |                                                   | `string[]`                          | Gets the list of registered custom action type names                                                          |
| `getPrompt`             | `name: string`                                    | `PromptRenderer \| undefined`       | Gets a legacy custom prompt renderer by name                                                                  |
| `getPromptList`         |                                                   | `string[]`                          | Gets the list of registered legacy custom prompt names                                                        |
| `getPromptHandlerTypes` |                                                   | `string[]`                          | Gets the prompt type strings handled by registered `PromptHandler` objects                                    |
| `getGenerator`          | `name: string`                                    | `GeneratorConfig \| undefined`      | Gets a generator config by name                                                                               |
| `getGeneratorList`      |                                                   | `GeneratorMenuItem[]`               | Gets generator menu items in display order, including separators                                              |
| `showWelcomeMessage`    | `show = true`                                     | `this`                              | Shows or hides the localized welcome message in the CLI                                                       |
| `getWelcomeMessage`     |                                                   | `string \| null`                    | Gets the resolved welcome message from the active i18n adapter                                                |
| `isWelcomeMessageShown` |                                                   | `boolean`                           | Tells whether the welcome message is currently enabled                                                        |
| `showTitle`             | `show = true`                                     | `this`                              | Shows or hides the CLI title block                                                                            |
| `isTitleShown`          |                                                   | `boolean`                           | Tells whether the title block is currently enabled                                                            |
| `setGeneratorPageSize`  | `pageSize: number`                                | `this`                              | Sets the page size used by the generator selection prompt                                                     |
| `getGeneratorPageSize`  |                                                   | `number`                            | Gets the current generator selection page size                                                                |
| `setPlopfilePath`       | `path: string`                                    | `this`                              | Sets the plopfile path and updates the derived base destination path                                          |
| `getPlopfilePath`       |                                                   | `string \| undefined`               | Gets the resolved plopfile path                                                                               |
| `setDestBasePath`       | `path: string`                                    | `this`                              | Overrides the base path used for generated files and relative resources                                       |
| `getDestBasePath`       |                                                   | `string`                            | Gets the current base destination path                                                                        |
| `setDefaultInclude`     | `include: DefaultIncludeConfig`                   | `this`                              | Stores default include metadata for compatibility with `load`; of limited use while `load` is not implemented |
| `getDefaultInclude`     |                                                   | `DefaultIncludeConfig`              | Gets the stored default include metadata                                                                      |
| `renderString`          | `template: string, data: Record<string, unknown>` | `string`                            | Renders a Handlebars template string with the provided data                                                   |
| `addTexts`              | `locale: LocaleTag, texts: LocaleTexts`           | `this`                              | Adds or overrides i18n messages for a locale (legacy alias; use `registerTexts` instead)                      |

plop-next also exposes dedicated methods for theming and internationalization, such as `setTheme()`, `getTheme()`, `useI18n()`, `registerTexts()`, `registerLocale()`, `registerLocales()`, `registerText()`, `setLocale()`, and `hasLocale()`.
Those are documented in the [Theming](#theming) and [Internationalization](#internationalization) chapters.

## Built-in Actions

There are several built-in action types you can use in [GeneratorConfig](#interface-generatorconfig).
You select the action with the `type` field and provide the action-specific properties.
Relative paths are resolved from the active plopfile location (or from the destination base path if no plopfile path is set).

The `add`, `addMany`, and `modify` actions support an optional `transform` function.
Its signature is `(input: string, data: Record<string, unknown>) => string | Promise<string>`.

### add

The `add` action creates a file.
The `path` field is a Handlebars template used to build the output file path.
Content comes from either `template` or `templateFile`.

| Property         | Type                      | Default | Description                                                                                               |
| ---------------- | ------------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| **path**         | `string`                  |         | A Handlebars template that resolves to the output file path                                               |
| **template**     | `string`                  |         | Inline Handlebars template used to generate file contents                                                 |
| **templateFile** | `string`                  |         | Path to a template file (`.hbs` for example)                                                              |
| **skipIfExists** | `boolean`                 | `false` | Skip file creation when the destination already exists                                                    |
| **transform**    | `TransformFn`             |         | Optional transform applied to rendered content before writing                                             |
| **skip**         | `SkipFn`                  |         | Inherited from [ActionConfig](#interface-actionconfig); skip action conditionally                         |
| **force**        | `boolean`                 | `false` | Inherited from [ActionConfig](#interface-actionconfig); overwrite existing files                          |
| **data**         | `Record<string, unknown>` | `{}`    | Inherited from [ActionConfig](#interface-actionconfig); merged with prompt answers for template rendering |
| **abortOnFail**  | `boolean`                 | `true`  | Inherited from [ActionConfig](#interface-actionconfig); stop remaining actions on failure                 |

:::tabs key:built-in-add-lang variant:code

== TypeScript

```ts
import type { PlopNext } from "@plop-next/cli";

export default function plop(plop: PlopNext) {
  plop.registerGenerator("component", {
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
        path: "src/components/{{pascalCase name}}/{{pascalCase name}}.tsx",
        templateFile: "templates/component.hbs",
        skipIfExists: true,
      },
    ],
  });
}
```

== JavaScript

```js
export default function plop(plop) {
  plop.registerGenerator("component", {
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
        path: "src/components/{{pascalCase name}}/{{pascalCase name}}.tsx",
        templateFile: "templates/component.hbs",
        skipIfExists: true,
      },
    ],
  });
}
```

:::

### addMany

The `addMany` action lets you generate multiple files in one step.
`destination` is a Handlebars template for the output folder, and `templateFiles` is a glob (or a list of globs) used to find source templates.

If `base` is provided, plop-next keeps each matched file path relative to `base`; otherwise it keeps only the basename.
After that, file names are interpolated with Handlebars and extensions from `stripExtensions` are removed.

| Property            | Type                      | Default   | Description                                                                                      |
| ------------------- | ------------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| **destination**     | `string`                  |           | Handlebars template that resolves to the destination folder                                      |
| **base**            | `string`                  |           | Base directory removed from matched template file paths                                          |
| **templateFiles**   | `string \| string[]`      |           | Glob pattern(s) used to match template files                                                     |
| **stripExtensions** | `string[]`                | `['hbs']` | File extensions removed from output names                                                        |
| **globOptions**     | `Record<string, unknown>` | `{}`      | Options forwarded to the glob matcher                                                            |
| **transform**       | `TransformFn`             |           | Optional transform applied to each rendered file before write                                    |
| **skip**            | `SkipFn`                  |           | Inherited from [ActionConfig](#interface-actionconfig); skip action conditionally                |
| **skipIfExists**    | `boolean`                 | `false`   | Skip files that already exist                                                                    |
| **force**           | `boolean`                 | `false`   | Inherited from [ActionConfig](#interface-actionconfig); overwrite existing files                 |
| **data**            | `Record<string, unknown>` | `{}`      | Inherited from [ActionConfig](#interface-actionconfig); merged with prompt answers for rendering |
| **abortOnFail**     | `boolean`                 | `true`    | Inherited from [ActionConfig](#interface-actionconfig); stop remaining actions on failure        |
| **verbose**         | `boolean`                 |           | Present in `ActionConfig`, currently not consumed by `ActionRunner`                              |

:::tabs key:built-in-add-many-lang variant:code

== TypeScript

```ts
import type { PlopNext } from "@plop-next/cli";

export default function plop(plop: PlopNext) {
  plop.registerGenerator("feature", {
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Feature name",
      },
    ],
    actions: [
      {
        type: "addMany",
        destination: "src/features/{{kebabCase name}}",
        base: "templates/feature",
        templateFiles: "templates/feature/**/*.hbs",
        stripExtensions: ["hbs"],
        skipIfExists: true,
      },
    ],
  });
}
```

== JavaScript

```js
export default function plop(plop) {
  plop.registerGenerator("feature", {
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Feature name",
      },
    ],
    actions: [
      {
        type: "addMany",
        destination: "src/features/{{kebabCase name}}",
        base: "templates/feature",
        templateFiles: "templates/feature/**/*.hbs",
        stripExtensions: ["hbs"],
        skipIfExists: true,
      },
    ],
  });
}
```

:::

### modify

The `modify` action updates an existing file.
It first applies a find/replace using `pattern` and a replacement from `template` or `templateFile`, then applies `transform` if provided.

Both `pattern` and `transform` can be used together; `transform` runs last.
If the target file does not exist, or if the pattern does not match, the action fails.

| Property         | Type                      | Default                   | Description                                                                                      |
| ---------------- | ------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------ |
| **path**         | `string`                  |                           | Handlebars template that resolves to the file to modify                                          |
| **pattern**      | `RegExp \| string`        | `"$"` (compiled with `g`) | Pattern used to match content to replace                                                         |
| **template**     | `string`                  | `""`                      | Inline replacement template                                                                      |
| **templateFile** | `string`                  |                           | File containing the replacement template                                                         |
| **transform**    | `TransformFn`             |                           | Optional transform applied after replacement and before writing                                  |
| **skip**         | `SkipFn`                  |                           | Inherited from [ActionConfig](#interface-actionconfig); skip action conditionally                |
| **data**         | `Record<string, unknown>` | `{}`                      | Inherited from [ActionConfig](#interface-actionconfig); merged with prompt answers for rendering |
| **abortOnFail**  | `boolean`                 | `true`                    | Inherited from [ActionConfig](#interface-actionconfig); stop remaining actions on failure        |

When `pattern` is provided as a string, plop-next compiles it with `new RegExp(pattern, "g")`.

:::tabs key:built-in-modify-lang variant:code

== TypeScript

```ts
import type { PlopNext } from "@plop-next/cli";

export default function plop(plop: PlopNext) {
  plop.registerGenerator("export", {
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Symbol name",
      },
    ],
    actions: [
      {
        type: "modify",
        path: "src/index.ts",
        pattern: /\/\* PLOP:EXPORTS \*\//g,
        template: "export * from './{{kebabCase name}}';\\n/* PLOP:EXPORTS */",
      },
    ],
  });
}
```

== JavaScript

```js
export default function plop(plop) {
  plop.registerGenerator("export", {
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Symbol name",
      },
    ],
    actions: [
      {
        type: "modify",
        path: "src/index.ts",
        pattern: /\/\* PLOP:EXPORTS \*\//g,
        template: "export * from './{{kebabCase name}}';\\n/* PLOP:EXPORTS */",
      },
    ],
  });
}
```

:::

### append

The `append` action is a focused variant of `modify`.
It appends rendered content either at locations matched by `pattern`, or at the end of the file when no pattern is provided.

Unlike `modify`, if the target file does not exist, plop-next starts from an empty string and creates it.

| Property         | Type                      | Default | Description                                                                                      |
| ---------------- | ------------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| **path**         | `string`                  |         | Handlebars template that resolves to the target file path                                        |
| **pattern**      | `RegExp \| string`        |         | Pattern used to choose where to append content                                                   |
| **unique**       | `boolean`                 | `true`  | When `true`, skips appending if the exact rendered addition already exists                       |
| **separator**    | `string`                  | `""`    | String inserted between the matched text and the appended content when `pattern` is used         |
| **template**     | `string`                  | `""`    | Inline template used for the appended entry                                                      |
| **templateFile** | `string`                  |         | File containing the appended template                                                            |
| **skip**         | `SkipFn`                  |         | Inherited from [ActionConfig](#interface-actionconfig); skip action conditionally                |
| **data**         | `Record<string, unknown>` | `{}`    | Inherited from [ActionConfig](#interface-actionconfig); merged with prompt answers for rendering |
| **abortOnFail**  | `boolean`                 | `true`  | Inherited from [ActionConfig](#interface-actionconfig); stop remaining actions on failure        |

When `pattern` is a string, plop-next compiles it with `new RegExp(String(pattern), "g")`.

:::tabs key:built-in-append-lang variant:code

== TypeScript

```ts
import type { PlopNext } from "@plop-next/cli";

export default function plop(plop: PlopNext) {
  plop.registerGenerator("index-export", {
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Module name",
      },
    ],
    actions: [
      {
        type: "append",
        path: "src/index.ts",
        pattern: /\/\* PLOP:EXPORTS \*\//g,
        separator: "\n",
        template: "export * from './{{kebabCase name}}';",
        unique: true,
      },
    ],
  });
}
```

== JavaScript

```js
export default function plop(plop) {
  plop.registerGenerator("index-export", {
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Module name",
      },
    ],
    actions: [
      {
        type: "append",
        path: "src/index.ts",
        pattern: /\/\* PLOP:EXPORTS \*\//g,
        separator: "\n",
        template: "export * from './{{kebabCase name}}';",
        unique: true,
      },
    ],
  });
}
```

:::

### custom (action function)

Besides object actions (`add`, `addMany`, `modify`, `append`), you can place a function directly inside the `actions` array.

This function uses the same shape as `CustomActionFunction`:

```ts
(answers: Record<string, any>, config: ActionConfig, plopNext: unknown) =>
  string | Promise<string>;
```

Runtime behavior in plop-next:

- The function is awaited before the next action runs.
- Returning a string marks success and is displayed in action output.
- Returning a promise delays the next action until it resolves.
- Throwing (or rejecting) marks the step as an error.

:::tabs key:built-in-custom-action-function-lang variant:code

== TypeScript

```ts
import type { PlopNext } from "@plop-next/cli";

export default function plop(plop: PlopNext) {
  plop.registerGenerator("custom-action", {
    prompts: [{ type: "input", name: "name", message: "Name" }],
    actions: [
      async (answers, _config, plopNext) => {
        const value = String(answers.name ?? "");
        if (!value) {
          throw new Error("Name is required");
        }

        // You can call API helpers from plopNext when needed.
        const rendered = plopNext.renderString("{{pascalCase name}}", {
          name: value,
        });

        await doSomethingAsync(rendered);
        return `Custom action completed for ${rendered}`;
      },
    ],
  });
}
```

== JavaScript

```js
export default function plop(plop) {
  plop.registerGenerator("custom-action", {
    prompts: [{ type: "input", name: "name", message: "Name" }],
    actions: [
      async (answers, _config, plopNext) => {
        const value = String(answers.name ?? "");
        if (!value) {
          throw new Error("Name is required");
        }

        const rendered = plopNext.renderString("{{pascalCase name}}", {
          name: value,
        });

        await doSomethingAsync(rendered);
        return `Custom action completed for ${rendered}`;
      },
    ],
  });
}
```

:::

Note: in the current implementation, `abortOnFail` is evaluated on object actions.
For function actions, errors are reported as failed steps, but they do not trigger `abortOnFail` checks.

### comments

Comment lines can be added to the `actions` array by inserting a string instead of an action object.
When plop-next reaches this entry, it records a `comment` success step and prints the message.
Comment entries do not perform file operations and do not modify data.

:::tabs key:built-in-comments-lang variant:code

== TypeScript

```ts
import type { PlopNext } from "@plop-next/cli";

export default function plop(plop: PlopNext) {
  plop.registerGenerator("component", {
    prompts: [{ type: "input", name: "name", message: "Component name" }],
    actions: [
      "Scaffolding component files...",
      {
        type: "add",
        path: "src/components/{{pascalCase name}}/{{pascalCase name}}.tsx",
        templateFile: "templates/component.hbs",
      },
      "Component scaffold complete.",
    ],
  });
}
```

== JavaScript

```js
export default function plop(plop) {
  plop.registerGenerator("component", {
    prompts: [{ type: "input", name: "name", message: "Component name" }],
    actions: [
      "Scaffolding component files...",
      {
        type: "add",
        path: "src/components/{{pascalCase name}}/{{pascalCase name}}.tsx",
        templateFile: "templates/component.hbs",
      },
      "Component scaffold complete.",
    ],
  });
}
```

:::

## Built-in Helpers

plop-next ships with a set of built-in Handlebars helpers.
Most of them are case modifiers, plus a helper to read values from `package.json`.

### Case modifiers

- **camelCase**: `changeFormatToThis`
- **snakeCase**: `change_format_to_this`
- **dashCase / kebabCase**: `change-format-to-this`
- **dotCase**: `change.format.to.this`
- **pathCase**: `change/format/to/this`
- **properCase / pascalCase**: `ChangeFormatToThis`
- **lowerCase**: `change format to this`
- **upperCase**: `CHANGE FORMAT TO THIS`
- **sentenceCase**: `Change format to this`
- **constantCase**: `CHANGE_FORMAT_TO_THIS`
- **titleCase**: `Change Format To This`

### Other helpers

- **pkg**: reads a property from the `package.json` located near the active plopfile.
  Use dot-path syntax, for example <code v-pre>{{pkg "name"}}</code> or <code v-pre>{{pkg "scripts.build"}}</code>.

## Internationalization

### Setup and activation

plop-next supports i18n through the optional package `@plop-next/i18n`.
This plugin installs an i18n adapter on the `plop` instance so prompt labels, help texts, and CLI messages can be translated.

:::tabs key:package-manager variant:code
== npm

```bash
npm install --save-dev @plop-next/i18n
```

== yarn

```bash
yarn add -D @plop-next/i18n
```

== pnpm

```bash
pnpm add -D @plop-next/i18n
```

== bun

```bash
bun add -d @plop-next/i18n
```

:::

Typical setup flow:

1. Create `new PlopNextI18n(plop)`
2. Register locale content (`registerTexts`, `registerLocale`, `registerLocales`)
3. Enable i18n with `plop.useI18n(...)`
4. Optionally force or switch locale with `setLocale(...)`

:::tabs key:i18n-setup-lang variant:code

== TypeScript

```ts
import type { PlopNext } from "@plop-next/cli";
import { PlopNextI18n } from "@plop-next/i18n";

export default function plop(plop: PlopNext) {
  const i18n = new PlopNextI18n(plop);

  // Load theme once — subsequent setTheme calls will replace it entirely
  plop.setTheme("./themes/light.json");

  // Register i18n locales
  i18n.registerTexts("en", {
    component: {
      description: "Create a component",
      name: { message: "Component name?" },
    },
  });

  i18n.registerTexts("fr", {
    component: {
      description: "Créer un composant",
      name: { message: "Nom du composant ?" },
    },
  });

  plop.useI18n({ auto: true });
}
```

== JavaScript

```js
import { PlopNextI18n } from "@plop-next/i18n";

export default function plop(plop) {
  const i18n = new PlopNextI18n(plop);

  // Load theme once — subsequent setTheme calls will replace it entirely
  plop.setTheme("./themes/light.json");

  // Register i18n locales
  i18n.registerTexts("en", {
    component: {
      description: "Create a component",
      name: { message: "Component name?" },
    },
  });

  i18n.registerTexts("fr", {
    component: {
      description: "Créer un composant",
      name: { message: "Nom du composant ?" },
    },
  });

  plop.useI18n({ auto: true });
}
```

:::

### Registering locales and texts

Most i18n methods are available directly on `plop` once the plugin is installed:

| Method                                      | Purpose                                               |
| ------------------------------------------- | ----------------------------------------------------- |
| `useI18n(options)`                          | Enable i18n (`auto` detection or `force` locale)      |
| `isI18nEnabled()`                           | Check whether i18n is enabled                         |
| `registerTexts(...)`                        | Register texts from objects, files, or locale folders |
| `registerLocale(locale, messages, options)` | Register a full locale map                            |
| `registerLocales(locales, options)`         | Register multiple locales at once                     |
| `registerText(locale, path, text)`          | Override one translation key                          |
| `setLocale(locale)` / `getLocale()`         | Set or read active locale                             |
| `hasLocale(locale)`                         | Check if a locale is available                        |

#### registerLocale(s) vs registerText(s)

Use `registerLocale(...)` and `registerLocales(...)` when you introduce a locale that does not exist yet.

Use `registerTexts(...)` and `registerText(...)` when you enrich or override translations for an already registered locale.

Practical difference:

- `registerLocale(s)` is locale-first: it registers full locale maps and, for a new locale, initializes locale context (including inherited help texts fallback).
- `registerText(s)` is patch-first: it merges updates into existing keys, often for incremental overrides.

Important note: `registerText(s)` can still create a locale implicitly if it does not exist yet. In documentation and team conventions, however, prefer `registerLocale(s)` for first registration and keep `registerText(s)` for updates.

### Loading locales from files

In addition to inline objects, i18n methods accept file paths and directory paths.

Supported formats include `.json`, `.js`, `.cjs`, `.ts`, and `.cts` files.

| Input kind          | Example                                     | Notes                                                                                                                  |
| ------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Single file         | `i18n.registerTexts("./locales/en.json")`   | File can contain one locale object or a locales bundle.                                                                |
| Scoped text files   | `i18n.registerTexts("./texts")` (directory) | Uses the `locale.texts.ts` / `locale.texts.js` / `locale.texts.json` pattern (for example `en.texts.json`).            |
| Generic directory   | `i18n.registerLocale("./locales")`          | Loads all `.json`, `.js`, `.cjs`, `.ts`, `.cts` files from directory and merges them (use with `registerLocale` only). |
| Scoped locale files | `i18n.registerLocales("./locales")`         | Uses the `locale.locale.ts` / `locale.locale.js` / `locale.locale.json` pattern (for example `fr.locale.ts`).          |

> **Note:** Relative paths are resolved from `process.cwd()` (the current working directory), not from the plopfile location. This differs from `setTheme`, which resolves relative to the plopfile.

:::tabs key:i18n-file-sources-lang variant:code

== TypeScript

```ts
import type { PlopNext } from "@plop-next/cli";
import { PlopNextI18n } from "@plop-next/i18n";

export default function plop(plop: PlopNext) {
  const i18n = new PlopNextI18n(plop);

  // 1) Single JSON file
  i18n.registerTexts("./locales/en.json");

  // 2) Single TS/JS module file
  i18n.registerLocale("fr", "./locales/fr.ts");

  // 3) Directory of scoped files:
  //    en.locale.ts, fr.locale.js, es.locale.json
  i18n.registerLocales("./locales");

  plop.useI18n({ auto: true });
}
```

== JavaScript

```js
import { PlopNextI18n } from "@plop-next/i18n";

export default function plop(plop) {
  const i18n = new PlopNextI18n(plop);

  i18n.registerTexts("./locales/en.json");
  i18n.registerLocale("fr", "./locales/fr.js");
  i18n.registerLocales("./locales");

  plop.useI18n({ auto: true });
}
```

:::

### Custom prompts and i18n options

For custom prompts, the most important i18n hook is the **third parameter** of:

`registerPrompt(name, prompt, options)`

In this signature, `options` is `RegisterPromptOptions` and includes:

- `theme`: prompt theming configuration
- `translatableFields`: field-mapping rules used by i18n to translate nested prompt fields

This is the i18n bridge for complex prompt plugins (choices, table headers, row labels, etc.).

```ts
plop.registerPrompt("table-multiple", tableMultiplePrompt, {
  theme: { baseSelector: "select" },
  translatableFields: [
    { path: "columns.#", translateField: "title" },
    { path: "rows", translateField: "title", idField: "value" },
  ],
});
```

Use this when `registerPrompt(name, prompt)` is not enough for localized custom prompt UIs.

### Localized templates

For many projects, one template file is enough and only prompt/CLI texts are localized.
When template content itself must change per locale, keep one template set per locale and select by answer or active locale.

Example strategy:

1. Store templates in locale folders, such as `templates/en/...` and `templates/fr/...`
2. Ask for a language prompt (or use your active locale)
3. Route `templateFile` and output path through that locale value

```ts
actions: [
  {
    type: "add",
    path: "generated/{{lang}}/{{kebabCase name}}.md",
    templateFile: "templates/{{lang}}/doc.hbs",
  },
];
```

## Theming

plop-next has a built-in theme system that controls the visual appearance of every prompt: icons, colors, spinners, style functions, and CLI-level messages. Theming is part of `@plop-next/core` — no additional package is required.

### Setup and usage

Apply a theme by calling `setTheme` on the `plop` instance. The method accepts either an inline object or a path to a theme file resolved relative to the plopfile location.

| Method     | Signature                                        | Description                                                                          |
| ---------- | ------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `setTheme` | `setTheme(theme: PlopNextTheme \| string): this` | Set the active theme. Accepts an object or a file path. Returns `this` for chaining. |
| `getTheme` | `getTheme(): PlopNextTheme`                      | Return a deep clone of the current resolved theme.                                   |

:::tabs key:theming-setup-lang variant:code

== TypeScript

```ts
import { styleText } from "node:util";
import type { PlopNext } from "@plop-next/cli";

export default function plop(plop: PlopNext) {
  // Inline object example
  plop.setTheme({
    style: {
      answer: (text) => styleText("cyan", text),
      message: (text) => styleText("bold", text),
    },
    plopNext: {
      actionLog: {
        success: (text) => styleText("green", `✔ ${text}`),
      },
    },
  });
}
```

== JavaScript

```js
import { styleText } from "node:util";

export default function plop(plop) {
  // Inline object example
  plop.setTheme({
    style: {
      answer: (text) => styleText("cyan", text),
      message: (text) => styleText("bold", text),
    },
    plopNext: {
      actionLog: {
        success: (text) => styleText("green", `✔ ${text}`),
      },
    },
  });
}
```

:::

> **Important:** Each call to `setTheme` **replaces** the previous theme completely. If you call `setTheme` multiple times, only the last call takes effect. To compose themes, merge them into a single object or file before calling `setTheme` once.

### Loading themes from files

Instead of inline objects, `setTheme` accepts a file path to load a theme.

Supported formats include `.json`, `.js`, `.cjs`, `.ts`, and `.cts` files.

| Input kind          | Example                         | Notes                                                                                                     |
| ------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Single JSON file    | `plop.setTheme("./theme.json")` | File must contain a plain object at the root.                                                             |
| Single JS/TS module | `plop.setTheme("./theme.ts")`   | Module can export a default object, or a named export `theme`.                                            |
| Directory (merged)  | `plop.setTheme("./themes")`     | All `.json`, `.js`, `.ts` files in the directory are loaded and merged into a single theme for this call. |

:::tabs key:theming-files-lang variant:code

== TypeScript

```ts
import type { PlopNext } from "@plop-next/cli";
import { styleText } from "node:util";

export default function plop(plop: PlopNext) {
  // 1) Single JSON file
  plop.setTheme("./themes/light.json");

  // 2) Single TS/JS module file
  // plop.setTheme("./themes/dark.ts");

  // 3) Directory of theme files (merged in order)
  // plop.setTheme("./themes");
}
```

== JavaScript

```js
export default function plop(plop) {
  plop.setTheme("./themes/light.json");
  // plop.setTheme("./themes/dark.js");
  // plop.setTheme("./themes");
}
```

:::

**Example file structure:**

```
my-plopfile.ts
themes/
  light.json           // { style: { ... }, icon: { ... } }
  dark.ts              // export default { style: { ... } }
```

The file path is resolved relative to the plopfile location.

### Global theme fields

The top-level fields of `PlopNextTheme` apply to all prompt types. Individual fields can be narrowed per type — see [Per-prompt type overrides](#per-prompt-type-overrides).

| Field                   | Type                                                                                              | Description                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `icon`                  | `string \| { idle?, done?, cursor?, checked?, unchecked?, disabledChecked?, disabledUnchecked? }` | Icons used as the prompt prefix (idle/done states) and inside select/checkbox lists.               |
| `prefix`                | `string \| Omit<Record<Status, string>, "loading">`                                               | Prompt prefix per status (`idle`, `done`, or custom statuses — but NOT `loading`).                 |
| `spinner`               | `{ interval?: number; frames?: string[] }`                                                        | Loading spinner animation shown while the prompt status is `"loading"`.                            |
| `style`                 | `object`                                                                                          | Functions that transform individual text segments displayed in the terminal. See sub-fields below. |
| `validationFailureMode` | `"keep" \| "clear"`                                                                               | Whether the input line is kept or erased after a validation error. Default: `"keep"`.              |
| `indexMode`             | `"hidden" \| "number"`                                                                            | Whether numeric indexes are shown alongside choices in list/select prompts. Default: `"hidden"`.   |
| `i18n`                  | `{ disabledError?: string }`                                                                      | Text snippets for built-in prompt messages (e.g. the error shown when selecting a disabled item).  |
| `keybindings`           | `ReadonlyArray<Keybinding>`                                                                       | Extra keybindings appended to each prompt's default set.                                           |
| `plopNext`              | `object`                                                                                          | plop-next CLI-level style helpers. See sub-fields below.                                           |

**`style` sub-fields**

| Key                     | Signature                       | Description                                                                     |
| ----------------------- | ------------------------------- | ------------------------------------------------------------------------------- |
| `answer`                | `(text) => string`              | Styles the confirmed user answer.                                               |
| `message`               | `(text, status) => string`      | Styles the prompt message.                                                      |
| `error`                 | `(text) => string`              | Styles validation error messages.                                               |
| `defaultAnswer`         | `(text) => string`              | Styles the default value hint.                                                  |
| `help`                  | `(text) => string`              | Styles help/hint text (e.g. key shortcut tips).                                 |
| `highlight`             | `(text) => string`              | Styles the highlighted choice in a list.                                        |
| `description`           | `(text) => string`              | Styles choice description text.                                                 |
| `disabled`              | `(text) => string`              | Styles a disabled choice label.                                                 |
| `disabledChoice`        | `(text) => string`              | Styles a disabled item in checkbox prompts specifically.                        |
| `searchTerm`            | `(text) => string`              | Styles the active search query in search prompts.                               |
| `renderSelectedChoices` | `(selected, all) => string`     | Renders the summary line of checked choices in checkbox prompts.                |
| `keysHelpTip`           | `(keys) => string \| undefined` | Formats the keyboard shortcut tip line. Return `undefined` to hide it entirely. |
| `key`                   | `(text) => string`              | Styles key names shown inside tips.                                             |
| `maskedText`            | `string`                        | Static placeholder shown in password prompts that have no mask character.       |
| `waitingMessage`        | `(enterKey) => string`          | Message shown while waiting for the user to open the external editor.           |

**`plopNext` sub-fields**

| Key                               | Description                                                  |
| --------------------------------- | ------------------------------------------------------------ |
| `menuTitle(text)`                 | Styles the main generator selection menu title.              |
| `welcome(text)`                   | Styles the welcome message.                                  |
| `generatorMenu.title(text)`       | Styles generator names in the menu list.                     |
| `generatorMenu.description(text)` | Styles generator descriptions in the menu list.              |
| `actionLog.success(text)`         | Styles successful action log lines.                          |
| `actionLog.error(text)`           | Styles failed action log lines.                              |
| `actionLog.warning(text)`         | Styles warning action log lines.                             |
| `actionLog.skipped(text)`         | Styles skipped action log lines.                             |
| `actionLog.info(text)`            | Styles informational action log lines.                       |
| `errors.prefix.error`             | Prefix string prepended to error messages. Default: `"✖"`.   |
| `errors.prefix.warning`           | Prefix string prepended to warning messages. Default: `"⚠"`. |
| `errors.error(text)`              | Styles error text.                                           |
| `errors.warning(text)`            | Styles warning text.                                         |

**Shorthand aliases**

Three fields can be set at the root of the theme object as shortcuts instead of being nested:

| Alias            | Equivalent nested path | Type                           |
| ---------------- | ---------------------- | ------------------------------ |
| `waitingMessage` | `style.waitingMessage` | `(enterKey: string) => string` |
| `maskedText`     | `style.maskedText`     | `string`                       |
| `disabledError`  | `i18n.disabledError`   | `string`                       |

### Per-prompt type overrides

`PlopNextTheme` accepts per-type overrides by nesting fields under the prompt type name at the root of the theme object. This lets you apply a different look to a specific prompt type without affecting the global defaults.

Valid type keys: `input`, `select`, `list`, `generator-select`, `checkbox`, `confirm`, `search`, `password`, `expand`, `editor`, `number`, `rawlist`.

```ts
import { styleText } from "node:util";

plop.setTheme({
  // Global defaults apply to all prompts
  style: {
    answer: (text) => styleText("cyan", text),
  },

  // Checkbox-specific override
  checkbox: {
    i18n: {
      disabledError: "This item cannot be toggled.",
    },
    style: {
      disabledChoice: (text) => styleText("dim", `⊘ ${text}`),
    },
  },

  // Password-specific override
  password: {
    maskedText: "••••••",
  },
});
```

Theme resolution order for a given prompt: `defaultTheme` → per-type built-in defaults → global user theme → per-type user override.

### Custom prompt theme selector

When a custom prompt is registered with `registerPrompt(name, prompt, options)`, plop-next does not know which theme fields the renderer expects. The `theme` option on `RegisterPromptOptions` (of type `PromptThemeSelector`) lets you declare exactly which fields to extract from the resolved theme and forward to the prompt.

| Field spec            | Type                   | Description                                                                        |
| --------------------- | ---------------------- | ---------------------------------------------------------------------------------- |
| `baseSelector`        | `string`               | Inherit all entries from another registered selector, then apply overrides on top. |
| `fieldName: true`     | `PromptThemeFieldSpec` | Pass the field value as-is (scalar or full object).                                |
| `fieldName: string[]` | `PromptThemeFieldSpec` | Field is an object; extract only the listed sub-keys.                              |

Built-in selector names available for `baseSelector`: `common`, `input`, `select`, `list`, `checkbox`, `confirm`, `search`, `password`, `expand`, `editor`, `number`, `rawlist`.

```ts
import type { PromptThemeSelector } from "@plop-next/core";

const mySelector: PromptThemeSelector = {
  // Inherit all fields from the built-in "select" selector
  baseSelector: "select",
  // Override to add or narrow specific fields
  style: ["answer", "message", "highlight"],
  plopNext: true,
};

plop.registerPrompt("fancy-select", fancySelectPrompt, {
  theme: mySelector,
});
```

## Essential Commands

This section lists the most important and useful plop-next commands for daily use.
It serves as a quick reference guide at the end of the documentation.

### Init Commands

Use these commands to scaffold a new plopfile quickly.

```bash
plop-next --init
plop-next --init-ts
plop-next --init-js
```

- `--init` creates a `plopfile.ts` by default.
- `--init-ts` explicitly creates a TypeScript plopfile (`plopfile.ts`).
- `--init-js` creates a JavaScript plopfile (`plopfile.js`).

#### Init Options

The following options are supported by init:

| Option        | Description                                                                                |
| ------------- | ------------------------------------------------------------------------------------------ |
| `-i, --init`  | Initialize a default TypeScript plopfile (`plopfile.ts`)                                   |
| `--init-ts`   | Initialize a TypeScript plopfile (`plopfile.ts`)                                           |
| `--init-js`   | Initialize a JavaScript plopfile (`plopfile.js`)                                           |
| `--demo`      | Add a demo generator (`example`) to the generated plopfile                                 |
| `--i18n`      | Add i18n setup in the generated plopfile and include `@plop-next/i18n` in dev dependencies |
| `--cwd <dir>` | Run init in a specific directory instead of the current working directory                  |

Init behavior details:

- If `plopfile.ts` or `plopfile.js` already exists, init fails to avoid conflicts.
- If both `--init-ts` and `--init-js` are passed, `--init-js` takes precedence.
- Init installs dev dependencies automatically when `package.json` exists.
- Installed deps are `@plop-next/cli`, plus `@plop-next/i18n` when `--i18n` is used.
- If no `package.json` is found, file generation still succeeds and dependency installation is skipped.

### Generate Command

Use `--generate` to scaffold localization and theme templates.

```bash
plop-next --generate locale fr
plop-next --generate texts fr
plop-next --generate theme
```

Equivalent short form:

```bash
plop-next -g locale fr
```

Supported kinds:

- `locale`
- `texts`
- `theme`

#### Generate Options

| Option                   | Description                                                                      |
| ------------------------ | -------------------------------------------------------------------------------- |
| `-g, --generate <kind>`  | Generate template scaffolds for `locale`, `texts`, or `theme`                    |
| `-P, --path <dir>`       | Output base directory for generated files                                        |
| `-e, --extension <ext>`  | Output extension: `ts`, `js`, or `json` (default: `ts`)                          |
| `--include-custom-texts` | Include plopfile custom translatable texts (valid only with `--generate locale`) |
| `-f, --force`            | Overwrite target files if they already exist                                     |
| `--cwd <dir>`            | Resolve generation from a specific working directory                             |

Generate behavior details:

- `locale` and `texts` require a locale argument after kind (for example `fr`, `en`, `de`).
- `theme` does not require a locale argument.
- Output files are:
  - `locale`: `locales/<locale>.locale.<ext>`
  - `texts`: `locales/<locale>.texts.<ext>`
  - `theme`: `theme.<ext>`
- `texts` generation requires a valid plopfile.
- `locale` generation does not require a plopfile unless `--include-custom-texts` is used.
- `--include-custom-texts` is rejected for `texts` and `theme`.

## Taking It Further

The same advanced mindset from plop mostly applies to plop-next, with a few implementation differences.

### Using a Dynamic Actions Array

This applies to plop-next.
`actions` can be either:

- a static action array
- a function that receives answers and returns an action array (sync or async)

```ts
plop.registerGenerator("example", {
  prompts: [
    {
      type: "confirm",
      name: "wantTacos",
      message: "Do you want tacos?",
    },
  ],
  actions: async (answers) => {
    if (answers.wantTacos) {
      return [
        {
          type: "add",
          path: "folder/{{dashCase name}}.txt",
          templateFile: "templates/tacos.txt",
        },
      ];
    }

    return [
      {
        type: "add",
        path: "folder/{{dashCase name}}.txt",
        templateFile: "templates/burritos.txt",
      },
    ];
  },
});
```

### Prompt Bypass and Third-Party Prompts

Prompt bypass is supported in plop-next CLI (positional and named prompt answers).

For third-party prompts, bypass coercion behavior depends on the prompt implementation itself. In other words, plop-next can forward bypass values, but type conversion and validation remain the responsibility of the prompt handler/plugin.

### Wrapping plop-next in a Custom CLI

This also applies.
plop-next CLI itself is built around a prepare/execute flow, so a custom wrapper is a valid advanced pattern when you need a tailored CLI experience.

### Setting a Base Destination Path

This applies via `setDestBasePath(path)` in the plopfile API, and through CLI destination options.
Use this when generated files should be resolved from a controlled root directory.

### General CLI Actions

Unlike some ecosystem examples, plop-next does not provide built-in action types for shell-oriented post-generation tasks.

For these workflows, register a custom action type and run your own command logic there:

```ts
plop.registerActionType("exec", async (_answers, config) => {
  // run shell command(s) here
  return `Executed: ${config.command}`;
});
```

### Deep Customization

If you need full control, plop-next already exposes the low-level primitives you need:

- custom generators
- custom prompts
- custom action types
- custom helpers and partials
- i18n and theme customization

This covers the same spirit as using node-plop directly in classic plop ecosystems.
