# Contributing

All contributions are welcome and greatly appreciated! However, please try to
keep them limited in scope so that they can be more easily reviewed.

## Steps to Contribute

> [!WARNING]
>
> Check the `engine` property in [`package.json`](./package.json) to see what
> version of Node.js is required for local development. This can be different
> from the version of Node.js used on the GitHub Actions runners. Tools like
> [nodenv](https://github.com/nodenv/nodenv) can be used to manage your Node.js
> version automatically.

1. Fork this repository
1. Clone your fork
1. Install the dependencies with `npm install`
1. Make and test your changes
1. Commit your changes

   Make sure to do the following when you commit your changes:
   - Increase the version number in [`package.json`](./package.json)
   - Run `npm install` to ensure dependencies are up to date
   - Run `npm run all` to run formatting, linting, etc.

1. Open a pull request back to this repository
1. Notify the maintainers of this repository for peer review and approval
1. Merge :tada:

The maintainers of this repository will create a new release with your changes
so that everyone can enjoy your contributions!

## Testing

This project requires **100%** test coverage.

> [!IMPORTANT]
>
> It is critical that we have 100% test coverage to ensure that we are not
> introducing any regressions. All changes will be throughly tested by
> maintainers of this repository before a new release is created.

### Testing Local Updates

As you make changes, it's a great idea to run the `local-action` tool regularly
against various repositories with different configurations.

1. Symlink your package folder (this should only need to be done once)

   ```bash
   npm link
   ```

1. Test your updated version

   ```bash
   local-action run <path> <entrypoint> <dotenv file>

   # Or...
   npm exec local-action run <path> <entrypoint> <dotenv file>
   ```

Once you're finished testing, make sure to unlink!

```bash
npm unlink @github/local-action
```

#### Example Actions to Test

After making updates and running the test suite, please also make sure to test
your updates using the following GitHub Actions repositories:

- [`actions/javascript-action`](https://github.com/actions/javascript-action)
- [`actions/typescript-action`](https://github.com/actions/typescript-action)

1. Clone each repository locally
1. From your `github/local-action` fork, test each action

   ```bash
   npm exec local-action \
   "/<action repository clone path>/typescript-action" \
   "src/main.ts" \
   "<path to your .env file>"

   npm exec local-action \
   "/<action repository clone path>/javascript-action" \
   "src/main.ts" \
   "<path to your .env file>"
   ```

   For an example `.env` file to use for testing, see
   [`.env.example`](./.env.example).

### Running the Test Suite

Simply run the following command to invoke the entire test suite:

```bash
npm run test
```

> [!NOTE]
>
> This requires that you have already run `npm install`

### Toolkit Stub Updates

When updating any of the supported stubs for the GitHub Actions Toolkit, please
make sure to also update the following. This helps ensure that we are using the
latest supported versions of the toolkit packages, and makes comparing changes
across commits easier.

1. The supported version in the [`README.md`](./README.md)

   ```markdown
   | Package                                                                | Version  |
   | ---------------------------------------------------------------------- | -------- |
   | [`@actions/artifact`](https://www.npmjs.com/package/@actions/artifact) | `2.3.2`  |
   | [`@actions/core`](https://www.npmjs.com/package/@actions/core)         | `1.11.1` |
   | [`@actions/github`](https://www.npmjs.com/package/@actions/github)     | `6.0.1`  |
   ```

1. The latest reviewed commit URL in the corresponding `src/stubs/*.ts` file

   ```typescript
   /**
    * Last Reviewed Commit: https://github.com/actions/toolkit/blob/f58042f9cc16bcaa87afaa86c2974a8c771ce1ea/packages/artifact/src/artifact.ts
    * Last Reviewed Date: 2025-09-10
    */
   ```

When comparing commits to see what has been updated in the toolkit packages, be
sure to compare against the last reviewed commit in the corresponding stub file.
This can be done more easily using the following URL format:

```plain
https://github.com/actions/toolkit/compare/<old commit>..main
```
