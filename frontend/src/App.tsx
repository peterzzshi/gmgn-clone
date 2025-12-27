import { Routes, Route, Navigate } from 'react-router-dom';

import { MainLayout } from '@/components/layout/MainLayout/MainLayout';
import { HomePage } from '@/pages/Home/HomePage';
import { MarketPage } from '@/pages/Market/MarketPage';
import { TradePage } from '@/pages/Trade/TradePage';
import { WalletPage } from '@/pages/Wallet/WalletPage';
import { CopyTradePage } from '@/pages/CopyTrade/CopyTradePage';
import { LoginPage } from '@/pages/Login/LoginPage';
import { RegisterPage } from '@/pages/Register/RegisterPage';

export const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes with layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/trade" element={<TradePage />} />
        <Route path="/trade/:tokenId" element={<TradePage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/copy-trade" element={<CopyTradePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
