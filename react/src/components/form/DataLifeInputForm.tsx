import { useState } from 'react';
import DateTimeInput  from 'components/form/DateTimeInput';
import { Box, Typography } from '@material-ui/core';
import { DataLifeStrings } from 'constants/strings';
import { DataLife, DataLifeInput } from 'types/data_life';
import { Dayjs } from 'dayjs';
import { FormChangeEvent, InboundObj } from 'hooks/useFormHasError';

/**
 * @param dli instance of @type {DataLifeIinput} 
 * @param disableEditActual always disable the attachment start/end fields
 * @param enableEditStart @param enableEditEndenable whether or not to enable the start / end fields
 * @param disableDLStart @param disableDLEnd explicity disable only the data life fields
 * @param onChange optional change handler when a datetime is modified
 */
type DataLifeInputProps = {
  dli: DataLifeInput;
  enableEditStart: boolean;
  enableEditEnd: boolean;

  disableDLStart?: boolean;
  disableDLEnd?: boolean;
  disableEditActual?: boolean;
  propsRequired?: (keyof DataLifeInput)[];
  onChange?: FormChangeEvent;
};

// returns the first key ex. { data_life_start : 'bill' } // 'data_life_start' 
const getFirstKey = (d: InboundObj): string => Object.keys(d)[0];
const getFirstValue = (d: InboundObj): unknown => Object.values(d)[0];

/**
 * todo: time validation if same date?
 */
export default function DataLifeInputForm(props: DataLifeInputProps): JSX.Element {
  const { dli, disableEditActual, enableEditStart, enableEditEnd, onChange, disableDLEnd, disableDLStart, propsRequired } = props;
  const [minDate, setMinDate] = useState<Dayjs>(dli.attachment_start);
  const [maxDate, setMaxDate] = useState<Dayjs>(dli.attachment_end);

  const [isModified, setIsModified] = useState<boolean>(false);

  const handleDateOrTimeChange = (d: InboundObj): void => {
    const k = getFirstKey(d) as keyof Pick<DataLifeInput, 'attachment_start' | 'attachment_end' | 'data_life_end' | 'data_life_start'>;
    const v = getFirstValue(d) as Dayjs;
    dli[k] = v;
    if (k === 'attachment_start') {
      setMinDate(v);
    } else if (k === 'attachment_end') {
      setMaxDate(v);
    }
    // call parent change handler if it exists
    if (typeof onChange === 'function') {
      onChange(d);
    }
    // update state to show warning if data life was modified
    if (k.indexOf('data_') !== -1) {
      setIsModified(true);
    }
  };

  return (
    <Box paddingBottom={2}>
      {/* if data life has been modified - show a warning */}
      <Box height={35} display='flex' justifyContent={'center'}>
        {isModified ? (<Typography color={'error'}>{DataLifeStrings.editWarning}</Typography>) : null}
      </Box>
      <Box>
        {/* attachment start field */}
        
        <DateTimeInput
          propName='attachment_start'
          changeHandler={handleDateOrTimeChange}
          label='Attachment Start'
          defaultValue={dli.attachment_start}
          disabled={!enableEditStart|| disableEditActual}
          required={propsRequired?.includes('attachment_start')}
        />
        <Box component={'span'} m={1} />
        {/* data life start field */}
        <DateTimeInput
          propName='data_life_start'
          changeHandler={handleDateOrTimeChange}
          label='Data Life Start'
          defaultValue={dli.data_life_start}
          disabled={!enableEditStart || disableDLStart}
          minDate={minDate}
          required={propsRequired?.includes('data_life_start')}
        />
        <Box component={'span'} m={1} />
        {/* data life end field */}
        <DateTimeInput
          propName='data_life_end'
          changeHandler={handleDateOrTimeChange}
          label='Data Life End'
          defaultValue={dli.data_life_end}
          disabled={!enableEditEnd || disableDLEnd}
          maxDate={maxDate}
          required={propsRequired?.includes('data_life_end')}
        />
        <Box component={'span'} m={1} />
        {/* attachment end field */}
        {/* <FormControl error={true} > */}
        <DateTimeInput
          propName='attachment_end'
          changeHandler={handleDateOrTimeChange}
          label='Attachment End'
          defaultValue={dli.attachment_end}
          disabled={!enableEditEnd|| disableEditActual}
          required={propsRequired?.includes('attachment_end')}
        />
        {/* </FormControl> */}
      </Box>
    </Box>
  );
}
