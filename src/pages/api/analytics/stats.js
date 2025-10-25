import { query } from '../../../config/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { timeframe } = req.query;

    // Determinar el filtro de tiempo
    let timeFilter = '';
    switch (timeframe) {
      case 'day':
        timeFilter = "AND timestamp >= CURRENT_DATE";
        break;
      case 'week':
        timeFilter = "AND timestamp >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'month':
        timeFilter = "AND timestamp >= CURRENT_DATE - INTERVAL '30 days'";
        break;
      default:
        timeFilter = '';
    }

    // Obtener estadísticas de interacciones del mapa
    const interactionsQuery = `
      SELECT 
        COUNT(*) as total_interactions,
        COUNT(DISTINCT session_id) as unique_sessions,
        center_name,
        center_type,
        COUNT(*) as clicks
      FROM analytics_map_interactions 
      WHERE 1=1 ${timeFilter}
      GROUP BY center_name, center_type
      ORDER BY clicks DESC
      LIMIT 10
    `;
    const interactionsResult = await query(interactionsQuery);

    // Obtener estadísticas de búsquedas
    const searchesQuery = `
      SELECT 
        COUNT(*) as total_searches,
        search_query,
        COUNT(*) as search_count
      FROM analytics_map_searches 
      WHERE 1=1 ${timeFilter}
      GROUP BY search_query
      ORDER BY search_count DESC
      LIMIT 10
    `;
    const searchesResult = await query(searchesQuery);

    // Obtener estadísticas de solicitudes de direcciones
    const directionsQuery = `
      SELECT 
        COUNT(*) as total_directions,
        center_name,
        center_type,
        COUNT(*) as direction_requests
      FROM analytics_directions_requests 
      WHERE 1=1 ${timeFilter}
      GROUP BY center_name, center_type
      ORDER BY direction_requests DESC
      LIMIT 10
    `;
    const directionsResult = await query(directionsQuery);

    // Obtener estadísticas de filtros
    const filtersQuery = `
      SELECT 
        COUNT(*) as total_filter_usage,
        filter_type,
        filter_value,
        action,
        COUNT(*) as usage_count
      FROM analytics_map_filters 
      WHERE 1=1 ${timeFilter}
      GROUP BY filter_type, filter_value, action
      ORDER BY usage_count DESC
      LIMIT 10
    `;
    const filtersResult = await query(filtersQuery);

    // Obtener estadísticas generales
    const overallStatsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM analytics_map_interactions WHERE 1=1 ${timeFilter}) as total_interactions,
        (SELECT COUNT(DISTINCT session_id) FROM analytics_map_interactions WHERE 1=1 ${timeFilter}) as unique_sessions,
        (SELECT COUNT(*) FROM analytics_map_searches WHERE 1=1 ${timeFilter}) as total_searches,
        (SELECT COUNT(*) FROM analytics_directions_requests WHERE 1=1 ${timeFilter}) as total_directions,
        (SELECT COUNT(*) FROM analytics_map_filters WHERE 1=1 ${timeFilter}) as total_filter_usage
    `;
    const overallStatsResult = await query(overallStatsQuery);

    const stats = {
      overall: overallStatsResult.rows[0] || {},
      topInteractions: interactionsResult.rows || [],
      topSearches: searchesResult.rows || [],
      topDirections: directionsResult.rows || [],
      topFilters: filtersResult.rows || [],
      timeframe: timeframe || 'all'
    };

    res.status(200).json(stats);

  } catch (error) {
    console.error('Error getting analytics stats:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}