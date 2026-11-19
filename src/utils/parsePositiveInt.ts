// Query-string and URL-segment values are text a user can edit by hand (?page=abc, /recipes/-1):
// only a positive integer is accepted, anything else counts as "not given".
export function parsePositiveInt(value: string | null | undefined): number | undefined {
  if (value === null || value === undefined) {
    return undefined
  }
  const number = Number(value)

  return Number.isInteger(number) && number > 0 ? number : undefined
}
