// ============================================
// Formatting Utilities
// All pure functions - no side effects
// ============================================

/**
 * Format number with commas and decimal places
 */
export const formatNumber = (
  value: number,
  decimals: number = 2,
  locale: string = 'en-US',
): string =>
  new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

/**
 * Format price with appropriate decimals
 * Small values get more decimals, large values get fewer
 */
export const formatPrice = (price: number): string => {
  if (price === 0) {
    return '0.00';
  }

  if (price < 0.00001) {
    return price.toExponential(2);
  }

  if (price < 0.0001) {
    return formatNumber(price, 8);
  }

  if (price < 0.01) {
    return formatNumber(price, 6);
  }

  if (price < 1) {
    return formatNumber(price, 4);
  }

  if (price < 1000) {
    return formatNumber(price, 2);
  }

  return formatNumber(price, 2);
};

/**
 * Format USD value with $ prefix
 */
export const formatUSD = (value: number): string => {
  if (Math.abs(value) >= 1_000_000_000) {
    return `$${formatNumber(value / 1_000_000_000, 2)}B`;
  }

  if (Math.abs(value) >= 1_000_000) {
    return `$${formatNumber(value / 1_000_000, 2)}M`;
  }

  if (Math.abs(value) >= 1_000) {
    return `$${formatNumber(value / 1_000, 2)}K`;
  }

  return `$${formatNumber(value, 2)}`;
};

/**
 * Format compact number (abbreviated)
 */
export const formatCompact = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1_000_000_000) {
    return `${sign}${formatNumber(absValue / 1_000_000_000, 1)}B`;
  }

  if (absValue >= 1_000_000) {
    return `${sign}${formatNumber(absValue / 1_000_000, 1)}M`;
  }

  if (absValue >= 1_000) {
    return `${sign}${formatNumber(absValue / 1_000, 1)}K`;
  }

  return formatNumber(absValue, 2);
};

/**
 * Format compact USD (always abbreviated)
 */
export const formatCompactUSD = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1_000_000_000) {
    return `${sign}$${formatNumber(absValue / 1_000_000_000, 1)}B`;
  }

  if (absValue >= 1_000_000) {
    return `${sign}$${formatNumber(absValue / 1_000_000, 1)}M`;
  }

  if (absValue >= 1_000) {
    return `${sign}$${formatNumber(absValue / 1_000, 1)}K`;
  }

  return `${sign}$${formatNumber(absValue, 2)}`;
};

/**
 * Format percentage with sign
 */
export const formatPercent = (value: number, decimals: number = 2): string => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatNumber(value, decimals)}%`;
};

/**
 * Format percentage without sign
 */
export const formatPercentAbs = (value: number, decimals: number = 2): string =>
  `${formatNumber(Math.abs(value), decimals)}%`;

/**
 * Format token amount with symbol
 */
export const formatTokenAmount = (amount: number, symbol: string, decimals: number = 4): string => {
  if (amount >= 1_000_000) {
    return `${formatNumber(amount / 1_000_000, 2)}M ${symbol}`;
  }

  if (amount >= 1_000) {
    return `${formatNumber(amount / 1_000, 2)}K ${symbol}`;
  }

  return `${formatNumber(amount, decimals)} ${symbol}`;
};

/**
 * Format wallet address (truncated)
 */
export const formatAddress = (
  address: string,
  startChars: number = 4,
  endChars: number = 4,
): string => {
  if (address.length <= startChars + endChars + 3) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Format transaction hash
 */
export const formatTxHash = (hash: string, chars: number = 8): string =>
  formatAddress(hash, chars, chars);

/**
 * Format time duration in human readable form
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.floor(seconds)}s`;
  }

  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  }

  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours}h`;
  }

  const days = Math.floor(seconds / 86400);
  return `${days}d`;
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) {
    return 'just now';
  }

  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  }

  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours}h ago`;
  }

  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400);
    return `${days}d ago`;
  }

  // For older dates, return formatted date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date and time
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format date only
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format time only
 */
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
