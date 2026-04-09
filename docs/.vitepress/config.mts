import { defineConfig } from 'vitepress'
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Plop-Next",
  description: "Documentation for Plop Next Node CLI",
  base: '/plop-next/',
  markdown: {
    config(md) {
      md.use(tabsMarkdownPlugin)
    }
  },
  head: [
    //['link', { rel: 'icon', href: '/favicon.ico' }] //For future use when we have a favicon
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Documentation', link: '/documentation' }
    ],
    docFooter: {
      prev: false,
      next: false
    },
    sidebar: [
      {
        items: [
          {
            text: 'Getting Started',
            link: '/documentation#getting-started',
            items: [
              { text: 'What is Plop Next?', link: '/documentation#what-is-plop-next' },
              { text: 'Installation', link: '/documentation#installation' },
              { text: 'Your First Plopfile', link: '/documentation#your-first-plopfile' },
              { text: 'Using Prompts', link: '/documentation#using-prompts' },
              { text: 'CLI Usage', link: '/documentation#cli-usage' },
              { text: 'Why Generators?', link: '/documentation#why-generators' }
            ]
          },
          {
            text: 'Plopfile API',
            link: '/documentation#plopfile-api',
            items: [
              { text: 'JSDoc Support', link: '/documentation#jsdoc-support' },
              { text: 'Main Methods', link: '/documentation#main-methods' },
              { text: 'registerHelper', link: '/documentation#registerhelper' },
              { text: 'registerPartial', link: '/documentation#registerpartial' },
              { text: 'registerActionType', link: '/documentation#registeractiontype' },
              { text: 'registerPrompt', link: '/documentation#registerprompt' },
              { text: 'Register a Generator', link: '/documentation#register-a-generator' },
              { text: 'Other Methods', link: '/documentation#other-methods' }
            ]
          },
          {
            text: 'Built-in Actions',
            link: '/documentation#built-in-actions',
            items: [
              { text: 'add', link: '/documentation#add' },
              { text: 'addMany', link: '/documentation#addmany' },
              { text: 'modify', link: '/documentation#modify' },
              { text: 'append', link: '/documentation#append' },
              { text: 'custom (action function)', link: '/documentation#custom-action-function' },
              { text: 'comments', link: '/documentation#comments' }
            ]
          },
          {
            text: 'Built-in Helpers',
            link: '/documentation#built-in-helpers',
            items: [
              { text: 'Case modifiers', link: '/documentation#case-modifiers' },
              { text: 'Other helpers', link: '/documentation#other-helpers' }
            ]
          },
          {
            text: 'Internationalization',
            link: '/documentation#internationalization',
            items: [
              { text: 'Setup and activation', link: '/documentation#setup-and-activation' },
              { text: 'Registering locales and texts', link: '/documentation#registering-locales-and-texts' },
              { text: 'Loading locales from files', link: '/documentation#loading-locales-from-files' },
              { text: 'Custom prompts and i18n options', link: '/documentation#custom-prompts-and-i18n-options' },
              { text: 'Localized templates', link: '/documentation#localized-templates' }
            ]
          },
          {
            text: 'Theming',
            link: '/documentation#theming',
            items: [
              { text: 'Setup and usage', link: '/documentation#setup-and-usage' },
              { text: 'Loading themes from files', link: '/documentation#loading-themes-from-files' },
              { text: 'Global theme fields', link: '/documentation#global-theme-fields' },
              { text: 'Per-prompt type overrides', link: '/documentation#per-prompt-type-overrides' },
              { text: 'Custom prompt theme selector', link: '/documentation#custom-prompt-theme-selector' }
            ]
          },
          {
            text: 'Essential Commands',
            link: '/documentation#essential-commands',
            items: [
              { text: 'Init commands', link: '/documentation#init-commands' },
              { text: 'Generate command', link: '/documentation#generate-command' }
            ]
          },
          {
            text: 'Taking It Further',
            link: '/documentation#taking-it-further',
            items: [
              { text: 'Dynamic actions array', link: '/documentation#using-a-dynamic-actions-array' },
              { text: 'Prompt bypass', link: '/documentation#prompt-bypass-and-third-party-prompts' },
              { text: 'Wrapping plop-next', link: '/documentation#wrapping-plop-next-in-a-custom-cli' },
              { text: 'Base destination path', link: '/documentation#setting-a-base-destination-path' },
              { text: 'General CLI actions', link: '/documentation#general-cli-actions' },
              { text: 'Deep customization', link: '/documentation#deep-customization' }
            ]
          }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Nivvdiy/plop-next' }
    ]
  }
})
