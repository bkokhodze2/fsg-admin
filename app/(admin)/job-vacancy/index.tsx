"use client";
import { axiosWithAuth } from "@/configs/axios";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import React from "react";
import {
  Button,
  Form,
  Input,
  Card,
  Divider,
  notification,
  Radio,
  DatePicker,
  Select,
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

const modules = {
  toolbar: {
    container: [
      ["bold", "italic", "underline", "strike"], // Custom toolbar buttons
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      [{ color: [] }, { background: [] }], // Dropdown with color options
      ["link", "image", "video", "formula"],
      ["clean"], // Remove formatting button
    ],
  },
};

// const modules = {
//   toolbar: {
//     container: [
//       ["bold", "italic", "underline", "strike"], // Custom toolbar buttons
//       [{header: [1, 2, 3, 4, 5, 6, false]}],
//       [{list: "ordered"}, {list: "bullet"}],
//       [{indent: "-1"}, {indent: "+1"}],
//       [{align: []}],
//       [{color: []}, {background: []}], // Dropdown with color options
//       ["link", "image", "formula"],
//       ["clean"], // Remove formatting button
//     ],
//   },
// };

const BASEAPI = process.env.NEXT_PUBLIC_API_URL;

interface IFilter {
  pageNumber?: number;
  pageSize?: number;
  slug?: undefined | string;
  content?: undefined | string;
  departmentName?: undefined | string;
  description?: undefined | string;
}

const fetchJobVacancyDetailsById = async (id: number) => {
  try {
    const { data } = await axiosWithAuth.get(
      `/job-vacancy-editor/get-job-vacancy-details`,
      {
        params: {
          jobVacancyId: id,
        },
      }
    );

    return data;
  } catch (error: any) {
    console.log("errr", error);
    notification.open({
      type: "error",
      message: `job vacancy`,
      description: "Something went wrong while fetching job vacancy details",
    });
  }
};

const fetchDepartment = async () => {
  try {
    const { data } = await axiosWithAuth.get(
      `${BASEAPI}/department-editor/get-departments`
    );
    return data;
  } catch (error: any) {
    notification.open({
      type: "error",
      message: `department`,
      description: "Something went wrong while fetching department",
    });
  }
};

interface IProps {
  id?: number;
}

export default function AddEditJobVacancy({ id }: IProps) {
  const [form] = Form.useForm();
  const Router = useRouter();
  const Params = useParams();

  console.log("Params", Params);

  const isEditPage = !!id;
  const { data: dataLanguages } = useQuery<ILanguage[]>({
    queryKey: ["languages"],
    queryFn: fetchLanguages,
  });

  const { data: dataJobVacancyDetails, refetch } = useQuery({
    queryKey: ["jobVacancyDetails", id],
    queryFn: () => fetchJobVacancyDetailsById(id as number),
    enabled: !!id,
    retry: 1,
    initialData: undefined,
    // retryDelay: 3000,
    staleTime: 0,
  });

  const {
    data: dataDepartments,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["department"],
    queryFn: () => fetchDepartment(),
  });

  // console.log('dataDepartments', dataDepartments)

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
        date: dayjs(detail?.date, "DD-MM-YYYY HH:mm:ss").valueOf(),
      })),
    };
    console.log("modifiedValues", modifiedValues);

    try {
      const res = await axiosWithAuth.post(
        "/job-vacancy-editor/add-or-modify-job-vacancy",
        modifiedValues
      );
      if (res.status == 200) {
        notification.open({
          type: "success",
          message: `Job Vacancy was added`,
        });
        isEditPage ? await refetch() : null;
        Router.push("/job-vacancy");
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

  const getDefaultValue = () => {
    if (isEditPage) {
      console.log("dataJobVacancyDetails", dataJobVacancyDetails);
      const newData = {
        ...dataJobVacancyDetails,
        details: dataJobVacancyDetails?.details.map((detail: any) => ({
          ...detail,
          date: detail?.date ? dayjs.unix(detail.date / 1000) : null,
        })),
      };

      console.log("data", newData);

      return newData;
    } else {
      const activeLanguages = dataLanguages?.filter((e) => e.status === true);

      return {
        id: null,
        status: true,
        departmentId: dataDepartments?.[0]?.departmentId,
        details: activeLanguages?.map((e) => {
          return {
            id: null,
            jobVacancyId: null,
            languageId: e.id,
            jobTitle: null,
            location: null,
            shortDescription: null,
            fullDescription: null,
            descriptionText1: null,
            descriptionText2: null,
            // "client": null,
            // "role": null,
            // "date": null
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
          {id ? "Edit Job Vacancy" : "Add Job Vacancy"}
        </h2>
      </div>
      <Divider className={"my-3"} />
      {((isEditPage && dataJobVacancyDetails) ||
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
            name={"departmentId"}
            label="Department"
            className={"mt-2"}
          >
            <Select
              defaultValue="Select Department"
              // showSearch
              // optionFilterProp="children"
              // filterOption={(input, option) => (option?.label ?? '')?.includes(input)}
              // filterSort={(optionA, optionB) =>
              //   (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
              // }
            >
              {dataDepartments
                ?.filter((e: any) => e?.useInVacancy)
                ?.map((e: any) => {
                  return (
                    <Select.Option value={e.id} key={e.id}>
                      {e?.details?.[0]?.departmentName}
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
                          name={[field.name, "jobTitle"]}
                          label={"job title"}
                        >
                          <Input placeholder="job title" />
                        </Form.Item>

                        <Form.Item
                          name={[field.name, "location"]}
                          label={"location"}
                        >
                          <Input placeholder="location" />
                        </Form.Item>

                        <Form.Item
                          name={[field.name, "shortDescription"]}
                          label={"short description"}
                        >
                          <Input placeholder="short description" />
                        </Form.Item>

                        <Form.Item
                          name={[field.name, "fullDescription"]}
                          label={"full description"}
                        >
                          <Input placeholder="full description" />
                        </Form.Item>

                        {/* <Form.Item
                          name={[field.name, 'client']}
                          label={'client'}
                      >
                        <Input placeholder="client"/>
                      </Form.Item>

                      <Form.Item
                          name={[field.name, 'role']}
                          label={'role'}
                      >
                        <Input placeholder="role"/>
                      </Form.Item> */}
                        {/* 
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
                        name={[field.name, 'date']}
                        fieldKey={[field.key, 'date']}
                        label="date"
                      >
                      <DatePicker format={"DD-MM-YYYY HH:mm:ss"} showTime/>
                      </Form.Item> */}

                        <Form.Item
                          name={[field.name, "descriptionText1"]}
                          label={`Description Text 1`}
                          valuePropName="value"
                          getValueFromEvent={(value) => value}
                        >
                          <ReactQuillComponent
                            modules={modules}
                            className={`textEditor border markGeo`}
                          />
                        </Form.Item>

                        <Form.Item
                          name={[field.name, "descriptionText2"]}
                          label={`Description Text 2`}
                          valuePropName="value"
                          getValueFromEvent={(value) => value}
                        >
                          <ReactQuillComponent
                            modules={modules}
                            className={`textEditor border markGeo`}
                          />
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
