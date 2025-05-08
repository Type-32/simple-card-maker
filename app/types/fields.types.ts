export type FieldValueType = {
    fieldName: string,
    fieldValue?: string | number | string[],
    fieldType: 'input' | 'number' | 'textarea' | 'tags'
}