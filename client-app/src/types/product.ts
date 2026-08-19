export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: {
    items: Product[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface ProductDetailResponse {
  success: boolean;
  message: string;
  data: Product;
}
