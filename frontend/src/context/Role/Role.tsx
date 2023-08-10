import { FC, useMemo } from 'react';

import { useUserProvider } from '../User/User';
import { UserRole } from './map';

export const Role: FC<UserRole> = ({ renderIf, children }) => {
  const { roleGetter: is } = useUserProvider();

  const shouldRender = useMemo(() => {
    return is(renderIf);
  }, [is, renderIf]);

  if (!shouldRender) {
    return null;
  }

  return children || null;
};
