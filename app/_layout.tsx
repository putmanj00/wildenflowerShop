/**
 * Wildenflower — Root Layout
 * ==========================
 * Wraps the entire app in providers and loads fonts.
 *
 * Font loading states:
 *   1. Loading  — `!fontsLoaded && !fontError` → return null (splash still visible)
 *   2. Error    — `fontError` is truthy         → show FontErrorScreen
 *   3. Success  — `fontsLoaded` is true         → render the full Stack navigator
 *
 * Retry mechanism:
 *   - Web:    window.location.reload() — full page reload re-triggers font fetch
 *   - Native: increment retryKey → remounts CartProvider tree, re-triggering useFonts
 *             (best-effort; if fonts remain unavailable, FontErrorScreen re-appears)
 */

import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_700Bold_Italic,
} from '@expo-google-fonts/playfair-display';
import {
  Lora_400Regular,
  Lora_700Bold,
  Lora_400Regular_Italic,
  Lora_700Bold_Italic,
} from '@expo-google-fonts/lora';
import { useFonts } from 'expo-font';
import { CartProvider } from '../context/CartContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { colors } from '../constants/theme';
import FontErrorScreen from '../components/layout/FontErrorScreen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [retryKey, setRetryKey] = useState(0);

  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_700Bold_Italic,
    Lora_400Regular,
    Lora_700Bold,
    Lora_400Regular_Italic,
    Lora_700Bold_Italic,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Waiting for font load result — keep splash screen visible
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Fonts failed to load — show on-brand error screen with retry
  if (fontError) {
    const handleRetry = () => {
      if (Platform.OS === 'web') {
        // @ts-ignore — window is available on web
        window.location.reload();
      } else {
        // Remount CartProvider tree to re-trigger useFonts on native
        setRetryKey(k => k + 1);
      }
    };

    return <FontErrorScreen onRetry={handleRetry} />;
  }

  // Fonts loaded successfully — render the full app
  return (
    // key={retryKey} ensures the CartProvider tree remounts on retry,
    // which re-triggers useFonts inside this same RootLayout component.
    <CartProvider key={retryKey}>
      <FavoritesProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.parchment },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="blog/index" />
          <Stack.Screen name="blog/[id]" />
          <Stack.Screen name="maker/[id]" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="about" />
          <Stack.Screen name="faq" />
        </Stack>
      </FavoritesProvider>
    </CartProvider>
  );
}
