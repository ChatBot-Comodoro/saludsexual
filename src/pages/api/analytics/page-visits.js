// ====================================
// API ENDPOINT PARA VISITAS DE PÁGINAS
// Archivo: /api/analytics/page-visits.js
// ====================================

import { query } from '../../../config/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return handleTrackVisit(req, res);
  } else if (req.method === 'GET') {
    return handleGetVisitStats(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * Manejar el tracking de una nueva visita
 */
async function handleTrackVisit(req, res) {
  try {
    const { 
      sessionId, 
      pagePath, 
      pageTitle, 
      referrer, 
      deviceType, 
      browserInfo 
    } = req.body;

    // Validaciones básicas
    if (!sessionId || !pagePath) {
      return res.status(400).json({ 
        error: 'Missing required fields: sessionId and pagePath' 
      });
    }

    // Validar session ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID format' });
    }

    // Obtener IP y User Agent del request
    const ipAddress = getClientIP(req);
    const userAgent = getUserAgent(req);

    // Insertar visita en la base de datos
    const insertQuery = `
      INSERT INTO anonymous_visits 
      (session_id, page_path, page_title, referrer, user_agent, ip_address, device_type, browser_info)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, timestamp
    `;

    const values = [
      sessionId,
      pagePath,
      pageTitle || null,
      referrer || null,
      userAgent,
      ipAddress,
      deviceType || 'unknown',
      browserInfo ? JSON.stringify(browserInfo) : null
    ];

    const result = await query(insertQuery, values);

    res.status(201).json({
      success: true,
      id: result.rows[0].id,
      timestamp: result.rows[0].timestamp
    });

  } catch (error) {
    console.error('Error al guardar visita de página:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Obtener estadísticas de visitas
 */
async function handleGetVisitStats(req, res) {
  try {
    console.log('API Request params:', req.query);
    const { days = 30, startDate, endDate } = req.query;
    
    let dateCondition = '';
    let periodDescription = '';
    
    // Determinar filtro de fecha - soporte completo para fechas personalizadas
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.error('Invalid dates:', { startDate, endDate, start, end });
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD format.' });
      }
      
      // Formatear fechas para PostgreSQL
      const formattedStartDate = startDate + ' 00:00:00';
      const formattedEndDate = endDate + ' 23:59:59';
      
      dateCondition = `timestamp >= '${formattedStartDate}' AND timestamp <= '${formattedEndDate}'`;
      periodDescription = `Del ${start.toLocaleDateString('es-ES')} al ${end.toLocaleDateString('es-ES')}`;
      
      console.log('Using date range:', { formattedStartDate, formattedEndDate, dateCondition });
    } else {
      // Fallback a días si no se proporcionan fechas específicas
      const daysNum = parseInt(days);
      if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
        console.log('Using default days value: 30');
        const defaultDays = 30;
        dateCondition = `timestamp >= CURRENT_DATE - INTERVAL '${defaultDays} days'`;
        periodDescription = `Últimos ${defaultDays} días`;
      } else {
        dateCondition = `timestamp >= CURRENT_DATE - INTERVAL '${daysNum} days'`;
        periodDescription = `Últimos ${daysNum} días`;
      }
    }
    
    console.log('Final date condition:', dateCondition);

    // Verificar que tenemos datos para el período
    const countQuery = `SELECT COUNT(*) as count FROM anonymous_visits WHERE ${dateCondition}`;
    const countResult = await query(countQuery);
    const totalRecords = parseInt(countResult.rows[0].count);
    
    if (totalRecords === 0) {
      console.log('No data found for the specified period');
      return res.status(200).json({
        success: true,
        data: {
          period: periodDescription,
          generalStats: {
            total_visits: 0,
            unique_visitors: 0,
            unique_pages: 0,
            active_days: 0,
            mobile_visits: 0,
            desktop_visits: 0,
            tablet_visits: 0,
            avg_pages_per_session: 0
          },
          popularPages: [],
          weeklyPatterns: [],
          hourlyPatterns: [],
          dailyTrends: [],
          lastUpdated: new Date().toISOString(),
          message: 'No hay datos para el período seleccionado'
        }
      });
    }

    console.log(`Found ${totalRecords} records for analysis`);

    // Estadísticas generales
    const generalStatsQuery = `
      SELECT 
        COUNT(*) as total_visits,
        COUNT(DISTINCT session_id) as unique_visitors,
        COUNT(DISTINCT page_path) as unique_pages,
        COUNT(DISTINCT DATE(timestamp)) as active_days,
        
        -- Distribución por dispositivo
        SUM(CASE WHEN device_type = 'mobile' THEN 1 ELSE 0 END) as mobile_visits,
        SUM(CASE WHEN device_type = 'desktop' THEN 1 ELSE 0 END) as desktop_visits,
        SUM(CASE WHEN device_type = 'tablet' THEN 1 ELSE 0 END) as tablet_visits,
        
        -- Promedio de páginas por sesión
        ROUND(COUNT(*)::DECIMAL / NULLIF(COUNT(DISTINCT session_id), 0), 2) as avg_pages_per_session
      FROM anonymous_visits 
      WHERE ${dateCondition}
    `;
    
    console.log('General stats query prepared');

    // Páginas más visitadas
    const popularPagesQuery = `
      SELECT 
        page_path,
        page_title,
        COUNT(*) as visit_count,
        COUNT(DISTINCT session_id) as unique_visitors,
        ROUND(
          (COUNT(*) * 100.0 / (
            SELECT COUNT(*) FROM anonymous_visits WHERE ${dateCondition}
          )), 2
        )::FLOAT as percentage
      FROM anonymous_visits 
      WHERE ${dateCondition}
      GROUP BY page_path, page_title
      ORDER BY visit_count DESC
      LIMIT 10
    `;

    // Patrones temporales por día de la semana (usando timestamp directamente)
    const weeklyPatternsQuery = `
      SELECT 
        EXTRACT(DOW FROM timestamp)::INTEGER as day_of_week,
        CASE EXTRACT(DOW FROM timestamp)::INTEGER
          WHEN 0 THEN 'Domingo'
          WHEN 1 THEN 'Lunes'
          WHEN 2 THEN 'Martes'
          WHEN 3 THEN 'Miércoles'
          WHEN 4 THEN 'Jueves'
          WHEN 5 THEN 'Viernes'
          WHEN 6 THEN 'Sábado'
        END as day_name,
        COUNT(*) as visit_count,
        COUNT(DISTINCT session_id) as unique_visitors
      FROM anonymous_visits 
      WHERE ${dateCondition}
      GROUP BY EXTRACT(DOW FROM timestamp)::INTEGER
      ORDER BY EXTRACT(DOW FROM timestamp)::INTEGER
    `;

    // Patrones temporales por hora del día (simplificado)
    const hourlyPatternsQuery = `
      SELECT 
        EXTRACT(HOUR FROM timestamp)::INTEGER as hour_of_day,
        COUNT(*) as visit_count,
        COUNT(DISTINCT session_id) as unique_visitors
      FROM anonymous_visits 
      WHERE ${dateCondition}
      GROUP BY EXTRACT(HOUR FROM timestamp)::INTEGER
      ORDER BY EXTRACT(HOUR FROM timestamp)::INTEGER
    `;

    // Visitas diarias (usando cast simple)
    const dailyTrendsQuery = `
      SELECT 
        timestamp::date as visit_date,
        COUNT(*) as total_visits,
        COUNT(DISTINCT session_id) as unique_visitors
      FROM anonymous_visits 
      WHERE ${dateCondition}
      GROUP BY timestamp::date
      ORDER BY timestamp::date DESC
      LIMIT 30
    `;

    // Ejecutar todas las consultas con mejor manejo de errores
    let generalStats, popularPages, weeklyPatterns, hourlyPatterns, dailyTrends;
    
    try {
      console.log('Executing database queries...');
      console.log('Date condition:', dateCondition);
      
      [
        generalStats,
        popularPages,
        weeklyPatterns,
        hourlyPatterns,
        dailyTrends
      ] = await Promise.all([
        query(generalStatsQuery),
        query(popularPagesQuery),
        query(weeklyPatternsQuery),
        query(hourlyPatternsQuery),
        query(dailyTrendsQuery)
      ]);
      
      console.log('Database queries completed successfully');
    } catch (dbError) {
      console.error('Database query error:', dbError);
      console.error('Query details:', {
        dateCondition,
        generalStatsQuery: generalStatsQuery.substring(0, 200) + '...'
      });
      throw new Error(`Database query failed: ${dbError.message}`);
    }

    // Formatear respuesta
    const stats = {
      period: periodDescription,
      generalStats: generalStats.rows[0] || {},
      popularPages: popularPages.rows || [],
      weeklyPatterns: weeklyPatterns.rows || [],
      hourlyPatterns: hourlyPatterns.rows || [],
      dailyTrends: dailyTrends.rows || [],
      lastUpdated: new Date().toISOString()
    };

    console.log('Sending response with stats:', Object.keys(stats));
    
    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de visitas:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Obtener IP del cliente
 */
function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded 
    ? forwarded.split(',')[0].trim()
    : req.connection.remoteAddress || 
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null);
  
  return ip || 'unknown';
}

/**
 * Obtener User Agent
 */
function getUserAgent(req) {
  return req.headers['user-agent'] || 'unknown';
}