export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending_payment' | 'paid' | 'confirmed' | 'shipped' | 'completed' | 'cancelled' | 'expired';
  total_amount: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface ListOrdersResponse {
  success: boolean;
  message: string;
  data: {
    orders: Order[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface OrderDetailResponse {
  success: boolean;
  message: string;
  data: Order;
}
