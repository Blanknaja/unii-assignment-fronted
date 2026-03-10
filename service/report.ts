import { CategoryApiResponse } from "@/types/api";
import { axioscentral } from "../lib/api-client";

export type MatchType = "EXACT" | "CONTAINS" | "STARTS_WITH" | "ENDS_WITH";
export type GradeType = "A" | "B" | "C" | "D";

export interface GetReportPayload {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  subCategoryId?: string;
  orderId?: string;
  orderIdMatchType?: MatchType;
  minPrice?: number;
  maxPrice?: number;
  grades?: GradeType[];
}

export const ReportService = {
  getReport: async (
    payload: GetReportPayload,
    // options?: AxiosRequestConfig,
  ): Promise<CategoryApiResponse> => {
    return axioscentral<CategoryApiResponse>({
      method: "POST",
      url: "/reports/summary",
      data: payload,
      // ...options,
    });
  },
};
