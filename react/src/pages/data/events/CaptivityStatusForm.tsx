import { Box } from '@material-ui/core';
import { FormFromFormfield } from 'components/form/create_form_components';
import { eInputType, FormChangeEvent } from 'types/form_types';
import MortalityEvent, { MortalityFormField } from 'types/events/mortality_event';
import { FormPart } from '../common/EditModalComponents';
import { boxProps } from './EventComponents';
/**
 *
 * todo: handle more than just a mortality event
 * todo: move long_label to tooltip?
 * todo: does mort_capt_status code work
 * move fields to own captivity class?
 */
type CaptivityStatusFormProps = {
  event: MortalityEvent;
  handleFormChange: FormChangeEvent;
};

export default function CaptivityStatusForm({ event, handleFormChange }: CaptivityStatusFormProps): JSX.Element {
  const captivityFields: Required<Pick<MortalityFormField, 'captivity_status' | 'mortality_captivity_status'>> = {
    captivity_status: {
      prop: 'captivity_status',
      type: eInputType.check,
      long_label: 'Animal is or has been part of a captivity program'
    },
    mortality_captivity_status: {
      prop: 'mortality_captivity_status',
      type: eInputType.code,
      codeName: 'mortality_habitat',
      long_label: 'Did the mortality occur when animal was in the wild or in captivity?'
    }
  };

  return (
    <>
      {FormPart('ev-capt', 'Captivity Details', [
        <Box {...boxProps}>
          <span>{captivityFields.captivity_status.long_label}</span>
          {/* captivity_status is always disabled in mortality workflow */}
          {FormFromFormfield(event, captivityFields.captivity_status, handleFormChange, true)}
        </Box>,
        <Box {...boxProps}>
          <span>{captivityFields.mortality_captivity_status.long_label}</span>
          {FormFromFormfield(event, captivityFields.mortality_captivity_status, handleFormChange)}
        </Box>
      ])}
    </>
  );
}
