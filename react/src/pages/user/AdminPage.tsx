import { useState } from 'react';
import Table from 'components/table/Table';
import Button from 'components/form/Button';
import { User } from 'types/user';
import GrantCritterModal from 'pages/user/GrantCritterAccess';
import { ITableQueryProps } from 'components/table/table_interfaces';
import AuthLayout from 'pages/layouts/AuthLayout';
import { Typography } from '@material-ui/core';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import AddEditViewer from 'pages/data/common/AddEditViewer';
import EditUser from 'pages/user/EditUser';
import { IDeleteType, IUpsertPayload } from 'api/api_interfaces';

export default function AdminPage(): JSX.Element {
  const bctwApi = useTelemetryApi();
  const [userModified, setUserModified] = useState<User>({} as User);
  const [showModal, setShowModal] = useState<boolean>(false);

  const tableProps: ITableQueryProps<User> = { query: bctwApi.useUsers };

  const handleTableRowSelect = (u: User): void => setUserModified(u);

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
  const { mutateAsync: saveMutation } = bctwApi.useDelete({ onSuccess: onSaveSuccess, onError });
  const { mutateAsync: deleteMutation } = bctwApi.useDelete({ onSuccess: onDeleteSuccess, onError });

  const saveUser = async (u: IUpsertPayload<User>): Promise<void> => {
    console.log('AdminPage: im saving a user', u);
    await saveMutation(u.body)
  };

  const deleteUser = async (id: string): Promise<void> => {
    const payload: IDeleteType = { id, objType: 'user' };
    console.log('deleting user', payload);
    await deleteMutation(payload);
  }

  return (
    <AuthLayout>
      <div className='container'>
        <Typography variant='h4' component='div'>Modify users and animal access</Typography>
        {/* <Typography variant='h5' component='div'>Your role: {userModified.role_type ?? 'unknown'}</Typography> */}
        <Typography variant='body2' component='p'>
          A user has access to devices through the user-animal association.
        </Typography>
        <Table
          headers={['id', 'idir', 'bceid', 'email', 'role_type']}
          title='Users'
          queryProps={tableProps}
          onSelect={handleTableRowSelect}
        />
        <div className={'button-row'}>
          <Button disabled={!userModified?.id} onClick={(): void => setShowModal(true)}>Edit User Animal Access</Button>
          <AddEditViewer<User> editText={'User' }addText={'User'} editing={userModified} empty={new User()} onSave={saveUser} onDelete={deleteUser}>
            <EditUser editing={new User()} open={false} onSave={null} handleClose={null} />
          </AddEditViewer>
        </div>
        <GrantCritterModal show={showModal} onClose={(): void => setShowModal(false)} onSave={null} users={userModified} />
      </div>
    </AuthLayout>
  );
}
