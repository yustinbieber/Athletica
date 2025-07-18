"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import * as XLSX from "xlsx";

interface Socio {
  documento: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  telefono: string;
  email: string; // 👈 ya no opcional
  direccion: string; // 👈 ya no opcional
  contactoEmergencia: string;
  planId: string;
  activo: boolean;
  fechaAlta: string;
  _id?: string;
}

interface Plan {
  _id: string;
  nombre: string;
  duracionDias?: number;
  precio: number;
}

const th = {
  padding: "12px",
  backgroundColor: "#1E1E1E",
  color: "#FFD700",
  textAlign: "left" as const,
  borderBottom: "1px solid #333",
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #333",
  color: "#FFFFFF",
};

export default function GestionUsuarios() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActivo, setFilterActivo] = useState<
    "todos" | "activos" | "inactivos"
  >("todos");
  const [filterPlanId, setFilterPlanId] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [fechasFormateadas, setFechasFormateadas] = useState<
    Record<string, { nac: string; alta: string }>
  >({});
  const [modalPagoSocio, setModalPagoSocio] = useState<Socio | null>(null);
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "mercado_pago">(
    "efectivo"
  );

  const token =
    typeof window !== "undefined" ? localStorage.getItem("gymToken") || "" : "";

  // Estados para edición
  const [editDocumento, setEditDocumento] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Socio, "activo">>({
    documento: "",
    nombreCompleto: "",
    fechaNacimiento: "",
    telefono: "",
    email: "",
    direccion: "",
    contactoEmergencia: "",
    planId: "",
    fechaAlta: "",
  });

  // Estado para agregar nuevo socio
  const [form, setForm] = useState<Omit<Socio, "activo">>({
    documento: "",
    nombreCompleto: "",
    fechaNacimiento: "",
    telefono: "",
    email: "",
    direccion: "",
    contactoEmergencia: "",
    planId: "",
    fechaAlta: "",
  });

  useEffect(() => {
    if (!token) return;
    fetchSocios();
    fetchPlanes();
  }, [token]);

  useEffect(() => {
    const formatos: Record<string, { nac: string; alta: string }> = {};
    socios.forEach((s) => {
      formatos[s.documento] = {
        nac: s.fechaNacimiento
          ? new Date(s.fechaNacimiento).toLocaleDateString("es-AR")
          : "N/D",
        alta: s.fechaAlta
          ? new Date(s.fechaAlta).toLocaleDateString("es-AR")
          : "N/D",
      };
    });
    setFechasFormateadas(formatos);
  }, [socios]);

  const fetchSocios = () => {
    fetch("/api/socios", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setSocios)
      .catch(console.error);
  };

  const fetchPlanes = () => {
    fetch("/api/planes", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setPlanes)
      .catch(console.error);
  };

  const sociosFiltrados = socios.filter((socio) => {
    const matchesSearch =
      socio.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      socio.documento.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlan = filterPlanId === "" || socio.planId === filterPlanId;

    const matchesActivo =
      filterActivo === "todos" ||
      (filterActivo === "activos" && socio.activo) ||
      (filterActivo === "inactivos" && !socio.activo);

    return matchesSearch && matchesPlan && matchesActivo;
  });

  // EXPORTAR
  const exportarExcel = () => {
    const datosExcel = sociosFiltrados.map((socio) => ({
      Documento: socio.documento,
      Nombre: socio.nombreCompleto,
      "Fecha de nacimiento": fechasFormateadas[socio.documento]?.nac || "N/D",
      Teléfono: socio.telefono || "N/D",
      Email: socio.email || "N/D",
      Dirección: socio.direccion || "N/D",
      "Contacto emergencia": socio.contactoEmergencia || "N/D",
      Plan: planes.find((p) => p._id === socio.planId)?.nombre || "Sin plan",
      Activo: socio.activo ? "Sí" : "No",
      "Fecha de alta": fechasFormateadas[socio.documento]?.alta || "N/D",
    }));

    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Socios");
    XLSX.writeFile(wb, "Socios_Exportados.xlsx");
  };

  // IMPORTAR
  const importarExcel = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = evt.target?.result;
      if (!data) {
        setImportLoading(false);
        return;
      }

      try {
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        // Mapear nombre plan -> planId
        const planNameToId = new Map<string, string>();
        planes.forEach((p) => planNameToId.set(p.nombre.toLowerCase(), p._id));

        const nuevosSocios: Socio[] = jsonData
          .map((item) => {
            const documento =
              String(item["Documento"] ?? "").trim() ||
              `DNI-temp-${Date.now()}`;
            const nombreCompleto =
              String(item["Nombre"] ?? "").trim() || "Sin nombre";

            // Validar fechaNacimiento
            let fechaNacimiento = "";
            if (item["Fecha de nacimiento"]) {
              const f = new Date(item["Fecha de nacimiento"]);
              fechaNacimiento = isNaN(f.getTime()) ? "" : f.toISOString();
            }

            const telefono =
              String(item["Teléfono"] ?? "").trim() || "Sin teléfono";
            const email = String(item["Email"] ?? "").trim() || "";
            const direccion = String(item["Dirección"] ?? "").trim() || "";
            const contactoEmergencia =
              String(item["Contacto emergencia"] ?? "").trim() ||
              "Sin contacto";

            const planNombre = String(item["Plan"] ?? "")
              .trim()
              .toLowerCase();
            const planId = planNameToId.get(planNombre) || "";

            const activoRaw = String(item["Activo"] ?? "").toLowerCase();
            const activo =
              activoRaw === "sí" || activoRaw === "si" || activoRaw === "true";

            let fechaAlta = "";
            if (item["Fecha de alta"]) {
              const f = new Date(item["Fecha de alta"]);
              fechaAlta = isNaN(f.getTime()) ? "" : f.toISOString();
            }

            // Validar campos obligatorios: fechaNacimiento y planId
            if (!fechaNacimiento || !planId) {
              console.warn("Registro ignorado por datos incompletos:", item);
              return null; // Ignorar este registro
            }

            return {
              documento,
              nombreCompleto,
              fechaNacimiento,
              telefono,
              email,
              direccion,
              contactoEmergencia,
              planId,
              activo,
              fechaAlta,
            };
          })
          .filter((x): x is Socio => x !== null);

        for (const socio of nuevosSocios) {
          try {
            const res = await fetch("/api/socios", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(socio),
            });

            if (!res.ok) {
              const err = await res.json();
              console.error(
                "Error al importar socio:",
                socio.documento,
                err.error
              );
            }
          } catch (error) {
            console.error("Error fetch importar socio:", error);
          }
        }

        alert("Importación completada");
        fetchSocios();
      } catch (error) {
        alert("Error al leer el archivo Excel");
        console.error(error);
      } finally {
        setImportLoading(false);
        e.target.value = ""; // reset input
      }
    };

    reader.readAsBinaryString(file);
  };

  const registrarPago = async () => {
    if (!modalPagoSocio) return;

    try {
      if (metodoPago === "efectivo") {
        // El flujo que ya tenés: actualizar fechaAlta, registrar movimiento en caja
        const resSocio = await fetch(
          `/api/socios?documento=${encodeURIComponent(
            modalPagoSocio.documento
          )}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...modalPagoSocio,
              fechaAlta: new Date().toISOString(),
            }),
          }
        );

        if (!resSocio.ok) throw new Error("Error actualizando socio");

        const plan = planes.find((p) => p._id === modalPagoSocio.planId);
        const monto = plan?.precio || 0;

        await fetch("/api/plata", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tipo: "ingreso",
            descripcion: `Pago de cuota - ${modalPagoSocio.nombreCompleto} (Efectivo)`,
            monto,
            socioId: modalPagoSocio._id || "",
          }),
        });

        alert("Pago registrado exitosamente");
        fetchSocios();
        setModalPagoSocio(null);
      } else if (metodoPago === "mercado_pago") {
        // Aquí llamás a tu endpoint backend para crear la preferencia de Mercado Pago
        const plan = planes.find((p) => p._id === modalPagoSocio.planId);
        const monto = plan?.precio || 0;

        const res = await fetch("/api/mercadopago/create_preference", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            socioId: modalPagoSocio._id,
            nombre: modalPagoSocio.nombreCompleto,
            monto,
          }),
        });

        if (!res.ok) throw new Error("Error creando preferencia de pago");

        const data = await res.json();
        const { init_point } = data; // URL de checkout que te devuelve Mercado Pago

        // Redirigir al usuario al checkout de Mercado Pago
        window.location.href = init_point;
      }
    } catch (err) {
      alert("Error al registrar el pago");
      console.error(err);
    }
  };

  // FORMULARIO AGREGAR SOCIO
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const agregarSocio = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.planId) {
      alert("Debe seleccionar un plan");
      return;
    }

    const socioNuevo: Socio = {
      documento: form.documento.trim() || `DNI-temp-${Date.now()}`,
      nombreCompleto: form.nombreCompleto.trim() || "Sin nombre",
      fechaNacimiento: form.fechaNacimiento || "",
      telefono: form.telefono.trim() || "Sin teléfono",
      email: form.email.trim() || "",
      direccion: form.direccion.trim() || "",
      contactoEmergencia: form.contactoEmergencia.trim() || "Sin contacto",
      planId: form.planId,
      activo: true,
      fechaAlta: form.fechaAlta || new Date().toISOString(),
    };

    if (!socioNuevo.fechaNacimiento) {
      alert("Debe ingresar una fecha de nacimiento válida");
      return;
    }

    try {
      const res = await fetch("/api/socios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(socioNuevo),
      });

      if (res.ok) {
        alert("Socio agregado correctamente");
        setForm({
          documento: "",
          nombreCompleto: "",
          fechaNacimiento: "",
          telefono: "",
          email: "",
          direccion: "",
          contactoEmergencia: "",
          planId: "",
          fechaAlta: "",
        });
        fetchSocios();
      } else {
        const data = await res.json();
        alert("Error al agregar socio: " + (data.error || "Error desconocido"));
      }
    } catch (error) {
      alert("Error al agregar socio");
      console.error(error);
    }
  };
  const iniciarEdicion = (socio: Socio) => {
    setEditDocumento(socio.documento);
    setEditForm({
      documento: socio.documento,
      nombreCompleto: socio.nombreCompleto,
      fechaNacimiento: socio.fechaNacimiento.split("T")[0] ?? "",
      telefono: socio.telefono,
      email: socio.email || "",
      direccion: socio.direccion || "",
      contactoEmergencia: socio.contactoEmergencia,
      planId: socio.planId,
      fechaAlta: socio.fechaAlta.split("T")[0] ?? "",
    });
  };

  const cancelarEdicion = () => {
    setEditDocumento(null);
    setEditForm({
      documento: "",
      nombreCompleto: "",
      fechaNacimiento: "",
      telefono: "",
      email: "",
      direccion: "",
      contactoEmergencia: "",
      planId: "",
      fechaAlta: "",
    });
  };

  const handleEditInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  };

  const guardarEdicion = async (e: FormEvent) => {
    e.preventDefault();
    if (!editDocumento) return;

    if (
      !editForm.nombreCompleto ||
      !editForm.fechaNacimiento ||
      !editForm.telefono ||
      !editForm.contactoEmergencia ||
      !editForm.planId ||
      !editForm.fechaAlta
    ) {
      alert("Faltan datos obligatorios para la edición");
      return;
    }

    try {
      const res = await fetch(
        `/api/socios?documento=${encodeURIComponent(editDocumento)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        }
      );

      if (res.ok) {
        alert("Socio actualizado");
        cancelarEdicion();
        fetchSocios();
      } else {
        const data = await res.json();
        alert(
          "Error al actualizar socio: " + (data.error || "Error desconocido")
        );
      }
    } catch (error) {
      alert("Error al actualizar socio");
      console.error(error);
    }
  };

  return (
    <div
      style={{ backgroundColor: "#121212", minHeight: "100vh", padding: 20 }}
    >
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <h1 style={{ color: "#FFD700", marginBottom: 20 }}>
          Gestión de Socios
        </h1>

        <form
          onSubmit={agregarSocio}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 16,
            marginBottom: 30,
            backgroundColor: "#1E1E1E",
            padding: 24,
            borderRadius: 12,
            boxShadow: "0 0 10px rgba(255, 215, 0, 0.1)",
          }}
        >
          {[
            { name: "documento", placeholder: "Documento", required: true },
            {
              name: "nombreCompleto",
              placeholder: "Nombre Completo",
              required: true,
            },
            // Aquí ponemos label para la fechaNacimiento
            {
              name: "fechaNacimiento",
              placeholder: "Fecha de Nacimiento",
              type: "date",
              required: true,
              label: "Fecha de Nacimiento",
            },
            { name: "telefono", placeholder: "Teléfono", required: true },
            { name: "email", placeholder: "Email" },
            { name: "direccion", placeholder: "Dirección" },
            {
              name: "contactoEmergencia",
              placeholder: "Contacto Emergencia",
              required: true,
            },
            // Y aquí para fechaAlta
            {
              name: "fechaAlta",
              placeholder: "Fecha de Alta",
              type: "date",
              label: "Fecha de Alta",
            },
          ].map((field) =>
            field.type === "date" ? (
              <div
                key={field.name}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <label
                  htmlFor={field.name}
                  style={{
                    color: "#FFD700",
                    fontSize: 12,
                    marginBottom: 4,
                    fontWeight: "600",
                  }}
                >
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="date"
                  value={(form as any)[field.name]}
                  onChange={handleInputChange}
                  required={field.required}
                  style={{
                    padding: "10px",
                    borderRadius: 8,
                    border: "1px solid #333",
                    backgroundColor: "#121212",
                    color: "#FFD700",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
            ) : (
              <input
                key={field.name}
                name={field.name}
                type={field.type || "text"}
                placeholder={field.placeholder}
                value={(form as any)[field.name]}
                onChange={handleInputChange}
                required={field.required}
                style={{
                  padding: "10px",
                  borderRadius: 8,
                  border: "1px solid #333",
                  backgroundColor: "#121212",
                  color: "#FFD700",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            )
          )}

          <select
            name="planId"
            value={form.planId}
            onChange={handleInputChange}
            required
            style={{
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #333",
              backgroundColor: "#121212",
              color: form.planId ? "#FFD700" : "#777",
              fontSize: 14,
              outline: "none",
            }}
          >
            <option value="">-- Seleccione plan --</option>
            {planes.map((plan) => (
              <option key={plan._id} value={plan._id} style={{ color: "#000" }}>
                {plan.nombre}
              </option>
            ))}
          </select>

          <button
            type="submit"
            style={{
              backgroundColor: "#FFA500",
              color: "#000",
              border: "none",
              borderRadius: 8,
              padding: "12px 16px",
              fontWeight: "bold",
              cursor: "pointer",
              gridColumn: "span 1",
              transition: "background-color 0.3s",
            }}
          >
            Agregar Socio
          </button>
        </form>

        {/* FILTROS Y BUSCADOR */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 20,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Buscar por nombre o documento"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: 8,
              borderRadius: 4,
              border: "none",
              flexGrow: 1,
              minWidth: 200,
            }}
          />
          <select
            value={filterActivo}
            onChange={(e) => setFilterActivo(e.target.value as any)}
            style={{ padding: 8, borderRadius: 4, border: "none" }}
          >
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
          <select
            value={filterPlanId}
            onChange={(e) => setFilterPlanId(e.target.value)}
            style={{ padding: 8, borderRadius: 4, border: "none" }}
          >
            <option value="">Todos los planes</option>
            {planes.map((plan) => (
              <option key={plan._id} value={plan._id}>
                {plan.nombre}
              </option>
            ))}
          </select>
          <button
            onClick={exportarExcel}
            style={{
              backgroundColor: "#FFD700",
              color: "#000",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Exportar Excel
          </button>
          <label
            htmlFor="fileInput"
            style={{
              backgroundColor: importLoading ? "#ccc" : "#FFA500",
              color: "#000",
              borderRadius: 4,
              padding: "8px 16px",
              cursor: importLoading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              userSelect: "none",
            }}
          >
            {importLoading ? "Importando..." : "Importar Excel"}
          </label>
          <input
            type="file"
            id="fileInput"
            accept=".xls,.xlsx"
            style={{ display: "none" }}
            onChange={importarExcel}
            disabled={importLoading}
          />
        </div>

        {/* TABLA SOCIOS */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Documento</th>
              <th style={th}>Nombre</th>
              <th style={th}>Nacimiento</th>
              <th style={th}>Teléfono</th>
              <th style={th}>Email</th>
              <th style={th}>Dirección</th>
              <th style={th}>Contacto Emergencia</th>
              <th style={th}>Plan</th>
              <th style={th}>Activo</th>
              <th style={th}>Fecha Alta</th>
              <th style={th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sociosFiltrados.map((socio) => (
              <tr key={socio.documento}>
                <td style={td}>{socio.documento}</td>
                <td style={td}>{socio.nombreCompleto}</td>
                <td style={td}>
                  {fechasFormateadas[socio.documento]?.nac || "N/D"}
                </td>
                <td style={td}>{socio.telefono}</td>
                <td style={td}>{socio.email || "-"}</td>
                <td style={td}>{socio.direccion || "-"}</td>
                <td style={td}>{socio.contactoEmergencia}</td>
                <td style={td}>
                  {planes.find((p) => p._id === socio.planId)?.nombre ||
                    "Sin plan"}
                </td>
                <td style={td}>{socio.activo ? "Sí" : "No"}</td>
                <td style={td}>
                  {fechasFormateadas[socio.documento]?.alta || "N/D"}
                </td>
                <td style={td}>
                  <button
                    style={{
                      backgroundColor: "#FFA500",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: 4,
                      cursor: "pointer",
                      color: "#000",
                      fontWeight: "bold",
                      marginRight: 6,
                    }}
                    onClick={() => iniciarEdicion(socio)}
                  >
                    Editar
                  </button>
                  <button
                    style={{
                      backgroundColor: "#00cc66",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: 4,
                      cursor: "pointer",
                      color: "#000",
                      fontWeight: "bold",
                      marginRight: 6,
                    }}
                    onClick={() => setModalPagoSocio(socio)}
                  >
                    Pagar cuota
                  </button>

                  {/* Aquí podrías agregar botón para eliminar si quieres */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL EDICIÓN */}
      {editDocumento && (
        <div
          onClick={cancelarEdicion}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={guardarEdicion}
            style={{
              backgroundColor: "#121212", // fondo igual al main
              padding: 20,
              borderRadius: 8,
              width: "90%",
              maxWidth: 600,
              color: "#FFD700", // dorado como los títulos y texto destacado
              display: "grid",
              gap: 12,
              gridTemplateColumns: "1fr 1fr",
            }}
          >
            <h2 style={{ gridColumn: "span 2", marginBottom: 10 }}>
              Editar Socio
            </h2>

            <label style={{ gridColumn: "span 2", color: "#FFD700" }}>
              Documento (no editable)
              <input
                type="text"
                value={editDocumento}
                disabled
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #333",
                  backgroundColor: "#1E1E1E",
                  color: "#FFD700",
                  marginTop: 4,
                }}
              />
            </label>

            <label style={{ color: "#FFD700" }}>
              Nombre Completo *
              <input
                type="text"
                name="nombreCompleto"
                value={editForm.nombreCompleto}
                onChange={handleEditInputChange}
                required
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #333",
                  backgroundColor: "#1E1E1E",
                  color: "#FFD700",
                  marginTop: 4,
                }}
              />
            </label>

            <label style={{ color: "#FFD700" }}>
              Fecha Nacimiento *
              <input
                type="date"
                name="fechaNacimiento"
                value={editForm.fechaNacimiento}
                onChange={handleEditInputChange}
                required
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #333",
                  backgroundColor: "#1E1E1E",
                  color: "#FFD700",
                  marginTop: 4,
                }}
              />
            </label>

            <label style={{ color: "#FFD700" }}>
              Teléfono *
              <input
                type="text"
                name="telefono"
                value={editForm.telefono}
                onChange={handleEditInputChange}
                required
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #333",
                  backgroundColor: "#1E1E1E",
                  color: "#FFD700",
                  marginTop: 4,
                }}
              />
            </label>

            <label style={{ color: "#FFD700" }}>
              Email
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditInputChange}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #333",
                  backgroundColor: "#1E1E1E",
                  color: "#FFD700",
                  marginTop: 4,
                }}
              />
            </label>

            <label style={{ color: "#FFD700" }}>
              Dirección
              <input
                type="text"
                name="direccion"
                value={editForm.direccion}
                onChange={handleEditInputChange}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #333",
                  backgroundColor: "#1E1E1E",
                  color: "#FFD700",
                  marginTop: 4,
                }}
              />
            </label>

            <label style={{ color: "#FFD700" }}>
              Contacto Emergencia *
              <input
                type="text"
                name="contactoEmergencia"
                value={editForm.contactoEmergencia}
                onChange={handleEditInputChange}
                required
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #333",
                  backgroundColor: "#1E1E1E",
                  color: "#FFD700",
                  marginTop: 4,
                }}
              />
            </label>

            <label style={{ color: "#FFD700" }}>
              Plan *
              <select
                name="planId"
                value={editForm.planId}
                onChange={handleEditInputChange}
                required
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #333",
                  backgroundColor: "#1E1E1E",
                  color: "#FFD700",
                  marginTop: 4,
                }}
              >
                <option value="" style={{ color: "#000" }}>
                  -- Seleccione plan --
                </option>
                {planes.map((plan) => (
                  <option
                    key={plan._id}
                    value={plan._id}
                    style={{ color: "#000" }}
                  >
                    {plan.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ color: "#FFD700" }}>
              Fecha Alta *
              <input
                type="date"
                name="fechaAlta"
                value={editForm.fechaAlta}
                onChange={handleEditInputChange}
                required
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #333",
                  backgroundColor: "#1E1E1E",
                  color: "#FFD700",
                  marginTop: 4,
                }}
              />
            </label>

            <div
              style={{
                gridColumn: "span 2",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 10,
              }}
            >
              <button
                type="button"
                onClick={cancelarEdicion}
                style={{
                  backgroundColor: "#333",
                  color: "#FFD700",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{
                  backgroundColor: "#FFA500",
                  color: "#000",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
      {modalPagoSocio && (
        <div
          onClick={() => setModalPagoSocio(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#121212",
              padding: 24,
              borderRadius: 8,
              color: "#FFD700",
              width: "90%",
              maxWidth: 400,
            }}
          >
            <h2 style={{ marginBottom: 16 }}>Pagar cuota</h2>
            <p>
              ¿Registrar pago para{" "}
              <strong>{modalPagoSocio.nombreCompleto}</strong>?
            </p>

            <label style={{ display: "block", marginTop: 16 }}>
              Método de pago:
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value as any)}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #333",
                  backgroundColor: "#1E1E1E",
                  color: "#FFD700",
                  marginTop: 8,
                }}
              >
                <option value="efectivo">Efectivo</option>
                <option value="mercado_pago">
                  Mercado Pago (proximamente)
                </option>
              </select>
            </label>

            <div
              style={{
                marginTop: 20,
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                onClick={() => setModalPagoSocio(null)}
                style={{
                  backgroundColor: "#333",
                  color: "#FFD700",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 16px",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={registrarPago}
                style={{
                  backgroundColor: "#00cc66",
                  color: "#000",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 16px",
                  fontWeight: "bold",
                }}
              >
                Confirmar pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
