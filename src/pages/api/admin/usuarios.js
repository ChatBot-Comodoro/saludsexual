import pool from '../../../config/db';
import { withAuth } from '../../../lib/authMiddleware';

async function handler(req, res) {
  // Solo permitir métodos GET y POST
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido',
      error_code: 'METHOD_NOT_ALLOWED'
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await obtenerUsuarios(req, res);
      case 'POST':
        return await crearUsuario(req, res);
      default:
        return res.status(405).json({
          success: false,
          message: 'Método no permitido',
          error_code: 'METHOD_NOT_ALLOWED'
        });
    }
  } catch (error) {
    console.error('❌ Error en endpoint usuarios:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error_code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// GET - Obtener lista de usuarios
async function obtenerUsuarios(req, res) {
  try {
    console.log('🔍 OBTENIENDO USUARIOS - Iniciando consulta');

    const client = await pool.connect();
    
    try {
      // Llamar a la función PostgreSQL
      const result = await client.query('SELECT obtener_usuarios()');
      
      const response = result.rows[0].obtener_usuarios;
      
      console.log('✅ USUARIOS OBTENIDOS:', {
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
    console.error('❌ Error obteniendo usuarios:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error_code: 'DATABASE_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// POST - Crear nuevo usuario moderador
async function crearUsuario(req, res) {
  try {
    const { nombre, apellido, correo, contrasena } = req.body;

    console.log('🔍 CREANDO USUARIO:', {
      nombre,
      apellido,
      correo,
      hasPassword: !!contrasena
    });

    // Validaciones básicas en el backend
    if (!nombre || !apellido || !correo || !contrasena) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios',
        error_code: 'REQUIRED_FIELDS'
      });
    }

    // Validar formato de email
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de correo electrónico inválido',
        error_code: 'INVALID_EMAIL'
      });
    }

    // Validar longitud de contraseña
    if (contrasena.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres',
        error_code: 'PASSWORD_TOO_SHORT'
      });
    }

    const client = await pool.connect();
    
    try {
      // Llamar a la función PostgreSQL para crear usuario
      const result = await client.query(
        'SELECT crear_usuario_moderador($1, $2, $3, $4)',
        [nombre.trim(), apellido.trim(), correo.trim(), contrasena]
      );
      
      const response = result.rows[0].crear_usuario_moderador;
      
      console.log('✅ RESULTADO CREACIÓN:', {
        success: response.success,
        userId: response.data?.id,
        message: response.message
      });
      
      if (response.success) {
        return res.status(201).json(response);
      } else {
        // Determinar el código de estado basado en el error
        let statusCode = 400;
        if (response.error_code === 'EMAIL_EXISTS') {
          statusCode = 409; // Conflict
        } else if (response.error_code === 'INTERNAL_ERROR') {
          statusCode = 500;
        }
        
        return res.status(statusCode).json(response);
      }
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error_code: 'DATABASE_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Exportar el handler protegido con autenticación (solo admin)
export default withAuth(handler, true);