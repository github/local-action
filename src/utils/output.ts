export const printWidth = 80

export function printTitle(color: any, title: string): void {
  const spaces = ' '.repeat((80 - title.length) / 2)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  color('='.repeat(printWidth))
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  color(`${spaces}${title}`)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  color('='.repeat(printWidth))
}
