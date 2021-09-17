import { ReactNode } from "react";

export enum eInputType {
  text = 'text',
  number = 'number',
  check = 'check',
  unknown = 'unknown',
  date = 'date',
  datetime = 'datetime',
  time = 'time',
  code = 'code',
  multiline = 'multiline',
}

/**
 * used to assist defining form types for null property values
 * ex. a device retrieved date could be null, but it should be rendered
 * in a form as a date input
 */
export type FormFieldObject<T> = {
  prop: keyof T;
  type: eInputType;
  codeName?: string;
  required?: boolean;
  span?: boolean;
  disabled?: boolean; // todo:
  tooltip?: ReactNode;
};

// spread in form field constructors to make a field required
export const isRequired = { required: true};

// what a form component passes when it's changed
// ex: {name: 'bill', error: false}
export type InboundObj = {
  [key: string]: unknown;
  error?: boolean;
};

export type FormChangeEvent = {(v: InboundObj): void}

/**
 * form change events pass an object with:
 * a) a keyof T / value
 * b) error: boolean
 * @returns the keyof T / value record
 */
export const parseFormChangeResult= <T>(changed: InboundObj): [keyof T, unknown] => {
  const key = Object.keys(changed)[0] as keyof T;
  const value = Object.values(changed)[0];
  return [key, value];
}