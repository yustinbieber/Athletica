'use client';
import { ReactNode } from 'react';

export default function LayoutContainer({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        marginLeft: '220px', // <-- para dejar espacio a la sidebar
        padding: '40px 20px',
        minHeight: '100vh',
        backgroundColor: '#121212',
        color: '#FFF',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  );
}
