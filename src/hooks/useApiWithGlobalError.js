import { useState, useCallback } from 'react';
import { useGlobalError } from '@/contexts/ErrorContext';

/**
 * Hook simplificado para manejar operaciones de API con overlay global de errores
 */
export const useApiWithGlobalError = () => {
  const { handleApiError } = useGlobalError();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Ejecuta una operación de API y muestra errores en overlay global
   * @param {Function} apiCall - Función que realiza la llamada a la API
   * @param {Object} options - Opciones de configuración
   * @returns {Promise<{success: boolean, data: any, error: any}>}
   */
  const executeApiCall = useCallback(async (apiCall, options = {}) => {
    setIsLoading(true);
    
    try {
      const result = await apiCall();
      setIsLoading(false);
      return { 
        success: true, 
        data: result,
        error: null 
      };
    } catch (error) {
      setIsLoading(false);
      
      // Usar el sistema global para manejar el error
      handleApiError(error);
      
      return { 
        success: false, 
        data: null,
        error: error 
      };
    }
  }, [handleApiError]);

  /**
   * Operaciones CRUD simplificadas
   */
  const create = useCallback((apiCall) => {
    return executeApiCall(apiCall);
  }, [executeApiCall]);

  const read = useCallback((apiCall) => {
    return executeApiCall(apiCall);
  }, [executeApiCall]);

  const update = useCallback((apiCall) => {
    return executeApiCall(apiCall);
  }, [executeApiCall]);

  const remove = useCallback((apiCall) => {
    return executeApiCall(apiCall);
  }, [executeApiCall]);

  return {
    isLoading,
    executeApiCall,
    create,
    read,
    update,
    remove
  };
};

export default useApiWithGlobalError;