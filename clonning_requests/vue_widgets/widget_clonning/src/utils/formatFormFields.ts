type FieldItem = {
  field: string;
  value: string | number | boolean | null;
};

type FieldObject = {
  [key: string]: string | number | boolean;
};

function normalizeStringValue(value: string | number | boolean | null) {
  if (typeof value !== "string") {
    return value;
  }

  let normalized = value;

  const fixByteDecode = (text: string) => {
    try {
      const bytes = new Uint8Array(
        Array.from(text, (char) => char.charCodeAt(0)),
      );
      const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
      return decoded;
    } catch {
      return text;
    }
  };

  normalized = normalized.replace(/Â /g, " ");

  if (/Ã|Â/.test(normalized)) {
    const decoded = fixByteDecode(normalized);
    if (decoded && !decoded.includes("�")) {
      normalized = decoded;
    }
  }

  normalized = normalized.replace(/Ã©/g, "é");
  normalized = normalized.replace(/Ã¡/g, "á");
  normalized = normalized.replace(/Ãª/g, "ê");
  normalized = normalized.replace(/Ã§/g, "ç");
  normalized = normalized.replace(/Ã´/g, "ô");
  normalized = normalized.replace(/Ã£/g, "ã");
  normalized = normalized.replace(/Ãµ/g, "õ");
  normalized = normalized.replace(/Ã‰/g, "É");
  normalized = normalized.replace(/ÃÁ/g, "Á");
  normalized = normalized.replace(/ÃÃ/g, "Ã");
  normalized = normalized.replace(/Â¢/g, "¢");
  normalized = normalized.replace(/Â£/g, "£");
  normalized = normalized.replace(/Â¥/g, "¥");
  normalized = normalized.replace(/Âª/g, "ª");
  normalized = normalized.replace(/Âº/g, "º");

  return normalized;
}

export function transformarFields(array: FieldItem[]): FieldObject {
  const obj: FieldObject = {};

  for (let i = 0; i < array.length; i++) {
    const item = array[i];

    if (item && item.field) {
      const normalizedValue = normalizeStringValue(item.value ?? "");
      obj[item.field] = normalizedValue as string | number | boolean;
    }
  }

  return obj;
}
