import { AxiosError } from 'axios';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState, createContext, useEffect, useContext } from 'react';
import { useQueryClient } from 'react-query';
import { MortalityAlert } from 'types/alert';
import { formatAxiosError } from 'utils/errors';

/**
 * Context that children components can listen to.
 * Provides:
 *  a) an array of @type {TelemetryAlert} applicable to the user
 *  b) a method to invalidate the query (force refetch alerts) when an alert is updated
 * todo: support other alert types
 */

export type AlertContext = {
  alerts: MortalityAlert[];
  invalidate: (() => void) | null;
  error: string | null;
}

export const AlertContext = createContext<AlertContext>({ alerts: [], invalidate: null, error: null});
export const AlertContextDispatch = createContext(null);

export const AlertStateContextProvider: React.FC = (props) => {
  const bctwApi = useTelemetryApi();
  const [alertContext, setAlertContext] = useState<AlertContext>({ alerts: [], invalidate: null, error: null});
  const queryClient = useQueryClient();

  const { data, status, error, dataUpdatedAt } = bctwApi.useAlert();

  useEffect(() => {
    // also watch dataUpdatedAt for query invalidations, otherwise the context is not reset
    const update = (): void => {
      // console.log('user alert status', status, data);
      if (status === 'success' && data) {
        setAlertContext({ alerts: data, invalidate, error: null});
      } else if (status === 'error') {
        const errMsg = formatAxiosError(error as AxiosError);
        // eslint-disable-next-line no-console
        console.log(`error fetching user alerts ${errMsg}`);
        setAlertContext({ alerts: [], invalidate, error: errMsg})
      }
    };
    update();
  }, [status, dataUpdatedAt]);

  const invalidate = (): void => {
    // console.log('refetching user alerts');
    queryClient.invalidateQueries('userAlert');
  };

  return (
    <AlertContext.Provider value={alertContext}>
      <AlertContextDispatch.Provider value={setAlertContext as any}>{props.children}</AlertContextDispatch.Provider>
    </AlertContext.Provider>
  );
};

const useAlertContextDispatch = (): React.Context<AlertContext> => {
  const context = useContext(AlertContextDispatch);
  return context as any;
};
export { useAlertContextDispatch };
