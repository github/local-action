/** Default print width for titles */
export const printWidth: number = 80

/**
 * Prints a title with a specific color
 *
 * @param color The color function to use
 * @param title The title text to print
 * @returns void
 */
export function printTitle(
  color: (message: string) => void,
  title: string
): void {
  const spaces: string = ' '.repeat((80 - title.length) / 2)

  color('='.repeat(printWidth))
  color(`${spaces}${title}`)
  color('='.repeat(printWidth))
}
