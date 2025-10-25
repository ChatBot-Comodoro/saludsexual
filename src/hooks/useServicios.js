import { useState, useEffect, useCallback } from 'react';

export function useServicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener servicios
  const fetchServicios = useCallback(async () => {
    try {
      console.log('🔄 Hook: Iniciando fetch de servicios...');
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/servicios');
      console.log('📡 Hook: Respuesta del API:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Hook: Error en la respuesta:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Hook: Datos recibidos:', result.count, 'servicios');
      console.log('📋 Hook: Primer servicio como ejemplo:', result.data[0]);
      
      setServicios(result.data);
    } catch (err) {
      console.error('❌ Hook: Error fetching servicios:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      console.log('🏁 Hook: Fetch de servicios completado');
    }
  }, []);

  useEffect(() => {
    fetchServicios();
  }, [fetchServicios]);

  return { 
    servicios, 
    loading, 
    error, 
    refetch: fetchServicios 
  };
}
