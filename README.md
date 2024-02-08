# Local Action Debugger

![GitHub Super-Linter](https://github.com/github/local-action/actions/workflows/linter.yml/badge.svg)
![Continuous Integration](https://github.com/github/local-action/actions/workflows/continuous-integration.yml/badge.svg)
![Code Coverage](badges/coverage.svg)

Run custom GitHub Actions locally and test them in VS Code!

This command-line tool emulates some **basic** functionality of the
[GitHub Actions Toolkit](https://github.com/actions/toolkit) so that custom
actions can be run directly on your workstation.

> [!NOTE]
>
> This tool currently only supports JavaScript and TypeScript actions!

## Prerequisites

### Installed Tools

- [Node.js and npm](https://nodejs.org/en)
- [`ts-node`](https://www.npmjs.com/package/ts-node)

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
  [`@vercel/ncc`](https://www.npmjs.com/package/@vercel/ncc)

Currently, this tool supports **non-transpiled action code only**. This is
because it uses [`proxyquire`](https://github.com/thlorenz/proxyquire) to
override GitHub Actions Toolkit dependencies (e.g
[`@actions/core`](https://www.npmjs.com/package/@actions/core)). In transpiled
code, this simply doesn't work.

For example, if you have a TypeScript action that follows the same format as the
[template](https://github.com/actions/typescript-action), you would have both
`src` and `dist` directories in your repository. The `dist` directory contains
the transpiled code with any dependencies included. When running this utility,
you will want to target the code files in the `src` directory instead. This has
the added benefit of being able to hook into debugging utilities in your IDE
:tada:

For additional information, see
[Commit, tag, and push your action to GitHub](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github).

## Installation

### Option 1: Install from GitHub Packages

1. [Authenticate to GitHub Packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)

   ```bash
   $ npm login --registry=https://npm.pkg.github.com
   Username: <your username>
   Password: <your personal access token>
   ```

1. Install via `npm`

   ```bash
   npm i -g @github/local-action
   ```

### Option 2: Clone this Repository

1. Clone this repository locally

   ```bash
   git clone https://github.com/github/local-action.git
   ```

1. Install via `npm`

   ```bash
   npm i -g .
   ```

## Commands

### `local-action`

| Option            | Description                 |
| ----------------- | --------------------------- |
| `-h`, `--help`    | Display help information    |
| `-V`, `--version` | Display version information |

### `local-action run <path> <entrypoint> <env file>`

| Argument     | Description                                          |
| ------------ | ---------------------------------------------------- |
| `path`       | Path to the local action directory                   |
|              | Example: `/path/to/action.yml`                       |
| `entrypoint` | Action entrypoint (relative to the action directory) |
|              | Example: `src/index.ts`                              |
| `env file`   | Path to the local `.env` file for action inputs      |
|              | Example: `/path/to/.env`                             |
|              | See the example [`.env.example`](.env.example)       |

#### Output

```console
$ local-action run /path/to/typescript-action src/index.ts .env
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
│    1    │    'Entrypoint'    │ '/path/to/typescript-action/src/index.ts' │
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

## Debugging in VS Code

This package can also be used with VS Code's built-in debugging tools. You just
need to add a `launch.json` to the project containing your local action. The
following can be used as an example.

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Local Action",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "local-action",
      "cwd": "${workspaceRoot}",
      "args": [".", "src/index.ts", ".env"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**", "node_modules/**"]
    }
  ]
}
```

In the `args` section, make sure to specify the appropriate path, entrypoint,
and dotenv file path. After that, you can add breakpoints to your action code
and start debugging!
