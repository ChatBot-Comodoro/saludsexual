// ====================================
// UTILIDAD PARA TRACKEAR VISITAS GENERALES
// Archivo: src/utils/visitTracker.js
// ====================================

import { v4 as uuidv4 } from 'uuid';

/**
 * Detectar tipo de dispositivo basado en User Agent
 */
export const detectDeviceType = (userAgent) => {
  if (!userAgent) return 'unknown';
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

/**
 * Extraer información del navegador
 */
export const extractBrowserInfo = (userAgent) => {
  if (!userAgent) return {};
  
  const ua = userAgent.toLowerCase();
  let browser = 'unknown';
  let version = 'unknown';
  
  // Detectar navegador
  if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'Chrome';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('edg')) {
    browser = 'Edge';
  } else if (ua.includes('opera')) {
    browser = 'Opera';
  }
  
  return {
    browser,
    version,
    fullUserAgent: userAgent
  };
};

/**
 * Obtener o crear Session ID para tracking de visitas
 */
export const getOrCreateVisitSessionId = () => {
  if (typeof window === 'undefined') return null;
  
  const storageKey = 'visit_session_id';
  let sessionId = localStorage.getItem(storageKey);
  
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
};

/**
 * Obtener información de la página actual
 */
export const getCurrentPageInfo = () => {
  if (typeof window === 'undefined') return {};
  
  return {
    path: window.location.pathname,
    title: document.title,
    referrer: document.referrer,
    url: window.location.href,
    search: window.location.search
  };
};

/**
 * Throttle para evitar spam de eventos de visita
 */
class VisitThrottler {
  constructor(windowMs = 5000) { // 5 segundos por defecto
    this.events = new Map();
    this.windowMs = windowMs;
  }

  shouldTrack(sessionId, pagePath) {
    const key = `${sessionId}_${pagePath}`;
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

// Instancia global del throttler para visitas
export const visitThrottler = new VisitThrottler(5000); // 5 segundos

/**
 * Verificar si una página debe ser excluida del tracking
 * SOLO trackear páginas públicas que consultan los usuarios finales
 */
const shouldExcludePage = (pagePath) => {
  if (!pagePath) return true;
  
  // 🚫 EXCLUIR todas las páginas administrativas y técnicas
  const excludedPatterns = [
    '/admin',      // CUALQUIER página administrativa
    '/login',      // Página de login
    '/api',        // Endpoints de API
    '/_next',      // Archivos técnicos de Next.js
    '/favicon.ico',// Icono del sitio
    '/sitemap',    // Sitemap
    '/robots.txt', // Robots.txt
  ];
  
  // Verificar si la página coincide con algún patrón de exclusión
  return excludedPatterns.some(pattern => pagePath.startsWith(pattern));
};

/**
 * Función principal para trackear una visita de página
 */
export const trackPageVisit = async (customPageInfo = {}) => {
  if (typeof window === 'undefined') return;
  
  const sessionId = getOrCreateVisitSessionId();
  if (!sessionId) return;
  
  const pageInfo = { ...getCurrentPageInfo(), ...customPageInfo };
  
  // 🚫 NO trackear páginas administrativas
  if (shouldExcludePage(pageInfo.path)) {
    if (process.env.NODE_ENV === 'development') {

    }
    return;
  }
  
  // ✅ Página pública - proceder con el tracking
  if (process.env.NODE_ENV === 'development') {

  }
  
  // Aplicar throttling para evitar spam
  if (!visitThrottler.shouldTrack(sessionId, pageInfo.path)) {
    return;
  }
  
  try {
    const payload = {
      sessionId,
      pagePath: pageInfo.path,
      pageTitle: pageInfo.title,
      referrer: pageInfo.referrer,
      deviceType: detectDeviceType(navigator.userAgent),
      browserInfo: extractBrowserInfo(navigator.userAgent)
    };

    const response = await fetch('/api/analytics/page-visits', {
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
    console.error('Error tracking page visit:', error);
  }
};

/**
 * Hook personalizado para trackear visitas automáticamente
 */
export const usePageVisitTracker = () => {
  const trackVisit = (customInfo = {}) => {
    trackPageVisit(customInfo);
  };

  return { trackVisit };
};

/**
 * Función para obtener estadísticas de visitas desde el cliente
 */
export const getVisitStats = async (timeframe = '30') => {
  try {
    const response = await fetch(`/api/analytics/visit-stats?days=${timeframe}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching visit stats:', error);
    return null;
  }
};

/**
 * Cleanup periódico del throttler
 */
setInterval(() => {
  visitThrottler.cleanup();
}, 60000); // Cada minuto