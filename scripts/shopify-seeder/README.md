# Shopify Test Data Seeder

This is a standalone Node.js script designed to sanitize, update, and populate test data for all products in your Shopify development store.

## Features
- **Status Updates:** Converts `DRAFT` or `ARCHIVED` products to `ACTIVE`.
- **Rich Test Data Injection:** Leverages `@faker-js/faker` to rewrite product descriptions with realistic Shopify themes (Handmade Artwork, Custom Jewelry, Crafted Leatherwork, Tie-Dye Apparel) formatted in rich HTML.
- **Price & Inventory:** Assigns realistic randomized pricing and updates location inventory to a random value between 5 and 100.
- **Options & Variants Guarantee:** Checks for existing `Size` or `Material` options. If missing, it injects one of them along with 3-4 distinct variants (e.g., S, M, L, XL or Leather, Canvas, Silk, Cotton). 
- **Image Injection:** Automatically appends 3 to 4 random placeholder image URLs per product using `picsum.photos` for testing carousel UI components.
- **Resilience:** Built with robust retry mechanisms, error handling, and exponential backoff to handle native Shopify GraphQL Leaky Bucket rate limiting (`THROTTLED` errors, HTTP `429`). 

## Setup

Navigate to this directory and install dependencies:
```bash
npm install
```

## Configuration

Duplicate `.env.example` to `.env` or just create a `.env` file directly:
```env
SHOPIFY_STORE_DOMAIN=my-store-name.myshopify.com
SHOPIFY_CLIENT_ID=001080c5f19b...
SHOPIFY_CLIENT_SECRET=shpss_d9e185a...
```

**Where to get these credentials (2026 update):**
Due to recent Shopify changes, you can no longer generate long-lived `shpat_` tokens directly in the store admin. Instead, you must use a Custom App from your Partner Dashboard (dev.shopify.com) and the **Client Credentials Grant** flow:

1. Go to your app in the Partner Dashboard (`dev.shopify.com`).
2. Give the app the following scopes: `write_products`, `read_products`, `write_inventory`, `read_locations`.
3. Install the app on your development store.
4. Copy the **Client ID** and **Client Secret** into your `.env` file. The script will automatically negotiate an access token on startup.

## Running the Script

Start the seeder process by running:
```bash
npm start
```
