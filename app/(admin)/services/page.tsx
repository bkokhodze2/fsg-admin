"use client";
import { axiosWithAuth } from "@/configs/axios";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  HolderOutlined,
} from "@ant-design/icons";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  notification,
  Popconfirm,
  Space,
  Table,
  Tooltip,
  Form,
  Image,
} from "antd";
import type { TableProps } from "antd";
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useContext, useMemo } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { DndContext } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { IFilter } from "@/@types/IServices";
import { fetchServiceCenter } from "@/services/fetch/fetchServices";

var customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

interface DataType {
  serviceCenterId?: number;
  _id: number;
  key: string | number;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  useStartDateTime: number;
  useEndDateTime: number;
  status: boolean;
  latitude: number;
  longitude: number;
  imageData: {
    url: string;
  };
  details?: {
    title: string;
    description: string;
    location: string;
    languageId: number;
  }[];
}

const BASEAPI = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 10;

interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}

const RowContext = React.createContext<RowContextProps>({});

const DragHandle: React.FC = () => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);
  return (
    <Button
      type="text"
      size="small"
      icon={<HolderOutlined />}
      style={{ cursor: "move" }}
      ref={setActivatorNodeRef}
      {...listeners}
    />
  );
};

const initialData: DataType[] = [];

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  "data-row-key": string;
}

const Row: React.FC<RowProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props["data-row-key"] });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(
      transform && { ...transform, scaleY: 1.05 }
    ),
    transition,
    position: isDragging ? "relative" : "static",
    zIndex: isDragging ? 9999 : "auto",
  };

  const contextValue = useMemo<RowContextProps>(
    () => ({ setActivatorNodeRef, listeners }),
    [setActivatorNodeRef, listeners]
  );

  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
};

interface IProps {
  searchParams: IFilter;
}

export default function ServiceCenter({ searchParams }: IProps) {
  const [isOpenFilter, setIsOpenFilter] = useState<boolean>(false);
  const [dataSource, setDataSource] = React.useState<DataType[]>(initialData);
  const [filter, setFilter] = useState<IFilter>({
    pageNumber: searchParams.pageNumber || undefined,
    pageSize: PAGE_SIZE || undefined,
    slug: searchParams.slug || undefined,
    content: searchParams.content || undefined,
    title: searchParams.title || undefined,
    description: searchParams.description || undefined,
  });
  const [form] = Form.useForm();
  const Router = useRouter();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["serviceCenter", filter],
    queryFn: () => fetchServiceCenter(filter),
  });

  console.log("data service center", data);

  useEffect(() => {
    const clearFilter: any = Object.fromEntries(
      Object.entries(filter).filter(
        ([_, value]) => value !== undefined && value !== ""
      )
    );

    const params = new URLSearchParams(clearFilter).toString();

    // Router.push(`/service-center?${params}`);
  }, [filter]);

  const columns: TableProps<any>["columns"] = [
    { key: "sort", align: "center", width: 80, render: () => <DragHandle /> },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      align: "center",
      render: (text, obj) => obj?.translations?.[0]?.title || "-",
    },
    {
      title: "Sub Title",
      dataIndex: "subTitle",
      key: "subTitle",
      align: "center",
      render: (text, obj) => obj?.translations?.[0]?.subTitle || "-",
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      align: "center",
      render: (text, obj) => obj?.slug || "-",
    },
    {
      title: "Category",
      dataIndex: "categoryId",
      key: "categoryId",
      align: "center",
      render: (text, obj) => obj?.categoryId || "-",
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      align: "center",
      render: (text, obj) =>
        obj?.image?.url ? (
          <Image width={100} src={obj.image.url} alt={"service image"} />
        ) : (
          "No Image"
        ),
    },
    {
      title: "Active",
      dataIndex: "active",
      key: "active",
      align: "center",
      render: (text, obj) => (obj?.active ? "Yes" : "No"),
    },
    {
      title: "Action",
      key: "action",
      width: "130px",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit" placement={"bottom"}>
            <Link href={`/services/edit/${record?._id}`}>
              <Button
                shape="circle"
                className={"flex items-center justify-center"}
                icon={<EditOutlined />}
              />
            </Link>
          </Tooltip>
          <Popconfirm
            title="Delete the service center"
            description="Are you sure to delete this service center?"
            okText={"Yes"}
            onConfirm={() => handleDeleteServiceCenterById(record)}
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

  useEffect(() => {
    if (data?.data) setDataSource(data.data);
  }, [data]);

  const handleDeleteServiceCenterById = async (
    record: DataType
  ): Promise<void> => {
    const { _id: id } = record;
    try {
      const res = await axiosWithAuth.delete(`${BASEAPI}/services/${id}`);
      console.log(res);

      notification.open({
        type: "success",
        message: `service Id - ${id}`,
        description: "service successfully deleted",
      });
      await refetch();
    } catch (error: any) {
      notification.open({
        type: "error",
        message: `service Id - ${id}`,
        description: "Something went wrong while deleting service center",
      });
    }
  };

  // const onSubmit = (values: IFilter) => {
  //   setFilter((prevState: IFilter) => ({
  //     ...prevState,
  //     ...values,
  //     pageNumber: 1,
  //   }));

  //   setIsOpenFilter(false);
  // };
  // const onReset = () => {
  //   setFilter({ pageNumber: filter.pageNumber, pageSize: filter.pageSize });

  //   // Router.push(`/service-center?page=${page}`)
  //   setIsOpenFilter(false);
  //   setTimeout(() => {
  //     form.resetFields();
  //   }, 100);
  // };

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

  const postSortedData = async (sortedData: DataType[]) => {
    const sortElements = sortedData.map((item, index) => item._id);
    try {
      await axiosWithAuth.post("/services/reorder", {
        order: sortElements,
      });
    } catch (error) {
      console.error("Error posting sorted data:", error);
    }
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setDataSource((prevState) => {
        const activeIndex = prevState.findIndex(
          (item) => item._id === active?.id
        );
        const overIndex = prevState.findIndex((item) => item._id === over?.id);
        const newData = arrayMove(prevState, activeIndex, overIndex);
        return newData;
      });
    }
  };

  return (
    <>
      <div className={"w-full p-2 flex justify-between items-center"}>
        <h2 className={"text-[25px]"}>Services</h2>
        <div className={"flex items-center flex-nowrap gap-x-4"}>
          {dataSource?.length > 1 && (
            <Button
              type="primary"
              className=""
              onClick={() => postSortedData(dataSource)}
            >
              Save Services Ordering
            </Button>
          )}
          <Link href={"/services/add"}>
            <Button type="primary" className={"flex items-center gap-x-2"}>
              <PlusOutlined />
              <p>Add Service</p>
            </Button>
          </Link>
        </div>
      </div>
      <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
        <SortableContext
          items={dataSource.map((i: any) => i.id)}
          strategy={verticalListSortingStrategy}
        >
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
              current: data?.currentPage,
              pageSize: data?.limit || PAGE_SIZE,
              showQuickJumper: false,
              showSizeChanger: true,
              position: ["bottomCenter"],
            }}
            dataSource={dataSource}
            rowKey={"_id"}
            components={{ body: { row: Row } }}
          ></Table>
        </SortableContext>
      </DndContext>
    </>
  );
}
