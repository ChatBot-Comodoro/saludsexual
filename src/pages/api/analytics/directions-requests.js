// ====================================
// API ENDPOINT PARA DIRECCIONES SOLICITADAS
// Archivo: /api/analytics/directions-requests.js
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
      centerId, 
      centerName, 
      centerType 
    } = req.body;

    // Validaciones
    if (!sessionId || !centerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!validateSessionId(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    // Obtener datos de la request
    const ipAddress = getClientIP(req);
    const userAgent = getUserAgent(req);

    const queryText = `
      INSERT INTO analytics_directions_requests 
      (session_id, center_id, center_name, center_type, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, timestamp
    `;

    const values = [
      sessionId,
      centerId,
      centerName || null,
      centerType || null,
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
    console.error('Error al guardar solicitud de direcciones:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}