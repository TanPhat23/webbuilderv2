function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function resolveFieldFromData(field: string, data: unknown): unknown {
  if (!isPlainRecord(data)) return undefined;

  let value: unknown = data;
  for (const part of field.split(".")) {
    if (isPlainRecord(value) && part in value) {
      value = value[part];
    } else {
      value = undefined;
      break;
    }
  }
  if (value !== undefined) return value;

  const rawFieldValues = data.fieldValues;
  if (Array.isArray(rawFieldValues)) {
    for (const entry of rawFieldValues) {
      if (!isPlainRecord(entry)) continue;
      const meta = entry.field;
      if (isPlainRecord(meta) && meta.name === field) {
        return entry.value;
      }
    }
  } else if (isPlainRecord(rawFieldValues) && field in rawFieldValues) {
    return rawFieldValues[field];
  }

  return undefined;
}

export const replacePlaceholders = (text: string, data: unknown): string => {
  if (!data || typeof data !== "object") return text;

  return text.replace(/\{\{([^}]+)\}\}/g, (match, placeholder: string) => {
    const [rawField = "", rawFilter] = placeholder.split("|");
    const field = rawField.trim();
    const filter = rawFilter?.trim();
    if (!field) return match;

    let value = resolveFieldFromData(field, data);
    if (value === undefined) return match;

    if (filter === "date" && value) {
      try {
        value = new Date(String(value)).toLocaleDateString();
      } catch {
        // Keep original value when date parsing fails.
      }
    }

    return String(value);
  });
};
