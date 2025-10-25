// Hook para gestión de artículos
import { useState, useEffect } from 'react';
import { useAuthFetch } from './useAuth';

export const useArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authFetch = useAuthFetch();

  // Obtener todos los artículos (admin)
  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authFetch('/api/admin/articles');
      const data = await response.json();
      
      if (data.success) {
        setArticles(data.data);
      } else {
        throw new Error(data.message || 'Error al obtener artículos');
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtener artículo específico con secciones por ID (admin)
  const getArticleById = async (id) => {
    try {
      const response = await authFetch(`/api/admin/articles?id=${id}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al obtener artículo');
      }
    } catch (err) {
      console.error('Error fetching article by ID:', err);
      throw err;
    }
  };

  // Obtener artículo específico con secciones (admin)
  const fetchArticle = async (slug) => {
    try {
      const response = await authFetch(`/api/admin/articles?slug=${slug}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al obtener artículo');
      }
    } catch (err) {
      console.error('Error fetching article:', err);
      throw err;
    }
  };

  // Crear nuevo artículo
  const createArticle = async (articleData) => {
    try {
      const response = await authFetch('/api/admin/articles', {
        method: 'POST',
        body: JSON.stringify(articleData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchArticles(); // Refrescar lista
        return data;
      } else {
        throw new Error(data.message || 'Error al crear artículo');
      }
    } catch (err) {
      console.error('Error creating article:', err);
      throw err;
    }
  };

  // Actualizar artículo existente
  const updateArticle = async (articleData) => {
    try {
      const response = await authFetch('/api/admin/articles', {
        method: 'PUT',
        body: JSON.stringify(articleData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchArticles(); // Refrescar lista
        return data;
      } else {
        throw new Error(data.message || 'Error al actualizar artículo');
      }
    } catch (err) {
      console.error('Error updating article:', err);
      throw err;
    }
  };

  // Eliminar artículo
  const deleteArticle = async (articleId) => {
    try {
      const response = await authFetch(`/api/admin/articles?id=${articleId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchArticles(); // Refrescar lista
        return data;
      } else {
        throw new Error(data.message || 'Error al eliminar artículo');
      }
    } catch (err) {
      console.error('Error deleting article:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return {
    articles,
    loading,
    error,
    fetchArticles,
    fetchArticle,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle
  };
};

// Hook para obtener artículo público (sin autenticación)
export const usePublicArticle = (slug) => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/articles/${slug}`);
        const data = await response.json();

        if (data.success) {
          setArticle(data.data);
        } else {
          throw new Error(data.message || 'Artículo no encontrado');
        }
      } catch (err) {
        console.error('Error fetching public article:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  return { article, loading, error };
};