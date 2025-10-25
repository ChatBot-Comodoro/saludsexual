import { testConnection } from '../../config/db';

// API route para probar la conexión a PostgreSQL
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    console.log('🔄 Iniciando test de conexión...');
    const isConnected = await testConnection();
    
    if (isConnected) {
      res.status(200).json({ 
        status: 'success',
        message: 'Conexión a PostgreSQL exitosa',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({ 
        status: 'error',
        message: 'Error de conexión a PostgreSQL'
      });
    }

  } catch (error) {
    console.error('Error en test de conexión:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error de conexión'
    });
  }
}
