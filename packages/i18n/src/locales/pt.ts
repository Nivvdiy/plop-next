import type { LocaleTexts } from "@plop-next/core";

/**
 * Portuguese translations for plop-next built-in messages.
 * Covers the same key structure as `@plop-next/core` English messages.
 */
export const PT_MESSAGES: LocaleTexts = {
  cli: {
    welcome: "Bem-vindo ao plop-next! 🚀",
    welcomeMessage: null,
    selectGenerator: "Selecione um gerador",
    noGenerators:
      "Nenhum gerador registrado. Adicione-os no seu plopfile.",
    generatorNotFound: (name: string) => `Gerador \"${name}\" nao encontrado.`,
    aborted: "Cancelado.",
    done: "Concluido!",
    promptCancelled: "Console fechado pelo usuario.",
  },

  inquirer: {
    confirm: {
      yesLabel: "Sim",
      noLabel: "Nao",
      hintYes: "S/n",
      hintNo: "s/N",
    },
    select: {
      helpNavigate: "navegar",
      helpSelect: "selecionar",
    },
    checkbox: {
      helpNavigate: "navegar",
      helpSelect: "selecionar",
      helpSubmit: "enviar",
      helpAll: "tudo",
      helpInvert: "inverter",
    },
    search: {
      helpNavigate: "navegar",
      helpSelect: "selecionar",
    },
    password: {
      maskedText: "[entrada oculta]",
    },
  },

  actions: {
    add: {
      creating: (path: string) => `Criando ${path}`,
      created: (path: string) => `✔ Criado ${path}`,
      alreadyExists: (path: string) => `O arquivo ja existe: ${path}`,
    },
    modify: {
      modifying: (path: string) => `Modificando ${path}`,
      modified: (path: string) => `✔ Modificado ${path}`,
      notFound: (path: string) => `Arquivo nao encontrado: ${path}`,
      patternNotFound: (path: string) =>
        `Padrao nao encontrado em: ${path}`,
    },
    append: {
      appending: (path: string) => `Anexando em ${path}`,
      appended: (path: string) => `✔ Anexado em ${path}`,
    },
  },

  errors: {
    unknownAction: (type: string) => `Tipo de acao desconhecido: \"${type}\"`,
    plopfileNotFound:
      "Nao foi possivel encontrar um plopfile (plopfile.js ou plopfile.ts).",
    plopfileLoadFailed: (err: string) =>
      `Falha ao carregar o plopfile: ${err}`,
    generatorNotFound: (name: string) => `Gerador \"${name}\" nao encontrado.`,
    noGenerators:
      "Nenhum gerador registrado. Adicione-os no seu plopfile.",
    invalidPrompt: (name: string, reason: string) =>
      `Prompt invalido \"${name}\": ${reason}`,
    bypassParse: (
      promptName: string,
      promptType: string,
      value: string,
      detail?: string,
    ) =>
      `Nao e possivel atribuir o valor de bypass \"${value}\" ao prompt ${promptType} \"${promptName}\"${detail ? `: ${detail}` : ""}`,
    plopfileLoad: (path: string) => `Falha ao carregar o plopfile: ${path}`,
    plopfileExport: "O plopfile deve exportar uma funcao padrao.",
    userCancelled: "Prompt cancelado pelo usuario.",
    plopfileNotFoundWarning:
      "Nenhum plopfile encontrado. Crie um plopfile.js no seu projeto.",
    forcedLangI18nMissing: (locale: string) =>
      `A locale forcada \"${locale}\" foi ignorada porque @plop-next/i18n nao esta instalado. Usando ingles.`,
    forcedLangUnavailable: (locale: string) =>
      `A locale forcada \"${locale}\" nao esta disponivel. Usando ingles.`,
  },

  /**
   * CLI `--help` display texts — Portuguese.
   * Read-only: cannot be overridden via `registerLocale` / `registerTexts`.
   */
  help: {
    usage: "Uso:",
    usage1: "Escolher na lista de geradores disponiveis",
    usage2: "Executar um gerador registrado com este nome",
    usage3:
      "Executar o gerador com dados de entrada para ignorar prompts",
    options: "Opcoes:",
    optHelp: "Mostrar esta ajuda",
    optShowTypeNames: "Mostrar nomes de tipo em vez de abreviacoes",
    optInit: "Gerar um plopfile.ts basico",
    optInitJs: "Gerar um plopfile.js basico",
    optInitTs: "Gerar um plopfile.ts basico",
    optDemo: "Gerar um gerador de demo no plopfile",
    optI18n: "Inicializar o plopfile com suporte i18n",
    optVersion: "Mostrar a versao atual",
    optForce: "Executar o gerador em modo forcado",
    optLang: "Forcar a locale de exibicao (ex. en, es, fr, pt)",
    danger: "o perigo espera quem se aventura abaixo desta linha",
    lowPlopfile: "Caminho para o plopfile",
    lowCwd:
      "Diretorio base para calcular caminhos relativos durante a busca do plopfile",
    lowPreload: "String ou array de modulos para carregar antes do plop-next",
    lowDest:
      "Escrever a saida nesta pasta em vez da pasta pai do plopfile",
    lowNoProgress: "Desativar o spinner de progresso",
    lowCompletion: "Mostrar script de completacao de shell (bash|zsh|fish)",
    examples: "Exemplos:",
  },
} as const;
