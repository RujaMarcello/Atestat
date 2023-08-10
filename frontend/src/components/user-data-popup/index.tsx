import { Image, Modal, Radio, Skeleton, Space, Tag } from 'antd';
import { FC } from 'react';

import useUserDataPopup from '../../hooks/useUserDataPopup';
import styles from '../user-data-popup/index.module.scss';
import { UserDataPopupProps } from './map';
const UserDataPopup: FC<UserDataPopupProps> = ({ open, onOk, onCancel, dataUser, isLoading }) => {
  const { userRoleId, isDisable, handleRole, handleSubmitChangesRole } = useUserDataPopup(dataUser);

  return (
    <Modal
      open={open}
      okButtonProps={{ onClick: handleSubmitChangesRole, disabled: isDisable }}
      onOk={onOk}
      onCancel={onCancel}
    >
      <div className={styles.headContainer}>
        <div>
          <h1>{isLoading ? <Skeleton.Input active /> : dataUser?.firstName + ' ' + dataUser?.lastName}</h1>
          <div>
            <strong>{isLoading ? '' : dataUser?.email}</strong>
            <br />
            <strong className={styles.values}>
              {isLoading ? <Skeleton.Input size="small" active /> : dataUser?.country + ',' + dataUser?.city}
            </strong>
          </div>
        </div>
        <div className={styles.imageContainer}>
          {isLoading ? (
            <Skeleton.Avatar active size={100} />
          ) : (
            <Image
              sizes="small"
              className={styles.imageStyle}
              src={
                dataUser?.profilePictureUrl ||
                'https://t4.ftcdn.net/jpg/03/32/59/65/360_F_332596535_lAdLhf6KzbW6PWXBWeIFTovTii1drkbT.jpg'
              }
            ></Image>
          )}
        </div>
      </div>
      <div className={styles.spacer}>
        <hr />
      </div>
      <div className={styles.bodyContainer}>
        <div>
          <strong>
            {isLoading ? <Skeleton.Input active size="small" /> : 'First Name'}
            <br />
          </strong>
          <strong className={styles.values}>
            {isLoading ? '' : dataUser?.firstName} <br />
          </strong>
          <br />
          <strong>
            {isLoading ? <Skeleton.Input active size="small" /> : 'Last Name'}
            <br />
          </strong>
          <strong className={styles.values}>
            {isLoading ? '' : dataUser?.lastName} <br />
          </strong>
          <br />
          <strong>
            {isLoading ? <Skeleton.Input active size="small" /> : 'Country'}
            <br />
          </strong>
          <strong className={styles.values}>
            {isLoading ? '' : dataUser?.country} <br />
          </strong>
          <br />
          <strong>
            {isLoading ? <Skeleton.Input active size="small" /> : 'City'}
            <br />
          </strong>
          <strong className={styles.values}>
            {isLoading ? '' : dataUser?.city} <br />
          </strong>
        </div>
        <div className={styles.secoundColumn}>
          <strong>{isLoading ? <Skeleton.Input active size="small" /> : 'Role'}</strong>
          <br />
          <div>
            {isLoading ? (
              ''
            ) : (
              <Radio.Group defaultValue={userRoleId} onChange={handleRole}>
                <Space defaultChecked={true} direction="vertical">
                  <Radio value="1">
                    <Tag color="purple">SUPERADMIN</Tag>
                  </Radio>
                  <Radio value="2">
                    <Tag color="red">ADMIN</Tag>
                  </Radio>
                  <Radio value="3">
                    <Tag color="green">USER</Tag>
                  </Radio>
                </Space>
              </Radio.Group>
            )}
          </div>
          <br />
          <strong>
            {isLoading ? <Skeleton.Input active size="small" /> : 'Activity'}
            <br />
          </strong>
        </div>
      </div>
    </Modal>
  );
};

export default UserDataPopup;
