export const replacePlaceholders = (text: string, data: unknown): string => {
  if (!data || typeof data !== "object") return text;

  return text.replace(/\{\{([^}]+)\}\}/g, (match, placeholder: string) => {
    const [field, filter] = placeholder.split("|");
    let value: unknown = data;

    for (const part of field.split(".")) {
      if (value && typeof value === "object" && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        value = undefined;
        break;
      }
    }

    if (value === undefined) return match;

    if (filter === "date" && value) {
      try {
        value = new Date(String(value)).toLocaleDateString();
      } catch {
        // keep original value if date parsing fails
      }
    }

    return String(value);
  });
};
