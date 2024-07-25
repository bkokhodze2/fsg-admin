'use client'
import {axiosWithAuth} from "@/configs/axios";
import {ArrowLeftOutlined} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import {useRouter} from "next/navigation";
import React from "react";
import {
  Button,
  Form,
  Input,
  Card, Divider, notification, Radio,
  Popconfirm,
} from 'antd';
import {SizeType} from "antd/lib/config-provider/SizeContext";

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

const fetchTenderDocumentDetailsById = async (id: number) => {
  try {
    const {data} = await axiosWithAuth.get(`/tender-editor/get-tender-document-details`, {
      params: {
        tenderDocumentId: id
      }
    });

    return data;

  } catch (error: any) {
    console.log("errr", error)
    notification.open({
      type: 'error',
      message: `tender documents`,
      description:
          'Something went wrong while fetching tender Document details',
    });
  }
}

interface IProps {
  id?: number
}

export default function AddEditTenderDoc({id}: IProps) {
  const [form] = Form.useForm();
  const Router = useRouter();

  const isEditPage = !!id;
  const {data: dataLanguages} = useQuery<ILanguage[]>({queryKey: ["languages"], queryFn: fetchLanguages});

  const {data: dataTenderDocumentDetails, refetch} = useQuery({
    queryKey: ['tenderDocumentDetails', id],
    queryFn: () => fetchTenderDocumentDetailsById(id as number),
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
      documentDetails: values.documentDetails.map((detail: any) => ({
        ...detail,
      }))
    };
    console.log("modifiedValues", modifiedValues)


    try {
      const res = await axiosWithAuth.post('/tender-editor/add-or-modify-tender-document', modifiedValues)
      if (res.status == 200) {
        notification.open({
          type: 'success',
          message: `Tender Document was added`,
        });
        isEditPage ? await refetch() : null;
        Router.push("/tenders")
      }
    } catch (e: any) {
      console.log("e",)
      notification.open({
        type: 'error',
        message: `${e.response.data.message || "error"}`,
      });
    }

  };

  const getDefaultValue = () => {
    if (isEditPage) {
      console.log("dataTenderDocumentDetails", dataTenderDocumentDetails)
      const newData = {
        ...dataTenderDocumentDetails,
        documentDetails: dataTenderDocumentDetails?.documentDetails.map((detail: any) => ({
          ...detail,
        })),
      };
      return newData;
    } else {
      const activeLanguages = dataLanguages?.filter(e => e.active === true)

      return {
        "id": null,
        "tenderId": null,
        "documentName": null,
        "documentUrl": null,
        "documentSize": null,
        "documentContentType": null,
        "documentOriginalName": null,
        "documentDetails":
            activeLanguages?.map(e => {
              return {
                "id": null,
                "tenderDocumentId": null,
                "languageId": e.id,
                "documentTitle": null,
                "formOfSupplying": null,
              }
            }),
      }
    }
  }

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
                <ArrowLeftOutlined/>
                Back
              </Button>
            </Popconfirm>

          <h2 className={"text-center text-[30px] w-full"}>{id ? "Edit Tender Document" : "Add Tender Document"}</h2>
        </div>
        <Divider className={"my-3"}/>
        {((isEditPage && dataTenderDocumentDetails) || (!isEditPage && dataLanguages)) && <Form
            form={form}
            layout="vertical"
            onValuesChange={onchange}
            onFinish={onFinish}
            size={'default' as SizeType}
            initialValues={getDefaultValue()}>

          <Form.Item
            name={'documentName'}
            label={'Document Name'}
          >
            <Input placeholder="Document Name"/>
          </Form.Item>

          <Form.Item
            name={'documentUrl'}
            label={'Document Url'}
          >
            <Input placeholder="Document Url"/>
          </Form.Item>

          <Form.Item
            name={'documentContentType'}
            label={'Document Content Type'}
          >
            <Input placeholder="Document Content Type"/>
          </Form.Item>

          <Form.Item
            name={'documentOriginalName'}
            label={'Document Original Name'}
          >
            <Input placeholder="Document Original Name"/>
          </Form.Item>

          <Form.List
              name="documentDetails">
            {(fields, v) => {
              return <div className={"flex flex-col gap-y-5"}>
                {
                  fields.map((field, index, c) => {

                    const languageId = form.getFieldValue(['documentDetails', field.name, 'languageId'])
                    const findLang = dataLanguages?.find((e) => e.id === languageId)?.language;

                    return <Card
                        key={fields[0].name + '' + index}
                        className={"border-[1px] rounded-2xl border-solid border-[#b2b2b2]"}>
                      <Divider orientation="left" className={"!my-0"}>
                        <h3 className={"text-[25px]"}>{findLang}</h3>
                      </Divider>

                      <Form.Item
                          name={[field.name, 'documentTitle']}
                          label={'Document Title'}
                      >
                        <Input placeholder="Document Title"/>
                      </Form.Item>

                      <Form.Item
                          name={[field.name, 'formOfSupplying']}
                          label={'Form Of Supplying'}
                      >
                        <Input placeholder="Form Of Supplying"/>
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
