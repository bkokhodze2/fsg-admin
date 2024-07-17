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

interface DataType {
  infoCardId?: number,
  id: number,
  key: string | number,
  title: string,
  subTitle: string,
  content: string,
  imageUrl: string,
  useStartDateTime: number,
  useEndDateTime: number,
  status: boolean,

  details?:
  {
    "infoCardDetailid": number,
    "infoCardId": number,
    "title": string,
    "subTitle": string,
    "languageId": number,
    "status": null,
  }[]
}

const BASEAPI = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 10;

const fetchBCard = async (filter: IFilter) => {
  try {
    const {data} = await axiosWithAuth.post(`${BASEAPI}/iv-component-editor/get-iv-components`, {
      ...filter,
      languageId: 1,
    //   pageSize: parseInt(String(filter.pageSize)) || PAGE_SIZE,
    //   pageNumber: filter?.pageNumber ? (filter?.pageNumber - 1) : 0,
    });
    return data;
  } catch (error: any) {
    notification.open({
      type: 'error',
      message: `B card`,
      description:
          'Something went wrong while fetching B card',
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
}

export default function BCard({searchParams}: IProps) {
  const [isOpenFilter, setIsOpenFilter] = useState<boolean>(false);
  const [filter, setFilter] = useState<IFilter>({
    pageNumber: searchParams.pageNumber || undefined,
    pageSize: searchParams.pageSize || undefined,
    slug: searchParams.slug || undefined,
    content: searchParams.content || undefined,
    title: searchParams.title || undefined,
    subTitle: searchParams.subTitle || undefined
  });
  const [form] = Form.useForm();
  const Router = useRouter();

  const {data, isLoading, isError, refetch} = useQuery({
    queryKey: ["BCard", filter],
    queryFn: () => fetchBCard(filter)
  });

  useEffect(() => {
    const clearFilter: any = Object.fromEntries(
        Object.entries(filter).filter(([_, value]) => value !== undefined && value !== "")
    );

    const params = new URLSearchParams(clearFilter).toString();

    Router.push(`/b-card?${params}`)
  }, [filter])


  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      align: "center",
      render: (text, obj) => {
        console.log("obj", obj)
        return <p>{obj?.details?.[0]?.title}</p>
      }
    },
    {
      title: 'Subtitle',
      dataIndex: 'subTitle',
      align: "center",
      key: 'subTitle',
      render: (text, obj) => {
        console.log("obj", obj)
        return <p>{obj?.details?.[0]?.subTitle}</p>
      }
    },

    // {
    //   title: 'start-end date',
    //   dataIndex: 'useStartDateTime',
    //   key: 'useStartDateTime',
    //   align: "left",

    //   render: (text, record) => (
    //       <Space size="middle" className={"flex flex-wrap"}>
    //         <p className={"whitespace-nowrap"}>
    //           {dayjs(record.useStartDateTime, "DD-MM-YYYY HH:mm:ss").format("DD-MM-YYYY HH:mm:ss")}
    //         </p>

    //         <p className={"whitespace-nowrap"}>
    //           {dayjs(record.useEndDateTime, "DD-MM-YYYY HH:mm:ss").format("DD-MM-YYYY HH:mm:ss")}
    //         </p>
    //       </Space>
    //   )
    // },
    // {
    //   title: 'End',
    //   dataIndex: 'useEndDateTime',
    //   key: 'useEndDateTime',
    //   align: "center",
    //
    //   render: (text, record) => (
    //       <Space size="middle">
    //         <p className={"whitespace-nowrap"}>
    //           {dayjs(text, "DD-MM-YYYY HH:mm:ss").format("DD-MM-YYYY HH:mm:ss")}
    //         </p>
    //       </Space>
    //   )
    // },
    {
      title: 'Action',
      key: 'action',
      width: "130px",
      align: "center",
      render: (_, record) => (
          <Space size="middle">
            <Tooltip title="Edit" placement={'bottom'}>
              <Link href={`/b-card/edit/${record?.id}`}>
                <Button shape="circle" className={"flex items-center justify-center"} icon={<EditOutlined/>}/>
              </Link>
            </Tooltip>

            <Popconfirm
                title="Delete the B card"
                description="Are you sure to delete this B card?"
                okText={"Yes"}
                onConfirm={() => handleDeleteBCardById(record)}
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

  const handleDeleteBCardById = async (record: DataType): Promise<void> => {
    const {id} = record;
    try {
      const res = await axiosWithAuth.delete(`${BASEAPI}/iv-component-editor/delete-iv-component/${id}`);
      console.log(res);

      notification.open({
        type: 'success',
        message: `B card Id - ${id}`,
        description:
            'B card successfully deleted',
      });

      await refetch()

    } catch (error: any) {
      notification.open({
        type: 'error',
        message: `B card Id - ${id}`,
        description:
            'Something went wrong while deleting B card',
      });
      console.error('Erroreeeeeee-----------:', error.message); // Log the error
    }
  };
  console.log("filter", filter)

  const onSubmit = (values: IFilter) => {
    setFilter((prevState: IFilter) => ({
      ...prevState,
      ...values,
      pageNumber: 1,
    }))

    setIsOpenFilter(false)
  }
  const onReset = () => {
    setFilter({pageNumber: filter.pageNumber, pageSize: filter.pageSize})

    // Router.push(`/b-card?page=${page}`)
    setIsOpenFilter(false)
    setTimeout(() => {
      form.resetFields();
    }, 100)

  }

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
          <h2 className={"text-[25px]"}>B Card</h2>

          <div className={"flex items-center flex-nowrap gap-x-4"}>
            <Link href={"/b-card/add"}>
              <Button type="primary" className={"flex items-center gap-x-2"}>
                <PlusOutlined/>
                <p>Add B Card</p>
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
            pagination={{
              total: data?.allRecordsSize,
              current: filter.pageNumber,
              pageSize: filter.pageSize || PAGE_SIZE,
              showQuickJumper: false,
              showSizeChanger: true,
              position: ["bottomCenter"],
              // itemRender: itemRender,
            }}
            dataSource={data}
            rowKey={"bCardId"}
        >
        </Table>
      </>
  );
}
