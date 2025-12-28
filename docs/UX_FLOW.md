# GMGN.AI Clone - Comprehensive UX Flow Documentation

## Overview

This document provides a complete guide to the user experience flows for the GMGN.AI clone trading platform. It covers all user journeys, interaction patterns, state management, error handling, and accessibility considerations.

**Target Audience:** Designers, Developers, Product Managers, QA Engineers

**Last Updated:** December 28, 2025

---

## Table of Contents

1. [User Journeys](#1-user-journeys)
2. [Core Page Flows](#2-core-page-flows)
3. [Key Interaction Patterns](#3-key-interaction-patterns)
4. [State Management & Data Flow](#4-state-management--data-flow)
5. [Error Handling & Edge Cases](#5-error-handling--edge-cases)
6. [Mobile-First Design](#6-mobile-first-design)
7. [Accessibility & Usability](#7-accessibility--usability)
8. [Performance Considerations](#8-performance-considerations)
9. [Security & Privacy](#9-security--privacy)
10. [Testing & Validation](#10-testing--validation)

---

## 1. User Journeys

### 1.1 First-Time User Journey: Registration to First Trade

**Journey Goal:** New user discovers platform, creates account, and completes their first trade

**Journey Map:**
```
Landing → Register → Wallet Overview → Market Browse → Token Selection → Trade Execution → Transaction Confirmation
```

#### Detailed Flow

**1. Landing/Home Page**
- User arrives at home page (public, no auth required)
- Sees hero section with platform branding
- Views trending tokens with real-time price updates
- Notices bottom navigation with 5 key sections
- Can browse without authentication
- **CTA:** "Get Started" or "Register" prominently displayed

**2. Registration Flow**
- User clicks "Register" button or attempts to access protected features
- Redirected to `/register` page
- Form fields:
  - Email (validated format)
  - Password (min 8 characters, validated)
  - Confirm Password (must match)
- Real-time validation feedback
- Submit button disabled until all fields valid
- On success:
  - Auto-login with new credentials
  - Welcome toast notification
  - Redirected to `/wallet` page
- Error handling:
  - Duplicate email: "Email already exists"
  - Network error: "Registration failed, please try again"

**3. First Wallet View**
- User sees wallet overview for first time
- Mock starting balance displayed ($10,000 USD)
- Empty transaction history with call-to-action
- Helpful tip: "Start trading to build your portfolio"
- Quick action buttons visible
- Bottom nav highlights current section

**4. Discover Tokens**
- User taps "Market" in bottom navigation
- Redirected to `/market` page
- Sees comprehensive token list:
  - Token logo (generated via dicebear API)
  - Symbol and name
  - Current price
  - 24h price change (color-coded: green up, red down)
  - Volume and market cap
- Search functionality at top
- Sort tabs: Trending, Top Gainers, New
- Can scroll through tokens infinitely

**5. Token Selection**
- User browses and finds interesting token
- Taps on token card
- Redirected to `/trade/:tokenId` page
- URL contains token ID for sharing/bookmarking

**6. Trade Page Initial View**
- User lands on trade page for selected token
- Default view: "Buy" tab selected
- Chart displays:
  - TradingView Lightweight Charts
  - Price candlesticks
  - Time period selector
  - Real-time price updates
- Token information panel:
  - Current price
  - 24h change
  - Market cap
  - Volume
- Trade form visible below chart

**7. First Trade Execution**
- User selects "Buy" (default selected)
- Sees current USD balance at top
- Amount input field with placeholder "0.00"
- Quick amount buttons appear: "Quick Select (% of available):"
  - [25%] [50%] [75%] [100%]
  - These represent percentage of available USD balance
- User clicks "50%" button
  - Calculates: (Balance / Token Price) * 0.5
  - Auto-fills amount field with token quantity
- Reviews order details:
  - Token amount
  - Total cost in USD
  - Current price
  - Estimated gas fees (mock)
- Insufficient balance validation:
  - Button disabled if insufficient funds
  - Warning message: "Insufficient balance"
- User clicks "Buy [TOKEN]" button
- Loading state displays on button
- API call executes (mock backend)
- Success flow:
  - Success toast: "Successfully bought X TOKEN"
  - Transaction added to wallet history
  - Balance updated in real-time
  - Page remains on trade view for additional trades
- Chart updates to reflect new position

**8. Transaction Verification**
- User navigates to "Wallet" via bottom nav
- Sees updated balance reflecting purchase
- Transaction appears in history:
  - "Bought" label with green "+" sign
  - Token symbol and amount
  - Value in USD (green text)
  - Timestamp
  - Transaction hash (truncated, copyable)
- User can click transaction to view details

### 1.2 Copy Trading Journey: Discovery to Active Copy


**Journey Goal:** User discovers successful traders and sets up automated copy trading

**Journey Map:**
```
Copy Trade Page → Search/Filter → Trader Selection → Trader Analysis → Configure Settings → Activate Copy → Monitor Performance
```

#### Detailed Flow

**1. Navigate to Copy Trade**
- User taps "Copy" in bottom navigation
- Redirected to `/copy-trade` page
- Authentication check: Must be logged in
- If not authenticated → Redirect to `/login` with return URL

**2. Trader Discovery**
- User sees list of top traders immediately (no loading delay)
- Trader count displayed: "Showing X traders"
- Each trader card displays:
  - Avatar (generated from address)
  - Name/username
  - Verified badge (if verified)
  - Wallet address (truncated: 0x1234...5678)
  - Trading tags (e.g., "DeFi", "NFTs", "Memecoins")
  - Key metrics:
    - 7D PnL: +$X,XXX (+XX%)
    - 30D PnL: +$X,XXX (+XX%)
    - Win Rate: XX%
  - Meta information:
    - XX followers
    - XX trades
    - Xh avg hold time
  - "Copy Trade" button (primary CTA)

**3. Search & Filter Operations**
- **Search Input:**
  - Placeholder: "Search by name or address..."
  - Real-time filtering as user types
  - Matches name or wallet address
  - No results message if no matches

- **Sort Options:**
  - 7D PnL (default, descending)
  - 30D PnL (descending)
  - Followers (descending)
  - Win Rate (descending)
  - Active sort highlighted with blue background

- **Verified Filter:**
  - Toggle checkbox: "Verified Only"
  - When checked, shows only verified traders
  - Count updates dynamically

**4. Trader Card Interactions**
- **Two paths from trader card:**
  
  **Path A: Quick Copy**
  - User clicks "Copy Trade" button directly
  - Navigates to trader detail with `?action=copy` query param
  - Detail page auto-opens copy settings modal

  **Path B: Research First**
  - User clicks anywhere else on card
  - Navigates to trader detail page
  - Modal does not auto-open
  - User can review details before copying

**5. Trader Detail Page Analysis**
- URL: `/copy-trade/:traderId`
- Page loads with comprehensive information:

  **Profile Header:**
  - Large avatar
  - Name and verified badge
  - Full wallet address with copy button
  - Bio/description
  - Trading tags

  **Performance Grid (4 stat cards):**
  - 7D PnL: Amount in USD + percentage change
  - 30D PnL: Amount in USD + percentage change
  - Win Rate: Percentage with visual indicator
  - Avg Hold Time: Hours/days display

  **Risk Notice Card:**
  - Warning icon
  - Bold text: "Copy trading involves risk"
  - Explanation of potential losses
  - "Trade at your own risk" disclaimer

  **Recent Trades Table:**
  - Last 10 trades displayed
  - Columns: Token, Type (Buy/Sell), Amount, Price, Time
  - Alternating row colors for readability

**6. Copy Settings Modal - Step 1: Configuration**
- Modal opens (either auto or manual trigger)
- Step indicator: "Step 1 of 3"
- Warning banner at top:
  - Icon + "Copy trading involves risk"
  - Brief explanation

- **Form Fields:**
  
  **Max Position Size:**
  - Input field with USD symbol
  - Placeholder: "e.g., 1000"
  - Validation: Required, min $10, max $100,000
  - Help text: "Maximum USD per position"

  **Copy Ratio:**
  - Slider from 10% to 100%
  - Current value displayed: "X%"
  - Visual slider track
  - Help text: "Percentage of trader's position size to copy"

  **Stop Loss:**
  - Input field with % symbol
  - Placeholder: "e.g., 10"
  - Validation: Optional, 1-50%
  - Help text: "Auto-sell if loss reaches this %"

  **Take Profit:**
  - Input field with % symbol
  - Placeholder: "e.g., 50"
  - Validation: Optional, 1-500%
  - Help text: "Auto-sell if profit reaches this %"

  **Max Daily Trades:**
  - Input field (number)
  - Placeholder: "e.g., 10"
  - Validation: Required, min 1, max 100
  - Help text: "Limit trades per day to manage risk"

- Form validation:
  - Real-time validation on blur
  - Error messages below each field
  - Continue button disabled until valid

- User clicks "Continue" → Moves to Step 2

**7. Copy Settings Modal - Step 2: Confirmation**
- Step indicator: "Step 2 of 3"
- "Review Your Settings" heading

- **Settings Summary Display:**
  - Read-only cards showing all settings
  - Clear labels and values
  - Easy to scan layout

- **Trader Summary:**
  - Trader name and avatar
  - Key performance stats recap

- **Risk Disclaimer:**
  - Checkbox (required): "I understand the risks"
  - Full disclaimer text:
    - "Copy trading is automated"
    - "You may lose money"
    - "Past performance doesn't guarantee future results"
    - "You are responsible for your trading decisions"

- **Action Buttons:**
  - "Back" (returns to Step 1)
  - "Start Copying" (disabled until checkbox checked)

- User checks disclaimer checkbox
- "Start Copying" button enables
- User clicks "Start Copying"
- Loading state displays
- API call executes to save copy settings

**8. Copy Settings Modal - Step 3: Success**
- Step indicator: "Step 3 of 3"
- Success checkmark icon (large, green)
- Heading: "Successfully Started Copying!"
- Confirmation message
- Summary of what happens next:
  - "You'll automatically copy [Trader Name]'s trades"
  - "Based on your configured settings"
  - "You can manage or stop anytime"

- "Done" button
- User clicks "Done"
- Modal closes
- Page updates to reflect active copy

**9. Active Copy State**
- Back on trader detail page
- Button now says "Manage Copy" (instead of "Copy This Trader")
- Badge displayed: "Currently Copying"
- User can click "Manage Copy" to edit settings or stop

**10. Monitor Performance**
- User can return to copy trade page
- Active copies highlighted differently
- Performance tracking dashboard (future feature)

### 1.3 Sell Order Journey: Managing Portfolio

**Journey Goal:** User sells tokens from their portfolio

**Journey Map:**
```
Wallet View → Token Selection → Trade Page (Sell) → Amount Entry → Execution → Confirmation
```

#### Detailed Flow

**1. Portfolio Review**
- User on `/wallet` page
- Reviews held assets
- Identifies token to sell
- Clicks on token in asset list

**2. Navigate to Trade Page**
- Redirected to `/trade/:tokenId`
- Page loads with chart and trade form

**3. Switch to Sell Tab**
- User clicks "Sell" tab
- Form updates to sell mode
- Balance display changes:
  - Shows TOKEN balance (not USD)
  - Example: "Balance: 15.5 SOL"

**4. Amount Entry - Sell Mode**
- Quick amount buttons now reference token balance:
  - "Quick Select (% of available):"
  - [25%] = 25% of held tokens
  - [50%] = 50% of held tokens
  - [75%] = 75% of held tokens
  - [100%] = all held tokens
- User clicks "75%" button
- Amount auto-fills: 11.625 SOL (if balance is 15.5)
- Order preview shows:
  - Tokens to sell: 11.625 SOL
  - Estimated receive: $XXX.XX USD
  - Current price per token
  - Estimated fees

**5. Validation**
- Real-time balance check:
  - If amount > token balance → Button disabled
  - Warning: "Insufficient TOKEN balance"
- If amount valid → Button enabled

**6. Execute Sell Order**
- User clicks "Sell SOL" button
- Confirmation modal appears (optional based on settings)
- User confirms
- Loading state on button
- API call executes
- Transaction processed

**7. Success & Updates**
- Success toast: "Successfully sold X SOL"
- Balance updates:
  - TOKEN balance decreases
  - USD balance increases
- Transaction added to history:
  - "Sold" label with red "-" sign
  - Token symbol and amount
  - Value in USD (red text)
  - Timestamp

**8. Transaction Verification**
- User navigates to Wallet
- Sees updated balances
- Transaction in history with "Sold" label
- Can view transaction details

---

## 2. Core Page Flows



**Purpose**: Entry point, market overview

**Core Operations**:
- View trending tokens
- Quick access to all main sections
- Real-time market data display

**Key Elements**:
- Hero section with platform branding
- Trending tokens carousel/grid
- Quick action buttons (Trade, Copy, Wallet)
- Bottom navigation bar

---

### 2.2 Login Page (`/login`)

**Purpose**: User authentication

**Core Operations**:
- Email/password login
- Navigate to registration
- Form validation feedback

**Key Elements**:
- Email input field
- Password input field
- Login button
- Register link
- Error message display

---

### 2.3 Register Page (`/register`)

**Purpose**: New user signup

**Core Operations**:
- Create account with email/password
- Form validation
- Password confirmation

**Key Elements**:
- Email input
- Password input
- Confirm password input
- Register button
- Login link
- Validation error messages

---

### 2.4 Wallet Page (`/wallet`)

**Purpose**: Portfolio overview and transaction history

**Core Operations**:
- View total balance
- Browse held tokens
- View transaction history
- Initiate deposits/withdrawals (mock)

**Key Elements**:
- Total balance card with 24h change
- Asset list with individual token values
- Transaction history list
- Deposit/Withdraw buttons

---

### 2.5 Market Page (`/market`)

**Purpose**: Browse and discover tokens

**Core Operations**:
- View all listed tokens
- Sort by various metrics
- Search tokens
- Navigate to trading page

**Key Elements**:
- Search input
- Sort tabs (Trending, Top Gainers, New)
- Token list with:
  - Logo, name, symbol
  - Current price
  - 24h change percentage
  - Volume/Market cap
- Click-through to Trade page

---

### 2.6 Trade Page (`/trade/:tokenId`)

**Purpose**: Execute buy/sell trades

**Core Operations**:
- View real-time price chart (K-line)
- Place buy orders
- Place sell orders
- Configure order parameters

**Key Elements**:
- TradingView chart (Lightweight Charts)
- Buy/Sell toggle tabs
- Amount input
- Slippage settings
- Order confirmation
- Token statistics panel

---

### 2.7 Copy Trade Page (`/copy-trade`)

**Purpose**: Discover and follow traders

**Core Operations**:
- Search traders
- Filter by metrics
- Sort trader list
- Quick-copy from card

**Key Elements**:
- Search input with icon
- Sort buttons (7d PnL, 30d PnL, Followers, Win Rate)
- Verified filter toggle
- Trader count display
- Trader card grid with:
  - Avatar, name, verified badge
  - Truncated address
  - Trading tags
  - Key stats (PnL, Win Rate)
  - Meta info (followers, trades, avg hold)
  - Copy Trade button

---

### 2.8 Trader Detail Page (`/copy-trade/:traderId`)

**Purpose**: In-depth trader analysis and copy configuration

**Core Operations**:
- Review trader performance
- View recent trades
- Configure copy settings
- Start/Stop copying

**Key Elements**:
- Profile header with avatar and info
- Stats grid (4 cards):
  - 7D PnL
  - 30D PnL  
  - Win Rate
  - Avg Hold Time
- Risk notice card
- Recent trades list
- Copy/Manage button
- Copy settings modal

---

## 3. Key Interaction Flows

### 3.1 Copy Trade Button Flow

```
User clicks "Copy Trade" on TraderCard
    ↓
Navigate to TraderDetailPage with ?action=copy
    ↓
Page loads trader details
    ↓
Check authentication status
    ├── Not authenticated → Redirect to /login
    └── Authenticated → Auto-open CopySettingsModal
           ↓
Configure settings (Step 1: Settings)
    ↓
Click "Continue"
    ↓
Validate inputs
    ├── Invalid → Show errors, stay on settings
    └── Valid → Move to Step 2: Confirm
           ↓
Review summary
    ↓
Click "Start Copying"
    ↓
API call to follow trader
    ├── Error → Show error, stay on confirm
    └── Success → Move to Step 3: Success
           ↓
Show success message
    ↓
Click "Done"
    ↓
Close modal, update UI to show "Manage Copy"
```

### 3.2 Trade Execution Flow

```
User navigates to Trade page
    ↓
Select Buy or Sell tab
    ↓
Enter amount
    ↓
Review price impact and fees
    ↓
Click "Buy" or "Sell" button
    ↓
Show confirmation modal
    ↓
User confirms transaction
    ↓
Execute order (mock)
    ↓
Show success/failure toast
    ↓
Update wallet balance
```

### 3.3 Risk Presentation Flow

Throughout the platform, risk notices appear at critical decision points:

1. **Trader Detail Page**: Persistent risk notice card
2. **Copy Settings Modal**: Warning with icon before form
3. **Confirmation Step**: Disclaimer text user must acknowledge
4. **Trade Page**: Slippage warnings, price impact alerts

---

## 4. Mobile-First Design Considerations

### Bottom Navigation
- Fixed at bottom of viewport
- 5 key sections: Home, Trade, Copy, Market, Wallet
- Active state clearly indicated
- Touch-friendly tap targets (min 44px)

### Responsive Breakpoints
- Mobile: < 640px (single column layouts)
- Tablet: 640px - 1024px (2 column grids)
- Desktop: > 1024px (multi-column layouts)

### Touch Interactions
- Cards are tappable with visual feedback
- Buttons have hover and active states
- Swipe gestures for navigation (future)
- Pull-to-refresh for data updates (future)

---

## 5. Error States & Edge Cases

### Authentication Required
- Protected routes redirect to `/login`
- Return URL preserved for post-login redirect

### Network Errors
- Toast notifications for API failures
- Retry buttons where appropriate
- Graceful degradation with cached data

### Empty States
- "No traders found" with search suggestions
- "No transactions yet" with call-to-action
- Loading skeletons during data fetch

### Form Validation
- Real-time field validation
- Clear error messages below inputs
- Disabled submit until valid

---

## 6. Component Hierarchy

```
App
├── MainLayout
│   ├── Header
│   └── BottomNav
├── Pages
│   ├── HomePage
│   ├── LoginPage
│   ├── RegisterPage
│   ├── WalletPage
│   ├── MarketPage
│   ├── TradePage
│   │   └── TradingChart
│   ├── CopyTradePage
│   │   └── TraderCard[]
│   └── TraderDetailPage
│       └── CopySettingsModal
└── Shared Components
    ├── Button
    ├── Card
    ├── Input
    └── Toast
```

---

## 7. State Management Flow

### Zustand Stores

1. **authStore**: User authentication state
2. **walletStore**: Balance and transaction data
3. **marketStore**: Token listings and prices
4. **tradingStore**: Active orders and trade history
5. **copyTradeStore**: Followed traders and copy positions

### Data Flow Pattern
```
User Action → Component Handler → Zustand Action → API Service → Update State → Re-render
```

---

## 8. Security Considerations

### Authentication
- Protected routes require valid session
- Session stored in Zustand (memory)
- Mock implementation (production would use JWT)

### Input Validation
- All user inputs sanitized
- URL parameters encoded
- Form validation client-side

### Sensitive Data
- Wallet addresses truncated in display
- Copy-to-clipboard for full addresses
- External links open in new tabs with `noopener`
