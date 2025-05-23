// src/types/Field.ts

export interface Field {
    name: string;
    type: 'string' | 'int' | 'configurable' | 'env' | 'record';
    options?: string[];
    isRequired?: boolean;
    defaultValue?: string | number;
    nestedFields?: Field[];
}