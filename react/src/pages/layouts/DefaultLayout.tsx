import { useState, useEffect, useContext } from 'react';
import { UserContext } from 'contexts/UserContext';
import { AlertContext } from 'contexts/UserAlertContext';
import UserAlert from 'pages/user/UserAlertPage';
import { Modal } from 'components/common';
import { AxiosError } from 'axios';
import { formatAxiosError } from 'utils/errors';
import UserOnboarding from 'pages/onboarding/UserOnboarding';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { isDev } from 'api/api_helpers';
import { doNothing } from 'utils/common_helpers';
import { TelemetryAlert } from 'types/alert';

type IDefaultLayoutProps = {
  children: React.ReactNode;
};

/**
 * wrap this component around child components that require the user to exist
 *
 * assuming the user exists, also forces open the alerts modal if there are alerts that require action
 */
export default function DefaultLayout({ children }: IDefaultLayoutProps): JSX.Element {
  const useUser = useContext(UserContext);
  const useAlert = useContext(AlertContext);
  const [alerts, setAlerts] = useState<TelemetryAlert[]>([]);
  const [userErr, setUserErr] = useState<AxiosError | null>(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [mustUpdateAlert, setMustUpdateAlert] = useState(false);

  // set user state when user context changes
  useEffect(() => {
    const { error } = useUser;
    if (error) {
      setUserErr(error);
    }
  }, [useUser]);

  // set alert state when context changes
  useEffect(() => {
    if (useAlert?.alerts?.length) {
      setAlerts(useAlert.alerts);
    }
  }, [useAlert]);

  useDidMountEffect(() => {
    // forces users to deal with alerts if they are not currently snoozed (unless in development)
    // const dealWithIt = alerts.some((a) => !a.isSnoozed);
    const dealWithIt = alerts.some((a) => !a.isSnoozed) && !isDev();
    setMustUpdateAlert(dealWithIt);
  }, [alerts]);

  useDidMountEffect(() => {
    if (mustUpdateAlert) {
      setShowAlerts(true);
    } else {
      setShowAlerts(false);
    }
  }, [mustUpdateAlert]);

  if (userErr) {
    // user is unauthorized, redirect them to the onboarding page
    if (userErr?.response?.status === 401) {
      return <UserOnboarding />;
    } else {
      // render the error
      return <div>ERROR {formatAxiosError(userErr)}</div>;
    }
  }

  return (
    <>
      <Modal
        title={useAlert?.getAlertTitle()}
        open={showAlerts}
        disableBackdropClick={mustUpdateAlert}
        handleClose={mustUpdateAlert ? doNothing : (): void => setShowAlerts(false)}>
        <UserAlert />
      </Modal>
      {children}
    </>
  );
}
