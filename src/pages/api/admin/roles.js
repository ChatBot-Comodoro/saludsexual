import pool from '../../../config/db';
import { withAuth } from '../../../lib/authMiddleware';

async function handler(req, res) {
  // Solo permitir método GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido',
      error_code: 'METHOD_NOT_ALLOWED'
    });
  }

  try {
    console.log('🔍 OBTENIENDO ROLES - Iniciando consulta');

    const client = await pool.connect();
    
    try {
      // Llamar a la función PostgreSQL
      const result = await client.query('SELECT obtener_roles()');
      
      const response = result.rows[0].obtener_roles;
      
      console.log('✅ ROLES OBTENIDOS:', {
        success: response.success,
        total: response.data ? response.data.length : 0
      });
      
      if (response.success) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo roles:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener roles',
      error_code: 'DATABASE_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Exportar el handler protegido con autenticación (admin o moderador)
export default withAuth(handler, false);