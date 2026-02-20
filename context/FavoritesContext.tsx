/**
 * Wildenflower — Favorites Context
 * ==================================
 * Memory-only favorites state. Product IDs are stored in a string array.
 *
 * Persistence (AsyncStorage) is intentionally deferred to Phase 8.
 * FavoritesContext is separate from CartContext — they are independent concerns.
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FavoritesContextType {
  /** Product IDs currently favorited (memory-only, resets on app restart until Phase 8) */
  favorites: string[];
  /** Toggle a product ID in or out of favorites */
  toggleFavorite: (productId: string) => void;
  /** Returns true if the given product ID is currently favorited */
  isFavorite: (productId: string) => boolean;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isFavorite = (productId: string): boolean => favorites.includes(productId);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
