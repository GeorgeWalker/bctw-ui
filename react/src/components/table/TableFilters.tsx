import { Box } from '@material-ui/core';
import MultiSelect, { SelectMultiple } from 'components/form/MultiSelect';
import TextField from 'components/form/TextInput';
import { useMemo, useState } from 'react';
import { columnToHeader } from 'utils/common_helpers';
import { ITableFilter } from './table_interfaces';
import { InboundObj } from 'types/form_types';

type TextFilterProps = {
  rowCount: number;
  defaultFilter?: string;
  setGlobalFilter: (filter: string) => void;
  disabled?: boolean;
};

/**
 * the text input search/filter component
 */
function TextFilter({
  disabled,
  rowCount,
  defaultFilter,
  setGlobalFilter,
}: TextFilterProps): JSX.Element {
  const [value, setValue] = useState<string>(defaultFilter ?? '');
  const propName = 'search';

  const handleChange = (v: InboundObj): void => {
    const value = v[propName] as string;
    setValue(value);
    setGlobalFilter(value);
  };
  return (
    <TextField
      className="table-filter-input"
      defaultValue={value}
      changeHandler={handleChange}
      label={'Search'}
      placeholder={`${rowCount} records...`}
      propName={propName}
      disabled={disabled}
    />
  );
}

type TableFilterProps<T> = {
  rowCount: number;
  // filterableProperties: string[];
  filterableProperties: (keyof T)[];
  onChangeFilter: (filter: ITableFilter) => void;
};

/**
 * the main search component visible in table toolbars
 */
function TableFilter<T>(props: TableFilterProps<T>): JSX.Element {
  const { filterableProperties, onChangeFilter, rowCount } = props;
  const [selectedOption, setSelectedOption] = useState<string[]>([]);
  const [showFilter] = useState(true);

  const handleSelect = (v: SelectMultiple[]): void => {
    const values = v.map(item => item.value as keyof T);
    setSelectedOption(values as string[]);
  };

  const handleTextChange = (value: string): void => {
    const n: ITableFilter = { keys: selectedOption, operator: 'contains', term: value }
    onChangeFilter(n);
  };

  // minimize re-rendering
  // from the headers, generate the values of the dropdown options
  const selectOptions = useMemo(
    () =>
      filterableProperties.map((f, i) => {
        return {
          id: i,
          value: f,
          displayLabel: columnToHeader(f as string)
        } as SelectMultiple;
      }),
    []
  );

  return (
    <>
      {showFilter ? (
        <Box display="flex" alignItems="center" width="100%">
          <TextFilter
            rowCount={rowCount}
            setGlobalFilter={handleTextChange}
          />
          <MultiSelect renderValue={(v: unknown): string => `${(v as string[]).length} selected`} label={'Filter Columns'} data={selectOptions} changeHandler={handleSelect} />
        </Box>
      ) : null}

      {/* <Tooltip title={ `${showFilter ? 'Hide' : 'Show'} Filter Controls`} >
        <IconButton onClick={(): void => setShowFilter((o) => !o)} aria-label='filter list'>
          <FilterListIcon htmlColor='#90caf9' />
        </IconButton>
      </Tooltip> */}

    </>
  );
}

export default TableFilter;
