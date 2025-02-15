import { IUpsertPayload } from 'api/api_interfaces';
import { EditorProps } from 'components/component_interfaces';
import { IEditModalProps } from 'pages/data/common/EditModal';
import { cloneElement, useState } from 'react';
import { BCTWBase } from 'types/common_types';
import { Box, Button, ButtonProps } from '@mui/material';
import { Icon, Tooltip } from 'components/common';
import { QueryStatus } from 'react-query';
import { buttonProps } from 'components/component_constants';
import LoadingButton from '@mui/lab/LoadingButton';
import { useAttachmentChanged } from 'contexts/DeviceAttachmentChangedContext';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { Animal, AttachedAnimal } from 'types/animal';

/**
 * handles the show/hide functionality of the childEditComponent
 * used on main data pages (critter/collar)
 * @param cannotEdit permission to edit?
 * @param children child component that handles the editing, {EditModal}
 * @param disableAdd optional - hide add button
 * @param disableEdit defaults to false
 * @param editButton optional - used in map overview screens
 * @param editing isntance of T passed to editor when edit button is clicked
 * @param empty 'new' instance of T passed to editor when add button is clicked
 * @param onDelete
 * @param onSave
 * @param queryStatus will render loading indicator if status is not set to 'success'
 **/
export type IAddEditProps<T> = {
  cannotEdit?: boolean;
  children: JSX.Element;
  disableAdd?: boolean;
  disableEdit?: boolean;
  editBtn?: JSX.Element;
  editing: T;
  empty: T;
  onDelete?: (id: string) => void;
  onSave?: (a: IUpsertPayload<T>) => Promise<void>;
  editText?: string;
  addText?: string;
  deleteText?: string;
  editTooltip?: string;
  addTooltip?: string;
  deleteTooltip?: string;
  queryStatus: QueryStatus;
  closeAfterSave?: boolean;
};

export default function AddEditViewer<T extends BCTWBase<T>>(props: IAddEditProps<T>): JSX.Element {
  const {
    cannotEdit,
    children,
    disableAdd,
    disableEdit,
    editBtn,
    editing,
    empty,
    onDelete,
    onSave,
    addText,
    editText,
    deleteText,
    editTooltip,
    addTooltip,
    deleteTooltip,
    queryStatus,
    closeAfterSave = false
  } = props;

  const [editObj, setEditObj] = useState<T>(editing);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const deviceAttachmentChange = useAttachmentChanged();

  const inverseModalState = (): void => {
    setShowModal(o => !o);
  }

  /**
   * close the edit modal when editing an animal and 
   * a device is attached or removed 
   */
  useDidMountEffect(() => {
    if (editing instanceof AttachedAnimal || editing instanceof Animal) {
      inverseModalState();
    }
  }, [deviceAttachmentChange])

  const handleClickAdd = (): void => {
    setIsCreatingNew(true);
    setEditObj(empty);
    inverseModalState();
  };

  const handleClickEdit = (): void => {
    setIsCreatingNew(false);
    setEditObj(editing);
    inverseModalState();
  };

  const enableDelete = (): boolean => {
    const isFn = typeof onDelete === 'function';
    return !!isFn;
  };

  const handleClickDelete = (): void => {
    if (enableDelete()) {
      onDelete(editing[editing.identifier ?? 'id']);
    }
  };

  const handleClickSave = async (payload: IUpsertPayload<T>): Promise<void> => {
    if (typeof onSave === 'function') {
      await onSave(payload);
      if (closeAfterSave) {
        inverseModalState();
      }
    }
  };

  const handleClose = (): void => {
    setShowModal(false);
  };

  // override the open/close handlers and props of the child EditModal component
  const editorProps: Pick<IEditModalProps<T>, 'editing' | 'open' | 'onSave' | 'handleClose' | 'disableHistory'> &
  Pick<EditorProps<T>, 'isCreatingNew'> = {
    // if this is a new instance - pass an empty object
    editing: isCreatingNew ? empty : editObj,
    // required in Edit components (ex. EditCritter)
    isCreatingNew,
    open: showModal,
    disableHistory: isCreatingNew,
    handleClose,
    onSave: handleClickSave
  };

  // do the same for the edit btn props
  const editBtnProps = {
    disabled: disableEdit ? true : Object.keys(editing).length === 0,
    onClick: handleClickEdit
  };

  // override for Critter/Collar map overview pages
  if (editBtn) {
    return (
      <>
        {cloneElement(children, editorProps)}
        {cloneElement(editBtn, editBtnProps)}
      </>
    );
  }
  const btnProps: Pick<ButtonProps, 'size' | 'variant' | 'color'> = {
    variant: 'outlined',
    ...buttonProps
  };

  if (queryStatus === 'error') {
    return <p>error: unable to load</p>;
  }
  return (
    <>
      {/* clone child EditModal component to pass additional props */}
      {cloneElement(children, editorProps)}
      <Box className='button-bar'>
        {/* render add button */}
        {disableAdd ? null : (
          <Tooltip title={addTooltip ?? ''} inline={true}>
            <Button {...btnProps} variant='contained' startIcon={<Icon icon='plus' />} onClick={handleClickAdd}>{`Add ${
              addText ?? ''
            }`}</Button>
          </Tooltip>
        )}

        {/* render edit button */}
        <Tooltip title={editTooltip ?? ''} inline={true}>
          {
            queryStatus === 'loading' ? (
              <LoadingButton loading loadingIndicator='Loading...'>Fetch data</LoadingButton>
            ) : (
              <Button {...btnProps} disabled={editBtnProps.disabled} onClick={handleClickEdit}>
                {`${cannotEdit ? 'View' : 'Edit'} ${editText ?? ''}`}
              </Button>
            )
          }
        </Tooltip>

        {/* render delete button */}
        {enableDelete() ? (
          <Tooltip title={deleteTooltip ?? ''} inline={true}>
            <Button
              {...btnProps}
              startIcon={<Icon icon='delete' />}
              disabled={cannotEdit || !editing[editing.identifier]}
              onClick={handleClickDelete}>
              {`Delete ${deleteText ?? ''}`}
            </Button>
          </Tooltip>
        ) : null}
      </Box>
    </>
  );
}
