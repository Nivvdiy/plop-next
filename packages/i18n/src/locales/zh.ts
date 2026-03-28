import type { LocaleTexts } from "@plop-next/core";

/**
 * Chinese translations for plop-next built-in messages.
 * Covers the same key structure as `@plop-next/core` English messages.
 */
export const ZH_MESSAGES: LocaleTexts = {
  cli: {
    title: "欢迎使用 plop-next! 🚀",
    welcomeMessage: null,
    selectGenerator: "请选择一个生成器",
    noGenerators: "未注册任何生成器。请在您的 plopfile 中添加。",
    generatorNotFound: (name: string) => `未找到生成器 \"${name}\"。`,
    aborted: "已取消。",
    done: "完成！",
    promptCancelled: "用户关闭了控制台。",
  },

  inquirer: {
    confirm: {
      yesLabel: "是",
      noLabel: "否",
      hintYes: "是/否",
      hintNo: "是/否",
    },
    select: {
      helpNavigate: "导航",
      helpSelect: "选择",
    },
    checkbox: {
      helpNavigate: "导航",
      helpSelect: "选择",
      helpSubmit: "提交",
      helpAll: "全选",
      helpInvert: "反选",
    },
    search: {
      helpNavigate: "导航",
      helpSelect: "选择",
    },
    editor: {
      waitingMessage: (enterKey: any) => `按 ${enterKey} 键启动您的首选编辑器。`,
    },
    password: {
      maskedText: "[输入已隐藏]",
    },
  },

  actions: {
    add: {
      creating: (path: string) => `正在创建 ${path}`,
      created: (path: string) => `✔ 已创建 ${path}`,
      alreadyExists: (path: string) => `文件已存在: ${path}`,
    },
    modify: {
      modifying: (path: string) => `正在修改 ${path}`,
      modified: (path: string) => `✔ 已修改 ${path}`,
      notFound: (path: string) => `未找到文件: ${path}`,
      patternNotFound: (path: string) => `在以下文件中未找到模式: ${path}`,
    },
    append: {
      appending: (path: string) => `正在追加到 ${path}`,
      appended: (path: string) => `✔ 已追加到 ${path}`,
    },
  },

  errors: {
    unknownAction: (type: string) => `未知的操作类型: \"${type}\"`,
    plopfileNotFound: "找不到 plopfile (plopfile.js 或 plopfile.ts)。",
    plopfileLoadFailed: (err: string) => `加载 plopfile 失败: ${err}`,
    generatorNotFound: (name: string) => `未找到生成器 \"${name}\"。`,
    noGenerators: "未注册任何生成器。请在您的 plopfile 中添加。",
    invalidPrompt: (name: string, reason: string) =>
      `无效的 prompt \"${name}\": ${reason}`,
    bypassParse: (
      promptName: string,
      promptType: string,
      value: string,
      detail?: string,
    ) =>
      `无法将 bypass 值 \"${value}\" 赋给 prompt ${promptType} \"${promptName}\"${detail ? `: ${detail}` : ""}`,
    plopfileLoad: (path: string) => `加载 plopfile 失败: ${path}`,
    plopfileExport: "plopfile 必须导出一个默认函数。",
    userCancelled: "用户取消了 prompt。",
    plopfileNotFoundWarning: "未找到 plopfile。请在项目中创建 plopfile.js。",
    forcedLangI18nMissing: (locale: string) =>
      `强制语言 \"${locale}\" 已被忽略，因为未安装 @plop-next/i18n。将回退到英文。`,
    forcedLangUnavailable: (locale: string) =>
      `强制语言 \"${locale}\" 不可用。将回退到英文。`,
  },

  /**
   * CLI `--help` display texts — Chinese.
   * Read-only: cannot be overridden via `registerLocale` / `registerTexts`.
   */
  help: {
    usage: "用法:",
    usage1: "从可用生成器列表中选择",
    usage2: "执行以该名称注册的生成器",
    usage3: "执行生成器并传入输入数据以跳过 prompts",
    options: "选项:",
    optHelp: "显示帮助",
    optShowTypeNames: "显示完整类型名称而不是缩写",
    optInit: "生成基础 plopfile.ts",
    optInitJs: "生成基础 plopfile.js",
    optInitTs: "生成基础 plopfile.ts",
    optDemo: "在 plopfile 中生成一个 demo 生成器",
    optI18n: "以 i18n 支持初始化 plopfile",
    optVersion: "显示当前版本",
    optForce: "以强制模式执行生成器",
    optLang: "强制显示语言 (例如 en, es, fr, pt, zh)",
    danger: "跨过此线，风险自负",
    lowPlopfile: "plopfile 路径",
    lowCwd: "在查找 plopfile 时用于计算相对路径的基础目录",
    lowPreload: "在 plop-next 之前加载的模块字符串或数组",
    lowDest: "将输出写入此目录，而不是 plopfile 的父目录",
    lowNoProgress: "禁用进度 spinner",
    lowCompletion: "显示 shell 补全脚本 (bash|zsh|fish)",
    examples: "示例:",
  },
} as const;
