# Changelog

## v3

This version adds **experimental** support for [pnpm](https://pnpm.io/) and
[yarn](https://yarnpkg.com/).

Depending on the package manager and version, the invocation of the `tsx`
command that drives `@github/local-action` is invoked differently.

| Package Manager | Version | Command     |
| --------------- | ------- | ----------- |
| `npm`           | Any     | `npm exec`  |
| `pnpm`          | Any     | `pnpm dlx`  |
| `yarn`          | `<= 3`  | `yarn exec` |
| `yarn`          | `>= 4`  | `yarn dlx`  |

Alongside this, yarn PnP support is implemented via
[unplugging](https://yarnpkg.com/cli/unplug) any modules stubbed by
`@github/local-action` and "re-plugging" after completion of the action run.

This support is still a work in progress. Any feedback or issues are welcome!

## v2

As of version `2.0.0`, the `local-action` tool has been updated to require
**Node.js v20.6.0** or higher. This is necessary to support ESM loaders to
override dependencies in the GitHub Actions Toolkit.

## v1

With the release of `v1.0.0`, there was a need to switch from
[`ts-node`](https://www.npmjs.com/package/ts-node) to
[`tsx`](https://www.npmjs.com/package/tsx). However, the bundled version of
`tsx` is being used, so you should no longer need to install either :grinning:
