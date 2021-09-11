import { useState, useEffect } from 'react';
import DataTable from 'components/table/DataTable';
import { CollarHistory, hasCollarCurrentlyAssigned } from 'types/collar_history';
import PerformAssignmentAction from 'pages/data/animals/PerformAssignmentAction';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { CollarStrings } from 'constants/strings';
import { ModalBaseProps } from 'components/component_interfaces';
import { Modal } from 'components/common';
import { eCritterPermission, permissionCanModify } from 'types/permission';
import Button from 'components/form/Button';
import EditDataLifeModal from 'components/form/EditDataLifeModal';

export type IAssignmentHistoryPageProps = Pick<ModalBaseProps, 'open' | 'handleClose'> & {
  critter_id: string;
  permission_type: eCritterPermission;
};

/**
 * modal component that contains data table that displays device attachment history
 * controls visibility of @function PerformAssignmentAction component
 * accessed from @function EditCritter main page
 */
export default function AssignmentHistory(props: IAssignmentHistoryPageProps): JSX.Element {
  const { critter_id, open, handleClose, permission_type } = props;
  const bctwApi = useTelemetryApi();
  const [currentAttachment, setCurrentAttached] = useState<CollarHistory>(new CollarHistory());
  const [selectedAttachment, setSelectedAttachment] = useState<CollarHistory>(new CollarHistory());
  const [history, setCollarHistory] = useState<CollarHistory[]>([]);
  const [showEditDL, setShowEditDL] = useState<boolean>(false);

  const onNewData = (d: CollarHistory[]): void => {
    setCollarHistory(d);
  };

  useEffect(() => {
    if (history.length) {
      const attachment = hasCollarCurrentlyAssigned(history);
      // console.log('found current device attachment', attachment);
      if (attachment) {
        setCurrentAttached(attachment);
      }
    }
  }, [history]);

  /**
   * Custom column button component passed to device assignment history data table.
   * When the 'selected' attachment is selected clicking the button,
   * toggle the display of the @function EditDataLifeModal
   */
  const EditDatalifeColumn = (row: CollarHistory): JSX.Element => {
    const handleClick = async (): Promise<void> => {
      await setSelectedAttachment(row);
      setShowEditDL(() => !showEditDL);
    }
    return <Button disabled={!permissionCanModify(permission_type)} onClick={handleClick}>Edit Data Life</Button>;
  };

  return (
    <Modal open={open} handleClose={handleClose}>
      <DataTable
        title={CollarStrings.assignmentHistoryByAnimalTitle}
        headers={CollarHistory.propsToDisplay}
        queryProps={{ query: bctwApi.useCollarAssignmentHistory, param: critter_id, onNewData: onNewData }}
        paginate={history?.length >= 10}
        customColumns={[{ column: EditDatalifeColumn, header: (): JSX.Element => <b>Modify Data Life</b> }]}
      />
      <PerformAssignmentAction current_attachment={currentAttachment} {...props} />
      <EditDataLifeModal
        attachment={selectedAttachment}
        handleClose={(): void => setShowEditDL(false)}
        open={showEditDL}
        permission_type={permission_type}
      />
    </Modal>
  );
}
