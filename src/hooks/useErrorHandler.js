import { useState, useCallback } from 'react';
import { IconWifiOff, IconDatabase, IconServerOff, IconAlertTriangle } from '@tabler/icons-react';
import NotificationManager from '@/utils/notifications';

export const useErrorHandler = () => {
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getErrorType = useCallback((error) => {
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorStatus = error?.status || 0;
    
    // Errores de red
    if (errorMessage.includes('network') || errorMessage.includes('fetch failed') || 
        errorMessage.includes('connection') || errorStatus === 0) {
      return 'network';
    }
    
    // Errores de base de datos
    if (errorMessage.includes('database') || errorMessage.includes('postgresql') || 
        errorMessage.includes('db') || errorMessage.includes('connection timeout')) {
      return 'database';
    }
    
    // Errores del servidor
    if (errorStatus >= 500 || errorMessage.includes('internal server error')) {
      return 'server';
    }
    
    // Errores de autenticación
    if (errorStatus === 401 || errorStatus === 403) {
      return 'auth';
    }
    
    // Errores de validación
    if (errorStatus >= 400 && errorStatus < 500) {
      return 'validation';
    }
    
    return 'general';
  }, []);

  const getErrorNotification = useCallback((errorType, customMessage = null) => {
    const notifications_config = {
      network: {
        title: 'Problema de Conexión',
        message: customMessage || 'No se pudo conectar al servidor. Verifica tu conexión a internet.',
        color: 'orange',
        icon: <IconWifiOff size={16} />
      },
      database: {
        title: 'Error de Base de Datos',
        message: customMessage || 'Hubo un problema al acceder a los datos. Intenta nuevamente en unos momentos.',
        color: 'red',
        icon: <IconDatabase size={16} />
      },
      server: {
        title: 'Error del Servidor',
        message: customMessage || 'El servidor está experimentando problemas. Nuestro equipo ha sido notificado.',
        color: 'red',
        icon: <IconServerOff size={16} />
      },
      auth: {
        title: 'Error de Autenticación',
        message: customMessage || 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        color: 'yellow',
        icon: <IconAlertTriangle size={16} />
      },
      validation: {
        title: 'Error de Validación',
        message: customMessage || 'Los datos proporcionados no son válidos. Revisa la información ingresada.',
        color: 'blue',
        icon: <IconAlertTriangle size={16} />
      },
      general: {
        title: 'Error Inesperado',
        message: customMessage || 'Ocurrió un error inesperado. Intenta recargar la página.',
        color: 'red',
        icon: <IconAlertTriangle size={16} />
      }
    };

    return notifications_config[errorType] || notifications_config.general;
  }, []);

  const handleError = useCallback((error, customMessage = null, showNotification = true) => {
    console.error('Error capturado:', error);
    
    const errorType = getErrorType(error);
    const notificationConfig = getErrorNotification(errorType, customMessage);
    
    setIsError(true);
    setErrorMessage(notificationConfig.message);
    
    if (showNotification) {
      NotificationManager.apiError(error, customMessage);
    }
    
    // Log adicional para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Details');
      console.log('Type:', errorType);
      console.log('Original Error:', error);
      console.log('User Message:', notificationConfig.message);
      console.groupEnd();
    }
    
    return {
      type: errorType,
      userMessage: notificationConfig.message,
      originalError: error
    };
  }, [getErrorType, getErrorNotification]);

  const clearError = useCallback(() => {
    setIsError(false);
    setErrorMessage('');
  }, []);

  const handleApiError = useCallback(async (apiCall, customMessage = null) => {
    try {
      clearError();
      const result = await apiCall();
      return { success: true, data: result };
    } catch (error) {
      const errorDetails = handleError(error, customMessage);
      return { 
        success: false, 
        error: errorDetails,
        data: null 
      };
    }
  }, [handleError, clearError]);

  return {
    isError,
    errorMessage,
    handleError,
    clearError,
    handleApiError
  };
};

export default useErrorHandler;