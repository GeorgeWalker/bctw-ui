import { ButtonGroup, Typography } from '@material-ui/core';
import { NotificationMessage } from 'components/common';
import Button from 'components/form/Button';
import DataTable from 'components/table/DataTable';
import { CodeStrings as S } from 'constants/strings';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import ExportImportViewer from 'pages/data/bulk/ExportImportViewer';
import React, { useState } from 'react';
import { CodeFormFields, CodeHeader, CodeHeaderInput, ICodeHeader } from 'types/code';
import { formatAxiosError } from 'utils/errors';
import AddEditViewer from 'pages/data/common/AddEditViewer';
import EditCodeHeader from 'pages/data/codes/EditCodeHeader';
import { IBulkUploadResults, IUpsertPayload } from 'api/api_interfaces';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import ManageLayout from 'pages/layouts/ManageLayout';
import { AxiosError } from 'axios';

const CodePage: React.FC = () => {
  const [header, setHeader] = useState('animal_status');
  const [title, setTitle] = useState<string>('');
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();

  const onSuccess = (data: IBulkUploadResults<ICodeHeader>): void => {
    if (data.errors.length) {
      responseDispatch({ severity: 'error', message: `${data.errors[0].error}` });
      return;
    }
    const h = data.results[0];
    responseDispatch({ severity: 'success', message: `code header ${h.title} saved` });
    // todo: invalidate code_header query?
  };

  const handleClick = (c: ICodeHeader): void => {
    // setCodeHeader(c);
    setHeader(c.type);
    setTitle(c.title);
  };

  const { mutateAsync } = bctwApi.useMutateCodeHeader({ onSuccess });

  const handleSave = async (p: IUpsertPayload<CodeHeaderInput>): Promise<void> => {
    console.error('type mismatch saving codes/codeheaders!');
    // bug:
    // await mutateAsync([p.body]);
  }

  const { isFetching, isLoading, isError, error, data } = bctwApi.useCodeHeaders();

  const importProps = {
    iMsg: S.importText,
    iTitle: S.importTitle
  };

  const editProps = {
    editableProps: CodeFormFields.map((s) => s.prop),
    editing: new CodeHeaderInput(),
    isOpen: false,
    onSave: handleSave,
    selectableProps: [],
    handleClose: (): void => { /* do nothing */}
  };

  return (
    <ManageLayout>
      <div className='container'>
        {isFetching || isLoading ? (
          <div>Please wait...</div>
        ) : isError ? (
          <NotificationMessage severity='error' message={formatAxiosError(error as AxiosError)} />
        ) : (
          <>
            <Typography align='center' variant='h6'>
              <strong>Code Management</strong>
            </Typography>
            <ButtonGroup>
              {data?.map((c) => {
                return (
                  <Button key={c.id} onClick={(): void => handleClick(c)}>
                    {c.title}
                  </Button>
                );
              })}
            </ButtonGroup>
            <DataTable
              // fixme: code is not a codeheader
              headers={CodeHeader.getProps() as any}
              title={`${title} Codes`}
              queryProps={{
                query: bctwApi.useCodes,
                param: header,
                // onNewData: (v): void => console.log(JSON.stringify(v[0]), null)
              }}
            />
            <div className='button-row'>
              <ExportImportViewer {...importProps} data={[]} eDisabled={true} />
              <AddEditViewer<CodeHeaderInput>
                onSave={handleSave}
                editing={new CodeHeaderInput()}
                empty={Object.create({})}
                disableEdit={true}>
                <EditCodeHeader {...editProps} />
              </AddEditViewer>
            </div>
          </>
        )}
      </div>
    </ManageLayout>
  );
};

export default CodePage;
