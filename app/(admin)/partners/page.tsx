'use client'
import PartnerCard from "@/components/items/PartnerCard";
import React, {useState, useContext, useMemo, useId} from "react";
import {axiosWithAuth} from "@/configs/axios";
import {useQuery} from "@tanstack/react-query";
import dayjs from "dayjs";

import {SizeType} from "antd/lib/config-provider/SizeContext";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {
  Button,
  Form,
  Input,
  Table,
  Card,
  Divider,
  notification,
} from 'antd';

import {HolderOutlined} from '@ant-design/icons';

import {DndContext} from '@dnd-kit/core';
import type {SyntheticListenerMap} from '@dnd-kit/core/dist/hooks/utilities';
import {restrictToVerticalAxis} from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)
import type {ColumnsType} from 'antd/es/table';

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

interface IProps {
  id?: number
}

interface DataType {
  key: string;
  title: string;
  subTitle: string;
  id: number;
  partnerItemId: number;
  partnerDetailId: number;
  partnerId?: number;
  imageData: {
    originalFileName: string;
    imageName: string;
    contentType: string;
    url: string;
  };
  partnerItems?: any;
}

interface PartnerDetails {
  partnerItemId?: number;
  partnerId: number;
  partnerDetails: [DataType];
}

interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}

interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

const RowContext = React.createContext<RowContextProps>({});
const DragHandle: React.FC = () => {
  const {setActivatorNodeRef, listeners} = useContext(RowContext);
  return (
      <Button
          type="text"
          size="large"
          icon={<HolderOutlined/>}
          style={{cursor: 'move'}}
          ref={setActivatorNodeRef}
          {...listeners}
      />
  );
};

const Row: React.FC<RowProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({id: props['data-row-key']});

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform && {...transform, scaleY: 1.05}),
    transition,
    position: isDragging ? "relative" : "static",
    zIndex: isDragging ? 9999 : "auto",
  };

  const contextValue = useMemo<RowContextProps>(
      () => ({setActivatorNodeRef, listeners}),
      [setActivatorNodeRef, listeners],
  );

  return (
      <RowContext.Provider value={contextValue}>
        <tr {...props} ref={setNodeRef} style={style} {...attributes} />
      </RowContext.Provider>
  );
};


export default function PartnersPage({id}: IProps) {
  const [form] = Form.useForm();
  const Router = useRouter();
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [disabledSaveCardsOrderingBtn, setDisabledSaveCardsOrderingBtn] = useState(true)


  const fetchPartnerDetailsById = async (id: number) => {
    try {
      const {data} = await axiosWithAuth.get(`/partner-editor/get-partner-detail`, {
        params: {
          partnerId: id
        }
      });
      console.log('partnerData', data)
      setDataSource(data?.partnerItems)
      return data;

    } catch (error: any) {
      console.log("errr", error)
      notification.open({
        type: 'error',
        message: `partner`,
        description:
            'Something went wrong while fetching partner details',
      });
    }
  }

  const id2 = useId()


  const isEditPage = !!id;
  const {data: dataLanguages} = useQuery<ILanguage[]>({queryKey: ["languages"], queryFn: fetchLanguages});

  const {data: dataPartnerDetails, refetch} = useQuery({
    queryKey: ['details', id],
    queryFn: () => fetchPartnerDetailsById(id as number),
    enabled: !!id
  });

  const columns: ColumnsType<DataType> = [
    {key: 'sort', align: 'center', width: 80, render: () => <DragHandle/>},
    {
      title: 'Partner Items',
      dataIndex: 'id',
      render: (_, record, a) => {
        console.log("reccccc", record, a)
        return (
          <PartnerCard
            partnerId={record.partnerId}
            refetchCardsNewData={refetch}
            index={a + 1}
            data={record}
            />
        )
      }, // Index can be passed if needed
    },
  ];

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
      const res = await axiosWithAuth.post('partner-editor/add-or-modify-partner', modifiedValues)
      if (res.status == 200) {
        notification.open({
          type: 'success',
          message: `parter was added`,
        });
        Router.push(`/partners/edit/${res?.data?.id}`)
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
        ...dataPartnerDetails,
        details: dataPartnerDetails?.details.map((detail: any) => ({
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
        "partnerItems": [
          {
            "id": null,
            "partnerId": null,
            "sortOrder": null,
            "imageData": {
              "size": null,
              "originalFileName": null,
              "imageName": null,
              "contentType": null,
              "url": null
            },
            "description": "string",
            "partnerUrl": "string"
          }
        ],
        "details":
            activeLanguages?.map(e => {
              console.log('event', e)
              return {
                "title": null,
                "subTitle": null,
                "languageId": e.id,
                "id": null,
                "partnerId": null,
              }
            }),
        
      }
    }
  }

  const postSortedData = async (sortedData: DataType[]) => {
    setDisabledSaveCardsOrderingBtn(true)
    const sortElements = sortedData.map((item, index) => {
     return {
      partnerItemId: item.id,
      sortOrder: index,
    }
    }
  );

    try {
      await axiosWithAuth.post('/partner-editor/sort-partner-items', {sortElements});
    } catch (error) {
      console.error('Error posting sorted data:', error);
    }
  };
  const onDragEnd = async ({active, over}: any) => {
    console.log("aaaa----bbb", active, over)
    if (active.id !== over?.id) {
      setDataSource((prev) => {
        const activeIndex = prev.findIndex((item) => {item.id === active.id});
        const overIndex = prev.findIndex((item) => item.id === over?.id);
        const newData = arrayMove(prev, activeIndex, overIndex);
        // postSortedData(newData);
        return newData;
      });
      setDisabledSaveCardsOrderingBtn(false)
    }
  };

  return (
      <div className={"p-2 pb-[60px] flex gap-x-20 w-full"}>
        <div className="w-1/2">
          <div className={"w-full flex justify-between items-center mb-4"}>

            <h2 className={"text-center text-[30px] w-full"}> Section Title & Subtitle</h2>
          </div>
          <Divider className={"my-3"}/>
          {((isEditPage && dataPartnerDetails) || (!isEditPage && dataLanguages)) && <Form
              form={form}
              layout="vertical"
              onValuesChange={onchange}
              onFinish={onFinish}
              size={'default' as SizeType}
              initialValues={getDefaultValue()}>

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
          <h2 className={"text-center text-[30px] w-full mb-4"}>Partners Logos</h2>
          <Divider className={"my-3"}/>
          <div
              // className={"overflow-y-auto h-3/5 mt-5"}
              className={"mt-9"}
          >
            {dataSource && <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
              <SortableContext 
                items={dataSource?.map((i: any) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <Table
                    components={{
                      body: {
                        row: Row,
                      },
                    }}
                    showHeader={false}
                    pagination={false}
                    rowKey="id"
                    columns={columns}
                    dataSource={dataSource}
                />
              </SortableContext>
            </DndContext>
            }
          </div>
          <div className="mt-10 ml-14 flex gap-x-4">
            <Link href={`/partners/add-partner`}>
              <Button disabled={false} type="primary" className={"flex items-center gap-x-2"}>
                Add Partner
              </Button>
            </Link>
            
           {dataSource?.length > 1 && <Button type="primary" className="" disabled={disabledSaveCardsOrderingBtn} onClick={() => postSortedData(dataSource)}>Save Cards Ordering</Button> }
          </div>
        </div>
      </div>
  );
}