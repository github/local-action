export const printWidth = 80

export function printTitle(color: any, title: string): void {
  const spaces = ' '.repeat((80 - title.length) / 2)
  color('='.repeat(printWidth))
  color(`${spaces}${title}`)
  color('='.repeat(printWidth))
}
