/**
 * Wildenflower — Home Screen
 * ==========================
 * The first screen finders see. Warm, wandering, unhurried.
 *
 * Layout (top to bottom):
 * 1. BotanicalHeader (full-width, 200px illustrated banner)
 * 2. HeroCard — tagline "Made by hand. Found by heart."
 * 3. SectionTitle "Explore" → CategoryRow (horizontal category scroll)
 * 4. BotanicalDivider (fern-mushroom)
 * 5. SectionTitle "Freshly Gathered" + "See All" → ProductGrid (6 items)
 * 6. Bottom breathing room
 *
 * Reference: wildenflowerHomeScreen.png
 */

import React, { useState } from 'react';
import { useRouter } from 'expo-router';

import { copy, productCategories } from '../../constants/theme';
import { useCart } from '../../context/CartContext';
import { products } from '../../data/mock-data';
import { Product } from '../../types';

import ScrollScreen from '../../components/layout/ScrollScreen';
import BotanicalHeader from '../../components/BotanicalHeader';
import HeroCard from '../../components/HeroCard';
import SectionTitle from '../../components/SectionTitle';
import CategoryRow from '../../components/CategoryRow';
import BotanicalDivider from '../../components/BotanicalDivider';
import ProductGrid from '../../components/ProductGrid';

export default function HomeScreen() {
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useCart();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const featuredProducts = products.slice(0, 6);

  function handleProductPress(product: Product) {
    router.push(`/product/${product.id}`);
  }

  function handleCategoryPress(id: string) {
    setActiveCategory(prev => (prev === id ? null : id));
  }

  return (
    <ScrollScreen>
      <BotanicalHeader variant="large" />

      <HeroCard />

      <SectionTitle title={copy.categories} />
      <CategoryRow
        categories={productCategories}
        activeCategory={activeCategory}
        onCategoryPress={handleCategoryPress}
      />

      <BotanicalDivider variant="fern-mushroom" />

      <SectionTitle
        title={copy.featured}
        action={{
          label: copy.viewAll,
          onPress: () => router.push('/(tabs)/browse'),
        }}
      />
      <ProductGrid
        products={featuredProducts}
        onProductPress={handleProductPress}
        onFavoriteToggle={toggleFavorite}
        favorites={featuredProducts.map(p => p.id).filter(id => isFavorite(id))}
      />

    </ScrollScreen>
  );
}
