'use client'
import {axiosWithAuth} from "@/configs/axios";
import {ArrowLeftOutlined} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import {useRouter, useParams} from "next/navigation";
import React, {useState} from "react";
import {
  Button,
  Form,
  Input,
  Card, Divider, notification, Radio,
  Checkbox
} from 'antd';
import {SizeType} from "antd/lib/config-provider/SizeContext";
import type ReactQuill from 'react-quill';

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

const ReactQuillComponent = dynamic(
    async () => {
      const {default: RQ} = await import('react-quill');
      // eslint-disable-next-line react/display-name
      return ({...props}) => <RQ {...props} />;
    },
    {
      ssr: false,
    }
) as typeof ReactQuill;
import "react-quill/dist/quill.snow.css";

const modules = {
  toolbar: {
    container: [
      ["bold", "italic", "underline", "strike"], // Custom toolbar buttons
      [{header: [1, 2, 3, 4, 5, 6, false]}],
      [{list: "ordered"}, {list: "bullet"}],
      [{indent: "-1"}, {indent: "+1"}],
      [{align: []}],
      [{color: []}, {background: []}], // Dropdown with color options
      ["link", "image", "formula"],
      ["clean"], // Remove formatting button
    ],
  },
};

const BASEAPI = process.env.NEXT_PUBLIC_API_URL;
const fetchLanguages = async () => {
  try {
    const {data} = await axiosWithAuth.get(`${BASEAPI}/news-editor/get-languages`);
    return data;
  } catch (error: any) {
    console.log("errr", error)
    notification.open({
      type: 'error',
      message: `languages`,
      description:
          'Something went wrong while fetching languages',
    });
  }
}

const fetchDepartmentDetailsById = async (id: number) => {
  try {
    const {data} = await axiosWithAuth.get(`/department-editor/get-department-details`, {
      params: {
        departmentId: id
      }
    });

    return data;

  } catch (error: any) {
    console.log("errr", error)
    notification.open({
      type: 'error',
      message: `department`,
      description:
          'Something went wrong while fetching department details',
    });
  }
}

interface IProps {
  id?: number
}

export default function AddEditDepartment({id}: IProps) {
  const [form] = Form.useForm();
  const Router = useRouter();
  const Params = useParams();

  console.log("Params", Params)

  const isEditPage = !!id;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const {data: dataLanguages} = useQuery<ILanguage[]>({queryKey: ["languages"], queryFn: fetchLanguages});

  const {data: dataDepartmentDetails, refetch} = useQuery({
    queryKey: ['departmentDetails', id],
    queryFn: () => fetchDepartmentDetailsById(id as number),
    enabled: !!id,
    retry: 1,
    initialData: undefined,
    // retryDelay: 3000,
    staleTime: 0,
  });


  const onchange = (values: any, allValues: any) => {
    console.log("values", values)
    console.log("allValues", allValues)
  }
  const onFinish = async (values: any) => {
    console.log("vv", values)

    // Modify the form data here before submitting
    const modifiedValues = {
      ...values,
      id: isEditPage ? id : undefined,
      details: values.details.map((detail: any) => ({
        ...detail,
      }))
    };
    console.log("modifiedValues", modifiedValues)


    try {
      const res = await axiosWithAuth.post('/department-editor/add-or-modify-department', modifiedValues)
      if (res.status == 200) {
        notification.open({
          type: 'success',
          message: `Department was added`,
        });
      isEditPage ? await refetch() : null;
        Router.push("/department")
      }
    } catch (e: any) {
      console.log("e",)
      notification.open({
        type: 'error',
        message: `${e.response.data.message || "error"}`,
      });
    }

    // Log the FormData object or submit it to the server
    // You can also submit the formData to the server here
  };

  const getDefaultValue = () => {
    if (isEditPage) {
      console.log("dataDepartmentDetails", dataDepartmentDetails)
      const newData = {
        ...dataDepartmentDetails,
        details: dataDepartmentDetails?.details.map((detail: any) => ({
          ...detail,
        }))
      };

      console.log("data", newData)

      return newData;
    } else {
      const activeLanguages = dataLanguages?.filter(e => e.active === true)

      return {
        "id": null,
        "status": true,
        "departmentMail": null,
        "useInContactUs": false,
        "useInGetInTouch": false,
        "useInVacancy": false,
        "details":
            activeLanguages?.map(e => {
              return {
                "description": null,
                "departmentName": null,
                "languageId": e.id,
                "detailId": null,
                "departmentId": null,
              }
            }),
      }
    }
  }

  return (
      <div className={"p-2 pb-[60px]"}>
        <div className={"w-full flex justify-between items-center mb-4"}>
          <Button className={"flex items-center"} type="default" onClick={() => Router.back()}>
            <ArrowLeftOutlined/>back</Button>

          <h2 className={"text-center text-[30px] w-full"}>{id ? "Edit Department" : "Add Department"}</h2>
        </div>
        <Divider className={"my-3"}/>
        {((isEditPage && dataDepartmentDetails) || (!isEditPage && dataLanguages)) && <Form
            form={form}
            layout="vertical"
            onValuesChange={onchange}
            onFinish={onFinish}
            size={'default' as SizeType}
            initialValues={getDefaultValue()}>

          <Form.Item className={"mb-0"} name={'status'} label="status"
                     valuePropName={"value"}>
            <Radio.Group buttonStyle="solid">
              <Radio.Button value={true}>active</Radio.Button>
              <Radio.Button className={""} value={false}>disable</Radio.Button>
            </Radio.Group>
          </Form.Item>

        <Form.Item
            className={"mb-0"}
            name={"useInContactUs"}
            // label="Use In Contact Us"
            valuePropName={"checked"}
        >
            <Checkbox>Use In Contact Us</Checkbox>
        </Form.Item>

        <Form.Item
        className={"mb-0"}
        name={"useInGetInTouch"}
        // label="use In Get In Touch"
        valuePropName={"checked"}
        >
            <Checkbox>Use In Get In Touch</Checkbox>
        </Form.Item>

        <Form.Item
            className={"mb-0"}
            name={"useInVacancy"}
            // label="Use In Vacancy"
            valuePropName={"checked"}
        >
            <Checkbox>Use In Vacancy</Checkbox>
        </Form.Item>

          <Form.Item
            name={'departmentMail'}
            label={'Department Mail'}
            rules={[{type:"email"}]}
          >
            <Input placeholder="department mail" />
          </Form.Item>

          <Form.List
              name="details">
            {(fields, v) => {
              return <div className={"flex flex-col gap-y-5"}>
                {
                  fields.map((field, index, c) => {
                    const languageId = form.getFieldValue(['details', field.name, 'languageId'])
                    const findLang = dataLanguages?.find((e) => e.id === languageId)?.language;
                    return <Card
                        key={fields[0].name + '' + index}
                        className={"border-[1px] rounded-2xl border-solid border-[#b2b2b2]"}>
                      <Divider orientation="left" className={"!my-0"}>
                        <h3 className={"text-[25px]"}>{findLang}</h3>
                      </Divider>
                      <Form.Item
                          name={[field.name, 'departmentName']}
                          label={'department name'}
                      >
                        <Input placeholder="department name"/>
                      </Form.Item>
                      
                      <Form.Item
                          name={[field.name, 'description']}
                          label={'description'}
                      >
                        <Input placeholder="description"/>
                      </Form.Item>
                    </Card>
                  })}
              </div>
            }}
          </Form.List>

          <Button className={"mt-4"} type={"primary"} htmlType={"submit"}>Submit</Button>
        </Form>
        }
      </div>
  );
}
