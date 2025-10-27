"use client";
import React, { useState } from "react";
import { axiosWithAuth } from "@/configs/axios";
import { ArrowLeftOutlined, InboxOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import {
  Button,
  Form,
  Input,
  Select,
  Card,
  Divider,
  notification,
  Radio,
  Popconfirm,
  Upload,
  Image,
} from "antd";
import { SizeType } from "antd/lib/config-provider/SizeContext";
import { fetchLanguages } from "@/services/fetch/fetchLanguage";

const BASEAPI = process.env.NEXT_PUBLIC_API_URL;

interface IFilter {
  pageNumber?: number;
  pageSize?: number;
  slug?: undefined | string;
  content?: undefined | string;
  title?: undefined | string;
  subTitle?: undefined | string;
}

const fetchCategories = async () => {
  try {
    const { data } = await axiosWithAuth.get(
      `${BASEAPI}/seo-editor/get-seo-categories`
    );
    return data;
  } catch (error: any) {
    console.log("errr", error);
    notification.open({
      type: "error",
      message: `categories`,
      description: "Something went wrong while fetching categories",
    });
  }
};
const fetchSeoPageDetailsById = async (id: number) => {
  try {
    const { data } = await axiosWithAuth.get(`/seo-editor/get-seo-detail`, {
      params: {
        seoId: id,
      },
    });

    return data;
  } catch (error: any) {
    console.log("errr", error);
    notification.open({
      type: "error",
      message: `seoPage`,
      description: "Something went wrong while fetching seo details",
    });
  }
};

const fetchSeoPage = async (filter: IFilter) => {
  try {
    const { data } = await axiosWithAuth.get(
      `${BASEAPI}/seo-editor/get-seo-list`
    );
    return data;
  } catch (error: any) {
    notification.open({
      type: "error",
      message: `seo page`,
      description: "Something went wrong while fetching seo data",
    });
  }
};

interface IProps {
  id?: number;
}

export default function AddEditSeoPage({ id }: IProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [filter, setFilter] = useState<IFilter>({});
  const [form] = Form.useForm();
  const Router = useRouter();
  const Params = useParams();

  // console.log("Params", Params)

  const isEditPage = !!id;
  const { data: dataLanguages } = useQuery<ILanguage[]>({
    queryKey: ["languages"],
    queryFn: fetchLanguages,
  });

  const { data: dataCategories } = useQuery<ICategories[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: dataSeoPageDetails, refetch } = useQuery({
    queryKey: ["seoPageDetails", id],
    queryFn: () => fetchSeoPageDetailsById(id as number),
    enabled: !!id,
    retry: 1,
    initialData: undefined,
    // retryDelay: 3000,
    staleTime: 0,
  });

  console.log("kakuna", dataSeoPageDetails?.categoryId);

  const {
    data: seoDataList,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["seoPage", filter],
    queryFn: () => fetchSeoPage(filter),
  });

  const alreadyChosenCategoriesIdsArray = seoDataList?.map(
    (item: any) => item.categoryId
  );

  const filteredCategories = dataCategories?.filter((item) => {
    const filteredEditPageCategories = alreadyChosenCategoriesIdsArray?.filter(
      (item: number) => item !== dataSeoPageDetails?.categoryId
    );
    return isEditPage
      ? !filteredEditPageCategories?.includes(item.id)
      : !alreadyChosenCategoriesIdsArray?.includes(item.id);
  });

  const onchange = (values: any, allValues: any) => {
    console.log("values", values);
    console.log("allValues", allValues);
  };
  const onFinish = async (values: any) => {
    console.log("vv", values);

    // Modify the form data here before submitting
    const modifiedValues = {
      ...values,
      id: isEditPage ? id : undefined,
      details: values.details.map((detail: any) => {
        // console.log('values.detail:::', detail)
        return {
          id: detail?.id,
          languageId: detail?.languageId,
          seoId: detail?.seoId,
          title: detail?.title,
          subTitle: detail?.subTitle,
          imageDTO: detail?.imageData
            ? { ...detail.imageData }
            : { ...detail?.imageDTO },
        };
      }),
    };
    // console.log("modifiedValues", modifiedValues)

    try {
      const res = await axiosWithAuth.post(
        "/seo-editor/add-or-modify-seo",
        modifiedValues
      );
      if (res.status == 200) {
        notification.open({
          type: "success",
          message: `Seo page was added`,
        });
        isEditPage ? await refetch() : null;
        Router.push("/seo");
      }
    } catch (e: any) {
      console.log("e");
      notification.open({
        type: "error",
        message: `${e.response.data.message || "error"}`,
      });
    }
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
        `/seo-editor/upload-seo-image`,
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
        ...dataSeoPageDetails,
        details: dataSeoPageDetails.details.map((detail: any) => ({
          ...detail,
          imageData: detail?.imageDTO,
        })),
      };

      return newData;
    } else {
      const activeLanguages = dataLanguages?.filter((e) => e.status === true);

      return {
        id: null,
        categoryId: filteredCategories?.[0].id,
        status: true,
        details: activeLanguages?.map((e) => {
          return {
            id: null,
            seoId: null,
            languageId: e.id,
            title: null,
            subTitle: null,
            imageDTO: {
              size: null,
              originalFileName: null,
              imageName: null,
              contentType: null,
              url: null,
            },
          };
        }),
      };
    }
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
          {id ? "Edit SEO" : "Add SEO"}
        </h2>
      </div>
      <Divider className={"my-3"} />
      {((isEditPage && dataSeoPageDetails) ||
        (!isEditPage && dataLanguages)) && (
        <Form
          form={form}
          layout="vertical"
          onValuesChange={onchange}
          onFinish={onFinish}
          size={"default" as SizeType}
          initialValues={getDefaultValue()}
        >
          <Form.Item name={"categoryId"} label="category" className={"mt-2"}>
            <Select>
              {filteredCategories?.map((e) => {
                return (
                  <Select.Option value={e.id} key={e.id}>
                    {e.category}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item
            className={"mb-0"}
            name={"status"}
            label="status"
            valuePropName={"value"}
          >
            <Radio.Group buttonStyle="solid">
              <Radio.Button value={true}>active</Radio.Button>
              <Radio.Button className={""} value={false}>
                disable
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.List name="details">
            {(fields, v) => {
              return (
                <div className={"flex flex-col gap-y-5"}>
                  {fields.map((field, index, c) => {
                    const languageId = form.getFieldValue([
                      "details",
                      field.name,
                      "languageId",
                    ]);
                    const findLang = dataLanguages?.find(
                      (e) => e.id === languageId
                    )?.language;

                    const dataImg = form?.getFieldValue([
                      "details",
                      field.name,
                      "imageData",
                    ]);

                    let fileList = dataImg?.url
                      ? [dataImg]
                      : dataSeoPageDetails?.details?.[0]?.imageData
                      ? [dataSeoPageDetails?.details?.[0]?.imageData]
                      : [];

                    // let fileList = dataImg?.url ? [dataImg] : [];

                    return (
                      <Card
                        key={fields[0].name + "" + index}
                        className={
                          "border-[1px] rounded-2xl border-solid border-[#b2b2b2]"
                        }
                      >
                        <Divider orientation="left" className={"!my-0"}>
                          <h3 className={"text-[25px]"}>{findLang}</h3>
                        </Divider>
                        <Form.Item name={[field.name, "title"]} label={"title"}>
                          <Input placeholder="title" />
                        </Form.Item>

                        <Form.Item
                          name={[field.name, "subTitle"]}
                          label={"subTitle"}
                        >
                          <Input placeholder="subTitle" />
                        </Form.Item>

                        <Form.Item
                          label={"image"}
                          name={[field.name, "imageData"]}
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
                              Click or drag file to this area to upload main
                              image
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
              );
            }}
          </Form.List>

          <Button className={"mt-4"} type={"primary"} htmlType={"submit"}>
            Submit
          </Button>
        </Form>
      )}
    </div>
  );
}
