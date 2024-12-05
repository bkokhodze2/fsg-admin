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
    timelineItemId?: number;
    id?: number;
  }
  
  interface DataType {
    timelineId: number;
    timelineItemId?: number;
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
    timelineId?: number;
    refetchCardsNewData: any;
  }

  
  interface TimelineCardDataType {
    id?: number;
    timelineItemId?: number;
    title: string;
  }
  
const BASEAPI = process.env.NEXT_PUBLIC_API_URL;

const CardItem: React.FC<ComponentProps> = ({ data, index, refetchCardsNewData }) => {

  const {title, subTitle, imageData, timelineItemId} = data

  const handleDeleteTimelineCardById = async (record: TimelineCardDataType): Promise<void> => {
    const {timelineItemId, title} = record;

    try {
      const res = await axiosWithAuth.delete(`${BASEAPI}/timeline-editor/delete-timeline-item/${timelineItemId}`);
      console.log(res);

    await refetchCardsNewData()

      // await refetch()

    } catch (error: any) {
      notification.open({
        type: 'error',
        message: `timeline - ${title}`,
        description:
            'Something went wrong while deleting timeline card',
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
          <div className="flex justify-between mb-4">
            <div>
              <p className="font-black mb-[10px] textDots1">{title}</p>
              <p className='textDots2'>{subTitle}</p>
            </div>
            <div className='flex gap-x-2.5'>
              <Link href={`/timeline/edit-card/${timelineItemId}`}>
                <Button type="primary">Edit</Button>
              </Link>

              <Popconfirm
                  title="Delete the Timeline Card"
                  description="Are you sure to delete this Timeline Card?"
                  okText={"Yes"}
                  onConfirm={() => handleDeleteTimelineCardById({timelineItemId, title})}
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
