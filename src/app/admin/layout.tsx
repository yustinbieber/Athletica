// src/app/admin/layout.tsx
import Sidebar from '@/components/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{
        marginLeft: '220px',
        padding: '20px',
        width: '100%',
        backgroundColor: '#121212',
        minHeight: '100vh',
        color: '#FFFFFF',
      }}>
        {children}
      </main>
    </div>
  );
}
