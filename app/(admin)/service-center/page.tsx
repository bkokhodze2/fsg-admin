'use client'
import {axiosWithAuth} from "@/configs/axios";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import {Button, notification, Popconfirm, Space, Table, Tooltip, Form, Image} from 'antd';
import type {TableProps} from 'antd';
import dayjs from "dayjs";
import Link from "next/link";
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

interface DataType {
  serviceCenterId?: number,
  id: number,
  key: string | number,
  title: string,
  description: string,
  content: string,
  imageUrl: string,
  useStartDateTime: number,
  useEndDateTime: number,
  status: boolean,
  latitude: number,
  longitude: number,
  imageData:{
    url: string;
  },
  details?:
  {
    "title": string,
    "description": string,
    "location": string,
    "languageId": number,
  }[]
}

const BASEAPI = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 10;

const fetchServiceCenter = async (filter: IFilter) => {
  try {
    const {data} = await axiosWithAuth.get(`${BASEAPI}/service-center-editor/get-service-centers`);
    return data;
  } catch (error: any) {
    notification.open({
      type: 'error',
      message: `service center`,
      description:
          'Something went wrong while fetching service center',
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
  description?: undefined | string,
}

export default function ServiceCenter({searchParams}: IProps) {
  const [isOpenFilter, setIsOpenFilter] = useState<boolean>(false);
  const [filter, setFilter] = useState<IFilter>({
    pageNumber: searchParams.pageNumber || undefined,
    pageSize: searchParams.pageSize || undefined,
    slug: searchParams.slug || undefined,
    content: searchParams.content || undefined,
    title: searchParams.title || undefined,
    description: searchParams.description || undefined
  });
  const [form] = Form.useForm();
  const Router = useRouter();

  const {data, isLoading, isError, refetch} = useQuery({
    queryKey: ["serviceCenter", filter],
    queryFn: () => fetchServiceCenter(filter)
  });

  useEffect(() => {
    const clearFilter: any = Object.fromEntries(
        Object.entries(filter).filter(([_, value]) => value !== undefined && value !== "")
    );

    const params = new URLSearchParams(clearFilter).toString();

    Router.push(`/service-center?${params}`)
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
      title: 'Description',
      dataIndex: 'description',
      align: "center",
      key: 'description',
      render: (text, obj) => {
        console.log("obj", obj)
        return <p>{obj?.details?.[0]?.description}</p>
      }
    },
    {
        title: 'Location',
        dataIndex: 'location',
        align: "center",
        key: 'location',
        render: (text, obj) => {
            console.log("obj", obj)
            return <p>{obj?.details?.[0]?.location}</p>
        }
    },
    {
        title: 'Latitude / Longitude',
        dataIndex: 'latitude',
        align: "center",
        key: 'latitude',
        render: (text, obj) => {
            console.log("obj", obj)
            return <p>{obj?.latitude} / {obj.longitude}</p>
        }
    },
    {
        title: 'Image',
        dataIndex: 'imageUrl',
        key: 'imageUrl',
        align: "center",
  
        render: (text, obj) => (
            obj?.imageData?.url ? <Image
                width={100}
                src={obj.imageData.url}
                alt={"service image"}
            />
            : "No Image"
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
              <Link href={`/service-center/edit/${record?.id}`}>
                <Button shape="circle" className={"flex items-center justify-center"} icon={<EditOutlined/>}/>
              </Link>
            </Tooltip>

            <Popconfirm
                title="Delete the service center"
                description="Are you sure to delete this service center?"
                okText={"Yes"}
                onConfirm={() => handleDeleteServiceCenterById(record)}
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

  const handleDeleteServiceCenterById = async (record: DataType): Promise<void> => {
    const {id} = record;
    try {
      const res = await axiosWithAuth.delete(`${BASEAPI}/service-center-editor/delete-service-center/${id}`);
      console.log(res);

      notification.open({
        type: 'success',
        message: `service center Id - ${id}`,
        description:
            'service center successfully deleted',
      });

      await refetch()

    } catch (error: any) {
      notification.open({
        type: 'error',
        message: `service center Id - ${id}`,
        description:
            'Something went wrong while deleting service center',
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

    // Router.push(`/service-center?page=${page}`)
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
          <h2 className={"text-[25px]"}>Service Center</h2>

          <div className={"flex items-center flex-nowrap gap-x-4"}>
            <Link href={"/service-center/add"}>
              <Button type="primary" className={"flex items-center gap-x-2"}>
                <PlusOutlined/>
                <p>Add Service Center</p>
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
            rowKey={"serviceCenterId"}
        >
        </Table>
      </>
  );
}
