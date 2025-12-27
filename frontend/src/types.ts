// --------------------------------------------
// User / Auth Types
// --------------------------------------------

export interface User {
  readonly id: string;
  readonly email: string;
  readonly walletAddress: string | null;
  readonly displayName: string;
  readonly avatarUrl: string;
  readonly passwordHash: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// User without sensitive data
export type SafeUser = Omit<User, 'passwordHash' | 'updatedAt'>;

export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
}

// --------------------------------------------
// Token / Market Types
// --------------------------------------------

export type Chain = 'solana' | 'ethereum' | 'bsc' | 'polygon';

export interface Token {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly address: string;
  readonly decimals: number;
  readonly logoUrl: string;
  readonly chain: Chain;
}

export interface TokenMarketData {
  readonly tokenId: string;
  readonly price: number;
  readonly priceChange24h: number;
  readonly priceChangePercent24h: number;
  readonly volume24h: number;
  readonly marketCap: number;
  readonly liquidity: number;
  readonly holders: number;
  readonly updatedAt: string;
}

export interface TokenWithMarket extends Token {
  readonly market: TokenMarketData;
}

// --------------------------------------------
// Chart / OHLCV Types
// --------------------------------------------

export interface OHLCVData {
  readonly time: number;
  readonly open: number;
  readonly high: number;
  readonly low: number;
  readonly close: number;
  readonly volume: number;
}

export type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

// --------------------------------------------
// Trading Types
// --------------------------------------------

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit';
export type OrderStatus = 'pending' | 'filled' | 'cancelled' | 'failed';

export interface Order {
  readonly id: string;
  readonly userId: string;
  readonly tokenId: string;
  readonly side: OrderSide;
  readonly type: OrderType;
  readonly status: OrderStatus;
  readonly amount: number;
  readonly price: number;
  readonly filledAmount: number;
  readonly filledPrice: number;
  readonly fee: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TradeParams {
  readonly tokenId: string;
  readonly side: OrderSide;
  readonly type: OrderType;
  readonly amount: number;
  readonly price?: number;
  readonly slippage?: number;
}

// --------------------------------------------
// Wallet Types
// --------------------------------------------

export interface WalletBalance {
  readonly tokenId: string;
  readonly symbol: string;
  readonly name: string;
  readonly logoUrl: string;
  readonly balance: number;
  readonly balanceUsd: number;
  readonly price: number;
  readonly priceChange24h: number;
}

export interface WalletSummary {
  readonly totalBalanceUsd: number;
  readonly totalPnl24h: number;
  readonly totalPnlPercent24h: number;
  readonly balances: readonly WalletBalance[];
}

export type TransactionType = 'deposit' | 'withdraw' | 'swap' | 'transfer';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export interface Transaction {
  readonly id: string;
  readonly type: TransactionType;
  readonly tokenId: string;
  readonly symbol: string;
  readonly amount: number;
  readonly amountUsd: number;
  readonly fee: number;
  readonly txHash: string;
  readonly status: TransactionStatus;
  readonly createdAt: string;
}

// --------------------------------------------
// Copy Trading Types
// --------------------------------------------

export interface Trader {
  readonly id: string;
  readonly address: string;
  readonly displayName: string;
  readonly avatarUrl: string;
  readonly bio: string;
  readonly followers: number;
  readonly pnl7d: number;
  readonly pnl30d: number;
  readonly pnlPercent7d: number;
  readonly pnlPercent30d: number;
  readonly winRate: number;
  readonly totalTrades: number;
  readonly avgHoldTime: number;
  readonly isVerified: boolean;
  readonly tags: readonly string[];
}

export interface CopyTradeSettings {
  readonly traderId: string;
  readonly isActive: boolean;
  readonly maxPositionSize: number;
  readonly copyRatio: number;
  readonly stopLoss: number;
  readonly takeProfit: number;
  readonly maxDailyTrades: number;
}

export interface CopyPosition {
  readonly id: string;
  readonly traderId: string;
  readonly userId: string;
  readonly tokenId: string;
  readonly entryPrice: number;
  readonly currentPrice: number;
  readonly amount: number;
  readonly pnl: number;
  readonly pnlPercent: number;
  readonly status: 'open' | 'closed';
  readonly openedAt: string;
  readonly closedAt: string | null;
}

// --------------------------------------------
// API Response Types (Backend Contract)
// --------------------------------------------

/**
 * Standard API success response
 */
export interface ApiResponse<T> {
  readonly success: true;
  readonly data: T;
  readonly timestamp: string;
}

/**
 * Standard API error response
 */
export interface ApiError {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: Record<string, unknown>;
  };
  readonly timestamp: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
  readonly hasMore: boolean;
}

/**
 * Paginated data wrapper
 */
export interface PaginatedData<T> {
  readonly items: readonly T[];
  readonly pagination: PaginationMeta;
}

// --------------------------------------------
// Typed Backend Response Types
// --------------------------------------------

/**
 * Token endpoints
 */
export type TokensResponse = ApiResponse<PaginatedData<TokenWithMarket>>;
export type TokenResponse = ApiResponse<TokenWithMarket>;
export type ChartDataResponse = ApiResponse<readonly OHLCVData[]>;

/**
 * Auth endpoints
 */
export type AuthResponse = ApiResponse<{
  readonly user: SafeUser;
  readonly tokens: AuthTokens;
}>;

/**
 * Trading endpoints
 */
export type OrderResponse = ApiResponse<Order>;
export type OrdersResponse = ApiResponse<readonly Order[]>;

/**
 * Wallet endpoints
 */
export type WalletSummaryResponse = ApiResponse<WalletSummary>;
export type TransactionsResponse = ApiResponse<readonly Transaction[]>;

/**
 * Copy Trade endpoints
 */
export type TradersResponse = ApiResponse<PaginatedData<Trader>>;
export type TraderResponse = ApiResponse<Trader>;

/**
 * Health check
 */
export type HealthResponse = ApiResponse<{
  readonly status: 'ok';
  readonly timestamp: string;
  readonly uptime: number;
}>;

