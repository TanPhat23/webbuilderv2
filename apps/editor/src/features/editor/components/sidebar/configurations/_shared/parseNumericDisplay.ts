export function parseNumericDisplay(value: string | number | undefined): string {
  if (value === undefined || value === null || value === "") return "0";
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? "0" : String(parsed);
}
