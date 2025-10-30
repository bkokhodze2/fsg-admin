"use client";
import { axiosWithAuth } from "@/configs/axios";
import { ArrowLeftOutlined, InboxOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter, useParams } from "next/navigation";
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
  InputNumber,
  Popconfirm,
} from "antd";
import { SizeType } from "antd/lib/config-provider/SizeContext";

var customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

import { fetchLanguages } from "@/services/fetch/fetchLanguage";
import { fetchServiceDetailsById } from "@/services/fetch/fetchServiceDetailsById";

const BASEAPI = process.env.NEXT_PUBLIC_API_URL;

interface IProps {
  id?: number;
}

export default function AddEditServiceCenter({ id }: IProps) {
  const [form] = Form.useForm();
  const Router = useRouter();
  const isEditPage = !!id;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [imagesFileList, setImagesFileList] = useState<any[]>([]);

  const { data: dataLanguages } = useQuery<ILanguage[]>({
    queryKey: ["languages"],
    queryFn: fetchLanguages,
  });

  const { data: dataServiceDetails, refetch } = useQuery({
    queryKey: ["serviceCenterDetails", id],
    queryFn: () => fetchServiceDetailsById(id as number),
    enabled: !!id,
    retry: 1,
    initialData: undefined,
    staleTime: 0,
  });

  const onchange = (values: any, allValues: any) => {
    console.log("values", values);
    console.log("allValues", allValues);
  };

  // State for file lists for main and additional images
  const [fileMainList, setFileMainList] = useState<any[]>([]);
  const [fileImagesList, setFileImagesList] = useState<any[]>([]);

  const uploadImage = async (options: any) => {
    const { onSuccess, onError, file } = options;
    const formData = new FormData();
    const config = {
      headers: { "content-type": "multipart/form-data" },
    };
    formData.append("images", file);

    try {
      const res = await axiosWithAuth.post(
        `/news-editor/upload-news-image`,
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

  // Helper to prepare translations and submit final payload
  const submitServicePayload = async (values: any, images: any[]) => {
    const translations = (values.details || []).map((detail: any) => ({
      languageId: detail.languageId,
      title: detail.title,
      subTitle: detail.subTitle,
      description: detail.description,
      metaTitle: detail.metaTitle,
      metaDescription: detail.metaDescription,
    }));

    const payload = {
      active: values.status,
      categoryId: values.categoryIdList?.[0] || 0,
      images,
      translations,
    };

    try {
      let res;
      if (isEditPage) {
        res = await axiosWithAuth.patch(`${BASEAPI}/services/${id}`, payload);
      } else {
        res = await axiosWithAuth.post(`${BASEAPI}/services`, payload);
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

  const onFinish = async (values: any) => {
    console.log("Final Values:", values);

    // 1. Upload all images first if there are new files
    let images = [];
    if (imagesFileList.length > 0) {
      try {
        const formData = new FormData();
        imagesFileList.forEach((file: any) => {
          formData.append("images", file.originFileObj || file);
        });
        formData.append("imagesCount", imagesFileList.length.toString());
        const config = {
          headers: { "content-type": "multipart/form-data" },
        };
        await axiosWithAuth
          .post(`/upload-images`, formData, config)
          .then((res) => {
            console.log("res upload images-------", res);
            images = (res.data?.images || []).map((img: any, idx: number) => ({
              _id: img._id,
              url: img.url,
              filename: img.filename,
              size: img.size,
              contentType: img.contentType,
              storage: img.storage,
              localUrl: img.localUrl,
              bucket: img.bucket,
              path: img.path,
              publicUrl: img.publicUrl,
              cloudinaryPublicId: img.cloudinaryPublicId,
            }));
            images && submitServicePayload(values, images);
          });
      } catch (e: any) {
        console.log("erooorr");
      }
    }
  };

  const handlePreview = async (file: any) => {
    setPreviewImage(file?.response?.url || file?.url);
    setPreviewOpen(true);
  };

  const getDefaultValue = () => {
    if (isEditPage) {
      if (!dataServiceDetails) return {};
      return {
        active: dataServiceDetails.active,
        categoryIdList: [dataServiceDetails.categoryId],
        slug: dataServiceDetails.slug,
        sortOrder: dataServiceDetails.sort,
        imageData: dataServiceDetails.image || {},
        images: dataServiceDetails.images || [],
        details:
          dataServiceDetails.translations?.map((t: any) => ({
            languageId: t.languageId,
            title: t.title,
            subTitle: t.subTitle,
            description: t.description,
            metaTitle: t.metaTitle,
            metaDescription: t.metaDescription,
          })) || [],
      };
    } else {
      const activeLanguages = dataLanguages?.filter((e) => e.status === true);
      return {
        active: true,
        categoryIdList: [1],
        slug: "",
        sortOrder: null,
        imageData: {},
        images: [],
        details:
          activeLanguages?.map((e) => ({
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

  const dataImg = form.getFieldValue("imageData");
  let fileList = dataImg?.url
    ? [dataImg]
    : dataServiceDetails
    ? [dataServiceDetails?.imageData]
    : [];

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
          onValuesChange={onchange}
          onFinish={onFinish}
          size={"default" as SizeType}
          initialValues={getDefaultValue()}
        >
          <Form.Item name={"slug"} label="Slug">
            <Input placeholder="Slug" />
          </Form.Item>

          <Form.Item name={"sortOrder"} label="Sort Order">
            <InputNumber placeholder="Sort Order" className="w-full" />
          </Form.Item>

          <Form.Item
            className={"mb-0"}
            name={"status"}
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
            label={"Images"}
            name={"images"}
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) return e;
              return (
                e &&
                e.fileList &&
                e.fileList.map((file: any) => {
                  if (file.response) {
                    return {
                      ...file.response,
                      uid: file.uid,
                      name: file.name || file.response.filename,
                      status: "done",
                      url: file.response.url,
                    };
                  }
                  return file;
                })
              );
            }}
          >
            <Upload.Dragger
              listType="picture-card"
              showUploadList={true}
              multiple={true}
              beforeUpload={() => false}
              fileList={imagesFileList}
              onChange={({ fileList }) => setImagesFileList(fileList)}
              onPreview={handlePreview}
              accept="image/*"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file(s) to upload service images
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
          <Form.List name="details">
            {(fields) => (
              <div className="flex flex-col gap-y-5">
                {fields.map((field, index) => {
                  const languageId = form.getFieldValue([
                    "details",
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
                      {/* Hidden field to keep languageId in form values */}
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
                      >
                        <Input
                          placeholder={`Description in ${findLang || ""}`}
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
                      <Form.Item
                        label={"image"}
                        name={[field.name, "imageData"]}
                        valuePropName="value"
                        getValueFromEvent={(e: any) => {
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
                          fileList={fileMainList}
                          onChange={({ fileList }) => setFileMainList(fileList)}
                          listType={"picture-card"}
                          showUploadList={true}
                          maxCount={1}
                          multiple={false}
                          customRequest={uploadImage}
                          onPreview={handlePreview}
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
                        name={[field.name, "additionalImages"]}
                        valuePropName="value"
                        getValueFromEvent={(e: any) => {
                          return e.fileList.map((f: any) => f.response || f);
                        }}
                        noStyle
                      >
                        <Upload.Dragger
                          defaultFileList={fileImagesList}
                          listType={"picture-card"}
                          showUploadList={true}
                          maxCount={12}
                          multiple={true}
                          customRequest={uploadImage}
                          onPreview={handlePreview}
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
                            onVisibleChange: (visible) =>
                              setPreviewOpen(visible),
                            afterOpenChange: (visible) =>
                              !visible && setPreviewImage(""),
                          }}
                          src={previewImage}
                        />
                      )}
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
