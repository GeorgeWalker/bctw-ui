import React, { useState } from 'react';
import Button from 'components/form/Button';
import { getNow } from 'utils/time';
import { AxiosError } from 'axios';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { CollarHistory } from 'types/collar_history';
import ConfirmModal from 'components/modal/ConfirmModal';
import { NotificationMessage } from 'components/common';
import ShowCollarAssignModal from 'pages/data/animals/AssignNewCollar';
import { formatAxiosError, isValidToast } from 'utils/common';
import { useQueryCache } from 'react-query';
import { CritterStrings as CS } from 'constants/strings';

type IPerformAssignmentActionProps = {
  hasCollar: boolean;
  animalId: number;
  deviceId: number;
  onPost?: (msg: any) => void;
};
/**
 * component that performs post requests to assign/unassign a collar
 * consists of:
 *  1. a confirmation dialog if user chooses to unassign the collar
 *  2. a modal that displays a list of available collars with a save button
 * @param {onPost} - bubbles up post response to parent handler function
 */
export default function PerformAssignmentAction({ hasCollar, animalId, deviceId, onPost }: IPerformAssignmentActionProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const queryCache = useQueryCache()
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showAvailableModal, setShowAvailableModal] = useState<boolean>(false);
  //  state to manage if a collar is being linked or removed
  const [isLink, setIsLink] = useState<boolean>(false);

  const handleSuccess = (data: CollarHistory): void => {
    updateCollarHistory();
    if (isValidToast(onPost)) {
      onPost(`collar ${data.device_id} successfully ${isLink ? 'linked to' : 'removed from'} critter`);
    }

  }
  const handleError = (error: AxiosError): void => {
    updateCollarHistory();
    if (isValidToast(onPost)) {
      onPost(`error ${isLink ? 'linking' : 'removing'} collar: ${formatAxiosError(error)}`);
    }
  }

  // force the collar history to refetch
  const updateCollarHistory = (): Promise<unknown> => queryCache.invalidateQueries('collarHistory');

  const [mutate, { isError, error }] = (bctwApi.useMutateLinkCollar as any)({
    onSuccess: handleSuccess,
    onError: handleError
  });

  const handleClickShowModal = (): void => (hasCollar ? setShowConfirmModal(true) : setShowAvailableModal(true));

  const closeModals = (): void => {
    setShowConfirmModal(false);
    setShowAvailableModal(false);
  };

  const callMutation = async (id: number, isAssign: boolean): Promise<void> => {
    await setIsLink(isAssign);
    isAssign ? setShowAvailableModal(false) : setShowConfirmModal(false);
    await mutate({
      isLink: isAssign,
      data: {
        device_id: id,
        animal_id: animalId,
        start_date: getNow()
      }
    });
  }

  return (
    <>
      <ConfirmModal
        handleClickYes={() => callMutation(deviceId, false)}
        handleClose={closeModals}
        open={showConfirmModal}
        message={CS.collarRemovalText}
        title={CS.collarRemovalTitle}
      />
      {isError ? <NotificationMessage type='error' message={error.response.data} /> : null}
      <ShowCollarAssignModal onSave={(id) => callMutation(id, true)} show={showAvailableModal} onClose={closeModals} />
      <Button onClick={handleClickShowModal}>{hasCollar ? 'unassign collar' : 'assign collar'}</Button>
    </>
  );
}
