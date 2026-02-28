import { defineConfig } from "vitepress";

export default defineConfig({
  title: "new-branch",
  description:
    "A composable CLI to generate and create standardized Git branch names using a pattern + transform pipeline.",
  base: "/new-branch/",

  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/new-branch/logo.svg" }]],

  themeConfig: {
    logo: "/logo.svg",

    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Reference", link: "/reference/cli-options" },
      { text: "Recipes", link: "/recipes/github-flow" },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          items: [
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "Why new-branch?", link: "/guide/why" },
          ],
        },
        {
          text: "Core Concepts",
          items: [
            { text: "Patterns", link: "/guide/patterns" },
            { text: "Transforms", link: "/guide/transforms" },
            { text: "Configuration", link: "/guide/configuration" },
            { text: "Pattern Aliases", link: "/guide/pattern-aliases" },
          ],
        },
        {
          text: "Features",
          items: [
            { text: "Init Wizard", link: "/guide/init" },
            { text: "Interactive Mode", link: "/guide/interactive-mode" },
            { text: "Didactic Modes", link: "/guide/didactic-modes" },
          ],
        },
      ],
      "/reference/": [
        {
          text: "Reference",
          items: [
            { text: "CLI Options", link: "/reference/cli-options" },
            { text: "Built-in Variables", link: "/reference/built-in-variables" },
            { text: "Config Schema", link: "/reference/config-schema" },
          ],
        },
      ],
      "/recipes/": [
        {
          text: "Recipes",
          items: [
            { text: "GitHub Flow", link: "/recipes/github-flow" },
            { text: "Gitflow", link: "/recipes/gitflow" },
            { text: "Monorepo", link: "/recipes/monorepo" },
          ],
        },
      ],
    },

    socialLinks: [{ icon: "github", link: "https://github.com/teles/new-branch" }],

    search: {
      provider: "local",
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024-present Teles",
    },

    editLink: {
      pattern: "https://github.com/teles/new-branch/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },
  },
});
