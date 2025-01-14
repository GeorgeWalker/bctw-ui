import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import { Portal } from '@mui/material';
import Alert, { AlertProps } from '@mui/material/Alert';

type IToastProps = Pick<AlertProps, 'severity'> & {
  message: string;
  show: boolean;
  action?: React.ReactNode;
  onClose: () => void;
};

export default function Toast({ message, show, action, onClose, severity }: IToastProps): JSX.Element {
  return (
    <>
      <Portal>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          open={show}
          autoHideDuration={8000}
          onClose={onClose}
          action={action}>
          <Alert onClose={onClose} severity={severity}>
            {message}
          </Alert>
        </Snackbar>
      </Portal>
    </>
  );
}
