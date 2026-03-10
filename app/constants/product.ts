export interface SubCategory {
  subCategoryId: string;
  subCategoryName: string;
}

export interface ProductCategory {
  categoryId: string;
  categoryName: string;
  subcategory: SubCategory[];
}
