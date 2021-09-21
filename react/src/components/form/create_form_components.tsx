import TextField from 'components/form/TextInput';
import NumberField from 'components/form/NumberInput';
import SelectCode from './SelectCode';
import DateInput from 'components/form/Date';
import DateTimeInput from 'components/form/DateTimeInput';
import CheckBox from 'components/form/Checkbox';
import { ReactElement, ReactNode } from 'react';
import { removeProps } from 'utils/common_helpers';
import { eInputType, FormChangeEvent, FormFieldObject } from 'types/form_types';
import dayjs, { Dayjs } from 'dayjs';
import { BCTWFormat } from 'types/common_types';
import { Tooltip } from 'components/common'
import { InputProps } from '@material-ui/core';

type CreateInputBaseProps<T> = {
  value: unknown;
  prop: keyof T;
  type: eInputType;
  handleChange: (v: Record<string, unknown>) => void;
};

type CreateInputProps<T> = CreateInputBaseProps<T> & Pick<InputProps, 'rows' | 'multiline'> & {
  codeName?: string;
  label?: string;
  disabled?: boolean;
  errorMessage?: string;
  required?: boolean;
  span?: boolean;
};

// text and number field handler
function CreateEditTextField<T>(props: CreateInputProps<T>): ReactElement {
  const { prop, type, value } = props;
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
      type={type}
      changeHandler={props.handleChange}
      error={!!props.errorMessage ?? false}
      helperText={props.errorMessage}
      {...propsToPass}
    />
  );
}

function CreateEditMultilineTextField<T>(props: CreateInputProps<T>): ReactElement {
  const newProps = Object.assign({multiline: true, rows: 1, style: { width: '100%'}}, props);
  return CreateEditTextField(newProps);
}

// date field handler
function CreateEditDateField<T>({ prop, value, handleChange, label, disabled }: CreateInputProps<T>): ReactElement {
  return (
    <DateInput
      propName={prop as string}
      label={label}
      defaultValue={value as Dayjs}
      changeHandler={handleChange}
      disabled={disabled}
      key={`input-date-${prop}`}
    />
  );
}

// datetime field handler
function CreateEditDateTimeField<T>({ prop, value, handleChange, label, disabled, required }: CreateInputProps<T>): ReactElement {
  return (
    <DateTimeInput
      propName={prop as string}
      label={label}
      defaultValue={dayjs(value as Date)}
      changeHandler={handleChange}
      disabled={disabled}
      key={`input-dt-${prop}`}
      required={required}
      rows={3}
    />
  );
}

// checkbox field handler
function CreateEditCheckboxField<T>({ prop, value, handleChange, label, disabled }: CreateInputProps<T>): ReactElement {
  return (
    <CheckBox
      changeHandler={handleChange}
      initialValue={value as boolean}
      label={label}
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
}: CreateInputProps<T>): ReactElement {
  return (
    <SelectCode
      style={{ width: '200px', marginRight: '10px' }}
      label={label}
      disabled={disabled}
      key={prop as string}
      codeHeader={codeName ?? (prop as string)}
      defaultValue={(value as string) ?? ''}
      changeHandler={handleChange}
      required={required}
      error={!!errorMessage?.length}
      className={'select-control-small'}
      propName={codeName ? (prop as string) : undefined}
    />
  );
}

// returns the funtion to create the form component based on input type
const getInputFnFromType = (inputType: eInputType): ((props: unknown) => ReactElement ) => {
  switch (inputType) {
    case eInputType.check:
      return CreateEditCheckboxField;
    case eInputType.datetime:
      return CreateEditDateTimeField;
    case eInputType.date:
      return CreateEditDateField;
    case eInputType.code:
      return CreateEditSelectField;
    case eInputType.multiline:
      return CreateEditMultilineTextField;
    default:
      return CreateEditTextField;
  }
};

/**
 * the "main" form component creation handler.
 */
function CreateFormField<T extends BCTWFormat<T>>(
  obj: T,
  formField: FormFieldObject<T> | undefined,
  handleChange: FormChangeEvent,
  disabled = false,
  displayBlock = false
): ReactNode {
  if (formField === undefined) {
    return null;
  }
  const { type, prop, required, codeName, tooltip } = formField;
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
  let Comp = getInputFnFromType(type)(toPass);

  if (tooltip) {
    Comp = (
      <Tooltip title={tooltip} placement={'right-end'} enterDelay={600}>
        {/* note: wrapping tooltip child in div fixes the forward refs error */}
        <div>{Comp}</div>
      </Tooltip>
    );
  }
  return displayBlock ? <div>{Comp}</div> : Comp;
}

export { CreateEditTextField, CreateEditDateField, CreateEditCheckboxField, CreateEditSelectField, CreateFormField };
