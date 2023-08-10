import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { RoleDtoNameEnum, UserDto } from '../../generated/api';
import api from '../../utils/api';
import { UserRolesIsFunction } from '../map';
import { Token, UserContextInterface } from './map';
const defaultValues: UserContextInterface = {
  roleGetter(): boolean {
    return false;
  },
  setToken(): void {},
  signOut(): void {},
  updateUser(): void {},
  user: undefined,
  userLoading: false,
};

export const UserContext = createContext<UserContextInterface>(defaultValues);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, saveUser] = useState<UserDto | undefined>();
  const [userLoading, setUserLoading] = useState(Boolean(localStorage.getItem('token')));

  const setToken = async (data: Token) => {
    const accessToken = data.token ? data.token : '';
    localStorage.setItem('token', accessToken);

    try {
      const currentUser = await api.user.userCurrentGet({
        token: localStorage.getItem('token') || '',
      });
      return saveUser(currentUser.data);
    } catch (e) {
      console.error(e);
    }
  };

  const updateUser = (form: UserDto) => {
    const newUser: UserDto = form;
    saveUser((prevState) => ({ ...prevState, ...newUser }));
  };

  const getRoles = (): UserRolesIsFunction => {
    return {
      [RoleDtoNameEnum.Admin]: user?.userRole?.name === RoleDtoNameEnum.Admin,
      [RoleDtoNameEnum.Superadmin]: user?.userRole?.name === RoleDtoNameEnum.Superadmin,
      [RoleDtoNameEnum.User]: user?.userRole?.name === RoleDtoNameEnum.User,
    };
  };

  useEffect(() => {
    const getStorageUser = async () => {
      try {
        const currentUser = await api.user.userCurrentGet({
          token: localStorage.getItem('token') || '',
        });
        return saveUser(currentUser.data);
      } catch (e) {
        return null;
      } finally {
        setUserLoading(false);
      }
    };

    if (localStorage.getItem('token')) {
      getStorageUser();
    } else {
      saveUser(undefined);
    }
  }, []);

  const roleGetter = (f: (v: UserRolesIsFunction) => boolean): boolean => {
    return f(getRoles());
  };

  const signOut = () => {
    localStorage.removeItem('token');
    saveUser(undefined);
  };

  return (
    <UserContext.Provider value={{ user, setToken, roleGetter, userLoading, signOut, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserProvider = (): UserContextInterface => useContext(UserContext);
