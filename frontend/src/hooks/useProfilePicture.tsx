import { PlusOutlined } from '@ant-design/icons';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import React, { useState } from 'react';

const useProfilePicture = (currentPicture: string, getPictureUrl: (pictureUrl: string) => void) => {
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

  return { imageUrl, uploadButton, handleUpload, onPreview };
};

export default useProfilePicture;
