// ====================================
// API ENDPOINT PARA OBTENER MÉTRICAS DEL MAPA
// Archivo: /api/analytics/map-stats.js
// ====================================

import { query } from '../../../config/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { days, startDate, endDate } = req.query;
    
    let dateCondition = '';
    let periodDescription = '';
    
    // Determinar el tipo de filtro a usar
    if (startDate && endDate) {
      // Validar formato de fechas
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
      
      if (start > end) {
        return res.status(400).json({ error: 'Start date cannot be after end date' });
      }
      
      dateCondition = `timestamp >= '${startDate}' AND timestamp <= '${endDate} 23:59:59'`;
      periodDescription = `Del ${new Date(startDate).toLocaleDateString('es-ES')} al ${new Date(endDate).toLocaleDateString('es-ES')}`;
    } else {
      // Usar días por defecto
      const daysNum = parseInt(days || 30);
      if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
        return res.status(400).json({ error: 'Invalid days parameter' });
      }
      dateCondition = `timestamp >= CURRENT_DATE - INTERVAL '${daysNum} days'`;
      periodDescription = `${daysNum} días`;
    }

    // Consulta para centros más clickeados
    const mostClickedQuery = `
      SELECT 
        center_id,
        center_name,
        center_type,
        COUNT(*) as total_clicks,
        COUNT(DISTINCT session_id) as unique_sessions
      FROM analytics_map_interactions 
      WHERE interaction_type = 'center_click'
        AND ${dateCondition}
      GROUP BY center_id, center_name, center_type
      ORDER BY total_clicks DESC
      LIMIT 10
    `;

    // Consulta para búsquedas más frecuentes
    const topSearchesQuery = `
      SELECT 
        search_query,
        COUNT(*) as search_count,
        AVG(results_count) as avg_results,
        COUNT(DISTINCT session_id) as unique_users
      FROM analytics_map_searches 
      WHERE ${dateCondition}
        AND LENGTH(search_query) > 2
      GROUP BY search_query
      ORDER BY search_count DESC
      LIMIT 10
    `;

    // Consulta para direcciones más solicitadas
    const directionsQuery = `
      SELECT 
        center_id,
        center_name,
        center_type,
        COUNT(*) as direction_requests,
        COUNT(DISTINCT session_id) as unique_users
      FROM analytics_directions_requests 
      WHERE ${dateCondition}
      GROUP BY center_id, center_name, center_type
      ORDER BY direction_requests DESC
      LIMIT 10
    `;

    // Consulta para filtros más usados
    const filtersQuery = `
      SELECT 
        filter_type,
        filter_value,
        COUNT(*) as usage_count,
        COUNT(DISTINCT session_id) as unique_users
      FROM analytics_map_filters 
      WHERE ${dateCondition}
        AND action = 'add'
      GROUP BY filter_type, filter_value
      ORDER BY usage_count DESC
      LIMIT 10
    `;

    // Consulta para estadísticas generales
    const generalStatsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM analytics_map_interactions 
         WHERE ${dateCondition}) as total_interactions,
        (SELECT COUNT(*) FROM analytics_map_searches 
         WHERE ${dateCondition}) as total_searches,
        (SELECT COUNT(*) FROM analytics_directions_requests 
         WHERE ${dateCondition}) as total_direction_requests,
        (SELECT COUNT(DISTINCT session_id) FROM analytics_map_interactions 
         WHERE ${dateCondition}) as unique_users
    `;

    // Ejecutar todas las consultas
    const [
      mostClickedResult,
      topSearchesResult,
      directionsResult,
      filtersResult,
      generalStatsResult
    ] = await Promise.all([
      query(mostClickedQuery),
      query(topSearchesQuery),
      query(directionsQuery),
      query(filtersQuery),
      query(generalStatsQuery)
    ]);

    // Formatear respuesta
    const stats = {
      period: periodDescription,
      generalStats: generalStatsResult.rows[0] || {},
      mostClickedCenters: mostClickedResult.rows || [],
      topSearches: topSearchesResult.rows || [],
      mostRequestedDirections: directionsResult.rows || [],
      popularFilters: filtersResult.rows || [],
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del mapa:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}