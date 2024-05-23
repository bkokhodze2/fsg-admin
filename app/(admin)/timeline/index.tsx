'use client'
import React, { useState } from "react";
import {axiosWithAuth} from "@/configs/axios";
import {ArrowLeftOutlined, EditOutlined, InboxOutlined, LeftCircleOutlined, RollbackOutlined} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import dayjs, {unix} from "dayjs";
import dynamic from "next/dynamic";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {
  Button, Image,
  DatePicker,
  Form,
  Input,
  Upload,
  Select, Space, Card, Divider, notification, Radio, Tooltip,
} from 'antd';

import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import {SizeType} from "antd/lib/config-provider/SizeContext";
import type ReactQuill from 'react-quill';
import TimelineCard from "@/components/items/TimelineCard";

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
    const {data} = await axiosWithAuth.get(`${BASEAPI}/timeline-editor/get-timeline-categories`);
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


interface IProps {
  id?: number
}

interface DataType {
  key: string;
  title: string;
  subTitle: string;
  id: number;
  timelineItemId: number; 
  imageData: {
    originalFileName: string;
    imageName: string;
    contentType: string;
    url: string;
  };
}



const Row: React.FC<any> = ({ children, ...props }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: 'move',
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </tr>
  );
};


export default function AddEditTimeline({id}: IProps) {
  const [form] = Form.useForm();
  const Router = useRouter();
  const [dataSource, setDataSource] = useState<DataType[]>([
  ]);

  console.log('adatasocrce', dataSource)

  const fetchTimelineDetailsById = async (id: number) => {
    try {
      const {data} = await axiosWithAuth.get(`/timeline-editor/get-timeline-detail`, {
        params: {
          timelineId: id
        }
      });
      setDataSource(data?.timelineItems)
      return data;
  
    } catch (error: any) {
      console.log("errr", error)
      notification.open({
        type: 'error',
        message: `timeline`,
        description:
            'Something went wrong while fetching timeline details',
      });
    }
  }

  

  const isEditPage = !!id;
  const {data: dataLanguages} = useQuery<ILanguage[]>({queryKey: ["languages"], queryFn: fetchLanguages});

  const {data: dataCategories} = useQuery<ICategories[]>({queryKey: ["categories"], queryFn: fetchCategories});
  
  const {data: dataTimelineDetails, refetch} = useQuery({
    queryKey: ['details', id],
    queryFn: () => fetchTimelineDetailsById(id as number),
    enabled: !!id
  });

  console.log("dataTimelineDetails", dataTimelineDetails)


  const onchange = (values: any) => {
    console.log("values", values)
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
      const res = await axiosWithAuth.post('timeline-editor/add-or-modify-timeline', modifiedValues)
      // console.log('responsiiiiiiii', res)
      if (res.status == 200) {
        notification.open({
          type: 'success',
          message: `timeline was added`,
        });
        Router.push(`/timeline/edit/${res?.data?.id}`)
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
      const newData = {
        ...dataTimelineDetails,
        details: dataTimelineDetails.details.map((detail: any) => ({
          ...detail,
        }))
      };

      console.log("data", newData)

      return newData;
    } else {
      const activeLanguages = dataLanguages?.filter(e => e.active === true)

      return {
        "id": 0,
        "categoryIdList": [dataCategories?.[0]?.id],
        "details":
            activeLanguages?.map(e => {
              return {
                "title": null,
                "subTitle": null,
                // "alt": null,
                "navText": null,
                "navLink": null,
                "buttonText": null,
                "buttonLink": null,
                "languageId": e.id,
                "imageData": {
                  "size": null,
                  "originalFileName": null,
                  "imageName": null,
                  "contentType": null,
                  "url": null
                },
              }
            })
        ,
        "status": true,
        "title": null,
        "subTitle": null,
      }
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    })
  );


  const postSortedData = async (sortedData: DataType[]) => {
    const sortElements = sortedData.map((item, index) => ({
      timelineItemId: item.id,
      sortOrder: index,
    }));

    try {
      await axiosWithAuth.post('/timeline-editor/sort-timeline-items', { sortElements });
    } catch (error) {
      console.error('Error posting sorted data:', error);
    }
  };

  const columns: ColumnsType<DataType> = [
    {
      title: 'Timeline Items',
      dataIndex: 'timelineItemId',
    
      // render: (_, record) => {
      //   console.log("reccccc",record)
      // return <TimelineCard refetchCardsNewData={refetch} data={record} index={record?.timelineItemId} />}, // Index can be passed if needed
    },
  ];

  const onDragEnd = async ({ active, over }: any) => {
    console.log("aaaa----bbb",active,over)
    if (active.id !== over?.id) {
      setDataSource((prev) => {
        const activeIndex = prev.findIndex((item) => item.timelineItemId === active.id);
        const overIndex = prev.findIndex((item) => item.timelineItemId === over?.id);
        const newData = arrayMove(prev, activeIndex, overIndex);
        // postSortedData(newData);
        return newData;
      });
    }
  };

  return (
      <div className={"p-2 pb-[60px] flex gap-x-20 w-full"}>
        <div className="w-1/2">
            <div className={"w-full flex justify-between items-center mb-4"}>
            <Button className={"flex items-center"} type="default" onClick={() => Router.back()}>
                <ArrowLeftOutlined/>back</Button>

            <h2 className={"text-center text-[30px] w-full"}>{id ? "Edit Timeline" : "Add Timeline"}</h2>
            </div>
            <Divider className={"my-3"}/>
            {((isEditPage && dataTimelineDetails) || (!isEditPage && dataLanguages)) && <Form
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

                                <div className={"flex gap-x-4 w-full"}>
                                    <Form.Item
                                        name={[field.name, 'navText']}
                                        label={'navText'}
                                        className="w-1/2"
                                    >
                                        <Input placeholder="navText" />
                                    </Form.Item>

                                    <Form.Item
                                        name={[field.name, 'navLink']}
                                        label={'navLink'}
                                        className="w-1/2"
                                    >
                                        <Input placeholder="navlink" />
                                    </Form.Item>
                                </div>

                                <div className={"flex gap-x-4 w-full"}>
                                  <Form.Item
                                      name={[field.name, 'buttonText']}
                                      label={'button text'}
                                      className="w-1/2"
                                  >
                                      <Input placeholder="button text" />
                                  </Form.Item>

                                  <Form.Item
                                      name={[field.name, 'buttonLink']}
                                      label={'button link'}
                                      className="w-1/2"
                                  >
                                      <Input placeholder="button link" />
                                  </Form.Item>
                                </div>
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
        
        <div className="w-1/2">
            <h2 className={"text-center text-[30px] w-full mb-4"}>Timeline Cards</h2>
            <Divider className={"my-3"}/>
            <div
              // className={"overflow-y-auto h-3/5 mt-5"}
              className={"mt-9"}
            >
              {/* {dataTimelineDetails?.timelineItems?.map((timelineCard:any, index:number) => (
                  <TimelineCard
                      refetchCardsNewData={refetch}
                      key={timelineCard.timelineDetailId}
                      data={{
                              title: timelineCard.title || "title",
                              subTitle: timelineCard.subTitle || "subTitle",
                              id: timelineCard.timelineItemId,
                              imageData: {
                                  // size: timelineCard.imageData.size,
                                  originalFileName: timelineCard?.imageData?.originalFileName || "original filename",
                                  imageName: timelineCard?.imageData?.imageName || "image name",
                                  contentType: timelineCard?.imageData?.contentType || "content type",
                                  url: timelineCard?.imageData?.url || "https://www.socarenergy.ch/files/media/files/901844e646b84353f174e1fc373a90da/2-_SOCAR_Tankstelle_Graz.jpg"
                              }
                          }}
                      index={index+1}
                  />
              ))} */}


              {dataTimelineDetails && <DndContext sensors={sensors} onDragEnd={onDragEnd}>
                <SortableContext items={dataSource} strategy={verticalListSortingStrategy}>
                  <Table
                  components={{
                    body: {
                      row: Row,
                    },
                  }}
                    rowKey="timelineItemId"
                    columns={columns}
                    dataSource={dataSource}
                  />
                </SortableContext>
              </DndContext>}
            </div>
            <div className="mt-10 ml-14">
                <Link href={`/timeline/add-card/${dataTimelineDetails?.id}`}>
                  <Button disabled={!id} type="primary" className={"flex items-center gap-x-2"}>
                    <p>Add Timeline Card</p>
                  </Button>
                </Link>
              </div>
        </div>
      </div>
  );
}