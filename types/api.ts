export interface CategoryData {
  categoryName: string;
  subCategoryName: string;
  categoryId: string;
  subCategoryId: string;
  buy: TransactionData;
  sell: TransactionData;
  balance: BalanceData;
}

export interface TransactionData {
  totalQty: number;
  totalAmount: number;
  minPrice: number;
  maxPrice: number;
  orders: OrderData[];
  grades: GradesData;
}

export interface OrderData {
  orderId: string;
  date: string;
  quantity: number;
  grade: string;
}

export interface GradesData {
  A: number;
  B: number;
  C: number;
  D: number;
}

export interface BalanceData {
  qty: number;
  amount: number;
}

export interface StandardApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export type CategoryApiResponse = StandardApiResponse<CategoryData[]>;
