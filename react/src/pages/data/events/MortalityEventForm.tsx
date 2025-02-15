import { Box } from '@mui/material';
import { CreateFormField } from 'components/form/create_form_components';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { parseFormChangeResult } from 'types/form_types';
import { FormSection } from 'pages/data//common/EditModalComponents';
import LocationEventForm from 'pages/data/events/LocationEventForm';
import { useState } from 'react';
import { LocationEvent } from 'types/events/location_event';
import MortalityEvent from 'types/events/mortality_event';
import CaptivityStatusForm from './CaptivityStatusForm';
import { boxSpreadRowProps } from './EventComponents';
import Radio from 'components/form/Radio';
import { WorkflowStrings } from 'constants/strings';
import { wfFields, WorkflowFormProps } from 'types/events/event';

type MortEventProps = WorkflowFormProps<MortalityEvent> & {
  event: MortalityEvent;
};

/**
 * todo: dont hardcode radio values, retrieve from code somehow
 */
export default function MortalityEventForm({ event, handleFormChange, handleExitEarly }: MortEventProps): JSX.Element {
  const [mortality, setMortalityEvent] = useState<MortalityEvent>(event);
  // business logic workflow state
  const [isRetrieved, setIsRetrieved] = useState(false);
  const [isPredation, setIsPredation] = useState(false);
  const [isPredatorKnown, setIsPredatorKnown] = useState(false);
  const [isBeingUnattached, setIsBeingUnattached] = useState(false);
  const [ucodDisabled, setUcodDisabled] = useState(true);
  const [isUCODKnown, setIsUCODKnown] = useState(false);
  // setting animal_status to alive disables the form.
  const [critterIsAlive, setCritterIsAlive] = useState(false);

  useDidMountEffect(() => {
    setMortalityEvent(event);
  }, [event]);

  // if critter is marked as alive, workflow wrapper will show exit workflow prompt
  useDidMountEffect(() => {
    event.onlySaveAnimalStatus = critterIsAlive;
    if (critterIsAlive) {
      // update these props to indicate that device/attachment should not be saved
      event.shouldSaveDevice = false;
      event.shouldUnattachDevice = false;
      // call the exite early handler from WorkflowWrapper, passing the confirmation message
      handleExitEarly(<p>{WorkflowStrings.mortality.exitEarly}</p>);
    } else {
      event.shouldSaveDevice = true;
    }
  }, [critterIsAlive]);

  // form component changes can trigger mortality specific business logic
  const onChange = (v: Record<keyof MortalityEvent, unknown>): void => {
    handleFormChange(v);
    const [key, value] = parseFormChangeResult<MortalityEvent>(v);
    // retrieved checkbox state enables/disables the retrieval date datetime picker
    if (key === 'retrieved') {
      setIsRetrieved(!!value);
    } else if (key === 'proximate_cause_of_death') {
      setUcodDisabled(false); // enable ucod when a proximate cause is chosen
      // value could be undefined ex. when a code is not selected
      if ((value as string)?.toLowerCase()?.includes('pred')) {
        setIsPredation(true);
      }
    } else if (key === 'predator_known') {
      setIsPredatorKnown(!!value);
    } else if (key === 'shouldUnattachDevice') {
      // make attachment end state required if user is removing device
      setIsBeingUnattached(!!value);
    } else if (key === 'isUCODSpeciesKnown') {
      setIsUCODKnown(!!value);
    } else if (key === 'animal_status') {
      if (value === 'Mortality' || value === 'Alive') {
        setCritterIsAlive(value === 'Alive');
      }
    }
  };

  // when the location event form changes, also notify wrapper about errors
  const onChangeLocationProp = (v: Record<keyof LocationEvent, unknown>): void => {
    handleFormChange(v);
  };

  const fields = mortality.fields;

  if (!fields || !wfFields) {
    return null;
  }

  const isDisabled ={ disabled: critterIsAlive };
  return (
    <>
      <FormSection id='mort-a-st' header={event.formatPropAsHeader('animal_status')} disabled={critterIsAlive}>
        {[
          <Radio
            key='mort-rad-status'
            propName={wfFields.get('animal_status').prop}
            changeHandler={onChange}
            defaultSelectedValue={'Mortality'}
            values={(['Mortality', 'Alive']).map((p) => ({ label: p, value: p }))}
          />
        ]}
      </FormSection>
      {/* location events, nesting some other components inside */}
      <FormSection id='mort-device' header='Event Details' disabled={critterIsAlive}>
        {[
          <LocationEventForm
            key='mort-loc'
            disabled={critterIsAlive}
            event={mortality.location_event}
            notifyChange={onChangeLocationProp}
            childNextToDate={CreateFormField(mortality, wfFields.get('device_status'), onChange, isDisabled)}
            children={
              <>
                {/* device retrieval */}
                <Box mb={1} {...boxSpreadRowProps}>
                  {CreateFormField(mortality, wfFields.get('retrieved'), onChange, isDisabled)}
                  {CreateFormField(mortality, { ...wfFields.get('retrieval_date'), required: isRetrieved }, onChange, {disabled: !isRetrieved || critterIsAlive})}
                </Box>
                {/* data life / remove device */}
                <Box mb={1} {...boxSpreadRowProps}>
                  {CreateFormField(mortality, {...fields.shouldUnattachDevice}, onChange, isDisabled)}
                  {CreateFormField(mortality, { ...fields.data_life_end, required: isBeingUnattached }, onChange, {disabled: !isBeingUnattached || critterIsAlive})}
                </Box>
              </>
            }
          />,
          <Box key='bx-devcond' mt={2} display='flex' columnGap={1}>
            {/* device status */}
            {CreateFormField(mortality, wfFields.get('device_condition'), onChange, isDisabled)}
            {CreateFormField(mortality, wfFields.get('device_deployment_status'), onChange, isDisabled)}
          </Box>,
          <Box key='bx-act-status'>
            {CreateFormField(mortality, wfFields.get('activation_status'), onChange, isDisabled, true)}
          </Box>
        ]}
      </FormSection>
      {/* critter status fields */}
      <FormSection id='mort-critter' header='Animal Details' disabled={critterIsAlive}>
        {[
          <Box key='bx-invest' {...boxSpreadRowProps}>
            {<span>{WorkflowStrings.mortality.mort_investigation}</span>}
            {CreateFormField(mortality, {required: true, ...wfFields.get('mortality_investigation')}, onChange, {disabled: critterIsAlive, style: {width: '250px'}})}
          </Box>,
          <Box key='bx-mort-rep'>
            {CreateFormField(mortality, wfFields.get('mortality_report'), onChange, isDisabled, true)}
          </Box>,
          <Box key='bx-cod' mt={1} display='flex' columnGap={1}>
            {CreateFormField(mortality, wfFields.get('proximate_cause_of_death'), onChange, isDisabled)}
            {CreateFormField(mortality, wfFields.get('ultimate_cause_of_death'), onChange, {disabled: ucodDisabled || critterIsAlive})}
          </Box>,
          <Box key='bx-pred' mt={1} {...boxSpreadRowProps}>
            {CreateFormField(mortality, wfFields.get('predator_known'), onChange, {disabled: !isPredation || critterIsAlive})}
            {CreateFormField(mortality, wfFields.get('predator_species_pcod'), onChange, {disabled: !isPredatorKnown || critterIsAlive})}
            {CreateFormField(mortality, wfFields.get('pcod_confidence'), onChange, {disabled: !isPredatorKnown || critterIsAlive})}
          </Box>,
          <Box key='bx=ucod' mt={1} {...boxSpreadRowProps}>
            {CreateFormField(mortality, {...fields.isUCODSpeciesKnown}, onChange, {disabled: !isPredatorKnown || critterIsAlive})}
            {CreateFormField(mortality, wfFields.get('predator_species_ucod'), onChange, {disabled: !(isPredatorKnown && isUCODKnown) || critterIsAlive})}
            {CreateFormField(mortality, wfFields.get('ucod_confidence'), onChange, {disabled: !(isPredatorKnown && isUCODKnown) || critterIsAlive})}
          </Box>,
          <CaptivityStatusForm key='mort-capt-form' event={mortality} handleFormChange={handleFormChange} disabled={critterIsAlive} />
        ]}
      </FormSection>
    </>
  );
}
