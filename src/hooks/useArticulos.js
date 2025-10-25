import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para manejar artículos desde la API
 * Proporciona funcionalidades para obtener, crear, actualizar y eliminar artículos
 */
export const useArticulos = () => {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todos los artículos
  const fetchArticulos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/articulos');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setArticulos(data.data || []);
      
      return data.data || [];
    } catch (err) {
      console.error('Error fetching artículos:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nuevo artículo
  const createArticulo = useCallback(async (articuloData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/articulos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articuloData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      
      const data = await response.json();
      
      // Recargar artículos después de crear
      await fetchArticulos();
      
      return data;
    } catch (err) {
      console.error('Error creating artículo:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchArticulos]);

  // Actualizar artículo
  const updateArticulo = useCallback(async (id, articuloData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/articulos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articuloData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      
      const data = await response.json();
      
      // Recargar artículos después de actualizar
      await fetchArticulos();
      
      return data;
    } catch (err) {
      console.error('Error updating artículo:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchArticulos]);

  // Eliminar artículo
  const deleteArticulo = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/articulos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      
      // Recargar artículos después de eliminar
      await fetchArticulos();
      
      return true;
    } catch (err) {
      console.error('Error deleting artículo:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchArticulos]);

  // Cargar artículos al montar el componente
  useEffect(() => {
    fetchArticulos();
  }, [fetchArticulos]);

  return {
    articulos,
    loading,
    error,
    fetchArticulos,
    createArticulo,
    updateArticulo,
    deleteArticulo,
  };
};

/**
 * Hook para obtener un artículo específico por ID
 */
export const useArticulo = (id) => {
  const [articulo, setArticulo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchArticulo = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/articulos/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setArticulo(data.data);
      
      return data.data;
    } catch (err) {
      console.error('Error fetching artículo:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchArticulo();
  }, [fetchArticulo]);

  return {
    articulo,
    loading,
    error,
    refetch: fetchArticulo,
  };
};

/**
 * Hook para buscar artículos por título
 */
export const useArticuloPorTitulo = (titulo) => {
  const { articulos, loading, error, fetchArticulos } = useArticulos();
  const [articuloEncontrado, setArticuloEncontrado] = useState(null);

  useEffect(() => {
    if (!titulo || !articulos.length) {
      setArticuloEncontrado(null);
      return;
    }

    // Buscar artículo que coincida con el título
    const articulo = articulos.find(art => 
      art.titulo.toLowerCase().includes(titulo.toLowerCase()) ||
      titulo.toLowerCase().includes(art.titulo.toLowerCase())
    );

    setArticuloEncontrado(articulo || null);
  }, [titulo, articulos]);

  return {
    articulo: articuloEncontrado,
    loading,
    error,
    refetch: fetchArticulos,
  };
};