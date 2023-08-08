import { Button, Form, Input, Select } from 'antd';
import { FC } from 'react';

import useProfileForm from '../../hooks/useProfileForm';
import ProfilePicture from '../profile-picture';
import styles from './index.module.scss';

export type ProfileFormState = {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  state: string;
  country: string;
  profilePictureUrl: string;
};

const SettingsForm: FC = () => {
  const [form] = Form.useForm();
  const { Option } = Select;

  const {
    isFormChanged,
    handleFormSubmit,
    getPictureUrl,
    resetState,
    user,
    isEmailExist,
    usedEmail,
    isDisabled,
    loading,
    defaultFormData,
    initialValues,
  } = useProfileForm(form);

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
