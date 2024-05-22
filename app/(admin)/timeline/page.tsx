'use client'
import {axiosWithAuth} from "@/configs/axios";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import {Button, notification, Popconfirm, Space, Table, Tooltip, Form} from 'antd';
import type {TableProps} from 'antd';
import dayjs from "dayjs";
import Link from "next/link";
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)


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

interface DataType {
  "id": number,
  "categoryIdList": number[],
  "status": null,
  "timelineDetails": null,
  "details":
      {
        "timelineLangDetailId": number,
        "timelineId": number,
        "title": string,
        "subTitle": string,
        "navText": string,
        "navLink": string,
        "buttonLink": string,
        "buttonText": string,
        "languageId": number,
        "useStartDateTime": string,
        "useEndDateTime": string,
        "useStartDateTimeMsec": number,
        "useEndDateTimeMsec": number,
        "status": null,
        "fileDTO": {
          "size": null,
          "originalFileName": null,
          "fileName": null,
          "contentType": null,
          "url": null
        }
      }[]

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

  const {data: dataCategories} = useQuery<ICategories[]>({queryKey: ["categories"], queryFn: fetchCategories});

  useEffect(() => {
    const clearFilter: any = Object.fromEntries(
        Object.entries(filter).filter(([_, value]) => value !== undefined && value !== "")
    );

    const params = new URLSearchParams(clearFilter).toString();

    Router.push(`/timeline?${params}`)
  }, [filter])


  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'details',
      dataIndex: 'details',
      align: "center",
      key: 'details',
      render: (text, obj) => {
        console.log("obj", obj)
        return <p>{obj?.details?.[0]?.title}</p>
      }
    },
    {
      title: 'details',
      dataIndex: 'details',
      align: "center",
      key: 'details',
      render: (text, obj) => {
        console.log("obj", obj)
        return <p>{obj?.details?.[0]?.subTitle}</p>
      }
    },
    {
      title: 'category (pages)',
      dataIndex: 'categoryIdList',
      key: 'categoryIdList',
      align: "center",
      render: (categories) => {
        return getCategoryNameById(categories) && <p>{getCategoryNameById(categories)?.toString()}</p>
      },
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
    const {id} = record;
    try {
      const res = await axiosWithAuth.delete(`${BASEAPI}/timeline-editor/delete-timeline/${id}`);
      console.log(res);

      notification.open({
        type: 'success',
        message: `timeline with id - ${id}`,
        description:
            'timeline successfully deleted',
      });

      await refetch()

    } catch (error: any) {
      notification.open({
        type: 'error',
        message: `timeline with id - ${id}`,
        description:
            'Something went wrong while deleting timeline',
      });
      console.error('Erroreeeeeee-----------:', error.message); // Log the error
    }
  };

  const getCategoryNameById = (arr: number[]): string[] => arr.map((e): string => {
    return dataCategories?.find((item) => {
      return item?.id === e
    })?.category || ""

  })

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
            dataSource={data}
            rowKey={"id"}
        >
        </Table>
      </>
  );
}
