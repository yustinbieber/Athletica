'use client';

import { useState, useEffect, useRef } from 'react';

interface SocioInfo {
  documento: string;
  nombreCompleto: string;
  planNombre: string;
  fechaVencimiento: string;
  diasRestantes: number;
  fotoUrl?: string;
  fechaAlta: string;
  planDuracionDias: number;
}

export default function ControlIngreso() {
  const [documento, setDocumento] = useState('');
  const [socio, setSocio] = useState<SocioInfo | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función para calcular si el socio está activo
  function calcularActivo(fechaAltaStr: string, duracionDias: number): boolean {
    const fechaAlta = new Date(fechaAltaStr);
    const fechaVencimiento = new Date(fechaAlta.getTime() + duracionDias * 24 * 60 * 60 * 1000);
    const hoy = new Date();
    return hoy <= fechaVencimiento;
  }

  useEffect(() => {
    function onFullscreenChange() {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      window.dispatchEvent(new CustomEvent('fullscreenchange', { detail: fs }));
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  async function buscarSocio() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setError('');
    setSocio(null);
    setVisible(true);

    if (!documento.trim()) {
      setError('Por favor ingresa un documento');
      resetAfterDelay();
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/socios?documento=${encodeURIComponent(documento)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('gymToken') || ''}` },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al buscar socio');
        resetAfterDelay();
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (!data) {
        setError('Socio no encontrado');
        resetAfterDelay();
        setLoading(false);
        return;
      }

      const fechaAlta = new Date(data.fechaAlta);
      const duracionDias = data.planDuracionDias || 30;
      const fechaVencimiento = new Date(fechaAlta.getTime() + duracionDias * 24 * 60 * 60 * 1000);
      const hoy = new Date();

      const diffMs = fechaVencimiento.getTime() - hoy.getTime();
      const diasRestantes = Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24)), 0);

      setSocio({
        documento: data.documento,
        nombreCompleto: data.nombreCompleto,
        planNombre: data.planNombre || 'N/A',
        fechaVencimiento: fechaVencimiento.toLocaleDateString(),
        diasRestantes,
        fotoUrl: data.fotoUrl || null,
        fechaAlta: data.fechaAlta,
        planDuracionDias: duracionDias,
      });

      resetAfterDelay();
    } catch {
      setError('Error al buscar socio');
      resetAfterDelay();
    } finally {
      setLoading(false);
    }
  }

  function resetAfterDelay() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(true);
    timeoutRef.current = setTimeout(() => {
      setError('');
      setSocio(null);
      setDocumento('');
      setVisible(true);
    }, 3000);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      buscarSocio();
    }
  }

  return (
    <>
      <style>{`
        .fade {
          opacity: 1;
          transition: opacity 0.6s ease-in-out;
        }
        .fade.hide {
          opacity: 0;
        }
        .foto-socio {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          margin: 0 auto 24px;
          object-fit: cover;
          border: 3px solid #FF6B00;
          box-shadow: 0 0 15px #FF6B00AA;
        }
        .fullscreen-button {
          position: fixed;
          top: 12px;
          right: 12px;
          z-index: 1000;
          background-color: #FF6B00;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 10px 18px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 0 8px #FF6B00CC;
          user-select: none;
        }
      `}</style>

      <button className="fullscreen-button" onClick={toggleFullscreen}>
        {isFullscreen ? 'Salir Pantalla Completa' : 'Pantalla Completa'}
      </button>

      <div
        style={{
          maxWidth: 600,
          margin: '60px auto',
          padding: '0 20px',
          color: '#eee',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: 40, marginBottom: 40 }}>Control de Ingreso</h1>

        {!socio && !error && (
          <div className={`fade ${visible ? '' : 'hide'}`}>
            <input
              type="text"
              placeholder="Ingrese documento"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: 28,
                borderRadius: 8,
                border: '1px solid #444',
                marginBottom: 24,
                backgroundColor: '#2c2c2c',
                color: '#fff',
                outline: 'none',
                textAlign: 'center',
                letterSpacing: 2,
              }}
              autoFocus
            />

            <button
              onClick={buscarSocio}
              disabled={loading}
              style={{
                backgroundColor: '#FF6B00',
                border: 'none',
                padding: '16px',
                color: 'white',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: 24,
                width: '100%',
                marginBottom: 40,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        )}

        {error && (
          <p
            className={`fade ${visible ? '' : 'hide'}`}
            style={{
              color: 'tomato',
              fontSize: 24,
              fontWeight: '600',
              marginBottom: 40,
              userSelect: 'none',
            }}
          >
            {error}
          </p>
        )}

        {socio && (
          <div
            className={`fade ${visible ? '' : 'hide'}`}
            style={{
              backgroundColor: '#1e1e1e',
              padding: 30,
              borderRadius: 12,
              border: calcularActivo(socio.fechaAlta, socio.planDuracionDias)
                ? '4px solid #4CAF50'
                : '4px solid #FF3B3B',
              fontSize: 32,
              lineHeight: 1.3,
              fontWeight: '600',
              userSelect: 'none',
            }}
          >
            <img
              src={
                socio.fotoUrl ||
                'https://cdn-icons-png.flaticon.com/512/149/149071.png'
              }
              alt="Foto socio"
              className="foto-socio"
            />

            <p>
              <strong>Documento:</strong> {socio.documento}
            </p>
            <p>
              <strong>Nombre:</strong> {socio.nombreCompleto}
            </p>
            <p>
              <strong>Plan:</strong> {socio.planNombre}
            </p>
            <p>
              <strong>Vence el:</strong> {socio.fechaVencimiento}
            </p>
            <p>
              <strong>Días restantes:</strong> {socio.diasRestantes}
            </p>
            <p>
              <strong>Estado:</strong>{' '}
              {calcularActivo(socio.fechaAlta, socio.planDuracionDias)
                ? '✅ Activo'
                : '⛔ Inactivo'}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
