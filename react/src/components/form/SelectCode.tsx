import 'styles/form.scss';
import { FormControl, Select, InputLabel, MenuItem, Checkbox } from '@material-ui/core';
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { ICode, ICodeFilter } from 'types/code';
import { NotificationMessage } from 'components/common';
import { removeProps } from 'utils/common_helpers';
import { SelectProps } from '@material-ui/core';
import { FormStrings } from 'constants/strings';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { formatAxiosError } from 'utils/errors';

type ISelectProps = SelectProps & {
  codeHeader: string;
  defaultValue?: string;
  changeHandler: (o: Record<string, unknown>) => void;
  changeHandlerMultiple?: (o: ICodeFilter[]) => void;
  triggerReset?: boolean;
  addEmptyOption?: boolean;
  propName?: string;
};

/**
 * a dropdown select component that loads code tables for options
 * @param codeHeader the code_header_name to load codes from
 * @param defaultValue default code description to display
 * @param changeHandler called when a dropdown option is selected
 * @param multiple specific props:
 *   @param changeHandlerMultiple
 *   @param triggerReset unchecks all selected values
 *   @param addEmptyOption optionally add a 'blank' entry to end of select options
 * @param propname use this field as the key if the code header isn't the same. ex - ear_tag_colour_id
*/

// fixme: in react strictmode the material ui component is warning about deprecated findDOMNode usage
export default function SelectCode(props: ISelectProps): JSX.Element {
  const {
    addEmptyOption,
    codeHeader,
    defaultValue,
    changeHandler,
    changeHandlerMultiple,
    label,
    multiple,
    triggerReset,
    className,
    style,
    required,
    propName
  } = props;
  const bctwApi = useTelemetryApi();
  const [value, setValue] = useState<string | undefined>(defaultValue);
  const [values, setValues] = useState<string[]>([]);
  const [codes, setCodes] = useState<ICode[]>([]);
  const [hasError, setHasError] = useState<boolean>(required && !defaultValue ? true : false);

  // to handle React warning about not recognizing the prop on a DOM element
  const propsToPass = removeProps(props, [
    'propName',
    'addEmptyOption',
    'codeHeader',
    'changeHandler',
    'labelTitle',
    'changeHandlerMultiple',
    'triggerReset',
    'defaultValue'
  ]);

  // load this codeHeaders codes from db
  const { data, error, isFetching, isError, isLoading, isSuccess } = bctwApi.useCodes(0, codeHeader);

  // when data is successfully fetched
  useEffect(() => {
    const updateOptions = (): void => {
      if (!data?.length) {
        return;
      }
      // add an empty option to beginning, use ' ' as sometimes the value is defaulted to ''
      if (addEmptyOption && data.findIndex((d) => d?.id === 0) === -1) {
        data.push({ id: 0, code: '', description: FormStrings.emptySelectValue });
      }
      setCodes(data);
      // if a default was set (a code description, update the value to its actual value)
      // pass false as second param to not update the modals 'is saveable property'
      const found = data.find((d) => d?.description === defaultValue);
      setValue(found?.description ?? '');
    };
    updateOptions();
  }, [isSuccess]);

  // when the parent component forces a reset
  useEffect(() => {
    if (triggerReset && multiple) {
      setValues([]);
    }
  }, [triggerReset]);

  // when default value changed, call reset handler
  useDidMountEffect(() => {
    reset();
  }, [defaultValue]);

  // call the parent change handler when the selected value or error status changes
  // use useEffect to ensure parent is notified when the code is required and empty
  useEffect(() => {
    if (value) {
      pushChange(value);
    }
  }, [value, hasError])

  const handleSelect = (event: ChangeEvent<{ name?: string | undefined; value: unknown; }>): void => {
    const e = event.target.value;
    multiple ? handleChangeMultiple(e as string[]) : handleChangeSingle(e as string);
  }

  // default handler when @param multiple is false
  const handleChangeSingle = (v: string): void => {
    setHasError(false);
    setValue(v);
  };

  // default handler when @param multiple is true
  const handleChangeMultiple = (v: string[]): void => {
    setValues(v);
    pushChangeMultiple(v);
  };

  // triggered when the default value is changed
  // ex. different editing object selected
  const reset = (): void => {
    const v = defaultValue;
    if (v && multiple && defaultValue !== undefined) {
      setValues([v]);
    } else {
      setValue(v);
    }
  };

  /**
   * calls the parent changeHandler function
   * passing an object in the form of 
   * {
   *   [propName]: code,
   *   error: bool
   * }
   */
  const pushChange = (v: string): void => {
    const code = codes.find((c) => c?.description === v)?.code ?? v;
    const ret = { [getIdentifier()]: code, error: hasError };
    if (typeof changeHandler === 'function') {
      changeHandler(ret);
    }
  };

  /**
   * if @param codeHeader is not the same, use @param propName instead when
   * pushing the changed value to the parent @param changeHandler
   */
  const getIdentifier = (): string => propName ? propName : codeHeader;

  const pushChangeMultiple = (selected: string[]): void => {
    const filtered = codes.filter((c) => selected.indexOf(c?.description) !== -1);
    const ret = filtered.map((c) => {
      /// return a combination of the original code and the value
      /// why? these are most likely to be used in client side filtering
      /// where we dont need the code value but the description
      return { ...c, ...{ code_header: codeHeader } };
    });
    if (typeof changeHandlerMultiple === 'function') {
      changeHandlerMultiple(ret as ICodeFilter[]);
    }
  };

  

  return (
    <>
      {isError && error ? (
        <NotificationMessage severity='error' message={formatAxiosError(error)} />
      ) : isLoading || isFetching ? (
        <div>Please wait...</div>
      ) : codes && codes.length ? (
        <FormControl error={hasError} style={style} size='small' variant={'outlined'} className={className ?? 'select-control'}>
          <InputLabel>{label}</InputLabel>
          <Select
            className={className}
            MenuProps={{
              anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
              transformOrigin: { vertical: 'top', horizontal: 'left' },
              getContentAnchorEl: null
            }}
            label={label}
            variant={'outlined'}
            value={multiple ? values : value}
            onChange={handleSelect}
            renderValue={(selected: unknown): React.ReactNode => {
              if (multiple) {
                // remove empty string values
                const l = (selected as string[]).filter((a) => a);
                return l.length > 4 ? `${l.length} selected` : l.join(', ');
              }
              return selected as React.ReactNode;
            }}
            {...propsToPass}>
            {codes.map((c: ICode) => {
              if (!multiple) {
                return (
                  <MenuItem key={c?.id} value={c?.description}>
                    {c?.description}
                  </MenuItem>
                );
              }
              return (
                <MenuItem key={c?.id} value={c?.description}>
                  <Checkbox size='small' color='primary' checked={values.indexOf(c?.description) !== -1} />
                  {c?.description}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      ) : (
        <div>unable to load {codeHeader} codes</div>
      )}
    </>
  );
}