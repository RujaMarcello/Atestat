import { PlusOutlined } from '@ant-design/icons';
import { Upload } from 'antd';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import ImgCrop from 'antd-img-crop';
import React, { FC, useState } from 'react';

import styles from '../profile-picture/index.module.scss';
import { ProfilePictureProps } from './map';
const ProfilePicture: FC<ProfilePictureProps> = ({ currentPicture, getPictureUrl }) => {
  const [imageUrl, setImageUrl] = useState<string>(currentPicture);

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const handleUpload = async ({ file }: any) => {
    const formData = new FormData();
    formData.append('image', file);

    const clientId = process.env.REACT_APP_IMGUR_API_KEY;
    try {
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${clientId}`,
        },
        body: formData,
      });
      const data = await response.json();
      setImageUrl(data.data.link);
      getPictureUrl(data.data.link);
    } catch (error) {
      console.log(error);
    }
  };

  const onPreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as RcFile);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

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
