import { Typography } from '@material-ui/core';
import Modal from 'components/modal/Modal';
import Button from 'components/form/Button';
import { ModalBaseProps } from 'components/component_interfaces';
import modalStyles from 'components/modal/modal_styles';
import { ReactNode } from 'react';

/**
 * props for the simple yes/no style confirmation modal
 * @param btnNoText text to display in the 'no' button
 * @param message either a string or component to display as the main content of the modal
 * @param handleClickYes called when 'yes' is clicked
 */
type ConfirmModalProps = ModalBaseProps & {
  btnNoText?: string;
  btnYesText?: string;
  message: string | ReactNode;
  handleClickYes: () => void;
};

export default function ConfirmModal({
  message,
  title,
  isOpen,
  handleClose,
  handleClickYes,
  btnNoText = 'No',
  btnYesText = 'Yes'
}: ConfirmModalProps): JSX.Element {
  const classes = modalStyles();
  return (
    <Modal isOpen={isOpen} handleClose={handleClose} title={title}>
      <Typography>{message}</Typography>
      <div className={classes.btns} color='primary'>
        <Button onClick={handleClickYes}>{btnYesText}</Button>
        <Button onClick={(): void => handleClose(false)}>{btnNoText}</Button>
      </div>
    </Modal>
  );
}
