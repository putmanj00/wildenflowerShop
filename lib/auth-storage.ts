import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'wildenflower_customer_token';

/**
 * Saves the access token across platforms.
 */
export async function setToken(token: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Error securely storing token:', error);
  }
}

/**
 * Retrieves the access token across platforms.
 */
export async function getToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error securely retrieving token:', error);
    return null;
  }
}

/**
 * Removes the access token across platforms.
 */
export async function removeToken(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error securely removing token:', error);
  }
}
