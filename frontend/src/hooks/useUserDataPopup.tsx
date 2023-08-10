import { RadioChangeEvent } from 'antd';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

import { UserDto } from '../generated/api';
import api from '../utils/api';
const useUserDataPopup = (dataUser: UserDto | undefined) => {
  const userRoleId = dataUser?.userRole?.id;

  const [roleId, setRoleId] = useState();
  const [isDisable, setIsDisable] = useState<boolean>(true);

  const handleRole = (e: RadioChangeEvent) => {
    if (dataUser?.userRole?.id === e.target.value) {
      setIsDisable(true);
    } else {
      setIsDisable(false);
    }
    setRoleId(e.target.value);
  };

  const handleSubmitChangesRole = async () => {
    try {
      api.user.roleUpdatePut({
        token: localStorage.getItem('token') || '',
        email: dataUser?.email,
        id: roleId,
      });
      toast.success('Updated');
    } catch (error) {
      console.log(error);
      toast.error('Error');
    }
  };

  return { userRoleId, roleId, isDisable, handleRole, handleSubmitChangesRole };
};

export default useUserDataPopup;
