'use client'
import {axiosWithAuth} from "@/configs/axios";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import {Button, notification, Popconfirm, Space, Table, Image, Tooltip, Form, } from 'antd';
import type {TableProps} from 'antd';
import dayjs from "dayjs";
import Link from "next/link";
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

interface DataType {
  personId?: number,
  id: number,
  key: string | number,
  name: string,
  surname: string,
  content: string,
  imageUrl: string,
  useStartDateTime: number,
  useEndDateTime: number,
  status: boolean,
  slug: string,
  linkedinUrl: string,
  imageData:{
    url: string;
  }
  details:
  {
    "detailid": number,
    "personId": number,
    "name": string,
    "surname": string,
    "languageId": number,
    "status": null,
    "description": string,
    "position": string,
  }[]
}

const BASEAPI = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 10;

const fetchPerson = async (filter: IFilter) => {
  try {
    const {data} = await axiosWithAuth.get(`${BASEAPI}/management-person-editor/get-management-persons`, 
    // {
    //   ...filter,
    //   languageId: 1,
    //   pageSize: parseInt(String(filter.pageSize)) || PAGE_SIZE,
    //   pageNumber: filter?.pageNumber ? (filter?.pageNumber - 1) : 0,
    // }
);
    return data;
  } catch (error: any) {
    notification.open({
      type: 'error',
      message: `person`,
      description:
          'Something went wrong while fetching persons',
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
  name?: undefined | string,
  surname?: undefined | string,
}

export default function ManagementPerson({searchParams}: IProps) {
  const [isOpenFilter, setIsOpenFilter] = useState<boolean>(false);
  const [filter, setFilter] = useState<IFilter>({
    pageNumber: searchParams.pageNumber || undefined,
    pageSize: searchParams.pageSize || undefined,
    slug: searchParams.slug || undefined,
    content: searchParams.content || undefined,
    name: searchParams.name || undefined,
    surname: searchParams.surname || undefined
  });
  const [form] = Form.useForm();
  const Router = useRouter();

  const {data, isLoading, isError, refetch} = useQuery({
    queryKey: ["management", filter],
    queryFn: () => fetchPerson(filter)
  });

  useEffect(() => {
    const clearFilter: any = Object.fromEntries(
        Object.entries(filter).filter(([_, value]) => value !== undefined && value !== "")
    );

    const params = new URLSearchParams(clearFilter).toString();

    Router.push(`/management?${params}`)
  }, [filter])

  console.log('personsDataa', data)


  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'Name / Surname',
      dataIndex: 'name',
      key: 'name',
      align: "center",
      render: (text, obj) => {
        console.log("obj", obj)
        return <p>{obj?.details?.[0]?.name} / {obj?.details?.[0]?.surname}</p>
      }
    },
    {
        title: 'Description',
        dataIndex: 'description',
        align: "center",
        key: 'description',
        render: (text, obj) => (
            <Tooltip 
                placement="bottom"
                destroyTooltipOnHide={true}
                overlayInnerStyle={{
                width: "500px",
                maxHeight: "600px",
                overflowY: "scroll"
                }}
                overlayClassName={"w-[500px]"}
                className={""}
                title={() => <div dangerouslySetInnerHTML={{__html: obj?.details?.[0]?.description}}/>}>
                <div
                className={'textDots2 cursor-zoom-in'}
                dangerouslySetInnerHTML={{__html: obj?.details?.[0]?.description}}
                />
            </Tooltip>
        )
      },
    {
        title: 'Position',
        dataIndex: 'position',
        align: "center",
        key: 'position',
        render: (text, obj) => {
          console.log("obj", obj)
          return <p>{obj?.details?.[0]?.position}</p>
        }
    },
    {
        title: 'Slug',
        dataIndex: 'slug',
        align: "center",
        key: 'slug',
        render: (text, obj) => {
          console.log("obj", obj)
          return <p>{obj?.slug}</p>
        }
    },

    {
        title: 'Image',
        dataIndex: 'imageUrl',
        key: 'imageUrl',
        align: "center",
  
        render: (text, obj) => (
            <Image
                width={100}
                src={obj?.imageData?.url}
                alt={"person image"}
            />
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
              <Link href={`/management/edit/${record?.id}`}>
                <Button shape="circle" className={"flex items-center justify-center"} icon={<EditOutlined/>}/>
              </Link>
            </Tooltip>

            <Popconfirm
                title="Delete the Person info"
                description="Are you sure to delete this Person info?"
                okText={"Yes"}
                onConfirm={() => handleDeletePersonById(record)}
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

  const handleDeletePersonById = async (record: DataType): Promise<void> => {
    const {id} = record;
    try {
      const res = await axiosWithAuth.delete(`${BASEAPI}/management-person-editor/delete-management-person/${id}`);
      console.log(res);

      notification.open({
        type: 'success',
        message: `person Id - ${id}`,
        description:
            'person successfully deleted',
      });

      await refetch()

    } catch (error: any) {
      notification.open({
        type: 'error',
        message: `person Id - ${id}`,
        description:
            'Something went wrong while deleting person',
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

    // Router.push(`/management?page=${page}`)
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
          <h2 className={"text-[25px]"}>Management Persons</h2>

          <div className={"flex items-center flex-nowrap gap-x-4"}>
            <Link href={"/management/add"}>
              <Button type="primary" className={"flex items-center gap-x-2"}>
                <PlusOutlined/>
                <p>Add Person</p>
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
            rowKey={"personId"}
        >
        </Table>
      </>
  );
}
