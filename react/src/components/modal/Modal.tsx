import { Dialog, IconButton } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import Fade from '@mui/material/Fade';
import modalStyles from 'components/modal/modal_styles';
import { ModalProps } from 'components/component_interfaces';
import { Icon } from 'components/common';
import { removeProps } from 'utils/common_helpers';

export default function Modal(props: ModalProps): JSX.Element {
  const { disableBackdropClick, open, title, handleClose, children } = props;
  const propsToPass = removeProps(props, ['handleClose', 'disableBackdropClick']);
  const classes = modalStyles();
  return (
    <Dialog
      className={'dialog-modal'}
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
      {...propsToPass}>
      <Fade in={open}>
        <div className={classes.paper}>
          <div className={classes.title}>
            <h3>{title}</h3>
            {/* if this prop was passed, dont show the close button */}
            {disableBackdropClick ? null : (
              <IconButton
                style={{float: 'right'}}
                onClick={(): void => handleClose(false)}
                size="large">
                <Icon icon='close' />
              </IconButton>
            )}
          </div>
          <div>{children}</div>
        </div>
      </Fade>
    </Dialog>
  );
}
