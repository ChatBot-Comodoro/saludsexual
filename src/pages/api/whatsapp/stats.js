// ====================================
// API ENDPOINT PARA ESTADÍSTICAS DE WHATSAPP
// Archivo: /api/whatsapp/stats.js
// ====================================

import { WhatsAppService } from '../../../services/whatsappService';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { days = 30 } = req.query;
    
    console.log('Obteniendo estadísticas de WhatsApp para los últimos', days, 'días');

    // Obtener estadísticas usando el servicio
    const stats = await WhatsAppService.getWhatsAppStats(parseInt(days));
    
    // Obtener conversaciones recientes
    const conversationsQuery = `
      SELECT 
        wc.*,
        wm.message_text as last_message,
        wm.timestamp as last_message_time
      FROM whatsapp_conversations wc
      LEFT JOIN LATERAL (
        SELECT message_text, timestamp
        FROM whatsapp_messages
        WHERE conversation_id = wc.id
        ORDER BY timestamp DESC
        LIMIT 1
      ) wm ON true
      WHERE wc.created_at >= CURRENT_DATE - INTERVAL '${parseInt(days)} days'
      ORDER BY wc.updated_at DESC
      LIMIT 50
    `;

    const { query } = require('../../../config/db');
    const conversationsResult = await query(conversationsQuery);
    
    const response = {
      success: true,
      data: {
        stats: {
          ...stats,
          // Convertir strings a números
          total_users: parseInt(stats.total_users) || 0,
          total_messages: parseInt(stats.total_messages) || 0,
          inbound_messages: parseInt(stats.inbound_messages) || 0,
          outbound_messages: parseInt(stats.outbound_messages) || 0,
          delivered_messages: parseInt(stats.delivered_messages) || 0,
          read_messages: parseInt(stats.read_messages) || 0,
          avg_message_length: parseFloat(stats.avg_message_length) || 0
        },
        conversations: conversationsResult.rows,
        period: `Últimos ${days} días`,
        lastUpdated: new Date().toISOString()
      }
    };

    console.log('Estadísticas de WhatsApp obtenidas:', {
      users: response.data.stats.total_users,
      messages: response.data.stats.total_messages,
      conversations: response.data.conversations.length
    });

    res.status(200).json(response);

  } catch (error) {
    console.error('Error obteniendo estadísticas de WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
}