// src/types/Expression.ts

export interface Expression {
    type: 'string' | 'int' | 'configurable' | 'envVariable' | 'advanced';
    value: string | number | { name: string; value: string } | { variable: string };
}