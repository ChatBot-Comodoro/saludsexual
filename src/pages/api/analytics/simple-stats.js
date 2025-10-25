// Endpoint simplificado para debugging
import { query } from '../../../config/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Simple analytics endpoint called');
    
    // Consulta muy simple para empezar
    const simpleQuery = `
      SELECT 
        COUNT(*) as total_visits,
        COUNT(DISTINCT session_id) as unique_visitors
      FROM anonymous_visits 
      WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
    `;

    console.log('Executing simple query:', simpleQuery);
    
    const result = await query(simpleQuery);
    console.log('Query result:', result.rows[0]);

    // Consulta de horas del día
    const hourlyQuery = `
      SELECT 
        EXTRACT(HOUR FROM timestamp)::INTEGER as hour_of_day,
        COUNT(*) as visit_count
      FROM anonymous_visits 
      WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY EXTRACT(HOUR FROM timestamp)::INTEGER
      ORDER BY EXTRACT(HOUR FROM timestamp)::INTEGER
    `;

    console.log('Executing hourly query');
    const hourlyResult = await query(hourlyQuery);
    console.log('Hourly result:', hourlyResult.rows);

    res.status(200).json({
      success: true,
      data: {
        generalStats: result.rows[0],
        hourlyPatterns: hourlyResult.rows,
        weeklyPatterns: [],
        popularPages: [],
        dailyTrends: [],
        period: 'Últimos 30 días'
      }
    });

  } catch (error) {
    console.error('Simple analytics error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    res.status(500).json({
      error: 'Database error',
      details: error.message,
      code: error.code
    });
  }
}