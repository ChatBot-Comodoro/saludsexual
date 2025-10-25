import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useApiWithGlobalError } from './useApiWithGlobalError';

// Hook para realizar peticiones autenticadas
const useAuthFetch = () => {
  const { data: session } = useSession();
  
  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    return response;
  };

  return authFetch;
};

// Hook para obtener usuarios
export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authFetch = useAuthFetch();
  const { executeApiCall } = useApiWithGlobalError();

  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    
    const result = await executeApiCall(async () => {
      const response = await authFetch('/api/admin/usuarios');
      const data = await response.json();
      
      if (data.success) {
        return data.data || [];
      } else {
        throw new Error(data.message || 'Error al obtener usuarios');
      }
    });

    if (result.success) {
      setUsuarios(result.data);
    } else {
      setError(result.error);
      setUsuarios([]);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return {
    usuarios,
    loading,
    error,
    refetch: fetchUsuarios
  };
};

// Hook para obtener roles
export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authFetch = useAuthFetch();

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authFetch('/api/admin/roles');
      const data = await response.json();
      
      if (data.success) {
        setRoles(data.data || []);
      } else {
        throw new Error(data.message || 'Error al obtener roles');
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err.message);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    loading,
    error,
    refetch: fetchRoles
  };
};

// Hook para obtener estados
export const useEstados = () => {
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authFetch = useAuthFetch();

  const fetchEstados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authFetch('/api/admin/estados');
      const data = await response.json();
      
      if (data.success) {
        setEstados(data.data || []);
      } else {
        throw new Error(data.message || 'Error al obtener estados');
      }
    } catch (err) {
      console.error('Error fetching estados:', err);
      setError(err.message);
      setEstados([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstados();
  }, []);

  return {
    estados,
    loading,
    error,
    refetch: fetchEstados
  };
};

// Hook para operaciones de usuarios
export const useUsuarioOperations = () => {
  const [loading, setLoading] = useState(false);
  const authFetch = useAuthFetch();

  // Crear usuario
  const crearUsuario = async (usuarioData) => {
    try {
      setLoading(true);
      
      const response = await authFetch('/api/admin/usuarios', {
        method: 'POST',
        body: JSON.stringify(usuarioData),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al crear usuario');
      }
      
      return data;
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado de usuario
  const cambiarEstadoUsuario = async (usuarioId, nuevoEstado, adminId) => {
    try {
      setLoading(true);
      
      const response = await authFetch(`/api/admin/usuarios/${usuarioId}`, {
        method: 'PUT',
        body: JSON.stringify({
          estado: nuevoEstado,
          admin_id: adminId
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al cambiar estado del usuario');
      }
      
      return data;
    } catch (error) {
      console.error('Error cambiando estado usuario:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar usuario
  const eliminarUsuario = async (usuarioId, adminId) => {
    try {
      setLoading(true);
      
      const response = await authFetch(`/api/admin/usuarios/${usuarioId}`, {
        method: 'DELETE',
        body: JSON.stringify({
          admin_id: adminId
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al eliminar usuario');
      }
      
      return data;
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    crearUsuario,
    cambiarEstadoUsuario,
    eliminarUsuario
  };
};