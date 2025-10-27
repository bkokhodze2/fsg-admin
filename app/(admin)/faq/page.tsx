"use client";
import { axiosWithAuth } from "@/configs/axios";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  notification,
  Popconfirm,
  Space,
  Table,
  Tooltip,
  Form,
} from "antd";
import type { TableProps } from "antd";
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

var customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

interface DataType {
  _id: string;
  active: boolean;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  translations: {
    languageId: number;
    question: string;
    answer: string;
    _id: string;
  }[];
}

const BASEAPI = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 10;

const fetchFaq = async (filter: IFilter) => {
  try {
    const { data } = await axiosWithAuth.get(
      `${BASEAPI}/questions?languageId=1&limit=${filter.pageSize}&page=${filter.pageNumber}`
    );
    return data;
  } catch (error: any) {
    notification.open({
      type: "error",
      message: `faq`,
      description: "Something went wrong while fetching faq",
    });
  }
};

interface IProps {
  searchParams: IFilter;
}

interface IFilter {
  pageNumber?: number;
  pageSize?: number;
  slug?: undefined | string;
  content?: undefined | string;
  answer?: undefined | string;
  question?: undefined | string;
}

export default function Faq({ searchParams }: IProps) {
  const [isOpenFilter, setIsOpenFilter] = useState<boolean>(false);
  const [filter, setFilter] = useState<IFilter>({
    pageNumber: searchParams.pageNumber || 1,
    pageSize: searchParams.pageSize || PAGE_SIZE,
    slug: searchParams.slug || undefined,
    content: searchParams.content || undefined,
    answer: searchParams.answer || undefined,
    question: searchParams.question || undefined,
  });
  const [form] = Form.useForm();
  const Router = useRouter();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["faq", filter],
    queryFn: () => fetchFaq(filter),
  });

  console.log("data faq", data);

  useEffect(() => {
    const clearFilter: any = Object.fromEntries(
      Object.entries(filter).filter(
        ([_, value]) => value !== undefined && value !== ""
      )
    );

    const params = new URLSearchParams(clearFilter).toString();

    Router.push(`/faq?${params}`);
  }, [filter]);

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "answer",
      dataIndex: "answer",
      key: "answer",
      align: "center",
      render: (text, obj) => {
        return <p>{obj?.translations?.[0]?.answer}</p>;
      },
    },
    {
      title: "question",
      dataIndex: "question",
      align: "center",
      key: "question",
      render: (text, obj) => {
        return <p>{obj?.translations?.[0]?.question}</p>;
      },
    },
    {
      title: "Action",
      key: "action",
      width: "130px",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit" placement={"bottom"}>
            <Link href={`/faq/edit/${record?._id}`}>
              <Button
                shape="circle"
                className={"flex items-center justify-center"}
                icon={<EditOutlined />}
              />
            </Link>
          </Tooltip>

          <Popconfirm
            title="Delete the Faq"
            description="Are you sure to delete this Faq?"
            okText={"Yes"}
            onConfirm={() => handleDeleteFaqById(record)}
            icon={<QuestionCircleOutlined style={{ color: "red" }} />}
          >
            <Tooltip title="Delete" placement={"bottom"}>
              <Button
                danger
                shape="circle"
                className={"flex items-center justify-center"}
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleDeleteFaqById = async (record: DataType): Promise<void> => {
    const { _id } = record;
    try {
      const res = await axiosWithAuth.delete(`${BASEAPI}/questions/${_id}`);
      console.log(res);

      notification.open({
        type: "success",
        message: `faq Id - ${_id}`,
        description: "Faq successfully deleted",
      });

      await refetch();
    } catch (error: any) {
      notification.open({
        type: "error",
        message: `faq Id - ${_id}`,
        description: "Something went wrong while deleting faq",
      });
      console.error("Erroreeeeeee-----------:", error.message); // Log the error
    }
  };
  console.log("filter", filter);

  const onSubmit = (values: IFilter) => {
    setFilter((prevState: IFilter) => ({
      ...prevState,
      ...values,
      pageNumber: 1,
    }));

    setIsOpenFilter(false);
  };
  const onReset = () => {
    setFilter({ pageNumber: filter.pageNumber, pageSize: filter.pageSize });

    // Router.push(`/faq?page=${page}`)
    setIsOpenFilter(false);
    setTimeout(() => {
      form.resetFields();
    }, 100);
  };

  const onChange: TableProps<DataType>["onChange"] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    console.log("params", pagination);

    if (
      filter.pageSize !== undefined &&
      filter.pageSize != pagination.pageSize
    ) {
      setFilter((prevState: IFilter) => ({
        ...prevState,
        pageNumber: 1,
        pageSize: pagination.pageSize,
      }));
    } else {
      setFilter((prevState: IFilter) => ({
        ...prevState,
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
      }));
    }
  };

  return (
    <>
      <div className={"w-full p-2 flex justify-between items-center"}>
        <h2 className={"text-[25px]"}>Faq</h2>

        <div className={"flex items-center flex-nowrap gap-x-4"}>
          <Link href={"/faq/add"}>
            <Button type="primary" className={"flex items-center gap-x-2"}>
              <PlusOutlined />
              <p>Add Faq</p>
            </Button>
          </Link>
        </div>
      </div>
      <Table
        onChange={onChange}
        sticky={{ offsetHeader: 4 }}
        scroll={{
          x: 200,
          y: "70vh",
        }}
        loading={isLoading}
        columns={columns}
        pagination={{
          total: data?.totalItems,
          current: filter.pageNumber,
          pageSize: filter.pageSize || PAGE_SIZE,
          showQuickJumper: false,
          showSizeChanger: true,
          position: ["bottomCenter"],
          // itemRender: itemRender,
        }}
        dataSource={data?.data}
        rowKey={"_id"}
      ></Table>
    </>
  );
}
