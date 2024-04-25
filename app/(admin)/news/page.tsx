'use client'
import {axiosWithAuth} from "@/configs/axios";
import {DeleteOutlined, EditOutlined, PlusOutlined, QuestionCircleOutlined} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import {Button, notification, Popconfirm, Space, Table, Image, Tooltip} from 'antd';
import type {TableProps} from 'antd';
import dayjs from "dayjs";
import Link from "next/link";
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

interface DataType {
  newsId: number,
  key: string | number,
  title: string,
  content: string,
  imageUrl: string,
  useStartDateTime: number,
  useEndDateTime: number,
  status: boolean,
}

const BASEAPI = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 10;


const fetchLanguages = async () => {
  try {
    const {data} = await axiosWithAuth.get(`${BASEAPI}/news-editor/get-languages`);

    return data;

  } catch (error: any) {
    console.log("errr", error)
    notification.open({
      type: 'error',
      message: `news`,
      description:
          'Something went wrong while fetching languages',
    });
  }
}

interface IProps {
  searchParams: {
    page: number
  }
}

const fetchNews = async (page: number) => {
  try {
    const {data} = await axiosWithAuth.post(`${BASEAPI}/news-info/get-news`, {
      languageId: 1,
      pageNumber: page - 1,
      pageSize: PAGE_SIZE
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
export default function News({searchParams}: IProps) {
  const [page, setPage] = useState<number>(searchParams.page || 1)
  const Router = useRouter();

  const {data, isLoading, isError} = useQuery({
    queryKey: ["news", page],
    queryFn: () => fetchNews(page)
  });
  const {data: dataLanguages} = useQuery({queryKey: ["languages"], queryFn: fetchLanguages});

  useEffect(() => {
    Router.push(`/news?page=${page}`)
  }, [page])


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
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      align: "center",

      render: (text) => (
          <Image
              width={100}
              src={text}
              alt={"news image"}
          />
      )
    },
    {
      title: 'Start',
      dataIndex: 'useStartDateTime',
      key: 'useStartDateTime',
      align: "center",

      render: (text, record) => (
          <Space size="middle">
            <p className={"whitespace-nowrap"}>
              {dayjs(text, "DD-MM-YYYY HH:mm:ss").format("DD-MM-YYYY HH:mm:ss")}
            </p>
          </Space>
      )
    },
    {
      title: 'End',
      dataIndex: 'useEndDateTime',
      key: 'useEndDateTime',
      align: "center",

      render: (text, record) => (
          <Space size="middle">
            <p className={"whitespace-nowrap"}>
              {dayjs(text, "DD-MM-YYYY HH:mm:ss").format("DD-MM-YYYY HH:mm:ss")}
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
          <Space size="middle">
            <Tooltip title="Edit" placement={'bottom'}>
              <Link href={`/news/edit/${record?.newsId}`}>
                <Button shape="circle" className={"flex items-center justify-center"} icon={<EditOutlined/>}/>
              </Link>
            </Tooltip>

            <Popconfirm
                title="Delete the news"
                description="Are you sure to delete this news?"
                okText={"Yes"}
                onConfirm={() => handleDeleteNewsById(record)}
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

  const handleDeleteNewsById = async (record: DataType): Promise<void> => {
    const {newsId, title} = record;
    try {
      const res = await axiosWithAuth(`${BASEAPI}/news-editor/delete-news/${newsId}`);
      console.log(res);

      notification.open({
        type: 'success',
        message: `news - ${title}`,
        description:
            'news successfully deleted',
      });

    } catch (error: any) {
      notification.open({
        type: 'error',
        message: `news - ${title}`,
        description:
            'Something went wrong while deleting news',
      });
      console.error('Erroreeeeeee-----------:', error.message); // Log the error
    }
  };

  return (
      <>
        <div className={"w-full p-2 flex justify-between items-center"}>
          <h2 className={"text-[25px]"}>news</h2>
          <Link href={"/news/add"}>
            <Button type="primary" className={"flex items-center gap-x-2"}>
              <PlusOutlined/>
              <p>Add news</p>
            </Button>
          </Link>
        </div>

        <Table
            sticky={{offsetHeader: 4}}
            scroll={{
              x: 200,
              y: "70vh"
            }}
            loading={isLoading}
            columns={columns}
            pagination={{
              total: data?.allRecordsSize,
              onChange: (e: number) => setPage(e),
              current: page,
              pageSize: PAGE_SIZE,
              showQuickJumper: false,
              showSizeChanger: false,
              position: ["bottomCenter"],
              // itemRender: itemRender,
            }}
            dataSource={data?.data && [...data?.data]}
            rowKey={"newsId"}
        >
        </Table>
      </>
  );
}
