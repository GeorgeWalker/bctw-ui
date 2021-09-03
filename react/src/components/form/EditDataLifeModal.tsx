import { useState } from 'react';
import { CollarHistory } from 'types/collar_history';
import { ModalBaseProps } from 'components/component_interfaces';
import { Modal } from 'components/common';
import DataLifeInputForm from './DataLifeInputForm';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import Button from './Button';
import { Box } from '@material-ui/core';
import { DataLifeInput, IChangeDataLifeProps } from 'types/data_life';
import useDidMountEffect from 'hooks/useDidMountEffect';

type EditDataLifeModalProps = ModalBaseProps & {
  attachment: CollarHistory;
};

/**
 * modal form for modifying a device attachments data life
 * todo: integrate this with @function EditModal ?
 * todo: response handlers, invalidation
 */
export default function EditDataLifeModal(props: EditDataLifeModalProps): JSX.Element {
  const { attachment, open, handleClose } = props;
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();

  const [canSave, setCanSave] = useState<boolean>(false);
  const [dli, setDli] = useState<DataLifeInput>(new DataLifeInput(attachment));

  useDidMountEffect(() => {
    // console.log('new attachment provided to DL modal', attachment.assignment_id)
    setDli(new DataLifeInput(attachment));
  }, [attachment])

  // must be defined before mutation declarations
  const onSuccess = async (data): Promise<void> => {
    responseDispatch({ severity: 'success', message: `data life updated` });
  };

  const onError = async (): Promise<void> => {
    responseDispatch({ severity: 'success', message: `data life failed to update` });
    // invalidateCritterQueries();
  };

  const handleSave = async(): Promise<void> => {
    const body: IChangeDataLifeProps = {
      assignment_id: attachment.assignment_id,
      ...dli.toPartialEditDatalifeJSON(),
    } 
    mutateAsync(body);
  };

  // setup mutation to save the modified data life
  const { mutateAsync } = bctwApi.useMutateEditDataLife({ onSuccess, onError });

  return (
    <Modal open={open} handleClose={handleClose} title={`Edit Data Life for ${attachment.device_make} Device ${attachment.device_id}`}>
      <div>
        {/* enable data life end fields only if the current attachment is expired/invalid */}
        <DataLifeInputForm onChange={(): void => setCanSave(true)} disableEditActual={true} showStart={true} showEnd={!!attachment.valid_to} dli={dli} />
        {/* the save button */}
        <Box display='flex' justifyContent='flex-end'>
          <Button disabled={!canSave} size='large' color='primary' onClick={handleSave}>Save</Button>
        </Box>
      </div>
    </Modal>
  );
}
