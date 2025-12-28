import { Outlet } from 'react-router-dom';

import { Header } from '../Header/Header';

import styles from './MainLayout.module.scss';

import { BottomNav } from '@/components/layout/BottomNav/BottomNav';

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
