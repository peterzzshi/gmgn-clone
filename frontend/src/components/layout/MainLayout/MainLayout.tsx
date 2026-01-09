import { Outlet } from 'react-router-dom';

import { BottomNav } from '@/components/layout/BottomNav/BottomNav';

import styles from './MainLayout.module.scss';
import { Header } from '../Header/Header';

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
