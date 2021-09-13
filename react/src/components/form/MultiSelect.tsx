import { Checkbox, FormControl, InputLabel, MenuItem, OutlinedInput, Select, SelectProps } from '@material-ui/core';
import React, { useEffect, useState } from 'react';

type SelectValue = string | number;

export type SelectMultiple = {
  id: number;
  value: SelectValue;
  default?: boolean;
  displayLabel?: string;
}

type SelectMultipleProps = SelectProps & {
  label: string;
  renderValue?: (value: unknown) => React.ReactNode;
  renderTypeLabel?: string; // what to show when multiple are selected
  changeHandler: (o: SelectMultiple[]) => void;
  triggerReset?: boolean; // force unselect of all values
  data: SelectMultiple[];
};

const selectAll = { id: -1, value: 'Select All', default: false };

/**
 * a multi-select dropdown component. unlike the @function SelectCode component,
 * @param data must be provided  
 */
export default function MultiSelect(props: SelectMultipleProps): JSX.Element {
  const { label, data, triggerReset, changeHandler, renderTypeLabel } = props;

  const getDefaults = () => data.filter((d) => d.default).map((o) => o.value);
  const [selected, setSelected] = useState<SelectValue[]>(getDefaults());

  const handleCheckRow = (item: SelectMultiple, checked: boolean): void => {
    const { id, value } = item;
    let newSelected: SelectValue[] = [];
    // when the option checked is not 'select all'
    if (id !== selectAll.id) {
      newSelected = selected;
      if (selected.length === data.length || selected.includes(value)) {
        newSelected.splice(selected.indexOf(value), 1);
      } else {
        selected.push(value);
      }
    } else {
      if (checked) {
        newSelected = data.map((d) => d.value);
      } else {
        newSelected = [];
      }
    }
    setSelected([...newSelected]);
    changeHandler(data.filter((d) => newSelected.includes(d.value)));
  };

  useEffect(() => {
    setSelected([...getDefaults()]);
  }, [triggerReset]);

  return (
    <FormControl size='small' variant={'outlined'} className={'select-control'}>
      <InputLabel>{label}</InputLabel>
      <Select
        MenuProps={{
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          transformOrigin: { vertical: 'top', horizontal: 'left' },
          getContentAnchorEl: null
        }}
        // fixme: why is the input prop is required to have the 'notch' wide enough
        // to not cover the label. works fine in SelectCode without this??
        input={<OutlinedInput labelWidth={label.length * 7} />}
        style={props.style}
        multiple={true}
        variant={'outlined'}
        value={selected}
        renderValue={props.renderValue ?? ((): string =>
          selected.length > 3 ? `${selected.length} ${renderTypeLabel ?? ''} selected` : selected.join(', ')
        )}>
        {[...[selectAll], ...data].map((d: SelectMultiple, idx: number) => {
          return (
            <MenuItem key={`${idx}-${d.id}`} value={d.value}>
              <Checkbox
                size='small'
                color='primary'
                checked={
                  d.value === selectAll.value
                    ? selected.length === data.length || selected.includes(d.value)
                    : selected.includes(d.value)
                }
                onChange={(e, checked): void => handleCheckRow(d, checked)}
              />
              {d.displayLabel ?? d.value}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
