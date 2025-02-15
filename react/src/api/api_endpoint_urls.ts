/**
 * some endpoint urls are used in more than one api.ts file
*/

const importCSVEndpoint                  = 'import-csv';
const importXMLEndpoint                  = 'import-xml';
const exportEndpoint                     = 'export';
const getCollarAssignmentHistoryEndpoint = 'get-assignment-history';
const attachDeviceEndpoint               = 'attach-device';
const removeDeviceEndpoint               = 'unattach-device';
const updateDatalifeEndpoint             = 'update-data-life';
const upsertCritterEndpoint              = 'upsert-animal';
const upsertDeviceEndpoint               = 'upsert-collar';
const upsertAlertEndpoint                = 'update-user-alert';
const getCritterEndpoint                 = 'get-animals';
const submitOnboardingRequest            = 'submit-onboarding-request';
const getOnboardingRequests              = 'onboarding-requests';
const handleOnboardingRequest            = 'handle-onboarding-request';
const getCurrentOnboardStatus            = 'get-onboard-status';
const triggerTelemetryFetch              = 'fetch-telemetry';

export {
  importCSVEndpoint,
  importXMLEndpoint,
  exportEndpoint,
  getCollarAssignmentHistoryEndpoint,
  getCritterEndpoint,
  attachDeviceEndpoint,
  removeDeviceEndpoint,
  updateDatalifeEndpoint,
  upsertAlertEndpoint,
  upsertCritterEndpoint,
  upsertDeviceEndpoint,
  submitOnboardingRequest,
  getOnboardingRequests,
  getCurrentOnboardStatus,
  handleOnboardingRequest,
  triggerTelemetryFetch,
}