import { Routes, Route, Navigate } from 'react-router-dom';

import { MainLayout } from '@/components/layout/MainLayout/MainLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute/ProtectedRoute';
import { usePythPriceSubscription } from '@/hooks/usePythPrice';
import { CopyTradePage } from '@/pages/CopyTrade/CopyTradePage';
import { HomePage } from '@/pages/Home/HomePage';
import { LoginPage } from '@/pages/Login/LoginPage';
import { MarketPage } from '@/pages/Market/MarketPage';
import { RegisterPage } from '@/pages/Register/RegisterPage';
import { TradePage } from '@/pages/Trade/TradePage';
import { TraderDetailPage } from '@/pages/TraderDetail/TraderDetailPage';
import { WalletPage } from '@/pages/Wallet/WalletPage';

export const App = () => {
  // Start Pyth price subscription for real-time updates
  usePythPriceSubscription();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Routes with layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/trade" element={<TradePage />} />
        <Route path="/trade/:tokenId" element={<TradePage />} />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          }
        />
        <Route path="/copy-trade" element={<CopyTradePage />} />
        <Route path="/copy-trade/:traderId" element={<TraderDetailPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
