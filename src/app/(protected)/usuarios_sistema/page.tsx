"use client";
import { useState, useEffect } from "react";
import { Usuario } from "@/src/types/interfaces";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { useUser } from "@/src/context/UserContext";


export default function UsuariosPage() {
    const { currentUser, loading } = useUser();
    if (loading) return <p>Cargando...</p>;
    if (!currentUser) return null; 
  
    //roles
    const ROLES = [ "Administrador", "Supervisor", "RRHH"] as const;

    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [empleados, setEmpleados] = useState<{Id: number; Nombres: string; Apellidos: string}[]>([]);

    const [newUsuario, setNewUsuario] = useState<Usuario>({
        Id: 0,
        Usuario: "",
        Clave: "",
        Rol: "Supervisor",
        Id_Empleado: 0,
        Estado: "Activo",
    });

    //estados para modal, mensaje, edicion
    const [showModal, setShowModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMensaje, setToastMensaje] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditingId] = useState<number | null>(null);

    //variables para permisos
    const isAdmin = currentUser.role === "Administrador";
    const isOwner = Number(currentUser.id) === newUsuario.Id;
    const canEditCampos = isAdmin || isOwner;

    //obtener usuarios al inicio
    useEffect(() => {
        getUsuarios();
        getEmpleados();
    }, []);

    const limpiarFormulario = () => {
        setNewUsuario({
        Id: 0,
        Usuario: "",
        Clave: "",
        Rol: "Supervisor",
        Id_Empleado: 0,
        Estado: "Activo",
        });
        setEditingId(null);
        setEditMode(false);
    };

    //para actualizar el valor en el objeto si se cambia en el html
    const updateValorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewUsuario((anterior) => ({ ...anterior, [name]: value }));
    };

    const mostrarToast = (mensaje: string) => {
        setToastMensaje(mensaje);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    //cargar empleados
    const getEmpleados = async () => {
        fetch("/api/empleados")
        .then(res => res.json())
        .then((data) => setEmpleados(data.filter((a: any) => a.Estado === "Activo")))
        .catch(err => console.error("Error cargando empleados:", err));
    };


    //obtener lista de usuarios
    const getUsuarios = async () => {
        try {
        const res = await fetch("/api/usuarios");
        const data = await res.json();
        if (Array.isArray(data)) setUsuarios(data);
        } catch (err) {
        console.error("Error cargando usuarios:", err);
        }
    };

    //crear nuevo usuario
    const guardarUsuario = async () => {
        try {
        await fetch("/api/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUsuario),
        });
        limpiarFormulario();
        setShowModal(false);
        mostrarToast("Usuario registrado correctamente");
        getUsuarios();
        } catch (err) {
        console.error("Error agregando usuario:", err);
        }
    };

    //actualizar usuario
    const actualizarUsuario = async () => {
        if (editId === null) return;
        try {
        await fetch(`/api/usuarios?id=${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUsuario),
        });
        limpiarFormulario();
        setShowModal(false);
        mostrarToast("Usuario actualizado correctamente");
        getUsuarios();
        } catch (err) {
        console.error("Error actualizando usuario:", err);
        }
    };

    //eliminar usuario
    const eliminarUsuario = async (id: number) => {
        if (!confirm("¿Desea eliminar este usuario?")) return;
        try {
        await fetch(`/api/usuarios?id=${id}`, { method: "DELETE" });
        mostrarToast("Usuario eliminado correctamente");
        getUsuarios();
        } catch (err) {
        console.error("Error eliminando usuario:", err);
        }
    };

    //abrir modal para crear
    const abrirFormulario = () => {
        limpiarFormulario();
        setShowModal(true);
    };

    //abrir modal para editar
    const abrirFormularioEditar = async (id: number) => {
        try {
        const res = await fetch(`/api/usuarios?id=${id}`);
        const data: Usuario = await res.json();
        setNewUsuario({ ...data, Estado: "Activo" }); 
        setEditingId(id);
        setEditMode(true);
        setShowModal(true);
        } catch (err) {
        console.error("Error cargando usuario:", err);
        }
    };


    return (
        <ProtectedRoute>
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Usuarios del Sistema</h2>
                <button className="btn btn-primary" onClick={abrirFormulario} disabled={!isAdmin}>
                <i className="bi bi-plus-square"> </i> Nuevo Usuario
                </button>
            </div>

            <table className="table table-bordered table-hover">
                <thead className="table-dark">
                <tr className="text-center">
                    <th>ID</th>
                    <th>Usuario</th>
                    {isAdmin && <th>Clave</th>}
                    <th>Rol</th>
                    <th>Empleado</th>
                    <th>Estado</th>
                    <th colSpan={2}>Acciones</th>
                </tr>
                </thead>
                <tbody>
                    {usuarios.map((u) => {
                        const isFilaAdmin  = u.Rol === "Administrador";
                        const isFilaOwner = Number(currentUser.id) === u.Id;
                        const canEdit = isAdmin || isFilaOwner; 
                        const canDelete = isAdmin && !isFilaAdmin; 
                        return (
                        <tr key={u.Id} className="align-middle text-center">
                            <td>{u.Id}</td>
                            <td>{u.Usuario}</td>
                            {isAdmin && <td>{u.Clave}</td>}
                            <td>{u.Rol}</td>
                            <td>{u.Nombres} {u.Apellidos}</td>
                            <td>
                                <span className={`badge fs-7 px-3 py-2 ${u.Estado === "Activo" ? "bg-success" : "bg-secondary"}`}>
                                    {u.Estado}
                                </span>
                            </td>
                            <td>
                            <button className="btn btn-warning btn-sm" onClick={() => abrirFormularioEditar(u.Id)} disabled={!canEdit}>
                                <i className="bi bi-pencil"></i> Actualizar
                            </button>
                            </td>
                            <td>
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => eliminarUsuario(u.Id)}
                                disabled={!canDelete}
                            >
                                <i className="bi bi-trash"></i> Eliminar
                            </button>
                            </td>
                        </tr>
                        );
                    })}
                    </tbody>
            </table>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h5>{editMode ? "Actualizar Usuario" : "Agregar Usuario"}</h5>
                            <button className="modal-close" onClick={() => { setShowModal(false); limpiarFormulario(); }}>&times;</button>
                        </div>

                        <div className="modal-body">
                        <label>Usuario</label>
                        <input type="text" name="Usuario" className="form-control" value={newUsuario.Usuario} onChange={updateValorChange}
                        disabled={!isAdmin}/>

                        <label className="mt-2">Contraseña</label>
                        <input type="text" name="Clave" className="form-control" value={newUsuario.Clave} onChange={updateValorChange} disabled={!canEditCampos}/>

                        <label className="mt-2">Rol</label>
                        <select name="Rol" className="form-select" value={newUsuario.Rol} onChange={updateValorChange} disabled={!isAdmin}>
                            {ROLES.map((rol) => (
                            <option key={rol} value={rol}>{rol}</option>
                            ))}
                        </select>

                        <label className="mt-2">Empleado (opcional)</label>
                        <select name="Id_Empleado" className="form-select" value={newUsuario.Id_Empleado ?? ""} disabled={!isAdmin}
                        onChange={(e) => {
                            const value = e.target.value ? Number(e.target.value) : null;
                            setNewUsuario((anterior) => ({ ...anterior, Id_Empleado: value }));
                        }}>
                            <option value="">-- Sin empleado --</option>
                            {empleados.map((emp: any) => (
                                <option key={emp.Id} value={emp.Id}>
                                {emp.Nombres} {emp.Apellidos}
                                </option>
                            ))}
                        </select>
                        </div>

                        <div className="modal-footer mt-3">
                        <button className="btn btn-danger" onClick={() => { setShowModal(false); limpiarFormulario(); }}>
                            Cancelar
                        </button>
                        <button className="btn btn-success" onClick={editMode ? actualizarUsuario : guardarUsuario} disabled={!newUsuario.Usuario.trim() || (!editMode && !newUsuario.Clave.trim())}>
                            {editMode ? "Actualizar" : "Guardar"}
                        </button>
                        </div>
                    </div>
                </div>
            )}

            {showToast && (
                <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 2000 }}>
                    <div className="toast show border-0 text-dark">
                        <div className="toast-header bg-secondary bg-opacity-25">
                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                            <strong className="me-auto">Notificación</strong>
                            <button type="button" className="btn-close ms-2 mb-1" onClick={() => setShowToast(false)}></button>
                        </div>
                        <div className="toast-body fs-7 text-center">{toastMensaje}</div>
                    </div>
                </div>
            )}
        </div>
        </ProtectedRoute>
    );
}

