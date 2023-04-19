import { Button, Form, Input } from 'antd';
import { FC, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import BackgroundLogin from '../background-login';
import styles from './index.module.scss';

export type FormState = {
  email: string;
  password: string;
};

const initialValues: FormState = {
  email: '',
  password: '',
};

interface LoginFormProps {
  loading?: boolean;
  onSubmit?: (formState: FormState) => void;
  isSuccessfully: boolean | null;
  resetState: any;
}

const LoginForm: FC<LoginFormProps> = ({ resetState, isSuccessfully, loading, onSubmit }) => {
  const [form] = Form.useForm();
  const [usedValues, setUsedValues] = useState({
    email: '',
    password: '',
  });
  useEffect(() => {
    if (isSuccessfully == false) {
      setUsedValues({
        email: form.getFieldValue(['email']),
        password: form.getFieldValue(['password']),
      });

      form.validateFields(['submit']);
    } else if (isSuccessfully == true) {
      form.resetFields();
    }
  }, [isSuccessfully, form, setUsedValues, onSubmit]);
  return (
    <BackgroundLogin>
      <div className={styles.formControlStyle}>
        <h1 className={styles.loginText}>Login</h1>
        <div className={styles.fildsStyle}>
          <Form
            name="basic"
            form={form}
            labelCol={{ span: 30 }}
            wrapperCol={{ span: 30 }}
            initialValues={initialValues}
            autoComplete="off"
            onFinish={onSubmit}
            onFinishFailed={() => console.log('fail')}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Bad email form' },
              ]}
            >
              <Input className={styles.inputStyles} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  message: 'Plase input your password',
                  required: true,
                },
                {
                  validateTrigger: 'onSubmit',
                },
              ]}
            >
              <Input.Password className={styles.inputStyles} placeholder="Password" />
            </Form.Item>

            <Form.Item
              dependencies={['email', 'password']}
              name="submit"
              rules={[
                ({ getFieldValue }) => ({
                  validator: () => {
                    if (
                      isSuccessfully == false &&
                      getFieldValue('password') === usedValues.password &&
                      getFieldValue('email') === usedValues.email
                    ) {
                      resetState();
                      return Promise.reject(new Error('Wrong email or password'));
                    }

                    return Promise.resolve(true);
                  },
                }),
              ]}
            >
              <Button loading={loading} className={styles.buttonStyles} htmlType="submit">
                Submit
              </Button>
            </Form.Item>
            <Link to="/register">Do not have an account? Please Register</Link>
          </Form>
        </div>
      </div>
    </BackgroundLogin>
  );
};

export default LoginForm;
