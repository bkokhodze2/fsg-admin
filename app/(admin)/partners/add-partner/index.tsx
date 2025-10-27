"use client";
import { axiosWithAuth } from "@/configs/axios";
import { ArrowLeftOutlined, InboxOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  Button,
  Image,
  Form,
  Input,
  Upload,
  Divider,
  notification,
  Popconfirm,
} from "antd";
import { SizeType } from "antd/lib/config-provider/SizeContext";
import type ReactQuill from "react-quill";

var customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

const ReactQuillComponent = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    // eslint-disable-next-line react/display-name
    return ({ ...props }) => <RQ {...props} />;
  },
  {
    ssr: false,
  }
) as typeof ReactQuill;
import "react-quill/dist/quill.snow.css";
import { fetchLanguages } from "@/services/fetch/fetchLanguage";

// const modules = {
//   toolbar: {
//     container: [
//       ["bold", "italic", "underline", "strike"], // Custom toolbar buttons
//       [{header: [1, 2, 3, 4, 5, 6, false]}],
//       [{list: "ordered"}, {list: "bullet"}],
//       [{indent: "-1"}, {indent: "+1"}],
//       [{align: []}],
//       [{color: []}, {background: []}], // Dropdown with color options
//       ["link", "image", "video", "formula"],
//       ["clean"], // Remove formatting button
//     ],
//   },
// };

const BASEAPI = process.env.NEXT_PUBLIC_API_URL;

const fetchPartnerDetailsById = async (id: number) => {
  try {
    const { data } = await axiosWithAuth.get(
      `/partner-editor/get-partner-item-detail`,
      {
        params: {
          partnerItemId: id,
        },
      }
    );

    return data;
  } catch (error: any) {
    console.log("errr", error);
    notification.open({
      type: "error",
      message: `partner`,
      description: "Something went wrong while fetching partner card details",
    });
  }
};

interface IProps {
  id?: number;
  parentId?: number;
}

export default function AddEditPartner({ id, parentId }: IProps) {
  const [form] = Form.useForm();
  const Router = useRouter();

  const isEditPage = !!id;

  // console.log('params id,::', id)
  // console.log('params parentId,:', parentId)

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const { data: dataLanguages } = useQuery<ILanguage[]>({
    queryKey: ["languages"],
    queryFn: fetchLanguages,
  });
  // console.log('dataLanguages', dataLanguages)

  const { data: dataPartnerDetails } = useQuery({
    queryKey: ["partnerDetails", id],
    queryFn: () => fetchPartnerDetailsById(id as number),
    enabled: !!id,
  });

  const onchange = (values: any) => {
    console.log("values", values);
  };
  const onFinish = async (values: any) => {
    console.log("vv", values);

    // Modify the form data here before submitting

    // console.log("values", values?.partnerDetails)
    const modifiedValues = {
      ...values,
      partnerId: 1,
      id: Number(id),
    };
    console.log("modifiedValues", modifiedValues);
    console.log("dataPartnerDetails", dataPartnerDetails);

    try {
      const res = await axiosWithAuth.post(
        "/partner-editor/add-or-modify-partner-item",
        modifiedValues
      );
      if (res.status == 200) {
        notification.open({
          type: "success",
          message: `partner card was added`,
        });
        Router.push(`/partners/edit/${1}`);
      }
    } catch (e: any) {
      console.log("e");
      notification.open({
        type: "error",
        message: `${e.response.data.message || "error"}`,
      });
    }

    // Log the FormData object or submit it to the server
    // You can also submit the formData to the server here
  };

  const uploadImage = async (options: any) => {
    const { onSuccess, onError, file, onProgress } = options;

    const formData = new FormData();
    const config = {
      headers: { "content-type": "multipart/form-data" },
    };
    formData.append("imageFile", file);

    try {
      const res = await axiosWithAuth.post(
        `/partner-editor/upload-partner-item-image`,
        formData,
        config
      );
      if (res.status == 200) {
        onSuccess(res.data);
      }
    } catch (e: any) {
      onError("failed");
    }
  };

  const handlePreview = async (file: any) => {
    console.log("file", file, file?.response?.url || file?.url);
    setPreviewImage(file?.response?.url || file?.url);
    setPreviewOpen(true);
  };

  const getDefaultValue = () => {
    if (isEditPage) {
      const newData = {
        ...dataPartnerDetails,
        partnerDetails: dataPartnerDetails?.partnerDetails?.map(
          (detail: any) => ({
            ...detail,
          })
        ),
      };

      console.log("data", newData);

      return newData;
    } else {
      return {
        id: 0,
        partnerId: id,
        imageData: {
          size: null,
          originalFileName: null,
          imageName: null,
          contentType: null,
          url: null,
        },
        status: true,
        title: null,
        subTitle: null,
      };
    }
  };

  const dataImg = form.getFieldValue("imageData");
  let fileList = dataImg?.url
    ? [dataImg]
    : dataPartnerDetails?.imageData
    ? [dataPartnerDetails.imageData]
    : [];

  return (
    <div className={"p-2 pb-[60px]"}>
      <div className={"w-full flex justify-between items-center mb-4"}>
        <Popconfirm
          title="return back"
          description="Are you sure you want to go back? The current changes will be lost"
          okText={"Yes"}
          onConfirm={() => Router.back()}
          // icon={<QuestionCircleOutlined style={{color: 'red'}}/>}
        >
          <Button className={"flex items-center"} type="default">
            <ArrowLeftOutlined />
            Back
          </Button>
        </Popconfirm>

        <h2 className={"text-center text-[30px] w-full"}>
          {id ? "Edit Partner" : "Add Partner"}
        </h2>
      </div>
      <Divider className={"my-3"} />
      {((isEditPage && dataPartnerDetails) ||
        (!isEditPage && dataLanguages)) && (
        <Form
          form={form}
          layout="vertical"
          onValuesChange={onchange}
          onFinish={onFinish}
          size={"default" as SizeType}
          initialValues={getDefaultValue()}
        >
          <Form.Item name={"partnerUrl"} label={"partnerUrl"}>
            <Input placeholder="partnerUrl" />
          </Form.Item>

          <Form.Item
            label={"image"}
            name={"imageData"}
            valuePropName="value"
            getValueFromEvent={(e: any) => {
              console.log("eee", e);
              if (e.file.status === "done") {
                return e.file.response;
              } else {
                return {
                  size: null,
                  originalFileName: null,
                  imageName: null,
                  contentType: null,
                  url: null,
                };
              }
            }}
            noStyle
          >
            <Upload.Dragger
              // fileList={getFileList()}
              defaultFileList={fileList}
              //     uid: '-1',
              // name: 'image.png',
              // status: 'done',
              // url: data?.url,
              listType={"picture-card"}
              showUploadList={true}
              maxCount={1}
              multiple={false}
              customRequest={(e) => uploadImage(e)}
              onPreview={(e) => handlePreview(e)}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>

              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
            </Upload.Dragger>
          </Form.Item>

          {previewImage && (
            <Image
              wrapperStyle={{ display: "none" }}
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
                afterOpenChange: (visible) => !visible && setPreviewImage(""),
              }}
              src={previewImage}
            />
          )}

          <Button className={"mt-4"} type={"primary"} htmlType={"submit"}>
            Submit
          </Button>
        </Form>
      )}
    </div>
  );
}
