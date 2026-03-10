import { axioscentral } from "@/lib/api-client";
import { AxiosRequestConfig } from "axios";

export const ProductService = {
  Category: {
    getProductCategories: async (
      options?: AxiosRequestConfig,
    ): Promise<any> => {
      return axioscentral<any>({
        method: "GET",
        url: "/product/categories",
        ...options,
      });
    },
  },
};
