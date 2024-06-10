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
  departmentId: number ,
  details?:
  {
    "id": number,
    "jobVacancyId": number,
    "languageId": number,
    "jobTitle": string,
    "location": string,
    "shortDescription": string,
    "fullDescription": string,
    "client": string,
    "role": string,
    "date": number,
  }[]
}

const BASEAPI = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 10;

const fetchJobVacancy = async (filter: IFilter) => {
  try {
    const {data} = await axiosWithAuth.get(`${BASEAPI}/job-vacancy-editor/get-job-vacancies`);
    return data;
  } catch (error: any) {
    notification.open({
      type: 'error',
      message: `job vacancy`,
      description:
          'Something went wrong while fetching job vacancy',
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
  answer?: undefined | string,
  question?: undefined | string,
}

export default function JobVacancy({searchParams}: IProps) {
  const [isOpenFilter, setIsOpenFilter] = useState<boolean>(false);
  const [filter, setFilter] = useState<IFilter>({
    pageNumber: searchParams.pageNumber || undefined,
    pageSize: searchParams.pageSize || undefined,
    slug: searchParams.slug || undefined,
    content: searchParams.content || undefined,
    answer: searchParams.answer || undefined,
    question: searchParams.question || undefined
  });
  const [form] = Form.useForm();
  const Router = useRouter();

  const {data, isLoading, isError, refetch} = useQuery({
    queryKey: ["jobVacancy", filter],
    queryFn: () => fetchJobVacancy(filter)
  });

  useEffect(() => {
    const clearFilter: any = Object.fromEntries(
        Object.entries(filter).filter(([_, value]) => value !== undefined && value !== "")
    );

    const params = new URLSearchParams(clearFilter).toString();

    Router.push(`/job-vacancy?${params}`)
  }, [filter])


  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'Job title',
      dataIndex: 'jobTitle',
      key: 'jobTitle',
      align: "center",
      render: (text, obj) => {
        console.log("obj", obj)
        return <p>{obj?.details?.[0]?.jobTitle}</p>
      }
    },
    {
      title: 'client',
      dataIndex: 'client',
      align: "center",
      key: 'client',
      render: (text, obj) => {
        console.log("obj", obj)
        return <p>{obj?.details?.[0]?.client}</p>
      }
    },
    {
      title: 'role',
      dataIndex: 'role',
      align: "center",
      key: 'role',
      render: (text, obj) => {
        console.log("obj", obj)
        return <p>{obj?.details?.[0]?.role}</p>
      }
    },
    {
      title: 'location',
      dataIndex: 'location',
      align: "center",
      key: 'location',
      render: (text, obj) => {
        console.log("obj", obj)
        return <p>{obj?.details?.[0]?.location}</p>
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
              <Link href={`/job-vacancy/edit/${record?.id}`}>
                <Button shape="circle" className={"flex items-center justify-center"} icon={<EditOutlined/>}/>
              </Link>
            </Tooltip>

            <Popconfirm
                title="Delete the Job Vacancy"
                description="Are you sure to delete this Job Vacancy?"
                okText={"Yes"}
                onConfirm={() => handleDeleteJobVacancyById(record)}
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

  const handleDeleteJobVacancyById = async (record: DataType): Promise<void> => {
    const {id} = record;
    try {
      const res = await axiosWithAuth.delete(`${BASEAPI}/job-vacancy-editor/delete-job-vacancy/${id}`);
      console.log(res);

      notification.open({
        type: 'success',
        message: `job vacancy Id - ${id}`,
        description:
            'Job vacancy successfully deleted',
      });

      await refetch()

    } catch (error: any) {
      notification.open({
        type: 'error',
        message: `Job vacancy Id - ${id}`,
        description:
            'Something went wrong while deleting job vacancy',
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

    // Router.push(`/job-vacancy?page=${page}`)
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
          <h2 className={"text-[25px]"}>Job Vacancy</h2>

          <div className={"flex items-center flex-nowrap gap-x-4"}>
            <Link href={"/job-vacancy/add"}>
              <Button type="primary" className={"flex items-center gap-x-2"}>
                <PlusOutlined/>
                <p>Add Job Vacancy</p>
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
            rowKey={"jobVacancyId"}
        >
        </Table>
      </>
  );
}
