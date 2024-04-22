'use client'
import {axiosWithAuth} from "@/configs/axios";
import {InboxOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import React, {useState} from "react";
import {
  Button,
  Cascader, Checkbox,
  DatePicker,
  Form,
  Input,
  Upload,
  Radio,
  Select,
  Switch,
  TreeSelect, Space, Card, Divider,
} from 'antd';
import axios from "axios";
import {SizeType} from "antd/lib/config-provider/SizeContext";
import type ReactQuill  from 'react-quill';

const ReactQuillComponent = dynamic(
    async () => {
      const { default: RQ } = await import('react-quill');
      // eslint-disable-next-line react/display-name
      return ({ ...props }) => <RQ {...props} />;
    },
    {
      ssr: false,
    }
) as typeof ReactQuill;
import "react-quill/dist/quill.snow.css";

const {RangePicker} = DatePicker;
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

export default function News() {
  const [form] = Form.useForm();

  const onchange = (values: any) => {
    console.log("values", values)
  }

  const onFinish = (values: any) => {
    console.log("values", values)
  }

  const normFile = (e: any) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const uploadImage = async (e: any) => {
    const formData = new FormData();
    formData.append("imageFile", e.file)

    await axiosWithAuth.post(`${BASEAPI}/news-editor/upload-news-image`, formData)
  }

  return (
      <main className="">
        <div className={"w-full flex justify-between items-center mb-4"}>
          <h2 className={"text-center text-[30px] w-full"}>Add news</h2>
        </div>
        <Form
            form={form}
            layout="vertical"
            onValuesChange={onchange}
            onFinish={onFinish}
            size={'default' as SizeType}
            // style={{maxWidth: 800}}
            initialValues={{
              "id": 0,
              "categoryIdList": [
                0
              ],
              "newsDetails": [
                {
                  "title": "titleKa",
                  "content": "contentKa",
                  "languageId": 1,
                  "useStartDate": dayjs.unix(1713523010),
                  "useEndDate": dayjs.unix(1713523000),
                  "status": false,
                  "imageData": {
                    "size": 0,
                    "originalFileName": "string",
                    "imageName": "string",
                    "contentType": "string",
                    "url": "string"
                  }
                },
                {
                  "title": "titleeng",
                  "content": "contentEn",
                  "languageId": 0,
                  "useStartDate": dayjs.unix(1713523010),
                  "useEndDate": dayjs.unix(1713523000),
                  "status": false,
                  "imageData": {
                    "size": 0,
                    "originalFileName": "string",
                    "imageName": "string",
                    "contentType": "string",
                    "url": "string"
                  }
                },
                {
                  "title": "titleRu",
                  "content": "contentRu",
                  "languageId": 3,
                  "useStartDate": dayjs.unix(1713523010),
                  "useEndDate": dayjs.unix(1713523000),
                  "status": true,
                  "imageData": {
                    "size": 0,
                    "originalFileName": "string",
                    "imageName": "string",
                    "contentType": "string",
                    "url": "string"
                  }
                }
              ],
              "status": true
            }}

        >
          <Form.List
              name="newsDetails"
          >
            {(fields, v) => {
              console.log("Field", fields); // Logging the field

              return <div className={"flex flex-col gap-y-5"}>
                {
                  fields.map((field, index, c) => {
                    return <Card
                        key={index}
                        className={"border-[1px] rounded-2xl border-solid border-[#b2b2b2]"}>
                      <Divider orientation="left" className={"!my-0"}><h3 className={"text-[25px]"}>English</h3>

                      </Divider>
                      {/*<h2 className={"text-center"}></h2>*/}
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
                        {/*<TextEditor/>*/}
                      </Form.Item>

                      {/*valuePropName="fileList"*/}
                      <Form.Item label={'image'} name="image" getValueFromEvent={normFile} noStyle>
                        <Upload.Dragger
                            listType={"picture"}
                            maxCount={1}
                            multiple={false}
                            customRequest={(e) => uploadImage(e)}
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
                            className={"mb-0"} name={[field.name, 'useStartDate']} label="useStartDate">
                          <DatePicker showTime/>
                        </Form.Item>

                        <Form.Item className={"mb-0"} name={[field.name, 'useEndDate']} label="useEndDate">
                          <DatePicker showTime/>
                        </Form.Item>

                        <Form.Item className={"mb-0"} name={[field.name, 'status']} label="status"
                                   valuePropName={"checked"}>
                          <Checkbox/>
                        </Form.Item>
                      </Space>
                    </Card>
                  })}
              </div>
            }}

          </Form.List>

          <Form.Item name={"categoryId"} label="category" className={"mt-2"}>
            <Select mode={"multiple"}>
              <Select.Option value={1}>category1</Select.Option>
              <Select.Option value={2}>category2</Select.Option>
              <Select.Option value={3}>category3</Select.Option>
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
        </Form>
      </main>
  );
}
