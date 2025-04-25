import { IBrand, ICart, ICartItem, ICycle, ICycleType } from '../../../app.model';

export interface CartItemDisplay {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  brand?: string;
  cycleType?: string;
  subtotal: number;
}

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  taxes: number;
  discount?: number;
  total: number;
}

export interface ICartItemResponse {
  cartItemId: string;
  cartId: string;
  cycleId: string;
  cycleName: string;
  cycleBrand: string;
  cycleType: string;
  cycleDescription: string;
  cycleImage: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  subtotal: number;
  addedAt: string;
  updatedAt: string;
  cart: ICart | null;
  cycle: ICycle | null;
}