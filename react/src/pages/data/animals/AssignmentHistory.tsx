import { useState, useEffect } from 'react';
import DataTable from 'components/table/DataTable';
import { CollarHistory, hasCollarCurrentlyAssigned } from 'types/collar_history';
import PerformAssignmentAction from 'pages/data/animals/PerformAssignmentAction';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { CollarStrings } from 'constants/strings';
import { ModalBaseProps } from 'components/component_interfaces';
import { Modal } from 'components/common';
import { eCritterPermission } from 'types/permission';

export type IAssignmentHistoryPageProps = Pick<ModalBaseProps, 'open' | 'handleClose'> & {
  critter_id: string;
  permission_type: eCritterPermission; 
};

/**
 * displays a table with collar history and collar assign/unassign handling components
*/
export default function AssignmentHistory(props: IAssignmentHistoryPageProps): JSX.Element {
  const { critter_id, open, handleClose } = props;
  const bctwApi = useTelemetryApi();
  const [attachedDevice, setAttachedDevice] = useState<CollarHistory>({} as CollarHistory);
  const [history, setCollarHistory] = useState<CollarHistory[]>([]);

  const onNewData = (d: CollarHistory[]): void => {
    setCollarHistory(d);
  };

  useEffect(() => {
    if (history.length) {
      const attachment = hasCollarCurrentlyAssigned(history);
      setAttachedDevice(attachment);
    }
  }, [history]);

  return (
    <Modal open={open} handleClose={handleClose}>
      <DataTable
        title={CollarStrings.assignmentHistoryByAnimalTitle}
        headers={['device_id', 'device_make', 'valid_from', 'valid_to']}
        queryProps={{ query: bctwApi.useCollarAssignmentHistory, param: critter_id, onNewData: onNewData }}
        paginate={history?.length >= 10}
      />
      <PerformAssignmentAction current_attachment={attachedDevice} {...props} />
    </Modal>
  );
}
