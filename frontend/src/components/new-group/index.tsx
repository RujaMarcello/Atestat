import { Button, Form, Input, Radio, Select, Space } from 'antd';
import React from 'react';

import useCreateGroup from '../../hooks/useCreateGroup';
import styles from './index.module.scss';

const NewGroupForm = () => {
  const [form] = Form.useForm();
  const { submitGroupForm } = useCreateGroup();
  const handleSelect = (value: string) => {
    form.setFieldValue('groupSubject', value);
  };

  return (
    <React.Fragment>
      <div className={styles.container}>
        <Form
          onFinishFailed={() => console.log('fail')}
          form={form}
          onFinish={() => submitGroupForm(form.getFieldsValue())}
        >
          <div className={styles.flexer}>
            <div>
              <Form.Item name="groupStatus">
                <Radio.Group>
                  <Space direction="vertical">
                    <h4 className={styles.titles}>Group Status</h4>
                    <div className={styles.flexer}>
                      <Radio value="private">
                        <strong>Private</strong>
                      </Radio>
                      <p>This group can only be joined or viewed by invite.</p>
                    </div>
                    <div className={styles.flexer}>
                      <Radio value="public">
                        <strong>Public</strong>
                      </Radio>
                      <p>Anyoune in the company can view and join this group</p>
                    </div>
                  </Space>
                </Radio.Group>
              </Form.Item>
              <Form.Item name="groupName">
                <Space direction="vertical">
                  <h4 className={styles.titles}>Group Name</h4>
                  <Input required placeholder="Group Name" size="middle" />
                </Space>
              </Form.Item>
              <Form.Item name="groupSubject">
                <Space direction="vertical">
                  <h4 className={styles.titles}>Subject (Group)</h4>
                  <Select
                    onChange={handleSelect}
                    options={[
                      { value: 'any', label: 'Any' },
                      { value: 'sport', label: 'Sport' },
                      { value: 'study', label: 'Study' },
                      { value: 'social', label: 'Social' },
                    ]}
                    defaultValue="any"
                  ></Select>
                </Space>
              </Form.Item>
            </div>
          </div>
          <Button htmlType="submit" size="large">
            Create
          </Button>
        </Form>
      </div>
    </React.Fragment>
  );
};

export default NewGroupForm;
