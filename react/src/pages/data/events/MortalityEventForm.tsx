import { Box } from '@material-ui/core';
import { IUpsertPayload } from 'api/api_interfaces';
import { ModalBaseProps } from 'components/component_interfaces';
import { CreateEditCheckboxField, CreateEditDateField, FormFromFormfield } from 'components/form/create_form_components';
import { UserAlertStrings } from 'constants/strings';
import ChangeContext from 'contexts/InputChangeContext';
import dayjs from 'dayjs';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useState } from 'react';
import { LocationEvent } from 'types/events/location_event';
import MortalityEvent from 'types/events/mortality_event';
import { removeProps } from 'utils/common_helpers';

import EditModal from 'pages/data//common/EditModal';
import { FormPart } from 'pages/data//common/EditModalComponents';
import LocationEventForm from 'pages/data/events/LocationEventForm';

type MortEventProps = ModalBaseProps & {
  event: MortalityEvent;
  handleSave: (event: MortalityEvent) => void;
};

/**
 * todo: unassign device?
 * missing pcod fields?
 * not savable when on display
 * errors
 */
export default function MortalityEventForm({ event, open, handleClose, handleSave }: MortEventProps): JSX.Element {
  const [errors, setErrors] = useState({});
  const [mortality, setMortalityEvent] = useState<MortalityEvent>(event);
  const [locationEvent, setLocationEvent] = useState<LocationEvent>(
    new LocationEvent('mortality', dayjs()) // fixme: alert.valid_from
  );

  useDidMountEffect(() => {
    setMortalityEvent(event);
  }, [event]);

  // console.log('event', event);
  const [isRetrieved, setIsRetrieved] = useState<boolean>(false);

  // const formFields = getInputTypesOfT<MortalityEvent>(mortalityEvent, mortalityEvent.formFields);
  // const required = true;

  /**
   * break the MortalityEvent into collar/critter specific properties
   * before passing to the parent save handler
   * @param payload the save payload passed from the {EditModal}
   */
  const onSave = async (payload: IUpsertPayload<MortalityEvent>): Promise<void> => {
    const { body } = payload;
    body.location_event = locationEvent;
    await handleSave(body);
    handleClose(false);
  };
  useDidMountEffect(() => {
    // trigger re-render of retrieved_date field
    // todo: delete this field on-save if disabled?
  }, [isRetrieved]);

  const Header = (
    <Box display='flex' justifyContent='space-between' alignItems='top' pt={3}>
      <Box>
        <Box component='h1' mt={0} mb={1}>
          {UserAlertStrings.mortalityFormTitle}
        </Box>
        <dl className='headergroup-dl'>
          <dd>WLH ID:</dd>
          <dt>{event.wlh_id}</dt>
          <dd>Animal ID:</dd>
          <dt>{event.animal_id}</dt>
          <dd>Device:</dd>
          <dt>{event.device_id}</dt>
        </dl>
      </Box>
    </Box>
  );

  return (
    <EditModal<MortalityEvent>
      showInFullScreen={false}
      handleClose={handleClose}
      onSave={onSave}
      editing={event}
      open={open}
      headerComponent={Header}
      disableTabs={true}
      disableHistory={true}>
      <ChangeContext.Consumer>
        {(handlerFromContext): JSX.Element => {
          // override the modal's onChange function
          const onChange = (v: Record<string, unknown>, modifyCanSave = true): void => {
            if (v) {
              setErrors((o) => removeProps(o, [Object.keys(v)[0]]));
            }
            // update the disabled status of the retrieved_date field
            if (Object.keys(v).includes('retrieved')) {
              setIsRetrieved(v.retrieved as boolean);
            }
            handlerFromContext(v, modifyCanSave);
          };

          const onChangeLocationProp = (v: Record<string, unknown>): void => {
            // when switching coordinate types...dont make form savable
            if (Object.values(v).includes(undefined)) {
              return;
            }
            // the property name will be the 'key' of the first key in Object.values
            const justProp = { [Object.keys(v)[0]]: v.error };
            const newErrors = Object.assign(errors, justProp);
            setErrors(newErrors);

            const l = Object.assign(locationEvent, v);
            setLocationEvent(l);
            // fixme: passing the entire object?
            handlerFromContext(l, true);
          };

          // const tooltipProps: Pick<TooltipProps, 'placement' | 'enterDelay'> = { placement: 'right', enterDelay: 750 };
          const { fields } = mortality;
          if (!fields) {
            return null;
          }

          return (
            <>
              {FormPart('Update Assignment Details', [
                CreateEditCheckboxField({
                  prop: fields.shouldUnattachDevice.prop,
                  type: fields.shouldUnattachDevice.type,
                  value: mortality.shouldUnattachDevice,
                  label: mortality.formatPropAsHeader('shouldUnattachDevice'),
                  handleChange: onChange
                })
              ])}
              {FormPart('Update Device Details', [
                CreateEditCheckboxField({
                  prop: fields.retrieved.prop,
                  type: fields.retrieved.type,
                  value: mortality.retrieved,
                  label: mortality.formatPropAsHeader('retrieved'),
                  handleChange: onChange
                }),
                CreateEditDateField({
                  prop: fields.retrieval_date.prop,
                  type: fields.retrieval_date.type,
                  value: mortality.retrieval_date,
                  label: mortality.formatPropAsHeader('retrieval_date'),
                  handleChange: onChange,
                  disabled: !isRetrieved
                }),
                CreateEditCheckboxField({
                  prop: fields.activation_status.prop,
                  type: fields.activation_status.type,
                  value: mortality.activation_status,
                  label: mortality.formatPropAsHeader('activation_status'),
                  handleChange: onChange
                })
              ])}
              {FormPart('Update Animal Details', [
                FormFromFormfield(mortality, fields.animal_status, onChange),
                FormFromFormfield(mortality, fields.proximate_cause_of_death, onChange)
              ])}
              {FormPart('Mortality Event Details', [
                <LocationEventForm event={locationEvent} handleChange={onChangeLocationProp} />
              ])}
            </>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
