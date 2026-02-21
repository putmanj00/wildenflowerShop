/**
 * Wildenflower — Favorites Context
 * ==================================
 * AsyncStorage-persisted favorites using FavoriteSnapshot objects.
 * Each snapshot captures all display data needed to render a favorited product
 * without a network call (title, image, price, vendor, handle).
 *
 * Persistence key: 'wildenflower_favorites'
 * Pattern mirrors CartContext snapshot strategy.
 *
 * FavoritesContext is separate from CartContext — they are independent concerns.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FavoriteSnapshot {
  /** Shopify product GID, e.g. "gid://shopify/Product/123" */
  id: string;
  /** Product handle for navigation, e.g. "silk-scarf" */
  handle: string;
  /** Product title */
  title: string;
  /** Featured image URL, or null if no images */
  imageUrl: string | null;
  /** Formatted price amount, e.g. "52.00" */
  price: string;
  /** Currency code, e.g. "USD" */
  currencyCode: string;
  /** Shopify vendor string, e.g. "Ashley Sifford" */
  vendor: string;
}

interface FavoritesContextType {
  /** Saved products as snapshots — persisted to AsyncStorage */
  favorites: FavoriteSnapshot[];
  /** Total number of favorited items */
  favoritesCount: number;
  /** Toggle a product's saved state — adds snapshot if not present, removes if present */
  toggleFavorite: (snapshot: FavoriteSnapshot) => void;
  /** Returns true if the given product ID is currently favorited */
  isFavorite: (productId: string) => boolean;
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'wildenflower_favorites';

async function loadFromStorage(): Promise<FavoriteSnapshot[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveToStorage(snapshots: FavoriteSnapshot[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
  } catch {
    // Storage errors are non-fatal; favorites still work in-session
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteSnapshot[]>([]);

  // Load persisted favorites on mount
  useEffect(() => {
    loadFromStorage().then(setFavorites);
  }, []);

  const toggleFavorite = (snapshot: FavoriteSnapshot) => {
    setFavorites((prev) => {
      const alreadySaved = prev.some((f) => f.id === snapshot.id);
      const next = alreadySaved
        ? prev.filter((f) => f.id !== snapshot.id)
        : [snapshot, ...prev]; // prepend so newest appears first
      saveToStorage(next);
      return next;
    });
  };

  const isFavorite = (productId: string): boolean =>
    favorites.some((f) => f.id === productId);

  const favoritesCount = favorites.length;

  return (
    <FavoritesContext.Provider value={{ favorites, favoritesCount, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
