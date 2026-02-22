# Navigation and Thematic Gap Analysis & Plan

## Goal
Conduct a gap analysis of the Home and Menu screens, identifying navigation friction points and lack of botanical thematic alignment. Create a firm plan for generating new assets and implementing a cohesive UI that closely matches the provided design mocks.

## Gap Analysis Findings

### 1. Home Screen (`index.tsx`)
- **Current State:** Loads basic fonts and text components. `BotanicalHeader` is fully-width without soft transitions. Category icons might be generic React Native text or basic chips. The bottom section lacks thematic padding.
- **Thematic Gap:** Lacks the "Victorian apothecary meets 1960s psychedelic art nouveau" feel. Needs a more robust sectioning strategy with botanical corners, wreaths for CTA buttons (like the `HeroCard`), and better typography. The active state of the bottom tabs doesn't match the botanical theme.
- **Action:**
  - Generate missing UI assets (`button-wreath.png`, `card-corner-topleft.png`, `icon-mushroom.png`, etc.).
  - Update `HeroCard` to utilize `button-wreath.png` and improve layout spacing.
  - Implement the `empty-state-botanical.png` with better alignment.
  - Update Tab Bar Icons to utilize the themed active/inactive asset variants outlined in the Weavy generation guide.

### 2. Menu/Discover Screen (`menu.tsx`)
- **Current State:** Displays an extremely basic list of text links ("Our Story", "FAQ", "Blog") under a "Discover" header. Looks very unpolished and "mobile-default." On a mobile viewport, this lack of structure is glaring and feels completely disconnected from the Home screen's aesthetic.
- **Thematic Gap:** It's missing almost all botanical features. The "Discover" screen should act as an inviting index. Furthermore, navigating *into* these linked screens (About, FAQ, Blog) currently shows a default React Navigation header with a tiny black/blue "Back" button. This renders terribly on mobile, making the button hard to tap and leaving the top of the content screens uncomfortably blank.
- **Action:**
  - Redesign `menu.tsx`: instead of a plain text list, use card-based links or elegantly spaced rows with custom `vine-arrow-right.png` icons.
  - Add a `botanical-header-small` or `botanical-header-faq` image to the top of the Menu screen to avoid the blank top space and bring it inline with the Home screen feel.
  - Override the default navigation headers in `app/_layout.tsx` or `app/(tabs)/_layout.tsx` for pushed screens (About, FAQ, Blog) so that they either use a custom `<BotanicalHeader>` with a `vine-back-arrow.png` back button, or hide the native header entirely and implement a custom back component.

### 3. Missing Assets
The `assets/images/ui/` directory and several category icons don't exist yet. We will need to generate:
- `assets/images/ui/vine-arrow-right.png`
- `assets/images/ui/vine-back-arrow.png`
- `assets/images/ui/button-wreath.png`
- Category icons (e.g., `icon-mushroom.png`, `icon-vine.png`) 

## Proposed Changes

### Home Screen
#### [MODIFY] index.tsx
#### [MODIFY] HeroCard.tsx
#### [MODIFY] CategoryRow.tsx

### Menu/Discover Screen
#### [MODIFY] menu.tsx
#### [MODIFY] (tabs)/_layout.tsx (to handle routing and native header hiding)

### Assets
#### [NEW] assets/images/ui/*
#### [NEW] assets/images/icons/categories/*

## Verification Plan
### Automated Tests
- No automated tests needed for this UI layer change right now.
### Manual Verification
- Visual inspection via standard Expo Web / mobile emulator running at `http://localhost:8081`. 
- Verify the navigation back-button behavior from Menu -> About and back to ensure no "blank top" issues.
