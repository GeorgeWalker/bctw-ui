import { Collar } from 'types/collar';
import { BCTWBase, BCTWBaseType } from 'types/common_types';
import { Type, Expose } from 'class-transformer';
import dayjs from 'dayjs';
import { columnToHeader } from 'utils/common_helpers';
import { eCritterPermission } from './permission';

/**
 * the attachment attachment start and data life start date time props
 * the inner bounding data_life_start should be after the actual start
 */
interface IDataLifeStartProps {
  attachment_start: Date | string;
  data_life_start: Date | string;
}
/**
 * the attachment end and data life end date time props
 * the inner bounding data_life_end should be before the actual end
 */
interface IDataLifeEndProps {
  attachment_end?: Date | string;
  data_life_end?: Date | string;
}

// combined data life props
export interface IDataLifeInputProps extends IDataLifeStartProps, IDataLifeEndProps { }

/**
 * used in the Data Life input component
 */
export class DataLifeInput implements IDataLifeStartProps, IDataLifeEndProps {
  attachment_end: Date;
  attachment_start: Date;
  data_life_end: Date;
  data_life_start: Date;

  constructor(history?: CollarHistory) {
    const d = new Date();
    this.attachment_start = history?.attachment_start ?? d;
    this.attachment_end = history?.attachment_end ?? d;
    this.data_life_start = history?.valid_from ?? d;
    this.data_life_end = history?.valid_to ?? d;
    // console.log('created new DataLifeInput', JSON.stringify(this));
  }
}

// passed to the API when attaching a device to an animal
export interface IAttachDeviceProps extends IDataLifeStartProps, IDataLifeEndProps {
  collar_id: string;
  critter_id: string;
}

// passed to the API when removing a device from an animal
export interface IRemoveDeviceProps extends Required<IDataLifeEndProps> {
  assignment_id: string;
}

// passed to the API when changing the data life of an existing or past device attachment
export interface IChangeDataLifeProps extends Pick<IRemoveDeviceProps, 'assignment_id'> {
  data_life_start: Date | string;
  data_life_end: Date | string;
}

export interface ICollarHistory extends Pick<Collar, 'collar_id' | 'device_id' | 'device_make' | 'frequency'>,
  Pick<BCTWBaseType, 'valid_from' | 'valid_to'> {
  assignment_id: string;
  critter_id: string;
  attachment_start: Date;
  attachment_end: Date;
}

/**
 * represents an device attachment to an animal.
 * fixme: sync data life props with this class?
 */
export class CollarHistory extends BCTWBase implements ICollarHistory {
  assignment_id: string; // primary key of the collar_animal_assignment table
  collar_id: string;
  critter_id: string;
  device_id: number;
  device_make: string;
  frequency: number;
  @Type(() => Date) valid_from: Date; // data_life_start
  @Type(() => Date) valid_to: Date; // data_life_end
  @Type(() => Date) attachment_start: Date;
  @Type(() => Date) attachment_end: Date;
  @Expose() get identifier(): string { return 'assignment_id' }

  canChangeDatalifeStart(perm: eCritterPermission): boolean {
    return perm === eCritterPermission.admin || this.valid_from !== this.attachment_start;
  }
  canChangeDatalifeEnd(perm: eCritterPermission): boolean {
    return perm === eCritterPermission.admin || this.valid_to !== this.attachment_end;
  }

  toJSON(): CollarHistory {
    return this;
  }

  formatPropAsHeader(str: string): string {
    switch (str) {
      case this.identifier:
        return 'Assignment ID';
      default:
        return columnToHeader(str);
    }
  }
}

/**
 * @returns a boolean indicating if the @param history contains a
 * valid animal/device attachment - if there is a record with a valid_to 
 * that is null or in the future
 */
export const hasCollarCurrentlyAssigned = (history: CollarHistory[]): CollarHistory | undefined => {
  const currentlyAssigned = history?.filter((h) => {
    // a null valid_to is considered valid - as in it has no expiry
    if(!dayjs(h.valid_to).isValid()) {
      return true;
    }
    return dayjs().isBefore(h.valid_to);
  });
  return currentlyAssigned.length ? currentlyAssigned[0] : undefined;
}