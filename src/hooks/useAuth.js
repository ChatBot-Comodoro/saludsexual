import { useSession } from 'next-auth/react';

// Hook para realizar peticiones autenticadas con NextAuth
export const useAuthFetch = () => {
  const { data: session } = useSession();
  
  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // NextAuth maneja automáticamente las cookies de sesión
    // No necesitamos enviar tokens manualmente
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Importante para incluir cookies de sesión
    });

    return response;
  };

  return authFetch;
};