/* eslint-disable no-console */
import { attachDeviceEndpoint, removeDeviceEndpoint, upsertCritterEndpoint, upsertDeviceEndpoint } from 'api/api_endpoint_urls';
import { createUrl } from 'api/api_helpers';
import { AxiosError } from 'axios';
import { RemoveDeviceInput } from 'types/collar_history';
import { BCTWEvent, EventType, OptionalAnimal, OptionalDevice } from 'types/events/event';
import { formatAxiosError } from 'utils/errors';
import { IBulkUploadResults, ApiProps } from './api_interfaces';

/**
 * API for saving workflow events @type {EventType}
 */

export type WorkflowAPIResponse = true | AxiosError;

// todo: handle query invalidation - 
export const eventApi = (props: ApiProps) => {
  const { api } = props;

  /**
   * when an event form is saved, there are potentiall multiple post requests that need to be handled
   * if the device is marked as retrieved, the device may need to be removed
   * the animal
   * the collar
   * fixme: if a later api post fails...how to handle form?
   */
  const eventErr = (ev: EventType): string => `${ev} saving workflow:`;

  const _handleBulkResults = (data: IBulkUploadResults<unknown>): WorkflowAPIResponse => {
    const { errors } = data;
    if (errors?.length) {
      return { message: errors[0].error, isAxiosError: true } as AxiosError;
    }
    return true;
  };

  const _saveAnimal = async (critter: OptionalAnimal, type: EventType): Promise<WorkflowAPIResponse> => {
    console.log('workflow event animal', critter);
    // return true;
    const url = createUrl({ api: upsertCritterEndpoint });
    try {
      const { data } = await api.post(url, critter);
      console.log('saving animal results', data);
      return _handleBulkResults(data);
    } catch (err) {
      console.error(`${eventErr(type)} error saving animal', ${formatAxiosError(err)}`);
      return err;
    }
  };

  const _saveDevice = async (device: OptionalDevice, type: EventType): Promise<WorkflowAPIResponse> => {
    console.log('workflow event device', device);
    // return true;
    const url = createUrl({ api: upsertDeviceEndpoint });
    try {
      const { data } = await api.post(url, device);
      console.log('saving device results', data);
      return _handleBulkResults(data);
    } catch (err) {
      console.error(`${eventErr(type)} error saving device', ${formatAxiosError(err)}`);
      return err;
    }
  };

  const _addOrRemoveDevice = async (attachment: RemoveDeviceInput, isAdding: boolean): Promise<WorkflowAPIResponse> => {
    console.log('workflow event add or attach event', attachment)
    // return true;
    const url = createUrl({ api: isAdding ? attachDeviceEndpoint : removeDeviceEndpoint });
    try {
      const { data } = await api.post(url, attachment);
      console.log('device add/remove status', data);
      return _handleBulkResults(data);
    } catch (err) {
      console.error(`error adding/removing device', ${formatAxiosError(err)}`);
      return err;
    }
  }

  const saveEvent = async <T>(event: BCTWEvent<T>): Promise<true | WorkflowAPIResponse> => {
    //
    if (event.shouldUnattachDevice && typeof event.getAttachment === 'function') {
      const attachment = event.getAttachment();
      const s = await _addOrRemoveDevice(attachment as RemoveDeviceInput, false); 
      if (typeof s !== 'boolean') {
        return s;
      }
    }
    //
    if (typeof event.getAnimal === 'function') {
      const critter = event.getAnimal();
      if (critter) {
        const s = await _saveAnimal(critter, event.event_type);
        if (typeof s !== 'boolean') {
          return s;
        }
      }
    }
    //
    if (typeof event.getDevice === 'function') {
      const device = event.getDevice();
      if (device) {
        const s = _saveDevice(device, event.event_type);
        if (typeof s !== 'boolean') {
          return s;
        }
      }
    }

    return true;
  };

  return { saveEvent };
};
