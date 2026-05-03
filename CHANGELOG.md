## [0.9.0](https://github.com/teles/new-branch/compare/v0.8.1...v0.9.0) (2026-02-28)


### Features

* **init:** add interactive init wizard orchestrator ([1b9b5bb](https://github.com/teles/new-branch/commit/1b9b5bb09a729f99135f44a78ceb41e3388a26e4)), closes [#23](https://github.com/teles/new-branch/issues/23)
* **init:** add wizard defaults and live preview modules ([a051873](https://github.com/teles/new-branch/commit/a05187387c42b60d32ff4de8d9eca9a1cd5a5ed8)), closes [#23](https://github.com/teles/new-branch/issues/23)
* **init:** support writing config to .newbranchrc.json, package.json, or git config ([cbf44d0](https://github.com/teles/new-branch/commit/cbf44d09e751f156cac9247e607c44c98a54e872)), closes [#23](https://github.com/teles/new-branch/issues/23)
* **init:** wire init subcommand into CLI entry point ([948e180](https://github.com/teles/new-branch/commit/948e1803b84196a23737a15133f322844823eb16)), closes [#23](https://github.com/teles/new-branch/issues/23)

## [0.8.1](https://github.com/teles/new-branch/compare/v0.8.0...v0.8.1) (2026-02-28)


### Bug Fixes

* add timeout to deploy-pages to prevent infinite polling ([fb23193](https://github.com/teles/new-branch/commit/fb231931324d58a47be8045075ca131d2110fa38))

# [0.8.0](https://github.com/teles/new-branch/compare/v0.7.0...v0.8.0) (2026-02-28)


### Features

* add --max-length / -L option for deterministic branch name truncation ([f5c4aa5](https://github.com/teles/new-branch/commit/f5c4aa5c5551488c0251ba7234930b660a76a885))

# [0.7.0](https://github.com/teles/new-branch/compare/v0.6.0...v0.7.0) (2026-02-28)


### Features

* **cli:** add --explain, --list-transforms and --print-config ([de74b9a](https://github.com/teles/new-branch/commit/de74b9adedaf2564e831810a3883a831cc36fd0e)), closes [#13](https://github.com/teles/new-branch/issues/13)
* **cli:** add --use option to argument parser ([668cd4b](https://github.com/teles/new-branch/commit/668cd4b97272b9e3d340b0d5a2e720b8e47a46fa)), closes [#12](https://github.com/teles/new-branch/issues/12)
* **cli:** resolve --use alias in branch pattern pipeline ([4ae1b35](https://github.com/teles/new-branch/commit/4ae1b35beb9aa0515460a83512f3840da6f7c291)), closes [#12](https://github.com/teles/new-branch/issues/12)
* **config:** add patterns field to ProjectConfig type ([414ea47](https://github.com/teles/new-branch/commit/414ea477c1f820014d7f5e64f8330a42334102a6)), closes [#12](https://github.com/teles/new-branch/issues/12)
* **config:** support patterns in git config loader ([d105994](https://github.com/teles/new-branch/commit/d105994b9030853aa430b522149ecb76005dc3fa)), closes [#12](https://github.com/teles/new-branch/issues/12)
* **config:** validate patterns field in config source ([fdf6293](https://github.com/teles/new-branch/commit/fdf6293feea4e13b703089d6638594ad98dfc227)), closes [#12](https://github.com/teles/new-branch/issues/12)
* **git:** add getGitConfigRegexp for multi-key git config ([a539c06](https://github.com/teles/new-branch/commit/a539c064536d149640da5074665d3078e564d641)), closes [#12](https://github.com/teles/new-branch/issues/12)
* **transforms:** add replace, replaceAll, remove, stripAccents, ifEmpty, before, after transforms ([8ff8d8e](https://github.com/teles/new-branch/commit/8ff8d8e06216629822564d854d815830e08c5f6b)), closes [#14](https://github.com/teles/new-branch/issues/14)

# [0.6.0](https://github.com/teles/new-branch/compare/v0.5.0...v0.6.0) (2026-02-28)


### Bug Fixes

* **git:** use execa for git calls so tests can mock execa ([e8044e9](https://github.com/teles/new-branch/commit/e8044e9ef72c36ec700d7838513571b88d566962)), closes [#9](https://github.com/teles/new-branch/issues/9)


### Features

* **cli:** prefer project defaultType before prompting; normalize argv; provide typeChoices to resolver ([eea7877](https://github.com/teles/new-branch/commit/eea7877ed892b5f6b9f58bb72c94aeb7002a1ab4)), closes [#9](https://github.com/teles/new-branch/issues/9)
* **config:** add config loaders, types, validation and tests; add tests.sh ([2dfdb9d](https://github.com/teles/new-branch/commit/2dfdb9d7f72532a96b76719fcc99af20ad4862b5)), closes [#9](https://github.com/teles/new-branch/issues/9)
* **config:** add config loaders, types, validation and tests; add tests.sh ([9942212](https://github.com/teles/new-branch/commit/99422126c422478c307e50e5a4f06cb0a59878ab)), closes [#9](https://github.com/teles/new-branch/issues/9)
* **docs:** update project configuration section to clarify precedence and validation rules [#11](https://github.com/teles/new-branch/issues/11) ([7b5de7a](https://github.com/teles/new-branch/commit/7b5de7a21d0a07d5f7518d0aa9d45465e257ebf2))

# [0.5.0](https://github.com/teles/new-branch/compare/v0.4.0...v0.5.0) (2026-02-21)


### Features

* **git:** add git built-in variables with lazy resolution and CLI integration ([#9](https://github.com/teles/new-branch/issues/9)) ([1ded20b](https://github.com/teles/new-branch/commit/1ded20b2374396d4623efc27a102f47c5186acc4))

# [0.4.0](https://github.com/teles/new-branch/compare/v0.3.1...v0.4.0) (2026-02-21)


### Bug Fixes

* **release:** enhance GitHub Actions workflow with improved steps and npm configuration ([32d7268](https://github.com/teles/new-branch/commit/32d72681a9ca1c27c84ee9a2f5f660d94d6a44d2))
* **release:** remove cache option from setup-node and add pnpm store caching steps ([fabc7b0](https://github.com/teles/new-branch/commit/fabc7b032ec4780d8c0f163960e3fc402acb49ac))


### Features

* **cli:** support pattern fallback via git config (ref [#3](https://github.com/teles/new-branch/issues/3)) ([efefcd3](https://github.com/teles/new-branch/commit/efefcd382b766af1211e5d115ee24728782a4a1f))
* **readme:** add quote from The Zen of Python for clarity ([16c3200](https://github.com/teles/new-branch/commit/16c3200a62b395ade1e49a3c93550399c29b0bbb))
* **release:** configure semantic-release for automated npm publishing ([#7](https://github.com/teles/new-branch/issues/7)) ([b9acad2](https://github.com/teles/new-branch/commit/b9acad2bb1d845bd56dffe73f276d0863f67286d))
* **runtime:** add date-based built-in variables and git config pattern support ([#5](https://github.com/teles/new-branch/issues/5)) ([385b2f5](https://github.com/teles/new-branch/commit/385b2f55244057d2f140095ecc56ef2fd26299e2))
