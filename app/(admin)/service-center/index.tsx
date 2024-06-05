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
  Select, Space, Card, Divider, notification, Radio,
  Checkbox,
  DatePicker,
  InputNumber
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

const fetchServiceCenterDetailsById = async (id: number) => {
  try {
    const {data} = await axiosWithAuth.get(`/service-center-editor/get-service-center-details`, {
      params: {
        serviceCenterId: id
      }
    });

    return data;

  } catch (error: any) {
    console.log("errr", error)
    notification.open({
      type: 'error',
      message: `service center`,
      description:
          'Something went wrong while fetching service center details',
    });
  }
}

interface IProps {
  id?: number
}

export default function AddEditServiceCenter({id}: IProps) {
  const [form] = Form.useForm();
  const Router = useRouter();
  const Params = useParams();

  console.log("Params", Params)

  const isEditPage = !!id;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const {data: dataLanguages} = useQuery<ILanguage[]>({queryKey: ["languages"], queryFn: fetchLanguages});

  const {data: dataServiceCenterDetails, refetch} = useQuery({
    queryKey: ['serviceCenterDetails', id],
    queryFn: () => fetchServiceCenterDetailsById(id as number),
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
      useStartDateTimeMsec: dayjs(values.useStartDateTimeMsec, 'DD-MM-YYYY HH:mm:ss').valueOf(),
      useStartDateTime: values.useStartDateTimeMsec ? dayjs(values.useStartDateTimeMsec, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY HH:mm:ss') : null,
      useEndDateTimeMsec: dayjs(values.useEndDateTimeMsec, 'DD-MM-YYYY HH:mm:ss').valueOf(),
      useEndDateTime: values.useEndDateTimeMsec ? dayjs(values.useEndDateTimeMsec, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY HH:mm:ss') : null,
    };
    console.log("modifiedValues", modifiedValues)


    try {
      const res = await axiosWithAuth.post('/service-center-editor/add-or-modify-service-center', modifiedValues)
      if (res.status == 200) {
        notification.open({
          type: 'success',
          message: `Service Center was added`,
        });
      isEditPage ? await refetch() : null;
        Router.push("/service-center")
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

  const uploadImage = async (options: any) => {
    const {onSuccess, onError, file, onProgress} = options;

    const formData = new FormData();
    const config = {
      headers: {"content-type": "multipart/form-data"},
    };
    formData.append("imageFile", file);

    try {
      const res = await axiosWithAuth.post(`/service-center-editor/upload-service-center-image`, formData, config)
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
      console.log("dataServiceCenterDetails", dataServiceCenterDetails)
      const newData = {
        ...dataServiceCenterDetails,
        details: dataServiceCenterDetails?.details.map((detail: any) => ({
          ...detail,
          useStartDateTimeMsec: detail.useStartDateTimeMsec ? dayjs.unix(detail.useStartDateTimeMsec / 1000) : null,
          useEndDateTimeMsec: detail.useEndDateTimeMsec ? dayjs.unix(detail.useEndDateTimeMsec / 1000) : null,
        }))
      };

      console.log("data", newData)

      return newData;
    } else {
      const activeLanguages = dataLanguages?.filter(e => e.active === true)

      return {
        "imageData": {
          "size": null,
          "originalFileName": null,
          "imageName": null,
          "contentType": null,
          "url": null
        },
        "details":
            activeLanguages?.map(e => {
              return {
                "description": null,
                "title": null,
                "languageId": e.id,
                "location": null,
              }
            })
        ,
        "status": true,
        "id": null,
        "latitude": null,
        "longitude": null,
        "useStartDateTime": null,
        "useEndDateTime": null,
        "useStartDateTimeMsec": null,
        "useEndDateTimeMsec": null,
      }


    }
  }

  const dataImg = form.getFieldValue('imageData');
  let fileList = dataImg?.url ? [dataImg] : (dataServiceCenterDetails ? [dataServiceCenterDetails?.imageData] : []);

  return (
      <div className={"p-2 pb-[60px]"}>
        <div className={"w-full flex justify-between items-center mb-4"}>
          <Button className={"flex items-center"} type="default" onClick={() => Router.back()}>
            <ArrowLeftOutlined/>back</Button>

          <h2 className={"text-center text-[30px] w-full"}>{id ? "Edit Service Center" : "Add Service Center"}</h2>
        </div>
        <Divider className={"my-3"}/>
        {((isEditPage && dataServiceCenterDetails) || (!isEditPage && dataLanguages)) && <Form
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
            name={'latitude'}
            label={'latitude'}
          >
            <InputNumber placeholder="latitude - Enter a number" className="w-full" />
          </Form.Item>

          <Form.Item
            name={'longitude'}
            label={'longitude'}
          >
            <InputNumber placeholder="longitude - Enter a number" className="w-full" />
          </Form.Item>

          <div className={"flex gap-x-2 flex-nowrap"}>
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
                name={'useStartDateTimeMsec'}
                label="useStartDate"
            >
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
                name={'useEndDateTimeMsec'}
                label="useEndDate"
            >
                <DatePicker format={"DD-MM-YYYY HH:mm:ss"} showTime/>
            </Form.Item>
          </div>


          <Form.Item label={'image'}
            name={"imageData"}
            valuePropName="value"
            getValueFromEvent={(e: any) => {
              console.log("eee", e)
              if (e.file.status === 'done') {
                return e.file.response

              } else {
                return {
                  "size": null,
                  "originalFileName": null,
                  "imageName": null,
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

              <p className="ant-upload-text">Click or drag file to this area to upload main image</p>
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
                          name={[field.name, 'description']}
                          label={'description'}
                      >
                        <Input placeholder="description"/>
                      </Form.Item>

                      <Form.Item
                          name={[field.name, 'location']}
                          label={'location'}
                      >
                        <Input placeholder="location"/>
                      </Form.Item>

                      <Space className={"w-full mt-2 flex items-center justify-between"}>
                        {/* <Form.Item className={"mb-0"} name={[field.name, 'status']} label="status"
                                   valuePropName={"value"}>
                          <Radio.Group buttonStyle="solid">
                            <Radio.Button value={true}>active</Radio.Button>
                            <Radio.Button className={""} value={false}>disable</Radio.Button>
                          </Radio.Group>
                        </Form.Item> */}

                        {/* <Form.Item className={"mb-0"} name={[field.name, 'status']} label="status"
                                  valuePropName={"checked"}>
                         <Checkbox/>
                        </Form.Item> */}

                      </Space>
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
