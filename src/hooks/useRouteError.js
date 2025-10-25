import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// Hook para manejar errores de navegación y rutas
export const useRouteError = () => {
  const router = useRouter();
  const [routeError, setRouteError] = useState(null);

  useEffect(() => {
    const handleRouteChangeError = (err, url) => {
      console.error('Error en la navegación:', err, url);
      setRouteError({
        error: err,
        url: url,
        message: 'Error al navegar a la página solicitada'
      });
    };

    const handleRouteChangeStart = () => {
      setRouteError(null);
    };

    router.events.on('routeChangeError', handleRouteChangeError);
    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      router.events.off('routeChangeError', handleRouteChangeError);
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router]);

  const clearError = () => {
    setRouteError(null);
  };

  return {
    routeError,
    clearError,
    hasError: !!routeError
  };
};

// Función helper para validar rutas
export const validateRoute = (route) => {
  const validRoutes = [
    '/',
    '/proyecto',
    '/mapa',
    '/chat',
    '/consultas',
    '/contactos'
  ];

  return validRoutes.includes(route);
};

// Función para redireccionar a 404 si la ruta no es válida
export const redirectIfInvalidRoute = (router, route) => {
  if (!validateRoute(route)) {
    router.push('/404');
    return true;
  }
  return false;
};
