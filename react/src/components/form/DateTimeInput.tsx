import { useState } from 'react';
import DayjsUtils from '@date-io/dayjs';
import dayjs, { Dayjs } from 'dayjs';
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';
import { formatTime} from 'utils/time';
import { DateInputProps, DateTimeChangeOutput } from 'components/form/Date';

type DateTimeInputProps = DateInputProps & {
  changeHandler: (v: DateTimeChangeOutput) => void;
};

export default function DateTimeInput(props: DateTimeInputProps): JSX.Element {
  const { defaultValue, label, changeHandler, propName, minDate, maxDate } = props;
  const [selectedTime, setSelectedTime] = useState<Dayjs>(defaultValue ? dayjs(defaultValue) : undefined);

  const handleChangeTime = (date: Dayjs): void => {
    setSelectedTime(date);
    const t = {[propName]: date.format(formatTime)};
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
        onChange={handleChangeTime}
        minDate={minDate}
        maxDate={maxDate}
      />
    </MuiPickersUtilsProvider>
  );
}

