'use client'
import {axiosWithAuth} from "@/configs/axios";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import {Button, notification, Popconfirm, Space, Table, Image, Tooltip, Form} from 'antd';
import type {TableProps} from 'antd';
import dayjs from "dayjs";
import Link from "next/link";
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)


const fetchCategories = async () => {
  try {
    const {data} = await axiosWithAuth.get(`${BASEAPI}/slide-editor/get-slide-categories`);
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

interface DataType {
  categoryIdList: number[],
  slideId: number;
  id?: number;
  title: string;
  description: string;
  buttonText: string;
  status: boolean;
  alt: string;
  webImageData: ImageData;
}


const BASEAPI = process.env.NEXT_PUBLIC_API_URL;

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
  id?: undefined | number,
  description?: undefined | string,
  title?: undefined | string,
  buttonText?: undefined | string,
  categoryIdList?: undefined | number[],
}

export default function Slide({searchParams}: IProps) {
  const [filter, setFilter] = useState<IFilter>({
    pageNumber: searchParams.pageNumber || undefined,
    pageSize: searchParams.pageSize || undefined,
    slug: searchParams.slug || undefined,
    description: searchParams.description || undefined,
    title: searchParams.title || undefined,
  });
  const [form] = Form.useForm();
  const Router = useRouter();

  const {data, isLoading, isError, refetch} = useQuery({
    queryKey: ["slide", filter],
    queryFn: () => fetchSlide(filter)
  });

  console.log("სლაიდის data:", data)

  const {data: dataCategories} = useQuery<ICategories[]>({queryKey: ["categories"], queryFn: fetchCategories});

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
      dataIndex: 'description',
      align: "center",
      key: 'description',
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
      title: 'Category (pages)',
      dataIndex: 'categoryIdList',
      key: 'categoryIdList',
      align: "center",
      render: (categories) => {
        return getCategoryNameById(categories) && <p>{getCategoryNameById(categories)?.toString()}</p>
      },
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
      dataIndex: 'webImageUrl',
      key: 'webImageUrl',
      align: "center",
      render: (text) => (
         text ? <Image
              width={100}
              src={text}
              alt={"slide image"}
          />
          : "No Image"
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
              <Link href={`/slide/edit/${record?.id}`}>
                <Button shape="circle" className={"flex items-center justify-center"} icon={<EditOutlined/>}/>
              </Link>
            </Tooltip>

            <Popconfirm
                title="Delete the Slide"
                description="Are you sure to delete this Slide"
                okText={"Yes"}
                onConfirm={() => handleDeleteSlideById(record)}
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

  const handleDeleteSlideById = async (record: DataType): Promise<void> => {
    const {id, title} = record;
    try {
      const res = await axiosWithAuth.delete(`${BASEAPI}/slide-editor/delete-slide/${id}`);
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

  const getCategoryNameById = (arr: number[]): string[] => arr?.map((e): string => {
    return dataCategories?.find((item) => {
      return item?.id === e
    })?.category || ""
  })

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

  const SlidesData = data?.map((item:any) => {
    return {
    key: item.id,
    id: item.id,
    title: item.slideDetails[0].title,
    description: item.slideDetails[0].description,
    webImageUrl: item.slideDetails[0].webImageData.url,
    buttonText: item.slideDetails[0].buttonText,
    categoryIdList: item.categoryIdList
    }
  }  
)

  return (
      <>
        <div className={"w-full p-2 flex justify-between items-center"}>
          <h2 className={"text-[25px]"}>Slides</h2>

          <div className={"flex items-center flex-nowrap gap-x-4"}>
            <Link href={"/slide/add"}>
              <Button type="primary" className={"flex items-center gap-x-2"}>
                <PlusOutlined/>
                <p>Add Slide</p>
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
            dataSource={SlidesData}
            rowKey={"id"}
        >
        </Table>
      </>
  );
}
