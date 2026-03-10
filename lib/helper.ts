export const cleanReportPayload = (dataFilters: {
  startDate: string;
  endDate: string;
  categoryId: string;
  subCategoryId: string;
  orderId: string;
  orderIdMatchType: string;
  minPrice: string;
  maxPrice: string;
  grades: string[];
}) => {
  const cleanPayload = Object.entries(dataFilters).reduce(
    (acc, [key, value]) => {
      if (typeof value === "string" && value.trim() === "") {
        return acc;
      }
      if (Array.isArray(value) && value.length === 0) {
        return acc;
      }

      if (
        key === "orderIdMatchType" &&
        (!dataFilters.orderId || dataFilters.orderId.trim() === "")
      ) {
        return acc;
      }
      acc[key] = value;
      return acc;
    },
    {} as Record<string, any>,
  );
  return cleanPayload;
};
