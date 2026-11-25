export type RuleType =
  | "minLength"
  | "maxLength"
  | "pattern"
  | "required"
  | "min"
  | "max"
  | "custom";

interface BaseValidationRule<T = unknown> {
  rule: RuleType;
  message: string;
  readonly _typeBrand?: T;
}

interface ValueRule<T> extends BaseValidationRule<T> {
  value: T;
}

export interface MinLengthRule extends ValueRule<number> {
  rule: "minLength";
}

export interface MaxLengthRule extends ValueRule<number> {
  rule: "maxLength";
}

export interface PatternRule extends ValueRule<RegExp | string> {
  rule: "pattern";
}

export interface RequiredRule extends BaseValidationRule {
  rule: "required";
}

export interface MinRule extends ValueRule<number> {
  rule: "min";
}

export interface MaxRule extends ValueRule<number> {
  rule: "max";
}

export interface CustomRule<T = unknown> extends BaseValidationRule<T> {
  rule: "custom";
  validate: (value: T) => boolean;
}

export type ValidationRule<T = unknown> =
  | RequiredRule
  | MinLengthRule
  | MaxLengthRule
  | PatternRule
  | MinRule
  | MaxRule
  | CustomRule<T>;
