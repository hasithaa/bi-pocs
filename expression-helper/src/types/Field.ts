// src/types/Field.ts

export interface Field {
  name: string;
  type: string;
  isRequired?: boolean;
  defaultValue?: string;
  value?: string;
  syntax_kind?: SyntaxKind;
  nestedFields?: Field[];
}

export enum SyntaxKind {
  Literal = "Literal",
  StringTemplate = "StringTemplate",
  VarRef = "VarRef",
  MemberAccess = "MemberAccess",
  OptionalAccess = "OptionalAccess", 
  MethodCall = "MethodCall",
  Elvis = "Elvis",
  VAR_Elvis = "VAR_Elvis" // New type for variable with elvis
}

// Extended Value interface for variable selection
export interface Value {
  name: string;
  type: string;
  isConstant?: boolean;
  isConfigurable?: boolean;
  isRecord?: boolean;
  isOptional?: boolean;
  nestedFields?: Value[];
}