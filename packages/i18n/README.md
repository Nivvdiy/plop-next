# @plop-next/i18n

[![npm version](https://img.shields.io/npm/v/@plop-next/i18n)](https://www.npmjs.com/package/@plop-next/i18n)
![downloads](https://img.shields.io/npm/dw/@plop-next/i18n)
![license](https://img.shields.io/npm/l/@plop-next/i18n)
![types](https://img.shields.io/npm/types/@plop-next/i18n)

[![docs](https://img.shields.io/badge/docs-online-blue)](https://nivvdiy.github.io/plop-next/documentation.html#internationalization)

Internationalization plugin for **plop-next**.

---

## Features

- Multi-language CLI prompts
- Built-in locales
- Easy extension system

---

## Installation

```bash
npm install -D @plop-next/cli @plop-next/i18n
```

or:

```bash
yarn add -D @plop-next/cli @plop-next/i18n
```

---

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

---

## Built-in locales

- `en`
- `es`
- `fr`
- `pt`
- `zh`

---

## Role in ecosystem

- Plugin layer for `@plop-next/cli`
- Optional but powerful extension

---

## Links

- Documentation: [https://nivvdiy.github.io/plop-next/](https://nivvdiy.github.io/plop-next/)
- Repository: [https://github.com/Nivvdiy/plop-next](https://github.com/Nivvdiy/plop-next)
- Issues: [https://github.com/Nivvdiy/plop-next/issues](https://github.com/Nivvdiy/plop-next/issues)
