// ====================================
// UTILIDADES PARA ANALYTICS
// Archivo: /src/utils/analytics.js
// ====================================

import { v4 as uuidv4 } from 'uuid';

/**
 * Generar o recuperar session ID único
 */
export const getOrCreateSessionId = () => {
  if (typeof window === 'undefined') return null;
  
  let sessionId = sessionStorage.getItem('analytics_session_id');
  
  if (!sessionId) {
    sessionId = `session_${uuidv4()}_${Date.now()}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  
  return sessionId;
};

/**
 * Validar formato de session ID
 */
export const validateSessionId = (sessionId) => {
  if (!sessionId || typeof sessionId !== 'string') return false;
  
  // Formato: session_uuid_timestamp
  const pattern = /^session_[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}_\d+$/;
  return pattern.test(sessionId);
};

/**
 * Obtener IP del cliente (desde headers de request)
 */
export const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         'unknown';
};

/**
 * Obtener User Agent
 */
export const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'unknown';
};

/**
 * Throttle para evitar spam de eventos
 */
class EventThrottler {
  constructor(windowMs = 1000) { // 1 segundo por defecto
    this.events = new Map();
    this.windowMs = windowMs;
  }

  shouldTrack(sessionId, eventType, eventData = '') {
    const key = `${sessionId}_${eventType}_${eventData}`;
    const now = Date.now();
    const lastEvent = this.events.get(key);
    
    if (!lastEvent || (now - lastEvent) > this.windowMs) {
      this.events.set(key, now);
      return true;
    }
    
    return false;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, timestamp] of this.events) {
      if ((now - timestamp) > this.windowMs * 10) {
        this.events.delete(key);
      }
    }
  }
}

// Instancia global del throttler
export const eventThrottler = new EventThrottler(2000); // 2 segundos

/**
 * Función principal para trackear eventos del mapa
 */
export const trackMapEvent = async (eventType, eventData) => {
  if (typeof window === 'undefined') return;
  
  const sessionId = getOrCreateSessionId();
  if (!sessionId) return;

  // Aplicar throttling para evitar spam
  const throttleKey = `${eventType}_${eventData.centerId || eventData.searchQuery || ''}`;
  if (!eventThrottler.shouldTrack(sessionId, eventType, throttleKey)) {
    return;
  }

  try {
    let endpoint = '';
    let payload = { sessionId, ...eventData };

    switch (eventType) {
      case 'center_click':
        endpoint = '/api/analytics/map-interactions';
        payload.interactionType = 'center_click';
        break;
      
      case 'center_details':
        endpoint = '/api/analytics/map-interactions';
        payload.interactionType = 'center_details';
        break;
      
      case 'search':
        endpoint = '/api/analytics/map-searches';
        break;
      
      case 'directions':
        endpoint = '/api/analytics/directions-requests';
        break;
      
      case 'filter':
        endpoint = '/api/analytics/map-filters';
        break;
      
      default:
        console.warn(`Tipo de evento no reconocido: ${eventType}`);
        return;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Debug en desarrollo
    if (process.env.NODE_ENV === 'development') {

    }

  } catch (error) {
    console.error('Error tracking map event:', error);
  }
};

/**
 * Debounce para búsquedas
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Hook personalizado para tracking del mapa
 */
export const useMapAnalytics = () => {
  const trackCenterClick = (center) => {
    trackMapEvent('center_click', {
      centerId: center.id,
      centerName: center.name,
      centerType: center.tipo
    });
  };

  const trackCenterDetails = (center) => {
    trackMapEvent('center_details', {
      centerId: center.id,
      centerName: center.name,
      centerType: center.tipo
    });
  };

  const trackSearch = debounce((searchQuery, resultsCount) => {
    if (searchQuery.length > 2) {
      trackMapEvent('search', {
        searchQuery,
        resultsCount
      });
    }
  }, 1000);

  const trackDirections = (center) => {
    trackMapEvent('directions', {
      centerId: center.id,
      centerName: center.name,
      centerType: center.tipo
    });
  };

  const trackFilter = (filterType, filterValue, action) => {
    trackMapEvent('filter', {
      filterType,
      filterValue,
      action
    });
  };

  return {
    trackCenterClick,
    trackCenterDetails,
    trackSearch,
    trackDirections,
    trackFilter
  };
};