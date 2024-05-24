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
  infoCardId: number,
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

const fetchInfoCard = async (filter: IFilter) => {
  try {
    const {data} = await axiosWithAuth.post(`${BASEAPI}/info-card-editor/get-info-cards`, {
      ...filter,
      languageId: 1,
      pageSize: parseInt(String(filter.pageSize)) || PAGE_SIZE,
      pageNumber: filter?.pageNumber ? (filter?.pageNumber - 1) : 0,
    });
    return data;
  } catch (error: any) {
    notification.open({
      type: 'error',
      message: `info card`,
      description:
          'Something went wrong while fetching info card',
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
}

export default function InfoCard({searchParams}: IProps) {
  const [isOpenFilter, setIsOpenFilter] = useState<boolean>(false);
  const [filter, setFilter] = useState<IFilter>({
    pageNumber: searchParams.pageNumber || undefined,
    pageSize: searchParams.pageSize || undefined,
    slug: searchParams.slug || undefined,
    content: searchParams.content || undefined,
    title: searchParams.title || undefined,
  });
  const [form] = Form.useForm();
  const Router = useRouter();

  const {data, isLoading, isError, refetch} = useQuery({
    queryKey: ["infoCard", filter],
    queryFn: () => fetchInfoCard(filter)
  });

  useEffect(() => {
    const clearFilter: any = Object.fromEntries(
        Object.entries(filter).filter(([_, value]) => value !== undefined && value !== "")
    );

    const params = new URLSearchParams(clearFilter).toString();

    Router.push(`/info-card?${params}`)
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
      title: 'Subtitle',
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
              <Link href={`/info-card/edit/${record?.infoCardId}`}>
                <Button shape="circle" className={"flex items-center justify-center"} icon={<EditOutlined/>}/>
              </Link>
            </Tooltip>

            <Popconfirm
                title="Delete the info card"
                description="Are you sure to delete this info card?"
                okText={"Yes"}
                onConfirm={() => handleDeleteInfoCardById(record)}
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

  const handleDeleteInfoCardById = async (record: DataType): Promise<void> => {
    const {infoCardId, title} = record;
    try {
      const res = await axiosWithAuth.delete(`${BASEAPI}/info-card-editor/delete-info-card/${infoCardId}`);
      console.log(res);

      notification.open({
        type: 'success',
        message: `info card - ${title}`,
        description:
            'info card successfully deleted',
      });

      await refetch()

    } catch (error: any) {
      notification.open({
        type: 'error',
        message: `info card - ${title}`,
        description:
            'Something went wrong while deleting info card',
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

    // Router.push(`/info-card?page=${page}`)
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
          <h2 className={"text-[25px]"}>Info Card</h2>

          <div className={"flex items-center flex-nowrap gap-x-4"}>
            <Link href={"/info-card/add"}>
              <Button type="primary" className={"flex items-center gap-x-2"}>
                <PlusOutlined/>
                <p>Add Info Card</p>
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
            dataSource={data?.data && [...data?.data]}
            rowKey={"infoCardId"}
        >
        </Table>
      </>
  );
}
