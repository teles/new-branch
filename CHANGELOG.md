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
