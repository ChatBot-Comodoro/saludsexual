import { getCentroById } from '../../service/centrosSaludService.js';
import { query } from '../../config/db';

// API route para obtener centros de salud con filtros
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { id, tipo, categoria, servicio } = req.query;

    let result;

    if (id) {
      // Obtener centro específico por ID
      result = await getCentroById(parseInt(id));
      if (!result) {
        return res.status(404).json({ message: 'Centro no encontrado' });
      }
      return res.status(200).json([result]);
    }

    // Construir query con filtros
    let queryText = 'SELECT * FROM obtener_centros_salud_json(';
    let params = [];
    let paramCount = 0;

    // Agregar parámetros según los filtros
    if (tipo) {
      paramCount++;
      params.push(parseInt(tipo));
      queryText += `$${paramCount}`;
    } else {
      queryText += 'NULL';
    }

    queryText += ', ';

    if (categoria) {
      paramCount++;
      params.push(parseInt(categoria));
      queryText += `$${paramCount}`;
    } else {
      queryText += 'NULL';
    }

    queryText += ')';

    const dbResult = await query(queryText, params);
    
    // Transformar los datos
    const centrosFormatted = dbResult.rows.map(centro => ({
      id: centro.id,
      name: centro.nombre,
      address: centro.direccion,
      phone: centro.telefono,
      hours: centro.dias_horas,
      lat: parseFloat(centro.lat),
      lng: parseFloat(centro.lng),
      description: centro.descripcion,
      tipo: centro.tipo,
      categoria: centro.categoria,
      servicios: Array.isArray(centro.servicios) ? centro.servicios : [],
      fecha_graba: centro.fecha_graba
    }));

    res.status(200).json(centrosFormatted);

  } catch (error) {
    console.error('Error al obtener centros con filtros:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error de base de datos'
    });
  }
}
