// gym-login/page.tsx (o donde tengas el login del gym)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GymLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/gym-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error en login');
        return;
      }

      const data = await res.json();
      localStorage.setItem('gymToken', data.token);

      // Redirigir a la página de selección de empleado, por ej:
      router.push('/gym-dashboard/seleccionar-empleado');
    } catch {
      setError('Error en la conexión');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Login Gimnasio</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ display: 'block', marginBottom: 10, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: 'block', marginBottom: 10, padding: 8 }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>
          Iniciar sesión
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
