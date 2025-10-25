// ====================================
// API ENDPOINT PARA FILTROS DEL MAPA
// Archivo: /api/analytics/map-filters.js
// ====================================

import { getClientIP, getUserAgent, validateSessionId } from '../../../utils/analytics';
import { query } from '../../../config/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      sessionId, 
      filterType, 
      filterValue, 
      action 
    } = req.body;

    // Validaciones
    if (!sessionId || !filterType || !filterValue || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!validateSessionId(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    // Validar valores permitidos
    const validActions = ['add', 'remove', 'clear'];
    const validFilterTypes = ['service', 'center_type', 'all'];
    
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    if (!validFilterTypes.includes(filterType)) {
      return res.status(400).json({ error: 'Invalid filter type' });
    }

    // Permitir valores especiales para limpieza
    if (filterType === 'all' && action === 'clear' && filterValue !== 'clear_filters') {
      return res.status(400).json({ error: 'Invalid filter value for clear all action' });
    }

    // Obtener datos de la request
    const ipAddress = getClientIP(req);
    const userAgent = getUserAgent(req);

    const queryText = `
      INSERT INTO analytics_map_filters 
      (session_id, filter_type, filter_value, action, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, timestamp
    `;

    const values = [
      sessionId,
      filterType,
      filterValue,
      action,
      ipAddress,
      userAgent
    ];

    const result = await query(queryText, values);

    res.status(201).json({
      success: true,
      id: result.rows[0].id,
      timestamp: result.rows[0].timestamp
    });

  } catch (error) {
    console.error('Error al guardar filtro del mapa:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}