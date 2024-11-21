# Supported Functionality

The following tables list the functionality of the GitHub Actions libraries and
whether or not they are currently supported by `local-action`.

> [!NOTE]
>
> [Workflow commands](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions)
> are currently unsupported. Since `local-action` only supports
> JavaScript/TypeScript actions, it is assumed that they are using the
> [GitHub Actions Toolkit](https://github.com/actions/toolkit).

## [`@actions/core`](https://github.com/actions/toolkit/blob/main/packages/core/README.md)

| Feature               | Supported          | Notes                           |
| --------------------- | ------------------ | ------------------------------- |
| `exportVariable()`    | :white_check_mark: |                                 |
| `setSecret()`         | :white_check_mark: |                                 |
| `addPath()`           | :white_check_mark: |                                 |
| `getInput()`          | :white_check_mark: |                                 |
| `getMultilineInput()` | :white_check_mark: |                                 |
| `getBooleanInput()`   | :white_check_mark: |                                 |
| `setOutput()`         | :white_check_mark: |                                 |
| `setCommandEcho()`    | :white_check_mark: | Setting is not currently in use |
| `setFailed()`         | :white_check_mark: |                                 |
| `isDebug()`           | :white_check_mark: |                                 |
| `debug()`             | :white_check_mark: |                                 |
| `error()`             | :white_check_mark: |                                 |
| `warning()`           | :white_check_mark: |                                 |
| `notice()`            | :white_check_mark: |                                 |
| `info()`              | :white_check_mark: |                                 |
| `startGroup()`        | :white_check_mark: |                                 |
| `endGroup()`          | :white_check_mark: |                                 |
| `group()`             | :white_check_mark: |                                 |
| `saveState()`         | :white_check_mark: | State is not currently in use   |
| `getState()`          | :white_check_mark: | State is not currently in use   |
| `getIDToken()`        | :no_entry:         |                                 |
| `summary.*`           | :white_check_mark: |                                 |
| `toPosixPath()`       | :white_check_mark: |                                 |
| `toWin32Path()`       | :white_check_mark: |                                 |
| `toPlatformPath()`    | :white_check_mark: |                                 |
| `platform.*`          | :no_entry:         |                                 |

## Under Investigation

The following packages are under investigation for how to integrate with
`local-action`. Make sure to check back later!

- [`@actions/artifact`](https://github.com/actions/toolkit/tree/main/packages/artifact)
- [`@actions/attest`](https://github.com/actions/toolkit/tree/main/packages/attest)
- [`@actions/cache`](https://github.com/actions/toolkit/tree/main/packages/cache)

## No Action Needed

Currently, there shouldn't be any need to stub the functionality of the
following packages from the GitHub Actions Toolkit; they _should_ function as
expected when run using `local-action`. If you do encounter a scenario where
this doesn't work correctly, please
[open an issue!](https://github.com/github/local-action/issues/new)

- [`@actions/exec`](https://github.com/actions/toolkit/tree/main/packages/exec)
- [`@actions/github`](https://github.com/actions/toolkit/tree/main/packages/github)
- [`@actions/glob`](https://github.com/actions/toolkit/tree/main/packages/glob)
- [`@actions/http-client`](https://github.com/actions/toolkit/tree/main/packages/http-client)
- [`@actions/io`](https://github.com/actions/toolkit/tree/main/packages/io)
- [`@actions/tool-cache`](https://github.com/actions/toolkit/tree/main/packages/tool-cache)
