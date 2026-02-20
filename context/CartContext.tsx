/**
 * Wildenflower — Cart Context
 * ============================
 * Shopify-backed cart state using cartCreate/cartLinesAdd/cartLinesRemove/cartLinesUpdate.
 * Cart ID and line snapshot persisted to AsyncStorage for cross-session continuity.
 * Favorites are managed separately in FavoritesContext.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ShopifyCart, CartLineSnapshot } from '../types/shopify';
import {
  createCart,
  getCart,
  addCartLines,
  removeCartLines,
  updateCartLines,
} from '../lib/shopify-client';

// ─── AsyncStorage Keys ───────────────────────────────────────────────────────

const STORAGE_CART_ID = '@wildenflower/cart_id';
const STORAGE_CART_SNAPSHOT = '@wildenflower/cart_snapshot';

// ─── Context Type ────────────────────────────────────────────────────────────

interface CartContextType {
  // Data
  cartId: string | null;
  cart: ShopifyCart | null;
  // Loading flags
  isLoading: boolean;           // true during hydration or any in-flight mutation
  isAddingToCart: boolean;
  isRemovingFromCart: boolean;
  isUpdatingQuantity: boolean;
  // Mutations — return true on success, false on failure (no throw from context layer)
  addToCart: (variantId: string, quantity?: number) => Promise<boolean>;
  removeFromCart: (lineId: string) => Promise<boolean>;
  updateQuantity: (lineId: string, quantity: number) => Promise<boolean>;
  clearCart: () => Promise<void>;
  // Derived
  cartCount: number;
  cartTotal: number;
  // Checkout
  checkoutUrl: string | null;
  openCheckout: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | undefined>(undefined);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extracts a line snapshot from a live cart for AsyncStorage persistence */
function buildSnapshot(cart: ShopifyCart): CartLineSnapshot[] {
  return cart.lines.nodes.map((line) => ({
    variantId: line.merchandise.id,
    quantity: line.quantity,
  }));
}

/** Persists cart ID and line snapshot to AsyncStorage after every successful mutation */
async function persistCart(cart: ShopifyCart): Promise<void> {
  const snapshot = buildSnapshot(cart);
  await Promise.all([
    AsyncStorage.setItem(STORAGE_CART_ID, cart.id),
    AsyncStorage.setItem(STORAGE_CART_SNAPSHOT, JSON.stringify(snapshot)),
  ]);
}

// ─── Provider ────────────────────────────────────────────────────────────────

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartId, setCartId] = useState<string | null>(null);
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true until hydration completes
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isRemovingFromCart, setIsRemovingFromCart] = useState(false);
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  // ─── Startup Hydration ─────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      setIsLoading(true);
      try {
        const [storedId, storedSnapshotRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_CART_ID),
          AsyncStorage.getItem(STORAGE_CART_SNAPSHOT),
        ]);

        if (!storedId) {
          // No persisted cart — start fresh immediately
          if (!cancelled) setIsLoading(false);
          return;
        }

        const snapshot: CartLineSnapshot[] = storedSnapshotRaw
          ? JSON.parse(storedSnapshotRaw)
          : [];

        const existingCart = await getCart(storedId);

        if (cancelled) return;

        if (existingCart) {
          // Cart is alive — use it
          setCartId(existingCart.id);
          updateCartState(existingCart);
        } else {
          // Cart expired (Shopify returned null) — silent recovery
          try {
            const newCart = await createCart(snapshot);
            if (!cancelled) {
              await persistCart(newCart);
              setCartId(newCart.id);
              updateCartState(newCart);
            }
          } catch {
            // Recovery failed — start fresh, clear storage, no error surfaced
            await AsyncStorage.multiRemove([STORAGE_CART_ID, STORAGE_CART_SNAPSHOT]).catch(() => {});
            if (!cancelled) {
              setCartId(null);
              setCart(null);
              setCheckoutUrl(null);
            }
          }
        }
      } catch {
        // AsyncStorage read failed — start with empty cart, don't crash
        if (!cancelled) {
          setCartId(null);
          setCart(null);
          setCheckoutUrl(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    hydrate();
    return () => { cancelled = true; };
  }, []);

  // ─── Cart State Helper ────────────────────────────────────────────────────

  /**
   * Single point for updating cart state — always extracts checkoutUrl alongside cart.
   * Use this instead of bare setCart() calls to guarantee checkoutUrl stays in sync.
   */
  function updateCartState(newCart: ShopifyCart): void {
    setCart(newCart);
    setCheckoutUrl(newCart.checkoutUrl);
  }

  // ─── Mutations ────────────────────────────────────────────────────────────

  const addToCart = async (variantId: string, quantity: number = 1): Promise<boolean> => {
    setIsAddingToCart(true);
    setIsLoading(true);
    const previousCart = cart;
    const previousCartId = cartId;
    try {
      let newCart: ShopifyCart;
      if (cartId) {
        newCart = await addCartLines(cartId, [{ variantId, quantity }]);
      } else {
        // No cart yet — create one with this first line
        newCart = await createCart([{ variantId, quantity }]);
      }
      await persistCart(newCart);
      setCartId(newCart.id);
      updateCartState(newCart);
      return true;
    } catch {
      // Rollback — restore previous state (no optimistic update to undo)
      setCartId(previousCartId);
      setCart(previousCart);
      setCheckoutUrl(previousCart?.checkoutUrl ?? null);
      return false;
    } finally {
      setIsAddingToCart(false);
      setIsLoading(false);
    }
  };

  const removeFromCart = async (lineId: string): Promise<boolean> => {
    if (!cartId) return false;
    setIsRemovingFromCart(true);
    setIsLoading(true);
    const previousCart = cart;
    try {
      const newCart = await removeCartLines(cartId, [lineId]);
      await persistCart(newCart);
      updateCartState(newCart);
      return true;
    } catch {
      setCart(previousCart);
      return false;
    } finally {
      setIsRemovingFromCart(false);
      setIsLoading(false);
    }
  };

  const updateQuantity = async (lineId: string, quantity: number): Promise<boolean> => {
    if (!cartId) return false;
    setIsUpdatingQuantity(true);
    setIsLoading(true);
    const previousCart = cart;
    try {
      let newCart: ShopifyCart;
      if (quantity <= 0) {
        // cartLinesUpdate with quantity: 0 may produce INVALID error — remove instead
        newCart = await removeCartLines(cartId, [lineId]);
      } else {
        newCart = await updateCartLines(cartId, [{ id: lineId, quantity }]);
      }
      await persistCart(newCart);
      updateCartState(newCart);
      return true;
    } catch {
      setCart(previousCart);
      return false;
    } finally {
      setIsUpdatingQuantity(false);
      setIsLoading(false);
    }
  };

  const clearCart = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await AsyncStorage.multiRemove([STORAGE_CART_ID, STORAGE_CART_SNAPSHOT]).catch(() => {});
      setCartId(null);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Checkout ─────────────────────────────────────────────────────────────

  /**
   * Opens the Shopify-hosted checkout URL.
   * - Web: window.location.href (full page navigation per CONTEXT.md)
   * - Native: Linking.openURL (opens in system browser)
   * No-ops if checkoutUrl is null (button should be disabled in that case).
   */
  const openCheckout = (): void => {
    if (!checkoutUrl) return;
    if (Platform.OS === 'web') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).location.href = checkoutUrl;
    } else {
      Linking.openURL(checkoutUrl).catch((err) => {
        console.error('[CartContext] Failed to open checkout URL:', err);
      });
    }
  };

  // ─── Derived Values ───────────────────────────────────────────────────────

  const cartCount = cart?.totalQuantity ?? 0;
  const cartTotal = cart?.cost?.subtotalAmount
    ? parseFloat(cart.cost.subtotalAmount.amount)
    : 0;

  return (
    <CartContext.Provider
      value={{
        cartId,
        cart,
        isLoading,
        isAddingToCart,
        isRemovingFromCart,
        isUpdatingQuantity,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        checkoutUrl,
        openCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
