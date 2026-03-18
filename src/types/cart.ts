export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  size: string;
  price: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}
