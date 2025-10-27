import { axiosWithAuth } from "@/configs/axios";
import notification from "antd/es/notification";

const BASEAPI = process.env.NEXT_PUBLIC_API_URL;

export const fetchLanguages = async () => {
  try {
    const { data } = await axiosWithAuth.get(`${BASEAPI}/languages`);
    return data;
  } catch (error: any) {
    console.log("errr", error);
    notification.open({
      type: "error",
      message: `languages`,
      description: "Something went wrong while fetching languages",
    });
  }
};
