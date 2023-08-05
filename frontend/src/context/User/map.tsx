import { Dispatch } from 'react';

import { UserDto } from '../../generated/api';
import { UserRolesIsFunction } from '../map';

export interface UserContextInterface {
  userLoading: boolean;
  user: UserDto | undefined;
  setToken: Dispatch<any>;
  roleGetter: (f: (v: UserRolesIsFunction) => boolean) => boolean;
  signOut: () => void;
  updateUser: (form: UserDto) => void;
}

export interface Token {
  token: string;
}
