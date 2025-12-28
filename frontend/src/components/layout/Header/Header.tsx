import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut, Wallet, ChevronDown, X } from 'lucide-react';

import { useAuthStore } from '@/store/authStore';
import { useMarketStore } from '@/store/marketStore';
import { formatAddress } from '@/utils/format';

import styles from './Header.module.scss';

export const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { tokens, fetchTokens } = useMarketStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch tokens if not loaded (for search)
  useEffect(() => {
    if (tokens.length === 0) {
      void fetchTokens();
    }
  }, [tokens.length, fetchTokens]);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter tokens based on search query
  const filteredTokens = searchQuery.trim()
    ? tokens.filter(
        (token) =>
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ).slice(0, 5)
    : [];

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    setSearchQuery('');
  };

  const handleTokenSelect = (tokenId: string) => {
    navigate(`/trade/${tokenId}`);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const handleUserIconClick = () => {
    if (isAuthenticated) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      navigate('/login');
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoText}>GMGN</span>
          <span className={styles.logoDot}>.AI</span>
        </Link>

        <nav className={styles.nav}>
          <Link to="/market" className={styles.navLink}>Market</Link>
          <Link to="/trade" className={styles.navLink}>Trade</Link>
          <Link to="/copy-trade" className={styles.navLink}>Copy Trade</Link>
        </nav>

        <div className={styles.actions}>
          {/* Search */}
          <div className={styles.searchWrapper}>
            {isSearchOpen ? (
              <div className={styles.searchBox}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
                <button
                  type="button"
                  className={styles.searchClose}
                  onClick={handleSearchToggle}
                  aria-label="Close search"
                >
                  <X size={18} />
                </button>

                {/* Search Results */}
                {filteredTokens.length > 0 && (
                  <div className={styles.searchResults}>
                    {filteredTokens.map((token) => (
                      <button
                        key={token.id}
                        type="button"
                        className={styles.searchResult}
                        onClick={() => handleTokenSelect(token.id)}
                      >
                        <img
                          src={token.logoUrl}
                          alt={token.symbol}
                          className={styles.tokenLogo}
                          onError={(e) => {
                            e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${token.symbol}`;
                          }}
                        />
                        <div className={styles.tokenInfo}>
                          <span className={styles.tokenSymbol}>{token.symbol}</span>
                          <span className={styles.tokenName}>{token.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className={styles.iconBtn}
                onClick={handleSearchToggle}
                aria-label="Search"
              >
                <Search size={20} />
              </button>
            )}
          </div>

          {/* Notifications (placeholder - not implemented) */}
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="Notifications"
            title="Notifications coming soon"
          >
            <Bell size={20} />
          </button>

          {/* User Menu */}
          <div className={styles.userMenu} ref={dropdownRef}>
            <button
              type="button"
              className={`${styles.iconBtn} ${isAuthenticated ? styles.authenticated : ''}`}
              onClick={handleUserIconClick}
              aria-label={isAuthenticated ? 'Account menu' : 'Sign in'}
            >
              <User size={20} />
              {isAuthenticated && <ChevronDown size={14} className={styles.chevron} />}
            </button>

            {/* Dropdown Menu */}
            {isAuthenticated && isDropdownOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <span className={styles.dropdownEmail}>{user?.email}</span>
                  {user?.walletAddress && (
                    <span className={styles.dropdownAddress}>
                      {formatAddress(user.walletAddress)}
                    </span>
                  )}
                </div>
                <div className={styles.dropdownDivider} />
                <Link
                  to="/wallet"
                  className={styles.dropdownItem}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Wallet size={18} />
                  <span>Wallet</span>
                </Link>
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
