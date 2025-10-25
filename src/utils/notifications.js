import { notifications } from '@mantine/notifications';
import {
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconInfoCircle,
  IconDatabase,
  IconWifiOff,
  IconServerOff
} from '@tabler/icons-react';

// Configuración de tipos de notificación
const NOTIFICATION_TYPES = {
  success: {
    color: 'green',
    icon: IconCheck,
    autoClose: 4000
  },
  error: {
    color: 'red', 
    icon: IconX,
    autoClose: 6000
  },
  warning: {
    color: 'yellow',
    icon: IconAlertTriangle,
    autoClose: 5000
  },
  info: {
    color: 'blue',
    icon: IconInfoCircle,
    autoClose: 4000
  },
  network: {
    color: 'orange',
    icon: IconWifiOff,
    autoClose: 7000
  },
  database: {
    color: 'red',
    icon: IconDatabase,
    autoClose: 7000
  },
  server: {
    color: 'red',
    icon: IconServerOff,
    autoClose: 7000
  }
};

// Mensajes predefinidos para errores comunes
const ERROR_MESSAGES = {
  network: {
    title: 'Problema de Conexión',
    message: 'No se pudo conectar al servidor. Verifica tu conexión a internet.',
  },
  database: {
    title: 'Error de Base de Datos',
    message: 'Hubo un problema al acceder a los datos. Intenta nuevamente en unos momentos.',
  },
  server: {
    title: 'Error del Servidor',
    message: 'El servidor está experimentando problemas. Nuestro equipo ha sido notificado.',
  },
  auth: {
    title: 'Error de Autenticación',
    message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  },
  validation: {
    title: 'Error de Validación',
    message: 'Los datos proporcionados no son válidos. Revisa la información ingresada.',
  },
  general: {
    title: 'Error Inesperado',
    message: 'Ocurrió un error inesperado. Intenta recargar la página.',
  }
};

class NotificationManager {
  static show({ 
    type = 'info', 
    title, 
    message, 
    autoClose, 
    withCloseButton = true,
    ...otherProps 
  }) {
    const config = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.info;
    const IconComponent = config.icon;

    return notifications.show({
      title: title || `Notificación`,
      message,
      color: config.color,
      icon: <IconComponent size={16} />,
      autoClose: autoClose !== undefined ? autoClose : config.autoClose,
      withCloseButton,
      position: 'top-center',
      ...otherProps
    });
  }

  static success(message, title = 'Éxito', options = {}) {
    return this.show({
      type: 'success',
      title,
      message,
      ...options
    });
  }

  static error(message, title = 'Error', options = {}) {
    return this.show({
      type: 'error',
      title,
      message,
      ...options
    });
  }

  static warning(message, title = 'Advertencia', options = {}) {
    return this.show({
      type: 'warning',
      title,
      message,
      ...options
    });
  }

  static info(message, title = 'Información', options = {}) {
    return this.show({
      type: 'info',
      title,
      message,
      ...options
    });
  }

  // Método especializado para errores de API
  static apiError(error, customMessage = null, customTitle = null) {
    const errorType = this.getErrorType(error);
    const errorConfig = ERROR_MESSAGES[errorType] || ERROR_MESSAGES.general;
    
    const title = customTitle || errorConfig.title;
    const message = customMessage || errorConfig.message;
    
    // Log detallado para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 API Error Details');

      console.groupEnd();
    }

    return this.show({
      type: errorType === 'network' ? 'network' : 
            errorType === 'database' ? 'database' : 
            errorType === 'server' ? 'server' : 'error',
      title,
      message,
      autoClose: errorType === 'auth' ? 8000 : undefined
    });
  }

  // Determinar el tipo de error basado en el error recibido
  static getErrorType(error) {
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
  }

  // Método para mostrar notificación de carga
  static loading(message = 'Cargando...', id = 'loading') {
    return notifications.show({
      id,
      title: 'Procesando',
      message,
      loading: true,
      autoClose: false,
      withCloseButton: false,
      position: 'top-center'
    });
  }

  // Método para actualizar una notificación existente
  static update(id, { type = 'success', title, message, autoClose = 4000 }) {
    const config = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.success;
    const IconComponent = config.icon;

    return notifications.update({
      id,
      title,
      message,
      color: config.color,
      icon: <IconComponent size={16} />,
      loading: false,
      autoClose,
      withCloseButton: true
    });
  }

  // Método para ocultar una notificación específica
  static hide(id) {
    return notifications.hide(id);
  }

  // Método para ocultar todas las notificaciones
  static clean() {
    return notifications.clean();
  }
}

export default NotificationManager;