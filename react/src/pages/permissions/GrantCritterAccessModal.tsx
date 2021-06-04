import { useEffect, useState } from 'react';
import Button from 'components/form/Button';
import Modal from 'components/modal/Modal';
import DataTable from 'components/table/DataTable';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { AxiosError } from 'axios';
import { IUserCritterAccessInput, User, UserCritterAccess } from 'types/user';
import { ITableQueryProps } from 'components/table/table_interfaces';
import { IBulkUploadResults, IGrantCritterAccessResults, IUserCritterPermissionInput } from 'api/api_interfaces';
import { formatAxiosError } from 'utils/common';
import { MenuItem, Select } from '@material-ui/core';
import { useQueryClient } from 'react-query';
import { eCritterPermission } from 'types/permission';

type IGrantCritterModalProps = {
  user: User;
  show: boolean;
  onClose: (close: boolean) => void;
  onSave: (collar_id: string) => void;
};

/**
 * modal that shows a list of critters that can be individually or multi selected.
 * passes a custom select header/column component to the Table
 */
export default function GrantCritterModal({ show, onClose, user }: IGrantCritterModalProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();
  const queryClient = useQueryClient();
  // which critters are selected in the table
  const [critters, setCritters] = useState<UserCritterAccess[]>([]);
  // state for each of the column select components rendered in the table
  const [accessTypes, setAccessTypes] = useState<IUserCritterAccessInput[]>([]);
  // state for the custom header select dropdown (updates all values on the page to the selected)
  const [tableHeaderCritterSelectOption, setTableHeaderCritterSelectOption] = useState<eCritterPermission>(
    eCritterPermission.view
  );

  // show notification on successful user/critter grant api call
  const onSuccess = (ret: IBulkUploadResults<IGrantCritterAccessResults>): void => {
    const { errors } = ret;
    if (errors.length) {
      responseDispatch({ type: 'error', message: `${errors.join()}` });
    } else {
      responseDispatch({
        type: 'success',
        message: `animal access granted for users: ${user.idir}`
      });
      queryClient.invalidateQueries('critterAccess');
    }
  };

  const onError = (error: AxiosError): void => responseDispatch({ type: 'error', message: formatAxiosError(error) });
  const { mutateAsync } = bctwApi.useMutateGrantCritterAccess({ onSuccess, onError });

  // when the custom table header select is changed,
  // update all of the custom column selects
  useEffect(() => {
    const updateRows = (): void => {
      setAccessTypes((prevState) => {
        return prevState.map((c) => {
          return { critter_id: c.critter_id, permission_type: tableHeaderCritterSelectOption as eCritterPermission };
        });
      });
    };
    updateRows();
  }, [tableHeaderCritterSelectOption]);

  const handleTableRowSelect = (critters: UserCritterAccess[]): void => {
    console.log('row clicked')
    setCritters(critters);
  };

  const handleSave = async (): Promise<void> => {
    // get the permission type state for each selected
    const access: IUserCritterAccessInput[] = critters.map((c) => {
      const permission_type = accessTypes.find((a) => a.critter_id === c.critter_id).permission_type;
      return { critter_id: c.critter_id, permission_type };
    });
    // const data: IUserCritterPermissionInput[] = [user].map((i) => {
    //   return {
    //     userId: i.id,
    //     access
    //   };
    // });
    const data: IUserCritterPermissionInput = {
      userId: user.id,
      access
    }
    // console.log(JSON.stringify(data, null, 2));
    await mutateAsync(data);
    handleClose();
  };

  const handleClose = (): void => {
    setAccessTypes([]);
    onClose(false);
  };

  // callback for when the table query finishes
  // update the accesTypes state
  const handleDataLoaded = (rows: UserCritterAccess[]): void => {
    const m = rows.map((r) => ({ critter_id: r.critter_id, permission_type: r.permission_type as eCritterPermission }));
    setAccessTypes((o) => {
      // preserve permission selections across pages.
      const copy = [...o];
      m.forEach((item) => {
        const idx = copy.findIndex((c) => c.critter_id === item.critter_id);
        if (idx === -1) {
          copy.push(item);
          return;
        }
        copy[idx].permission_type = item.permission_type;
      });
      return copy;
    });
  };

  const tableQueryProps: ITableQueryProps<UserCritterAccess> = {
    query: bctwApi.useCritterAccess,
    param: {
      user,
      filter: [
        eCritterPermission.none,
        eCritterPermission.owner,
        eCritterPermission.subowner,
        eCritterPermission.view,
        eCritterPermission.change
      ]
    },
    onNewData: handleDataLoaded
  };


  /** * adds a select dropdown component at the left side of each table row that 
   * allows the user to select a permission type for the animal row
   */
  const newColumn = (row: UserCritterAccess): JSX.Element => {
    const defaultPermission =
      accessTypes.find((cp) => cp.critter_id === row.critter_id)?.permission_type ??
      row?.permission_type ??
      eCritterPermission.view;
    return (
      <Select
        value={defaultPermission}
        onChange={(v: React.ChangeEvent<{ value: unknown }>): void => {
          // dont propagate the event to the row selected handler
          v.stopPropagation();
          const permission = v.target.value as eCritterPermission;
          setAccessTypes((prevState) => {
            const idx = prevState.findIndex((c) => c.critter_id === row.critter_id);
            const cp = Object.assign([], prevState);
            cp[idx].permission_type = permission;
            return cp;
          });
        }}>
        {Object.values(eCritterPermission)
          .sort()
          .map((d) => (
            <MenuItem key={`menuItem-${d}`} value={d}>
              {d}
            </MenuItem>
          ))}
      </Select>
    );
  };

  // a custom table header component. selecting an option from the dropdown
  // updates all of the newColumn selects above.
  // note: disable this as of new privileges workflow
  const newHeader = (): JSX.Element => {
    return <></>
    // return (
    //   <Select
    //     value={tableHeaderCritterSelectOption}
    //     onChange={(e: React.ChangeEvent<{ value: unknown }>): void => {
    //       setTableHeaderCritterSelectOption(e.target.value as eCritterPermission);
    //     }}>
    //     {Object.values(eCritterPermission).map((d) => (
    //       <MenuItem key={`headermenuItem-${d}`} value={d}>
    //         {d}
    //       </MenuItem>
    //     ))}
    //   </Select>
    // );
  };

  return (
    <Modal open={show} handleClose={handleClose} title={`Modifying ${user?.idir ?? 'user'}'s Animal Access`}>
      <DataTable
        customColumns={[{ column: newColumn, header: newHeader }]}
        headers={['animal_id', 'wlh_id', 'device_id', 'device_make', 'population_unit']}
        queryProps={tableQueryProps}
        onSelectMultiple={handleTableRowSelect}
        isMultiSelect={true}
      />
      <Button disabled={!critters.length} onClick={handleSave}>Save</Button>
    </Modal>
  );
}