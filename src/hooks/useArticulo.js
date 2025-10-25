import { useState, useEffect } from 'react';

/**
 * Hook personalizado para cargar un artículo desde la API
 * @param {string} titulo - El título del artículo a buscar
 * @returns {object} - { articulo, loading, error }
 */
export function useArticulo(titulo) {
  const [articulo, setArticulo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarArticulo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Llamada a la API para obtener todos los artículos
        const response = await fetch('/api/articulos');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        
        // Debug: verificar qué datos recibimos
        console.log('Datos recibidos de la API:', responseData);
        console.log('Tipo de datos:', typeof responseData);
        
        // Extraer los artículos de la respuesta estructurada
        const articulos = responseData.data || responseData;
        
        console.log('Artículos extraídos:', articulos);
        console.log('Es array:', Array.isArray(articulos));
        console.log('Títulos disponibles:', articulos.map(art => art.titulo));
        console.log('Buscando título:', titulo);
        
        // Verificar que articulos sea un array
        if (!Array.isArray(articulos)) {
          throw new Error('La respuesta de la API no es un array de artículos');
        }
        
        if (articulos.length === 0) {
          throw new Error('No hay artículos disponibles en la base de datos');
        }
        
        // Buscar el artículo por título (case insensitive y más flexible)
        const articuloEncontrado = articulos.find(art => {
          if (!art.titulo) return false;
          
          const tituloArticulo = art.titulo.toLowerCase();
          const tituloBuscado = titulo.toLowerCase();
          
          // Búsqueda exacta
          if (tituloArticulo === tituloBuscado) return true;
          
          // Búsqueda por inclusión mutua
          if (tituloArticulo.includes(tituloBuscado) || tituloBuscado.includes(tituloArticulo)) return true;
          
          // Búsqueda por palabras clave específicas
          if (tituloBuscado.includes('hepatitis') && tituloArticulo.includes('hepatitis')) return true;
          if (tituloBuscado.includes('anticonceptiv') && tituloArticulo.includes('anticonceptiv')) return true;
          if (tituloBuscado.includes('prep') && tituloArticulo.includes('prep')) return true;
          if (tituloBuscado.includes('embarazo') && tituloArticulo.includes('embarazo')) return true;
          if (tituloBuscado.includes('gonorrea') && tituloArticulo.includes('gonorrea')) return true;
          if (tituloBuscado.includes('sífilis') && tituloArticulo.includes('sífilis')) return true;
          if (tituloBuscado.includes('clamidia') && tituloArticulo.includes('clamidia')) return true;
          if (tituloBuscado.includes('hpv') && tituloArticulo.includes('hpv')) return true;
          if (tituloBuscado.includes('vacunación') && tituloArticulo.includes('vacunación')) return true;
          if (tituloBuscado.includes('vih') && tituloArticulo.includes('vih')) return true;
          
          return false;
        });
        
        console.log('Artículo encontrado:', articuloEncontrado);
        
        if (!articuloEncontrado) {
          throw new Error(`Artículo "${titulo}" no encontrado. Títulos disponibles: ${articulos.map(art => art.titulo).join(', ')}`);
        }
        
        setArticulo(articuloEncontrado);
        
      } catch (err) {
        console.error('Error cargando artículo:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (titulo) {
      cargarArticulo();
    }
  }, [titulo]);

  return { articulo, loading, error };
}

/**
 * Hook para cargar un artículo específico por ID
 * @param {number|string} id - ID del artículo
 * @returns {object} - { articulo, loading, error }
 */
export function useArticuloPorId(id) {
  const [articulo, setArticulo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarArticulo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/articulos/${id}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        
        // Extraer el artículo de la respuesta estructurada
        const articuloData = responseData.data || responseData;
        setArticulo(articuloData);
        
      } catch (err) {
        console.error('Error cargando artículo por ID:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      cargarArticulo();
    }
  }, [id]);

  return { articulo, loading, error };
}