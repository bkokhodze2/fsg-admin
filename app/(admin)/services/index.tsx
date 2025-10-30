"use client";
import { axiosWithAuth } from "@/configs/axios";
import { ArrowLeftOutlined, InboxOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  Button,
  Image,
  Form,
  Input,
  Upload,
  Card,
  Divider,
  notification,
  Radio,
  Popconfirm,
} from "antd";
import { SizeType } from "antd/lib/config-provider/SizeContext";
import { fetchLanguages } from "@/services/fetch/fetchLanguage";
import { fetchServiceDetailsById } from "@/services/fetch/fetchServiceDetailsById";
import dynamic from "next/dynamic";
import { modules } from "@/components/ui/react-quill-module";
import type ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

var customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

const BASEAPI = process.env.NEXT_PUBLIC_API_URL;

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

interface IProps {
  id?: number;
}

export default function AddEditService({ id }: IProps) {
  const [form] = Form.useForm();
  const Router = useRouter();
  const isEditPage = !!id;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const { data: dataLanguages } = useQuery<ILanguage[]>({
    queryKey: ["languages"],
    queryFn: fetchLanguages,
  });

  const { data: dataServiceDetails, refetch } = useQuery({
    queryKey: ["serviceDetails", id],
    queryFn: () => fetchServiceDetailsById(id as number),
    enabled: !!id,
    retry: 1,
    initialData: undefined,
    staleTime: 0,
  });

  const uploadImage = async (options: any) => {
    const { onSuccess, onError, file, onProgress } = options;

    const formData = new FormData();
    const config = {
      headers: { "content-type": "multipart/form-data" },
    };
    formData.append("images", file);

    try {
      const res = await axiosWithAuth.post(`/upload-images`, formData, config);
      if (res.status == 201) {
        onSuccess(res.data);
      }
    } catch (e: any) {
      onError("failed");
    }
  };

  const onFinish = async (values: any) => {
    try {
      let res;
      if (isEditPage) {
        res = await axiosWithAuth.patch(`${BASEAPI}/services/${id}`, values);
      } else {
        res = await axiosWithAuth.post(`${BASEAPI}/services`, values);
      }
      if (res.status === 200 || res.status === 201) {
        notification.open({
          type: "success",
          message: `Service was ${isEditPage ? "updated" : "added"}`,
        });
        isEditPage ? await refetch() : null;
        Router.push("/services");
      }
    } catch (e: any) {
      notification.open({
        type: "error",
        message: `${e.response?.data?.message || "error"}`,
      });
    }
  };

  const handlePreview = async (file: any) => {
    setPreviewImage(file?.response?.url || file?.url);
    setPreviewOpen(true);
  };

  const getDefaultValue = () => {
    if (isEditPage) {
      if (!dataServiceDetails) return {};
      return dataServiceDetails;
    } else {
      return {
        active: true,
        translations:
          dataLanguages?.map((e) => ({
            languageId: e.id,
            title: null,
            subTitle: null,
            description: null,
            metaTitle: null,
            metaDescription: null,
          })) || [],
      };
    }
  };

  const defaultImageFileList: any = () => {
    const dataImg = form.getFieldValue("image");
    return dataImg
      ? [
          {
            ...dataImg,
            uid: dataImg.imageName ?? dataImg.url ?? "-1",
            name: dataImg.originalFileName ?? "image",
            status: "done",
            url: dataImg.url,
          },
        ]
      : [];
  };

  const defaultImagesFileList: any = () => {
    const dataImages = form.getFieldValue("images") || [];
    if (!dataServiceDetails || !Array.isArray(dataImages)) return [];
    return dataImages.map((e: any, idx: number) => ({
      ...e,
      uid: e.imageName ?? `${idx}`,
      name: e.originalFileName ?? `image-${idx}`,
      status: "done",
      url: e.url,
    }));
  };

  return (
    <div className={"p-2 pb-[60px]"}>
      <div className={"w-full flex justify-between items-center mb-4"}>
        <Popconfirm
          title="return back"
          description="Are you sure you want to go back? The current changes will be lost"
          okText={"Yes"}
          onConfirm={() => Router.back()}
        >
          <Button className={"flex items-center"} type="default">
            <ArrowLeftOutlined />
            Back
          </Button>
        </Popconfirm>

        <h2 className={"text-center text-[30px] w-full"}>
          {id ? "Edit Service" : "Add Service"}
        </h2>
      </div>
      <Divider className={"my-3"} />
      {((isEditPage && dataServiceDetails) ||
        (!isEditPage && dataLanguages)) && (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          size={"default" as SizeType}
          initialValues={getDefaultValue()}
        >
          <Form.Item name={"slug"} label="Slug">
            <Input placeholder="Slug" />
          </Form.Item>

          {/*<Form.Item name={"sort"} label="Sort Order">*/}
          {/*  <InputNumber placeholder="Sort Order" className="w-full"/>*/}
          {/*</Form.Item>*/}

          <Form.Item
            className={"mb-0"}
            name={"active"}
            label="Active"
            valuePropName={"value"}
          >
            <Radio.Group buttonStyle="solid">
              <Radio.Button value={true}>active</Radio.Button>
              <Radio.Button className={""} value={false}>
                disable
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label={"image"}
            name={"image"}
            valuePropName="value"
            getValueFromEvent={(e: any) => {
              if (e.file.status === "done") {
                return e.file.response?.images[0];
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
              defaultFileList={defaultImageFileList as any}
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
                Click or drag file to this area to upload main image
              </p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item
            label={"image"}
            name={"images"}
            valuePropName="value"
            getValueFromEvent={(e: any) => {
              return e.fileList.map((e: any) => {
                return e.response?.images[0] || e;
              });
            }}
            noStyle
          >
            <Upload.Dragger
              defaultFileList={defaultImagesFileList as any}
              listType={"picture-card"}
              showUploadList={true}
              maxCount={12}
              multiple={true}
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

          <Divider orientation="left" className={"!my-0 mt-6"}></Divider>
          <Form.List name="translations">
            {(fields) => (
              <div className="flex flex-col gap-y-5">
                {fields.map((field, index) => {
                  const languageId = form.getFieldValue([
                    "translations",
                    field.name,
                    "languageId",
                  ]);
                  const findLang = dataLanguages?.find(
                    (e) => e.id === languageId
                  )?.language;
                  return (
                    <Card
                      key={field.key}
                      className="border-[1px] rounded-2xl border-solid border-[#b2b2b2]"
                    >
                      <Divider orientation="left" className="!my-0">
                        <h3 className="text-[25px]">{findLang}</h3>
                      </Divider>
                      <Form.Item name={[field.name, "languageId"]} hidden>
                        <Input type="hidden" />
                      </Form.Item>
                      <Form.Item name={[field.name, "title"]} label={"Title"}>
                        <Input placeholder={`Title in ${findLang || ""}`} />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, "subTitle"]}
                        label={"Sub Title"}
                      >
                        <Input placeholder={`Sub Title in ${findLang || ""}`} />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, "description"]}
                        label={"Description"}
                        valuePropName="value"
                        getValueFromEvent={(value) => value}
                      >
                        <ReactQuillComponent
                          modules={modules}
                          className={`textEditor border markGeo`}
                        />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, "metaTitle"]}
                        label={"Meta Title"}
                      >
                        <Input
                          placeholder={`Meta Title in ${findLang || ""}`}
                        />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, "metaDescription"]}
                        label={"Meta Description"}
                      >
                        <Input
                          placeholder={`Meta Description in ${findLang || ""}`}
                        />
                      </Form.Item>
                    </Card>
                  );
                })}
              </div>
            )}
          </Form.List>
          <Button className={"mt-4"} type={"primary"} htmlType={"submit"}>
            Submit
          </Button>
        </Form>
      )}
    </div>
  );
}
