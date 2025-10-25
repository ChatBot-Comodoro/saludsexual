// ====================================
// COMPONENTE PARA TRACKING AUTOMÁTICO DE VISITAS
// Archivo: src/components/VisitTracker.js
// ====================================

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { trackPageVisit } from '../utils/visitTracker';

export default function VisitTracker() {
  const router = useRouter();
  const isFirstLoad = useRef(true);

  // Trackear visita inicial y cambios de ruta
  useEffect(() => {
    const handleRouteChange = (url) => {
      // Pequeño delay para asegurar que el título de la página se actualice
      setTimeout(() => {
        trackPageVisit({
          path: url,
          title: document.title
        });
      }, 100);
    };

    // Trackear visita inicial
    if (isFirstLoad.current) {
      handleRouteChange(router.pathname);
      isFirstLoad.current = false;
    }

    // Escuchar cambios de ruta
    router.events.on('routeChangeComplete', handleRouteChange);

    // Cleanup
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  // Este componente no renderiza nada visible
  return null;
}