import TextField from 'components/form/TextInput';
import NumberField from 'components/form/NumberInput';
import SelectCode from './SelectCode';
import DateInput from 'components/form/Date';
import DateTimeInput from 'components/form/DateTimeInput';
import CheckBox from 'components/form/Checkbox';
import React from 'react';
import { columnToHeader, removeProps } from 'utils/common_helpers';
import { eInputType, FormChangeEvent, FormFieldObject } from 'types/form_types';
import { BCTWEvent } from 'types/events/event';
import dayjs, { Dayjs } from 'dayjs';

type CreateInputBaseProps<T> = {
  value: unknown;
  prop: keyof T;
  type: eInputType;
  handleChange: (v: Record<string, unknown>) => void;
};

type CreateInputProps<T> = CreateInputBaseProps<T> & {
  codeName?: string;
  label?: string;
  disabled?: boolean;
  errorMessage?: string;
  required?: boolean;
  span?: boolean;
};

// text and number field handler
function CreateEditTextField<T>(props: CreateInputProps<T>): JSX.Element {
  const { prop, value } = props;
  // note: passing 'value' will cause the component to consider itself 'controlled'
  const propsToPass = removeProps(props, ['value', 'errorMessage', 'codeName']);
  const propName = prop as string;
  return typeof value === 'number' ? (
    <NumberField
      propName={propName}
      key={`input-num-${propName}`}
      defaultValue={value as number}
      changeHandler={props.handleChange}
      {...propsToPass}
    />
  ) : (
    <TextField
      key={`input-text-${propName}`}
      propName={propName}
      defaultValue={value as string}
      changeHandler={props.handleChange}
      error={!!props.errorMessage ?? false}
      helperText={props.errorMessage}
      {...propsToPass}
    />
  );
}

// date field handler
function CreateEditDateField<T>({ prop, value, handleChange, label, disabled }: CreateInputProps<T>): JSX.Element {
  console.log('CreateEditDateField fix me: date -> dayjs')
  return (
    <DateInput
      propName={prop as string}
      label={label ?? ''}
      defaultValue={value as Dayjs}
      changeHandler={handleChange}
      disabled={disabled}
      key={`input-date-${prop}`}
    />
  );
}

// datetime field handler
function CreateEditDateTimeField<T>({ prop, value, handleChange, label, disabled }: CreateInputProps<T>): JSX.Element {
  return (
    <DateTimeInput
      propName={prop as string}
      label={label ?? ''}
      defaultValue={dayjs(value as Date)}
      changeHandler={handleChange}
      disabled={disabled}
      key={`input-dt-${prop}`}
    />
  );
}

// checkbox field handler
function CreateEditCheckboxField<T>({ prop, value, handleChange, label, disabled }: CreateInputProps<T>): JSX.Element {
  return (
    <CheckBox
      changeHandler={handleChange}
      initialValue={value as boolean}
      label={label ?? ''}
      propName={prop as string}
      disabled={disabled}
      key={`input-check-${prop}`}
    />
  );
}

// select component handler
function CreateEditSelectField<T>({
  value,
  prop,
  handleChange,
  disabled,
  required,
  errorMessage,
  label,
  codeName
}: CreateInputProps<T>): JSX.Element {
  return (
    <SelectCode
      style={{ width: '200px', marginRight: '10px' }}
      label={label}
      disabled={disabled}
      key={prop as string}
      codeHeader={codeName ?? (prop as string)}
      defaultValue={value as string ?? ''}
      changeHandler={handleChange}
      required={required}
      error={!!errorMessage?.length}
      className={'select-control-small'}
      propName={codeName ? (prop as string) : undefined}
    />
  );
}

/**
 * the "main" form component handler.
 * depending on the @param formType.type, creates the component using the above functions
 * @returns {JSX.Element}
 * todo: deprecate this to function below
 */
function MakeEditField<T>({
  prop,
  type,
  value,
  handleChange,
  codeName,
  label = columnToHeader(prop as string),
  disabled = false,
  errorMessage = '',
  required = false,
  span = false
}: CreateInputProps<T>): React.ReactNode {
  const inputType = type;
  const toPass = { prop, type, value, handleChange, label, disabled, errorMessage, required, codeName };
  let Comp: React.ReactNode;
  if (inputType === eInputType.check) {
    Comp = CreateEditCheckboxField(toPass);
  } else if (inputType === eInputType.datetime) {
    Comp = CreateEditDateTimeField(toPass);
  } else if (inputType === eInputType.date) {
    Comp = CreateEditDateField(toPass);
  } else if (inputType === eInputType.code) {
    Comp = CreateEditSelectField(toPass);
  } else if (inputType === eInputType.text || inputType === eInputType.number) {
    Comp = CreateEditTextField(toPass);
  }
  return span ? (
    <span key={`span-${prop}`} className={'edit-form-field-span'}>
      {Comp}
    </span>
  ) : (
    <div key={prop as string} className={'edit-form-field'}>
      {Comp}
    </div>
  );
}

function FormFromFormfield<T extends BCTWEvent<T>>(
  obj: T,
  formField: FormFieldObject<T> | undefined,
  handleChange: FormChangeEvent,
  disabled = false,
  displayBlock = false
): React.ReactNode {
  if (formField === undefined) {
    return null
  }
  const { type, prop, required, codeName } = formField;
  const toPass = {
    prop,
    type,
    value: obj[prop],
    handleChange,
    label: obj.formatPropAsHeader(prop),
    disabled,
    required,
    codeName,
    key: `${type}-${prop}`
  };
  let Comp: React.ReactNode;
  if (type === eInputType.check) {
    Comp = CreateEditCheckboxField(toPass);
  } else if (type === eInputType.date) {
    Comp = CreateEditDateTimeField(toPass);
  } else if (type === eInputType.datetime) {
    Comp = CreateEditDateTimeField(toPass);
  } else if (type === eInputType.code) {
    Comp = CreateEditSelectField(toPass);
  } else if (type === eInputType.text || type === eInputType.number) {
    Comp = CreateEditTextField(toPass);
  }
  return displayBlock ? <div>{Comp}</div> : Comp;
}

export {
  CreateEditTextField,
  CreateEditDateField,
  CreateEditCheckboxField,
  CreateEditSelectField,
  MakeEditField,
  FormFromFormfield
};
