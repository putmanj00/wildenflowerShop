/**
 * Wildenflower — Root Layout
 * ==========================
 * Wraps the entire app in providers and loads fonts.
 */

import { useEffect } from 'react';
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
import { colors } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
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
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <CartProvider>
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
    </CartProvider>
  );
}
