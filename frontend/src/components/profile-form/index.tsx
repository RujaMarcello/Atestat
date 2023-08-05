import { Button, Form, Input, Select } from 'antd';
import { FC, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { useUserProvider } from '../../context/User/User';
import { UserDto } from '../../generated/api';
import api from '../../utils/api';
import ProfilePicture from '../profile-picture';
import styles from './index.module.scss';
import { ProfileFormState } from './map';

const initialValues: ProfileFormState = {
  firstName: '',
  lastName: '',
  email: '',
  city: '',
  state: '',
  country: '',
  profilePictureUrl: '',
};

const { Option } = Select;

const SettingsForm: FC = () => {
  const { user, updateUser } = useUserProvider();
  const [loading, setLoading] = useState<boolean>(false);
  const [isEmailExist, setIsEmailExist] = useState<boolean | null>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [usedEmail, setUsedEmail] = useState('');
  const [form] = Form.useForm();

  const defaultFormData: UserDto = {
    profilePictureUrl: user?.profilePictureUrl || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    city: user?.city || '',
    state: user?.state || '',
    country: user?.country || '',
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

  return (
    <>
      <div className={styles.container}>
        <Form
          form={form}
          onChange={isFormChanged}
          className={styles.customForm}
          onFinish={handleFormSubmit}
          onFinishFailed={() => console.log('fail')}
          initialValues={{ ...initialValues, ...defaultFormData }}
          layout="vertical"
        >
          <Form.Item name="profilePictureUrl">
            <div className={styles.photo}>
              <ProfilePicture getPictureUrl={getPictureUrl} currentPicture={defaultFormData.profilePictureUrl} />
              <h1>
                <strong>{user?.userRole?.name}</strong>
              </h1>
            </div>
          </Form.Item>
          <Form.Item
            rules={[{ whitespace: true, required: true, message: 'Plase input your first name' }]}
            label={<strong>First Name</strong>}
            name="firstName"
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item
            rules={[{ whitespace: true, required: true, message: 'Plase input your last name' }]}
            label={<strong>Last Name</strong>}
            name="lastName"
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item
            hasFeedback
            rules={[
              {
                required: true,
                message: 'Plase input your email',
                whitespace: true,
              },

              ({ getFieldValue }) => ({
                validator: () => {
                  if (isEmailExist && getFieldValue('email') == usedEmail) {
                    resetState();
                    return Promise.reject(new Error('Email alredy exist'));
                  } else {
                    return Promise.resolve(true);
                  }
                },
              }),
              {
                type: 'email',
                message: 'Bad email form',
              },
            ]}
            label={<strong>Email</strong>}
            name="email"
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item label={<strong>City</strong>} name="city">
            <Input size="large" />
          </Form.Item>
          <Input.Group compact>
            <Form.Item className={styles.select} label={<strong>State</strong>} name="state">
              <Select onChange={isFormChanged} size="large">
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
            <Form.Item className={styles.countryInput} label={<strong>Country</strong>} name="country">
              <Input size="large" />
            </Form.Item>
          </Input.Group>
          <Form.Item>
            <div className={styles.buttons}>
              <Button className={styles.backButton}>
                <strong>Back To Home</strong>
              </Button>
              <Button
                disabled={isDisabled}
                loading={loading}
                htmlType="submit"
                className={styles.saveButton}
                type="primary"
              >
                <strong>Save Changes</strong>
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default SettingsForm;
