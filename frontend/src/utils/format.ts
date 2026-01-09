export const formatNumber = (
  value: number,
  decimals = 2,
  locale = 'en-US',
): string =>
  new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

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

export const formatPercent = (value: number, decimals = 2): string => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatNumber(value, decimals)}%`;
};

export const formatPercentAbs = (value: number, decimals = 2): string =>
  `${formatNumber(Math.abs(value), decimals)}%`;

export const formatTokenAmount = (amount: number, symbol: string, decimals = 4): string => {
  if (amount >= 1_000_000) {
    return `${formatNumber(amount / 1_000_000, 2)}M ${symbol}`;
  }

  if (amount >= 1_000) {
    return `${formatNumber(amount / 1_000, 2)}K ${symbol}`;
  }

  return `${formatNumber(amount, decimals)} ${symbol}`;
};

export const formatAddress = (
  address: string,
  startChars = 4,
  endChars = 4,
): string => {
  if (address.length <= startChars + endChars + 3) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

export const formatTxHash = (hash: string, chars = 8): string =>
  formatAddress(hash, chars, chars);

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${String(Math.floor(seconds))}s`;
  }

  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${String(minutes)}m`;
  }

  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${String(hours)}h`;
  }

  const days = Math.floor(seconds / 86400);
  return `${String(days)}d`;
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) {
    return 'just now';
  }

  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${String(minutes)}m ago`;
  }

  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${String(hours)}h ago`;
  }

  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400);
    return `${String(days)}d ago`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
