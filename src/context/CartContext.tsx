"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";
import { CartItem } from "@/types";

// --- State ---
interface CartState {
  items: CartItem[];
  isOpen: boolean; // slide-in panel visibility
}

const initialState: CartState = {
  items: [],
  isOpen: false,
};

// --- Actions ---
type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { productId: string; size: string } }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; size: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" };

// --- Reducer ---
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingIndex = state.items.findIndex(
        (item) => item.productId === action.payload.productId && item.size === action.payload.size
      );
      if (existingIndex > -1) {
        const updated = [...state.items];
        updated[existingIndex].quantity += action.payload.quantity;
        return { ...state, items: updated, isOpen: true };
      }
      return { ...state, items: [...state.items, action.payload], isOpen: true };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (item) => !(item.productId === action.payload.productId && item.size === action.payload.size)
        ),
      };
    case "UPDATE_QUANTITY": {
      const updated = state.items.map((item) =>
        item.productId === action.payload.productId && item.size === action.payload.size
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item
      );
      return { ...state, items: updated };
    }
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };
    case "OPEN_CART":
      return { ...state, isOpen: true };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

// --- Context ---
interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value: CartContextType = {
    items: state.items,
    isOpen: state.isOpen,
    totalItems,
    totalPrice,
    addItem: (item) => dispatch({ type: "ADD_ITEM", payload: item }),
    removeItem: (productId, size) => dispatch({ type: "REMOVE_ITEM", payload: { productId, size } }),
    updateQuantity: (productId, size, quantity) =>
      dispatch({ type: "UPDATE_QUANTITY", payload: { productId, size, quantity } }),
    clearCart: () => dispatch({ type: "CLEAR_CART" }),
    toggleCart: () => dispatch({ type: "TOGGLE_CART" }),
    openCart: () => dispatch({ type: "OPEN_CART" }),
    closeCart: () => dispatch({ type: "CLOSE_CART" }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
