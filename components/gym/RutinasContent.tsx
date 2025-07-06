'use client';

import React, { useState, useEffect } from 'react';

interface Ejercicio {
  nombre: string;
  series: number;
  repeticiones: string;
  descanso: string;
}

interface DiaRutina {
  nombreDia: string;
  ejercicios: Ejercicio[];
}

interface Rutina {
  _id: string;
  nombre: string;
  descripcion?: string;
  dias: DiaRutina[];
  gymId: string;
  creadoPor: string;
  createdAt: string;
  updatedAt: string;
}

interface RutinasContentProps {
  gymId: string;
  creadoPor?: string;
}

const RutinasContent: React.FC<RutinasContentProps> = ({ gymId, creadoPor = 'defaultUserId' }) => {
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [dias, setDias] = useState<DiaRutina[]>([
    { nombreDia: '', ejercicios: [{ nombre: '', series: 3, repeticiones: '', descanso: '' }] },
  ]);

  // Fetch rutinas existentes
  const fetchRutinas = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rutinas?gymId=${gymId}`);
      if (!res.ok) throw new Error('Error al cargar rutinas');
      const data = await res.json();
      setRutinas(data);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setRutinas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRutinas();
  }, [gymId]);

  // Manejo días y ejercicios
  const agregarDia = () => {
    setDias([...dias, { nombreDia: '', ejercicios: [{ nombre: '', series: 3, repeticiones: '', descanso: '' }] }]);
  };
  const eliminarDia = (index: number) => {
    if (dias.length === 1) return;
    setDias(dias.filter((_, i) => i !== index));
  };
  const cambiarNombreDia = (index: number, valor: string) => {
    const copy = [...dias];
    copy[index].nombreDia = valor;
    setDias(copy);
  };

  const agregarEjercicio = (diaIndex: number) => {
    const copy = [...dias];
    copy[diaIndex].ejercicios.push({ nombre: '', series: 3, repeticiones: '', descanso: '' });
    setDias(copy);
  };
  const eliminarEjercicio = (diaIndex: number, ejIndex: number) => {
    const copy = [...dias];
    if (copy[diaIndex].ejercicios.length === 1) return;
    copy[diaIndex].ejercicios = copy[diaIndex].ejercicios.filter((_, i) => i !== ejIndex);
    setDias(copy);
  };
  const cambiarEjercicio = (
    diaIndex: number,
    ejIndex: number,
    campo: keyof Ejercicio,
    valor: string | number
  ) => {
    const copy = [...dias];
    (copy[diaIndex].ejercicios[ejIndex] as any)[campo] = valor;
    setDias(copy);
  };

  // Enviar formulario para crear rutina
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert('El nombre de la rutina es obligatorio');
      return;
    }
    try {
      const res = await fetch('/api/rutinas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, descripcion, dias, gymId, creadoPor }),
      });
      if (!res.ok) throw new Error('Error al crear rutina');
      setNombre('');
      setDescripcion('');
      setDias([{ nombreDia: '', ejercicios: [{ nombre: '', series: 3, repeticiones: '', descanso: '' }] }]);
      fetchRutinas();
    } catch (error) {
      alert((error as Error).message);
    }
  };

  // Eliminar rutina
  const handleEliminar = async (id: string) => {
    if (!confirm('¿Seguro quieres eliminar esta rutina?')) return;
    try {
      const res = await fetch(`/api/rutinas/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar rutina');
      fetchRutinas();
    } catch (error) {
      alert((error as Error).message);
    }
  };

    return (
      <div style={{ padding: 20 }}>
        <h2 style={{ color: 'orange', textAlign: 'center', marginTop: '100px' }}>
          🚧 Esta sección estará disponible próximamente 🚧
        </h2>
        <p style={{ textAlign: 'center' }}>Estamos trabajando en esta funcionalidad para mejorar tu experiencia.</p>
      </div>
    );
};

export default RutinasContent;
