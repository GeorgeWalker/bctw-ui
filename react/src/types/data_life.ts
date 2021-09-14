import dayjs, {Dayjs, isDayjs} from 'dayjs';
import { formatTime } from 'utils/time';
import { CollarHistory, IAttachDeviceProps, IRemoveDeviceProps } from './collar_history';

/**
 * the attachment attachment start and data life start date time props
 * the inner bounding data_life_start should be after the attachment_start
 */
export interface IDataLifeStartProps {
  attachment_start: Dayjs | string; 
  data_life_start:  Dayjs | string;
}
/**
 * the attachment end and data life end date time props
 * the inner bounding data_life_end should be before the attachment_end
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
 * fixme: taking @type {CollarHistory} in the constructor is a convulated 
 * way of handling this type. Maybe extend the collarhistory class and 
 * figure out a way to deal with how the fields are valid_from vs. data_life_start etc.
 */
export class DataLifeInput implements IDataLifeStartProps, IDataLifeEndProps {
  attachment_end: Dayjs;
  attachment_start: Dayjs;
  data_life_end: Dayjs;
  data_life_start: Dayjs;

  /** 
   * if @param history is provided, default timestamps to it's values
   * otherwise, optionally pass @param defaultStart to default start timestamps to now
   * ex. used when assigning a new device
  */
  constructor(history?: CollarHistory, defaultStart = false) {
    const d = dayjs();
    this.attachment_start = history ? dayjs(history.attachment_start) : defaultStart ? d : null;
    this.attachment_end = history ? dayjs(history.attachment_end) : null;
    this.data_life_start = history ? dayjs(history.valid_from) : defaultStart ? d : null;
    this.data_life_end = history ? dayjs(history.valid_to) : null;
  }

  // data life properties can only be changed if user is an admin or they haven't been modified before
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

  // must get assignment_id elsewhere
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

  // must get assignment id elsewhere
  toPartialEditDatalifeJSON(): Omit<IChangeDataLifeProps, 'assignment_id'> {
    return {
      data_life_start: this.data_life_start.format(formatTime),
      data_life_end: this.data_life_end.format(formatTime)
    }
  }
}