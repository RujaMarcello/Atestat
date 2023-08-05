import { ReactElement } from 'react';

import { UserRolesIsFunction } from '../map';

export interface UserRole {
  renderIf: (v: UserRolesIsFunction) => boolean;
  children?: ReactElement;
}
