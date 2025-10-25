import { query } from '../../config/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    console.log('🔍 Probando función get_servicios_unicos...');
    
    // Primero verificar si la función existe
    const checkFunction = await query(`
      SELECT EXISTS (
        SELECT 1 
        FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' AND p.proname = 'get_servicios_unicos'
      ) as function_exists;
    `);
    
    console.log('🔍 ¿Función existe?', checkFunction.rows[0].function_exists);
    
    if (!checkFunction.rows[0].function_exists) {
      return res.status(500).json({
        error: 'La función get_servicios_unicos no existe en la base de datos',
        suggestion: 'Ejecuta el script SQL primero'
      });
    }

    // Intentar ejecutar la función
    const result = await query('SELECT * FROM get_servicios_unicos()');
    
    res.status(200).json({
      success: true,
      functionExists: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Error en test:', error.message);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
