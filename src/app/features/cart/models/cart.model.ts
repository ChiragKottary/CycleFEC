export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  specifications?: string[];
  imageUrl: string;
}

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  taxes: number;
  discount?: number;
  total: number;
}