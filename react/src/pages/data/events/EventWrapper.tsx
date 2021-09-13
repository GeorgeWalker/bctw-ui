import { Box, Container, Divider, Paper } from '@material-ui/core';
import { IBulkUploadResults } from 'api/api_interfaces';
import { AxiosError } from 'axios';
import { Modal } from 'components/common';
import { ModalBaseProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import useFormHasError from 'hooks/useFormHasError';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useEffect, useState } from 'react';
import { BCTWEvent, EventType } from 'types/events/event';
import { formatAxiosError } from 'utils/errors';
import { EditHeader } from '../common/EditModalComponents';
import CaptureEventForm from './CaptureEventForm';
import MortalityEventForm from './MortalityEventForm';
import ReleaseEventForm from './ReleaseEventForm';

type EventWrapperProps<T> = ModalBaseProps & {
  event: BCTWEvent<T>;
  eventType: EventType;
  onEventSaved?: () => void; // to notify alert that event was saved
};

/**
 * wraps all of the event pages.
 * handles saving
 */
export default function EventWrapper<E>({
  event,
  eventType,
  onEventSaved,
  isOpen: open,
  handleClose
}: EventWrapperProps<E>): JSX.Element {
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();

  const [canSave, setCanSave] = useState(false);
  const [hasErr, checkHasErr] = useFormHasError();

  useEffect(() => {
    // console.log('event wrapper error status', hasErr);
    setCanSave(!hasErr);
  }, [hasErr])

  const handleEventSaved = async (data: IBulkUploadResults<unknown>): Promise<void> => {
    // console.log('data returned from mortality alert context', data);
    const { errors, results } = data;
    if (errors.length) {
      responseDispatch({ severity: 'error', message: `${errors.map((e) => e.error)}` });
    } else if (results.length) {
      responseDispatch({ severity: 'success', message: 'mortality event saved!' });
      // expire the telemetry alert
      if (typeof onEventSaved === 'function') {
        onEventSaved();
      }
    }
  };

  const onError = (e: AxiosError) => {
    console.log('error saving event', formatAxiosError(e));
  };

  // setup save mutation
  const { mutateAsync: saveMortality } = bctwApi.useMutateMortalityEvent({ onSuccess: handleEventSaved });

  // performs metadata updates of collar/critter
  const handleSave = async (): Promise<void> => {
    console.log(event);
    // if (event) {
    //   await saveMortality(event);
    // }
  };

  const handleChildFormUpdated = (v: Record<string, unknown>): void => {
    checkHasErr(v);
  }

  let Comp: React.ReactNode;
  switch (eventType) {
    case 'release':
      Comp = <ReleaseEventForm />;
      break;
    case 'capture':
      Comp = <CaptureEventForm />;
      break;
    case 'mortality':
      Comp = (
        <MortalityEventForm handleFormChange={handleChildFormUpdated} event={event as any}/>
      );
      break;
    case 'unknown':
    default:
      Comp = <></>;
  }

  return (
    <Modal isOpen={open} handleClose={handleClose}>
      <form className={'rootEditInput'} autoComplete={'off'}>
        <EditHeader<E>
          title={event.getHeaderTitle()}
          headers={event.displayProps}
          obj={event as any}
          format={event.formatPropAsHeader}
        />

        <Container maxWidth='xl'>
          <Box py={3}>
            <Paper>
              {Comp}

              <Box my={1} mx={3}>
                <Divider></Divider>
              </Box>

              <Box p={3}>
                <Box display='flex' justifyContent='flex-end' className='form-buttons'>
                  <Button size='large' color='primary' onClick={handleSave} disabled={!canSave}>
                    Save
                  </Button>
                  <Button size='large' variant='outlined' color='primary' onClick={(): void => handleClose(false)}>
                    Cancel and Exit
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Container>
      </form>
    </Modal>
  );
}
