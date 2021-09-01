import { useState } from 'react';
import Button from 'components/form/Button';
import Modal from 'components/modal/Modal';
import DataTable from 'components/table/DataTable';
import { collarPropsToDisplay, Collar, eCollarAssignedStatus } from 'types/collar';
import { CritterStrings as CS } from 'constants/strings';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import DataLifeInputForm from 'components/form/DataLifeInputForm';
import { DataLifeInput, IAttachDeviceProps } from 'types/collar_history';
import { Animal } from 'types/animal';
import dayjs from 'dayjs';
import { formatTime } from 'utils/time';

type IAssignNewCollarModal = Pick<Animal, 'critter_id'> & {
  show: boolean;
  onClose: (close: boolean) => void;
  onSave: (obj: IAttachDeviceProps ) => void;
  dli: DataLifeInput;
};

/**
 * Displays devices that can be assigned to this animal
 * @param {onSave} - parent component {PerformAssignment} handles this.
 * collar row must be selected in order to enable the save button
 */
export default function AssignNewCollarModal({ critter_id, dli, onClose, show, onSave }: IAssignNewCollarModal): JSX.Element {
  const bctwApi = useTelemetryApi();

  const [collarId, setCollarId] = useState<string>('');
  const [ DLInput ] = useState<DataLifeInput>(dli);

  const handleSelectDevice = (row: Collar): void => setCollarId(row.collar_id);

  const handleSave = (): void => {
    const { actual_start, data_life_start } = DLInput;
    const body: IAttachDeviceProps = {
      critter_id,
      collar_id: collarId,
      actual_start: dayjs(actual_start).format(formatTime),
      data_life_start: dayjs(data_life_start).format(formatTime),
    }
    onSave(body);
  }

  return (
    <>
      <Modal open={show} handleClose={onClose}>
        <DataTable
          headers={collarPropsToDisplay}
          title={CS.collarAssignmentTitle}
          queryProps={{ query: bctwApi.useCollarType, param: eCollarAssignedStatus.Available }}
          onSelect={handleSelectDevice}
        />
        <DataLifeInputForm dli={DLInput} showStart={true} showEnd={false} />
        <Button disabled={collarId === ''} onClick={handleSave}>
          {CS.assignCollarBtnText}
        </Button>
      </Modal>
    </>
  );
}
