# @plop-next/i18n

Internationalization plugin for plop-next.

This package is designed to be used with `@plop-next/cli`.

For normal usage, treat it as a CLI extension layer (not a standalone package).

## Installation

```bash
npm install -D @plop-next/cli @plop-next/i18n
```

or:

```bash
yarn add -D @plop-next/cli @plop-next/i18n
```

## Usage with CLI

```ts
import type { PlopNext } from "@plop-next/cli";
import { PlopNextI18n } from "@plop-next/i18n";

export default function plop(plop: PlopNext) {
  const i18n = new PlopNextI18n(plop);

  i18n.registerLocale("fr", {
    cli: {
      selectGenerator: "Choisissez un generateur",
    },
  });

  plop.useI18n({ force: "fr" });
}
```

## Built-in locales

- `en`
- `es`
- `fr`
- `pt`
- `zh`

## Links

- Documentation: [https://nivvdiy.github.io/plop-next/](https://nivvdiy.github.io/plop-next/)
- Repository: [https://github.com/Nivvdiy/plop-next](https://github.com/Nivvdiy/plop-next)
- Issues: [https://github.com/Nivvdiy/plop-next/issues](https://github.com/Nivvdiy/plop-next/issues)
