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
import Link from "next/link";
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";

interface DataType {
  id: number,
  key: string | number,
  status: boolean,
  slug: string,
  details?:
  {
    "id": number,
    "customPageid": number,
    "languageId": number,
    "name": string,
    "title": string,
    "subTitle": string,
  }[]
}

const BASEAPI = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 10;

const fetchCustomPage = async (filter: IFilter) => {
  try {
    const {data} = await axiosWithAuth.get(`${BASEAPI}/custom-page-editor/get-custom-pages`);
    return data;
  } catch (error: any) {
    notification.open({
      type: 'error',
      message: `custom page`,
      description:
          'Something went wrong while fetching custom page',
    });

  }
}

const fetchCategories = async () => {
  try {
    const {data} = await axiosWithAuth.get(`${BASEAPI}/custom-page-editor/get-custom-page-categories`);
    return data;
  } catch (error: any) {
    console.log("errr", error)
    notification.open({
      type: 'error',
      message: `categories`,
      description:
          'Something went wrong while fetching categories',
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

export default function CustomPage({searchParams}: IProps) {
  const [isOpenFilter, setIsOpenFilter] = useState<boolean>(false);
  const [filter, setFilter] = useState<IFilter>({
    slug: searchParams.slug || undefined,
    title: searchParams.title || undefined,
    subTitle: searchParams.subTitle || undefined
  });
  const [form] = Form.useForm();
  const Router = useRouter();

  const {data, isLoading, isError, refetch} = useQuery({
    queryKey: ["customPage", filter],
    queryFn: () => fetchCustomPage(filter)
  });

  const {data: dataCategories} = useQuery<ICategories[]>({queryKey: ["categories"], queryFn: fetchCategories});

  useEffect(() => {
    const clearFilter: any = Object.fromEntries(
        Object.entries(filter).filter(([_, value]) => value !== undefined && value !== "")
    );

    const params = new URLSearchParams(clearFilter).toString();

    Router.push(`/custom-page?${params}`)
  }, [filter])

  const getCategoryNameById = (arr: number[]): string[] => arr.map((e): string => {
    return dataCategories?.find((item:any) => {
      return item?.id === e
    })?.category || ""
  })


  const columns: TableProps<DataType>['columns'] = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        align: "center",
        render: (text, obj) => {
          console.log("obj", obj)
          return <p>{obj?.details?.[0]?.name}</p>
        }
    },
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
    {
      title: 'Category (pages)',
      dataIndex: 'categoryIdList',
      key: 'categoryIdList',
      align: "center",
      render: (categories) => {
        return getCategoryNameById(categories) && <p>{getCategoryNameById(categories)?.toString()}</p>
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: "130px",
      align: "center",
      render: (_, record) => (
          <Space size="middle">
            <Tooltip title="Edit" placement={'bottom'}>
              <Link href={`/custom-page/edit/${record?.id}`}>
                <Button shape="circle" className={"flex items-center justify-center"} icon={<EditOutlined/>}/>
              </Link>
            </Tooltip>

            <Popconfirm
                title="Delete the custom page"
                description="Are you sure to delete this custom page?"
                okText={"Yes"}
                onConfirm={() => handleDeleteCustomPageById(record)}
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

  const handleDeleteCustomPageById = async (record: DataType): Promise<void> => {
    const {id} = record;
    try {
      const res = await axiosWithAuth.delete(`${BASEAPI}/custom-page-editor/delete-custom-page/${id}`);
      console.log(res);

      notification.open({
        type: 'success',
        message: `custom page Id - ${id}`,
        description:
            'custom successfully deleted',
      });

      await refetch()

    } catch (error: any) {
      notification.open({
        type: 'error',
        message: `custom page Id - ${id}`,
        description:
            'Something went wrong while deleting custom page',
      });
      console.error('Erroreeeeeee-----------:', error.message); // Log the error
    }
  };
  console.log("filter", filter)

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
          <h2 className={"text-[25px]"}>Custom Page</h2>

          <div className={"flex items-center flex-nowrap gap-x-4"}>
            <Link href={"/custom-page/add"}>
              <Button type="primary" className={"flex items-center gap-x-2"}>
                <PlusOutlined/>
                <p>Add Custom Page</p>
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
            rowKey={"customPageId"}
        >
        </Table>
      </>
  );
}
