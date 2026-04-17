type FieldItem = {
  field: string;
  value: string | number | boolean | null;
};

type FieldObject = {
  [key: string]: string | number | boolean;
};

export function transformarFields(array: FieldItem[]): FieldObject {
  const obj: FieldObject = {};

  for (let i = 0; i < array.length; i++) {
    const item = array[i];

    if (item && item.field) {
      obj[item.field] = item.value ?? "";
    }
  }

  console.log("obj: ", obj);

  return obj;
}
