'use client'
import {DeleteOutlined, EditOutlined, PlusOutlined, QuestionCircleOutlined} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import {Button, notification, Popconfirm, Space, Table, Tag, Tooltip} from 'antd';
import type {TableProps} from 'antd';
import axios from "axios";
import Link from "next/link";
import React from "react";

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
    const {data} = await axios.post(`${BASEAPI}/news-info/get-news`, {
      language: 1,
      pageNumber: 1,
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
export default function News() {
  // const {data, isLoading, isError} = useQuery({queryKey: ["news"], queryFn: fetchNews});

  console.log("data", data)

  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
          <Space size="middle">
            <Tooltip title="Edit">
              <Button shape="circle" className={"flex items-center justify-center"} icon={<EditOutlined/>}/>
            </Tooltip>

            <Popconfirm
                title="Delete the news"
                description="Are you sure to delete this news?"
                okText={"Yes"}
                onConfirm={(e) => handleDeleteNewsById(record)}
                icon={<QuestionCircleOutlined style={{color: 'red'}}/>}
            >
              <Tooltip title="Delete">
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

        <Table columns={columns} dataSource={data}/>
      </main>
  );
}
