import {axiosWithAuth} from "@/configs/axios";
import {InboxOutlined} from "@ant-design/icons";
import {Image, Upload} from "antd";
import React, {useState} from "react";
const BASEAPI = process.env.NEXT_PUBLIC_API_URL;

export default function UploadImage() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const uploadImage = async (options: any) => {
    const {onSuccess, onError, file, onProgress} = options;

    const formData = new FormData();
    const config = {
      headers: {"content-type": "multipart/form-data"},
    };
    formData.append("imageFile", file);

    try {
      const res = await axiosWithAuth.post(`${BASEAPI}/news-editor/upload-news-image`, formData, config)
      if (res.status == 200) {
        onSuccess(res.data)
      }
    } catch (e: any) {
      onError("failed")
    }
  }

  const handlePreview = async (file: any) => {
    console.log("file", file)
    setPreviewImage(file.response.url);
    setPreviewOpen(true);
  };

  return (
      <Upload.Dragger
          // fileList={[form.getFieldValue(['newsDetails', field.name, 'imageData'])]?.map((e) => {
          //   return {
          //     uid: '-1',
          //     name: 'image.png',
          //     status: 'done',
          //     url: e?.url,
          //   }
          // })}
          listType={"picture-card"}
          showUploadList={true}
          maxCount={1}
          multiple={false}
          customRequest={(e) => uploadImage(e)}
          onPreview={(e) => handlePreview(e)}
          onRemove={() => {
            // Clear the value of the imageData field
            // form.setFieldsValue({ [field.name]: undefined });
          }}
      >


        {previewImage && (
            <Image
                wrapperStyle={{display: 'none'}}
                preview={{
                  visible: previewOpen,
                  onVisibleChange: (visible) => setPreviewOpen(visible),
                  afterOpenChange: (visible) => !visible && setPreviewImage(''),
                }}
                src={previewImage}
            />
        )}

        <p className="ant-upload-drag-icon">
          <InboxOutlined/>
        </p>

        <p className="ant-upload-text">Click or drag file to this area to upload</p>
      </Upload.Dragger>
  );
}
