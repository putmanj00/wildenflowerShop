/**
 * Wildenflower — Type Definitions
 * ================================
 */

// ─── Products ───────────────────────────────

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  story?: string;           // "The Story Behind This Piece"
  images: string[];         // Array of image URIs
  category: string;
  maker: Maker;
  materials?: string[];
  careInstructions?: string;
  isFavorite?: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// ─── Makers ─────────────────────────────────

export interface Maker {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  specialties?: string[];
  productCount?: number;
}

// ─── Blog ───────────────────────────────────

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | number;  // string for URLs, number for require() assets
  category: 'maker-stories' | 'behind-the-craft' | 'community';
  author: string;
  publishedAt: string;
  readingTime: number;      // minutes
  pullQuote?: string;
}

// ─── FAQ ────────────────────────────────────

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'getting-started' | 'shipping' | 'makers' | 'returns';
}

// ─── Categories ─────────────────────────────

export interface Category {
  id: string;
  label: string;
  icon: string;             // asset key from theme
  description?: string;
}

// ─── User ───────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  favorites: string[];      // product IDs
  addresses: Address[];
}

export interface Address {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

// ─── Navigation ─────────────────────────────

export type TabRoute = 'index' | 'browse' | 'favorites' | 'cart' | 'profile';

// ─── Brand Pillar ───────────────────────────

export interface BrandPillar {
  id: string;
  title: string;
  icon: string;
  description: string;
}
