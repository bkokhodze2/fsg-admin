'use client'
import { axiosWithAuth } from "@/configs/axios";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, notification, Popconfirm, Space, Table, Tooltip, Image } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

interface DataType {
  id: number,
  newsId: number,
  newsDetailId?: number,
  status: boolean,
  useStartDateTime: number,
  useEndDateTime: number,
}
    
interface ExpandedDataType {
  key: React.Key;
  title: string;
  content: string;
  useStartDateTime: string,
  useEndDateTime: string,
}

const items = [
  { key: '1', label: 'Action 1' },
  { key: '2', label: 'Action 2' },
];

const BASEAPI = process.env.NEXT_PUBLIC_API_URL;

const fetchCsrData = async (filter: IFilter) => {
  try {
    const {data} = await axiosWithAuth.post(`${BASEAPI}/news-info/get-news`, {
      ...filter,
      languageId: 1,
      pageSize: 1000,
      pageNumber: 0,
      category: "csr_cat",
    });
    return data;
  } catch (error: any) {
    notification.open({
      type: 'error',
      message: `news`,
      description:
          'Something went wrong while fetching news',
    });

  }
}

const fetchCsrChildren = async (csrId: number) => {
  try {
    const { data } = await axiosWithAuth.post(`${BASEAPI}/news-info/get-news`, {
      languageId: 1,
      pageSize: 1000,
      pageNumber: 0,
      category: "csr_cat",
      parentNewsId: csrId
    });
    return data;
  } catch (error: any) {
    notification.open({
      type: 'error',
      message: `Csr data`,
      description: 'Something went wrong while fetching Csr data',
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
  content?: undefined | string,
  title?: undefined | string,
  subTitle?: undefined | string,
  parentNewsId?: undefined | string | number,
}

export default function ScrPage({ searchParams }: IProps) {

  const [filter, setFilter] = useState<IFilter>({
    slug: searchParams.slug || undefined,
    content: searchParams.content || undefined,
    title: searchParams.title || undefined,
  });

  const [expandedRows, setExpandedRows] = useState<Record<number, ExpandedDataType[]>>({});

  const Router = useRouter();

  const { data: csrData, isLoading, isError, refetch } = useQuery({
    queryKey: ["csrData", filter],
    queryFn: () => fetchCsrData(filter)
  });

  useEffect(() => {
    const clearFilter: any = Object.fromEntries(
      Object.entries(filter).filter(([_, value]) => value !== undefined && value !== "")
    );

    const params = new URLSearchParams(clearFilter).toString();

    Router.push(`/csr?${params}`)
  }, [filter]);

  const handleExpand = async (expanded: boolean, record: DataType) => {

    if (expanded && !expandedRows[record.newsId]) {
      const csrChildrenData = await fetchCsrChildren(record.newsId);
      console.log('csrChildren', csrChildrenData)
      if (csrChildrenData) {
        const expandedData = csrChildrenData?.data?.map((e: any) => {
          return ({
            key: e.newsId,
            // newsDetailId: e.newsDetailId,
            title: e.title,
            content: e.content,
            slug: e.slug,
            useStartDateTime: e.useStartDateTime,
            useEndDateTime: e.useEndDateTime,
            imageUrl: e.imageUrl,
            newsId: e.newsId
          })
      });
        setExpandedRows((prev) => ({ ...prev, [record.newsId]: expandedData }));
      }
    }
  };

  const expandedRowRender = (record: DataType) => {


    const columns: TableColumnsType<ExpandedDataType> = [
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        align: "center",
        render: (text) => <p className="w-[100px]">{text}</p>,
      },
      {
        title: 'Description',
        dataIndex: 'content',
        align: "center",
        key: 'content',
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
        title: 'Slug',
        dataIndex: 'slug',
        key: 'slug',
        align: "center",
        render: (text) => <p>{text}</p>,
      },
      {
        title: 'Image',
        dataIndex: 'imageUrl',
        key: 'imageUrl',
        align: "center",
  
        render: (text) => (
            text ? <Image width={100} src={text} alt={"news image"}/>
            : "No Image"
        )
      },
      {
        title: 'start-end date',
        dataIndex: 'useStartDateTime',
        key: 'useStartDateTime',
        align: "center",
  
        render: (text, record) => (
            <Space size="middle" className={"flex flex-wrap flex-col"}>
              <p className={"whitespace-nowrap"}>
                {dayjs(record.useStartDateTime, "DD-MM-YYYY HH:mm:ss").format("DD-MM-YYYY HH:mm:ss")}
              </p>
  
              <p className={"whitespace-nowrap"}>
                {dayjs(record.useEndDateTime, "DD-MM-YYYY HH:mm:ss").format("DD-MM-YYYY HH:mm:ss")}
              </p>
            </Space>
        )
      },
      {
        title: 'Action',
        key: 'operation',
        render: (e) => {
          console.log("e", e)
          return (
            <>
              <Space size="middle">
                <Tooltip title="Edit" placement={'bottom'}>
                  <Link href={`/csr/edit/${e.newsId}?parentNewsId=${record?.newsId}`}>
                    <Button shape="circle" className={"flex items-center justify-center"} icon={<EditOutlined />} />
                  </Link>
                </Tooltip>
                <Popconfirm
                  title="Delete the Csr"
                  description="Are you sure to delete this Csr?"
                  okText={"Yes"}
                  onConfirm={() => handleDeleteCsrById(e?.newsId)}
                  icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                >
                  <Tooltip title="Delete" placement={'bottom'}>
                    <Button danger shape="circle" className={"flex items-center justify-center"} icon={<DeleteOutlined />} />
                  </Tooltip>
                </Popconfirm>
              </Space>
            </>
          )
        },
      },
    ];

    const data = expandedRows[record.newsId] || [];

    return (
      <>
        <Table columns={columns} dataSource={data} pagination={false} />
        <div className={"flex items-center justify-center flex-nowrap gap-x-4 mt-[12px]"}>
          <Link href={`/csr/add?parentNewsId=${record.newsId}`}>
            <Button type="primary" className={"flex items-center gap-x-2"}>
              <PlusOutlined />
              <p>Add Csr Child</p>
            </Button>
          </Link>
        </div>
      </>
    )
  };

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
      dataIndex: 'content',
      align: "center",
      key: 'content',
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
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      align: "center",
      render: (text) => <p>{text}</p>,
    },
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      align: "center",

      render: (text) => (
          text ? <Image width={100} src={text} alt={"news image"}/>
          : "No Image"
      )
    },
    {
      title: 'start-end date',
      dataIndex: 'useStartDateTime',
      key: 'useStartDateTime',
      align: "left",

      render: (text, record) => (
          <Space size="middle" className={"flex flex-wrap"}>
            <p className={"whitespace-nowrap"}>
              {dayjs(record.useStartDateTime, "DD-MM-YYYY HH:mm:ss").format("DD-MM-YYYY HH:mm:ss")}
            </p>

            <p className={"whitespace-nowrap"}>
              {dayjs(record.useEndDateTime, "DD-MM-YYYY HH:mm:ss").format("DD-MM-YYYY HH:mm:ss")}
            </p>
          </Space>
      )
    },
    {
      title: 'Action',
      key: 'action',
      width: "130px",
      align: "center",
      render: (_, record) => (
        <Space size="middle" className="flex flex-col">
          <div className="flex gap-x-[16px]">
            <Tooltip title="Edit Csr" placement={'bottom'}>
              <Link href={`/csr/edit/${record?.newsId}`}>
                <Button shape="circle" className={"flex items-center justify-center"} icon={<EditOutlined />} />
              </Link>
            </Tooltip>

            <Popconfirm
              title="Delete the Csr"
              description="Are you sure to delete this Csr?"
              okText={"Yes"}
              onConfirm={() => handleDeleteCsrById(record?.newsId)}
              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            >
              <Tooltip title="Delete Csr" placement={'bottom'}>
                <Button danger shape="circle" className={"flex items-center justify-center"} icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          </div>
        </Space>
      ),
    },
  ];

  const handleDeleteCsrById = async (csrId: number): Promise<void> => {
    try {
      const res = await axiosWithAuth.delete(`${BASEAPI}/news-editor/delete-news/${csrId}`);
      notification.open({
        type: 'success',
        message: `Csr Id - ${csrId}`,
        description: 'Csr successfully deleted',
      });
      await refetch();

      const removeKey = (key:number) => {
        const newState = { ...expandedRows };
        delete newState[key];
        setExpandedRows(newState);
    };

      removeKey(csrId)

    } catch (error: any) {
      notification.open({
        type: 'error',
        message: `Csr Id - ${csrId}`,
        description: 'Something went wrong while deleting Scr',
      });
      console.error('Erroreeeeeee-----------:', error.message);
    }
  };

  const onChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter, extra) => {

  };

  return (
    <>
      <div className={"w-full p-2 flex justify-between items-center"}>
        <h2 className={"text-[25px]"}>CSR</h2>
        <div className={"flex items-center flex-nowrap gap-x-4"}>
          <Link href={"/csr/add"}>
            <Button type="primary" className={"flex items-center gap-x-2"}>
              <PlusOutlined />
              <p>Add CSR</p>
            </Button>
          </Link>
        </div>
      </div>

      <Table
        onChange={onChange}
        sticky={{ offsetHeader: 4 }}
        loading={isLoading}
        expandable={{
          expandedRowRender,
          onExpand: handleExpand,
        }}
        columns={columns}
        dataSource={csrData?.data}
        rowKey={"newsId"}
      />
    </>
  );
}
