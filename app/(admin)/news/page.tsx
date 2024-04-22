'use client'
import {axiosWithAuth} from "@/configs/axios";
import {DeleteOutlined, EditOutlined, PlusOutlined, QuestionCircleOutlined} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import {Button, notification, Popconfirm, Space, Table, Tag, Tooltip} from 'antd';
import type {TableProps} from 'antd';
import axios from "axios";
import dayjs from "dayjs";
import Link from "next/link";
import React, {useEffect} from "react";

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

interface DataType {
  id: number,
  key: string | number,
  title: string,
  content: string,
  imageUrl: string,
  useStartDateTime: number,
  useEndDateTime: number,
  status: boolean,
}

const data: DataType[] = [
  {
    id: 1,
    key: '1',
    title: 'John Brown',
    content: 'dsdsdsacontent',
    imageUrl: 'ssddsdsds',
    useStartDateTime: 123134212,
    useEndDateTime: 123134212,
    status: true,
  },
  {
    id: 2,
    key: '2',
    title: 'John Brown',
    content: 'dsdsdsacontent',
    imageUrl: 'ssddsdsds',
    useStartDateTime: 123134212,
    useEndDateTime: 123134212,
    status: true,
  },
  {
    id: 3,
    key: '3',
    title: 'John Brown',
    content: 'dsdsdsacontent',
    imageUrl: 'ssddsdsds',
    useStartDateTime: 123134212,
    useEndDateTime: 123134212,
    status: true,
  },
];
const BASEAPI = process.env.NEXT_PUBLIC_API_URL;

const fetchNews = async () => {
  try {
    const {data} = await axiosWithAuth.post(`${BASEAPI}/news-info/get-news`, {
      languageId: 1,
      pageNumber: 0,
      pageSize: 12
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

export default function News() {
  const {data, isLoading, isError} = useQuery({queryKey: ["news"], queryFn: fetchNews});
  const {data: dataLanguages,} = useQuery({queryKey: ["languages"], queryFn: fetchLanguages});

  console.log("data", data, dataLanguages)


  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Description',
      dataIndex: 'content',
      key: 'content',
      render: (text) => (
          <div
              dangerouslySetInnerHTML={{__html: text}}/>
      )
    },
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (text) => (
          <div>
            <img src={text}/>
          </div>
      )
    },
    {
      title: 'Start',
      dataIndex: 'useStartDateTime',
      key: 'useStartDateTime',
      render: (text, record) => (
          <Space size="middle">
            <p>
              {dayjs(text, "DD-MM-YYYY HH:mm:ss").format("DD-MM-YYYY HH:mm:ss")}
            </p>
          </Space>
      )
    },
    {
      title: 'End',
      dataIndex: 'useEndDateTime',
      key: 'useEndDateTime',
      render: (text, record) => (
          <Space size="middle">
            <p>
              {dayjs(text, "DD-MM-YYYY HH:mm:ss").format("DD-MM-YYYY HH:mm:ss")}
            </p>
          </Space>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
          <Space size="middle">
            <Tooltip title="Edit" placement={'bottom'}>
              <Button shape="circle" className={"flex items-center justify-center"} icon={<EditOutlined/>}/>
            </Tooltip>

            <Popconfirm
                title="Delete the news"
                description="Are you sure to delete this news?"
                okText={"Yes"}
                onConfirm={() => handleDeleteNewsById(record)}
                icon={<QuestionCircleOutlined style={{color: 'red'}}/>}
            >
              <Tooltip title="Delete" placement={'bottom'}>
                <Button danger shape="circle" className={"flex items-center justify-center"} icon={<DeleteOutlined/>}/>
              </Tooltip>
            </Popconfirm>

          </Space>
      ),
    },
  ];

  const handleDeleteNewsById = async (record: DataType): Promise<void> => {
    const {id, title} = record;
    try {
      const res = await axios.delete(`${BASEAPI}/news-editor/delete-news/${id}`);
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
      <main className="p-2">
        <div className={"w-full flex justify-between items-center mb-4"}>
          <h2>news</h2>
          <Link href={"/news/add"}>
            <Button type="primary" className={"flex items-center gap-x-2"}>
              <PlusOutlined/>
              <p>Add news</p>
            </Button>
          </Link>
        </div>

        <Table loading={isLoading} columns={columns} dataSource={data?.data}/>
      </main>
  );
}
