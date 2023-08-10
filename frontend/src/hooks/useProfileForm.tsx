import { FormInstance } from 'antd';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { ProfileFormState } from '../components/profile-form/map';
import { useUserProvider } from '../context/User/User';
import { UserDto } from '../generated/api';
import api from '../utils/api';

const useProfileForm = (form: FormInstance<any>) => {
  const { user, updateUser } = useUserProvider();
  const [loading, setLoading] = useState<boolean>(false);
  const [isEmailExist, setIsEmailExist] = useState<boolean | null>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [usedEmail, setUsedEmail] = useState('');

  const defaultFormData: UserDto = {
    profilePictureUrl: user?.profilePictureUrl || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    city: user?.city || '',
    state: user?.state || '',
    country: user?.country || '',
  };

  const initialValues: ProfileFormState = {
    firstName: '',
    lastName: '',
    email: '',
    city: '',
    state: '',
    country: '',
    profilePictureUrl: '',
  };

  useEffect(() => {
    if (isEmailExist) {
      setUsedEmail(form.getFieldValue('email'));
      form.validateFields(['email']);
    }
  }, [isEmailExist, form, usedEmail]);

  const getPictureUrl = (pictureUrl: string) => {
    form.setFieldValue('profilePictureUrl', pictureUrl);
  };

  const resetState = () => {
    setIsEmailExist(null);
  };

  const handleFormSubmit = async () => {
    try {
      setLoading(true);
      await api.user.userCurrentPut({
        token: localStorage.getItem('token') || '',
        userDto: {
          profilePictureUrl: form.getFieldValue('profilePictureUrl'),
          firstName: form.getFieldValue('firstName'),
          lastName: form.getFieldValue('lastName'),
          email: form.getFieldValue('email'),
          city: form.getFieldValue('city'),
          state: form.getFieldValue('state'),
          country: form.getFieldValue('country'),
        },
      });
      updateUser(form.getFieldsValue());
      setIsEmailExist(false);
      setLoading(false);
      setIsDisabled(true);
      toast.success('Updated');
    } catch (error) {
      setIsDisabled(false);
      setIsEmailExist(true);
      setLoading(false);
      toast.error('Error');
      console.log(error);
    }
  };

  const isFormChanged = () => {
    const formValues = form.getFieldsValue();
    if (JSON.stringify(formValues) !== JSON.stringify(defaultFormData)) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  };

  return {
    defaultFormData,
    usedEmail,
    user,
    isEmailExist,
    getPictureUrl,
    resetState,
    handleFormSubmit,
    isFormChanged,
    loading,
    isDisabled,
    initialValues,
  };
};

export default useProfileForm;
