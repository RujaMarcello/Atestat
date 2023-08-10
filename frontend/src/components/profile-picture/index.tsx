import { Upload } from 'antd';
import ImgCrop from 'antd-img-crop';
import React, { FC } from 'react';

import useProfilePicture from '../../hooks/useProfilePicture';
import styles from '../profile-picture/index.module.scss';
import { ProfilePictureProps } from './map';
const ProfilePicture: FC<ProfilePictureProps> = ({ currentPicture, getPictureUrl }) => {
  const { imageUrl, uploadButton, handleUpload, onPreview } = useProfilePicture(currentPicture, getPictureUrl);

  return (
    <>
      <ImgCrop rotate>
        <Upload
          name="avatar"
          customRequest={handleUpload}
          listType="picture-circle"
          onPreview={onPreview}
          className="avatar-uploader"
          showUploadList={false}
        >
          {imageUrl != '' ? <img className={styles.image} src={imageUrl} alt="avatar" /> : uploadButton}
        </Upload>
      </ImgCrop>
    </>
  );
};
export default ProfilePicture;
