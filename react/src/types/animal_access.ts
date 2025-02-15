import { Dayjs } from 'dayjs';
import { Transform } from 'class-transformer';
import { columnToHeader } from 'utils/common_helpers';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
import { BCTWBase, nullToDayjs, PartialPick } from 'types/common_types';
import { eCritterPermission } from 'types/permission';

export interface IUserCritterAccess
  extends Required<Pick<Animal, 'permission_type'>>,
  Pick<Animal, 'critter_id' | 'animal_id' | 'species' | 'wlh_id' | 'valid_from' | 'valid_to'>,
  Pick<Collar, 'device_id' | 'device_make' | 'device_type' | 'frequency'> {}

export type IUserCritterAccessInput = Required<Pick<IUserCritterAccess, 'critter_id' | 'permission_type'>> &
PartialPick<IUserCritterAccess, 'animal_id' | 'wlh_id'>;

export class UserCritterAccess implements IUserCritterAccess, BCTWBase<UserCritterAccess> {
  permission_type: eCritterPermission;
  critter_id: string;
  animal_id: string;
  wlh_id: string;
  species: string;
  @Transform(nullToDayjs) valid_from: Dayjs;
  @Transform(nullToDayjs) valid_to: Dayjs;
  device_id: number;
  device_type: string;
  frequency: number;
  device_make: string;
  get identifier(): string {
    return 'critter_id';
  }
  get name(): string {
    return this.animal_id ?? this.wlh_id;
  }
  toJSON(): UserCritterAccess {
    return this;
  }

  formatPropAsHeader(str: keyof UserCritterAccess): string {
    return columnToHeader(str);
  }

  // displayed as fields 'user/critter permission' table modals
  static get propsToDisplay(): (keyof UserCritterAccess)[] {
    return [
      'permission_type',
      'wlh_id',
      'animal_id',
      'species',
      'device_id',
      'frequency',
      'device_type',
      'device_make'
    ];
  }
  get displayProps(): (keyof UserCritterAccess)[] {
    return UserCritterAccess.propsToDisplay;
  }
}
