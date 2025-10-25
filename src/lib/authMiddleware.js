import jwt from 'jsonwebtoken';

// Middleware para verificar tokens de autenticación en endpoints
export function verifyToken(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('Token no proporcionado');
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret-key-2024');
    return decoded;
  } catch (error) {
    throw new Error('Token inválido');
  }
}

// Middleware para verificar que el usuario sea admin o moderador
export function verifyAdminOrModerator(decoded) {
  if (!decoded.role || (decoded.role != 1 && decoded.role != 2)) {
    throw new Error('Permisos insuficientes');
  }
  return true;
}

// Middleware para verificar que el usuario sea solo admin
export function verifyAdmin(decoded) {
  if (!decoded.role || decoded.role != 1) {
    throw new Error('Solo administradores pueden realizar esta acción');
  }
  return true;
}

// Wrapper para proteger endpoints
export function withAuth(handler, requireAdmin = false) {
  return async (req, res) => {
    try {
      const decoded = verifyToken(req);
      
      if (requireAdmin) {
        verifyAdmin(decoded);
      } else {
        verifyAdminOrModerator(decoded);
      }

      // Agregar información del usuario a la request
      req.user = decoded;
      
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ 
        error: error.message || 'No autorizado',
        code: 'UNAUTHORIZED'
      });
    }
  };
}