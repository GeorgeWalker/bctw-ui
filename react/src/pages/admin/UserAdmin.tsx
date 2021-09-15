import { useState } from 'react';
import DataTable from 'components/table/DataTable';
import { eUserRole, User } from 'types/user';
import { ITableQueryProps } from 'components/table/table_interfaces';
import AuthLayout from 'pages/layouts/AuthLayout';
import { Typography } from '@material-ui/core';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import AddEditViewer from 'pages/data/common/AddEditViewer';
import EditUser from 'pages/user/EditUser';
import { IDeleteType, IUpsertPayload } from 'api/api_interfaces';

/**
 * page for user admin. requires admin user role.  
 * uses @component {EditUser}
 */
export default function UserAdminPage(): JSX.Element {
  const bctwApi = useTelemetryApi();
  const [userModified, setUserModified] = useState<User>({} as User);

  const tableProps: ITableQueryProps<User> = { query: bctwApi.useUsers };

  const selectUserFromTable = (u: User): void => setUserModified(u);

  const onSaveSuccess = () => {
    // todo:
  }

  const onError = () => {
    // todo:
  }
  const onDeleteSuccess = () => {
    // todo:
  }

  // setup the mutations
  const { mutateAsync: saveMutation } = bctwApi.useMutateUser({ onSuccess: onSaveSuccess, onError });
  const { mutateAsync: deleteMutation } = bctwApi.useDelete({ onSuccess: onDeleteSuccess, onError });

  // fixme: todo: add ability to choose role (defaulting to observer!)
  const saveUser = async (u: IUpsertPayload<User>): Promise<void> => {
    const payload = { user: u.body, role: eUserRole.observer }
    console.log('AdminPage: im saving a user', payload);
    await saveMutation(payload)
  };

  const deleteUser = async (id: string): Promise<void> => {
    const payload: IDeleteType = { id, objType: 'user' };
    console.log('deleting user', payload);
    await deleteMutation(payload);
  }

  return (
    <AuthLayout>
      <div className='container'>
        <Typography variant='h4' component='div'>Modify users</Typography>
        {/* <Typography variant='h5' component='div'>Your role: {userModified.role_type ?? 'unknown'}</Typography> */}
        <DataTable
          headers={['id', 'idir', 'bceid', 'email', 'role_type']}
          title='Users'
          queryProps={tableProps}
          onSelect={selectUserFromTable}
        />
        <div className={'button-row'}>
          <AddEditViewer<User> editText={'User' }addText={'User'} editing={userModified} empty={new User()} onSave={saveUser} onDelete={deleteUser}>
            <EditUser editing={new User()} isOpen={false} onSave={(): void => { /* todo: */}} handleClose={(): void => { /* todo: */}} />
          </AddEditViewer>
        </div>
      </div>
    </AuthLayout>
  );
}
