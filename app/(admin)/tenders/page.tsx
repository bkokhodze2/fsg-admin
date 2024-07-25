'use client'
import { axiosWithAuth } from "@/configs/axios";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, notification, Popconfirm, Space, Table, Tooltip, Badge, Dropdown } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

interface DataType {
  id: number,
  status: boolean,
  details?: {
    "tenderId": number,
    "title": string,
    "subTitle": string,
    "languageId": number,
  }[]
}

interface ExpandedDataType {
  key: React.Key;
  documentTitle: string;
  formOfSupplying: string;
}

const items = [
  { key: '1', label: 'Action 1' },
  { key: '2', label: 'Action 2' },
];

const BASEAPI = process.env.NEXT_PUBLIC_API_URL;

const fetchTenders = async (filter: IFilter) => {
  try {
    const { data } = await axiosWithAuth.get(`${BASEAPI}/tender-editor/get-tenders`);
    return data;
  } catch (error: any) {
    notification.open({
      type: 'error',
      message: `Tenders`,
      description: 'Something went wrong while fetching Tenders',
    });
  }
}

const fetchTenderDocs = async (tenderId: number) => {
  try {
    const { data } = await axiosWithAuth.get(`${BASEAPI}/tender-editor/get-tender-documents?tenderId=${tenderId}`);
    return data;
  } catch (error: any) {
    notification.open({
      type: 'error',
      message: `Tenders`,
      description: 'Something went wrong while fetching Tender Documents',
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

export default function TendersPage({ searchParams }: IProps) {

  const [filter, setFilter] = useState<IFilter>({
    slug: searchParams.slug || undefined,
    content: searchParams.content || undefined,
    title: searchParams.title || undefined,
    subTitle: searchParams.subTitle || undefined
  });

  const [expandedRows, setExpandedRows] = useState<Record<number, ExpandedDataType[]>>({});

  const Router = useRouter();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["tender", filter],
    queryFn: () => fetchTenders(filter)
  });

  useEffect(() => {
    const clearFilter: any = Object.fromEntries(
      Object.entries(filter).filter(([_, value]) => value !== undefined && value !== "")
    );

    const params = new URLSearchParams(clearFilter).toString();

    Router.push(`/tenders?${params}`)
  }, [filter]);

  const handleExpand = async (expanded: boolean, record: DataType) => {
    if (expanded && !expandedRows[record.id]) {
      const tenderDocsData = await fetchTenderDocs(record.id);
      if (tenderDocsData) {
        const expandedData = tenderDocsData.map((item: any) => item.documentDetails?.[0])?.map((e: any) => {
          return ({
            key: e.id,
            tenderDocumentId: e.tenderDocumentId,
            documentTitle: e.documentTitle,
            formOfSupplying: e.formOfSupplying,
          })
      });
        setExpandedRows((prev) => ({ ...prev, [record.id]: expandedData }));
      }
    }
  };

  const expandedRowRender = (record: DataType) => {
    const columns: TableColumnsType<ExpandedDataType> = [
      {
        title: 'Document Title',
        dataIndex: 'documentTitle',
        key: 'documentTitle',
      },
      {
        title: 'Form of Supplying',
        dataIndex: 'formOfSupplying',
        key: 'formOfSupplying',
      },
      {
        title: 'Action',
        key: 'operation',
        render: (e) => {
          console.log("e", e)
          return (
            <>
              <Space size="middle">
                <Tooltip title="Edit" placement={'bottom'}>
                  <Link href={`/tenders/edit-tender-doc/${e.tenderDocumentId}`}>
                    <Button shape="circle" className={"flex items-center justify-center"} icon={<EditOutlined />} />
                  </Link>
                </Tooltip>
                <Popconfirm
                  title="Delete the Tender"
                  description="Are you sure to delete this Tender?"
                  okText={"Yes"}
                  onConfirm={() => handleDeleteTenderDocById(e.tenderDocumentId)}
                  icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                >
                  <Tooltip title="Delete" placement={'bottom'}>
                    <Button danger shape="circle" className={"flex items-center justify-center"} icon={<DeleteOutlined />} />
                  </Tooltip>
                </Popconfirm>
              </Space>
            </>
          )
        },
      },
    ];

    const data = expandedRows[record.id] || [];

    return (
      <>
        <Table columns={columns} dataSource={data} pagination={false} />
        <div className={"flex items-center justify-center flex-nowrap gap-x-4 mt-[12px]"}>
          <Link href={`/tenders/add-tender-doc?tenderId=${record.id}`}>
            <Button type="primary" className={"flex items-center gap-x-2"}>
              <PlusOutlined />
              <p>Add Tender Doc</p>
            </Button>
          </Link>
        </div>
      </>
    )
  };

  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      align: "center",
      render: (text, obj) => obj?.details?.[0]?.title,
    },
    {
      title: 'SubTitle',
      dataIndex: 'subTitle',
      align: "center",
      key: 'subTitle',
      render: (text, obj) => obj?.details?.[0]?.subTitle,
    },
    {
      title: 'Action',
      key: 'action',
      width: "130px",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit" placement={'bottom'}>
            <Link href={`/tenders/edit/${record?.id}`}>
              <Button shape="circle" className={"flex items-center justify-center"} icon={<EditOutlined />} />
            </Link>
          </Tooltip>
          <Popconfirm
            title="Delete the Tender"
            description="Are you sure to delete this Tender?"
            okText={"Yes"}
            onConfirm={() => handleDeleteTenderById(record)}
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
          >
            <Tooltip title="Delete" placement={'bottom'}>
              <Button danger shape="circle" className={"flex items-center justify-center"} icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleDeleteTenderById = async (record: DataType): Promise<void> => {
    const { id } = record;
    try {
      const res = await axiosWithAuth.delete(`${BASEAPI}/tender-editor/delete-tender/${id}`);
      notification.open({
        type: 'success',
        message: `Tender Id - ${id}`,
        description: 'Tender successfully deleted',
      });
      await refetch();
    } catch (error: any) {
      notification.open({
        type: 'error',
        message: `Tender Id - ${id}`,
        description: 'Something went wrong while deleting Tender',
      });
      console.error('Erroreeeeeee-----------:', error.message);
    }
  };

  const handleDeleteTenderDocById = async (tenderDocId: number): Promise<void> => {
    try {
      const res = await axiosWithAuth.delete(`${BASEAPI}/api/tender-editor/delete-tender-document/${tenderDocId}`);
      notification.open({
        type: 'success',
        message: `Tender Id - ${tenderDocId}`,
        description: 'Tender successfully deleted',
      });
      await refetch();
    } catch (error: any) {
      notification.open({
        type: 'error',
        message: `Tender Id - ${tenderDocId}`,
        description: 'Something went wrong while deleting Tender',
      });
      console.error('Erroreeeeeee-----------:', error.message);
    }
  };

  const onChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter, extra) => {
    if (filter.pageSize !== undefined && filter.pageSize !== pagination.pageSize) {
      setFilter((prevState: IFilter) => ({
        ...prevState,
        pageNumber: 1,
        pageSize: pagination.pageSize
      }));
    } else {
      setFilter((prevState: IFilter) => ({
        ...prevState,
        pageNumber: pagination.current,
        pageSize: pagination.pageSize
      }));
    }
  };

  return (
    <>
      <div className={"w-full p-2 flex justify-between items-center"}>
        <h2 className={"text-[25px]"}>Tenders</h2>
        <div className={"flex items-center flex-nowrap gap-x-4"}>
          <Link href={"/tenders/add"}>
            <Button type="primary" className={"flex items-center gap-x-2"}>
              <PlusOutlined />
              <p>Add Tender</p>
            </Button>
          </Link>
        </div>
      </div>
      <Table
        onChange={onChange}
        sticky={{ offsetHeader: 4 }}
        loading={isLoading}
        expandable={{
          expandedRowRender,
          onExpand: handleExpand,
        }}
        columns={columns}
        dataSource={data}
        rowKey={"id"}
      />
    </>
  );
}
