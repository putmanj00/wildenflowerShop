// lib/shopify-auth.ts
// Service layer for Shopify Customer Authentication.

import { shopifyFetch, ShopifyError } from './shopify-client';
import { getToken, setToken, removeToken } from './auth-storage';
import {
  CUSTOMER_CREATE_MUTATION,
  CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
  GET_CUSTOMER_QUERY,
  CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION,
} from './shopify-queries';
import {
  ShopifyCustomer,
  ShopifyCustomerCreateInput,
  ShopifyCustomerCreateResponse,
  ShopifyCustomerAccessTokenCreateResponse,
  ShopifyCustomerResponse,
} from '../types/shopify';

/**
 * Creates a new customer account on Shopify.
 */
export async function createCustomer(input: ShopifyCustomerCreateInput): Promise<ShopifyCustomerCreateResponse['customerCreate']> {
  const data = await shopifyFetch<ShopifyCustomerCreateResponse>(CUSTOMER_CREATE_MUTATION, { input });
  return data.customerCreate;
}

/**
 * Log in a customer and store their access token.
 */
export async function loginCustomer(email: string, password: string): Promise<ShopifyCustomerAccessTokenCreateResponse['customerAccessTokenCreate']> {
  const data = await shopifyFetch<ShopifyCustomerAccessTokenCreateResponse>(CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION, {
    input: { email, password },
  });

  const { customerAccessToken, customerUserErrors } = data.customerAccessTokenCreate;

  if (customerAccessToken?.accessToken) {
    await setToken(customerAccessToken.accessToken);
  }

  return data.customerAccessTokenCreate;
}

/**
 * Fetches the currently authenticated customer's data.
 * If no token is provided, it attempts to retrieve one from storage.
 */
export async function getCustomer(accessToken?: string): Promise<{ data: ShopifyCustomer | null; error?: string }> {
  try {
    const token = accessToken || (await getToken());

    if (!token) {
      return { data: null };
    }

    const data = await shopifyFetch<ShopifyCustomerResponse>(GET_CUSTOMER_QUERY, {
      customerAccessToken: token,
    });

    if (!data.customer) {
      // Token might be invalid or expired
      await removeToken();
      return { data: null };
    }

    return { data: data.customer };
  } catch (error) {
    console.error('[ShopifyAuth] Error fetching customer:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Logs out the customer by deleting their access token on Shopify and locally.
 */
export async function logoutCustomer(): Promise<void> {
  const token = await getToken();

  if (token) {
    try {
      await shopifyFetch(CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION, {
        customerAccessToken: token,
      });
    } catch (error) {
      console.error('[ShopifyAuth] Error deleting token on Shopify:', error);
    }
  }

  await removeToken();
}
