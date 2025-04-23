import { IBrand, ICart, ICartItem, ICycle, ICycleType } from '../../../app.model';

export interface CartItemDisplay {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  brand?: string;
  cycleType?: string;
}

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  taxes: number;
  discount?: number;
  total: number;
}