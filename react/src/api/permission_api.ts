import { createUrl } from 'api/api_helpers';
import { plainToClass } from 'class-transformer';
import { IUserCritterAccess, User, UserCritterAccess } from 'types/user';
import {
  IUserCritterPermissionInput,
  IGrantCritterAccessResults,
  IBulkUploadResults,
  ApiProps
} from 'api/api_interfaces';
import { eCritterPermission, filterOutNonePermissions, IExecutePermissionRequest, IPermissionRequest, IPermissionRequestInput, PermissionRequest } from 'types/permission';

export const permissionApi = (props: ApiProps) => {
  const { api, testUser } = props;

  /**
   * used in the admin page @file {permissions/GrantCritterAccessPage.tsx}
   * to grant user's access to animal's and the devices that they are attached to.
  */
  const grantCritterAccessToUser = async (
    body: IUserCritterPermissionInput
  ): Promise<IBulkUploadResults<IGrantCritterAccessResults>> => {
    const url = createUrl({ api: 'assign-critter-to-user', testUser });
    const { data } = await api.post(url, [body]);
    const { results, errors } = data;
    return { results, errors };
  };

  /**
   * @param user the @type {User} to retrieve the permissions for. 
   * only passes the user's IDIR to the API (fixme: bceid support)
   * @param filter an optional @type {eCritterPermission[]}, which is defaulted to 
   * all permission types other than 'none' - aka backend will not return critters that 
   * the user does not have any permission to.
  */
  const getUserCritterAccess = async (
    page: number,
    user: User,
    filter: eCritterPermission[] = filterOutNonePermissions
  ): Promise<UserCritterAccess[]> => {
    const filtersAsString = filter.join(',');
    const url = createUrl({ api: `get-critter-access/${user.idir}`, query: `filters=${filtersAsString}`, page });
    const { data } = await api.get(url);
    const converted = data.map((json: IUserCritterAccess[]) => plainToClass(UserCritterAccess, json));
    return converted;
  };

  /**
   * an endpoint that an admin access only page uses to display a list of active 
   * permission requests. @returns {IPermissionRequest[]}, which queries from an view 
   * that splits the email list and individual @type {IUserCritterAccessInput} 
   * into multiple rows.
   * @param (none) - uses the user's IDIR only
  */
  const getPermissionRequest = async (): Promise<PermissionRequest[]> => {
    const { data } = await api.get(createUrl({ api: `permission-request`}));
    const converted = data.map(d => plainToClass(PermissionRequest, d));
    return converted;
  }

  /**
   * an endpoint for an owner to submit a permission request to grant one or more email addresses access
   * to a list of animals
  */
  const submitPermissionRequest = async (body: IPermissionRequestInput): Promise<IPermissionRequest> => {
    const url = createUrl({api: `submit-permission-request`});
    const { data } = await api.post(url, body);
    return data;
  }

  /** 
   * an endpoint that an admin uses to grant or deny an owner's permission request
   * currently now edit functionality exists
  */
  const takeActionOnPermissionRequest = async (body: IExecutePermissionRequest): Promise<IUserCritterAccess> => {
    const url = createUrl({api: `execute-permission-request`});
    const { data } = await api.post(url, body);
    return data;
  }

  return {
    getUserCritterAccess,
    grantCritterAccessToUser,
    submitPermissionRequest,
    getPermissionRequest,
    takeActionOnPermissionRequest
  };
};
