import { useState } from 'react';
import DateTimeInput from 'components/form/DateTimeInput';
import { DateTimeChangeOutput } from 'components/form/Date';
import { DataLifeInput } from 'types/collar_history';

type DataLifeInputProps = {
  showStart: boolean;
  showEnd: boolean;
  dli: DataLifeInput;
};

const getFirstKey = (d: DateTimeChangeOutput): string => Object.keys(d)[0];
const getFirstValue = (d: DateTimeChangeOutput): string => Object.values(d)[0];

/**
 * todo: time validation if same date?
 */
export default function DataLifeInputForm(props: DataLifeInputProps): JSX.Element {
  const { dli, showStart, showEnd } = props;
  const [minDate, setMinDate] = useState<Date>(dli.attachment_start);
  const [maxDate, setMaxDate] = useState<Date>(dli.attachment_end);

  // since the DataLifeInput instance is an object, no need for change handlers
  const handleDateOrTimeChange = (d: DateTimeChangeOutput): void => {
    const k = getFirstKey(d);
    const v = getFirstValue(d);
    dli[k] = v;
    if (k === 'attachment_start') {
      setMinDate(new Date(v));
    } else if (k === 'attachment_end') {
      setMaxDate(new Date(v));
    }
  };

  return (
    <>
      <div>
        <DateTimeInput
          propName='attachment_start'
          changeHandler={handleDateOrTimeChange}
          label='actual start'
          defaultValue={dli.attachment_start}
          disabled={!showStart}
        />
        <DateTimeInput
          propName='data_life_start'
          changeHandler={handleDateOrTimeChange}
          label='data life start'
          defaultValue={dli.data_life_start}
          minDate={minDate}
          disabled={!showStart}
        />
      </div>
      <div>
        <DateTimeInput
          propName='attachment_end'
          changeHandler={handleDateOrTimeChange}
          label='actual end'
          defaultValue={dli.attachment_end}
          disabled={!showEnd}
        />
        <DateTimeInput
          propName='data_life_end'
          changeHandler={handleDateOrTimeChange}
          label='data life end'
          defaultValue={dli.data_life_end}
          maxDate={maxDate}
          disabled={!showEnd}
        />
      </div>
    </>
  );
}
