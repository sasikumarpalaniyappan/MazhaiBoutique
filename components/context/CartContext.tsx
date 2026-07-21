"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
  selectedSize?: string;
};

type CartProductInput = {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity?: number;
  selectedSize?: string;
};

type CartContextType = {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (
    product: CartProductInput,
    quantity?: number,
    selectedSize?: string
  ) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateQuantity: (
    productId: string,
    size: string | undefined,
    quantity: number
  ) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

const getSizeKey = (size?: string) => size?.trim() || "Standard";

const getPriceValue = (price: string) => {
  const numericValue = Number(
    String(price).replace(/[^0-9.]/g, "")
  );

  return Number.isFinite(numericValue) ? numericValue : 0;
};

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart) as CartItem[];
        setCartItems(parsedCart);
      }
    } catch {
      setCartItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (
    product: CartProductInput,
    quantity = 1,
    selectedSize?: string
  ) => {
    const size = getSizeKey(selectedSize);

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.id === product.id &&
          getSizeKey(item.selectedSize) === size
      );

      if (existingIndex >= 0) {
        return prevItems.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        );
      }

      return [
        ...prevItems,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
          selectedSize: size,
        },
      ];
    });
  };

  const removeFromCart = (productId: string, size?: string) => {
    const sizeKey = size ? getSizeKey(size) : undefined;

    setCartItems((prevItems) =>
      prevItems.filter((item) => {
        const itemSize = getSizeKey(item.selectedSize);
        return !(
          item.id === productId &&
          (!sizeKey || itemSize === sizeKey)
        );
      })
    );
  };

  const updateQuantity = (
    productId: string,
    size: string | undefined,
    quantity: number
  ) => {
    const sizeKey = getSizeKey(size);

    setCartItems((prevItems) =>
      prevItems.flatMap((item) => {
        const itemSize = getSizeKey(item.selectedSize);

        if (
          item.id === productId &&
          itemSize === sizeKey
        ) {
          return quantity > 0
            ? [{ ...item, quantity }]
            : [];
        }

        return [item];
      })
    );
  };

  const increaseQuantity = (id: string) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (id: string) => {
    setCartItems((prevItems) =>
      prevItems
        .flatMap((item) => {
          if (item.id !== id) {
            return [item];
          }

          const nextQuantity = item.quantity - 1;
          return nextQuantity > 0
            ? [{ ...item, quantity: nextQuantity }]
            : [];
        })
    );
  };

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + getPriceValue(item.price) * item.quantity,
        0
      ),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}

