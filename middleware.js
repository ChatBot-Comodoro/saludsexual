import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;



    // Para rutas admin, verificar permisos específicos
    if (pathname.startsWith('/admin')) {
      // Rutas que requieren admin (role = 1)
      const adminOnlyRoutes = ['/admin/users'];
      
      if (adminOnlyRoutes.some(route => pathname.startsWith(route))) {
        if (token?.role !== 1) {
          return Response.redirect(new URL('/admin/dashboard', req.url));
        }
      }
    }
    

  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        

        
        // Permitir rutas de autenticación y públicas
        if (pathname === '/login' || 
            pathname.startsWith('/api/auth') || 
            pathname === '/' ||
            pathname.startsWith('/_next') ||
            pathname.startsWith('/public')) {

          return true;
        }
        
        // Para rutas admin, requerir autenticación
        if (pathname.startsWith('/admin')) {
          const hasValidToken = !!token;
          const hasValidRole = token?.role === 1 || token?.role === 2;
          

          
          return hasValidToken && hasValidRole;
        }

        // Permitir otras rutas

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*'
  ]
};