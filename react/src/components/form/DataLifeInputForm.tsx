import { useState } from 'react';
import DateTimeInput, { DTimeChangeOutput } from 'components/form/DateTimeInput';
import { Box, Typography } from '@material-ui/core';
import { DataLifeStrings } from 'constants/strings';
import { DataLifeInput } from 'types/data_life';
import { Dayjs } from 'dayjs';

/**
 * @param disableEditActual flag to always disable the attachment start/end fields
 * @param showStart
 * @param showEnd
 * @param onChange optional change handler when a datetime is modified
 * @param dli instance of @class DataLifeIinput 
 */
type DataLifeInputProps = {
  disableEditActual?: boolean;
  showStart: boolean;
  showEnd: boolean;
  dli: DataLifeInput;
  onChange?: (d: DTimeChangeOutput) => void;
};

const getFirstKey = (d: DTimeChangeOutput): string => Object.keys(d)[0];
const getFirstValue = (d: DTimeChangeOutput): Dayjs => Object.values(d)[0];

/**
 * todo: time validation if same date?
 * todo: admin always enable DL edit
 */
export default function DataLifeInputForm(props: DataLifeInputProps): JSX.Element {
  const { dli, disableEditActual, showStart, showEnd, onChange } = props;
  const [minDate, setMinDate] = useState<Dayjs>(dli.attachment_start);
  const [maxDate, setMaxDate] = useState<Dayjs>(dli.attachment_end);

  const [isModified, setIsModified] = useState<boolean>(false);

  // on initial load, determine if DL timestamps have been changed
  // fixme:
  // const canEditDLStart = dli.canChangeDLStart;
  // const canEditDLEnd = dli.canChangeDLEnd;
  // console.log(dli, canEditDLStart, canEditDLEnd)

  const handleDateOrTimeChange = (d): void => {
    const k = getFirstKey(d);
    const v = getFirstValue(d);
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
      {/* if data life has been modified - show a warnning */}
      <Box height={35} display='flex' justifyContent={'center'}>
        {isModified ? (<Typography color={'error'}>{DataLifeStrings.editWarning}</Typography>) : null}
      </Box>
      <Box>
        {/* attachment start field */}
        <DateTimeInput
          propName='attachment_start'
          // changeHandler={handleDateOrTimeChange}
          changeHandler={handleDateOrTimeChange}
          label='Actual Start'
          defaultValue={dli.attachment_start}
          disabled={!showStart || disableEditActual}
        />
        <Box component={'span'} m={1} />
        {/* data life start field */}
        <DateTimeInput
          propName='data_life_start'
          changeHandler={handleDateOrTimeChange}
          label='Data Life Start'
          defaultValue={dli.data_life_start}
          // disabled={!showStart || !canEditDLStart}
          disabled={!showStart}
          minDate={minDate}
        />
      </Box>
      <Box>
        {/* attachment end field */}
        <DateTimeInput
          propName='attachment_end'
          changeHandler={handleDateOrTimeChange}
          label='Actual End'
          defaultValue={dli.attachment_end}
          disabled={!showEnd || disableEditActual}
        />
        <Box component={'span'} m={1} />
        {/* data life end field */}
        <DateTimeInput
          propName='data_life_end'
          changeHandler={handleDateOrTimeChange}
          label='Data Life End'
          defaultValue={dli.data_life_end}
          // disabled={!showEnd || !canEditDLEnd}
          disabled={!showEnd}
          maxDate={maxDate}
        />
      </Box>
    </Box>
  );
}
