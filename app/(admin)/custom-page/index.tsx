"use client";
import React from "react";
import { axiosWithAuth } from "@/configs/axios";
import { ArrowLeftOutlined } from "@ant-design/icons";
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
  Checkbox,
} from "antd";
import { SizeType } from "antd/lib/config-provider/SizeContext";
import { fetchLanguages } from "@/services/fetch/fetchLanguage";

const BASEAPI = process.env.NEXT_PUBLIC_API_URL;

const fetchCategories = async () => {
  try {
    const { data } = await axiosWithAuth.get(
      `${BASEAPI}/custom-page-editor/get-custom-page-categories`
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
const fetchCustomPageDetailsById = async (id: number) => {
  try {
    const { data } = await axiosWithAuth.get(
      `/custom-page-editor/get-custom-page-details`,
      {
        params: {
          customPageId: id,
        },
      }
    );

    return data;
  } catch (error: any) {
    console.log("errr", error);
    notification.open({
      type: "error",
      message: `customPage`,
      description: "Something went wrong while fetching custom page details",
    });
  }
};

interface IProps {
  id?: number;
}

export default function AddEditCustomPage({ id }: IProps) {
  const [form] = Form.useForm();
  const Router = useRouter();
  const Params = useParams();

  console.log("Params", Params);

  const isEditPage = !!id;
  const { data: dataLanguages } = useQuery<ILanguage[]>({
    queryKey: ["languages"],
    queryFn: fetchLanguages,
  });

  const { data: dataCategories } = useQuery<ICategories[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: dataCustomPageDetails, refetch } = useQuery({
    queryKey: ["customPageDetails", id],
    queryFn: () => fetchCustomPageDetailsById(id as number),
    enabled: !!id,
    retry: 1,
    initialData: undefined,
    // retryDelay: 3000,
    staleTime: 0,
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
      details: values.details.map((detail: any) => ({
        ...detail,
      })),
    };
    console.log("modifiedValues", modifiedValues);

    try {
      const res = await axiosWithAuth.post(
        "/custom-page-editor/add-or-modify-custom-page",
        modifiedValues
      );
      if (res.status == 200) {
        notification.open({
          type: "success",
          message: `Custom page was added`,
        });
        isEditPage ? await refetch() : null;
        Router.push("/custom-page");
      }
    } catch (e: any) {
      console.log("e");
      notification.open({
        type: "error",
        message: `${e.response.data.message || "error"}`,
      });
    }
  };

  const getDefaultValue = () => {
    if (isEditPage) {
      console.log("dataCustomPageDetails", dataCustomPageDetails);
      const newData = {
        ...dataCustomPageDetails,
        details: dataCustomPageDetails?.details.map((detail: any) => ({
          ...detail,
        })),
      };

      console.log("data", newData);

      return newData;
    } else {
      const activeLanguages = dataLanguages?.filter((e) => e.status === true);

      return {
        id: null,
        categoryIdList: [dataCategories?.[0]?.id],
        status: true,
        slug: null,
        details: activeLanguages?.map((e) => {
          return {
            id: null,
            customPageId: null,
            languageId: e.id,
            name: null,
            title: null,
            subTitle: null,
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
          {id ? "Edit Custom Page" : "Add Custom Page"}
        </h2>
      </div>
      <Divider className={"my-3"} />
      {((isEditPage && dataCustomPageDetails) ||
        (!isEditPage && dataLanguages)) && (
        <Form
          form={form}
          layout="vertical"
          onValuesChange={onchange}
          onFinish={onFinish}
          size={"default" as SizeType}
          initialValues={getDefaultValue()}
        >
          <Form.Item
            name={"categoryIdList"}
            label="category"
            className={"mt-2"}
          >
            <Select mode={"multiple"}>
              {dataCategories?.map((e) => {
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

          <Form.Item
            className={"mb-0"}
            name={"about"}
            valuePropName={"checked"}
          >
            <Checkbox>is about section</Checkbox>
          </Form.Item>

          <Form.Item
            className={"mb-0"}
            name={"services"}
            valuePropName={"checked"}
          >
            <Checkbox>is services section</Checkbox>
          </Form.Item>

          <Form.Item
            className={"mb-0"}
            name={"corporate"}
            valuePropName={"checked"}
          >
            <Checkbox>is corporate section</Checkbox>
          </Form.Item>

          <Form.Item name={"slug"} label={"slug"}>
            <Input placeholder="slug" />
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

                        <Form.Item name={[field.name, "name"]} label={"name"}>
                          <Input placeholder="name" />
                        </Form.Item>
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
