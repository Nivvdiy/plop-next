# @plop-next/i18n

Internationalization plugin for plop-next.

This package adds locale registration and prompt/message localization on top of `@plop-next/core`.

## Installation

```bash
npm install @plop-next/core @plop-next/i18n
```

or:

```bash
yarn add @plop-next/core @plop-next/i18n
```

## Quick example

```ts
import { PlopNextCore } from "@plop-next/core";
import { PlopNextI18n } from "@plop-next/i18n";

const core = new PlopNextCore();
const i18n = new PlopNextI18n(core);

i18n.registerLocale("fr", {
  cli: {
    selectGenerator: "Choisissez un generateur",
  },
});

core.useI18n({ force: "fr" });
```

## Built-in locales

- `en`
- `es`
- `fr`
- `pt`
- `zh`

## Common exports

- `PlopNextI18n`
- `I18nRegistry`
- `EN_MESSAGES`, `FR_MESSAGES`, `ES_MESSAGES`, `PT_MESSAGES`, `ZH_MESSAGES`

## Development scripts

```bash
yarn workspace @plop-next/i18n build
yarn workspace @plop-next/i18n test
```

## Links

- Documentation: [https://nivvdiy.github.io/plop-next/](https://nivvdiy.github.io/plop-next/)
- Repository: [https://github.com/nivvdiy/plop-next](https://github.com/nivvdiy/plop-next)
- Issues: [https://github.com/nivvdiy/plop-next/issues](https://github.com/nivvdiy/plop-next/issues)
