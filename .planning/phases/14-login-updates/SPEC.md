# Phase 14: Login Process Updates

## Overview
Update the existing login flow to include a "Forgot Password" capability, enhancing user experience and reducing login friction.

## Requirements

### AUTH-05: Forgot Password
- A "Forgot Password?" link must be present on the login screen (`app/(auth)/login.tsx`).
- Tapping the link navigates to a new `/forgot-password` screen or triggers a modal/bottom sheet.
- The forgot password flow must accept an email address and call the Shopify `customerRecover` mutation.
- Success state must confirm the password reset email was sent.
- Error states (e.g., rate limits, invalid email) must be handled gracefully.

## Out of Scope
- Social Login via Google, Apple, or other Identity Providers.
