import { columnToHeader } from 'utils/common';
import { BCTW, BctwBaseType } from 'types/common_types';
import { Type, Expose } from 'class-transformer';
import { eCritterPermission } from './user';

export const assignedCritterProps = ['nickname', 'animal_id', 'wlh_id', 'animal_status', 'device_id'];
export const unassignedCritterProps = ['nickname', 'animal_id', 'wlh_id', 'animal_status'];
export const critterHistoryProps = ['nickname', 'animal_id', 'wlh_id', 'animal_status', 'calf_at_heel', 'region', 'population_unit', 'valid_from', 'valid_to'];

// properties re-used in Telemetry
export interface IAnimalTelemetryBase {
  species: string;
  wlh_id: string;
  animal_id: string;
  animal_status: string;
  population_unit: string;
  management_area: string;
}

export interface IAnimal extends BCTW, BctwBaseType, IAnimalTelemetryBase {
  id: string;
  transaction_id: string;
  calf_at_heel: boolean;
  capture_date_day: number;
  capture_date_year: number;
  capture_date_month: number;
  capture_utm_zone: number;
  capture_utm_easting: number;
  capture_utm_northing: number;
  ecotype: string;
  ear_tag_left: string;
  ear_tag_right: string;
  life_stage: string;
  mortality_date: Date;
  mortality_utm_zone: number;
  mortality_utm_easting: number;
  mortality_utm_northing: number;
  project: string;
  re_capture: boolean;
  region: string;
  regional_contact: string;
  release_date: Date;
  sex: string;
  trans_location: boolean;
  nickname: string;
  // fetched critters should contain this
  permission_type?: eCritterPermission;
  device_id?: number;
}

export class Animal implements IAnimal {
  id: string;
  transaction_id: string;
  animal_id: string;
  animal_status: string;
  calf_at_heel: boolean;
  capture_date_day: number;
  capture_date_year: number;
  capture_date_month: number;
  capture_utm_zone: number;
  capture_utm_easting: number;
  capture_utm_northing: number;
  ecotype: string;
  population_unit: string;
  ear_tag_left: string;
  ear_tag_right: string;
  life_stage: string;
  management_area: string;
  @Type(() => Date) mortality_date: Date;
  mortality_utm_zone: number;
  mortality_utm_easting: number;
  mortality_utm_northing: number;
  project: string;
  re_capture: boolean;
  region: string;
  regional_contact: string;
  @Type(() => Date)release_date: Date;
  sex: string;
  species: string;
  trans_location: boolean;
  wlh_id: string;
  nickname: string;
  @Type(() => Date)valid_from: Date;
  @Type(() => Date)valid_to: Date;
  permission_type: eCritterPermission;
  device_id?: number;
  @Expose() get identifier(): string { return 'id' }
  @Expose() get name(): string { return this.nickname ?? this.wlh_id ?? this.animal_id }

  constructor() {
    this.animal_id = '';
    this.animal_status = '';
    this.calf_at_heel = false;
    this.population_unit = '';
    this.region = '';
    this.species = '';
    this.wlh_id = '';
    this.nickname = '';
  }

  formatPropAsHeader(str: string): string {
    switch (str) {
      case 'id':
        return 'ID';
      case 'wlh_id':
        return 'WLH ID';
      default:
        return columnToHeader(str);
    }
  }
}

export const isAnimal = (a: unknown): a is Animal => {
  const critter = a as Animal;
  return !!(critter.id);
}