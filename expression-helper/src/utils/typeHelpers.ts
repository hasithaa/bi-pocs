export type FieldType = 'string' | 'int' | 'configurable' | 'envVariable' | 'record';

export interface Field {
    name: string;
    type: FieldType;
    options?: string[];
}

export function isString(value: any): value is string {
    return typeof value === 'string';
}

export function isInt(value: any): value is number {
    return Number.isInteger(value);
}

export function convertToString(value: any): string {
    if (isString(value)) {
        return value;
    }
    if (isInt(value)) {
        return value.toString();
    }
    return '';
}

export function convertToInt(value: any): number | null {
    if (isInt(value)) {
        return value;
    }
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
}

export function getDefaultValue(field: Field): any {
    switch (field.type) {
        case 'string':
            return '';
        case 'int':
            return 0;
        case 'configurable':
            return null; // or some default configurable value
        case 'envVariable':
            return ''; // or some default env variable
        case 'record':
            return {}; // or some default record structure
        default:
            return null;
    }
}