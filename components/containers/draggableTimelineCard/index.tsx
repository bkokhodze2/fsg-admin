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


const Test = () => {


  return (
      <div className="flex items-start space-x-4 mt-4">

      </div>
  );
};

export default Test;
