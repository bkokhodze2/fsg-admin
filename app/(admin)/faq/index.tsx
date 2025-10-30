"use client";
import React from "react";
import { axiosWithAuth } from "@/configs/axios";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter, useParams } from "next/navigation";
import {
  Button,
  Form,
  Input,
  Card,
  Divider,
  notification,
  Radio,
  Popconfirm,
} from "antd";
import { SizeType } from "antd/lib/config-provider/SizeContext";
import { fetchLanguages } from "@/services/fetch/fetchLanguage";

var customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

const BASEAPI = process.env.NEXT_PUBLIC_API_URL;

const fetchFaqDetailsById = async (id: string) => {
  try {
    const { data } = await axiosWithAuth.get(`${BASEAPI}/questions/${id}`);
    return data;
  } catch (error: any) {
    console.log("errr", error);
    notification.open({
      type: "error",
      message: `faq`,
      description: "Something went wrong while fetching faq details",
    });
  }
};

interface IProps {
  id?: number;
}

export default function AddEditFaq({ id }: IProps) {
  const [form] = Form.useForm();
  const Router = useRouter();
  const Params = useParams();

  const isEditPage = !!id;
  const { data: dataLanguages } = useQuery<ILanguage[]>({
    queryKey: ["languages"],
    queryFn: fetchLanguages,
  });

  const { data: dataFaqDetails, refetch } = useQuery({
    queryKey: ["faqDetails", id],
    queryFn: () => fetchFaqDetailsById(id ? String(id) : ""),
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

    try {
      let res;
      if (isEditPage) {
        res = await axiosWithAuth.patch(`${BASEAPI}/questions/${id}`, values);
      } else {
        res = await axiosWithAuth.post(`${BASEAPI}/questions`, values);
      }
      if (res.status === 200 || res.status === 201) {
        notification.open({
          type: "success",
          message: `Faq was ${isEditPage ? "updated" : "added"}`,
        });
        isEditPage ? await refetch() : null;
        Router.push("/faq");
      }
    } catch (e: any) {
      notification.open({
        type: "error",
        message: `${e.response?.data?.message || "error"}`,
      });
    }
  };

  const getDefaultValue = () => {
    if (isEditPage) {
      if (!dataFaqDetails) return {};
      return dataFaqDetails;
    } else {
      const activeLanguages = dataLanguages?.filter((e) => e.status === true);
      return {
        id: null,
        active: true,
        translations: activeLanguages?.map((e) => {
          return {
            question: null,
            answer: null,
            languageId: e.id,
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
          // icon={<QuestionCircleOutlined style={{color: 'red'}}/>}
        >
          <Button className={"flex items-center"} type="default">
            <ArrowLeftOutlined />
            Back
          </Button>
        </Popconfirm>

        <h2 className={"text-center text-[30px] w-full"}>
          {id ? "Edit Faq" : "Add Faq"}
        </h2>
      </div>
      <Divider className={"my-3"} />
      {((isEditPage && dataFaqDetails) || (!isEditPage && dataLanguages)) && (
        <Form
          form={form}
          layout="vertical"
          onValuesChange={onchange}
          onFinish={onFinish}
          size={"default" as SizeType}
          initialValues={getDefaultValue()}
        >
          <Form.Item
            className={"mb-0"}
            name={"active"}
            label="active"
            valuePropName={"value"}
          >
            <Radio.Group buttonStyle="solid">
              <Radio.Button value={true}>active</Radio.Button>
              <Radio.Button className={""} value={false}>
                disable
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.List name="translations">
            {(fields, v) => {
              return (
                <div className={"flex flex-col gap-y-5"}>
                  {fields.map((field, index, c) => {
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
                        key={fields[0].name + "" + index}
                        className={
                          "border-[1px] rounded-2xl border-solid border-[#b2b2b2]"
                        }
                      >
                        <Divider orientation="left" className={"!my-0"}>
                          <h3 className={"text-[25px]"}>{findLang}</h3>
                        </Divider>
                        <Form.Item
                          name={[field.name, "question"]}
                          label={"question"}
                        >
                          <Input placeholder="question" />
                        </Form.Item>

                        <Form.Item
                          name={[field.name, "answer"]}
                          label={"answer"}
                        >
                          <Input placeholder="answer" />
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
