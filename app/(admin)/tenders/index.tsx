"use client";
import { axiosWithAuth } from "@/configs/axios";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import React from "react";
import {
  Button,
  Form,
  Input,
  Card,
  Divider,
  notification,
  Radio,
  Checkbox,
  Popconfirm,
  InputNumber,
  DatePicker,
} from "antd";
import { SizeType } from "antd/lib/config-provider/SizeContext";
import { fetchLanguages } from "@/services/fetch/fetchLanguage";

const BASEAPI = process.env.NEXT_PUBLIC_API_URL;

var customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

const fetchTenderDetailsById = async (id: number) => {
  try {
    const { data } = await axiosWithAuth.get(
      `/tender-editor/get-tender-details`,
      {
        params: {
          tenderId: id,
        },
      }
    );

    return data;
  } catch (error: any) {
    console.log("errr", error);
    notification.open({
      type: "error",
      message: `tender`,
      description: "Something went wrong while fetching tender details",
    });
  }
};

interface IProps {
  id?: number;
}

export default function AddEditTender({ id }: IProps) {
  const [form] = Form.useForm();
  const Router = useRouter();

  const isEditPage = !!id;
  const { data: dataLanguages } = useQuery<ILanguage[]>({
    queryKey: ["languages"],
    queryFn: fetchLanguages,
  });

  const { data: dataTenderDetails, refetch } = useQuery({
    queryKey: ["tenderDetails", id],
    queryFn: () => fetchTenderDetailsById(id as number),
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
      useStartDateInMillis: dayjs(
        values?.useStartDateInMillis,
        "DD-MM-YYYY HH:mm:ss"
      ).valueOf(),
      useEndDateInMillis: dayjs(
        values?.useEndDateInMillis,
        "DD-MM-YYYY HH:mm:ss"
      ).valueOf(),
      details: values.details.map((detail: any) => ({
        ...detail,
      })),
    };
    console.log("modifiedValues", modifiedValues);

    try {
      const res = await axiosWithAuth.post(
        "/tender-editor/add-or-modify-tender",
        modifiedValues
      );
      if (res.status == 200) {
        notification.open({
          type: "success",
          message: `Tender was added`,
        });
        isEditPage ? await refetch() : null;
        Router.push("/tenders");
      }
    } catch (e: any) {
      console.log("e");
      notification.open({
        type: "error",
        message: `${e.response.data.message || "error"}`,
      });
    }
  };

  const status1 = Form.useWatch("servicePriceStatus1", form);
  const status2 = Form.useWatch("servicePriceStatus2", form);
  const status3 = Form.useWatch("servicePriceStatus3", form);
  const status4 = Form.useWatch("servicePriceStatus4", form);

  const getDefaultValue = () => {
    if (isEditPage) {
      console.log("dataTenderDetails", dataTenderDetails);
      const newData = {
        ...dataTenderDetails,
        useStartDateInMillis: dataTenderDetails?.useStartDateInMillis
          ? dayjs.unix(dataTenderDetails.useStartDateInMillis / 1000)
          : null,
        useEndDateInMillis: dataTenderDetails?.useEndDateInMillis
          ? dayjs.unix(dataTenderDetails.useEndDateInMillis / 1000)
          : null,
        details: dataTenderDetails?.details.map((detail: any) => ({
          ...detail,
        })),
      };
      return newData;
    } else {
      const activeLanguages = dataLanguages?.filter((e) => e.status === true);

      return {
        id: null,
        status: true,
        useStartDateInMillis: null,
        useEndDateInMillis: null,
        servicePriceStatus1: false,
        servicePriceStatus2: false,
        servicePriceStatus3: false,
        servicePriceStatus4: false,
        details: activeLanguages?.map((e) => {
          return {
            tenderId: null,
            languageId: e.id,
            title: null,
            subTitle: null,
            servicePriceTitle1: null,
            servicePriceTitle2: null,
            servicePriceTitle3: null,
            servicePriceTitle4: null,
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
          {id ? "Edit Tender" : "Add Tender"}
        </h2>
      </div>
      <Divider className={"my-3"} />
      {((isEditPage && dataTenderDetails) ||
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

          <div className={"flex gap-x-2 flex-nowrap py-[24px]"}>
            <Form.Item
              // initialValue={dayjs('YYYY-MM-DD HH:mm:ss')}
              // valuePropName={"aba"}
              // getValueFromEvent={(e: any) => {
              //   const date = dayjs(e, 'YYYY-MM-DD HH:mm:ss'); //date in miliseconds
              //   return date.valueOf();
              // }}
              // getValueProps={(e: string) => ({
              //   value: e ? dayjs(e) : "",
              // })}
              className={"mb-0"}
              name={"useStartDateInMillis"}
              label="useStartDate"
            >
              <DatePicker format={"DD-MM-YYYY HH:mm:ss"} showTime />
            </Form.Item>

            <Form.Item
              // getValueFromEvent={(e: any) => {
              //   const date = dayjs(e, 'YYYY-MM-DD HH:mm:ss'); //date in miliseconds
              //   return date.valueOf();
              // }}
              // getValueProps={(e: string) => ({
              //   value: e ? dayjs(e) : "",
              // })}
              className={"mb-0"}
              name={"useEndDateInMillis"}
              label="useEndDate"
            >
              <DatePicker format={"DD-MM-YYYY HH:mm:ss"} showTime />
            </Form.Item>
          </div>

          <Card
            key={1}
            className={"border-[1px] rounded-2xl border-solid border-[#b2b2b2]"}
          >
            <Divider orientation="left" className={"!my-0"}>
              <h3 className={"text-[25px]"}>Service Price 1</h3>
            </Divider>

            <Card
              className={
                "border-[1px] rounded-2xl border-solid border-[#b2b2b2] flex w-full card-item"
              }
            >
              <Form.Item
                className="flex-1"
                name={"servicePrice1"}
                label={"Price"}
              >
                <InputNumber
                  disabled={!status1}
                  placeholder="Enter a number"
                  className="w-full"
                />
              </Form.Item>
              <Form.Item
                className={
                  "!mb-0 !mt-[10px] flex items-center justify-center h-full"
                }
                name={"servicePriceStatus1"}
                valuePropName={"checked"}
              >
                <Checkbox>Is Active</Checkbox>
              </Form.Item>
            </Card>
          </Card>

          <Card
            key={2}
            className={
              "border-[1px] rounded-2xl border-solid border-[#b2b2b2] my-[24px]"
            }
          >
            <Divider orientation="left" className={"!my-0"}>
              <h3 className={"text-[25px]"}>Service Price 2</h3>
            </Divider>

            <Card
              className={
                "border-[1px] rounded-2xl border-solid border-[#b2b2b2] flex w-full card-item"
              }
            >
              <Form.Item
                className="flex-1"
                name={"servicePrice2"}
                label={"Price"}
              >
                <InputNumber
                  placeholder="Enter a number"
                  disabled={!status2}
                  className="w-full"
                />
              </Form.Item>
              <Form.Item
                className={
                  "!mb-0 !mt-[10px] flex items-center justify-center h-full"
                }
                name={"servicePriceStatus2"}
                valuePropName={"checked"}
              >
                <Checkbox>Is Active</Checkbox>
              </Form.Item>
            </Card>
          </Card>

          <Card
            key={3}
            className={"border-[1px] rounded-2xl border-solid border-[#b2b2b2]"}
          >
            <Divider orientation="left" className={"!my-0"}>
              <h3 className={"text-[25px]"}>Service Price 3</h3>
            </Divider>

            <Card
              className={
                "border-[1px] rounded-2xl border-solid border-[#b2b2b2] flex w-full card-item"
              }
            >
              <Form.Item
                className="flex-1"
                name={"servicePrice3"}
                label={"Price"}
              >
                <InputNumber
                  placeholder="Enter a number"
                  disabled={!status3}
                  className="w-full"
                />
              </Form.Item>
              <Form.Item
                className={
                  "!mb-0 !mt-[10px] flex items-center justify-center h-full"
                }
                name={"servicePriceStatus3"}
                valuePropName={"checked"}
              >
                <Checkbox>Is Active</Checkbox>
              </Form.Item>
            </Card>
          </Card>

          <Card
            key={4}
            className={
              "border-[1px] rounded-2xl border-solid border-[#b2b2b2] my-[24px]"
            }
          >
            <Divider orientation="left" className={"!my-0"}>
              <h3 className={"text-[25px]"}>Service Price 4</h3>
            </Divider>

            <Card
              className={
                "border-[1px] rounded-2xl border-solid border-[#b2b2b2] flex w-full card-item"
              }
            >
              <Form.Item
                className="flex-1"
                name={"servicePrice4"}
                label={"Price"}
              >
                <InputNumber
                  placeholder="Enter a number"
                  disabled={!status4}
                  className="w-full"
                />
              </Form.Item>
              <Form.Item
                className={
                  "!mb-0 !mt-[10px] flex items-center justify-center h-full"
                }
                name={"servicePriceStatus4"}
                valuePropName={"checked"}
              >
                <Checkbox>Is Active</Checkbox>
              </Form.Item>
            </Card>
          </Card>

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

                        <Form.Item name={[field.name, "title"]} label={"Title"}>
                          <Input placeholder="Title" />
                        </Form.Item>

                        <Form.Item
                          name={[field.name, "subTitle"]}
                          label={"Subtitle"}
                        >
                          <Input placeholder="SubTitle" />
                        </Form.Item>

                        <Form.Item
                          name={[field.name, "servicePriceTitle1"]}
                          label={"Service Price Title 1"}
                        >
                          <Input placeholder="Service Price Title 1" />
                        </Form.Item>

                        <Form.Item
                          name={[field.name, "servicePriceTitle2"]}
                          label={"Service Price Title 2"}
                        >
                          <Input placeholder="Service Price Title 2" />
                        </Form.Item>

                        <Form.Item
                          name={[field.name, "servicePriceTitle3"]}
                          label={"Service Price Title 3"}
                        >
                          <Input placeholder="Service Price Title 3" />
                        </Form.Item>

                        <Form.Item
                          name={[field.name, "servicePriceTitle4"]}
                          label={"Service Price Title 4"}
                        >
                          <Input placeholder="Service Price Title 4" />
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
