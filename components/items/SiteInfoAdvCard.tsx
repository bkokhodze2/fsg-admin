import React from 'react';
import {axiosWithAuth} from "@/configs/axios";
import {Card, Button, Popconfirm, Tooltip, notification} from 'antd';
import {
  DeleteOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

import Link from "next/link";

const {Meta} = Card;
  
const BASEAPI = process.env.NEXT_PUBLIC_API_URL;

const CardItem: React.FC<any> = ({ data, index, refetchCardsNewData, id }) => {

    console.log('ADV card data:::', data)

  const {description, description2} = data


  const handleDeleteInfoAdvCardById = async (record: any): Promise<void> => {
    const {id} = record;

    try {
      const res = await axiosWithAuth.delete(`${BASEAPI}/site-info-editor/delete-site-info-adv/${id}`);
      console.log(res);

    await refetchCardsNewData()

      // await refetch()

    } catch (error: any) {
      notification.open({
        type: 'error',
        message: `info adv ${id}`,
        description:
            'Something went wrong while deleting info adv card',
      });
      console.error('Erroreeeeeee-----------:', error.message);
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
          <div className="flex justify-between items-center mb-4">

            <div>
              <h4 className={"text-black text-[22px]"}>
                {description2}
              </h4>

              <div
                  className={`text-black textDots8`}
                  dangerouslySetInnerHTML={{__html: description}}/>

              {/*<p className={"textDots8 text-gray-600 text-[16px]"}>{}</p>*/}
            </div>


            {/*<Meta className={"textDots8"} title={description} description={description2}/>*/}
            <div className='flex gap-x-2.5'>
              <Link href={`/site-info/edit-info-adv/${id}`}>
                <Button type="primary">Edit</Button>
              </Link>

              <Popconfirm
                  title="Delete the Info Adv Card"
                  description="Are you sure to delete this Info Adv Card?"
                  okText={"Yes"}
                  onConfirm={() => handleDeleteInfoAdvCardById({id})}
                  icon={<QuestionCircleOutlined style={{color: 'red'}}/>}
              >
                <Tooltip title="Delete" placement={'bottom'}>
                  <Button danger shape="circle" className={"flex items-center justify-center"}
                          icon={<DeleteOutlined/>}/>
                </Tooltip>
              </Popconfirm>
            </div>
          </div>
        </Card>
      </div>
  );
};

export default CardItem;
