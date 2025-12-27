import { Outlet } from 'react-router-dom';

import { Header } from '@components/layout/Header';
import { BottomNav } from '@components/layout/BottomNav';

import styles from './MainLayout.module.scss';

export const MainLayout = () => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
