import { ModalBaseProps } from 'components/component_interfaces';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import EditCritter from 'pages/data/animals/EditCritter';
import ModifyCritterWrapper from 'pages/data/animals/ModifyCritterWrapper';
import EditCollar from 'pages/data/collars/EditCollar';
import ModifyCollarWrapper from 'pages/data/collars/ModifyCollarWrapper';
import { useEffect, useState } from 'react';
import { Animal, AttachedAnimal } from 'types/animal';
import { Collar } from 'types/collar';
import { BCTWType } from 'types/common_types';
import { ITelemetryDetail } from 'types/map';
import { eCritterPermission, permissionCanModify } from 'types/permission';
import { formatAxiosError } from 'utils/errors';

type CritterOverViewProps = ModalBaseProps & {
  type: BCTWType;
  detail: ITelemetryDetail;
};

export default function MapOverview({ type, detail, isOpen, handleClose }: CritterOverViewProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const [editObj, setEditObj] = useState<Animal | Collar>({} as Animal);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const { critter_id, collar_id } = detail;

  // fetch the data 
  const { data, error, isError, status, remove } =
    type === 'animal'
      ? bctwApi.useType<Animal>('animal', critter_id)
      : bctwApi.useType<Collar>('device', collar_id);

  useEffect(() => {
    if (status === 'success') {
      const canModify = permissionCanModify(data?.permission_type ?? eCritterPermission.none);
      setCanEdit(canModify);
      if (type === 'animal') {
        (data as AttachedAnimal).device_id = detail.device_id;
        setEditObj(data as Animal);
      } else if (type === 'device') {
        setEditObj(data as Collar);
      }
    }
  }, [status]);

  /**
   * fixme: when a new detail is selected, the old editobj is still in the query cache,
   * invalidating it doesn't seem to work. remove it instead.
  */
  useDidMountEffect(() => {
    const update = (): void => {
      remove();
    }
    update();
  }, [detail]);

  useDidMountEffect(() => {
    const update = (): void => {
      // note: force re-render of child edit components when data is fetched
    }
    update();
  }, [editObj]);

  if (isError && error) {
    return <div>{formatAxiosError(error)}</div>;
  }

  // props to pass to edit modal
  // fixme: casting detail
  const toPass: unknown = editObj ?? detail;
  const editProps = { handleClose, isOpen, onSave: (): void => {/* do nothing */}, isEdit: canEdit };

  if (type === 'animal') {
    return (
      <ModifyCritterWrapper editing={toPass as Animal}>
        <EditCritter {...editProps}  editing={toPass as Animal}/>
      </ModifyCritterWrapper>
    );
  } else {
    return (
      <ModifyCollarWrapper editing={toPass as Collar}>
        <EditCollar {...editProps} editing={toPass as Collar} />
      </ModifyCollarWrapper>
    );
  }
}
