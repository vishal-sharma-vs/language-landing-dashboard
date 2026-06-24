import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';

const NAV_ITEMS = [
  { to: '/language',         label: 'Language',         icon: '🌐' },
  { to: '/landing-page',     label: 'Landing Page',     icon: '🏠' },
  { to: '/over-quota-users', label: 'Over Quota Users', icon: '📊' },
];

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>⚙️</span>
          <span className={styles.brandName}>Admin Dashboard</span>
        </div>
        <div className={styles.links}>
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.linkIcon}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
