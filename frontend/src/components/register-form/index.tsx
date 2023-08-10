import { Button, Form, Input } from 'antd';
import React, { FC } from 'react';
import { Link } from 'react-router-dom';

import useRegisterForm from '../../hooks/useRegisterForm';
import BackgroundLogin from '../background-login';
import styles from './index.module.scss';

const RegisterForm: FC = () => {
  const [form] = Form.useForm();
  const { initialValues, usedEmail, loading, isEmailExist, resetState, handleFormSubmit } = useRegisterForm(form);

  return (
    <BackgroundLogin>
      <div className={styles.formControlStyle}>
        <div>
          <h1 className={styles.loginText}>Register</h1>
        </div>
        <div className={styles.fildsStyle}>
          <Form
            name="basic"
            form={form}
            labelCol={{ span: 30 }}
            wrapperCol={{ span: 30 }}
            initialValues={initialValues}
            autoComplete="off"
            onFinish={handleFormSubmit}
            onFinishFailed={() => console.log('fail')}
          >
            <Form.Item
              hasFeedback
              name="firstName"
              rules={[{ required: true, message: 'Please input your first name!', whitespace: true }]}
            >
              <Input className={styles.inputStyles} placeholder="First Name" />
            </Form.Item>

            <Form.Item
              hasFeedback
              name="lastName"
              rules={[{ required: true, message: 'Please input your last name!', whitespace: true }]}
            >
              <Input className={styles.inputStyles} placeholder="Last Name" />
            </Form.Item>
            <Form.Item
              hasFeedback
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Plase input your email',
                },
                ({ getFieldValue }) => ({
                  validator: () => {
                    if (isEmailExist && getFieldValue('email') === usedEmail) {
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
            >
              <Input className={styles.inputStyles} placeholder="Email" />
            </Form.Item>

            <Form.Item hasFeedback name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
              <Input.Password className={styles.inputStyles} placeholder="Password" />
            </Form.Item>

            <Form.Item>
              <Button loading={loading} className={styles.buttonStyles} htmlType="submit">
                Submit
              </Button>
            </Form.Item>
            <Link to="/login">Already have an account? Please Login</Link>
          </Form>
        </div>
      </div>
    </BackgroundLogin>
  );
};

export default RegisterForm;
