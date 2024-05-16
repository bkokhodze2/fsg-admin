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
  slideId: number,
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

const fetchSlide = async (filter: IFilter) => {
  try {
    const {data} = await axiosWithAuth.post(`${BASEAPI}/slide-editor/get-slides`, {
      ...filter,
      languageId: 1,
      // pageSize: parseInt(String(filter.pageSize)) || PAGE_SIZE,
      // pageNumber: filter?.pageNumber ? (filter?.pageNumber - 1) : 0,
    });
    return data;
  } catch (error: any) {
    notification.open({
      type: 'error',
      message: `slide`,
      description:
          'Something went wrong while fetching slide',
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

export default function Slide({searchParams}: IProps) {
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
    queryKey: ["slide", filter],
    queryFn: () => fetchSlide(filter)
  });

  useEffect(() => {
    const clearFilter: any = Object.fromEntries(
        Object.entries(filter).filter(([_, value]) => value !== undefined && value !== "")
    );

    const params = new URLSearchParams(clearFilter).toString();

    Router.push(`/slide?${params}`)
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
      title: 'Button Text',
      dataIndex: 'buttonText',
      key: 'buttonText',
      align: "center",
      render: (text) => <p>{text}</p>,
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
              alt={"slide image"}
          />
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
              <Link href={`/slide/edit/${record?.slideId}`}>
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
    const {slideId, title} = record;
    try {
      const res = await axiosWithAuth.delete(`${BASEAPI}/slide-editor/delete-slide/${slideId}`);
      console.log(res);

      notification.open({
        type: 'success',
        message: `slide - ${title}`,
        description:
            'slide successfully deleted',
      });

      await refetch()

    } catch (error: any) {
      notification.open({
        type: 'error',
        message: `slide - ${title}`,
        description:
            'Something went wrong while deleting slide',
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

    // Router.push(`/news?page=${page}`)
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

  const getFilterCount = () => {
    const filteredObject = Object.fromEntries(
        Object.entries(filter).filter(([key, value]) => key !== 'pageSize' && key !== 'pageNumber' && value != undefined && value !== "")
    );

    return Object.keys(filteredObject).length;
  }

  return (
      <>
        <div className={"w-full p-2 flex justify-between items-center"}>
          <h2 className={"text-[25px]"}>Slides</h2>

          <div className={"flex items-center flex-nowrap gap-x-4"}>
            {getFilterCount() > 0 ?
                <Button onClick={() => onReset()} type="default" className={"flex items-center gap-x-2"}>
                  <ReloadOutlined/>
                  <p>Reset filter</p>
                </Button> : ""}


            {/* <Badge count={getFilterCount()} showZero={false}>
              <Button onClick={() => setIsOpenFilter(true)} type="primary" className={"flex items-center gap-x-2"}>
                <FilterOutlined/>
                <p>Filter</p>
              </Button>
            </Badge> */}

            <Link href={"/slide/add"}>
              <Button type="primary" className={"flex items-center gap-x-2"}>
                <PlusOutlined/>
                <p>Add Slide</p>
              </Button>
            </Link>
          </div>
        </div>

        {/* <Drawer
            title={<div className={"flex items-center justify-between"}>
              <h3>filter</h3>
              <Tooltip title="Close" placement={'bottom'}>
                <Button onClick={() => setIsOpenFilter(false)} shape="circle"
                        className={"flex items-center justify-center"}
                        icon={<CloseOutlined/>}/>
              </Tooltip>
            </div>}
            placement={"right"}
            closable={false}
            onClose={() => setIsOpenFilter(false)}
            open={isOpenFilter}
        >
          <Form
              layout={"vertical"}
              form={form}
              onFinish={onSubmit}
              initialValues={filter}
          >
            <Form.Item name={"slug"} label="slug">
              <Input placeholder="input slug"/>
            </Form.Item>

            <Form.Item name={"title"} label="title">
              <Input placeholder="input title"/>
            </Form.Item>

            <Form.Item name={"content"} label="content">
              <Input placeholder="input title"/>
            </Form.Item>

            <div className={"gap-x-2 flex flex-nowrap"}>
              <Button type="primary" htmlType={"submit"}>filter</Button>
              <Button type="default" onClick={() => onReset()}>reset</Button>
            </div>
          </Form>
        </Drawer> */}

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
            rowKey={"slideId"}
        >
        </Table>
      </>
  );
}
