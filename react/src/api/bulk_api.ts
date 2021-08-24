import { createUrl } from 'api/api_helpers';
import { AxiosInstance } from 'axios';
import { plainToClass } from 'class-transformer';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
import { BCTW, BCTWType } from 'types/common_types';
import { ExportQueryParams } from 'types/export';

import { IBulkUploadResults } from './api_interfaces';

export const bulkApi = (api: AxiosInstance) => {

  const uploadCsv = async <T,>(form: FormData): Promise<IBulkUploadResults<T>> => {
    const url = createUrl({ api: 'import-csv' });
    const { data } = await api.post(url, form);
    return data;
  };

  /** uploads one or more xml files to be parsed as Vectronic .keyx */
  const uploadFiles = async(form: FormData): Promise<IBulkUploadResults<unknown>> => {
    const url = createUrl({api: 'import-xml'});
    const { data } = await api.post(url, form);
    return data;
  }

  const getType = async <T extends BCTW, >(type: BCTWType, id: string): Promise<T> => {
    const url = createUrl({ api: `${type}/${id}`});
    const { data } = await api.get(url);
    return data.map(json => type === 'animal' ? plainToClass(Animal, json) : plainToClass(Collar, json))[0];
  }

  const getExportData = async (body: ExportQueryParams): Promise<string[]> => {
    const url = createUrl({ api: `export`})
    const { data } = await api.post(url, body);
    const results = data.flat();
    return results;
  }

  return {
    getExportData,
    getType,
    uploadCsv,
    uploadFiles,
  }
}