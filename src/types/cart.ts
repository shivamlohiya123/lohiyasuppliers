export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
  quantity: number;
  sku: string;
}

export interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}
