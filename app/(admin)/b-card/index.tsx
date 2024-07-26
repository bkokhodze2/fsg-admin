'use client'
import {axiosWithAuth} from "@/configs/axios";
import {ArrowLeftOutlined, InboxOutlined,} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import {useRouter, useParams} from "next/navigation";
import React, {useState} from "react";
import {
  Button, Image,
  Form,
  Input,
  Upload,
  Select, Card, Divider, notification, Radio,
  Popconfirm,
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
const fetchCategories = async () => {
  try {
    const {data} = await axiosWithAuth.get(`${BASEAPI}/iv-component-editor/get-iv-component-categories`);
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
const fetchBCardDetailsById = async (id: number) => {
  try {
    const {data} = await axiosWithAuth.get(`/iv-component-editor/get-get-iv-component-detail`, {
      params: {
        ivComponentId: id
      }
    });

    return data;

  } catch (error: any) {
    console.log("errr", error)
    notification.open({
      type: 'error',
      message: `BCard`,
      description:
          'Something went wrong while fetching B card details',
    });
  }
}

interface IProps {
  id?: number
}

export default function AddEditBCard({id}: IProps) {
  const [form] = Form.useForm();
  const Router = useRouter();
  const Params = useParams();

  console.log("Params", Params)

  const isEditPage = !!id;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const {data: dataLanguages} = useQuery<ILanguage[]>({queryKey: ["languages"], queryFn: fetchLanguages});

  const {data: dataCategories} = useQuery<ICategories[]>({queryKey: ["categories"], queryFn: fetchCategories});

  const {data: dataBCardDetails, refetch} = useQuery({
    queryKey: ['bCardDetails', id],
    queryFn: () => fetchBCardDetailsById(id as number),
    enabled: !!id,
    retry: 1,
    initialData: undefined,
    staleTime: 0,
  });

  console.log('dataBCardDetails', dataBCardDetails)


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
      const res = await axiosWithAuth.post('/iv-component-editor/add-or-modify-iv-component', modifiedValues)
      if (res?.status == 200) {
        notification.open({
          type: 'success',
          message: `B card was added`,
        });
      isEditPage ? await refetch() : null;
        Router.push("/b-card")
      }
    } catch (e: any) {
      console.log("e",)
      notification.open({
        type: 'error',
        message: `${e?.response?.data?.message || "error"}`,
      });
    }
  };

  const uploadImage = async (options: any) => {
    const {onSuccess, onError, file, onProgress} = options;

    const formData = new FormData();
    const config = {
      headers: {"content-type": "multipart/form-data"},
    };
    formData.append("mediaFile", file);

    try {
      const res = await axiosWithAuth.post(`/iv-component-editor/upload-iv-component-media-upload`, formData, config)
      if (res?.status == 200) {
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
    if (isEditPage && dataBCardDetails) {
      console.log("dataBCardDetails", dataBCardDetails)
      const newData = {
        ...dataBCardDetails,
        mediaDTO: {
            "size": dataBCardDetails?.mediaDTO?.size || null,
            "originalFileName": dataBCardDetails?.mediaDTO?.originalFileName || null,
            "fileName": dataBCardDetails?.mediaDTO?.fileName || null,
            "contentType": dataBCardDetails?.mediaDTO?.contentType || null,
            "url": dataBCardDetails?.mediaDTO?.url || null 
        },
        details: dataBCardDetails?.details.map((detail: any) => ({
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
        "videoLink": null,
        "buttonLink": null,
        "mediaLeft": null,
        "mediaIsImage": null,
        "categoryIdList": [dataCategories?.[0].id],   
        "mediaDTO": {
                "size": null,
                "originalFileName": null,
                "fileName": null,
                "contentType": null,
                "url": null
                },
        "details":
            activeLanguages?.map(e => {
              return {
                "id": null,
                "ivComponentId": null,
                "title": null,
                "subTitle": null,
                "description": null,
                "buttonText": null,
                "languageId": e.id,
              }
            })
      }
    }
  }

  const dataImg = form.getFieldValue('mediaDTO');
  let fileList = dataImg?.url ? [dataImg] : (dataBCardDetails ? [dataBCardDetails?.mediaDTO] : []);

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


          <h2 className={"text-center text-[30px] w-full"}>{id ? "Edit B Card" : "Add B Card"}</h2>
        </div>
        <Divider className={"my-3"}/>
        {((isEditPage && dataBCardDetails) || (!isEditPage && dataLanguages)) && <Form
            form={form}
            layout="vertical"
            onValuesChange={onchange}
            onFinish={onFinish}
            size={'default' as SizeType}
            initialValues={getDefaultValue()}>

          <Form.Item name={"categoryIdList"} label="category" className={"mt-2"}>
            <Select mode={"multiple"}>
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
              className={"mb-0"}
              name={"mediaLeft"}
              valuePropName={"checked"}
          >
            <Checkbox>Media Left</Checkbox>
          </Form.Item>

          <Form.Item
              className={"mb-0"}
              name={"mediaIsImage"}
              valuePropName={"checked"}
          >
            <Checkbox>Media Is An Image</Checkbox>
          </Form.Item>

          <Form.Item
            name={'videoLink'}
            label={'videoLink'}
          >
            <Input placeholder="videoLink"/>
          </Form.Item>

          <Form.Item
            name={'buttonLink'}
            label={'buttonLink'}
          >
            <Input placeholder="buttonLink"/>
          </Form.Item>


          <Form.Item label={'Media'}
            name={"mediaDTO"}
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

              <p className="ant-upload-text">Click or drag file to this area to upload file</p>
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
                          name={[field.name, 'title']}
                          label={'title'}
                      >
                        <Input placeholder="title"/>
                      </Form.Item>
                      
                      <Form.Item
                          name={[field.name, 'subTitle']}
                          label={'subTitle'}
                      >
                        <Input placeholder="subTitle"/>
                      </Form.Item>

                      <Form.Item
                          name={[field.name, 'buttonText']}
                          label={'button Text'}
                      >
                        <Input placeholder="button Text"/>
                      </Form.Item>

                      <Form.Item
                          name={[field.name, 'description']}
                          label={`description`}
                          valuePropName="value"
                          getValueFromEvent={(value) => value}>
                        <ReactQuillComponent
                            modules={modules}
                            className={`textEditor border markGeo`}
                        />
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
