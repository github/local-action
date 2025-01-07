/**
 * @github/local-action Modified
 */
export function getUserAgentString(): string {
  return `@github/local-action-${process.env.npm_package_version}`
}
