// API de debug para ver la estructura exacta de datos de un centro específico
import { getCentrosSalud } from '../../../service/centrosSaludService.js';

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    console.log(`🔍 Debuggeando centro con ID: ${id}`);
    
    // Obtener todos los centros
    const centros = await getCentrosSalud();
    console.log(`📊 Total centros obtenidos: ${centros.length}`);
    
    if (centros.length > 0) {
      console.log('🏥 Estructura del primer centro:', centros[0]);
      console.log('🗝️ Campos disponibles:', Object.keys(centros[0]));
    }
    
    // Buscar el centro específico
    const centro = centros.find(c => c.id === parseInt(id));
    
    if (centro) {
      console.log('🎯 Centro encontrado:', centro);
      res.status(200).json({
        encontrado: true,
        centro: centro,
        camposDisponibles: Object.keys(centro),
        todosLosCampos: centro
      });
    } else {
      console.log('❌ Centro no encontrado');
      res.status(404).json({
        encontrado: false,
        centrosBuscados: centros.map(c => ({ id: c.id, nombre: c.nombre })),
        idBuscado: parseInt(id)
      });
    }
    
  } catch (error) {
    console.error('❌ Error en debug:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message
    });
  }
}