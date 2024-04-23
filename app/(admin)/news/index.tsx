'use client'
import {axiosWithAuth} from "@/configs/axios";
import {InboxOutlined} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import dayjs, {unix} from "dayjs";
import dynamic from "next/dynamic";
import React from "react";
import {
  Button, Checkbox,
  DatePicker,
  Form,
  Input,
  Upload,
  Select, Space, Card, Divider, notification, Radio,
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
    const {data} = await axiosWithAuth.get(`${BASEAPI}/news-editor/get-news-categories`);
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
const fetchNewsDetailsById = async (id: number) => {
  try {
    const {data} = await axiosWithAuth.get(`${BASEAPI}/news-editor/get-news-info-detail`, {
      params: {
        newsId: id
      }
    });

    return data;

  } catch (error: any) {
    console.log("errr", error)
    notification.open({
      type: 'error',
      message: `news`,
      description:
          'Something went wrong while fetching news details',
    });
  }
}

interface IProps {
  id?: number
}

export default function AddEditNews({id}: IProps) {
  const [form] = Form.useForm();
  const isEditPage = !!id;
  const {data: dataLanguages} = useQuery<ILanguage[]>({queryKey: ["languages"], queryFn: fetchLanguages});

  const {data: dataCategories} = useQuery<ICategories[]>({queryKey: ["categories"], queryFn: fetchCategories});
  const {data: dataNewsDetails} = useQuery({
    queryKey: ['newsDetails', id],
    queryFn: () => fetchNewsDetailsById(id as number),
    enabled: !!id
  });

  console.log("dataNewsDetails2", dataNewsDetails)
  console.log("dataLanguages", dataLanguages)
  console.log("isEditPage", isEditPage)
  console.log("dataCategories", dataCategories)

  const onchange = (values: any) => {
    console.log("values", values)
  }
  const onFinish = (values: any) => {
    console.log("vv", values)

    // Modify the form data here before submitting
    const modifiedValues = {
      ...values,
      newsDetails: values.newsDetails.map((detail: any) => ({
        ...detail,
        useStartDateTimeMsec: dayjs(detail.useStartDateTimeMsec, 'DD-MM-YYYY HH:mm:ss').valueOf(),
        useStartDateTime: dayjs(detail.useStartDateTimeMsec, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY HH:mm:ss'),

        useEndDateTimeMsec: dayjs(detail.useEndDateTimeMsec, 'DD-MM-YYYY HH:mm:ss').valueOf(),
        useEndDateTime: dayjs(detail.useEndDateTimeMsec, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY HH:mm:ss'),
      }))
    };

    // Do something with the modified form data, such as submitting it to a server

    axiosWithAuth.post('/test', modifiedValues)
    // Log the FormData object or submit it to the server
    // You can also submit the formData to the server here
  };

  const uploadImage = async (options: any) => {
    // const formData = new FormData();
    // formData.append("imageFile", e.file)
    const {onSuccess, onError, file, onProgress} = options;

    const formData = new FormData();
    const config = {
      headers: {"content-type": "multipart/form-data"},
    };
    formData.append("imageFile", file);

    await axiosWithAuth.post(`${BASEAPI}/news-editor/upload-news-image`, formData, config)
  }
  const getDefaultValue = () => {
    if (isEditPage) {
      const newData = {
        ...dataNewsDetails,
        newsDetails: dataNewsDetails.newsDetails.map((detail: any) => ({
          ...detail,
          useStartDateTimeMsec: detail.useStartDateTimeMsec ? dayjs.unix(detail.useStartDateTimeMsec / 1000) : null,
          useEndDateTimeMsec: detail.useEndDateTimeMsec ? dayjs.unix(detail.useEndDateTimeMsec / 1000) : null,
        }))
      };

      return newData;
    } else {
      const activeLanguages = dataLanguages?.filter(e => e.active === true)

      return {
        "categoryIdList": [1],
        "newsDetails":
            activeLanguages?.map(e => {
              return {
                "newsDetailId": null,
                "title": null,
                "content": null,
                "imageName": null,
                "imageSize": null,
                "imageUrl": null,
                "useStartDateTime": null,
                "useEndDateTime": null,
                "languageId": e.id,
                "newsId": null,
                "useStartDateTimeMsec": null,
                "useEndDateTimeMsec": null
              }
            })
        ,
        "status": true
      }


    }
  }

  const parseTimestamp = (dateString: string) => {
    return dayjs(dateString, "DD-MM-YYYY HH:mm:ss").unix() * 1000;
  };

  return (
      <div className={"p-2"}>
        <div className={"w-full flex justify-between items-center mb-4"}>
          <h2 className={"text-center text-[30px] w-full"}>{id ? "Edit News" : "Add news"}</h2>
        </div>
        {((isEditPage && dataNewsDetails) || (!isEditPage && dataLanguages)) && <Form
            form={form}
            layout="vertical"
            onValuesChange={onchange}
            onFinish={onFinish}
            size={'default' as SizeType}
            // style={{maxWidth: 800}}
            initialValues={getDefaultValue()}>
          <Form.List
              name="newsDetails">
            {(fields, v) => {
              return <div className={"flex flex-col gap-y-5"}>
                {
                  fields.map((field, index, c) => {
                    const languageId = form.getFieldValue(['newsDetails', field.name, 'languageId'])
                    const findLang = dataLanguages?.find((e) => e.id === languageId)?.language;

                    return <Card
                        key={index}
                        className={"border-[1px] rounded-2xl border-solid border-[#b2b2b2]"}>
                      <Divider orientation="left" className={"!my-0"}><h3 className={"text-[25px]"}>{findLang}</h3>

                      </Divider>
                      <Form.Item
                          name={[field.name, 'title']}
                          label={'title'}
                      >
                        <Input placeholder="title"/>
                      </Form.Item>
                      <Form.Item
                          name={[field.name, 'content']}
                          label={`Content`}
                          valuePropName="value"
                          getValueFromEvent={(value) => value}>
                        <ReactQuillComponent
                            modules={modules}
                            className={`textEditor border markGeo`}
                        />
                      </Form.Item>
                      <Form.Item label={'image'}
                                 name={[field.name, 'imageData']}
                                 valuePropName="value"
                                 getValueFromEvent={(e: any) => {
                                   if (Array.isArray(e)) {
                                     return e;
                                   }
                                   return "sss";
                                 }} noStyle>
                        <Upload.Dragger
                            listType={"picture"}
                            maxCount={1}
                            multiple={false}
                            customRequest={(e) => uploadImage(e)}
                            onPreview={(e) => console.log("eee", e)}
                            // onChange={handleOnChange}
                            defaultFileList={[]}

                            // action={`${BASEAPI}/news-editor/upload-news-image`}
                        >
                          <p className="ant-upload-drag-icon">
                            <InboxOutlined/>
                          </p>
                          <p className="ant-upload-text">Click or drag file to this area to upload</p>
                          <p className="ant-upload-hint">Support for a single or bulk upload.</p>
                        </Upload.Dragger>
                      </Form.Item>
                      <Space className={"w-full mt-2 flex items-center justify-start"}>
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
                            name={[field.name, 'useStartDateTimeMsec']}
                            label="useStartDate">
                          <DatePicker format={"DD-MM-YYYY HH:mm:ss"} showTime/>
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
                            name={[field.name, 'useEndDateTimeMsec']
                            } label="useEndDate">
                          <DatePicker format={"DD-MM-YYYY HH:mm:ss"} showTime/>
                        </Form.Item>

                        {/*<Form.Item className={"mb-0"} name={[field.name, 'status']} label="status"*/}
                        {/*           valuePropName={"checked"}>*/}
                        {/*  <Checkbox/>*/}
                        {/*</Form.Item>*/}

                      </Space>
                    </Card>
                  })}
              </div>
            }}

          </Form.List>

          <Form.Item className={"mb-0"} name={'status'} label="status"
                     valuePropName={"value"}>
            <Radio.Group size={"large"} buttonStyle="solid">
              <Radio.Button value={true}>active</Radio.Button>
              <Radio.Button className={""} value={false}>disable</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item name={"categoryIdList"} label="category" className={"mt-2"}>
            <Select mode={"multiple"}>
              {dataCategories?.map((e) => {
                return <Select.Option value={e.id}>{e.category}</Select.Option>
              })}
            </Select>
          </Form.Item>

          {/*<Form.Item name="image" valuePropName="fileList" getValueFromEvent={normFile} noStyle>*/}
          {/*  <Upload.Dragger name="files"*/}
          {/*                  listType={"picture"}*/}
          {/*                  maxCount={1}*/}
          {/*                  multiple={false}*/}
          {/*                  customRequest={(e) => uploadImage(e)}*/}
          {/*      // action={`${BASEAPI}/news-editor/upload-news-image`}*/}
          {/*  >*/}
          {/*    <p className="ant-upload-drag-icon">*/}
          {/*      <InboxOutlined/>*/}
          {/*    </p>*/}
          {/*    <p className="ant-upload-text">Click or drag file to this area to upload</p>*/}
          {/*    <p className="ant-upload-hint">Support for a single or bulk upload.</p>*/}
          {/*  </Upload.Dragger>*/}
          {/*</Form.Item>*/}

          {/*<Form.Item label="status" valuePropName="checked">*/}
          {/*  <Checkbox value={true}/>*/}
          {/*</Form.Item>*/}

          <Button type={"primary"} htmlType={"submit"}>Submit</Button>
        </Form>}
      </div>
  );
}
