# Supported Functionality

The following tables list the functionality of the GitHub Actions libraries and
whether or not they are currently supported by `local-action`.

> [!NOTE]
>
> [Workflow commands](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions)
> are currently unsupported. Since `local-action` only supports
> JavaScript/TypeScript actions, it is assumed that they are using the
> [GitHub Actions Toolkit](https://github.com/actions/toolkit).

## [`@actions/artifact`](https://github.com/actions/toolkit/blob/main/packages/artifact/README.md)

The stubbed version of `@actions/artifact` functions similarly to the real
package. However, any artifacts that are created as part of a `local-action` run
will be stored on your local workstation. The specific path must be set using
the `LOCAL_ACTION_ARTIFACT_PATH` environment variable in the `.env` file passed
to the `local-action` command.

> [!NOTE]
>
> If this variable is not set, and you attempt to interact with
> `@actions/artifact`, you will receive an error message.

| Feature              | Supported          | Notes                          |
| -------------------- | ------------------ | ------------------------------ |
| `deleteArtifact()`   | :white_check_mark: |                                |
| `downloadArtifact()` | :white_check_mark: |                                |
| `getArtifact()`      | :white_check_mark: |                                |
| `listArtifacts()`    | :white_check_mark: |                                |
| `uploadArtifact()`   | :white_check_mark: | Retention settings are ignored |

> [!IMPORTANT]
>
> When working with artifacts that were created as part of actual GitHub Actions
> workflow runs (e.g. if you try to download an artifact from a different
> repository), these requests **will be passed to the GitHub API**.

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
| `platform.*`          | :white_check_mark: |                                 |

## [`@actions/github`](https://github.com/actions/toolkit/tree/main/packages/github)

The stubbed version of `@actions/github` functions the same as the real package.
However, the functionality is stubbed in order to ensure that all needed
environment variables are pulled from the `.env` file passed to the
`local-action` command. Otherwise, things like `github.context.eventName` will
be `undefined`. For more information, see
[#149](https://github.com/github/local-action/issues/149).

## Under Investigation

The following packages are under investigation for how to integrate with
`local-action`. Make sure to check back later!

- [`@actions/attest`](https://github.com/actions/toolkit/tree/main/packages/attest)
- [`@actions/cache`](https://github.com/actions/toolkit/tree/main/packages/cache)

## No Action Needed

Currently, there shouldn't be any need to stub the functionality of the
following packages from the GitHub Actions Toolkit; they _should_ function as
expected when run using `local-action`. If you do encounter a scenario where
this doesn't work correctly, please
[open an issue!](https://github.com/github/local-action/issues/new)

- [`@actions/exec`](https://github.com/actions/toolkit/tree/main/packages/exec)
- [`@actions/glob`](https://github.com/actions/toolkit/tree/main/packages/glob)
- [`@actions/http-client`](https://github.com/actions/toolkit/tree/main/packages/http-client)
- [`@actions/io`](https://github.com/actions/toolkit/tree/main/packages/io)
- [`@actions/tool-cache`](https://github.com/actions/toolkit/tree/main/packages/tool-cache)
