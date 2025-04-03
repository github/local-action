# Local Action Debugger

![GitHub Super-Linter](https://github.com/github/local-action/actions/workflows/linter.yml/badge.svg)
![Continuous Integration](https://github.com/github/local-action/actions/workflows/continuous-integration.yml/badge.svg)
![Code Coverage](badges/coverage.svg)

Run custom GitHub Actions locally and test them in Visual Studio Code!

This command-line tool emulates some **basic** functionality of the
[GitHub Actions Toolkit](https://github.com/actions/toolkit) so that custom
actions can be run directly on your workstation.

> [!NOTE]
>
> This tool currently only supports JavaScript and TypeScript actions!

The following table tracks the versions of the GitHub Actions Toolkit that are
currently implemented by this tool.

| Package                                                                | Version  |
| ---------------------------------------------------------------------- | -------- |
| [`@actions/artifact`](https://www.npmjs.com/package/@actions/artifact) | `2.3.2`  |
| [`@actions/core`](https://www.npmjs.com/package/@actions/core)         | `1.11.1` |
| [`@actions/github`](https://www.npmjs.com/package/@actions/github)     | `6.0.0`  |

## Changelog

See the [CHANGELOG](./CHANGELOG.md) for a complete list of changes.

## Package Manager Support

### `npm` Support

This tool is designed primarily for use with `npm` and `npx`. It is recommended
to use `npm` for managing actions you wish to test with this tool.

### `pnpm` Support

This tool ships with **experimental** support for `pnpm`. If you encounter any
issues, please file an issue
[here](https://github.com/github/local-action/issues).

Some caveats to this support are listed below.

- This tool does not support CommonJS actions using `pnpm`.

## `yarn` Support

This tool ships with **experimental** support for `yarn`. If you encounter any
issues, please file an issue
[here](https://github.com/github/local-action/issues).

Some caveats to this support are listed below.

- The `@github/local-action` package should be run using
  `yarn dlx @github/local-action` instead of `yarn local-action`.
- This tool does not support CommonJS actions using `yarn`.

## Prerequisites

### Installed Tools

- [Node.js and npm](https://nodejs.org/en)

### Action Structure

For JavaScript and TypeScript actions, your code should follow the format of the
corresponding template repository.

- [`actions/javascript-action`](https://github.com/actions/javascript-action)
- [`actions/typescript-action`](https://github.com/actions/typescript-action)

Specifically, there should be a separation between the entrypoint used by GitHub
Actions when invoking your code, and the actual logic of your action. For
example:

#### Entrypoint: **`index.ts`**

This is what is invoked by GitHub Actions when your action is run.

```typescript
/**
 * This file is the entrypoint for the action
 */
import { run } from './main'

// It calls the actual logic of the action
run()
```

#### Logic: **`main.ts`**

This is the actual implementation of your action. It is called by the
entrypoint.

```typescript
import * as core from '@actions/core'
import { wait } from './wait'

/**
 * This file is the actual logic of the action
 * @returns {Promise<void>} Resolves when the action is complete
 */
export async function run(): Promise<void> {
  // ...
}
```

### Transpiled Actions

Depending on how you build your JavaScript/TypeScript actions, you may do one of
the following when preparing for release:

- Commit the `node_modules` directory to your repository
- Transpile your code and dependencies using tools like
  [`tsc`](https://www.typescriptlang.org/docs/handbook/compiler-options.html),
  [`@vercel/ncc`](https://www.npmjs.com/package/@vercel/ncc), or
  [`rollup`](https://rollupjs.org/)

**This tool supports non-transpiled action code only.** This is because it uses
[`quibble`](https://github.com/testdouble/quibble) to override GitHub Actions
Toolkit dependencies (e.g
[`@actions/core`](https://www.npmjs.com/package/@actions/core)). In transpiled
code, this simply doesn't work.

For example, if you have a TypeScript action that follows the same format as the
[template](https://github.com/actions/typescript-action), you would have both
`src` and `dist` directories in your repository. The `dist` directory contains
the transpiled code with any dependencies included. When running this utility,
you will want to target the code files in the `src` directory instead (including
the dependencies this tool wants to replace). This has the added benefit of
being able to hook into debugging utilities in your IDE :tada:

For additional information about transpiled action code, see
[Commit, tag, and push your action to GitHub](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github).

## Installation

### Option 1: Install from npm

1. Install via `npm`

   ```bash
   npm i -g @github/local-action
   ```

### Option 2: Clone this Repository

1. Clone this repository locally

   ```bash
   git clone https://github.com/github/local-action.git
   ```

1. Install dependencies

   ```bash
   npm ci
   ```

1. Install via `npm`

   ```bash
   npm i -g .
   ```

   Alternatively, you can link the package if you want to make code changes

   ```bash
   npm link .
   ```

## Commands

### `local-action`

| Option            | Description                 |
| ----------------- | --------------------------- |
| `-h`, `--help`    | Display help information    |
| `-V`, `--version` | Display version information |

### `local-action run <path> <logic entrypoint> <dotenv file>`

| Argument           | Description                                            |
| ------------------ | ------------------------------------------------------ |
| `path`             | Path to the local action directory                     |
|                    | Example: `/path/to/action.yml`                         |
| `logic entrypoint` | Action logic entrypoint (relative to action directory) |
|                    | Example: `src/main.ts`                                 |
| `dotenv file`      | Path to the local `.env` file for action inputs        |
|                    | Example: `/path/to/.env`                               |
|                    | See the example [`.env.example`](.env.example)         |

Examples:

```bash
local-action run /path/to/typescript-action src/main.ts .env

# The `run` action is invoked by default as well
local-action /path/to/typescript-action src/main.ts .env
```

#### Output

```console
$ local-action run /path/to/typescript-action src/main.ts .env
     _        _   _               ____       _
    / \   ___| |_(_) ___  _ __   |  _ \  ___| |__  _   _  __ _  __ _  ___ _ __
   / _ \ / __| __| |/ _ \| '_ \  | | | |/ _ \ '_ \| | | |/ _` |/ _` |/ _ \ '__|
  / ___ \ (__| |_| | (_) | | | | | |_| |  __/ |_) | |_| | (_| | (_| |  __/ |
 /_/   \_\___|\__|_|\___/|_| |_| |____/ \___|_.__/ \__,_|\__, |\__, |\___|_|
                                                         |___/ |___/
================================================================================
                                 Configuration
================================================================================

┌─────────┬────────────────────┬───────────────────────────────────────────┐
│ (index) │       Field        │                  Value                    │
├─────────┼────────────────────┼───────────────────────────────────────────┤
│    0    │   'Action Path'    │       '/path/to/typescript-action'        │
│    1    │    'Entrypoint'    │ '/path/to/typescript-action/src/main.ts'  │
│    2    │ 'Environment File' │   '/path/to/local-action-debugger/.env'   │
└─────────┴────────────────────┴───────────────────────────────────────────┘

================================================================================
                                Action Metadata
================================================================================

┌─────────┬────────────────┬───────────────────────────────┐
│ (index) │     Input      │          Description          │
├─────────┼────────────────┼───────────────────────────────┤
│    0    │ 'milliseconds' │ 'Your input description here' │
└─────────┴────────────────┴───────────────────────────────┘

┌─────────┬────────┬────────────────────────────────┐
│ (index) │ Output │          Description           │
├─────────┼────────┼────────────────────────────────┤
│    0    │ 'time' │ 'Your output description here' │
└─────────┴────────┴────────────────────────────────┘

================================================================================
                                 Running Action
================================================================================
```

## (TypeScript) TSConfig Requirements

If you are testing TypeScript actions, there are a few settings that **must** be
configured in your `tsconfig.json` file (either explicitly or via their default
values).

| Property                                                      | Required Value |
| ------------------------------------------------------------- | -------------- |
| [`allowJs`](https://www.typescriptlang.org/tsconfig/#allowJs) | `false`        |

### Troubleshooting

Possible errors that can arise from not having `allowJs: false`:

- `TypeError [ERR_INVALID_URL_SCHEME]: The URL must be of scheme file` from tsx
  when trying to run `npx @github/local-action`.

## Features

The following list links to documentation on how to use various features of the
`local-action` tool.

- [Supported Functionality](./docs//supported-functionality.md)
- [Debugging in Visual Studio Code](./docs/debugging-in-vscode.md)
- [Create a Job Summary](./docs/create-a-job-summary.md)
