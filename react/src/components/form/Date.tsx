import { useState } from 'react';
import DayjsUtils from '@date-io/dayjs';
import dayjs, { Dayjs } from 'dayjs';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { formatDay } from 'utils/time';

type DateInputProps = {
  propName: string;
  label: string;
  defaultValue: Date;
  changeHandler: (v: Record<string, unknown>) => void;
};

export default function DateInput(props: DateInputProps): JSX.Element {
  const { defaultValue, label, changeHandler, propName } = props;
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs(defaultValue));

  const handleDateChange = (date: Dayjs | null): void => {
    setSelectedDate(date);
    changeHandler({ [propName]: date.format(formatDay) });
  };
  return (
    <MuiPickersUtilsProvider utils={DayjsUtils}>
      <KeyboardDatePicker
        autoOk={true}
        style={{width: '170px'}}
        inputVariant={'outlined'}
        disableToolbar
        variant='dialog'
        format={selectedDate.format('YYYY/MM/DD')}
        margin='normal'
        label={label}
        value={selectedDate}
        onChange={handleDateChange}
        KeyboardButtonProps={{ 'aria-label': 'change date' }}
      />
    </MuiPickersUtilsProvider>
  );
}