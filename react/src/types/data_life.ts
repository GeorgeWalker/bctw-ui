import dayjs, {Dayjs, isDayjs} from 'dayjs';
import { formatTime } from 'utils/time';
import { CollarHistory, IAttachDeviceProps, IRemoveDeviceProps } from './collar_history';

/**
 * the attachment attachment start and data life start date time props
 * the inner bounding data_life_start should be after the actual start
 */
export interface IDataLifeStartProps {
  attachment_start: Dayjs | string; 
  data_life_start:  Dayjs | string;
}
/**
 * the attachment end and data life end date time props
 * the inner bounding data_life_end should be before the actual end
 */
export interface IDataLifeEndProps {
  attachment_end?: Dayjs | string;
  data_life_end?: Dayjs | string;
}

// passed to the API when changing the data life of an existing or past device attachment
export interface IChangeDataLifeProps extends 
  Pick<CollarHistory, 'assignment_id'>, 
  Pick<IDataLifeStartProps, 'data_life_start'>,
  Pick<IDataLifeEndProps, 'data_life_end'>{ }

/**
 * used in the Data Life input component
 */
export class DataLifeInput implements IDataLifeStartProps, IDataLifeEndProps {
  attachment_end: Dayjs;
  attachment_start: Dayjs;
  data_life_end: Dayjs;
  data_life_start: Dayjs;

  constructor(history?: CollarHistory) {
    // const d = dayjs();
    this.attachment_start = history ? dayjs(history.attachment_start) : null;
    this.attachment_end = history ? dayjs(history.attachment_end) : null;
    this.data_life_start = history ? dayjs(history.valid_from) : null;
    this.data_life_end = history ? dayjs(history.valid_to) : null;
    // console.log('created new DataLifeInput', JSON.stringify(this));
  }

  get canChangeDLStart(): boolean {
    if (isDayjs(this.data_life_start) && isDayjs(this.attachment_start)) {
      return this.data_life_start.isSame(this.attachment_start);
    }
    return true;
  }

  get canChangeDLEnd(): boolean {
    if (isDayjs(this.data_life_end) && isDayjs(this.attachment_end)) {
      return this.data_life_end.isSame(this.attachment_end);
    }
    return true;
  }

  toRemoveDeviceJSON(): Omit<IRemoveDeviceProps, 'assignment_id'> {
    return {
      attachment_end: this.attachment_end.format(formatTime),
      data_life_end: this.data_life_end.format(formatTime),
    }
  }

  // must provide critter/collar ids separarately
  toPartialAttachDeviceJSON(): Omit<IAttachDeviceProps, 'collar_id' | 'critter_id'> {
    return {
      attachment_start: this.attachment_start.format(formatTime),
      data_life_start: this.data_life_start.format(formatTime),
    }
  }

  // must get assignment id separately
  toPartialEditDatalifeJSON(): Omit<IChangeDataLifeProps, 'assignment_id'> {
    return {
      data_life_start: this.data_life_start.format(formatTime),
      data_life_end: this.data_life_end.format(formatTime)
    }
  }
}