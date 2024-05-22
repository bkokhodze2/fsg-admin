'use client'
import {axiosWithAuth} from "@/configs/axios";
import {
  ArrowLeftOutlined, CloseCircleOutlined, CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import {Button, notification, Popconfirm, Space, Table, Image, Tooltip, Drawer, Badge, Form, Input} from 'antd';
import type {TableProps} from 'antd';
import dayjs from "dayjs";
import Link from "next/link";
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

interface DataType {
  timelineId: number;
  id?: number;
  title: string;
  description: string;
  buttonText: string;
  status: boolean;
  alt: string;
  webImageData: ImageData;
}


const BASEAPI = process.env.NEXT_PUBLIC_API_URL;

const fetchTimeline = async (filter: IFilter) => {
  try {
    const {data} = await axiosWithAuth.post(`${BASEAPI}/timeline-editor/get-timelines`, {
      ...filter,
      languageId: 1,
      // pageSize: parseInt(String(filter.pageSize)) || PAGE_SIZE,
      // pageNumber: filter?.pageNumber ? (filter?.pageNumber - 1) : 0,
    });
    return data;
  } catch (error: any) {
    notification.open({
      type: 'error',
      message: `timeline`,
      description:
          'Something went wrong while fetching timeline',
    });

  }
}

interface IProps {
  searchParams: IFilter
}

interface IFilter {
  pageNumber?: number,
  pageSize?: number,
  slug?: undefined | string,
  id?: undefined | number,
  description?: undefined | string,
  title?: undefined | string,
  buttonText?: undefined | string,
}

export default function Timeline({searchParams}: IProps) {
  const [filter, setFilter] = useState<IFilter>({
    pageNumber: searchParams.pageNumber || undefined,
    pageSize: searchParams.pageSize || undefined,
    slug: searchParams.slug || undefined,
    description: searchParams.description || undefined,
    title: searchParams.title || undefined,
  });
  const [form] = Form.useForm();
  const Router = useRouter();

  const {data, isLoading, isError, refetch} = useQuery({
    queryKey: ["timeline", filter],
    queryFn: () => fetchTimeline(filter)
  });

  console.log("timeline data:", data)


  useEffect(() => {
    const clearFilter: any = Object.fromEntries(
      Object.entries(filter).filter(([_, value]) => value !== undefined && value !== "")
    );

    const params = new URLSearchParams(clearFilter).toString();

    Router.push(`/timeline?${params}`)
  }, [filter])


  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      align: "center",
      render: (text) => <p>{text}</p>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      align: "center",
      key: 'description',
      render: (text) => (
          <Tooltip placement="bottom"
                   destroyTooltipOnHide={true}
                   overlayInnerStyle={{
                     width: "500px",
                     maxHeight: "600px",
                     overflowY: "scroll"
                   }}
                   overlayClassName={"w-[500px]"}
                   className={""}
                   title={() => <div
                       dangerouslySetInnerHTML={{__html: text}}/>}>

            <div
                className={'textDots2 cursor-zoom-in'}
                dangerouslySetInnerHTML={{__html: text}}/>
          </Tooltip>
      )
    },
    {
      title: 'Button Text',
      dataIndex: 'buttonText',
      key: 'buttonText',
      align: "center",
      render: (text) => <p>{text}</p>,
    },
    {
      title: 'Action',
      key: 'action',
      width: "130px",
      align: "center",
      render: (_, record) => (
          <Space size="middle">
            <Tooltip title="Edit" placement={'bottom'}>
              <Link href={`/timeline/edit/${record?.id}`}>
                <Button shape="circle" className={"flex items-center justify-center"} icon={<EditOutlined/>}/>
              </Link>
            </Tooltip>

            <Popconfirm
                title="Delete the Timeline"
                description="Are you sure to delete this Timeline"
                okText={"Yes"}
                onConfirm={() => handleDeleteTimelineById(record)}
                icon={<QuestionCircleOutlined style={{color: 'red'}}/>}
            >
              <Tooltip title="Delete" placement={'bottom'}>
                <Button danger shape="circle" className={"flex items-center justify-center"}
                        icon={<DeleteOutlined/>}/>
              </Tooltip>
            </Popconfirm>

          </Space>
      ),
    },
  ];

  const handleDeleteTimelineById = async (record: DataType): Promise<void> => {
    const {id, title} = record;
    try {
      const res = await axiosWithAuth.delete(`${BASEAPI}/timeline-editor/delete-timeline/${id}`);
      console.log(res);

      notification.open({
        type: 'success',
        message: `timeline - ${title}`,
        description:
            'timeline successfully deleted',
      });

      await refetch()

    } catch (error: any) {
      notification.open({
        type: 'error',
        message: `timeline - ${title}`,
        description:
            'Something went wrong while deleting timeline',
      });
      console.error('Erroreeeeeee-----------:', error.message); // Log the error
    }
  };

  const onChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter, extra) => {
    console.log('params', pagination);

    if ((filter.pageSize !== undefined) && (filter.pageSize != pagination.pageSize)) {
      setFilter((prevState: IFilter) => ({
        ...prevState,
        pageNumber: 1,
        pageSize: pagination.pageSize
      }))

    } else {
      setFilter((prevState: IFilter) => ({
        ...prevState,
        pageNumber: pagination.current,
        pageSize: pagination.pageSize
      }))
    }
  };

  // console.log('dataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', data)

  const TimelinesData = data?.map((item:any) => ({
    key: item.id,
    id: item.id,
    title: item.details[0].title,
    description: item.details[0].subTitle,
    // webImageUrl: item.timelineDetails[0].webImageData.url,
    buttonText: item.details[0].buttonText,
  }))

  return (
      <>
        <div className={"w-full p-2 flex justify-between items-center"}>
          <h2 className={"text-[25px]"}>Timelines</h2>

          <div className={"flex items-center flex-nowrap gap-x-4"}>
            <Link href={"/timeline/add"}>
              <Button type="primary" className={"flex items-center gap-x-2"}>
                <PlusOutlined/>
                <p>Add Timeline</p>
              </Button>
            </Link>
          </div>
        </div>

        <Table
            onChange={onChange}
            sticky={{offsetHeader: 4}}
            scroll={{
              x: 200,
              y: "70vh"
            }}
            loading={isLoading}
            columns={columns}
            dataSource={TimelinesData}
            rowKey={"id"}
        >
        </Table>
      </>
  );
}
