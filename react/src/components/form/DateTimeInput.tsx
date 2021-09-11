import { useState } from 'react';
import DayjsUtils from '@date-io/dayjs';
import dayjs, { Dayjs } from 'dayjs';
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';
import { formatTime } from 'utils/time';
import { DateInputProps } from 'components/form/Date';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

export type DTimeChangeOutput = Record<string, Dayjs>;

type DateTimeInputProps = Omit<DateInputProps, 'changeHandler' | 'defaultValue' | 'minDate' | 'maxDate'> & {
  changeHandler: (v: DTimeChangeOutput) => void;
  defaultValue: Dayjs;
  minDate?: Dayjs;
  maxDate?: Dayjs;
};

/**
 * fixme: alignment / size
 */
export default function DateTimeInput(props: DateTimeInputProps): JSX.Element {
  const { required, defaultValue, label, changeHandler, propName, minDate, maxDate } = props;
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(defaultValue?.isValid() ? defaultValue : null);

  const handleChangeTime = (d: Dayjs): void => {
    setSelectedTime(d);
    const t = { [propName]: d };
    changeHandler(t);
  };

  return (
    <MuiPickersUtilsProvider utils={DayjsUtils}>
      <DateTimePicker
        autoOk={true}
        ampm={false} // 24 hours
        inputVariant={'outlined'}
        disabled={props.disabled}
        size={'small'}
        format={dayjs.isDayjs(selectedTime) ? selectedTime.format(formatTime) : ' '}
        margin='normal'
        label={label}
        value={selectedTime}
        onChange={(d: MaterialUiPickersDate): void => handleChangeTime(d as Dayjs)}
        minDate={minDate}
        maxDate={maxDate}
        required={required}
      />
    </MuiPickersUtilsProvider>
  );
}
