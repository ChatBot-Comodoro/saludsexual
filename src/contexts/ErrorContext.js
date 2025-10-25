import React, { createContext, useContext, useState, useCallback } from 'react';
import ErrorOverlay from '../components/ErrorOverlay';

const ErrorContext = createContext();

export const useGlobalError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useGlobalError debe ser usado dentro de ErrorProvider');
  }
  return context;
};

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [isErrorVisible, setIsErrorVisible] = useState(false);

  const showError = useCallback((errorType = 'general', customTitle = null, customMessage = null, options = {}) => {
    setError({
      type: errorType,
      title: customTitle,
      message: customMessage,
      ...options
    });
    setIsErrorVisible(true);
  }, []);

  const hideError = useCallback(() => {
    setIsErrorVisible(false);
    // Dar tiempo para la animación antes de limpiar el estado
    setTimeout(() => {
      setError(null);
    }, 300);
  }, []);

  const showDatabaseError = useCallback((customMessage = null) => {
    showError(
      'database',
      null,
      customMessage || 'No podemos acceder a la información en este momento. Puede deberse a mantenimiento del sistema.',
      { 
        showRetryButton: true,
        showHomeButton: true 
      }
    );
  }, [showError]);

  const showNetworkError = useCallback((customMessage = null) => {
    showError(
      'network',
      null,
      customMessage || 'Verifica tu conexión a internet y vuelve a intentar.',
      { 
        showRetryButton: true,
        showHomeButton: true 
      }
    );
  }, [showError]);

  const showServerError = useCallback((customMessage = null) => {
    showError(
      'server',
      null,
      customMessage || 'Nuestros servidores están experimentando dificultades. El equipo técnico ha sido notificado.',
      { 
        showRetryButton: true,
        showHomeButton: true 
      }
    );
  }, [showError]);

  const showGenericError = useCallback((customMessage = null) => {
    showError(
      'general',
      null,
      customMessage || 'Ocurrió un error inesperado. Puedes intentar recargar la página.',
      { 
        showRetryButton: true,
        showHomeButton: true 
      }
    );
  }, [showError]);

  // Función principal para manejar errores automáticamente
  const handleApiError = useCallback((error) => {
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorStatus = error?.status || 0;

    // Errores de base de datos
    if (errorMessage.includes('database') || 
        errorMessage.includes('postgresql') || 
        errorMessage.includes('db') || 
        errorMessage.includes('connection timeout') ||
        errorMessage.includes('prisma') ||
        errorMessage.includes('sql')) {
      showDatabaseError();
      return;
    }

    // Errores de red/conexión
    if (errorMessage.includes('network') || 
        errorMessage.includes('fetch failed') || 
        errorMessage.includes('connection') || 
        errorStatus === 0) {
      showNetworkError();
      return;
    }

    // Errores del servidor
    if (errorStatus >= 500 || errorMessage.includes('internal server error')) {
      showServerError();
      return;
    }

    // Error genérico para otros casos
    showGenericError();
  }, [showDatabaseError, showNetworkError, showServerError, showGenericError]);

  const value = {
    // Estado
    error,
    isErrorVisible,
    
    // Funciones básicas
    showError,
    hideError,
    
    // Funciones específicas
    showDatabaseError,
    showNetworkError,
    showServerError,
    showGenericError,
    
    // Función principal
    handleApiError
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <ErrorOverlay
        opened={isErrorVisible}
        onClose={hideError}
        errorType={error?.type || 'general'}
        title={error?.title}
        message={error?.message}
        showRetryButton={error?.showRetryButton !== false}
        showHomeButton={error?.showHomeButton !== false}
        onRetry={error?.onRetry || (() => window.location.reload())}
      />
    </ErrorContext.Provider>
  );
};