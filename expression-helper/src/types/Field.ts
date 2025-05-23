// src/types/Field.ts

export interface Field {
  name: string;
  type: string;
  isRequired?: boolean;
  defaultValue?: string;
  value?: string; // Add value field to hold current expression
  nestedFields?: Field[];
}