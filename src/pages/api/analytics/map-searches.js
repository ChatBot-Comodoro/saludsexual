// ====================================
// API ENDPOINT PARA BÚSQUEDAS DEL MAPA
// Archivo: /api/analytics/map-searches.js
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
      searchQuery, 
      resultsCount 
    } = req.body;

    // Validaciones
    if (!sessionId || !searchQuery) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!validateSessionId(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    // Filtrar búsquedas muy cortas o sospechosas
    if (searchQuery.length < 2 || searchQuery.length > 255) {
      return res.status(400).json({ error: 'Invalid search query length' });
    }

    // Obtener datos de la request
    const ipAddress = getClientIP(req);
    const userAgent = getUserAgent(req);

    const queryText = `
      INSERT INTO analytics_map_searches 
      (session_id, search_query, results_count, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, timestamp
    `;

    const values = [
      sessionId,
      searchQuery.toLowerCase().trim(),
      resultsCount || 0,
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
    console.error('Error al guardar búsqueda del mapa:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}