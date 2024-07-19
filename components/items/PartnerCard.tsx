import React from 'react';
import {axiosWithAuth} from "@/configs/axios";
import {Card, Button, Popconfirm, Tooltip, notification} from 'antd';
import {
  DeleteOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

import Link from "next/link";

const {Meta} = Card;

interface ImageData {
    size?: number;
    originalFileName?: string;
    imageName?: string;
    contentType?: string;
    url?: string;
  }
  
  interface CardItemProps {
    title: string;
    subTitle?: string;
    imageData?: ImageData;
    id?: number;
  }
  
  interface DataType {
    partnerId: number;
    id?: number;
    title: string;
    description: string;
    buttonText: string;
    status: boolean;
    alt: string;
    webImageData: ImageData;
  }

  interface ComponentProps {
    data: CardItemProps;
    index: number;
    partnerId?: number;
    refetchCardsNewData: any;
  }

  
  interface PartnerCardDataType {
    id?: number;
  }
  
const BASEAPI = process.env.NEXT_PUBLIC_API_URL;

const CardItem: React.FC<ComponentProps> = ({ data, index, refetchCardsNewData }) => {

    const {imageData, id} = data

  const handleDeletePartnerCardById = async (record: PartnerCardDataType): Promise<void> => {
    const {id} = record;

    try {
      const res = await axiosWithAuth.delete(`${BASEAPI}/partner-editor/delete-partner-item/${id}`);
      console.log(res);

    await refetchCardsNewData()

      // await refetch()

    } catch (error: any) {
      notification.open({
        type: 'error',
        message: `partner`,
        description:
            'Something went wrong while deleting partner card',
      });
      console.error('Erroreeeeeee-----------:', error.message); // Log the error
    }
  };

  return (
      <div className="flex items-start space-x-4 mt-4">
        <div
            className="flex items-center justify-center min-w-10 w-10 min-h-10 h-10 bg-slate-200 rounded-full">
          <h1
              className="text-xl">
            {index}
          </h1>
        </div>
        <Card
            hoverable
            className="flex flex-col justify-between w-full">
          <div className="flex justify-end items-center mb-4">
            <div className='flex gap-x-2.5'>
              <Link href={`/partners/edit-partner/${id}`}>
                <Button type="primary">Edit</Button>
              </Link>

              <Popconfirm
                  title="Delete the Partner Card"
                  description="Are you sure to delete this Partner Card?"
                  okText={"Yes"}
                  onConfirm={() => handleDeletePartnerCardById({id})}
                  icon={<QuestionCircleOutlined style={{color: 'red'}}/>}
              >
                <Tooltip title="Delete" placement={'bottom'}>
                  <Button danger shape="circle" className={"flex items-center justify-center"}
                          icon={<DeleteOutlined/>}/>
                </Tooltip>
              </Popconfirm>
            </div>
          </div>

          {imageData?.url &&
              <img alt={imageData.originalFileName} src={imageData.url} className="mt-4 w-full object-cover h-48 rounded-lg"/>}
        </Card>
      </div>
  );
};

export default CardItem;
