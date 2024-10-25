'use client'
import {axiosWithAuth} from "@/configs/axios";
import {ArrowLeftOutlined, InboxOutlined} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import {useRouter, useSearchParams} from "next/navigation";
import React, { useState } from "react";
import {
  Button,
  Form,
  Input,
  Card, Divider, notification,
  Popconfirm,
  Upload,
  Image
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

  const [previewImage, setPreviewImage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tenderId = searchParams.get('tenderId');

  console.log('editis ID::', id)
  console.log('damatebis ID:::', tenderId)

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
    console.log("onFinish VALUES", values)

    const modifiedValues = {
      // ...values,
      id: isEditPage ? id : undefined,
      tenderId: Number(tenderId) || dataTenderDocumentDetails.tenderId,
      documentDetails: values.documentDetails.map((detail: any) => ({
        ...detail,
        documentContentType: detail?.document?.contentType,
        documentName: detail?.document?.fileName,
        documentOriginalName: detail?.document?.originalFileName,
        documentUrl: detail?.document?.url,
        documentSize: detail?.document?.size,
      }))
    };
    console.log("modifiedValues", modifiedValues)

    try {
      const res = await axiosWithAuth.post(`/tender-editor/add-or-modify-tender-document`, modifiedValues)
      if (res.status == 200) {
        notification.open({
          type: 'success',
          message: `${isEditPage ? "Tender Was Edited" : "Tender Document was added"}`,
        });
        isEditPage ? await refetch() : null;
        router.push("/tenders")
      }
    } catch (e: any) {
      console.log("e",)
      notification.open({
        type: 'error',
        message: `${e.response.data.message || "error"}`,
      });
    }

  };

  const uploadFile = async (options: any) => {
    const {onSuccess, onError, file, onProgress} = options;

    const formData = new FormData();
    const config = {
      headers: {"content-type": "multipart/form-data"},
    };

    formData.append("documentFile", file);

    try {
      const res = await axiosWithAuth.post(`/tender-editor/upload-tender-document`, formData, config)
      if (res.status == 200) {
        onSuccess(res.data)
      }
    } catch (e: any) {
      onError("failed")
    }

  }

  const handlePreview = async (file: any) => {
    console.log("file", file, file?.response?.url || file?.url)
    setPreviewImage(file?.response?.url || file?.url);
    setPreviewOpen(true);
  };

  console.log('alex', dataTenderDocumentDetails)

  const getDefaultValue = () => {
    if (isEditPage) {
      const newData = {
        ...dataTenderDocumentDetails,
        documentDetails: dataTenderDocumentDetails?.documentDetails.map((detail: any) => ({
          ...detail,
          document: {
            "size": detail?.documentSize,
            "originalFileName": detail?.documentOriginalName,
            "fileName": detail?.documentName,
            "contentType": detail?.documentContentType,
            "url": detail?.documentUrl,
          },
        })),
      };
      return newData;
    } else {
      const activeLanguages = dataLanguages?.filter(e => e.active === true)

      return {
        "id": null,
        "tenderId": null,
        "document": {
          "size": null,
          "originalFileName": null,
          "fileName": null,
          "contentType": null,
          "url": null,
        },
        "documentDetails":
            activeLanguages?.map(e => {
              return {
                "id": null,
                "tenderDocumentId": null,
                "languageId": e.id,
                "documentTitle": null,
                "formOfSupplying": null,
                "documentName": null,
                "documentUrl": null,
                "documentSize": null,
                "documentContentType": null,
                "documentOriginalName": null,
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
              onConfirm={() => router.back()}
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

          <Form.List name="documentDetails">
            {(fields, v) => {
              return <div className={"flex flex-col gap-y-5"}>
                {
                  fields.map((field, index, c) => {

                    const languageId = form.getFieldValue(['documentDetails', field.name, 'languageId'])
                    const findLang = dataLanguages?.find((e) => e.id === languageId)?.language;
                    const dataFile = form.getFieldValue(['documentDetails', field.name, 'document']);
                    let fileList = dataFile?.url  ? 
                      [dataFile] 
                      : dataTenderDocumentDetails?.documentUrl ? 
                        [{
                        "size": dataTenderDocumentDetails?.documentSize,
                        "originalFileName": dataTenderDocumentDetails?.documentOriginalName,
                        "fileName": dataTenderDocumentDetails?.documentName,
                        "contentType": dataTenderDocumentDetails?.documentContentType,
                        "url": dataTenderDocumentDetails?.documentUrl,
                        }]
                      : [];

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

                      <Form.Item
                        label={'document'}
                        name={[field.name, 'document']}
                        valuePropName="value"
                        getValueFromEvent={(e: any) => {
                        console.log("eee", e)
                        if (e.file.status === 'done') {
                            return e.file.response

                        } else {
                            return {
                            "size": null,
                            "originalFileName": null,
                            "fileName": null,
                            "contentType": null,
                            "url": null
                            }
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
                            customRequest={(e) => uploadFile(e)}
                            onPreview={(e) => handlePreview(e)}
                        >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined/>
                        </p>

                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        </Upload.Dragger>
                    </Form.Item>
                        
                    {previewImage && (
                        <Image
                            wrapperStyle={{display: 'none'}}
                            preview={{
                                visible: previewOpen,
                                onVisibleChange: (visible) => setPreviewOpen(visible),
                                afterOpenChange: (visible) => !visible && setPreviewImage(''),
                            }}
                            src={previewImage}
                        />
                    )}
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
