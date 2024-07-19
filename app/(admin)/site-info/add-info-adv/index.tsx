'use client'
import {axiosWithAuth} from "@/configs/axios";
import {ArrowLeftOutlined, InboxOutlined} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import {useRouter} from "next/navigation";
import React, {useState} from "react";
import {
  Button, Image,
  Form,
  Input,
  Upload,
  Divider,
  notification,
  Popconfirm,
  Select,
  Radio,
  Card,
} from 'antd';
import {SizeType} from "antd/lib/config-provider/SizeContext";
import type ReactQuill from 'react-quill';

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

const ReactQuillComponent = dynamic(
    async () => {
      const {default: RQ} = await import('react-quill');
      const Component = ({...props}) => <RQ {...props} />;
      Component.displayName = 'ReactQuillComponent';
      return Component;
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
      ["link", "image", "video", "formula"],
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

const fetchCategories = async () => {
  try {
    const {data} = await axiosWithAuth.get(`${BASEAPI}/site-info-editor/get-site-info-adv-categories`);
    return data;
  } catch (error: any) {
    console.log("errr", error)
    notification.open({
      type: 'error',
      message: `categories`,
      description:
          'Something went wrong while fetching categories',
    });
  }
}

const fetchInfoAdvDetailsById = async (id: number) => {
  try {
    const {data} = await axiosWithAuth.get(`/site-info-editor/get-site-info-adv-detail`, {
      params: {
        siteInfoAdvId: id
      }
    });

    return data;

  } catch (error: any) {
    console.log("errr", error)
    notification.open({
      type: 'error',
      message: `site info adv`,
      description:
          'Something went wrong while fetching site info card details',
    });
  }
}

interface IProps {
  id?: number
  parentId?: number
}

export default function AddEditInfoAdv({id}: IProps) {
  const [form] = Form.useForm();
  const Router = useRouter();

  const isEditPage = !!id;

  // console.log('params id,::', id)

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const {data: dataLanguages} = useQuery<ILanguage[]>({queryKey: ["languages"], queryFn: fetchLanguages});
  const {data: dataCategories} = useQuery<ICategories[]>({queryKey: ["categories"], queryFn: fetchCategories});
  
  const {data: dataInfoAdvDetails} = useQuery({
    queryKey: ['infoAdvDetails', id],
    queryFn: () => fetchInfoAdvDetailsById(id as number),
    enabled: !!id
  });

  const onchange = (values: any) => {
    console.log("values", values)
  }
  const onFinish = async (values: any) => {
    console.log("vv", values)

    // Modify the form data here before submitting

    const modifiedValues = {
      ...values,
      id: Number(id),
    };
    console.log("modifiedValues", modifiedValues)
    console.log("dataInfoAdvDetails", dataInfoAdvDetails)

    try {
      const res = await axiosWithAuth.post('/site-info-editor/add-or-modify-site-info-adv', modifiedValues)
      if (res.status == 200) {
        notification.open({
          type: 'success',
          message: `info adv card was added`,
        });
        Router.push(`/site-info/edit/${1}`)
      }
    } catch (e: any) {
      console.log("e",)
      notification.open({
        type: 'error',
        message: `${e.response.data.message || "error"}`,
      });
    }
  };

  const uploadImage = async (options: any) => {
    const {onSuccess, onError, file, onProgress} = options;

    const formData = new FormData();
    const config = {
      headers: {"content-type": "multipart/form-data"},
    };
    formData.append("imageFile", file);

    try {
      const res = await axiosWithAuth.post(`/site-info-editor/upload-site-info-adv-file`, formData, config)
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


  const getDefaultValue = () => {
    if (isEditPage) {
      const newData = {
        ...dataInfoAdvDetails,
        details: dataInfoAdvDetails?.details?.map((detail: any) => ({
          ...detail,
        }))
      };

      console.log("data", newData)

      return newData;
    } else {

    const activeLanguages = dataLanguages?.filter(e => e.active === true)

      return {
        "id": 0,
        "status": true,
        "categoryId": dataCategories?.[0]?.id,
        "document": {
          "size": null,
          "originalFileName": null,
          "fileName": null,
          "contentType": null,
          "url": null
        },
        "details":
        activeLanguages?.map(e => {
          console.log('event', e)
          return {
            "id": null,
            "siteInfoAdvId": null,
            "languageId": e.id,
            "description": null,
            "description2": null,
            }
        }),
      }
    }
  }

  const dataFile = form.getFieldValue('document');
  let fileList = dataFile?.url ? [dataFile] : dataInfoAdvDetails?.document ? [dataInfoAdvDetails.document] :  [];

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
                <ArrowLeftOutlined/>
                Back
              </Button>
            </Popconfirm>

            <h2 className={"text-center text-[30px] w-full"}>{id ? "Edit Site Info Adv" : "Add Site Info Adv"}</h2>
            </div>
            <Divider className={"my-3"}/>
            {((isEditPage && dataInfoAdvDetails) || (!isEditPage && dataLanguages)) && <Form
                form={form}
                layout="vertical"
                onValuesChange={onchange}
                onFinish={onFinish}
                size={'default' as SizeType}
                initialValues={getDefaultValue()}>

              <Form.Item name={"categoryId"} label="category" className={"mt-2"}>
                <Select>
                  {dataCategories?.map((e) => {
                    return <Select.Option value={e.id} key={e.id}>{e.category}</Select.Option>
                  })}
                </Select>
              </Form.Item>

              <Form.Item className={"mb-0"} name={'status'} label="status" valuePropName={"value"}>
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value={true}>active</Radio.Button>
                  <Radio.Button className={""} value={false}>disable</Radio.Button>
                </Radio.Group>
              </Form.Item>
                  
              <Form.Item
                  label={'document'}
                  name={'document'}
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
                      customRequest={(e) => uploadImage(e)}
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

              
            <Form.List
              name="details"
            >
              {(fields, v) => {
                return <div className={"flex flex-col gap-y-5"}>
                  {
                    fields.map((field, index, c) => {
                      const languageId = form.getFieldValue(['details', field.name, 'languageId'])
                      const findLang = dataLanguages?.find((e) => e.id === languageId)?.language;

                      return (
                          <Card
                              key={fields[0].name + '' + index}
                              className={"border-[1px] rounded-2xl border-solid border-[#b2b2b2]"}
                          >
                            <Divider orientation="left" className={"!my-0"}>
                              <h3 className={"text-[25px]"}>{findLang}</h3>
                            </Divider>



                            <Form.Item
                              name={[field.name, 'description']}
                              label={`Description`}
                              valuePropName="value"
                              getValueFromEvent={(value) => value}>
                                <ReactQuillComponent
                                    modules={modules}
                                    className={`textEditor border markGeo`}
                                />
                            </Form.Item>

                            <Form.Item
                                name={[field.name, 'description2']}
                                label={'Description 2'}
                            >
                              <Input placeholder="Description 2"/>
                            </Form.Item>
                          </Card>
                      )
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