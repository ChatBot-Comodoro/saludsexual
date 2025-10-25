import { useState, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';
import { useGlobalError } from '@/contexts/ErrorContext';
import NotificationManager from '@/utils/notifications';

/**
 * Hook personalizado para manejar operaciones de API con manejo de errores integrado
 * y notificaciones automáticas
 */
export const useApiWithErrorHandling = () => {
  const { handleApiError: legacyHandleApiError } = useErrorHandler();
  const { handleApiError: globalHandleApiError } = useGlobalError();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Ejecuta una operación de API con manejo de errores automático
   * @param {Function} apiCall - Función que realiza la llamada a la API
   * @param {Object} options - Opciones de configuración
   * @param {string} options.loadingMessage - Mensaje a mostrar durante la carga
   * @param {string} options.successMessage - Mensaje a mostrar en caso de éxito
   * @param {string} options.errorMessage - Mensaje personalizado de error
   * @param {boolean} options.showLoadingNotification - Mostrar notificación de carga
   * @param {boolean} options.showSuccessNotification - Mostrar notificación de éxito
   * @param {boolean} options.showErrorNotification - Mostrar notificación de error
   * @returns {Promise<{success: boolean, data: any, error: any}>}
   */
  const executeApiCall = useCallback(async (
    apiCall, 
    {
      loadingMessage = 'Procesando...',
      successMessage = null,
      errorMessage = null,
      showLoadingNotification = false,
      showSuccessNotification = false,
      showErrorNotification = true
    } = {}
  ) => {
    setIsLoading(true);
    setError(null);
    
    let loadingId = null;
    
    // Mostrar notificación de carga si está habilitada
    if (showLoadingNotification) {
      loadingId = NotificationManager.loading(loadingMessage);
    }

    try {
      const result = await handleApiError(apiCall, errorMessage);
      
      if (result.success) {
        // Mostrar notificación de éxito si está habilitada
        if (showSuccessNotification && successMessage) {
          if (loadingId) {
            NotificationManager.update(loadingId, {
              type: 'success',
              title: 'Éxito',
              message: successMessage
            });
          } else {
            NotificationManager.success(successMessage);
          }
        } else if (loadingId) {
          NotificationManager.hide(loadingId);
        }
        
        setError(null);
        return result;
      } else {
        // Error ya fue manejado por handleApiError
        if (loadingId && !showErrorNotification) {
          NotificationManager.update(loadingId, {
            type: 'error',
            title: 'Error',
            message: result.error?.userMessage || 'Ocurrió un error'
          });
        } else if (loadingId) {
          NotificationManager.hide(loadingId);
        }
        
        setError(result.error);
        return result;
      }
    } catch (unexpectedError) {
      console.error('Error inesperado en useApiWithErrorHandling:', unexpectedError);
      
      if (loadingId) {
        NotificationManager.update(loadingId, {
          type: 'error',
          title: 'Error Inesperado',
          message: 'Ocurrió un error inesperado'
        });
      }
      
      const errorResult = {
        success: false,
        data: null,
        error: {
          type: 'general',
          userMessage: 'Ocurrió un error inesperado',
          originalError: unexpectedError
        }
      };
      
      setError(errorResult.error);
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  }, [handleApiError]);

  /**
   * Operación CRUD: Crear
   */
  const create = useCallback((apiCall, item = 'elemento') => {
    return executeApiCall(apiCall, {
      loadingMessage: `Creando ${item}...`,
      successMessage: `${item.charAt(0).toUpperCase() + item.slice(1)} creado exitosamente`,
      errorMessage: `No se pudo crear el ${item}`,
      showLoadingNotification: true,
      showSuccessNotification: true
    });
  }, [executeApiCall]);

  /**
   * Operación CRUD: Actualizar
   */
  const update = useCallback((apiCall, item = 'elemento') => {
    return executeApiCall(apiCall, {
      loadingMessage: `Actualizando ${item}...`,
      successMessage: `${item.charAt(0).toUpperCase() + item.slice(1)} actualizado exitosamente`,
      errorMessage: `No se pudo actualizar el ${item}`,
      showLoadingNotification: true,
      showSuccessNotification: true
    });
  }, [executeApiCall]);

  /**
   * Operación CRUD: Eliminar
   */
  const remove = useCallback((apiCall, item = 'elemento') => {
    return executeApiCall(apiCall, {
      loadingMessage: `Eliminando ${item}...`,
      successMessage: `${item.charAt(0).toUpperCase() + item.slice(1)} eliminado exitosamente`,
      errorMessage: `No se pudo eliminar el ${item}`,
      showLoadingNotification: true,
      showSuccessNotification: true
    });
  }, [executeApiCall]);

  /**
   * Operación de lectura (fetch/get)
   */
  const fetch = useCallback((apiCall, item = 'datos') => {
    return executeApiCall(apiCall, {
      errorMessage: `No se pudieron cargar los ${item}`,
      showErrorNotification: true
    });
  }, [executeApiCall]);

  /**
   * Limpiar errores
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estados
    isLoading,
    error,
    
    // Operaciones genéricas
    executeApiCall,
    
    // Operaciones CRUD con configuración predefinida
    create,
    update,
    remove,
    fetch,
    
    // Utilidades
    clearError
  };
};

export default useApiWithErrorHandling;