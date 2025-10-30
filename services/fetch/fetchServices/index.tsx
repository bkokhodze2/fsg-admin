import { IFilter } from "@/@types/IServices";
import { axiosWithAuth } from "@/configs/axios";
import { notification } from "antd";

const BASEAPI = process.env.NEXT_PUBLIC_API_URL;

export const fetchServices = async (filter: IFilter) => {
  try {
    const params: any = {};
    if (filter.slug) params.slug = filter.slug;
    if (filter.pageNumber) params.page = filter.pageNumber;
    if (filter.pageSize) params.limit = filter.pageSize;
    // Add more params as needed for your UI
    // Example: if you add languageId, categoryId, status, etc.
    if ((filter as any).languageId)
      params.languageId = (filter as any).languageId;
    if ((filter as any).categoryId)
      params.categoryId = (filter as any).categoryId;
    if ((filter as any).status) params.status = (filter as any).status;

    const { data } = await axiosWithAuth.get(`${BASEAPI}/services`, {
      params,
    });
    return data;
  } catch (error: any) {
    notification.open({
      type: "error",
      message: `service center`,
      description: "Something went wrong while fetching service center",
    });
  }
};
