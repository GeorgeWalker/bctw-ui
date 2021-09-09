import AssignmentHistory from 'pages/data/animals/AssignmentHistory';
import Button from 'components/form/Button';
import ChangeContext from 'contexts/InputChangeContext';
import EditModal from 'pages/data/common/EditModal';
import { Animal, AttachedAnimal, critterFormFields } from 'types/animal';
import { Box, ButtonProps, Container } from '@material-ui/core';
import { EditorProps } from 'components/component_interfaces';
import { FormFieldObject } from 'types/form_types';
import { MakeEditField } from 'components/form/create_form_components';
import { permissionCanModify } from 'types/permission';
import { useState } from 'react';
import { FormPart } from '../common/EditModalComponents';
import { EventType } from 'types/events/event';
import EventWrapper from '../events/EventWrapper';
import useDidMountEffect from 'hooks/useDidMountEffect';
import MortalityEvent from 'types/events/mortality_event';
import CaptureEvent from 'types/events/capture_event';

/**
 * the main animal form
 * todo: for new animals, hide all workflow fields?
 * todo: disable editing all workflow fields
 * bug: cant save?
 */
export default function EditCritter(props: EditorProps<Animal | AttachedAnimal>): JSX.Element {
  const { isCreatingNew, editing } = props;
  const canEdit = permissionCanModify(editing.permission_type) || isCreatingNew;

  const isAttached = editing instanceof AttachedAnimal;
  const [showAssignmentHistory, setShowAssignmentHistory] = useState(false);
  const [workflowType, setWorkflowType] = useState<EventType>('unknown');
  const [showWorkflowForm, setShowWorkflowForm] = useState(false);
  const [event, updateEvent] = useState(new MortalityEvent()); //fixme: type this

  // when workflow button is clicked, update the event type
  useDidMountEffect(() => {
    // update the event instance
    updateEvent(() => {
      let e;
      if (workflowType === 'capture') {
        e = new CaptureEvent();
      } else { // default for now
        e = new MortalityEvent();
      }
      const o = Object.assign(e, editing);
      return o;
    })
  }, [workflowType])

  useDidMountEffect(() => {
    if (event) {
      console.log('event updated', event, !open);
      setShowWorkflowForm(o => !o);
    }
  }, [event]);

  const {
    associatedAnimalFields,
    captureFields,
    characteristicsFields,
    identifierFields,
    mortalityFields,
    releaseFields,
    animalCommentField
  } = critterFormFields;

  const makeFormField = (
    formType: FormFieldObject<Animal>,
    handleChange: (v: Record<string, unknown>) => void
  ): React.ReactNode => {
    const { prop, type, codeName, required } = formType;
    return MakeEditField({
      type,
      prop,
      value: editing[prop],
      handleChange,
      disabled: !canEdit,
      required,
      label: editing.formatPropAsHeader(prop),
      span: true,
      codeName
    });
  };

  const Header = (
    <Container maxWidth='xl'>
      {isCreatingNew ? (
        <Box pt={3}>
          <Box component='h1' mt={0} mb={0}>
            Add Animal
          </Box>
        </Box>
      ) : (
        <Box display='flex' justifyContent='space-between' alignItems='top' pt={3}>
          <Box>
            <Box component='h1' mt={0} mb={1}>
              WLH ID: {editing?.wlh_id ?? '-'} &nbsp;<span style={{ fontWeight: 100 }}>/</span>&nbsp; Animal ID:{' '}
              {editing?.animal_id ?? '-'}
            </Box>
            <dl className='headergroup-dl'>
              <dd>Species:</dd>
              <dt>{editing.species}</dt>
              <dd>Device ID:</dd>
              <dt>{isAttached ? (editing as AttachedAnimal).device_id : 'Unassigned'}</dt>
              <dd>BCTW ID:</dd>
              <dt>{editing.critter_id}</dt>
              <dd>Permission:</dd>
              <dt>{editing.permission_type}</dt>
            </dl>
          </Box>
          <Box>
            <Button size='large' variant='outlined' color='default' className='button'
              onClick={(): void => setShowAssignmentHistory((o) => !o)}>
              Device Assignment
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );

  return (
    <EditModal headerComponent={Header} hideSave={!canEdit} {...props}>
      <ChangeContext.Consumer>
        {(handlerFromContext): JSX.Element => {
          // override the modal's onChange function
          const onChange = (v: Record<string, unknown>, modifyCanSave = true): void => {
            handlerFromContext(v, modifyCanSave);
          };
          const btnProps: ButtonProps = { style: { marginLeft: '20px' }, color: 'default', className: 'button' };
          return (
            <>
              {FormPart(
                'Identifiers',
                identifierFields.map((f) => makeFormField(f, onChange))
              )}
              {FormPart(
                'Characteristics',
                characteristicsFields.map((f) => makeFormField(f, onChange))
              )}
              {FormPart(
                'Association With Another Individual',
                associatedAnimalFields.map((f) => makeFormField(f, onChange))
              )}
              {FormPart(
                'Comments About This Animal',
                animalCommentField.map((f) => makeFormField(f, onChange))
              )}
              {FormPart(
                'Latest Capture Details',
                captureFields.map((f) => makeFormField(f, onChange)),
                <Button {...btnProps} onClick={(): void => setWorkflowType('capture')}>
                  Add Capture Event
                </Button>
              )}
              {/* fixme: defaulting to mortality for now */}
              {FormPart(
                'Latest Release Details',
                releaseFields.map((f) => makeFormField(f, onChange)),
                <Button {...btnProps} onClick={(): void => setWorkflowType('mortality')}>
                  Add Release Event
                </Button>
              )}
              {FormPart(
                'Mortality Details',
                mortalityFields.map((f) => makeFormField(f, onChange)),
                <Button {...btnProps} onClick={(): void => setWorkflowType('mortality')}>
                  Record Mortality Details
                </Button>
              )}
              {/* dont show assignment history for new critters */}
              {!isCreatingNew ? (
                <AssignmentHistory
                  open={showAssignmentHistory}
                  handleClose={(): void => setShowAssignmentHistory(false)}
                  critter_id={editing.critter_id}
                  permission_type={editing.permission_type}
                />
              ) : null}
              <EventWrapper eventType={workflowType} open={showWorkflowForm} event={event} handleClose={(): void => setShowWorkflowForm(false)}/>
            </>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
