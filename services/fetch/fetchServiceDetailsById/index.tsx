import { axiosWithAuth } from "@/configs/axios";
import { notification } from "antd";

export const fetchServiceDetailsById = async (id: number) => {
  try {
    const { data } = await axiosWithAuth.get(`/services/${id}`);
    return data;
  } catch (error: any) {
    console.log("errr", error);
    notification.open({
      type: "error",
      message: `service center`,
      description: "Something went wrong while fetching service center details",
    });
  }
};
