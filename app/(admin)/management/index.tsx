'use client'
import {axiosWithAuth} from "@/configs/axios";
import {ArrowLeftOutlined, InboxOutlined} from "@ant-design/icons";
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
  Card, Divider, notification, Radio,
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

const fetchPersonDetailsById = async (id: number) => {
  try {
    const {data} = await axiosWithAuth.get(`/management-person-editor/get-management-person-detail`, {
      params: {
        personId: id
      }
    });

    return data;

  } catch (error: any) {
    console.log("errr", error)
    notification.open({
      type: 'error',
      message: `person`,
      description:
          'Something went wrong while fetching person details',
    });
  }
}

interface IProps {
  id?: number
}

export default function AddEditManagementPerson({id}: IProps) {
  const [form] = Form.useForm();
  const Router = useRouter();
  const Params = useParams();

  console.log("Params", Params)

  const isEditPage = !!id;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const {data: dataLanguages} = useQuery<ILanguage[]>({queryKey: ["languages"], queryFn: fetchLanguages});

//   const {data: dataCategories} = useQuery<ICategories[]>({queryKey: ["categories"], queryFn: fetchCategories});

  const {data: dataPersonDetails, refetch} = useQuery({
    queryKey: ['personDetails', id],
    queryFn: () => fetchPersonDetailsById(id as number),
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
      sortOrder: dataPersonDetails?.sortOrder || null,
      details: values.details.map((detail: any) => ({
        ...detail,
        useStartDateTimeMsec: dayjs(detail.useStartDateTimeMsec, 'DD-MM-YYYY HH:mm:ss').valueOf(),
        useStartDateTime: detail.useStartDateTimeMsec ? dayjs(detail.useStartDateTimeMsec, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY HH:mm:ss') : null,
        useEndDateTimeMsec: dayjs(detail.useEndDateTimeMsec, 'DD-MM-YYYY HH:mm:ss').valueOf(),
        useEndDateTime: detail.useEndDateTimeMsec ? dayjs(detail.useEndDateTimeMsec, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY HH:mm:ss') : null,
      }))
    };
    console.log("modifiedValues", modifiedValues)


    try {
      const res = await axiosWithAuth.post('/management-person-editor/add-or-modify-management-person', modifiedValues)
      if (res.status == 200) {
        notification.open({
          type: 'success',
          message: `Person was added`,
        });
      isEditPage ? await refetch() : null;
        Router.push("/management")
      }
    } catch (e: any) {
      console.log("e",)
      console.error('Errorttttttttt:', e.message);
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
      const res = await axiosWithAuth.post(`/management-person-editor/upload-management-person-image`, formData, config)
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
      console.log("dataPersonDetails", dataPersonDetails)
      const newData = {
        ...dataPersonDetails,
        details: dataPersonDetails?.details?.map((detail: any) => ({
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
        "status": true,
        "linkedinUrl": null,
        "slug": null,
        "sortOrder": dataPersonDetails?.sortOrder || null,
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
                "name": null,
                "surname": null,
                "description": null,
                "languageId": e.id,
                "personId": null,
                "detailId": null,
                "position": null,
              }
            })
        ,
      }


    }
  }

  const dataImg = form.getFieldValue('imageData');
  let fileList = dataImg?.url ? [dataImg] : (dataPersonDetails ? [dataPersonDetails?.imageData] : []);

  return (
      <div className={"p-2 pb-[60px]"}>
        <div className={"w-full flex justify-between items-center mb-4"}>
          <Button className={"flex items-center"} type="default" onClick={() => Router.back()}>
            <ArrowLeftOutlined/>back</Button>
          <h2 className={"text-center text-[30px] w-full"}>{id ? "Edit Person" : "Add Person"}</h2>
        </div>
        <Divider className={"my-3"}/>
        {((isEditPage && dataPersonDetails) || (!isEditPage && dataLanguages)) && <Form
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
            name={'linkedinUrl'}
            label={'linkedinUrl'}
          >
          <Input placeholder="Linkedin Url"/>
          </Form.Item>

          <Form.Item
            name={'slug'}
            label={'slug'}
          >
          <Input placeholder="slug"/>
          </Form.Item>

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
              defaultFileList={fileList}
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
                          name={[field.name, 'name']}
                          label={'name'}
                      >
                        <Input placeholder="name"/>
                      </Form.Item>
                      
                      <Form.Item
                          name={[field.name, 'surname']}
                          label={'surname'}
                      >
                        <Input placeholder="surname"/>
                      </Form.Item>

                      <Form.Item
                          name={[field.name, 'position']}
                          label={'position'}
                      >
                        <Input placeholder="position"/>
                      </Form.Item>

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
