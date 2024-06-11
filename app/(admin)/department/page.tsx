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
  id: number,
  status: boolean,
  departmentMail: string,
  useInContactUs: boolean,
  useInGetInTouch: boolean,
  useInVacancy: boolean,
  details?:
  {
    "detailid": number,
    "departmentId": number,
    "departmentName": string,
    "description": string,
    "languageId": number,
  }[]
}

const BASEAPI = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 10;

const fetchDepartment = async (filter: IFilter) => {
  try {
    const {data} = await axiosWithAuth.get(`${BASEAPI}/department-editor/get-departments`);
    return data;
  } catch (error: any) {
    notification.open({
      type: 'error',
      message: `department`,
      description:
          'Something went wrong while fetching department',
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
  departmentName?: undefined | string,
  description?: undefined | string,
}

export default function Department({searchParams}: IProps) {
  const [isOpenFilter, setIsOpenFilter] = useState<boolean>(false);
  const [filter, setFilter] = useState<IFilter>({
    pageNumber: searchParams.pageNumber || undefined,
    pageSize: searchParams.pageSize || undefined,
    slug: searchParams.slug || undefined,
    content: searchParams.content || undefined,
    departmentName: searchParams.departmentName || undefined,
    description: searchParams.description || undefined
  });
  const [form] = Form.useForm();
  const Router = useRouter();

  const {data, isLoading, isError, refetch} = useQuery({
    queryKey: ["department", filter],
    queryFn: () => fetchDepartment(filter)
  });

  useEffect(() => {
    const clearFilter: any = Object.fromEntries(
        Object.entries(filter).filter(([_, value]) => value !== undefined && value !== "")
    );

    const params = new URLSearchParams(clearFilter).toString();

    Router.push(`/department?${params}`)
  }, [filter])


  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'Department Name',
      dataIndex: 'departmentName',
      key: 'departmentName',
      align: "center",
      render: (text, obj) => {
        console.log("obj", obj)
        return <p>{obj?.details?.[0]?.departmentName}</p>
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
        title: 'Department Mail',
        dataIndex: 'departmentMail',
        align: "center",
        key: 'departmentMail',
        render: (text, obj) => {
          console.log("obj", obj)
          return <p>{obj?.departmentMail}</p>
        }
      },
    {
      title: 'Action',
      key: 'action',
      width: "130px",
      align: "center",
      render: (_, record) => (
          <Space size="middle">
            <Tooltip title="Edit" placement={'bottom'}>
              <Link href={`/department/edit/${record?.id}`}>
                <Button shape="circle" className={"flex items-center justify-center"} icon={<EditOutlined/>}/>
              </Link>
            </Tooltip>

            <Popconfirm
                title="Delete the Department"
                description="Are you sure to delete this Department?"
                okText={"Yes"}
                onConfirm={() => handleDeleteDepartmentById(record)}
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

  const handleDeleteDepartmentById = async (record: DataType): Promise<void> => {
    const {id} = record;
    try {
      const res = await axiosWithAuth.delete(`${BASEAPI}/department-editor/delete-department/${id}`);
      console.log(res);

      notification.open({
        type: 'success',
        message: `Department Id - ${id}`,
        description:
            'Department successfully deleted',
      });

      await refetch()

    } catch (error: any) {
      notification.open({
        type: 'error',
        message: `Department Id - ${id}`,
        description:
            'Something went wrong while deleting Department',
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

    // Router.push(`/department?page=${page}`)
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
          <h2 className={"text-[25px]"}>Department</h2>

          <div className={"flex items-center flex-nowrap gap-x-4"}>
            <Link href={"/department/add"}>
              <Button type="primary" className={"flex items-center gap-x-2"}>
                <PlusOutlined/>
                <p>Add Department</p>
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
            rowKey={"departmentId"}
        >
        </Table>
      </>
  );
}
