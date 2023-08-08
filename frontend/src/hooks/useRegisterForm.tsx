import { FormInstance } from 'antd';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';

import { FormState } from '../components/register-form';
import api from '../utils/api';

const initialValues: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
};

const useRegisterForm = (form: FormInstance<any>) => {
  const [usedEmail, setUsedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEmailExist, setIsEmailExist] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEmailExist) {
      setUsedEmail(form.getFieldValue(['email']));
      form.validateFields(['email']);
    } else if (isEmailExist == false) {
      form.resetFields();
      navigate('/login');
    }
  }, [isEmailExist, form, setUsedEmail, navigate]);

  const resetState = () => {
    setIsEmailExist(null);
  };

  const handleFormSubmit = async () => {
    try {
      setLoading(true);
      await api.auth.registerPost({
        registerRequest: {
          firstName: form.getFieldValue('firstName'),
          lastName: form.getFieldValue('lastName'),
          email: form.getFieldValue('email'),
          password: form.getFieldValue('password'),
        },
      });
      setLoading(false);
      setIsEmailExist(false);
      toast.success('Succesfuly');
    } catch (error) {
      setLoading(false);
      setIsEmailExist(true);
    }
  };
  return { initialValues, usedEmail, loading, isEmailExist, resetState, handleFormSubmit };
};

export default useRegisterForm;
