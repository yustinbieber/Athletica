'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GymLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<'admin' | 'empleado'>('admin');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const loginData =
      rol === 'admin'
        ? { username, password, rol }
        : { email, password, rol };

    try {
      const res = await fetch('/api/gym-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error en login');
        return;
      }

      const data = await res.json();
      localStorage.setItem('gymToken', data.token);

      const payload = JSON.parse(atob(data.token.split('.')[1]));
      localStorage.setItem('rol', payload.rol);

      if (payload.rol === 'admin') {
        localStorage.setItem('empleadoNombre', payload.username);
        localStorage.setItem('gymName', payload.gymName);
      } else if (payload.rol === 'empleado') {
        localStorage.setItem('empleadoNombre', payload.nombreCompleto);
        localStorage.setItem('gymName', payload.gymName);
      }

      router.push('/gym-dashboard');
    } catch {
      setError('Error en la conexión');
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // Fondo con imagen + overlay oscuro para atenuar
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/gym-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: 20,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)', // blanco con transparencia
          padding: 30,
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          maxWidth: 400,
          width: '100%',
          boxSizing: 'border-box',
          textAlign: 'center',
          backdropFilter: 'blur(8px)', // suaviza fondo detrás del formulario (opcional)
          border: '1px solid rgba(255,255,255,0.3)', // borde delicado
        }}
      >
        <h1 style={{ marginBottom: 24, color: '#ff6b00', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
          Login Gimnasio
        </h1>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => setRol('admin')}
            style={{
              flex: 1,
              padding: '12px 0',
              fontWeight: '600',
              cursor: 'pointer',
              borderRadius: '8px 0 0 8px',
              border: '1px solid #ff6b00',
              backgroundColor: rol === 'admin' ? '#ff6b00' : 'transparent',
              color: rol === 'admin' ? '#fff' : '#ff6b00',
              transition: 'all 0.3s ease',
              fontSize: 16,
              outline: 'none',
            }}
          >
            Dueño
          </button>

          <button
            type="button"
            onClick={() => setRol('empleado')}
            style={{
              flex: 1,
              padding: '12px 0',
              fontWeight: '600',
              cursor: 'pointer',
              borderRadius: '0 8px 8px 0',
              border: '1px solid #ff6b00',
              borderLeft: 'none',
              backgroundColor: rol === 'empleado' ? '#ff6b00' : 'transparent',
              color: rol === 'empleado' ? '#fff' : '#ff6b00',
              transition: 'all 0.3s ease',
              fontSize: 16,
              outline: 'none',
            }}
          >
            Empleado
          </button>
        </div>

        {rol === 'admin' ? (
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: 16,
              borderRadius: 8,
              border: '1px solid #ccc',
              fontSize: 16,
              boxSizing: 'border-box',
            }}
          />
        ) : (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: 16,
              borderRadius: 8,
              border: '1px solid #ccc',
              fontSize: 16,
              boxSizing: 'border-box',
            }}
          />
        )}

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '12px 16px',
            marginBottom: 24,
            borderRadius: 8,
            border: '1px solid #ccc',
            fontSize: 16,
            boxSizing: 'border-box',
          }}
        />

        <button
          type="submit"
          style={{
            backgroundColor: '#ff6b00',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 18,
            padding: '12px',
            width: '100%',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget.style.backgroundColor = '#e65c00');
          }}
          onMouseLeave={(e) => {
            (e.currentTarget.style.backgroundColor = '#ff6b00');
          }}
        >
          Iniciar sesión
        </button>

        {error && (
          <p
            style={{
              marginTop: 16,
              color: '#d93025',
              fontWeight: '600',
              fontSize: 14,
            }}
          >
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
