import { Routes, Route, Navigate } from 'react-router-dom';

import { MainLayout } from '@components/layout/MainLayout';

// Pages - These will be created
import { HomePage } from '@pages/Home';
import { TradePage } from '@pages/Trade';
import { WalletPage } from '@pages/Wallet';
import { CopyTradePage } from '@pages/CopyTrade';
import { MarketPage } from '@pages/Market';
import { LoginPage } from '@pages/Login';
import { RegisterPage } from '@pages/Register';

const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes with layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/trade" element={<TradePage />} />
        <Route path="/trade/:tokenId" element={<TradePage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/copy-trade" element={<CopyTradePage />} />
        <Route path="/market" element={<MarketPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
